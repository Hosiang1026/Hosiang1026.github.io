---
title: 推荐系列-动手实现 LRU 算法，以及  Caffeine 和 Redis 中的缓存淘汰策略
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 1854
cover_picture: 'https://static.oschina.net/uploads/img/202008/05162532_eStk.jpg'
abbrlink: 46da75db
date: 2021-04-15 09:19:21
---

&emsp;&emsp;我是风筝，公众号「古时的风筝」。 文章会收录在 JavaNewBee 中，更有 Java 后端知识图谱，从小白到大牛要走的路都在里面。 那天我在 LeetCode 上刷到一道 LRU 缓存机制的问题，第 146 题，难...
<!-- more -->

                                                                                                                                                                                         
那天我在 LeetCode 上刷到一道 LRU 缓存机制的问题，第 146 题，难度为中等，题目如下。 
 
LRU 全名 Least Recently Used，意为最近最少使用，注重最近使用的时间，是常用的缓存淘汰策略。为了加快访问速度，缓存可以说无处不在，无论是计算机内部的缓存，还是 Java 程序中的 JVM 缓存，又或者是网站架构中的 Redis 缓存。缓存虽然好用，但缓存内容可不能无限增加，要受存储空间的约束，当空间不足的时候，只能选择删除一部分内容。那删除哪些内容呢，这就涉及到淘汰策略了，而 LRU 应该是各种缓存架构最常用的淘汰策略了。也就是当内存不足，新内容进来时，会将最近最少使用的元素删掉。 
我一看这题我熟啊，当初看  ```java 
  LinkedHashMap
  ``` 源码的时候，源码中有注释提到了它可以用来实现 LRU 缓存。原文是这么写的。 
 ```java 
  A special {@link #LinkedHashMap(int,float,boolean) constructor} is provided to create a linked hash map whose order of iteration is the order in which its entries were last accessed, from least-recently accessed to most-recently (<i>access-order</i>).  This kind of map is well-suited to building LRU caches.

  ```  
翻译过来大意如下： 
通过一个特殊的构造函数，三个参数的这种，最后一个布尔值参数表示是否要维护最近访问顺序，如果是 true 的话会维护最近访问的顺序，如果是 false 的话，只会维护插入顺序。保证维护最近最少使用的顺序。 ```java 
  LinkedHashMap
  ``` 这种结构非常适合构造 LRU 缓存。 
当我看到这段注释的时候，特意去查了一下用  ```java 
  LinkedHashMap
  ``` 实现 LRU 的方法。 
 ```java 
  public class LRUCache {

    private int cacheSize;

    private LinkedHashMap<Integer,Integer> linkedHashMap;

    public LRUCache(int capacity) {
        this.cacheSize = capacity;
        linkedHashMap = new LinkedHashMap<Integer,Integer>(capacity,0.75F,true){
            @Override
            protected boolean removeEldestEntry(Map.Entry eldest) {
                return size()>cacheSize;
            }
        };
    }

    public int get(int key) {
       return this.linkedHashMap.getOrDefault(key,-1);
    }

    public void put(int key, int value) {
        this.linkedHashMap.put(key,value);
    }
}

  ```  
这是根据这道题的写法，如果不限定这个题目的话，可以让  ```java 
  LRUCache
  ``` 继承  ```java 
  LinkedHashMap
  ``` ，然后再重写  ```java 
  removeEldestEntry
  ``` 方法即可。 
看到没，就是这么简单， ```java 
  LinkedHashMap
  ``` 已经完美实现了 LRU，这个方法是在插入键值对的时候调用的，如果返回 true，就删除最近最少使用的元素，所以只要判断  ```java 
  size()
  ``` 是否大于  ```java 
  cacheSize
  ```  即可， ```java 
  cacheSize
  ``` 就是缓存的最大容量。 
提交，顺利通过，完美！ 
![Test](https://tva1.sinaimg.cn/large/007S8ZIlly1ggngkjh4htj306o06o0so.jpg  '动手实现 LRU 算法，以及  Caffeine 和 Redis 中的缓存淘汰策略') 
#### LRU 简单实现 
你以为这么简单就完了吗，并没有。当我查看官方题解的时候，发现里面是这么说的。 
 
什么，这么完美还不符合面试官要求，面试官是什么要求呢？面试官的要求是考考你 LRU 的原理，让你自己实现一个。 
那咱们就由 ```java 
  LinkedHashMap
  ``` 介绍一下最基础的 LRU 实现。简单概括  ```java 
  LinkedHashMap
  ``` 的实现原理就是  ```java 
  HashMap
  ``` +双向链表的结合。 
双向链表用来维护元素访问顺序，将最近��访��（也就是调动 get 方法）的元素放到链表尾部，一旦超过缓存容量的时候，就从链表头部删除元素，用双向链表能保证元素移动速度最快，假设访问了链表中的某个元素，只要把这个元素移动链表尾部，然后修改这个元素的 prev 和 next 节点的指向即可。 
双向链表节点的类型的基本属性如下： 
 ```java 
  static class Node {
  /**
  * 缓存 key
  */
  private int key;

  /**
  * 缓存值
  */
  private int value;

  /**
  * 当前节点的前驱节点
  */
  private Node prev;

  /**
  * 当前节点的后驱节点
  */
  private Node next;

  public Node(int key, int value) {
    this.key = key;
    this.value = value;
  }
}

  ```  
 ```java 
  HashMap
  ``` 用来存储 key 值对应的节点，为的是快速定位 key 值在链表中的位置，我们都知道，这是因为 ```java 
  HashMap
  ``` 的 get 方法的时间复杂度为 O(1)。而如果不借助  ```java 
  HashMap
  ``` ，那这个过程可就慢了。如果要想找一个 key，要从链表头或链表尾遍历才行。 
![Test](https://tva1.sinaimg.cn/large/007S8ZIlly1ggngkjh4htj306o06o0so.jpg  '动手实现 LRU 算法，以及  Caffeine 和 Redis 中的缓存淘汰策略') 
按上图的展示， head 是链表头，也是最长时间未被访问的节点，tail 是最近被访问的元素，假设缓存最大容量是 4 。 
##### 插入元素 
当有新元素被插入，先判断缓存容量是否超过最大值了，如果超过，就将头节点删除，然后将头结点的 next 节点设置为 head，同时删除  ```java 
  HashMap
  ``` 中对应的 key。然后将插入的元素放到链表尾部，设置此元素为尾节，并在  ```java 
  HashMap
  ``` 中保存下来。 
如果没超过最大容量，直接插入到尾部。 
##### 访问元素 
当访问其中的某个 key 时，先从  ```java 
  HashMap
  ``` 中快速找到这个节点。如果这个 key 不是尾节点，那么就将此节的前驱节点的 next 指向此节点的后驱节点，此节点的后驱节点的 prev 指向此节点的前驱节点。 同时，将这个节点移动到尾部，并将它设置为尾结点。 
下面这个动图，演示了 get key2 时的移动情况。 
![Test](https://tva1.sinaimg.cn/large/007S8ZIlly1ggngkjh4htj306o06o0so.jpg  '动手实现 LRU 算法，以及  Caffeine 和 Redis 中的缓存淘汰策略') 
##### 删除元素 
如果是删除头节点，则将此节点的后驱节点的 prev 设置为 null，并将它设置为 head，同时，删除  ```java 
  HashMap
  ``` 中此节点的 key。 
如果是删除尾节点，则将此节点的前驱节点的 next 设置为 null，并将它设置为 tail，同时，删除 ```java 
  HashMap
  ``` 中此节点的 key。 
如果是中间节点，则将此节的前驱节点的 next 指向此节点的后驱节点，此节点的后驱节点的 prev 指向此节点的前驱节点，同时，删除 ```java 
  HashMap
  ``` 中此节点的 key。 
##### 动手实现 
思路就是这么一个思路，有了这个思路我撸起袖子开始写代码，由于自身算法比较渣，而且又好长时间不刷算法，所以我的惨痛经历如下。 
![Test](https://tva1.sinaimg.cn/large/007S8ZIlly1ggngkjh4htj306o06o0so.jpg  '动手实现 LRU 算法，以及  Caffeine 和 Redis 中的缓存淘汰策略') 
先是执行出错，后来又解答错误，顿时开始怀疑人生，怀疑智商。最后发现，确实是智商问题。 
![Test](https://tva1.sinaimg.cn/large/007S8ZIlly1ggngkjh4htj306o06o0so.jpg  '动手实现 LRU 算法，以及  Caffeine 和 Redis 中的缓存淘汰策略') 
总归就是这么一个意思，你也去写一遍试试吧，看看效果如何。原题地址：https://leetcode-cn.com/problems/lru-cache/ 
#### 除了 LRU 还有 LFU 
还有一种常用的淘汰策略叫做 LFU(Least Frequently Used)，最不经常使用。想比于LFU 更加注重访问频次。在 LRU 的基础上增加了访问频次。 
看下图，举个例子来说，假设现在 put 进来一个键值对，并且超过了最大的容��，��就要删除一个键值对。假设 key2 是在 5 分钟之前访问过一次，而 key1 是在 10 分钟之前访问过，以 LRU 的策略来说，就会删除头节点，也就是图中的 key1。但是如果是 LFU 的话，会记录每个 key 的访问频次，虽然 key2 是最近一次访问晚于 key1，但是它的频次比 key1 少，那要淘汰一个 key 的话，还是要淘汰 key2 的。只是举个例子，真正的 LFU 数据结构比 LRU 要复杂。 
看 LeetCode 上的难度等级就知道了，LFU 也有一道对应的题目，地址：https://leetcode-cn.com/problems/lfu-cache/，它的难度是困难，而 LRU 的难度是中等。 
![Test](https://tva1.sinaimg.cn/large/007S8ZIlly1ggngkjh4htj306o06o0so.jpg  '动手实现 LRU 算法，以及  Caffeine 和 Redis 中的缓存淘汰策略') 
还有一种 FIFO ，先进先出策略，先进入缓存的会先被淘汰，比起上面两种，它的命中率比较低。 
#### 优缺点分析 
LRU的优点：LRU相比于 LFU 而言性能更好一些，因为它算法相对比较简单，不需要记录访问频次，可以更好的应对突发流量。 
LRU的缺点：虽然性能好一些，但是它通过历史数据来预测未来是局限的，它会认为最后到来的数据是最可能被再次访问的，从而给与它最高的优先级。有些非热点数据被访问过后，占据了高优先级，它会在缓存中占据相当长的时间，从而造成空间浪费。 
LFU的优点：LFU根据访问频次访问，在大部分情况下，热点数据的频次肯定高于非热点数据，所以它的命中率非常高。 
LFU的缺点：LFU 算法相对比较复杂，性能比 LRU 差。有问题的是下面这种情况，比如前一段时间微博有个热点话题热度非常高，就比如那种可以让微博短时间停止服务的，于是赶紧缓存起来，LFU 算法记录了其中热点词的访问频率，可能高达十几亿，而过后很长一段时间，这个话题已经不是热点了，新的热点也来了，但是，新热点话题的热度没办法到达十几亿，也就是说访问频次没有之前的话题高，那之前的热点就会一直占据着缓存空间，长时间无法被剔除。 
针对以上这些问题，现有的缓存框架都会做一系列改进。比如 JVM 本地缓存 Caffeine，或者分布式缓存 Redis。 
#### Caffeine 中的缓存淘汰策略 
Caffeine 是一款高性能的 JVM 缓存框架，是目前 Spring 5.x 中的默认缓存框架，之前版本是用的 Guava Cache。 
为了改进上述 LRU 和 LFU 存在的问题，前Google工程师在 TinyLfu的基础上发明了 W-TinyLFU 缓存算法。Caffine 就是基于此算法开发的。 
Caffeine 因使用 Window TinyLfu 回收策略，提供了一个近乎最佳的命中率。 
TinyLFU维护了近期访问记录的频率信息，作为一个过滤器，当新记录来时，只有满足TinyLFU要求的记录才可以被插入缓存。 
TinyLFU借助了数据流Sketching技术，它可以用小得多的空间存放频次信息。TinyLFU采用了一种基于滑动窗口的时间衰减设计机制，借助于一种简易的 reset 操作：每次添加一条记录到Sketch的时候，都会给一个计数器上加 1，当计数器达到一个尺寸 W 的时候，把所有记录的 Sketch 数值都除以 2，该 reset 操作可以起到衰减的作用 。 
W-TinyLFU主要用来解决一些稀疏的突发访问元素。在一些数目很少但突发访问量很大的场景下，TinyLFU将无法保存这类元素，因为它们无法在给定时间内积累到足够高的频率。因此 W-TinyLFU 就是结合 LFU 和LRU，前者用来应对大多数场景，而 LRU 用来处理突发流量。 
在处理频次记录方面，采用 Bloom Filter，对于每个key，用 n 个 byte 每个存储一个标志用来判断 key 是否在集合中。原理就是使用 k 个 hash 函数来将 key 散列成一个整数。 
在 W-TinyLFU 中使用 Count-Min Sketch 记录 key 的访问频次，而它就是布隆过滤器的一个变种。 
![Test](https://tva1.sinaimg.cn/large/007S8ZIlly1ggngkjh4htj306o06o0so.jpg  '动手实现 LRU 算法，以及  Caffeine 和 Redis 中的缓存淘汰策略') 
#### Redis 中的缓存淘汰策略 
Redis 支持如下 8 中淘汰策略，其中最后两种 LFU 的是 4.0 版本之后新加的。 
noeviction：当内存使用超过配置的时候会返回错误，不会驱逐任何键 
allkeys-lru：加入键的时候，如果过限，首先通过LRU算法驱逐最久没有使用的键 
volatile-lru：加入键的时候如果过限，首先从设置了过期时间的键集合中驱逐最久没有使用的键 
allkeys-random：加入键的时候如果过限，从所有key随机删除 
volatile-random：加入键的时候如果过限，从过期键的集合中随机驱逐 
volatile-ttl：从配置了过期时间的键中驱逐马上就要过期的键 
volatile-lfu：从所有配置了过期时间的键中驱逐使用频率最少的键 
allkeys-lfu：从所有键中驱逐使用频率最少的键 
最常用的就是两种 LRU 和 两种 LFU 的。 
通过在 redis.conf 配置文件中配置如下配置项，来设置最大容量和采用的缓存淘汰策略。 
 ```java 
  maxmemory 1024M
maxmemory-policy volatile-lru

  ```  
##### Redis 中的 LRU 
Redis使用的是近似LRU算法，它跟常规的LRU算法还不太一样，它并不维护队列，而是随机采样法淘汰数据，每次随机选出5（默认）个key，从里面淘汰掉最近最少使用的key。 
通过配置  ```java 
  maxmemory-samples
  ``` 设置随机采样大小。 
 ```java 
  maxmemory-samples 5

  ```  
LRU 算法会维护一个淘汰候选池（大小为16），池中的数据根据访问时间进行排序，第一次随机选取的key都会放入池中，随后每次随机选取的key只有在访问时间小于池中最小的时间才会放入池中，直到候选池被放满。当放满后，如果有新的key需要放入，则将池中最后访问时间最大（最近被访问）的移除。当需要淘汰 key 的时候，则直接从池中选取最近访问时间最小（最久没被访问）的 key 淘汰掉即可。 
##### Redis 中的 LFU 
LFU 算法是 4.0 之后才加入进来的。 
上面 LRU 算法中会按照访问时间进行淘汰，这个访问时间是 Redis 中维护的一个 24 位时钟，也就是当前时间戳，每个 key 所在的对象也维护着一个时钟字段，当访问一个 key 的时候，会拿到当前的全局时钟，然后将这个时钟值赋给这个 key 所在对象维护的时钟字段，之后的按时间比较就是根据这个时钟字段。 
而 LFU 算法就是利用的这个字段，24位分成两部分，前16位还代表时钟，后8位代表一个计数器。16位的情况下如果还按照秒为单位就会导致不够用，所以一般这里以时钟为单位。而后8位表示当前key对象的访问频率，8位只能代表255，但是redis并没有采用线性上升的方式，而是通过一个复杂的公式，通过配置两个参数来调整数据的递增速度。 
 ```java 
  lfu-log-factor 10
lfu-decay-time 1

  ```  
在影响因子 lfu-log-factor 为10的情况下，经过1百万次命中才能达到 255。 
本文完。 
#### 送给你 
种一棵树最好的时间是十年前，其次是现在。送给各位，也送给自己。 
 
![Test](https://tva1.sinaimg.cn/large/007S8ZIlly1ggngkjh4htj306o06o0so.jpg  '动手实现 LRU 算法，以及  Caffeine 和 Redis 中的缓存淘汰策略')
                                        