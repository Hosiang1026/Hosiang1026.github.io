---
title: Java版支付宝支付接口调用-开发篇
categories: 原创文章
author: 狂欢马克思
tags:
  - Develop
top: 7
abbrlink: 275b9440
date: 2024-05-05 00:00:00
cover_picture: 'https://api.opics.org/api'
---


本篇文章讲解，利用支付宝沙箱调用电脑网站支付接口，完成付款功能，Demo中会配置个人的沙箱账号信息，有需要的可以参考。 

<!-- more -->

![Alipay](https://hosiang1026.github.io/photos/image/2024/12/15/10s76ok.jpg "Alipay支付宝支付接口调用-Java版")

---

**项目框架：** SpringBoot+Maven

**测试环境：** Eclipse+JDK1.6及以上+Tomcat6.0及以上 

---


### 一、沙箱环境

[蚂蚁金服开发平台](https://open.alipay.com)-服务商登录-开发者中心-研发服务-沙箱环境

#### 1.1 配置密钥

配置自己的沙箱账号和密钥可参照：[沙箱环境和正式环境配置与demo测试]( https://openclub.alipay.com/read.php?tid=1513&fid=28)

#### 1.2 下载APP

正式账号应用创建，密钥配置可查看RSA密钥生成，支付应用创建，请参考-[如何使用沙箱环境说明](https://openclub.alipay.com/read.php?tid=730&fid=28)

1、一款Android手机扫描二维码，下载沙箱版支付宝APP

2、还有沙箱账号（商家、买家），用于后续进行测试支付使用。

3、另外，提供了一些调试的产品功能都已经开通权限，无需签约，可以查看列表。


### 二、搭建和配置开发环境

[蚂蚁金服开发平台](https://open.alipay.com)-开发文档-电脑网站支付

#### 2.1 下载SDK&Demo

下载电脑网站支付Demo后，进行项目搭建。

#### 2.2 参考API列表

具体调用查看API

注：电脑网站支付alipay-demo代码分享，传送门：
https://github.com/Hosiang1026/alipay-demo

---

![alipay](https://hosiang1026.github.io/photos/image/2024/12/16/reqm3x.gif
 "Java调用支付宝电脑网站支付接口")

---