---
title: NAS盒子-IPV6动态域名解析外网访问-入门篇
categories: 热门文章
author: 狂欢马克思
tags:
  - NAS
top: 1
cover_picture: photo/album/image/image_028.jpg
abbrlink: 1489a919
date: 2022-07-08 00:00:00
---


&emsp;&emsp; 没有公网IP，刷遍论坛和教程，折腾各种内网穿透、异地组网，感觉一点都不快乐了，那就看看这里的IPV6，给你带来全新的解决方案，开始愉快的玩耍吧！

<!-- more -->


### 一、家里网络拓扑图

介绍一下网络布局，全屋设置同名WiFI，而路由器A和路由器B选择AP模式，是为了减少NAT转发降速，同时保持同一网段，方便所有联网的设备漫游、电视投屏、资源共享，每家的网络情况不一样，仅供参考。
```
内网IP:
光猫：192.168.1.1
NAS盒子：192.168.1.2
路由器A(客厅)：192.168.1.3
路由器B(卧室)：192.168.1.4
WiFi名称：www.zhangsan.cn
```
家里用的宽带：中国移动，地区杭州，办理100M（100Mbps）套餐，按照如上图组网，每台设备的测网速数据：
上行网速:33Mbps
下行网速:145Mbps
实际下载网速:10MB/S   

注：不是打广告，选择宽带运营商自由

### 二、盒子IPV6动态解析域名
前提：
申请一个域名：`zhangsan.cn`（比如我的名字为张三），`nas.zhangsan.cn` 二级域名绑定NAS盒子，国内的域名记得备案。我家里运营商送的光猫用路由模式已封禁端口：80、443，无法使用SSL，好在支持IPV6。
IPV6检测：[https://ipw.cn/ipv6](https://ipw.cn/ipv6) ，或者查看NAS盒子是否支持IPV6，输入命令：`ifconfig`

#### 1. 安装DDNS-GO
   我申请的域名是腾讯云的，以下就以腾讯云DDNS为例。NAS盒子用Docker安装DDNS-GO，用于自动更新解析IPV6，钉钉群机器人发送更新通知，安装命令如下：

```
docker run -d --restart=always --name ddns-go --net=host -v /mnt/sda1/ddns:/root jeessy/ddns-go -l :9877 -f 600
```

安装完，访问 `http://NAS盒子IP:9877` 配置一下

#### 2. 腾讯云DNS解析
（1）API 密钥
   腾讯云登陆-DNSPod - 访问管理-API 密钥(用于DDNS-GO配置：DNS服务商填写ID和Token)，可以直接访问[https://console.dnspod.cn/account/token/token](https://console.dnspod.cn/account/token/token)

（2）DNS解析
腾讯云登陆-控制台-DNSPod-DNS解析，可以直接访问 [https://console.dnspod.cn](https://console.dnspod.cn)

域名解析检测：[https://tool.dnspod.cn](https://tool.dnspod.cn)

上面所有操作完成后：
家里内网可以访问：`http://nas.zhangsan.cn`
在外网可以访问：`http://nas.zhangsan.cn:81`
温馨提示：
如果嫌弃带有端口号，可以通过访问一级域名 `http://zhangsan.cn/nas`
自动跳转到 `http://nas.zhangsan.cn:81`
提前是一级域名 `http://zhangsan.cn` 已经正常解析，比如我的Hexo博客是托管GitHub Page，博客里添加一个菜单nas/index.md里面，跳转代码如下：

```
<script type="text/javascript">
    window.location.href = "http://nas.zhangsan.cn:81";
</script>
```
### 三、外网访问家里的路由器

NAS盒子、路由器A和路由器B必须设置静态内网IP，其他设备DHCP分配地址，然后通过NAS盒子里的Nginx代理可以实现访问家里的路由器，配置如下：

路由器A:

路由器B:

执行以下命令，即可访问

```
ln -sf /etc/nginx/sites-{available,enabled}/nginx_router
ln -sf /etc/nginx/sites-{available,enabled}/nginx_router2
nginx -s reload
```
路由器A访问：`http://nas.zhangsan.cn:82` -->192.168.1.3
路由器B访问：`http://nas.zhangsan.cn:83` -->192.168.1.4

虽然IPV6是未来的趋势，对于设备所在的外网不支持IPV6，就没办法访问了，这个问题，暂时还没找到解决方案。更多IPV6文档，请查看：https://ipw.cn/doc
最后，第一次论坛发帖，希望大家评论点赞多多支持！！！