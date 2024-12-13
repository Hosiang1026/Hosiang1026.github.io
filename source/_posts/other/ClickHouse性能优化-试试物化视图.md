---
title: 推荐系列-ClickHouse性能优化-试试物化视图
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 714
cover_picture: 'https://oscimg.oschina.net/oscnet/up-21e2bd40d1663fb34ea4ca4104f803e8f50.png'
abbrlink: 2261688d
date: 2021-04-15 09:48:03
---

&emsp;&emsp;一、前言 ClickHouse是一个用于联机分析(OLAP)的列式数据库管理系统(DBMS)；目前我们使用CH作为实时数仓用于统计分析，在做性能优化的时候使用了 物化视图 这一特性作为优化手段，本文主要分...
<!-- more -->

                                                                                                                                                                                        ![Test](https://oscimg.oschina.net/oscnet/up-21e2bd40d1663fb34ea4ca4104f803e8f50.png  'ClickHouse性能优化-试试物化视图') 
#### 一、前言 
ClickHouse是一个用于联机分析(OLAP)的列式数据库管理系统(DBMS)；目前我们使用CH作为实时数仓用于统计分析，在做性能优化的时候使用了  
 ```java 
  物化视图
  ``` 
  这一特性作为优化手段，本文主要分享物化视图的特性与如何使用它来优化ClickHouse的查询性能。 
  
#### 二、概念 
数据库中的  
 ```java 
  视图(View)
  ``` 
  指的是通过一张或多张表查询出来的 逻辑表 ，本身只是一段 SQL 的封装并 不存储数据。 
而  
 ```java 
  物化视图(Materialized View)
  ``` 
  与普通视图不同的地方在于它是一个查询结果的数据库对象(持久化存储)，非常趋近于表；物化视图是数据库中的预计算逻辑+显式缓存，典型的空间换时间思路，所以用得好的话，它���以��免对基础表的频繁查询并复用结果，从而显著提升查询的性能。 
在传统关系型数据库中，Oracle、PostgreSQL、SQL Server等都支持物化视图，而作为MPP数据库的ClickHouse也支持该特性。 
![Test](https://oscimg.oschina.net/oscnet/up-21e2bd40d1663fb34ea4ca4104f803e8f50.png  'ClickHouse性能优化-试试物化视图') 
  
#### 三、ClickHouse物化视图 
ClickHouse中的物化视图可以挂接在任意引擎的基础表上，而且会自动更新数据，它可以借助 MergeTree 家族引擎(SummingMergeTree、Aggregatingmergetree等)，得到一个实时的预聚合，满足快速查询；但是对 更新 与 删除 操作支持并不好，更像是个插入触发器。 
创建语法： 
 
 ```java 
  CREATE [MATERIALIZED] VIEW [IF NOT EXISTS] [db.]table_name [TO[db.]name] [ENGINE = engine] [POPULATE] AS SELECT ...

  ``` 
  
POPULATE 关键字决定了物化视图的更新策略： 
 
 若有POPULATE 则在创建视图的过程会将源表已经存在的数据一并导入，类似于 create table ... as 
 若无POPULATE 则物化视图在创建之后没有数据 
 
 
  
#### 四、案例 
##### 4.1. 场景 
假设有一个日志表  
 ```java 
  login_user_log
  ``` 
  来记录每次登录的用户信息，现在需要按用户所属地为维度来统计每天的登录次数。 
 
  
正常的聚合SQL如下：city为用户所属��，login_date为登录时间 
 
 ```java 
  select city, login_date, count(1) login_cnt
from login_user_log
group by city, login_date

  ``` 
  
增加  
 ```java 
  物化视图
  ``` 
  后的架构如下图所示： 
![Test](https://oscimg.oschina.net/oscnet/up-21e2bd40d1663fb34ea4ca4104f803e8f50.png  'ClickHouse性能优化-试试物化视图') 
  
##### 4.2. 建表 
创建基础表：基础表使用  
 ```java 
  SummingMergeTree
  ``` 
  引擎，进行预聚合处理 
 
 ```java 
  CREATE TABLE login_user_log_base
(
    city String,
		login_date Date,
    login_cnt UInt32
)
ENGINE = SummingMergeTree()
ORDER BY (city, login_date)

  ``` 
  
 
  
创建物化视图：用户在创建物化视图时，通过  
 ```java 
  AS SELECT ...
  ``` 
  子句从源表中查询需要的列，十分灵活 
 
 ```java 
  CREATE MATERIALIZED VIEW if not exists login_user_log_mv 
TO login_user_log_base 
AS 
SELECT city, login_date, count(1) login_cnt
from login_user_log
group by city, login_date

  ``` 
  
 
  
##### 4.3. 查询统计结果 
使用物化视图查询 
 
 ```java 
  SELECT city, login_date, sum(login_cnt) cnt
from login_user_log_mv
group by city, login_date

  ``` 
  
 
  
#### 总结 
 
 在创建 MV 表时，一定要使用 TO 关键字为 MV 表指定存储位置，否则不支持 嵌套视图(多个物化视图继续聚合一个新的视图) 
 在创建 MV 表时如果用到了多表联查，不能为连接表指定别名，如果多个连接表中存在同名字段，在连接表的查询语句中使用 AS 将字段名区分开 
 在创建 MV 表时如果用到了多表联查，只有当第一个查询的表有数据插入时，这个 MV 才会被触发 
 在创建 MV 表时不要使用 POPULATE 关键字，而是在 MV 表建好之后将数据手动导入 MV 表 
 在使用 MV 的聚合引擎时，也需要按照聚合查询来写sql，因为聚合时机不可控 
 
  
扫码关注有惊喜！ 
![Test](https://oscimg.oschina.net/oscnet/up-21e2bd40d1663fb34ea4ca4104f803e8f50.png  'ClickHouse性能优化-试试物化视图')
                                        