---
title: 推荐系列-Loki漫谈
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 884
cover_picture: 'https://static.oschina.net/uploads/img/202008/20142150_uGHl.jpg'
abbrlink: cd16883e
date: 2021-04-14 07:54:42
---

&emsp;&emsp;Loki诞生背景 Kubernetes已经成为编排领域事实上的标准，同时Prometheus也成为基于Kubernetes平台之上、监控领域的标配。Prometheus能够收集业务metrics数据，Grafana界面展示，AlertManage...
<!-- more -->

                                                                                                                                                                                         
  
   
  #### Loki诞生背景 
   ```java 
  Kubernetes
  ``` 已经成为编排领域事实上的标准，同时 ```java 
  Prometheus
  ``` 也成为基于 ```java 
  Kubernetes
  ``` 平台之上、监控领域的标配。 ```java 
  Prometheus
  ``` 能够收集业务 ```java 
  metrics
  ``` 数据， ```java 
  Grafana
  ``` 界面展示， ```java 
  AlertManager
  ``` 告警，一站式的监控框架就此诞生。通过这一套框架可以在线监控服务运行状态，如果不正常，能够通过各种途径通知给相关人员；相关人员通过查看告警信息，通过日志分析出现问题具体原因。 
   
  我们可以进入 ```java 
  Pod
  ``` 中查询，如果 ```java 
  Pod
  ``` 进程已经崩溃，那么将无法进入容器内部，没关系， ```java 
  Pod
  ``` 所在宿主机挂载的日志文件，你不得不���询已经崩溃 ```java 
  Pod
  ``` 所在宿主机，然后通过命令行进入宿主机中查询日志，这样的话如果碰到一个服务多个副本运行在同一个节点上，那么可能会出现日志交叉打印的情况，服务崩溃还没有解决，你已经崩溃了，其实出现这种问题的真正原因是 ```java 
  Kubernetes
  ``` 超强的自动横向扩容能力，你可能无法准确预测到服务副本数量和所在节点，大多数公司是基于 ```java 
  ELK
  ``` （日志收集解决方案）搭建一套日志收集和查看平台，就这一套平台不仅耗费资源，而且需要 ```java 
  Kibina
  ``` 和 ```java 
  Grafana
  ``` 两套平台之间频繁切换，影响工作效率，为了解决此问题 ```java 
  Loki
  ``` 问世。 
  从此，一站式的监控、告警、日志分析平台解决了我们不用频繁切换系统的麻烦。 
   
  #### Loki架构设计思路 
  基于 ```java 
  Loki
  ``` 的完整的日志收集框架需要三部分完成 
   
    
     
      ```java 
  Promtail
  ``` ：日志收集客户端，以 ```java 
  DaemonSet
  ``` 方式运行在各个计算节点上、当然也可以通过 ```java 
  sidercar
  ``` 方式运行在 ```java 
  Pod
  ``` 内部。 ```java 
  Promtail
  ``` 本身可以替换为 ```java 
  fluent-bit
  ``` 或者 ```java 
  fluentd
  ```  
     
    
     
      ```java 
  Loki
  ``` :日志收集服务端，接收来自 ```java 
  Promtail
  ``` 发送的日志 
     
    
     
      ```java 
  Grafana
  ``` ：日志展示 
     
   
   ```java 
  Loki
  ``` 是一个高可用、可扩展、多租户的日志收集系统，受 ```java 
  Prometheus
  ``` 启发而出现，但 ```java 
  Loki
  ``` 侧重点在于日志并且通过客户端推送获取日志信息， ```java 
  Prometheus
  ``` 更多在于监控指标并且通过拉取获取指标信息，相比于其它日志系统具有以下优势： 
   
    
     
     非常节省资源，提供日志压缩功能。 
     
    
     
     没有把全文添加到索引中，而是把标签加入到索引中，对于用过 ```java 
  Prometheus
  ``` 的人来说，使用起来非常顺手。 
     
    
     
     非常适合存储和搜索 ```java 
  Kubernetes Pod
  ``` 的日志，因为它能够把 ```java 
  Pod
  ``` 所在的节点信息、容器信息、命名空间、标签添加到索引中。 
     
    
     
     原生支持 ```java 
  Grafana 6.0
  ``` 以上版本。 
     
   
   
  ##### Loki内部组件介绍 
   
    
   
   
    
    
      Distributor 
     
   
  它的主要功能是接收来自客户端的日志， ```java 
  Distributor
  ``` 接收到日志之后，首先会校验正确性，校验通过之后会把它划分为多个批次，并发送给 ```java 
  Ingester
  ``` 。每个发送过来的流都对应一个 ```java 
  Ingester
  ``` ，当日志发送到 ```java 
  Distributor
  ``` 之后， ```java 
  Distributor
  ``` 会根据 ```java 
  hash
  ``` 和元数据算法计算应该路由到那个 ```java 
  Ingester
  ``` 上。 
   
    
   
  其中 ```java 
  Distributor
  ``` 和 ```java 
  Ingester
  ``` 之间是通过 ```java 
  gRPC
  ``` 通信，都是无状态应用，支持横向扩展。 
   
    
    
      Ingester 
     
   
  它的主要功能是接收来自 ```java 
  Distributor
  ``` 发送的日志并写入到后端存储中，其中后端存储可以是 ```java 
  DynamoDB、 S3、 Cassandra、FS
  ``` 等等。其中需要注意， ```java 
  ingester
  ``` 会严格验证接收到的日志行是以时间戳升序接收的（即，每个日志的时间戳都比之前的日志晚一些）。 
   
    
   
   
    
   
  当 ```java 
  ingester
  ``` 收到不遵循此顺序的日志时，日志行将被拒绝，并返回错误（ ```java 
  Entry out of order
  ``` ）。 
  总结起来说，首先 ```java 
  distributor
  ``` 会接受来自外部数据流请求发送，每个数据流都有自己的一致性 ```java 
  hash
  ``` ，然后 ```java 
  distributor
  ``` 通过计算 ```java 
  hash
  ``` ，把数据流发送到正确的 ```java 
  ingester
  ``` 上面； ```java 
  ingester
  ``` 会创建 ```java 
  chunk
  ``` 或者或者追加数据到已存在 ```java 
  chunk
  ``` 上面（必须保证租户和标签唯一），最后完成数据存储。 
   
    
    
      Chunks和index 
     
   
   ```java 
  Chunks
  ``` 是 ```java 
  Loki
  ``` 长期数据存储，旨在提供查询和写入操作,支持 ```java 
  DynamoDB、Bigtable、 Cassandra、S3、FS
  ``` （单机）。 ```java 
  index
  ``` 是根据 ```java 
  chunks
  ``` 中元数据生成的索引，支持 ```java 
  DynamoDB、Bigtable、 Apache Cassandra、BoltDB
  ``` （单机）。默认情况下 ```java 
  Chunks
  ``` 使用 ```java 
  FS
  ``` 本地文件系统存储，文件系统存储存在一定的限制，大约可以存储 ```java 
  550W
  ``` 个 ```java 
  chunk
  ``` ，超过这个限制可能会有问题。 
   
    
   
   ```java 
  Index
  ``` 使用 ```java 
  BoltDB
  ``` 存储， ```java 
  BoltDB
  ``` 是相当出名的 ```java 
  Go
  ``` 实现的 ```java 
  KV
  ``` 读写引擎, 用户有 ```java 
  etcd
  ``` 等。如果需要支持高可用部署，则需要引入大数据组件 
   
    
     
     Query 
     
     
     主要负责调度前端的查询请求，首先会 
      ```java 
  Ingesters
  ``` 内存中查询数据，然后再回退到后端存储中查询数据，支持并行化查询和数据缓存。 
     
   
   
  #### Loki配置 
   ```java 
  Loki
  ``` 的配置比较多，配置在 ```java 
  /etc/loki/loki.yaml
  ``` 中，如果需要优化存储或者日志接收出现异常问题时可能需要修改配置。比如 ```java 
  Loki
  ``` 在接收客户端发送日志可能会出现发送速率超过限制，这个时候可能需要修改 ```java 
  ingestion_rate_mb
  ``` 。具体可以参考： 
   
    ```java 
  https://github.com/grafana/loki/blob/v1.5.0/docs/configuration/README.md#storage_config
  ```  
   
   
  #### Loki使用建议 
  使用 ```java 
  Loki
  ``` 的过程中，可能会疑惑，为了提升查询速度，是不是应该使用尽可能多的标签，因为 ```java 
  Loki
  ``` 本身的索引是由标签生成的，使用其它日志系统的情况下，可以通过添加尽可能多的索引解决查询速度慢的问题，这是常见的思维方式。然而 ```java 
  Loki
  ``` 数据存储设计思想是使用尽可能少的索引，因为 ```java 
  Loki
  ``` 本身会把数据存储为多个数据块，并通过标签中的索引匹配数据块。如果你觉得查询速度慢，可以重新配置分片大小和间隔，也可以通过配置的方式使用尽可能多的查询器并行查询。较小的索引和并行蛮力查询与较大/较快的全文本索引之间的这种权衡使 ```java 
  Loki
  ``` 与其他系统相比可以节省成本。操作大索引的成本和复杂性很高，而且索引一旦建立，通常是固定的，如果您要查询或不查询，则全天 ```java 
  24
  ``` 小时付费，这种设计的优点意味着您可以决定要拥有查询要求是什么，可以根据需要进行更改，同时数据被大量压缩并存储在低成本对象存储中，以将固定的运营成本降至最低，同时仍然具有令人难以置信的快速查询功能， ```java 
  Loki
  ``` 跟云原生思想也是契合的。 
   
  #### Loki安装 
   ```java 
  Loki
  ``` 的安装方式大致有四种， ```java 
  TK
  ``` （官方推荐）、 ```java 
  helm、docker
  ``` 、二进制部署，我是通过 ```java 
  k8s statefulset
  ``` 方式编排运行的。具体请参考： 
   
    ```java 
  https://github.com/grafana/loki/blob/v1.5.0/docs/installation/README.md
  ```  
   
   
  #### Promtail 
  看到这个名字就会想到 ```java 
  Prometheus
  ``` ，其实它们设计思想也是相通的，它作为一个客户端端代理运行在计算节点上，当然也可以通过边车模式运行在 ```java 
  Pod
  ``` 中，主要功能是收集日志、为日志流添加标签、推送日志。 
   
  ##### 功能配置 
   
    
     
      ```java 
  clients
  ``` ：用于配置 ```java 
  Loki
  ``` 服务端地址 
     
    
     
      ```java 
  positions
  ``` ：收集日志文件位置，在 ```java 
  Kubernetes
  ``` 中服务以 ```java 
  Pod
  ``` 形式运行， ```java 
  Pod
  ``` 生命周期有可能随时结束，所以需要记录日志收集位置并挂载到宿主机，通过位置记录方便下次继续收集。 
     
    
     
      ```java 
  scrape_configs
  ``` ：日志文件收集配置，支持收集 ```java 
  syslog、jouanl、docker、Kubernetes
  ``` 、以及日志文件。根据收集需求，自行配置。 
     
   
  详细参考： 
   
    ```java 
  https://github.com/grafana/loki/blob/v1.5.0/docs/clients/promtail/configuration.md
  ```  
   
   
  ##### 安装部署 
  推荐使用 ```java 
  DaemonSet
  ``` 方式运行，具体参考官方 ```java 
  yaml
  ``` 编排示例： 
   
    ```java 
  https://github.com/grafana/loki/blob/v1.5.0/docs/clients/promtail/installation.md
  ```  
   
  ，不在赘述。 
   
  #### Grafana配置 
   ```java 
  Grafana
  ``` 版本应该使用 ```java 
  6.0
  ``` 以上版本。 
   
    
     
      ```java 
  admin
  ``` 账号登录 
      ```java 
  Grafana
  ``` 实例 
     
    
    
      左侧菜单栏点击 
      ```java 
  Configuration > Data Sources
  ```  
     
    
    
      点击 
      ```java 
  + Add data source
  ``` 按钮 
     
    
      输入 
      ```java 
  Loki
  ``` 服务地址，如果在本地输入 
      ```java 
  http://localhost:3100
  ``` 或者 
      ```java 
  Loki svc
  ``` 地址： 
      ```java 
  https://loki:3100
  ```  
     
     
      ```java 
  
  ```  
     
    
     
      
     
    
    
      点击右侧 
      ```java 
  Explore
  ``` ，会提示 
      ```java 
  Log labels
  ``` 搜索按钮，点击即可搜索。 
     
   
   
   
  日志根据 ```java 
  label
  ``` 类型进行查询，可以根据具体关键字进行内容搜索和日志内容统计，参考logQL： 
   
    ```java 
  https://github.com/grafana/loki/blob/v1.5.0/docs/logql.md
  ```  
   
   
  #### 总结 
  以上就是我对 ```java 
  Loki
  ``` 使用过程中的心得总结， ```java 
  Loki
  ``` 用户体验良好，设计优雅，但是配置复杂，本文有很多无法覆盖到知识点，如有问题或者想深入讨论的同学请关注公众号，拉你进群讨论，希望能够帮助到大家，谢谢。 
   
  #### 推荐阅读 
  K8S集群模式下fluent-bit日志收集方案 
  Kubernetes集群环境下fluentd日志收集方案 
  轻量级日志收集转发 | fluent-bit 
  日志收集，我用洛基 
   
   
  原创不易，随手关注或者”三连“，诚挚感谢！ 
  
 
本文分享自微信公众号 - 云原生技术爱好者社区（programmer_java）。如有侵权，请联系 support@oschina.cn 删除。本文参与“OSC源创计划”，欢迎正在阅读的你也加入，一起分享。
                                        