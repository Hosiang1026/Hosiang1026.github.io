---
title: Docker秒杀微服务架构
categories:
  - 运维
  - 架构设计
tags:
  - Java
author: 狂欢马克思
abbrlink: 7b98c8b4
date: 2018-10-11 00:00:00
top: 1
---

个人开发项目可以忽略部分环节，如果是团队项目以上所有环节都是必不可少的，测试->预生产->生产环境(蓝绿+灰度发布)

<!-- more -->

### 一、部署

```
个人开发项目可以忽略部分环节，如果是团队项目以上所有环节都是必不可少的，测试->预生产->生产环境(蓝绿+灰度发布)
```

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

创建完成以后，你可以选择管理本地或者远程容器：

进入首页：

撸主跑了7个容器服务，2个正常运行，5个已经死翘翘中。

一些常用的镜像模板：

可以对容器服务进行启动、删除、重启等一系列操作，还可以查看日志、系统占用资源统计。

### 三、小结

个人使用的话，感觉还是挺好的，小团队项目也可以考虑使用，毕竟`k8s`这玩意离大多数项目还是挺遥远的。
