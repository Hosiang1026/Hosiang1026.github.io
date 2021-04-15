---
title: 推荐系列-Cloudreve 自建云盘实践，我说了没人能限得了我的容量和速度！
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 759
cover_picture: 'https://oscimg.oschina.net/oscnet/3fc9b380-f942-4591-a91c-33e8563c9cfd.jpg'
abbrlink: d0906fdf
date: 2021-04-15 10:16:57
---

&emsp;&emsp;持续坚持原创输出，点击蓝字关注我吧 作者：小傅哥 博客：https://bugstack.cn ❝ 沉淀、分享、成长，让自己和他人都能有所收获！😜 ❞ 目录 一、前言 二、Cloudreve 介绍 🔉 功能 ✨ 特...
<!-- more -->

                                                                                                                                                                                         
  
   
  ##### 持续坚持原创输出，点击蓝字关注我吧 
  ![Test](https://oscimg.oschina.net/oscnet/3fc9b380-f942-4591-a91c-33e8563c9cfd.jpg  'Cloudreve 自建云盘实践，我说了没人能限得了我的容量和速度！') 
  作者：小傅哥博客：https://bugstack.cn 
   
  
  
   
  ### 目录 
   
   
   一、前言 
   二、Cloudreve 介绍 
    
    🔉 功能 
    ✨ 特性 
    📌 资料 
    
   三、环境准备 
   四、宝塔配置 
    
    1. 获取用户名和密码 
    2. 8888 端口授权 
    3. 登录宝塔后台 
    
   五、服务安装 
    
    1. 在宝塔终端查看服务内核 
    2. 下载和安装 
    3. 开放端口 5212 
    4. 登录服务 
    
   六、进程守护 
    
    1. Supervisor 配置 
    2. Supervisor 启动 
    
   七、配置域名 
    
    1. 解析域名 
    2. 反向代理 
    
   八、数据库切换 
   九、总结 
   十、系列推荐 
   
   
   
  #### 一、前言 
   
 ```java 
  为啥要用自建网盘，市面上的云盘不香了？
  ``` 
  
  每一个用户需求的背后都是因为有场景存在，而这些差异化的场景也都是因为不同的用户类型产生的。 
  就像我作为技术号主想分享一些自己总结的资料，放到一些云盘以后有时候会被其他不知道从哪冒出来的小伙伴给举报，举报链接就取消了，取消了链接也就影响了我的资料分享。同时我可能还希望我的分享内容能被记录到下载次数、允许几次下载、下载时是否要做一些引流动作等等。 
  所以类似这样的特殊场景下就需要自建网盘来维护个人需要的资料，与之类似的还有一些公司或者组织都会建相对私域的网盘功能服务功能，给予内部用户使用。 
  所以，也并不一定市面的网盘不香了，只是因为我有需要自建网盘。在这条路上我尝试过自建、kodexplorer、Owncloud等，恰巧最近发现了 Cloudreve 尝试体验后感觉更香，支持的功能更多。所以准备给小伙伴分享下关于 Cloudreve 的安装、配置和使用，也让有需要的小伙伴可以尝尝鲜。 
   
  #### 二、Cloudreve 介绍 
  Cloudreve，帮助您以最低的成本快速搭建公私兼备的网盘系统。 
  ![Test](https://oscimg.oschina.net/oscnet/3fc9b380-f942-4591-a91c-33e8563c9cfd.jpg  'Cloudreve 自建云盘实践，我说了没人能限得了我的容量和速度！') 
   
  ##### 🔉 功能 
  ![Test](https://oscimg.oschina.net/oscnet/3fc9b380-f942-4591-a91c-33e8563c9cfd.jpg  'Cloudreve 自建云盘实践，我说了没人能限得了我的容量和速度！') 
   
  ##### ✨ 特性 
   
    
    
      ☁️ 支持本机、从机、七牛、阿里云 OSS、腾讯云 COS、又拍云、OneDrive (包括世纪互联版) 作为存储端 
     
    
    
      📤 上传/下载 支持客户端直传，支持下载限速 
     
    
    
      💾 可对接 Aria2 离线下载 
     
    
    
      📚 在线 压缩/解压缩、多文件打包下载 
     
    
    
      💻 覆盖全部存储策略的 WebDAV 协议支持 
     
    
    
      ⚡ 拖拽上传、目录上传、流式上传处理 
     
    
    
      🗃️ 文件拖拽管理 
     
    
    
      👩‍👧‍👦 多用户、用户组 
     
    
    
      🔗 创建文件、目录的分享链接，可设定自动过期 
     
    
    
      👁️‍🗨️ 视频、图像、音频、文本、Office 文档在线预览 
     
    
    
      🎨 自定义配色、黑暗模式、PWA 应用、全站单页应用 
     
    
    
      🚀 All-In-One 打包，开箱即用 
     
   
   
  ##### 📌 资料 
   
    
    
      官网：https://cloudreve.org 
     
    
    
      文档：https://docs.cloudreve.org/getting-started/install 
     
    
    
      社区：https://forum.cloudreve.org 
     
    
    
      源码：https://github.com/cloudreve/Cloudreve 
     
    
    
      演示：https://demo.cloudreve.org 
     
   
   
  #### 三、环境准备 
  ![Test](https://oscimg.oschina.net/oscnet/3fc9b380-f942-4591-a91c-33e8563c9cfd.jpg  'Cloudreve 自建云盘实践，我说了没人能限得了我的容量和速度！') 
   
    
    
      云服务器资源或本地服务器，推荐腾讯云轻量服务器，内含宝塔组件，算是是几个云服务里最简单��：https://console.cloud.tencent.com/lighthouse/instance/index 
     
    
    
      已备案过的域名，如果不需要域名访问，可以直接使用云服务提供的公网IP 
     
    
    
      Cloudreve安装包：https://github.com/cloudreve/Cloudreve/releases 
     
   
  本章节的案例是基于腾讯云的，如果你使用的是其他云服务器，找到对应的位置配置即可。这些云服务使用方式基本大同小异，遇到问题可以联系对应的云服务客服，不要联系我哈哈哈😄 
   
  #### 四、宝塔配置 
  宝塔是一个简单好用的Linux/Windows服务器运维管理面板，在宝塔后台页面上可以非常方便的安全软件和配置环境。一般可以在云服务器上安装宝塔，有一些厂商也把宝塔集成到自己的云服务器上了。 
   
  ##### 1. 获取用户名和密码 
  ![Test](https://oscimg.oschina.net/oscnet/3fc9b380-f942-4591-a91c-33e8563c9cfd.jpg  'Cloudreve 自建云盘实践，我说了没人能限得了我的容量和速度！') 
   
    
    
      地址：https://console.cloud.tencent.com/lighthouse/instance/detail?rid=8&id=lhins-90pixwzq&tab=application 
     
    
    
      进入服务的应用管理会看到 
      
 ```java 
  应用内软件信息：宝塔
  ``` 
 ，在这里点击 
     登录按钮后，会获取到宝塔的登录地址、用户名和密码信息「 
     这些信息可以后期在宝塔后台修改」。 
      
 ```java 
   * Socket connection established * Last login: Sat Apr 10 09:33:50 2021 from 119.29.96.147 [lighthouse@VM-8-9-centos ~]$ sudo /etc/init.d/bt default ================================================================== BT-Panel default info! ================================================================== 外网面板地址: http://80.71.255.122:8888/cloudtencent 内网面板地址: http://10.0.8.9:8888/cloudtencent *以下仅为初始默认账户密码，若无法登录请执行bt命令重置账户/密码登录 username: 3kkjecc3 password: 3f7d2743018b If you cannot access the panel, release the following panel port [8888] in the security group 若无法访问面板，请检查防火墙/安全组是否有放行面板[8888]端口 ==================================================================
  ``` 
  
     
   
   
  ##### 2. 8888 端口授权 
   
   ![Test](https://oscimg.oschina.net/oscnet/3fc9b380-f942-4591-a91c-33e8563c9cfd.jpg  'Cloudreve 自建云盘实践，我说了没人能限得了我的容量和速度！') 
   
   
    
    
      在获取到面板的用户名和密码后，还不能直接访问，因为你的端口还没有授权开通。 
     
    
    
      这时可以在云服务平台上，点击 
      
 ```java 
  防火墙
  ``` 
 这个配置，添加 8888 端口。 
     
   
   
  ##### 3. 登录宝塔后台 
  地址：http://80.71.255.122:8888/cloudtencent -  
 ```java 
  你需要更换为自己的地址
  ``` 
 说明：在初次进入宝塔时会有一些提示和软件安装，选择自己需要的安装即可。页面： 
  ![Test](https://oscimg.oschina.net/oscnet/3fc9b380-f942-4591-a91c-33e8563c9cfd.jpg  'Cloudreve 自建云盘实践，我说了没人能限得了我的容量和速度！') 
   
  #### 五、服务安装 
  在宝塔面板的左侧菜单栏有一个终端菜单，点击进入是一个黑窗口，接下来我们就在这里安装整个服务。 
   
  ##### 1. 在宝塔终端查看服务内核 
  因为不同云服务下可能是 adm 或者 arm 架构，对应下载的 Cloudreve 也会有所不同  
 ```java 
  cloudreve_版本号_操作系统_CPU架构.tar.gz
  ``` 
 ，所以这里我们需要使用  
 ```java 
  arch
  ``` 
  命令查看下服务信息。 
   
 ```java 
  Last failed login: Sat Apr 10 11:38:41 CST 2021 from 194.165.16.68 on ssh:nottyThere were 8 failed login attempts since the last successful login.Last login: Sat Apr 10 09:57:33 2021 from 127.0.0.1[root@VM-8-9-centos ~]# archx86_64
  ``` 
  
   
    
    
      x86_64：代表 amd64 
     
    
    
      aarch64：代表 arm64 
     
   
   
  ##### 2. 下载和安装 
   
   ![Test](https://oscimg.oschina.net/oscnet/3fc9b380-f942-4591-a91c-33e8563c9cfd.jpg  'Cloudreve 自建云盘实践，我说了没人能限得了我的容量和速度！') 
   
  确定好我们的云服务架构后，选择对应的 Cloudreve 版本，复制地址。我的是：https://github.com/cloudreve/Cloudreve/releases/download/3.3.1/cloudreve_3.3.1_linux_amd64.tar.gz 
  安装命令 
   
 ```java 
  mkdir /www/wwwroot/cloudreve    # 创建一个新文件夹存放程序cd /www/wwwroot/cloudreve           # 进入这个文件夹wget https://github.com/cloudreve/Cloudreve/releases/download/3.3.1/cloudreve_3.3.1_linux_amd64.tar.gz # 下载你复制的链接tar -zxvf cloudreve_3.3.1_linux_amd64.tar.gz   # 解压获取到的主程序chmod +x ./cloudreve                               # 赋予执行权限./cloudreve                                        # 启动 Cloudreve# 运行信息截取[Info]    2021-04-10 10:39:59 初始化数据库连接[Info]    2021-04-10 10:39:59 开始进行数据库初始化...[Info]    2021-04-10 10:39:59 初始管理员账号：admin@cloudreve.org[Info]    2021-04-10 10:39:59 初始管理员密码：U4BfStlm[Info]    2021-04-10 10:40:00 数据库初始化结束[Info]    2021-04-10 10:40:00 初始化任务队列，WorkerNum = 10[Info]    2021-04-10 10:40:00 初始化定时任务...[Info]    2021-04-10 10:40:00 当前运行模式：Master[Info]    2021-04-10 10:40:00 开始监听 :5212
  ``` 
  
   
    
    
      wget，替换为你的 Cloudreve 地址 
     
    
    
      tar，是对应名称一起替换 
     
    
    
      最后把这些命令复制到你的终端黑窗口，它就开始运行安装了。 
     安装完成以后你会得到一个初始的用户名和密码，复制粘贴保存起来 
     
   
   
  ##### 3. 开放端口 5212 
   
    
    
      Cloudreve 安装完成以后，访问地址为你的服务IP:5212，但此时5212并不能直接访问还需要授权。 
     ![Test](https://oscimg.oschina.net/oscnet/3fc9b380-f942-4591-a91c-33e8563c9cfd.jpg  'Cloudreve 自建云盘实践，我说了没人能限得了我的容量和速度！') 
     
    
    
      仅在宝塔后台授权还不够，还需要在云服务平台的防火墙进行授权，如下： 
     ![Test](https://oscimg.oschina.net/oscnet/3fc9b380-f942-4591-a91c-33e8563c9cfd.jpg  'Cloudreve 自建云盘实践，我说了没人能限得了我的容量和速度！') 
     
   
   
  ##### 4. 登录服务 
   
    
    
      地址：http://80.71.255.122:5212 
     
   
  ![Test](https://oscimg.oschina.net/oscnet/3fc9b380-f942-4591-a91c-33e8563c9cfd.jpg  'Cloudreve 自建云盘实践，我说了没人能限得了我的容量和速度！') 
   
    
    
      如果一切顺利现在你就可以使用自己的网盘了，但有一点要知道如果你还需要设置域名，那么这个时候先不要使用，先去设置域名，否则一些图片在IP下上传和在域名下上传，分享是有问题的。 
     
   
   
  #### 六、进程守护 
  其实在服务安装完成后就已经可以正常使用了，但我们很难保证宝塔面板不被重启或者出现异常时也难免要我们自己再启动云盘服务。那么，就需要一个守护进程来自动重启服务。 
  在宝塔面板的软件商店中，找到  
 ```java 
  Supervisor
  ``` 
  安装。Supervisor是用Python开发的一套通用的进程管理程序，能将一个普通的命令行进程变为后台daemon，并监控进程状态，异常退出时能自动重启。 
   
  ##### 1. Supervisor 配置 
  ![Test](https://oscimg.oschina.net/oscnet/3fc9b380-f942-4591-a91c-33e8563c9cfd.jpg  'Cloudreve 自建云盘实践，我说了没人能限得了我的容量和速度！') 
   
    
    
      名称：Cloudreve 
     
    
    
      启动用户：root 
     默认的 
     
    
    
      运行目录：/www/wwwroot/cloudreve/ 
     
    
    
      启动命令：/www/wwwroot/cloudreve/cloudreve 
     
   
   
  ##### 2. Supervisor 启动 
   
   ![Test](https://oscimg.oschina.net/oscnet/3fc9b380-f942-4591-a91c-33e8563c9cfd.jpg  'Cloudreve 自建云盘实践，我说了没人能限得了我的容量和速度！') 
   
   
    
    
      配置守护进程后，点开宝塔面板右上角的重启，进入后 
      
 ```java 
  重启服务
  ``` 
  
     
    
    
      重启后再进入到宝塔面板就会看到守护进程已经在启动了，现在启动这个事就交给了 Supervisor 管理 
     
   
   
  #### 七、配置域名 
   
  ##### 1. 解析域名 
   
   ![Test](https://oscimg.oschina.net/oscnet/3fc9b380-f942-4591-a91c-33e8563c9cfd.jpg  'Cloudreve 自建云盘实践，我说了没人能限得了我的容量和速度！') 
   
   
    
    
      在配置域名之前，需要在你已经准备好的域名下配置一个A记录解析，这样后面才能配置反向代理。 
     
   
   
  ##### 2. 反向代理 
  ![Test](https://oscimg.oschina.net/oscnet/3fc9b380-f942-4591-a91c-33e8563c9cfd.jpg  'Cloudreve 自建云盘实践，我说了没人能限得了我的容量和速度！') 
   
    
    
      点击宝塔面板左侧菜单中的 
      
 ```java 
  网站
  ``` 
 按钮，添加一个站点。站点里的域名就是配置解析域名时的信息，我的是 
      
 ```java 
  pan.itedus.cn
  ``` 
  
     
    
    
      配置完站点后就需要给这个站点设置一个反向代理，点击它的设置即可进入。在反向代理中添加并设置目标URL：127.0.0.1:5212 
     
    
    
      最后，如果你的域名已经解析完成，那么现在你就可以通过域名访问你的云盘服务了，还可以上传和分享文件。例如我分享的文件：http://pan.itedus.cn/s/qofO 
     
   
   
  #### 八、数据库切换 
  系统默认的数据库是自带的 SQLite，你可改为 Mysql，如下： 
  ![Test](https://oscimg.oschina.net/oscnet/3fc9b380-f942-4591-a91c-33e8563c9cfd.jpg  'Cloudreve 自建云盘实践，我说了没人能限得了我的容量和速度！') 
   
    
    
      数据库类型，目前支持 sqlite | mysql Type = mysql 
     
    
    
      用户名 User = Cloudreve 
     
    
    
      密码 Password = Cloudreve 
     
    
    
      数据库地址 Host = 127.0.0.1 
     
    
    
      数据库名称 Name = Cloudreve 
     
    
    
      数据表前缀 TablePrefix = cd_ 
     
   
   
    
    
      切换完记得使用命令的方式进��重��，因为此时它需要重新创建账号和密码 
     
    
    
      如果你没有看见账号和密码，那么可以把创建的数据库删掉，重新来一次 
     
   
   
  #### 九、总结 
   
    
    
      关于 Cloudreve 云盘的安装和使用就演示到这里了，如果你感兴趣也可以自己搭建一个。另外 Cloudreve 可以获取到它的源码，在源码的基础上可以添加一些想要的功能，比如在下载的时候设置为关注某些东西在下载等等。 
     
    
    
      除了 Cloudreve 云盘还可以尝试下有道云，这个云盘直接在简单的服务器上就可以直接安装，也可以自动升级，使用起来会简单一些。 
     
    
    
      无论是云服务还是各类工具，多尝试一些这样的东西，可以给自己增加很多其他知识面的理解。也许弄着弄着，你就不只是一个简单的CRUD开发工程师了，可能还是运维、产品、业务！ 
     
   
   
  #### 十、系列推荐 
   
    
     
     另外一种可道云网盘的搭建，也很不错 
     
    
     
     一天建4个，小傅哥教你搭博客！ 
     
    
     
     为了省钱，我用1天时间把PHP学了！ 
     
    
     
     Github被攻击。我的GitPage博客也挂了，紧急修复之路，也教会你搭建 Jekyll 博客！ 
     
    
     
     Netty+JavaFx实战：仿桌面版微信聊天 
     
   
  
  
  - END - 
   
  下方扫码关注 bugstack虫洞栈，与小傅哥一起学习成长、共同进步，做一个码场最贵Coder！ 
   
    
     
     回复【设计模式】，下载《重学Java设计模式》，这是一本互联网真实案例的实践书籍，从实际业务中抽离出，交易、营销、秒杀、中间件、源码等众多场景进行学习代码设计。 
     
    
     
     回复【面经手册】，下载《面经手册 • 拿大厂Offer》，这是一本有深度的Java核心内容，从数据结构、算法、并发编程以及JVM系8不断深入讲解，让懂了就是真的懂。 
     
   
  ![Test](https://oscimg.oschina.net/oscnet/3fc9b380-f942-4591-a91c-33e8563c9cfd.jpg  'Cloudreve 自建云盘实践，我说了没人能限得了我的容量和速度！') 
   
   你好，我是小傅哥。一线互联网 
    
 ```java 
  java
  ``` 
  
   工程师、架构师，开发过交易&营销、写过运营&活动、设计过中间件也倒腾过中继器、IO板卡。不只是写Java语言，也搞过C#、PHP，是一个技术活跃的折腾者。 
    
   
   
   2020年写了一本PDF 
   《重学Java设计模式》 
   ，全网下载量30万+，帮助很多同学成长。同年 github 的两个项目， 
    
 ```java 
  CodeGuide
  ``` 
  
   、 
    
 ```java 
  itstack-demo-design
  ``` 
  
   ，持续霸榜 Trending，成为全球热门项目。 
    
   
   
   2021年上架一本小册 
   《SpringBoot 中间件设计和开发》 
   ，16个互联网中间件场景、30个工程，是全网唯一一次手把手教你造轮子、写中间件，因为这样的技术离P7最近、离架构师最近、离高薪资最近！ 
   
  
 
本文分享自微信公众号 - bugstack虫洞栈（bugstack）。如有侵权，请联系 support@oschina.cn 删除。本文参与“OSC源创计划”，欢迎正在阅读的你也加入，一起分享。
                                        