---
title: 推荐系列-开源分布式ID生成器UidGenerator的技术实现
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 684
cover_picture: 'https://static.oschina.net/uploads/img/202004/03131309_Vyz7.jpg'
abbrlink: 1fd59830
date: 2021-04-14 07:54:42
---

&emsp;&emsp;1、引言 很多人一想到IM应用开发，第一印象就是“长连接”、“socket”、“保活”、“协议”这些关键词，没错，这些确实是IM开发中肯定会涉及的技术范畴。 但，当你真正开始编写第一行代码时...
<!-- more -->

                                                                                                                                                                                         
### 1、引言 
很多人一想到IM应用开发，第一印象就是“长连接”、“socket”、“保活”、“协议”这些关键词，没错，这些确实是IM开发中肯定会涉及的技术范畴。 
但，当你真正开始编写第一行代码时，最现实的问题实际上是“聊天消息ID该怎么生成？”这个看似微不足道的小事情。说它看似微不足道，是因为在IM里它太平常了，处处可见它的身影。不过，虽然看似微不足道，但实际却很重要，因为它的生成算法和生成策略的优劣在某种意义上来说，决定了你的IM应用层某些功能实现的难易度。 
有签于此，即时通讯网专门整理了“IM消息ID技术专题”系列文章，希望能带给你对这个看似微小但却很重要的技术点有更深刻的理解和最佳实践思路。 
本文是专题系列文章的第5篇，专门介绍百度开源的分布式消息ID生成器UidGenerator的算法逻辑、实现思路、重点源码解读等，或许能带给你更多的启发。 
 
### 2、基本介绍 
全局ID（常见的比如：IM聊天系统中的消息ID、电商系统中的订单号、外卖应用中的订单号等）服务是分布式服务中的基础服务，需要保持全局唯一、高效、高可靠性。有些时候还可能要求保持单调，但也并非一定要严格递增或者递减。 
全局ID也可以通过数据库的自增主键来获取，但是如果要求QPS很高显然是不现实的。 
UidGenerator（备用地址）工程是百度开源的基于Snowflake算法的唯一ID生成器（百度对Snowflake算法进行了改进），引入了高性能队列高性能队列disruptor中RingBuffer思想，进一步提升了效率。 
UidGenerator是Java语言实现的，它以组件形式工作在应用项目中，支持自定义workerId位数和初始化策略,，从而适用于docker等虚拟化环境下实例自动重启、漂移等场景。  
在技术实现上，UidGenerator有以下关键特性： 
 
基于以上技术特性，UidGenerator的单机压力测试数据显示，其QPS可高达600万。 
依赖的环境： 
 
以下是UidGenerator工程的相关资源： 
 
 
### 3、什么是Snowflake算法？ 
 
#### 3.1 SnowFlake算法原理 
友情提示：本节文字内容摘选自《IM消息ID技术专题(四)：深度解密美团的分布式ID生成算法》一文，如果您想了解美团对于SnowFlake算法的理解和应用情况，可详细阅读之。 
SnowFlake 算法，是 Twitter 开源的分布式 ID 生成算法。其核心思想就是：使用一个 64 bit 的 long 型的数字作为全局唯一 ID。 
这 64 个 bit 中，其中 1 个 bit 是不用的，然后用其中的 41 bit 作为毫秒数，用 10 bit 作为工作机器 ID，12 bit 作为序列号。 
SnowFlake的ID构成： 
 
  
   
    
   
  
 
（本图引用自《IM消息ID技术专题(四)：深度解密美团的分布式ID生成算法》） 
SnowFlake的ID样本： 
 
  
   
    
   
  
 
（本图引用自《IM消息ID技术专题(四)：深度解密美团的分布式ID生成算法》） 
给大家举个例子吧，���上��所示，比如下面那个 64 bit 的 long 型数字： 
 
① 1 bit：是不用的，为啥呢？ 
因为二进制里第一个 bit 为如果是 1，那么都是负数，但是我们生成的 ID 都是正数，所以第一个 bit 统一都是 0。 
② 41 bit：表示的是时间戳，单位是毫秒。 
41 bit 可以表示的数字多达 2^41 - 1，也就是可以标识 2 ^ 41 - 1 个毫秒值，换算成年就是表示 69 年的时间。 
③ 10 bit：记录工作机器 ID，代表的是这个服务最多可以部署在 2^10 台机器上，也就是 1024 台机器。 
但是 10 bit 里 5 个 bit 代表机房 id，5 个 bit 代表机器 ID。意思就是最多代表 2 ^ 5 个机房（32 个机房），每个机房里可以代表 2 ^ 5 个机器（32 台机器）。 
④12 bit：这个是用来记录同一个毫秒内产生的不同 ID。 
12 bit 可以代表的最大正整数是 2 ^ 12 - 1 = 4096，也就是说可以用这个 12 bit 代表的数字来区分同一个毫秒内的 4096 个不同的 ID。理论上snowflake方案的QPS约为409.6w/s，这种分配方式可以保证在任何一个IDC的任何一台机器在任意毫秒内生成的ID都是不同的。 
简单来说，你的某个服务假设要生成一个全局唯一 ID，那么就可以发送一个请求给部署了 SnowFlake 算法的系统，由这个 SnowFlake 算法系统来生成唯一 ID。 
 
 1）这个 SnowFlake 算法系统首先肯定是知道自己所在的机房和机器的，比如机房 ID = 17，机器 ID = 12； 
 2）接着 SnowFlake 算法系统接收到这个请求之后，首先就会用二进制位运算的方式生成一个 64 bit 的 long 型 ID，64 个 bit 中的第一个 bit 是无意义的； 
 3）接着 41 个 bit，就可以用当前时间戳（单位到毫秒），然后接着 5 个 bit 设置上这个机房 id，还有 5 个 bit 设置上机器 ID； 
 4）最后再判断一下，当前这台机房的这台机器上这一毫秒内，这是第几个请求，给这次生成 ID 的请求累加一个序号，作为最后的 12 个 bit。 
 
最终一个 64 个 bit 的 ID 就出来了，类似于：  
 
  
   
    
   
  
 
（本图引用自《IM消息ID技术专题(四)：深度解密美团的分布式ID生成算法》） 
这个算法可以保证说，一个机房的一台机器上，在同一毫秒内，生成了一个唯一的 ID。可能一个毫秒内会生成多个 ID，但是有最后 12 个 bit 的序号来区分开来。 
下面我们简单看看这个 SnowFlake 算法的一个代码实现，这就是个示例，大家如果理解了这个意思之后，以后可以自己尝试改造这个算法。 
总之就是用一个 64 bit 的数字中各个 bit 位来设置不同的标志位，区分每一个 ID。 
 
#### 3.2 SnowFlake算法的代码实现 
SnowFlake 算法的一个典型Java实现代码，可以参见文章中的第“6.5 方案四：SnowFlake 算法的思想分析”节：《通俗易懂：如何设计能支撑百万并发的数据库架构？》，是Jack Jiang曾在某项目中实际使用过的代码。 
 
#### 3.3 SnowFlake算法的优缺点 
对于份布式的业务系统来说，SnowFlake算法的优缺点如下。 
► 优点： 
 
► 缺点： 
 
 
### 4、UidGenerator改进后的SnowFlake算法 
通过上节，我们知道了原版SnowFlake算法的基本构成。 
具体是，原版SnowFlake算法核心组成： 
 
  
   
    
   
  
 
原版SnowFlake算法各字段的具体意义是： 
 
而UidGenerator改进后的SnowFlake算法核心组成如下图： 
 
  
   
    
   
  
 
简单来说，UidGenerator能保证“指定机器 & 同一时刻 & 某一并发序列”，是唯一，并据此生成一个64 bits的唯一ID（long），且默认采用上图字节分配方式。 
与原版的snowflake算法不同，UidGenerator还支持自定义时间戳、工作机器id和序列号等各部分的位数，以应用于不同场景（详见源码实现）。 
如上图所示，UidGenerator默认ID中各数据位的含义如下： 
 
 1）sign(1bit)：固定1bit符号标识，即生成的UID为正数。 
 2）delta seconds (28 bits)：当前时间，相对于时间基点"2016-05-20"的增量值，单位：秒，最多可支持约8.7年（注意：(a)这里的单位是秒，而不是毫秒！ (b)注意这里的用词，是“最多”可支持8.7年，为什么是“最多”，后面会讲）。 
 3）worker id (22 bits)：机器id，最多可支持约420w次机器启动。内置实现为在启动时由数据库分配，默认分配策略为用后即弃，后续可提供复用策略。 
 4）sequence (13 bits)：每秒下的并发序列，13 bits可支持每秒8192个并发（注意下这个地方，默认支持qps最大为8192个）。 
 
 
### 5、UidGenerator的具体代码实现分析 
通过阅读UidGenerator的源码可知，UidGenerator的具体实现有两种选择，即 DefaultUidGenerator 和 CachedUidGenerator。我们分别来看看这两个具体代码实现的精妙之处。 
 
#### 5.1 DefaultUidGenerator 
DefaultUidGenerator 的源码很清楚的说明了几个生成ID的关键位的实现逻辑。 
1）delta seconds（28 bits）： 
这个值是指当前时间与epoch时间的时间差，且单位为秒。epoch时间就是指集成DefaultUidGenerator生成分布式ID服务第一次上线的时间，可配置，也一定要根据你的上线时间进行配置，因为默认的epoch时间可是2016-09-20，不配置的话，会浪费好几年的可用时间。 
2）worker id（22bits）： 
接下来说一下DefaultUidGenerator是如何给worker id赋值的，搭建DefaultUidGenerator的话，需要创建一个表： 
 ```java 
  DROP DATABASE IF EXISTS `xxxx`;
CREATE DATABASE `xxxx` ;
use `xxxx`;
DROP TABLE IF EXISTS WORKER_NODE;
CREATE TABLE WORKER_NODE
(
    ID BIGINT NOT NULL AUTO_INCREMENT COMMENT 'auto increment id',
    HOST_NAME VARCHAR(64) NOT NULL COMMENT 'host name',
    PORT VARCHAR(64) NOT NULL COMMENT 'port',
    TYPE INT NOT NULL COMMENT 'node type: ACTUAL or CONTAINER',
    LAUNCH_DATE DATE NOT NULL COMMENT 'launch date',
    MODIFIED TIMESTAMP NOT NULL COMMENT 'modified time',
    CREATED TIMESTAMP NOT NULL COMMENT 'created time',
    PRIMARY KEY(ID)
)
COMMENT='DB WorkerID Assigner for UID Generator', ENGINE = INNODB;
  ```  
DefaultUidGenerator会在集成用它生成分布式ID的实例启动的时候，往这个表中插入一行数据，得到的id值就是准备赋给workerId的值。由于workerId默认22位，那么，集成DefaultUidGenerator生成分布式ID的所有实例重启次数是不允许超过4194303次（即2^22-1），否则会抛出异常。 
3）sequence（13bits）： 
核心代码如下，几个实现的关键点： 
 
 
  
  
      
   
   
    
   
  
 
（上述源码节选自：DefaultUidGenerator 类中的 nextId() 方法） 
4）小结： 
通过DefaultUidGenerator的实现可知，它对时钟回拨的处理比较简单粗暴。另外如果使用UidGenerator的DefaultUidGenerator方式生成分布式ID，一定要根据你的业务的情况和特点，调整各个字段占用的位数： 
 ```java 
  <!-- Specified bits & epoch as your demand. No specified the default value will be used -->

    <property name="timeBits" value="29"/>

    <property name="workerBits" value="21"/>

    <property name="seqBits" value="13"/>

    <property name="epochStr" value="2016-09-20"/>
  ```  
 
#### 5.2 CachedUidGenerator 
CachedUidGenerator是DefaultUidGenerator的重要改进实现。它的核心利用了RingBuffer，它本质上是一个数组，数组中每个项被称为slot。CachedUidGenerator设计了两个RingBuffer，一个保存唯一ID，一个保存flag。RingBuffer的尺寸是2^n，n必须是正整数。 
以下是CachedUidGenerator中的RingBuffer原理示意图： 
 
  
   
    
   
  
 
扩展知识：什么是RingBuffer？ 
 
更多具体的 CachedUidGenerator 的代码实现，有兴趣可以仔细读一读，也可以前往百度uid-generator工程的说明页看看具体的算法原理，这里就不再赘述。 
简要的小结一下，CachedUidGenerator方式主要通过采取如下一些措施和方案规避了时钟回拨问题和增强唯一性： 
 
 1）自增列：CachedUidGenerator的workerId在实例每次重启时初始化，且就是数据库的自增ID，从而完美的实现每个实例获取到的workerId不会有任何冲突； 
 2）RingBuffer：CachedUidGenerator不再在每次取ID时都实时计算分布式ID，而是利用RingBuffer数据结构预先生成若干个分布式ID并保存； 
 3）时间递增：传统的SnowFlake算法实现都是通过System.currentTimeMillis()来获取时间并与上一次时间进行比较，这样的实现严重依赖服务器的时间。而CachedUidGenerator的时间类型是AtomicLong，且通过incrementAndGet()方法获取下一次的时间，从而脱离了对服务器时间的依赖，也就不会有时钟回拨的问题（这种���法也有一个小问题，即分布式ID中的时间信息可能并不是这个ID真正产生的时间点，例如：获取的某分布式ID的值为3200169789968523265，它的反解析结果为{"timestamp":"2019-05-02 23:26:39","workerId":"21","sequence":"1"}，但是这个ID可能并不是在"2019-05-02 23:26:39"这个时间产生的）。 
 
 
#### 5.3 小结一下 
CachedUidGenerator通过缓存的方式预先生成一批唯一ID��表，可以解决唯一ID获取时候的耗时。但这种方式也有不好点，一方面需要耗费内存来缓存这部分数据，另外如果访问量不大的情况下，提前生成的UID中的时间戳可能是很早之前的。而对于大部分的场景来说，DefaultUidGenerator 就可以满足相关的需求了，没必要来凑CachedUidGenerator这个热闹。 
另外，关于UidGenerator比特位分配的建议： 
 
 
### 6、UidGenerator的吞吐量压力测试 
UidGenerator的测试数据显示，在MacBook Pro（2.7GHz Intel Core i5, 8G DDR3）上进行的CachedUidGenerator（单实例）的UID吞吐量测试情况如下。 
首先：固定住workerBits为任选一个值(如20), 分别统计timeBits变化时(如从25至32, 总时长分别对应1年和136年)的吞吐量, 测试结果如下图所示：  
 
  
   
    
   
  
 
再固定住timeBits为任选一个值(如31), 分别统计workerBits变化时(如从20至29, 总重启次数分别对应1百万和500百万)的吞吐量, 测试结果如下图所示： 
 
  
   
    
   
  
 
由此可见：不管如何配置, CachedUidGenerator总能提供600万/s的稳定吞吐量，只是使用年限会有所减少，这真的是太棒了！ 
最后：固定住workerBits和timeBits位数(如23和31), 分别统计不同数目(如1至8,本机CPU核数为4)的UID使用者情况下的吞吐量，测试结果如下图所示： 
 
  
   
    
   
  
    （本文同步发布于： 
   http://www.52im.net/thread-2953-1-1.html） 
   
  
 
 
### 7、参考资料 
 
 
                                        