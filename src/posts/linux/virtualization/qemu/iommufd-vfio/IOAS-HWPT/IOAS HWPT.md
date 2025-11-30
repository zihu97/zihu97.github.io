---
date: 2025-11-30
article: true
category:
  - tech
tag:
  - vfio
  - qemu
---


# VFIO框架源码分析（十九）- IOMMUFD 中的 IOAS 与 HWPT：地址空间管理的革命

## 简介与背景

在深入 IOMMUFD 的具体实现之前，我们需要先厘清它与 Legacy VFIO (Type1) 在核心设计理念上的根本差异。这一差异不仅仅是 API 的更名，而是 Linux 内核对 I/O 虚拟化资源管理方式的一次彻底重构。

在 Legacy VFIO 模型中，**Container** 是一个“大杂烩”概念。它既代表了软件层面用户态看到的虚拟地址空间（用户在这里执行 DMA Map/Unmap），也隐含了硬件层面 IOMMU 的页表配置（Domain）。这种强耦合在早期简化了设计，但随着硬件技术的演进，其弊端日益显现：
1.  **无法描述“纯软件”的地址空间**：你必须先有一个 Group（即物理设备），才能创建一个 Container。这导致在设备热插拔或预分配场景下非常尴尬。
2.  **硬件绑定过死**：Container 的属性（如页表层级、页大小）被第一个加入的设备锁死。
3.  **不支持多级页表**：Legacy 模型很难优雅地表达嵌套翻译（Nested Translation），即 Guest 只有一级页表，Host 只有一级页表，难以支持 vSVA（虚拟共享虚拟寻址）。

IOMMUFD 通过引入 **IOAS (I/O Address Space)** 和 **HWPT (Hardware Page Table)** 两个独立对象，彻底解耦了软件视图与硬件视图。这种设计灵感来源于 CPU 的内存管理（虚拟地址空间 `mm_struct` vs 硬件页表 `pgd`），是 IOMMU 管理迈向成熟的标志。

*   **IOAS (纯软件视图)**：它是一个纯粹的逻辑容器，内核内部使用红黑树或区间树维护着 `IOVA -> PADDR` 的映射关系。用户态的 `IOMMU_IOAS_MAP` 操作只修改这个软件对象的状态。此时，它不依赖于任何具体的硬件设备，甚至可以没有任何设备。
*   **HWPT (硬件视图)**：它代表了 IOMMU 硬件实际使用的页表配置（例如 x86 VT-d 的各级页表结构或 ARM SMMU 的 Context Bank/Stream Table 配置）。HWPT 必须依附于具体的 Device 存在，因为它受限于硬件能力（如支持的地址宽度、页大小、IOMMU 型号）。

这种解耦带来了革命性的灵活性：多个 HWPT 可以订阅同一个 IOAS（即多组不同的 IOMMU 硬件自动同步同一套映射），或者实现嵌套翻译，即 HWPT 指向 Guest 的页表（Stage-1），而 IOAS 负责 Host 的翻译（Stage-2）。

本文将深入 QEMU 源码，剖析这两个核心对象是如何被创建、管理以及关联的。

## 核心逻辑：`iommufd_backend_alloc_ioas`

在 QEMU 的 `hw/vfio/iommufd.c` 中，当一个新的 Container（`VFIOIOMMUFDContainer`）被初始化时，首要任务就是申请一个 IOAS。这是通过 `iommufd_backend_alloc_ioas` 完成的。

该函数位于 `backends/iommufd.c`，它是 QEMU 与内核 IOMMUFD 子系统交互的通用封装层，不依赖于具体的 VFIO 设备逻辑。

## 逐层代码拆解

### 1. 申请 ID：`IOMMU_IOAS_ALLOC` —— 创建空的灵魂

IOAS 的创建过程非常轻量，它不涉及复杂的硬件交互，仅仅是在内核中分配一个管理结构对象。

```c
// backends/iommufd.c

/**
 * iommufd_backend_alloc_ioas: 申请一个新的 IOAS
 * @be: IOMMUFD 后端实例，持有 /dev/iommu 的 fd
 * @ioas_id: 输出参数，返回内核分配的 ID
 * @errp: 错误传递指针
 */
int iommufd_backend_alloc_ioas(IOMMUFDBackend *be, uint32_t *ioas_id,
                               Error **errp)
{
    // 构造 ioctl 参数
    struct iommu_ioas_alloc alloc = {
        .size = sizeof(alloc), // 用于内核做版本兼容性检查
        .flags = 0,            // 目前尚未定义特殊 flag
    };
    int ret;

    // 核心 ioctl 调用：向内核申请一个 IOAS 对象
    ret = ioctl(be->fd, IOMMU_IOAS_ALLOC, &alloc);
    if (ret < 0) {
        // 错误处理：可能是 fd 无效，或者内核不支持 IOMMUFD
        error_setg_errno(errp, errno, "Failed to allocate ioas");
        return ret;
    }

    // 获取内核返回的 ID
    *ioas_id = alloc.out_ioas_id;
    
    // 可以在这里加 tracepoint，方便调试
    trace_iommufd_backend_alloc_ioas(be->fd, *ioas_id);
    
    return 0;
}
```

*   **内核视角**：当内核收到这个 ioctl 时，会分配一个 `struct iommufd_ioas` 对象，并在内部的 XArray（一种高效的索引数据结构）中分配一个唯一的 `u32` ID。
*   **状态**：此时返回的 IOAS ID 就像一个空的“文件夹”。还没有任何物理内存被 Pin 住，没有任何硬件页表被建立。它只是一个准备接受 `MAP` 指令的逻辑容器。
*   **设计意义**：这意味着 QEMU 可以在虚拟机启动的极早期（甚至在探测到 PCI 设备之前）就建立起内存布局视图，这为内存预分配和快速启动提供了便利。

### 2. 自动 vs 手动 HWPT：塑造硬件的肉体

IOAS 只是灵魂（映射关系），要让 DMA 真正工作，还需要肉体（硬件页表）。HWPT 的创建时机通常滞后于 IOAS，发生在设备 **Attach** 到 IOAS 的时刻。这里存在两种截然不同的模式，分别对应传统的直通和高级的嵌套翻译。

#### 模式一：自动模式（Auto-managed HWPT / Paging Domain）
这是 Legacy VFIO 的替代方案，也是目前 QEMU 默认的最常用模式。

*   **QEMU 行为**：
    1.  QEMU 的 `MemoryListener` 监听内存变化，调用 `IOMMU_IOAS_MAP` 向 IOAS 填充 GPA -> HPA 的映射。
    2.  当设备初始化时，调用 `VFIO_DEVICE_ATTACH_IOMMUFD_PT`，将设备绑定到该 IOAS ID。
*   **内核行为（黑盒内部）**：
    1.  IOMMUFD 内核子系统检查该设备所属的 IOMMU 硬件（如 Intel VT-d）。
    2.  **自动创建**一个兼容的 HWPT。这种 HWPT 的类型是 `IOMMU_HWPT_DATA_NONE`，也就是内核管理的 Paging 页表。
    3.  内核驱动会分配物理页表内存，写入页表基地址到 IOMMU 寄存器（或 Context Entry）。
    4.  **自动同步**：最关键的是，内核会自动订阅 IOAS 的变化。当 IOAS 中有 MAP 操作时，内核自动将映射写入这个自动创建的 HWPT。
*   **场景**：普通的设备直通，Host 负责管理页表，Guest 看到的是“物理”设备，不知道后面还有 IOMMU 翻译。

#### 模式二：手动模式（User-managed HWPT / Nested Domain）
这是 IOMMUFD 的“杀手级”特性，通过 `IOMMU_HWPT_ALLOC` ioctl 显式实现。这通常用于 **vIOMMU (Virtual IOMMU)** 场景。

*   **场景**：**嵌套翻译（Nested Translation）**。Guest OS 内部也有 IOMMU 驱动，维护着 Guest 内部的页表（GIOVA -> GPA）。
*   **流程**：
    1.  **Stage-2 准备**：QEMU 创建一个 IOAS，映射 GPA -> HPA。这对应物理 IOMMU 的第二级翻译（Stage-2）。
    2.  **Stage-1 创建**：QEMU 显式调用 `IOMMU_HWPT_ALLOC`。
        *   `pt_id`: 指向上述 Stage-2 的 IOAS ID（作为父域）。
        *   `data_type`: 指定硬件格式（如 `IOMMU_HWPT_DATA_VTD_S1` 或 `IOMMU_HWPT_DATA_ARM_SMMUV3`）。
        *   `data`: 传入 Guest 页表的基地址（即 vCR3 或 vContextDescriptor）。
    3.  **Attach**：将设备 Attach 到这个手动创建的 Stage-1 HWPT 上。
*   **硬件行为**：IOMMU 硬件会先查 Stage-1 HWPT（由 Guest 控制），得到 GPA；再查 Stage-2 IOAS（由 Host 控制），得到 HPA。
*   **意义**：这使得 Guest 可以直接管理第一级页表，实现 **vSVA（虚拟共享虚拟寻址）**，即 Guest 进程的页表可以直接被物理 IOMMU 使用，性能和灵活性大幅提升。

### 3. 共享机制：多路复用的艺术

在 Legacy 模式下，判断两个设备能否共享同一个 Domain 是非常痛苦的。而在 QEMU 的 `VFIOIOMMUFDContainer` 结构体中，我们只维护了一个 `ioas_id`，却能优雅地处理复杂拓扑。

```c
typedef struct VFIOIOMMUFDContainer {
    VFIOContainerBase bcontainer;
    IOMMUFDBackend *be;
    uint32_t ioas_id;    // 核心 ID，只关注软件视图
    QLIST_HEAD(, VFIOIOASHwpt) hwpt_list;
} VFIOIOMMUFDContainer;
```

当有多个设备挂载到同一个 Container 时，QEMU 如何处理？
假设我们有 Device A（在 NUMA Node 0）和 Device B（在 NUMA Node 1），它们都属于同一个 Guest 地址空间。

1.  **Device A 初始化**：
    *   QEMU 调用 `alloc_ioas` 得到 ID=10。
    *   QEMU 将 ID=10 存入 Container。
    *   QEMU 将 Device A `ATTACH` 到 ID=10。
    *   内核为 Device A 创建 `HWPT_A`（适配 Node 0 的 IOMMU）。

2.  **Device B 初始化**：
    *   QEMU 发现 Device B 属于同一个 AddressSpace，复用 Container，取出 ID=10。
    *   QEMU 将 Device B `ATTACH` 到 ID=10。

**内核的智能多路复用**：
此时内核 IOMMUFD 子系统会进行智能判断：
*   **情况一（硬件共享 - Cache Coherency）**：如果 Device A 和 B 位于同一个 IOMMU 硬件之后，或者它们的硬件能力完全一致（例如都支持 Snoop，页表格式相同）。内核会将 Device B 直接绑定到现有的 `HWPT_A` 上。这是最高效的，节省了页表内存。
*   **情况二（硬件隔离 - 跨 NUMA/不同型号）**：如果 Device B 位于另一个 IOMMU 硬件之后（例如跨 NUMA 节点，或者一个是 Intel 网卡，一个是 AMD 显卡）。内核会自动创建一个新的 `HWPT_B`，适配新的硬件格式。
    *   **关键点**：尽管生成了两个 HWPT，但它们都订阅同一个 IOAS ID=10。
    *   **同步机制**：当 QEMU 对 IOAS ID=10 执行 Map 时，内核会自动遍历所有订阅该 IOAS 的 HWPT（HWPT_A 和 HWPT_B），并将映射写入各自的页表。

对 QEMU 来说，它只需要操作 IOAS ID=10，无需关心底层到底生成了几个 HWPT，也无需处理繁琐的兼容性检查。

## 总结

`iommufd_backend_alloc_ioas` 及其背后的对象模型，展示了 IOMMUFD 极高的设计灵活性。它通过将“我想映射什么地址”（IOAS）和“硬件怎么执行映射”（HWPT）彻底分开，解决了 Legacy 模型中长期存在的扩展性痛点。

*   **对 QEMU 的影响**：大幅简化了内存管理逻辑。`MemoryListener` 只需要盯着一个 IOAS ID 进行 Map/Unmap，而不再需要关心底层挂了多少个 Group，也不用像 Legacy 那样去遍历 Container 列表进行 `try_attach`。
*   **对未来的意义**：这种解耦为支持 **SVA（Shared Virtual Memory）** 和 **PASID** 提供了完美的接口。因为在 SVA 场景下，进程的页表实际上就是一种特殊的 HWPT（Stage-1），而 IOAS 则退化为简单的直通或 Stage-2 映射。IOMMUFD 的架构可以天然适配这种从“设备独占页表”到“进程级页表”的转变。

理解 IOAS 和 HWPT 的关系，是掌握 IOMMUFD 嵌套翻译、脏页追踪等高级功能的前提。在下一篇文章中，我们将进一步探讨设备 Attach 过程中更为细节的“Bind”与“Realize”流程。

## 关于作者

大家好，我是宝爷，浙大本科、前华为工程师、现某芯片公司系统架构负责人，关注个人成长。

新的图解文章都在公众号「宝爷说」首发，别忘记关注了哦！

感谢你读到这里。

如果这篇文章对您有所帮助，欢迎点赞、分享或收藏！你的支持是我创作的动力！

如果您不想错过未来的更新，记得点个星标 ⭐，下次我更新你就能第一时间收到推送啦。