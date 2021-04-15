---
title: 推荐系列-200 行代码告诉你 TDMQ 中 Pulsar 广播如何实现
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 894
cover_picture: 'https://oscimg.oschina.net/oscnet/8c4bfb6d-09c2-428e-a0cd-c8a1ebc14b4e.png'
abbrlink: ced0668c
date: 2021-04-15 09:08:53
---

&emsp;&emsp;导读 Pulsar 作为 Apache 社区的相对新的成员，在业界受到非常大量的关注。新产品的文档相对不齐全也是非常能够理解的。今天客户问过来广播怎么实现的，我解释了半天，又找了很多介绍产品的 ...
<!-- more -->

                                                                                                                                                                                         
  
   
    
    ![Test](https://oscimg.oschina.net/oscnet/8c4bfb6d-09c2-428e-a0cd-c8a1ebc14b4e.png 200 行代码告诉你 TDMQ 中 Pulsar 广播如何实现) 
    
   
   
    
     
      
       
        
         
         ![Test](https://oscimg.oschina.net/oscnet/8c4bfb6d-09c2-428e-a0cd-c8a1ebc14b4e.png 200 行代码告诉你 TDMQ 中 Pulsar 广播如何实现) 
         
        
       
      
     
     
      
      导读 
      
     
    
   
   
    
     
      
       
        
         
        
       
      
     
    
   
   
    
     
      
       
        
        Pulsar 作为 Apache 社区的相对新的成员，在业界受到非常大量的关注。新产品的文档相对不齐全也是非常能够理解的。今天客户问过来广播怎么实现的，我解释了半天，又找了很多介绍产品的 PPT，最终也没有找到“官方”的文档说明这个事情。于是我就写了这篇文章，方便大家 copy/paste 。 
        
       
      
     
    
   
   
    
     
      
       
        
         
        
       
      
     
    
   
   
    
   
   
    
   
   
    
     
      
       
        
         
         ![Test](https://oscimg.oschina.net/oscnet/8c4bfb6d-09c2-428e-a0cd-c8a1ebc14b4e.png 200 行代码告诉你 TDMQ 中 Pulsar 广播如何实现) 
         
        
       
      
     
     
      
      作者介绍 
      
     
    
   
   
    
   
   
    
     
     徐为 
      
     腾讯云微服务团队高级解决方案构架师 
     毕业于欧盟 Erasmus Mundus IMMIT，获得经济和IT管理硕士学位 
     自2006年以来，曾就职于SonyEricsson、SAP等多家公司，历任软件开发工程师，数据开发工程师，解决方案架构师 
     
    
   
   
    
   
   
    
   
   
    
    ![Test](https://oscimg.oschina.net/oscnet/8c4bfb6d-09c2-428e-a0cd-c8a1ebc14b4e.png 200 行代码告诉你 TDMQ 中 Pulsar 广播如何实现) 
    
   
   
   Pulsar订阅模型分类 
   
   
    
   
   
   Pulsar 原文支持的几种模式如下，依次是 独占模式 / 高可用模式 / 分享模式 / 基于键值 的分享模式。 
   
   
    
   
   
    
    ![Test](https://oscimg.oschina.net/oscnet/8c4bfb6d-09c2-428e-a0cd-c8a1ebc14b4e.png 200 行代码告诉你 TDMQ 中 Pulsar 广播如何实现) 
    
   
   
    
   
   
   如果这几个模式还没有理解的，可以去官网先看一下，我个人觉得看过应该是可以理解的： 
   https://pulsar.apache.org/docs/en/concepts-messaging/#subscriptions 
   
   
    
   
   
    
   
   
    
    ![Test](https://oscimg.oschina.net/oscnet/8c4bfb6d-09c2-428e-a0cd-c8a1ebc14b4e.png 200 行代码告诉你 TDMQ 中 Pulsar 广播如何实现) 
    
   
   
   Pulsar 广播模式 
   
   
    
   
   
   Pulsar 的订阅模式和很多 MQ 不太一样。比如 RabbitMQ/Kafka 等，一般消费端（Consumer）是直接去对接 Topic 的，然后 Consumer 自己又有个组的概念在配置中心去设置 offset，以此来决定是一起分享 Topic 的数据，还是每个人都接收同样的数据。在 Pulsar 的消费订阅模型里，添加了一个 Subscription 的逻辑，Subscription 的 Type 决定了消费是独享还是分享。 
    
   于是广播模式可以用不同 Subscription 独享的模式来实现，具体架构可以参照下图： 
   
   
    
   
   
    
    ![Test](https://oscimg.oschina.net/oscnet/8c4bfb6d-09c2-428e-a0cd-c8a1ebc14b4e.png 200 行代码告诉你 TDMQ 中 Pulsar 广播如何实现) 
    
   
   
    
   
   
    
   
   
    
    ![Test](https://oscimg.oschina.net/oscnet/8c4bfb6d-09c2-428e-a0cd-c8a1ebc14b4e.png 200 行代码告诉你 TDMQ 中 Pulsar 广播如何实现) 
    
   
   
   代码实现 
   
   
    
   
   
   1. Full-mesh 的形创建 Java 项目（比如：Springboot - 这个应该是相对简单的 IDE 集成开发组件） 
    
   画重点 
    
    
     
     
       pulsar-client-api 和 tdmq-client 需要2.6.0 
      
     
     
       tdmq-client 需要在腾讯的repo里才能拿到，需要使用介绍链接介绍的方式进行maven的配置（gradle方法类似） 
      
    介绍链接：https://cloud.tencent.com/document/product/1179/44914 
    
   
   
    
   
   
    
     ```java 
  <?xml version="1.0" encoding="UTF-8"?>
  ```  ```java 
  <project xmlns="http://maven.apache.org/POM/4.0.0"
  ```  ```java 
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  ```  ```java 
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  ```  ```java 
    <modelVersion>4.0.0</modelVersion>
  ```  ```java 
    <parent>
  ```  ```java 
      <groupId>org.springframework.boot</groupId>
  ```  ```java 
      <artifactId>spring-boot-starter-parent</artifactId>
  ```  ```java 
      <version>2.4.3</version>
  ```  ```java 
      <relativePath /> <!-- lookup parent from repository -->
  ```  ```java 
    </parent>
  ```  ```java 
    <groupId>com.examble.demo</groupId>
  ```  ```java 
    <artifactId>tdmq-demo</artifactId>
  ```  ```java 
    <version>0.0.1-SNAPSHOT</version>
  ```  ```java 
    <name>tdmq-demo</name>
  ```  ```java 
    <description>demo project to test tdmq</description>
  ```  ```java 
    <properties>
  ```  ```java 
      <java.version>1.8</java.version>
  ```  ```java 
    </properties>
  ```  ```java 
    <dependencies>
  ```  ```java 
      <dependency>
  ```  ```java 
        <groupId>org.springframework.boot</groupId>
  ```  ```java 
        <artifactId>spring-boot-starter-web</artifactId>
  ```  ```java 
      </dependency>
  ```  ```java 
      <dependency>
  ```  ```java 
        <groupId>com.tencent.tdmq</groupId>
  ```  ```java 
        <artifactId>tdmq-client</artifactId>
  ```  ```java 
        <version>2.6.0</version>
  ```  ```java 
      </dependency>
  ```  ```java 
      <!-- https://mvnrepository.com/artifact/org.apache.pulsar/pulsar-client-api -->
  ```  ```java 
      <dependency>
  ```  ```java 
        <groupId>org.apache.pulsar</groupId>
  ```  ```java 
        <artifactId>pulsar-client-api</artifactId>
  ```  ```java 
        <version>2.6.0</version>
  ```  ```java 
      </dependency>
  ```  ```java 
      <dependency>
  ```  ```java 
        <groupId>org.springframework.boot</groupId>
  ```  ```java 
        <artifactId>spring-boot-starter-test</artifactId>
  ```  ```java 
        <scope>test</scope>
  ```  ```java 
      </dependency>
  ```  ```java 
    </dependencies>
  ```  ```java 
  
  ```  ```java 
    <build>
  ```  ```java 
      <plugins>
  ```  ```java 
        <plugin>
  ```  ```java 
          <groupId>org.springframework.boot</groupId>
  ```  ```java 
          <artifactId>spring-boot-maven-plugin</artifactId>
  ```  ```java 
        </plugin>
  ```  ```java 
      </plugins>
  ```  ```java 
    </build>
  ```  ```java 
  
  ```  ```java 
  </project>
  ```  
    
   
   
    
   
   
   2. 创建一个 Component 用来全局使用 Producer 和 Consumers 
    
   这里创建了1个 Producer 和3个拥有 exclusive subscription 的 consumers（广播模式 - 我们期待他们3个每次都收到一样的信息） 
   
   
    
   
   
    
     ```java 
  package com.example.demo.tdmq.instance;
  ```  ```java 
  
  ```  ```java 
  import javax.annotation.PostConstruct;
  ```  ```java 
  
  ```  ```java 
  import org.apache.pulsar.client.api.AuthenticationFactory;
  ```  ```java 
  import org.apache.pulsar.client.api.Consumer;
  ```  ```java 
  import org.apache.pulsar.client.api.Message;
  ```  ```java 
  import org.apache.pulsar.client.api.MessageListener;
  ```  ```java 
  import org.apache.pulsar.client.api.Producer;
  ```  ```java 
  import org.apache.pulsar.client.api.PulsarClient;
  ```  ```java 
  import org.apache.pulsar.client.api.PulsarClientException;
  ```  ```java 
  import org.apache.pulsar.client.api.SubscriptionType;
  ```  ```java 
  import org.springframework.beans.factory.config.ConfigurableBeanFactory;
  ```  ```java 
  import org.springframework.context.annotation.Scope;
  ```  ```java 
  import org.springframework.stereotype.Component;
  ```  ```java 
  
  ```  ```java 
  @Component
  ```  ```java 
  @Scope(ConfigurableBeanFactory.SCOPE_SINGLETON)
  ```  ```java 
  public class Global {
  ```  ```java 
    PulsarClient client;
  ```  ```java 
    public Producer<byte[]> producer;
  ```  ```java 
    public Consumer<byte[]> consumer01;
  ```  ```java 
    public Consumer<byte[]> consumer02;
  ```  ```java 
    public Consumer<byte[]> consumer03;
  ```  ```java 
  
  ```  ```java 
    public Global() {
  ```  ```java 
  
  ```  ```java 
    }
  ```  ```java 
  
  ```  ```java 
    @PostConstruct
  ```  ```java 
    public void init() {
  ```  ```java 
      try {
  ```  ```java 
        client = PulsarClient.builder().serviceUrl("pulsar://<Your TDMQ Pulsar Service URL>:6000/")
  ```  ```java 
            .listenerName("custom:<TDMQ Pulsar Instance ID>/<TDMQ VPC ID>/<TDMQ Subnet ID>")
  ```  ```java 
            .authentication(AuthenticationFactory.token(
  ```  ```java 
                "<Your Credential Token from TDMQ>"))
  ```  ```java 
            .build();
  ```  ```java 
        producer = client.newProducer().topic("persistent://<TDMQ Pulsar Instance ID>/<your name space>/<your topic>").create();
  ```  ```java 
        consumer01 = client.newConsumer().subscriptionType(SubscriptionType.Exclusive)
  ```  ```java 
            .topic("persistent://<TDMQ Pulsar Instance ID>/<your name space>/<your topic>")
  ```  ```java 
            .messageListener(new MessageListener<byte[]>() {
  ```  ```java 
  
  ```  ```java 
              /**
  ```  ```java 
               * 
  ```  ```java 
               */
  ```  ```java 
              private static final long serialVersionUID = 1L;
  ```  ```java 
  
  ```  ```java 
              @Override
  ```  ```java 
              public void received(Consumer<byte[]> consumer, Message<byte[]> msg) {
  ```  ```java 
                System.out.println("Consumer01" + " - " + System.currentTimeMillis() + " - "
  ```  ```java 
                    + new String(msg.getData()));
  ```  ```java 
                try {
  ```  ```java 
                  consumer.acknowledge(msg);
  ```  ```java 
                } catch (PulsarClientException e) {
  ```  ```java 
                  // TODO Auto-generated catch block
  ```  ```java 
                  e.printStackTrace();
  ```  ```java 
                }
  ```  ```java 
  
  ```  ```java 
              }
  ```  ```java 
            }).subscriptionName("my-subscription01").subscribe();
  ```  ```java 
        consumer02 = client.newConsumer().subscriptionType(SubscriptionType.Exclusive)
  ```  ```java 
            .topic("persistent://<TDMQ Pulsar Instance ID>/<your name space>/<your topic>")
  ```  ```java 
            .messageListener(new MessageListener<byte[]>() {
  ```  ```java 
  
  ```  ```java 
              /**
  ```  ```java 
               * 
  ```  ```java 
               */
  ```  ```java 
              private static final long serialVersionUID = 1L;
  ```  ```java 
  
  ```  ```java 
              @Override
  ```  ```java 
              public void received(Consumer<byte[]> consumer, Message<byte[]> msg) {
  ```  ```java 
                System.out.println("Consumer02" + " - " + System.currentTimeMillis() + " - "
  ```  ```java 
                    + new String(msg.getData()));
  ```  ```java 
                try {
  ```  ```java 
                  consumer.acknowledge(msg);
  ```  ```java 
                } catch (PulsarClientException e) {
  ```  ```java 
                  // TODO Auto-generated catch block
  ```  ```java 
                  e.printStackTrace();
  ```  ```java 
                }
  ```  ```java 
  
  ```  ```java 
              }
  ```  ```java 
            }).subscriptionName("my-subscription02").subscribe();
  ```  ```java 
        consumer03 = client.newConsumer().subscriptionType(SubscriptionType.Exclusive)
  ```  ```java 
            .topic("persistent://<TDMQ Pulsar Instance ID>/<your name space>/<your topic>")
  ```  ```java 
            .messageListener(new MessageListener<byte[]>() {
  ```  ```java 
  
  ```  ```java 
              /**
  ```  ```java 
               * 
  ```  ```java 
               */
  ```  ```java 
              private static final long serialVersionUID = 1L;
  ```  ```java 
  
  ```  ```java 
              @Override
  ```  ```java 
              public void received(Consumer<byte[]> consumer, Message<byte[]> msg) {
  ```  ```java 
                System.out.println("Consumer03" + " - " + System.currentTimeMillis() + " - "
  ```  ```java 
                    + new String(msg.getData()));
  ```  ```java 
                try {
  ```  ```java 
                  consumer.acknowledge(msg);
  ```  ```java 
                } catch (PulsarClientException e) {
  ```  ```java 
                  // TODO Auto-generated catch block
  ```  ```java 
                  e.printStackTrace();
  ```  ```java 
                }
  ```  ```java 
  
  ```  ```java 
              }
  ```  ```java 
            }).subscriptionName("my-subscription03").subscribe();
  ```  ```java 
  
  ```  ```java 
      } catch (PulsarClientException e) {
  ```  ```java 
        // TODO Auto-generated catch block
  ```  ```java 
        e.printStackTrace();
  ```  ```java 
      }
  ```  ```java 
    }
  ```  ```java 
  
  ```  ```java 
  }
  ```  
    
   
   
    
   
   
   3. 最外层的测试代码和简单的 Message 模型 
   
   
    
   
   
    
     ```java 
  public class MessageModel {
  ```  ```java 
  
  ```  ```java 
    private String messageText = null;
  ```  ```java 
  
  ```  ```java 
    public String getMessageText() {
  ```  ```java 
      return messageText;
  ```  ```java 
    }
  ```  ```java 
  
  ```  ```java 
    public void setMessageText(String messageText) {
  ```  ```java 
      this.messageText = messageText;
  ```  ```java 
    }
  ```  ```java 
  }
  ```  
    
   
   
    
   
   
   跑起来测试一下，果然3个一起接收一样的消息 
   
   
    
   
   
    
    ![Test](https://oscimg.oschina.net/oscnet/8c4bfb6d-09c2-428e-a0cd-c8a1ebc14b4e.png 200 行代码告诉你 TDMQ 中 Pulsar 广播如何实现) 
    
   
   
    
   
   
   话不多说，赶紧跑起来玩玩吧！ 
    
   有相关需求的读者欢迎留言告诉我们你的想法！ 
   
   
    
   
   
    
   
   
    
     
     往期 
     
    
    
     
     推荐 
     
    
   
   
    
   《你不得不知道的 Apache Pulsar 三大跨地域复制解决方案》 
   《基于 SkyWalking 的腾讯云微服务观测最佳实践》 
   《拥抱 Agent，“0” 代码玩转 Trace 之 OpenTelemetry 系列第二弹！》 
   
   
    
    
   
   
    
     
      
       
      
     
     
      
       
       ![Test](https://oscimg.oschina.net/oscnet/8c4bfb6d-09c2-428e-a0cd-c8a1ebc14b4e.png 200 行代码告诉你 TDMQ 中 Pulsar 广播如何实现) 
       
      
     
     
      
       
      
     
    
   
   
   扫描下方二维码关注本公众号， 
   了解更多微服务、消息队列的相关信息！ 
   解锁超多鹅厂周边！ 
    
   
   
    
    ![Test](https://oscimg.oschina.net/oscnet/8c4bfb6d-09c2-428e-a0cd-c8a1ebc14b4e.png 200 行代码告诉你 TDMQ 中 Pulsar 广播如何实现) 
    
   
  
  
   
    
     
     ![Test](https://oscimg.oschina.net/oscnet/8c4bfb6d-09c2-428e-a0cd-c8a1ebc14b4e.png 200 行代码告诉你 TDMQ 中 Pulsar 广播如何实现) 
     
   
   
    
    戳原文，了解更多消息队列TDMQ的信息 
    
   
  
  
   
  
  
   
    
     
      
       
        
        ![Test](https://oscimg.oschina.net/oscnet/8c4bfb6d-09c2-428e-a0cd-c8a1ebc14b4e.png 200 行代码告诉你 TDMQ 中 Pulsar 广播如何实现) 
        
        
        点亮在看，你最好看 
        
       
      
     
    
   
  
 
本文分享自微信公众号 - 腾讯云中间件（gh_6ea1bc2dd5fd）。如有侵权，请联系 support@oschina.cn 删除。本文参与“OSC源创计划”，欢迎正在阅读的你也加入，一起分享。
                                        