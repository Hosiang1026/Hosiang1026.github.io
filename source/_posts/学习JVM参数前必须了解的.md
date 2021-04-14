---
title: 推荐系列-学习JVM参数前必须了解的
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 859
cover_picture: 'https://static.oschina.net/uploads/img/202005/06112449_GY46.jpg'
abbrlink: fd70e902
date: 2021-04-14 07:54:42
---

&emsp;&emsp;本文来自: PerfMa技术社区 PerfMa(笨马网络)官网 JVM参数是什么 大家照相通常使用手机就够用了，但是针对发烧友来说会使用更专业的设备，比如单反相机，在单反里有好几个模式，P/A/S/M，其中...
<!-- more -->

                                                                                                                                                                                         
#### JVM参数是什么 
大家照相通常使用手机就够用了，但是针对发烧友来说会使用更专业的设备，比如单反相机，在单反里有好几个模式，P/A/S/M，其中P是傻瓜模式，程序会自动根据环境设置快门速度和光圈大小，以得到相对合适的曝光效果。A档是光圈优先，用户可以自己设置光圈大小，快门速度等都交给相机程序来决定，类似半自动化的模式。S档是快门优先模式，和A档类似，只是用户可以设置快门速度。最后一个模式是M档，这是纯手动模式，由用户自己来调整快门速度，光圈大小等，这个对人的要求就会很高，但是很多专家往往都会选择M档来拍摄自己的作品。 
可以把JVM想象成相机，JVM参数想象成光圈大小，快门速度之类的参数值，这些参数对程序的运行会影响挺大。 
java程序跑在JVM上，JVM会根据环境自动设置一些JVM参数，但是这些参数并不能保证一定是最优的，有些参数在启动的时候就基本设置好了，它们在运行的时候还无法调整。为了让JVM能更好地运行你的程序，还是有必要对JVM参数有一定的理解，知道这些JVM参数分别在什么场景下有效果，起到什么作用，比如我们到底期不期望类可以卸载，是否可以在运行的时候打印一些日志协助我们了解JVM的运行情况，出问题的时候是否可以自动给我们做一些现场数据的保留等，这些都是可以通过JVM参数来设置的。 
#### JVM参数有多少 
相机调整的无非就那么几个参数值，那JVM参数到底有多少个呢，大概有1000多个，是不是让你很震惊，没错，确实有这么多。 大家可以到 JVM参数 | PerfMa应用性能技术社区 去看看所有这些JVM参数（注：这是PerfMa社区专门为大家分享JVM参数经验的讨论区），当然我们不一定非得对每个JVM参数要了解清楚，但是对一些常见的，有助于性能调优的JVM参数还是有必要了解一下的。 
 
#### JVM参数通常设置的位置 
我们启动一个java程序很简单，命令类似如下 
 ```java 
  java Main

  ```  
我们�����道上面的Main是程序的启动类，JVM执行的时候会找到这个Main类里的如下签名的函数 
 ```java 
  Public static void main(String args[])

  ```  
那这里函数的参数args怎么传进来的呢？我们通过在启动命令的主类后面加上相关的参数，参数之间用空格分开，JVM会自动将这些参数作为args的组成部分传进来，比如 
 ```java 
  java Main arg1 arg2

  ```  
这样，args这个数组里自动会填充arg1和arg2两个元素，这样在你的程序里就可以使用这些参数了 
我们把arg1和arg2这些叫做程序参数，但是和我们课程相关的并不是程序参数，而是JVM参数，那JVM参数放到哪里呢？JVM参数都是放在主类之前，java命令之后，比如 
 ```java 
  java -Xmx100M Main arg1 arg2

  ```  
这里的-Xmx100M其实就是JVM参数，所以所有的JVM参数都是放在这个位置的，如果不是这个位置，那你设置的JVM参数将会是无效的，如果参数出现不符合预期的情况，那请第一时间检查的是你JVM参数设置的位置，当然还可能存在一些别的原因导致JVM参数和你设置的情况可能不一致的情况 
#### JVM参数的写法 
那JVM参数具体怎么写呢，可以有好几种 
 
 “-X” 开头的，比如-Xmx100M 
 “-XX: ” 开头的，比如-XX:+UseG1GC 
 ���-” 开头的，比如-verbose:gc 
 
其中 ```java 
  -X
  ``` 和 ```java 
  -
  ``` 开头的通常会被转换为一个或者多个 ```java 
  -XX:
  ``` 开头的参数，只是一个简化的写法，比如说 ```java 
  -Xmx100M
  ``` ，JVM里会自动转化为 ```java 
  -XX:MaxHeapSize=100M
  ``` ， ```java 
  -verbose:class
  ``` 会自动转换为 ```java 
  -XX:+TraceClassLoading -XX:+TraceClassUnloading
  ```  
#### 通过Flags参数指定JVM参数文件 
如果JVM参数都和源码伴着一起发布的话，如果仅仅修改JVM参数也必须拉个分支提交代码，这不是很友好，有什么好办法呢？ 
我们可以在启动参数里设置一个参数就好，这个参数类似如下 
 ```java 
  java -XX:Flags=/home/admin/flags Main arg1 arg2

  ```  
设置过这个参数之后，我们只要在服务的/home/admin目录下创建flags文件，同时在这个文件里指定所有的JVM参数就可以了，但是对flags文件里的参数写法会有些要求，-X之类的参数不能设置，但是可以用其等价的-XX的参数来替代，比如说-Xmx100M，只能用-XX:MaxHeapSize=100M来取代，同时在文件里不要出现 ```java 
  -XX:
  ``` ，只要 ```java 
  key=value
  ``` 或许 ```java 
  +/-key
  ``` 就可以了，不同的参数之间用换行或者空格分开即可，比如flags文件的内容如下： 
 ```java 
  MaxHeapSize=8G +UseG1GC

  ```  
其实等价于 
 ```java 
  -Xmx8G -XX:+UseG1GC

  ```  
可以通过加上 ```java 
  -XX:+PrintVMOptions
  ``` 可以打印设置过的JVM参数来验证，比如 
 ```java 
  java -XX:Flags=/home/admin/flags -XX:+PrintVMOptions Main arg1 arg2

  ```  
#### 通过VMOptionsFile参数来指定JVM参数文件 
使用上面的Flags参数可能会比较别扭，因为设置参数和我们正常的写法不太一样，如果我们的JDK版本大于1.8的话，JVM提供了一个更人性化的参数，那就是VMOptionsFile来取代Flags，这也是指定一个文件，这个文件里的JVM参的写法和我们在java命令后写的JVM参数写法完全一样 
 ```java 
  java -XX:VMOptionsFile=/home/admin/flags Main arg1 arg2

  ```  
在flags文件里我们可以这么写 
 ```java 
  -Xmx8G -XX:+UseG1GC

  ```  
是不是方便了很多呢 
#### 开始JVM参数学习之旅 
上面这些内容都了解清楚之后，就可以开始真正学习JVM参数了，我们也专门在社区给大家开了一门免费的学习JVM参数的课程，有兴趣的同学请到PerfMa社区进行了解学习，也欢迎大家参与讨论，慢慢揭开JVM参数的神秘面纱。 
一起来学习吧： PerfMa KO 系列之 JVM 参数【Memory篇】 
 

                                        