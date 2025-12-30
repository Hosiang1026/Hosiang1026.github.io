---
title: Spring框架入门篇
categories: Spring生态体系系列
tags:
  - Java
abbrlink: 21e862e1
date: 2023-01-28 00:00:00
top: 17
---

Spring框架是2003年兴起的一个轻量级Java开发框架，由Rod Johnson在其经典著作中阐述的理念衍生而来，旨在解决企业应用开发的复杂性。作为分层的JavaSE/EE一站式轻量级开源框架，Spring的核心是控制反转（IOC）和面向切面（AOP）

<!-- more -->

![Spring](https://hosiang1026.github.io/photos/image/2024/12/15/10szhdd.png "Spring系列框架简介-入门篇")

---

### 一、Spring框架概述

#### 1.1 什么是Spring框架

Spring框架是一个开源的Java平台，由Rod Johnson在2003年创建。它提供了一个全面的编程和配置模型，用于构建现代基于Java的企业应用程序。

```
**Spring的核心价值：**
```
- **简化Java开发**：通过依赖注入和面向切面编程简化企业级应用开发
- **解耦和模块化**：帮助开发者编写松耦合、可测试的代码
- **企业级功能**：提供事务管理、安全、缓存等企业级功能
- **一站式解决方案**：覆盖表现层、业务层、持久层

#### 1.2 Spring框架的优势

```
**1. 低侵入设计：**
```
- 代码污染极低
- 不需要继承特定的类或实现特定的接口
- 可以自由选择使用Spring的哪些功能

```
**2. 依赖注入（DI）：**
```
- IOC（控制反转）的核心机制
- 提供了bean工厂（Spring容器）
- 降低了业务对象替换的复杂性
- 提高了组件之间的解耦

```
**3. 面向切面编程（AOP）：**
```
- 将通用任务（安全、事务、日志等）集中管理
- 提高了代码复用性和管理的便捷性
- 业务逻辑与横切关注点分离

```
**4. 框架整合：**
```
- ORM和DAO提供了与第三方持久层框架的良好整合
- 简化了底层数据访问
- 支持Hibernate、MyBatis、JPA等

```
**5. Web MVC框架：**
```
- 提供了优秀的Web MVC框架
- 支持RESTful API开发
- 灵活的视图解析

```
**6. 企业级功能：**
```
- 数据库事务处理
- 远程调用（RMI、Hessian、HTTP）
- JMS消息处理
- JMX操作处理
- 不需要直接使用相关API（JDBC、JMX、JMS等）

#### 1.3 Spring生态系统

```
**核心框架：**
```
- **Spring Framework**：核心框架
- **Spring Boot**：快速开发框架
- **Spring Cloud**：微服务框架
- **Spring Data**：数据访问抽象

```
**相关项目：**
```
- **Spring Security**：安全框架
- **Spring Batch**：批处理框架
- **Spring Integration**：企业集成框架
- **Spring AMQP**：消息队列支持

### 二、Spring核心概念

#### 2.1 IOC（控制反转）

```
**IOC定义：**
```

IOC（Inversion of Control）即控制反转，多数书籍翻译成"控制反转"，还有些书籍翻译成为"控制反向"或者"控制倒置"。

```
**传统方式 vs IOC方式：**
```

```
**传统方式：**
```
```java
// 传统方式：对象自己创建依赖
public class UserService {
    private UserRepository userRepository;
    
    public UserService() {
        this.userRepository = new UserRepositoryImpl(); // 硬编码依赖
    }
}
```

```
**IOC方式：**
```
```java
// IOC方式：依赖由容器注入
@Service
public class UserService {
    @Autowired
    private UserRepository userRepository; // 依赖注入
}
```

```
**IOC的优势：**
```
- 降低组件之间的耦合度
- 提高代码的可测试性
- 便于替换实现
- 统一管理对象生命周期
- 不需要主动查找，对象的查找、定位和创建全部由容器管理

#### 2.2 DI（依赖注入）

```
**DI定义：**
```

DI（Dependency Injection）即依赖注入，是IOC的一种实现方式。Spring的IOC容器主要使用DI方式实现。

```
**依赖注入方式：**
```

```
**1. 构造器注入（推荐）：**
```
```java
@Service
public class UserService {
    private final UserRepository userRepository;
    
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
}
```

```
**2. Setter注入：**
```
```java
@Service
public class UserService {
    private UserRepository userRepository;
    
    @Autowired
    public void setUserRepository(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
}
```

```
**3. 字段注入：**
```
```java
@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
}
```

#### 2.3 AOP（面向切面编程）

```
**AOP定义：**
```

AOP是OOP的延续，是Aspect Oriented Programming的缩写，意思是面向方面编程。AOP实际是GoF设计模式的延续，设计模式孜孜不倦追求的是调用者和被调用者之间的解耦，AOP可以说也是这种目标的一种实现。

```
**AOP应用场景：**
```
- **日志记录**：方法执行前后记录日志
- **事务管理**：自动管理事务的开启、提交、回滚
- **权限控制**：方法执行前检查权限
- **性能监控**：统计方法执行时间
- **异常处理**：统一异常处理

```
**AOP示例：**
```
```java
@Aspect
@Component
public class LoggingAspect {
    
    @Before("execution(* com.example.service.*.*(..))")
    public void logBefore(JoinPoint joinPoint) {
        System.out.println("执行方法: " + joinPoint.getSignature().getName());
    }
}
```

### 三、Spring 框架的20个模块

![Spring](https://hosiang1026.github.io/photos/image/2024/12/15/10szeqv.png "Spring系列框架简介-入门篇")

---


```
**Spring IOC:**
```

IOC是Inversion of Control的缩写，多数书籍翻译成“控制反转”，还有些书籍翻译成为“控制反向”或者“控制倒置”。本来是由应用程序管理的对象之间的依赖关系，现在交给了容器管理，这就叫控制反转，即交给了IOC容器，spring的IOC容器主要使用DI方式实现的。不需要主动查找，对象的查找、定位和创建全部由容器管理。spring ioc 是spring的核心，在spring中主要用户管理容器中的bean。

 
```
**Spring AOP:**
```

AOP是OOP的延续，是Aspect Oriented Programming的缩写，意思是面向方面编程。AOP实际是GoF设计模式的延续，设计模式孜孜不倦追求的是调用者和被调用者之间的解耦，AOP可以说也是这种目标的一种实现。spring aop 也是spring的核心，利用aop的技术可以用来做日志、权限、缓存等功能实现。

 
```
**Spring ORM:**
```

Spring支持大多数ORM框架，比如Hibernate，JPA，JDO，TopLink和iBatis（spring2支持iBatis2，现MyBatis3的spring支持由MyBatis社区开发，并非spring）。

 
```
**Spring MVC:**
```

Spring MVC框架是有一个MVC框架，通过实现Model-View-Controller模式来很好地将数据、业务与展现进行分离。从这样一个角度来说，spring MVC和Struts、Struts2非常类似。

 
```
**Spring Webservice:**
```

Spring 支持集成Apache cxf、axis2、xfire等不同集中webservice实现方案。

 
```
**Spring Transaction:**
```

Spring完美的支持了对事物的管理，目前主要有两种实现发难，一种是配置文件、一种是基于注解来实现。

 ---
 

```
**Spring JMS:**
```

Spring支持对activemq、RabbitMQ消息中间件的集成。

 
```
**Spring Data:**
```

Spring Data 作为springSource的其中一个父项目， 旨在统一和简化对各类型持久化存储， 而不拘泥于是关系型数据库还是NoSQL 数据存储。

 
```
**Spring Cache:**
```

Spring 的缓存技术还具备相当的灵活性，不仅能够使用 SpEL（spring Expression Language）来定义缓存的 key 和各种 condition，还提供开箱即用的缓存临时存储方案，也支持和主流的专业缓存例如 EHCache 集成。

 
```
**Spring Boot:**
```

Spring-Boot是由Pivotal团队提供的全新框架，其设计目的是用来简化新spring应用的初始搭建以及开发过程。该框架使用了特定的方式来进行配置，从而使开发人员不再需要定义样板化的配置。通过这种方式，Boot致力于在蓬勃发展的快速应用开发领域（rapid application development）成为领导者。

 
```
**Spring Security:**
```

Spring Security是一个能够为基于spring的企业应用系统提供声明式的安全访问控制解决方案的安全框架。它提供了一组可以在spring应用上下文中配置的Bean，充分利用了spring IoC，DI（控制反转Inversion of Control ,DI:Dependency Injection 依赖注入）和AOP（面向切面编程）功能，为应用系统提供声明式的安全访问控制功能，减少了为企业系统安全控制编写大量重复代码的工作。

 
```
**Spring Schedule:**
```

Spring在schedule这块支持JDK Timer、concurrent、quartz三种，这三种任务调度方案在实现机制和调用方法上都不同，但spring通过对其包装，使得基于spring能用统一的配置和编码风格来使用这三种schedule方案。

### 四、第一个Spring应用

#### 4.1 创建Maven项目

```
**pom.xml配置：**
```

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>
    
    <groupId>com.example</groupId>
    <artifactId>spring-demo</artifactId>
    <version>1.0.0</version>
    
    <properties>
        <spring.version>5.3.21</spring.version>
        <maven.compiler.source>11</maven.compiler.source>
        <maven.compiler.target>11</maven.compiler.target>
    </properties>
    
    <dependencies>
        <!-- Spring Core -->
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-context</artifactId>
            <version>${spring.version}</version>
        </dependency>
    </dependencies>
</project>
```

#### 4.2 创建Bean类

```java
// User.java
public class User {
    private String name;
    private Integer age;
    
    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }
}

// UserService.java
public class UserService {
    public void sayHello(User user) {
        System.out.println("Hello, " + user.getName() + "!");
    }
}
```

#### 4.3 配置Spring

```
**XML配置方式：**
```

```xml
<!-- applicationContext.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
       http://www.springframework.org/schema/beans/spring-beans.xsd">
    
    <bean id="user" class="com.example.User">
        <property name="name" value="张三"/>
        <property name="age" value="25"/>
    </bean>
    
    <bean id="userService" class="com.example.UserService"/>
</beans>
```

```
**Java配置方式（推荐）：**
```

```java
@Configuration
@ComponentScan(basePackages = "com.example")
public class AppConfig {
    
    @Bean
    public User user() {
        User user = new User();
        user.setName("张三");
        user.setAge(25);
        return user;
    }
    
    @Bean
    public UserService userService() {
        return new UserService();
    }
}
```

#### 4.4 使用Spring容器

```java
// 使用XML配置
ApplicationContext context = new ClassPathXmlApplicationContext("applicationContext.xml");
User user = context.getBean("user", User.class);
UserService userService = context.getBean("userService", UserService.class);
userService.sayHello(user);

// 使用Java配置
ApplicationContext context = new AnnotationConfigApplicationContext(AppConfig.class);
User user = context.getBean(User.class);
UserService userService = context.getBean(UserService.class);
userService.sayHello(user);
```

### 五、Spring注解开发

#### 5.1 常用注解

```
**组件注解：**
```
```java
@Component      // 通用组件
@Service        // 服务层组件
@Repository     // 数据访问层组件
@Controller     // 控制器组件
```

```
**依赖注入注解：**
```
```java
@Autowired      // 自动装配
@Qualifier      // 指定Bean名称
@Resource       // JSR-250注解
@Value          // 注入值
```

```
**配置注解：**
```
```java
@Configuration  // 配置类
@Bean           // 定义Bean
@ComponentScan  // 组件扫描
@PropertySource // 属性源
```

#### 5.2 注解示例

```java
// 配置类
@Configuration
@ComponentScan(basePackages = "com.example")
public class AppConfig {
}

// 服务类
@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    
    public User findById(Long id) {
        return userRepository.findById(id);
    }
}

// 数据访问类
@Repository
public class UserRepository {
    public User findById(Long id) {
        // 实现查询逻辑
        return new User();
    }
}
```

### 六、框架源码解析

#### 6.1 框架版本

```
**当前版本：**
```
- spring-framework-5.0.6.RELEASE（示例版本）
- 最新版本：Spring 6.x（需要Java 17+）
- 推荐版本：Spring 5.3.x（稳定版本）

#### 6.2 核心包结构

Spring的骨架，也是Spring的核心包。主要包含三个内容：

```
**1. Beans（Bean实例）：**
```
- beans包更侧重于bean实例的描述
- 负责Bean的定义、创建、管理
- 类比：演员

```
**2. Context（上下文）：**
```
- context更侧重全局控制，功能衍生
- 提供Spring框架的上下文环境
- 类比：导演

```
**3. Core（核心工具）：**
```
- core包侧重于帮助类，操作工具
- 提供Spring框架的基础工具类
- 类比：道具

![Spring](https://hosiang1026.github.io/photos/image/2024/12/15/10szjei.png "Spring系列-IOC-开发篇")

#### 6.3 源码结构

```
**核心包结构：**
```

```
spring-framework/
├── spring-core/          # 核心工具类
├── spring-beans/          # Bean定义和管理
├── spring-context/        # 应用上下文
├── spring-aop/            # AOP支持
├── spring-expression/     # SpEL表达式
├── spring-jdbc/           # JDBC支持
├── spring-orm/            # ORM支持
├── spring-tx/             # 事务支持
├── spring-web/            # Web支持
├── spring-webmvc/         # MVC框架
└── spring-test/           # 测试支持
```

![Spring](https://hosiang1026.github.io/photos/image/2024/12/15/10sznzk.png "Spring系列-IOC-开发篇")

#### 6.4 Beans包（实例）

```
**Beans包核心类：**
```
- BeanDefinition：Bean定义接口
- BeanFactory：Bean工厂接口
- BeanWrapper：Bean包装器
- PropertyAccessor：属性访问器

![Spring](https://hosiang1026.github.io/photos/image/2024/12/15/10szuaj.png "Spring系列-IOC-开发篇")

#### 6.5 Context包（上下文）

```
**Context包核心类：**
```
- ApplicationContext：应用上下文接口
- ConfigurableApplicationContext：可配置上下文
- BeanPostProcessor：Bean后处理器
- ApplicationEventPublisher：事件发布器

![Spring](https://hosiang1026.github.io/photos/image/2024/12/15/10szvft.png "Spring系列-IOC-开发篇")

#### 6.6 Core包（核心工具）

```
**Core包核心类：**
```
- Resource：资源抽象接口
- ResourceLoader：资源加载器
- BeanDefinitionRegistry：Bean定义注册器
- BeanDefinitionReader：Bean定义读取器

##### 6.6.1 Registry（描述注册器）

![Spring](https://hosiang1026.github.io/photos/image/2024/12/15/10t010a.png "Spring系列-IOC-开发篇")

##### 6.6.2 Strategy（初始化策略）

![Spring](https://hosiang1026.github.io/photos/image/2024/12/15/10t17oy.png "Spring系列-IOC-开发篇")

### 七、下一步学习

通过本文的学习，您已经掌握了Spring框架的基础知识，包括：

- Spring框架的核心概念（IOC、DI、AOP）
- Spring框架的模块组成
- Spring的基本使用和配置
- Spring注解开发
- Spring框架源码结构

在下一篇文章（进阶篇）中，我们将深入学习Spring框架的高级特性，包括AOP深入、事务管理、Bean生命周期、性能优化等内容。

```
**参考资源：**
- [Spring框架源码](https://github.com/Hosiang1026/spring-framework)
- [简单的Spring框架实现](https://github.com/Hosiang1026/simple-spring)
- [Spring官方文档](https://spring.io/projects/spring-framework)
```

