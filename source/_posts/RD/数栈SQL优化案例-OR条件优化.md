---
title: 推荐系列-数栈SQL优化案例-OR条件优化
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 877
cover_picture: 'https://img-blog.csdnimg.cn/img_convert/96e44a3733720d35651a3ffa2d5c8a7c.png'
abbrlink: dfe4ea36
date: 2021-04-15 09:53:06
---

&emsp;&emsp;本文整理自：袋鼠云技术荟 | SQL优化案例(2)：OR条件优化 数栈是云原生—站式数据中台PaaS，我们在github上有一个有趣的开源项目：https://github.com/DTStack/flinkx FlinkX是一个基于Flink...
<!-- more -->

                                                                                                                                                                                        本文整理自：袋鼠云技术荟 | SQL优化案例(2)：OR条件优化 
数栈是云原生—站式数据中台PaaS，我们在github上有一个有趣的开源项目：https://github.com/DTStack/flinkx 
FlinkX是一个基于Flink的批流统一的数据同步工具，既可以采集静态的数据，比如MySQL，HDFS等，也可以采集实时变化的数据，���如MySQL binlog，Kafka等，是全域、异构、批流一体的数据同步引擎，大家如果有兴趣，欢迎来github社区找我们玩~ 
在MySQL中，同样的查询条件，如果变换OR在SQL语句中的位置，那么查询的结果也会有差异，在较为复杂的情况下，可能会带来索引选择不佳的性能隐患，为了避免执行效率大幅度下降的问题，我们可以适当考虑使用Union all 对查询逻辑较为复杂的SQL进行分离。 
常见OR使用场景，请阅读以下案例： 
 
#### 案例一：不同列使用OR条件查询 
1. 待优化场景 
 
  
 ```java 
  SELECT
..
..
  FROM`t1` a
 WHERE a.token= '16149684'
   AND a.store_id= '242950'
   AND(a.registrationId IS NOT NULL
   AND a.registrationId<> '')
    OR a.uid= 308475
   AND a.registrationId IS NOT NULL
   AND a.registrationId<> ''
  ``` 
  
 
执行计划 
 
  
 ```java 
  +--------------+-----------------------+-----------------+----------------+-------------------+-------------------+---------------+----------------+---------------------------------------------+
| id           | select_type           | table           | type           | key               | key_len           | ref           | rows           | Extra                                       |
+--------------+-----------------------+-----------------+----------------+-------------------+-------------------+---------------+----------------+---------------------------------------------+
| 1            | SIMPLE                | a               | range          |idx_registrationid | 99                |               | 100445         | Using index condition; Using where          |
+--------------+-----------------------+-----------------+----------------+-------------------+-------------------+---------------+----------------+---------------------------------------------+
  ``` 
  
 
共返回1 行记录,花费 5 ms。 
2. 场景解析 
从查询条件中可以看出 token 和 uid 过滤性都非常好，但是由于使用了 or， 需要采用 index merge 的方法才能获得比较好的性能。但在实际执行过程中MySQL优化器默认选择了使用registrationId 上的索引，导致 SQL 的性能很差。 
3. 场景优化 
我们将SQL改写成union all的形式。 
 
  
 ```java 
  SELECT
...
...
FROM`t1` a
WHERE a.token = '16054473'
AND a.store_id = '138343'
AND b.is_refund = 1
AND (a.registrationId IS NOT NULL
AND a.registrationId <> '')
union all
SELECT
...
...
FROM`t1` a
where a.uid = 181579
AND a.registrationId IS NOT NULL
AND a.registrationId <> ''
  ``` 
  
 
  
 
  
 ```java 
  +--------------+-----------------------+-----------------+----------------+------------------------------+---------------+-------------------+------------------------------+----------------+------------------------------------+
| id           | select_type           | table           | type           | possible_keys                | key           | key_len           | ref                          | rows           | Extra                              |
+--------------+-----------------------+-----------------+----------------+------------------------------+---------------+-------------------+------------------------------+----------------+------------------------------------+
| 1            | PRIMARY               | a               | ref            | IDX_TOKEN,IDX_STORE_ID_TOKEN | IDX_TOKEN     | 63                | const                        | 1              | Using index condition; Using where |
| 1            | PRIMARY               | b               | eq_ref         | PRIMARY                      | PRIMARY       | 4                 | youdian_life_sewsq.a.role_id | 1              | Using where                        |
| 2            | UNION                 | a               | const          | PRIMARY                      | PRIMARY       | 4                 | const                        | 1              |                                    |
| 2            | UNION                 | b               | const          | PRIMARY                      | PRIMARY       | 4                 | const                        | 0              | unique row not found               |
|              | UNION RESULT          | <union1,2>      | ALL            |                              |               |                   |                              |                | Using temporary                    |
+--------------+-----------------------+-----------------+----------------+------------------------------+---------------+-------------------+------------------------------+----------------+------------------------------------+
  ``` 
  
 
共返回5 行记录,花费 5 ms。 
通过对比优化前后的执行计划，可以明显看出，将SQL拆分成两个子查询，再使用union对结果进行合并，稳定性和安全性更好，性能更高。 
 
#### 案例二：同一列使用OR查询条件 
1. 待优化场景 
 
  
 ```java 
  select
....
....
from
t1 as mci
left join t1 as ccv2_1 on ccv2_1.unique_no = mci=category_no1
left join t1 as ccv2_2 on ccv2_2.unique_no = mci=category_no2
left join t1 as ccv2_3 on ccv2_3.unique_no = mci=category_no3
left join(
  select product_id,
  count(0) count
  from t2 pprod
  inner join t3 pinfo on pinfo.promotion_id = pprod.promotion_id
  and pprod.is_enable =1
  and ppinfo.is_enable=1
  and pinfo.belong_t0 =1
  and pinfo.end_time >=now()
  and not (
   pinfo.onshelv_time>'2019-06-30 00:00:00'
   or pinfo.end_time>'2018-12-05 00:00:00'
  )group by pprod.product_id
)as pc on pc.product_id = mci.product_id
where mci.is_enable =0
and mci.comodifty_type in ('1', '5', '6')
and (pc.count =0 or pc.count isnull ) limit 0,5;
  ``` 
  
 
执行计划 
![Test](https://img-blog.csdnimg.cn/img_convert/96e44a3733720d35651a3ffa2d5c8a7c.png  '数栈SQL优化案例-OR条件优化') 
2. 场景解析 
本例的SQL查询中有一个子查询，子查询被当成驱动表，产生了auto_key，通过SQL拆分进行测试，验证主要是(pc.count =0 , or pc.count is null )会影响到整个SQL的性能，需要进行比较改写。 
3. 场景优化 
首先我们可以单独思考(pc.count =0 , or pc.count is null ) 如何进行优化？先写一个类似的SQL 
 
  
 ```java 
  Select col from test where col =100 or col is null;
+--------+
| col    |
+--------+
|    100 |
|   NULL |
+--------+
2 rows in set (0.00 sec)

  ``` 
  
 
这个时候我们看到的其实是同一个列，但对应不同的值，这种情况可以利用case when进行转换。 
 
  
 ```java 
  Select col From test where case when col is null then 100 else col =100 end;
+--------+
| col    |
+--------+
|    100 |
|   NULL |
+--------+
2 rows in set (0.00 sec)
  ``` 
  
 
再回到原始SQL进行改写。 
 
  
 ```java 
  select
....
....
from
t1 as mci
left join t1 as ccv2_1 on ccv2_1.unique_no = mci=category_no1
left join t1 as ccv2_2 on ccv2_2.unique_no = mci=category_no2
left join t1 as ccv2_3 on ccv2_3.unique_no = mci=category_no3
left join(
  select product_id,
  count(0) count
  from t2 pprod
  inner join t3 pinfo on pinfo.promotion_id = pprod.promotion_id
  and pprod.is_enable =1
  and ppinfo.is_enable=1
  and pinfo.belong_t0 =1
  and pinfo.end_time >=now()
  and not (
   pinfo.onshelv_time>'2019-06-30 00:00:00'
   or pinfo.end_time>'2018-12-05 00:00:00'
  )group by pprod.product_id
)as pc on pc.product_id = mci.product_id
where mci.is_enable =0
and mci.comodifty_type in ('1', '5', '6')
and case when pc.count is null then 0 else pc.count end=0 limit 0,5;
  ``` 
  
 
![Test](https://img-blog.csdnimg.cn/img_convert/96e44a3733720d35651a3ffa2d5c8a7c.png  '数栈SQL优化案例-OR条件优化') 
可以看出优化后的SQL比原始SQL快了30秒，执行效率提升约50倍。 
 
#### 案例三：优化关联SQL OR条件 
1. 待优化场景 
 
  
 ```java 
  SELECT user_msg.msg_id AS ‘msg_id’, user_msg.content AS ‘msg_content’, …
FROM user_msg
LEFT JOIN user ON user_msg.user_id = user.user_id
LEFT JOIN group ON user_msg.group_id = group.group_id
WHERE user_msg.gmt_modified >= date_sub('2018-03-29 09:31:44', INTERVAL30SECOND)
OR user.gmt_modified >= date_sub('2018-03-29 09:31:44', INTERVAL 30 SECOND)
OR group.gmt_modified >= date_sub('2018-03-29 09:31:44', INTERVAL 30 SECOND)
  ``` 
  
 
2.场景解析 
我们仔细分析上述查询语句，发现虽然业务逻辑只需要查询半分钟内修改的数据，但执行过程却必须对所有的数据进行关联操作，带来不必要的性能损耗。 
![Test](https://img-blog.csdnimg.cn/img_convert/96e44a3733720d35651a3ffa2d5c8a7c.png  '数栈SQL优化案例-OR条件优化') 
3.场景优化 
我们对原始SQL进行拆分操作，第一部分sql-01如下： 
 
  
 ```java 
  SELECT user_msg.msg_id AS ‘msg_id’, user_msg.content AS ‘msg_content’, …
FROM user_msg
LEFT JOIN user ON user_msg.user_id = user.user_id
LEFT JOIN group ON user_msg.group_id = group.group_id
WHERE user_msg.gmt_modified >= date_sub('2018-03-29 09:31:44', INTERVAL 30 SECOND)
  ``` 
  
 
![Test](https://img-blog.csdnimg.cn/img_convert/96e44a3733720d35651a3ffa2d5c8a7c.png  '数栈SQL优化案例-OR条件优化') 
sql-01以user_msg 表为驱动，使用gmt_modified 索引过滤最新数据。 
第二部分sql-02如下： 
 
  
 ```java 
  SELECT user_msg.msg_id AS ‘msg_id’, user_msg.content AS ‘msg_content’, …
FROM user_msg
LEFT JOIN user ON user_msg.user_id = user.user_id
LEFT JOIN group ON user_msg.group_id = group.group_id
WHERE user.gmt_modified >= date_sub('2018-03-29 09:31:44', INTERVAL 30 SECOND)
  ``` 
  
 
![Test](https://img-blog.csdnimg.cn/img_convert/96e44a3733720d35651a3ffa2d5c8a7c.png  '数栈SQL优化案例-OR条件优化') 
ql-02以user为驱动表，msg user_id 的索引过滤行很好。 
第三部分sql-03如下： 
 
  
 ```java 
  SELECT user_msg.msg_id AS ‘msg_id’, user_msg.content AS ‘msg_content’, …
FROM user_msg
LEFT JOIN user ON user_msg.user_id = user.user_id
LEFT JOIN group ON user_msg.group_id = group.group_id
WHERE group.gmt_modified >= date_sub('2018-03-29 09:31:44', INTERVAL 30 SECOND)
  ``` 
  
 ![Test](https://img-blog.csdnimg.cn/img_convert/96e44a3733720d35651a3ffa2d5c8a7c.png  '数栈SQL优化案例-OR条件优化') 
 ![Test](https://img-blog.csdnimg.cn/img_convert/96e44a3733720d35651a3ffa2d5c8a7c.png  '数栈SQL优化案例-OR条件优化') 
 
![Test](https://img-blog.csdnimg.cn/img_convert/96e44a3733720d35651a3ffa2d5c8a7c.png  '数栈SQL优化案例-OR条件优化') 
sql-03以group为驱动表，使用gmt_modified 索引过滤最新数据。 
 
#### 总结 
MySQL OR条件优化的常见场景主要有以下情况： 
1、相同列可以使用IN进行代替 
2、不同列及复杂的情况下，可以使用union all 进行分离 
3、关联SQL OR条件 
我们需要结合实际场景，分析优化。
                                        