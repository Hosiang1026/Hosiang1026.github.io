---
title: 推荐系列-ChunJun支持异构数据源DDL转换与自动执行 丨DTMO 02期回顾（内含课程回放+课件）
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 306
date: 2022-05-11 05:14:30
cover_picture: 'https://pic3.zhimg.com/80/v2-bb8067e8c7ad453fb4b8ce26dd4701ce_1440w.jpg'
---

&emsp;&emsp;： 4月26日晚，ChunJun项目核心成员、袋鼠云数栈大数据引擎开发专家渡劫为大家带来分享《ChunJun支持异构数据源DDL转换与自动执行》，我们将直播精华部分做了整理，带大家再次回顾内容，...
<!-- more -->

                                                                                                                                                                                         
导读： 
4月26日晚，ChunJun项目核心成员、袋鼠云数栈大数据引擎开发专家渡劫为大家带来分享《ChunJun支持异构数据源DDL转换与自动执行》，我们将直播精华部分做了整理，带大家再次回顾内容，加深技术细节的了解。 
你能看到 
▫ 数据还原介绍 
▫ DDL自动转换架构设计 
▫ Calcite解析DDL实战 
直播课件获取： 
关注公众号“数栈研习社”，后台私信“ChunJun01”获得直播课件 
直播视频回看： 
点击“阅读原文”，观看精彩视频 
https://www.bilibili.com/video/BV1eR4y1P7AH?spm_id_from=333.999.0. 
演讲 / 渡劫 
整理 / 花夏 
 
#### 数据还原介绍 
ChunJun实时同步支持mysql oracle postgresql sqlserver等数据源实时同步，但是同步之后的数据是以日志形式输出，数据还原在此基础上做到源数据的变动在目标表也发生对应变动，包含DML以及DDL的操作都会在目标表中执行对应的操作，保证源表和目标表schema一致 数据一致。 
 
目前ChunJun数据还原已经支持mysql到rdb类型数据源的数据还原，仅限于支持DML的还原，DDL的自动执行下一版本支持。 
实时还原增加了两个主要模块： 
 
 源表和目标表的映射(database table column信息的映射) 
 与外部交互，完成DDL状态更新，DML数据重新下发 
 
为了完成逻辑解耦，我们增加了2个flatMap 算子完成上述操作： 
 
 NameMappingFlatMap 根据映射关系对数据信息进行对应替换 
 RestorationFlatMap 对数据进行处理，对数据进行阻塞下发以及DDL状态监听 
 
flatMap 算子介绍 
接下来为大家介绍两个算子 
01 
NameMappingFlatMap 
实时还原默认source端schema table column 是和sink端一致的，但是在大多数情况下source和sink的映射并不是完全一致的，因此需要NameMappingFlatMap算子对source的schema table column进行替换。NameMapping支持 schema table column的映射，其映射关系如下图所示： 
图中映射关系代表源表schema为ChunJun_source下的source1这个表对应对应于目标端ChunJun_sink下的sink1，其中字段映射为 源表的C1字段对应目标id字段，C2字段对应目标name字段 
 
在创建flink同步任务的时候，会判断脚本里是否配置了nameMapping的配置，如果没有配置则不会存在NameMappingFlatMap算子。 
02 
RestorationFlatMap 
在数据还原中一定会涉及到DDL，但是目前sink端只支持DML的执行，因此在源表产生DDL之后的DML数据不能直接发给sink端执行，需要等到sink端对应的DDL执行完之后，DML才能重新下发。 
因此RestorationFlatMap设计主要是为了解决 数据的下发 何时下发问题，何时下发就是下游sink的DDL执行完，但是这个sink端ddl的执行不是ChunJun完成的，ChunJun是无法得知完成时间的。因此RestorationFlatMap会和外部交互 获取这个DDL执行状态 从而判断DML数据何时下发。 
结构设计 
RestorationFlatMap内部会对每个表维护一个集合，DML&DDL数据都会存入此集合。集合会在非阻塞和阻塞状态间进行切换，同时内部会有两个组件分别为workerManager 以及 Monitor组件： 
 
 WorkerManager：监听非阻塞集合数据，如果是DML下发，如果是DDL则将队列置为阻塞状态 
 Monitor：将ddl存储到外部数据源 以及监听阻塞队列的ddl执行情况，进行阻塞到非阻塞的改变 store 监听阻塞状态队列的第一个ddl数据，将其存储到外部表 fetcher 监听外部表DDL数据的状态 如果为已执行，则将此表对应的集合阻塞状态改为非阻塞 
 
外部表设计 
ChunJun 目前支持DDL数据存储外部Mysql数据源在数据还原中会将DDL数据写入到外部数据源，第三方修改此DDL数据的status为2后，ChunJun会认为下游DDL已执行完毕 
 
数据还原脚本示例 
脚本示例主要分为nameMapping及restoration两部分，分别对应NameMappingFlatMap及RestorationFlatMap 算子参数。 
注意reader的split需要设置为true。 
 
数据还原存在问题 
 
 binlog支持DDL读取，logminer暂未支持 需要所有数据源支持DDL的读取 
 RestorationFlatMap会将数据存储在内存中，后续会进行外部持久化 
 checkpoint支持不足，RestorationFlatMap模块数据续跑后会丢失 
 当前数据源产生DDL场景和外部交互过多，后续增加DDL自动执行，达到DML&DDL都由chunjun完成，用户无感知 
 
 
#### DDL自动转换架构设计 
当前数据还原DDL执行依赖外部进行操作，ChunJun仅根据DDL数据状态进行DML数据下发，为了做到整条链路由ChunJun闭环完成，减少外部依赖以及运维成本，ChunJun进行DDL自动转换操作，将source的DDL语法转换为sink的DDL语法，因此就有了DDL自动转换模块的设计。 
DDL自动转换解决下列问题： 
 
 当前ddl数据ChunJun下游不会自动执行 
 外部表存储的DDL数据状态是客户手动修改 
 
主要结构设计： 
将DDL自动转换逻辑放在NameMappingFlatMap中，NameMappingFlatMap执行数据转换。 
 
DDL技术方案 
数据还原自动转换功能主要是以下三部分： 
1、解析DDL语句 
源表DDL SQL 转为一个中间对象以及中间对象转为目标端DDL语句。 
2、异常数据管理 
如果自动转换时失败，抛出conventException后，由对应的异常管理器处理。 
3、DDL数据状态自动修改 
DDL SQL在下游执行完毕后，基于事件通知方式将中间表存储的DDL状态改为已完成。 
DDL架构设计 
由于DDL没有统一标准，每个数据源的DDL语法不同，因此需要按照每个数据源的DDL语法进行解析，并将其解析为一个中间数据，然后将这个中间数据转为目标类型数据源的DDL语句。 
因此DDLConvent顶层接口会抽象出三个基本方法： 
1、RowData转为中间数据 
2、中间数据转为DdlSql 
3、获取数据源类型 
 
#### Calcite解析DDL实战 
Calcite解析DDL实战基于代码层面做此次演示，就不在公众号上做具体演示回顾，各位社区小伙伴们可前往B站查看视频直播回顾。 
B站直播回顾地址： 
https://www.bilibili.com/video/BV1eR4y1P7AH?spm_id_from=333.999.0.0 
 
#### 结语 
以上就是我们在数据还原上增加的DDL自动执行设计思路，我们规划将在上半年完成以上功能点，如果大家有好的想法也欢迎给我们提issue或者pr。 
issue规范 
在提交issue时须有对应脚本、提交模式、数据（非必要）、完整日志（重要的东西）等内容 
pr提交规范 
1、在pr里备注修复的issue 
2、pr commit 模版[hotfix/feat/docs-#issueID][#fix-module] #fix-commit（尽量使用英文，内容描述清楚） 
3、修改内容尽量保持与issue内容一致，如果出现无关修改，在pr中备注出来； 
社区文档中心 
同时为了帮助社区伙伴更好的了解和使用ChunJun，我们上线了社区文档中心，欢迎大家使用。 
https://dtstack.github.io/chunj
                                        