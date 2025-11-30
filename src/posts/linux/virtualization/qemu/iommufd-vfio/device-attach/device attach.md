---
date: 2025-11-30
article: true
category:
  - tech
tag:
  - vfio
  - qemu
---


# VFIO框架源码分析（二十）- IOMMUFD 设备挂载流程 (iommufd_cdev_attach)

## 简介与背景

在 Legacy VFIO 模型中，Group 是 API 操作的核心粒度。用户态必须先打开 Group fd，然后将其加入 Container，这一过程隐含了将设备绑定到 IOMMU 域（Domain）的操作。这种设计虽然在内核层面严格保证了 IOMMU 隔离组（IOMMU Group）的安全性，但也导致了用户态 API 的僵化——用户被迫去处理 Group 的概念，即使他只关心某一个特定的设备。

IOMMUFD 的出现标志着 **Device-Centric（以设备为中心）** 时代的到来。在 API 层面，Group 的概念被大幅弱化（虽然在内核安全检查中依然至关重要）。用户态程序现在可以直接持有设备对象，并明确地将其绑定到指定的地址空间。

在 QEMU v10.0.3 中，这一逻辑集中体现在 `hw/vfio/iommufd.c` 的 `iommufd_cdev_attach` 函数中。该函数清晰地展示了 IOMMUFD 设备初始化的“两步走”战略：**Bind（注册）** 与 **Attach（挂载）**。

本文将深入源码，剖析这一从“隐式 Group 绑定”到“显式 Device 挂载”的演进过程。

## 核心流程概述

IOMMUFD 的设备挂载流程不再是“一锤子买卖”，而是拆分为了两个正交的步骤，这种解耦为后续的灵活配置（如动态切换 IOAS、嵌套翻译）奠定了基础。

1.  **阶段一：Bind (`VFIO_DEVICE_BIND_IOMMUFD`)**
    *   **角色**：这是 VFIO 子系统与 IOMMUFD 子系统之间的握手协议。
    *   **动作**：将 VFIO 设备的 `fd` 与 IOMMUFD 的 `fd` 关联起来。
    *   **产物**：在 IOMMUFD 上下文中生成一个 **Device 对象**，并返回其 ID (`devid`)。
    *   **状态**：此时设备处于“浮空”状态，虽然已被 IOMMUFD 纳管，但尚未关联任何页表，因此无法进行 DMA（会被 IOMMU 拦截）。

2.  **阶段二：Attach (`VFIO_DEVICE_ATTACH_IOMMUFD_PT`)**
    *   **角色**：这是构建实际 I/O 拓扑的关键步骤。
    *   **动作**：将上述 `devid` 挂载到指定的页表对象 ID (`pt_id`) 上。这个 `pt_id` 可以是一个纯软件的 **IOAS ID**，也可以是一个具体的 **HWPT ID**。
    *   **内核检查**：内核在此处执行 Group 隔离性检查。它会确保属于同一个 IOMMU Group 的所有设备都必须绑定到同一个（或兼容的）IOAS/HWPT 上，否则拒绝 Attach。

## 逐层代码拆解

我们从 `hw/vfio/iommufd.c` 中的 `iommufd_cdev_attach` 函数入口开始，自顶向下进行分析。

```c
/* hw/vfio/iommufd.c - 基于 QEMU v10.0.3 */

static bool iommufd_cdev_attach(const char *name, VFIODevice *vbasedev,
                                AddressSpace *as, Error **errp)
{
    /* 1. 连接与 Bind 阶段 */
    if (!iommufd_cdev_connect_and_bind(vbasedev, errp)) {
        goto err_connect_bind;
    }

    /* 2. 寻找或创建容器并 Attach */
    QLIST_FOREACH(bcontainer, &space->containers, next) {
      if (!iommufd_cdev_attach_container(vbasedev, as, errp)) {
          ...
      }
    }
    return true;
}
```

### 1. 阶段一：Bind —— 身份注册

`iommufd_cdev_connect_and_bind` 函数负责完成第一阶段任务。

```c
/* backends/iommufd.c */
static bool iommufd_cdev_connect_and_bind(VFIODevice *vbasedev, Error **errp)
{
    IOMMUFDBackend *iommufd = vbasedev->iommufd;
    struct vfio_device_bind_iommufd bind = {
        .argsz = sizeof(bind),
        .flags = 0,
    };

    if (!iommufd_backend_connect(iommufd, errp)) {
        return false;
    }

    /*
     * Add device to kvm-vfio to be prepared for the tracking
     * in KVM. Especially for some emulated devices, it requires
     * to have kvm information in the device open.
     */
    if (!iommufd_cdev_kvm_device_add(vbasedev, errp)) {
        goto err_kvm_device_add;
    }

    /* Bind device to iommufd */
    bind.iommufd = iommufd->fd;
    if (ioctl(vbasedev->fd, VFIO_DEVICE_BIND_IOMMUFD, &bind)) {
        error_setg_errno(errp, errno, "error bind device fd=%d to iommufd=%d",
                         vbasedev->fd, bind.iommufd);
        goto err_bind;
    }

    vbasedev->devid = bind.out_devid;
    trace_iommufd_cdev_connect_and_bind(bind.iommufd, vbasedev->name,
                                        vbasedev->fd, vbasedev->devid);
    return true;
err_bind:
    iommufd_cdev_kvm_device_del(vbasedev);
err_kvm_device_add:
    iommufd_backend_disconnect(iommufd);
    return false;
}
```

**解析**：
*   这个 `ioctl` 是发送给 **Device FD** 的，而不是 IOMMUFD。这是 VFIO 驱动内部交接权力的过程。
*   成功执行后，内核 IOMMUFD 子系统内部会创建一个 `iommufd_device` 对象。

### 2. 阶段二：Attach —— 构建拓扑

回到 `iommufd_cdev_attach`，第二步是 `iommufd_cdev_attach_container`。这个函数体现了 QEMU 如何智能地管理地址空间复用。

```c
/* hw/vfio/iommufd.c */
static bool iommufd_cdev_attach_container(VFIODevice *vbasedev,
                                          VFIOIOMMUFDContainer *container,
                                          Error **errp)
{
    /* mdevs aren't physical devices and will fail with auto domains */
    if (!vbasedev->mdev) {
        return iommufd_cdev_autodomains_get(vbasedev, container, errp);
    }

    return !iommufd_cdev_attach_ioas_hwpt(vbasedev, container->ioas_id, errp);
}
```

#### 核心动作：`iommufd_cdev_attach_ioas_hwpt`

无论是复用还是新建，最终都调用此辅助函数，它封装了 `VFIO_DEVICE_ATTACH_IOMMUFD_PT` ioctl。

```c
/* hw/vfio/iommufd.c*/
static int iommufd_cdev_attach_ioas_hwpt(VFIODevice *vbasedev, uint32_t id,
                                         Error **errp)
{
    int iommufd = vbasedev->iommufd->fd;
    struct vfio_device_attach_iommufd_pt attach_data = {
        .argsz = sizeof(attach_data),
        .flags = 0,
        .pt_id = id,
    };

    /* Attach device to an IOAS or hwpt within iommufd */
    if (ioctl(vbasedev->fd, VFIO_DEVICE_ATTACH_IOMMUFD_PT, &attach_data)) {
        error_setg_errno(errp, errno,
                         "[iommufd=%d] error attach %s (%d) to id=%d",
                         iommufd, vbasedev->name, vbasedev->fd, id);
        return -errno;
    }

    trace_iommufd_cdev_attach_ioas_hwpt(iommufd, vbasedev->name,
                                        vbasedev->fd, id);
    return 0;
}
```

### 3. 内核视角的 Group 检查

虽然 QEMU 代码中没有显式的 Group 操作，但在 `ioctl(VFIO_DEVICE_ATTACH_IOMMUFD_PT)` 内部，Linux 内核 (`drivers/iommu/iommufd/device.c`) 依然坚守着安全底线：

1.  **获取 Group**：内核通过 `dev_id` 找到对应的物理设备和其所属的 IOMMU Group。
2.  **一致性检查**：
    *   如果该 Group 是第一次被 Attach，内核记录该 Group 绑定的 `pt_id`。
    *   如果该 Group 中已经有其他设备 Attach 了，内核检查新的 `pt_id` 是否与已有的 `pt_id` 一致（或者兼容）。
    *   **如果不一致**，内核直接返回错误。
3.  **隐式安全性**：这意味着，如果用户试图在 QEMU 中将同一个 Group 的两个设备分别直通给两个不同的虚拟机（即 Attach 到不同的 IOAS），这个操作会在 Attach 阶段被内核拦截并失败。

## 总结

`iommufd_cdev_attach` 的流程完美诠释了 IOMMUFD 的设计哲学：

1.  **显式优于隐式**：代码逻辑非常线性——先注册身份 (`Bind`)，再挂载页表 (`Attach`)。不再有 Legacy 模式下 `vfio_connect_container` 中那种“试探性”的复杂逻辑。
2.  **ID 驱动**：所有的交互都围绕 `devid` 和 `ioas_id` 展开，这使得资源追踪（Trace）和错误排查变得异常简单。如果 Attach 失败，只需要看 log 里的 ID 对不对，而不需要去猜 Group 和 Container 的绑定关系。
3.  **弹性拓扑**：QEMU 的 `attach_container` 逻辑展示了天然的弹性。它默认尝试共享 IOAS（复用 Container），如果内核拒绝（硬件不兼容），它就自动退化为创建独立的 IOAS。这种逻辑在处理异构硬件混插场景时显得尤为优雅。

至此，设备已经成功挂载到了 IOMMUFD 的地址空间中。下一步，QEMU 的内存监听器（MemoryListener）将开始工作，向这个 IOAS 中填充实际的内存映射（DMA Map）。

## 关于作者

大家好，我是宝爷，浙大本科、前华为工程师、现某芯片公司系统架构负责人，关注个人成长。

新的图解文章都在公众号「宝爷说」首发，别忘记关注了哦！

感谢你读到这里。

如果这篇文章对您有所帮助，欢迎点赞、分享或收藏！你的支持是我创作的动力！

如果您不想错过未来的更新，记得点个星标 ⭐，下次我更新你就能第一时间收到推送啦。