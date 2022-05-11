---
title: 推荐系列-打破 Dockershim 移除焦虑，且看Rancher 如何应对
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 152
cover_picture: 'https://static.oschina.net/uploads/img/202205/06182200_Nwjn.png'
abbrlink: d70727f0
date: 2022-05-11 05:14:30
---

&emsp;&emsp;龙， SUSE Rancher 中国社区技术经理，负责 Rancher 中国技术社区的维护和运营。拥有 8 年的云计算领域经验，经历了 OpenStack 到 Kubernetes 的技术变革，无论底层操作系统 Linux，还是...
<!-- more -->

                                                                                                                                                                                         
 
#### 前言 
早在 2020 年 12 月，Kubernetes 就宣布将要弃用 Dockershim。在 Kubernetes 中，Dockershim 是一个适配器组件，Dockershim 适配器允许 Kubelet 与 Docker 交互，就好像 Docker 是一个与 CRI 兼容的运行时一样。 
近日，Kubernetes v1.24 版本正式发布，最主要的变化就是删除了 Dockershim。也就是说，Kubernetes v1.24 无法再通过 in-tree 的形式来支持 Docker 作为它的 CRI 运行时。 
随着 Kubernetes 的发展， 虽然 Docker 日渐式微，但还是有大量用户群体离不开 Docker，或者说暂时无法切换到 containerd 或 CRI-O 作为它的 CRI 运行时。 Rancher 为了满足继续使用 Docker 作为 CRI 运行时的需求，通过 RKE 集群支持外部 Dockershim 继续使用 Docker 作为 CRI 运行时。 
虽然 Rancher 最新的 v2.6.4 目前还不支持 Kubernetes v1.24，但早在 Kubernetes v1.21 中就采用了 Mirantis 和 Docker 宣布的上游开源社区外部 Dockershim （该项目称为 cri-dockerd）来确保 RKE 集群可以继续使用 Docker。换句话说，你可以像之前一样继续基于 Docker Engine 构建 Kubernetes，唯一的区别就是 Dockershim 由内置方案变成了外部方案。 
要启用外部 Dockershim，只需要在 RKE 配置中设置以下选项： 
 
 ```java 
  enable_cri_dockerd: true

  ``` 
  
由于外部 Dockershim 的支持是从 RKE 创建的 Kubernetes 1.21 及以上的版本中开始支持，所以我们需要通过 RKE 创建一个 Kubernetes 1.21 及以上的 Kubernetes 版本才能支持这种方案。 
下面将演示如何在 RKE 创建的 Kubernetes 集群中启用外部 Dockershim。 
 
#### 通过 RKECLI 创建集群 
说明： 
 
 RKE 的安装及使用，请参考官方文档http://docs.rancher.cn/rke， 这里不再详细说明。 
 本次 demo 使用的 RKE 版本为  
 ```java 
  v1.3.9
  ``` 
 。 
 
 
###### 配置RKE cluster.yml 文件 
在 RKE 的集群配置文件 cluster.yml 中通过增加 enable_cri_dockerd: true 选项来启用外部 Dockershim 支持。本例使用最精简文件示例，如需个性化设置，请根据需求调整选项： 
 
 ```java 
  ~$ cat cluster.yml
nodes:
  - address: 192.168.205.19
    user: ubuntu
    role:
      - controlplane
      - etcd
      - worker
enable_cri_dockerd: true

  ``` 
  
 
###### 通过 RKE 创建 Kubernetes 集群 
 
 ```java 
  ~$ rke up
INFO[0000] Running RKE version: v1.3.9
INFO[0000] Initiating Kubernetes cluster
INFO[0000] cri-dockerd is enabled for cluster version [v1.22.7-rancher1-2]
INFO[0000] [certificates] GenerateServingCertificate is disabled, checking if there are unused Kubelet certificates
INFO[0000] [certificates] Generating admin certificates and kubeconfig
...
...
...
INFO[1130] [ingress] ingress controller nginx deployed successfully
INFO[1130] [addons] Setting up user addons
INFO[1130] [addons] no user addons defined
INFO[1130] Finished building Kubernetes cluster successfully

  ``` 
  
 
###### 确认启用cri-dockerd 
集群创建成功后，连接到下游集群的主机查看进程，可以发现增加了一个 cri-dockerd 的进程： 
 
 ```java 
  root@dev-1:~# ps -ef | grep cri-dockerd
root     26211 25813  3 11:26 ?        00:04:13 /opt/rke-tools/bin/cri-dockerd --network-plugin=cni --cni-conf-dir=/etc/cni/net.d --cni-bin-dir=/opt/cni/bin --pod-infra-container-image=rancher/mirrored-pause:3.6

  ``` 
  
Cri-dockerd 其实就是从被移除的 Dockershim 中，独立出来的一个项目。为 Docker Engine 提供了一个垫片（shim），可以通过 Kubernetes CRI 控制 Docker。这意味着你可以像以前一样继续基于 Docker Engine 构建 Kubernetes，只需从内置的 Dockershim 切换到外部的 Dockershim 即可。 
接下来，我们再观察 Kubelet 的参数变化： 
 
 ```java 
  root@dev-1:~# docker inspect kubelet
            "Entrypoint": [
                ...
                "**--container-runtime=remote**",
                "-**-container-runtime-endpoint=/var/run/Dockershim.sock**",
                ...
            ],

  ``` 
  
可以看到，增加 enable_cri_dockerd: true参数启动的 Kubernetes 集群增加了 --container-runtime=remote和 --container-runtime-endpoint=/var/run/Dockershim.sock 两个 Kubelet 参数。通过这两个 Kubelet 参数可以设置 Kubernetes 集群利用外部 Dockershim 继续使用 Docker 作为 CRI 运行时。 
 
#### 通过Rancher 创建 RKE 集群 
如果你是 Rancher 的长期用户，你肯定会知道从 Rancher UI上创建的自定义集群就是通过 RKE 来去实现的。只不过通过 Rancher UI 创建的RKE 集群可以省去配置 RKE cluster.yml 的烦恼，只需要从 UI 上做一些简单的配置即可。 
本节，将给大家介绍如何通过 Rancher 创建 RKE 集群并启用外部 Dockershim 支持。 
 
###### 安装 Rancher 
Rancher 的安装及使用，请参考官方文档，这里不再详细说明。因为RKE 创建的Kubernetes 1.21 及以上的版本中才开始支持外部 Dockershim，并且只有 Rancher v2.6.x 才支持Kubernetes 1.21 或以上版本。所以，我们本次示例选择 Rancher2.6.4 作为 demo 环境。 
 
###### 创建自定义集群 
 
通过 Edit as YAML 来设置 enable_cri_dockerd 参数值为 true  将 enable_cri_dockerd 的值修改为 true，保存并创建集群  
 
###### 确认启用cri-dockerd 
可以参考上面“通过 RKE CLI 创建集群”章节的步骤去检查下游集群是否成功启用了 cri-docker，为了节省篇幅，这里就不重复说明。 
 
#### 常见问题 
 
###### 问：如果要获得 Rancher 对上游 Dockershim 的支持，我需要升级 Rancher 吗？ 
答：对于 RKE，Dockershim 的上游支持从 Kubernetes 1.21 开始。你需要使用支持 RKE 1.21 的 Rancher 版本。详情请参见我们的支持矩阵。 
 
###### 问：我目前的 RKE 使用 Kubernetes 1.20。为了避免出现不再支持 Dockershim 的情况，我是否需要尽早将 RKE 升级到 Kubernetes 1.21？ 
答：在使用 Kubernetes 1.20 的 RKE 中，Dockershim 版本依然可用，而且在下一个发行版发行之前不会被弃用。有关时间线的更多信息，请参见 Kubernetes Dockershim 弃用相关的常见问题。Kubernetes 会发出将会弃用 Dockershim 的警告，而 Rancher 在 RKE 中已经用 Kubernetes 1.21 缓解了这个问题。你可以按照计划正常升级到 1.21。 
 
###### 问：如果我不想再依赖 Dockershim，我还有什么选择？ 
答：你可以为 Kubernetes 使用不需要 Dockershim 支持的运行时，如 Containerd。RKE2 和 K3s 就是其中的两个选项。 
 
###### 问：如果我目前使用 RKE1，但想切换到 RKE2，我可以怎样进行迁移？ 
答：你可以构建一个新集群，然后将工作负载迁移到使用 Containerd 的新 RKE2 集群。Rancher 也在探索就地升级路径的可能性。 
 
###### 问：如果我已经通过 RKE 创建了 Kubernetes v1.21 以上的集群，当我切换到外部 Dockershim 是否会对集群有影响？ 
答：无影响，因为容器运行时没有变化，Dockershim 只是由内置方案变成了外部方案。
                                        