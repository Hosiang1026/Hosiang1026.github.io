---
title: 推荐系列-Gradle 在 Linux 系统与 Windows 系统下的安装配置
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 1967
cover_picture: 'https://oscimg.oschina.net/oscnet/up-47f583508636cf866ffc4882856ef912657.png'
abbrlink: 621e84b6
date: 2021-04-15 09:46:45
---

&emsp;&emsp;Gradle 在 Linux 系统与 Windows 系统下的安装配置 1、Gradle 概述与了解 Java 生态体系中有三大构建工具：Ant、Maven 和 Gradle 。 Ant 是由 Apache 软件基金会维护； Maven 这个单词意为知...
<!-- more -->

                                                                                                                                                                                         
###                  Gradle 在 Linux 系统与 Windows 系统下的安装配置 
1、Gradle 概述与了解 
Java 生态体系中有三大构建工具：Ant、Maven 和 Gradle 。 
Ant 是由 Apache 软件基金会维护； Maven 这个单词意为知识的积累，最初在 Jakata Turbine 项目中用来简化构建过程； Gradle 是一个基于 Apache Ant 和 Apache Maven 概念的项目， 是一个开源的构建自动化工具， 它引入了基于 Java 和 Groovy 的 DSL（特定领域的语言）而不是XML（可扩展标记语言）来声明项目配置，抛弃了基于 XML 的各种繁琐配置， 它能够构建几乎所有类型的软件，它是为多项目构建而设计的。 
Gradle 提供了一种弹性模型, 可以通过编译和打包针对Web和移动应用程序的代码来帮助开发生命周期。 
经过几年的发展，Ant 几乎销声匿迹，而 Maven 由于较为不灵活的配置也渐渐被遗忘，而由于 Gradle 是基于 Ant 和 Maven 之间优化的一个工具，站在巨人肩上变得如日中天。 
2、系统平台环境 
Linux 系统使用的是 Ubuntu 18.04 
![Test](https://oscimg.oschina.net/oscnet/up-47f583508636cf866ffc4882856ef912657.png  'Gradle 在 Linux 系统与 Windows 系统下的安装配置') 
Linux 下使用的 JDK 版本如下： 
![Test](https://oscimg.oschina.net/oscnet/up-47f583508636cf866ffc4882856ef912657.png  'Gradle 在 Linux 系统与 Windows 系统下的安装配置') 
Windows 系统使用的是 Windows 10 20H2 
![Test](https://oscimg.oschina.net/oscnet/up-47f583508636cf866ffc4882856ef912657.png  'Gradle 在 Linux 系统与 Windows 系统下的安装配置') 
Windows 下使用的 JDK 版本如下： 
![Test](https://oscimg.oschina.net/oscnet/up-47f583508636cf866ffc4882856ef912657.png  'Gradle 在 Linux 系统与 Windows 系统下的安装配置') 
3、下载软件 
官网下载 ： https://services.gradle.org/distributions/ 
![Test](https://oscimg.oschina.net/oscnet/up-47f583508636cf866ffc4882856ef912657.png  'Gradle 在 Linux 系统与 Windows 系统下的安装配置') 
上国内几个软件镜像站，都没有找到 Gradle 软件，只能上官网进行下载了，在此也推荐一个国外的软件下载站点。 
![Test](https://oscimg.oschina.net/oscnet/up-47f583508636cf866ffc4882856ef912657.png  'Gradle 在 Linux 系统与 Windows 系统下的安装配置') 
直接搜索 gradle ，就能显示相关的版本了。 
![Test](https://oscimg.oschina.net/oscnet/up-47f583508636cf866ffc4882856ef912657.png  'Gradle 在 Linux 系统与 Windows 系统下的安装配置') 
  
Linux 系统下载如下： 
![Test](https://oscimg.oschina.net/oscnet/up-47f583508636cf866ffc4882856ef912657.png  'Gradle 在 Linux 系统与 Windows 系统下的安装配置') 
Windows 系统下载如下： 
![Test](https://oscimg.oschina.net/oscnet/up-47f583508636cf866ffc4882856ef912657.png  'Gradle 在 Linux 系统与 Windows 系统下的安装配置') 
  
4、环境变量配置 
软件下载好，解压后就可以进行系统环境变量的配置了。 
Linux 系统下环境变量配置如下： 
![Test](https://oscimg.oschina.net/oscnet/up-47f583508636cf866ffc4882856ef912657.png  'Gradle 在 Linux 系统与 Windows 系统下的安装配置') 
# mv gradle-6.8.3 /usr/local/gradle6.8.3 
![Test](https://oscimg.oschina.net/oscnet/up-47f583508636cf866ffc4882856ef912657.png  'Gradle 在 Linux 系统与 Windows 系统下的安装配置') 
# vim /etc/environment 
![Test](https://oscimg.oschina.net/oscnet/up-47f583508636cf866ffc4882856ef912657.png  'Gradle 在 Linux 系统与 Windows 系统下的安装配置') 
# source /etc/environment 
![Test](https://oscimg.oschina.net/oscnet/up-47f583508636cf866ffc4882856ef912657.png  'Gradle 在 Linux 系统与 Windows 系统下的安装配置') 
验证版本显示正确，Linux 系统下的环境变量就配置完成，可以正常使用了。 
Windows 系统下环境变量配置如下： 
解压到一个目录下 
![Test](https://oscimg.oschina.net/oscnet/up-47f583508636cf866ffc4882856ef912657.png  'Gradle 在 Linux 系统与 Windows 系统下的安装配置') 
电脑右键系统属性 
![Test](https://oscimg.oschina.net/oscnet/up-47f583508636cf866ffc4882856ef912657.png  'Gradle 在 Linux 系统与 Windows 系统下的安装配置') 
点击环境变量，新创建个变量参数。 
![Test](https://oscimg.oschina.net/oscnet/up-47f583508636cf866ffc4882856ef912657.png  'Gradle 在 Linux 系统与 Windows 系统下的安装配置') 
然后双击 Path 变量 
![Test](https://oscimg.oschina.net/oscnet/up-47f583508636cf866ffc4882856ef912657.png  'Gradle 在 Linux 系统与 Windows 系统下的安装配置') 
新建 %GRADLE_HOME%\bin ，如下图所示。 
![Test](https://oscimg.oschina.net/oscnet/up-47f583508636cf866ffc4882856ef912657.png  'Gradle 在 Linux 系统与 Windows 系统下的安装配置') 
环境变量都配置好，保存配置，下面进行验证版本信息。 
![Test](https://oscimg.oschina.net/oscnet/up-47f583508636cf866ffc4882856ef912657.png  'Gradle 在 Linux 系统与 Windows 系统下的安装配置') 
验证版本显示正确，Windows 系统下的环境变量也配置完成，可以正常使用了。
                                        