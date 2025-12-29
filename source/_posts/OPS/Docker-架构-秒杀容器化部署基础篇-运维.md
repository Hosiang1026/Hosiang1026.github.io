---
title: Docker秒杀微服务架构容器化部署-基础篇
categories: 原创文章
author: 狂欢马克思
tags:
  - Develop
top: 1
abbrlink: 450075ac
date: 2024-09-20 00:00:00
cover_picture: 'https://api.opics.org/api'
---

Docker是一个开源的应用容器引擎，基于Go语言开发，可以让开发者将应用及其依赖打包到轻量级、可移植的容器中，实现"一次构建，到处运行"。本文以秒杀系统微服务架构为实战案例，详细介绍如何使用Docker实现容器化部署，包括Docker基础概念、镜像构建、容器编排、服务编排等核心技术。从单体应用到微服务架构的容器化改造，帮助开发者掌握Docker在生产环境中的应用实践。

<!-- more -->

![Docker](https://hosiang1026.github.io/photos/image/2024/12/15/10u1mvq.png "Docker秒杀微服务架构容器化部署")

---

### 一、部署

![Docker秒杀微服务架构容器化部署](https://hosiang1026.github.io/photos/image/2024/12/15/10u3tm7.png "Docker秒杀微服务架构容器化部署")

个人开发项目可以忽略部分环节，如果是团队项目以上所有环节都是必不可少的，测试->预生产->生产环境(蓝绿+灰度发布)

前戏就不说了，环境配置构建工具之类的，这个后面会有项目的文档输出，这里以秒杀服务为例，通过配置以下脚本命令就可以发布到容器中。

```
docker run -d -p 8082:8082 \
-v /home/cloud/seckill-1.0.0.jar:/usr/seckill-1.0.0.jar \
--name tools-sys \
docker.io/openjdk:8 java -jar /usr/seckill-1.0.0.jar
```

开发运维人员可以通过`Jenkins`为每个服务定制一个服务脚本。

### 二、管理

推荐给各位小伙伴们一款简单易用的面板管理工具`Portainer`，她是个轻量级的Docker管理面板，倾向于单机的管理，不过`Portaine`可以配合`Swarm`一起使用进行集群管理操作。

一键傻瓜式安装，操作十分方便：

```
docker run -d -p 9000:9000 \
--restart=always \
-v /var/run/docker.sock:/var/run/docker.sock \
--name prtainer \
docker.io/portainer/portainer
```

初次使用需要创建超级用户密码：

![](https://hosiang1026.github.io/photos/image/2024/12/15/10u1m90.png)

创建完成以后，你可以选择管理本地或者远程容器：

![](https://hosiang1026.github.io/photos/image/2024/12/15/10u1nhm.png)

![](https://hosiang1026.github.io/photos/image/2024/12/15/10u1ush.png)

进入首页：

![](https://hosiang1026.github.io/photos/image/2024/12/15/10u1zjb.png)

撸主跑了7个容器服务，2个正常运行，5个已经死翘翘中。

一些常用的镜像模板：

![](https://hosiang1026.github.io/photos/image/2024/12/15/10u2l38.png)

可以对容器服务进行启动、删除、重启等一系列操作，还可以查看日志、系统占用资源统计。

![](https://hosiang1026.github.io/photos/image/2024/12/15/10u2vhx.png)

![](https://hosiang1026.github.io/photos/image/2024/12/15/10u39ut.png)


### 三、小结

个人使用的话，感觉还是挺好的，小团队项目也可以考虑使用，毕竟`k8s`这玩意离大多数项目还是挺遥远的。