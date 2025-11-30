---
date: 2025-11-30
article: true
category:
  - tech
tag:
  - vfio
  - qemu
---


# VFIO框架源码分析（二十二）- IOMMUFD 的脏页跟踪与 Dirty Bits 读取

## 简介与背景

在虚拟化热迁移（Live Migration）的场景中，**脏页追踪（Dirty Page Tracking）** 是最具挑战性的环节之一。它的核心任务是实时捕获设备（DMA）对内存的写操作，以便 VMM（如 QEMU）知道哪些内存页需要被重新传输到目标主机。

在 **Legacy VFIO (Type1)** 时代，脏页追踪的设计存在明显的局限性：
1.  **强耦合与粗粒度**：脏页追踪是绑定在 Container 上的。这意味着，如果一个 Container 内有多个设备，哪怕只有一个设备在写内存，脏页追踪也会影响 Container 内的所有设备。
2.  **软件模拟开销大**：Legacy 实现主要依赖将 IOMMU 页表设置为“只读”，利用 I/O Page Fault 来捕获写操作。这种“陷阱-模拟（Trap-and-Emulate）”的方式在 IO 密集型场景下会带来严重的性能抖动。
3.  **硬件特性利用不足**：现代 IOMMU 硬件（如 ARM SMMUv3.2+ 的 HTTU 或 Intel Scalable Mode）已经支持硬件脏页位（Hardware Dirty Bits），但 Legacy 接口难以在不破坏 ABI 的前提下优雅地支持这些新特性。

**IOMMUFD** 的引入彻底改变了这一局面。它设计了一套通用的、面向 **HWPT (硬件页表)** 的脏页追踪 UAPI。这种设计不仅解耦了地址空间与追踪逻辑，还为硬件加速提供了原生支持。

本文将基于 **QEMU v10.0.3** 和 **Linux v6.18-rc4** 的源码，深度剖析 IOMMUFD 模式下脏页追踪的完整流程：从开启追踪到读取硬件位图。

## 2. 核心流程：Set Tracking -> Get Bitmap

与 Legacy 模式类似，IOMMUFD 的脏页追踪也分为“开启”和“查询”两个阶段，但操作的对象和底层机制截然不同。

### 2.1 开启追踪：`iommufd_set_dirty_page_tracking`

在 IOMMUFD 中，开启脏页追踪的操作对象是 **HWPT (Hardware Page Table)**，而不是 IOAS。这是一个非常精准且关键的设计差异。

#### QEMU 侧实现 (`hw/vfio/iommufd.c`)

当迁移开始时，QEMU 调用 `vfio_set_dirty_page_tracking`，进而分发到 IOMMUFD 的实现：

```c
/* hw/vfio/iommufd.c */
static int iommufd_set_dirty_page_tracking(const VFIOContainerBase *bcontainer,
                                           bool start, Error **errp)
{
    const VFIOIOMMUFDContainer *container =
        container_of(bcontainer, VFIOIOMMUFDContainer, bcontainer);
    VFIOIOASHwpt *hwpt;

    QLIST_FOREACH(hwpt, &container->hwpt_list, next) {
        if (!iommufd_hwpt_dirty_tracking(hwpt)) {
            continue;
        }

        if (!iommufd_backend_set_dirty_tracking(container->be,
                                                hwpt->hwpt_id, start, errp)) {
            goto err;
        }
    }

    return 0;

err:
    QLIST_FOREACH(hwpt, &container->hwpt_list, next) {
        if (!iommufd_hwpt_dirty_tracking(hwpt)) {
            continue;
        }
        iommufd_backend_set_dirty_tracking(container->be,
                                           hwpt->hwpt_id, !start, NULL);
    }
    return -EINVAL;
}
```

#### 后端交互 (`backends/iommufd.c`)

QEMU 最终通过 `ioctl` 向内核发送指令：

```c
/* backends/iommufd.c */
int iommufd_backend_set_dirty_tracking(IOMMUFDBackend *be, uint32_t hwpt_id,
                                       bool start, Error **errp)
{
    struct iommu_hwpt_set_dirty_tracking set_dirty = {
        .size = sizeof(set_dirty),
        .hwpt_id = hwpt_id, // 指定目标 HWPT ID
        .flags = start ? IOMMU_HWPT_DIRTY_TRACKING_ENABLE : 0,
    };
    
    // 调用 IOMMU_HWPT_SET_DIRTY_TRACKING
    int ret = ioctl(be->fd, IOMMU_HWPT_SET_DIRTY_TRACKING, &set_dirty);
    // ... 错误处理 ...
    return ret;
}
```

#### 内核动作与设计意图

当内核收到 `IOMMU_HWPT_SET_DIRTY_TRACKING` 时，底层 IOMMU 驱动会执行以下动作：
1.  **硬件能力检查**：检查该 HWPT 绑定的 IOMMU 硬件是否支持脏页追踪（软件模拟或硬件支持）。
2.  **页表修改**：
    *   **硬件加速模式 (HTTU)**：如果硬件支持（如 ARM SMMUv3.2），驱动可能通过设置 Context Descriptor 中的标志位，告知硬件开始在 PTE（页表项）中置位 Dirty Bit。
    *   **软件模拟模式**：如果硬件不支持，驱动会将该 HWPT 覆盖的所有 IOVA 映射修改为 **Read-Only**。

**精细控制的优势**：
假设一个 VM 有两个设备，一个支持硬件脏页（Device A），一个不支持（Device B）。在 IOMMUFD 架构下，它们可以绑定不同的 HWPT。开启追踪时，Device A 可以享受零开销的硬件追踪，而只有 Device B 需要忍受写保护的性能损耗。这在 Legacy 的“大锅饭”模式下是无法实现的。

### 2.2 读取位图：`iommufd_query_dirty_bitmap`

迁移迭代过程中，QEMU 需要周期性地读取脏页位图。

#### QEMU 侧实现 (`hw/vfio/iommufd.c`)

```c
/* hw/vfio/iommufd.c */
static int iommufd_query_dirty_bitmap(const VFIOContainerBase *bcontainer,
                                      VFIOBitmap *vbmap, hwaddr iova,
                                      hwaddr size, Error **errp)
{
    VFIOIOMMUFDContainer *container = container_of(bcontainer,
                                                   VFIOIOMMUFDContainer,
                                                   bcontainer);
    unsigned long page_size = qemu_real_host_page_size();
    VFIOIOASHwpt *hwpt;

    QLIST_FOREACH(hwpt, &container->hwpt_list, next) {
        if (!iommufd_hwpt_dirty_tracking(hwpt)) {
            continue;
        }

        if (!iommufd_backend_get_dirty_bitmap(container->be, hwpt->hwpt_id,
                                              iova, size, page_size,
                                              (uint64_t *)vbmap->bitmap,
                                              errp)) {
            return -EINVAL;
        }
    }

    return 0;
}
```

#### 硬件加速的魔法：HTTU

`iommufd_backend_get_dirty_bitmap` 会调用 `IOMMU_HWPT_GET_DIRTY_BITMAP` ioctl。这正是 IOMMUFD 性能飞跃的关键所在。

对于支持 **HTTU (Hardware Translation Table Update)** 的硬件（如 ARM SMMUv3）：
1.  **无缺页异常**：当设备进行 DMA 写操作时，IOMMU 硬件会自动查找页表，并将 PTE 中的 Dirty Bit 置为 1，**整个过程完全由硬件完成，不触发 CPU 中断或 Fault**。
2.  **原子读取与清除**：当 QEMU 调用 `GET_DIRTY_BITMAP` 时，内核驱动遍历物理页表，读取 PTE 的 Dirty Bit，将其拷贝到用户态位图，并原子地清除 PTE 中的 Dirty Bit。

相比 Legacy 模式下成千上万次的 Page Fault 处理，这种硬件加速机制几乎消除了脏页追踪对 VM 业务性能的影响。

### 2.3 范围列表与碎片化处理

在 QEMU 的内存模型中，GPA 空间往往是不连续的（被 MMIO 区域打断，或由多个 DIMM 组成）。

虽然 `IOMMU_HWPT_GET_DIRTY_BITMAP` 的基础定义一次处理一个 IOVA 范围：
```c
/**
 * struct iommu_hwpt_get_dirty_bitmap - ioctl(IOMMU_HWPT_GET_DIRTY_BITMAP)
 * @size: sizeof(struct iommu_hwpt_get_dirty_bitmap)
 * @hwpt_id: HW pagetable ID that represents the IOMMU domain
 * @flags: Combination of enum iommufd_hwpt_get_dirty_bitmap_flags
 * @__reserved: Must be 0
 * @iova: base IOVA of the bitmap first bit
 * @length: IOVA range size
 * @page_size: page size granularity of each bit in the bitmap
 * @data: bitmap where to set the dirty bits. The bitmap bits each
 *        represent a page_size which you deviate from an arbitrary iova.
 *
 * Checking a given IOVA is dirty:
 *
 *  data[(iova / page_size) / 64] & (1ULL << ((iova / page_size) % 64))
 *
 * Walk the IOMMU pagetables for a given IOVA range to return a bitmap
 * with the dirty IOVAs. In doing so it will also by default clear any
 * dirty bit metadata set in the IOPTE.
 */
struct iommu_hwpt_get_dirty_bitmap {
	__u32 size;
	__u32 hwpt_id;
	__u32 flags;
	__u32 __reserved;
	__aligned_u64 iova;
	__aligned_u64 length;
	__aligned_u64 page_size;
	__aligned_u64 data;
};
```

## 4. 总结

IOMMUFD 的脏页跟踪机制不仅仅是 API 的升级，更是对 I/O 虚拟化硬件感知能力的一次释放：

1.  **对象级精确控制**：将脏页追踪的粒度从“一堆设备（Container）”细化到了“具体页表（HWPT）”。这允许 QEMU 根据设备的实际硬件能力，混合使用硬件追踪和软件模拟，实现最优的迁移效率。
2.  **硬件加速原生支持**：通过标准的 UAPI 暴露 HTTU 等硬件特性，彻底解决了 Legacy 模式下写保护带来的性能损耗痛点。
3.  **异构迁移的基础**：这种精细化的设计，为未来支持更复杂的场景（如跨厂商 GPU 迁移、SVA 进程级迁移）奠定了坚实的基础。

在 IOMMUFD 的加持下，带大内存、高性能设备的虚拟机热迁移，终于不再是运维人员的噩梦。

## 关于作者

大家好，我是宝爷，浙大本科、前华为工程师、现某芯片公司系统架构负责人，关注个人成长。

新的图解文章都在公众号「宝爷说」首发，别忘记关注了哦！

感谢你读到这里。

如果这篇文章对您有所帮助，欢迎点赞、分享或收藏！你的支持是我创作的动力！

如果您不想错过未来的更新，记得点个星标 ⭐，下次我更新你就能第一时间收到推送啦。