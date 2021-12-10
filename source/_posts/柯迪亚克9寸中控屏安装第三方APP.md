---
title: 推荐系列-#斯柯达#柯迪亚克9寸中控屏安装第三方APP
categories: 热门文章
author: 狂欢马克思
tags:
  - Popular
top: 1
cover_picture: photo/album/image/image_162.png
abbrlink: cebc765c
date: 2021-11-29 00:00:00
---

&emsp;&emsp;合众北斗公司-9寸中控屏车机，因有安装白名单以外APP限制，而且采用悟空推送不了的，不需要Root，通用方法：使用双公头USB数据线连接，通过adb命令安装第三方APP，不需要手机开热点WiFi，无任何风险。

<!-- more -->

![Popular](/photo/album/image/image_153.png "推荐系列-#斯柯达#柯迪亚克9寸中控屏安装第三方APP")

### 一、准备

1. Windows系统的笔记本一款
2. 双公头USB数据线一条（某宝购买，很便宜的）

<p align="center">2018款-柯迪亚克-车机系统信息</p>
![Popular](/photo/album/image/image_154.png "推荐系列-#斯柯达#柯迪亚克9寸中控屏安装第三方APP")


<p align="center">双公头USB数据线</p>
![Popular](/photo/album/image/image_155.png "推荐系列-#斯柯达#柯迪亚克9寸中控屏安装第三方APP")

### 二、步骤

1. 解锁USB模式，靠近副驾驶位置的一个主USB插口，默认是只能充电，打开USB模式，拨号界面输入如下密码：
   （1）打开USB模式：*#534*62559##*
   （2）关闭USB模式：*#62559*534##*

2. 双公头USB数据线连接中控屏和笔记本，一端连接靠近副驾驶位的一个主USB插口，另一端连接笔记本USB插口，确认已经连接上。

3. 使用adb命令安装APP，解压adb文件；cmd命令进入adb文件夹所在路径，输入如下命令：
   （1）查看设备连接状态：adb devices
   （2）安装已经下载好的APP：adb install D://SkodaEQ.apk

注：D://SkodaEQ.apk 是在笔记本磁盘里已经下载好的APP路径

<p align="center">解锁USB模式</p>
![Popular](/photo/album/image/image_156.png "推荐系列-#斯柯达#柯迪亚克9寸中控屏安装第三方APP")
![Popular](/photo/album/image/image_157.png "推荐系列-#斯柯达#柯迪亚克9寸中控屏安装第三方APP")
![Popular](/photo/album/image/image_158.png "推荐系列-#斯柯达#柯迪亚克9寸中控屏安装第三方APP")

<p align="center">使用adb命令安装APP</p>
![Popular](/photo/album/image/image_160.png "推荐系列-#斯柯达#柯迪亚克9寸中控屏安装第三方APP")
![Popular](/photo/album/image/image_159.png "推荐系列-#斯柯达#柯迪亚克9寸中控屏安装第三方APP")


### 三、问题

1. 安装失败，提示INSTALL_FAILED_OLDER_SDK

原因：APP支持平台最低版本minSdkVersion太高，需要更换低版本的APP安装，例如：
APP需要Android 4.0以平台运行，而中控屏系统版本为1.3

2. 关闭默认启动的收音机，替换为默认启动为音乐播放器的问题

待解：论坛里帖子太含糊，都是有风险的替换，不够详细，可以留言一下
尝试：我的车机版本1.31Release，使用附件中，第二个帖子提供的脚本，运行后，设置中多了一项默认第三方音乐播放器，但是中控屏四周触屏按键失效，收音机、多媒体打开无反应，间隔一会儿中控屏就重启，通过修改脚本，替换备份的hkmanager.apk，再运行一次，原功能恢复正常！

注：小白，谨慎替换，当时都有点慌，还好没死机，不然没得救。

![Popular](/photo/album/image/image_161.png "推荐系列-#斯柯达#柯迪亚克9寸中控屏安装第三方APP")

### 四、参考

集结一下相关可参考的帖子，adb文件，可以以帖子里载，或者百度下载一个

1. 9寸安卓车机隐藏密码打开USB从模式安装软件

https://club.autohome.com.cn/bbs/thread/84fffc2a4d664764/86248552-1.html

2. 破解开机打开收音机、酷我?QQ音乐方向盘?切换歌曲?安装限制

https://club.autohome.com.cn/bbs/thread/532d43b11f73ae35/81904759-1.html

### 五、附件

附件清单

1.adb工具  [https://www.hosiang.cn/cheji/adb-tools.zip](https://www.hosiang.cn/cheji/adb-tools.zip)

2.SkodaEQ [https://www.hosiang.cn/cheji/SkodaEQ.apk](https://www.hosiang.cn/cheji/SkodaEQ.apk)

3.电视家   [https://www.hosiang.cn/cheji/dainshijia.apk](https://www.hosiang.cn/cheji/dainshijia.apk)

