---
title: 推荐系列-踩坑 MySQL 索引，看看你真的会用吗-
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 730
cover_picture: 'https://oscimg.oschina.net/oscnet/22a494b2-9fed-4354-ae54-69038d7d9189.png'
abbrlink: f37a80fe
date: 2021-04-15 09:16:07
---

&emsp;&emsp;关于 MySQL 索引，对于研发同学，尤其是后端研发同学，一定不会陌生。我们工作中经常会用到 MySQL 数据库，就肯定会经常用到性能优化方面的设计和考量，常常用涉及到 MySQL 索引。但是关于 ...
<!-- more -->

                                                                                                                                                                                         
 ##### ![Test](https://oscimg.oschina.net/oscnet/22a494b2-9fed-4354-ae54-69038d7d9189.png  '踩坑 MySQL 索引，看看你真的会用吗-') 
   
 关于 MySQL 索引，对于研发同学，尤其是后端研发同学，一定不会陌生。我们工作中经常会用到 MySQL 数据库，就肯定会经常用到性能优化方面的设计和考量，常常用涉及到 MySQL 索引。但是关于 MySQL 索引，你真的用对了么？ 
   
 对了，在开始正式知识点讲解之前，还需要来个不那么正式的自我介绍吧，哈哈哈~ 
  
 ![Test](https://oscimg.oschina.net/oscnet/22a494b2-9fed-4354-ae54-69038d7d9189.png  '踩坑 MySQL 索引，看看你真的会用吗-') 
   
 接下来，我会通过一个自己工作中真实遇到一个 MySQL 查询应用问题为背景，来逐步剖析分析，见招拆招，以科学理论为依据，分析探究，希望能带大家一起明确索引应用原则，最终将问题探究清楚。 
  
   
 那接下来，让我们利用约 15min 的时间，让自由的思路飞一会儿吧！ 
  
 #### 问题介绍 
 我们存在这样一张数据表（cities），记录了城市 code 和名称一些基本数据。 
 ![Test](https://oscimg.oschina.net/oscnet/22a494b2-9fed-4354-ae54-69038d7d9189.png  '踩坑 MySQL 索引，看看你真的会用吗-') 
 ![Test](https://oscimg.oschina.net/oscnet/22a494b2-9fed-4354-ae54-69038d7d9189.png  '踩坑 MySQL 索引，看看你真的会用吗-') 
 有一天，我在执行如下 SQL 的时候（一个是指定了字段 id，另一个未指定查询字段，而是利用了 *），发现两种情况下查询执行结果竟然不一样！ 
  ```java 
  Case1：select id from cities limit 1;
  ```    
 查询结果： 
 id：2 
  ```java 
  Case2：select * from cities limit 1;
  ```  
 查询结果： 
 ![Test](https://oscimg.oschina.net/oscnet/22a494b2-9fed-4354-ae54-69038d7d9189.png  '踩坑 MySQL 索引，看看你真的会用吗-') 
   
 这事成功的引起了我的注意，那就继续搞起吧！ 
  
 #### 问题分析 
 按照之前的工作经验告诉我，遇事不要慌，先 explain 解释执行看看吧。 
  ```java 
  Case1：explain select id from cities limit 1;
  ```  
  ```java 
  执行结果：
  ```  
 ![Test](https://oscimg.oschina.net/oscnet/22a494b2-9fed-4354-ae54-69038d7d9189.png  '踩坑 MySQL 索引，看看你真的会用吗-') 
   
  ```java 
  Case2：explain select * from cities limit 1;
  ```  
 执行结果： 
 ![Test](https://oscimg.oschina.net/oscnet/22a494b2-9fed-4354-ae54-69038d7d9189.png  '踩坑 MySQL 索引，看看你真的会用吗-') 
   
 经过上面的执行计划查看，发现 Case1 中的 SQL 应用到了一个名为'uniq_city_code'的索引，而第二个走了全表扫描查询。 
   
 问题初步结论：也就是说两个 SQL 由于查询字段的不同，导致 MySQL 在具体执行时候选取了不同��索引策略，从而导致了查询结果的不同。 
  
 #### 疑点跟进 
 其实经过上面的分析，其实还存在几个疑问点： 
  
   为什么 Case1 查询中并没有出现 city_code 字段，却会使用其索引？  
   为什么 Case2 查询就不会使用 uniq_city_code 的索引？  
  
   
 可能细心的同学也发现了，还有就是 Case1 查询计划中 Extra 字段为 Using index，说明满足了索引覆盖（索引中包含了所有满足查询条件的数据，无需从表中查询），可是 uniq_city_code 这个索引中并没有 id 这个字段，为何能以覆盖索引的方式执行？ 
   
 带着上面的一脸疑问，我们先来一起回顾下 MySQL 引擎索引的实现方式吧。 
 如图所示，为 Innodb、以及参考对比的 MyISAM 引擎的索引实现图例。 
   
 1、InnoDB 聚簇索引和辅助索引（非聚簇索引）的对比图示 
 ![Test](https://oscimg.oschina.net/oscnet/22a494b2-9fed-4354-ae54-69038d7d9189.png  '踩坑 MySQL 索引，看看你真的会用吗-') 
   
  
 InnoDB 按聚簇索引的形式存储数据，所以它的数据布局有着很大的不同。 
 1）聚簇索引中的每个叶子节点包含 primary key 的值，事务 ID 和回滚指针(rollback pointer)——用于事务和 MVCC，和余下的列(如 col2)。 
 2）相对于 MyISAM，辅助索引与聚簇索引有很大的不同。InnoDB 的二级索引的叶子包含 primary key 的值，而不是行指针(row pointers)，这减小了移动数据或者数据页面分裂时维护二级索引的开销，因为 InnoDB 不需要更新索引的行指针。 
   
 2、MyISAM 引擎方式索引图示 
 ![Test](https://oscimg.oschina.net/oscnet/22a494b2-9fed-4354-ae54-69038d7d9189.png  '踩坑 MySQL 索引，看看你真的会用吗-') 
   
 MyISAM 不支持聚簇索引，索引中每一个叶子节点仅仅包含行号(row number)，且叶子节点按照 col1 的顺序存储。 
 在 MyISAM 中，primary key 和其它索引没有什么区别。Primary key 仅仅只是一个叫做 PRIMARY 的唯一，非空的索引而已。 
   
 好了，我们还是回到问题本身。 
 我们其实可以得出这样一个初步结论： 
  ```java 
  Case1：select id from cities limit 1;
  ```  
 ���为 uniq_city_code 索引中包含 id 字段，此查询可以从 uniq_city_code 索引中直接取得数据，所以优化器选择走 uniq_city_code 索引； 
  ```java 
  Case2：select * from cities limit 1;
  ```  
 此查询中 select * 选取了在 uniq_city_code 索引中不包含的列，所以无法使用 uniq_city_code 这个索引。 
   
 为了验证一下我们刚刚得到的初步结论，我们来利用 Case3 验证一下。 
  ```java 
  Case3：select id, city_code from cities limit 1;
  ```  
 执行结果： 
 ![Test](https://oscimg.oschina.net/oscnet/22a494b2-9fed-4354-ae54-69038d7d9189.png  '踩坑 MySQL 索引，看看你真的会用吗-') 
   
 按照上述的理论依据，Case1（查询 id）与 Case3（查询 id+city_code）执行应用的查询计划应该是一致的。 
 通过验证实验我们可以确定一个结论：Case1 的查询确实存在索引覆盖情况。 
  
 #### 官方辅证 
 我们再继续追问一下：为什么要用到索引覆盖呢？不用可不可以呢？ 
 我们先来看看 MySQL 官方的解释... 
 ![Test](https://oscimg.oschina.net/oscnet/22a494b2-9fed-4354-ae54-69038d7d9189.png  '踩坑 MySQL 索引，看看你真的会用吗-') 
   
 其实说了这么多，本质就是最后一句，这样做可以使查询更快！ 
 好了，大家可以一起来思考下这个问题： 
 “既然主键索引包含所有数据列，那么使用主键索引一样可以做到索引覆盖，为什么优化器不选择使用主键索引？” 
 ...... 
   
 其实这个问题，就是典型的 MySQL 索引选取原则。 
   
 MySQL 在做全表扫描时，MySQL 会调用 find_shortest_key() 来选取最短的索引来扫描。 
 关于 find_shortest_key()函数的解释，我们来看下官方解释，如下所示： 
 ![Test](https://oscimg.oschina.net/oscnet/22a494b2-9fed-4354-ae54-69038d7d9189.png  '踩坑 MySQL 索引，看看你真的会用吗-') 
 所以，上面大家一起思考的这个问题，答案就是：索引长度不同，有多个可选索引时，MYSQL 会优先选择较短的索引。 
   
 到现在，那我们可以对整个问题做个总结了：因为辅助索引一定是主键索引的子集，从节约 IO 的角度，在全表扫描时优先选择辅助索引。 
  
 #### 总结 
 好了，最后我们一起来对整个分享做下总结吧。 
 1）首先我们遇到一个查询问题，由于查询字段的不同导致我们的查询结果��据��在差异； 
 2）我们对问题进行追究，发现根据 select 的字段不同，MySQL 选取的索引策略不同，即结果数据不同； 
 3）对于是否存在索引覆盖问题，我们进行了 Case3 的验证，确认了存在索引覆盖的问题； 
 4）对于 MySQL 为什么会存在这样的索引选取原则，我们最终发现是辅助索引一定是主键索引的子集，从节约 IO 的角度，在全表扫描时优先选择辅助索引。 
   
 重点提炼： 
 不同引擎对于查询实现方式的不同、索引覆盖、MySQL 索引选取原则。 
 不同引擎对于查询实现方式的不同、索引覆盖、MySQL 索引选取原则。 
 不同引擎对于查询实现方式的不同、索引覆盖、MySQL 索引选取原则。 
   
 重要的问题说三遍，哈哈哈~ 
   
 其实踩坑，也是一种成长！ 
 其实面对任何问题，都不要一上来就急于给出结论，可以尝试多做些深入分析，了解本质问题之后再考虑解决办法进行解决，希望大家能够掌握问题分析以及解决的能力，去触类旁通，而不是仅仅了解一招一式，盲目照搬。 
 ![Test](https://oscimg.oschina.net/oscnet/22a494b2-9fed-4354-ae54-69038d7d9189.png  '踩坑 MySQL 索引，看看你真的会用吗-') 
   
 - END - 
  
 作者：架构精进之路，专注软件架构研究，技术学习与个人成长，关注并私信我回复“01”，送你一份程序员成长进阶大礼包，欢迎勾搭。 
  
   
 往期热文推荐： 
  
   数据库范式与反范式设计，是一门艺术  
   关于MySQL varchar类型最大值，原来一直都理解错了  
   MySQL explain 中的 rows 究竟是如何计算的？  
   数据库范式与反范式设计，是一门艺术    
  
  
   
 ![Test](https://oscimg.oschina.net/oscnet/22a494b2-9fed-4354-ae54-69038d7d9189.png  '踩坑 MySQL 索引，看看你真的会用吗-') 
 「技术架构精进」专注架构研究，技术分享 
   
 Thanks for reading! 
 
本文分享自微信公众号 - 架构精进之路（jiagou_jingjin）。 如有侵权，请联系 support@oschina.cn 删除。 本文参与“OSC源创计划”，欢迎正在阅读的你也加入，一起分享。
                                        