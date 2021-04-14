---
title: 推荐系列-BaikalDB技术实现内幕（一）-- 分布式事务实现
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 722
cover_picture: 'https://static.oschina.net/uploads/img/202007/06103939_hkrn.jpg'
abbrlink: a21b8c79
date: 2021-04-14 07:54:42
---

&emsp;&emsp;本系列文章主要介绍HTAP数据库BaikalDB的技术实现细节。 作者介绍：罗小兵，百度商业平台研发部高级研发工程师，主要负责BaikalDB事务能力，全局二级索引等方向的研发工作。 欢迎关注 Star g...
<!-- more -->

                                                                                                                                                                                         
#### 一、概述 
##### BaikalDB系统简介 
BaikalDB是一个分布式可扩展的存储系统，兼容MySQL协议，整个系统的架构如下图所示： 
 
 
 BaikalStore 负责数据存储，数据分区按region组织，三个Store的三个region形成一个 Raft-group 实现三副本，多实例部署，Store实例宕机可以自动迁移 Region数据； 
 BaikalMeta 负责元信息管理，包括分区，容量，权限，均衡等， Raft 保障的3副本部署，Meta 宕机只影响数据无法扩容迁移，不影响数据读写； 
 BaikaDB 负责前端SQL解析，查询计划生成执行，无状态全同构多实例部署，宕机实例数不超过 qps 承载极限即可； 
 
##### 分布式事务 
BaikalDB将数据按照range进行切分，每个分区称为region，连续的region组成了数据的整个区间。不同的region位于不同的BaikalStore实例，在不同的机器上，那么当一个SQL语句涉及多个region的更新时，如何保证所有的更新，要么全部成功，要么全部失败呢，这就需要分布式事务。讲到事务，我们先回顾一下事务的ACID特性： 
 
 Atomicity（原子性）：一个事务（transaction）中的所有操作，要么全部完成，要么全部失败，不会出现中间状态。事务在执行过程中发生错误，会被 回滚（Rollback）到事务开始前的状态，就像这个事务从来没有执行过一样； 
 Consistency（一致性）：数据库在事务执行之前和执行之后处于一致性状态，完整性没有被破坏； 
 Isolation（隔离性）：数据库允许多个并发事务同时对其数据进行读写和修改的能力，隔离性可以防止多个事务并发执行时由于交叉执行而导致数据的不一致； 
 Durability（持久性）：事务处理结束后，对数据的修改就是永久的，即便系统故障也不会丢失。 
 
分布式事务就是在分布式环境下实现和传统数据库事务一样的 ACID 功能，目前BaikalDB实现了分布式事务的功能，支持的事务相关的SQL语句包括： 
 
 事务开始 BEGIN / START TRANSACTION 
 事务提交COMMIT 
 事务回滚ROLLBACK 
 设置自动提交状态SET AUTOCOMMIT=0/1 
 
#### 二、分布式事务实现 
BaikalDB通过两阶段提交协议（2PC），借助RocksDB的Pessimistic事务和Savepoint机制实现分布式事务。下面逐步介绍BaikalDB的分布式事务实现，���然，分布式事务非常复杂，BaikalDB的分布式事务还在不断的迭代开发。 
##### 两阶段提交协议（2PC） 
二阶段提交协议（Two-phase Commit，即2PC）是常用的分布式事务原子提交的解决办法，它有一个协调者（coordinator）和多个参与者（participant），可以保证在分布式事务中，要么所有参与者要么都提交事务，要么都取消事务，交互流程如图所示： 
 
协调者的提交过程分两个步骤分别与参与者交互： 
 
 第一阶段：发送prepare请求给所有参与者 ，询问是否可能提交。 
 第二阶段：如果所有参与者都回复YES，则发起第 2 阶段的 提交（commit） 真正提交；如果任意一个 参与者 回复NO或者超时无响应，则第 2 阶段改为 中止（abort） 回滚之前的操作。 
 
##### BaikalDB的实现 
BaikalDB的分布式事务通过2PC+RocksDB的单机事务实现悲观事务。 
一次事务执行通常包括BEGIN语句，一个或多个DML语句，COMMIT语句或ROLLBACK语句，BaikalDB为每个语句都分配了一个seq_id，并且seq_id单调连续递增。 
seq_id=1对应BEGIN语句，会在BaikalDB缓存，和第一条DML语句一起发送给BaikalStore，然后BEGIN语句会在BaikalStore创建一个RocksDB的Pessimistic事务，接着开始执行之后的DML语句，同时BaikalStore会记录当前执行过的DML语句的seq_id，用于事务幂等处理，COMMIT语句实际上分成了PREPARE + COMMIT，先发PREPARE到各个region，都返回成功，再发COMMIT。 
下表介绍了与事务相关的数据信息： 
 
  
   
   数据 
   描述 
   
  
  
   
   事务ID（txn_id） 
   全局唯一都事务ID，由两部分组成，BaikalDB全局唯一的实例ID（下文中的server_instance_id，占用3 bytes）和BaikalDB实例内部ID（5 bytes，实例内部全局唯一且递增） 
   
   
   DML语句ID（seq_id） 
   当前命令在事务内部的序列号，在事务内由1开始连续递增 
   
   
   BaikalDB实例ID（server_instance_id） 
   BaikalDB全局唯一的实例ID（占用3 bytes，由BaikalMeta统一分配) 
   
   
   待回滚的DML语句ID（need_rollback_seq） 
   实现多语句局部回滚 
   
   
   事务所有DML语句集合（cache_plans） 
   缓存了事务中的所有语句的执行计划，用于在事务执行过程中发生Region分裂或RAFT切主时进行重试 
   
  
 
BaikalDB与BaikalStore事务交互的message为： 
 ```java 
  message TransactionInfo {
    required uint64 txn_id            = 1;  // 由baikaldb生成的全局事务id
    required int32  seq_id            = 2;  // 当前语句的seq_id
    optional int32  start_seq_id      = 3;  // the start_seq_id of the command in this request (include cached)
    optional bool   optimize_1pc      = 4;  // 单region 1pc优化
    repeated int32  need_rollback_seq = 5;  //因为在某些region上执行失败，需要全局回滚seq_id
    repeated CachePlan cache_plans    = 6;  //缓存的query的执行计划
    optional bool    autocommit       = 7;
};

  ```  
下面举例说明多语句事务整个两阶段提交示意图： 
 
整个多语句事务语句执行的序列为BEGIN，D1，D2，D3，D4，P，C。 
 
 BaikalDB充当协调者的角色，执行BEGIN / START TRANSACTION后创建BEGION(seq_id=1)并缓存在cache_plans，D1(seq_id=2)涉及到region1和region2，将BEGIN和D1一起发送到region1和region2执行； 
 D2(seq_id=3)，D3(seq_id=4)，D4(seq_id=5)分别涉及region1和region2，分别执行; 
 P(seq_id=6) 即PREPARE，向region1和region2都发送PREPARE，PREPARE之前的指令都在Raft的Leader上执行的，PREPARE指令执行时会将之前的语句和PREPARE打包成一条Raft日志提交，之后Follower也有了整个事务的操作； 
 C(seq_id=7)即COMMIT，向region1和region2都发送COMMIT，COMMIT提交一条Raft日志最终整个事务提交完成。 
 
##### 多语句局部回滚 
对于多语句事务，某些DML失败不影响整个事务的提交，当其中某一条DML语句涉及多个region时，可能一些region执行成功，一些region执行失败，当有region执行失败时需要回滚整条DML已经操作过的region，不然多region之间数据会不一致，BaikalDB利用了RocksDB的Savepoint机制来保证数据一致性。 
具体实现： 
 
 在每个region在执行一条语句之前，会调用RocksDB事务的txn->SetSavePoint()设置保存点，并将当前的seq_id保存到栈 std::stack<int> _save_point_seq中； 
 然后执行该语句，如果执行失败，BaikalDB将需要回滚的seq_id添加need_rollback_seq中，在下一次请求BaikalStore时携带上need_rollback_seq到对应的region； 
 在region上以逆序的方式遍历need_rollback_seq，然后和栈顶_save_point_seq.top比较，若seq_id与栈顶相等，表明该region之前执行了该seq_id对应的语句，则调用RocksDB的txn->RollbackToSavePoint()回滚保存点。 
 
通过上面的步骤来实现局部语句的回滚，下面举例说明整个流程，假设多语句事务： 
 
  
   
   sql 
   seq_id 
   涉及的region 
   执行结果 
   
  
  
   
   B 
   1 
   R1,R2,R3 
    
   
   
   D1 
   2 
   R1 
   成功 
   
   
   D2 
   3 
   R2,R3 
   成功 
   
   
   D3 
   4 
   R1,R2,R3 
   R3失败，整条语句需要回滚 
   
   
   D4 
   5 
   R3 
   成功 
   
   
   D5 
   6 
   R1,R2 
   R2失败，整条语句需要回滚 
   
   
   P 
   7 
   R1,R2,R3 
   成功 
   
   
   C 
   8 
   R1,R2,R3 
   成功 
   
  
 
整个_save_point_seq的变化如下表所示： 
 
#### 三、异常宕机处理 
两阶段提交协议的缺点是在整个交互过程中，所有节点都处于阻塞状态，RocksDB的Pessimistic事务在未提交之前key都处于锁定状态。 
当协调者发生故障后，参与者会一直阻塞下去，更严重的是在二阶段提交的阶段二中，当协调者向参与者发送commit请求之后，发生了局部网络异常或者在发送commit请求过程中协调者发生了故障，这回导致只有一部分参与者接受到了commit请求，导致数据不一致。 
本节将介绍BiakalDB如何处理阻塞、协调者单点以及数据不一致的问题。 
###### BaikalDB异常处理 
BaikalDB充当着两阶段提交的协调者角色，如果事务执行过程中BaikalDB宕机可能会对整个系统之后的操作产生影响，参与者将处于不确定状态，如图所示，不同参与者状态不一致了。 
 
下面对不同阶段BaikalDB宕机可能产生的影响总结如下： 
 
BaikalDB宕机可能导致事务残留，残留事务除了阻塞后续写请��外��如上表所示最坏的情况可能会导致数据不一致，这里要解决的问题有两个： 
 
 残留事务如何清除； 
 部分commit导致数据不一致如何处理。 
 
这里BaikalDB参考Percolator事务模型的机制，随机选取第一条DML指令的某一个region为primary region(sync point)，在执行COMMIT/ROLLBACK的时候首先向primary region发送请求，保证primary region执行成功，再向其他region发送COMMIT/ROLLBACK，让primary region来充当事务协调者的角色，具体流程： 
 
  
   
   指令 
   序号seq_id 
   涉及region_id 
   
  
  
   
   BEGIN 
   1 
   1,2,3 
   
   
   D1 
   2 
   1 
   
   
   D2 
   3 
   2 
   
   
   D3 
   4 
   1,2,3 
   
   
   D4 
   5 
   3 
   
   
   PREPARE 
   6 
   1,2,3 
   
   
   COMMIT 
   7 
   1,2,3 
   
  
 
 
说明： 
 
 BEGIN实际会和每个region的第一条DML1一起打包执行，执行时随机指定一个region作为primary region； 
 COMMIT指令之前的命令都是并发执行，执行出错直接给用户返失败； 
 COMMIT首先在primary region执行，并且必须保证执行成功； 
 primary region执行COMMIT成功后剩下的region并发执行COMMIT。 
 
primary region事务执行完commit/rollback后，second region如果一定时间阈值未收到commit/rollback则通过反查primary region来判断事务是commit还是rollback，这里primary region事务的commit/rollback状态需要记录，我们只对rollback在RocksDB中记录信息，second region反查时首先查看事务是否还存在，如果存在则不做操作，如果不存在再读取RocksDB判断是否有事务的rollback记录，如果有就执行rollback，如果没有就执行commit，这样保证了整个事务commit/rollback的一致性。 而对于残留的事务，primary region超过一定时间阈值会主动rollback，其他的region则通过反查的方式最终保证事务被及时清除。 通过这样的方式解决事务的阻塞、协调者单点以及数据不一致的问题。 
###### BaikalStore异常处理 
BaikalStore作为存储层，也是2PC的参与者，需要保证高可用。BaikalStore用 region 组织，三个 Store 的 三个region形成一个 Raft group 实现三副本实现高可用，Raft库使用的braft。BaikalStore要考虑在PREPARE/COMMIT前后宕机如何恢复，为此我们需要记录相关的元数据信息，再利用Raft的日志(把Raft日志作为redo log)来恢复事务状态，相关元信息包括： 
 
  
   
   元信息记录 
   说明 
   
  
  
   
   write_meta_before_prepared 
   在执行RocksDB的prepare之前记录prepare时Raft的log_index+txn_id 
   
   
   write_pre_commit 
   在执行RocksDB的commit/rollback之前记录Raft的log_index+txn_id 
   
   
   write_meta_after_commit 
   在执行RocksDB的commit/rollback之后记录Raft的log_index,同时删除write_pre_commit和write_meta_before_prepared记录的Raft的log_index+txn_id 
   
  
 
BaikalStore可能得宕机时刻如下图所示，下面说明在不同时刻宕机重启事务的恢复流程。 
 
 
 ① 或②时宕机，此时之前的语句都在leader上执行，宕机后Raft重新选主，之后请求发送到新leader时根据请求的start_seq_id判断让BaikalDB重新发送之前的语句来恢复事务状态(region第一次执行事务时start_seq_id都会置为1，如果请求的start_seq_id>1但BaikalStore重启后因为没有执行过事务，记录的seq_id为0，需要重传之前的语句)； 
 ③或④时宕机，此时PREPARE执行成功，语句已经通过Raft复制到整个Raft组。在重启时通过RocksDB的GetAllPreparedTransactions拿到已经prepare的事务txn_id，再根据write_meta_before_prepared记录的log_index+txn_id，拿到执行过prepare事务的log_index，根据log_index读取Raft日志恢复事务状态； 
 ⑤时宕机，此时commit已经执行，通过RocksDB的GetAllPreparedTransactions拿不到txn_id，通过检查是否存在pre_commit信息，可以知道宕机在commit 和 write_meta_after之间，此时重新执行write_meta_after_commit即可； 
 ⑥时宕机，此时事物已经全部执行完成，无需任何操作。 
 
##### 其他异常处理 
当Raft发生Leadership Transfer时，如果此时事务已经执行了Prepare命令，说明整个事务已经通过Raft复制给follower，无需特殊处理。否则需要将Old Leader上的事务回滚，并在收到BaikalDB发送的下一条事务命令时，在New Leader上利用BaikalDB的重试机制补发缺失的命令，从头开始执行事务。 
#### 四、优化 
事务功能上线运行的过程中，我们发现了很多可以优化的地方，本节简单介绍两点。 
##### 多语句Raft复制优化 
如前所述，事务执行流程为，先在leader执行，并将指令缓存在leader，待prepare时通过Raft复制将所以指令复制给follower。因为leader已经在Raft外部执行完成，在日志应用(on_apply)时leader不再执行，而follower从begin到prepare所有指令全部在on_apply中执行，根据Raft语义，on_apply为串行执行，所以导致follower执行缓慢效率低。优化为leader执行一条指令成功后立即通过raft复制给follower执行，提高follower的并发度。 
 
实现要点： 
 
 DML语句在leader上执行是在Raft外，在执行成功后再提交一条Raft log，follower的DML语句是在Raft状态机内执行，这样一来状态机不会被卡住； 
 执行第一条语句时需要记录Raft的log_index到RocksDB，如果BaikalStore宕机，重启时从记录的最小Raft的log_index开始遍历Raft log，恢复尚未提交的事务。 
 
##### 只读事务优化 
只读事务在执行commit时按照当前的实现，PREPARE和CPOMMIT会两次raft日志，但这是没有必要的，只需要在Leader上进行判断，对只读事务，直接执行prepare和commit即可，更进一步，对只读事务将prepare和commit转化为rollback处理，RocksDB事务执行rollback性能更好。 
#### 后记 
本文从实现原理、宕机恢复等方面介绍了BaikalDB分布式事务的实现，支持单语句事务（autocommit=1模式下的DML形成单语句事务）和使用显式控制命令的多语句事务。 binlog，MVCC，子查询等功能还正在不断完善中，如果你有兴趣，欢迎加入github.com/baidu/BaikalDB。
                                        