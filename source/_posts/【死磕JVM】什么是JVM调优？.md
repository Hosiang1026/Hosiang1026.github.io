---
title: 推荐系列-【死磕JVM】什么是JVM调优？
categories: 热门文章
tags:
  - Popular
author: csdn
top: 3
date: 2021-04-15 08:14:57
cover_picture: 'https://profile.csdnimg.cn/8/5/0/3_qq_14996421'
---

&emsp;&emsp;想要学习JVM调优，我们必须提前知道他们的一些参数，这样才方便我们更好的去使用他们JVM常用命令行参数JVM的命令行参数参考： https://docs.oracle.com/javase/8/docs/technotes/tools/unix/java.html1. 查看参数列表虚拟机参数分为基本和扩展两类，在命令行中输入 JAVA_HOME\bin\java就可得到基本参数列表。在命令行输入 JAVA_HOME\bin\java –X就可得到扩展参数列表。2. 基本参数说明：-clien
<!-- more -->

        
                
                    
                        
                    
                    想要学习JVM调优，我们必须提前知道他们的一些参数，这样才方便我们更好的去使用他们 
#### JVM常用命令行参数 
JVM的命令行参数参考： https://docs.oracle.com/javase/8/docs/technotes/tools/unix/java.html 
###### 1. 查看参数列表 
虚拟机参数分为基本和扩展两类，在命令行中输入  
 ```java 
  JAVA_HOME\bin\java
  ``` 
 就可得到基本参数列表。 在命令行输入  
 ```java 
  JAVA_HOME\bin\java –X
  ``` 
 就可得到扩展参数列表。 
###### 2. 基本参数说明： 
 
 
 
 
 
 
###### 3. 扩展参数说明： 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
#### 虚拟机参数分类 
标准： - 开头，所有的HotSpot都支持 非标准：-X 开头，特定版本HotSpot支持特定命令 不稳定：-XX 开头，下个版本可能取消 
例如：java -version、java -X 
 
 ```java 
  import java.util.List;
import java.util.LinkedList;

public class HelloGC {
  public static void main(String[] args) {
    System.out.println("HelloGC!");
    List list = new LinkedList();
    for(;;) {
      byte[] b = new byte[1024*1024];
      list.add(b);
    }
  }
}

  ``` 
  
 
区分概念：内存泄漏memory leak，内存溢出out of memory java -XX:+PrintCommandLineFlags HelloGC java -Xmn10M -Xms40M -Xmx60M -XX:+PrintCommandLineFlags -XX:+PrintGC HelloGC PrintGCDetails PrintGCTimeStamps PrintGCCauses java -XX:+UseConcMarkSweepGC -XX:+PrintCommandLineFlags HelloGC java -XX:+PrintFlagsInitial 默认参数值 java -XX:+PrintFlagsFinal 最终参数值 java -XX:+PrintFlagsFinal | grep xxx 找到对应的参数 java -XX:+PrintFlagsFinal -version |grep GC 
#### 调优前的基础概念 
1. 吞吐量： 用户代码时间 /（用户代码执行时间 + 垃圾回收时间） 2. 响应时间： STW（Stop The World）越短，响应时间越好 
所谓的调优，首先自己要明确，想要的是什么，是吞吐量还是响应时间，还是在满足一定的响应时间的情况下，要求达到多大的吞吐量，一般来说根据业务类型去选择对应的调优方式，比如网站需要的是响应时间优先，JDK1.8尽量选G1，那如果是数据挖掘的需要使用的是吞吐量。 
#### 什么是调优 
在没有接触过调优之前我们理解的JVM调优就是解决OOM问题，OOM只是JVM调优的一部分 
一般是根据需求进行JVM规划和预调优优化运行JVM运行环境（慢，卡顿）解决JVM运行过程中出现的各种问题(OOM) 
首先的话，调优是从业务场景开始的，如果没有业务场景的JVM调优都是不靠谱的，比如有时间在实际项目中，有很多个类，成千上万个代码，你怎么知道具体是哪个代码有问题，就算我们知道有段代码频繁的full gc，但是可能过一段时间就OOM了。 
调优步骤： 
 熟悉业务场景，选定垃圾回收器（没有最好的垃圾回收器，只有最合适的垃圾回收器） 
  响应时间、停顿时间 [CMS G1 ZGC] （需要给用户作响应）吞吐量 = 用户时间 /( 用户时间 + GC时间) [PS]  选择回收器组合  计算内存需求（设置内存大小 1.5G 16G）  选定CPU：越高越好  设定年代大小、升级年龄  设定日志参数 
  -Xloggc:/opt/xxx/logs/xxx-xxx-gc-%t.log -XX:+UseGCLogFileRotation -XX:NumberOfGCLogFiles=5 -XX:GCLogFileSize=20M -XX:+PrintGCDetails -XX:+PrintGCDateStamps -XX:+PrintGCCause或者每天产生一个日志文件  
在生产环境中日志文件，后面日志名字，按照系统时间产生，循环产生，日志个数五个，每个大小20M，这样的好处在于整体大小100M，能 控制整体文件大小 
观察日志情况 
#### 调优案例 
###### 案例一 
垂直电商，最高每日百万订单，处理订单系统需要什么样的服务器配置 
这个问题比较鸡肋，因为很多不同的服务器配置都能够支撑 
 
###### 案例二 
12306遭遇春节大规模抢票应该如何支撑 订单信息每天固定，可以丢到缓存中，不同的业务逻辑有不同的业务设计，12306应该是中国并发量最大的秒杀网站，号称并发100W，就是说每秒进行百万次的业务逻辑的处理，估计淘宝一年最高的是54W并发。 
如果解决这个问题呢，看下面所示： 
CDN -》 LVS -》 NGINX -》 业务系统 -》每台机器1W并发 
普通电商的下单流程一般是： 
订单 -》下单-》 订单系统减库存 -》 等待用户付款 这个事务如果同步的方式完成，TPS是支撑不了多长时间的 
但是在12306里面的模型是 下单-》 减库存和订单同时异步进行 -》 等待付款 异步是当你下完订单之后，它一个线程去减库存，另外一个线程直接把你下单的信息扔到kafka或者redis里面直接返回OK，你下单成功后等待你付款，什么时候你付款完成后面那些个订单处理线程就会去里面拿数据，这个处理完了就会持久化到Hbase或者是mysql，一般大流量的处理方法核心思想就是：分而治之 
#### JVM优化 
比如我有一个50万PV的资料类网站（从磁盘提取文档到内存）原服务器32位，1.5G的堆，用户反馈网站比较缓慢，如果对它进行升级，新服务器64位，16G的堆内存，用户还是反馈卡顿，而且还比之前更严重，这个是因为什么呢？一般来说很多用户去浏览数据，很多数据会load到内存中，导致内存不足，频繁的GC，STW时间过长，响应时间就会变慢，那我们应该怎么办呢，使用 PS-> PN+CMS或者G1。 
还有一个就是系统CPU经常100%,我们要如何进行调优呢？ 
首先我们可以想到CPU100%那么一定有线程在占用系统资源 
 
#### 总结 
今天我们只是讲解了一些基本的操作，具体怎么操作该怎么办呢？这一部分小农会在下一部分中进行讲解，今天主要带大家了解一些常用的参数，告诉大家怎么去使用和一些前置知识，下面我会对这些问题做一个实战性的讲解，感兴趣的小伙伴记得来个一键三连，感谢大家。 
我是牧小农，怕什么真理无穷，进一步有进一步的欢喜，大家加油！！！
                
                
                
        