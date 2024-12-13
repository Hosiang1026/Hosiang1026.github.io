---
title: 推荐系列-漫谈腾讯微服务平台 TSF Mesh 统一容器和虚拟机之路
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 404
cover_picture: 'https://oscimg.oschina.net/oscnet/bfff1172-62a6-4b46-a55f-2271058bd0c6.png'
abbrlink: 6465c54f
date: 2021-04-15 09:46:43
---

&emsp;&emsp;导读 随着业务的增长，一些传统企业对诸如灰度发布、服务路由、服务熔断、服务限流等服务治理的需求越来越强烈，但他们又不想对业务代码做大量的改造，因而 Service Mesh 成了他们比较好的选...
<!-- more -->

                                                                                                                                                                                         
  
   
    
    ![Test](https://oscimg.oschina.net/oscnet/bfff1172-62a6-4b46-a55f-2271058bd0c6.png  '漫谈腾讯微服务平台 TSF Mesh 统一容器和虚拟机之路') 
    
   
   
    
     
      
       
        
         
         ![Test](https://oscimg.oschina.net/oscnet/bfff1172-62a6-4b46-a55f-2271058bd0c6.png  '漫谈腾讯微服务平台 TSF Mesh 统一容器和虚拟机之路') 
         
        
       
      
     
     
      
      导读 
      
     
    
   
   
    
     
      
       
        
         
        
       
      
     
    
   
   
    
     
      
       
        
        随着业务的增长，一些传统企业对诸如灰度发布、服务路由、服务熔断、服务限流等服务治理的需求越来越强烈，但他们又不想对业务代码做大量的改造，因而 Service Mesh 成了他们比较好的选择；不幸的是业内比较成熟能落地的 Service Mesh 方案如 Istio 都是基于各种容器平台构建的，而这些传统企业很多没有接入容器平台也不想做容器���改���，这就导致 Service mesh 很难应用于这些传统企业或者一些非容器化的场景。 
        
       
      
     
    
   
   
    
     
      
       
        
         
        
       
      
     
    
   
   
    
   
   
    
   
   
    
     
      
       
        
         
         ![Test](https://oscimg.oschina.net/oscnet/bfff1172-62a6-4b46-a55f-2271058bd0c6.png  '漫谈腾讯微服务平台 TSF Mesh 统一容器和虚拟机之路') 
         
        
       
      
     
     
      
      作者介绍 
      
     
    
   
   
    
   
   
    
     
     张��培 
      
     腾讯云微服务团队高级工程师 
     TSF Mesh 研发及负责人 
     热衷于云原生和开源技术，在容器、Service Mesh、消息队列、区块链等领域拥有丰富经验，目前致力于Service Mesh 技术的落地和推广 
     
    
   
   
    
    
   
   
    
    ![Test](https://oscimg.oschina.net/oscnet/bfff1172-62a6-4b46-a55f-2271058bd0c6.png  '漫谈腾讯微服务平台 TSF Mesh 统一容器和虚拟机之路') 
    
   
   
   前言 
   
   
    
   
   
   为了兼容 Service mesh 的非容器化场景，TSF Mesh 基于 Istio 构建了 Service mesh 微服务平台，对原生 Istio 实现进行了适当的改造，支持应用同时运行于容器环境和虚拟机环境（同时也打通了 Spring Cloud 框架，实现 Mesh 服务和 Spring Cloud 服务互联互通，服务统一治理）。 
    
   TSF Mesh 对容器和虚拟机统一化的改造主要体现在以下几个方面： 
    
    
     
     
       应用部署和Sidecar注入 
      
     
     
       流量劫持 
      
     
     
       服务注册与发现 
      
    
   针对这几点，下面会先剖析对比 Istio service mesh 基于 K8s 的实现方案，再讲述 TSF Mesh 是如何实现的，做了哪些改造。 
   
   
    
   
   
    
   
   
    
    ![Test](https://oscimg.oschina.net/oscnet/bfff1172-62a6-4b46-a55f-2271058bd0c6.png  '漫谈腾讯微服务平台 TSF Mesh 统一容器和虚拟机之路') 
    
   
   
   应用部署和 Sidecar 注入 
   
   
    
   
   
   首先，回顾下 Istio service mesh 的应用部署和 Sidecar 注入方式: 
    
   应用部署：Istio service mesh 依赖 K8s 进行应用的生命周期管理，包括应用的部署和管理（扩缩容、自动恢复、发布） 
    
   Sidecar 注入：分为手动注入和自动注入, 如下图所示： 
    
    
    手工注入通过手工执行 istioctl kube-inject 来重新构造应用的 CRD yaml 
    自动注入通过 K8s 的 mutable webhook 回调 istio-sidecar-injector 服务来重新构造应用的 CRD yaml 
    
   
   
    
   
   
    
    ![Test](https://oscimg.oschina.net/oscnet/bfff1172-62a6-4b46-a55f-2271058bd0c6.png  '漫谈腾讯微服务平台 TSF Mesh 统一容器和虚拟机之路') 
    
   
   
    
   
   
   无论是手工注入还是自动注入，Sidecar 注入的本质是将运行 Sidecar 所需要的镜像地址、启动参数、所连接的 Istio 集群（Pilot、Mixes、Citadel）及配置信息填充到注入模版，并添加到应用的 CRD yaml 中，最终通过 K8s 持久化资源并拉起应用和 Sidecar 的 POD。 
    
   那 TSF Mesh 如何做应用部署和 Sidecar 注入的呢？ 
   由于 TSF Mesh 需要同时支持容器和虚拟机环境，则首先需要解决虚拟机部署的问题，要实现等同 K8s 的部署能力，需要解决以下几个问题： 
   
   
    
   
   
    
     
     
       资源和配置管理，如 Istio 集群信息、配置信息等 
      
     
     
       对应于容器的镜像，虚拟机就是程序包，那就涉及到包管理 
      
     
     
       虚拟机应用生命周期的管理 
      
     
     
       虚拟机 Sidecar 注入 
      
    
   为了解决容器和虚拟机统一部署问题，不能再用 K8s 的存储方式，而是需要更高层的管理模式，我们引入了 tsf-resource 资源管控模块来负责容器和虚拟机相关资源的统一管理，像 Istio 集群相关的信息在控制平台部署时会持久化在 TSF 的 DB 中。 
   
   
    
   
   
   对于容器平台，当用户从 TSF 控制台部署一个容器应用时，tsf-resource 从 DB 中获取像容器的镜像地址、Istio 集群信息、配置、启动参数等，进行 K8s CRD 的组装，组装完将 CRD 创建请求发送给容器平台完成应用 POD 的拉起，其实这里在组装 CRD 时已经实现了 Sidecar 的自动注入，注入时的动态参数由控制台传递，静态参数如 Sidecar 镜像地址、启动参数等从 DB 中获取。 
    
   对于虚拟机平台，TSF 引入了以下几个模块来解决程序包管理和应用部署的问题： 
   
   
    
   
   
    
     
     
       tsf-repo，程序包仓库管理，存储应用程序包及相关依赖 
      
     
     
       tsf-master，虚拟机节点管理 master，发送部署/下线/启动/停止等任务给 tsf-agent 
      
     
     
       tsf-agent，虚拟机节点管理 agent，部署在应用机器上，负责初始化机器环境、执行应用部署/下线/启动/停止等任务 
      
    
   
   
    
   
   
   对于虚拟机应用的变更，如例如应用部署、启动、停止、下线，TSF 通过任务的方式来跟踪每个变更，在任务下发的具体流程中，所有任务都是异步执行的，tsf-resource 将任务转发给 tsf-master 后就返回给 TSF 控制台，并由 tsf-master 完成任务的下发和状态跟踪；用户在 TSF 控制台执行操作后，可以根据返回的任务 ID 查询执行结果。 
   
   
    
   
   
    
   
   
    
    ![Test](https://oscimg.oschina.net/oscnet/bfff1172-62a6-4b46-a55f-2271058bd0c6.png  '漫谈腾讯微服务平台 TSF Mesh 统一容器和虚拟机之路') 
    
   
   
   流量劫持 
   
   
    
   
   
   Service mesh 需要透明的进行服务治理，也就需要透明的接管服务进出流量，将流量劫持到 Sidecar，由 Sidecar 进行流量管理，传统的方式是 iptables 流量劫持（也可采用 BPF、IPVS 等方式），同样下面先回顾下 Istio 的 Service mesh 方案具体是如何劫持流量的，然后再看下 TSF mesh 为了统一容器和虚拟机做了哪些改造。 
    
   查看经过 Sidecar 注入后的应用 YAML 文件，发现 istio-sidecar-injector 服务在注入 Sidecar 容器本身时，还注入了 istio-init 容器，istio-init 容器属于 init 容器（init 容器在应用程序容器启动之前运行，用来初始化一些应用镜像中不存在的实用工具或安装脚本），下面是官方例子中注入的 init 容器部分: 
   
   
    
   
   
    
     
 ```java 
  initContainers:
  ``` 
  
 ```java 
        - args:
  ``` 
  
 ```java 
          - -p
  ``` 
  
 ```java 
          - "15001"
  ``` 
  
 ```java 
          - -u
  ``` 
  
 ```java 
          - "1337"
  ``` 
  
 ```java 
          - -m
  ``` 
  
 ```java 
          - REDIRECT
  ``` 
  
 ```java 
          - -i
  ``` 
  
 ```java 
          - '*'
  ``` 
  
 ```java 
          - -x
  ``` 
  
 ```java 
          - ""
  ``` 
  
 ```java 
          - -b
  ``` 
  
 ```java 
          - 9080,
  ``` 
  
 ```java 
          - -d
  ``` 
  
 ```java 
          - ""
  ``` 
  
 ```java 
          image: istio/istio-release-proxy_init:1.0.1
  ``` 
  
 ```java 
          imagePullPolicy: IfNotPresent
  ``` 
  
 ```java 
          name: istio-init
  ``` 
  
 ```java 
          resources: {}
  ``` 
  
 ```java 
          securityContext:
  ``` 
  
 ```java 
            capabilities:
  ``` 
  
 ```java 
              add:
  ``` 
  
 ```java 
              - NET_ADMIN
  ``` 
  
 ```java 
            privileged: true
  ``` 
  
 ```java 
          ...
  ``` 
  
    
   
   
    
   
   
   可以看出 init 容器 istio-init，被赋予了 NET_ADMIN 的 POD 网络空间权限，具体执行了哪些初始化还看不出来，那再来看下 istio/istio-release-proxy_init:1.0.1 镜像的 Dockerfile。 
   
   
    
   
   
    
     
 ```java 
  FROM ubuntu:xenial
  ``` 
  
 ```java 
  RUN apt-get update && apt-get install -y \
  ``` 
  
 ```java 
      iproute2 \
  ``` 
  
 ```java 
      iptables \
  ``` 
  
 ```java 
   && rm -rf /var/lib/apt/lists/*
  ``` 
  
 ```java 
  ADD istio-iptables.sh /usr/local/bin/
  ``` 
  
 ```java 
  ENTRYPOINT ["/usr/local/bin/istio-iptables.sh"]
  ``` 
  
    
   
   
    
   
   
   istio-init 容器的 ENTRYPOINT 是 /usr/local/bin/istio-iptables.sh 脚本，顾名思义用于 Istio iptables 流量劫持的脚本，组合上面 istio-init 容器的启动参数，完整命令为： 
   
   
    
   
   
    
     
 ```java 
  $ /usr/local/bin/istio-iptables.sh -p 15001 -u 1337 -m REDIRECT -i '*' -x "" -b 9080 -d ""
  ``` 
  
    
   
   
    
   
   
   该命令的主要作用是，将应用容器中访问9080端口的流量（inbound 流量）和所有出站流量（outbound 流量）重定向到 Sidecar（即 envoy）的15001端口。 
   总结下来，Istio 是通过 init 容器完成了流量劫持到 Sidecar 的初始化工作。 
    
   TSF Mesh 如何实现流量劫持的呢？ 
   TSF Mesh 同样采用 iptables 方式，不过要兼顾虚拟机平台，需要解决两个主要问题： 
    
    
     
     
       虚拟机下如何执行 iptables 应用劫持策略 
      
     
     
       虚拟机下如何劫持流量，不能劫持虚拟机整个网络空间的流量 
      
    
   
   
    
   
   
   问题1的解决比较���单，我们对 pilot-agent 做些一些扩展，在 pilot-agent 中执行 iptables 脚本，pilot-agent 一个主要工作是生成 envoy 的 bootstrap 配置并启动 envoy、管理 envoy 的生命周期，类似容器环境下做 envoy 启动前的 init 准备，在启动 envoy 前执行 iptables 脚本，也比较合理。 
    
   问题2的解决就比较麻烦了，但又非常重要，不像 K8s 的 POD，POD 间网路是隔离的，一个 POD 一般只会运行一个应用，劫持整个 POD 网路空间里的流量完全没有问题，而虚拟机中可能还有其它进程的存在，这些进程可能也有 Outbound 的流量，因此我们不能劫持虚拟机所有的流量，一种比较合理的劫持方案应该是： 
   
   
    
   
   
    
     
     
       对于 Inbound 流量，只劫持到部署应用的端口，这个原生 Istio 已经做到，无需改造 
      
     
     
       对于 Outbound 流量，只劫持注册中心已注册服务的流量 
      
    
    
   下面来具体讲下 TSF Mesh 如何针对服务来劫持 Outbound 流量的。 
   其实我们的方案和 K8s 的 kube-DNS+kube-proxy 的服务发现机制类似，TSF Mesh 在数据平面引入了一个 mesh-dns 模块，通过连接 pilot-discovery 同步获取注册中心的服务变更来更新本地的 DNS cache，对于来自注册中心的服务会被解析到一个特定的 IP，然后在 iptables 策略中把目的地址到这个特定 IP 的流量重定向 envoy，当然，还需要劫持 DNS 53 端口的流量，先把 DNS 请求引到 mesh-dns，可以看下 iptables nat 表中完整的规则内容： 
   
   
    
   
   
    
    ![Test](https://oscimg.oschina.net/oscnet/bfff1172-62a6-4b46-a55f-2271058bd0c6.png  '漫谈腾讯微服务平台 TSF Mesh 统一容器和虚拟机之路') 
    
   
   
    
   
   
   Inbound 流量劫持跟原生 Istio 实现类似就不赘述了，下图显示的是 Outbound 流量 iptables 劫持的详细过程,其中红色部分为新增的 DNS 劫持规则。 
   
   
    
   
   
    
    ![Test](https://oscimg.oschina.net/oscnet/bfff1172-62a6-4b46-a55f-2271058bd0c6.png  '漫谈腾讯微服务平台 TSF Mesh 统一容器和虚拟机之路') 
    
   
   
    
   
   
   注册服务的域名劫持，除了引入了 mesh-dns 自研模块，还涉及到 pilot-discovery 和 pilot-agent 的改造: 
   
   
    
   
   
   pilot-discovery 改造点 
    
    
     
     
       pilot-discovery 扩展一个 ServiceInfos 的 grpc 服务，提供注册服务变更同步接口 
      
     
     
       pilot-discovery 早期的 consul controller 实现是，定时通过 Consul 的 Rest API 获取服务数据并和上一次的查询结果进行对比，如果数据发生了变化则通知 Pilot discovery 进行更新，这里我们进行了优化，采用 Consul 的 watch 机制来代替轮询（下面服务注册与发现中也有提到），并在 ServiceInfos 服务初始化时向 consul controller 注册了服务变更的 event 通知 
      
     
     
       ServiceInfos 服务在 mesh-dns 请求第一次到来时同步全量的服务注册表，之后则根据服务的变更情况增量同步 
      
    
   
   
    
   
   
   mesh-dns实现 
    
    
     
     
       DNS 服务基于 github.com/miekg/dns 实现（一个非常轻量级的 DNS 库） 
      
     
     
       和 pilot-discovery 保持注册服务列表的同步，mesh-dns 启动时进行全量同步，运行时进行增量同步 
      
     
     
       处理 DNS 请求时，先检查 Domain 是否在注册服务列表里，如果在则返回一个特定的 IP（可配置），否则请求本地配置的域名服务进行解析 
      
    
   
   
    
   
   
   pilot-agent 改造点 
    
    
     
     
       类似对 envoy 的管理，pilot-agent 扩展了 mesh-dns 的支持，负责了 mesh-dns 启动配置组装、启动 mesh-dns 及 mesh-dns 生命周期的管理 
      
    
   
   
    
   
   
    
   
   
    
    ![Test](https://oscimg.oschina.net/oscnet/bfff1172-62a6-4b46-a55f-2271058bd0c6.png  '漫谈腾讯微服务平台 TSF Mesh 统一容器和虚拟机之路') 
    
   
   
   服务注册与发现 
   
   
    
   
   
   基于流量比例的路由 Istio 中负责流量管理的组件为 Pilot，其中服务发现也是通过 Pilot 完成，Pilot 的高层架构图如下所示： 
   
   
    
   
   
    
    ![Test](https://oscimg.oschina.net/oscnet/bfff1172-62a6-4b46-a55f-2271058bd0c6.png  '漫谈腾讯微服务平台 TSF Mesh 统一容器和虚拟机之路') 
    
   
   
    
   
   
   Istio服务注册与发现的原理 
    
    
     
      
      Istio 服务注册：Istio 架构中本身不提供服务注册的能力，而是依赖于各种底层平台，底层平台是具体服务信息的生产者和维护者，如 Kubernetes 在 POD 部署时会保存 Service 以及对应的 Pod 实例信息。 
      
     
      
      Istio服务发现：Istio 是服务信息的消费者，服务发现是通过 Pilot 组件实现的，Pilot 组件负责维护网格中的标准服务模型，该标准服务模型独立于各种底层平台，Pilot 组件通过适配器和各底层平台对接，以使用底层平台中的服务数据填充此标准模型，再通过标准 xDS 协议（CDS 集群信息和 EDS 实例信息）同步给 envoy。 
      
    
   
   
    
   
   
   TSF Mesh如何实现服务注册与发现的呢？ 
    
   同样，TSF Mesh 要兼顾虚拟机平台，需要解决三个主要问题： 
    
    
     
     
       注册中心如何选择 
      
     
     
       服务如何注册 
      
     
     
       实例健康状态如何维护 
      
    
   
   
    
   
   
   问题1: TSF Mesh 容器和虚拟机统一采用 Consul 作为注册中心，因为虚拟机部署不会依赖容器平台，因此服务注册发现也不能依赖容器平台；Pilot 原生实现是支持 Consul 的，但早期的实现比较鸡肋（1.4.0以前还是通过 Rest API 轮询的方式去获取 Consul 注册服务信息的变更），TSF Mesh 针对早期的版本也做了优化，采用 Consul watch 来代替轮询。 
    
   问题2: TSF Mesh 统一了容器和虚拟机的服务注册方式，服务注册都在 envoy 中完成 , 
   
   
    
   
   
   1. 类似通过 K8s 部署服务一样，TSF Mesh 在部署时需要用户在应用程序所在目录中创建一个 spec.yaml 服务描述文件，spec.yaml 格式如下： 
   
   
    
   
   
    
     
 ```java 
  apiVersion: v1
  ``` 
  
 ```java 
  kind: Application
  ``` 
  
 ```java 
  spec:
  ``` 
  
 ```java 
    services:
  ``` 
  
 ```java 
    - name: user # 服务名
  ``` 
  
 ```java 
      ports:         
  ``` 
  
 ```java 
      - targetPort: 8091 # 服务监听端口 
  ``` 
  
 ```java 
        protocol: http # 服务协议类型
  ``` 
  
 ```java 
      healthCheck:
  ``` 
  
 ```java 
        path: /health # 健康检查 URL
  ``` 
  
    
   
   
    
   
   
   2. Pilot-agent 将 spec.yaml 文件中内容读出并填充到 envoy-rev0.yaml（envoy启动时的静态配置文件）文件的 node 信息中； 
    
   3. Pilot-agent 启动 envoy，envoy 本身是支持 HDS 的，TSF Mesh 改造了 envoy 代码默认把本地部署的服务 Endpoint 作为 HealthCheck 请求的 cluster，在启动时把请求发送给 Pilot-discovery； 
    
   4. Pilot-discovery 原生是不支持 HDS 控制的，TSF Mesh 扩展 Pilot-discovery 以支持 HDS 服务端来接收 envoy 的 HealthCheck 请求，由于 HDS 定义的请求数据结构里包含 node 信息，也就包含了上面的服务描述信息，Pilot-discovery 组装服务描述信息将服务注册到 consul； 
    
   5. Pilot-discovery 是注册中心服务信息的消费者，因此原生是不支持服务注册的，TSF Mesh 再次扩展了 Pilot-discovery，在 Consul Apater 中增加了 RegisterService 接口； 
   
   
    
   
   
   问题3：TSF Mesh 中服务的实例健康状态也是由 envoy 来维护的： 
    
    
     
     
       envoy 在收到 pilot-discovery 的 HealthCheckSpecifier 回应后，会根据回应中的参数如 check 间隔、check 的实例（这里就是本地服务实例）、check 的 Path（这里就是 spec.yaml 中的 healthCheck path）等异步执行本地实例的 Health Check，根据 check 的结果更新本地实例的健康状态； 
      
     
     
       HDS 除了支持 HealthCheckRequest 请求，还支持 EndpointHealthResponse 请求，envoy 根据当前实例的健康状态通过 EndpointHealthResponse 周期性同步给 pilot-discovery； 
      
     
     
       TSF Mesh 完全扩展了 Pilot-discovery 的 HDS 服务，支持对 EndpointHealthResponse 请求的处理，根据请求中实例的健康状态进行 TTL 上报； 
      
     
     
       TSF Mesh 再次扩展了 Pilot-discovery，在 Consul Apater 中增加了 ReportHealthCheckInfo 接口以支持服务治理的 TTL 上报 
      
    
   
   
    
   
   
    
   
   
    
    ![Test](https://oscimg.oschina.net/oscnet/bfff1172-62a6-4b46-a55f-2271058bd0c6.png  '漫谈腾讯微服务平台 TSF Mesh 统一容器和虚拟机之路') 
    
   
   
   总结 
   
   
    
   
   
   TSF Mesh 在深入理解了 Istio service mesh 方案的基础上对其进行了针对性的改造和优化，使得应用能同时运行于容器环境和非容器环境，通过抽象出更高层的管控平台，TSF Mesh 可以不依赖于具体的底层平台而对应用进行统一管理和控制；而 TSF Mesh 作为 TSF 的一种微服务框架实现，不仅仅解决了平台统一化问题，还提供了应用全生命周期管理、数据化运营、立体化监控和服务治理的整套解决方案，具体介绍和使用可参考 TSF Mesh 官网。 
   
   
    
   
   
   参考链接： 
   
   
    
   
   
   - ServiceMesher 社区： 
   https://www.servicemesher.com/ 
    
   - TSF Mesh 微服务平台： 
   https://cloud.tencent.com/product/tsf-mesh 
    
   - Istio 服务注册插件机制代码解析： 
   https://www.servicemesher.com/blog/istio-pilot-service-registry-code-analysis/ 
   
   
    
   
   
    
   
   
    
     
     往期 
     
    
    
     
     推荐 
     
    
   
   
    
   《原生应用 “0” 代码改造，无侵入接入，纵享丝滑般上云体验！》 
   《超有料！万字详解腾讯微服务平台 TSF 的敏捷开发流程》 
   《200 行代码告诉你 TDMQ 中 Pulsar 广播如何实现》 
    
   
   
    
   
   
    
     
      
       
      
     
     
      
       
       ![Test](https://oscimg.oschina.net/oscnet/bfff1172-62a6-4b46-a55f-2271058bd0c6.png  '漫谈腾讯微服务平台 TSF Mesh 统一容器和虚拟机之路') 
       
      
     
     
      
       
      
     
    
   
   
   扫描下方二维码关注本公众号， 
   了解更多微服务、消息队列的相关信息！ 
   解锁超多鹅厂周边！ 
    
   
   
    
    ![Test](https://oscimg.oschina.net/oscnet/bfff1172-62a6-4b46-a55f-2271058bd0c6.png  '漫谈腾讯微服务平台 TSF Mesh 统一容器和虚拟机之路') 
    
   
  
  
   
    
    戳原文，了解更多腾讯微服务平台相关信息 
    
   
  
  
   
  
  
   
    
     
      
       
        
        ![Test](https://oscimg.oschina.net/oscnet/bfff1172-62a6-4b46-a55f-2271058bd0c6.png  '漫谈腾讯微服务平台 TSF Mesh 统一容器和虚拟机之路') 
        
        
        点亮在看，你最好看 
        
       
      
     
    
   
  
 
本文分享自微信公众号 - 腾讯云中间件（gh_6ea1bc2dd5fd）。如有侵权，请联系 support@oschina.cn 删除。本文参与“OSC源创计划”，欢迎正在阅读的你也加入，一起分享。
                                        