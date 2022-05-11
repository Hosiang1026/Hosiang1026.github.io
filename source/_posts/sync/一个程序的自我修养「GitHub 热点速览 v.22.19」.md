---
title: 推荐系列-一个程序的自我修养「GitHub 热点速览 v.22.19」
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 300
date: 2022-05-11 05:14:30
cover_picture: 'https://img2022.cnblogs.com/blog/759200/202205/759200-20220508222927603-1657267504.jpg'
---

&emsp;&emsp;程序要诞生涉及前后端技术，比如，你可以用可视化网页搭建工具 tmagic-editor 完成前端部分，而后端部分的数据库以及数据处理可能就要用到 jsonhero-web 和 directus。知其然知其所以然，...
<!-- more -->

                                                                                                                                                                                         
一个程序要诞生涉及前后端技术，比如，你可以用可视化网页搭建工具 tmagic-editor 完成前端部分，而后端部分的数据库以及数据处理可能就要用到 jsonhero-web 和 directus。知其然知其所以然，DDIA 则带你了解数据库设计背后的思考。更甚者，你对数据背后的验证有兴趣，你可以通过 adx 项目来了解数据通信。 
以下内容摘录自微博@HelloGitHub 的 GitHub Trending 及 Hacker News 热帖（简称 HN 热帖），选项标准： 
 ```java 
  新发布
  ``` 
  |  
 ```java 
  实用
  ``` 
  |  
 ```java 
  有趣
  ``` 
 ，根据项目 release 时间分类，发布时间不超过 14 day 的项目会标注  
 ```java 
  New
  ``` 
 ，无该标志则说明项目 release 超过半月。由于本文篇幅有限，还有部分项目未能在本文展示，望周知 🌝 
 
 本文目录 
   
   News 快读 
     
      
       
       产品·GitHub 将开启 2FA 验证 
        
      
    
     
     本周特推 
     
     
     1.1 数据库开发必备：DDIA 
     1.2 3 分钟创建学习模型 UI：gradio 
      
    
     
     GitHub Trending 周榜 
     
     
     2.1 图像变体：DALLE2-pytorch 
     2.2 快速查看 JSON 文件：jsonhero-web 
     2.3 数据库仪表盘：directus 
     2.4 ��面可视化搭建：tmagic-editor 
     2.5 数据验证实验：adx 
      
    
     
     往期回顾 
      
    
 
#### News 快读 
##### 1. 产品·GitHub 将开启 2FA 验证 
据 GitHub 官方所说，为了保障软件供应链研发人员的账号安全，将在 2023 年年底要求在 GitHub 上贡献代码的使用者开启 2FA 验证，2FA 验证即双因子验证是指结合密码以及实物（信用卡、SMS 手机、令牌或指纹等生物标志）两种条件对用户进行认证的方法。更多验证详情可阅读官方说明：https://github.blog/2022-05-04-software-security-starts-with-the-developer-securing-developer-accounts-with-2fa/ 
#### 1. 本周特推 
##### 1.1 数据库开发必备：DDIA 
本周 star 增长数：600+ 
如果你打算从事或者了解某款数据库，DDIA 全称 Designing Data-Intensive Application 是必读之书，本书从底层数据结构到顶层架构设计，将数据系统设计中的精髓娓娓道来。其中的宝贵经验无论是对架构师、DBA、还是后端工程师、甚至产品经理都会有帮助。而 vonng 维护的 ddia 项目则是它的中文译版，如果你的英文阅读能力和我一样不是很好，不妨阅读中文版来了解数据库的知识。 
 
 
##### 1.2 3 分钟创建学习模型 UI：gradio 
本周 star 增长数：700+ 
Gradio 是个可视化工具，以便让你的机器学习模型快速创建漂亮的用户界面。Gradio 发音为 GRAY-dee-oh，有了它你可轻松地在浏览器中演示训练模型，或者通过拖拽图像、粘贴文本、录制音频等方式“尝试”并查看模型的输出。（见下图） 
 
 
#### 2. GitHub Trending 周榜 
##### 2.1 图像变体：DALLE2-pytorch 
本周 star 增长数：2,150+ 
DALLE2-pytorch 用 Pytorch 实现了 OpenAI 文本到图片的 DALL-E 2，即基于已有图片进行二次创作生成不同风格的图像变体。 
 
 
##### 2.2 快速查看 JSON 文件：jsonhero-web 
本周 star 增长数：600+ 
JSON Hero 是一个开源、高颜值的 JSON 浏览器，可以让你快速浏览、搜索和浏览 JSON 文件。特性： 
 
 多种 JSON 查看方式：列视图、树视图、编辑器视图 
 自动推断字符串内容，并提供有用的预览 
 创建推断 JSON Schema 来校验 JSON 
 快速扫描相关值来检查边缘情况 
 支持键值来检索 JSON 文件 
 键盘可访问 
 路径支持可轻松共享 url 
 
 
 
##### 2.3 数据库仪表盘：directus 
本周 star 增长数 650+ 
Directus 一个管理 SQL 数据库的实时 API 和应用程序仪表板。特性： 
 
 REST & GraphQL API：在任意 SQL 数据库上快速创建 Node.js API； 
 纯 SQL 管理：适用于所有 SQL 数据库，无迁移成本； 
 支持多款 SQL 数据库：MySQL、PostgreSQL 等等 
 支持本地或者云上使用 
 可扩展，支持自定义； 
 先进仪表盘：无代码 Vue.js 应用无需培训成本即可上手； 
 
 
 
##### 2.4 页面可视化搭建：tmagic-editor 
本周 star 增长数：650+ 
 
 ```java 
  New
  ``` 
  tmagic-editor 可视化开源项目是从魔方平台演化而来的开源项目，通过可视化的操作快速搭建网页。 
 
 
##### 2.5 数据验证实验：adx 
本周 star 增长数：750+ 
 
 ```java 
  New
  ``` 
  adx 一个基于联邦社交网络的自我验证数据实验。 
 
 
#### 3. 往期回顾 
往期回顾： 
 
 GitHub 桌面版 v3.0 新特性「GitHub 热点速览 v.22.18」 
 程序员延寿指南「GitHub 热点速览 v.22.17」 
 
以上为 2022 年第 19 个工作周的 GitHub Trending 🎉如果你 Pick 其他好玩、实用的 GitHub 项目，记得来 HelloGitHub issue 区和我们分享下哟 🌝
                                        