---
title: 推荐系列-电子检索实体书「GitHub 热点速览 v.22.12」
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 306
cover_picture: >-
  https://img2022.cnblogs.com/blog/759200/202203/759200-20220320194008855-1886706334.jpg
abbrlink: 57b570
date: 2022-03-27 11:55:56
---

&emsp;&emsp;道有没有小伙伴遇到实体书快速定位指定内容的问题，凭借着记忆里很难快速翻阅到正确的页数，但 paperless-ngx 也许能帮上你的忙，它除了能将你的实体书籍电子化变成文件库里的一员之外，...
<!-- more -->

                                                                                                                    
            程序员健身是为了保养还是保命？参与话题讨论赢好礼 >>>
            
                                                                                                     
不知道有没有小伙伴遇到实体书快速定位指定内容的问题，凭借着记忆里很难快速翻阅到正确的页数，但 paperless-ngx 也许能帮上你的忙，它除了能将你的实体书籍电子化变成文件库里的一员之外，还能帮你迅速找到想要的内容。一样能帮上忙的是让你专注了解 vue3 核心实现逻辑的 mini-vue，让你快速了解 vue3 的设计思路。 
新晋编辑器 CodeEdit 也是个小能手，旨在提升 macOS 开发者的系统利用率，Remotion 则让 Web 开发者们能通过 Canvas、WebGL 等技术来制作自己的视频… 
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
   
    
     
     本周特推 
     
     
     1.1 无纸化检索：paperless-ngx 
     1.2 最简 vue3 模型：mini-vue 
      
    
     
     GitHub Trending 周榜 
     
     
     2.1 3D 建模：plasticity 
     2.2 人脸修复��GFPGAN 
     2.3 Go 新泛型：lo 
     2.4 macOS 编辑器：CodeEdit 
     2.5 React 视频库：remotion 
      
    
     
     往期回顾 
      
    
 
#### 1. 本周特推 
##### 1.1 无纸化检索：paperless-ngx 
本周 star 增长数：300+ 
 
 ```java 
  New
  ``` 
  Paperless-ngx 是一个 Django 实现的文档管理系统，它可以将你的物理文档转换成一个可搜索的在线存档，这样你就可以节省纸张。主要通过文档扫描器来实现电子化，不同于普通的扫描仪将实体书变成图片、PDF 等不便于检索的电子格式，Paperless-ngx 由两部分组成：Consumer 和 Web Server，前者用过实现索引功能，后者用来下载和检索电子文档。 
 
 
##### 1.2 最简 vue3 模型：mini-vue 
本周 star 增长数：800+ 
mini-vue 通过构建自己的 mini-vue3 来深入学习理解 vue3 源码。作者表示，像这种工业级别的库，源码中有很多逻辑是���于处理边缘情况或者是兼容处理逻辑，不利于使用者学习。而此项目将 vue3 源码中最核心的逻辑剥离出来，大家只要关注核心逻辑的实现即可。 
 
 
#### 2. GitHub Trending 周榜 
##### 2.1 3D 建模：plasticity 
本周 star 增长数：750+ 
Plasticity 是一款 3D 建模工具，供艺术家们使用的 CAD。虽然它尚在 Beta 版本，有些功能缺失，但是它主打快速、高效建模，而且界面有着不同于工业风的高颜值。 
 
 
##### 2.2 人脸修复：GFPGAN 
本周 star 增长数：400+ 
GFPGAN 是腾讯开源的人脸修复算法，从效果图上看来 GFPGAN 的修复成果更清晰、更贴近现实。 
 
 
##### 2.3 Go 新泛型：lo 
本周 star 增长数 750+ 
lo 是一个新的 Golang 泛型库，它类似 Lodash，性能报告显示它比  
 ```java 
  reflect
  ``` 
  包拥有更快的性能，同纯  
 ```java 
  for
  ``` 
  相比，lo 也有一定的性能提升。lo 适用于 Golang 1.18+ 版本。 
 
 
##### 2.4 macOS 编辑器：CodeEdit 
本周 star 增长数：1,900+ 
 
 ```java 
  New
  ``` 
  CodeEdit 是一个供 macOS 平台的开发者使用的编辑器，作者认为现在主流的编辑器都基于 Electron，而它依赖于 Chromium 实例，这样会造成性能损耗、RAM 使用过高，从而编辑器不能充分利用所有的系统资源，所以他萌生了开发 CodeEdit 的念头。目前该项目尚未发布版本，可通过源码编译来试运行。从项目 logo 设计风格来说，🤔 延续了之前苹果 icon 的设计风格。 
 
 
##### 2.5 React 视频库：remotion 
本周 star 增长数：250+ 
Remotion 是个基于 React 的视频库，允许用户利用 Web 技术（CSS、Canvas、SVG、WebGQL 等等）来创建视频。而官方给出了各类视频是如何通过 Remotion 进行创建的示例，如果你想要创建一个视频，不妨试试 Remotion。 
 
 
#### 3. 往期回顾 
往期回顾： 
 
 能动的电脑配件「GitHub 热点速览 v.22.11」 
 平平无奇的项目「GitHub 热点速览 v.22.10」 
 
以上为 2022 年第 12 个工作周的 GitHub Trending 🎉如果你 Pick 其他好玩、实用的 GitHub 项目，记得来 HelloGitHub issue 区和我们分享下哟 🌝
                                        