---
title: 推荐系列-比心云平台基于阿里云容器服务 ACK 的弹性架构实践
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 299
cover_picture: 'https://api.ixiaowai.cn/gqapi/gqapi.php'
abbrlink: d3c50357
date: 2022-05-11 05:14:30
---

&emsp;&emsp;：韩韬｜比心技术 前言 应用容器化改造后，不可避免地会面临这样一个问题：Kubernetes 集群的 Node 资源配置不足会导致 Pod 无法及时运行，购买过多的 Node 又会导致资源的闲置浪费。 那...
<!-- more -->

                                                                                                                                                                                        作者：韩韬｜比心技术 
#### 前言 
应用容器化改造后，不可避免地会面临这样一个问题：Kubernetes 集群的 Node 资源配置不足会导致 Pod 无法及时运行，购买过多的 Node 又会导致资源的闲置浪费。  
那么如何利用 Kubernetes 的容器编排能力和云上资源的灵活性及规模化优势，来保证业务的高弹性、低成本？  
本文主要探讨比心云平台如何利用阿里云容器服务 ACK，来构建应用弹性架构，进一步优化计算成本。  
注意：文中的「Node」等同于节点。集群中的Node和集群中的节点，是一个意思。 
#### 弹性伸缩概述 
弹性伸缩是根据业务需求和策略，经济地自动调整弹性计算资源的管理服务。  
弹性伸缩可以分为两个维度：  
 
  调度层弹性，主要负责修改 Workload（ 例如 Deployment ） 的调度容量变化。例如，HPA 是典型的调度层弹性组件，通过 HPA 可以调整应用的副本数，调整的副本数会改变当前 Workload 占用的调度容量，从而实现调度层的伸缩。  
  资源层弹性，主要是集群的容量规划不能满足集群调度容量时，会通过水平弹出 Node 的方式进行调度容量��补��。  
 
两层的弹性组件与能力可以分开使用，也可以结合在一起使用，并且两者之间是通过调度层面的容量状态进行解耦。  
Kubernetes 中共有三种不同的弹性伸缩策略：HPA（HorizontalPodAutoscaling）、 VPA（VerticalPodAutoscaling）与 CA（ClusterAutoscaler）。其中，HPA 和 VPA 的扩缩容对象是 Pod ，而 CA 的扩缩容对象是 Node 。 
 
  HPA：调度层弹性组件，Kubernetes 内置，Pod 水平伸缩组件，主要面向在线业务。  
  VPA：调度层弹性组件，Kubernetes 社区开源，Pod 垂直伸缩组件，主要面向大型单体应用。适用于无法水平扩展的应用，通常是在 Pod 出现异常恢复时生效。  
  CA：资源层弹性组件，Kubernetes 社区开源，Node 水平伸缩组件。全场景适用。  
 
另外各大云厂商（例如阿里云等）还提供了 Virtual Node 组件，提供无服务器运行时环境。用户无需关心 Node 资源，只需针对 Pod 按量付费即可。适用于在线流量突增、CI/CD、大数据作业等场景。本文在介绍 Virtual Node 时会以阿里云为例。 
#### Pod 水平伸缩 HPA 
HPA（Horizontal Pod Autoscaler）是 Kubernetes 的内置组件，也是最常用的 Pod 弹性方案。通过 HPA 可以自动调整 Workload 的副本数。HPA 自动伸缩特性使 Kubernetes 具有非常灵活的自适应能力，能够在用户设定内快速扩容多个 Pod 副本来应对业务负载的急剧飙升，也可以在业务负载变小的情况下根据实际情况适当缩容来节省计算资源给其他的服务，整个过程自动化无需人为干预，适合服务波动较大、服务数量多且需要频繁扩缩容的业务场景。  
HPA 适用于 Deployment、StatefulSet 等实现 scale 接口的对象，不适用于无法扩缩的对象，例如 DaemonSet 资源。Kubernetes 内置有 HorizontalPodAutoscaler 资源，通常是对需要配置水平自动伸缩的 Workload 创建一个 HorizontalPodAutoscaler 资源，Workload 与 HorizontalPodAutoscaler 相对应 。 
##### HPA 扩缩容流程 
Pod 水平自动扩缩特性由 Kubernetes API 资源和控制器实现。资源利用指标决定控制器的行为，控制器会周期性的根据 Pod 资源利用情况调整服务 Pod 的副本数量，以使得工作负载的度量水平与用户所设定的目标值匹配。以 Deployment 和 CPU 使用率为例，其扩缩容流程如下图所示： 
 
默认 HPA 只支持基于 CPU 和内存的自动伸缩，例如当 CPU 使用率超过阈值时就自动增加应用实例数，当 CPU 使用率又低于阈值时就自动减少实例数。  
但是默认 HPA 驱动弹性的维度比较单一，并不能满足日常的运维需求。可以将 HPA 和开源的 Keda 结合使用，Keda 可以���事件、定时、自定义指标等维度来驱动弹性。 
##### HPA 注意事项 
 
 如果设置了多个弹性伸缩指标，HPA 会依据各个指标，分别计算出目标副本数，取最大值进行扩缩容操作。 
 当指标类型选择为 CPU 利用率（占 Request）时，必须为容器设置 CPU Request。 
 HPA 在计算目标副本数时会有一个 10% 的波动因子。如果在波动范围内，HPA 并不会调整副本数目。 
 如果服务对应的 Deployment.spec.replicas 值为 0，HPA 将不起作用。 
 如果对单个 Deployment 同时绑定多个 HPA ，则创建的 HPA 会同时生效，会造成工作负载的副本重复扩缩。 
 
#### Pod 垂直伸缩 VPA 
VPA（VerticalPodAutoscaling） 是社区开源组件，需要在 Kubernetes 集群上手动部署安装，VPA 提供垂直的 Pod 伸缩的功能。  
VPA 会基于 Pod 的资源使用情况自动为 Pod 设置资源占用的限制，从而让集群将 Pod 调度到有足够资源的最佳节点上。VPA 也会保持最初容器定义中资源 request 和 limit 的占比。此外，VPA 可用于向用户推荐更合理的 Request，在保证容器有足够使用的资源的情况下，提升容器的资源利用率。 
##### VPA 优势  
相较于 HPA，VPA 具有以下优势： 
 
 VPA 可为有状态应用实现扩容，HPA 则不适合有状态应用的水平扩容。 
 有些应用 Request 设置过大，缩容至一个 Pod 时资源利用率仍然很低，此时可以通过 VPA 进行垂直缩容以提高资源利用率。 
 
##### VPA 限制 
使用 VPA 有以下限制和注意事项： 
 
 更新正在运行的 Pod 资源配置是 VPA 的一项试验性功能，会导致 Pod 的重建和重启，而且有可能被调度到其他的 Node 上。 
 VPA 不会驱逐没有在副本控制器管理下的 Pod。目前对于这类 Pod，Auto 模式等同于 Initial 模式。 
 目前 VPA 不能和监控 CPU 和内存度量的 HPA 同时运行，除非 HPA 只监控除 CPU 和内存以外的指标。 
 VPA 使用 admission webhook 作为其准入控制器。如果集群中有其他的 admission webhook，需要确保它们不会与 VPA 发生冲突。准入控制器的执行顺序定义在 API Server 的配置参数中。 
 VPA 会处理出现的绝大多数 OOM 的事件，但不保证所有的场景下都有效。 
 VPA 的性能还没有在大型集群中测试过。 
 VPA 对 Pod 资源 requests 的修改值可能超过实际的资源上限，例如 Node 资源上限、空闲资源或资源配额，从而造成 Pod 处于 Pending 状态无法被调度。同时使用集群自动伸缩（ ClusterAutoscaler ）可以一定程度上解决这个问题。 
 多个 VPA 同时匹配同一个 Pod 会造成未定义的行为。 
 
#### Node 水平伸缩 CA 
HPA 和 VPA 都是调度层的弹性，解决了 Pod 的弹性伸缩。如果集群整体的资源容量不能满足集群调度容量时，HPA 和 VPA 弹出的 Pod 还是会处于 Pending 状态。这时就需要资源层的弹性伸缩。 
在 Kubernetes 中，Node 自动水平伸缩是通过社区开源的 CA（ClusterAutoscaler） 组件实现的。社区 CA 支持设置多个伸缩组，支持设置扩容和缩容策略。各大云厂商在社区 CA 的基础上会加入一些特有的功能，例如支持多可用区、多实例规格、多种伸缩模式等，满足不同的 Node 伸缩场景。  
在 Kubernetes 中，Node 自动伸缩的工作原理与传统意义上基于使用率阈值的模型有所差别。 
##### 传统弹性伸缩模型 
传统的弹性伸缩模型是基于使用率的，例如：一个集群中有 3 个 Node ，当集群中 Node 的 CPU、内存使用率超过特定的阈值时，就弹出新 Node 。但当深入思考时会发现以下几个问题： 
 
 Node 资源使用率阈值是怎么选择与判断的？ 
 
在一个集群中，部分热点节点的利用率会较高，而另外一个节点的利用率会很低。如果选择平均利用率，可能会造成弹性伸缩不及时。如果使用最低的节点的利用率，也会造成弹出资源的浪费。 
 
 弹出 Node 后是怎么缓解压力的？ 
 
在 Kubernetes 中，应用是以 Pod 为最小单元。当一个 Pod 资源利用率较高的时候，即便此时所在的 Node 或者集群的总量触发了弹性扩容，但是该应用的 Pod 数目，以及 Pod 对应的资源 Limit 没有任何变化，那么负载的压力是无法转移到新扩容出的 Node 上的。  
 
 怎么判断以及执行 Node 的缩容？ 
 
如果基于资源使用用率的方式判断 Node 是否缩容，那么很有可能出现，Request 很大，但是 Usage 很小的 Pod 被驱逐，当集群中这种类型的 Pod 较多时，会导致集群的调度资源被占满，部分 Pod 无法调度。 
##### Kubernetes 节点伸缩模型 
Kubernetes 节点伸缩是怎么解决以上问题的呢？Kubernetes 是通过调度与资源解耦的两层弹性模型来解决的。  
基于资源的使用率来触发应用副本的变化，也就是调度单元（ Pod ）的变化。而当集群的调度水位达到 100% 的时候会触发资源层的弹性扩容，当 Node 资源弹出后，无法调度的 Pod 会自动调度到新弹出的 Node 上，从而降低整个应用的负载状况。 
 
 
 如何判断 Node 的弹出？ 
 
CA 是通过对处在 Pending 状态的 Pod 进行监听而触发的。当 Pod 处在 Pending 的原因是调度资源不足的时候，会触发 CA 的模拟调度，模拟调度器会计算在配置的伸缩组中哪个伸缩组弹出 Node 后可以调度这些 Pending 的 Pod。如果有伸缩组可以满足，那么就弹出相应的 Node 。  
模拟调度就是将一个伸缩组当成一个抽象的 Node，伸缩组中配置的机型规格对应会成为 Node 的 CPU/内存 的容量，然后设置伸缩组上面的 Label、Taint，也就是 Node 的 Label 与 Taint 。模拟调度器会在调度模拟的时候，将该抽象的 Node 纳入调度参考。如果 Pending 的 Pod 可以调度到抽象的 Node ，那么就会计算所需的 Node 的数目，驱动伸缩组弹出 Node 。  
 
 如何判断 Node 的缩容？ 
 
首先只有弹性伸缩弹出的 Node 会被缩容，静态的 Node 是无法被 CA 接管的。缩容的判断是对每个 Node 单独判断的。当任意一个 Node 的调度利用率低于所设置的调度阈值时，会触发 Node 的缩容判断。此时 CA 会尝试模拟驱逐 Node 上面的 Pod，判断当前 Node 是否可以排水彻底。如果有特殊的 Pod（ kube-system 命名空间的非 DaemonSet Pod、PDB 控制的 Pod、非 Controller 创建的 Pod 等 ），则会跳过该 Node 而选择其他的候选 Node 。当 Node 发生驱逐时，会先进行排水，将 Node 上的 Pod 驱逐到其他的 Node ，然后再下线该 Node 。 
 
 Node 扩容时在多个伸缩组之间如何选择？ 
 
不同伸缩组之间，实际上相当于不同的虚拟的 Node 之间的选择，和调度策略一样，这里也存在一个打分的机制。首先符合调度策略的 Node 会先过滤出来，在符合调度策略的 Node 中，会根据 affinity 等亲和性的策略进行选择。如果上述的策略都不存在，默认情况下 CA 会通过 least-waste 的策略来进行抉择。least-waste 策略的核心就是模拟弹出 Node 后，剩余的资源最少，尽可能地减少浪费。此外，有一个特别的场景，当有一个 GPU 的伸缩组和 CPU 的伸缩组同时可以弹出生效时，默认 CPU 会优先于 GPU 弹出。 
##### CA 限制 
使用 CA 有以下限制和注意事项： 
 
 可扩容 Node 数量受私有网络 、容器网络、云商 Kubernetes 集群节点配额及可购买云服务器配额限制。 
 扩容 Node 受机型当前售卖情况限制。若机型出现售罄，将无法扩容节点。 
 Node 从触发扩容到交付使用，等待时间比较长，对于需要快速启动 Pod 的场景不适用。 
 Node 缩容时，如果 Node 上有 Pod 无法驱逐，该 Node 将无法下线，造成资源浪费。 
 
#### Virtual Node 
Virtual Node（虚拟节点）是各大云厂商基于社区开源项目 Virtual Kubelet而开发的插件，作为一种虚拟的 Kubelet 用来连接 Kubernetes 集群和其他平台的 API。Virtual Kubelet 的主要场景是将 Kubernetes API 扩展到无服务器的容器平台。  
通过虚拟节点，Kubernetes 集群可以轻松获得极大的弹性能力，而不必受限于集群的节点计算容量。用户也可以灵活动态地按需创建 Pod，免去集群容量规划的麻烦。 
##### Virtual Kubelet简介 
在 Kubernetes 集群中每个节点都会启动一个 Kubelet 进程，可以把 Kubelet 理解成 Server-Agent 架构中的 Agent。  
Virtual Kubelet 是基于 Kubelet 的典型特性实现，向上伪装成 Kubelet，从而模拟出 Node 对象，对接 Kubernetes 的原生资源对象；向下提供 API，可对接其他资源管理平台提供的 Provider。不同的平台通过实现 Virtual Kubelet 定义的方法，允许 Node 由其对应的 Provider 提供支持，实现 Serverless，也可以通过 Provider 纳管其他 Kubernetes 集群。  
Virtual Kubelet 模拟了 Node 资源对象，并负责对 Pod 调度到 Virtual Kubelet 伪装的虚拟节点之后，对 Pod 进行生命周期管理。  
从 Kubernetes API Server 的角度来看，Virtual Kubelet 看起来像普通的 Kubelet，但其关键区别在于 Virtual Kubelet 在其他地方调度 Pod ，例如在云无服务器 API 中，而不是在真实 Node 上。  
Virutal Kubelet 的架构如下图：  
 
##### 阿里云 ECI 弹性调度  
各大云厂商基本上都提供了无服务器容器服务和 Kubernetes Virtual Node 的能力，本文以阿里云为例，介绍下阿里云基于 Virtual Node 和 ECI 的弹性调度。  
###### 阿里云 ECI 和 Virtual Node 简介  
弹性容器实例（ Elastic Container Instance ，简称 ECI ） 是阿里云结合容器和 Serverless 技术提供的容器运行服务。通过容器服务 ACK 来使用 ECI ，能够充分发挥ECI的优势，使得在阿里云上部署容器时，无需购买和管理云服务器 ECS，可以直接在阿里云上运行 Pod 和容器。从购买配置 ECS 再部署容器（ ECS 模式 ）到直接部署容器（ ECI 模式 ），ECI 省去了底层服务器的运维和管理工作，并且仅需要为容器配置的资源付费（ 按量按秒计费 ），可以节约成本。  
 
阿里云 Kubernetes Virtual Node 是通过 ack-virtual-node 组件实现，ack-virtual-node 组件是基于社区开源项目 Virtual Kubelet，扩展了对 Aliyun Provider 的支持，并做了大量优化，实现 Kubernetes 与弹性容器实例 ECI 的无缝连接。  
有了虚拟节点后，当 Kubernetes 集群 Node 资源不足时，无需规划 Node 的计算容量，可以直接在虚拟节点下按需创建 Pod ，每个 Pod 对应一个 ECI 实例 ，ECI 与集群中真实 Node 上的 Pod 之间网络互通。  
 
虚拟节点非常适合运行在如下多个场景，极大降低计算成本，提升计算弹性效率： 
 
  使用 ECI 作为弹性资源池，应对突发流量。 
 在线业务有比较明显的波峰波谷特征，使用虚拟节点可以显著减少固定资源池的维护，降低计算成本。 
 计算类的离线任务，例如机器学习��对实时性要求不高，但是对成本敏感的业务应用。 
 CI/CD Pipeline ，例如 Jenkins、Gitlab-Runner 。 
 Job 任务，定时任务。 
 
虚拟节点和 ECI 就像是 Kubernetes 集群的 “魔法口袋” ，让我们摆脱 Node 计算力不足的烦扰，也避免了 Node 的闲置浪费，满足无限计算力的想象，Pod 按需创建，轻松应对计算的波峰波谷。 
###### 调度 Pod 到 ECI  
在混合使用 ECI 和普通 Node 的模式下，一般可以通过以下三种方式将 Pod 调度到 ECI ：  
（1）配置 Pod Label  
如果有个别 Pod 需要调度到 ECI 上运行，可以直接为 Pod 添加特定的 Label （alibabacloud.com/eci=true ），则该 Pod 将运行在虚拟节点的 ECI 实例上。  
（2）配置 Namespace Label  
如果有一类 Pod 要调度到 ECI 上运行，可创建一个 Namespace ，并对该 Namespace 添加特定 Label （alibabacloud.com/eci=true ），则该 Namespace 下的所有 Pod 将运行在虚拟节点的 ECI 实例上。 
（3）配置 ECI 弹性调度  
ECI 弹性调度是阿里云提供的一种弹性调度策略，在部署服务时，可以在 Pod Template 中添加 Annotations 来声明只使用普通 Node 的资源或者虚拟节点的 ECI 资源，或者在普通 Node 的资源不足时自动使用 ECI 资源，以满足不同场景下对弹性资源的不同需求。  
对应的 Annotations 配置项为 alibabacloud.com/burst-resource  ，取值如下： 
 
 默认不填 Annotations 时，只使用集群现有的 ECS 资源。 
 eci ：当前集群 ECS 资源不足时，使用 ECI 弹性资源。 
 eci_only ：只使用 ECI 弹性资源，不使用集群的 ECS 资源。 
 
上述三种方式均需要对存量资源做一定的修改，无法做到零侵入。对于这种情况，ECI 支持通过配置 ECI Profile 来解决。  
在 ECI Profile 中，可以声明需要匹配的 Namespace 或者 Pod 的 Label ，对于 Label 能够匹配上的 Pod ，将被自动调度到 ECI。  
也可以在 ECI Profile 中声明需要对 Pod 追加的 Annotation 和 Label ，对于 Label 能够匹配上的 Pod ，也将自动追加配置的 Annotation 和 Label 。 
##### 混用 Virtual Node 和普通 Node 的问题  
仍然以阿里云为例，阿里云上的 Kubernetes 集群部署了 Virtual Node，混合使用 ECI 和普通 Node。  
想象一下这样的场景：某个应用（Deployment）配置了 HPA 和 ECI 弹性调度, 在普通 Node 资源不足的情况下，当触发 HPA 扩容时，部分 Pod 会被调度到 ECI ，但是当 HPA 缩容时，并不会固定删除 ECI 实例，也有可能把普通 Node 上的 Pod 删除而保留 ECI 实例。由于 ECI 是按量付费，如果使用时间过长，费用会比包年包月的 ECS（阿里云服务器）要贵。  
这就引申出了需要解决的两个问题： 
 
  调度问题：当副本数目到达某个数值后，如何控制调度策略的变化。 
 生命周期管理问题：在生命周期管理时，如何优先处理某些 Pod。 
 
Kubernetes 原生的控制器和 Workload 都不能很好地处理上述场景。而阿里云 Kubernetes 的 Elastic Workload 组件（未开源）和阿里云开源的 OpenKruise 都提供了很好的解决办法。 
#### Elastic Workload 和 OpenKruise 
##### Elastic Workload 简介 
Elastic Workload 是阿里云 Kubernetes 特有的一个组件，安装该组件后，会多一种新的资源类型 Elastic Workload ，Elastic Workload 的使用方式与 HPA 类似，通过外部挂载的方式使用，对原有的业务无侵入。  
一个典型的 Elastic Workload 主要分为两个部分： 
 
 sourceTarget 部分主要定义原始 Workload 的类型、副本数目可变化的范围。原始 Workload 还不支持 CloneSet ���且短期内无支持计划。 
 elasticUnit 部分是一个数组，定义弹性单元的调度策略，如果有多个弹性单元，则按照模板的顺序定义。 
 
Elastic Workload Controller 会监听原始 Workload，并根据弹性单元设定的调度策略，克隆并生成弹性单元的 Workload。根据 Elastic Workload 中总副本的变化，动态的分配原始 Workload 和弹性单元上面的副本数目。  
此外，Elastic Workload 也支持与 HPA 配合使用，可以将 HPA 作用在 Elastic Workload 上，如下图：  
 
Elastic Workload 会根据 HPA 的状态动态调整每个单元的副本分布，例如如果当前是从 6 个副本缩容到 4 个副本，那么会优先将弹性单元的副本进行缩容。  
Elastic Workload 一方面通过克隆和覆写调度策略的方式生成多个 Workload，实现了调度策略的管理，另一方面通过上层的副本计算，调整原始 Workload 和弹性单元的副本分配，实现了针对一部分 Pod 的优先处理。 
Elastic Workload 目前仅支持 Deployment 。 
##### OpenKruise 简介 
OpenKruise 是由阿里云容器服务团队开源针对 Kubernetes 的增强能力套件，聚焦于云原生应用的部署、升级、运维、稳定性防护等领域。所有的功能都通过 CRD 等标准方式扩展，可以适用于 1.16 以上版本的任意 Kubernetes 集群。  
###### OpenKruise 能力  
 
 增强版本的 Workload 
 
OpenKruise 包含了一系列增强版本的 Workload，例如 CloneSet、Advanced StatefulSet、Advanced DaemonSet、BroadcastJob 等。它们不仅支持类似于 Kubernetes 原生 Workload 的基础功能，还提供了如原地升级、可配置的扩缩容/发布策略、并发操作等能力。 
 
  应用的旁路管理 
 
OpenKruise 提供了多种通过旁路管理应用 sidecar 容器、多区域部署的方式，“旁路” 意味着用户可以不需要修改应用的 Workload 来实现它们。  
例如，UnitedDeployment 可以提供一个模板来定义应用，并通过管理多个 Workload 来管理多个区域下的 Pod 。而 WorkloadSpread 可以约束无状态 Workload 扩容出来 Pod 的区域分布，赋予单一 Workload 多区域和弹性部署的能力。  
OpenKruise 就是通过 WorkloadSpread 解决上文中提到的混用 Virtual Node 和普通 Node 的问题。  
 
 高可用性防护 
 
OpenKruise 在为应用的高可用性防护方面也做出了很多努力。目前它可以保护 Kubernetes 资源不受级联删除机制的干扰，包括 CRD、Namespace、以及几乎全部的 Workload 类型资源。相比于 Kubernetes 原生的 PDB 只提供针对 Pod Eviction 的防护，PodUnavailableBudget 能够防护 Pod Deletion、Eviction、Update 等许多种 voluntary disruption 场景。  
###### WorkloadSpread  
在 Kubernetes 集群中安装 OpenKruise 后，会多出一个 WorkloadSpread 资源。WorkloadSpread 能够将 Workload 的 Pod 按一定规则分布到不同类型的 Node 上，可以以无侵入的方式赋予单一 Workload 多区域部署、弹性部署和精细化管理的能力。  
常见的一些规则包括： 
 
 水平打散。例如按 Node、Available Zone 等维度的平均打散。 
 按指定比例打散。例如按比例部署 Pod 到几个指定的 Available Zone 中。 
 带优先级的分区管理。例如：1）优先部署到 ECS，资源不足时部署到 ECI。2）优先部署固定数量个 Pod 到 ECS，其余到 ECI。 
 定制化分区管理。例如：1）控制 Workload 部署不同数量的 Pod 到不同的 CPU 架构上。2）确保不同的 CPU 架构上的 Pod 配有不同的资源配额。 
 
每一个 WorkloadSpread 定义多个区域（定义为 subset）， 每个 subset 对应一个 maxReplicas 数量。WorkloadSpread 利用 Webhook 注入 subset 定义的域信息，同时控制 Pod 的扩缩容顺序。  
和 ElasticWorkload 不同的是，ElasticWorkload 管理多个 Workload，而一个 WorkloadSpread 仅作用在单个 Workload 之上，Workload 和 WorkloadSpread 是一一对应的。  
WorkloadSpread 当前支持的 Workload 类型有 CloneSet 和 Deployment 。 
##### Elastic Workload 和 WorkloadSpread 如何选择  
Elastic Workload 是阿里云 Kubernetes 独有的，容易造成云商绑定，且使用成本比较高，只支持 Deployment 这一原生 Workload 。  
WorkloadSpread 是开源的，在 1.16 以上版本的任意 Kubernetes 集群都可以使用，支持原生 Workload Deployment 和 OpenKruise 扩展 Workload Cloneset。  
但是 WorkloadSpread 的优先删除规则依赖 Kubernetes 的 deletion-cost feature 。Cloneset 已经支持 deletion-cost feature 。而原生 Workload 需 Kubernetes 版本大于等于 1.21，且 1.21 版本需要显式开启 PodDeletionCost feature-gate，自 1.22 版本起默认开启。  
所以如果使用阿里云的 Kubernetes ，可参考以下几项进行选择： 
 
 如果使用 Deployment 并且 Kubernetes 版本小于 1.21，则只能选择 ElasticWorkload 。 
 如果使用 Deployment 并且 Kubernetes 版本大于等于 1.21，则选择 WorkloadSpread 。 
 如果使用 Cloneset（OpenKruise 提供的增强 Workload），并且 Kubernetes 版本大于 1.16，则选择 WorkloadSpread 。 
 
#### 比心基于 ACK + ECI 的低成本高弹性实践** 
上文介绍了 Kubernetes 常用的弹性伸缩组件，并以阿里云为例介绍了 Virtual Node 和 ECI ，以及阿里云的 Elastic Workload，开源的 OpenKruise。这一章来探讨下如何合理地使用这些组件，以及比心在阿里云上基于 ECI 的低成本高弹性实践。  
比心可以使用弹性伸缩的场景： 
 
  Job 任务，例如 Flink 的计算任务，Jenkins 的 Pipline 。 
  核心应用需要使用 HPA 来应对突发流量。 
  有活动时，对活动涉及到的应用配置定时 HPA，在活动开始时扩容，在活动结束时缩容。 
  由于 Node 资源不够导致 HPA 弹出的 Pod 处于 Pending 状态。 
  应用上线和发布时，由于 Node 资源不够导致 Pod 处于 Pending 状态。 
 
对于这些场景，可以将 Kubernetes 的各弹性组件结合使用，实现业务的高弹性和低成本。  
由于 Node 水平扩容的交付时间比较长，暂不考虑使用 Node 水平自动伸缩。  
Pod 水平伸缩的整体思路是利用 Kubernetes 的 HPA、阿里云的 Virtual Node 和 ECI，在阿里云上混合使用 ECS 和 ECI ，平时业务使用包年包月的 ECS 承载，节省成本；弹性业务使用 ECI 承载，无需执行弹性部分容量规划。并且结合阿里云的 Elastic Workload 或开源组件 OpenKruise 实现在应用缩容时优先删除 ECI 实例。  
下文会分别对 Job 任务、Deployment、CloneSet 这三种在比心常用资源的水平伸缩做简单介绍。  
至于 Pod 垂直伸缩，由于 VPA 技术还不成熟，且使用限制较多，暂不考虑 VPA 的自动伸缩能力。但是可以使用 VPA 推荐合理 Request 的能力，在保证容器有足够使用的资源的情况下，提升容器的资源利用率，避免容器的资源 Request 设置不合理。 
##### Job 任务只使用 ECI  
对于 Job 任务，直接为 Pod 添加特定的 Label alibabacloud.com/eci=true ，让 Job 任务全部运行在 ECI 上，任务结束则 ECI 释放。无需为 Job 任务预留计算资源，从而摆脱集群计算力不足和扩容的烦扰。 
##### Deployment  
在所有 Deployment 的 Pod Template 添加 Annotations alibabacloud.com/burst-resource: eci  ，以启用 ECI 弹性调度，当集群 ECS 资源（普通 Node）不足时，使用 ECI 弹性资源。由于比心的 Kubernetes 集群版本都在 1.21 以下，所以如果要实现 Deployment 缩容时优先删除 ECI 实例，只能使用阿里云的 Elastic Workload 组件。  
对于没有 HPA 的应用，只使用 ECI 弹性调度。最终效果： 
 
  ECS 资源充足时，优先使用 ECS。 
  ECS 资源不足时，将 Pod 调度到 ECI。但在下一次发布之前，ECI 实例并不会被自动释放，即使对普通 Node 扩容使普通 Node 资源充足。 
 如果对应用手动缩容，不会优先删除ECI。 
 
 
对于配置了 HPA 的应用，可以对这些应用添加 Elastic Workload 资源。一个应用对应一个 Elastic Workload。HPA 作用在 Elastic Workload上。 最终效果： 
 
  正常的 Pod 优先调度到 ECS。 
  在 ECS 资源不足时，正常的 Pod 也会被调度到 ECI。但在下一次发布之前，ECI 实例并不会被自动释放，即使对普通 Node 扩容使普通 Node 资源充足。 
  HPA 弹出的 Pod 全部调度到 ECI。 
  HPA 缩容时只缩容 ECI 实例。 
 应用发布时只需要更新源 Deployment 中的镜像，弹性单元中的镜像会自动修改。 
 
 
##### CloneSet  
创建 CloneSet 之前，先创建 WorkloadSpread 资源。一个 WorkloadSpread 仅作用在一个 CloneSet 上。  
对于没有 HPA 的应用，WorkloadSpread 的 Subset ECS 和 Subset ECI 都不设置最大副本数。  
最终效果： 
 
  ECS 资源充足时，优先使用 ECS。 
  ECS 资源不足时，将 Pod 调度到 ECI。但在下一次发布之前，ECI 实例并不会被自动释放，即使对普通 Node 扩容使普通 Node 资源充足。 
 对应用手动缩容时，会优先删除 ECI 实例。 
 
 
对于有 HPA 的应用，HPA 仍然作用于 CloneSet 。WorkloadSpread 的 Subset ECS 的最大副本数设置为和 HPA 的最小副本数相等，Subset ECI 不设置最大副本数，修改 HPA 的最小副本数时要同步修改 Subset ECS 的最大副本数。  
最终效果： 
 
  正常的 Pod 优先调度到 ECS 。 
  在 ECS 资源不足时，正常的 Pod 也会被调度到 ECI 。但在下一次发布之前，ECI 实例并不会被自动释放，即使对普通 Node 扩容使普通 Node 资源充足。 
  HPA 弹出的 Pod 全部调度到 ECI 。 
  HPA 缩容时也优先删除 ECI 实例。 
 
 
##### 监控计算资源  
从上文 Deployment 和 Cloneset 的水平弹性伸缩方法可以看出，ECI 实例并不能 100% 被及时地自动删除。  
ECI 是按量付费，如果使用时间过长，费用会比包年包月的 ECS 要贵。所以还要结合监控，在普通 Node 资源不足时，及时对普通 Node 资源进行扩容。还要对 ECI 实例做监控告警，如果有长时间（例如三天）运行的 ECI 实例，需要通知到这些实例的应用负责人，让应用负责人自行重启这些 ECI 实例，新的 Pod 会调度到 ECS 。 
##### 使用 VPA 获取 Request 推荐值 
有些应用的 Request 设置过大，缩容至一个 Pod 时资源利用率仍然很低，此时可以通过 VPA 进行垂直缩容以提高资源利用率。但是 VPA 的字段伸缩目前还处于试验阶段，不推荐使用。可以只使用 VPA 获取合理的 Request 推荐值。  
VPA 组件在 Kubernetes 上部署完成后，会新增一个 VerticalPodAutoscaler 资源���型���可以对每一个 Deployment 创建一个 updateMode 为 Off 的 VerticalPodAutoscaler 对象。VPA 会周期性地从 Metrics Server 获取 Deployment 下所有容器的资源使用指标，并计算出合理的 Request 推荐值，然后把推荐值记录在该 Deployment 对应的 VerticalPodAutoscaler 对象中。  
可以自己写代码将 VerticalPodAutoscaler 对象中的推荐值取出来，然后以应用为维度进行聚合、计算，最终将结果展示到页面中。应用负责人可以在页面上直观地看出应用的 Request 设置是否合理，运维人员也可以依据这些数据去推动应用的降配。 
#### 总结 
本文简单介绍了 HPA、VPA、CA、Virtual Kubelet、阿里云 ACK、阿里云 ECI、阿里云  ElasticWorkload、Openkruise WorkloadSpread 等弹性伸缩组件，并探讨了比心如何使用这些组件实现 Kubernetes 的低成本高弹性。目前比心正在积极地落地部分组件，利用其弹性伸缩能力切实地降低成本，也会持续关注行业动态，不断完善弹性方案。  
更多阅读： 
1）阿里云 ACK+ECI 帮助文档： 
https://www.alibabacloud.com/help/zh/elastic-container-instance/latest/use-elastic-container-instance-in-ack-clusters 
2）CNCF OpenKruise 官网： 
https://openkruise.io/ 
点击此处，前往容器服务 ACK 官网查看更多相关资讯！ 
——本篇转载自「比心技术」，更多相关技术创新、实践可前往该公众号进行查阅
                                        