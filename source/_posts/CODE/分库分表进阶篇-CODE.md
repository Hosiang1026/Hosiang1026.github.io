---
title: 分库分表进阶篇
categories: 分布式系统核心系列
tags:
  - SQL
author: 狂欢马克思
abbrlink: 96e75e76
date: 2019-09-13 00:00:00
top: 4
---



本文作为分库分表的进阶指南，深入讲解高级特性、性能优化、最佳实践等进阶内容。在掌握基础知识的基础上，进一步提升您的分库分表技能水平，解决实际开发中的复杂问题。

<!-- more -->

### 一、高级特性

#### 1.1 分片算法详解

```
标准分片算法：
```

```yaml
# 范围分片
sharding-algorithms:
  range-algorithm:
    type: CLASS_BASED
    props:
      strategy: STANDARD
      algorithmClassName: com.example.RangeShardingAlgorithm

# 自定义分片算法
public class RangeShardingAlgorithm implements StandardShardingAlgorithm<Long> {
    @Override
    public String doSharding(Collection<String> availableTargetNames, PreciseShardingValue<Long> shardingValue) {
        Long value = shardingValue.getValue();
        if (value < 1000000) {
            return "ds0";
        } else if (value < 2000000) {
            return "ds1";
        } else {
            return "ds2";
        }
    }
}
```

```
复合分片键：
```

```yaml
# 多字段分片
table-strategy:
  complex:
    sharding-columns: user_id,order_date
    sharding-algorithm-name: complex-algorithm

sharding-algorithms:
  complex-algorithm:
    type: CLASS_BASED
    props:
      algorithmClassName: com.example.ComplexShardingAlgorithm
```

#### 1.2 绑定表

```
绑定表概念：
```

绑定表是指分片规则一致的主表和子表，可以避免跨库关联查询。

```yaml
# 配置绑定表
spring:
  shardingsphere:
    rules:
      sharding:
        binding-tables:
          - order,order_item  # 订单表和订单项表绑定
        tables:
          order:
            actual-data-nodes: ds$->{0..1}.order_$->{0..3}
            table-strategy:
              standard:
                sharding-column: order_id
                sharding-algorithm-name: order-inline
          order_item:
            actual-data-nodes: ds$->{0..1}.order_item_$->{0..3}
            table-strategy:
              standard:
                sharding-column: order_id
                sharding-algorithm-name: order-inline
```

#### 1.3 广播表

```
广播表配置：
```

广播表是指所有分片数据源中都存在的表，数据完全一致。

```yaml
# 配置广播表
spring:
  shardingsphere:
    rules:
      sharding:
        broadcast-tables:
          - config  # 配置表在所有库中都存在
          - dictionary  # 字典表
```

### 二、性能优化

#### 2.1 查询优化

```
避免全表扫描：
```

```java
// 错误：没有分片键，会查询所有分片
@Select("SELECT * FROM user WHERE name = #{name}")
List<User> selectByName(String name);

// 正确：使用分片键
@Select("SELECT * FROM user WHERE id = #{id} AND name = #{name}")
User selectByIdAndName(Long id, String name);
```

```
分页查询优化：
```

```java
// 内存分页（不推荐，数据量大时性能差）
// ShardingSphere会从每个分片查询，然后在内存中合并

// 推荐：使用分片键限制查询范围
@Select("SELECT * FROM user WHERE id BETWEEN #{start} AND #{end} LIMIT #{limit}")
List<User> selectByRange(Long start, Long end, Integer limit);
```

#### 2.2 分布式ID生成

```
雪花算法（Snowflake）：
```

```java
@Component
public class SnowflakeIdGenerator {
    private final Snowflake snowflake = new Snowflake(1, 1);
    
    public Long generateId() {
        return snowflake.nextId();
    }
}
```

```
数据库自增ID（不推荐）：
```

- 每个分片独立自增
- 可能导致ID冲突
- 需要额外的ID生成服务

```
UUID（不推荐）：
```

- 字符串类型，占用空间大
- 无序，影响索引性能

### 三、架构设计

#### 3.1 分片策略选择

```
按业务选择：
```

1. 用户维度分片：
   - 分片键：user_id
   - 适用：用户相关数据（订单、购物车等）

2. 时间维度分片：
   - 分片键：create_time
   - 适用：日志、历史数据

3. 地理维度分片：
   - 分片键：region_id
   - 适用：地域性强的业务

#### 3.2 数据迁移方案

```
双写方案：
```

```java
@Service
public class UserService {
    
    @Autowired
    private UserMapper oldMapper;  // 旧库
    
    @Autowired
    private UserMapper newMapper;  // 新库（分片）
    
    public void createUser(User user) {
        // 同时写入旧库和新库
        oldMapper.insert(user);
        newMapper.insert(user);
    }
}
```

```
数据校验：
```

```java
// 对比新旧库数据
public void validateData(Long userId) {
    User oldUser = oldMapper.selectById(userId);
    User newUser = newMapper.selectById(userId);
    // 对比数据一致性
}
```

### 四、实战技巧

#### 4.1 调试技巧

```
查看SQL路由：
```

```yaml
# 开启SQL日志
spring:
  shardingsphere:
    props:
      sql-show: true  # 显示实际执行的SQL
```

```
监控分片执行：
```

```java
// 使用ShardingSphere的监控功能
// 查看每个分片的执行情况
// 分析慢查询
```

#### 4.2 问题排查

```
常见问题：
```

1. 数据分布不均
   ```yaml
   # 检查分片算法
   # 调整分片策略
   # 使用一致性哈希
   ```

2. 跨分片查询性能差
   ```java
   // 优化查询，添加分片键
   // 使用绑定表
   // 考虑数据冗余
   ```

3. 分布式事务问题
   ```java
   // 使用Seata等分布式事务框架
   // 或采用最终一致性方案
   ```

### 五、总结

通过本文的学习，您已经掌握了分库分表的进阶知识。在下一篇文章中，我们将通过实际项目案例，展示分库分表的实战应用。