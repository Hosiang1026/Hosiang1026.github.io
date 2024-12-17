---
title: 柯迪亚克9寸中控屏安装第三方APP-斯柯达
categories: 原创文章
author: 狂欢马克思
tags:
  - Hobby
top: 3
cover_picture: https://pic.haoxiang.eu.org/image/2024/12/15/h2lx3a.png
abbrlink: cebc765c
date: 2024-12-13 10:04:00
---

合众北斗公司-9寸中控屏车机，因有安装白名单以外APP限制，而且采用悟空推送不了的，不需要Root，通用方法：使用双公头USB数据线连接，通过adb命令安装第三方APP，不需要手机开热点WiFi，无任何风险。

<!-- more -->

![Popular](https://pic.haoxiang.eu.org/image/2024/12/15/h2lx3a.png "斯柯达-柯迪亚克9寸中控屏安装第三方APP")

![Popular](https://pic.haoxiang.eu.org/image/2024/12/15/h2ktnw.png "#斯柯达#柯迪亚克9寸中控屏安装第三方APP")

### 一、准备

1. Windows系统的笔记本一款
2. 双公头USB数据线一条（某宝购买，很便宜的）

<p align="center">2018款-柯迪亚克-车机系统信息</p>

![Popular](https://pic.haoxiang.eu.org/image/2024/12/15/h2l2td.png "#斯柯达#柯迪亚克9寸中控屏安装第三方APP")


<p align="center">双公头USB数据线</p>

![Popular](https://pic.haoxiang.eu.org/image/2024/12/15/h2l49p.png "#斯柯达#柯迪亚克9寸中控屏安装第三方APP")

### 二、步骤

1. 解锁USB模式，靠近副驾驶位置的一个主USB插口，默认是只能充电，打开USB模式，拨号界面输入如下密码：
   （1）打开USB模式：`*#534*62559##*`
   （2）关闭USB模式：`*#62559*534##*`

2. 双公头USB数据线连接中控屏和笔记本，一端连接靠近副驾驶位的一个主USB插口，另一端连接笔记本USB插口，确认已经连接上。

3. 使用adb命令安装APP，解压adb文件；cmd命令进入adb文件夹所在路径，输入如下命令：
   （1）查看设备连接状态：`adb devices`
   （2）安装已经下载好的APP：`adb install D://SkodaEQ.apk`

注：`D://SkodaEQ.apk` 是在笔记本磁盘里已经下载好的APP路径

<p align="center">解锁USB模式</p>

![Popular](https://pic.haoxiang.eu.org/image/2024/12/15/h2l22l.png "推荐系列-#斯柯达#柯迪亚克9寸中控屏安装第三方APP")

<p align="center">查看车机是否插上</p>

![Popular](https://pic.haoxiang.eu.org/image/2024/12/15/h2lglv.png "推荐系列-#斯柯达#柯迪亚克9寸中控屏安装第三方APP")

<p align="center">快捷键Ctrl+R, 在adb所在路径上输入cmd, 按回车键</p>

![Popular](https://pic.haoxiang.eu.org/image/2024/12/15/h2ll52.png "推荐系列-#斯柯达#柯迪亚克9寸中控屏安装第三方APP")

<p align="center">使用adb命令安装APP</p>

![Popular](https://pic.haoxiang.eu.org/image/2024/12/15/h2lqsv.png "推荐系列-#斯柯达#柯迪亚克9寸中控屏安装第三方APP")

<p align="center">使用adb命令详细如下</p>

![Popular](https://pic.haoxiang.eu.org/image/2024/12/15/h2ll7e.png "推荐系列-#斯柯达#柯迪亚克9寸中控屏安装第三方APP")

`注：adb使用问题，很多小白不懂，其实免安装的，也不需要去配置全局环境变量，最简单的方法：快捷键Ctrl+R, 在adb所在路径上输入cmd, 按回车键`

### 三、问题

1. 安装失败，提示INSTALL_FAILED_OLDER_SDK

原因：APP支持平台最低版本minSdkVersion太高，需要更换低版本的APP安装，例如：
APP需要Android 4.0以平台运行，而中控屏系统版本为1.3

2. 关闭默认启动的收音机，替换为默认启动为音乐播放器的问题

待解：论坛里帖子太含糊，都是有风险的替换，不够详细，可以留言一下
尝试：我的车机版本1.31Release，使用附件中，第二个帖子提供的脚本，运行后，设置中多了一项默认第三方音乐播放器，但是中控屏四周触屏按键失效，收音机、多媒体打开无反应，间隔一会儿中控屏就重启，通过修改脚本，替换备份的hkmanager.apk，再运行一次，原功能恢复正常！

注：小白，谨慎替换，当时都有点慌，还好没死机，不然没得救。

![Popular](https://pic.haoxiang.eu.org/image/2024/12/15/h2lpx0.png "#斯柯达#柯迪亚克9寸中控屏安装第三方APP")

### 四、参考

集结一下相关可参考的帖子，adb文件，可以帖子里下载或者百度下载一个

1. 9寸安卓车机隐藏密码打开USB从模式安装软件

https://club.autohome.com.cn/bbs/thread/84fffc2a4d664764/86248552-1.html

2. 破解开机打开收音机、酷我?QQ音乐方向盘?切换歌曲?安装限制

https://club.autohome.com.cn/bbs/thread/532d43b11f73ae35/81904759-1.html

### 五、工程模式

![Popular](https://pic.haoxiang.eu.org/image/2024/12/15/126znpo.jpg "推荐系列-#斯柯达#柯迪亚克9寸中控屏安装第三方APP")

这个截图，来自其他车型破解方法

![Popular](https://pic.haoxiang.eu.org/image/2024/12/15/126zg10.jpg "推荐系列-#斯柯达#柯迪亚克9寸中控屏安装第三方APP")

![Popular](https://pic.haoxiang.eu.org/image/2024/12/15/126zgsj.jpg "推荐系列-#斯柯达#柯迪亚克9寸中控屏安装第三方APP")

2018款柯迪亚克-舒适版，中控屏版本信息，屏幕的四角按顺序点击，就可以出现下面的隐藏页面：

![Popular](https://pic.haoxiang.eu.org/image/2024/12/15/126zh6v.jpg "推荐系列-#斯柯达#柯迪亚克9寸中控屏安装第三方APP")

工程模式，看上去很简单，不知道有没有隐藏啥后门，大家可以尝试碰碰运气

USB调试模式打开，可能藏在这里，也许就是那些说悟空搜索不到或ADB连接不上的原因

![Popular](https://pic.haoxiang.eu.org/image/2024/12/15/126zm4y.jpg "推荐系列-#斯柯达#柯迪亚克9寸中控屏安装第三方APP")

升级入口，有原厂固件就可以升级，甚至可以自己定制修改。

发生故障，可以通过日志排查问题，这一般都是我们开发人员查找问题依据。

![Popular](https://pic.haoxiang.eu.org/image/2024/12/15/126zk4j.jpg "推荐系列-#斯柯达#柯迪亚克9寸中控屏安装第三方APP")

![Popular](https://pic.haoxiang.eu.org/image/2024/12/15/126zmmb.jpg "推荐系列-#斯柯达#柯迪亚克9寸中控屏安装第三方APP")

收音机设置，左边输入数字，不知道是啥密码。上面的收音机参数，用处不太清楚，也不敢轻易修改。

### 六、附件

附件清单

1.adb工具

2.SkodaEQ 

