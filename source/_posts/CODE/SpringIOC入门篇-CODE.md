---
title: SpringIOC入门篇
categories: Spring生态体系系列
tags:
  - Java
abbrlink: 23c0ae81
date: 2022-01-23 00:00:00
top: 12
---



本文作为SpringIOC的入门指南，详细介绍基础概念、环境准备、工具安装等入门知识。从零开始，手把手教您掌握SpringIOC的基础操作，为后续深入学习打下坚实基础。

<!-- more -->

### 一、基础概念

#### 1.1 什么是SpringIOC

```
**IOC（Inversion of Control）控制反转：**
```

IOC是Spring框架的核心概念之一，是一种设计思想。传统方式中，对象之间的依赖关系由程序代码直接控制，而IOC将对象的创建和依赖关系的管理交给Spring容器来处理。

```
**IOC的核心思想：**
```

- **控制反转**：将对象的控制权从应用程序代码转移到Spring容器
- **依赖注入（DI）**：IOC的实现方式，通过容器注入对象所需的依赖
- **解耦**：降低对象之间的耦合度，提高代码的可维护性

```
**传统方式 vs IOC方式：**
```

```java
// 传统方式：程序主动创建对象
public class UserService {
    private UserRepository userRepository;
    
    public UserService() {
        this.userRepository = new UserRepositoryImpl();  // 硬编码依赖
    }
}

// IOC方式：容器注入依赖
public class UserService {
    private UserRepository userRepository;
    
    // 通过构造函数注入
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;  // 依赖注入
    }
}
```

#### 1.2 核心特性

```
**IOC的主要特性：**
```

- **Bean管理**：Spring容器负责创建、配置和管理Bean
- **依赖注入**：自动注入对象所需的依赖
- **生命周期管理**：管理Bean的创建、初始化和销毁
- **作用域管理**：支持单例、原型等多种作用域
- **配置灵活**：支持XML、注解、Java配置等多种方式

```
**依赖注入的三种方式：**
```

1. **构造函数注入**：通过构造函数注入依赖
2. **Setter注入**：通过Setter方法注入依赖
3. **字段注入**：通过@Autowired注解直接注入字段

### 二、环境准备

#### 2.1 系统要求

```
**开发环境：**
```
- **JDK**: JDK 8或更高版本
- **IDE**: IntelliJ IDEA / Eclipse
- **构建工具**: Maven / Gradle

```
**Spring版本：**
```
- Spring Framework 5.3+
- 或 Spring Boot 2.7+（内置Spring）

#### 2.2 工具安装

```
**使用Maven创建项目：**
```

```xml
<!-- pom.xml -->
<dependencies>
    <!-- Spring Core -->
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-context</artifactId>
        <version>5.3.21</version>
    </dependency>
</dependencies>
```

```
**使用Gradle创建项目：**
```

```gradle
// build.gradle
dependencies {
    implementation 'org.springframework:spring-context:5.3.21'
}
```

### 三、快速开始

#### 3.1 创建第一个IOC项目

```
**1. 定义Bean类：**
```

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
    private UserRepository userRepository;
    
    // 构造函数注入
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    
    public User getUserById(Long id) {
        return userRepository.findById(id);
    }
}
```

```
**2. 使用XML配置：**
```

```xml
<!-- applicationContext.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
       http://www.springframework.org/schema/beans/spring-beans.xsd">
    
    <!-- 定义UserRepository Bean -->
    <bean id="userRepository" class="com.example.repository.UserRepositoryImpl"/>
    
    <!-- 定义UserService Bean，注入userRepository -->
    <bean id="userService" class="com.example.service.UserService">
        <constructor-arg ref="userRepository"/>
    </bean>
</beans>
```

```
**3. 使用Java配置：**
```

```java
@Configuration
public class AppConfig {
    
    @Bean
    public UserRepository userRepository() {
        return new UserRepositoryImpl();
    }
    
    @Bean
    public UserService userService(UserRepository userRepository) {
        return new UserService(userRepository);
    }
}
```

```
**4. 使用注解配置：**
```

```java
// 启用组件扫描
@Configuration
@ComponentScan(basePackages = "com.example")
public class AppConfig {
}

// 使用注解标记Bean
@Repository
public class UserRepositoryImpl implements UserRepository {
    // ...
}

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    // ...
}
```

#### 3.2 运行示例

```
**使用ApplicationContext：**
```

```java
public class Main {
    public static void main(String[] args) {
        // XML配置方式
        ApplicationContext context = new ClassPathXmlApplicationContext("applicationContext.xml");
        
        // Java配置方式
        // ApplicationContext context = new AnnotationConfigApplicationContext(AppConfig.class);
        
        // 从容器获取Bean
        UserService userService = context.getBean(UserService.class);
        
        // 使用Bean
        User user = userService.getUserById(1L);
        System.out.println(user);
    }
}
```

### 四、常见问题

#### 4.1 安装问题

```
**问题1：找不到Spring依赖**
```

```
**解决方案：**
```
```xml
<!-- 检查Maven仓库配置 -->
<!-- 确保pom.xml中版本号正确 -->
<!-- 刷新Maven项目 -->
```

```
**问题2：Bean创建失败**
```

```
**解决方案：**
```
- 检查类路径是否正确
- 检查Bean的构造函数参数
- 检查依赖的Bean是否存在

#### 4.2 配置问题

```
**问题1：依赖注入失败**
```

```
**解决方案：**
```
```java
// 检查@Autowired注解
// 检查Bean的作用域
// 检查组件扫描路径
```

```
**问题2：循环依赖**
```

```
**解决方案：**
```
```java
// 使用@Lazy延迟初始化
@Lazy
@Autowired
private ServiceB serviceB;

// 或使用Setter注入替代构造函数注入
```