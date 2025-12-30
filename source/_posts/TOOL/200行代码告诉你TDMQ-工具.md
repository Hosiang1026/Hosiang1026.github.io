---
title: 200行代码告诉你 TDMQ 中 Pulsar 广播如何实现
categories: 其他系列
tags:
  - Java
abbrlink: c6851e4a
date: 2025-02-03 00:00:00
top: 197
---


导读 Pulsar 作为 Apache 社区的相对新的成员，在业界受到非常大量的关注。新产品的文档相对不齐全也是非常能够理解的。今天客户问过来广播怎么实现的，我解释了半天，又找了很多介绍产品的 ...
<!-- more -->

![Test](https://oscimg.oschina.net/oscnet/8c4bfb6d-09c2-428e-a0cd-c8a1ebc14b4e.png '200 行代码告诉你 TDMQ 中 Pulsar 广播如何实现') 
    
   
         
        
      导读 
      
     
        Pulsar 作为 Apache 社区的相对新的成员，在业界受到非常大量的关注。新产品的文档相对不齐全也是非常能够理解的。今天客户问过来广播怎么实现的，我解释了半天，又找了很多介绍产品的 PPT，最终也没有找到“官方”的文档说明这个事情。于是我就写了这篇文章，方便大家 copy/paste 。 
        
       
         
        
     徐为 
      
     腾讯云微服务团队高级解决方案构架师 
     毕业于欧盟 Erasmus Mundus IMMIT，获得经济和IT管理硕士学位 
     自2006年以来，曾就职于SonyEricsson、SAP等多家公司，历任软件开发工程师，数据开发工程师，解决方案架构师 
     
    
    
   
   Pulsar订阅模型分类 
   
   
   Pulsar 原文支持的几种模式如下，依次是 独占模式 / 高可用模式 / 分享模式 / 基于键值 的分享模式。 
   
   
    
   
   如果这几个模式还没有理解的，可以去官网先看一下，我个人觉得看过应该是可以理解的： 
   https://pulsar.apache.org/docs/en/concepts-messaging/#subscriptions 
   
   
    
   
   Pulsar 广播模式 
   
   
   Pulsar 的订阅模式和很多 MQ 不太一样。比如 RabbitMQ/Kafka 等，一般消费端（Consumer）是直接去对接 Topic 的，然后 Consumer 自己又有个组的概念在配置中心去设置 offset，以此来决定是一起分享 Topic 的数据，还是每个人都接收同样的数据。在 Pulsar 的消费订阅模型里，添加了一个 Subscription 的逻辑，Subscription 的 Type 决定了消费是独享还是分享。 
    
   于是广播模式可以用不同 Subscription 独享的模式来实现，具体架构可以参照下图： 
   
   
    
   
    
   
   代码实现 
   
   
   1. Full-mesh 的形创建 Java 项目（比如：Springboot - 这个应该是相对简单的 IDE 集成开发组件） 
    
   画重点 
    
    
       pulsar-client-API 和 tdmq-client 需要2.6.0 
      
     
       tdmq-client 需要在腾讯的repo里才能拿到，需要使用介绍链接介绍的方式进行maven的配置（gradle方法类似） 
      

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.4.3</version>
        <relativePath />
    </parent>
    <groupId>com.examble.demo</groupId>
    <artifactId>tdmq-demo</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>tdmq-demo</name>
    <description>demo project to test tdmq</description>
    <properties>
        <java.version>1.8</java.version>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-Web</artifactId>
        </dependency>
        <dependency>
            <groupId>com.tencent.tdmq</groupId>
            <artifactId>tdmq-client</artifactId>
            <version>2.6.0</version>
        </dependency>
        <!-- https://mvnrepository.com/artifact/org.apache.pulsar/pulsar-client-API -->
        <dependency>
            <groupId>org.apache.pulsar</groupId>
            <artifactId>pulsar-client-API</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
``` 2. 创建一个 Component 用来全局使用 Producer 和 Consumers 
    
   这里创建了1个 Producer 和3个拥有 exclusive subscription 的 consumers（广播模式 - 我们期待他们3个每次都收到一样的信息）

```java
package com.example.demo.tdmq.instance;

import javax.annotation.PostConstruct;
import org.apache.pulsar.client.API.AuthenticationFactory;
import org.apache.pulsar.client.API.Consumer;
import org.apache.pulsar.client.API.Message;
import org.apache.pulsar.client.API.MessageListener;
import org.apache.pulsar.client.API.Producer;
import org.apache.pulsar.client.API.PulsarClient;
import org.apache.pulsar.client.API.PulsarClientException;
import org.apache.pulsar.client.API.SubscriptionType;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

@Component
@Scope(ConfigurableBeanFactory.SCOPE_SINGLETON)
public class TdmqInstance {
    PulsarClient client;
    public Producer<byte[]> producer;
    public Consumer<byte[]> consumer01;
    public Consumer<byte[]> consumer02;
    public Consumer<byte[]> consumer03;

    @PostConstruct
    public void init() throws PulsarClientException {
        try {
            client = PulsarClient.builder()
                .serviceUrl("pulsar://<Your TDMQ Pulsar Service URL>:6000/")
                .listenerName("custom:<TDMQ Pulsar Instance ID>/<TDMQ VPC ID>/<TDMQ Subnet ID>")
                .authentication(AuthenticationFactory.token("<Your Credential Token from TDMQ>"))
                .build();
            
            producer = client.newProducer()
                .topic("persistent://<TDMQ Pulsar Instance ID>/<your name space>/<your topic>")
                .create();
            
            consumer01 = client.newConsumer()
                .subscriptionType(SubscriptionType.Exclusive)
                .topic("persistent://<TDMQ Pulsar Instance ID>/<your name space>/<your topic>")
                .messageListener(new MessageListener<byte[]>() {
                    @Override
                    public void received(Consumer<byte[]> consumer, Message<byte[]> msg) {
                        System.out.println("Consumer01" + " - " + System.currentTimeMillis() + " - "
                            + new String(msg.getData()));
                        try {
                            consumer.acknowledge(msg);
                        } catch (PulsarClientException e) {
                            e.printStackTrace();
                        }
                    }
                })
                .subscriptionName("my-subscription01")
                .subscribe();
            
            consumer02 = client.newConsumer()
                .subscriptionType(SubscriptionType.Exclusive)
                .topic("persistent://<TDMQ Pulsar Instance ID>/<your name space>/<your topic>")
                .messageListener(new MessageListener<byte[]>() {
                    @Override
                    public void received(Consumer<byte[]> consumer, Message<byte[]> msg) {
                        System.out.println("Consumer02" + " - " + System.currentTimeMillis() + " - "
                            + new String(msg.getData()));
                        try {
                            consumer.acknowledge(msg);
                        } catch (PulsarClientException e) {
                            e.printStackTrace();
                        }
                    }
                })
                .subscriptionName("my-subscription02")
                .subscribe();
            
            consumer03 = client.newConsumer()
                .subscriptionType(SubscriptionType.Exclusive)
                .topic("persistent://<TDMQ Pulsar Instance ID>/<your name space>/<your topic>")
                .messageListener(new MessageListener<byte[]>() {
                    @Override
                    public void received(Consumer<byte[]> consumer, Message<byte[]> msg) {
                        System.out.println("Consumer03" + " - " + System.currentTimeMillis() + " - "
                            + new String(msg.getData()));
                        try {
                            consumer.acknowledge(msg);
                        } catch (PulsarClientException e) {
                            e.printStackTrace();
                        }
                    }
                })
                .subscriptionName("my-subscription03")
                .subscribe();
        } catch (PulsarClientException e) {
            e.printStackTrace();
        }
    }
}
``` 3. 最外层的测试代码和简单的 Message 模型 ```text
``` ```text
``` ```java
```
      return messageText;
```
``` ```java
      this.messageText = messageText;
}

```
    
   
   
    
   
   
   跑起来测试一下，果然3个一起接收一样的消息 
   
   
    
   
   
    
    
   
   
    
   
   
   话不多说，赶紧跑起来玩玩吧！ 
    
   有相关需求的读者欢迎留言告诉我们你的想法！ 
   
   
    
   
   
    
   
   
    
     
     往期 
     
    
    
     
     推荐 
     
    
   
   
    
   《你不得不知道的 Apache Pulsar 三大跨地域复制解决方案》 
   《基于 SkyWalking 的腾讯云微服务观测最佳实践》 
   《拥抱 Agent，“0” 代码玩转 Trace 之 OpenTelemetry 系列第二弹！》 
   
   
    
    
   
   
    
     
      
       
      
     
     
      
       
       
      
     
     
      
       
      
     
    
   
   
   解锁超多鹅厂周边！ 
    
   
   
    
    
   
  
  
   
    
     
     
   
   
    
    
   
  
  
   
  
  
   
    
     
      