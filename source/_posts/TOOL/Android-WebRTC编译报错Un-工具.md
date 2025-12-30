---
title: WebRTC编译Android报错UnicodeDecode
categories: 其他系列
tags:
  - Shell
  - Java
abbrlink: a44c9d38
date: 2024-01-06 00:00:00
top: 168
---

由于去年WebRTC-client已经初现成果，因此从开年复工起，我们就开始着力于WebRTC安卓版本的编译。编译WebRTC Android使用的是python2.7.x，出现错误提示如下：“UnicodeDecodeError: ‘ascii...
<!-- more -->

                                                                                                                                                                                        由于去年WebRTC-client已经初现成果，因此从开年复工起，我们就开始着力于WebRTC安卓版本的编译。编译WebRTC Android使用的是python2.7.x，出现错误提示如下：“UnicodeDecodeError: ‘ascii’ codec can’t decode byte 0xe6 in position 11: ordinal not in range” 
![Test](https://oscimg.oschina.net/oscnet/up-59f85ea85781eefccf269163128a601dccd.png  'WebRTC编译Android报错UnicodeDecodeError，如何解决-') 
该报错的意思大致是：字符不在128范围内。即不是普通的ASCII字符集，超出处理的能力，ASCII码表是从0~127之间的范围。错误提示128已经超出了ASCII表。 
所以这个值的变量，无法处理ASCII码以外的字符集。 
Ubuntu编译android程序的工作空间的目录不允许有中文。但是一般国内使用的Ubuntu都会默认安装成中文语言，用户目录下的名称都是中文。 
对此我们有两种解决办法： 
1、把中文目录修改为英文，注意要修改~/.bashrc中的环境，还需要把安装Ubuntu默认的中文改成英文，比如：桌面和下载等等。 2、因为我们此处安装的是虚拟机，重新安装ubuntu，选择英文即可，该方法过程比较简单，但是安装步骤稍费时。 

## 问题深入分析

### 一、Unicode编码问题

UnicodeDecodeError是Python在处理非ASCII字符时常见的错误。当Python 2.7.x尝试使用ASCII编码解码包含非ASCII字符的字符串时，就会出现这个错误。WebRTC的编译脚本在处理包含中文路径时，会遇到这个问题。

### 二、解决方案详解

#### 2.1 方案一：修改系统环境变量

如果不想重新安装系统，可以通过修改环境变量来解决：

1. 修改`~/.bashrc`文件，添加以下内容：
```bash
export LC_ALL=en_US.UTF-8
export LANG=en_US.UTF-8

```

2. 执行`source ~/.bashrc`使配置生效

3. 将用户目录下的中文文件夹名称改为英文，例如：
   - 将"桌面"改为"Desktop"
   - 将"下载"改为"Downloads"
   - 将"文档"改为"Documents"

#### 2.2 方案二：使用符号链接

如果不想修改目录名称，可以创建一个英文路径的符号链接： `ln -s ~/实际中文目录名 ~/英文目录名` 然后在编译时使用英文路径。

#### 2.3 方案三：修改Python默认编码

在编译脚本的开头添加编码声明：

```python
# -*- coding: utf-8 -*-
import sys
reload(sys)
sys.setdefaultencoding('utf-8')

```

### 三、最佳实践建议

1. 开发环境统一使用英文：在搭建开发环境时，建议使用英文路径和英文系统语言，避免后续遇到编码问题。

2. 使用Python 3.x：Python 3.x对Unicode的支持更加完善，如果可能，建议升级到Python 3.x版本。

3. 路径规范化：在编写跨平台脚本时，使用`os.path`模块处理路径，避免硬编码路径。

4. 虚拟环境隔离：使用虚拟环境可以避免系统环境变量对编译过程的影响。

### 四、WebRTC编译注意事项

除了编码问题，编译WebRTC Android版本时还需要注意：

1. 系统要求：确保系统满足WebRTC的编译要求，包括足够的磁盘空间（建议至少100GB）和内存（建议至少16GB）。

2. 依赖安装：按照官方文档安装所有必需的依赖包，包括JDK、Android SDK、NDK等。

3. 网络环境：编译过程需要下载大量依赖，确保网络连接稳定，必要时配置代理。

4. 编译参数：根据目标平台正确配置编译参数，包括目标架构、API级别等。

目前我们已经开发了基于WebRTC实现的网页音视频通话系统EasyRTC，大家有兴趣也可以了解一下。 
                                        