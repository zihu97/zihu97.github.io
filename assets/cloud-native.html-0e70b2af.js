import{_ as i,W as p,X as t,Z as e,$ as a,a0 as n,a2 as d,C as o}from"./framework-3a0c4e99.js";const l="/images/cloud-native/image.png",s="/images/cloud-native/image-1.png",c="/images/cloud-native/image-2.png",h="/images/cloud-native/image-3.png",g="/images/cloud-native/image-4.png",u="/images/cloud-native/image-5.png",m="/images/cloud-native/image-6.png",_={},b=e("h1",{id:"cncf-alibaba-云原生技术公开课总结",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#cncf-alibaba-云原生技术公开课总结","aria-hidden":"true"},"#"),a(" CNCF Alibaba 云原生技术公开课总结")],-1),x={href:"https://developer.aliyun.com/learning/roadmap/cloudnative",target:"_blank",rel:"noopener noreferrer"},f=d('<h2 id="q1-2019年-阿里巴巴宣布要全面上云-而且-上云就要上云原生-为什么要全面上云" tabindex="-1"><a class="header-anchor" href="#q1-2019年-阿里巴巴宣布要全面上云-而且-上云就要上云原生-为什么要全面上云" aria-hidden="true">#</a> Q1:2019年，阿里巴巴宣布要全面上云，而且“上云就要上云原生”，为什么要全面上云？<a id="Q1"></a></h2><p>以往发布或者更新软件，需要SSH连到服务器，然后手动升级或降级软件包，调整配置文件；上云后，更新只要更改公共镜像来构建新服务直接替换旧服务，且可以更好地扩容</p><h2 id="q2-云原生到底是什么" tabindex="-1"><a class="header-anchor" href="#q2-云原生到底是什么" aria-hidden="true">#</a> Q2:云原生到底是什么？<a id="Q2"></a></h2><p>云原生为用户指定了一条低心智负担的、敏捷的、能够以可扩展、可复制的方式最大化地利用云的能力、发挥云的价值的最佳路径。</p><h2 id="q3-云原生包含了什么" tabindex="-1"><a class="header-anchor" href="#q3-云原生包含了什么" aria-hidden="true">#</a> Q3:云原生包含了什么？<a id="Q3"></a></h2><p>1）云应用定义与开发流程</p><p>应用定义与<a href="#Q5">镜像</a>制作、配置 CI/CD、消息和 Streaming 以及数据库等。</p><p>2）云应用的编排与管理流程</p><p>应用编排与调度、服务发现治理、远程调用、API 网关以及 Service Mesh。</p><p>3）监控与可观测性</p><p>对云上应用进行监控、日志收集、Tracing 以及实现破坏性测试，也就是混沌工程的概念。</p><p>4）云原生的底层技术</p><p>容器运行时、云原生存储技术、云原生网络技术等。</p><p>5）云原生工具集</p><p>配套的生态或者周边的工具，比如流程自动化与配置管理、容器镜像仓库、云原生安全技术以及云端密码管理等。</p><p>6）Serverless</p><p>Serverless 是一种 PaaS 的特殊形态，它定义了一种更为“极端抽象”的应用编写方式，包含了 FaaS 和 BaaS 这样的概念。而无论是 FaaS 还是 BaaS，其最为典型的特点就是按实际使用计费（Pay as you go）。</p><h2 id="q4-云原生应用的基础———容器" tabindex="-1"><a class="header-anchor" href="#q4-云原生应用的基础———容器" aria-hidden="true">#</a> Q4:云原生应用的基础———容器？<a id="Q4"></a></h2><p>容器就是一个视图隔离、资源可限制、独立文件系统的进程集合。</p><p>1）独立文件系统</p><p>通过 chroot 系统调用将子目录变成根目录，使得进程具有独立的文件系统</p><p>2）视图隔离</p><p>通过Namespace 技术实现进程资源隔离</p><p>3）资源可限制</p><p>通过 Cgroup来设置其能够使用的 CPU 以及内存量</p><h2 id="q5-容器镜像是什么" tabindex="-1"><a class="header-anchor" href="#q5-容器镜像是什么" aria-hidden="true">#</a> Q5:容器镜像是什么？<a id="Q5"></a></h2><p>容器运行时所需要的所有的文件集合称之为容器镜像。</p><h2 id="q6-changeset是什么-有什么优势" tabindex="-1"><a class="header-anchor" href="#q6-changeset是什么-有什么优势" aria-hidden="true">#</a> Q6:changeset是什么？有什么优势？<a id="Q6"></a></h2><p>采用 Dockerfile 来构建镜像，可以很好地描述构建的每个步骤。每个构建步骤都会对已有的文件系统进行操作，这样就会带来文件系统内容的变化，我们将这些变化称之为 changeset。当我们把构建步骤所产生的变化依次作用到一个空文件夹上，就能够得到一个完整的镜像。</p><p>优势：</p><p>1）提高分发效率 大镜像拆分成各个小块就可以并行下载</p><p>2）数据共享 golang镜像基于alpine镜像构建，当本地已经具有了 alpine 镜像之后，在下载 golang 镜像的时候只需要下载本地 alpine 镜像中没有的部分即可</p><p>3）节约磁盘空间 本地存储alpine镜像和golang镜像时，磁盘只要占用golang镜像的空间即可</p><h2 id="q7-容器的生命周期是多久" tabindex="-1"><a class="header-anchor" href="#q7-容器的生命周期是多久" aria-hidden="true">#</a> Q7:容器的生命周期是多久？<a id="Q7"></a></h2><p>使用 docker run 的时候会选择一个镜像来提供独立的文件系统并指定相应的运行程序。这里指定的运行程序称之为 initial 进程。容器的生命周期和 initial 进程的生命周期是一致的。initial 进程本身也可以产生其他的子进程或者通过 docker exec 产生出来的运维操作，也属于 initial 进程管理的范围内。</p><h2 id="q8-kubernetes有哪些功能" tabindex="-1"><a class="header-anchor" href="#q8-kubernetes有哪些功能" aria-hidden="true">#</a> Q8:Kubernetes有哪些功能？<a id="Q8"></a></h2><p>1）服务的发现与负载的均衡</p><p>2）容器的调度 <img src="'+l+'" alt="alt text" loading="lazy"></p><p>3）自动化的容器的恢复 <img src="'+s+'" alt="alt text" loading="lazy"><img src="'+c+'" alt="alt text" loading="lazy"></p><p>4）应用的自动发布与应用的回滚，以及与应用相关的配置密文的管理</p><p>5）批量的执行job</p><p>6）支持水平的伸缩 <img src="'+h+'" alt="alt text" loading="lazy"><img src="'+g+'" alt="alt text" loading="lazy"></p><h2 id="q9-k8s的架构" tabindex="-1"><a class="header-anchor" href="#q9-k8s的架构" aria-hidden="true">#</a> Q9:K8s的架构？<a id="Q9"></a></h2><p>Kubernetes 架构是一个比较典型的二层架构和 server-client 架构。Master 作为中央的管控节点，会去与 Node 进行一个连接。 <img src="'+u+'" alt="alt text" loading="lazy"></p><p>1）API Server</p><p>顾名思义是用来处理 API 操作的，Kubernetes 中所有的组件都会和 API Server 进行连接，组件与组件之间一般不进行独立的连接，都依赖于 API Server 进行消息的传送；</p><p>2）Controller</p><p>是控制器，它用来完成对集群状态的一些管理。比如刚刚我们提到的两个例子之中，第一个自动对容器进行修复、第二个自动进行水平扩张，都是由 Kubernetes 中的 Controller 来进行完成的；</p><p>3）Scheduler</p><p>是调度器，“调度器”顾名思义就是完成调度的操作，就是我们刚才介绍的第一个例子中，把一个用户提交的 Container，依据它对 CPU、对 memory 请求大小，找一台合适的节点，进行放置；</p><p>4）etcd</p><p>是一个分布式的一个存储系统，API Server 中所需要的这些原信息都被放置在 etcd 中，etcd 本身是一个高可用系统，通过 etcd 保证整个 Kubernetes 的 Master 组件的高可用性。</p><p>5）Node Node 是真正运行业务负载的，每个业务负载会以 Pod 的形式运行。 <img src="'+m+'" alt="alt text" loading="lazy"></p><p>5-1）kubelet</p><p>通过 API Server 接收到所需要 <a href="#Pod">Pod</a> 运行的状态，然后提交到Container Runtime 中</p><p>5-2）CSI和CNI</p><p>用户自己或者云厂商都会去写相应的 Storage Plugin 或者 Network Plugin，去完成存储操作或网络操作。</p><p>5-3）Kube-proxy</p><p>利用了 iptable 的能力来进行组建 Kubernetes 的 Network，就是 cluster network。</p><h2 id="q10-k8s的核心概念" tabindex="-1"><a class="header-anchor" href="#q10-k8s的核心概念" aria-hidden="true">#</a> Q10:K8s的核心概念？<a id="Q10"></a></h2><p>1）Pod <a id="Pod"></a></p><p>Pod 是 Kubernetes 的一个最小调度以及资源单元，包含一个或多个容器。</p><p>2）Volume</p><p>数据卷，可以支持本地存储/分布式的存储(ceph，GlusterFS等) /云存储(阿里云上的云盘、AWS 上的云盘、Google 上的云盘等)</p><p>3）Deployment</p><p>可以定义一组 Pod 的副本数目、以及这个 Pod 的版本。</p><p>4）Service</p><p>Service 提供了一个或者多个 Pod 实例的稳定访问地址。 支持多种访问方式实现</p><ul><li>Cluster IP</li><li>nodePort</li><li>LoadBalancer</li></ul><p>5）Namespace</p><p>Namespace 是用来做一个集群内部的逻辑隔离的，它包括鉴权、资源管理等。</p><h2 id="q11-k8s的api" tabindex="-1"><a class="header-anchor" href="#q11-k8s的api" aria-hidden="true">#</a> Q11:K8s的API？<a id="Q10"></a></h2>',72);function v(P,S){const r=o("ExternalLinkIcon");return p(),t("div",null,[b,e("p",null,[a("课程"),e("a",x,[a("CNCF Alibaba 云原生技术公开课"),n(r)])]),f])}const q=i(_,[["render",v],["__file","cloud-native.html.vue"]]);export{q as default};
