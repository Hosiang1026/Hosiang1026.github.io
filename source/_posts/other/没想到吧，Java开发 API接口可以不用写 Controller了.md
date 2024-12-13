---
title: 推荐系列-没想到吧，Java开发 API接口可以不用写 Controller了
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 2050
cover_picture: 'https://img-blog.csdnimg.cn/20210402132106177.png'
abbrlink: 66373cf3
date: 2021-04-15 09:46:45
---

&emsp;&emsp;本文案例收录在 https://github.com/chengxy-nds/Springboot-Notebook 大家好，我是小富~ 今天介绍我正在用的一款高效敏捷开发工具magic-api，顺便分享一点工作中使用它的心得 缘起 先说一下...
<!-- more -->

                                                                                                                                                                                         
大家好，我是小富~ 
今天介绍我正在用的一款高效敏捷开发工具 
 ```java 
  magic-api
  ``` 
 ，顺便分享一点工作中使用它的心得 
##### 缘起 
先说一下我为什么会使用这个工具？ 
最近新启动一个项目，业务并不算复杂，那种典型的管理系统，产品要求支持全局页面配置化，前端一切相关配置必须通过接口返回，比如：像查询下拉框（启用、禁用）这类简单的条件，国际化，必须做到全动态配置。 
其实只要人手够时间够，这些都没问题，但问题就在于立项到上线周期就给十几�����而开发时间满打满算不到10来天，时间紧又不给加人，底层程序员的生活真是太难了。 
![Test](https://img-blog.csdnimg.cn/20210402132106177.png  '没想到吧，Java开发 API接口可以不用写 Controller了') 
不过办法总比困难多，前同事老哥给我推荐了这个工具，然后就真香了，哈哈~ 
![Test](https://img-blog.csdnimg.cn/20210402132106177.png  '没想到吧，Java开发 API接口可以不用写 Controller了') 
 
 ```java 
  magic-api
  ``` 
  是一个基于Java的接口快速开发框架，编写接口将通过 
 ```java 
  magic-api
  ``` 
 提供的 
 ```java 
  UI
  ``` 
 界面完成，自动映射为HTTP接口，无需定义 
 ```java 
  Controller
  ``` 
 、 
 ```java 
  Service
  ``` 
 、 
 ```java 
  Dao
  ``` 
 、 
 ```java 
  Mapper
  ``` 
 、 
 ```java 
  XML
  ``` 
 、 
 ```java 
  VO
  ``` 
 等Java对象即可完成常见的HTTP API接口开发。 
上边是官方对工具的介绍，但好像还是没明白它是干什么的，接下来咱们演示一下，你就会觉得它很哇塞了 
##### 环境 
首先 
 ```java 
  pom.xml
  ``` 
  引入 
 ```java 
  magic-api
  ``` 
 核心包 
 ```java 
  magic-api-spring-boot-starter
  ``` 
  
 
 ```java 
    <dependency>
      <groupId>org.ssssssss</groupId>
      <artifactId>magic-api-spring-boot-starter</artifactId>
      <version>0.7.1</version>
  </dependency>

  <dependency>
      <groupId>mysql</groupId>
      <artifactId>mysql-connector-java</artifactId>
      <scope>runtime</scope>
  </dependency>

  ``` 
  
 
 ```java 
  application.yml
  ``` 
  配置更简单，数据库（没数据库操作可以不写）和 
 ```java 
  magic-api
  ``` 
 的基础信息 
 
 ```java 
  magic-api:
  web: /magic/web # UI请求的界面以及UI服务地址
server:
  port: 9999
spring:
  datasource:
    driver-class-name: com.mysql.jdbc.Driver
    password: xinzhifu521
    url: jdbc:mysql://47.93.6.5:3306/magic-api
    username: root
    

  ``` 
  
好了~ 到这环境就搭建完成！ 
 
在具体演示之前先吐槽一下用Java开发API的缺点，首当其冲的就是啰嗦，尤其是在工期紧，功能需快速迭代的时候，既要严格执行开发规范，又不能耽误工期，即便最简单的一个API接口，也要写对应的  
 ```java 
  Controller
  ``` 
 、 
 ```java 
  Service
  ``` 
 、 
 ```java 
  Dao
  ``` 
 、 
 ```java 
  Mapper
  ``` 
 、 
 ```java 
  DTO
  ``` 
 、 
 ```java 
  VO
  ``` 
 等类，尽管这些基础编码有对应的代码生成器，但维护起来还是相当麻烦， 
 ```java 
  magic-api
  ``` 
 起到一个很好的辅助作用，少写了很多代码。 
##### 实践 
直接访问 
 ```java 
  http://127.0.0.1:9999/magic/web
  ``` 
 打开 
 ```java 
  magic-api
  ``` 
 可视化界面，看到如下的界面。 
![Test](https://img-blog.csdnimg.cn/20210402132106177.png  '没想到吧，Java开发 API接口可以不用写 Controller了') 创建一个分组，其中 
 ```java 
  分组前缀
  ``` 
 为一组API接口的访问根目录，相当于 
 ```java 
  @Controller("/order")
  ``` 
 注解。 ![Test](https://img-blog.csdnimg.cn/20210402132106177.png  '没想到吧，Java开发 API接口可以不用写 Controller了') 接着在分组中创建接口  
 ```java 
  order_detail
  ``` 
 ，页面配置接口的基础信息，接口名称、请求路径、请求方法、请求参数、请求header等，接口直接 
 ```java 
  return
  ``` 
 返回内容 
 
 ```java 
  return ‘小富最帅’

  ``` 
  
![Test](https://img-blog.csdnimg.cn/20210402132106177.png  '没想到吧，Java开发 API接口可以不用写 Controller了') 
在页面访问刚刚创建接口的全路径  
 ```java 
  http://127.0.0.1:9999/order/order_detail
  ``` 
  ，发现已经成功返回数据。 
![Test](https://img-blog.csdnimg.cn/20210402132106177.png  '没想到吧，Java开发 API接口可以不用写 Controller了') 也可以直接拼 
 ```java 
  JSON
  ``` 
 格式数据直接返回 
![Test](https://img-blog.csdnimg.cn/20210402132106177.png  '没想到吧，Java开发 API接口可以不用写 Controller了') 
如果URL传参  
 ```java 
  /order_detail/{id}
  ``` 
 ，导入 
 ```java 
  request
  ``` 
 模块获取参数 
 
 ```java 
  import request;
a = path.id

  ``` 
  
到这一个简单的API接口就开发完了，而此时我们还未在项目中写一行代码 
![Test](https://img-blog.csdnimg.cn/20210402132106177.png  '没想到吧，Java开发 API接口可以不用写 Controller了') 但上边只是静态数据，在实际开发中往往要与数据库打交道， 
 ```java 
  magic-api
  ``` 
 提供了一些类似于 
 ```java 
  python
  ``` 
 开发中的模块化组件，例如引入 
 ```java 
  import db
  ``` 
  模块，直接执行 
 ```java 
  SQL
  ``` 
 语句会返回 
 ```java 
  JSON
  ``` 
 格式数据，省略了很多中间步骤。 ![Test](https://img-blog.csdnimg.cn/20210402132106177.png  '没想到吧，Java开发 API接口可以不用写 Controller了')  
 ```java 
  magic-api
  ``` 
 语法与 
 ```java 
  Java
  ``` 
 的差异不大，不过更加精简了一些，只要写过Java对它学习成本并不高，比如常用得 
 ```java 
  for
  ``` 
 循环，也会有普通和 
 ```java 
  lambda
  ``` 
 多种写法。 
 
 ```java 
  var sum = 0;
var list = [1,2,3,4,5];
for(val in list){
    sum = sum + val;
}

list.each(it => sum+= it + 1)

  ``` 
  
这里我只简单的介绍了使用，还有很多高级特性，比如：调用 
 ```java 
  Java API
  ``` 
 、集成 
 ```java 
  redis
  ``` 
 、 
 ```java 
  Mongo
  ``` 
 等，感兴趣的同学自己看下官方文档吧，它还提供了很多语法 
 ```java 
  demo
  ``` 
 ，拿来即用就好。 
地址： 
 ```java 
  http://140.143.210.90:9999/magic/web/index.html
  ``` 
  
##### 心得 
 
 ```java 
  magic-api
  ``` 
 在我整个项目赶工期的过程中可谓是居功至伟，节省了一大半的开发时间，不仅后端开发接口效率显著提升，对前端联调帮助也很大。 
前后端从开始就定义好数据结构，后端快速提供静态数据接口，前端用真实接口联调，后端补充完业务逻辑后无缝替换成真实数据，这样做到同步开发，前端也不用只写伪代码等接口联调了。 
 
 ```java 
  magic-api
  ``` 
 虽然可以提高开发效率，但是实际应用中我也只敢把它用在一些逻辑相对简单，偏配置类接口，再有就是为前端快速提供静态接口，核心业务还是要按“规矩”办事，毕竟系统稳定、安全才是最重要的。 
 
![Test](https://img-blog.csdnimg.cn/20210402132106177.png  '没想到吧，Java开发 API接口可以不用写 Controller了')
                                        