---
title: 海思NAS机顶盒IPV6动态域名解析外网访问
categories: 其他系列
tags:
  - Go
  - JavaScript
author: 狂欢马克思
abbrlink: f18d78f5
date: 2025-02-20 00:00:00
top: 206
---

没有公网IPv4地址，传统的内网穿透和异地组网方案往往复杂且不稳定。本文介绍如何利用IPv6技术实现海思NAS机顶盒的动态域名解析和外网访问，无需公网IPv4，无需复杂配置，即可轻松实现远程访问

<!-- more -->

![Popular](https://hosiang1026.github.io/photos/image/2024/12/15/oz718m.png "海思NAS机顶盒IPV6动态域名解析外网访问-入门篇")

### 一、家庭网络拓扑图

![NAS](https://hosiang1026.github.io/photos/image/2024/12/15/ip39fq.jpg "家里网络拓扑图")

#### 1.1 网络布局说明

```
**网络架构设计：**
```

为了优化网络性能和用户体验，采用了以下网络布局方案：

- **全屋同名WiFi**：所有路由器使用相同的WiFi名称（SSID），实现无缝漫游
- **AP模式部署**：路由器A和路由器B选择AP（接入点）模式，而不是路由模式
- **优势说明**：
  - **减少NAT转发**：避免多层NAT导致的降速问题
  - **保持同一网段**：所有设备在同一局域网内，方便资源共享
  - **设备漫游**：设备可以在不同路由器间无缝切换
  - **电视投屏**：支持跨路由器的投屏功能
  - **资源共享**：所有设备可以方便地访问NAS等共享资源

```
**网络配置信息：**
```

```
内网IP分配:
光猫：192.168.1.1（主路由）
NAS盒子：192.168.1.2
路由器A(客厅)：192.168.1.3（AP模式）
路由器B(卧室)：192.168.1.4（AP模式）
WiFi名称：www.zhangsan.cn（统一SSID）
```

```
**注意事项：**
```
- 需要根据实际网络环境和设备情况进行调整
- 建议在配置前先规划好IP地址分配方案

#### 1.2 宽带信息

```
**宽带套餐：**
```
- **运营商**：中国移动
- **地区**：杭州
- **套餐**：100M（100Mbps）
- **实际测速数据**：
  - 上行网速：33Mbps
  - 下行网速：145Mbps
  - 实际下载网速：10MB/S

```
**说明：**
```
- 选择宽带运营商自由，可以根据当地实际情况选择
- 不同运营商和地区的IPv6支持情况可能不同

### 二、IPv6动态域名解析配置

#### 2.1 前提条件

```
**域名申请：**
```
- 申请一个域名，例如：`zhangsan.cn`（假设名字为张三）
- 创建二级域名：`nas.zhangsan.cn` 用于绑定NAS盒子
- **重要提示**：国内域名需要备案，否则可能无法正常使用

```
**网络环境：**
```
- 运营商送的光猫使用路由模式
- 已封禁端口：80、443，无法使用SSL（HTTPS）
- **优势**：支持IPv6，可以通过IPv6实现外网访问

```
**IPv6检测方法：**
```

1. **在线检测工具**：
```
   - 访问：[https://ipw.cn/ipv6](https://ipw.cn/ipv6)
```
   - 查看是否支持IPv6访问

2. **命令行检测**：
   - 在NAS盒子上输入命令：`ifconfig`
   - 查看网络接口信息，确认是否有IPv6地址（通常以`2001:`、`2408:`等开头）

```
**IPv6地址格式：**
```
- IPv6地址由8组4位十六进制数组成，用冒号分隔
- 例如：`2001:0db8:85a3:0000:0000:8a2e:0370:7334`
- 可以简写为：`2001:db8:85a3::8a2e:370:7334`

![NAS](https://hosiang1026.github.io/photos/image/2024/12/15/iq66l7.jpg "家里网络拓扑图")

#### 1. 安装DDNS-GO
   我申请的域名是腾讯云的，以下就以腾讯云DDNS为例。NAS盒子用Docker安装DDNS-GO，用于自动更新解析IPV6，钉钉群机器人发送更新通知，安装命令如下：

```
docker run -d --restart=always --name ddns-go --net=host -v /mnt/sda1/ddns:/root jeessy/ddns-go -l :9877 -f 600
```

安装完，访问 `http://NAS盒子IP:9877` 配置一下

![NAS](https://hosiang1026.github.io/photos/image/2024/12/15/iq6ltz.jpg "家里网络拓扑图")

#### 2. 腾讯云DNS解析
（1）API 密钥
```javascript
   腾讯云登陆-DNSPod - 访问管理-API 密钥(用于DDNS-GO配置：DNS服务商填写ID和Token)，可以直接访问[https://console.dnspod.cn/account/token/token](https://console.dnspod.cn/account/token/token)
```

 ![NAS](https://hosiang1026.github.io/photos/image/2024/12/15/iq61ka.jpg "家里网络拓扑图")


（2）DNS解析
```javascript
腾讯云登陆-控制台-DNSPod-DNS解析，可以直接访问 [https://console.dnspod.cn](https://console.dnspod.cn)
```

```
域名解析检测：[https://tool.dnspod.cn](https://tool.dnspod.cn)
```

![NAS](https://hosiang1026.github.io/photos/image/2024/12/15/iq639c.jpg "家里网络拓扑图")

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
```
server {
        listen 82;
        listen [::]:82;

        location / {
 	client_max_body_size 1024m;
	proxy_http_version 1.1;
	proxy_set_header Upgrade         $http_upgrade;
	proxy_set_header Connection      "Upgrade";
	proxy_set_header Host            $http_host;
	proxy_set_header X-Real-IP       $remote_addr;
	proxy_set_header X-Forward-For   $proxy_add_x_forwarded_for;
	proxy_set_header X-Forward-Proto $scheme;
	proxy_redirect off; 
	proxy_pass http://192.168.1.3;
        }

`路由器B:`
        listen 83;
        listen [::]:83;

	proxy_pass http://192.168.1.4;
        }

`执行以下命令，即可访问`
ln -sf /etc/nginx/sites-{available,enabled}/nginx_router
ln -sf /etc/nginx/sites-{available,enabled}/nginx_router2
nginx -s reload
```

![NAS](https://hosiang1026.github.io/photos/image/2024/12/15/iq69da.jpg "家里网络拓扑图")

路由器A访问：`http://nas.zhangsan.cn:82` -->192.168.1.3

![NAS](https://hosiang1026.github.io/photos/image/2024/12/15/iq6ch8.jpg "家里网络拓扑图")

路由器B访问：`http://nas.zhangsan.cn:83` -->192.168.1.4

![NAS](https://hosiang1026.github.io/photos/image/2024/12/15/iq6h83.jpg "家里网络拓扑图")

虽然IPV6是未来的趋势，对于设备所在的外网不支持IPV6，就没办法访问了，这个问题，暂时还没找到解决方案。更多IPV6文档，请查看：https://ipw.cn/doc

最后补充，外网不支持IPV6，建议使用cloudflare内网穿透，网速慢一点，但操作简单，楼主已经改成这个方案。