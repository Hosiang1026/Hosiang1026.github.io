---
title: SpringBoot实战篇
categories: Spring生态体系系列
tags:
  - Java
author: 狂欢马克思
abbrlink: 8b5581ac
date: 2022-02-10 00:00:00
top: 15
---



本文作为SpringBoot的实战指南，通过完整的项目案例，展示SpringBoot在实际开发中的应用。从项目规划、架构设计到具体实现，手把手教您完成一个完整的SpringBoot项目，将理论知识转化为实际技能。

<!-- more -->

### 一、项目概述

#### 1.1 项目需求

```
**项目背景：** 开发一个基于Spring Boot的电商系统，包含商品管理、订单管理、用户管理、支付集成等功能。
```

```
**核心需求：**
```
- 用户注册、登录、JWT认证
- 商品浏览、搜索、分类
- 购物车管理
- 订单创建、支付、查询
- 管理员后台
- 数据统计和报表

#### 1.2 技术选型

```
**技术栈：**
```
- **框架**: Spring Boot 2.7.0
- **数据库**: MySQL 8.0 + MyBatis Plus
- **缓存**: Redis
- **消息队列**: RabbitMQ
- **搜索引擎**: Elasticsearch
- **认证**: Spring Security + JWT
```
- **API文档**: Swagger (Knife4j)
```

```
**开发工具：**
```
- **IDE**: IntelliJ IDEA
- **构建工具**: Maven
- **版本控制**: Git

### 二、项目架构

#### 2.1 整体架构

```
┌─────────────────────────────────────┐
│      Gateway Layer (网关层)         │
│  - 路由转发                          │
│  - 认证授权                          │
├─────────────────────────────────────┤
│      Controller Layer (控制器层)    │
│  - 用户服务                          │
│  - 商品服务                          │
│  - 订单服务                          │
├─────────────────────────────────────┤
│      Service Layer (业务逻辑层)     │
├─────────────────────────────────────┤
│      Repository Layer (数据访问层)  │
├─────────────────────────────────────┤
│      Cache Layer (缓存层)           │
├─────────────────────────────────────┤
│      Database (MySQL)                │
└─────────────────────────────────────┘
```

#### 2.2 项目结构

```
ecommerce-system/
├── ecommerce-common/          # 公共模块
│   ├── entity/                # 实体类
│   ├── dto/                   # 数据传输对象
│   ├── utils/                 # 工具类
│   └── constant/              # 常量
├── ecommerce-user/            # 用户服务
│   ├── controller/
│   ├── service/
│   └── mapper/
├── ecommerce-product/         # 商品服务
├── ecommerce-order/           # 订单服务
├── ecommerce-gateway/         # 网关服务
└── pom.xml
```

### 三、核心实现

#### 3.1 项目初始化

```
**1. 使用Spring Initializr创建项目：**
```

访问 https://start.spring.io/ 或使用IDE创建：
- 选择Spring Boot版本：2.7.0
- 添加依赖：Web、MyBatis、MySQL、Redis、Security

```
**2. 配置application.yml：**
```

```yaml
spring:
  application:
    name: ecommerce-system
  
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/ecommerce?useUnicode=true&characterEncoding=utf8
    username: root
    password: password
  
  redis:
    host: localhost
    port: 6379
    password: 
    timeout: 5000
    database: 0
  
  rabbitmq:
    host: localhost
    port: 5672
    username: guest
    password: guest

mybatis-plus:
  mapper-locations: classpath:mapper/*.xml
  type-aliases-package: com.example.ecommerce.entity
  configuration:
    map-underscore-to-camel-case: true

jwt:
  secret: your-secret-key
  expiration: 86400000
```

#### 3.2 核心功能实现

```
**用户认证服务：**
```

```java
@Service
public class AuthService {
    
    @Autowired
    private UserMapper userMapper;
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    @Autowired
    private JwtTokenUtil jwtTokenUtil;
    
    public AuthResponse login(LoginRequest request) {
        // 验证用户
        User user = userMapper.selectByUsername(request.getUsername());
        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BusinessException("用户名或密码错误");
        }
        
        // 生成JWT
        String token = jwtTokenUtil.generateToken(user.getId());
        
        // 缓存用户信息
        redisTemplate.opsForValue().set("user:" + user.getId(), user, 1, TimeUnit.DAYS);
        
        return new AuthResponse(token, user);
    }
}
```

```
**商品服务：**
```

```java
@Service
public class ProductService {
    
    @Autowired
    private ProductMapper productMapper;
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    @Cacheable(value = "products", key = "#id")
    public Product getProductById(Long id) {
        return productMapper.selectById(id);
    }
    
    public Page<Product> searchProducts(String keyword, int pageNum, int pageSize) {
        Page<Product> page = new Page<>(pageNum, pageSize);
        return productMapper.selectPage(page, 
            new QueryWrapper<Product>()
                .like("title", keyword)
                .or()
                .like("description", keyword));
    }
}
```

```
**订单服务：**
```

```java
@Service
@Transactional
public class OrderService {
    
    @Autowired
    private OrderMapper orderMapper;
    
    @Autowired
    private OrderItemMapper orderItemMapper;
    
    @Autowired
    private RabbitTemplate rabbitTemplate;
    
    public Order createOrder(CreateOrderRequest request) {
        // 创建订单
        Order order = new Order();
        order.setUserId(request.getUserId());
        order.setTotalAmount(request.getTotalAmount());
        order.setStatus(OrderStatus.PENDING);
        orderMapper.insert(order);
        
        // 创建订单项
        for (OrderItemRequest item : request.getItems()) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrderId(order.getId());
            orderItem.setProductId(item.getProductId());
            orderItem.setQuantity(item.getQuantity());
            orderItemMapper.insert(orderItem);
        }
        
        // 发送消息到队列
        rabbitTemplate.convertAndSend("order.exchange", "order.create", order);
        
        return order;
    }
}
```

### 四、部署上线

#### 4.1 打包应用

```bash
# 打包
mvn clean package

# 跳过测试打包
mvn clean package -DskipTests

# 生成可执行JAR
# target/ecommerce-system-1.0.0.jar
```

#### 4.2 Docker部署

```
**Dockerfile：**
```

```dockerfile
FROM openjdk:17-jre-slim

WORKDIR /app

COPY target/ecommerce-system-1.0.0.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
```

```
**docker-compose.yml：**
```

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - SPRING_DATASOURCE_URL=jdbc:mysql://db:3306/ecommerce
    depends_on:
      - db
      - redis
  
  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=password
      - MYSQL_DATABASE=ecommerce
    volumes:
      - mysql_data:/var/lib/mysql
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  mysql_data:
```

### 五、项目总结

#### 5.1 经验总结

```
**开发过程中的关键点：**
```

1. **模块化设计**：清晰的分层和模块划分
2. **缓存策略**：合理使用Redis缓存提升性能
3. **消息队列**：异步处理提升系统响应速度
4. **事务管理**：确保数据一致性
5. **异常处理**：统一的异常处理机制

#### 5.2 优化建议

```
**性能优化：**
```
- 使用Redis缓存热点数据
- 数据库读写分离
- 使用CDN加速静态资源
- 优化SQL查询

```
**功能扩展：**
```
- 添加分布式锁
- 实现分布式事务
- 添加监控和告警
- 实现服务降级和熔断

### 六、总结

通过本系列文章的学习，您已经全面掌握了SpringBoot从入门到实战的完整知识体系。希望这些内容能够帮助您在SpringBoot开发中取得更好的成果。