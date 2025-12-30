---
title: 分库分表入门篇
categories: 分布式系统核心系列
tags:
  - SQL
author: 狂欢马克思
abbrlink: b96f9fe6
date: 2019-01-15 00:00:00
top: 1
---

分库分表是解决大数据量场景下数据库性能瓶颈的核心技术方案。当单表数据量达到千万级甚至亿级时，传统的单库单表架构已经无法满足性能需求

<!-- more -->

### 一、分库分表基础概念

#### 1.1 什么是分库分表

```
分库分表定义：
```

分库分表是数据库水平扩展的一种解决方案，当单表数据量过大或单库连接数过多时，通过将数据分散到多个数据库或数据表中，以提升系统的性能和可扩展性。

```
核心思想：
```
- 分而治之：将大表拆分成小表，将大库拆分成小库
- 水平扩展：通过增加数据库节点来提升性能
- 负载均衡：将数据均匀分布到多个节点

#### 1.2 为什么需要分库分表

```
单表数据量过大：
```
- MySQL单表建议不超过500万-1000万行
- 数据量过大导致索引效率下降
- B+树索引深度增加，查询变慢
- 全表扫描成本急剧增加

```
单库连接数限制：
```
- MySQL默认最大连接数有限（通常151-200）
- 高并发场景下连接数成为瓶颈
- 连接数过多导致数据库性能下降

```
查询性能下降：
```
- 数据量增大导致查询变慢
- 索引维护成本增加
- 统计查询性能急剧下降

```
存储空间限制：
```
- 单库存储空间有限
- 备份和恢复时间过长
- 数据迁移困难

```
业务场景示例：
```
- 电商订单表：日订单量百万级，年订单量数亿
- 用户表：用户数千万甚至上亿
- 日志表：日志数据快速增长
- 消息表：聊天记录、站内信等

#### 1.3 分库 vs 分表

```
分库（Database Sharding）：
```

将数据分散到多个数据库中，每个数据库独立运行。

```
优点：
```
- 减少单库连接数，提升并发能力
- 每个库可以独立部署，提升可用性
- 可以按业务模块分库，实现业务隔离

```
缺点：
```
- 跨库查询复杂，需要应用层合并
- 跨库事务处理困难（需要分布式事务）
- 数据迁移和扩容复杂

```
分表（Table Sharding）：
```

将数据分散到同一个数据库的多个数据表中。

```
优点：
```
- 减少单表数据量，提升查询性能
- 实现相对简单，不需要分布式事务
- 可以按时间、ID等维度分表

```
缺点：
```
- 跨表查询需要合并结果
- 单库连接数限制仍然存在
- 表数量过多时管理复杂

```
分库分表（Database and Table Sharding）：
```

同时进行分库和分表，将数据分散到多个数据库的多个表中。

```
适用场景：
```
- 数据量特别大（亿级以上）
- 高并发场景
- 需要水平扩展

#### 1.4 核心概念

```
水平分片（Horizontal Sharding）：
```
- 按行切分数据
- 每张表结构相同，数据不同
- 最常用的分片方式

```
垂直分片（Vertical Sharding）：
```
- 按列切分数据
- 将不同字段分散到不同表
- 较少使用，主要用于字段特别多的场景

```
分片键（Sharding Key）：
```
- 用于路由数据的字段
- 选择原则：高基数、查询频繁、分布均匀
- 常见选择：用户ID、订单ID、时间等

```
分片算法（Sharding Algorithm）：
```
- 决定数据路由到哪个库/表的算法
- 常见算法：取模、范围、一致性哈希

```
数据节点（Data Node）：
```
- 实际存储数据的数据库或表
- 例如：db0.user_0, db0.user_1, db1.user_0

### 二、分片策略

#### 2.1 范围分片（Range Sharding）

```
原理：
```
按分片键的范围将数据分配到不同的分片。

```
示例：
```
```
用户ID范围分片：
- 0-1000万 → db0.user
- 1000万-2000万 → db1.user
- 2000万-3000万 → db2.user
```

```
优点：
```
- 实现简单，易于理解
- 支持范围查询
- 扩容时只需添加新分片

```
缺点：
```
- 可能出现数据倾斜（热点问题）
- 需要维护范围映射
- 扩容时需要迁移数据

```
适用场景：
```
- 数据有明显的时间特征（按时间分片）
- 数据有明显的大小特征（按ID范围分片）
- 需要支持范围查询

#### 2.2 哈希分片（Hash Sharding）

```
原理：
```
对分片键进行哈希运算，根据哈希值取模决定数据所在分片。

```
示例：
```
```java
// 分片算法
int shardIndex = hash(user_id) % 4;
// 结果：0, 1, 2, 3 分别对应 db0, db1, db2, db3
```

```
优点：
```
- 数据分布均匀，避免热点
- 实现简单，性能好
- 支持快速定位数据

```
缺点：
```
- 扩容困难，需要大量数据迁移
- 不支持范围查询
- 取模运算对分片数量有限制

```
适用场景：
```
- 数据分布需要均匀
- 主要按分片键精确查询
- 分片数量相对固定

#### 2.3 一致性哈希（Consistent Hashing）

```
原理：
```
使用一致性哈希算法，将数据和节点映射到哈希环上。

```
优点：
```
- 扩容时只需迁移少量数据
- 节点增减对整体影响小
- 数据分布相对均匀

```
缺点：
```
- 实现复杂
- 可能出现数据倾斜
- 需要虚拟节点优化

```
适用场景：
```
- 需要频繁扩容的场景
- 节点可能动态变化的场景

#### 2.4 目录分片（Directory Sharding）

```
原理：
```
维护一个查找表（目录），记录数据所在位置。

```
示例：
```
```sql
-- 分片目录表
CREATE TABLE shard_directory (
    shard_key VARCHAR(100),
    database_name VARCHAR(50),
    table_name VARCHAR(50),
    PRIMARY KEY (shard_key)
);
```

```
优点：
```
- 灵活，可以自定义路由规则
- 支持复杂的分片策略
- 易于调整分片规则

```
缺点：
```
- 需要额外的查找表
- 查询需要先查目录，性能有影响
- 目录表可能成为瓶颈

```
适用场景：
```
- 分片规则复杂
- 需要动态调整分片
- 分片键不是简单的ID

### 三、分片键选择

#### 3.1 分片键选择原则

```
高基数（High Cardinality）：
```
- 分片键的值应该尽可能唯一
- 避免选择值重复度高的字段
- 例如：用户ID、订单ID

```
查询频繁：
```
- 选择经常作为查询条件的字段
- 避免选择很少用于查询的字段
- 例如：用户ID、商户ID

```
分布均匀：
```
- 分片键的值应该分布均匀
- 避免选择有明显倾斜的字段
- 例如：避免选择性别、状态等枚举值

```
业务相关：
```
- 选择与业务逻辑相关的字段
- 考虑业务查询模式
- 例如：按用户分片，用户相关查询都在同一分片

#### 3.2 常见分片键

```
用户ID：
```
- 优点：高基数、查询频繁、分布均匀
- 适用：用户表、订单表、消息表

```
订单ID：
```
- 优点：唯一性好、查询频繁
- 适用：订单表、支付表

```
时间字段：
```
- 优点：有明显的时间特征
- 适用：日志表、流水表
- 注意：可能出现时间热点

```
商户ID：
```
- 优点：业务相关、查询频繁
- 适用：商户相关表
- 注意：可能出现商户数据倾斜

#### 3.3 分片键设计注意事项

```
避免选择会频繁更新的字段：
```
- 更新分片键可能导致数据迁移
- 例如：避免选择状态字段作为分片键

```
避免选择枚举值：
```
- 枚举值会导致数据倾斜
- 例如：避免选择性别、类型等字段

```
考虑复合分片键：
```
- 当单个字段无法满足需求时
- 例如：用户ID + 时间

### 四、环境准备

#### 4.1 数据库要求

```
MySQL版本：
```
- MySQL 5.7+（推荐）
- MySQL 8.0+（最新特性）

```
数据库实例：
```
- 分库场景需要多个数据库实例
- 可以是同一服务器的不同数据库
- 也可以是不同服务器的数据库

```
存储空间：
```
- 确保有足够的存储空间
- 考虑数据增长和备份空间

#### 4.2 中间件选择

```
ShardingSphere（推荐）：
```
- Apache开源项目
- 功能强大，支持多种分片策略
- 文档完善，社区活跃
- 支持JDBC和Proxy两种模式

```
MyCat：
```
- 阿里开源
- 成熟稳定
- 基于代理模式
- 配置相对复杂

```
TDDL：
```
- 淘宝开源
- 已停止维护
- 不推荐新项目使用

```
自研方案：
```
- 根据业务需求定制
- 开发成本高
- 需要充分测试

#### 4.3 工具安装

```
安装ShardingSphere-JDBC：
```

```xml
<!-- pom.xml -->
<dependency>
    <groupId>org.apache.shardingsphere</groupId>
    <artifactId>shardingsphere-jdbc-core-spring-boot-starter</artifactId>
    <version>5.3.0</version>
</dependency>
```

```
安装MyCat：
```

1. 下载MyCat：http://www.mycat.org.cn/
2. 解压到指定目录
3. 配置server.xml和schema.xml
4. 启动MyCat服务

### 五、环境准备

#### 5.1 系统要求

```
数据库要求：
```
- MySQL 5.7+ 或 MySQL 8.0+
- 多个数据库实例（分库场景）
- 足够的存储空间

```
中间件选择：
```
- ShardingSphere：Apache开源，功能强大
- MyCat：阿里开源，成熟稳定
- TDDL：淘宝开源（已停止维护）

#### 5.2 工具安装

```
安装ShardingSphere：
```

```xml
<!-- pom.xml -->
<dependency>
    <groupId>org.apache.shardingsphere</groupId>
    <artifactId>shardingsphere-jdbc-core-spring-boot-starter</artifactId>
    <version>5.3.0</version>
</dependency>
```

### 六、快速开始

#### 6.1 简单分表示例

```
配置分表规则：
```

```yaml
# application.yml
spring:
  shardingsphere:
    datasource:
      names: ds0
      ds0:
        type: com.zaxxer.hikari.HikariDataSource
        driver-class-name: com.mysql.cj.jdbc.Driver
        jdbc-url: jdbc:mysql://localhost:3306/testdb
        username: root
        password: password
    
    rules:
      sharding:
        tables:
          user:
            actual-data-nodes: ds0.user_$->{0..3}
            table-strategy:
              standard:
                sharding-column: id
                sharding-algorithm-name: user-inline
        sharding-algorithms:
          user-inline:
            type: INLINE
            props:
              algorithm-expression: user_$->{id % 4}
```

```
使用示例：
```

```java
@Mapper
public interface UserMapper {
    @Insert("INSERT INTO user (id, name, email) VALUES (#{id}, #{name}, #{email})")
    void insert(User user);
    
    @Select("SELECT * FROM user WHERE id = #{id}")
    User selectById(Long id);
}

// 自动路由到对应的表
// id=1 → user_1
// id=2 → user_2
// id=3 → user_3
// id=4 → user_0
```

#### 6.2 分库分表示例

```
配置分库分表：
```

```yaml
spring:
  shardingsphere:
    datasource:
      names: ds0,ds1
      ds0:
        type: com.zaxxer.hikari.HikariDataSource
        jdbc-url: jdbc:mysql://localhost:3306/db0
        username: root
        password: password
      ds1:
        type: com.zaxxer.hikari.HikariDataSource
        jdbc-url: jdbc:mysql://localhost:3306/db1
        username: root
        password: password
    
    rules:
      sharding:
        tables:
          order:
            actual-data-nodes: ds$->{0..1}.order_$->{0..3}
            database-strategy:
              standard:
                sharding-column: user_id
                sharding-algorithm-name: db-inline
            table-strategy:
              standard:
                sharding-column: order_id
                sharding-algorithm-name: table-inline
        sharding-algorithms:
          db-inline:
            type: INLINE
            props:
              algorithm-expression: ds$->{user_id % 2}
          table-inline:
            type: INLINE
            props:
              algorithm-expression: order_$->{order_id % 4}
```

### 七、快速开始示例

#### 7.1 简单分表示例

```
场景： 用户表按用户ID分4张表
```

```
创建表结构：
```

```sql
-- 创建4张分表
CREATE TABLE user_0 (
    id BIGINT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    create_time DATETIME
);

CREATE TABLE user_1 LIKE user_0;
CREATE TABLE user_2 LIKE user_0;
CREATE TABLE user_3 LIKE user_0;
```

```
配置ShardingSphere：
```

```yaml
# application.yml
spring:
  shardingsphere:
    datasource:
      names: ds0
      ds0:
        type: com.zaxxer.hikari.HikariDataSource
        driver-class-name: com.mysql.cj.jdbc.Driver
        jdbc-url: jdbc:mysql://localhost:3306/testdb?serverTimezone=UTC
        username: root
        password: password
    
    rules:
      sharding:
        tables:
          user:
            actual-data-nodes: ds0.user_$->{0..3}
            table-strategy:
              standard:
                sharding-column: id
                sharding-algorithm-name: user-inline
        sharding-algorithms:
          user-inline:
            type: INLINE
            props:
              algorithm-expression: user_$->{id % 4}
```

```
使用示例：
```

```java
@Mapper
public interface UserMapper {
    @Insert("INSERT INTO user (id, name, email, create_time) VALUES (#{id}, #{name}, #{email}, #{createTime})")
    void insert(User user);
    
    @Select("SELECT * FROM user WHERE id = #{id}")
    User selectById(Long id);
}

// 自动路由到对应的表
// id=1 → user_1
// id=2 → user_2
// id=3 → user_3
// id=4 → user_0
```

#### 7.2 分库分表示例

```
场景： 订单表按用户ID分2个库，每个库4张表
```

```
创建数据库和表：
```

```sql
-- 数据库db0
CREATE DATABASE db0;
USE db0;
CREATE TABLE order_0 LIKE order_template;
CREATE TABLE order_1 LIKE order_template;
CREATE TABLE order_2 LIKE order_template;
CREATE TABLE order_3 LIKE order_template;

-- 数据库db1
CREATE DATABASE db1;
USE db1;
CREATE TABLE order_0 LIKE order_template;
CREATE TABLE order_1 LIKE order_template;
CREATE TABLE order_2 LIKE order_template;
CREATE TABLE order_3 LIKE order_template;
```

```
配置ShardingSphere：
```

```yaml
spring:
  shardingsphere:
    datasource:
      names: ds0,ds1
      ds0:
        type: com.zaxxer.hikari.HikariDataSource
        driver-class-name: com.mysql.cj.jdbc.Driver
        jdbc-url: jdbc:mysql://localhost:3306/db0?serverTimezone=UTC
        username: root
        password: password
      ds1:
        type: com.zaxxer.hikari.HikariDataSource
        driver-class-name: com.mysql.cj.jdbc.Driver
        jdbc-url: jdbc:mysql://localhost:3306/db1?serverTimezone=UTC
        username: root
        password: password
    
    rules:
      sharding:
        tables:
          order:
            actual-data-nodes: ds$->{0..1}.order_$->{0..3}
            database-strategy:
              standard:
                sharding-column: user_id
                sharding-algorithm-name: db-inline
            table-strategy:
              standard:
                sharding-column: order_id
                sharding-algorithm-name: table-inline
        sharding-algorithms:
          db-inline:
            type: INLINE
            props:
              algorithm-expression: ds$->{user_id % 2}
          table-inline:
            type: INLINE
            props:
              algorithm-expression: order_$->{order_id % 4}
```

### 八、分库分表带来的问题

#### 8.1 跨库/跨表查询

```
问题：
```
- 无法直接进行跨分片的JOIN查询
- 聚合查询需要合并多个分片的结果
- 排序分页变得复杂

```
解决方案：
```
- 避免跨分片查询：设计时尽量让相关数据在同一分片
- 使用广播表：存储公共数据，每个分片都有完整副本
- 使用绑定表：关联表使用相同的分片规则
- 应用层合并：在应用层查询多个分片并合并结果

#### 8.2 分布式事务

```
问题：
```
- 跨库操作无法使用本地事务
- 需要分布式事务保证一致性

```
解决方案：
```
- 避免跨库事务：设计时避免跨库操作
- 使用分布式事务：XA事务、Seata等
- 最终一致性：使用消息队列、补偿机制

#### 8.3 主键生成

```
问题：
```
- 数据库自增ID无法保证全局唯一
- 需要分布式ID生成方案

```
解决方案：
```
- UUID：简单但性能较差
- Snowflake算法：Twitter的分布式ID算法
- 数据库序列：使用独立的ID生成服务
- Redis自增：使用Redis生成ID

#### 8.4 数据迁移和扩容

```
问题：
```
- 分片数量变化需要迁移数据
- 数据迁移期间需要保证服务可用

```
解决方案：
```
- 双写方案：新老分片同时写入
- 数据同步：使用binlog同步数据
- 灰度迁移：逐步迁移数据
- 使用一致性哈希：减少迁移数据量

### 九、最佳实践

#### 9.1 设计原则

```
1. 先分表后分库：
```
- 优先考虑分表，分表无法满足再考虑分库
- 分表实现简单，分库复杂度高

```
2. 分片数量选择：
```
- 考虑未来3-5年的数据增长
- 分片数量建议为2的幂次（便于扩容）
- 单表数据量控制在500万以内

```
3. 分片键选择：
```
- 选择高基数、查询频繁的字段
- 避免选择会频繁更新的字段
- 考虑业务查询模式

```
4. 避免跨分片操作：
```
- 设计时让相关数据在同一分片
- 使用绑定表保证关联查询在同一分片
- 使用广播表存储公共数据

#### 9.2 注意事项

```
1. 不要过度设计：
```
- 数据量不大时不要过早分库分表
- 单表500万以下通常不需要分表

```
2. 考虑运维成本：
```
- 分库分表增加运维复杂度
- 需要监控多个数据库
- 备份和恢复更复杂

```
3. 测试充分：
```
- 充分测试分片算法
- 测试跨分片查询性能
- 测试数据迁移方案

### 十、常见问题解决

#### 10.1 配置问题

```
问题1：分片键选择不当
```

```
解决方案：
```
- 选择高基数字段（唯一性高）
- 选择查询频繁的字段
- 避免选择会频繁更新的字段
- 分析业务查询模式

```
问题2：分片算法配置错误
```

```
解决方案：
```
```yaml
# 检查算法表达式
# 确保分片键存在
# 验证分片结果在有效范围内
# 测试分片算法是否正确
```

```
问题3：数据分布不均匀
```

```
解决方案：
```
- 检查分片算法
- 使用一致性哈希
- 调整分片策略

#### 10.2 查询问题

```
问题1：跨库/跨表查询性能差
```

```
解决方案：
```
- 避免跨分片查询
- 使用广播表存储公共数据
- 使用绑定表关联查询
- 应用层合并结果

```
问题2：排序分页复杂
```

```
解决方案：
```
- 限制分页深度（只允许前N页）
- 使用分片键查询
- 应用层合并排序

#### 10.3 事务问题

```
问题1：跨库事务失败
```

```
解决方案：
```
- 使用分布式事务（XA、Seata）
- 或避免跨库事务
- 使用最终一致性方案
- 使用消息队列保证一致性

```
问题2：事务性能差
```

```
解决方案：
```
- 减少事务范围
- 避免长事务
- 使用异步处理

### 十一、下一步学习

通过本文的学习，您已经掌握了分库分表的基础概念和基本使用。接下来您可以：

1. 学习分库分表中间件：ShardingSphere、MyCat的详细使用
2. 学习分片策略：深入理解各种分片算法
3. 学习分布式事务：XA事务、Seata等
4. 学习数据迁移：如何安全地迁移和扩容

在下一篇文章（进阶篇）中，我们将深入学习分库分表中间件的详细配置、性能优化、最佳实践等内容。