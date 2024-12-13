---
title: 推荐系列-第三天用 Mac，我安装了这些-好玩意-！
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 2044
cover_picture: 'https://oscimg.oschina.net/oscnet/cd69069e-0e25-417b-98ef-94fc02c2c84a.jpg'
abbrlink: 453df1e
date: 2021-04-15 09:46:45
---

回复 PDF 领取资料 这是悟空的第 89 篇原创文章 作者 | 悟空聊架构 来源 | 悟空聊架构（ID：PassJava666） 转载请联系授权（微信ID：PassJava） 上周老婆打赏了一个 Mac Book，拿到手后非常激...
<!-- more -->

                                                                                                                                                                                         
 回复 PDF 领取资料  
 ![Test](https://oscimg.oschina.net/oscnet/cd69069e-0e25-417b-98ef-94fc02c2c84a.jpg  '第三天用 Mac，我安装了这些-好玩意-！') 
 这是悟空的第 89 篇原创文章 
 作者 | 悟空聊架构 
 来源 | 悟空聊架构（ID：PassJava666） 
  
  转载请联系授权（微信ID：PassJava） 
  
  
  上周老婆打赏了一个 Mac Book，拿到手后非常激动，人生中第一台 Mac。但是发现不会用，连个 git 都不会安装。 
  不懂就学，于是搜各种教程，学习的过程中也安装了些非常有用的软件，这里做个归纳。 
  ![Test](https://oscimg.oschina.net/oscnet/cd69069e-0e25-417b-98ef-94fc02c2c84a.jpg  '第三天用 Mac，我安装了这些-好玩意-！') 
   
  #### 一、提速神器 
   
  ##### 1.1 快捷键之王-cheatsheet 
  要想 Mac 用起来飞快，快捷键的使用必须学点。每次想使用快捷键的时候都要去百度上搜是哪个快捷键，确实很麻烦，所以找到了这个神器：cheatsheet，快捷键之���，通过长按 command 键 2s，即可快速唤出当前应用程序可使用的快捷键。另外还支持打印快捷键列表。 
  cheatsheet 的界面就是这样了： 
  ![Test](https://oscimg.oschina.net/oscnet/cd69069e-0e25-417b-98ef-94fc02c2c84a.jpg  '第三天用 Mac，我安装了这些-好玩意-！') 
  注意：Mac 上可能打不开 cheatsheet，那是因为权限问题，可以到隐私和安全中允许使用 cheatsheet。 
   
  ##### 1.2 包管理工具 Homebrew 
  Homebrew 是mac的包管理器，类似于ubuntu的 
 ```java 
  apt-get
  ``` 
 , centos的 
 ```java 
  yum
  ``` 
  
  安装 brew 软件： 
   
 ```java 
  /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
  ``` 
  
  使用 brew 的国内镜像 
   
 ```java 
  cd "$(brew --repo)" && git remote set-url origin https://git.coding.net/homebrew/homebrew.gitcd $home && brew update
  ``` 
  
   
  ##### 1.3 Items2 
  Mac 自带的控制台不好用，所以用了这一款控制台工��。 
   
   ![Test](https://oscimg.oschina.net/oscnet/cd69069e-0e25-417b-98ef-94fc02c2c84a.jpg  '第三天用 Mac，我安装了这些-好玩意-！') 
   
  官网：https://www.iterm2.com 
  标签页操作 
   
    
    
      新建标签页: Command + T 
     
    
    
      关闭标签页: Command + W 
     
    
    
      前一个标签页: Command + 左方向键，Shift + Command + [ 
     
    
    
      后一个标签页: Command + 右方向键，Shitf + Command + ] 
     
    
    
      进入标签页1，2，3…: Command + 标签页编号 
     
    
    
      Expose 标签页: Option + Command + E（将标签页打到全屏，并可以全局搜索所有的标签页） 
     
   
  面板操作 
   
    
    
      垂直分割: Command + D 
     
    
    
      水平分割: Shift + Command + D 
     
    
    
      前一个面板: Command + [ 
     
    
    
      后一个面板: Command + ] 
     
    
    
      切换到��/下/左/右面板: Option + Command + 上下左右方向键 
     
   
  其他操作 
   
    
    
      进入和退出全屏: Command + Enter 
     
    
    
      查看当前终端中光标的位置: Command + / 
     
    
    
      清屏（重置当前终端）: Command + r 
     
   
   
  ##### 1.4 on-my-zsh 
  on-my-zsh 是改善 mac 自带的 zsh 命令的开源项目。 
  优点： 
   
    
    
      界面美观。 
     
    
    
      支持安装插件。 
     
   
   
 ```java 
  sh -c "$(wget -O- https://gitee.com/shmhlsy/oh-my-zsh-install.sh/raw/master/install.sh)"
  ``` 
  
  安装成功后的提示： 
   
   ![Test](https://oscimg.oschina.net/oscnet/cd69069e-0e25-417b-98ef-94fc02c2c84a.jpg  '第三天用 Mac，我安装了这些-好玩意-！') 
   
  oh-my-zsh有很多漂亮的主题: 
   
 ```java 
  https://github.com/ohmyzsh/ohmyzsh/wiki/themes
  ``` 
  
  配置很简单，打开配置文件  
 ```java 
  ~/.zhsrc
  ``` 
  ，将  
 ```java 
  ZSH_THEME
  ``` 
  值改为你所选的主题名称 
  如： 
   
 ```java 
  $ vim ~/.zshrc# 修改主题名称ZSH_THEME="cloud"
  ``` 
  
  然后重新加载配置文件 
   
 ```java 
  $ source ~/.zshrc
  ``` 
  
   
  ##### 1.5 AutoJump 
  一款在命令控制台中自动进入到指定目录的软件。 
  比如现在我想进入到这个目录： 
   
 ```java 
  /Users/project/01.Github/01.PassJava/passjava-learning
  ``` 
  
  需要敲很多文件夹，或者用 tab 键来补全，不管怎么敲，都需要多个按键才能搞定，有没有一键到这个目录的呢？ 
  那就要用 AutoJump 了。通过 
  安装文档：https://github.com/wting/autojump 
  安装比较简单，用 homebrew 安装： 
   
 ```java 
  brew install autojump
  ``` 
  
  然后配置下 autojump 文件 
   
 ```java 
  vim ~/.zshrc
  ``` 
  
  找到 plugins=，在后面添加autojump： 
   
 ```java 
  plugins=(git autojump)
  ``` 
  
  新开一行，添加这行命令，然后保存退出。 
   
 ```java 
  [[ -s $(brew --prefix)/etc/profile.d/autojump.sh ]] && . $(brew --prefix)/etc/profile.d/autojump.sh
  ``` 
  
  使 .zshrc 文件生效： 
   
 ```java 
  source ～/.zshrc
  ``` 
  
  我将我的项目配置成了一个快捷目录： 
   
 ```java 
  j -a l <目录地址>
  ``` 
  
  然后每次输入以下命令就可以跳转到指定目录了: 
   
 ```java 
  j l
  ``` 
  
   
   ![Test](https://oscimg.oschina.net/oscnet/cd69069e-0e25-417b-98ef-94fc02c2c84a.jpg  '第三天用 Mac，我安装了这些-好玩意-！') 
   
   
  ##### 1.6 命令修正神器 
  这个软件叫做 thefuck。当我们使用命令的时候，如果敲错了某个字母或少了一个破折号，又想快速修正并重新执行，该怎么办？ 
  一般做法就是检查哪里写错了，然后改掉后，重新执行命令。有没有比较快的方式，自动修正然后执行呢？ 
  这就需要 thefuck 了，虽然名字不优雅，但是想表达的意思就是：我去，这里又敲错了！ 
  使用方式如下所示： 
   
   ![Test](https://oscimg.oschina.net/oscnet/cd69069e-0e25-417b-98ef-94fc02c2c84a.jpg  '第三天用 Mac，我安装了这些-好玩意-！') 
   
  传送：http://github.com/nvbn/thefuck 
   
  ###### 1.6.1 安装步骤 
   
 ```java 
  brew install the fuck
  ``` 
  
  然后打开 .zshrc 文件: 
   
 ```java 
  vim ~/.zshrc
  ``` 
  
  添加以下命令到 .zshrc 文件中： 
   
 ```java 
  eval $(thefuck --alias OK)
  ``` 
  
  这里的 OK 是替代 fuck 的，当输入错了命令，重新输入 ok 就能自动修正。 
  比如我想列出当前���件���中所有的文件，输入命令： 
 ```java 
  lll
  ``` 
 ，但是多了一个  
 ```java 
  l
  ``` 
 ，这个时候提示： 
   
 ```java 
  zsh: command not found: lll
  ``` 
  
  然后输入  
 ```java 
  ok
  ``` 
 ，会提示是不是想要输入  
 ```java 
  ll
  ``` 
 命令，按  
 ```java 
  enter
  ``` 
  键即可执行  
 ```java 
  ll
  ``` 
  命令。上下键还可以切换其他命令。如下图所示： 
   
   ![Test](https://oscimg.oschina.net/oscnet/cd69069e-0e25-417b-98ef-94fc02c2c84a.jpg  '第三天用 Mac，我安装了这些-好玩意-！') 
   
   
  #### 二、写文神器 
  因为我经常需要写文章和记笔记，所以把 windows 上的写文神器也搬到了 mac 上。 
   
  ##### 2.1 Typora 
  记笔记，写文章，必备的 Markdown 神器。 
  官网：https://typora.io/ 
   
   ![Test](https://oscimg.oschina.net/oscnet/cd69069e-0e25-417b-98ef-94fc02c2c84a.jpg  '第三天用 Mac，我安装了这些-好玩意-！') 
   
   
  ##### 2.2 Snipaste 
  一款截图软件，好用得不要不要的。可别告诉我你专门下载微信/QQ 来截图。😂 
   
   ![Test](https://oscimg.oschina.net/oscnet/cd69069e-0e25-417b-98ef-94fc02c2c84a.jpg  '第三天用 Mac，我安装了这些-好玩意-！') 
   
  官网：https://zh.snipaste.com/download.html 
   
  ##### 2.3 uPic 
  uPic 是自动上传图片用的，可以配置多种图床，我用的是七牛云的图床。 
  snipaste + uPic + Typora，这三款软件配合使用，写文章，记笔记，完美。 
  先用 snipaste 截图，然后复制到 Typora，就会自动用 uPic 上传，然后上传成功的地址会自动粘贴到 Typora 中。 
   
  ###### 2.3.1 安装 upic 
   
 ```java 
   brew install upic 
  ``` 
  
   
   ![Test](https://oscimg.oschina.net/oscnet/cd69069e-0e25-417b-98ef-94fc02c2c84a.jpg  '第三天用 Mac，我安装了这些-好玩意-！') 
   
   
  ###### 2.3.2 配置 upic 
   
   ![Test](https://oscimg.oschina.net/oscnet/cd69069e-0e25-417b-98ef-94fc02c2c84a.jpg  '第三天用 Mac，我安装了这些-好玩意-！') 
   
     配置 uPic 
    
   
  Typora 偏好设置里面配置图片上传工具为 uPic。 
   
   ![Test](https://oscimg.oschina.net/oscnet/cd69069e-0e25-417b-98ef-94fc02c2c84a.jpg  '第三天用 Mac，我安装了这些-好玩意-！') 
   
   
  #### 三、开发工具 
   
  ##### 3.1 Git 
  Git 可以说是全地球的程序员都要用的代码提交提交工具吧。 
   
  ###### 通过 homebrew 安装 git 
   
 ```java 
  brew install git
  ``` 
  
  另外我换了台新电脑，github 和 gitee 上没有我的电脑的 ssh key。所以需要生成一份新的。 
   
  ###### 生成 ssh key 
   
 ```java 
  ssh-keygen -t rsa
  ``` 
  
  复制 ssh key 
   
 ```java 
  pbcopy < ~/.ssh/id_rsa.pub
  ``` 
  
  并添加到 github 和 gitee 上。 
   
   ![Test](https://oscimg.oschina.net/oscnet/cd69069e-0e25-417b-98ef-94fc02c2c84a.jpg  '第三天用 Mac，我安装了这些-好玩意-！') 
   
     添加 SSH key 
    
   
   
  ##### 3.2 Java JDK 
  目前  
 ```java 
  Zulu JDK
  ``` 
  支持  
 ```java 
  M1
  ``` 
 芯片，可以到下面这个网站进行下载。我下载是 JDK 11 的版本。 
   
 ```java 
  https://www.azul.com/downloads/zulu-community/?os=macos&architecture=arm-64-bit&package=jdk
  ``` 
  
  下载后点击安装，在控制台输入 
 ```java 
  java -version
  ``` 
  
   
   ![Test](https://oscimg.oschina.net/oscnet/cd69069e-0e25-417b-98ef-94fc02c2c84a.jpg  '第三天用 Mac，我安装了这些-好玩意-！') 
   
   
  ##### 3.3 Maven 
  下载 maven 
  https://links.jianshu.com/go?to=https%3A%2F%2Fmaven.apache.org%2Fdownload.cgi 
  解压后移动到熟悉的目录下。 
  配置 
 ```java 
  MAVEN_HOME
  ``` 
 , 修改 
 ```java 
  ~/.zshrc
  ``` 
 文件： 
   
 ```java 
  vim ~/.zshrc
  ``` 
  
  将配置加入到文件末尾 
   
 ```java 
  export MAVEN_HOME=/Users/data/02.software/apache-maven-3.6.3export PATH=$PATH:$MAVEN_HOME/bin
  ``` 
  
  使其生效 
   
 ```java 
  source ~/.zshrc
  ``` 
  
  查看 maven 版本 
   
 ```java 
  mvn -version
  ``` 
  
  如下图所示，打印出了 maven 的版本为 3.6.3 
   
   ![Test](https://oscimg.oschina.net/oscnet/cd69069e-0e25-417b-98ef-94fc02c2c84a.jpg  '第三天用 Mac，我安装了这些-好玩意-！') 
   
   
  ##### 3.4 VS Code 
  Visual Studio Code（简称VS Code）是一款由微软开发且跨平台的免费源代码编辑器。该软件支持语法高亮代码自动补、代码重构、查看定义功能，并且内置了命令行工具和Git版本控制系统。用户可以更改主题和键盘快捷方式实现个性化设置，也可以通过内置的商店安装扩展以拓展软件功能。（来源：维基百科） 
  我比较喜欢用 VS Code 做前端开发。 
  官网：https://code.visualstudio.com/ 
   
   ![Test](https://oscimg.oschina.net/oscnet/cd69069e-0e25-417b-98ef-94fc02c2c84a.jpg  '第三天用 Mac，我安装了这些-好玩意-！') 
   
     VS code 界面 
    
   
   
  #### 四、学习 
   
  ##### 4.1 微信读书 
  我用的电脑是 M1，所以可以下载 iPhone 应用，这不，下载了一个 ios 版的微信读书，用起来非常丝滑，还可以全屏沉浸式阅读。 
  有同学可能会说，不是有网页版的微信读书吗？确实有，但是不能记录我的读书时长。 
  ![Test](https://oscimg.oschina.net/oscnet/cd69069e-0e25-417b-98ef-94fc02c2c84a.jpg  '第三天用 Mac，我安装了这些-好玩意-！')![Test](https://oscimg.oschina.net/oscnet/cd69069e-0e25-417b-98ef-94fc02c2c84a.jpg  '第三天用 Mac，我安装了这些-好玩意-！') 
   
  ##### 4.2 极客时间 
  安装了 ios 版，但是不能登陆！醉了，官方快点更新哟。 
   
   ![Test](https://oscimg.oschina.net/oscnet/cd69069e-0e25-417b-98ef-94fc02c2c84a.jpg  '第三天用 Mac，我安装了这些-好玩意-！') 
   
     极客时间 
    
   
   
  #### 五、常用必备 
  其他一些常用的软件我也列在这吧。 
   
    
    
      迅雷，比 Windows 干净太多了，基本没广告。 
     
    
    
      百度网盘，下载了无法用，还没有和 M1 做兼容，官方快点更新呀～ 
     
    
    
      腾讯会议，开会必备。 
     
    
    
      专注清单，类似番茄钟。 
     
    
    
      IDEA，Xcode 我两个大型开发工具我也下载了，IDEA 后面 spring cloud 项目肯定用得上。XCode 主要是考虑 command line tools。 
     
    
    
      Microsoft To Do，记录准备做那些事情。另外多个设备终端可以相互同步数据，非常棒！ 
     
    
    
      印象笔记+网页剪裁，我一般都是用来备份网站博客内容的，可以一键复制网页内容并保存到印象笔记。 
     
   
  
    当然，还有很多优秀的软件还没有安装，这里只是我目前比较常用的了。 
    
   
   
    
   
  
    参考资料： 
    
   
  https://zhuanlan.zhihu.com/p/160288298 
  https://www.jianshu.com/p/0f011540c7ed 
  
 - END - 
  
   
    
     
      
       
        
         
         写了两本 PDF， 
         回复  
         分布式 
          或  
         PDF  
         下 
         载。 
         
         
         我的 JVM 专栏已上架，回复  
         JVM  
         领取 
         。 
         
        
          个人网站： 
         www.passjava.cn 
         
        
       
      
     
    
    
     
      
      ![Test](https://oscimg.oschina.net/oscnet/cd69069e-0e25-417b-98ef-94fc02c2c84a.jpg  '第三天用 Mac，我安装了这些-好玩意-！') 
      ![Test](https://oscimg.oschina.net/oscnet/cd69069e-0e25-417b-98ef-94fc02c2c84a.jpg  '第三天用 Mac，我安装了这些-好玩意-！') 
       
       我是悟空，努力变强，变身超级赛亚人！ 
       
      
     
    
   
  
 
本文分享自微信公众号 - 悟空聊架构（PassJava666）。如有侵权，请联系 support@oschina.cn 删除。本文参与“OSC源创计划”，欢迎正在阅读的你也加入，一起分享。
                                        