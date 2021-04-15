---
title: 推荐系列-面经手册 · 第29篇《Spring IOC 特性有哪些，不会读不懂源码！》
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 900
cover_picture: 'https://oscimg.oschina.net/oscnet/b6fed775-8f93-412b-a09f-bc9f41e8c4f1.png'
abbrlink: dae4c72c
date: 2021-04-15 09:53:06
---

&emsp;&emsp;持续坚持原创输出，点击蓝字关注我吧 作者：小傅哥 博客：https://bugstack.cn ❝ 沉淀、分享、成长，让自己和他人都能有所收获！😜 ❞ 目录 一、前言 二、面试题 三、SpringIOC 特性 1. x...
<!-- more -->

                                                                                                                                                                                         
  
   
  ##### 持续坚持原创输出，点击蓝字关注我吧 
  ![Test](https://oscimg.oschina.net/oscnet/b6fed775-8f93-412b-a09f-bc9f41e8c4f1.png  '面经手册 · 第29篇《Spring IOC 特性有哪些，不会读不懂源码！》') 
  作者：小傅哥博客：https://bugstack.cn 
   
  
  
   
  ### 目录 
   
   
   一、前言 
   二、面试题 
   三、SpringIOC 特性 
    
    1. xml 配置 
    2. 接口类 
    
   四、总结 
   五、系列推荐 
   
   
   
  #### 一、前言 
   
 ```java 
  多线程、锁、JVM调优，都背出花啦，怎么一写代码还是乱糟糟？
  ``` 
  
  为什么这些无论从书本、课堂、面试都显得非常重要的知识，但是在实际的编程中没有提升你的编码能力呢？ 
  首先这些这些知识在实际的互联网业务开发中，��乎��不常用的，几乎有锁和多线程的场景，为了性能的提升也基本都是采用分布式设计和实现了。而这些看上去很有技术含量的知识多数都被包装在非业务逻辑功能的组件中，而程序员在做业务开发时候几乎是关心不到。所以会了这些也几乎不太可能就把你的编码能提升起来，多数提升的是你在查复杂bug时候有一臂之力。 
  就像会汉字就能写出诗词歌赋吗？懂RGB就能绘出山河大川吗？能蹦跳就可以舞出摇曳生姿吗？那都是不可能的，不要想着屁股围噶布就说会武术！ 
  如果真的想把代码写好，就要一点点从积累数据结构和算法逻辑(不只是机械式的刷几道题就算了。你不理解为什么，刷再多也只是徒劳)，接下来要做的是对设计模式和架构设计的理解，最终是不断的运用和总结。在这个过程你会接触到业务、产品、运营，编码只是最后的具体实现，并不是全流程中最重要的一部分，与编码相比更重要的是逻辑设计。 
   
  #### 二、面试题 
   
 ```java 
  谢飞机，小记！
  ``` 
 ，这次放假一遍撸串一遍被Spring，嘿嘿，检验成果面试去！ 
  面试官：飞机，今天准备咋样，上次问你的都学会了吗？ 
  谢飞机：@Resource 是 JDK  
 ```java 
  javax.annotation.Resource
  ``` 
  提供的注解，哈哈哈哈哈，另外也学习了Bean的注入。 
  面试官：挺好记住了一些，那你在做 Bean 注入学习的时候，有注意到 Spring IOC 的特性吗，你都用到了什么？ 
  谢飞机：嗯，用到 Bean 的配置、BeanDefinitionRegistryPostProcessor 对 Bean 的定义、还有 FactoryBean 
  面试官：好，那今天再和你聊聊，alias、autowire、depends-on、factory-method、lookup-method等，实践验证下看看它们是怎么应用的。 
   
  #### 三、SpringIOC 特性 
  IOC(Inversion of Control)，控制反转的核心思想在于，资源的使用不由使用各自管理，而是交给不使用资源的第三方进行管理。这样的好处是资源是集中管理的，可配置、易维护，同时也降低了双方的依赖度做到了低耦合。 
   
  接下来就给大家介绍一下 IOC 的一些核心特性，因为这些内容不仅是面试考点，也是在开发中间件或者小组件时需要用到的功能类，概括如下： 
   
   ![Test](https://oscimg.oschina.net/oscnet/b6fed775-8f93-412b-a09f-bc9f41e8c4f1.png  '面经手册 · 第29篇《Spring IOC 特性有哪些，不会读不懂源码！》') 
   
   
  ##### 1. xml 配置 
   
  ###### 1.1 alias 
  测试类 
   
 ```java 
  public class UserService {    private UserDao userDao;    public UserService() {        System.out.println("我被初始化了，UserService");    }    // ...get/set}
  ``` 
  
  xml配置 
   
 ```java 
  <bean id="userService" class="org.itstack.interview.UserService"/><!-- 起个别名 --><alias name="userService" alias="userService-alias01"/><!-- 别名的别名 --><alias name="userService-alias01" alias="userService-alias02"/>
  ``` 
  
  单元测试 
   
 ```java 
  @Testpublic void test_alias() {    BeanFactory beanFactory = new ClassPathXmlApplicationContext("spring-config-alias.xml");    logger.info("获取 Bean：{}", beanFactory.getBean("userService"));    logger.info("获取 Bean 通过别名：{}", beanFactory.getBean("userService-alias01"));    logger.info("获取 Bean 通过别名的别名：{}", beanFactory.getBean("userService-alias02"));}
  ``` 
  
  测试结果 
   
 ```java 
  23:01:29.872 [main] INFO  org.itstack.interview.test.ApiTest - 获取 Bean：org.itstack.interview.UserService@2a40cd9423:01:29.872 [main] DEBUG o.s.b.f.s.DefaultListableBeanFactory - Returning cached instance of singleton bean 'userService'23:01:29.872 [main] INFO  org.itstack.interview.test.ApiTest - 获取 Bean 通过别名：org.itstack.interview.UserService@2a40cd9423:01:29.872 [main] DEBUG o.s.b.f.s.DefaultListableBeanFactory - Returning cached instance of singleton bean 'userService'23:01:29.872 [main] INFO  org.itstack.interview.test.ApiTest - 获取 Bean 通过别名的别名：org.itstack.interview.UserService@2a40cd94
  ``` 
  
   
   
    
     
     目的：用于给 Bean 起别名 
     
    
     
     使用：在 xml 配置里我们可以给一个 Bean 起个别名，还可以给别名起一个新的别名。 
     
   
   
  ###### 1.2 autowire 
  测试类 
   
 ```java 
  public class UserDao {    public UserDao() {        System.out.println("我被初始化了，UserDao");    }}
  ``` 
  
  xml配置 
   
 ```java 
  <bean id="userDao" class="org.itstack.interview.UserDao"/><!-- 手动配置依赖 --><bean id="userService-by-property" class="org.itstack.interview.UserService">    <property name="userDao" ref="userDao"/></bean><!-- 自动配置依赖 --><bean id="userService-by-autowire" class="org.itstack.interview.UserService" autowire="byName"/>
  ``` 
  
  单元测试 
   
 ```java 
  @Testpublic void test_autowire() {    BeanFactory beanFactory = new ClassPathXmlApplicationContext("spring-config-autowire.xml");    logger.info("获取 Bean by 手动配置依赖：{}", beanFactory.getBean("userService-by-property"));    logger.info("获取 Bean by 自动配置依赖：{}", beanFactory.getBean("userService-by-autowire"));}
  ``` 
  
  测试结果 
   
 ```java 
  23:05:55.501 [main] INFO  org.itstack.interview.test.ApiTest - 获取 Bean by 手动配置依赖：org.itstack.interview.UserService@679b62af23:05:55.501 [main] DEBUG o.s.b.f.s.DefaultListableBeanFactory - Returning cached instance of singleton bean 'userService-by-autowire'23:05:55.501 [main] INFO  org.itstack.interview.test.ApiTest - 获取 Bean by 自动配置依赖：org.itstack.interview.UserService@5cdd8682
  ``` 
  
   
   
    
     
     目的：autowire 用于把类中的属性注入交给 Spring 管理 
     
    
     
     使用：在 xml 配置中，有两种方式分别是：手动配置依赖、自动配置依赖，手动的大家基本很常用，自动的配置一般可能更多的对于注解的使用。其实这里的 autowire 和注解有一样的作用，autowire 几个可选项，byName、byType、constructor 等。 
     
   
   
  ###### 1.3 factory-method 
  测试类 
   
 ```java 
  public class StaticFactoryBean {    static public UserDao getUserDaoByStatic(){        return new UserDao();    }}
  ``` 
  
  xml配置 
   
 ```java 
  <bean id="staticFactory-method" class="org.itstack.interview.StaticFactoryBean" factory-method="getUserDaoByStatic"/>
  ``` 
  
  单元测试 
   
 ```java 
  @Testpublic void test_factory_method() {    BeanFactory beanFactory = new ClassPathXmlApplicationContext("spring-config-factory-method.xml");    logger.info("获取 Bean：{}", beanFactory.getBean("staticFactory-method"));}
  ``` 
  
  测试结果 
   
 ```java 
  23:15:28.950 [main] INFO  org.itstack.interview.test.ApiTest - 获取 Bean：org.itstack.interview.UserDao@588df31b23:15:28.950 [main] DEBUG o.s.b.f.s.DefaultListableBeanFactory - Returning cached instance of singleton bean 'staticFactory-bean'
  ``` 
  
   
   
    
     
     目的：标识静态工厂的工厂方法(工厂方法是静态的) 
     
    
     
     使用：核心在于 xml 配置中添加 
      
 ```java 
  factory-method="getUserDaoByStatic"
  ``` 
 ，这样就可以在初始化时候调用对应静态方法的实例化内容。 
     
   
   
  ###### 1.4 factory-bean 
  测试类 
   
 ```java 
  public class StaticFactoryBean {    public UserDao getUserDao(){        return new UserDao();    }}
  ``` 
  
  xml配置 
   
 ```java 
  <bean id="staticFactory" class="org.itstack.interview.StaticFactoryBean"/><bean id="staticFactory-bean" factory-bean="staticFactory" factory-method="getUserDao"/>
  ``` 
  
  单元��试 
   
 ```java 
  @Testpublic void test_factory_bean_method() {    BeanFactory beanFactory = new ClassPathXmlApplicationContext("spring-config-factory-method.xml");    logger.info("获取 Bean：{}", beanFactory.getBean("staticFactory-bean"));}
  ``` 
  
  测试结果 
   
 ```java 
  23:15:28.950 [main] INFO  org.itstack.interview.test.ApiTest - 获取 Bean：org.itstack.interview.UserDao@33b37288
  ``` 
  
   
   
    
     
     目的：factory-bean，实例化工厂类 
     
    
     
     使用：factory-bean、factory-method 需要配合使用， 
      
 ```java 
  factory-method="getUserDao"
  ``` 
  调用的是对应的费静态方法返回实例化结果。 
     
   
   
  ###### 1.5 depends-on 
  xml配置 
   
 ```java 
  <bean id="userService" class="org.itstack.interview.UserService" depends-on="userDao"/><bean id="userDao" class="org.itstack.interview.UserDao"/>
  ``` 
  
  单元测试 
   
 ```java 
  @Testpublic void test_depends_on() {    BeanFactory beanFactory = new ClassPathXmlApplicationContext("spring-config-depends-on.xml");    logger.info("获取 Bean：{}", beanFactory.getBean(UserService.class, "userService").getUserDao());}
  ``` 
  
  测试结果 
   
 ```java 
  我被初始化了，UserDao我被初始化了，UserService23:24:14.678 [main] INFO  org.itstack.interview.test.ApiTest - 获取 Bean：org.itstack.interview.UserDao@45afc369
  ``` 
  
   
   
    
     
     目的：处理依赖初始化顺序问题 
     
    
     
     使用：如果不使用 
      
 ```java 
  depends-on="userDao"
  ``` 
 ，那么按照 Spring 的配置最先初始化的是 
      
 ```java 
  UserService
  ``` 
 ，当你有需要处理初始化依赖时则需要使用到这个配置。 
     
   
   
  ###### 1.6 lookup-method & ApplicationContextAware 
  测试类 
   
 ```java 
  public class UserDaoProvider implements ApplicationContextAware {    private ApplicationContext applicationContext;    public UserDao getUserDao() {        return applicationContext.getBean("userDao", UserDao.class);    }    @Override    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {        this.applicationContext = applicationContext;    }}
  ``` 
  
  xml配置 
   
 ```java 
  <bean id="userDao" class="org.itstack.interview.UserDao" scope="prototype"/><bean id="provider" class="org.itstack.interview.UserDaoProvider"/>
  ``` 
  
  单元测试 
   
 ```java 
  @Testpublic void test_lookup_method() {    BeanFactory beanFactory = new ClassPathXmlApplicationContext("spring-config-lookup-method.xml");    logger.info("获取 Bean：{}", beanFactory.getBean(UserDaoProvider.class, "provider").getUserDao());    logger.info("获取 Bean：{}", beanFactory.getBean(UserDaoProvider.class, "provider").getUserDao());}
  ``` 
  
  测试结果 
   
 ```java 
  我被初始化了，UserDao16:29:25.813 [main] DEBUG o.s.b.f.s.DefaultListableBeanFactory - Finished creating instance of bean 'userDao'16:29:25.813 [main] INFO  org.itstack.interview.test.ApiTest - 获取 Bean：org.itstack.interview.UserDao@1188e82016:29:25.813 [main] DEBUG o.s.b.f.s.DefaultListableBeanFactory - Creating instance of bean 'userDao'我被初始化了，UserDao16:29:25.814 [main] DEBUG o.s.b.f.s.DefaultListableBeanFactory - Finished creating instance of bean 'userDao'16:29:25.814 [main] INFO  org.itstack.interview.test.ApiTest - 获取 Bean：org.itstack.interview.UserDao@2f490758
  ``` 
  
   
   
    
     
     目的：获取单例下的原型模式，每次获取都要有新的对象产生。 
     
    
     
     使用：其实核心在于 ApplicationContextAware 的使用和 
      
 ```java 
  scope="prototype"
  ``` 
  配置，Spring 内部实现为使用 Cglib 方法，重新生成子类，重写配置的方法和返回对象，达到动态改变的效果。 
     
   
   
  ##### 2. 接口类 
   
  ###### 2.1 FactoryBean 
  测试类 
   
 ```java 
  public class MyFactoryBean implements FactoryBean<UserDao> {    @Override    public UserDao getObject() throws Exception {        return new UserDao();    }    @Override    public Class<?> getObjectType() {        return UserDao.class;    }    @Override    public boolean isSingleton() {        return true;    }    }
  ``` 
  
  xml配置 
   
 ```java 
  <bean id="userDao" class="org.itstack.interview.MyFactoryBean"/>
  ``` 
  
  单元测试 
   
 ```java 
  @Testpublic void test_factory_bean() {    BeanFactory beanFactory = new ClassPathXmlApplicationContext("spring-config-factory-bean.xml");    logger.info("获取 Bean：{}", beanFactory.getBean("userDao"));}
  ``` 
  
  测试结果 
   
 ```java 
  23:36:19.339 [main] INFO  org.itstack.interview.test.ApiTest - 获取 Bean：org.itstack.interview.UserDao@3bd94634
  ``` 
  
   
   
    
     
     目的：用于生成 Bean 的 Bean，叫 FactoryBean 
     
    
     
     使用：其实这个使用在上一章节关于 Bean 如何注入到 Spring 已经提到过，在一些ORM框架、RPC-Starter等都有所应用。 
     
   
   
  ###### 2.2 BeanPostProcessor 
  测试类 
   
 ```java 
  public class MyBeanPostProcessor implements BeanPostProcessor {    @Override    public Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException {        System.out.println("初始化前：" + beanName);        return bean;    }    @Override    public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {        System.out.println("初始化后：" + beanName);        return bean;    }    }
  ``` 
  
  xml配置 
   
 ```java 
  <bean id="beanPostProcessor" class="org.itstack.interview.MyBeanPostProcessor"/><bean id="userDao" class="org.itstack.interview.UserDao"/>
  ``` 
  
  单元测试 
   
 ```java 
  @Testpublic void test_bean_post_processor() {    BeanFactory beanFactory = new ClassPathXmlApplicationContext("spring-config-bean-post-processor.xml");}
  ``` 
  
  测试结果 
   
 ```java 
  初始化前：userDao初始化后：userDao16:38:32.686 [main] DEBUG o.s.b.f.s.DefaultListableBeanFactory - Finished creating instance of bean 'userDao'
  ``` 
  
   
   
    
     
     目的：拿到 Bean 对象初始化前后的动作，做相应的处理 
     
    
     
     使用：BeanPostProcessor 是 Spring 框架的扩展接口类，通过对这个接口的实现，就可以在 Bean 实例化的过程中做相关的动作，比如拦截以后发布到注册中心等。AOP 的操作也是通过 BeanPostProcessor 和 IOC 容器建立起联系。 
     
   
   
  ###### 2.3 BeanFactoryAware 
  测试类 
   
 ```java 
  public class MyBeanFactoryAware implements BeanFactoryAware {    @Override    public void setBeanFactory(BeanFactory beanFactory) throws BeansException {            }}
  ``` 
  
   
   
    
     
     目的：用于获取运行时 Bean 的配置信息 
     
    
     
     使用：BeanFactoryAware 的实现类可以拿到 beanFactory，也就获取到了bean的上下文信息，此时你想获取一些对象的属性就非常容易了。 
     
   
   
  #### 四、总结 
   
    
    
      以上我们介绍了 Spring IOC 的常用配置特性和接口，虽然现在大家可能已经很少会使用 xml 配置对象，基本都是注解的方式。但在这些注解的背后依然会有相应的通用核心原理实现，只有把这部分知识总结清楚并学习源码，才能更好的理解注解的使用是如何处理这些配置的。 
     
    
    
      关于接口的类使用，FactoryBean、BeanPostProcessor、BeanFactoryAware、ApplicationContextAware，在日常的业务流程开发中几乎接触不到，但如果要做一些核心的组件设计或者是中间件的开发，就会使用的非常频繁。如果对这部分知识的运用不了解，可以参考： 
     《SpringBoot 中间件设计和开发》 
     
    
    
      后续会围绕这些知识点来给大家介绍一些源码的学习以及应用层的处理，Bean的创建、循环依赖的三级缓存解决方案等。也希望大家在学习的过程中要多总结、思考、记录，一点点的把知识栈建设完整。 
     
   
   
  #### 五、系列推荐 
   
    
     
     小伙伴美团一面的分享和分析 
     
    
     
     你说，怎么把Bean塞到Spring容器？ 
     
    
     
     除了JDK、CGLIB，还有3种类代理方式？面试又卡住！ 
     
    
     
     半年招聘筛选了400+份简历，告诉你怎么写容易被撩！ 
     
    
     
     SpringBoot 中间件设计和开发 
     
   
  
  
  - END - 
   
  下方扫码关注 bugstack虫洞栈，与小傅哥一起学习成长、共同进步，做一个码场最贵Coder！ 
   
    
     
     回复【设计模式】，下载《重学Java设计模式》，这是一本互联网真实案例的实践书籍，从实际业务中抽离出，交易、营销、秒杀、中间件、源码等众多场景进行学习代码设计。 
     
    
     
     回复【面经手册】，下载《面经手册 • 拿大厂Offer》，这是一本有深度的Java核心内容，从数据结构、算法、并发编程以及JVM系8不断深入讲解，让懂了就是真的懂。 
     
   
  ![Test](https://oscimg.oschina.net/oscnet/b6fed775-8f93-412b-a09f-bc9f41e8c4f1.png  '面经手册 · 第29篇《Spring IOC 特性有哪些，不会读不懂源码！》') 
   
   你好，我是小傅哥。一线互联网 
    
 ```java 
  java
  ``` 
  
   工程师、架构师，开发过交易&营销、写过运营&活动、设计过中间件也倒腾过中继器、IO板卡。不只是写Java语言，也搞过C#、PHP，是一个技术活跃的折腾者。 
    
   
   
   2020年写了一本PDF 
   《重学Java设计模式》 
   ，全网下载量30万+，帮助很多同学成长。同年 github 的两个项目， 
    
 ```java 
  CodeGuide
  ``` 
  
   、 
    
 ```java 
  itstack-demo-design
  ``` 
  
   ，持续霸榜 Trending，成为全球热门项目。 
   
  
 
本文分享自微信公众号 - bugstack虫洞栈（bugstack）。如有侵权，请联系 support@oschina.cn 删除。本文参与“OSC源创计划”，欢迎正在阅读的你也加入，一起分享。
                                        