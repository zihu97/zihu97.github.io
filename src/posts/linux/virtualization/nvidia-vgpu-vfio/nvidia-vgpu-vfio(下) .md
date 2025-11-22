---
date: 2025-11-24
article: true
category:
  - tech
tag:
  - vfio
---


# VFIO框架源码分析（七）- NVIDIA vGPU驱动剖析（下）：虚拟设备生命周期与I/O实现

## 引言与整体框架

在上篇中，我们分析了`nvidia-vgpu-vfio`驱动如何通过一个精巧的“前端-后端”架构完成初始化，并向Linux MDEV框架注册了其GPU虚拟化能力。这个注册过程的核心是提供了一个名为`vgpu_fops`的操作函数集。

本文（下篇）将聚焦于`vgpu_fops`，详细剖析一个vGPU实例从诞生到被虚拟机（VM）实际使用，再到最终销毁的完整生命周期。我们将看到，用户空间的每一个VFIO操作，是如何通过`vgpu_fops`中的函数，最终被精确地转发和实现。

**核心分析：vGPU生命周期管理者`vgpu_fops`**

`vgpu_fops`是`nvidia-vgpu-vfio`驱动的核心，它是一个`mdev_driver_ops`结构体，实现了MDEV框架要求的所有回调函数。它定义了对vGPU实例进行全生命周期管理以及数据交互所需的一切。从用户在`sysfs`中创建vGPU，到QEMU通过VFIO `ioctl`/`mmap`等接口操作vGPU，所有行为的入口点都在这里。

## **分步详解：从创建到高性能I/O**

![](./image-3.png)

**1. vGPU的诞生 (`.create` -> `nv_vgpu_vfio_create`)**

当管理员向`sysfs`的`create`文件写入一个UUID时，MDEV框架会调用`.create`回调，即`nv_vgpu_vfio_create`。此函数负责vGPU实例的创建和初始化：

*   **后端调用**: 它首先通过`rm_vgpu_vfio_ops.vgpu_create`调用后端接口，请求NVIDIA核心驱动（RM）分配实际的GPU资源并创建一个vGPU实例。
*   **内核集成**: 后端成功返回后，前端会执行一系列标准化集成工作，包括：
    *   `nv_create_vgpu_chardev`: 为该vGPU创建一个字符设备。
    *   `mdev_set_iommu_device`: 将该vGPU设备与IOMMU关联起来，确保DMA访问的安全性。
    *   `mdev_set_drvdata`: 将vGPU的私有数据结构与MDEV设备关联，方便后续操作。

**2. vGPU的启用 (`.open_device` -> `nv_vgpu_vfio_open`)**

![](./image-4.png)

当QEMU/VFIO打开vGPU设备文件描述符时，`.open_device`回调，即`nv_vgpu_vfio_open`会被触发。这标志着虚拟机即将开始使用该vGPU。

*   **启动vGPU**: 一个关键操作是调用后端的`rm_vgpu_vfio_ops.vgpu_start`函数，通知核心驱动，该vGPU实例已被激活，可以开始处理来自虚拟机的指令。
*   **事件通知**: 它还会通过`vfio_register_notifier`注册事件通知，用于处理中断等异步事件。

**3. vGPU的数据交互 (I/O操作)**

这是体现vGPU性能和功能的核心部分，主要由`.read`, `.write`, 和 `.mmap`处理。

![](./image-5.png)

*   **寄存器访问 (`.read`/`.write` -> `nv_vgpu_vfio_access`)**:
    此函数是一个分发器，根据访问的Region（区域）执行不同逻辑：
    *   **PCI配置空间 (`VFIO_PCI_CONFIG_REGION_INDEX`)**: 请求被转发到`nv_vgpu_vfio_hw_config_access`，它通过`pci_read/write_config_dword`直接读写真实的PCI配置空间寄存器。这表明NVIDIA vGPU为VM提供了高度仿真的PCI设备视图。
    *   **BAR空间 (`VFIO_PCI_BARx_REGION_INDEX`)**: 请求被转发到`vgpu_read_base`等函数，这会访问由后端驱动维护的虚拟BAR空间缓存（`vgpu_dev->vconfig`），实现了对设备MMIO空间的虚拟化。

![](./image-6.png)

*   **高性能显存访问 (`.mmap` -> `nv_vgpu_vfio_mmap`)**:
    这是图形性能的关键。当QEMU请求`mmap` vGPU的显存BAR（通常是`BAR1`）时，`nv_vgpu_vfio_mmap`被调用。
    *   它为VMA（Virtual Memory Area）设置了`vgpu_mmio_ops`操作集。
    *   这个操作集的核心是`vgpu_mmio_fault`函数。这是一个缺页处理函数 (Page Fault Handler)。这意味着vGPU的显存映射采用了按需分页 (On-demand Paging)的高级技术。只有当虚拟机首次访问某块显存时，才会触发缺页中断，然后由`vgpu_mmio_fault`函数动态地为其建立物理映射。这种方式极大地优化了内存开销和映射效率，是实现高性能vGPU的基石。

## 总结

`vgpu_fops`操作集完美地展示了一个生产级MDEV驱动如何将标准的VFIO操作映射到底层复杂的硬件虚拟化逻辑上：

1.  **完整的生命周期管理**: 通过`.create`, `.open_device`, `.close_device`, `.remove`等回调，实现了vGPU从创建、激活、关闭到销毁的全程管理。
2.  **精确的I/O虚拟化**: 通过`nv_vgpu_vfio_access`分发器，对PCI配置空间和BAR空间提供了不同层次的虚拟化，兼顾了仿真度和性能。
3.  **极致的性能优化**: `mmap`的实现采用了先进的按需分页技术，通过缺页中断动态建立显存映射，这是支撑vGPU高性能图形渲染和计算的核心所在。

综合上下两篇文章，我们看到`nvidia-vgpu-vfio`驱动通过其解耦的架构和对VFIO/MDEV接口的精巧实现，成功地将NVIDIA强大的GPU虚拟化能力，融入到了开放的Linux虚拟化生态之中。

## 关于作者

大家好，我是宝爷，浙大本科、前华为工程师、现某芯片公司系统架构负责人，关注个人成长。

新的图解文章都在公众号「宝爷说」首发，别忘记关注了哦！

感谢你读到这里。

如果这篇文章对您有所帮助，欢迎点赞、分享或收藏！你的支持是我创作的动力！

如果您不想错过未来的更新，记得点个星标 ⭐，下次我更新你就能第一时间收到推送啦。