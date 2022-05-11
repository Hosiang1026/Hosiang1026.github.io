---
title: 推荐系列-ibox wtoken算法
categories: 热门文章
tags:
  - Popular
author: csdn
top: 1
cover_picture: 'https://profile.csdnimg.cn/D/3/1/3_qq_41823971'
abbrlink: 9b5c38f
date: 2022-05-11 05:16:57
---

&emsp;&emsp;前面的抓包分析和java层定位我这里就不分析了libtiger_tally.so 具体加密在这里so里面 这个是ali安全的soJava层： com/aliyun/TigerTally/TigerTallyAPI主要看init方法这个方法里面有so函数的加载流程先是调用_genericNt2 -------_genericNt1------ _genericNt3 这就是这个so的加载流程接下来就是unidbg模拟了先去官网下载一下源
<!-- more -->

        
                
                    前面的抓包分析和java层定位我这里就不分析了 
 
 
 
libtiger_tally.so 具体加密在这里so里面 这个是ali安全的so 
Java层： com/aliyun/TigerTally/TigerTallyAPI 
 
主要看init方法 
 
这个方法里面有so函数的加载流程 
 
先是调用_genericNt2 -------_genericNt1------ _genericNt3 这就是这个so的加载流程 
 
 
 
 
接下来就是unidbg模拟了 
 
先去官网下载一下源码 
地址: 
GitHub - zhkl0228/unidbg: Allows you to emulate an Android ARM32 and/or ARM64 native library, and an experimental iOS emulation 
 
 拉下来选择这个android项目 
然后我们建一个文件  
 把apk和so文件复制进去 
 
 
把unidbg架子搭起来  
 
 
 这里要注意一下 我们是64位的so 选择  for64Bit   
 
 
然后我们根据上面分析的流程来调用这个so 
 
流程是_genericNt2 -------_genericNt1------ _genericNt3 
 
 
 
跑一下  
 
 
 
接下来就是正常的补环境流程啦  
 
  
 
继续补 这里不要乱补 乱补是过不了检测的 
 
 
 
补到这里wtoken的值就出来啦 
发包测试 
 
 正常可以用 我这里已经打包好了接口哦 
请勿非法用途 仅供学习交流 
 
qq：2694072078 

                
        