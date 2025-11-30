---
date: 2025-11-30
article: true
category:
  - tech
tag:
  - vfio
  - qemu
---


# VFIO框架源码分析（二十三）- 从 Legacy VFIO 到 IOMMUFD 的全面对比

## 简介与背景

经过前面二十多篇文章的漫长跋涉，我们从 QEMU 的设备初始化出发，深入内核中断机制，剖析了内存映射的奥秘，并完整拆解了 QEMU VFIO 的两条后端路径：久经沙场的 **Legacy VFIO (Type1)** 和崭露头角的 **IOMMUFD**。

现在，是时候站在系统架构师的高度，对这两代技术进行一次彻底的复盘与对比。这不仅仅是 API 接口的更迭，更是一场关于 Linux 内核 I/O 虚拟化设计哲学的演进。

Legacy VFIO 诞生于 2012 年，那时候的直通主要是为了高性能网卡和简单的显卡。而 IOMMUFD 诞生于 2022 年（Linux 6.2），面对的是 AI 大模型训练、超复杂的异构计算拓扑、CXL 内存池化以及 SVA（共享虚拟寻址）等现代需求。

本文将结合 **QEMU v10.0.3** 和 **Linux v6.18-rc4** 的源码视角，从对象模型、资源管理、拓扑构建等多个维度，详细阐述为什么 IOMMUFD 是未来的唯一选择。

## 2. 核心维度深度对比

我们将通过一个详细的维度拆解，来展示 IOMMUFD 到底“赢”在哪里。

| 维度 | Legacy VFIO (Type1) | IOMMUFD | 深度解析 |
| :--- | :--- | :--- | :--- |
| **核心对象** | `Container` / `Group` | `IOAS` / `HWPT` / `Device` | Legacy 强耦合软硬件视图；IOMMUFD 彻底解耦，支持更灵活的映射关系。 |
| **资源句柄** | 基于 `open` 的多个 fd | 基于单一 fd 的 ID 系统 | Legacy 需打开 `/dev/vfio/N`；IOMMUFD 仅需一个 `/dev/iommu`，其余全是 `u32` ID，大幅减少 fd 消耗。 |
| **设备绑定** | 隐式：Group 加入 Container | 显式：`Bind` -> `Attach` | Legacy 靠“副作用”建立映射；IOMMUFD 状态机清晰，错误排查容易。 |
| **页表共享** | 仅能在 Container 级共享 | 任意 IOAS/HWPT 组合 | IOMMUFD 支持跨硬件架构共享同一套软件地址空间（IOAS）。 |
| **嵌套翻译** | 不支持 (或极其 Hacky) | 原生支持 (Nested HWPT) | IOMMUFD 通过 `IOMMU_HWPT_ALLOC` 原生支持 Stage-1 + Stage-2 双级页表，是 vSVA 的基石。 |
| **资源计费** | 分散，易重复 (Double Pin) | 统一 (Pinned Pages) | IOMMUFD 在 Context 层面去重，多设备共享内存不重复计费，更安全。 |
| **脏页追踪** | Container 级，软件模拟为主 | HWPT 级，硬件加速友好 | IOMMUFD 可针对特定硬件开启 HTTU，且不影响同一空间下的其他设备。 |

### 2.1 对象模型的降维打击

*   **Legacy 的困局**：Container 是一个“大杂烩”。你无法在没有设备的情况下创建一个 Container。Group 是操作的核心，但这实际上是内核为了安全隔离强加给用户的概念。用户态只想用设备，却被迫处理 Group 逻辑。
*   **IOMMUFD 的解法**：拆分！
    *   **IOAS** 是纯软件的地址空间，对应 QEMU 的 `AddressSpace`。
    *   **HWPT** 是纯硬件的页表配置，对应 Intel/AMD/ARM IOMMU 的硬件结构。
    *   **Device** 是纯粹的物理设备句柄。
    这种 `M:N` 的映射关系（多个 HWPT 指向一个 IOAS，多个 Device 绑定一个 HWPT）让复杂的拓扑（如 SR-IOV 直通给不同 VM 但共享部分内存）变得轻而易举。

### 2.2 资源句柄与生命周期

在 QEMU 代码中，使用 Legacy 后端时，每直通一个 Group 的设备，就需要持有一个 Group fd 和可能的 Container fd。对于拥有成百上千个 VF（Virtual Function）的超大规模虚拟机，这会消耗大量的文件描述符，甚至触发系统的 `ulimit` 限制。

IOMMUFD 采用了 **Centralized FD (中心化 FD)** 设计。QEMU 全程只持有**一个** `/dev/iommu` 的 fd。所有的对象（IOAS, Device, HWPT）都只是内核上下文中分配的一个 32 位整数 ID。这不仅节省资源，更方便内核统一管理对象的生命周期——当 QEMU 崩溃，关闭这一个 fd，内核就能通过 XArray 索引自动回收挂在它下面的成千上万个对象，无内存泄漏之虞。

### 2.3 嵌套翻译与 vSVA

这是 IOMMUFD 的杀手级特性。
*   **Legacy**：Type1 接口只能管理一级页表。如果 Guest 想要使用自己的页表（vIOMMU），Host 必须通过 Shadow Page Table（影子页表）来模拟。QEMU 必须捕获 Guest 的每一次页表修改，然后同步到 Host IOMMU。这在高性能场景下是不可接受的。
*   **IOMMUFD**：通过 `IOMMU_HWPT_ALLOC` 接口，QEMU 可以显式创建一个 **Nested HWPT**。
    *   **Stage-2**：指向 IOAS（GPA -> HPA）。
    *   **Stage-1**：直接指向 Guest 内存中的页表基地址（GVA -> GPA）。
    *   硬件 IOMMU 自动执行两级翻译。Guest 进程的页表直接生效，实现了 **vSVA**，性能接近物理机。

## 3. QEMU 的抉择：代码验证

QEMU v10.0.3 处于一个承上启下的“双轨制”阶段。它既要兼容旧内核，又要拥抱新特性。

这一抉择逻辑发生在 `hw/vfio/common.c` 的 `vfio_attach_device` 函数中（以及上层的 `vfio_realize`）。

### 代码验证 (基于 QEMU v10.0.3)

```c
/* hw/vfio/common.c */
bool vfio_attach_device(char *name, VFIODevice *vbasedev,
                        AddressSpace *as, Error **errp)
{
    /* 默认 Legacy 后端 */
    const VFIOIOMMUClass *ops =
        VFIO_IOMMU_CLASS(object_class_by_name(TYPE_VFIO_IOMMU_LEGACY));
    HostIOMMUDevice *hiod = NULL;
    /* 
     * 抉择时刻：
     * QEMU 如何决定走 Legacy 还是 IOMMUFD？
     * 依据：用户是否在命令行传入了 iommufd 对象。
     * 例如：-device vfio-pci,host=xx:xx.x,iommufd=iommufd0
     */
    if (vbasedev->iommufd) {
        /* 加载 IOMMUFD 后端的操作接口 */
        ops = VFIO_IOMMU_CLASS(object_class_by_name(TYPE_VFIO_IOMMU_IOMMUFD));
    }

    assert(ops);


    if (!vbasedev->mdev) {
        hiod = HOST_IOMMU_DEVICE(object_new(ops->hiod_typename));
        vbasedev->hiod = hiod;
    }

    /* 多态调用：执行对应后端的 attach 逻辑 */
    if (!ops->attach_device(name, vbasedev, as, errp)) {
        object_unref(hiod);
        vbasedev->hiod = NULL;
        return false;
    }

    return true;
}
```

**验证结论**：
1.  **显式配置优先**：QEMU 不会自动魔法切换，它依赖于 `vbasedev->iommufd` 指针。这意味着用户（或 Libvirt）需要在命令行显式创建 `iommufd` 对象并关联给设备。
2.  **抽象层设计**：`VFIOIOMMUClass` 是 QOM 设计的精髓。上层 PCI 代码不需要关心底层细节，只需要调用 `ops->attach_device`、`ops->dma_map` 等标准接口。
3.  **兼容性**：这种设计保证了在旧内核（5.x 版本，无 `/dev/iommu`）上，QEMU 依然可以完美运行 Legacy 路径。

## 4. 未来展望

Legacy VFIO 已经完成了它的历史使命，目前在 Linux 内核中已进入**仅维护（Maintenance Only）**模式。这意味着，任何激动人心的新特性都不会出现在 Type1 驱动中。

**IOMMUFD 是通往未来的钥匙，它将解锁以下场景：**

1.  **User-space Page Fault (PRI/IOPF)**：
    允许设备像 CPU 一样处理缺页异常。设备可以访问未 Pin 的内存，当缺页时触发中断通知 QEMU/内核，内核按需调页。这使得 GPU 可以使用比物理内存大得多的显存（统一内存架构）。这一特性强依赖 IOMMUFD 的 Fault Queue 对象。

2.  **CXL (Compute Express Link)**：
    CXL 内存池化需要动态地将远端内存映射到本地地址空间。IOMMUFD 的灵活性使其成为管理 CXL Type 3 设备 IOMMU 映射的天然选择。

3.  **机密计算 (Confidential Computing)**：
    在 TDX/SEV-SNP 环境下，IOMMU 页表需要与受保护的加密内存协同工作。IOMMUFD 提供了更清晰的接口来管理这些受限的映射关系。

从 **Container** 到 **Object**，从 **Implicit** 到 **Explicit**，从 **粗放管理** 到 **精细控制**，IOMMUFD 不仅是代码的重构，更是 Linux I/O 虚拟化走向成熟的里程碑。对于每一位虚拟化开发者而言，掌握 IOMMUFD 已不再是可选项，而是必修课。

## 关于作者

大家好，我是宝爷，浙大本科、前华为工程师、现某芯片公司系统架构负责人，关注个人成长。

新的图解文章都在公众号「宝爷说」首发，别忘记关注了哦！

感谢你读到这里。

如果这篇文章对您有所帮助，欢迎点赞、分享或收藏！你的支持是我创作的动力！

如果您不想错过未来的更新，记得点个星标 ⭐，下次我更新你就能第一时间收到推送啦。