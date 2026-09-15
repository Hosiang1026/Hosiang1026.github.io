---
title: 优化Buffer Pool的配置
categories:
  - 工具
  - 数据与存储
tags:
  - SQL
abbrlink: ae92616
date: 2019-01-22 00:00:00
top: 9
published: false
---

MySQL的预读线程预先加载的数据用户的操作，例如Query查询

<!-- more -->

默认情况下，由用户操作影响而进入到Buffer Pool中的数据，会被立即放到链表的最前端，也就是 New Sublist 的 Head 部分。但如果是MySQL启动时预加载的数据，则会放入MidPoint中，如果这部分数据被用户访问过之后，才会放到链表的最前端。
这样一来，虽然这些页数据在链表中了，但是由于没有被访问过，就会被移动到后1/4的 Old Sublist中去，直到被清理掉。

## 优化Buffer Pool的配置

在实际的生产环境中，我们可以通过变更某些设置，来提升Buffer Pool运行的性能。

 例如，我们可以分配尽量多的内存给Buffer Pool，如此就可以缓存更多的数据在内存中
 当前有足够的内存时，就可以搞多个Buffer Pool实例，减少并发操作所带来的数据竞争
 当我们可以预测到即将到来的大量请求时，我们可以手动的执行这部分数据的预读请求
 我们还可以控制Buffer Pool刷数据到磁盘的频率，以根据当前MySQL的负载动态调整

那我们怎么知道当前运行的 MySQL 中 Buffer Pool 的状态呢？我们可以通过命令
 `show engine innodb status`
 来查看。这个命令是看 InnoDB 整体的状态的， Buffer Pool 相关的监控指标包含在了其中，在
 `Buffer Pool And Memory`
 模块中。
样例如下。

```java
  ----------------------
BUFFER POOL AND MEMORY
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

## 自适应哈希索引

自适应哈希索引（Adaptive Hash Index）是配合Buffer Pool工作的一个功能。自适应哈希索引使得MySQL的性能更加接近于内存服务器。
如果要启用自适应哈希索引，可以通过更改配置
 `innodb_adaptive_hash_index`
 来开启。如果不想启用，也可以在启动的时候，通过命令行参数
 `--skip-innodb-adaptive-hash-index`
 来关闭。
自适应哈希索引是根据索引Key的前缀来构建的，InnoDB 有自己的监控索引的机制，当其检测到为当前某个索引页建立哈希索引能够提升效率时，就会创建对应的哈希索引。如果某张表数据量很少，其数据全部都在Buffer Pool中，那么此时自适应哈希索引就会变成我们所熟悉的指针这样一个角色。
当然，创建、维护自适应哈希索引是会带来一定的开销的，但是比起其带来的性能上的提升，这点开销可以直接忽略不计。但是，是否要开启自适应哈希索引还是需要看具体的业务情况的，例如当我们的业务特征是有大量的并发Join查询，此时访问自适应哈希索引被产生竞争。并且如果业务还使用了
 `LIKE`
 或者
 `%`
 等通配符，根本就不会用到哈希索引，那么此时自适应哈希索引反而变成了系统的负担。
所以，为了尽可能的少发情况下带来的竞争，InnoDB对自适应哈希索引进行了分区，每个索引都被绑定到了一个特定的分区，而每个分区都由单独的锁进行保护。其实通俗点理解，就是降低了锁的粒度。分区的数量我们可以通过配置
 `innodb_adaptive_hash_index_parts`
```
 来改变，其可配置的区间范围为[8, 512]。
```

## Change Buffer

聊完了 Buffer Pool 中索引相关，剩下的就是 Change Buffer 了。Change Buffer是一块比较特殊的区域，其作用是用于存储那些当前不在 Buffer Pool 中的但是又被修改过的二级索引。
用流程来描述一下就是，当我们更新了非聚簇索引（二级索引）的数据时，此时应该是直接将其在Buffer Pool中的对应数据更新了即可，但是不凑巧的是，当前二级索引不在 Buffer Pool 中，此时将其从磁盘拉取到 Buffer Pool 中的话，并不是最优的解，因为该二级索引可能之后根本就不会被用到，那么刚刚昂贵的磁盘I/O操作就白费了。
所以，我们需要这么一个地方，来暂存对这些二级索引所做的改动。当被缓存的二级索引页被其他的请求加载到了Buffer Pool 中之后，就会将 Change Buffer 中缓存的数据合并到 Buffer Pool 中去。
当然，Change Buffer也不是没有缺点。当 Change Buffer 中有很多的数据时，全部合并到Buffer Pool可能会花上几个小时的时间，并且在合并的期间，磁盘的I/O操作会比较频繁，从而导致部分的CPU资源被占用。
那你可能会问，难道只有被缓存的页加载到了 Buffer Pool 才会触发合并操作吗？那要是它一直没有被加载进来，Change Buffer 不就被撑爆了？很显然，InnoDB在设计的时候考虑到了这个点。除了对应的页加载，提交事务、服务停机、服务重启都会触发合并。
