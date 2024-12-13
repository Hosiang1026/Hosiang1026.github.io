---
title: 推荐系列-解Bug之路-中间件-SQL重复执行-
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 887
cover_picture: 'https://static.oschina.net/uploads/img/202004/03131821_jFvB.jpg'
abbrlink: d4419436
date: 2021-04-14 07:54:42
---

&emsp;&emsp;前言 我们的分库分表中间件在线上运行了两年多，到目前为止还算稳定。在笔者将精力放在处理各种灾难性事件(例如中间件物理机宕机/数据库宕机/网络隔离等突发事件)时。竟然发现还有一些奇怪的...
<!-- more -->

                                                                                                                                                                                        #### 前言 
我们的分库分表中间件在线上运行了两年多，到目前为止还算稳定。在笔者将精力放在处理各种灾难性事件(例如中间件物理机宕机/数据库宕机/网络隔离等突发事件)时。竟然发现还有一些奇怪的corner case。现在就将排查思路写成文章分享出来。 
#### Bug现场 
##### 应用拓扑 
应用通过中间件连后端多个数据库,sql会根据路由规则路由到指定的节点,如下图所示:  
##### 错误现象 
应用在做某些数据库操作时，会发现有比较大的概率失败。他们的代码逻辑是这样: 
 ```java 
  	int count = updateSql(sql1);
	...
	// 伪代码
	int count = updateSql("update test set value =1 where id in ("100","200") and status = 1;
	if( 0 == count ){
		throw new RuntimeException("更新失败");
	}
	......
	int count = updateSql(sql3);
	...

  ```  
即每做一次update之后都检查下是否更新成功，如果不成功则回滚并抛异常。 在实际测试的过程中，发现经常报错，更新为0。而实际那条sql确实是可以更新到的(即报错回滚后，我们手动执行sql可以执行并update count>0)。 
##### 中���件日志 
笔者根据sql去中间件日志里面搜索。发现了非常奇怪的结果,日志如下: 
 ```java 
  2020-03-13 11:21:01:440 [NIOREACTOR-20-RW] frontIP=>ip1;sqlID=>12345678;rows=>0;sql=>update test set value =1 where id in ("1","2") and status = 1;start=>11:21:01:403;time=>24266;
2020-03-13 11:21:01:440 [NIOREACTOR-20-RW] frontIP=>ip1;sqlID=>12345678;rows=>2;sql=>update test set value =1 where id in ("1","2") and status = 1;start=>11:21:01:403;time=>24591;

  ```  
由于中间件对每条sql都标识了唯一的一个sqlID,在日志表现看来就好像sql执行了两遍!由于sql中有一个in，很容易想到是否被拆成了两条执行了。如下图所示:  这条思路很快被笔者否决了，因为笔者explain并手动执行了一下，这条sql确实只路由到了一个节点。真正完全否决掉这条思路的是笔者在日志里面还发现，同样的SQL会打印三遍！即看上去像执行了三次，这就和仅仅只in了两个id的sql在思路上相矛盾了。 
##### 数据库日志 
那到底数据真正执行了多少条呢？找DBA去捞一下其中的sql日志，由于线下环境没有日志切割，日志量巨大，搜索时间太慢。没办法，就按照现有的数据进行分析吧。 
##### 日志如何被触发 
由于当前没有任何思路，于是笔者翻看中间件的代码,发现在update语句执行后,中间件会在收到mysql okay包后打印上述日志。如下图所示:  注意到所有出问题的update出问题的时候都是同一个NIOREACTOR线程先后打印了两条日志，所以笔者推断这两个okay大概率是同一个后端连接返回的。 
##### 什么情况会返回多个okay? 
这个问题笔者思索了很久，因为在笔者的实际重新执行出问题的sql并debug时，永远只有一个okay返回。于是笔者联想到，我们中间件有个状态同步的部分,而这些状态同步是将set auto_commit=0等sql拼接到应用发送的sql前面。即变成如下所示: 
 ```java 
  sql可能为
set auto_commit=0;set charset=gbk;>update test set value =1 where id in ("1","2") and status = 1;

  ```  
于是笔者细细读了这部分的代码，发现处理的很好。其通过计算出前面拼接出的sql数量，再在接收okay包的时候进行递减，最后将真正执行的那条sql处理返回。其处理如下图所示:  但这里确给了笔者一个灵感，即一条sql文本确实是有可能返回多个okay包的。 
##### 真相大白 
在笔者发现(sql1;sql2;)这样的拼接sql会返回多个okay包后，就立刻联想到，该不会业务自己写了这样的sql发给中间件，造成中间件的sql处理逻辑错乱吧。因为我们的中间件只有在对自己拼接(同步状态)的sql做处理，明显是无法处理应用传过来即为拼接sql的情况。 由于看上去有问题的那条sql并没有拼接，于是笔者凭借这条sql打印所在的reactor线程往上搜索，发现其上面真的有拼接sql! 
 ```java 
  2020-03-1311:21:01:040[NIOREACTOR-20RW]frontIP=>ip1;sqlID=>12345678;rows=>1;
sql=>update test_2 set value =1 where id=1 and status = 1;update test_2 set value =1 where id=2 and status = 1;

  ```  
 如上图所示，(update1;update2)中update1的okay返回被驱动认为是所有的返回。然后应用立即发送了update3。前脚刚发送,update2的okay返回就回来了而其刚好是0，应用就报错了(要不是0，这个错乱逻辑还不会提前暴露)。那三条"重复执行"也很好解释了，就是之前的拼接sql会��三��。 
##### 为何是概率出现 
但奇怪的是，并不是每次拼接sql都会造成update3"重复执行"的现象，按照笔者的推断应该前面只要是多条拼接sql就会必现才对。于是笔者翻了下jdbc驱动源码，发现其在发送命令之前会清理下接收buffer，如下所示: 
 ```java 
  MysqlIO.java
final Buffer sendCommand(......){
	......
	// 清理接收buffer,会将残存的okay包清除掉
	clearInputStream();
	......
	send(this.sendPacket, this.sendPacket.getPosition());
	......
}

  ```  
正是由于clearInputStream()使得错误非必现(暴露)，如果okay(update2)在应用发送第三条sql前先到jdbc驱动会被驱动忽略！ 让我们再看一下不会让update3"重复执行"的时序图:  即根据okay(update2)返回的快慢来决定是否暴露这个问题,如下图所示:  同时笔者观察日志，确实这种情况下"update1;update2"这条语句在中间件里面日志有两条。 
##### 临时解决方案 
让业务开发不用这些拼接sql的写法后，再也没出过问题。 
#### 为什么不连中间件是okay的 
业务开发这些sql是就在线上运行了好久，用了中间件后才出现问题。 既然不连中间件是okay的，那么jdbc必然有这方面的完善处理，笔者去翻了下mysql-connect-java(5.1.46)。由于jdbc里面存在大量的兼容细节处理，笔者这边只列出一些关键代码路径: 
 ```java 
  MySQL JDBC 源码
MySQLIO
stack;
executeUpdate
	|->executeUpdateInternel
		|->executeInternal
			|->execSQL
				|->sqlQueryDirect
					|->readAllResults (MysqlIO.java)
readAllResults: //核心在这个函数的处理里面
ResultSetImpl readAllResults(......){
		......
       while (moreRowSetsExist) {
			  ......
			  // 在返回okay包的保中其serverStatus字段中如果SERVER_MORE_RESULTS_EXISTS置位
			  // 表明还有更多的okay packet
            moreRowSetsExist = (this.serverStatus & SERVER_MORE_RESULTS_EXISTS) != 0;
        }
        ......
}

  ```  
正确的处理流程如下图所示:  而我们中间件的源码确实这么处理的: 
 ```java 
  @Override
public void okResponse(byte[] data, BackendConnection conn) {
	......
	// 这边仅仅处理了autocommit的状态，没有处理SERVER_MORE_RESULTS_EXISTS
	// 所以导致了不兼容拼接sql的现象
	ok.serverStatus = source.isAutocommit() ? 2 : 1;
	ok.write(source);
	......
}

  ```  
##### select也"重复执行"了 
解决完上面的问题后，笔者在日志里竟然发现select尽然也有重复的，这边并不会牵涉到okay包的处理，难道还有问题？日志如下所示: 
 ```java 
  2020-03-13 12:21:01:040[NIOREACTOR-20RW]frontIP=>ip1;sqlID=>12345678;rows=>1;select abc;
2020-03-13 12:21:01:045[NIOREACTOR-21RW]frontIP=>ip2;sqlID=>12345678;rows=>1;select abc;

  ```  
从不同的REACTOR线程号(20RW/21RW)和不同的frontIP(ip1,ip2)来看是两个连接执行了同样的sql,但为何sqlID是一样的？任何一个诡异的现象都必须一查到底。于是笔者登录到应用上看了下应用日志，确实应用有两个不同的线程运行了同一条sql。 那肯定是中间件日志打印的问题了,笔者很快就想通了其中的关窍，我们中间件有个对同样sql缓存其路由节点结构体的功能(这样下一次同样sql就不必解析，降低了CPU)，而sqlID信息正好也在那个路由节点结构体里面。如下图所示:  这个缓存功能感觉没啥用(因为线上基本是没有相同sql的)，于是笔者在笔者优化的闪电模式下(大幅度提高中��件��能)将这个功能禁用掉了，没想到为了排查问题而开启的详细日志碰巧将这个功能开启了。 
#### 总结 
任何系统都不能说百分之百稳定可靠，尤其是不能立flag。在线上运行了好几年的系统也是如此。只有对所有预料外的现象进行细致的追查与深入的分析并解决，才能让我们的系统越来越可靠。  
#### 公众号 
关注笔者公众号，获取更多干货文章:  
#### 原文链接 
https://my.oschina.net/alchemystar/blog/3208851 
                                        