---
title: 推荐系列-80% 的人都不会的 15 个 Linux 实用技巧
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 851
cover_picture: 'https://oscimg.oschina.net/oscnet/a1986b3f-02fa-41b9-a05a-c162b6c82a22.jpg'
abbrlink: 1ff76c74
date: 2021-04-15 09:53:06
---

&emsp;&emsp;大家好，我是肖邦，这是我的第 14 篇原创文章。 熟悉 Linux 系统的同学都知道，它高效主要体现在命令行。通过命令行，可以将很多简单的命令，通过自由的组合，得到非常强大的功能。 命令行也...
<!-- more -->

                                                                                                                                                                                         
  
  ![Test](https://oscimg.oschina.net/oscnet/a1986b3f-02fa-41b9-a05a-c162b6c82a22.jpg  '80% 的人都不会的 15 个 Linux 实用技巧') 
  大家好，我是肖邦，这是我的第 14 篇原创文章。 
  熟悉 Linux 系统的同学都知���，它高效主要体现在命令行。通过命令行，可以将很多简单的命令，通过自由的组合，得到非常强大的功能。 
  命令行也就意味着可以自动化，自动化会使你的工作更高效，释放很多手工操作，让你有更多的时间去做更有意义的事情。 
  这篇文章，会分享一些非常实用小技巧，希望能够帮助你提高工作效率，学完就能够用得上！ 
   
   ![Test](https://oscimg.oschina.net/oscnet/a1986b3f-02fa-41b9-a05a-c162b6c82a22.jpg  '80% 的人都不会的 15 个 Linux 实用技巧') 
   
  1. 快速清空文件的方法 
  快速清空一个文件，有 N 种方法，我比较喜欢下边这种，因为它最短 
   
 ```java 
  $ > access.log
  ``` 
  
  不过瘾？好吧，我也顺便总结下，其它几种最常见的清空文件的方法 
   
    
     
      
 ```java 
  : > access.log
  ``` 
  
     
    
     
      
 ```java 
  true > access.log
  ``` 
  
     
    
     
      
 ```java 
  cat /dev/null > access.log
  ``` 
  
     
    
     
      
 ```java 
  echo -n "" > access.log
  ``` 
  
     
    
     
      
 ```java 
  echo > access.log
  ``` 
  
     
    
     
      
 ```java 
  truncate -s 0 access.log
  ``` 
  
     
   
  简单解释下，  
 ```java 
  :
  ``` 
  在 shell 中是一个内置命令，表示  
 ```java 
  no-op
  ``` 
 ，大概就是空语句的意思，所以  
 ```java 
  :
  ``` 
  的那个用法，就是执行命令后，什么都没有输出，将空内容覆盖到文件。 
  2. 快速生成大文件 
  有时候，在 Linux 上，我们需要一个大文件，用于测试上传或下载的速度，通过  
 ```java 
  dd
  ``` 
  命令可以快速生成一个大文件 
   
 ```java 
  $ dd if=/dev/zero of=file.img bs=1M count=1024
  ``` 
  
  上述命令，生成一个文件名为 file.img 大小为 1G 的文件。 
  3. 安全擦除硬盘数据 
  介绍一种擦除硬盘数据的方法，高效，安全。可以通过  
 ```java 
  dd
  ``` 
  命令，轻松实现： 
   
 ```java 
  $ dd if=/dev/urandom of=/dev/sda
  ``` 
  
  使用  
 ```java 
  /dev/urandom
  ``` 
  生成随机数据，将生成的数据写入  
 ```java 
  sda
  ``` 
  硬盘中，相当于安全的擦除了硬盘数据。 
  当年陈老师，如果学会了这条命令，可能也不会有艳兆门事件了。 
  4. 快速制作系统盘 
  在 Linux 下制作系统盘，老毛桃神么工具都弱爆了，直接一条命令搞定： 
   
 ```java 
  $ dd if=ubuntu-server-amd64.iso of=/dev/sdb
  ``` 
  
  哈哈，是不是很爽， 
 ```java 
  sdb
  ``` 
  可以 U 盘，也可以是普通硬盘 
  5. 查看某个进程的运行时间 
  可能，大部分同学只会使用  
 ```java 
  ps aux
  ``` 
 ，其实可以通过  
 ```java 
  -o
  ``` 
  参数，指定只显示具体的某个字段，会得到更清晰的结果。 
   
 ```java 
  $ ps -p 10167 -o etimes,etimeELAPSED     ELAPSED1712055 19-19:34:15
  ``` 
  
  通过  
 ```java 
  etime
  ``` 
  获取该进程的运行时间，可以很直观地看到，进程运行了 19 天 
  同样，可以通过  
 ```java 
  -o
  ``` 
  指定  
 ```java 
  rss
  ``` 
  可以只获取该进程的内存信息。 
   
 ```java 
  $ ps -p 10167 -o rss  RSS 2180
  ``` 
  
  6. 动态实时查看日志 
  通过  
 ```java 
  tail
  ``` 
  命令  
 ```java 
  -f
  ``` 
  选项，可以动态地监控日志文件的变化，非常实用 
   
 ```java 
  $ tail -f test.log
  ``` 
  
  如果想在日志中出现  
 ```java 
  Failed
  ``` 
  等信息时立刻停止 tail 监控，可以通过如下命令来实现： 
   
 ```java 
  $ tail -f test.log | sed '/Failed/ q'
  ``` 
  
  7. 时间戳的快速转换 
  时间操作，对程序员来说就是家常便饭。有时候希望能够将时间戳，转换为日期时间，在 Linux 命令行上，也可以快速的进行转换： 
   
 ```java 
  $ date -d@1234567890 +"%Y-%m-%d %H:%M:%S"2009-02-14 07:31:30
  ``` 
  
  当然，也可以在命令行上，查看当前的时间戳 
   
 ```java 
  $ date +%s1617514141
  ``` 
  
  8. 优雅的计算程序运行时间 
  在 Linux 下，可以通过  
 ```java 
  time
  ``` 
  命令，很容易获取程序的运行时间： 
   
 ```java 
  $ time ./testreal    0m1.003suser    0m0.000ssys     0m0.000s
  ``` 
  
  可以看到，程序的运行时间为:  
 ```java 
  1.003s
  ``` 
 。细心的同学，会看到  
 ```java 
  real
  ``` 
  貌似不等于  
 ```java 
  user
  ``` 
  +  
 ```java 
  sys
  ``` 
 ，而且还远远大于，这是怎么回事呢？ 
  先来解释下这三个参数的含义： 
   
    
     
      
 ```java 
  real
  ``` 
 ：表示的钟表时间，也就是从程序执行到结束花费的时间； 
     
    
     
      
 ```java 
  user
  ``` 
 ：表示运行期间，cpu 在用户空间所消耗的时间； 
     
    
     
      
 ```java 
  sys
  ``` 
 ：表示运行期间，cpu 在内核空间所消耗的时间； 
     
   
  由于  
 ```java 
  user
  ``` 
  和  
 ```java 
  sys
  ``` 
  只统计 cpu 消耗的时间，程序运行期间会调用 sleep 发生阻塞，也可能会等待网络或磁盘 IO，都会消耗大量时间。因此对于类似情况， 
 ```java 
  real
  ``` 
  的值就会大于其它两项之和。 
  另外，也会遇到  
 ```java 
  real
  ``` 
  远远小于  
 ```java 
  user
  ``` 
  +  
 ```java 
  sys
  ``` 
  的场景，这是什么鬼情况？ 
  这个更好理解，如果程序在多个 cpu 上并行，那么  
 ```java 
  user
  ``` 
  和  
 ```java 
  sys
  ``` 
  统计时间是多个 cpu 时间，实际消耗时间  
 ```java 
  real
  ``` 
  很可能就比其它两个之和要小了 
  9. 命令行查看ascii码 
  我们在开发过程中，通常需要查看  
 ```java 
  ascii
  ``` 
  码，通过 Linux 命令行就可以轻松查看，而不用去 Google 或 Baidu 
   
 ```java 
  $ man ascii
  ``` 
  
  10. 优雅的删除乱码的文件 
  在 Linux 系统中���会经常碰到名称乱码的文件。想要删除它，却无法通过键盘输入名字，有时候复制粘贴乱码名称，终端可能识别不了，该怎么办？ 
  不用担心，下边来展示下  
 ```java 
  find
  ``` 
  是如何优雅的解决问题的。 
   
 ```java 
  $ ls  -i138957 a.txt  138959 T.txt  132395 ڹ��.txt$ find . -inum 132395 -exec rm {} \;
  ``` 
  
  命令中， 
 ```java 
  -inum
  ``` 
  指定的是文件的  
 ```java 
  inode
  ``` 
  号，它是系统中每个文件对应的唯一编号，find 通过编号找到后，执行删除操作。 
  11. Linux上获取你的公网IP地址 
  在办公或家庭环境，我们的虚拟机或服务器上配置的通常是内网 IP 地址，我们如何知道，在与外网通信时，我们的公网出口 IP 是神马呢？ 
  这个在 Linux 上非常简单，一条命令搞定 
   
 ```java 
  $ curl ip.sb$ curl ifconfig.me
  ``` 
  
  上述两条命令都可以 
  12. 如何批量下载网页资源 
  有时，同事会通过网页的形式分享文件下载链接，在 Linux 系统，通过  
 ```java 
  wget
  ``` 
  命令可以轻松下载，而不用写脚本或爬虫 
   
 ```java 
  $ wget -r -nd -np --accept=pdf http://fast.dpdk.org/doc/pdf-guides/# --accept：选项指定资源类型格式 pdf
  ``` 
  
  13. 历史命令使用技巧 
  分享几个历史命令的使用技巧，能够提高你的工作效率。 
   
    
     
      
 ```java 
  !!
  ``` 
 ：重复执行上条命令； 
     
    
     
      
 ```java 
  !N
  ``` 
 ：重复执行 history 历史中第 N 条命令，N 可以通过 history 查看； 
     
    
     
      
 ```java 
  !pw
  ``` 
 ：重复执行最近一次，以 
      
 ```java 
  pw
  ``` 
 开头的历史命令，这个非常有用，小编使用非常高频； 
     
    
     
      
 ```java 
  !$
  ``` 
 ：表示最近一次命令的最后一个参数； 
     
   
  猜测大部分同学没用过  
 ```java 
  !$
  ``` 
 ，这里简单举个例子，让你感受一下它的高效用法 
   
 ```java 
  $ vim /root/sniffer/src/main.c$ mv !$ !$.bak# 相当于$ mv /root/sniffer/src/main.c /root/sniffer/src/main.c.bak
  ``` 
  
  当前工作目录是 root，想把 main.c 改为 main.c.bak。正常情况你可能需要敲 2 遍包含 main.c 的长参数，当然你也可能会选择直接复制粘贴。 
  而我通过使用  
 ```java 
  !$
  ``` 
  变量，可以很轻松优雅的实现改名，是不是很  
 ```java 
  hacker
  ``` 
  呢？ 
  14. 快速搜索历史命令 
  在 Linux 下经常会敲很多的命令，我们要怎么快速查找并执行历史命令呢？ 
  通过上下键来翻看历史命令，No No No，可以通过执行  
 ```java 
  Ctrl + r
  ``` 
 ，然后键入要所搜索的命令关键词，进行搜索，回车就可以执行，非常高效。 
  15. 真正的黑客不能忽略技巧 
  最后，再分享一个真正的黑客不能忽略技巧。我们在所要执行的命令前，加一个空格，那这条命令就不会被  
 ```java 
  history
  ``` 
  保存到历史记录 
  有时候，执行的命令中包含敏感信息，这个小技巧就显得非常实用了，你也不会再因为忘记执行  
 ```java 
  history -c
  ``` 
  而烦恼了。 
  
  
  ~~~~~ End ~~~~~ 
  本次分享就到这里了，谢谢大家的阅读，我是肖邦。关注我的公众号「编程修养」，大量的干货文章等你来！ 
   
    
   
  公众号后台回复「1024」有惊喜！欢迎各位老铁，加肖邦的个人微信，技术交流！！ 
  ![Test](https://oscimg.oschina.net/oscnet/a1986b3f-02fa-41b9-a05a-c162b6c82a22.jpg  '80% 的人都不会的 15 个 Linux 实用技巧') 
  
 推荐阅读： 
  
  写给 Linux 初学者的一封信 
  全网最详尽的负载均衡原理图解 
  上古神器 sed 教程详解，小白也能看的懂 
  Linux三剑客之 grep 教程详解 
  Linux文件搜索神器 find 实战详解 
  Linux网络分析必备技能 tcpdump实战详解 
  Linux三剑客之 awk 实战详解教程 
  #### 淘宝二面，面试官居然把TCP三次握手问的这么详细 
  
  
 原创不易，跪求大家帮忙给点个赞、在看，感谢！ 
  
 
本文分享自微信公众号 - 编程修养（chopin11vip）。如有侵权，请联系 support@oschina.cn 删除。本文参与“OSC源创计划”，欢迎正在阅读的你也加入，一起分享。
                                        