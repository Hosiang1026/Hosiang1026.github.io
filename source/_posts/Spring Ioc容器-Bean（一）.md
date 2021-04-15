---
title: 推荐系列-Spring Ioc容器-Bean（一）
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 866
cover_picture: 'https://api.ixiaowai.cn/gqapi/gqapi.php'
abbrlink: f94a552f
date: 2021-04-15 10:04:46
---

&emsp;&emsp;Bean的命名 Bean在Ioc容器中可以有一个或多个名称，但这些名称在容器内必须唯一，在Xml中配置id和name属性就可以为Bean起别名。 <bean id="user" name="zhangsan,lisi" class="com.example....
<!-- more -->

                                                                                                                                                                                         
#### Bean的命名 
Bean在Ioc容器中可以有一个或多个名称，但这些名称在容器内必须唯一，在Xml中配置id和name属性就可以为Bean起别名。 
 
 ```java 
  <bean id="user" name="zhangsan,lisi" class="com.example.demo.spring.UserBean"/>
  ``` 
  
这样我们就可以通过名称user、zhangsan、lisi获取UserBean的实例。 
当然如果你没有给UserBean配置id/name属性，Spring Ioc容器会未Bean自动生成一个类名首字符小写的别名。 
除此之外还可以使用 
 ```java 
  <alias name="user" alias="wangwu"></alias
  ``` 
 配置别名。 
 
#### Bean的实例化 
 
 ```java 
  <bean class=""/>
  ``` 
 class属性代表着Ioc要实例化的Bean的类型，通常Ioc容器会通过反射机制调用其无参构造函数直接创建Bean。 
除此之外还可以配置使用静态工厂方法或者实例工厂方法来实例化对象。 
 
 ```java 
  /**
 * 使用静态工厂实例化Bean
 * 配置factory-method属性
 */
public class StaticFactory {

    private static UserBean userBean = new UserBean();

    public static UserBean createInstance() {
        return userBean;
    }
}


  ``` 
  
 
 ```java 
  <bean id="user1" class="com.example.demo.spring.StaticFactory" factory-method="createInstance"></bean>


  ``` 
  
使用class来指定包含static工厂方法的类型，使用factory-method指定创建bean实例的工厂方法。 
 
 ```java 
  /**
 * 实例工厂方法
 * 配置factory-bean和factory-method属性
 */
public class InstanceFactory {

    public UserBean createUserBeanInstance() {
        return new UserBean();
    }
}


  ``` 
  
<bean id="instanceFactory" class="com.example.demo.spring.InstanceFactory"></bean> <bean id="user2" factory-bean="instanceFactory" factory-method="createUserBeanInstance"></bean> 
使用factory-bean指定要创建Bean实例的方法的Bean的名称，使用factory-method指定工厂方法名称。 
 
#### Bean依赖注入 
依赖注入指Ioc要创建A的实例，但A内部又依赖于B的实例，依赖注入主要有两种类型：基于构造函数的依赖注入和基于Setter的依赖注入。 
 
 构造函数注入 
 
        基于构造函数的依赖注入主要依赖于 
 ```java 
  <constructor-arg></constructor-ar
  ``` 
 标签。 
 
 Setter注入 
        使用Setter注入，必须保证要注入的属性具有setter方法，setter方法可以利用idea自动生成。主要依赖于<property></property> 
 
 
#### Bean的作用域 
bean的作用域通过scope属性配置 
 
  
   
   scope 
   描�� 
   
   
   singleton 
   Spring Ioc容器中只有一个实例 
   
   
   prototype 
   每次获取bena实例都重新创建一个新的 
   
   
   request 
   HTTP 请求的生命周期 
   
   
   session 
   HTTP  
 ```java 
  Session
  ``` 
 的生命周期 
   
   
   application 
    
 ```java 
  ServletContext
  ``` 
 的生命周期 
   
   
   websocket 
    
 ```java 
  WebSocket
  ``` 
 的生命周期 
   
  
 
 
#### Bean的生命周期回调 
 
除此之外还有其他的Aware，功能是为了获得接口申明的依赖 
 
  
   
   name 
   dependency 
   
   
   ApplicationEventPublisherAware 
   ApplicationContext的事件发布者 
   
   
   BeanFactoryAware 
   Bean工厂 
   
   
   ServletConfigAware 
   容器中的ServletConfig（Web容器） 
   
   
   ServletContextAware 
   容器中运行的ServletContext（Web容器） 
   
   
   BeanClassLoaderAware 
   Bean的类加载器 
   
  
 
 
####  Bean的parent属性 
parent属性用来指定要继承的配置数据，parent所指向的bean的定义必须要指定abstract属性为true，声明为抽象定义的Bean不能通过id获取实例，parent中定义的属性如果子bean重新配置，则会覆盖父bean的配置。 
<bean id="inheritedTestBean" abstract="true" class="com.example.demo.spring.TestBean">
    <property name="name" value="parent"></property>
    <property name="age" value="1"></property>
</bean>

<bean id="inheritedTestBean" abstract="true">
    <property name="name" value="parent"></property>
    <property name="age" value="1"></property>
</bean>

<bean id="inheritsWithDifferentClass" class="com.example.demo.spring.DrivedTestBean" parent="inheritedTestBean">
    <property name="name" value="override"></property>
    <property name="addr" value="西安"></property>
</bean> 
 
#### Bean的扩展 
 
 BeanPostProcessor 
 
BeanPostProcessor接口提供了两个方法postProcessBeforeInitialization（init之前调用）和 postProcessAfterInitialization （init之后调用），主要为了在Spring容器完成实例化、配置和初始化之后实现一些自定义的实例化或依赖解析逻辑等。一个容器中可以注册多个BeanPostProcessor，要控制他们的执行顺序，只需要继承Ordered接口。 
public class InstantiationTracingBeanPostProcessor implements BeanPostProcessor {
    @Override
    public Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException {
        System.out.println("************postProcessBeforeInitialization*********** + " + beanName);
        return bean;
    }

    @Override
    public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
        System.out.println("************postProcessAfterInitialization*********** + " + beanName);
        return bean;
    }
} 
 
 BeanFactoryPostProcessor 
 
     BeanFactoryPostProcessor是用来在beans进行初始化前修改bean的配置元数据。与BeanPostProcessor的主要区别是：BeanPostProcessor对Bean实例进行操作，BeanFactoryPostProcessor是对Bean的配��元数据进行操作。 
public class MyBeanFactoryPostProcessor implements BeanFactoryPostProcessor, Ordered {

    @Override
    public void postProcessBeanFactory(ConfigurableListableBeanFactory configurableListableBeanFactory) throws BeansException {
        System.out.println("postProcessBeanFactory >>>");
        BeanDefinition beanDefinition = configurableListableBeanFactory.getBeanDefinition("message1");
        System.out.println(beanDefinition.getBeanClassName());
    }

    @Override
    public int getOrder() {
        return 1;
    }

    public void init() {
        System.out.println("MyBeanFactoryPostProcessor init");
    }
} 
 
 PropertyPlaceholderConfigurer 
 
 
 ```java 
  PropertyPlaceholderConfigurer
  ``` 
  可以从单独独文件中的 bean 定义外部化属性值，不同的环境中加载不同的配置文件。 
<bean class="org.springframework.beans.factory.config.PropertyPlaceholderConfigurer">
    <property name="locations" value="jdbc.properties"></property>
</bean>
<bean id="datasource" class="com.example.demo.spring.DataSource">
    <property name="userName" value="${datasource.userName}"></property>
    <property name="password" value="${datasource.password}"></property>
</bean> 
也可以使用 
 
 ```java 
  <context:property-placeholder location="classpath:com/something/jdbc.properties"/>
  ``` 
 
 
 
 PropertyOverrideConfigure 
 
用来覆盖Bean的属性。 
<bean class="org.springframework.beans.factory.config.PropertyOverrideConfigurer">
    <property name="locations" value="jdbc.properties"></property>
</bean>
<bean id="datasource" class="com.example.demo.spring.DataSource">
    <property name="password" value="12311"></property>
</bean> 
jdbc.properties 
datasource.userName=root
datasource.password=root 
最终Bean password值会是root被PropertyOverrideConfigurer覆盖。 
 
#### FactoryBean 
FactoryBean是一个特殊的接口，它不同于BeanFactory，BeanFacoty是Spring的工厂，而FactoryBean是容器中的一个特殊bean，可以创建指定的类型Bean的实例。 
public class DataSourceFanctoryBean implements FactoryBean<DataSource> {
    @Override
    public DataSource getObject() throws Exception {
        System.out.println(1);
        DataSource dataSource = new DataSource();
        dataSource.setUserName("张三");
        dataSource.setPassword("123456");
        return dataSource;
    }

    @Override
    public Class<?> getObjectType() {
        return DataSource.class;
    }

    @Override
    public boolean isSingleton() {
        return false;
    }
}
 
<bean id="datasource" class="com.example.demo.spring.DataSourceFanctoryBean"></bean>

直接通过beanfactory.getBean("datasource")获取则是 DataSource 的实例，在id前加 & 则获取的是 DataSourceFanctoryBean 的实例
                                        