---
title: 推荐系列-Crypto练习之CRC32应用
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 831
cover_picture: 'https://api.ixiaowai.cn/gqapi/gqapi.php'
abbrlink: 46a4bd1b
date: 2021-04-15 09:53:06
---

&emsp;&emsp;CRC全称为Cyclic redundancy check，即循环冗余校验码，是一种根据输入数据产生简短的固定位数校验码的散列函数。CRC主要用来检测或者校验数据经过传输或者保存后可能出现的错误，CRC32产生3...
<!-- more -->

                                                                                                                                                                                        CRC全称为Cyclic redundancy check，即循环冗余校验码，是一种根据输入数据产生简短的固定位数校验码的散列函数。CRC主要用来检测或者校验数据经过传输或者保存后可能出现的错误，CRC32产生32位的散列值（即4字节）。CRC32可以用于数据的校验，在WinRAR等压缩软件中也使用了这一技术，压缩包中每个文件都保存有一个对应的CRC32值，这个值是对压缩前的文件数据计算出来的散列值，在进行解压时会再次计算文件的CRC32值来进行对比，判断压缩包文件是否损坏。尽管CRC32在错误检测中非常有用，但是并不能可靠地校验数据完整性（即数据没有发生任何变化），这是因为CRC多项式是线性结构，可以非常容易地故意改变数据而维持CRC不变，即存在产生碰撞的可能性。 
本次实验地址：[《CTF Crypto练习之CRC32应用》](https://www.hetianlab.com/expc.do?ec=ECID172.19.104.182015011915463900001&pk_campaign=kaiyuan-wemedia)。 
先来看一下题目，在实验主机上的C:\Crypto\2目录下的flag.zip为本题所提供的文件，请对flag.zip文件进行分析，提取出压缩包中7个txt文件的内容，然后找出Flag字符串。 
这个题目意在考察选手对CRC32的了解，以及通过CRC32枚举来还原压缩包文件内容的方法。 
实验步骤一、思路分析 
打开flag.zip压缩包文件，发现里面有7个txt文件，但是压缩包经过加密了，所以无法直接对其进行解压操作。题目除了这个压缩包之外没有提供任何提示，使用十六进制编辑器查看flag.zip文件似乎也找不到可疑的信息，那么可行的方法似乎就只有一个了，那就是对密码进行暴力破解操作。 
暴力破解无非是使用可能的密码尝试进行解压操作，可行的方法有两种： 
\1. 通过密码字典收集的常用密码进行破解； 
\2. 通过穷举可能的密码进行破解； 
对于第一种方式而言，如果机器性能足够好，几千万的密码字典可以很快就跑完；对于第二种方式而言，穷举的空间是非常大的，因为RAR压缩文件密码的最大长度为127个字符，而且不局限于英文字符，因此完全的暴力破解是不可能的。 
密码破解并不是本题的出题初衷，这里将介绍一种基于CRC32来还原压缩包内容的方法。观察flag.zip在WinRar中的显示信息，如下图所示： 
![图片1.png](https://www.hetianlab.com/specialized/headImg.action?news=a45f4193-b470-4e6c-9692-9ae49f7dbd5b.png) 
在WinRAR下方的列表视图中，最后一列是CRC32值，这个值代表的是对应的文件在压缩之前的内容���算出来的CRC32散列值，考虑到这里每个txt文件原始的大小只有4个字节，因此我们可以尝试枚举可能的4字节内容，然后计算CRC32值来进行校验。4字节的枚举空间并不是无法接受，因此可以尝试这样的操作。 
这样我们就完成了第一个步骤，接下来开始实验步骤二、CRC32计算 
为了快速方便的还原压缩包的内容，我们需要编程来计算CRC32的值。计算CRC32可以有多种方法，可以从网上找一个实现好的C/C++源文件，也可以使用Python提供的库函数来进行计算，这里我们选择后者。 
Python的binascii模块提供了一个crc32方法，可以方便的计算所给参数的CRC32值。但是这里的计算结果有一点问题，因为计算出来的结果是一个有符号数，所以可能会看到结果为负数，因此需要将结果和0xFFFFFFFF进行一个位运算与操作。Python计算CRC32的代码如下： 
import binascii 
def calcCRC32(s): 
crc = binascii.crc32(s) 
return crc & 0xFFFFFFFF 
需要注意的是，前面提到CRC32会存在冲突的可能，也就是说，不同的内容在经过计算后得到的CRC32散列值可能是一样的。 
这都是出题人布置的陷阱，你自己做实验的时候要注意，最后一步，实验步骤三、使用脚本进行快速破解 
经过前面的分析，我们已经知道了可以通过CRC32来还原压缩包中的4字节文本，以及通过Python计算CRC32的方法，现在只需要给Python脚本添加枚举功能即可，代码如下： 
\#!/usr/bin/env python 
\# -- coding:utf-8 -- 
import datetime 
import binascii 
def showTime(): 
print datetime.datetime.now().strftime("%H:%M:%S") 
def crack(): 
crcs = set([0xE761062E, 0x2F9A55D3, 0xF0F809B5, 
0x645F52A4, 0x0F448B76, 0x3E1A57D9, 0x3A512755]) 
r = xrange(32, 127) 
for a in r: 
for b in r: 
for c in r: 
for d in r: 
txt = chr(a)+chr(b)+chr(c)+chr(d) 
crc = binascii.crc32(txt) 
if (crc & 0xFFFFFFFF) in crcs: 
print txt 
if **name** == "**main**": 
showTime() 
crack() 
showTime() 
在命令行下运行上面的Python脚本，等待一段时间后即可看到结果，具体的运行时间由机器的配置决定（经测试，实验机器只需要两分钟左右的时间即可完成破解，破解过程因为占用CPU比较高，因此可能会比较卡，耐心等待即可）。运行结果如下图所示： 
![图片2.png](https://www.hetianlab.com/specialized/headImg.action?news=ffaf1286-b7f5-442b-9faf-0d3e7ef46424.png) 
这里不到两分钟就完成了整个枚举过程，得到的字符串为：FLAG, assw, dono, ed_p, ord}, t_ne, {we_，我们尝试对其进行拼接，得到一个有意义的结果为：FLAG{we_donot_need_password}，这就是我们所要找的Flag字符串。
                                        