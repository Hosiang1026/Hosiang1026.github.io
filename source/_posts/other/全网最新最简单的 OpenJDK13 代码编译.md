---
title: 推荐系列-全网最新最简单的 OpenJDK13 代码编译
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 717
cover_picture: 'https://static.oschina.net/uploads/img/201911/14151640_gtZF.jpg'
abbrlink: 1fb96dd
date: 2021-04-15 09:17:50
---

&emsp;&emsp;个人博客原文：全网最新最简单的 OpenJDK13 代码编译 [TOC] 最近因写文章需要查看 JVM 源码，有时代码逻辑不是很清晰，找半天，趁国庆假期，抽空下载了 OpenJDK13 搭建了 JVM debug 环境，把...
<!-- more -->

                                                                                                                                                                                        个人博客原文：全网最新最简单的 OpenJDK13 代码编译 
![Test](http://www.liebrother.com/upload/6f0d236c9bc14e0c92064942c957044a_Dukenocoffeecup768x531.jpg  '全网最新最简单的 OpenJDK13 代码编译') 
[TOC] 
最近因写文章需要查看 JVM 源码，有时代码逻辑不是很清晰，找半天，趁国庆假期，抽空下载了 OpenJDK13 搭建了 JVM debug 环境，把操作记录写在这篇文章里，让有需要的朋友可以参考，少踩坑。 
我是在 Ubuntu 18.04 下编译的，不是在 Windows，建议不在 Windows 下折腾，会遇到比在 Linux 环境下多得多的问题。如果你电脑也是 Windows，可以像我这样，安装个 VMware 虚拟机软件，在里面装个 Ubuntu 系统，在虚拟机里面玩，这 2 个软件在官网下载就行，当然如果懒得去找也可以 ```java 
  在我的公众号后台回复: 虚拟机
  ```  获取 VMware 软件和 Ubuntu 18.04 镜像。 
安装 Ubuntu 虚拟机就不在这篇文章说了，网上有相关的资料。 
#### 开始咯 
##### 1.下载源码 
平时咱用的代码管理工具大多数是 Git，OpenJDK 并不是，而是用 Mercurial 管理工具，所以我们要安装它。通过下面命令安装。 
 ```java 
  sudo apt-get install mercurial

  ```  
安装完代码管理工具后，我们就可以下载 OpenJDK13 的源码了，使用如下命令即可下载。这个过程根据网络状况，需要的时间不一，我下载花了十来分钟。 
 ```java 
  hg clone http://hg.openjdk.java.net/jdk/jdk13/

  ```  
嗯，我就是这样干等了十来分钟，因为具体的官方操作文档也在里面，没下载下来无法看，网上也找不到相关的 Ubuntu 18 编译 OpenJDK13 的文章，所以不知道具体要安装哪些依赖。现在你看到这篇文章，可以不用干等着了，接下来步骤 2 和 3 不依赖源代码，可以继续操作。 
##### 2.安装编译需要的依赖 
这一部分是查看了官方文档，做了总结，官方文档里面是按软件区分的，那样一个命令一个命令敲有点繁琐，就把它整合成一个命令，执行就完了，满足有些朋友想尽快编译完，少些多余的东西。 
 ```java 
  sudo apt-get install libfreetype6-dev libcups2-dev libx11-dev libxext-dev libxrender-dev libxrandr-dev libxtst-dev libxt-dev libasound2-dev libffi-dev autoconf gcc clang libfontconfig1-dev

  ```  
想了解这些依赖软件是干嘛用的，可以看看官方文档，文档的位置如下图。 
![Test](http://www.liebrother.com/upload/6f0d236c9bc14e0c92064942c957044a_Dukenocoffeecup768x531.jpg  '全网最新最简单的 OpenJDK13 代码编译') 
##### 3.安装 jdk 12 
这个在文档里面称为 Boot JDK，就是编译时需要上一个版本的 JDK 做为基础，一般是使用 N-1 版本，比如编译 OpenJDK8 就使用 JDK7 作为 Boot JDK，我们这里是编译 OpenJDK13，所以使用的是 JDK12。也是执行下面命令就搞定。 
 ```java 
  sudo add-apt-repository ppa:openjdk-r/ppa
sudo apt-get update
sudo apt-get install openjdk-12-jdk

  ```  
安装完可以通过  ```java 
  java -version
  ```  来验证一下是否成功安装。见到如下结果就妥妥的。 
![Test](http://www.liebrother.com/upload/6f0d236c9bc14e0c92064942c957044a_Dukenocoffeecup768x531.jpg  '全网最新最简单的 OpenJDK13 代码编译') 
执行完上面步骤，那么恭喜你，现在就可以开始编译了。 
##### 4.检查配置 
我们安装了上面那么多东西，需要来检查一下是不是已经安装完所需要的软件，通过下面命令来检查。 
 ```java 
  bash configure

  ```  
如果执行过程中有异常，就根据异常和提示信息，安装所缺的软件就行。如果看到下面的结果，那么再一次恭喜你，所有依赖软件都准备好了。 
![Test](http://www.liebrother.com/upload/6f0d236c9bc14e0c92064942c957044a_Dukenocoffeecup768x531.jpg  '全网最新最简单的 OpenJDK13 代码编译') 
##### 5.开始编译 
最激动人心的时刻到来了，敲入下面的命令，开始编译吧。这个过程大概需要半个小时，耐心等候，可以稍作休息，喝杯 82 年的咖啡。 
 ```java 
  make images

  ```  
见证奇迹的图片。看到下图说明编译成功啦。 
![Test](http://www.liebrother.com/upload/6f0d236c9bc14e0c92064942c957044a_Dukenocoffeecup768x531.jpg  '全网最新最简单的 OpenJDK13 代码编译') 
##### 6.验证是否成功 
还需要再稳一点，验证编译后的 java 是否可用，通过下面的命令来验证。 
 ```java 
  ./build/*/images/jdk/bin/java -version

  ```  
看下图，出现  ```java 
  "13-internal" 2019-09-17
  ```  字样，我们编译出来的 JDK13 可以用啦。 ![Test](http://www.liebrother.com/upload/6f0d236c9bc14e0c92064942c957044a_Dukenocoffeecup768x531.jpg  '全网最新最简单的 OpenJDK13 代码编译') 
这标题起得不过分吧，上面版本日期是 2019-09-17，还不到一个月，网上相关资料也没，就只有官方文档了（当然也是最好的资料）。 ```java 
  跟着步骤走，不会丢
  ``` ，为了验证这句话，还把上面的步骤在我快退休的笔记本上跑了一遍，妥妥的。 
#### 回顾 
我们这篇文章就讲了编译 OpenJDK13，接下来会再写一篇怎么搭建 Debug JVM 环境，可以关注公众号，期待下一篇。 
 ```java 
  推荐阅读
  ```  
了解Java线程优先级，更要知道对应操作系统的优先级，不然会踩坑 
线程最最基础的知识 
老板叫你别阻塞了 
吃个快餐都能学到串行、并行、并发 
泡一杯茶，学一学同异步 
进程知多少？ 
设计模式看了又忘，忘了又看？ 
后台回复『设计模式』可以获取《一故事一设计模式》电子书 
 ```java 
  觉得文章有用帮忙转发&点赞，多谢朋友们！
  ```  
![Test](http://www.liebrother.com/upload/6f0d236c9bc14e0c92064942c957044a_Dukenocoffeecup768x531.jpg  '全网最新最简单的 OpenJDK13 代码编译')
                                        