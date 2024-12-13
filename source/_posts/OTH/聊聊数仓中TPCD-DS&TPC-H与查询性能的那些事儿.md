---
title: 推荐系列-聊聊数仓中TPCD-DS&TPC-H与查询性能的那些事儿
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 292
cover_picture: 'https://pic4.zhimg.com/80/v2-c418328b49766afde75ed2b298cbf727_720w.jpg'
abbrlink: 7143becb
date: 2022-03-27 11:55:11
---

&emsp;&emsp;：详细讲述使用GaussDB(DWS)时，如何使用TPC-DS/TPC-H等标准数据模型，获取DWS的查询性能数据。 本文分享自华为云社区《GaussDB(DWS) 《DWS之TPCD-DS&TPC-H与查询性能的那些事儿》》，作...
<!-- more -->

 
#### 1 综述 
本文目标在于，详细讲述使用GaussDB(DWS)时，如何使用TPC-DS/TPC-H等标准数据模型，获取DWS的查询性能数据。主要包括，整体流程概述，DWS集群和ECS弹性云服务器环境准备，TPC-DS/TPC-H造数，建表与数据导入，执行查询与结果收集四个章节。 
受限于编辑器的显示，为了更好地阅读效果，烦请下载附件的原版文档查看，获取相关脚本。 
其中涉及的很多操作细节无法一一展开叙述，以梳理和展示整体的逻辑为主。其中主要涉及的工具OBS/GDS/JDBC copy后续会单独开��叙述。若有无法解决的疑问，欢迎评论留言。 
 
#### 2 整体流程概述 
 
 
#### 3 DWS集群和ECS弹性云服务器环境准备 
 
##### 3.1 创建ECS弹性云服务器 
 
 
##### 3.2 创建DWS数据仓库 
 
 
#### 4 TPC-DS/TPC-H造数 
 
##### 4.1 准备数据生成工具 
 
 远程连接ECS弹性云 
 执行 yum install git，安装git 
 执行 yum install gcc，安装gcc 
 执行 mkdir –p /data1/script/tpcds-kit/tpcds1000X ; mkdir –p /data1/script/tpch-kit/tpch100X 创建tpc-ds或者tpc-h的存放目录 
 TPC-DS造数工具dsdgen请从官网获取最新版本。 
 
通过FTP或者OBS服务上传到ECS的 /data1/script/tpcds-kit;(OBS使用方法详见附录1) 
TPC-H造数工具可直接git clone下载。 
cd /data1/script/tpch-kit; 
git clone https://github.com/gregrahn/tpch-kit.git 
 
 解压tpch的包，进入dbgen目录，make 编译对应的造数工具dbgen 
 解压tpcds的包，进入tools目录，make 编译对应的造数工具dsdgen 
 
 
##### 4.2 生成数据文件 
 
 生成TPCH数据文件 
 
进入dbgen目录后，执行./dbgen –s 100 > ./dbgen_100.log 2>&1 &，下发生成100Xtpch数据的命令到后台执行 
可以通过du –sh dbgen/*.tbl,判断数据文件的生成进度。100Xtpch数据文件总大小约107GB， 
也可以通过ps ux|grep dbgen，查看生成数据文件的进程是否退出 
 
 生成TPCDS数据文件 
 
因为tpcds1000X的数据，单个标的数据文件较大，我们采取分片生成的策略。 
进入tools目录后，执行 
 
  
 ```java 
  for c in {1..10};do (./dsdgen –sc 1000 –parallel 10 –child ${c} –dir /data1/script/tpcdsk-kit/tpcds1000X  > /dev/null 2>&1 &);done
  ``` 
  
 
其中， 
-sc 指定数据规模 
-parallel 指定分片数 
-child 指定当前是生成分片中的第几片 
-dir 指定生成数据文件存放的目录 
可以通过du –sh tpcds100X/*.dat,判断��据文件的生成进度。1000Xtpcds数据文件总大小约920GB， 
也可以通过ps ux|grep dsdgen，查看生成数据文件的进程是否退出。 
 
#### 5 建表与数据导入 
 
##### 5.1 GDS方式导入 
5.1.1 从数据仓库服务的连接管理页面下载ECS对应版本的gsql客户端，通过ftp或obs上传到ECS上；(OBS使用方法详见附录1) 
 
5.1.2 在ECS上部署GDS，详见华为云官方资料https://support.huaweicloud.com/tg-dws/dws_07_0759.html 
5.1.3 在ECS上通过gsql工具连接集群，连接群集群所需的ip和端口号信息，可以从数据仓库服务的连接管理页面获取 
 
5.1.4 在ECS上使用gsql连接集群，创建tpch/tpcds的内表和gds外表。建表语句详见如下sql文件， 
5.1.5 在ECS使用gsql连接集群，通过GDS外表，使用insert into [目标表] select * from [目标表外表]的方式导入数据到集群内。 
 
##### 5.2 JDBC copy方式导入 
5.2.1 从数据仓库服务的连接管理页面下载ECS对应版本的JDBC驱动，通过ftp或obs上传到ECS上；(OBS使用方法详见附录1) 
 
5.2.2 上传JDBC驱动和copy的java脚本到ECS，此处提供dws_copy.java源码 
5.2.3 在ECS上javac编译java文件，然后生成copy编译后源码和JDBC驱动的jar包,Copy.jar。编译和生成jar包详细流程如下图， 
 
5.2.4 在ECS上java –jar Copy.jar通过JDBC copy数据到集群内。 
可执行源码和二次封装的shell JDBC导数执行脚本详见如下压缩包 
 
#### 6 执行查询与结果收集 
 
##### 6.1通过编写shell脚本自动化执行查询和结果收集。 
脚本压缩包如下，其中包含query.conf和run_query.sh两个文件。 
query.conf为集群信息配置文件，包含如下四个变量 
db_name=tpcds_test 数据库名称 
db_port=6000 数据库端口号 
db_user=tpcds_user 数据库用户 
user_passwd=Gauss_234 数据库用户密码 
编辑query.conf为集群对应的信息后，执行sh run_query.sh即可开始查询执行和结果收集。 
注意事项： 
 
 gsql客户端的使用需要每次连接后，source gsql_env，执行查询脚本前请确认gsql可执行； 
 每个查询会跑6次，一次收集执行计划，两次预热，三次正式查询，最终结果取后三次查询的平均值； 
 查询脚本执行后会立即生成query_log_yymmdd_hhmmss名称的目���，其中 
 
exlain_log子目录存放查询计划， 
pre_warm子目录存放预热执行结果， 
real_test子目录存放正式查询执行结果, 
query_result.csv文件，csv格式汇总所有查询的执行结果,csv中结果实例如下图 
 
 
#### 7 附录 
 
##### 7.1 华为云OBS官方使用指导 
https://support.huaweicloud.com/browsertg-obs/obs_03_1000.html 
  
点击关注，第一时间了解华为云新鲜技术~
                                        