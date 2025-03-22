---
date: 2024-12-08
article: true
category:
  - tech
tag:
  - container
  - 云原生
---

# CNCF Alibaba 云原生技术公开课总结

课程[CNCF Alibaba 云原生技术公开课](https://developer.aliyun.com/learning/roadmap/cloudnative)

## Q1:2019年，阿里巴巴宣布要全面上云，而且“上云就要上云原生”，为什么要全面上云？<a id="Q1"></a>

以往发布或者更新软件，需要SSH连到服务器，然后手动升级或降级软件包，调整配置文件；上云后，更新只要更改公共镜像来构建新服务直接替换旧服务，且可以更好地扩容

## Q2:云原生到底是什么？<a id="Q2"></a>

云原生为用户指定了一条低心智负担的、敏捷的、能够以可扩展、可复制的方式最大化地利用云的能力、发挥云的价值的最佳路径。

## Q3:云原生包含了什么？<a id="Q3"></a>

1）云应用定义与开发流程

应用定义与[镜像](#Q5)制作、配置 CI/CD、消息和 Streaming 以及数据库等。

2）云应用的编排与管理流程

应用编排与调度、服务发现治理、远程调用、API 网关以及 Service Mesh。

3）监控与可观测性

对云上应用进行监控、日志收集、Tracing 以及实现破坏性测试，也就是混沌工程的概念。

4）云原生的底层技术

容器运行时、云原生存储技术、云原生网络技术等。

5）云原生工具集

配套的生态或者周边的工具，比如流程自动化与配置管理、容器镜像仓库、云原生安全技术以及云端密码管理等。

6）Serverless

Serverless 是一种 PaaS 的特殊形态，它定义了一种更为“极端抽象”的应用编写方式，包含了 FaaS 和 BaaS 这样的概念。而无论是 FaaS 还是 BaaS，其最为典型的特点就是按实际使用计费（Pay as you go）。

## Q4:云原生应用的基础———容器？<a id="Q4"></a>

容器就是一个视图隔离、资源可限制、独立文件系统的进程集合。

1）独立文件系统

通过 chroot 系统调用将子目录变成根目录，使得进程具有独立的文件系统

2）视图隔离

通过Namespace 技术实现进程资源隔离

3）资源可限制

通过 Cgroup来设置其能够使用的 CPU 以及内存量

## Q5:容器镜像是什么？<a id="Q5"></a>

容器运行时所需要的所有的文件集合称之为容器镜像。

## Q6:changeset是什么？有什么优势？<a id="Q6"></a>

采用 Dockerfile 来构建镜像，可以很好地描述构建的每个步骤。每个构建步骤都会对已有的文件系统进行操作，这样就会带来文件系统内容的变化，我们将这些变化称之为 changeset。当我们把构建步骤所产生的变化依次作用到一个空文件夹上，就能够得到一个完整的镜像。

优势：

1）提高分发效率
大镜像拆分成各个小块就可以并行下载

2）数据共享
golang镜像基于alpine镜像构建，当本地已经具有了 alpine 镜像之后，在下载 golang 镜像的时候只需要下载本地 alpine 镜像中没有的部分即可

3）节约磁盘空间
本地存储alpine镜像和golang镜像时，磁盘只要占用golang镜像的空间即可

## Q7:容器的生命周期是多久？<a id="Q7"></a>

使用 docker run 的时候会选择一个镜像来提供独立的文件系统并指定相应的运行程序。这里指定的运行程序称之为 initial 进程。容器的生命周期和 initial 进程的生命周期是一致的。initial 进程本身也可以产生其他的子进程或者通过 docker exec 产生出来的运维操作，也属于 initial 进程管理的范围内。

## Q8:Kubernetes有哪些功能？<a id="Q8"></a>

1）服务的发现与负载的均衡

2）容器的调度
![alt text](/images/cloud-native/image.png)

3）自动化的容器的恢复
![alt text](/images/cloud-native/image-1.png)
![alt text](/images/cloud-native/image-2.png)

4）应用的自动发布与应用的回滚，以及与应用相关的配置密文的管理

5）批量的执行job

6）支持水平的伸缩
![alt text](/images/cloud-native/image-3.png)
![alt text](/images/cloud-native/image-4.png)

## Q9:K8s的架构？<a id="Q9"></a>

Kubernetes 架构是一个比较典型的二层架构和 server-client 架构。Master 作为中央的管控节点，会去与 Node 进行一个连接。
![alt text](/images/cloud-native/image-5.png)

1）API Server

顾名思义是用来处理 API 操作的，Kubernetes 中所有的组件都会和 API Server 进行连接，组件与组件之间一般不进行独立的连接，都依赖于 API Server 进行消息的传送；

2）Controller

是控制器，它用来完成对集群状态的一些管理。比如刚刚我们提到的两个例子之中，第一个自动对容器进行修复、第二个自动进行水平扩张，都是由 Kubernetes 中的 Controller 来进行完成的；

3）Scheduler

是调度器，“调度器”顾名思义就是完成调度的操作，就是我们刚才介绍的第一个例子中，把一个用户提交的 Container，依据它对 CPU、对 memory 请求大小，找一台合适的节点，进行放置；

4）etcd

是一个分布式的一个存储系统，API Server 中所需要的这些原信息都被放置在 etcd 中，etcd 本身是一个高可用系统，通过 etcd 保证整个 Kubernetes 的 Master 组件的高可用性。

5）Node
Node 是真正运行业务负载的，每个业务负载会以 Pod 的形式运行。
![alt text](/images/cloud-native/image-6.png)

5-1）kubelet

通过 API Server 接收到所需要 [Pod](#Pod) 运行的状态，然后提交到Container Runtime 中

5-2）CSI和CNI

用户自己或者云厂商都会去写相应的 Storage Plugin 或者 Network Plugin，去完成存储操作或网络操作。

5-3）Kube-proxy

利用了 iptable 的能力来进行组建 Kubernetes 的 Network，就是 cluster network。

## Q10:K8s的核心概念？<a id="Q10"></a>

1）Pod <a id="Pod"></a>

Pod 是 Kubernetes 的一个最小调度以及资源单元，包含一个或多个容器。

2）Volume

数据卷，可以支持本地存储/分布式的存储(ceph，GlusterFS等) /云存储(阿里云上的云盘、AWS 上的云盘、Google 上的云盘等)

3）Deployment

可以定义一组 Pod 的副本数目、以及这个 Pod 的版本。

4）Service

Service 提供了一个或者多个 Pod 实例的稳定访问地址。
支持多种访问方式实现

- Cluster IP
- nodePort
- LoadBalancer

5）Namespace

Namespace 是用来做一个集群内部的逻辑隔离的，它包括鉴权、资源管理等。

## Q11:K8s的API？<a id="Q10"></a>