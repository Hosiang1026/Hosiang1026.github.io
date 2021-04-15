---
title: 推荐系列-继续探究-一文理清JVM和GC（下）
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 727
cover_picture: 'https://api.ixiaowai.cn/gqapi/gqapi.php'
abbrlink: 2b69fda4
date: 2021-04-15 10:04:00
---

&emsp;&emsp;本文主要介绍 JVM和GC解析 如有需要，可以参考 如有帮助，不忘 点赞 ❥ 创作不易，白嫖无义！ 一、OOM的认识 StackOverflowError public static void main(String[] args) { stackOverflowE...
<!-- more -->

                                                                                                                                                                                         
 
### 一、OOM的认识 
 
### StackOverflowError 
 
 ```java 
   public static void main(String[] args) {
     stackOverflowError();   //Exception in thread "main" java.lang.StackOverflowError
 }
private static void stackOverflowError() {
    stackOverflowError();
}
��制���码
  ``` 
  
 
### OutOfMemeoryError：java heap space 
 
 ```java 
  public static void main(String[] args) {
    String str = "cbuc";
    for (; ; ) {
        str += str + UUID.randomUUID().toString().substring(0,5);   //+= 不断创建对象
    }
}
复制代码
  ``` 
  
 
### OutOfMemeoryError：GC overhead limit exceeded 
程序在垃圾回收上花费了98%的时间，却收集不会2%的空间。 假如不抛出GC overhead limit，会造成： 
 
 GC清理的一点点内存很快会再次填满，迫使GC再次执行，这样就形成了恶性循环。 
 CPU的使用率一直是100%，而GC却没有任何成果 
 
 
 ![Test](https://p6-tt.byteimg.com/origin/pgc-image/769e9d04051046d6b3969a47f34c18cd?from=pc  '继续探究-一文理清JVM和GC（下）') 
   
 
 
### OutOfMemeoryError：Direct buffer memory 
 
 写NIO程序经常使用 ByteBuffer 来读取或者写入数据，这是一种基于通道（Channel）和缓冲区（Buffer）的 I/O 方式，它可以使用Native 函数库直接分配堆外内存，然后通过一个存储在Java 堆里面的DirectByteBuffer 对象作为这块内存的引用进行操作。这样能在一些场景中显著提高性能，因为避免了在Java堆和Native堆中来回复制数据。 
 
ByteBuffer.allocate(capability)：这一种方式是分配JVM堆内存，属于GC管辖范围，由于需要拷贝所以速度相对较慢。 
ByteBuffer.allocateDirect(capability)：这一种方式是分配OS本地内存，不属于GC管辖范围，由于不需要内存拷贝，所以速度相对较快。 
但是如果不断分配本地内存，堆内存很少使用，那么JVM就不需要执行GC，DirectByteBuffer 对象就不会被回收，这时候堆内存充足，但本地内存可能就已经使用光了，再次尝试分配本地内存就会出现OutOfMemeoryError，那程序就直接奔溃了。 
 
 ```java 
  public static void main(String[] args) {
    /**
     * 虚拟机配置参数
     * -Xms10m -Xmx10m -XX:+PrintGCDetails  -XX:MaxDirectMemorySize=5m
     */
    System.out.println("配置的maxDirectMemeory："+     (sun.misc.VM.maxDirectMemory()/(double)1024/1024)+"MB");
    try {TimeUnit.SECONDS.sleep(3);} catch (InterruptedException e) {e.printStackTrace();}
    // -XX:MaxDerectMemorySize=5m  配置为5m, 这个时候我们使用6m
    ByteBuffer byteBuffer = ByteBuffer.allocateDirect(6*1024*1024);

}
复制代码
  ``` 
  
 
 OutOfMemeoryError：unable to create new native thread 
 
高并发请求服务器时，经常会出现该异常 导致原因： 
 
 你的应用创建了太多线程了，一个应用进程创建多个线程，超过系统承载权限。 
 你的服务器并不允许你的应用程序创建这么多线程，linux系统默认允许的那个进程可以创建的线程数是1024个，你的应用创建超过这个数量就会报OutOfMemeoryError：unable to create new native thread 
 
解决办法： 
 
 想方法减低你应用程序创建线程的数量，分析应用是否真的需要创建那么多线程，如果不是，该代码将线程数降到最低。 
 对于有点应用，确实需要创建很多线程，远超过linux系统默认1024个线程的限制，可以通过修改linux服务器配置，扩大linux默认限制 
 
 
 ```java 
  public static void main(String[] args) {
        for (int i = 1;  ; i++) {
            System.out.println("输出 i： " + i);
             new Thread(()->{
                 try {TimeUnit.SECONDS.sleep(Integer.MAX_VALUE);} catch (InterruptedException e) {e.printStackTrace();}
             },"线程"+i).start();
        }
    }
复制代码
  ``` 
  
 
### OutOfMemeoryError：Metaspace 
Java 8之后的版本使用Metaspace来替代永久代 Metaspace是方法区在HotSpot中的实现，它与持久带最大的区别在于：Metespace并不在虚拟机内存中而是使用本地内存 永久代（java8 后被原空间Metaspace取代了）存放了以下信息： 
 
 虚拟机加载的类信息 
 常量池 
 静态常量 
 即时编译后的代码 
 
 
### 二、4种垃圾收集器 
GC算法（引用计数/复制/标清/标整）是内存回收的方法，垃圾收集器就是算法的实现 
目前为止还没有完美的收集器出现，更加没有万能的收集器，只是针对具体应用最合适的收集器，进行分代收集 
 
### 串行垃圾回收器（Serial） 
它为单线程环境设计并且只是用一个线程进行垃圾回收，会暂停所有的用户线程。所以不适合服务器环境。 
 
### 并行垃圾回收器（parallel） 
多个垃圾回收线程并行工作，此时用户线程是暂停的，适用于科学计算/大数据处理等弱交互场景 
 
### 并发垃圾回收器（CMS） 
用户线程和垃圾收集线程同时执行（不一定是并行，可能交替执行），不需要停顿用户线程，适用于对响应时间有要求的场景 
 
### G1垃圾回收器 
G1垃圾回收器将堆内存分割成不同的区域然后并发的对其进行垃圾回收 
 
### 三、垃圾收集器解析 
 
### 查看默认的垃圾收集器 
java -XX:+PrintCommandLineFlags -version 
 
 ![Test](https://p6-tt.byteimg.com/origin/pgc-image/769e9d04051046d6b3969a47f34c18cd?from=pc  '继续探究-一文理清JVM和GC（下）') 
   
 
 
### 默认的垃圾收集器 
 
 UseSerialGC 
 UseParallelGC 
 UseConcMarkSweepGC 
 UseParNewGC 
 UseParallelOldGC 
 UseG1GC 
 
 
### 新生代 
 
 串行GC（Serial）/（Serial Coping） 一个单线程的收集器，在��行垃圾收集的时候，必须暂停其他所有的工作线程知道它收集结束 
 
 
 ![Test](https://p6-tt.byteimg.com/origin/pgc-image/769e9d04051046d6b3969a47f34c18cd?from=pc  '继续探究-一文理清JVM和GC（下）') 
   
 
最稳定以及效率高的收集器，只使用一个线程去回收但其在进行垃圾手机过程中可能会产生较长的停顿（“Stop-The-World”状态）。虽然在收集垃圾过程中需要暂停所有其他的工作线程，但是它简单高效，对于限定单个CPU环境来说，==没有线程交互的开销可以获得更高的单线程垃圾收集效率，== 因此Serial垃圾收集器依然是Java虚拟机运行在Client 模式下默认的新生代垃圾收集器。 
JVM设置参数： -XX:+UseSerialGC开启后会使用：Serial（Young区用）+Serial Old（Old区用的）收集器组合， 表示： 
新生代、老年代都会使用串行回收收集器，新生代使用复制算法，老年代使用标记-整理算法 
 
 并行GC（ParNew） 
 
使用多线程进行垃圾回收，在垃圾收集时，会Stop-The-World暂停其他所有工作的线程知道它收集结束 
 
 ![Test](https://p6-tt.byteimg.com/origin/pgc-image/769e9d04051046d6b3969a47f34c18cd?from=pc  '继续探究-一文理清JVM和GC（下）') 
   
 
ParNew收集器其实就是Serial收集器新生代的并行多线程版本，最常见的应用场景是配合老年代的CMS GC工作，其余的行为和Serial收集器完全一样，ParNew垃圾收集器在垃圾收集过程中同样也要暂停所有的工作线程。它是很多java虚拟机运行在Server模式下新生代的默认垃圾收集器。 
JVM设置参数： 
XX:+UseParNewGC启用 ParNew收集器，只影响新生代的收集，不影响老年代。开启上述参数后，会使用：ParNew （新生代区用）+Serial Old（老年代区用）策略，新生代使用复制算法，老年代使用标记-整理算法。 
 
 并行回收GC（Parallel）/（Parallel Scavenge） 
 
 
 ![Test](https://p6-tt.byteimg.com/origin/pgc-image/769e9d04051046d6b3969a47f34c18cd?from=pc  '继续探究-一文理清JVM和GC（下）') 
   
 
Parallel Scavenge收集器类似ParNew 也是新生代垃圾收集器，使用复制算法，也是一个并行的多线程的垃圾收集器，俗称吞吐量优先收集器。串行收集器在新生代和老年代的并行化 
关注点： 
 
 可控制的吞吐量 
 自适应调节策略也是ParallelScavenge收集器与ParallelNew收集器的一个重要区别 JVM设置参数 -XX:UseParallelGC 或 -XX:UseParallelOldGC（可互相激活），开启后：新生代使用复制算法，老年代使用标记-整理算法。 
 
 
### 老年代 
 
 串行GC（Serial Old）/（Serial MSC） Serial Old 是Serial 垃圾收集器老年代版本，它同样是个单线程的收集器，使用标记-整理算法，这个收集器也主要是运行在Client默认的java虚拟机默认的老年代垃圾收集器。 用途： 
 
 
 在JDK1.5之前版本中与新生代的Parallel Scavenge收集器搭配使用。（Parallel Scavenge+Serial Old） 
 作为老年代版中使用CMS收集器的后备垃圾收集方案。 
 
 
 并行GC（Parallel Old）/（Parallel MSC） Parallel Old收集器是Parallel Scavenge的老年代版本，使用多线程的标记-整理算法，Parallel Old在JDK 1.6之前，新生代使用 ParallelScavenge 收集器,只能保证新生代的吞吐量优先，无法保证整体的吞吐量。在JDK1.6之前（Parallel Scavenge+Serial Old） Parallel Old 正是为了在年老代同样提供吞吐量优先的垃圾收集器，如果系统对吞吐量要求比较高，JDK1.8 后可以优先考虑新生代Parallel Scavenge和年老代 Parallel Old收集器的搭配策略。 
 
JVM设置参数： -XX:+UseParallelOldGC开启 Parallel Old收集器，设置该参数后，使用 新生代Parallel + 老年代Parallel Old策略 
 
 并发标记清除GC（CMS） 
 
优点： 并发收集低停顿 
缺点： 
 
 并发执行，对CPU资源压力大： 由于并发进行，CMS在收集与应用线程会同时会增加对堆内存的占用，也就是说，CMS必须要在老年代堆内存用尽之前完成垃圾回收，否则CMS回收失败时，将触发担保机制，串行老年代收集器将会以STW的方式进行一次GC，从而造成较大停顿时间。 
 采用的标记清除算法会导致大量碎片： 标记清除算法无法整理空间碎片，老年代空间会随着应用时长被逐步耗尽，随后将不得不通过担保机制对堆内存进行压缩。CMS也提供了参数-XX:CMSFulllGCsBeForeCompaction（默认0，即每次都进行内存整理）来指定多少次CMS收集之后，进行一次压缩的Full GC。 关键4步： 
 
 
 Initial Mark （初始标记）：标记GC Root可以直达的对象，耗时短。 
 Concurrent Mark（并行标记）：从第一步标记的对象出发，并发地标记可达对象。 
 Remark（重新标记）： 重新进行标记，修正Concurrent Mark期间由于用户程序运行而导致对象间的变化及新创建的对象，耗时短。 
 Concurrent Sweep（并行回收）： 并行地进行无用对象的回收。 
 
 
 ![Test](https://p6-tt.byteimg.com/origin/pgc-image/769e9d04051046d6b3969a47f34c18cd?from=pc  '继续探究-一文理清JVM和GC（下）') 
   
 
 
### 如何选择垃圾收集器 
 
 单CPU或小内存，单机程序 -XX:+UseSerialGC 
 多CPU，需要最大吞吐量，如后台计算型应用 -XX:+UseParallelGC-XX:+UseParallelOldGC 
 多CPU，追求低停顿时间，需快速响应如互联网应用 -XX:+UseConcMarkSweepGC-XX:+ParNewGC 
 
 
### 四、G1垃圾收集器 
以前垃圾收集器的特点： 
 
 年轻代和老年代是各自独立且连续的内存块 
 年轻代中Eden+S0+S1使用复制算法进行收集 
 老年代收集必须扫描整个老年代区域 
 都是以尽可能少而快速地执行GC为设计原则 
 
 
### G1 概念： 
Garbage-First收集器，是一款面向服务端应用的收集器，优点如下： 
 
 整理空闲空间更快 
 需要更多的时间来预测GC停顿时间 
 不希望牺牲大量的吞吐性能 
 不需要更大的Java Heap 
 
G1收集器的设计目标是取代CMS收集器 
 
### G1 优势： 
 
 G1 是一个有整理内存过程的垃圾收集器，不会产生很多内存碎片 
 G1 的Stop-The-World (STW)更可控，G1在停顿时间上添加了预测机制，用户可以指定期望停顿时间 
 
主要改变是Eden，Survivor和Tenured等内存区域不再是连续的了，而是变成了一个个大小一样的region，每个region从1M到32M不等。一个region有可能属于Eden，Survivor或者Tenured内存区域。 
 
### G1特点： 
 
 G1能充分利用多CPU，多核环境硬件优势，尽量缩短STW 
 G1整体上采用标记-整理算法，局部是通过复制算法，不会产生内存碎片 
 宏观上看G1之中不再区分年轻代和老年代。把内存划分成多个独立的子��域（Region） 
 G1收集器里面将整个的内存区都混合在一起了，但其本身依然在小范围内要进行年轻代和老年代的区分，保留了新生代和老年代。 
 G1虽然也是分代收集器，但整个内存分区不存在物理上的年轻代与老年代的区别，也不需要完全独立的survivor（to space）堆做复制准备。G1只有逻辑上的分代概念，或者说每个分区都可能随G1的运行在不同代之间前后切换。 
 
 
### G1底层原理 
 
区域化内存划片Region，整体变为了一系列不连续的内存区域，避免了全内存区的GC操作。 核心思想： 
将整个堆内存区域分成大小相同的子区域（Region），在JVM启动时会自动配置这些子区域的大小。 在堆的使用上，G1并不要求对象的存储一定是物理上连续的只要逻辑上连续即可，每个分区也不会固定地为某个代服务，可以按需在年轻代和老年代之间切换。启动时可以通过参数-XX:G1HeapRegionSize=n 可指定分区大小（1MB~32MB，且必须是2的幂），默认将整堆划分为2048个分区。 大小范围在1MB~32MB，最多能设置2048个区域，也即能够支持的最大内存为：32MB*2048=65536MV=64G内存 最大好处就是化整为零，避免全��存扫描，只需要按照区域来进行扫描即可 
 
 ![Test](https://p6-tt.byteimg.com/origin/pgc-image/769e9d04051046d6b3969a47f34c18cd?from=pc  '继续探究-一文理清JVM和GC（下）') 
   
 
 
针对Eden区进行收集，Eden区耗尽后会被触发，主要是小区域收集+形成连续的内存块，避免内存碎片 
 
 Eden区的数据移动到新的Survivor区，部分数据晋升到Old区。 
 Survivor区的数据移动到新的Survivor区，部分数据晋升到Old区。 
 最后Eden区收拾干净了，GC结束，用户的应用程序继续执行。 
 
 
 ![Test](https://p6-tt.byteimg.com/origin/pgc-image/769e9d04051046d6b3969a47f34c18cd?from=pc  '继续探究-一文理清JVM和GC（下）') 
   
 
 
 
 初始标记： 只标记GC Roots能直接关联到的对象 
 并发标记： 进行GC Roots Tracing的过程 
 最终标记： 修正并发标记期间，因程序运行导致标记发生变化的那一部分对象 
 筛选回收： 根据时间来进行价值最大化的回收 
 
 
 ![Test](https://p6-tt.byteimg.com/origin/pgc-image/769e9d04051046d6b3969a47f34c18cd?from=pc  '继续探究-一文理清JVM和GC（下）') 
   
 
 
 
 -XX:+UseG1GC 开启G1垃圾收集器 
 -XX:G1HeapRegionSize=n 设置G1区域的大小。值是2的幂，范围是1M到32M。目标是根据最小的Java堆大小划分出约2048个区域 
 -XX:MaxGCPauseMillis=n 最大停顿时间，这是个软目标，JVM将尽可能（但不保证）停顿时间小于这个时间 
 -XX:InitiatingHeapOccupancyPercent=n 堆占用了多少的时候就触发GC，默认是45 
 -XX:ConcGCThreads=n 并发GC使用的线程数 
 -XX:G1ReservePercent=n 设置作为空闲时间的预留内存百分比，以降低目标空间溢出的风险，默认值是10% 
 
 
 
 G1不会产生内存碎片 
 是可以精确控制停顿，该收集器是把整个堆（新生代、老年代）划分成多个固定大小的区域，每次根据允许停顿的时间去收集垃圾最多的区域。 
 
 
 
 ![Test](https://p6-tt.byteimg.com/origin/pgc-image/769e9d04051046d6b3969a47f34c18cd?from=pc  '继续探究-一文理清JVM和GC（下）') 
   
 
 
### 五、诊断生产环境服务器变慢 
 
### 整机相关 
top 
 
 ![Test](https://p6-tt.byteimg.com/origin/pgc-image/769e9d04051046d6b3969a47f34c18cd?from=pc  '继续探究-一文理清JVM和GC（下）') 
   
 
前五行是统计信息 第一行是任务队列信息，同uptime命令的执行结果一样 17:16:47：当前时间 up 23:47：系统运行时间 2 users：当前登录用户数 load average:0.21,0.27,0.19：系统负载，即任务队列的平均长度，三个数值分别为1分钟、5分钟、15分钟前到现在的平均值 
 
### CPU相关 
1）vmstat 
 
 ![Test](https://p6-tt.byteimg.com/origin/pgc-image/769e9d04051046d6b3969a47f34c18cd?from=pc  '继续探究-一文理清JVM和GC（下）') 
   
 
 vmstat -n 2 3 第一个参数是采样的时间间隔数（单位:秒），第二个参数是采样的次数 主要参数： 
 
 procs r： 运行和等待CPU时间片的进程数，原则上1核的CPU的运行队列不要超过2，整个系统的运行队列不能超过总核数的2倍，否则代表系统压力过大。 b： 等待资源的进程数，比如正在等待磁盘I/O,网络I/O等。 
 cpu us： 用户进程消耗CPU时间百分比，us值高，用户进程消耗CPU时间多，如果长期大于50%，需要优化程序 sy： 内核进程消耗的CPU时间百分比 us + sy 参考值为80%，如果us + sy 大于80%，说明可能存在CPU不足 id： 处于空闲CPU百分比 wa： 系统等待IO的CPU时间百分比  sy： 来自于一个虚拟机偷取的CPU时间的百分比 
 
2）mpstat 
mpstat -P ALL 2 查看CPU核信息 
 
 ![Test](https://p6-tt.byteimg.com/origin/pgc-image/769e9d04051046d6b3969a47f34c18cd?from=pc  '继续探究-一文理清JVM和GC（下）') 
   
 
3）pidstat 
pidstat -u 1 -p 进程号 每个进程使用cpu的用量分解信息 
 
### 内存相关 
free 
应用程序中可用内存 / 系统物理内存>70%：内存充足 应用程序可用内存/系统物理内存<20% 内存不足：需要增加内存 20%<应用程序可用内存/系统物理内存<70%： 内存基本够用 
 
 ![Test](https://p6-tt.byteimg.com/origin/pgc-image/769e9d04051046d6b3969a47f34c18cd?from=pc  '继续探究-一文理清JVM和GC（下）') 
   
 
 
### 硬盘相关 
df 
查看磁盘剩余空闲数 
 
 ![Test](https://p6-tt.byteimg.com/origin/pgc-image/769e9d04051046d6b3969a47f34c18cd?from=pc  '继续探究-一文理清JVM和GC（下）') 
   
 
 
### 硬盘IO相关 
iostat -xdk 2 3 
 
 ![Test](https://p6-tt.byteimg.com/origin/pgc-image/769e9d04051046d6b3969a47f34c18cd?from=pc  '继续探究-一文理清JVM和GC（下）') 
   
 
 
### 六、分析生产环境CPU占用过高 
 
### 步骤1 
先用top命令找出CPU占比最高的 
 
### 步骤2 
ps -ef 或者 jps 进一步定位，得知是一个怎样的后台程序 
 
### 步骤3 
定位到具体线程或者代码 ps -mp 进程 ==-o== THREAD,tid,time 
-o：该参数是用户自定义格式 -p：pid进程使用cpu的时间 -m: 显示所有线程 
 
### 步骤4 
将需要的线程ID转换为16进制格式（英文小写格式） 再使用：printf "%x/\n" 有问题的线程ID 
 
### 步骤5： 
jstat 进程ID | grep tid（16进制线程ID小写英文） 
 
### 七、常用的JVM监控和性能分析工具 
 
 jps 虚拟机进程状况工具 
 jinfo Java配置信息工具 
 jmap 内存映像工具 
 jstat 统计信息监控工具 
 
  
 
 ![Test](https://p6-tt.byteimg.com/origin/pgc-image/769e9d04051046d6b3969a47f34c18cd?from=pc  '继续探究-一文理清JVM和GC（下）') 
   
 

                                        