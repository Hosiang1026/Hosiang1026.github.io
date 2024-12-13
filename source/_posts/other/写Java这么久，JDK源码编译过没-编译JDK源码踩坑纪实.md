---
title: 推荐系列-写Java这么久，JDK源码编译过没-编译JDK源码踩坑纪实
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 1859
cover_picture: 'https://static.oschina.net/uploads/img/202008/05162456_QbTv.jpg'
abbrlink: 9b88203a
date: 2021-04-15 09:19:21
---

&emsp;&emsp;好奇害死羊 很多小伙伴们做Java开发，天天写Java代码，肯定离不开Java基础环境：JDK，毕竟我们写好的Java代码也是跑在JVM虚拟机上。 一般来说，我们学Java之前，第一步就是安装JDK环境。这个...
<!-- more -->

                                                                                                                                                                                        ![Test](https://codesheep.oss-cn-hangzhou.aliyuncs.com/blog/20200715232858.png  '写Java这么久，JDK源码编译过没-编译JDK源码踩坑纪实') 
 
 
### 好奇害死羊 
很多小伙伴们做 ```java 
  Java
  ``` 开发，天天写 ```java 
  Java
  ``` 代码，肯定离不开 ```java 
  Java
  ``` 基础环境： ```java 
  JDK
  ``` ，毕竟我们写好的 ```java 
  Java
  ``` 代码也是跑在 ```java 
  JVM
  ``` 虚拟机上。 
一般来说，我们学 ```java 
  Java
  ``` 之前，第一步就是安装 ```java 
  JDK
  ``` 环境。这个简单啊，我们一般直接把 ```java 
  JDK
  ``` 从官网下载下来，安装完成，配个环境变量就可以愉快地使用了。 
不过话说回来，对于这个天天使用的东西，我们难道不好奇这玩意儿它到底是怎么由源码编译出来的吗？ 
带着这个原始的疑问，今天准备大干一场，自己动动呆萌的小手，来编译一个属于自己的 ```java 
  JDK
  ``` 吧！ 
 
 
 
### 还有个待填的坑 
记得之前不是出过一期关于《JDK源码阅读环境搭建》相关的视频以及文章嘛，细心的小伙伴，可能会发现一个很实际的问题： 
 
当然那个视频的评论区，的确也有几个小伙伴提了这个问题： 
![Test](https://codesheep.oss-cn-hangzhou.aliyuncs.com/blog/20200715232858.png  '写Java这么久，JDK源码编译过没-编译JDK源码踩坑纪实') 
![Test](https://codesheep.oss-cn-hangzhou.aliyuncs.com/blog/20200715232858.png  '写Java这么久，JDK源码编译过没-编译JDK源码踩坑纪实') 
![Test](https://codesheep.oss-cn-hangzhou.aliyuncs.com/blog/20200715232858.png  '写Java这么久，JDK源码编译过没-编译JDK源码踩坑纪实') 
原因也很简单，因为实际支撑调试运行的代码，并不是我们解压出来的那份 ```java 
  JDK
  ``` 源码，那个仅仅是做关联用，实际运行用到的 ```java 
  JDK
  ``` ，还是之前系统安装好的那个 ```java 
  JDK
  ``` 环境。 
要想解决这个问题，那就只能使用自己修改过的代码来自行编译生成自己的 ```java 
  JDK
  ``` ，然后用到项目中去！ 
所以什么都憋说了，肝就完了！ 
 
 
### 环境准备 
 
我们来盘点和梳理一下编译一个JDK需要哪些环境和工具： 
 
#### 1、boot JDK 
我们要想编��� ```java 
  JDK
  ``` ，首先自己本机必须提前已经安装有一个 ```java 
  JDK
  ``` ，官方称之为 ```java 
  bootstrap JDK
  ``` （或者称为 ```java 
  boot JDK
  ``` ）。 
比如想编译 ```java 
  JDK 8
  ``` ，那本机必须最起码得有一个 ```java 
  JDK 7
  ``` 或者更新一点的版本；你想编译 ```java 
  JDK 11
  ``` ，那就要求本机必须装有 ```java 
  JDK 10
  ``` 或者 ```java 
  11
  ``` 。 
 
 
#### 2、Unix环境 
编译 ```java 
  JDK
  ``` 需要 ```java 
  Unix
  ``` 环境的支持！ 
这一点在 ```java 
  Linux
  ``` 操作系统和 ```java 
  macOS
  ``` 操作系统上已经天然的保证了，而对于 ```java 
  Windows
  ``` 兄弟来说稍微麻烦一点，需要通过使用 ```java 
  Cygwin
  ``` 或者 ```java 
  MinGW/MSYS
  ``` 这种软件来模拟。 
就像官方所说：在 ```java 
  Linux
  ``` 平台编译 ```java 
  JDK
  ``` 一般问题最少，容易成功； ```java 
  macOS
  ``` 次之； ```java 
  Windows
  ``` 上则需要稍微多花点精力，问题可能也多一些。 
究其本质原因，还是因为 ```java 
  Windows
  ``` 毕竟不是一个 ```java 
  Unix-Like
  ``` 内核的系统，毕竟很多软件的原始编译都离不开 ```java 
  Unix Toolkit
  ``` ，所以相对肯定要麻烦一些。 
 
#### 3、编译器/编译工具链 
 ```java 
  JDK
  ``` 底层源码（尤其 ```java 
  JVM
  ``` 虚拟机部分）很多都是 ```java 
  C++/C
  ``` 写的，所以相关编译器也跑不掉。 
一图胜千言，各平台上的编译器支持如下表所示，按平台选择即可： 
![Test](https://codesheep.oss-cn-hangzhou.aliyuncs.com/blog/20200715232858.png  '写Java这么久，JDK源码编译过没-编译JDK源码踩坑纪实') 
 
#### 4、其他工具 
典型的比如： 
 
   ```java 
  Autoconf
  ``` ：软件源码包的自动配置工���  
   ```java 
  Make
  ``` ：编译构建工具  
   ```java 
  freetype
  ``` ：一个免费的渲染库， ```java 
  JDK
  ``` 图形化部分的代码可能会用它  
 
好，环境盘点就到这里，接下来具体列一下我在编译 ```java 
  JDK 8
  ``` 和 ```java 
  JDK 11
  ``` 时分别用到的软件详细版本信息： 
编译JDK 8时： 
 
   ```java 
  操作系统
  ``` ：macOS 10.11.6  
   ```java 
  boot JDK
  ``` ：JDK 1.8.0 (build 1.8.0_201-b09)  
   ```java 
  Xcode版本
  ``` ：8.2  
   ```java 
  编译器
  ``` ：Version 8.0.0 (at /usr/bin/clang)  
 
编译JDK 11时： 
 
   ```java 
  操作系统
  ``` ：macOS 10.15.4  
   ```java 
  boot JDK
  ``` ：JDK 11.0.7 (build 11.0.7+8-LTS)  
   ```java 
  Xcode版本
  ``` ：11.5  
   ```java 
  编译器
  ``` ：Version 11.0.3 (at /usr/bin/clang)  
 
大家在编译时如果过程中有很多问题，大概率少软件没装，或者软件版本不匹配，不要轻易放弃，需要耐心自查一下。 
 
 
### 下载JDK源码 
下载 ```java 
  JDK
  ``` 源码其实有两种方式。 
 
#### 方式一：通过Mercurial工具下载 
 ```java 
  Mercurial
  ``` 可以理解为和 ```java 
  Git
  ``` 一样，是另外一种代码管理工具，安装好之后就有一个 ```java 
  hg
  ``` 命令可用。 
![Test](https://codesheep.oss-cn-hangzhou.aliyuncs.com/blog/20200715232858.png  '写Java这么久，JDK源码编译过没-编译JDK源码踩坑纪实') 
而 ```java 
  OpenJDK
  ``` 的源码已经提前托管到 ```java 
  http://hg.openjdk.java.net/
  ``` 。 
因此，比如下载 ```java 
  JDK 8
  ``` ，可直接 ```java 
  hg clone
  ``` 一下就行，和 ```java 
  git clone
  ``` 一样： 
 ```java 
  hg clone http://hg.openjdk.java.net/jdk8/jdk8

  ```  
同理，下载 ```java 
  JDK 11
  ``` ： 
 ```java 
  hg clone http://hg.openjdk.java.net/jdk/jdk11

  ```  
但是这种方式下载速度不是很快。 
 
#### 方式二：直接下载打包好的源码包 
下载地址： ```java 
  https://jdk.java.net/
  ```  
![Test](https://codesheep.oss-cn-hangzhou.aliyuncs.com/blog/20200715232858.png  '写Java这么久，JDK源码编译过没-编译JDK源码踩坑纪实') 
选择你想要的版本下载即可。 
 
 
### 编译前的自动配置 
源码包下载好，放到本地某个目录（建议路径纯英文，避免不必要的麻烦），解压之，然后进入源码根目录，执行： 
 ```java 
  sh configure

  ```  
 
这一步会进行一系列的自动配置工作，时间一般很快，最终如果能出现一下提示，那么很幸运，编译前的配置工作就完成了！ 
这里我给出我自己分别在配置 ```java 
  JDK 11
  ``` 和 ```java 
  JDK 8
  ``` 时候完成时的样子： 
配置JDK 8完成： 
![Test](https://codesheep.oss-cn-hangzhou.aliyuncs.com/blog/20200715232858.png  '写Java这么久，JDK源码编译过没-编译JDK源码踩坑纪实') 
配置JDK 11完成： 
![Test](https://codesheep.oss-cn-hangzhou.aliyuncs.com/blog/20200715232858.png  '写Java这么久，JDK源码编译过没-编译JDK源码踩坑纪实') 
注： 如果这一步出错，大概率是某个软件环境未装，或者即使装了，但版本不匹配，控制台打印日志里一般是会提醒的。 
比如我在配置 ```java 
  JDK 8
  ``` 的时候，就遇到了一个 ```java 
  errof：GCC compiler is required
  ``` 的问题： 
![Test](https://codesheep.oss-cn-hangzhou.aliyuncs.com/blog/20200715232858.png  '写Java这么久，JDK源码编译过没-编译JDK源码踩坑纪实') 
明明系统里已经有编译器，但还是报这个错误。通过后来修改  ```java 
  jdk源码根目录/common/autoconf/generated-configure.sh
  ``` 文件，将相关的两行代码注释后就配置通过了 
![Test](https://codesheep.oss-cn-hangzhou.aliyuncs.com/blog/20200715232858.png  '写Java这么久，JDK源码编译过没-编译JDK源码踩坑纪实') 
![Test](https://codesheep.oss-cn-hangzhou.aliyuncs.com/blog/20200715232858.png  '写Java这么久，JDK源码编译过没-编译JDK源码踩坑纪实') 
配置完成，接下来开始执行真正的编译动作了！ 
 
 
### 真正的编译动作 
我们这里进行的是全量编译，直接在我们下载的 ```java 
  JDK
  ``` 源码根目录下执行如下命令即可： 
 ```java 
  make all

  ```  
这一步编译需要一点时间，耐心等待一下即可。编译过程如果有错误，会终止编译，如果能看到如下两个画面，那么则恭喜你，自己编译 ```java 
  JDK
  ``` 源码就已经通过了，可以搞一杯咖啡庆祝一下了。 
JDK 8编译完成： 
![Test](https://codesheep.oss-cn-hangzhou.aliyuncs.com/blog/20200715232858.png  '写Java这么久，JDK源码编译过没-编译JDK源码踩坑纪实') 
JDK 11编译完成： 
![Test](https://codesheep.oss-cn-hangzhou.aliyuncs.com/blog/20200715232858.png  '写Java这么久，JDK源码编译过没-编译JDK源码踩坑纪实') 
从两张图的对比可以看出，编译 ```java 
  JDK 8
  ``` 和 ```java 
  JDK 11
  ``` 完成时在输出上还是有区别的。时间上的区别很大程度上来源于 ```java 
  JDK 11
  ``` 的编译机配置要高不少。 
 
 
### 验证成果 
 ```java 
  JDK
  ``` 源码编译完成之后肯定会产生和输出很多产物，这也是我们所迫不及待想看到的。 
由于 ```java 
  JDK 8
  ``` 和 ```java 
  JDK 11
  ``` 的源码包组织结构并不一样，所以输出东西的内容和位置也有区别。我们一一来盘点一下。 
 
#### 1、JDK 8的编译输出 
编译完成， ```java 
  build
  ``` 目录下会生成一个 ```java 
  macosx-x86_64-normal-server-release
  ``` 目录，所有的编译成果均位于其中。 
首先，编译出来的 ```java 
  Java
  ``` 可执行程序可以在如下目录里找到： 
 ```java 
  jdk源码根目录/build/macosx-x86_64-normal-server-release/jdk/bin
  ```  
进入该目录后，可以输入 ```java 
  ./java -version
  ``` 命令验证： 
![Test](https://codesheep.oss-cn-hangzhou.aliyuncs.com/blog/20200715232858.png  '写Java这么久，JDK源码编译过没-编译JDK源码踩坑纪实') 
其次，编译生成的成品 ```java 
  JDK
  ``` 套装，可以在目录 
 ```java 
  jdk源码根目录/build/macosx-x86_64-normal-server-release/images

  ```  
下找到，如图所示： 
![Test](https://codesheep.oss-cn-hangzhou.aliyuncs.com/blog/20200715232858.png  '写Java这么久，JDK源码编译过没-编译JDK源码踩坑纪实') 
其中： 
 
   ```java 
  j2sdk-image
  ``` ：编译生成的JDK  
   ```java 
  j2re-image
  ``` ：编译生成的JRE  
 
进入 ```java 
  j2sdk-image
  ``` 目录会发现，里面的内容和我们平时从网络上下载的成品 ```java 
  JDK
  ``` 内容一致。 
![Test](https://codesheep.oss-cn-hangzhou.aliyuncs.com/blog/20200715232858.png  '写Java这么久，JDK源码编译过没-编译JDK源码踩坑纪实') 
 
#### 2、JDK 11的编译输出 
 
 ```java 
  JDK 11
  ``` 编译完成，同样在 ```java 
  build
  ``` 目录下会生成一个 ```java 
  macosx-x86_64-normal-server-release
  ``` 目录，所有的编译成果均位于其中。 
同样编译出来的Java可执行程序可以在目录 
 ```java 
  JDK源码根目录/build/macosx-x86_64-normal-server-release/jdk/bin
  ```  
下看到，进入该目录后，也可以输入 ```java 
  ./java -version
  ``` 命令验证： 
![Test](https://codesheep.oss-cn-hangzhou.aliyuncs.com/blog/20200715232858.png  '写Java这么久，JDK源码编译过没-编译JDK源码踩坑纪实') 
其次，编译生成的成品 ```java 
  JDK 11
  ``` 套装，可以在目录 
 ```java 
  JDK源码根目录/build/macosx-x86_64-normal-server-release/images

  ```  
下找到，如图所示： 
![Test](https://codesheep.oss-cn-hangzhou.aliyuncs.com/blog/20200715232858.png  '写Java这么久，JDK源码编译过没-编译JDK源码踩坑纪实') 
其中 ```java 
  jdk
  ``` 目录就是编译生成的成品 ```java 
  JDK 11
  ``` 套装。 
 
 
### 使用自己编译的JDK 
既然我们已经动手编译出了 ```java 
  JDK
  ``` 成品，接下来我们得用上哇。 
新建一个最最基本的 ```java 
  Java
  ``` 工程，比如命名为 ```java 
  JdkTest
  ``` ，目的是把我们自己编译出的 ```java 
  JDK
  ``` 给用上。 
![Test](https://codesheep.oss-cn-hangzhou.aliyuncs.com/blog/20200715232858.png  '写Java这么久，JDK源码编译过没-编译JDK源码踩坑纪实') 
我们点开 ```java 
  Project Structure
  ``` ，选到 ```java 
  SDKs
  ``` 选项，新添加上自己刚刚编译生成的JDK，并选为项目的JDK，看看是否能正常工作 
![Test](https://codesheep.oss-cn-hangzhou.aliyuncs.com/blog/20200715232858.png  '写Java这么久，JDK源码编译过没-编译JDK源码踩坑纪实') 
![Test](https://codesheep.oss-cn-hangzhou.aliyuncs.com/blog/20200715232858.png  '写Java这么久，JDK源码编译过没-编译JDK源码踩坑纪实') 
点击确定之后，我们运行之： 
![Test](https://codesheep.oss-cn-hangzhou.aliyuncs.com/blog/20200715232858.png  '写Java这么久，JDK源码编译过没-编译JDK源码踩坑纪实') 
可以看到我们自己编译出的JDK已经用上了。 
 
 
### 关联JDK源码并修改 
我们继续在上一步 ```java 
  JdkTest
  ``` 项目的 ```java 
  Project Structure
  ```  →  ```java 
  SDKs
  ``` 里将 ```java 
  JDK
  ``` 源码关联到自行下载的JDK源码路径上： 
![Test](https://codesheep.oss-cn-hangzhou.aliyuncs.com/blog/20200715232858.png  '写Java这么久，JDK源码编译过没-编译JDK源码踩坑纪实') 
这样方便我们对自己下载的 ```java 
  JDK源码
  ``` 进行阅读、调试、修改、以及在源码里随意做笔记和加注释。 
举个最简单的例子，比如我们打开 ```java 
  System.out.println()
  ``` 这个函数的底层源码： 
![Test](https://codesheep.oss-cn-hangzhou.aliyuncs.com/blog/20200715232858.png  '写Java这么久，JDK源码编译过没-编译JDK源码踩坑纪实') 
我们随便给它修改一下，加两行简单的标记，像这样： 
![Test](https://codesheep.oss-cn-hangzhou.aliyuncs.com/blog/20200715232858.png  '写Java这么久，JDK源码编译过没-编译JDK源码踩坑纪实') 
为了使我们新加的代码行生效，我们必须要重新去JDK源码的根目录中再次执行  ```java 
  make images
  ``` 重新编译生成JDK方可生效： 
![Test](https://codesheep.oss-cn-hangzhou.aliyuncs.com/blog/20200715232858.png  '写Java这么久，JDK源码编译过没-编译JDK源码踩坑纪实') 
因为之前已经全量编译过了，所以再次 ```java 
  make
  ``` 的时候增量编译一般很快。 
重新编译之后，我们再次运行 ```java 
  JdkTest
  ``` 项目，就可以看到改动的效果了： 
![Test](https://codesheep.oss-cn-hangzhou.aliyuncs.com/blog/20200715232858.png  '写Java这么久，JDK源码编译过没-编译JDK源码踩坑纪实') 
 
 
### 多行注释的问题 
记得之前搭建《JDK源码阅读环境》时，大家可能发现了一个问题：阅读源码嘛，给源代码做点注释或笔记很常见！但那时候有个问题就是做注释时不可改变代码的行结构（只能行尾注释，不能跨行注释），否则debug调试时会出现行号错位的问题。 
原因很简单，因为我们虽然做了源代码目录的映射，但是实际支撑运行的 ```java 
  JDK
  ``` 还是预先安装好的那个JDK环境，并不是根据我们修改后的源码来重新编译构建的，所以看到这里，解决这个问题就很简单，就像上面一样自行编译一下 ```java 
  JDK
  ``` 即可。 
实际在实验时，还有一个很典型的问题是，当添加了多行的中文注释后，再编译居然会报错！ 
比如，还是以上面例子中最简单的 ```java 
  System.out.println()
  ``` 源码为例，我们添加几行中文注释： 
![Test](https://codesheep.oss-cn-hangzhou.aliyuncs.com/blog/20200715232858.png  '写Java这么久，JDK源码编译过没-编译JDK源码踩坑纪实') 
这时候我们去JDK源码目录下编译会发现满屏类似这样的报错： 
 
![Test](https://codesheep.oss-cn-hangzhou.aliyuncs.com/blog/20200715232858.png  '写Java这么久，JDK源码编译过没-编译JDK源码踩坑纪实') 
顿时有点懵，毕竟仅仅是加了几行注释。对于我们来说，源码里写点多行的中文注释基本是刚需，然而编译竟会报错，这还能不能让人愉快的玩耍了... 当时后背有点发凉。 
实不相瞒，就这个问题排查了一段时间，熬到了很晚。最终折腾了一番，通过如下这种方式解决了���顺便分享给小伙伴们，大家如果遇到了这个问题，可以参考着解决一下。 
因为从控制台的报错可以很明显的看出，肯定是字符编码相关的问题导致的，而且都指向了 ```java 
  ascii
  ``` 这种编码方式。 
于是将JDK的源码从根目录导入了Vs Code，然后全目录查找 ```java 
  encoding ascii
  ``` 相关的内容，看看有没有什么端倪，结果发现 
 ```java 
  jdk源码根目录/make/common/SetupJavaCompilers.gmk
  ``` 文件中有两处指定了 ```java 
  ascii
  ``` 相关的编码方式： 
![Test](https://codesheep.oss-cn-hangzhou.aliyuncs.com/blog/20200715232858.png  '写Java这么久，JDK源码编译过没-编译JDK源码踩坑纪实') 
于是尝试将这两处 ```java 
  -encoding ascii
  ``` 的均替换成 ```java 
  -encoding utf-8
  ``` ： 
![Test](https://codesheep.oss-cn-hangzhou.aliyuncs.com/blog/20200715232858.png  '写Java这么久，JDK源码编译过没-编译JDK源码踩坑纪实') 
然后再次执行 ```java 
  make images
  ``` 编译，编译顺利通过！ 
![Test](https://codesheep.oss-cn-hangzhou.aliyuncs.com/blog/20200715232858.png  '写Java这么久，JDK源码编译过没-编译JDK源码踩坑纪实') 
至此大功告成！ 
这样后面不管是阅读、调试还是定制 ```java 
  JDK
  ``` 源码都非常方便了。 
 
 
每天进步一点点 
慢一点才能更快
                                        