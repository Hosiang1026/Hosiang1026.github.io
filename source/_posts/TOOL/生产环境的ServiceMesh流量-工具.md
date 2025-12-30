---
title: 生产环境的 ServiceMesh 流量劫持怎么搞-百度有新招
categories: 其他系列
tags:
  - Docker
  - Dockerfile
abbrlink: 50cd28d0
date: 2019-06-02 00:00:00
top: 49
---


背景 ServiceMesh 社区使用 iptables 实现流量劫持，这个机制在百度生产环境使用会遇到一些问题，因此，我们探索了其他的流量劫持方式，如基于服务发现的流量劫持机制、基于 SDK 的流量劫持机。..
<!-- more -->

![Test](https://oscimg.oschina.net/oscnet/up-265cdf85aba4a83e39ffbf8c1fd6b63144d.png '生产环境的 ServiceMesh 流量劫持怎么搞-百度有新招') 
 
 
### 一、背景
  
ServiceMesh 社区使用 iptables 实现流量劫持，这个机制在百度生产环境使用会遇到一些问题，因此，我们探索了其他的流量劫持方式，如基于服务发现的流量劫持机制、基于 SDK 的流量劫持机制、基于固定 Virutal IP 的流量劫持机制等。 
  
本文主要介绍基于服务发现的流量劫持机制，这个机制是在服务发现步骤 "伪造" 地址来完成流量劫持。 
  
 
### 二、基于 iptables 流量劫持机制
  
我们先简单的看看社区的流量劫持方案，首先看下 Inbound 流量劫持，如图1 所示： 
  
 
  所有入站流量都会经过 iptables；  
  iptables 忽略非 TCP 以及访问 istio 管理端口的流量，将其他入站流量转发给 Envoy；  
  Envoy 处理完后再将流量转发给 App；  
  上述流量又一次经过 iptables 规则匹配，iptables 将具备以下特点的流量当做 Envoy 发出的流量直接转发给目的地： 
   
    Envoy 发出的；  
    输出设备时 lo；  
    目的地时127.0.0.1。  
    
 
至此 iptables 完成了 Envoy 对 Inbound 流量的劫持和转发。 
  
图1 iptables 流量劫持 
  
接下来咱们再来看看 Outbound 流量劫持，如图2所示： 
  
 
  App 给 Server 发送流量；  
  iptables 将满足以下条件的流量转发给 Envoy： 
   
    不是 Envoy 发出的；  
    输出设备不是 lo；  
    目的地址不是 localhost。  
    
  Envoy 处理完后，选定 Server 的一个 endpoint 转发流量；  
  iptables 将满足以下条件的流量直接发给目的地，也就是 Server： 
   
    输出设备不是 lo。  
    
 
图2 iptables 劫持 outbound 流量 
  
至此，iptables 完成了 inbound 和 outbound 的流量劫持，该机制的好处在于可以透明的劫持业务流量，但是在百度生产环境使用时存在一些问题： 
  
 
  可管控性差，内网各容器网络没有隔离，iptables 是全局工具，可被其它用户修改，导致流量劫持异常；它作为单机流量管理工具，没有成熟的平台/产品进行统一的管理。  
  大并发场景下存在一定的转发性能问题；规则数过多时变更时延大。  
 
  
因此我们探索了其他的劫持机制，接下来我来介绍下百度生产环境正在使用的流量劫持机制——基于服务发现的流量劫持机制。 
  
 
### 三、基于服务发现的流量劫持机制
  
先来看下该机制的设计思路，服务流量根据方向的不同，可以分为 Outbound 和 Inbound。如图3 所示，有两个服务：Client 和 Server，Client 的 Envoy 记为 EnvoyC，Server的 Envoy 记为 EnvoyS（本质是一样的，只不过为了表述方便取了不同的名字）。EnvoyC 要劫持的流量是来自在相同机器上的 Client 发出的 Outbound 流量，而 EnvoyS 要劫持的流量大部分是来自不同机器上的服务发给 Server 的流量。 
  
这两种流量的劫持机制可以分开设计，考虑到 ServiceMesh 常用的策略都在 EnvoyC 上生效，因此我们先设计了 EnvoyC 劫持 Outbound 流量的方案。 
  
图3 ServiceMesh 流量劫持 
  
 
#### 3.1 Outbound 流量劫持
  
一个完整的请求大概要经历域名解析（或者是服务发现）、建立连接、发送请求这几个步骤，现在 iptables 用不了，其他依赖 Kernel 的劫持方案暂时也用不了，我们将目光转向第一步——服务发现。百度生产环境的服务基本都依赖 Naming 系统来解析服务真实的 ip 列表，我们只需要让 Naming 系统返回 Envoy 的 ip 地址，就能将服务的 Outbound 流量劫持到 Envoy。 
  
如图4 所示，Naming Agent 是单机上负责服务发现的 Agent。Client 在发送请求前，会先去 Naming Agent 问：我想给 Server 发个请求，请给我他的地址。这时候 Naming Agent 就会把 Envoy 的地址当成 Server 的地址告诉 Client。接下来 Client 就会乖乖的把请求发给 Envoy，Envoy 再根据一系列的策略把请求转发给 Server。 
  
图4 Outbound 流量劫持 
  
这种劫持机制的好处在于改造事项集中在 Naming 系统，使用该 Naming 系统的服务都能通过该方案透明的完成 Outbound 流量劫持。 
  
另外，基于 Naming 系统的流量劫持机制可以动态回传流量治理参数给业务服务，如超时、重试等。这种能力的其中一个用途是可以避免 Mesh 劫持后的多级重试导致服务雪崩，具体做法如图5 所示，当业务流量被 Envoy 劫持后，Envoy 会通过 Naming Agent 将业务服务的重试次数置为0。 
  
图5 动态回传流量治理配置 
  
  
此外，为了降低数据面（Envoy）故障时对业务服务的影响，我们还增加了数据面自动容灾、主动关闭 Mesh 等能力： 
  
 
  数据面故障自动容灾能力：当 Envoy 异常时，Naming Agent 会自动返回 Server 实际的实例列表，此时，Client 会自动回退为非 Mesh 劫持模式。  
  主动关闭 Mesh 劫持：用户也可以主动关闭 Mesh 劫持，此时，Client 也会自动回退为非 Mesh 劫持模式。  
 
  
至此，Envoy 能够劫持 Outbound 流量，但是，只有 Outbound 流量劫持能力的 Envoy 是不完整的，对于入口限流等功能，还需要具备 Inbound 流量劫持的能力。 
  
 
#### 3.2 Inbound 流量劫持
  
Inbound 流量主要来自其他机器，我们无法再依赖单机的 Naming Agent 伪造地址，得另寻出路。还是基于 Naming 系统的思路，EnvoyS 和 Server 是同机部署的，他们对外提供的地址，唯一的区别在于端口，因此，只要我们能更换 EnvoyC 访问 Server 时的端口，就能将 Inbound 流量劫持到 EnvoyS。 
  
如图4 所示，EgressPort 接收 Outbound 流量，IngressPort 接收 Inbound 流量。 
  
 
  控制面（Istio）将 EnvoyS 的 IngressPort 作为 Server 的端口下发给 EnvoyC；  
  EnvoyC 将访问 Server 的流量转发到 IngressPort，被 EnvoyS 收到。  
  EnvoyS 再将流量转发到 Server 服务端口 NamedPort。  
 
  
  
至此，Envoy 具备了部分 Inbound 流量劫持能力，为什么说是部分呢，因为这种机制无法持口服务的流量。入口服务的上游（Client）是外部服务，它的配置不受 Istio 控制，也就无法采用该机制完成流量劫持，后续需进一步完善该能力。 
  
 
##### Inbound 流量劫持中的坑
  
除了上面提到的问题，Inbound 流量劫持还存在一些坑。我们发现当 EnvoyS 劫持了 Inbound 流量后，L3/L4 层通信协议的部分健康检查机制失效。 
  
L3/L4 层通信协议的主动健康检查部分功能失效 
  
原因：L3/L4 层通信协议的主动健康检查默认是检查端口存活，当流量被劫持到 EnvoyS 后，该功能实际检查的是 EnvoyS 的 IngressPort 端口存活，也就无法反馈 Server NamedPort 端口存活情况。 
  
我们目前采用的解决方案是采用两段式主动健康检查机制，两段分别是： 
  
 
  Envoy 间健康检查：EnvoyC 对 EnvoyS 的健康检查，该健康检查能够反馈 EnvoyS 和 Server 的状态。  
  Envoy 和本地 Service 间健康检查：EnvoyS 检查 Server 端口存活情况，检查结果由 EnvoyS 反馈给 EnvoyC。    
 
L3/L4 层通信 协议的异常点驱逐（被动健康检查）功能失效 
  
原因：L3/L4 层通信协议的异常点驱逐条件是连接异常，当流量被劫持到 EnvoyS 后，该功能实际上检查的是 EnvoyC 能否正常的跟 EnvoyS 建立连接，而不是 Server。 
  
我们目前采用的解决方案是完善L3/L4 层通信协议的驱逐条件，增加访问超时作为驱逐条件。因此，当 Server 异常时，EnvoyC 会因为一直无法得到应答，而将该下游标记为异常。 
 
 
### 四、总结
  
最后简单的对比下上述两种方案： 
  
  
基于服务发现的流量劫持机制目前已应用在百度App、信息流、百度地图等业务线的数百个服务、数万个实例上。这种流量劫持机制能够减少转发性能的损耗，具备数据面故障自动容灾能力，能够动态回传流量治理参数。但是该机制也缺失一些能力：无法劫持入口服务的流量，后续我们将进一步补齐该能力。 
  
  
 
  
  
  
```