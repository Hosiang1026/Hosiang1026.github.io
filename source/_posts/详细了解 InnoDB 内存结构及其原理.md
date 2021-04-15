---
title: 推荐系列-详细了解 InnoDB 内存结构及其原理
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 867
cover_picture: 'https://tva1.sinaimg.cn/large/008eGmZEgy1gph35zg778j318m0lsq87.jpg'
abbrlink: dd785f00
date: 2021-04-15 10:04:46
---

&emsp;&emsp;最近发现，文章太长的话，包含的信息量较大， 并且需要更多的时间去阅读。而大家看文章，应该都是利用的一些碎片时间。所以我得出一个结论，文章太长不太利于大家的吸收和消化。所以我之后会...
<!-- more -->

                                                                                                                                                                                         
之前写过一篇文章「简单了解InnoDB原理」，现在回过头看，其实里面只是把缓冲池（Buffer Pool），重做日志缓冲（Redo Log Buffer）、插入缓冲（Insert Buffer）和自适应哈希索引（Adaptive Hash Index）等概念简单的介绍了一下。 
除此之外还聊了一下MySQL和InnoDB的日志，和两次写，总的来说算是一个入门级别的介绍，这篇文章就来详细介绍一下InnoDB的内存结构。 
##### InnoDB内存结构 
其大致结构如下图。 
![Test](https://tva1.sinaimg.cn/large/008eGmZEgy1gph35zg778j318m0lsq87.jpg  '详细了解 InnoDB 内存结构及其原理') 
InnoDB内存的两个主要区域分别为Buffer Pool和Log Buffer，此处的Log Buffer目前是用于缓存Redo Log。而Buffer Pool则是MySQL或者说InnoDB中，十分重要、核心的一部分，位于主存。这也是为什么其访问数据的效率高，你可以暂时把它理解成Redis那样的内存数据库，因为我们更新和新增当然它不是，只是这样会更加方便我们理解。 
###### Buffer Pool 
通常来说，宿主机80%的内存都应该分配给Buffer Pool，因为Buffer Pool越大，其能缓存的数据就更多，更多的操作都会发生在内存，从而达到提升效率的目的。 
由于其存储的数据类型和数据量非常多，Buffer Pool存储的时候一定会按照某些结构去存储，并且做了某些处理。否则获取的时候除了遍历所有数据之外，没有其他的捷径，这样的低效率操作肯定是无法支撑MySQL的高性能的。 
因此，Buffer Pool被分成了很多页，这在之前的文章中也有讲过，这里不再赘述。每页可以存放很多数据，刚刚也提到了，InnoDB一定是对数据做了某些操作。 
InnoDB使用了链表来组织页和页中存储的数据，页与页之间形成了双向链表，这样可以方便的从当前页跳到下一页，同时使用LRU（Least Recently Used）算法去淘汰那些不经常使用的数据。 
![Test](https://tva1.sinaimg.cn/large/008eGmZEgy1gph35zg778j318m0lsq87.jpg  '详细了解 InnoDB 内存结构及其原理') 
同时，每页中的数据也通过单向链表进行链接。因为这些数据是分散到Buffer Pool中的，单向链表将这些分散的内存给连接了起来。 
![Test](https://tva1.sinaimg.cn/large/008eGmZEgy1gph35zg778j318m0lsq87.jpg  '详细了解 InnoDB 内存结构及其原理') 
###### Log Buffer 
Log Buffer用来存储那些即将被刷入到磁盘文件中的日志，例如Redo Log，该区域也是InnoDB内存的重要组成部分。Log Buffer的默认值为16M，如果我们需要进行调整的话，可以通过配置参数 
 ```java 
  innodb_log_buffer_size
  ``` 
 来进行调整。 
当Log Buffer如果较大，就可以存储更多的Redo Log，这样一来在事务提交之前我们就不需要将Redo Log刷入磁盘，只需要丢到Log Buffer中去即可。因此较大的Log Buffer就可以更好的支持较大的事务运行；同理，如果有事务会大量的更新、插入或者删除行，那么适当的增大Log Buffer的大小，也可以有效的减少部分磁盘I/O操作。 
至于Log Buffer中的数据刷入到磁盘的频率，则可以通过参数 
 ```java 
  innodb_flush_log_at_trx_commit
  ``` 
 来决定。 
##### Buffer Pool的LRU算法 
了解完了InnoDB的内存结构之后，我们来仔细看看Buffer Pool的LRU算法是如何实现将最近没有使用过的数据给过期的。 
###### 原生LRU 
首先明确一点，此处的LRU算法和我们传统的LRU算法有一定的区别。为什么呢？因为实际生产环境中会存在全表扫描的情况，如果数据量较大，可能会将Buffer Pool中存下来的热点数据给全部替换出去，而这样就会导致该段时间MySQL性能断崖式下跌。 
对于这种情况，MySQL有一个专用名词叫缓冲池污染。所以MySQL对LRU算法做了优化。 
###### 优化后的LRU 
优化之后的链表被分成了两个部分，分别是 New Sublist 和 Old Sublist，其分别占用了 Buffer Pool 的3/4和1/4。 
![Test](https://tva1.sinaimg.cn/large/008eGmZEgy1gph35zg778j318m0lsq87.jpg  '详细了解 InnoDB 内存结构及其原理') 
链表的前3/4，也就是 New Sublist 存放的是访问较为频繁的页，而后1/4也就是 Old Sublist 则是反问的不那么频繁的页。Old Sublist中的数据，会在后续Buffer Pool剩余空间不足、或者有新的页加入时被移除掉。 
了解了链表的整体构造和组成之后，我们就以新页被加入到链表为起点，把整体流程走一遍。首先，一个新页被放入到Buffer Pool之后，会被插入到链表中 New Sublist 和 Old Sublist 相交的位置，该位置叫MidPoint。 
![Test](https://tva1.sinaimg.cn/large/008eGmZEgy1gph35zg778j318m0lsq87.jpg  '详细了解 InnoDB 内存结构及其原理') 
该链表存储的数据来源有两部分，分别是： 
 
 MySQL的预读线程预先加载的数据 
 用户的操作，例如Query查询 
 
默认情况下，由用户操作影响而进入到Buffer Pool中的数据，会被立即放到链表的最前端，也就是 New Sublist 的 Head 部分。但如果是MySQL启动时预加载的数据，则会放入MidPoint中，如果这部分数据被用户访问过之后，才会放到链表的最前端。 
这样一来，虽然这些页数据在链表中了，但是由于没有被访问过，就会被移动到后1/4的 Old Sublist中去，直到被清理掉。 
##### 优化Buffer Pool的配置 
在实际的生产环境中，我们可以通过变更某些设置，来提升Buffer Pool运行的性能。 
 
 例如，我们可以分配尽量多的内存给Buffer Pool，如此就可以缓存更多的数据在内存中 
 当前有足够的内存时，就可以搞多个Buffer Pool实例，减少并发操作所带来的数据竞争 
 当我们可以预测到即将到来的大量请求时，我们可以手动的执行这部分数据的预读请求 
 我们还可以控制Buffer Pool刷数据到磁盘的频率，以根据当前MySQL的负载动态调整 
 
那我们怎么知道当前运行的 MySQL 中 Buffer Pool 的状态呢？我们可以通过命令 
 ```java 
  show engine innodb status
  ``` 
 来查看。这个命令是看 InnoDB 整体的状态的， Buffer Pool 相关的监控指标包含在了其中，在 
 ```java 
  Buffer Pool And Memory
  ``` 
 模块中。 
样例如下。 
 
 ```java 
  ----------------------
BUFFER POOL AND MEMORY
----------------------
Total large memory allocated 137428992
Dictionary memory allocated 972752
Buffer pool size   8191
Free buffers       4596
Database pages     3585
Old database pages 1303
Modified db pages  0
Pending reads      0
Pending writes: LRU 0, flush list 0, single page 0
Pages made young 1171, not young 0
0.00 youngs/s, 0.00 non-youngs/s
Pages read 655, created 7139, written 173255
0.00 reads/s, 0.00 creates/s, 0.00 writes/s
No buffer pool page gets since the last printout
Pages read ahead 0.00/s, evicted without access 0.00/s, Random read ahead 0.00/s
LRU len: 3585, unzip_LRU len: 0
I/O sum[0]:cur[0], unzip sum[0]:cur[0]

  ``` 
  
解释一些关键的指标所代表的含义： 
 
 Total memory allocated：分配给 Buffer Pool 的总内存 
 Dictionary memory allocated：分配给 InnoDB 数据字典的总内存 
 Buffer pool size：分配给 Buffer Pool 中页的内存大小 
 Free buffers：分配给 Buffer Pool 中 Free List 的内存大小 
 Database pages：分配给 LRU 链表的内存大小 
 Old database pages：分配给 LRU 子链表的内存大小 
 Modified db pages：当前Buffer Pook中被更新的页的数量 
 Pending reads：当前等待读入 Buffer Pool 的页的数量 
 Pending writes LRU：当前在 LRU 链表中等待被刷入磁盘的脏页数量 
 
都是些很常规的配置项，你可能会比较好奇什么是 Free List，Free List 中存放的都是未被使用的页。因为MySQL启动的时候，InnoDB 会预先申请一部分页。如果当前页还未被使用，就会被保存在 Free List 中。 
知道了 Free List，那么你也应该知道 Flush List，里面保存的是所有的脏页，都是被更改后需要刷入到磁盘的。 
##### 自适应哈希索引 
自适应哈希索引（Adaptive Hash Index）是配合Buffer Pool工作的一个功能。自适应哈希索引使得MySQL的性能更加接近于内存服务器。 
如果要启用自适应哈希索引，可以通过更改配置 
 ```java 
  innodb_adaptive_hash_index
  ``` 
 来开启。如果不想启用，也可以在启动的时候，通过命令行参数 
 ```java 
  --skip-innodb-adaptive-hash-index
  ``` 
 来关闭。 
自适应哈希索引是根据索引Key的前缀来构建的，InnoDB 有自己的监控索引的机制，当其检测到为当前某个索引页建立哈希索引能够提升效率时，就会创建对应的哈希索引。如果某张表数据量很少，其数据全部都在Buffer Pool中，那么此时自适应哈希索引就会变成我们所熟悉的指针这样一个角色。 
当然，创建、维护自适应哈希索引是会带来一定的开销的，但是比起其带来的性能上的提升，这点开销可以直接忽略不计。但是，是否要开启自适应哈希索引还是需要看具体的业务情况的，例如当我们的业务特征是有大量的并发Join查询，此时访问自适应哈希索引被产生竞争。并且如果业务还使用了 
 ```java 
  LIKE
  ``` 
 或者 
 ```java 
  %
  ``` 
 等通配符，根本就不会用到哈希索引，那么此时自适应哈希索引反而变成了系统的负担。 
所以，为了尽可能的���少��发情况下带来的竞争，InnoDB对自适应哈希索引进行了分区，每个索引都被绑定到了一个特定的分区，而每个分区都由单独的锁进行保护。其实通俗点理解，就是降低了锁的粒度。分区的数量我们可以通过配置 
 ```java 
  innodb_adaptive_hash_index_parts
  ``` 
 来改变，其可配置的区间范围为[8, 512]。 
##### Change Buffer 
聊完了 Buffer Pool 中索引相关，剩下的就是 Change Buffer 了。Change Buffer是一块比较特殊的区域，其作用是用于存储那些当前不在 Buffer Pool 中的但是又被修改过的二级索引。 
用流程来描述一下就是，当我们更新了非聚簇索引（二级索引）的数据时，此时应该是直接将其在Buffer Pool中的对应数据更新了即可，但是不凑巧的是，当前二级索引不在 Buffer Pool 中，此时将其从磁盘拉取到 Buffer Pool 中的话，并不是最优的解，因为该二级索引可能之后根本就不会被用到，那么刚刚昂贵的磁盘I/O操作就白费了。 
所以，我们需要这么一个地方，来暂存对这些二级索引所做的改动。当被缓存的二级索引页被其他的请求加载到了Buffer Pool 中之后，就会将 Change Buffer 中缓存的数据合并到 Buffer Pool 中去。 
当然，Change Buffer也不是没有缺点。当 Change Buffer 中有很多的数据时，全部合并到Buffer Pool可能会花上几个小时的时间，并且在合并的期间，磁盘的I/O操作会比较频繁，从而导致部分的CPU资源被占用。 
那你可能会问，难道只有被缓存的页加载到了 Buffer Pool 才会触发合并操作吗？那要是它一直没有被加载进来，Change Buffer 不就被撑爆了？很显然，InnoDB在设计的时候考虑到了这个点。除了对应的页加载，提交事务、服务停机、服务重启都会触发合并。 
 
![Test](https://tva1.sinaimg.cn/large/008eGmZEgy1gph35zg778j318m0lsq87.jpg  '详细了解 InnoDB 内存结构及其原理')
                                        