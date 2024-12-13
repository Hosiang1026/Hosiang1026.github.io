---
title: 推荐系列-Android 系统开发做什么-
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 2072
cover_picture: 'https://img-blog.csdnimg.cn/img_convert/98d3af1c97b4c11f07f80c4fa609909a.png'
abbrlink: 542f44b8
date: 2021-04-15 09:46:45
---

&emsp;&emsp;题外话 18 年我从 Android 应用开发转 Framework 层开发了，从此开启了 996 幸福生活，博客技术文更新基本停滞了，被工作占据了过多的精力，实在没时间像以前一样拟稿、写作，实践、反复修改...
<!-- more -->

                                                                                                                                                                                        ![Test](https://img-blog.csdnimg.cn/img_convert/98d3af1c97b4c11f07f80c4fa609909a.png  'Android 系统开发做什么-') 
#### 题外话 
18 年我从 Android 应用开发转 Framework 层开发了，从此开启了 996 幸福生活，博客技术文更新基本停滞了，被工作占据了过多的精力，实在没时间像以前一样拟稿、写作，实践、反复修改去精心准备文章，另外也不知道该写什么了，很多经验心得都会涉及到项目本身，公司内部倒是写了不少总结文档，然而工作的事不便公开分享出来。我是一个在乎别人的看法，之前被很多人骂“江郎才尽”，其实我是很难受的。 
在转 Framework 其实一开始我是很不适应，适应新环境也并没有想象当中那么容易，因此变得更不自信了，对自己的定位更加模糊，每半年换一个模块，从一开始做性能开发、转系统应用开发、又转通讯开发，刚有点感觉，因为工作调整，被安排做其他，技术没沉淀，总感觉虚的很。 
#### Android 系统架构 
![Test](https://img-blog.csdnimg.cn/img_convert/98d3af1c97b4c11f07f80c4fa609909a.png  'Android 系统开发做什么-') 
这是来自官方 Android 系统架构，从上往下依次为应用框架（Application Framework）、Binder IPC proxies、系统服务（Android System Services）、硬件抽象层 (HAL)、Linux 内核。 
#### Application Framework 
![Test](https://img-blog.csdnimg.cn/img_convert/98d3af1c97b4c11f07f80c4fa609909a.png  'Android 系统开发做什么-') 
从旧版架构图可以看出 Application Framework 大概有： 
 
  
   
   名称 
   简介 
   
  
  
   
   Activity Manager 
   用来管理应用程序生命周期并提供常用的导航回退功能。 
   
   
   Window Manager 
   提供一些我们访问手机屏幕的方法，如屏幕的透明度、亮度、背景。 
   
   
   Content Providers 
   使得应用程序可以访问另一个应用程序的数据（如联系人数据库)， 或者共享它们自己的数据。 
   
   
   View System 
   可以用来构建应用程序， 它包括列表（Lists)，网格（Grids)，文本框（Text boxes)，按钮（Buttons)， 甚至可嵌入的 web 浏览器。 
   
   
   Notification Manager 
   使得应���程序可以在状态栏中显示自定义的提示信息。 
   
   
   Package Manager 
   提供对系统的安装包的访问，包括安装、卸载应用，查询 permission 相关信息，查询 Application 相关信息等。 
   
   
   Telephony Manager 
   主要提供了一系列用于访问与手机通讯相关的状态和信息的方法，查询电信网络状态信息，SIM 卡的信息等。 
   
   
   Resource Manager 
   提供非代码资源的访问，如本地字符串，图形，和布局文件（Layout files )。 
   
   
   Location Manager 
   提供设备的地址位置的获取方式，很显然，GPS 导航肯定能用到位置服务。 
   
   
   XMPP 
   可扩展通讯和表示协议，前身为 Jabber，提供即时通信服务。例如推送功能，Google Talk。 
   
  
 
##### Binder IPC proxies 
Binder 作为 Android 系统提供的一种通信方式， Binder IPC 层：作为「系统服务层」与「应用程序框架层」的 IPC 桥梁，互相传递接口调用的数据，实现跨进层的通讯。 
##### Android System Services 
Android System Services 是专注于特定功能的模块化组件，如进行窗口相关的操作会用到窗口管理服务 
 ```java 
  WindowManager
  ``` 
 ，进行电源相关的操作会用到电源管理服务 
 ```java 
  PowerManager
  ``` 
 ，还有很多其他的系统管理服务，如通知管理服务 
 ```java 
  NotifacationManager
  ``` 
 、振动管理服务 
 ```java 
  Vibrator
  ``` 
 、电池管理服务 
 ```java 
  BatteryManager
  ``` 
 等。应用框架 API 所提供的功能可与系统服务通信，以访问底层硬件。 
Android 包含两组服务：“系统”（诸如窗口管理器和通知管理器之类的服务）和“媒体”（与播放和录制媒体相关的服务）。 
 
  
   
   名称 
   简介 
   
  
  
   
   PowerManagerService 
   电源管理服务 
   
   
   WindowManagerService 
   最核心的服务之一，负责窗口管理 
   
   
   ActivityManagerService 
   最核心的服务之一，管理 Activity 
   
   
   PackageManagerService 
   程序包管理服务 
   
   
   AccountManagerService 
   账户管理服务，是指联系人账户 
   
   
   ContentService 
   ContentProvider 服务，提供跨进程数据交换 
   
   
   BatteryService 
   电池管理服务 
   
   
   LightsService 
   自然光强度感应传感器服务 
   
   
   VibratorService 
   震动器服务 
   
   
   AlarmManagerService 
   定时器管理服务，提供定时提醒服务 
   
   
   BluetoothService 
   蓝牙服务 
   
   
   DevicePolicyManagerService 
   提供一些系统级别的设置及属性 
   
   
   StatusBarManagerService 
   状态栏管理服务 
   
   
   ClipboardService 
   系统剪切板服务 
   
   
   InputMethodManagerService 
   输入法管理服务 
   
   
   NetworkStatsService 
   网络状态服务 
   
   
   NetworkManagementService 
   网络管理服务 
   
   
   ConnectivityService 
   网络连接管理服务 
   
   
   MountService 
   挂载服务 
   
   
   NotificationManagerService 
   通知栏管理服务 
   
   
   DeviceStorageMonitorService 
   磁盘空间状态检测服务 
   
   
   LocationManagerService 
   地理位置服务 
   
   
   SearchManagerService 
   搜索管理服务 
   
   
   WallpaperManagerService 
   墙纸管理服务，墙纸不等同于桌面背景，在 View 系统内部，墙纸可以作为任何窗口的背景 
   
   
   AudioService 
   音频管理服务 
   
   
   BackupManagerService 
   系统备份服务 
   
   
   AppWidgetService 
   Widget 服务 
   
   
   DiskStatsService 
   磁盘统计服务 
   
   
   SurfaceFlinger 
   负责 Layer 合成（composer），创建 surface，管理 surface 
   
  
 
##### 硬件抽象层 (HAL) 
HAL 可定义一个标准接口以供硬件供应商实现，该接口使 Android 无需考虑底层驱动程序的实现。使用 HAL 可使您实现功能而不会影响或修改更高级别的系统。HAL 实现会被封装成模块，并会由 Android 系统适时地加载。 
##### Linux 内核 
Android 基于 Linux 提供核心系统服务，如显示驱动、Camera 驱动、蓝牙驱动、音频系统驱动、Binder (IPC) 驱动、USB 驱动、WiFi 驱动、电源管理等。 
Linux 内核也作为硬件和软件之间的抽象层，它隐藏具体硬件细节而为上层提供统一的服务。 
#### 开发 
谷歌发布版本，就是 AOSP 原生代码。AOSP 原生代码只支持极少数几款手机，比如 Pixel。 
芯片厂商如高通、MTK、展锐在 AOSP 基础上发布自己的版本，每个芯片厂商会在 AOSP 原生代码上叠加自己的功能，比如双卡双待功能。 
我们开发就是芯片商释放的代码，我们工作大部分就是解 Bug，比较低级，有部分需求定制，也基本是依赖芯片商支持。 
![Test](https://img-blog.csdnimg.cn/img_convert/98d3af1c97b4c11f07f80c4fa609909a.png  'Android 系统开发做什么-') 
从编程语言上来说，Android 系统层有很大一部分是用 Java 开发的。另外还有一大部分是用 Native（C/C++）语言开发的，要想在这个领域做到游刃有余，对 Java 和 C++语言要了解。 
Android 系统开发涉及知识点非常多，需要潜下心来学习，目前我做的是多媒体显示服务模块，已经有段时间了，还只是知道的皮毛，路漫漫其修远兮，吾将上下而求索，想成为该领域的专家，还任重道远。
                                        