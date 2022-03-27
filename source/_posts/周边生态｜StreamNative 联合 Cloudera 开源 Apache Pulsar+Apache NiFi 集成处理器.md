---
title: 推荐系列-周边生态｜StreamNative 联合 Cloudera 开源 Apache Pulsar+Apache NiFi 集成处理器
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 255
cover_picture: 'https://oscimg.oschina.net/oscnet/aa7296d2-02f0-4a33-a824-3917698bf529.jpg'
abbrlink: 2c021445
date: 2022-03-27 11:55:56
---

&emsp;&emsp;，StreamNative 和 Cloudera 官方宣布共同开源 Apache NiFi 和 Apache Pulsar 联合解决方案，将二者集成打造成完整的边缘到云数据的流平台。 StreamNative 由 Apache Pulsar 创始团队组建...
<!-- more -->

                                                                                                                    
            程序员健身是为了保养还是保命？参与话题讨论赢好礼 >>>
            
                                                                                                     
 近日，StreamNative 和 Cloudera 官方宣布共同开源 Apache NiFi 和 Apache Pulsar 联合解决方案，将二者集成打造成完整的边缘到云数据的流平台。 
 StreamNative 由 Apache Pulsar 创始团队组建，专注于 Apache Pulsar 社区和生态构建，并围绕 Apache Pulsar 打造批流一体的云原生解决方案；Cloudera 团队包括一些 Apache NiFi 的原始开发人员，并通过 Apache NiFi 打造数据流。通过将 NiFi 与 Pulsar 集成，企业能够创建一个云原生、可扩展的实时流数据平台，来摄取、转换和分析海量数据。 
 本文将介绍该处理器的开源背景，以及如何通过简单配置设置 Apache NiFi 来大规模地生产消费来自 Pulsar 主题的消息。Cloudera 为 Data Hub 7.2.14 和更高版本的 CDF[1] 提供开箱即用的处理器。 
  
 ### 关于 Apache NiFi 
 Apache NiFi[2] 初始的项目名称是 Niagara Files，是由美国国家安全局(NSA)贡献给 Apache 软件基金会的开源项目，其设计初衷是自动化系统间的数据流。2015 年 7 月，NiFi 从 Apache 软件基金会毕业并成为 Apache 软件基金会的顶级项目。 
 NiFi 实现了基于流编程的一种可视化工具，用户可以通过 NiFi 构建将数据从一个平台（如数据库、云存储和消息系统）移动到另一个平台的数据流。 
 NiFi 可帮助用户自动在不同数据源和系统之间移动数据，保证数据摄取的快速、简单和安全；NiFi 提供实时控制来轻松管理任何来源和任何目的地之间的数据移动；它还提供事件级别的数据溯源和可追溯性，用户可以将每条数据追溯到其源头。 
 NiFi 平台包含 100 多个预构建处理器的集合，可用于从数据源向数据目的地对数据进行丰富、路由等转换。 
  
 ### 关于 Apache Pulsar 
 Apache Pulsar 是云原生时代消息队列和流融合系统，提供统一的消费模型，支持消息队列和流两种场景，既能为队列场景提供企业级读写服务质量和强一致性保障，又能为流场景提供高吞吐、低延迟；采用存储计算分离架构，支持大集群、多租户、百万级 Topic、跨地域数据复制、持久化存储、分层存储、高可扩展性等企业级和金融级功能。 
 Pulsar 的核心是使用复制的分布式 ledger 来提供持久的流存储，保证轻松扩展以保留 PB 级的数据。Pulsar 的可扩展流存储使其成为事件数据的完美长期存储库。通过其消息保留策略，用户可以无限期地保留历史事件数据，方便在未来随时对事件数据进行流式分析。 
  
 ### 处理器：将 Apache Pulsar 与 Apache NiFi 互补 
 Apache NiFi 和 Apache Pulsar 的功能在现代流数据架构中相互补充。NiFi 提供了���种数据流解决方案，可自动执行软件系统之间的数据流。因此，它可以充当不同数据源之间的短期缓冲区，而不是长期的数据存储库。 
 相反，Pulsar 旨在充当事件数据的长期存储库，并提供与常见的流处理框架（如 Flink 和 Spark）的强大集成。通过结合这两种技术，用户可以创建一个强大的实时数据处理和分析平台。 
 这些技术结合所实现的协同效应将在数据平台中得到显著体现。NiFi 提供了用户所有的数据流管理需求，包括优先级、背压和边缘智能。 
 用户可以使用 NiFi 广泛的连接器套件来自动将数据流到消息流平台，同时执行 ETL 处理。数据转换后，可以通过这些专为 Apache Pulsar 设计的 NiFi 处理器直接路由到 Pulsar 的持久流存储，以便长期保留。 
 一旦数据存储在 Pulsar 中，就可以随时供如 Flink 或 Spark 等各种常见的流处理引擎使用，将数据用于更复杂的流处理和分析场景。 
 简而言之，NiFi 丰富的连接器允许用户轻松地将数据“输入”到消息流平台，同时保证 Pulsar 与 Flink 或者 Spark 的集成可以轻松获得实时洞察。 
 Apache Pulsar 和 Apache NiFi 的结合创建了一个完整的边缘到云数据的流平台，可跨多个��用程序提供实时洞察。该集成适用于多个行业和场景，举例来说，在网络安全行业，用户需要尽快识别和检测威胁，要求系统具有摄取和解析日志数据的能力；制造业、采矿业以及石油和天然气等众多行业都需要能够从不同位置摄取大量 IoT 传感器数据，企业需要近实时地分析这些海量数据，以防止灾难性的设备故障和/或防止可能导致的运营突然中断；在金融服务行业，算法交易或加密货币套利等时间敏感型应用要求系统具有近实时地摄取和处理数据的能力。 
  
 ### 视频演示 
 接下来让我们来看看这些处理器的实际应用。本视频演示了配置和使用这些处理器向 Apache Pulsar 集群发送数据并从其接收数据的过程。 
 视频演示： 
  
 从视频演示中可以看到，一共有四个处理器： 
 ```java 
  PublishPulsar
  ``` 
  和  
 ```java 
  PublishPulsarRecord
  ``` 
  用于向 Pulsar 发布数据； 
 ```java 
  ConsumePulsar
  ``` 
  和  
 ```java 
  ConsumePulsarRecord
  ``` 
  用于消费来自 Pulsar 的数据。bundle 中还包含两个控制器服务：一个用于创建 Pulsar 客户端，另一个用于身份验证以保护 Pulsar 集群。 
  
 ### 使用处理器 
 这些处理器在公有云上的 CDF 7.2.14 版本及以上版本可用，参考文档[3]。如果您希望在其他 Apache NiFi 集群中使用这些处理器，可以直接从 Maven 中央代码仓库[4]下载工件，或者直接通过源代码构建[5]。 
  
 ### 相关阅读 
  
  • Pulsar Summit 演讲视频: 边缘 AI 场景中 FLiPN 技术栈(Flink, NiFi, Pulsar)的应用[6] 
  • 下载演示代码[7] 开始运行处理器。 
   
   • Producing and Consuming Pulsar messages with Apache NiFi[8] 
   • FLiP-Transit GitHub 仓库[9] 
   • FLiPN-Demos GitHub 仓库[10] 
   
  
  
  
 ###### 引用链接 
  
 ```java 
  [1]
  ``` 
  CDF: https://docs.cloudera.com/cdf-datahub/7.2.14/release-notes/topics/cdf-datahub-supported-partner-components.html 
 ```java 
  [2]
  ``` 
  Apache NiFi: https://nifi.apache.org/ 
 ```java 
  [3]
  ``` 
  文档: https://docs.cloudera.com/cdf-datahub/7.2.14/release-notes/topics/cdf-datahub-supported-partner-components.html 
 ```java 
  [4]
  ``` 
  Maven 中央代码仓库: https://search.maven.org/search?q=g:io.streamnative.connectors%20nifi 
 ```java 
  [5]
  ``` 
  构建: https://github.com/streamnative/pulsar-nifi-bundle 
 ```java 
  [6]
  ``` 
  边缘 AI 场景中 FLiPN 技术栈(Flink, NiFi, Pulsar)的应用: https://www.bilibili.com/video/BV1TP4y1P7TV 
 ```java 
  [7]
  ``` 
  演示代码: https://github.com/tspannhw/FLiPN-NFT 
 ```java 
  [8]
  ``` 
  Producing and Consuming Pulsar messages with Apache NiFi: https://www.datainmotion.dev/2021/11/producing-and-consuming-pulsar-messages.html 
 ```java 
  [9]
  ``` 
  FLiP-Transit GitHub 仓库: https://github.com/tspannhw/FLiP-Transit 
 ```java 
  [10]
  ``` 
  FLiPN-Demos GitHub 仓库: https://github.com/tspannhw/FLiPN-Demos 
  
 ▼ 关注「Apache Pulsar」，获取更多技术干货 ▼ 
  
   
  
 👇🏻加入 Apache Pulsar 中文交流群👇🏻 
  
 
本文分享自微信公众号 - ApachePulsar（ApachePulsar）。如有侵权，请联系 support@oschina.cn 删除。本文参与“OSC源创计划”，欢迎正在阅读的你也加入，一起分享。
                                        