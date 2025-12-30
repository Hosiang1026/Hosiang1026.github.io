---
title: SpringIOC进阶篇
categories: Spring生态体系系列
tags:
  - Java
abbrlink: c486f11
date: 2019-04-23 00:00:00
top: 5
---



本文作为SpringIOC的进阶指南，深入讲解高级特性、性能优化、最佳实践等进阶内容。在掌握基础知识的基础上，进一步提升您的SpringIOC技能水平，解决实际开发中的复杂问题。

<!-- more -->

### 一、高级特性

#### 1.1 Bean作用域深入

```
Spring支持的Bean作用域：
```

```java
// 1. 单例（Singleton）- 默认
@Scope(ConfigurableBeanFactory.SCOPE_SINGLETON)
@Component
public class SingletonBean {
    // 容器中只有一个实例
}

// 2. 原型（Prototype）
@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@Component
public class PrototypeBean {
    // 每次获取都创建新实例
}

// 3. 请求作用域（Request）- Web环境
@Scope(WebApplicationContext.SCOPE_REQUEST)
@Component
public class RequestBean {
    // 每个HTTP请求一个实例
}

// 4. 会话作用域（Session）- Web环境
@Scope(WebApplicationContext.SCOPE_SESSION)
@Component
public class SessionBean {
    // 每个HTTP会话一个实例
}

// 5. 应用作用域（Application）- Web环境
@Scope(WebApplicationContext.SCOPE_APPLICATION)
@Component
public class ApplicationBean {
    // ServletContext级别，整个应用一个实例
}
```

```
作用域选择建议：
```

- 单例：无状态Bean，性能最好，推荐使用
- 原型：有状态Bean，线程不安全对象
- 请求/会话：Web相关的Bean

#### 1.2 依赖注入高级用法

```
条件注入：
```

```java
// 使用@ConditionalOnProperty
@ConditionalOnProperty(name = "feature.enabled", havingValue = "true")
@Component
public class ConditionalBean {
}

// 使用@Profile
@Profile("dev")
@Component
public class DevBean {
}

@Profile("prod")
@Component
public class ProdBean {
}
```

```
集合注入：
```

```java
@Service
public class OrderService {
    
    // 注入List
    @Autowired
    private List<PaymentProcessor> processors;
    
    // 注入Map
    @Autowired
    private Map<String, PaymentProcessor> processorMap;
    
    // 注入Set
    @Autowired
    private Set<Validator> validators;
}
```

```
可选依赖：
```

```java
@Service
public class UserService {
    
    // 使用@Autowired(required = false)
    @Autowired(required = false)
    private OptionalService optionalService;
    
    // 或使用Optional
    @Autowired
    private Optional<OptionalService> optionalService;
}
```

#### 1.3 Bean生命周期回调

```
初始化回调：
```

```java
@Component
public class LifecycleBean implements InitializingBean {
    
    // 方式1：实现InitializingBean接口
    @Override
    public void afterPropertiesSet() {
        System.out.println("afterPropertiesSet执行");
    }
    
    // 方式2：使用@PostConstruct注解
    @PostConstruct
    public void init() {
        System.out.println("@PostConstruct执行");
    }
    
    // 方式3：自定义init方法
    public void customInit() {
        System.out.println("自定义init方法执行");
    }
}

// 配置自定义init方法
@Bean(initMethod = "customInit")
public LifecycleBean lifecycleBean() {
    return new LifecycleBean();
}
```

```
销毁回调：
```

```java
@Component
public class LifecycleBean implements DisposableBean {
    
    // 方式1：实现DisposableBean接口
    @Override
    public void destroy() {
        System.out.println("destroy执行");
    }
    
    // 方式2：使用@PreDestroy注解
    @PreDestroy
    public void cleanup() {
        System.out.println("@PreDestroy执行");
    }
    
    // 方式3：自定义destroy方法
    public void customDestroy() {
        System.out.println("自定义destroy方法执行");
    }
}
```

### 二、性能优化

#### 2.1 Bean创建优化

```
懒加载：
```

```java
// 配置类级别
@Configuration
@Lazy
public class LazyConfig {
}

// Bean级别
@Lazy
@Component
public class LazyBean {
}

// 注入时懒加载
@Component
public class ServiceBean {
    @Lazy
    @Autowired
    private HeavyBean heavyBean;
}
```

```
Bean定义优化：
```

```java
// 使用@Primary指定主要Bean
@Primary
@Component
public class PrimaryServiceImpl implements Service {
}

// 使用@Qualifier指定具体Bean
@Autowired
@Qualifier("specificServiceImpl")
private Service service;
```

#### 2.2 循环依赖处理

```
循环依赖类型：
```

```java
// 1. 单例Bean的循环依赖（Spring支持）
@Service
public class ServiceA {
    @Autowired
    private ServiceB serviceB;
}

@Service
public class ServiceB {
    @Autowired
    private ServiceA serviceA;  // 循环依赖
}

// 2. 原型Bean的循环依赖（Spring不支持）
@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@Service
public class PrototypeServiceA {
    @Autowired
    private PrototypeServiceB serviceB;
}
```

```
解决方案：
```

```java
// 方案1：使用@Lazy延迟初始化
@Service
public class ServiceA {
    @Lazy
    @Autowired
    private ServiceB serviceB;
}

// 方案2：使用Setter注入替代构造函数注入
@Service
public class ServiceA {
    private ServiceB serviceB;
    
    @Autowired
    public void setServiceB(ServiceB serviceB) {
        this.serviceB = serviceB;
    }
}

// 方案3：重构代码，消除循环依赖
```

### 三、架构设计

#### 3.1 设计模式应用

```
工厂模式：
```

```java
// BeanFactory和ApplicationContext都是工厂
ApplicationContext context = new AnnotationConfigApplicationContext(AppConfig.class);
UserService userService = context.getBean(UserService.class);

// 自定义工厂Bean
@Configuration
public class FactoryConfig {
    @Bean
    public UserService userService() {
        return UserServiceFactory.createUserService();
    }
}
```

```
单例模式：
```

```java
// Spring默认单例
@Component
public class SingletonService {
    // 容器中只有一个实例
}
```

```
策略模式：
```

```java
// 定义策略接口
public interface PaymentStrategy {
    void pay(BigDecimal amount);
}

// 多个策略实现
@Component("creditCard")
public class CreditCardStrategy implements PaymentStrategy { }

@Component("alipay")
public class AlipayStrategy implements PaymentStrategy { }

// 使用策略
@Service
public class PaymentService {
    @Autowired
    private Map<String, PaymentStrategy> strategies;
    
    public void pay(String type, BigDecimal amount) {
        PaymentStrategy strategy = strategies.get(type);
        strategy.pay(amount);
    }
}
```

#### 3.2 模块化设计

```
多配置类管理：
```

```java
// 主配置类
@Configuration
@Import({DatabaseConfig.class, CacheConfig.class, SecurityConfig.class})
public class AppConfig {
}

// 数据库配置
@Configuration
public class DatabaseConfig {
    @Bean
    public DataSource dataSource() { }
}

// 缓存配置
@Configuration
public class CacheConfig {
    @Bean
    public CacheManager cacheManager() { }
}
```

### 四、实战技巧

#### 4.1 调试技巧

```
查看Bean信息：
```

```java
// 获取所有Bean名称
ApplicationContext context = ...;
String[] beanNames = context.getBeanDefinitionNames();
for (String name : beanNames) {
    System.out.println(name);
}

// 检查Bean类型
Object bean = context.getBean("beanName");
System.out.println(bean.getClass().getName());

// 检查Bean作用域
BeanDefinition definition = ((BeanFactory) context).getBeanDefinition("beanName");
System.out.println(definition.getScope());
```

```
使用Spring Boot Actuator：
```

```yaml
# application.yml
management:
  endpoints:
    web:
      exposure:
        include: beans,env
```

访问：`http://localhost:8080/actuator/beans`

#### 4.2 问题排查

```
常见问题及解决方案：
```

1. Bean创建失败
   ```java
   // 检查：
   // 1. 类路径是否正确
   // 2. 依赖的Bean是否存在
   // 3. 构造函数参数是否匹配
   // 4. 是否有循环依赖
   ```

2. 依赖注入失败
   ```java
   // 检查：
   // 1. @Autowired注解是否正确
   // 2. Bean是否被Spring管理
   // 3. 组件扫描路径是否正确
   // 4. 是否有多个同类型Bean（需要@Qualifier）
   ```

3. 作用域问题
   ```java
   // 单例Bean注入原型Bean时，原型Bean不会每次都创建新实例
   // 解决方案：使用@Lookup或ObjectFactory
   @Lookup
   protected PrototypeBean getPrototypeBean() {
       return null;  // Spring会实现这个方法
   }
   ```

### 五、总结

通过本文的学习，您已经掌握了SpringIOC的进阶知识。在下一篇文章中，我们将通过实际项目案例，展示SpringIOC的实战应用。