---
title: 推荐系列-GaussDB(for Influx)与开源企业版性能对比
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 307
cover_picture: 'https://pic1.zhimg.com/80/v2-03d61f53de0a8bc7bd1d2fec26e9e0ac_720w.jpg'
abbrlink: f335db5f
date: 2022-05-11 05:14:30
---

&emsp;&emsp;：相比于企业版InfluxDB，GaussDB(for Influx)能为客户提供更高的写入能力、更稳定的查询能力、更高的数据压缩率，高效满足各大时序应用场景需求。 本文分享自华为云社区《华为云GaussDB...
<!-- more -->

                                                                                                                                                                                         
本文分享自华为云社区《华为云GaussDB(for Influx)揭秘第八期：GaussDB(for Influx)与开源企业版性能对比》，作者：高斯Influx官方博客 。 
“你们的数据库性能怎么样？” 
“能不能满足我们的业务？” 
“和其他数据库对比性能有优势么？” 
… 
客户在使用数据库时常有这样的担心和疑问。 
本文从测试方案、测试工具、测试场景、测试结果等方面详细介绍了GaussDB(for Influx)和开源InfluxDB集群在X86架构下的性能测试情况。测试结果显示，GaussDB(for Influx)较企业版InfluxDB集群能提供更高的写入性能、更低的访问延迟以及更高的数据压缩率。 
 
#### 1. 测试方案 
 
##### 1.1 资源配置 
服务端配置 
 
 
##### 1.2 测试工具 
测试工具为开源性能工具TS-benchMark。 
 
#### 2. 测试设计 
 
##### 2.1 测试模型 
本次测试采用风力发电数据模型，每个风场50个设备，每个设备50个传感器，1个风场1个线程，通过load数据的线程数来控制时间线的大小，通过收集时间的长短来控制数据量。 
模型每条数据大小约为24字节，具体的类型如下： 
Timestamp | farm | device |sensor | value 
 
##### 2.2 测试数据量 
测试数据分为两个场景，大数据量和小数据量，具体数据量如下： 
 
注：企业版InfluxDB在插入到47亿数据时OOM，以下性能对比都基于此数据量。 
 
##### 2.3 测试场景 
 
##### 2.3.1 数据写入场景 
 
 batch_size(每个批次写入的数据量) 固定为50，线程数分别从1、2、4、8、16、32、64、128、256、512 递增； 
 线程数（客户端并发请求的连接数）固定为8， batch_size分别从50、100、150、200、250、300 递增。 
 
 
##### 2.3.2 数据查询场景 
单线程进行不同语句的查询，并统计其时延信息。 
第一类查询： 所有TAG查询 
 
  
 ```java 
  select * 
from sensor 
where f='f1' and d='d2' and s='s1' and time>=1514768400000000000 and time<=1514772000000000000
  ``` 
  
 
第二类查询： TAG + VALUE查询 
 
  
 ```java 
  select * 
from sensor 
where f='f1' and s='d2' and value>=3.0 and time>=1514768400000000000 and time<1514854800000000000
  ``` 
  
 
第三类查询： 聚合查询 
 
  
 ```java 
  select mean(value) 
from sensor 
where f='f1' and s='s1' and time>=1514768400000000000 and time<=1514854800000000000 group by f,d,s,time(1h)
  ``` 
  
 
第四类查询： 或条件查询 
 
  
 ```java 
  select * 
from sensor 
where f='f1' and (s='s1' or s='s2' or s='s3' or s='s4' or s='s5') and time>=1514768400000000000 and time<=1514769150000000000
  ``` 
  
 
第五类查询： 单个TAG查询 
 
  
 ```java 
  select * 
from sensor 
where f='f1' and time>=1514768400000000000 and time<=1514769150000000000
  ``` 
  
 
 
#### 3. 测试结果分析 
 
##### 3.1 写入吞性能比对 
在小数据量场景下，GaussDB(for Influx)的写入性能是企业版InfluxDB的13倍左右，在大数据量的场景下可以达到1.8倍左右。 
 
 
##### 3.2 查询性能对比 
1）第一类查询（所有TAG查询）：无论是大数据量还是小数据量场景下，GaussDB(for Influx)的吞吐量是开源InfluxDB企业版的2倍左右。 
 
2）第二类查询（TAG + VALUE查询）：在小数据量场景下，开源InfluxDB企业版性能高于GaussDB(for Influx)，GaussDB(for Influx)在大数据量和小数据量场景下性能基本持平。 
 
3）第三类查询（聚合查询）：GaussDB(for Influx)查询性能明显优于开源InfluxDB企业版，在小数据量场景下是开源版本的14倍，大数据量下也是开源版本的8倍左右。 
 
4）第四类查询（或条件查询）：GaussDB(for Influx)查询性能在两种场景下比较稳定，开源企业版InfluxDB在两种场景下差异较大；GaussDB(for Influx)在小数据量场景下表现优于开源版，在大数据量场景下低于开源版。 
 
5）第五类查询（单个TAG查询）：GaussDB(for Influx)查询性能在两种场景下比较稳定，在大数据量场景下低于开源版。 
 
 
##### 3.3 数据压缩率对比 
在250万时间线场景下，GaussDB(for Influx)导入了151亿条数据，导入前数据大小为337.5G，导入后为49.8G，压缩率为6.8；开源企业版导入了47亿条数据，导入前105G，导入后21.3G，压缩率为4.9。GaussDB(for Influx)压缩率是开源企业版的1.4倍左右。 
Influx引擎采用LSM tree架构，随着后台compaction的进行，压缩率会进一步提升，当前数据对比是数据刚导入时的结果。 
 
#### 4. 总结 
在GaussDB(for Influx)2节点对比开源版3节点场景下，GaussDB(for Influx)给客户带来了更高的写入能力、更稳定的查询能力、更高的压缩率。GaussDB(for Influx)写入能力在小数据量场景下是开源企业版的13倍，在大数据量场景下是开源企业版的1.8倍；查询能力在两种场景下表现稳定，在大部分查询场景下优于开源企业版；在压缩率方面，同样数据模型下，高出开源版本40%。 除了以上优势外，GaussDB(for Influx)还在集群化、冷热分级存储、高可用方面也做了深度优化，能更好地满足时序应用的各种场景。 
 
#### 5. 结束 
本文作者：华为 云数据库创新Lab & 华为云时空数据库团队 更多技术文章，关注GaussDB(for Influx)官方博客： https://bbs.huaweicloud.com/community/usersnew/id_1586596796288328 Lab官网：https://www.huaweicloud.com/lab/clouddb/home.html 产品首页：https://www.huaweicloud.com/product/gaussdbforinflux.html 欢迎加入我们！ 云数据库创新Lab（成都、北京）简历���递���箱：xiangyu9@huawei.com 华为云时空数据库团队（西安、深圳）简历投递邮箱：yujiandong@huawei.com 
  
点击关注，第一时间了解华为云新鲜技术~
                                        