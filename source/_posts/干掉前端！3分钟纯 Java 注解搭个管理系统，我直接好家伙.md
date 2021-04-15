---
title: 推荐系列-干掉前端！3分钟纯 Java 注解搭个管理系统，我直接好家伙
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 1952
cover_picture: 'https://img-blog.csdnimg.cn/20210323130333473.png'
abbrlink: 56f7a6ec
date: 2021-04-15 09:46:45
---

&emsp;&emsp;大家好，我是小富~ 最近接触到个新项目，发现它用了一个比较有意思的框架，可以说实现了我刚入行时候的梦想，所以这里马不停蹄的和大家分享下。 在我刚开始工作接触的项目都还没做前后端分离...
<!-- more -->

                                                                                                                                                                                        大家好，我是小富~ 
最近接触到个新项目，发现它用了一个比较有意思的框架，可以说实现了我刚入行时候的梦想，所以这里马不停蹄的和大家分享下。 
在我刚开始工作接触的项目都还没做前后端分离，经常需要后端来维护页面，有时候觉得自己好像天生不适合干前端，你要是让我研究研究后端的技术，看个中间件源码啊，分析分析什么框架底层原理啊，这都问题不大，偶尔搞一下 
 ```java 
  JS
  ``` 
 也可以。你要是让我写个 
 ```java 
  css
  ``` 
 样式，那简直要命了，一点也提不起兴趣，不知道有没有跟我一样的。 
![Test](https://img-blog.csdnimg.cn/20210323130333473.png  '干掉前端！3分钟纯 Java 注解搭个管理系统，我直接好家伙') 
今天要介绍的框架直接不用写页面了，话不多说，下边咱们直奔主题 
 
 ```java 
  Erupt
  ``` 
 一个通用后台管理框架，据说有 超低代码量、 零前端代码、零 CURD操作、无需建表，纯Java注解开发等特色，号称三分钟就可以搭建一个完整的后台管理系统。 
额~ 听着好像还挺流批的，到底是不是有这么魔幻，咱们一起用起来感受下。 
首先来搭建一下环境，目前 
 ```java 
  Erupt
  ``` 
 支持 
 ```java 
  Java
  ``` 
 版本 
 ```java 
  1.8.0
  ``` 
 及以上、 
 ```java 
  Spring Boot
  ``` 
 版本 
 ```java 
  2.0
  ``` 
 及其以上。 
搭建easy 
 
 ```java 
  pom.xml
  ``` 
 引入必要的 
 ```java 
  jar
  ``` 
 包 
 
 ```java 
      <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter</artifactId>
        </dependency>
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
        </dependency>
        <!--用户权限管理-->
        <dependency>
            <groupId>xyz.erupt</groupId>
            <artifactId>erupt-upms</artifactId>
            <version>1.6.7</version>
        </dependency>
        <!--接口数据安全-->
        <dependency>
            <groupId>xyz.erupt</groupId>
            <artifactId>erupt-security</artifactId>
            <version>1.6.7</version>
        </dependency>
        <!--后台WEB界面-->
        <dependency>
            <groupId>xyz.erupt</groupId>
            <artifactId>erupt-web</artifactId>
            <version>1.6.7</version>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-tomcat</artifactId>
            <scope>compile</scope>
        </dependency>
    </dependencies>

  ``` 
  
 
 ```java 
  application.yml
  ``` 
  文件只要简单配置数据源就好，提前准备个数据库，说到数据库这里我说个小插曲。 
我之前在 
 ```java 
  Github
  ``` 
  提交案例代码的时候（ 
 ```java 
  https://github.com/chengxy-nds/Springboot-Notebook
  ``` 
  ），由于没太注意没屏蔽敏感信息，导致云数据库账号泄露了，最近我发现已经有小伙伴在数据库上跑项目了，仔细看了看里边的数据结构，发现像是个毕设项目。 
![Test](https://img-blog.csdnimg.cn/20210323130333473.png  '干掉前端！3分钟纯 Java 注解搭个管理系统，我直接好家伙') 
本身这个库就是我跑 
 ```java 
  demo
  ``` 
 案例的一个测试库，为的就是让小伙伴能把更多时间放在研究案例的技术点上，减少搭建环境这种没技术含量的琐碎事。 
发现归发现，这里我没改密码，也没删他们的库，如果你要用就继续用着，但玩归玩，闹归闹，你不能乱动不是你的数据！影响其他人学习就不好了。 
 
 ```java 
  spring:
  datasource:
    url: jdbc:mysql://47.93.6.5:3306/erupt2?useUnicode=true&characterEncoding=UTF-8&serverTimezone=Asia/Shanghai
    username: root
    password: 123456
  jpa:
    show-sql: true
    generate-ddl: true
    database-platform: org.hibernate.dialect.MySQL5InnoDBDialect
    database: mysql
  profiles:
    active: dev
  mail:
    username: xxxx@qq.com
    password: xxxxxxx
    host: smtp.qq.com
    properties:
      mail.smtp.ssl.auth: true
      mail.smtp.ssl.enable: true
      mail.smtp.ssl.required: true
server:
  port: 8888

  ``` 
  
说了点题外话，我们继续搞起~ 
其实到这 
 ```java 
  Erupt
  ``` 
 的环境就搭建完了，额~ ，这就完了？ 
咱们什么也没干，项���是个空壳子，一行代码也没写，好像连个表也没建啊！ 
![Test](https://img-blog.csdnimg.cn/20210323130333473.png  '干掉前端！3分钟纯 Java 注解搭个管理系统，我直接好家伙') 
别着急咱们先启动下项目，看到控制台打印出很多建表语句和插���语句，这是因为 
 ```java 
  Erupt
  ``` 
 框架底层应用 
 ```java 
  JPA
  ``` 
 持久化，预置创建了一些系统表和数据。 
![Test](https://img-blog.csdnimg.cn/20210323130333473.png  '干掉前端！3分钟纯 Java 注解搭个管理系统，我直接好家伙') 
注意： 
 ```java 
  Erupt
  ``` 
 预置表只会随项目第一次启动构建一次，如果想重新创建，需删除 
 ```java 
  .Erupt
  ``` 
 文件（一般在项目的工作空间内），获取文件位置方式 
 
 ```java 
  System.getProperty("user.dir")

  ``` 
  
再看数据库里创建了16张系统表，其中 
 ```java 
  e_upms_user
  ``` 
 表是用户表，默认只有一个管理员账号，用户名、密码都是 
 ```java 
  erupt
  ``` 
 。 
![Test](https://img-blog.csdnimg.cn/20210323130333473.png  '干掉前端！3分钟纯 Java 注解搭个管理系统，我直接好家伙') 
紧接着我们访问 
 ```java 
  http://127.0.0.1:8888/
  ``` 
 ，看一下是个什么效果，竟然有个完整的登录页面。 
![Test](https://img-blog.csdnimg.cn/20210323130333473.png  '干掉前端！3分钟纯 Java 注解搭个管理系统，我直接好家伙') 
用上边的用户名、密码直接登录， 
 ```java 
  erupt
  ``` 
 已经预先实现了完整的权限控等功能，而到这我们几乎是没写过什么代码的，都是框架封装好了的，菜单类数据全部从数据库动态获取，一个基础的后台管理系统就搭建完了，有点哇塞。 
![Test](https://img-blog.csdnimg.cn/20210323130333473.png  '干掉前端！3分钟纯 Java 注解搭个管理系统，我直接好家伙') 
有趣的页面 
那么问题来了？想要自定义页面怎么办？ 
开篇我们就说过 
 ```java 
  erupt
  ``` 
 是零前端代码，全部基于 
 ```java 
  Java
  ``` 
 注解开发的，接下来用 
 ```java 
  Java
  ``` 
 注解写个简单页面体验下。 
 
 ```java 
  erupt
  ``` 
 有两个核心注解 
 ```java 
  @Erupt
  ``` 
 ， 
 ```java 
  @EruptField
  ``` 
  
 
  
 ```java 
  @Erupt
  ``` 
 注解修饰类，代表定义一个页面 
  
 ```java 
  @EruptField
  ``` 
 注解修饰字段，代表页面上显示的字段名 
  
 ```java 
  @Power
  ``` 
 注解控制是否操作按钮，增、删、改、查、导入、导出等 
  
 ```java 
  @Search
  ``` 
 注解表示字段为搜索条件 
  
 ```java 
  @Table
  ``` 
 注解表示页面取数据对应的表，如果不设置，页面第一次初始化的时候，会根据类字段值自动创建一张和类名一致的表名。 
 
 
下边我们定义一个 
 ```java 
  Student
  ``` 
 类，加上 
 ```java 
  @Erupt
  ``` 
 ， 
 ```java 
  @EruptField
  ``` 
 注解，这样页面和元素就算写完了，是不是有点颠覆认知。 
 
 ```java 
  /*
 *  @Erupt注解修饰在类上，@EruptField注解修饰在字段上
 *  其他注解均为Jpa注解
 */
@Getter
@Setter
@Erupt(name = "学生表",
        power = @Power(importable = true, export = true)
)
@Entity
//@Table(name = "t_student")
public class Student extends BaseModel {

    @EruptField(
            views = @View(title = "学生姓名"),
            edit = @Edit(title = "学生姓名", notNull = true, search = @Search(vague = true))
    )
    private String studentName;

    @EruptField(
            views = @View(title = "所属班级"),
            edit = @Edit(title = "所属班级", notNull = true)
    )
    private String studentClass;

    @EruptField(
            views = @View(title = "学生年龄"),
            edit = @Edit(title = "学生年龄", notNull = true)
    )
    private String studentAge;

    @Lob
    @EruptField(
            views = @View(title = "学生性别"),
            edit = @Edit(title = "学生性别", notNull = true)
    )
    private String studentSex;

    @EruptField(
            views = @View(title = "考核状态"),
            edit = @Edit(title = "考核状态", notNull = true, boolType = @BoolType(trueText = "通过", falseText = "挂科"), search = @Search)
    )
    private Boolean status;
}

  ``` 
  
但此时新创建的页面不会显示出来，还需要我们手动做一个映射关系，在菜单维护中自定义个��单，类型值一定要为新建的 类名  
 ```java 
  Student
  ``` 
 。 
![Test](https://img-blog.csdnimg.cn/20210323130333473.png  '干掉前端！3分钟纯 Java 注解搭个管理系统，我直接好家伙') 
保存刷新后会看到我们的新页面出现了，而且页面的功能很完整，基础操作、查询、导入、导出功能都自动实现了。 
![Test](https://img-blog.csdnimg.cn/20210323130333473.png  '干掉前端！3分钟纯 Java 注解搭个管理系统，我直接好家伙') 
页面新增一个学生信息，对应的 
 ```java 
  Student
  ``` 
 表也多了条记录，而这个持久化的过程完全由框架来做。 
![Test](https://img-blog.csdnimg.cn/20210323130333473.png  '干掉前端！3分钟纯 Java 注解搭个管理系统，我直接好家伙') 
尽管 
 ```java 
  Erupt
  ``` 
  框架对前后端代码做了深度封装，但它提供了丰富灵活的自定义接口，来满足我们的个性化需求。 
比如我们在录入新学生信息时，希望屏蔽名字为 
 ```java 
  张三
  ``` 
 的同学，可以对页面按钮功能做代理 
 ```java 
  dataProxy
  ``` 
 ，实现自定义的逻辑，对哪个按钮代理就实现对应方法即可，如 
 ```java 
  beforeAdd
  ``` 
 、 
 ```java 
  afterAdd
  ``` 
 是对新增按钮的代理。 
 
 ```java 
  @Getter
@Setter
@Erupt(name = "��生表",dataProxy = {StudentDataProxy.class},
        power = @Power(importable = true, export = true)
)
@Entity
//@Table(name = "t_student")
public class Student extends BaseModel {

}
public class StudentDataProxy implements DataProxy<Student> {

    @Override
    public void beforeAdd(Student student) {
        //后台字段校验
        if ("张三".equals(student.getStudentName())) {
            throw new EruptApiErrorTip("名称禁止为张三！");
        }
    }

    @Override
    public void afterAdd(Student student) {

    }
    @Override
    public void afterUpdate(Student student) {

    }

    @Override
    public void afterDelete(Student student) {
    }
 }

  ``` 
  
当我们在页面录入名字为 
 ```java 
  张三
  ``` 
 的同学时，成功屏蔽。其他类似的功能还有很多，这里就不一一举例了，看文档看文档~ 
![Test](https://img-blog.csdnimg.cn/20210323130333473.png  '干掉前端！3分钟纯 Java 注解搭个管理系统，我直接好家伙') 
如果我们想要按传统的方式开发接口，不用担心会和 
 ```java 
  Erupt
  ``` 
 的页面生成规则有冲突，丝毫不会受影响。而且 
 ```java 
  Erupt
  ``` 
 内部集成了 
 ```java 
  JPA
  ``` 
 ，提供了现成的 
 ```java 
  dao
  ``` 
 接口，只要调用对应API即可上手开发。 
![Test](https://img-blog.csdnimg.cn/20210323130333473.png  '干掉前端！3分钟纯 Java 注解搭个管理系统，我直接好家伙') 
如果你不想手写 
 ```java 
  Java
  ``` 
 代码也没关系， 
 ```java 
  Erupt
  ``` 
 还提供了代码生成器，自定义 
 ```java 
  Java
  ``` 
 类名和字段名，可以生成代码，直接 
 ```java 
  copy
  ``` 
 就行了。 
![Test](https://img-blog.csdnimg.cn/20210323130333473.png  '干掉前端！3分钟纯 Java 注解搭个管理系统，我直接好家伙') 
![Test](https://img-blog.csdnimg.cn/20210323130333473.png  '干掉前端！3分钟纯 Java 注解搭个管理系统，我直接好家伙') 
说到这我只介绍了 
 ```java 
  Erupt
  ``` 
 一丢丢的基础特性，主要是想让小伙伴知道有这么个敏捷利器。 
不仅如此它还支持丰富的数据类型，内置了像定时 
 ```java 
  任务管理
  ``` 
 、 
 ```java 
  多表联合查询
  ``` 
 、 
 ```java 
  前后端分离部署
  ``` 
 、 
 ```java 
  接口权限
  ``` 
 、 
 ```java 
  操作记录
  ``` 
 、 
 ```java 
  多数据源
  ``` 
 、 
 ```java 
  邮件系统
  ``` 
 、 
 ```java 
  黑白名单
  ``` 
 等等很多实用功能，都直接调用API就可以用。 
![Test](https://img-blog.csdnimg.cn/20210323130333473.png  '干掉前端！3分钟纯 Java 注解搭个管理系统，我直接好家伙') 
说在后边 
 
 ```java 
  Erupt
  ``` 
  框架的优点是显而易见的，快捷、高效、上手容易，对新手相当的友好，但在实际生产环境中我只是用它来做一些配置字典类的数据管理。 
因为它的深度封装虽然让开发变的简单高效，可对于业务相对复杂、高度定制的系统来说， 
 ```java 
  Erupt
  ``` 
  框架显得力不从心，更关键的一点，它的社区并不算特别活跃，毕竟是个小众框架。 
不过，技术从来都是服务于业务的，如果你的业务与 
 ```java 
  Erupt
  ``` 
 的气质相匹配，别犹豫，用它！ 
整理了几百本各类技术电子书，送给小伙伴们。关注公号回复【666】自行领取。和一些小伙伴们建了一个技术交流群，一起探讨技术、分享技术资料，旨在共同学习进步，如果感兴趣就加入我们吧！ 
![Test](https://img-blog.csdnimg.cn/20210323130333473.png  '干掉前端！3分钟纯 Java 注解搭个管理系统，我直接好家伙')
                                        