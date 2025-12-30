---
title: Hexo中文博客站点基础配置
categories: Hexo博客搭建指南系列
tags:
  - C
author: 狂欢马克思
abbrlink: 81ec0d4a
date: 2018-09-12 00:00:00
top: 4
---

Hexo静态博客需要服务器托管才能在线访问，而GitHub Pages、Gitee Pages等代码托管平台提供了免费的静态网页托管服务，为个人博客搭建提供了完美的基础。本文详细介绍如何将Hexo博客部署到代码托管平台，包括Git配置、仓库创建、主题配置、域名绑定等完整流程

<!-- more -->

![Hexo](/photo/album/image_082.png "Hexo中文博客站点-基础篇")


### 一、托管平台

#### Github
 
##### 1.1 注册Github

在本地搭建好Hexo后可以将内容同步到Github上，可以在网上浏览。则需要托管平台，Github官网上去注册账户，注册的过程就不罗嗦了。

##### 1.2 创建Reposity

 创建项目，命名：比如 `hexoblog.github.io` ，填入相关信息。
 
##### 1.3 安装Git

```
[Git for Windows](https://git-for-windows.github.io/)
```

是否安装成功测试命令

`git  version`

##### 1.4 配置SSH key

`ssh-keygen -t rsa -C "your_email@example.com"`

代码参数含义：

`-t ` 指定密钥类型，默认是 `rsa` ，可以省略，还可以指定为 `dsa`。

`-C`  设置注释文字，比如邮箱。

`-f` 指定密钥文件存储文件名。可以省略，使用默认值 `id_rsa` 和 `id_rsa.pub`。

`your_email@example.com`  自己的注册邮箱。

```
成功后会生成两个文件id_rsa 以及id_rsa.pub，之后在github添加SSH Key，在任意界面右上角，点击你的头像，选择Settings-> SSH keys->New SSH key 
```

将生成的key添加

`ssh-add id_rsa`

测试SSH key是否配置成功

`ssh -T git@github.com`

#### Coding、Gitee

Coding、Gitee与GitHub类似，选择托管国内的Coding、Gitee，网站访问速度肯定要快一点。


### 二、域名购买

选择了阿里云和腾讯云，还有其他的也可以。


### 三、域名备案

备案过程详细（略）

### 四、图床注册

大家都选择了七牛云，提供图片外链，也可以找免费、稳定的图床。

