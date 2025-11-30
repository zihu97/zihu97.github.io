---
date: 2025-11-15
article: true
category:
  - tech
tag:
  - vfio
---

# VFIO框架源码分析（一）- 从初始化到设备访问

## 引言与整体框架

VFIO (Virtual Function I/O) 是Linux内核中一个健壮、安全的用户空间驱动框架。它允许将物理设备（特别是PCI设备）安全地、非特权地“直通”给用户空间应用程序，最典型的应用场景就是QEMU/KVM虚拟机监视器（VMM）将宿主机的PCI/PCIe设备（如GPU、网卡）直接分配给虚拟机使用。VFIO的核心是利用IOMMU（Input-Output Memory Management Unit）提供的DMA地址隔离和中断重映射能力，确保用户空间的设备访问不会威胁到系统其他部分的安全。

本文将基于linux v5.15版本，深入剖析其从内核模块初始化到用户空间获取最终设备文件描述符（FD）的全过程。

**核心分析：`vfio_init` 模块入口**

与所有内核模块一样，VFIO的生命周期始于其初始化函数 `vfio_init`。此函数是整个VFIO框架的基石，主要完成两项关键的字符设备注册工作：

![](./image.png)

1.  **注册 `/dev/vfio/vfio` (Container) 设备**: 通过 `misc_register(&vfio_dev)` 函数注册一个混杂设备（misc device）。这个设备对应于用户空间路径 `/dev/vfio/vfio`。打开此设备将得到一个代表 **VFIO Container** 的文件描述符。一个Container可以理解为一个隔离的IOMMU域，通常代表一个虚拟机（VM）的内存保护上下文。所有要分配给该VM的设备组（Group）都必须关联到这个Container上。该设备的操作函数集由 `vfio_fops` 定义。

2.  **注册Group设备号**: 通过 `alloc_chrdev_region` 和 `cdev_init` 函数，为 **VFIO Group** 动态分配一个主设备号，并初始化其字符设备结构。内核中的每个IOMMU Group都会对应一个设备文件，例如 `/dev/vfio/1`, `/dev/vfio/2` 等。这些设备文件的操作由 `vfio_group_fops` 定义。

## 分步详解：从Container到Device的层次化访问

VFIO的设计哲学是层次化的，用户空间必须按顺序创建和关联Container、Group和Device，最终才能访问到物理设备。

#### **第一层：VFIO Container的创建与配置**

![](./image-1.png)

用户空间的第一步是打开 `/dev/vfio/vfio` 文件，获取一个Container文件描述符（fd）。这个fd是后续所有操作的句柄。对这个fd的核心操作是通过 `ioctl` 系统调用完成的，其在内核中由 `vfio_fops_unl_ioctl` 函数处理。

![](./image-2.png)

*   **`VFIO_GET_API_VERSION`**: 用于查询VFIO的API版本号。
*   **`VFIO_CHECK_EXTENSION`**: 用于检查内核是否支持特定的IOMMU后端类型，例如 `VFIO_TYPE1_IOMMU`。
*   **`VFIO_SET_IOMMU`**: 这是最关键的操作之一。用户空间通过此 `ioctl` 告知VFIO要使用哪种IOMMU后端。内核侧的 `vfio_ioctl_set_iommu` 函数会遍历已注册的IOMMU驱动列表（`vfio.iommu_drivers_list`），找到匹配的驱动并将其操作函数集（`driver->ops`）附加到Container上。自此，Container便具备了管理IOMMU页表的能力。

#### **第二层：VFIO Group与Container的关联**

当Container准备就绪后，下一步是处理IOMMU Group。一个Group是IOMMU能够进行隔离的最小设备单元。

![](./image-3.png)

用户空间打开代表特定Group的设备文件（例如 `/dev/vfio/1`），获得一个Group fd。同样，关键操作也是通过 `ioctl` 进行，由 `vfio_group_fops_unl_ioctl` 函数处理。

![](./image-4.png)

*   **`VFIO_GROUP_GET_STATUS`**: 获取Group的状态，例如它是否可行（viable）。
*   **`VFIO_GROUP_SET_CONTAINER`**: 这是连接两层的桥梁。用户空间将第一步中获得的Container fd作为参数传递给此`ioctl`。内核中的 `vfio_group_set_container` 函数会将当前的Group结构体关联到指定的Container上（通过 `list_add` 操作加入到Container的group链表中）。只有关联到Container后，Group内的设备才能使用Container所管理的IOMMU域进行DMA映射。

#### **第三层：获取Device FD与最终设备访问**

当Group成功关联到Container后，用户空间就可以获取Group内具体设备的控制权了。

![](./image-5.png)

*   **`VFIO_GROUP_GET_DEVICE_FD`**: 用户空间通过此`ioctl`并提供设备名称（如 "0000:01:00.0"）来请求获取一个代表物理设备的文件描述符。
    *   内核中的 `vfio_group_get_device_fd` 函数首先通过 `vfio_device_get_from_name` 找到对应的 `vfio_device` 结构体。
    *   然后，它调用 `anon_inode_getfile` 创建一个与物理设备关联的匿名文件描述符，这个新的fd的操作函数集由 `vfio_device_fops` 定义。

![](./image-6.png)

这个最终获得的Device fd是用户空间直接与硬件交互的句柄。对它进行 `read`, `write`, `mmap`, `ioctl` 等操作，会通过 `vfio_device_fops` 最终调用到底层的、与具体总线相关的VFIO驱动（如 `vfio-pci`）所实现的操作函数（`device->ops`），从而操作设备的配置空间、MMIO/PIO区域等。

## 总结

通过分析，我们可以清晰地梳理出VFIO的工作流程和核心设计思想：

1.  **模块初始化 (`vfio_init`)**: 创建了两种核心的字符设备接口，分别用于管理Container和Group。
2.  **Container层**: 用户空间通过操作 `/dev/vfio/vfio` 创建一个IOMMU域（Container），并为其绑定一个IOMMU后端驱动。
3.  **Group层**: 用户空间打开代表IOMMU Group的 `/dev/vfio/$GROUP` 文件，并将其附加到已经创建好的Container上，从而使Group内的设备受该Container的IOMMU域保护。
4.  **Device层**: 最后，从Group中获取代表具体设备的fd。这个fd是用户空间驱动程序的最终目标，通过它可以对设备进行内存映射（`mmap`）和寄存器读写，实现设备的完全控制。

VFIO通过这种Container -> Group -> Device的逐层授权和关联机制，构建了一个安全、隔离的用户空间设备访问模型，是现代虚拟化技术不可或缺的一环。

## 关于作者

大家好，我是宝爷，浙大本科、前华为工程师、现某芯片公司系统架构负责人，关注个人成长。

新的图解文章都在公众号「宝爷说」首发，别忘记关注了哦！

感谢你读到这里。

如果这篇文章对您有所帮助，欢迎点赞、分享或收藏！你的支持是我创作的动力！

如果您不想错过未来的更新，记得点个星标 ⭐，下次我更新你就能第一时间收到推送啦。
