---
title: 推荐系列-开篇-在Spring生态中玩转RocketMQ
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 737
cover_picture: ''
abbrlink: ec53255c
date: 2021-04-15 09:16:07
---

&emsp;&emsp;简介： 开篇：在Spring生态中玩转RocketMQ Apache RocketMQ 作为阿里开源的业务消息的首选，通过双11业务打磨，在消息和流处理领域被广泛应用。而微服务生态Spring框架也是业务开发中最受开发...
<!-- more -->

                                                                                                                                                                                        简介： 开篇：在Spring生态中玩转RocketMQ 
Apache RocketMQ 作为阿里开源的业务消息的首选，通过双11业务打磨，在消息和流处理领域被广泛应用。而微服务生态Spring框架也是业务开发中最受开发者欢迎的框架之一，两者的完美契合使得RocketMQ成为Spring Messaing实现中最受欢迎的消息实现。 
  
在Spring生态中使用RocketMQ到底有多少种方式？他们各自适用于什么场景？各自有什么优劣势？ 
如何开始实战？本书将一一解答。 
  
我们先会带领各位开发者： 
 
 回顾罗美琪（RocketMQ）和春波特（SpringBoot）故事开始的时候，rocketmq-spring经过6个多月的孵化，作为Apache RocketMQ的子项目正式毕业。 
 回顾rocketmq-spring毕业后的两年，是如何成为Spring 生态中最受欢迎的 messaging 实现的？ 
 
  
最后将通过图文和实操地方式带来给位开发者玩转在Spring生态中使用RocketMQ的三种主流方式。 
 
 ![Test](https://mp.toutiao.com/mp/agw/article_material/open_image/get?code=MzNiOGE0NjQyM2VjN2JiN2ZiNzk4ZDdhZGE5NGEwYTIsMTYxODM2OTYwNTc4Mg==  '开篇-在Spring生态中玩转RocketMQ') 
 
所有动手实操的部分大家可以登录start.aliyun.com知行动手实验室免费体验。 
  
开卷有益，希望各位开发者通过阅读本书、动手实操有所收获。 
  
  
 
### RocketMQ与Spring的碰撞 
  
在介绍RocketMQ与Spring故事之前，不得不提到Spring中的两个关于消息的框架，Spring Messaging和Spring Cloud Stream。它们都能够与Spring Boot整合并提供了一些参考的实现。和所有的实现框架一样，消息框架的目的是实现轻量级的消息驱动的微服务，可以有效地简化开发人员对消息中间件的使用复杂度，让系统开发人员可以有更多的精力关注于核心业务逻辑的处理。 
  
 
### Spring Messaging 
  
Spring Messaging是Spring Framework 4中添加的模块，是Spring与消息系统集成的一个扩展性的支持。它实现了从基于JmsTemplate的简单的使用JMS接口到异步接收消息的一整套完整的基础架构，Spring AMQP提供了该协议所要求的类似的功能集。 在与Spring Boot的集成后，它拥有了自动配置能力，能够在测试和运行时与相应的消息传递系统进行集成。 
单纯对于客户端而言，Spring Messaging提供了一套抽象的API或者说是约定的标准，对消息发送端和消息接收端的模式进行规定，比如消息 Messaging 对应的模型就包括一个消息体 Payload 和消息头 Header。不同的消息中间件提供商可以在这个模式下提供自己的Spring实现：在消息发送端需要实现的是一个XXXTemplate形式的Java Bean，结合Spring Boot的自动化配置选项提供多个不同的发送消息方法；在消息的消费端是一个XXXMessageListener接口（实现方式通常会使用一个注解来声明一个消息驱动的POJO），提供回调方法来监听和消费消息，这个接口同样可以使用Spring Boot的自动化选项和一些定制化的属性。 
  
 
 ![Test](https://mp.toutiao.com/mp/agw/article_material/open_image/get?code=MzNiOGE0NjQyM2VjN2JiN2ZiNzk4ZDdhZGE5NGEwYTIsMTYxODM2OTYwNTc4Mg==  '开篇-在Spring生态中玩转RocketMQ') 
 
  
在Apache RocketMQ生态中，RocketMQ-Spring-Boot-Starter（下文简称RocketMQ-Spring）就是一个支持Spring Messaging API标准的项目。该项目把RocketMQ的客户端使用Spring Boot的方式进行了封装，可以让用户通过简单的annotation和标准的Spring Messaging API编写代码来进行消息的发送和消费，也支持扩展出RocketMQ原生API来支持更加丰富的消息类型。在RocketMQ-Spring毕业初期，RocketMQ社区同学请Spring社区的同学对RocketMQ-Spring代码进行review，引出一段罗美琪（RocketMQ）和春波特（Spring Boot）故事的佳话[1]，著名Spring布道师Josh Long向国外同学介绍如何使用RocketMQ-Spring收发消息[2]。RocketMQ-Spring也在短短两年时间超越Spring-Kafka和Spring-AMQP（注:两者均由Spring社区维护），成为Spring Messaging生态中最活跃的消息项目。 
  
 
 ![Test](https://mp.toutiao.com/mp/agw/article_material/open_image/get?code=MzNiOGE0NjQyM2VjN2JiN2ZiNzk4ZDdhZGE5NGEwYTIsMTYxODM2OTYwNTc4Mg==  '开篇-在Spring生态中玩转RocketMQ') 
 
  
 
### Spring Cloud Stream 
  
Spring Cloud Stream结合了Spring Integration的注解和功能，它的应用模型如下： 
  
 
 ![Test](https://mp.toutiao.com/mp/agw/article_material/open_image/get?code=MzNiOGE0NjQyM2VjN2JiN2ZiNzk4ZDdhZGE5NGEwYTIsMTYxODM2OTYwNTc4Mg==  '开篇-在Spring生态中玩转RocketMQ') 
 
  
Spring Cloud Stream框架中提供一个独立的应用内核，它通过输入(@Input)和输出(@Output)通道与外部世界进行通信，消息源端(Source)通过输入通道发送消息，消费目标端(Sink)通过监听输出通道来获取消费的消息。这些通道通过专用的Binder实现与外部代理连接。开发人员的代码只需要针对应用内核提供的固定的接口和注解方式进行编程，而不需要关心运行时具体的Binder绑定的消息中间件。 
  
在运行时，Spring Cloud Stream能够自动探测并使用在classpath下找到的Binder。这样开发人员可以轻松地在相同的代码中使用不同类型的中间件：仅仅需要在构建时包含进不同的Binder。在更加复杂的使用场景中，也可以在应用中打包多个Binder并让它自己选择Binder，甚至在运行时为不同的通道使用不同的Binder。 
  
Binder抽象使得Spring Cloud Stream应用可以灵活的连接到中间件，加之Spring Cloud Stream使用利用了Spring Boot的灵活配置配置能力，这样的配置可以通过外部配置的属性和Spring Boot支持的任何形式来提供（包括应用启动参数、环境变量和application.yml或者application.properties文件），部署人员可以在运行时动态选择通道连接destination（例如，RocketMQ的topic或者RabbitMQ的exchange）。 
  
Spring Cloud Stream 屏蔽了底层消息中间件的实现细节，希望以统一的一套 API 来进行消息的发送/消费，底层消息中间件的实现细节由各消息中间件的 Binder 完成。Spring官方实现了Rabbit binder和Kafka Binder。Spring Cloud Alibaba实现了RocketMQ Binder[3]，其主要实现原理是把发送消息最终代理给了RocketMQ-Spring的RocketMQTemplate，在消费端则内部会启动RocketMQ-Spring Consumer Container 来接收消息。以此为基础，Spring Cloud Alibaba还实现了Spring Cloud Bus RocketMQ， 用户可以使用RocketMQ作为Spring Cloud 体系内的消息总线，来连接分布式系统的所有节点。通过Spring Cloud Stream RocketMQ Binder，RocketMQ可以与Spring Cloud生态更好的结合。比如与 Spring Cloud Data Flow、Spring Cloud Funtion结合，让RocketMQ可以在Spring流计算生态、Serverless(FaaS)项目中被使用。 
  
如今Spring Cloud Stream RocketMQ Binder和Spring Cloud Bus RocketMQ做为Spring Cloud Alibaba的实现已登陆Spring的官网[4]，Spring Cloud Alibaba也成为Spring Cloud 最活跃的实现。 
  
 
### 如何在Spring生态中选择RocketMQ实现？ 
  
通过介绍Spring中的消息框架，介绍了以RocketMQ为基础与Spring消息框架结合的几个项目，主要是RocketMQ-Spring、Spring Cloud Stream RocketMQ Binder、Spring Cloud Bus RocketMQ、Spring Data Flow和Spring Cloud Function。它们之间的关系可以如下图表示。 
  
 
 ![Test](https://mp.toutiao.com/mp/agw/article_material/open_image/get?code=MzNiOGE0NjQyM2VjN2JiN2ZiNzk4ZDdhZGE5NGEwYTIsMTYxODM2OTYwNTc4Mg==  '开篇-在Spring生态中玩转RocketMQ') 
 
  
如何在实际业务开发中选择相应项目进行使用？下表列出了每个项目的特点和使用场景。 
  
 
  
   
    项目  
    特点  
    使用场景  
   
   
    RocketMQ-Spring  
    1.作为起步依赖，简单引入一个包就能在Spring生态用到RocketMQ客户端的所有功能。   2.利用了大量自动配置和注解简化了编程模型，并且支持Spring Messaging API   3.与RocketMQ 原生Java SDK的功能完全对齐  
    适合在Spring Boot中使用RocketMQ的用户，希望能用到RocketMQ原生java客户端的所有功能，并通过Spring注解和自动配置简化编程模型。  
   
   
    Spring Cloud Stream RocketMQ Binder  
    1.屏蔽底层 MQ 实现细节，上层 Spring Cloud Stream 的 API 是统一的。如果想从 Kafka 切到 RocketMQ，直接改个配置即可。   2.与 Spring Cloud 生态整合更加方便。比如 Spring Cloud Data Flow，这上面的流计算都是基于 Spring Cloud Stream；Spring Cloud Bus 消息总线内部也是用的 Spring Cloud Stream。   3.Spring Cloud Stream 提供的注解，编程体验都是非常棒。  
    在代码层面能完全屏蔽底层消息中间件的用户，并且希望能项目能更好的接入Spring Cloud 生态（Spring Cloud Data Flow、Spring Cloud Funtcion等）。  
   
   
    Spring Cloud Bus RocketMQ  
    将RocketMQ 作为事件的“传输器”，通过发送事件（消息）到消息队列上，从而广播到订阅该事件（消息）的所有节点上。完成事件的分发和通知。  
    在Spring生态中希望用RocketMQ做消息总线的用户，可以用在应用间事件的通信，配置中心客户端刷新等场景  
   
   
    Spring Cloud Data Flow  
    以 Source/Processor/Sink 组件进行流式任务处理。RocketMQ 作为流处理过程中的中间存储组件  
    流处理，大数据处理场景  
   
   
    Spring Cloud Function  
    消息的消费/生产/处理都是一次函数调用，融合 Java 生态的 Function 模型  
    Serverless 场景  
   
  
 
  
RocketMQ作为业务消息的首选，在消息和流处理领域被广泛应用。而微服务生态Spring框架也是业务开发中最被，两者的完美契合使得RocketMQ成为Spring Messaing实现中最受欢迎的消息实现。书的后半部分讲给各位开发者详细讲述在Spring生态中使用RocketMQ的三种主流的方式。 
本文为阿里云原创内容，未经允许不得转载。 
 
                                        