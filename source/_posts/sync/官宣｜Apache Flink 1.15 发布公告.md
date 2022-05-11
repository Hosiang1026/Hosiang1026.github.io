---
title: 推荐系列-官宣｜Apache Flink 1.15 发布公告
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 154
cover_picture: >-
  https://img.alicdn.com/imgextra/i4/O1CN01tmtpiy1iazJYZdixL_!!6000000004430-2-tps-899-548.png
abbrlink: 67861b5
date: 2022-05-11 05:14:30
---

&emsp;&emsp; | Joe Moser & 高赟 翻译 | 高赟 Apache Flink，���为 Apache 社区最活跃的项目之一<sup>[1]</sup>，一直秉承积极开放的态度不断进行技术深耕。在此我们很荣幸的发布 Flink 1.15 版本，并...
<!-- more -->

                                                                                                                                                                                         
Apache Flink，作为 Apache 社区最活跃的项目之一<sup>[1]</sup>，一直秉承积极开放的态度不断进行技术深耕。在此我们很荣幸的发布 Flink 1.15 版本，并和大家分享这个版本令人振奋的一些功能和改进！ 
Apache Flink 核心概念之一是流 (无界数据) 批 (有界数据) 一体。流批一体极大的降低了流批融合作业的开发复杂度。在过去的几个版本中，Flink 流批一体逐渐成熟，Flink 1.15 版本中流批一体更加完善，后面我们也将继续推动这一方向的进展。目前大数据处理的一个趋势是越来越多的业务和场景采用低代码的方式进行数据分析，而 Flink SQL则是这种低代码方式数据分析的典型代表。越来越多的用户开始采用 Flink SQL 来实现他们的业务，这也是 Flink 用户和生态快速增长的重要原因之一。Apache Flink 作为数据处理生态中的重要一环，可以与许多其他技术结合在一起支持各类用户场景。在当下云原生的背景下。我们也尽可能将 Flink 与这些系统以及各类云基础设施进行无缝集成。 
在 1.15 版本中，Apache Flink 社区在上述这些方面都取得了重大进展： 
 
  1.15 版本的一大看点是改进了运维 Apache Flink 的体验：包括明确 Checkpoint 和 Savepoint 在不同作业之间的所属权，简化 Checkpoint 和 Savepoint 生命周期管理；更加无缝支持完整的自动伸缩；通过 Watermark 对齐来消除多个数据源速率不同带来的问题等  
  1.15 版本中，Flink 进一步完善流批一体的体验：继续完善部分作业完成后的 Checkpoint 操作；支持批模式下的 Window table-valued 函数，并且使其在流批混合的场景下更加易用。  
  Flink SQL 的进阶：包括能够在不丢失状态的情况下升级 SQL 作业；添加了对 JSON 相关函数的支持来简化数据的输入与输出操作。  
  Flink 作为整个数据处理生态中的一环，1.15 版本进一步提升了与云服务的交互操作性，并且添加了更多的 Sink 连接器与数据格式。最后，我们在运行时中去除了对 Scala 的依赖<sup>[2]</sup>。  
 
#### 轻松运维 Apache Flink 
长期来看，即使是由最好的工程团队来进行构建和调优，Flink 作业仍然依赖运维操作。 Flink 支持多种不同的部署模式、API、调优配置与用例，这意味着运维工作至关重要并且可能十分繁重。 
在这个版本中，我们听取了用户的反馈，对 Flink 的运维操作进行了简化，使用户能够更加轻松的进行运维。现在 Flink 明确了 Checkpoint 与 Savepoint 在不同作业之间的所属权；更加无缝支持完整的自动伸缩；通过 Watermark 对齐消除多个数据源产出速率不同带来的问题，并且初步支持了在不丢失状态的情况下升级 SQL 作业的能力。 
##### 澄清 Checkpoint 与 Savepoint 语义 
Flink 容错策略的两个重要基础概念是 Checkpoint<sup>[3]</sup> 与 Savepoint<sup>[4]</sup> (参见比较<sup>[5]</sup>)。 
Savepoint 的主要作用是支持作业修改、备份与升级等场景，它是由用户来完全控制的。而另一方面，Checkpoint 由 Flink 完全控制，用于通过支持快速恢复与重启来实现容错的能力。这两个概念十分相似，并且它们共享了很大一部分实现。 
然而，由于遵循不同的功能要求，这两个概念逐渐变得不一致，使用户看起来没有完整的顶层设计。根据用户反馈，这两个概念应该被更好地对齐和协调，最重要的是，这两个概念应该被更清晰的定义。 
在某些停止或重新启动作业的场景下，虽然逻辑上应该使用 Savepoint，但用户还是会选择使用持久化的 Checkpoint，因为 Savepoint 无法享受 Checkpoint 可以使用的一些优化而导致执行较为缓慢。但是在这种情况下，作业从持久化的 Checkpoint 重启时 (这种情况下 Checkpoint 实际上被当作 Savepoint 来使用)，对用户来说何时可以清理 Checkpoint 中的数据并不十分清楚。 
因此，在 FLIP-193: 状态所属权<sup>[6]</sup> 中，Flink 希望可以将 Savepoint 和 Checkpoint 抽像成唯一区别是所属权不同的两个概念。在 1.15 中，通过支持原生的增量 Savepoint<sup>[7]</sup>，Flink 解决了 Savepoint 的一些不足：在过去的版本中，Savepoint 总是使用标准格式以及非增量的方式，��也是导致它性能较差的原因。在 1.15 中，如果用户选择使用原生格式并且同时使用了 RocksDB 状态存储，那么Savepoint 将采用增量的方式来执行。我们也更新了相关文档来更好的概览与理解 Checkpoint 与 Savepoint 的差异。此外，关于从 Savepoint / 持久化的 Checkpoint 恢复<sup>[8]</sup>的语义，我们显式的引入了 CLAIM 与 NO_CLAIM 两种模式。对于 CLAIM 模式 Flink 将接管快照中数据的所属权，而对于 NO_CLAIM 模式，Flink 将创建它自己的副本，而由用户来负责管理与删除原始的数据。注意现在默认将采用 NO_CLAIM 模式，之前版本中从 Savepoint / 持久化的 Checkpoint 恢复的行为可以通过指定 LEGACY 模式来恢复。 
##### 基于 Reactive 模式与自适应调度器的弹性伸缩 
由于越来越多的云服务基于 Apache Flink 构建 ，Flink 项目变得越来越云原生，这使得弹性伸缩也越来越重要。 
此版本改进了 Reactive 模式<sup>[9]</sup> 的指标。Reactive 模式是一个作业级别的模式，在这种模式下， JobManager 将尝试使用所有可用的 TaskManager 上的资源。我们在 1.15 中保证了作业级别的指标在 Reactive 模式下也可以正常的工作。 
我们还为自适应调度器<sup>[10]</sup> 添加了异常历史记录。自适应调度器是一个新的调度器，它首先声明了所需的资源并且根据根据资源情况在执行前决定资源的并行度。 
此外，Flink 提高了缩减作业规模的速度：TaskManager 现在有一个专用代码路径来关闭自己，它会主动从集群中注销自己而不是依赖于心跳，从而给 JobManager 一个明确的缩减作业规模的信号。 
##### 自适应批调度器 
在 1.15 中，我们为 Apache Flink 引入了一个新的自适应批处理调度器<sup>[11]</sup>。这一调度器可以自动根据每个节点需要处理的数据量的大小自动决定批处理作业中各节点的并行度。 
此调度器的主要优点包括： 
 
  易用性：批处理作业的用户不再需要手动调优并行度。  
  自适应：自动调整并行度可以更好地适应节点消费数据集随时间发生变化的情况。  
  细粒度：每个作业节点的并行度可以单独调整。这允许 SQL 批处理作业的节点自动为每个节点选择单独选择最适合的并行度。  
 
##### 跨源节点的 Watermark 对齐 
如果一个作业中使用了多个数据源节点，并且这些数据源以不同的节奏来增长 Watermark，这可能在下游节点中产生一些问题。例如，一些算子可能需要缓存非常大量的数据，从而导致巨大的算子状态。因此，我们在这一版本中引入了 Watermark 对齐的能力。 
基于新的 Source 接口来实现的数据源节点可以启用 Watermark 对齐功能<sup>[12]</sup>。用户可以定义对齐组，如果其中某个源节点与其它节点相比Watermark领先过多，用户可以暂停从该节点中消费数据。对齐 Watermark 的理想情况是有两个或更多以不同速度产生 Watermark 的数据源节点，并且数据源节点并发与外部系统的分片数量相同的情况。 
##### SQL 版本升级 
SQL 查询的执行计划及其生成的拓扑是通过优化规则和一个基于成本的模型来得到的，这意味着即使最小的更改也可能会产生一个完全不同的拓扑。这种动态性使得在不同 Flink 版本间保证快照兼容性非常具有挑战性。在 1.15 中，社区首先通过保持拓扑不变的方式使相同的查询在升级 Flink 版本后仍然可以启动和执行。 
SQL 升级的核心是 JSON 计划 (即以 JSON 表达的查询执行计划，我们目前只有 JavaDocs 中的文档，并且仍在努力更新文档<sup>[13]</sup> )，JSON Plan 可以让 SQL 计划以结构化数据的方式被导入和导出，之前这一功能是一个内部实现，现在它将被公开以提供给用户使用。Table API 与 SQL 都会提供一种方式来编译和执行一个保证在不同版本中保持不变的执行计划。 此功能将作为实验性 MVP 功能发布。想要尝试的用户已经可以创建一个 JSON 计划，然后可以使用这一计划在升级后基于旧的算子结构恢复 Flink 作业。我们将在 1.16 中提供这一功能的完整支持。 
从长远来看，可靠的升级使 Flink SQL 可以在线上生产场景更加可靠的使用。 
##### 基于 Changelog 的状态存储 
在 Flink 1.15 中，我们引入了 MVP 特性：基于 Changelog 的状态存储<sup>[14]</sup>。这一新的状态存储旨在支持更短、更可以预测的 Checkpoint 间隔。它具有以下优势： 
 
  更短的端到端延迟：端到端延迟主要取决于 Checkpoint 机制，特别是使用了两阶段提交的支持端到端一致性的 Sink 节点的情况，这种情况下缩短 Checkpoint 周期意味着可以更快的提交数据。  
  更可预测的 Checkpoint 间隔：目前 Checkpoint 的完成时间很大程度上取决于需要保存在 Checkpoint 中的数据的大小。通过使这一数据总是可以很小，Checkpoint 的完成时间变得更加可以预测。  
  恢复工作更少：Checkpoint 越频繁，每次重启后重新处理的数据也会越少。  
 
基于 Changelog 的状态存储通过在后台不断向非易失性存储上上传状态变化的记录来实现上述目标。 
##### 可重���的清理 
在以前的 Flink 版本中，Flink 在作业结束时只尝试清理一次与作业相关的残留数据，这可能会导致在发生错误时无法完成清理。在这个版本中，Flink 将尝试重复运行清理以避免残留数据。默认情况下，Flink 将不断重试机制，直到运行成功为止。用户可以通过配置相关参数<sup>[15]</sup>来改变这种行为。禁用重试策略可以恢复 Flink 之前版本的行为。 
清理 Checkpoint 的相关工作仍在进行中，包括 FLINK-26606<sup>[16]</sup>。 
##### Open API 
Flink 现在提供遵循 Open API<sup>[17]</sup> 标准的 REST API 规范。这允许 REST API 与遵循 Open API 标准的工具直接交互。您可以在 18 找到相应规范。 
##### Application 模式的改进 
在 Application 模式<sup>[19]</sup> 下运行 Flink 时，如果用户进行了相关配置<sup>[20]</sup>，它现在可以保证作业在结束前能够正常完成 stop-with-savepoint 操作。 
在 Application 模式下运行的作业的恢复和清理也得到了改进。本地状态的元数据也可以保存在工作目录中，这使得从本地状态恢复更容易 (例如将工作目录设定在非易失的跨机器的存储中的情况，之前本地状态的元数据保存在内存中，因此在作业恢复时无法找回)。 
#### 流批一体的更多进展 
在最新版本中，我们对流批一体的支持进行了进一步的完善。 
##### 作业结束前的 Checkpoint 
在 Flink 1.14 中，添加了对作业结束前等待一次 Checkpoint 操作的支持，从而保证使用流模式处理有限数据可以保证所有被据被提交，但是在 1.14 中，该功能必须被手动启用。自上次发布以来，我们听取了用户反馈并决定默认启用它。关于这一功能的更多信息以及如何禁用此功能，请参阅 21。需要指出的是，这一默认配置的变化可能延长使用流模式处理有界数据时的执行时间，因为作业必须在结束前等待下一个 Checkpoint 完成。 
##### Window table-valued 函数 
Window table-valued 函数<sup>[22]</sup> 之前仅可用于流模式下。在 1.15 中，它们现在也可以在批模式下使用。此外，通过实现一个专门的算子，我们现在不再要求这些 Window 函数必须定义一个聚合器，从而进一步增强了 Window table-valued 函数。 
#### Flink SQL 
社区指标表明 Flink SQL 被广泛使用并且变得越来越流行。在 1.15 中社区对 Flink SQL 也做了许多改进，下文将更加详细地讨论其中两个改进。 
##### CAST / 类型系统增强 
数据以各种形式出现，但是并不是所有情况下都是用户需要的类型，因此 CAST<sup>[23]</sup> 是 SQL 中最常见的操作之一。在 Flink 1.15 中，失败的 CAST 的默认行为已从返回 null 更改为返回错误，从而使它更符合 SQL 标准。之前的行为可以通过调用新引入的 TRY_CAST 函数或通过在恢复时配置相应参数来实现。 
此外，Flink 1.15 也修正了许多 CAST 的错误并对它的功能进行了改进，从而保证结果的正确性。 
##### JSON 函数 
JSON 是最流行的数据格式之一，越来越多的 SQL 用户需要生成或读取 JSON 类型的数据。Flink 1.15 根据 SQL 2016 标准引入了多个 JSON 处理函数<sup>[24]</sup>。这些函数允许用户来使用 Flink SQL 方言检查、创建和修改 JSON 字符串。 
#### 社区支持 
Flink 的一个重要目标是使用户能够构建流数据管道来解决他们的用例。一般来说，Apache Flink 不会单独使用，而是作为更大的数据分析平台中的重要一环。因此，简化 Flink 在云环境下的使用与维护、支持无缝连接到其他系统并继续支持 Java 和 Python 等编程语言对完善 Flink 生态十分重要。 
##### 云环境互操作性 
许多用户在不同云服务提供商所提供的云基础设施中部署与使用 Flink，同时也有一些服务可以帮助用户管理部署在他们的平台上的 Flink 集群。 
在 Flink 1.15 中，我们新增了写入 Google Cloud Storage 的支持。我们还整理了 Flink 生态中的连接器并把精力放在支持 AWS 相关的生态上 (即 KDS<sup>[25]</sup> 与 Firehose<sup>[26]</sup> )。 
##### Elasticsearch Sink 
我们在 Flink 的整个连接器生态上进行了大量工作，但我们想强调 Elasticsearch Sink<sup>[27]</sup>：它是基于最新的 Sink API 来实现的，因此可以提供异步输出与端到端一致性的能力。它可以作为未来更多 Sink 实现的模板。 
##### Scala-free 的 Flink 
博文<sup>[28]</sup> 已经解释了为什么 Scala 用户现在可以结合任何 Scala 版本 (包括 Scala 3) 使用 Flink的 Java API。 
最后，删除 Scala 依赖只是清理和更新来自 Flink 生态系统的各种技术的更大工作的一部分。 
从 Flink 1.14 开始，我们移除了 Mesos 集成，隔离了 Akka，废弃了 DataSet Java API，并将 Table API 隐藏在一个抽象后面。社区的这些努力也吸引了许多用户与贡献者的关注。 
##### PyFlink 
在 Flink 1.15 之前，Python API 中用户定义的函数是在单独的 Python 进程中执行的，这将导致额外的序列化/���序��化和进程通信开销。在数据较大的场景中，例如图像处理等，这个开销变得不可忽视。此外，由于它涉及进程间通信，这一处理延迟也是不可忽略的。这些问题在延迟至关重要的场景是不可接受的，例如量化交易等。因此，在 Flink 1.15 中，我们引入了一种 “线程” 模式的新执行模式：用户自定义的函数将在 JVM 中作为线程执行，而不是在单独的 Python 进程中执行。基准测试表明在 JSON 处理等常见场景中吞吐量可以增加 2 倍，处理延迟也从几秒到微秒。需要指出的是，由于这仍然是 “线程” 模式的第一个版本，此前它仅支持 Python Table API 与 SQL 中的标量函数。我们计划在下一版本中将其扩展到 Python API 中其他类型的自定义函数。 
#### 其它 
Flink 1.15 进一步完善了对于连接器测试框架<sup>[29]</sup> 的支持，如果你想贡献一个连接器或改进一个连接器，你绝对应该看一下这部分工作。 
Flink 1.15 也添加了一些期待已久的功能，包括 CSV 格式<sup>[30]</sup> 与小文件压缩<sup>[31]</sup>。 
同时，Sink API 被升级到版本 2<sup>[32]</sup>。我们鼓励每个连接器的维护者升级到这个版本。 
#### 总结 
Apache Flink 简化了运维操作，在对齐流批处理功能取得进一步进展，改进了 SQL 组件使其变得更易于使用，并且现在可以更好地与其他系统进行集成。 
同值得一提的是社区为 CDC 连接器<sup>[33]</sup> 建立了一个新家。同时，连接器相关代码<sup>[34]</sup> 将被移动到 Flink 外一个单独的仓库中 (以 Elasticsearch Sink 作业第一个例子<sup>[35]</sup> ）。此外，现在社区新增了一个由社区维护的关于 K8s Operator<sup>[36]</sup> 的公告博客<sup>[37]</sup>。 
展望未来，社区将继续专注于使 Apache Flink 成为真正的流批一体处理系统，并致力于将 Flink 更好地集成到云原生生态系统中。 
#### 升级说明 
虽然我们的目标是尽可能支持平稳升级，但是一些改动仍然需要用户在升级到 1.15 的时候对它们的程序进行调整。请参考 Release Notes<sup>[38]</sup> 来获得在升级时需要进行的改动与可能的问题列表。其中最值得一提的是由于去除 Scala 依赖的努力，现在许多依赖项中不再需要添加 Scala 版本后缀。关于更多信息可以参考<sup>[39]</sup>。 
 
#### 贡献者列表 
Apache Flink 社区感谢对此版本做出贡献的每一位贡献者： 
Ada Wong, Ahmed Hamdy, Aitozi, Alexander Fedulov, Alexander Preuß, Alexander Trushev, Ali Bahadir Zeybek, Anton Kalashnikov, Arvid Heise, Bernard Joseph Jean Bruno, Bo Cui, Brian Zhou, Camile, ChangLi, Chengkai Yang, Chesnay Schepler, Daisy T, Danny Cranmer, David Anderson, David Moravek, David N Perkins, Dawid Wysakowicz, Denis-Cosmin Nutiu, Dian Fu, Dong Lin, Eelis Kostiainen, Etienne Chauchot, Fabian Paul, Francesco Guardiani, Gabor Somogyi, Galen Warren, Gao Yun, Gen Luo, GitHub, Gyula Fora, Hang Ruan, Hangxiang Yu, Honnix, Horace Lee, Ingo Bürk, JIN FENG, Jack, Jane Chan, Jark Wu, JianZhangYang, Jiangjie (Becket) Qin, JianzhangYang, Jiayi Liao, Jing, Jing Ge, Jing Zhang, Jingsong Lee, JingsongLi, Jinzhong Li, Joao Boto, Joey Lee, John Karp, Jon Gillham, Jun Qin, Junfan Zhang, Juntao Hu, Kexin, Kexin Hui, Kirill Listopad, Konstantin Knauf, LB-Yu, Leonard Xu, Lijie Wang, Liu Jiangang, Maciej Bryński, Marios Trivyzas, MartijnVisser, Mason Chen, Matthias Pohl, Michal Ciesielczyk, Mika, Mika Naylor, Mrart, Mulavar, Nick Burkard, Nico Kruber, Nicolas Raga, Nicolaus Weidner, Niklas Semmler, Nikolay, Nuno Afonso, Oleg Smirnov, Paul Lin, Paul Zhang, PengFei Li, Piotr Nowojski, Px, Qingsheng Ren, Robert Metzger, Roc Marshal, Roman, Roman Khachatryan, Ruanshubin, Rudi Kershaw, Rui Li, Ryan Scudellari, Ryan Skraba, Sebastian Mattheis, Sergey, Sergey Nuyanzin, Shen Zhu, Shengkai, Shuo Cheng, Sike Bai, SteNicholas, Steffen Hausmann, Stephan Ewen, Tartarus0zm, Thesharing, Thomas Weise, Till Rohrmann, Timo Walther, Tony Wei, Victor Xu, Wenhao Ji, X-czh, Xianxun Ye, Xin Yu, Xinbin Huang, Xintong Song, Xuannan, Yang Wang, Yangze Guo, Yao Zhang, Yi Tang, Yibo Wen, Yuan Mei, Yuanhao Tian, Yubin Li, Yuepeng Pan, Yufan Sheng, Yufei Zhang, Yuhao Bi, Yun Gao, Yun Tang, Yuval Itzchakov, Yuxin Tan, Zakelly, Zhu Zhu, Zichen Liu, Zongwen Li, atptour2017, baisike, bgeng777, camilesing, chenxyz707, chenzihao, chuixue, dengziming, dijkwxyz, fanrui, fengli, fenyi, fornaix, gaurav726, godfrey he, godfreyhe, gongzhongqiang, haochenhao, hapihu, hehuiyuan, hongshuboy, huangxingbo, huweihua, iyupeng, jiaoqingbo, jinfeng, jxjgsylsg, kevin.cyj, kylewang, lbb, liliwei, liming.1018, lincoln lee, liufangqi, liujiangang, liushouwei, liuyongvs, lixiaobao14, lmagic233, lovewin99, lujiefsi, luoyuxia, lz, mans2singh, martijnvisser, mayue.fight, nanmu42, oogetyboogety, paul8263, pusheng.li01, qianchutao, realdengziqi, ruanhang1993, sammieliu, shammon, shihong90, shitou, shouweikun, shouzuo1, shuo.cs, siavash119, simenliuxing, sjwiesman, slankka, slinkydeveloper, snailHumming, snuyanzin, sujun, sujun1, syhily, tsreaper, txdong-sz, unknown, vahmed-hamdy, wangfeifan, wangpengcheng, wangyang0918, wangzhiwu, wangzhuo, wgzhao, wsz94, xiangqiao123, xmarker, xuyang, xuyu, xuzifu666, yangjunhan, yangze.gyz, ysymi, yuxia Luo, zhang chaoming, zhangchaoming, zhangjiaogg, zhangjingcun, zhangjun02, zhangmang, zlzhang0122, zoucao, zp, zzccctv, 周平, 子扬, 李锐, 蒋龙, 龙三, 庄天翼 
参考链接 
[1] https://www.apache.org/foundation/docs/FY2021AnnualReport.pdf 
[2] https://flink.apache.org/2022/02/22/scala-free.html 
[3] https://nightlies.apache.org/flink/flink-docs-release-1.15/docs/ops/state/checkpoints/ 
[4] https://nightlies.apache.org/flink/flink-docs-release-1.15/docs/ops/state/savepoints/ 
[5] https://nightlies.apache.org/flink/flink-docs-release-1.15/docs/ops/state/checkpoints_vs_savepoints/ 
[6] https://cwiki.apache.org/confluence/display/FLINK/FLIP-193%3A+Snapshots+ownership 
[7] https://nightlies.apache.org/flink/flink-docs-release-1.15/docs/ops/state/savepoints/#savepoint-format 
[8] https://nightlies.apache.org/flink/flink-docs-release-1.15/docs/ops/state/savepoints/#resuming-from-savepoints 
[9] https://nightlies.apache.org/flink/flink-docs-master/docs/deployment/elastic_scaling/#reactive-mode 
[10] https://cwiki.apache.org/confluence/display/FLINK/FLIP-160%3A+Adaptive+Scheduler 
[11] https://nightlies.apache.org/flink/flink-docs-release-1.15/docs/deployment/elastic_scaling/#adaptive-batch-scheduler 
[12] https://nightlies.apache.org/flink/flink-docs-release-1.15/docs/dev/datastream/event-time/generating_watermarks/#watermark-alignment-beta 
[13] https://nightlies.apache.org/flink/flink-docs-release-1.15/api/java/org/apache/flink/table/api/CompiledPlan.html 
[14] https://nightlies.apache.org/flink/flink-docs-release-1.15/docs/ops/state/state_backends/#enabling-changelog 
[15] https://nightlies.apache.org/flink/flink-docs-release-1.15/docs/deployment/config/#retryable-cleanup 
[16] https://issues.apache.org/jira/browse/FLINK-26606 
[17] https://www.openapis.org 
[18] https://nightlies.apache.org/flink/flink-docs-master/docs/ops/rest_api/#jobmanager 
[19] https://nightlies.apache.org/flink/flink-docs-release-1.14/docs/deployment/overview/ 
[20] https://nightlies.apache.org/flink/flink-docs-release-1.15/docs/deployment/config/#execution-shutdown-on-application-finish 
[21] https://nightlies.apache.org/flink/flink-docs-release-1.15/docs/dev/datastream/fault-tolerance/checkpointing/#checkpointing-with-parts-of-the-graph-finished 
[22] https://nightlies.apache.org/flink/flink-docs-release-1.15/docs/dev/table/sql/queries/window-tvf/ 
[23] https://nightlies.apache.org/flink/flink-docs-release-1.15/docs/dev/table/types/#casting 
[24] https://nightlies.apache.org/flink/flink-docs-release-1.15/docs/dev/table/functions/systemfunctions/#json-functions 
[25] https://nightlies.apache.org/flink/flink-docs-release-1.15/docs/connectors/datastream/kinesis/ 
[26] https://nightlies.apache.org/flink/flink-docs-release-1.15/docs/connectors/datastream/firehose/ 
[27] https://nightlies.apache.org/flink/flink-docs-release-1.15/docs/connectors/datastream/elasticsearch/ 
[28] https://flink.apache.org/2022/02/22/scala-free.html 
[29] https://github.com/PatrickRen/flink/tree/master/flink-test-utils-parent/flink-connector-testing 
[30] https://nightlies.apache.org/flink/flink-docs-release-1.15/docs/connectors/datastream/formats/csv/ 
[31] https://nightlies.apache.org/flink/flink-docs-release-1.15/docs/connectors/datastream/filesystem/#compaction 
[32] https://github.com/apache/flink/blob/master/flink-core/src/main/java/org/apache/flink/api/connector/sink2/StatefulSink.java 
[33] https://ververica.github.io/flink-cdc-connectors/release-2.1/index.html 
[34] https://cwiki.apache.org/confluence/display/FLINK/Connectors 
[35] https://github.com/apache/flink-connector-elasticsearch/ 
[36] https://nightlies.apache.org/flink/flink-kubernetes-operator-docs-main/ 
[37] https://flink.apache.org/news/2022/04/03/release-kubernetes-operator-0.1.0.html 
[38] https://nightlies.apache.org/flink/flink-docs-release-1.15/release-notes/flink-1.15/ 
[39] https://flink.apache.org/2022/02/22/scala-free.html 
 
更多 Flink 相关技术问题，可扫码加入社区钉钉交流群 第一时间获取最新技术文章和社区动态，请关注公众号～ 

                                        