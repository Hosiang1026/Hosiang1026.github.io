---
title: 推荐系列-ElasticSearch结合MySQL的两种架构模式对比
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 2006
cover_picture: 'https://oscimg.oschina.net/oscnet/a26c59f2-3425-4542-9b0d-788463cda943.png'
abbrlink: bb18e6a7
date: 2021-04-15 09:46:45
---

&emsp;&emsp;数据库同步的管道架构 MySQL作为数据库的核心能力范围就是在线业务的事务处理和查询访问。因此无论单体应用也好，微服务也好，都会以多连接请求的形式，将业务数据写入MySQL；作为专业的Ela...
<!-- more -->

                                                                                                                                                                                         
   
  
 ### 数据库同步的管道架构 
 MySQL作为数据库的核心能力范围就是在线业务的事务处理和查询访问。因此无论单体应用也好，微服务也好，都会以多连接请求的形式，将业务数据写入MySQL；作为专业的Elasticsearch，往往在整个过程中，扮演着从MySQL复制数据、建立索引、提供搜索的角色。这是最普遍存在的一种应用场景。 
 往往从MySQL同步数据到Elasticsearch的过程，就属于异构系统之间的协作了，这块无论从技术选型也好，运维复杂性也好，都比单独解决两边的问题要麻烦。 
 解决MySQL和Elasticsearch两边数据复制的过程，就是需要用到管道架构了。目前看MySQL数据管道架构就是分为两种，我给它的定义（1）简单粗暴的客户端模式，（2）伪装成从属的副本模式 
 第一种简单粗暴的客户端模式 
 其实这种模式也很好理解，就是用SQL定时轮训数据表，抓取增量，然后写入Elasticsearch。常见的技术例如：logstash-jdbc-input插件 
 ![Test](https://oscimg.oschina.net/oscnet/a26c59f2-3425-4542-9b0d-788463cda943.png  'ElasticSearch结合MySQL的两种架构模式对比') 
 ![Test](https://oscimg.oschina.net/oscnet/a26c59f2-3425-4542-9b0d-788463cda943.png  'ElasticSearch结合MySQL的两种架构模式对比') 
 上述是logstash-jdbc-input插件定时查询MySQL，并且将数据表中变化的insert、update结果抓取到Logstash。然后Logstash就可以进行过滤等操作，并通过Logstash-output-elasticsearch插件输出给Elasticsearh索引。 
 这种简单粗暴的客户端模式，最大的优势就是简单！属于老少咸宜那种，缺点x也很明显，首先在这种模式下几乎所有的解决方案，都没有直接解决delete的好办法，一般需要业务操作上来同步支持。另外也可以看到logstash-jdbc-input有个schedule选项，最小时间间隔是1分钟。那么从实时性来看，也是客户端这种模式的最大问题。这个就不是说logstash-jdbc-input做不到1秒，甚至更短的间隔，而是这种模式不适合太短的间隔。 
 除了logstash-jdbc-input插件之外，还有elasticsearch-jdbc，太老了，不推荐。 
 第二种伪装成从属的副本模式 
 这种架构模式下的管道技术，设计机制就比较精巧。充分利用了MySQL的主从模式，将自己伪装成slave节点，然后通过CDC方法（数据变更捕获）获取binlog推送的变更数据，然后再用管道的思路，封装成消息推送到Kafka这样的变更分发平台，让Elasticsearch从Kafka上订阅，一会儿说加上kafka的优势，我们先看看这种伪装模式的代表——阿里的canal的具体样子 
 ![Test](https://oscimg.oschina.net/oscnet/a26c59f2-3425-4542-9b0d-788463cda943.png  'ElasticSearch结合MySQL的两种架构模式对比') 
 这张架构图，来自canal的github官网，基本上很形象的绘制了canal的架构角色，我就不单独画了。 
 图中的Master、I am a slave，就是canal把自己伪装成了MySQL Master的一个从属节点。那么主节点的binglog只要接收到数据，就会推送给canal，然后canal作为一个管道可以将binglog数据再次推送给Kafka、elasticsearch、HBase ...... 
 我们先看看这种模式的优缺点，优势非常明显，首先捕获数据的过程是实时的，你完全可以把它当成一个MySQL的从库对待，其次增、删、改的数据表操作基本上都涵盖到了，这也是伪装成MySQL从库的好处；缺点就是架构比较复杂，因为这种binlog需要使用Row模式，日志量会很大。 
 一般不推荐直接写Elasticsearch，很多文章都只是告诉你用canal的架构是MySQL+canal+kafka+elasticsearch，但从来不去加上kafka的原因，实际上canal完全可以通过自定义类直写ES。其实加上Kafka主要目的就是将MySQl-ES的同步过程的强依赖改为松耦合的异步过程。有一个原则，希望大家能记住，若参与协作的异构系统环节太多，尽量用异步，否则任何一个环节出了事，就堵死了。 
 ![Test](https://oscimg.oschina.net/oscnet/a26c59f2-3425-4542-9b0d-788463cda943.png  'ElasticSearch结合MySQL的两种架构模式对比') 
 上述的模式就是复杂，MySQL需要打开binglog（当然即便是单库运行，也强烈建议打开），无论canal需要考虑HA，还是构建Kafka集群，都要构建zookeeper集群。而且Kafka的分区模式要自定义为业务主键Hash存放，目的是让业务主键相同的操作都在一个分区上，若数据想长期存放在Kafka一份，尽量用Kafka的业务主键折叠策略，也就是相同主键消息事件，保留最新的。推送给Elasticsearch的过程中，还要再架上一个管道，例如用Logstash进行管道过滤。 
  
 ### 数据事件分发架构 
 其实并不存在Elasticsearch为主，MySQL为辅的数据同步方式。原因很简单，Elasticsearch并不是一个事务型实时操作的数据库，它的设计就是面向大吞吐量的写入，并且构建全文索引，以��集群节点的分片搜索，结果聚合。因此如果让Elasticsearch为主库的需求，基本上都是事件流驱动的数据处理了，例如：日志采集、设备数据采集、操作事件记录等。那么在事件流驱动的架构体系下，消息中间件就是数据分发的中枢，而MySQL、Elasticsearch都作为此中枢的一个分发持久层客户端而存在。 
 ![Test](https://oscimg.oschina.net/oscnet/a26c59f2-3425-4542-9b0d-788463cda943.png  'ElasticSearch结合MySQL的两种架构模式对比') 
 上图就是数据事件的一个典型分发架构： 
 各个微服务对自己产生的业务操作事件封装成日志消息推给Kafka，那么微服务就实时地完成了日志任务，对于kafka作为分发平台，对于日志一方面由Streams Process（流处理）任务进行实时聚合计算，并将聚合结果推送给MySQL，这时候的MySQL就是作为BI统计的一个基准库。流处理系统有很多，Spark streaming、Flink、Storm、Kafka Streams，当然也可以自己写个简单的线程阻塞队列来实现。另一头分发给Logstash管道，管道对日志进行元数据打标签、过滤操作后写入到ES索引，那么BI在统计过程中，下钻到明细搜索的时候，就可以通过ES查询来完成海量日志的分片并行查询与结果聚合。 
 上述的数据事件分发架构就很好地解决了既要给Elasticsearch写数据，又要给MySQL存计算结果的双重问题。当然不止是这些数据库了，还可以继续加入HDFS、HBase、MongoDB等等。只要你有需求，这就是数据事件的分发架构，其实前面提到的canal走到kafka的时候，也就成了这种架构。 
 我们可以理解第一种数据库同步的管道架构，就是解决MySQL这样的事务型数据库的复制问题，通过binglog机制，是可以做到实时性的；第二种数据事件分发架构，其实就是典型的流式计算架构，也就是大数据技术范畴的计算架构了，通过消息中间件平台，例如Kafka，当然也可以考虑RocketMQ，将原本并发事务型的计算问题，转换成了解决数据事件流吞吐量的实时计算问题，其应对的环节应该是大量且频繁的数据写入情况。 
 前往读字节创作中心——了解”读字节“更多创作内容 
 
本文分享自微信公众号 - 读字节（read-byte）。 如有侵权，请联系 support@oschina.cn 删除。 本文参与“OSC源创计划”，欢迎正在阅读的你也加入，一起分享。
                                        