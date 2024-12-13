---
title: 推荐系列-一文读懂蓝绿发布-A-B 测试和金丝雀发布的优缺点
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 77
cover_picture: 'https://oscimg.oschina.net/oscnet/up-3c9324e4042133e99ded3e24d157789b5fa.png'
abbrlink: d5e64cd9
date: 2021-08-06 11:53:15
---

&emsp;&emsp; 背景 目前，业界已经总结出了几种常见的服务发布策略来解决版本升级过程中带来的流量有损问题。本文首先会对这些普遍的发布策略进行简单的原理解析，最后结合阿里云的云原生网关...
<!-- more -->

                                                                                                                    
#### 背景 
目前，业界已经总结出了几种常见的服务发布策略来解决版本升级过程中带来的流量有损问题。本文首先会对这些普遍的发布策略进行简单的原理解析，最后结合阿里云的云原生网关对这些发布策略进行实践。 
#### 发布策略 
被业界广泛采用的服务发布策略包括蓝绿发布、A/B 测试以及金丝雀发布。 
1、蓝绿发布 
蓝绿发布需要对服务的新版本进行冗余部署，一般新版本的机器规格和数量与旧版本保持一致，相当于该服务有两套完全相同的部署环境，只不过此时只有旧版本在对外提供服务，新版本作为热备。当服务进行版本升级时，我们只需将流量全部切换到新版本即可，旧版本作为热备。由于冗余部署的缘故，所以不必担心新版本的资源不够。如果新版本上线后出现严重的程序 BUG，那么我们只需将流量全部切回至旧版本，大大缩短故障恢复的时间。待新版本完成 BUG 修复并重新部署之后，再将旧版本的流量切换到新版本。 
蓝绿发布通过使用额外的机器资源来解决服务发布期间的不可用问题，当服务新版本出现故障时，也可以快速将流量切回旧版本。 
如图，某服务旧版本为 v1，对新版本 v2 进行冗余部署。版本升级时，将现有流量全部切换为新版本 v2。  
当新版本 v2 存在程序 BUG 或者发生故障时，可以快速切回旧版本 v1。  
蓝绿部署的优点： 1、部署结构简单，运维方便； 2、服务升级过程操作简单，周期短。 
蓝绿部署的缺点： 1、资源冗余，需要部署两套生产环境； 2、新版本故障影响范围大。 
2、A/B 测试 
相比于蓝绿发布的流量切换方式，A/B 测试基于用户请求的元信息将流量路由到新版本，这是一种基于请求内容匹配的灰度发布策略。只有匹配特定规则的请求才会被引流到新版本，常见的做法包括基于 Http Header 和 Cookie。基于 Http Header 方式的例子，例如 User-Agent 的值为 Android 的请求 （来自安卓系统的请求）可以访问新版本，其他系统仍然访问旧版本。基于 Cookie 方式的例子，Cookie 中通常包含具有业务语义的用户信息，例如普通用户可以访问新版本，VIP 用户仍然访问旧版本。 
如图，某服务当前版本为 v1，现在新版本 v2 要上线。希望安卓用户可以尝鲜新功能，其他系统用户保持不变。  
通过在监控平台观察旧版本与新版本的成功率、RT 对比，当新版本整体服务预期后，即可将所有请求切换到新版本 v2，最后为了节省资源，可以逐步下线到旧版本 v1。  
A/B 测试的优点： 1、可以对特定的请求或者用户提供服务新版本，新版本故障影响范围小； 2、需要构建完备的监控平台，用于对比不同版本之间请求状态的差异。 
A/B 测试的缺点： 1、仍然存在资源冗余，因为无法准确评估请求容量； 2、发布周期长。 
3、金丝雀发布 
在蓝绿发布中，由于存在流量整体切换，所以需要按照原服务占用的机器规模为新版本克隆一套环境，相当于要求原来1倍的机器资源。在 A/B 测试中，只要能够预估中匹配特定规则的请求规模，我们可以按需为新版本分配额外的机器资源。相比于前两种发布策略，金丝雀发布的思想则是将少量的请求引流到新版本上，因此部署新版本服务只需极小数的机器。验证新版本符合预期后，逐步调整流量权重比例，使得流量慢慢从老版本迁移至新版本，期间可以根据设置的流量比例，对新版本服务进行��容，同时对老版本服务进行缩容，使得底层资源得到最大化利用。 
如图，某服务当前版本为 v1，现在新版本 v2 要上线。为确保流量在服务升级过程中平稳无损，采用金丝雀发布方案，逐步将流量从老版本迁移至新版本。  
金丝雀发布的优点： 1、按比例将流量无差别地导向新版本，新版本故障影响范围小； 2、发布期间逐步对新版本扩容，同时对老版本缩容，资源利用率高。 
金丝雀发布的缺点： 1、流量无差别地导向新版本，可能会影响重要用户的体验； 2、发布周期长。 
#### 实践 
接下来，我们会基于阿里云的容器运维平台 ACK 以及 MSE 云原生网关对以上介绍的三种发布策略进行实践。这里我们采用最简单的业务架构来展示，即一个云原生网关、一个后端服务（响应中返回当前版本信息）和注册中心。注册中心决定了业务架构中服务发现方式，我们会分别以 K8s 容器服务和 Nacos 两种服务发现机制来实践不同的发布策略。 
1、前提条件 
• 创建了阿里云容器运维平台 ACK • 创建了 MSE 云原生网关 • 创建了 MSE 注册中心 Nacos（服务发现方式为 Nacos 时需要） 
2、服务发现方式：K8s 容器服务 
在这个例子中，我们使用 K8s 原生的服务发现方式，即通过声明式 Service API 资源将后端服务注册到 CoreDNS。例子中的后端服务提供一个查询当前版本的接口/version，并且当前版本为 v1。云原生网关深度集成 ACK，可以实时动态地从 ACK 集群中获取服务信息，方便通过云原生网关将该后端服务暴露给外部用户。 
业务架构如下图：  
1、部署 将以下资源（Service和Deployment）应用到 ACK 集群，完成后端服务的部署和发布，当前应用版本为 v1。 
 
 ```java 
  apiVersion: v1
kind: Service
metadata:
  name: httpbin
spec:
  ports:
  - port: 8080
    protocol: TCP
  selector:
    app: httpbin
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: httpbin-v1
spec:
  replicas: 3
  selector:
    matchLabels:
      app: httpbin
      version: v1
  template:
    metadata:
      labels:
        app: httpbin
        version: v1
    spec:
      containers:
      - image: specialyang/spring-cloud-httpbin-k8s:v1
        imagePullPolicy: Always
        name: spring-cloud-httpbin-k8s
        ports:
        - containerPort: 8080

  ``` 
  
在云原生网关的服务管理->来源管理中，添加目标 ACK 集群。  
在服务管理中导入要暴露给云原生网关的服务 httpbin。  
在 httpbin 服务的策略配置中添加服务版本 v1，注意需要选择对应的标签来筛选出 v1 版本的节点，因为目前我们只部署了 v1 版本，所以 v1 版本的节点数占总实例数 100%。  
在路由管理中为该服务创建一条路由规则，从而将服务暴露给外部用户。httpbin 服务暴露的 api 的 path 为/version，请求转发至服务 httpbin 的 v1 版本。  
执行以下脚本测试请求的响应结果。 
 
 ```java 
  for i in {1..10}; do curl "${GATEWAY_EXTERNAL_IP}/version"; echo "";  done
version: v1
version: v1
version: v1
version: v1
version: v1
version: v1
version: v1
version: v1
version: v1
version: v1

  ``` 
  
2、蓝绿部署 蓝绿部署需要按照服务当前版本所占用的资源状况为服务新版本申请同样的资源规格，部署完毕之后将流量整体切换到服务新版本。  
利用 K8s 的声明式 API 资源部署 httpbin 服务的新版本 v2，副本数同样是 3。 
 
 ```java 
  apiVersion: apps/v1
kind: Deployment
metadata:
  name: httpbin-v2
spec:
  replicas: 3
  selector:
    matchLabels:
      app: httpbin
      version: v2
  template:
    metadata:
      labels:
        app: httpbin
        version: v2
    spec:
      containers:
      - image: specialyang/spring-cloud-httpbin-k8s:v2
        imagePullPolicy: Always
        name: spring-cloud-httpbin-k8s
        ports:
        - containerPort: 8080

  ``` 
  
在 httpbin 服务的策略配置中添加服务版本 v2，注意需要选择对应的标签来筛选出 v2 版本的节点，集群中现在 v1 和 v2 版本的节点数一致，所以各占 50%。  
现在，我们开始利用蓝绿发布的思想将流量从 v1 整体切换至 v2，仅需要之前修改上面创建的路由规则中目标服务即可。  
执行以下脚本测试请求的响应结果。 
 
 ```java 
  for i in {1..10}; do curl "${GATEWAY_EXTERNAL_IP}/version"; echo "";  done
version: v2
version: v2
version: v2
version: v2
version: v2
version: v2
version: v2
version: v2
version: v2
version: v2

  ``` 
  
现在我们发现访问 api 资源/version 的请求的流量已经全部从 v1 切换至 v2。 
3、A/B测试 A/B 测试基于用户请求的元信息将流量路由到新版本，换句话说，就是可以根据请求内容来动态路由。举个例子，我们希望 User-Agent 的值为 Android 的请求 （来自安卓系统的请求）可以访问新版本，其他系统仍然访问旧版本。  
我们仍然利用上面实践中部署的 httpbin 的 v1，v2 的 deployment。此外，需要创建两条路由规则： • 匹配 path 为/version 的请求访问服务版本 v1 • 匹配 path 为/version，且 User-Agent 头部含有 Android 的请求访问服务版本 v2  
注意相比 version 路由规则，version-v2 的路由规则中需要增加请求头匹配规则。  
通过以下脚本测试 A/B test 的效果。 
 
 ```java 
  // user agent中不含有 android
curl ${GATEWAY_EXTERNAL_IP}/version
version: v1
// user agent中含有 android
curl -H "User-Agent: Mozilla/5.0 (Linux; Android 4.0.3)" ${GATEWAY_EXTERNAL_IP}/version
version: v2

  ``` 
  
可以看出，当前请求会按照来源的操作系统对流量进行分流。 
4、金丝雀发布 金丝雀发布允许引流一小部分流量到服务新版本，待验证通过后，逐步调大流量，直至切流完毕，期间可伴随着新版本的扩容，旧版本的缩容操作，达到资源利用率最大化。  
在金丝雀发布策略中，服务新版本的副本初始部署数无需与原始保持一致。仅需保持资源始终满足灰度流量，所以我们将新版本的副本数调为 1，可以在服务策略中服务版本模块看到当前各版本节点数的占比情况。  
清除掉其他发布策略遗留的路由规则，我们新创建一条路由规则，在目标服务中按照权重将流量转发至新旧版本。  
其中，目标服务需要配置两个目的地，httpbin 的 v1 和 v2 版本，并设置对应的流量比。  
通过以下脚本测试金丝雀发布的效果。 
 
 ```java 
  for i in {1..10}; do curl "${GATEWAY_EXTERNAL_IP}/version"; echo "";  done
version: v1
version: v1
version: v1
version: v1
version: v1
version: v2
version: v1
version: v2
version: v1
version: v1

  ``` 
  
在以上测试结果中，可以发现 10 个请求中，有 2 个是访问的新版本 v2，其流量比确实符合期望的 8:2。 
在真实业务场景中，新版本验证完毕后，就可以继续调大访问新版本的流量权重，期间注意对新版本扩容，按需对旧版本缩容。 
3、服务发现方式：Nacos 注册中心 
Kubernetes 平台为容器化应用带来了动态弹性，加快了应用交付进程，提高了底层资源的利用率，但在服务发现能力上，相比其他主流注册中心 Nacos、Consul 等，其功能完整性、可用性上略显不足。因此，即使大部分业务应用已经迁移至 Kubernetes 运维平台，但仍然选择为业务保留了原始的注册中心。 
针对这种业务场景，我们额外举例当使用 Nacos 注册中心时，如何为服务进行蓝绿发布、A/B 测试和金丝雀发布。例子中的后端服务提供一个查询当前版本的接口/version，并且当前版本为 v1。云原生网关深度集成 MSE Nacos 注册中心，可以实时动态地从 Nacos 实例中获取服务信息，方便通过云原生网关将该后端服务暴露给外部用户。 
业务架构如下图：  
1、部署 将以下资源（Deployment）应用到 ACK 集群，完成后端服务的部署，并将服务发布到 Nacos 注册中心，当前应用版本为 v1。需要注意以下几点： 
1、该 yaml 资源中变量${NACOS_SERVER_ADDRESS}需要替换为你的 MSE Nacos 地址，如果和网关在一个 VPC，那么内网域名即可；否则，你需要配置公网域名。 
2、在 K8s Service 服务发现中，Pod 中 Labels 信息可看做是节点的元数据信息。而在 Nacos 注册中心中，节点的元数据信息取决于服务注册时携带的信息。在 Spring Cloud 框架中，通过环境变量 spring.cloud.nacos.discovery.metadata.xxx 无侵入式为节点添加元数据信息，在该例子中，我们以 version 作为版本标用来区分不同版本的节点。因此，需要为业务容器添加环境变量 
 
 ```java 
  spring.cloud.nacos.discovery.metadata.version=v1。
apiVersion: apps/v1
kind: Deployment
metadata:
  name: httpbin-v1
spec:
  replicas: 3
  selector:
    matchLabels:
      app: httpbin
  template:
    metadata:
      labels:
        app: httpbin
    spec:
      containers:
      - image: specialyang/spring-cloud-httpbin-nacos:v1
        imagePullPolicy: Always
        name: spring-cloud-httpbin-nacos
        ports:
        - containerPort: 8080
        env:
        - name: spring.cloud.nacos.discovery.server-addr
          value: ${NACOS_SERVER_ADDRESS}
        - name: spring.cloud.nacos.discovery.metadata.version
          value: v1

  ``` 
  
在云原生网关的服务管理->来源管理中，添加目标 MSE Nacos 注册中心集群。  
在服务管理中导入要暴露给云原生网关的服务 httpbin，注意服务来源选择 MSE Nacos 注册中心。  
与 K8s Service 服务发现的��子一样，在策略配置中添加服务版本 v1，标签名和标签值可以选择为我们在 httpbin 服务注册时添加的元数据信息 version=v1。之后配置路由匹配 path为/version 的请求转发至 httpbin 服务的 v1 版本。 
执行以下脚本测试请求的响应结果。 
 
 ```java 
  for i in {1..10}; do curl "${GATEWAY_EXTERNAL_IP}/version"; echo "";  done
version: v1
version: v1
version: v1
version: v1
version: v1
version: v1
version: v1
version: v1
version: v1
version: v1

  ``` 
  
2、蓝绿部署 
其发布策略如下图所示：  
部署 httpbin 服务的新版本 v2，注意注册中心与上面保持一致，同时为业务容器增加环境变量 spring.cloud.nacos.discovery.metadata.version=v2，业务应用启动时会向指定 Nacos 注册服务，同时携带上用户自定义的元数据信息。云原生网关可以利用这些元数据信息来对节点区分不同的版本。 
 
 ```java 
  apiVersion: apps/v1
kind: Deployment
metadata:
  name: httpbin-v2
spec:
  replicas: 3
  selector:
    matchLabels:
      app: httpbin
  template:
    metadata:
      labels:
        app: httpbin
    spec:
      containers:
      - image: specialyang/spring-cloud-httpbin-nacos:v2
        imagePullPolicy: Always
        name: spring-cloud-httpbin-nacos
        ports:
        - containerPort: 8080
        env:
        - name: spring.cloud.nacos.discovery.server-addr
          value: ${NACOS_SERVER_ADDRESS}
        - name: spring.cloud.nacos.discovery.metadata.version
          value: v2

  ``` 
  
与 K8s Service 的例子中蓝绿发布操作一样，在 httpbin 服务的策略配置中添加服务版本 v2，然后将路由规则中的目标服务 httpbin 的 v1 版本修改为 v2 版本，发布成功之后，查看请求结果全部为 version: v2。 
3、A/B 测试 其发布策略如下图所示：  
我们同样用之前的例子，User-Agent 的值为 Android 的请求 （来自安卓系统的请求）可以访问新版本，其他系统仍然访问旧版本。涉及的路由规则的操作、与验证方式与 K8s Service 的例子一致。 
4、金丝雀发布 其发布策略如下图所示：  
同样，涉及的路由规则的操作、与验证方式与 K8s Service 的例子一致。 
#### 总结 
本文对常见的发布策略进行了简单介绍和原理解析，并以图文并茂的方式对每个发布策略进行了详细探讨，总结如下： 
• 蓝绿发布：简单理解就是流量切换，依据热备的思想，冗余部署服务新版本。 • A/B 测试：简单理解就是根据请求内容（header、cookie）将请求流量路由到服务的不同版本。 • 金丝雀发布：是一种基于流量比例的发布策略，部署一个或者一小批新版本的服务，将少量（比如 1%）的请求引流到新版本，逐步调大流量比重，直到所有用户流量都被切换新版本为止。 
云原生网关以托管的方式来作为您的流量入口，提供了丰富的流量治理能力，支持多种服务发现方式，如 K8s Service、Nacos、Eurake、ECS 和域名，并以统一的模型支持了服务版本以及灰度发布能力。在上面的实践中，可以发现两种服务发现方式仅仅是元数据信息所处的位置不同，但服务版本管理以及路由规则中的灰度发布模型都是一致的，您可以轻松学会为不同服务发现方式的服务进行灰度发布，确保版本升级过程中平滑无损。 
最后，对微服务领域感兴趣的同学，可以钉钉搜索群号 34754806 加入用户群交流、答疑。
                                        