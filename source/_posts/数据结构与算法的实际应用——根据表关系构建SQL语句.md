---
title: 推荐系列-数据结构与算法的实际应用——根据表关系构建SQL语句
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 1959
cover_picture: 'https://oscimg.oschina.net/oscnet/up-ad374c7f0532171add44d6e2141ace62855.png'
abbrlink: 9c2d89b8
date: 2021-04-15 09:46:45
---

&emsp;&emsp;背景需求 最近在项目中有一个场景，根据前端可视化模式传入的参数构建一组SQL语句，应用在Spark Streaming应用的数据同步中。这其实是一个已有的功能，但是发现原先的代码实现发现有较严重的...
<!-- more -->

                                                                                                                                                                                        #### 背景需求 
最近在项目中有一个场景，根据前端可视化模式传入的参数构建一组SQL语句，应用在Spark Streaming应用的数据同步中。这其实是一个已有的功能，但是发现原先的代码实现发现有较严重的问题，导致该功能在有关联查询时不可用，我经过调研之后决定重新实现。 
这些SQL由普通的Lookup SQL和Spark SQL组成，Lookup SQL用于查询关联数据，SparkSQL则用于输出结果，核心问题在于如何合理组织这些表的关联关系。 
PS：实现代码为Scala语言。 
#### 参数 
其中前端传入的参数为 
 
 ```java 
  case class UpdateTask(
                      @BeanProperty id: Option[Long],
                      @BeanProperty taskName: Option[String],
                      @BeanProperty taskDesc: Option[String],
                      @BeanProperty sourceInstance: Option[String],
                      @BeanProperty targetInstance: Option[Long],
                      @BeanProperty eventInstance: Option[Long],
                      @BeanProperty sourceTree: Option[Seq[Long]],
                      @BeanProperty selectSourceTree: Option[Seq[Long]],
                      @BeanProperty targetTree: Option[Long],
                      @BeanProperty eventTable: Option[Long],
                      @BeanProperty tableRelation: Option[Seq[TableRelation]],
                      @BeanProperty filterCondition: Option[String],
                      @BeanProperty targetCalculateTableName: Option[String],
                      @BeanProperty targetCalculate: Option[Seq[TargetCalculate]],
                      @BeanProperty sourceTableField: Option[Seq[TableColumnInfo]],
                      @BeanProperty sqlType: Option[Int],
                      @BeanProperty classicSql: Option[String],
                      @BeanProperty sinkConfig: Option[String],
                      @BeanProperty targetPrimaryKey: Option[Seq[String]]
                     ) extends SimpleBaseEntity

  ``` 
  
所需要用的参数为 
 
   
 ```java 
  eventTable
  ``` 
  : 触发表  
   
 ```java 
  tableRelation
  ``` 
  : 表关联关系列表，其中 
 ```java 
  TableRelation
  ``` 
  的结��为  
 ```java 
  case class TableRelation(@BeanProperty leftTableSelect: Long,
                         @BeanProperty rightTableSelect: Long,
                         @BeanProperty leftColumnSelect: String,
                         @BeanProperty rightColumnSelect: String)

  ``` 
   
   
 ```java 
  targetCalculate
  ``` 
  : 输出结果的计算表达式，其中  
 ```java 
  TargetCalculate
  ``` 
  的结构为  
 ```java 
  case class TargetCalculate(@BeanProperty columnName: String,
                           @BeanProperty config: String)

  ``` 
   
   
 ```java 
  selectSourceTree
  ``` 
  : 所用到的源表  
 
#### 解决方案 
当没有关联关系的时候，比较简单，不在此讨论。当有多个关联关系时，应该先查询出被关联的表数据，再查询下一级的表，以此类推，实际场景下可能一般只有一两个表关联，但是毕竟还是需要考虑极端情况，原先的实现只考虑了简单的关联，复杂一点的关联则无法处理，经过一段时间思考后，决定基于树这种数据结构去实现此功能。 
假设传入了如下一些表关系，并且A表为源表（触发表）： 
 
 ```java 
  A <-> B
A <-> C
A <-> D
B <-> E
B <-> F
E <-> G
C <-> H
C <-> I

  ``` 
  
则经过处理后，可以生成如下一个树 
 
 ```java 
               --> E <--> G
    --> B <--|
    |        --> F
    |
A <----> D
    |
    |        --> H
    --> C <--|
             --> I

  ``` 
  
在此需要说明，不需要考虑左右顺序问题，例如 A <-> B 等价于 B <-> A，在后面对此问题会有说明。 
当传入了多个相同的表关联关系时，需要做一个聚合，因为前端的参数中，每一个关联关系只包含一组关联字段，所以当有多个关联字段时，就传入了多个相同的关联关系，但是关联字段不同。 
得到这个树形关系后，也同时得到了表之间的依赖关系，但是还有一个前提， 每个表只能依赖一个表，假设如下关系： 
 
 ```java 
               --> E <--> G
    --> B <--|
    |        --> F
    |
A <----> D
    |
    |        --> H
    --> G <--|
             --> I

  ``` 
  
此时，G表既可以由A得到，又可以由E得到，假设从A表得到G表，那么从G表又可以得到E表......产生了歧义，并由此产生一个了有环图。但是我们需求中目前没有这种关联关系（因为前端配置页面中，没有标识关联的方向性，即目前可视化模式传入的关联关系都是双向，对于一组关系，既可以从A得到B，也可以从B得到A，也就是前面的：A <-> B 等价于 B <-> A），所以不考虑这种情况，出现时给予报错，提示依赖关系产生了环。如果有方向性的话，我们生成树的算法会更简单一些，直接DFS即可，但是对于重复出现的表，需要做额外处理，例如给重复表起别名，保证结果集不会出现重名字段，否则Spark在处理过程中会产生异常。 
在得到这个依赖关系后，后面的事情就好办了，我们从根节点开始层序遍历（也即为BFS广度优先遍历），逐层构建SQL语句，也可以采用树的先序遍历（DFS深度优先），只要保证子节点在父节点后面遍历即可，保证后面的SQL语句用到的关联参数在前面的SQL中已经查询到。 
在生成SQL的过程中，为了避免不同库表有相同的表名或字段名，除了最后一句输出结果的Spark SQL，前面的SQL查询字段均需要起一个别名，在此沿用之前旧代码的方案：使用  
 ```java 
  {字段名} AS {库名}__{表名}__{字段名}
  ``` 
  的形式保证字段名不会重复 
#### 代码实现 
##### 数据结构类定义 
有了思路之后，便开始着手实现此功能，首先��义一个树节点的case类： 
 
 ```java 
  case class TableRelationTreeNode(value: Long, // 当前节点的表id
                                 parentRelation: LinkRelation, // 和父节点的关联关系
                                 childs: ListBuffer[TableRelationTreeNode]  // 子节点
                                 )

  ``` 
  
 
 ```java 
  LinkRelation
  ``` 
  描述了两个表之间的关联关系，是对前端传入的 
 ```java 
  TableRelation
  ``` 
 聚合后的结果： 
 
 ```java 
  case class LinkRelation(leftTable: Long, // 左表id
                        rightTable: Long, // 右表id
                        linkFields: Seq[(String, String)] // 关联字段, 元组的两个参数分别为左表字段、右表字段
                        )

  ``` 
  
##### 关联关系树的构建 
 
 ```java 
  /**
 * @param parentNode      父节点
 * @param remainRelations 剩余关联关系
 */
def buildRelationTree(parentNode: TableRelationTreeNode, remainRelations: ListBuffer[LinkRelation]): Any = {
  if (remainRelations.isEmpty) return
  val parentTableId = parentNode.value;
  // 找出关联关系中包含父节点的表id
  val childRelation = remainRelations.filter(e => e.leftTable == parentTableId || e.rightTable == parentTableId)
  if (childRelation.isEmpty) return
  // 将关联关系中父节点的关联信息置于左侧，方便后续操作
  childRelation
    .map(e => if (e.leftTable == parentTableId) e else LinkRelation(e.rightTable, e.leftTable, e.linkFields.map(e => (e._2, e._1))))
    .foreach{e => parentNode.childs += TableRelationTreeNode(e.rightTable, e, new ListBuffer())}
	// 移除已经使用过的关联关系
  remainRelations --= childRelation
  parentNode.childs foreach {buildRelationTree(_, remainRelations)}
}

  ``` 
  
##### SQL语句生成的核心代码 
 
 ```java 
  def buildTransSQL(task: UpdateTask): Seq[String] = {
		// 存储所有用到的表（namespace为表的信息）
    val namespacesRef = mutable.HashMap[Long, Namespace]()
    task.selectSourceTree.get.foreach(i => namespacesRef += (kv = (i, Await.result(namespaceDal.findById(i), minTimeOut).get)))
    val targetTableId = task.targetTree.get
		// 目标表
    val targetNamespace = Await.result(namespaceDal.findById(targetTableId), minTimeOut).head
    namespacesRef.put(targetTableId, targetNamespace)
    val eventTableId = task.eventTable.get
		// 事件表（源/触发表）
    val eventNamespace = namespacesRef(eventTableId)
		// 没有计算逻辑，当做镜像同步，直接SELECT * ...
    if (task.targetCalculate.isEmpty)
      return Seq.newBuilder.+=(s"spark_sql= select * from ${eventNamespace.nsTable};").result()
		
    val transSqlList = new ListBuffer[String]

    // 先将触发表的所有字段查询出来
    transSqlList += s"spark_sql= select ${
      sourceDataDal.getSourceDataTableField(eventTableId).filter(_ != "ums_active_").map(e => {
        s"$e AS ${eventNamespace.nsDatabase}__${eventNamespace.nsTable}__$e"
      }).mkString(", ")
    } from ${eventNamespace.nsTable}"

    if (task.getTableRelation.nonEmpty) {

      val remainLinks = new ListBuffer[LinkRelation]()
      // 聚合重复的表关联关系
      task.getTableRelation.getOrElse(Seq.empty)
        .map(e => {
          if (e.leftTableSelect > e.rightTableSelect) {
            TableRelation(
              leftTableSelect = e.rightTableSelect,
              rightTableSelect = e.leftTableSelect,
              leftColumnSelect = e.rightColumnSelect,
              rightColumnSelect = e.leftColumnSelect
            )
          } else e
        })
        .groupBy(e => s"${e.leftTableSelect}-${e.rightTableSelect}")
        .map(e => {
          LinkRelation(
            leftTable = e._2.head.leftTableSelect,
            rightTable = e._2.head.rightTableSelect,
            linkFields = e._2.map(e => (e.leftColumnSelect, e.rightColumnSelect))
          )
        }) foreach {
        remainLinks += _
      }
			
			// 根结点
      val rootTreeNode = TableRelationTreeNode(
        eventTableId,
        null,
        new ListBuffer[TableRelationTreeNode]
      )
      // 构建关系树
      buildRelationTree(rootTreeNode, remainLinks)

      // 如果有剩余的关系未被使用，则说明有无法连接到根节点的关系，抛出异常
      if (remainLinks.nonEmpty) {
        throw new IllegalArgumentException(s"游离的关联关系：${
          remainLinks.map(e => {
            val leftNs = namespacesRef(e.leftTable)
            val rightNs = namespacesRef(e.rightTable)
            s"${leftNs.nsDatabase}.${leftNs.nsTable} <-> ${rightNs.nsDatabase}.${rightNs.nsTable}"
          }).toString
        }\n无法与根节点(${eventNamespace.nsDatabase}.${eventNamespace.nsTable})建立关系")
      }

      val queue = new mutable.Queue[TableRelationTreeNode]
      queue.enqueue(rootTreeNode)
      // 广度优先遍历，逐层构建SQL语句，保证依赖顺序
      while (queue.nonEmpty) {
        val len = queue.size
        for (i <- 0 until len) {
          val node = queue.dequeue
          if (node.value != eventTableId) {
            val relation = node.parentRelation
            // 当前节点表
            val curNs = namespacesRef(node.value)
            // 父节点表
            val parNs = namespacesRef(relation.leftTable)
            val curTableName = s"${curNs.nsDatabase}.${curNs.nsTable}"
            val fields = sourceDataDal.getSourceDataTableField(node.value)
            val fieldAliasPrefix = s"${curNs.nsDatabase}__${curNs.nsTable}__"
            // 构建lookup SQL
            transSqlList += s"pushdown_sql left join with ${curNs.nsSys}.${curNs.nsInstance}.${curNs.nsDatabase}=select ${
              fields.map(f => s"$f as $fieldAliasPrefix$f").mkString(", ")
            } from $curTableName where (${
              relation.linkFields.map(_._2.replaceAll(".*\\.", "")).mkString(",")
            }) in (${relation.linkFields.map(_._1.replace(".","__")).map(e => "${" + e + "}").mkString(",")})";
          }
          node.childs foreach { queue.enqueue(_) }
        }
      }
    }
    // 输出最终结果集的SparkSQL
    transSqlList += s"spark_sql= select ${
      task.targetCalculate.get.map { e =>
        s"${e.config.replaceAll("(\\w+)\\.(\\w+)\\.(\\w+)", "$1__$2__$3")} as ${e.columnName}"
      }.mkString(", ")
    } from ${eventNamespace.nsTable} where ${if (task.filterCondition.getOrElse("") == "") "1=1" else task.filterCondition.get}"

    transSqlList.toSeq
  }

  ``` 
  
#### 测试 
我新建了几张测试表，并使用小程序向库中随机生成了一些数据，然后又新建了一个目标表，以此来测试该功能，过程如下 
##### 前端配置 
关联关系 
![Test](https://oscimg.oschina.net/oscnet/up-ad374c7f0532171add44d6e2141ace62855.png  '数据结构与算法的实际应用——根据表关系构建SQL语句') 
计算逻辑 
![Test](https://oscimg.oschina.net/oscnet/up-ad374c7f0532171add44d6e2141ace62855.png  '数据结构与算法的实际应用——根据表关系构建SQL语句') 
抽象出的关联关系应为： 
 
 ```java 
                                           ------> customer_transaction
                                         |
customer <---> customer_account_info <----
                                         |
                                         ------> customer_seller_relation  <-----> seller_info

  ``` 
  
##### 后台生成的SQL： 
 
 ```java 
  spark_sql =
select
  address AS adp_mock_spr_mirror__customer__address,
  company AS adp_mock_spr_mirror__customer__company,
  gender AS adp_mock_spr_mirror__customer__gender,
  id AS adp_mock_spr_mirror__customer__id,
  id_card AS adp_mock_spr_mirror__customer__id_card,
  mobile AS adp_mock_spr_mirror__customer__mobile,
  real_name AS adp_mock_spr_mirror__customer__real_name,
  ums_id_ AS adp_mock_spr_mirror__customer__ums_id_,
  ums_op_ AS adp_mock_spr_mirror__customer__ums_op_,
  ums_ts_ AS adp_mock_spr_mirror__customer__ums_ts_
from
  customer;

pushdown_sql
  left join with tidb.spr_ods_department.adp_mock_spr_mirror =
select
  account_bank as adp_mock_spr_mirror__customer_account_info__account_bank,
  account_level as adp_mock_spr_mirror__customer_account_info__account_level,
  account_no as adp_mock_spr_mirror__customer_account_info__account_no,
  customer_id as adp_mock_spr_mirror__customer_account_info__customer_id,
  entry_time as adp_mock_spr_mirror__customer_account_info__entry_time,
  id as adp_mock_spr_mirror__customer_account_info__id,
  loc_seller as adp_mock_spr_mirror__customer_account_info__loc_seller,
  risk_level as adp_mock_spr_mirror__customer_account_info__risk_level,
  risk_test_date as adp_mock_spr_mirror__customer_account_info__risk_test_date,
  ums_active_ as adp_mock_spr_mirror__customer_account_info__ums_active_,
  ums_id_ as adp_mock_spr_mirror__customer_account_info__ums_id_,
  ums_op_ as adp_mock_spr_mirror__customer_account_info__ums_op_,
  ums_ts_ as adp_mock_spr_mirror__customer_account_info__ums_ts_
from
  adp_mock_spr_mirror.customer_account_info
where
  (id) in ($ { adp_mock_spr_mirror__customer__id });

pushdown_sql
  left join with tidb.spr_ods_department.adp_mock_spr_mirror =
select
  customer_id as adp_mock_spr_mirror__customer_seller_relation__customer_id,
  id as adp_mock_spr_mirror__customer_seller_relation__id,
  relation_type as adp_mock_spr_mirror__customer_seller_relation__relation_type,
  seller_id as adp_mock_spr_mirror__customer_seller_relation__seller_id,
  ums_active_ as adp_mock_spr_mirror__customer_seller_relation__ums_active_,
  ums_id_ as adp_mock_spr_mirror__customer_seller_relation__ums_id_,
  ums_op_ as adp_mock_spr_mirror__customer_seller_relation__ums_op_,
  ums_ts_ as adp_mock_spr_mirror__customer_seller_relation__ums_ts_,
  wechat_relation as adp_mock_spr_mirror__customer_seller_relation__wechat_relation
from
  adp_mock_spr_mirror.customer_seller_relation
where
  (customer_id) in (
    $ { adp_mock_spr_mirror__customer_account_info__id }
  );
  
pushdown_sql
  left join with tidb.spr_ods_department.adp_mock_spr_mirror =
select
  balance as adp_mock_spr_mirror__customer_transaction__balance,
  borrow_loan as adp_mock_spr_mirror__customer_transaction__borrow_loan,
  comment as adp_mock_spr_mirror__customer_transaction__comment,
  customer_account_id as adp_mock_spr_mirror__customer_transaction__customer_account_id,
  customer_id as adp_mock_spr_mirror__customer_transaction__customer_id,
  deal_abstract_code as adp_mock_spr_mirror__customer_transaction__deal_abstract_code,
  deal_account_type_code as adp_mock_spr_mirror__customer_transaction__deal_account_type_code,
  deal_code as adp_mock_spr_mirror__customer_transaction__deal_code,
  deal_partner_account as adp_mock_spr_mirror__customer_transaction__deal_partner_account,
  deal_partner_name as adp_mock_spr_mirror__customer_transaction__deal_partner_name,
  deal_partner_ogr_name as adp_mock_spr_mirror__customer_transaction__deal_partner_ogr_name,
  deal_partner_org_num as adp_mock_spr_mirror__customer_transaction__deal_partner_org_num,
  id as adp_mock_spr_mirror__customer_transaction__id,
  subject as adp_mock_spr_mirror__customer_transaction__subject,
  transaction_amount as adp_mock_spr_mirror__customer_transaction__transaction_amount,
  transaction_time as adp_mock_spr_mirror__customer_transaction__transaction_time,
  ums_active_ as adp_mock_spr_mirror__customer_transaction__ums_active_,
  ums_id_ as adp_mock_spr_mirror__customer_transaction__ums_id_,
  ums_op_ as adp_mock_spr_mirror__customer_transaction__ums_op_,
  ums_ts_ as adp_mock_spr_mirror__customer_transaction__ums_ts_
from
  adp_mock_spr_mirror.customer_transaction
where
  (customer_id, customer_account_id) in (
    $ { adp_mock_spr_mirror__customer_account_info__id },
    $ { adp_mock_spr_mirror__customer_account_info__account_no }
  );

pushdown_sql
  left join with tidb.spr_ods_department.adp_mock_spr_mirror =
select
  current_bank as adp_mock_spr_mirror__seller_info__current_bank,
  department_id as adp_mock_spr_mirror__seller_info__department_id,
  email as adp_mock_spr_mirror__seller_info__email,
  entry_time as adp_mock_spr_mirror__seller_info__entry_time,
  id as adp_mock_spr_mirror__seller_info__id,
  id_card as adp_mock_spr_mirror__seller_info__id_card,
  leader_id as adp_mock_spr_mirror__seller_info__leader_id,
  mobile as adp_mock_spr_mirror__seller_info__mobile,
  name as adp_mock_spr_mirror__seller_info__name,
  position as adp_mock_spr_mirror__seller_info__position,
  tenant_id as adp_mock_spr_mirror__seller_info__tenant_id,
  ums_active_ as adp_mock_spr_mirror__seller_info__ums_active_,
  ums_id_ as adp_mock_spr_mirror__seller_info__ums_id_,
  ums_op_ as adp_mock_spr_mirror__seller_info__ums_op_,
  ums_ts_ as adp_mock_spr_mirror__seller_info__ums_ts_
from
  adp_mock_spr_mirror.seller_info
where
  (id) in (
    $ { adp_mock_spr_mirror__customer_seller_relation__seller_id }
  );

spark_sql =
select
  adp_mock_spr_mirror__customer_account_info__id as id,
  adp_mock_spr_mirror__customer__real_name as name,
  IF(adp_mock_spr_mirror__customer__gender = 0, "0", "1") as sex,
  adp_mock_spr_mirror__seller_info__department_id as age,
  adp_mock_spr_mirror__customer__mobile as phone,
  adp_mock_spr_mirror__seller_info__entry_time as born,
  adp_mock_spr_mirror__customer__address as address,
  IF(
    adp_mock_spr_mirror__customer_transaction__borrow_loan = 1,
    "1",
    "0"
  ) as married,
  NOW() as create_time,
  NOW() as update_time,
  'P' as zodiac
from
  customer
where
  1 = 1;

  ``` 
  
##### 同步结果 
![Test](https://oscimg.oschina.net/oscnet/up-ad374c7f0532171add44d6e2141ace62855.png  '数据结构与算法的实际应用——根据表关系构建SQL语句') 
从Spark后台日志中可以看到，数据已经正常插入目标表。 
#### 结语 
以上是树和BFS在实际开发场景中的一个应用，代码实现其实较为简单，重点是实现的思路，当然解决问题的方法并不是唯一的，在此问题中，也可以在构建树的过程中直接构建SQL语句，省去后续的BFS过程，但是我考虑到后续可能增加的需求，还是将此处拆成了两步，方便后续在扩展，根据实际场景选择方案即可。另外，计算逻辑中缺少字段强校验，当用户输入错误字段时在运行期间才能察觉到，考虑后期再增加此功能。 
有不对的地方欢迎指正，希望本文对大家有所帮助。
                                        