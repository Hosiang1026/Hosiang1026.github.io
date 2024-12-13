---
title: 推荐系列-手摸手教你阅读和调试大型开源项目 ZooKeeper
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 569
cover_picture: 'https://img2020.cnblogs.com/blog/759200/202101/759200-20210124161622816-1605238160.png'
abbrlink: 656a0ca5
date: 2021-04-15 10:16:56
---

&emsp;&emsp;本文作者：HelloGitHub-老荀 Hi，这里是 HelloGitHub 推出的 HelloZooKeeper 系列，免费开源、有趣、入门级的 ZooKeeper 教程，面向有编程基础的新手。 项目地址：https://github.com/HelloG...
<!-- more -->

                                                                                                                                                                                        ![Test](https://img2020.cnblogs.com/blog/759200/202101/759200-20210124161622816-1605238160.png  '手摸手教你阅读和调试大型开源项目 ZooKeeper') 
本文作者：HelloGitHub-老荀 
Hi，这里是 HelloGitHub 推出的 HelloZooKeeper 系列，免费开源、有趣、入门级的 ZooKeeper 教程，面向有编程基础的新手。 
> 项目地址：https://github.com/HelloGitHub-Team/HelloZooKeeper 
今儿就带大家打入 ZooKeeper 的源码内部！ 
![Test](https://img2020.cnblogs.com/blog/759200/202101/759200-20210124161622816-1605238160.png  '手摸手教你阅读和调试大型开源项目 ZooKeeper') 
#### 一、源码调试 
> 授人以鱼不如授人以渔 
我始终相信 “纸上得来终觉浅”，最终读者想要自己真正了解到 ZK 内部原理，阅读源码还是必不可少的，如果你们和我一样也拥有肉眼 Debug 的能力，那其实可以不用大费周章搭建源码调试环境，直接正面硬刚。 
![Test](https://img2020.cnblogs.com/blog/759200/202101/759200-20210124161622816-1605238160.png  '手摸手教你阅读和调试大型开源项目 ZooKeeper') 
但是如果没有的话，把 ZK 源码下载下来，使用称手的 IDE 直接跑起来，然后在需要学习的地方直接打断点，岂不是美滋滋 
![Test](https://img2020.cnblogs.com/blog/759200/202101/759200-20210124161622816-1605238160.png  '手摸手教你阅读和调试大型开源项目 ZooKeeper') 
##### 1.1 下载源码 
ZooKeeper 3.6.2 源码下载页面 
![Test](https://img2020.cnblogs.com/blog/759200/202101/759200-20210124161622816-1605238160.png  '手摸手教你阅读和调试大型开源项目 ZooKeeper') 
上面的链接中随便选一个下载速度快的，点击下载压缩包即可，下载完成后解压缩就会得到如下的目录结构 
 
 ```java 
  .
├── zookeeper-server
├── zookeeper-recipes
├── zookeeper-metrics-providers
├── zookeeper-jute
├── zookeeper-it
├── zookeeper-docs
├── zookeeper-contrib
├── zookeeper-compatibility-tests
├── zookeeper-client
├── zookeeper-assembly
├── zk-merge-pr.py
├── pom.xml
├── owaspSuppressions.xml
├── excludeFindBugsFilter.xml
├── dev
├── conf
├── checkstyleSuppressions.xml
├── checkstyle-strict.xml
├── checkstyle-simple.xml
├── bin
├── README_packaging.md
├── README.md
├── NOTICE.txt
├── LICENSE.txt
├── Jenkinsfile-PreCommit
└── Jenkinsfile



  ``` 
  
目录中是有  
 ```java 
  pom.xml
  ``` 
  所以 ZK 需要通过 maven 编译整个项目，先确保自己的 maven 是安装好的 
 
 ```java 
  $ mvn --version
Apache Maven 3.5.4 (1edded0938998edf8bf061f1ceb3cfdeccf443fe; 2018-06-18T02:33:14+08:00)
Maven home: /your/maven/home/apache-maven-3.5.4
Java version: 1.8.0_181, vendor: Oracle Corporation, runtime: /Library/Java/JavaVirtualMachines/jdk1.8.0_181.jdk/Contents/Home/jre
Default locale: zh_CN, platform encoding: UTF-8
OS name: "mac os x", version: "10.16", arch: "x86_64", family: "mac"



  ``` 
  
如果有这样的输出说明 maven 是安装成功的，具体安装过程我这里就略过了，如果你有困难的话，可以留言给我们 
##### 1.2 编译项目 
进入和  
 ```java 
  pom.xml
  ``` 
  同级目录中并输入 
 
 ```java 
  $ mvn install -DskipTests=true



  ``` 
  
就会看到项目在进行编译了，等到最后的输出  
 ```java 
  BUILD SUCCESS
  ``` 
 ，就说明项目编译完成了 
 
 ```java 
  [INFO] Reactor Summary:
[INFO]
[INFO] Apache ZooKeeper 3.6.2 ............................. SUCCESS [  3.621 s]
[INFO] Apache ZooKeeper - Documentation ................... SUCCESS [  2.086 s]
[INFO] Apache ZooKeeper - Jute ............................ SUCCESS [ 10.633 s]
[INFO] Apache ZooKeeper - Server .......................... SUCCESS [ 19.246 s]
[INFO] Apache ZooKeeper - Metrics Providers ............... SUCCESS [  0.108 s]
[INFO] Apache ZooKeeper - Prometheus.io Metrics Provider .. SUCCESS [  1.286 s]
[INFO] Apache ZooKeeper - Client .......................... SUCCESS [  0.083 s]
[INFO] Apache ZooKeeper - Recipes ......................... SUCCESS [  0.092 s]
[INFO] Apache ZooKeeper - Recipes - Election .............. SUCCESS [  0.244 s]
[INFO] Apache ZooKeeper - Recipes - Lock .................. SUCCESS [  0.259 s]
[INFO] Apache ZooKeeper - Recipes - Queue ................. SUCCESS [  0.295 s]
[INFO] Apache ZooKeeper - Assembly ........................ SUCCESS [  5.425 s]
[INFO] Apache ZooKeeper - Compatibility Tests ............. SUCCESS [  0.072 s]
[INFO] Apache ZooKeeper - Compatibility Tests - Curator 3.6.2 SUCCESS [  0.432 s]
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time: 44.263 s
[INFO] Finished at: 2021-01-22T13:49:30+08:00
[INFO] ------------------------------------------------------------------------



  ``` 
  
##### 1.3 打开并配置项目 
之后就可以通过你的 IDE 打开这个目录了，我这里使用的是 idea 
![Test](https://img2020.cnblogs.com/blog/759200/202101/759200-20210124161622816-1605238160.png  '手摸手教你阅读和调试大型开源项目 ZooKeeper') 
然后开始配置  
 ```java 
  Run/Debug Configurations
  ``` 
  
![Test](https://img2020.cnblogs.com/blog/759200/202101/759200-20210124161622816-1605238160.png  '手摸手教你阅读和调试大型开源项目 ZooKeeper') 
点击  
 ```java 
  +
  ``` 
  添加新的配置 
![Test](https://img2020.cnblogs.com/blog/759200/202101/759200-20210124161622816-1605238160.png  '手摸手教你阅读和调试大型开源项目 ZooKeeper') 
选择  
 ```java 
  Application
  ``` 
  
![Test](https://img2020.cnblogs.com/blog/759200/202101/759200-20210124161622816-1605238160.png  '手摸手教你阅读和调试大型开源项目 ZooKeeper') 
###### 1.3.1 单机版启动配置 
然后配置按照下图去填写或选择 
![Test](https://img2020.cnblogs.com/blog/759200/202101/759200-20210124161622816-1605238160.png  '手摸手教你阅读和调试大型开源项目 ZooKeeper') 
 
 先给这个配置起一个牛逼的名字 
 选择  
 ```java 
  Modify options
  ``` 
  打开子菜单 
 确保图中菜单中的三个子选项都被选中（前面有 √） 
 
然后我们看具体的配置 
![Test](https://img2020.cnblogs.com/blog/759200/202101/759200-20210124161622816-1605238160.png  '手摸手教你阅读和调试大型开源项目 ZooKeeper') 
在我电脑上解压缩后的项目路径为  
 ```java 
  /Users/junjiexun/Desktop/apache-zookeeper-3.6.2
  ``` 
  读者请根据自己情况修改 
 
 选择你本地 jdk （我本地是 1.8 其他版本的不知道行不行，低版本肯定是不行，因为源码中用到了 1.8 的一些写法） 
 选择  
 ```java 
  zookeeper
  ``` 
  
 配置  
 ```java 
  VM options
  ``` 
 ，内容为  
 ```java 
  -Dlog4j.configuration=file:/Users/junjiexun/Desktop/apache-zookeeper-3.6.2/conf/log4j.properties
  ``` 
 ，如果不配置的话，无法输出日志 
 指定启动类  
 ```java 
  org.apache.zookeeper.server.ZooKeeperServerMain
  ``` 
  
 单机版启动需要命令行参数，内容为  
 ```java 
  2181 /Users/junjiexun/Desktop/apache-zookeeper-3.6.2/data
  ``` 
  
 这个应该是不用修改，自动就会填上的，反正内容就是  
 ```java 
  /Users/junjiexun/Desktop/apache-zookeeper-3.6.2
  ``` 
  
 点击中间的  
 ```java 
  +
  ``` 
  添加包路径，内容为  
 ```java 
  org.apache.zookeeper.server.*
  ``` 
  
 
然后点击  
 ```java 
  Apply
  ``` 
  以及  
 ```java 
  OK
  ``` 
  完成保存。 
然后点击这个小虫子就可以启动了 
![Test](https://img2020.cnblogs.com/blog/759200/202101/759200-20210124161622816-1605238160.png  '手摸手教你阅读和调试大型开源项目 ZooKeeper') 
 
 ```java 
  2021-01-22 15:12:16,319 [myid:] - INFO  [main:NIOServerCnxnFactory@674] - binding to port 0.0.0.0/0.0.0.0:2181
2021-01-22 15:12:16,413 [myid:] - INFO  [main:WatchManagerFactory@42] - Using org.apache.zookeeper.server.watch.WatchManager as watch manager
2021-01-22 15:12:16,413 [myid:] - INFO  [main:WatchManagerFactory@42] - Using org.apache.zookeeper.server.watch.WatchManager as watch manager
2021-01-22 15:12:16,413 [myid:] - INFO  [main:ZKDatabase@132] - zookeeper.snapshotSizeFactor = 0.33
2021-01-22 15:12:16,413 [myid:] - INFO  [main:ZKDatabase@152] - zookeeper.commitLogCount=500
2021-01-22 15:12:16,429 [myid:] - INFO  [main:SnapStream@61] - zookeeper.snapshot.compression.method = CHECKED
2021-01-22 15:12:16,432 [myid:] - INFO  [main:FileSnap@85] - Reading snapshot /Users/junjiexun/Desktop/apache-zookeeper-3.6.2/data/version-2/snapshot.2
2021-01-22 15:12:16,444 [myid:] - INFO  [main:DataTree@1737] - The digest value is empty in snapshot
2021-01-22 15:12:16,480 [myid:] - INFO  [main:ZKDatabase@289] - Snapshot loaded in 67 ms, highest zxid is 0x2, digest is 1371985504
2021-01-22 15:12:16,481 [myid:] - INFO  [main:FileTxnSnapLog@470] - Snapshotting: 0x2 to /Users/junjiexun/Desktop/apache-zookeeper-3.6.2/data/version-2/snapshot.2
2021-01-22 15:12:16,488 [myid:] - INFO  [main:ZooKeeperServer@529] - Snapshot taken in 6 ms
2021-01-22 15:12:16,544 [myid:] - INFO  [ProcessThread(sid:0 cport:2181)::PrepRequestProcessor@136] - PrepRequestProcessor (sid:0) started, reconfigEnabled=false
2021-01-22 15:12:16,546 [myid:] - INFO  [main:RequestThrottler@74] - zookeeper.request_throttler.shutdownTimeout = 10000
2021-01-22 15:12:16,623 [myid:] - INFO  [main:ContainerManager@83] - Using checkIntervalMs=60000 maxPerMinute=10000 maxNeverUsedIntervalMs=0
2021-01-22 15:12:16,628 [myid:] - INFO  [main:ZKAuditProvider@42] - ZooKeeper audit is disabled.



  ``` 
  
看到日志输出，如果没有报错的话就是成功了！ 
然后我们可以用客户端测试下 
 
 ```java 
  ZooKeeper client = new ZooKeeper("127.0.0.1:2181", 3000, null);
List<string> children = client.getChildren("/", false);
System.out.println(children);
client.close();



  ``` 
  
输出为 
 
 ```java 
  [zookeeper]



  ``` 
  
单机版的搞定了！我们下面试试集群版 
###### 1.3.2 集群版启动配置 
我们有时候需要调试集群版 ZK 才有的逻辑，那之前的单机版就不够用了，并且我这里推荐将之前的源码压缩包，解压到两个不同的目录下，然后通过 IDE 分别打开这两个目录，去完全模拟两个不同的节点。集群版的和单机版配置是差不多的，我们来看看有哪些不一样的吧？我这里演示就启动两个节点 myid 分别是 1 和 2。 
![Test](https://img2020.cnblogs.com/blog/759200/202101/759200-20210124161622816-1605238160.png  '手摸手教你阅读和调试大型开源项目 ZooKeeper') 
 
 首先将默认的  
 ```java 
  zoo_sample.cfg
  ``` 
  复制���重���名成  
 ```java 
  zoo.cfg
  ``` 
 ，也可以直接重命名 
 新建  
 ```java 
  data
  ``` 
  目录（如果没有的话），并在其下新建一个文本文件 myid 文本内容是 1 
 
然后编辑下  
 ```java 
  zoo.cfg
  ``` 
 ： 
 
 ```java 
  # 修改
dataDir=/Users/junjiexun/Desktop/apache-zookeeper-3.6.2/data
# 新增下面两行
server.1=127.0.0.1:2888:3888
server.2=127.0.0.1:2887:3887



  ``` 
  
具体的配置如下： 
![Test](https://img2020.cnblogs.com/blog/759200/202101/759200-20210124161622816-1605238160.png  '手摸手教你阅读和调试大型开源项目 ZooKeeper') 
 
 启动类不同，集群的为  
 ```java 
  org.apache.zookeeper.server.quorum.QuorumPeerMain
  ``` 
  
 命令行参数不同，传入的是  
 ```java 
  zoo.cfg
  ``` 
  路径，我的路径是  
 ```java 
  /Users/junjiexun/Desktop/apache-zookeeper-3.6.2/conf/zoo.cfg
  ``` 
  
 
然后是配置第二个节点，我这里假设第二个节点的项目目录是  
 ```java 
  /Users/junjiexun/Desktop/apache-zookeeper-3.6.2-bak
  ``` 
  
第二个节点把 myid 文件中的内容修改为 2 
 
 ```java 
  zoo.cfg
  ``` 
  中内容是 
 
 ```java 
  # 修改
dataDir=/Users/junjiexun/Desktop/apache-zookeeper-3.6.2-bak/data
# 修改，因为我两个节点是在一台机器中的，所以端口是不能重复的
clientPort=2182
# 同样新增下面两行
server.1=127.0.0.1:2888:3888
server.2=127.0.0.1:2887:3887



  ``` 
  
命令行的参数是  
 ```java 
  /Users/junjiexun/Desktop/apache-zookeeper-3.6.2-bak/conf/zoo.cfg
  ``` 
  
其他我没提到的和节点 1 是一样的。 
我们启动两个节点试试 
 
 ```java 
  2021-01-22 15:44:08,461 [myid:1] - INFO  [QuorumPeer[myid=1](plain=[0:0:0:0:0:0:0:0]:2181)(secure=disabled):WatchManagerFactory@42] - Using org.apache.zookeeper.server.watch.WatchManager as watch manager
2021-01-22 15:44:08,461 [myid:1] - INFO  [QuorumPeer[myid=1](plain=[0:0:0:0:0:0:0:0]:2181)(secure=disabled):WatchManagerFactory@42] - Using org.apache.zookeeper.server.watch.WatchManager as watch manager
2021-01-22 15:44:08,471 [myid:1] - INFO  [QuorumPeer[myid=1](plain=[0:0:0:0:0:0:0:0]:2181)(secure=disabled):Learner@677] - Learner received NEWLEADER message
2021-01-22 15:44:08,471 [myid:1] - INFO  [QuorumPeer[myid=1](plain=[0:0:0:0:0:0:0:0]:2181)(secure=disabled):QuorumPeer@1811] - Dynamic reconfig is disabled, we don't store the last seen config.
2021-01-22 15:44:08,471 [myid:1] - INFO  [QuorumPeer[myid=1](plain=[0:0:0:0:0:0:0:0]:2181)(secure=disabled):FileTxnSnapLog@470] - Snapshotting: 0x28100000001 to /Users/junjiexun/Desktop/apache-zookeeper-3.6.2/data/version-2/snapshot.28100000001
2021-01-22 15:44:08,472 [myid:1] - INFO  [QuorumPeer[myid=1](plain=[0:0:0:0:0:0:0:0]:2181)(secure=disabled):ZooKeeperServer@529] - Snapshot taken in 1 ms
2021-01-22 15:44:08,525 [myid:1] - INFO  [QuorumPeer[myid=1](plain=[0:0:0:0:0:0:0:0]:2181)(secure=disabled):Learner@661] - Learner received UPTODATE message
2021-01-22 15:44:08,525 [myid:1] - INFO  [QuorumPeer[myid=1](plain=[0:0:0:0:0:0:0:0]:2181)(secure=disabled):QuorumPeer@868] - Peer state changed: following - synchronization
2021-01-22 15:44:08,537 [myid:1] - INFO  [QuorumPeer[myid=1](plain=[0:0:0:0:0:0:0:0]:2181)(secure=disabled):CommitProcessor@476] - Configuring CommitProcessor with readBatchSize -1 commitBatchSize 1
2021-01-22 15:44:08,537 [myid:1] - INFO  [QuorumPeer[myid=1](plain=[0:0:0:0:0:0:0:0]:2181)(secure=disabled):CommitProcessor@438] - Configuring CommitProcessor with 4 worker threads.
2021-01-22 15:44:08,544 [myid:1] - INFO  [QuorumPeer[myid=1](plain=[0:0:0:0:0:0:0:0]:2181)(secure=disabled):RequestThrottler@74] - zookeeper.request_throttler.shutdownTimeout = 10000
2021-01-22 15:44:08,567 [myid:1] - INFO  [QuorumPeer[myid=1](plain=[0:0:0:0:0:0:0:0]:2181)(secure=disabled):QuorumPeer@863] - Peer state changed: following - broadcast



  ``` 
  
最后的  
 ```java 
  Peer state changed
  ``` 
  代表选举完成了，贴出来的这个节点 1 是 Follower，大功告成！ 
之后当你想要学习源码的流程的时候��直��本地启动服务端即可，是不是美滋滋呢～ 
##### 1.4 源码阅读指北 
 
 服务端启动，集群  
 ```java 
  QuorumPeerMain#main
  ``` 
 ，单机  
 ```java 
  ZooKeeperServerMain#main
  ``` 
  
 客户端  
 ```java 
  ZooKeeper
  ``` 
  
 解析配置相关， 
 ```java 
  QuorumPeerConfig#parse
  ``` 
  
 内存模型（小红本） 
 ```java 
  DataTree
  ``` 
  
 回调通知（小黄本） 
 ```java 
  IWatchManager
  ``` 
  查看该接口实现 
   
   默认实现  
 ```java 
  WatchManager
  ``` 
  
   优化方案  
 ```java 
  WatchManagerOptimized
  ``` 
  
    
 选举  
 ```java 
  FastLeaderElection#lookForLeader
  ``` 
  
 服务端实例，设置流水线  
 ```java 
  setupRequestProcessors
  ``` 
  方法 
   
   Leader 节点  
 ```java 
  LeaderZooKeeperServer
  ``` 
  
   Follower 节点  
 ```java 
  FollowerZooKeeperServer
  ``` 
  
   Observer 节点  
 ```java 
  ObserverZooKeeperServer
  ``` 
  
    
 各个���水线员工  
 ```java 
  RequestProcessor
  ``` 
  查看该接口的实现 
 持久化 log  
 ```java 
  FileTxnLog
  ``` 
 ，snapshot  
 ```java 
  FileSnap
  ``` 
  
 会话管理  
 ```java 
  SessionTrackerImpl#run
  ``` 
  
 协议  
 ```java 
  Record
  ``` 
  查看该接口的实现 
 
##### 1.5 源码阅读心得 
阅读大型项目的源码一定是一个费时费心费力的工作，我这里也讲一下我阅读 ZK 源码的心得： 
 
 不要死抠细节！大型项目的源码数量通常比较多，如果盯着逻辑中的每一个细节，就会迷失在源码的汪洋大海中。 
 通常阅读源码都要带着一个目的。例如：ZK 是怎么进行协议转换的，ZK 是怎么选举的等等。有了目的以后，看相关源码是要选择性的忽略一些其他不相关的细节，可以通过方法名或者注释，来对具体的代码块先有一个感性的认识。 
 碰到读不懂的地方，可以先去网上看看有没有人写过类似的博客，站在巨人的肩膀上，很可能别人一点你就通了。 
 在 ZK 中一般间接或者直接继承  
 ```java 
  ZooKeeperThread
  ``` 
  都是线程对象，主要逻辑可以查看  
 ```java 
  run
  ``` 
  方法。 
 任何一个类重要的属性肯定是在成员字段中，通过查看成员字段是可以大致推测出该类背后的数据结构。 
 成员属性中如果有阻塞队列的字段，大概率会是生产者-消费者模式的体现，可以重点关注该阻塞队列的使用，何时放入以及取出元素。 
 
##### 1.6 小结 
我用一些图文的篇幅介绍了如何在本地调试 ZK 源码，以及如何科学的阅读源码。我本地的环境是 Mac，用的 IDE 是 idea，如果你的环境或者工具和我不一样，碰到了困难的话，也可以给我们留言哦～ 
#### 二、ZK 中应用到的设计模式 
ZK 本身就是分布式的应用，也是优秀的开源项目，我这里就简单聊聊我在阅读源码中看到的应用在 ZK 里的设计模式吧 
##### 2.1 生产者消费者 
这个是 ZK 中非常有代表性的设计模式应用了，ZK 本身是 C/S 架构的设计，请求就是客户端发送给服务端数据，响应则是服务端发送给客户端数据，而 ZK 实现一些功能并不是通过线性顺序的去调用不同的方法去完成的，通常会由生产者线程，阻塞队列和消费者线程组成，生产者线程将上游收到的一些请求对象放入阻塞队列，当前的方法就返回了，之后由消费者线程通过循环不停的从阻塞队列中获取，再完成之后的业务逻辑。举例： 
 
  
 ```java 
  PrepRequestProcessor
  ``` 
 ，阻塞队列是  
 ```java 
  submittedRequests
  ``` 
  
  
 ```java 
  SyncRequestProcessor
  ``` 
 ，阻塞队列是  
 ```java 
  queuedRequests
  ``` 
  
 
##### 2.2 工厂模式 
有一些接口的实现，ZK 本身提供了默认的选择，但是如果使用者在配置中配置了其他的实现的话，ZK 的工厂就会自动去创建那些其他的实现。举例： 
 
 在创建  
 ```java 
  ClientCnxnSocket
  ``` 
  时，会根据  
 ```java 
  zookeeper.clientCnxnSocket
  ``` 
  的配置去选择客户端的 IO 实现 
 在创建  
 ```java 
  IWatchManager
  ``` 
  时，会根据  
 ```java 
  zookeeper.watchManagerName
  ``` 
  的配置去选择服务端的 watch 管理实现 
 在创建  
 ```java 
  ServerCnxnFactory
  ``` 
  时，会根据  
 ```java 
  zookeeper.serverCnxnFactory
  ``` 
  的配置去选择服务端的 IO 工厂实现 
 
##### 2.3 责任链模式 
之前有学习过，ZK 服务端业务逻辑处理是通过将一个个  
 ```java 
  XxxProcessor
  ``` 
  串起来实现的，Processor 彼此不关心调用顺序，仅仅通过  
 ```java 
  nextProcessor
  ``` 
  关联，不同的服务端角色也可以通过这种方式极大的复用代码 
 
 单机模式下： 
 ```java 
  PrepRequestProcessor -&gt; SyncRequestProcessor -&gt; FinalRequestProcessor
  ``` 
  
 集群模式下 Leader ： 
 ```java 
  LeaderRequestProcessor -&gt; PrepRequestProcessor -&gt; ProposalRequestProcessor -&gt; CommitProcessor -&gt; Leader.ToBeAppliedRequestProcessor -&gt; FinalRequestProcessor
  ``` 
  
 集群模式下 Follower ： 
 ```java 
  FollowerRequestProcessor -&gt; CommitProcessor -&gt; FinalRequestProcessor
  ``` 
  
 集群模式下 Observer ： 
 ```java 
  ObserverRequestProcessor -&gt; CommitProcessor -&gt; FinalRequestProcessor
  ``` 
  
 
##### 2.4 策略模式 
 
 ```java 
  zookeeper.snapshot.compression.method
  ``` 
  可以配置成不同的 snapshot 压缩算法，当需要生成 snapshot 文件的时候，会根据不同的压缩算法去执行： 
 
  
 ```java 
  gz
  ``` 
 ： 
 ```java 
  GZIPInputStream
  ``` 
  
  
 ```java 
  snappy
  ``` 
 ： 
 ```java 
  SnappyInputStream
  ``` 
  
 默认： 
 ```java 
  BufferedInputStream
  ``` 
  
 
##### 2.5 装饰器模式 
还是刚刚的压缩算法，对外提供的是  
 ```java 
  CheckedInputStream
  ``` 
  的统一处理对象，使用  
 ```java 
  CheckedInputStream
  ``` 
  将上面三种压缩实现包装起来，这些对象全部都是  
 ```java 
  InputStream
  ``` 
  的子类 
 
 ```java 
  switch (根据不同的配置) {
  // 策略模式的体现
  case GZIP:
    is = new GZIPInputStream(fis);
    break;
  case SNAPPY:
    is = new SnappyInputStream(fis);
    break;
  case CHECKED:
  default:
    is = new BufferedInputStream(fis);
}
// 都被包装进了 CheckedInputStream
// 装饰器模式的体现
return new CheckedInputStream(is, new Adler32()); 



  ``` 
  
#### 三、总结 
今天我讲了如何直接从 ZK 源码 DEBUG，介绍了一些 ZK 中用到的设计模式，大家有阅读源码问题的话，欢迎给我留言哦。本文首发于 「HelloGitHub」公众号 
下一期介绍 ZK 的高级用法纯实战，期待一下吧～ 
![Test](https://img2020.cnblogs.com/blog/759200/202101/759200-20210124161622816-1605238160.png  '手摸手教你阅读和调试大型开源项目 ZooKeeper') 
老规矩，如果你有任何对文章中的疑问也可以是建议或者是对 ZK 原理部分的疑问，欢迎来仓库中提 issue 给我们，或者来语雀话题讨论。 
> 地址：https://www.yuque.com/kaixin1002/yla8hz</string>
                                        