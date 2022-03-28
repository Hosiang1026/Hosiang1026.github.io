---
title: 推荐系列-大数据分布式计算系统 Spark 入门核心之 RDD
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 190
cover_picture: >-
  https://developer.hs.net/storage/attachments/2022/03/17/lB5FBWsuMDdzO8SBc0MhwOQndwJl7LBSeW9aJSg6_thumb.png
abbrlink: b62620b6
date: 2021-11-24 11:55:41
---

&emsp;&emsp;：幻好 来源：https://developer.hs.net/thread/2173 概述 Apache Spark 是一个快速且通用的集群计算系统。提供 Java、Scala、Python 和 R 中的高级 API，以及支持通用执行图的优化引擎。...
<!-- more -->

                                                                                                                    
### 概述 
Apache Spark 是一个快速且通用的集群计算系统。提供 Java、Scala、Python 和 R 中的高级 API，以及支持通用执行图的优化引擎。它还支持一组丰富的高级工具，包括用于 SQL 和结构化数据处理的 Spark SQL、用于机器学习的 MLlib、用于图形处理的 GraphX 和 Spark Streaming。 
本文主要介绍Spark入门知识，以及核心 RDD 相关概念。 
 
### Spark RDD 
#### RDD 基础概念 
##### RDD 是什么 
RDD(Resilient Distributed Dataset)名为弹性分布式数据集，是 Spark 中最基本的数据抽象，代表一个不可变、可分区、里面的元素可并行计算的集合。 具体释义： 
 
 Resilient：弹性伸缩，RDD 里面的中的数据可以保存在内存中或者磁盘里面。 
 Distributed：元素是分布式存储的，可直接用于分布式计算。 
 Dataset：数据集合，可以存放很多元素。 
 
 
##### RDD 设计目的 
在许多迭代式算法(比如机器学习、图算法等)和交互式数据挖掘中，不同计算阶段之间会重用中间结果，即一个阶段的输出结果会作为下一个阶段的输入。但是，之前的 MapReduce 框架采用非循环式的数据流模型，把中间结果写入到 HDFS 中，带来了大量的数据复制、磁盘 IO 和序列化开销。且这些框架只能支持一些特定的计算模式(map/reduce)，并没有提供一种通用的数据抽象。 AMP 实验室发表的一篇关于 RDD 的���文:《Resilient Distributed Datasets: A Fault-Tolerant Abstraction for In-Memory Cluster Computing》就是为了解决这些问题的。 RDD 提供了一个抽象的数据模型，使用户不必担心底层数据的分布式特性，只需将具体的应用逻辑表达为一系列转换操作(函数)，不同 RDD 之间的转换操作之间还可以形成依赖关系，进而实现管道化，从而避免了中间结果的存储，大大降低了数据复制、磁盘 IO 和序列化开销，并且还提供了更多的API(map/reduec/filter/groupBy 等)。 
##### RDD 主要属性 
在RDD内部，每个 RDD 都具有五个主要属性： 
 
 A list of partitions（分区列表） 
 A function for computing each split（计算每个拆分的函数） 
 A list of dependencies on other RDDs（对其他 RDD 的依赖列表） 
 Optionally, a Partitioner for key-value RDDs (e.g. to say that the RDD is hash-partitioned)（可选地，一个用于键值 RDD 的分区器（例如，说 RDD 是哈希分区的）） 
 Optionally, a list of preferred locations to compute each split on (e.g. block locations for an HDFS file)（（可选）计算每个拆分的首选位置列表（例如 HDFS 文件的块位置）） 
 
 属性说明： 
 
  
   
   属性 
   说明 
   
  
  
   
   A list of partitions 
   一组分片(Partition)/一个分区(Partition)列表，即数据集的基本组成单位。对于 RDD 来说，每个分片都会被一个计算任务处理，分片数决定并行度。用户可以在创建 RDD 时指定 RDD 的分片个数，如果没有指定，那么就会采用默认值。 
   
   
   A function for computing each split 
   一个函数会被作用在每一个分区。Spark 中 RDD 的计算是以分片为单位的，compute 函数会被作用到每个分区上。 
   
   
   A list of dependencies on other RDDs 
   一个 RDD 会依赖于其他多个 RDD。RDD 的每次转换都会生成一个新的 RDD，所以 RDD 之间就会形成类似于流水线一样的前后依赖关系。在部分分区数据丢失时，Spark 可以通过这个依赖关系重新计算丢失的分区数据，而不是对 RDD 的所有分区进行重新计算。(Spark 的容错机制) 
   
   
   Optionally, a Partitioner for key-value RDDs (e.g. to say that the RDD is hash-partitioned) 
   -可选项，对于 KV 类型的 RDD 会有一个 Partitioner，即 RDD 的分区函数，默认为 HashPartitioner。 
   
   
   Optionally, a list of preferred locations to compute each split on (e.g. block locations for an HDFS file) 
   可选项,一个列表，存储存取每个 Partition 的优先位置(preferred location)。 对于一个 HDFS 文件来说，这个列表保存的就是每个 Partition 所在的块的位置。按照"移动数据不如移动计算"的理念，Spark 在进行任务调度的时候，会尽可能选择那些存有数据的 worker 节点来进行任务计算。 
   
  
 
##### RDD 数据结构 
RDD 是一个数据集的表示，不仅表示了数据集，还表示了这个数据集从哪来，如何计算，主要属性包括： 
 
 分区列表 
 计算函数 
 依赖关系 
 分区函数(默认是 hash) 
 最佳位置 
 
分区列表、分区函数、最佳位置，这三个属性其实说的就是数据集在哪，在哪计算更合适，如何分区； 计算函数、依赖关系，这两个属性其实���的是数据集怎么来的。 
#### RDD 基本操作 
##### RDD 对象创建 
 
通过  
 ```java 
  SparkContext.scala
  ``` 
  API 源码，能够了解到 RDD 可以通过以下方法创建： 
 
 由外部存储系统的数据集创建，包括本地的文件系统，还有所有 Hadoop 支持的数据集，比如 HDFS、Cassandra、HBase 等。 
 
 
 
 ```java 
  // 创建一个 SparkContext 对象
val spConf = new SparkConf().setAppName("WordCount").setMaster("local")
val spContext = new SparkContext(spConf)
// 本地系统文件创建 RDD
val textFile = spContext.textFile("src/wordCount/temp/test.txt")
// HDFS 文件创建 RDD
val textFile1 = spContext.textFile("hdfs://node1:8088/wordCount/temp/test.txt")

  ``` 
  
 
 通过已存在的 RDD 经过算子转换生成新的 RDD： 
 
 
 ```java 
  val rdd = textFile.flatMap(_.split(" "))

  ``` 
  
 
 通过已存在的集合创建新的 RDD： 
 
 
 ```java 
  val rdd1 = spContext.parallelize(Array(1,2,3,4,5,6,7,8))
val rdd2 = spContext.makeRDD(List(1,2,3,4,5,6,7,8))

  ``` 
  
 
 
 
 
##### RDD 算子概述 
RDD 中的算子即官方中称为 Operator （操作），对应 RDD 对象中的方法。 为什么不直接叫方法呢？ 
 
 之所以叫算子是为了与原 Scala 中对象的方法进行区分，因为 Scala 中对象的方法是在同一节点的内存中完成的，而 RDD 的算子是将计算逻辑发送到分布式节点（Executor 端）中执行的 
 RDD 的方法外部操作都是在 Driver 端执行，而方法内部的逻辑代码是在 Executor 端执行 
 
 
RDD 的算子分为两类： 
 
 Transformations 转换操作，返回一个新的 RDD 
 Actions 动作操作，返回值不是 RDD(无返回值或返回其他计算结果值) 
 
 
Spark 还为 RDD 提供了统计相关算子： 
 
  
   
   Operator 
   说明 
   
  
  
   
   count 
   个数 
   
   
   mean 
   均值 
   
   
   sum 
   求和 
   
   
   max 
   最大值 
   
   
   min 
   最小值 
   
   
   variance 
   方差 
   
   
   sampleVariance 
   从采样中计算方差 
   
   
   stdev 
   标准差:衡量数据的离散程度 
   
   
   sampleStdev 
   采样的标准差 
   
   
   stats 
   查看统计结果 
   
  
 
##### Transformations 
Spark RDD 支持通用的 transformations 转换算子如下列表所示： 
 
  
   
   转换算子 
   功能说明 
   
  
  
   
   map(func) 
   返回一个新的 RDD，该 RDD 由每一个输入元素经过 func 函数转换后组成 
   
   
   filter(func) 
   返回一个新的 RDD，该 RDD 由经过 func 函数计算后返回值为 true 的输入元素组成 
   
   
   flatMap(func) 
   类似于 map，但是每一个输入元素可以被映射为 0 或多个输出元素(所以 func 应该返回一个序列，而不是单一元素) 
   
   
   mapPartitions(func) 
   类似于 map，但独立地在 RDD 的每一个分���上运行，因此在类型为 T 的 RDD 上运行时，func 的函数类型必须是 Iterator[T] => Iterator[U] 
   
   
   mapPartitionsWithIndex(func) 
   类似于 mapPartitions，只是func 多了一个整型的分区索引值，因此如果RDD包含元素类型为T，则 func 必须是 Iterator  
 ```java 
  <T>
  ``` 
  => Iterator  
 ```java 
  <U>
  ``` 
  的映射函数。 
   
   
   sample(withReplacement, fraction, seed) 
   采样部分（比例取决于 fraction ）数据，同时可以指定是否使用回置采样（withReplacement），以及随机数种子(seed) 
   
   
   union(otherDataset) 
   返回源数据集和参数数据集（otherDataset）的并集 
   
   
   intersection(otherDataset) 
   返回源数据集和参数数据集（otherDataset）的交集 
   
   
   distinct([numPartitions])) 
   返回对源数据集做元素去重后的新数据集 
   
   
   groupByKey([numPartitions]) 
   只对包含键值对的RDD有效，如源RDD包含 (K, V) 对，则该算子返回一个新的数据集包含 (K, Iterable  
 ```java 
  <V>
  ``` 
 ) 对。注意：如果你需要按key分组聚合的话（如sum或average），推荐使用 reduceByKey或者 aggregateByKey 以获得更好的性能。注意：默认情况下，输出计算的并行度取决于源RDD的分区个数。当然，你也可以通过设置可选参数 numTasks 来指定并行任务的个数。 
   
   
   reduceByKey(func, [numPartitions]) 
   如果源RDD包含元素类型 (K, V) 对，则该算子也返回包含(K, V) 对的RDD，只不过每个key对应的value是经过func聚合后的结果，而func本身是一个 (V, V) => V 的映射函数。另外，和 groupByKey 类似，可以通过可选参数 numTasks 指定reduce任务的个数。 
   
   
   aggregateByKey(zeroValue)(seqOp, combOp, [numPartitions]) 
   如果源RDD包含 (K, V) 对，则返回新RDD包含 (K, U) 对，其中每个key对应的value都是由 combOp 函数 和 一个“0”值zeroValue 聚合得到。允许聚合后value类型和输入value类型不同，避免了不必要的开销。和 groupByKey 类似，可以通过可选参数 numTasks 指定reduce任务的个数。 
   
   
   sortByKey([ascending], [numPartitions]) 
   如果源RDD包含元素类型 (K, V) 对，其中K可排序，则返回新的RDD包含 (K, V) 对，并按照 K 排序（升序还是降序取决于 ascending 参数） 
   
   
   join(otherDataset, [numPartitions]) 
   如果源RDD包含元素类型 (K, V) 且参数RDD（otherDataset）包含元素类型(K, W)，则返回的新RDD中将包含内关联后key对应的 (K, (V, W)) 对。外关联(Outer joins)操作请参考 leftOuterJoin、rightOuterJoin 以及 fullOuterJoin 算子。 
   
   
   cogroup(otherDataset, [numPartitions]) 
   如果源RDD包含元素类型 (K, V) 且参数RDD（otherDataset）包含元素类型(K, W)，则返回的新RDD中包含 (K, (Iterable  
 ```java 
  <V>
  ``` 
 , Iterable  
 ```java 
  <W>
  ``` 
 ))。该算子还有个别名：groupWith 
   
   
   cartesian(otherDataset) 
   如果源RDD包含元素类型 T 且参数RDD（otherDataset）包含元素类型 U，则返回的新RDD包含前二者的笛卡尔积，其元素类型为 (T, U) 对。 
   
   
   pipe(command, [envVars]) 
   以shell命令行管道处理RDD的每个分区，如：Perl 或者 bash 脚本。RDD中每个元素都将依次写入进程的标准输入（stdin），然后按行输出到标准输出（stdout），每一行输出字符串即成为一个新的RDD元素。 
   
   
   coalesce(numPartitions) 
   将RDD的分区数减少到numPartitions。当以后大数据集被过滤成小数据集后，减少分区数，可以提升效率。 
   
   
   repartition(numPartitions) 
   将RDD数据重新混洗（reshuffle）并随机分布到新的分区中，使数据分布更均衡，新的分区个数取决于numPartitions。该算子总是需要通过网络混洗所有数据。 
   
   
   repartitionAndSortWithinPartitions(partitioner) 
   根据partitioner（spark自带有HashPartitioner和RangePartitioner等）重新分区RDD，并且在每个结果分区中按key做排序。这是一个组合算子，功能上等价于先 repartition 再在每个分区内排序，但这个算子内部做了优化（将排序过程下推到混洗同时进行），因此性能更好。 
   
  
 
 
##### Actions 
Spark RDD 支持通用的 Actions 动作算子如下列表所示： 
 
  
   
   动作算子 
   功能说明 
   
  
  
   
   reduce(func) 
   将RDD中元素按func进行聚合（func是一个 (T,T) => T 的映射函数，其中T为源RDD元素类型��并且func需要满足 交换律 和 结合律 以便支持并行计算） 
   
   
   collect() 
   将数据集中所有元素以数组形式返回驱动器（driver）程序。通常用于，在RDD进行了filter或其他过滤操作后，将一个足够小的数据子集返回到驱动器内存中。 
   
   
   count() 
   返回数据集中元素个数 
   
   
   first() 
   返回数据集中首个元素（类似于 take(1) ） 
   
   
   take(n) 
   返回数据集中前 n 个元素 
   
   
   takeSample(withReplacement, num, [seed]) 
   返回数据集的随机采样子集，最多包含 num 个元素，withReplacement 表示是否使用回置采样，最后一个参数为可选参数seed，随机数生成器的种子。 
   
   
   takeOrdered(n, [ordering]) 
   按元素排序（可以通过 ordering 自定义排序规则）后，返回前 n 个元素 
   
   
   saveAsTextFile(path) 
   将数据集中元素保存到指定目录下的文本文件中（或者多个文本文件），支持本地文件系统、HDFS 或者其他任何Hadoop支持的文件系统。保存过程中，Spark会调用每个元素的toString方法，并将结果保存成文件中的一行。 
   
   
   saveAsSequenceFile(path)(Java and Scala) 
   将数据集中元素保存到指定目录下的Hadoop Sequence文件中，支持本地文件系统、HDFS 或者其他任何Hadoop支持的文件系统。适用于实现了Writable接口的键值对RDD。在Scala中，同样也适用于能够被隐式转换为Writable的类型（Spark实现了所有基本类型的隐式转换，如：Int，Double，String 等） 
   
   
   saveAsObjectFile(path)(Java and Scala) 
   将RDD元素以Java序列化的格式保存成文件，保存结果文件可以使用 SparkContext.objectFile 来读取。 
   
   
   countByKey() 
   只适用于包含键值对(K, V)的RDD，并返回一个哈希表，包含 (K, Int) 对，表示每个key的个数。 
   
   
   foreach(func) 
   在RDD的每个元素上运行 func 函数。通常被用于累加操作，如：更新一个累加器（Accumulator ） 或者 和外部存储系统互操作。注意：用 foreach 操作出累加器之外的变量可能导致未定义的行为。更详细请参考前面的“理解闭包”（Understanding closures）这一小节。 
   
  
 
 
##### RDD 算子实践 
 
 ```java 
    /**
   * 给定一个键值对 RDD： val rdd = sc.parallelize(Array(("spark",2),("hadoop",6),("hadoop",4),("spark",6)))
   * key 表示图书名称，value 表示某天图书销量 请计算每个键对应的平均值，也就是计算每种图书的每天平均销量。
   * 最终结果:("spark",4),("hadoop",5)。
   */
  def calRddDemo(sc: SparkContext): Unit = {
    val rdd = sc.parallelize(Array(("spark", 2), ("hadoop", 6), ("hadoop", 4), ("spark", 6)))
    val mapRdd = rdd.groupByKey()
  
    //    方法1
    val args1 = mapRdd.mapValues(o => o.sum / o.size).collect()
    args1.foreach(println)
  
    //    方法2
    val args2 = mapRdd.map(t => (t._1, t._2.sum / t._2.size)).collect()
    args2.foreach(println)
  }

  ``` 
  
#### RDD 持久化 
Spark 中最重要的功能之一就是将数据集持久化（或缓存）在内存中，当持久化一个 RDD 时，每个节点都会将它计算的任何分区存储在内存中，并在对该数据集（或从它派生的数据集）的其他操作中重用它们。这使得未来的行动更快（通常超过 10 倍）。缓存是迭代算法和快速交互使用的关键工具。 通过使用  
 ```java 
  persist()
  ``` 
  或  
 ```java 
  cache()
  ``` 
  方法将 RDD 标记为持久化，在第一次在 Action 计算时触发，它将计算的结果保存在节点的内存中。在触发后面的 Action 时，该 RDD 将会被缓存在计算节点的内存中，并供后面重用。  
 
Spark 的缓存是容错的——如果 RDD 的任何分区丢失，它将使用最初创建它的转换自动重新计算。 
##### RDD 存储级别 
每个持久化的 RDD 都可以使用不同的存储级别进行存储，例如：允许将数据集持久化到磁盘上、将其持久化在内存中或者作为序列化的 Java 对象（以节省空间），跨节点复制它。这些通过将  
 ```java 
  StorageLevel
  ``` 
  对象传递给  
 ```java 
  persist()
  ``` 
  来设置级别。  
 ```java 
  cache()
  ``` 
  方法是使用默认存储级别的简写，即  
 ```java 
  StorageLevel.MEMORY_ONLY
  ``` 
 （将反序列化的对象存储在内存中）。 
 
  
   
   存储级别 
   说明 
   
  
  
   
   MEMORY_ONLY 
   -默认级别 
   
   
   -将 RDD 以非序列化的 Java 对象存储在 JVM 中。 
    
   
   
   -如果没有足够的内存存储 RDD，则某些分区将不会被缓存，每次需要时都会重新计算。 
    
   
   
   MEMORY_AND_DISK 
   -将 RDD 以非序列化的 Java 对象存储在 JVM 中。 
   
   
   -如果数据在内存中放不下，则溢写到磁盘上．需要时则会从磁盘上读 
    
   
   
   MEMORY_ONLY_SER 
    
   
   
   (Java and Scala) 
   -将 RDD 以序列化的 Java 对象(每个分区一个字节数组)的方式存储。 
   
   
   -通常比非序列化对象(deserialized objects)更具空间效率，特别是在使用快速序列化的情况下，但是这种方式读取数据会消耗更多的 CPU 
    
   
   
   MEMORY_AND_DISK_SER 
    
   
   
   (Java and Scala) 
   -与 MEMORY_ONLY_SER 类似，但如果数据在内存中放不下，则溢写到磁盘上，而不是每次需要重新计算它们 
   
   
   DISK_ONLY 
   -将 RDD 分区存储在磁盘上 
   
   
   MEMORY_ONLY_2, MEMORY_AND_DISK_2, etc. 
   -与上面的储存级别相同，只不过将持久化数据存为两份，备份每个分区存储在两个集群节点上 
   
   
   OFF_HEAP (experimental) 
   -与 MEMORY_ONLY_SER 类似，但将数据存储在堆外内存中。(即不是直接存储在 JVM 内存中) 
   
  
 
使用注意： 
 
 RDD 持久化/缓存的目的是为了提高后续操作的速度 
 缓存的级别有很多，默认只存在内存中，开发中使用 memory_and_disk 
 只有执行 Action 操作的时候才会真正将 RDD 数据进行持久化/缓存 
 实际开发中如果某一个 RDD 后续会被频繁的使用，可以将该 RDD 进行持久化/缓存 
 
##### RDD 容错机制 
持久化可以把数据放在内存中，虽然是快速的，但并不能完全保证数据可靠；也可以把数据放在磁盘上，也不能保证数据的完全可靠性，如磁盘使用中途损坏等。所以持久化存在一定的局限性，为了解决这一问题，就需要利用 RDD 中的 checkpoint 检查点。 ![image.png](F:\01mynotes\0317-大数据分布式计算系统 Spark\大数据分布式计算系统Spark核心之RDD.assets\1647344646657-aaa54f40-969f-4241-b963-ce61b078f512.png) checkpoint 的产生就是为了更加可靠的数据持久化，在 checkpoint 的时候一般把数据放在在 HDFS 上，这就天然的借助了 HDFS 天生的高容错、高可靠来实现数据最大程度上的安全，实现了 RDD 的容错和高可用。 将此 RDD 标记为 checkpoint 检查点，它将被保存到使用  
 ```java 
  SparkContext#setCheckpointDir
  ``` 
  设置的检查点目录内的文件中，并且将删除对其父 RDD 的所有引用。必须在此 RDD 上执行任何作业之前调用此函数。 
使用注意： 
 
 开发中为了保证数据的安全性性及读取效率，可以对频繁使用且重要的数据，先做缓存/持久化，再做 checkpint 操作。 
 强烈建议将此 RDD 持久化在内存中，否则将其保存在文件中将需要重新计算。 
 持久化和 checkpoint 的区别： 
   
   存储位置: Persist 或 Cache 方法只能保存在本地的磁盘和内存中(或者堆外内存--实验中) ，而 checkpoint 可以保存数据到 HDFS 相关的分布式存储系统上。 
   生命周期: Cache 和 Persist 的 RDD 会在程序结束后会被清除或者手动调用 unpersist 方法，而 checkpoint 的 RDD 在程序结束后依然存在，不会被删除。 
    
 
#### RDD 依赖与DAG 
##### RDD 依赖分类 
RDD 和 其子 RDD 之间的依赖关系分为两类：宽依赖(wide dependency/shuffle dependency) 、窄依赖(narrow dependency) 。 
 窄依赖：父 RDD 的一个分区只会被子 RDD 的一个分区依赖； 宽依赖：父 RDD 的一个分区会被子 RDD 的多个分区依赖（涉及到 shuffle)。 
##### RDD 依赖意义 
 
 对于窄依赖： 
 
 
 窄依赖的多个分区可以并行计算。 
 窄依赖的一个分区的数据如果丢失只需要重新计算对应的分区的数据就可以了。 
 
 
 对于宽依赖： 
 
 
 划分 Stage(阶段)的依据:对于宽依赖,必须等到上一阶段计算完成才能计算下 一阶段。 
 
##### RDD DAG 
DAG (Directed Acyclic Graph 有向无环图)指的是数据转换执行的过程，有方向，无闭环(其实就是 RDD 执行的流程)。 RDD 从一开始的创建通过一系列的转换操作就形成了 DAG 有向无环图，任务执行时，可以按照 DAG 的描述，执行真正的计算(数据被操作的一个过程)。 DAG的边界： 
 
 开始：通过 SparkContext 创建的 RDD； 
 结束：触发 Action，一旦触发 Action 就形成了一个完整的 DAG。 
 
##### DAG 划分 Stage 
一个 Spark 程序可以有多个 DAG(有几个 Action，就有几个 DAG，图中最后只有一个 Action，那么就是一个 DAG)。 一个 DAG 可以有多个 Stage(根据宽依赖/shuffle 进行划分)。  同一个 Stage 可以有多个 Task 并行执行(task 数=分区数，如上图，Stage1 中有三个分区 P1、P2、P3，对应的也有三个 Task)。 可以看到这个 DAG 中只 reduceByKey 操作是一个宽依赖，Spark 内核会以此为边界将其前后划分成不同的 Stage。 同时可以注意到，在图中 Stage1 中，从 textFile 到 flatMap 到 map 都是窄依赖，这几步操作可以形成一个流水线操作，通过 flatMap 操作生成的 partition 可以不用等待整个 RDD 计算结束，而是继续进行 map 操作，这样大大 提高了计算的效率。 
划分的意义： 一个复杂的业务逻辑如果有 shuffle，那么就意味着前面阶段产生结果后，才能执行下一个阶段，即下一个阶段的计算要依赖上一个阶段的数据。那么按照 shuffle 进行划分(也就是按照宽依赖就行划分)，就可以将一个 DAG 划分成多个 Stage/阶段，在同一个 Stage 中，会有多个算子操作，可以形成一个 pipeline 流水线，流水线内的多个平行的分区可以并行执行。 
如何划分： 对于窄依赖，partition 的转换处理在 stage 中完成计算，不划分(将窄依赖尽量放在在同一个 stage 中，可以实现流水线计算)。 对于宽依赖，由于有 shuffle 的存在，只能在父 RDD 处理完成后，才能开始接下来的计算，也就是说需要要划分 stage。 
 
#### 数据混洗 
部分 Spark 算子会触发众所周知的**混洗（Shuffle）**事件。Spark中的混洗机制是用于将数据重新分布，其结果是所有数据将在各个分区间重新分组。一般情况下，混洗需要跨执行器（executor）或跨机器复制数据，这也是混洗操作一般都比较复杂而且开销大的原因。 
##### 基本说明 
为了理解混洗阶���都发生了哪些事，首先以 reduceByKey 算子为例来看一下。reduceByKey算子会生成一个新的RDD，将源RDD中一个key对应的多个value组合进一个tuple - 然后将这些values输入给reduce函数，得到的result再和key关联放入新的RDD中。这个算子的难点在于对于某一个key来说，并非其对应的所有values都在同一个分区（partition）中，甚至有可能都不在同一台机器上，但是这些values又必须放到一起计算reduce结果。 在Spark中，通常是由于为了进行某种计算操作，而将数据分布到所需要的各个分区当中。而在计算阶段，单个任务（task）只会操作单个分区中的数据 – 因此，为了组织好每个reduceByKey中reduce任务执行时所需的数据，Spark需要执行一个多对多操作。即，Spark需要读取RDD的所有分区，并找到所有key对应的所有values，然后跨分区传输这些values，并将每个key对应的所有values放到同一分区，以便后续计算各个key对应values的reduce结果 – 这个过程就叫做混洗（Shuffle）。 虽然混洗好后，各个分区中的元素和分区自身的顺序都是确定的，但是分区中元素的顺序并非确定的。如果需要混洗后分区内的元素有序，可以参考使用以下混洗操作： 
 
 mapPartitions 使用 .sorted 对每个分区排序 
 repartitionAndSortWithinPartitions 重分区的同时，对分区进行排序，比自行组合repartition和sort更高效 
 sortBy 创建一个全局有序的RDD 
 
会导致混洗的算子有：**重分区（repartition）**类算子，如： repartition 和 coalesce；ByKey 类算子(除了计数类的，如 countByKey) 如：groupByKey 和 reduceByKey；以及Join类算子，如：cogroup 和 join. 
##### 性能影响 
混洗（Shuffle）之所以开销大，是因为混洗操作需要引入磁盘I/O，数据序列化以及网络I/O等操作。为了组织好混洗数据，Spark需要生成对应的任务集 – 一系列map任务用于组织数据，再用一系列reduce任务来聚合数据。注意这里的map、reduce是来自MapReduce的术语，和Spark的map、reduce算子并没有直接关系。 在Spark内部，单个map任务的输出会尽量保存在内存中，直至放不下为止。然后，这些输出会基于目标分区重新排序，并写到一个文件里。在reduce端，reduce任务只读取与之相关的并已经排序好的blocks。 某些混洗算子会导致非常明显的内存开销增长，因为这些算子需要在数据传输前后，在内存中维护组织数据记录的各种数据结构。特别地，reduceByKey和aggregateByKey都会在map端创建这些数据结构，而ByKey系列算子都会在reduce端创建这些数据结构。如果数据在内存中存不下，Spark会把数据吐到磁盘上，当然这回导致��外的磁盘I/O以及垃圾回收的开销。 混洗还会再磁盘上生成很多临时文件。以Spark-1.3来说，这些临时文件会一直保留到其对应的RDD被垃圾回收才删除。之所以这样做，是因为如果血统信息需要重新计算的时候，这些混洗文件可以不必重新生成。如果程序持续引用这些RDD或者垃圾回收启动频率较低，那么这些垃圾回收可能需要等较长的一段时间。这就意味着，长时间运行的Spark作业可能会消耗大量的磁盘。Spark的临时存储目录，是由spark.local.dir 配置参数指定的。 混洗行为可以由一系列配置参数来调优。参考Spark配置指南（Spark Configuration Guide）中“混洗行为”这一小节。 
#### 共享变量 
默认情况下，当 Spark 在集群的多个不同节点的多个任务上并行运行一个函数时，它会把函数中涉及到的每个变量，在每个任务上都生成一个副本。但有时需要在多个任务之间共享变量，或者在任务（Task）和任务控制节点（Driver Program）之间共享变量。 为了满足这种需求，Spark 提供了两种类型的变量： 
 
 累加器（Accumulators）：累加器支持在所有不同节点之间进行累加计算（比如：计数、求和）。 
 广播变量（Broadcast Variables）：广播变量用来把变量在所有节点的内存之间进行共享，在每个机器上缓存一个只读的变量，而不是为机器上的每个任务都生成一个副本。 
 
##### Accumulators 
累加器（Accumulators）是仅通过关联和交换操作“添加”到的变量，因此可以有效地并行支持。它们可用于实现计数器（如在 MapReduce 中）或求和。 Spark 原生支持数值类型的累加器，程序员可以添加对新类型的支持。 作为用户，您可以创建命名或未命名的累加器。如下图所示，一个命名的累加器（在此实例中为计数器）将显示在修改该累加器的阶段的 Web UI 中。 Spark 在“Tasks”表中显示由任务修改的每个累加器的值。 
 
 ```java 
  scala> val accum = sc.longAccumulator("My Accumulator")
accum: org.apache.spark.util.LongAccumulator = LongAccumulator(id: 0, name: Some(My Accumulator), value: 0)

scala> sc.parallelize(Array(1, 2, 3, 4)).foreach(x => accum.add(x))
...
10/09/29 18:41:08 INFO SparkContext: Tasks finished in 0.317106 s

scala> accum.value
res2: Long = 10

  ``` 
  
累加器使用实例： 
 
 ```java 
    /**
   * 累加器 操作实例
   *
   * 假设需要统计数据的操作数量
   *
   */
  def AccumulatorDemo(sc: SparkContext): Unit = {
    val dealRdd = sc.parallelize(Array(1, 2, 3, 4, 5, 6))
    // 1.不使用累加器
    // 直接使用普通变量进行计数，最后计算结果为0
    // 因为 foreach 中的函数是传递给 Worker 中的 Executor 执行
    // 而 counter 变量在 Driver 端定义的，会以副本形式传递给 Executor
    // 最后各个 Executor 中的 counter 累加，但 Driver 端的 counter 并不会被操作
    var counter = 0;
    dealRdd.foreach(f => counter += 1)
    println("counter = " + counter) // counter = 0

    // 2.使用累加器
    // 通过累计器能够解决普通变量无法正常计数的问题
    // 从 Spark2.0 开始 Accumulator 类已经过时，计数可以使用 LongAccumulator 工具类
    var accu: LongAccumulator = sc.longAccumulator("count name")
    dealRdd.foreach(f => accu.add(1))
    println("accumulator = " + accu.value) // accumulator = 6
  }

  ``` 
  
##### Broadcast Variables 
广播变量（Broadcast Variables）是指在每台机器上缓存一个只读变量，而不随任务一起发送它的副本。例如，它们可用于以有效的方式为每个节点提供大型输入数据集的副本。 Spark 还尝试使用高效的广播算法来分发广播变量，以降低通信成本。 Spark 动作通过一组阶段执行，由分布式“shuffle”操作分隔。 Spark 自动广播每个阶段内任务所需的公共数据。以这种方式广播的数据以序列化形式缓存，并在运行每个任务之前进行反序列化。这意味着显式创建广播变量仅在跨多个阶段的任务需要相同数据或以反序列化形式缓存数据很重要时才有用。 通过调用 SparkContext.broadcast(v) 从变量 v 创建广播变量。广播变量是 v 的一个包装器，它的值可以被访问 通过调用 value 方法。 
 
 ```java 
  scala> val broadcastVar = sc.broadcast(Array(1, 2, 3))
broadcastVar: org.apache.spark.broadcast.Broadcast[Array[Int]] = Broadcast(0)

scala> broadcastVar.value
res0: Array[Int] = Array(1, 2, 3)

  ``` 
  
广播变量使用实例： 
 
 ```java 
   /**
   * 广播变量 操作实例
   *
   * 假设需要将部门id的集合：List(2, 1, 3, 2, 0)
   * 需要通过字典索引的方式翻译成对应部门的名字,字典项如下：
   * List((0, "研发部门"), (1, "财务部门"), (2, "营销部门"), (3, "人力部门"))
   *
   */
  def BroadCastDemo(sc: SparkContext): Unit = {
    val depListRdd = sc.parallelize(List(2, 1, 3, 2, 0))
    val depDictMap: collection.Map[Int, String] = Map((0, "研发部门"), (1, "财务部门"), (2, "营销部门"), (3, "人力部门"))
    // 1.不使用广播变量
    // 不使用广播变量虽然也能实现对于部门集合id的映射
    // 但是使用的 depDictMap 变量会在 task 之间以副本形式传递，如果计算量较大对性能影响也会增加
    var depNameRdd = depListRdd.map(v => (v, depDictMap(v)))
    depNameRdd.foreach(println) // (1,财务部门) (3,人力部门) (2,营销部门) (0,研发部门) (2,营销部门)

    // 2.使用广播变量
    // 通过使用广播变量，各个 task 中都是复用同一个 broadcast 变量，减少了 task 之间的传输
    val broadcast : Broadcast[collection.Map[Int, String]]  = sc.broadcast(depDictMap)
    depNameRdd = depListRdd.map(v => (v, broadcast.value(v)))
    depNameRdd.foreach(println) // (1,财务部门) (3,人力部门) (2,营销部门) (0,研发部门) (2,营销部门)
  }

  ``` 
  
### 总结 
本文对于大数据计算系统 Spark 的入门知识和核心技术 RDD 进行了深入的剖析，希望能对学习本文的同学有所收获。
                                        