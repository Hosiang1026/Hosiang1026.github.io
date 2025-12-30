---
title: MySQLElasticSearch结合MySQL的两种
categories: 架构设计思想系列
tags:
  - SQL
  - MySQL
  - ElasticSearch
  - Architecture
abbrlink: 5b1f4da1
date: 2021-08-08 00:00:00
top: 2006
---


MySQL和ElasticSearch是两种不同类型的数据库系统，各有优势。在实际应用中，经常需要将两者结合使用，发挥各自优势。本文详细介绍MySQL与ElasticSearch结合的两种主要架构模式：数据库同步的管道架构和数据事件分发架构，帮助开发者根据业务场景选择最合适的方案。

<!-- more -->

## 一、架构模式概述

### 1.1 为什么需要结合使用

```
**MySQL的优势**：
```
- 事务支持完善
- 数据一致性保证
- 适合在线业务处理
- 成熟的生态系统

```
**ElasticSearch的优势**：
```
- 全文搜索能力强
- 实时搜索性能优秀
- 支持复杂查询
- 水平扩展能力强

```
**结合使用的场景**：
```
- MySQL存储业务数据
- ElasticSearch提供搜索服务
- 两者数据需要同步
- 发挥各自优势

### 1.2 两种架构模式

```
**模式一：数据库同步的管道架构**
```
- MySQL作为主数据源
- 通过管道同步到ElasticSearch
- 适合数据查询场景

```
**模式二：数据事件分发架构**
```
- 事件驱动架构
- 通过消息中间件分发
- 适合大数据量场景

## 二、数据库同步的管道架构

### 2.1 架构设计

```
**核心思想**：
```
- MySQL作为数据库的核心能力范围就是在线业务的事务处理和查询访问
- 无论单体应用还是微服务，都会以多连接请求的形式，将业务数据写入MySQL
- ElasticSearch在整个过程中，扮演着从MySQL复制数据、建立索引、提供搜索的角色

```
**架构图**：
```
```
业务应用 → MySQL（主数据源）
              ↓
        数据同步管道
              ↓
      ElasticSearch（搜索服务）
```

### 2.2 简单粗暴的客户端模式

```
**工作原理**：
```
- 使用SQL定时轮询数据表
- 抓取增量数据
- 写入ElasticSearch

```
**技术实现**：
```
- Logstash JDBC Input插件
- Elasticsearch JDBC（已废弃）
- 自定义定时任务

```
**Logstash配置示例**：
```
```ruby
input {
  jdbc {
    jdbc_connection_string => "jdbc:mysql://localhost:3306/mydb"
    jdbc_user => "root"
    jdbc_password => "password"
    jdbc_driver_library => "/path/to/mysql-connector-java.jar"
    jdbc_driver_class => "com.mysql.jdbc.Driver"
    schedule => "* * * * *"
    statement => "SELECT * FROM products WHERE updated_at > :sql_last_value"
    use_column_value => true
    tracking_column => "updated_at"
  }
}

output {
  elasticsearch {
    hosts => ["localhost:9200"]
    index => "products"
    document_id => "%{id}"
  }
}
```

```
**优点**：
```
- 实现简单
- 易于理解和维护
- 适合小规模数据

```
**缺点**：
```
- 实时性差（最小1分钟间隔）
- 难以处理删除操作
- 不适合高频率更新场景
- 资源消耗较大

### 2.3 伪装成从属的副本模式

```
**工作原理**：
```
- 充分利用MySQL的主从模式
- 将自己伪装成slave节点
- 通过CDC（数据变更捕获）获取binlog推送的变更数据
- 封装成消息推送到Kafka
- ElasticSearch从Kafka订阅数据

```
**代表技术：Canal**
```

```
**架构图**：
```
```
MySQL Master → Binlog
                  ↓
              Canal（伪装成Slave）
                  ↓
              Kafka（消息队列）
                  ↓
         Logstash/自定义消费者
                  ↓
          ElasticSearch
```

```
**Canal配置示例**：
```
```properties
# canal.properties
canal.instance.master.address=127.0.0.1:3306
canal.instance.dbUsername=root
canal.instance.dbPassword=password
canal.instance.connectionCharset=UTF-8
canal.instance.filter.regex=.*\\..*
canal.mq.servers=127.0.0.1:9092
canal.mq.topic=canal_topic
```

```
**优点**：
```
- 实时性强（接近实时）
- 支持增删改操作
- 数据完整性好
- 适合大规模数据

```
**缺点**：
```
- 架构复杂
- 需要MySQL开启binlog（Row模式）
- 需要Kafka集群
- 需要Zookeeper集群
- 运维成本高

### 2.4 推荐架构：MySQL + Canal + Kafka + ElasticSearch

```
**完整架构**：
```
```
MySQL（主库）
    ↓ Binlog（Row模式）
Canal（CDC工具）
    ↓ 变更事件
Kafka（消息队列）
    ↓ 消息分发
Logstash/自定义消费者
    ↓ 数据处理
ElasticSearch（索引）
```

```
**为什么需要Kafka**：
```
- 将MySQL-ES的同步过程从强依赖改为松耦合的异步过程
- 参与协作的异构系统环节太多，尽量用异步
- 任何一个环节出问题不会堵死整个流程
- 支持多个消费者订阅
- 数据可以长期保存

```
**Kafka分区策略**：
```
- 使用业务主键Hash存放
- 相同主键的操作都在一个分区上
- 保证顺序性
- 使用Kafka的业务主键折叠策略，保留最新消息

## 三、数据事件分发架构

### 3.1 架构设计

```
**核心思想**：
```
- 不存在ElasticSearch为主，MySQL为辅的数据同步方式
- ElasticSearch不是事务型实时操作的数据库
- 设计面向大吞吐量的写入，构建全文索引
- 以集群节点的分片搜索，结果聚合

```
**适用场景**：
```
- 事件流驱动的数据处理
- 日志采集
- 设备数据采集
- 操作事件记录

### 3.2 架构流程

```
**数据流向**：
```
```
微服务/应用
    ↓ 业务操作事件
Kafka（消息中间件）
    ↓ 数据分发
    ├─→ Streams Process（流处理）→ MySQL（BI统计）
    └─→ Logstash（管道处理）→ ElasticSearch（明细搜索）
```

```
**架构图**：
```
```
业务服务 → 事件消息 → Kafka
                            ↓
                    ┌───────┴───────┐
                    ↓               ↓
            Streams Process    Logstash
                    ↓               ↓
                MySQL          ElasticSearch
            （BI统计库）      （明细搜索）
```

### 3.3 流处理系统

```
**可选技术**：
```
- Spark Streaming
- Flink
- Storm
- Kafka Streams
- 自定义线程阻塞队列

```
**处理流程**：
```
1. 从Kafka消费日志消息
2. 实时聚合计算
3. 将聚合结果推送给MySQL（BI统计）
4. 同时分发给Logstash管道

```
**Logstash处理**：
```
1. 对日志进行元数据打标签
2. 过滤操作
3. 写入ES索引

```
**BI查询流程**：
```
- 统计查询：通过MySQL查询聚合结果
- 明细搜索：通过ES查询海量日志的分片并行查询与结果聚合

### 3.4 优势分析

```
**解耦设计**：
```
- 微服务实时完成日志任务
- 不阻塞业务处理
- 异步处理提高性能

```
**扩展性强**：
```
- 可以继续加入HDFS、HBase、MongoDB等
- 根据需求灵活扩展
- 支持多种数据存储

```
**性能优秀**：
```
- 流处理实时计算
- ES分片并行查询
- 支持大数据量

## 四、两种架构对比

### 4.1 适用场景对比

```
**数据库同步管道架构**：
```
- ✅ MySQL为主数据源
- ✅ 需要从MySQL同步到ES
- ✅ 数据一致性要求高
- ✅ 实时性要求中等

```
**数据事件分发架构**：
```
- ✅ 事件流驱动
- ✅ 大数据量写入
- ✅ 需要实时计算
- ✅ 多数据源存储

### 4.2 技术复杂度对比

```
**数据库同步管道架构**：
```
- 简单模式：低复杂度
- Canal模式：高复杂度
- 需要MySQL binlog
- 需要Kafka集群

```
**数据事件分发架构**：
```
- 需要流处理系统
- 需要消息队列
- 需要多个数据存储
- 架构相对复杂

### 4.3 性能对比

```
**数据库同步管道架构**：
```
- 实时性：Canal模式接近实时
- 吞吐量：受MySQL性能限制
- 延迟：秒级到分钟级

```
**数据事件分发架构**：
```
- 实时性：接近实时
- 吞吐量：支持高吞吐
- 延迟：毫秒级

## 五、最佳实践

### 5.1 选择建议

```
**选择数据库同步管道架构，如果**：
```
- MySQL是唯一数据源
- 需要保持数据一致性
- 数据更新频率不高
- 团队技术栈相对简单

```
**选择数据事件分发架构，如果**：
```
- 事件驱动架构
- 需要实时计算
- 大数据量场景
- 多数据源需求

### 5.2 实施建议

```
**数据库同步管道架构**：
```
1. 小规模：使用Logstash JDBC
2. 大规模：使用Canal + Kafka
3. 确保MySQL开启binlog
4. 合理设置Kafka分区

```
**数据事件分发架构**：
```
1. 选择合适的流处理框架
2. 设计合理的消息格式
3. 考虑数据一致性
4. 监控各个环节

### 5.3 注意事项

```
**数据一致性**：
```
- 考虑最终一致性
- 处理数据冲突
- 监控数据同步状态

```
**性能优化**：
```
- 合理设置Kafka分区数
- 优化ES索引配置
- 调整同步频率

```
**容错处理**：
```
- 处理消息丢失
- 处理重复消息
- 实现重试机制

## 六、总结

MySQL和ElasticSearch结合使用是常见架构模式，两种架构各有优势：

```
**数据库同步管道架构**：
```
- 适合MySQL为主数据源的场景
- Canal模式提供实时同步
- 架构相对复杂但功能强大

```
**数据事件分发架构**：
```
- 适合事件驱动和大数据场景
- 支持实时计算和多数据源
- 扩展性强性能优秀

```
**选择原则**：
```
- 根据业务场景选择
- 考虑团队技术能力
- 平衡复杂度和性能
- 预留扩展空间

通过合理选择和实施，可以充分发挥MySQL和ElasticSearch各自的优势，构建高性能、可扩展的数据架构。
