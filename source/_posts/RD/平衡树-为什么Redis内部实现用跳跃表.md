---
title: 推荐系列-平衡树-为什么Redis内部实现用跳跃表
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 300
cover_picture: 'https://pic3.zhimg.com/80/v2-224a4e10f2a1a52e84b21889aea08742_720w.jpg'
abbrlink: daa4c7e7
date: 2021-10-12 11:53:17
---

&emsp;&emsp;：Redis使用跳跃表（skiplist）作为有序集合（zset）的底层实现之一。 本文分享自华为云社区《5分钟了解Redis的内部实现跳跃表（skiplist）》，作者：万猫学社。 跳跃表简介 跳跃表（ski...
<!-- more -->

                                                                                                                    
                                                                                                     
本文分享自华为云社区《5分钟了解Redis的内部实现跳跃表（skiplist）》，作者：万猫学社。 
 
#### 跳跃表简介 
跳跃表（skiplist）是一个有序的数据结构，它通过在每个节点维护不同层次指向后续节点的指针，以达到快速访问指定节点的目的。跳跃表在查找指定节点时，平均时间复杂度为，最坏时间复杂度为O(N)。 
Redis使用跳跃表（skiplist）作为有序集合（zset）的底层实现之一。当有序集合的元素个数大于等于zset-max-ziplist-entries（默认为128个），或者每个元素成员的长度大于等于zset-max-ziplist-value（默认为64字节）的时候，使用跳跃表和哈希表作为有序集合的内部实现。 
举个例子，我们使用zadd命令创建一个以跳跃表为实现的有序集合： 
 
  
 ```java 
  127.0.0.1:6379> zadd one-more-zset 1 long-long-long-long-long-long-long-long-long-long-long-long-long-long
(integer) 1
127.0.0.1:6379> zrange one-more-zset 0 -1
1) "long-long-long-long-long-long-long-long-long-long-long-long-long-long"
127.0.0.1:6379> object encoding one-more-zset
"skiplist"
  ``` 
  
 
 
#### 跳跃表的实现 
在Redis中的跳跃表是由zskiplist结构表示的，zskiplist结构包含由多个跳跃表节点组成的双向链表，每一个跳跃表节点都保存着元素成员和对应的分钟。下面我们一个一个地详细了解一下。 
 
##### zskiplist结构 
跳跃表是由zskiplist结构表示的，它包含以下几个属性： 
 
 header属性: 指向头部跳跃表节点的指针。 
 tail属性：指向尾部跳跃表节点的指针。 
 level属性：表示跳跃表中层数最大的节点的层数，表头节点的层数不计算在内。 
 length属性：表示跳跃表中的节点总数。 
 
 
##### 跳跃表节点的结构 
跳跃表节点��用zskiplistNode结构表示，它包含以下几个属性： 
 
 level属性：表示层的数组，数组中每个项使用zskiplistLevel结构表示，它包含以下两个属性： 
   
   forward属性：指向位于表尾方向其他节点的指针。 
   span属性：当前节点到forward指向的节点跨越了多少个节点。 
    
 backward属性：指向当前节点的前一个节点的指针。 
 obj属性：指向元素成员的指针。 
 score属性：当前元素成员对应的分数。 
 
 
#### 图解跳跃表 
说了这么多，都比较抽象不容易理解，我们来举个例子： 
 
这就是一个跳跃表的内部结构，其中有4个元素，键分别是：万、猫、学、社。 
 
#### 为什么不使用平衡树？ 
跳跃表以有序的方式在层次化的链表中保存元素， 在大多数情况下，跳跃表的效率可以和平衡树媲美，查找、删除、添加等操作都可以在对数期望时间下完成， 并且比起平衡树来说， 跳跃表的实现要简单直观得多。所以在Redis中没有使用平衡树，而是使用了跳跃表。 
  
点击关注，第一时间了解华为云新鲜技术~
                                        