---
title: 推荐系列-JVM-入门了解篇
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 581
cover_picture: 'https://oscimg.oschina.net/oscnet/up-6bf49976b6ccfa2ba05ed8c51050a6d2339.png'
abbrlink: 83f02cd2
date: 2021-04-15 10:16:56
---

&emsp;&emsp;引言：任何软件语言的设计都有对应的硬件设备作为参考，同理我们理解对应知识结构或设计思想也可以参考对应的体系模型进行理解。 计算机体系结构： 计算机处理数据过程： (1)提取阶段:由输入...
<!-- more -->

                                                                                                                                                                                        引言：任何软件语言的设计都有对应的硬件设备作为参考，同理我们理解对应知识结构或设计思想也可以参考对应的体系模型进行理解。 
计算机体系结构： 
![Test](https://oscimg.oschina.net/oscnet/up-6bf49976b6ccfa2ba05ed8c51050a6d2339.png  'JVM-入门了解篇') 
计算机处理数据过程： 
(1)提取阶段:由输入设备把原始数据或信息输入给计算机存储器存起来 
(2)解码阶段:根据CPU的指令集架构(ISA)定义将数值解译为指令 
(3)执行阶段:再由控制器把需要处理或计算的数据调入运算器 
(4)最终阶段:由输出设备把最后运算结果输出 
    本质就是CPU处理数据并且返回 
    CPU = 控制器+运算器+存储器 
什么问题需要JVM来解决？ 
如果你在线上遇到了OOM，你是否会束手无策。 
线上卡顿是否可能是因为频繁Full GC造成的。 
新项目上线，服务器数量以及配置不足，对于性能的扩展只能靠服务器的增加���而���能通过JVM的 调优达到实现服务器性能的突破。 面试经常会问到JVM的一些问题，但是当面试官问到你实际的落地点时，你就会茫然不知所措，没 有条理性，或者答非所问。 
JVM是什么？ 
JVM:Java Virtual Machine (Java虚拟机)，特性：Write Once Run Anywhere 一次写入跨平台运行。 ![Test](https://oscimg.oschina.net/oscnet/up-6bf49976b6ccfa2ba05ed8c51050a6d2339.png  'JVM-入门了解篇')
                                        