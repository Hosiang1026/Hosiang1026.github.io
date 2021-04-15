---
title: 推荐系列-SonarQube 私有项目徽章显示方案
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 2036
cover_picture: 'https://oscimg.oschina.net/oscnet/up-7c1070bb3f82fdcd88678b24fd6a628579e.png'
abbrlink: f81038f2
date: 2021-04-15 09:46:45
---

&emsp;&emsp;背景 sonarQube 目前不支持私有项目的徽章图片获取，这个问题早在 2018 年就在 sonar 社区里有过激烈的讨论。后面 sonar 官方也关注到了这个需求的必要性，也着手排期在做了。但是从 2020年2...
<!-- more -->

                                                                                                                                                                                         
### 背景 
sonarQube 目前不支持私有项目的徽章图片获取，这个问题早在 2018 年就在 sonar 社区里有过激烈的讨论。后面 sonar 官方也关注到了这个需求的必要性，也着手排期在做了。但是从 2020年2月份创建好了项目计划后，到现在一年过去了，还没有任何的动静，所以不等官方的版本计划了，只能自己寻求一种可以快速实施的方案 
 
 社区讨论：https://community.sonarsource.com/t/badges-on-private-projects/4894 
 官方排期实现计划：https://jira.sonarsource.com/browse/MMF-1942 
 
 
### SonarQube 架构简介 
![Test](https://oscimg.oschina.net/oscnet/up-7c1070bb3f82fdcd88678b24fd6a628579e.png  'SonarQube 私有项目徽章显示方案') 
先简单了解下 sonar 的运行机制。如图，运行 SonarQube  app，其实同时运行了4 个进程，app 进程负责统筹调度其他三个进程，当有插件安装需要重新加载时， app 就可以发出重启的指令。下面是详细的描述： 
 
 App Process：用户操作的进程，这个进程是门面，由用户控制开启或者关闭。同时也是其他三个进程的调度器，开启 app 后，会自动启动 Es、web、ce 等进程。 
 Es Process：ElasticSearch 的进程，Sonar 将 Es 的发行包内置到了Sonar 中，作为独享的搜索引擎使用，issue ，代码等数据会被 es 管理起来。 
 Web Process：web 页面 、api 的进程 
 Ce Process：ce 全称 Compute Engine 。分析计算引擎，是 sonar 的核心 
 
 
### 分析徽章的生成 
如下，是一个获取 bugs徽章的链接，我们从这个链接开始，深入分析下，在 sonar 服务的内部是怎么生成这个徽章的。在分析前，先说明下，sonar 内部没有采用 spring mvc 等任何web 框架，是自己封装的一套mvc框架，数据库查询用的 mybatis。 
https://qa-sonar.dev.com/api/project_badges/measure?project=server_services_developer_AXaIXEx52AMDJFWZUd_4&metric=bugs 
![Test](https://oscimg.oschina.net/oscnet/up-7c1070bb3f82fdcd88678b24fd6a628579e.png  'SonarQube 私有项目徽章显示方案') 
根据徽章资源的 /api/project_badges 找到徽章的web入口文件 ProjectBadgesService.java ，可以看到接口支持的入参情况。通过 action 模块名 measure 找到 MeasureAction.java ，生成徽章的主要逻辑都在这个里面，所在模块的目录结构如下： 
![Test](https://oscimg.oschina.net/oscnet/up-7c1070bb3f82fdcd88678b24fd6a628579e.png  'SonarQube 私有项目徽章显示方案') 
从这里得知，通过徽章链接获取到的 svg 图片，是通过 project_Id 实时查出来数据，实时生成的图片。并不是每次扫描都会生成静态图片资源。也在这个模块里找到了私有项目无法生成代码的逻辑。 
 
### 实施方案 
1、改社区代码去掉私有的限制 
这个是最简单的，但是限制也比较多。改了代码需要自己发版，功能没法和社区同步。而且如果你使用的是付费的，这个路也行不通。 
2、新建一个项目，自己生成 svg 
尝试获取 sonar 的所有元数据信息，然后自己生成 svg 徽章，在 url 设计上，尽量保持和 sonar 自己的风格保持一致，用法也一样。生成的徽章的风格也保持一致 
 
### 结语 
最后准备采用方案二，新建专门处理 sonar 徽章的项目，实施过程就不在详细说明了。sonarqube 私有项目徽章获取显示，是一个社区众望所期的功能。所以如果这个方案最后成功实施的话，项目也会在 github 开源出来，敬请期待
                                        