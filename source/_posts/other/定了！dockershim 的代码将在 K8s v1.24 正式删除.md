---
title: 推荐系列-定了！dockershim 的代码将在 K8s v1.24 正式删除
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 278
cover_picture: 'https://oscimg.oschina.net/oscnet/6651dfe0-8959-4959-b1b4-58a41876d4e7.png'
abbrlink: cdee7d8e
date: 2021-11-23 02:39:46
---

&emsp;&emsp;好，我是张晋涛。 目前已经确定， dockershim 的代码将在 Kubernetes v1.24 版本中被正式从 Kubernetes 的代码仓库移除，预计新版本明年 4 月左右发布。对于喜欢尝鲜的小伙伴，dockershi...
<!-- more -->

                                                                                                                                                                                         
 大家好，我是张晋涛。 
 目前已经确定， dockershim 的代码将在 Kubernetes v1.24 版本中被正式从 Kubernetes 的代码仓库移除，预计新版本明年 4 月左右发布。对于喜欢尝鲜的小伙伴，dockershim 的代码下个月就将从 Kubernetes 的源代码仓库中正式移除了，届时可以尝试使用 alpha 版本进行测试使用，或者自行编译。 
 老粉们可能在去年看过我发布的 《K8S 弃用 Docker 了？Docker 不能用了？别逗了！》，在其中我详细的说明了所谓的 “Kubernetes 在弃 Docker  一事上的起源，结果” 等。 
 现在这个事情从正式宣布到现在已经发展了快一年了，我们来看看它有哪些变化和更新吧。 
 为了照顾新的小伙伴，我们再明确下，本次 Kubernetes 移除 dockershim 的树内代码，对于不同角色（架构、开发、集群管理员等等）的小伙伴都有哪些影响以及需要做些什么。 
 首先，还是需要给大家一剂强心针，本次 Kubernetes 移除树内 dockershim 代码 并不说明 Docker 不可用！而 dockershim 本身作用就是通过 CRI 的方式连接 Kubelet 和 Docker 的。Kubernetes 推出了 CRI，以满足对不同容器运行时的支持！我们需要从根本上，了解 Docker 的定位以及 dockershim 对 Kubernetes 来讲意味着什么。 
  
 ### 追根溯源 - Docker 的定位以及 Kubernetes CRI 
 知道的越多，恐惧的越少。 
  
 #### Docker 
 Docker 的定位是 Development Platform ，即，作为一个开发者工具，而非底层的容器运行时。 
 所以，我们可以看到，Docker 于 2017年 给 CNCF 贡献了 containerd ，同年的 11月 ，Kubernetes 也增加了对 containerd 的支持（2018 年， Kubernetes 的 containerd 集成，正式 GA）。 
  
 图 1 ，Kubernetes CRI 与容器运行时 containerd 的集成 
 图1 展示了，如果将容器运行时替换为 containerd 的话，整个的处理链路是什么。可以看到，处理链路缩短了。 
  
 #### Kubernetes CRI 
 2016 年 12 月， Kubernetes 发布 CRI （Container Runtime Interface）。 
 在之前的文章中，我们也说过，2014年 Kubernetes 的诞生就是为了解决大规模场景下 Docker 容器编排的问题。在当时，Docker 是最流行也是唯一的容器运行时，对 Docker 的支持，使得 Kubernetes 在早期就迎来了大量的用户。 
 为了能防止被锁定在 Docker 这一容器运行时，也为了减轻在集成其他运行时的时候的开发工作量，Kubernetes 推出了一个统一的 CRI 接口，凡是支持 CRI 的运行时，皆可直接作为 Kubernetes 的底层运行时，以此来应对更多更复杂的需求及场景。  
 从发展的历史轨迹来看，在 2014年时，Kubernetes 没有更多选择，内置 dockershim 也是为了迎合大量的 Docker 用户。而 Kubernetes 确实也从中获取到相应的好处。而 CRI 的出现，则是发展的必然了（毕竟 2016年 Kubernetes 在那场容器编排之战里胜出了）。 
  
 图 2 ，Kubernetes 增加了对 containerd 的支持 
 那么什么是 CRI ？ 
 CRI 是在 Kubernetes v1.5 版本中引入的（作为 Alpha 发布），一个插件接口，它使 kubelet 能够使用各种容器运行时，而无需重新编译。CRI 的出现是一次解耦，它使得 Kubernetes 社区的维护成本减少了些，并且节约了开发者需要对 kubelet 内部结构以及代码深入了解的门槛，同时也打破了新生容器运行时想接入 Kubernetes 的高壁垒。 
 Kubelet 使用 gRPC 框架通过 Unix 套接字与容器运行时（或运行时的 CRI shim）通信，其中 kubelet 作为客户端，CRI shim 作为服务器。 
  
 图 3 ，CRI 实现原理 
 API包括两个 gRPC Service: 
  
   ImageService - 提供 RPC 以从存储库中提取图像、检查和删除图像。  
   RuntimeService - 包含 RPC 来管理 Pod 和容器的生命周期，以及与容器交互的调用（exec/attach/port-forward）。  
  
  
 #### 有些尴尬又不知所措的 dockershim？ 
 dockershim 一直都是 Kubernetes 社区为了能让 Docker 成为其支持的容器运行时，所维护的一个兼容程序。 
 而我们也不必为了 dockershim 太过担心，Mirantis 已经承诺会接管并且持续支持 dockershim。也就是说，虽然 Kubernetes 代码仓库中移除了 dockershim 的代码，但是，Mirantis 会维护一份树外的 dockershim 。如果你想继续使用 Docker 作为 Kubernetes 的容器运行时，那么就需要运行树外的 dockershim 了。 
 也请小伙伴们耐心查看下方视频，Mirantis 再次公开声明，我们大可不必为 dockershim 的未来忧心。 
   
  
  
 ### 影响 
 相信很多小伙伴最关心的就是，这种变化，会对我们日常的生产、开发环境带来哪些变化。我们要怎样快速的进行应对！ 
 抛开这个问题，请小伙伴们评估下各自的实际生产环境。 
  
   生产环境中的 Kubernetes 升级周期  
   当前生产集群中使用的容器运行时是什么  
  
 当然，作为应用软件的开发者而言，此次的变化，并不带来任何开发角度的影响（除非，你是个容器及容器编排开发ヾ(◍°∇°◍)ﾉﾞ）。 
 如果，作为容器、容器编排开发、集群维护管理人员、架构、以及对容器技术关注的小伙伴，建议一定要关注并积极地测试、反馈在 12月即将发布的 Kubernetes v1.24 的 alpha 和 beta 版本。同时，还需要深入 CRI 以及目前较流行的容器运行时（containerd、cri-o）。 
 建议大家都深入地了解下 containerd 。可以参考我去年做的一次分享：containerd 上手实践。在此处可获取 PPT  https://github.com/tao12345666333/slides/tree/master/2020.12.22-Upyun-OpenTalk 
 虽然，Mirantis 公司宣称会和 Docker 一起维护好 dockershim，但是，就 目前来看 Mirantis 维护的 dockershim 并没什么实质性的进展。而 containerd 在众多的云厂商及公司的生产环境中已被作为其 Kubernetes 的运行时使用了。 
 最后的最后，小伙伴们，拥抱变化吧！ 
 
本文分享自微信公众号 - MoeLove（TheMoeLove）。 如有侵权，请联系 support@oschina.cn 删除。 本文参与“OSC源创计划”，欢迎正在阅读的你也加入，一起分享。
                                        