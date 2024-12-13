---
title: 推荐系列-WebRTC编译Android报错UnicodeDecodeError，如何解决-
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 1958
cover_picture: 'https://oscimg.oschina.net/oscnet/up-59f85ea85781eefccf269163128a601dccd.png'
abbrlink: 67321cab
date: 2021-04-15 09:46:45
---

&emsp;&emsp;由于去年WebRTC-client已经初现成果，因此从开年复工起，我们就开始着力于WebRTC安卓版本的编译。编译WebRTC Android使用的是python2.7.x，出现错误提示如下：“UnicodeDecodeError: ‘ascii...
<!-- more -->

                                                                                                                                                                                        由于去年WebRTC-client已经初现成果，因此从开年复工起，我们就开始着力于WebRTC安卓版本的编译。编译WebRTC Android使用的是python2.7.x，出现错误提示如下：“UnicodeDecodeError: ‘ascii’ codec can’t decode byte 0xe6 in position 11: ordinal not in range” 
![Test](https://oscimg.oschina.net/oscnet/up-59f85ea85781eefccf269163128a601dccd.png  'WebRTC编译Android报错UnicodeDecodeError，如何解决-') 
该报错的意思大致是：字符不在128范围内。即不是普通的ASCII字符集，超出处理的能力，ASCII码表是从0~127之间的范围。错误提示128已经超出了ASCII表。 
所以这个值的变量，无法处理ASCII码以外的字符集。 
Ubuntu编译android程序的工作空间的目录不允许有中文。但是一般国内使用的Ubuntu都会默认安装成中文语言，用户目录下的名称都是中文。 
对此我们有两种解决办法： 
1、把中文目录修改为英文，注意要修改~/.bashrc中的环境，还需要把安装Ubuntu默认的中文改成英文，比如：桌面和下载等等。 2、因为我们此处安装的是虚拟机，重新安装ubuntu，选择英文即可，该方法过程比较简单，但是安装步骤稍费时。 
目前我们已经开发了基于WebRTC实现的网页音视频通话系统EasyRTC，大家有兴趣也可以了解一下。 
![Test](https://oscimg.oschina.net/oscnet/up-59f85ea85781eefccf269163128a601dccd.png  'WebRTC编译Android报错UnicodeDecodeError，如何解决-') 
对于WebRTC的研究，大家可以关注我们，后续我们也将不断更新此类开发。WebRTC技术的开发将会给我们其他平台的视频直播带来一次变革更新，对于更多的建议和发展可能性，我们欢迎大家的沟通探讨。  
                                        