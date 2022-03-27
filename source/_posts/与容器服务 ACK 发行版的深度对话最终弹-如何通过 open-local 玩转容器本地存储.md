---
title: 推荐系列-与容器服务 ACK 发行版的深度对话最终弹-如何通过 open-local 玩转容器本地存储
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 310
cover_picture: >-
  https://img-blog.csdnimg.cn/6bc206642fe9463496ddd946c4dff9c3.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBA6Zi_6YeM5be05be05LqR5Y6f55Sf,size_20,color_FFFFFF,t_70,g_se,x_16#pic_center
abbrlink: 13dd2573
date: 2022-03-27 11:55:11
---

&emsp;&emsp;： 各位阿里巴巴云原生的读者朋友们大家好，又跟大家见面了。今天是我们的老朋友『阿里云容器服务 ACK 发行版』最后一次做客探究身世之谜系列专栏，在之前的访谈中，它为我们带来了精彩的...
<!-- more -->

                                                                                                                    
            程序员健身是为了保养还是保命？参与话题讨论赢好礼 >>>
            
                                                                                                    记者： 各位阿里巴巴云原生的读者朋友们大家好，又跟大家见面了。今天是我们的老朋友『阿里云容器服务 ACK 发行版』最后一次做客探究身世之谜系列专栏，在之前的访谈中，它为我们带来了精彩的讲解，感兴趣的朋友们欢迎回顾。我们了解到，从去年 12 月上线至今，容器服务 ACK ���行版受到了大家的关注与支持，也取得了不错的下载量，对此您有什么看法吗？ 
阿里云容器服务 ACK 发行版（简称ACK Distro）： 是的，上线三个月以来有幸获得 400+的下载��，也通过不同途径与大家交流技术，感谢大家的关注，希望你们获得更好的容器服务体验。 
记者： 好的，那让我们进入正题吧~之前了解到 sealer 可以帮助您快速构建&部署，hybridnet 可以助力构建混合云统一网络平面，那么今天为我们介绍的是哪位多才多艺的小伙伴呢？ 
ACK Distro： 我们都知道，云原生背景下有状态应用需要借助一套存储方案进行数据持久化保存。本地存储相比分布式存储，在成本、易用性、可维护性、IO 性能上都更胜一筹，所以今天给大家讲解的就是——阿里巴巴开源的本地存储管理系统 open-local，以及我是如何借助它玩转容器本地存储。先给大家交代一下 open-local 诞生的契机吧，虽然刚才提到本地存储相较于分布式存储的优势，但本地存储作为目前低成本交付 Kubernetes 集群，是依然存在许多问题的： 
• Kubernetes 缺失存储资源的感知能力： 本地存储作为一种“非标”资源，在 Kubernetes 中的支持远低于标准资源（cpu、内存等）。使用本地存储需要一定的人力成本，如通过为节点打标来限制 Pod 调度、人工管理不同机型的磁盘、人工通过 Hostpath 方式挂载指定磁盘到容器等；同时还有一些私有化软件现场交付问题，如绑定了错误的宿主机路径使得故障无法及时发现，这些都严重影响了 Kubernetes 交付效率以及应用运行时的稳定性； 
• 本地存储空间隔离能力缺失： 应用挂载不适当的宿主机目录（如挂载到宿主机根路径）导致宿主机故障，如因应用数据写满磁盘导致容器运行时无响应、触发 Pod 驱逐、Pod 之间 IO 相互影响等问题； 
• Kubernetes 对有状态应用使用本地存储支持不足： 通过 Hostpath 无法做到节点保持，使得 Pod 漂移后应用数据丢失；使用半自动静态 Local PV 可保证节点保持，但是无法实现全自动，仍需要人为参与（如创建文件夹路径，为节点打标等）；无法使用一些高级存储能力（例如快照）。 
而 open-local 可以最大程度上避免这些问题，让大家获得更好的体验，在 Kubernetes 上使用本地存储就像使用集中式存储一样简单。 
#### open-local 的架构组成 
记者： 您可以进一步为我们讲解下 open-local 的架构组成部分吗？ 
ACK Distro： 当然，open-local 一共包含四个组件： 
1. scheduler-extender： 作为 kube-scheduler 的扩展组件，通过 Extender 方式实现，扩展了原生调度器对本地存储资源的感知，以实现对包括磁盘容量、多盘感知、磁盘介质（ssd or hdd）等信息的调度决策，做到存储资源的混合调度； 
2. csi-plugin： 符合 CSI(Container Storage Interface) 标准的本地磁盘管理能力，包含创建/删除/扩容存储卷、创建/删除快照、暴露存储卷 metrics 等能力； 
3. agent： 运行在集群中的每个节点，根据配置清单初始化存储设备，并通过上报集群中本地存储设备信息以供 scheduler-extender 决策调度； 
4. controller： 获取集群存储初始化配置，并向运行在各个节点的 agent 下发详细的资源配置清单。 
同时 open-local 包含两个 CRD： 
 
 NodeLocalStorage：open-local 通过 NodeLocalStorage 资源上报每个节点上的存储设备信息，该资源由 controller 创建，由每个节点的 agent 组件更新其 status。该 CRD 属于全局范围的资源。 
 NodeLocalStorageInitConfig：open-local controller 可通过 NodeLocalStorageInitConfig 资源创建每个 NodeLocalStorage 资源。NodeLocalStorageInitConfig 资源中包含全局默认节点���置和特定节点配置，若节点的 node label 满足表达式则使用特定节点配置，否则使用默认配置。 
 
它的架构图可以参照下面： 
 
#### open-local 的使用场景 
记者： 那么什么样的需求场景下大家会用到 open-local 呢？ 
ACK Distro： 我总结了以下几个使用案例，大家可以根据自己的情况对号入座。 
 
 应用期望数据卷具备容量隔离能力，避免出现诸如日志打满系统盘的情况； 
 应用需要大量本地存储并依赖节点保持，如 Hbase、etcd、ZooKeeper、ElasticSearch 等； 
 集群本地磁盘数量众多，希望通过调度器实现有状态应用的自动化部署； 
 通过存储快照能力为数据库类应用备份瞬时数据等。 
 
#### 如何在 ACK Distro 中使用 open-local 
记者： 接下来又到老问题了，open-local 的优势怎么在您身上体现呢？或者您怎样使用 open-local 可以达到最佳实践呢？ 
ACK Distro： 我分类别为大家讲解吧~ 
###### 1.初始化设置 
首先确保环境中已经安装 lvm 工具，在安装部署我时会默认安装 open-local，编辑NodeLocalStorageInitConfig 资源，进行存储初始化配置。 
 
 ```java 
  # kubectl edit nlsc open-local

  ``` 
  
使用 open-local 要求环境中有 VG（VolumeGroup），若您的环境中已存在 VG 且有剩余空间，则可以配置在白名单中；若环境中没有 VG，您需要提供一个块设备名称供 open-local 创建 VG。 
 
 ```java 
  apiVersion: csi.aliyun.com/v1alpha1
kind: NodeLocalStorageInitConfig
metadata:
  name: open-local
spec:
  globalConfig: # 全局默认节点配置，初始化创建 NodeLocalStorage 时会填充到其 Spec 中
    listConfig:
      vgs:
        include: # VolumeGroup 白名单，支持正则表达式
        - open-local-pool-[0-9]+
        - your-vg-name # 若环境中已有 VG，可以写入白名单由 open-local 纳管
    resourceToBeInited:
      vgs:
      - devices:
        - /dev/vdc  # 若环境中没有 VG，用户需提供一个块设备
        name: open-local-pool-0 # 将块设备 /dev/vdc 初始化为名叫 open-local-pool-0 的 VG

  ``` 
  
NodeLocalStorageInitConfig 资源编辑完毕后，controller 和 agent 会更新所有节点的 NodeLocalStorage 资源。 
###### 2.存储卷动态供应 
open-local 默认在集群中部署了一些存储类模板，我以 open-local-lvm、open-local-lvm-xfs 和 open-local-lvm-io-throttling 举例： 
 
 ```java 
  # kubectl get sc
NAME                           PROVISIONER            RECLAIMPOLICY   VOLUMEBINDINGMODE      ALLOWVOLUMEEXPANSION   AGE
open-local-lvm                 local.csi.aliyun.com   Delete          WaitForFirstConsumer   true                   8d
open-local-lvm-xfs             local.csi.aliyun.com        Delete          WaitForFirstConsumer   true                   6h56m
open-local-lvm-io-throttling   local.csi.aliyun.com   Delete          WaitForFirstConsumer   true

  ``` 
  
创建一个 Statefulset，该 Statefulset 使用 open-local-lvm 存储类模板。此时创建的存储卷文件系统为 ext4。若用户指定 open-local-lvm-xfs 存储模板，则存储卷文件系统为 xfs。 
 
 ```java 
  # kubectl apply -f https://raw.githubusercontent.com/alibaba/open-local/main/example/lvm/sts-nginx.yaml

  ``` 
  
检查 Pod/PVC/PV 状态，可看到存储卷创建成功： 
 
 ```java 
  # kubectl get pod
NAME          READY   STATUS    RESTARTS   AGE
nginx-lvm-0   1/1     Running   0          3m5s
# kubectl get pvc
NAME               STATUS   VOLUME                                       CAPACITY   ACCESS MODES   STORAGECLASS     AGE
html-nginx-lvm-0   Bound    local-52f1bab4-d39b-4cde-abad-6c5963b47761   5Gi        RWO            open-local-lvm   104s
# kubectl get pv
NAME                                         CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                      STORAGECLASS    AGE
local-52f1bab4-d39b-4cde-abad-6c5963b47761   5Gi        RWO            Delete           Bound    default/html-nginx-lvm-0   open-local-lvm  2m4s
kubectl describe pvc html-nginx-lvm-0

  ``` 
  
###### 3.存储卷扩容 
编辑对应 PVC 的 spec.resources.requests.storage 字段，将 PVC 声明的存储大小从 5Gi 扩容到 20Gi。 
 
 ```java 
  # kubectl patch pvc html-nginx-lvm-0 -p '{"spec":{"resources":{"requests":{"storage":"20Gi"}}}}'

  ``` 
  
检查 PVC/PV 状态： 
 
 ```java 
  # kubectl get pvc
NAME                    STATUS   VOLUME                                       CAPACITY   ACCESS MODES   STORAGECLASS     AGE
html-nginx-lvm-0        Bound    local-52f1bab4-d39b-4cde-abad-6c5963b47761   20Gi       RWO            open-local-lvm   7h4m
# kubectl get pv
NAME                                         CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                           STORAGECLASS     REASON   AGE
local-52f1bab4-d39b-4cde-abad-6c5963b47761   20Gi       RWO            Delete           Bound    default/html-nginx-lvm-0        open-local-lvm            7h4m

  ``` 
  
###### 4.存储卷快照 
open-local 有如下快照类： 
 
 ```java 
  # kubectl get volumesnapshotclass
NAME             DRIVER                DELETIONPOLICY   AGE
open-local-lvm   local.csi.aliyun.com   Delete           20m

  ``` 
  
创建 VolumeSnapshot 资源： 
 
 ```java 
  # kubectl apply -f https://raw.githubusercontent.com/alibaba/open-local/main/example/lvm/snapshot.yaml
volumesnapshot.snapshot.storage.k8s.io/new-snapshot-test created
# kubectl get volumesnapshot
NAME                READYTOUSE   SOURCEPVC          SOURCESNAPSHOTCONTENT   RESTORESIZE   SNAPSHOTCLASS    SNAPSHOTCONTENT                                    CREATIONTIME   AGE
new-snapshot-test   true         html-nginx-lvm-0                           1863          open-local-lvm   snapcontent-815def28-8979-408e-86de-1e408033de65   19s            19s
# kubectl get volumesnapshotcontent
NAME                                               READYTOUSE   RESTORESIZE   DELETIONPOLICY   DRIVER                VOLUMESNAPSHOTCLASS   VOLUMESNAPSHOT      AGE
snapcontent-815def28-8979-408e-86de-1e408033de65   true         1863          Delete           local.csi.aliyun.com   open-local-lvm        new-snapshot-test   48s

  ``` 
  
创建一个新 Pod，该 Pod 对应的存储卷数据与之前应用快照点时刻的数据一致： 
 
 ```java 
  # kubectl apply -f https://raw.githubusercontent.com/alibaba/open-local/main/example/lvm/sts-nginx-snap.yaml
service/nginx-lvm-snap created
statefulset.apps/nginx-lvm-snap created
# kubectl get po -l app=nginx-lvm-snap
NAME               READY   STATUS    RESTARTS   AGE
nginx-lvm-snap-0   1/1     Running   0          46s
# kubectl get pvc -l app=nginx-lvm-snap
NAME                    STATUS   VOLUME                                       CAPACITY   ACCESS MODES   STORAGECLASS     AGE
html-nginx-lvm-snap-0   Bound    local-1c69455d-c50b-422d-a5c0-2eb5c7d0d21b   4Gi        RWO            open-local-lvm   2m11s

  ``` 
  
###### 5.原生块设备 
open-local 支持创建的存储卷将以块设备形式挂载在容器中（本例中块设备在容器 /dev/sdd 路径）: 
 
 ```java 
  # kubectl apply -f https://raw.githubusercontent.com/alibaba/open-local/main/example/lvm/sts-block.yaml

  ``` 
  
检查 Pod/PVC/PV 状态： 
 
 ```java 
  # kubectl get pod
NAME                READY   STATUS    RESTARTS   AGE
nginx-lvm-block-0   1/1     Running   0          25s
# kubectl get pvc
NAME                     STATUS   VOLUME                                       CAPACITY   ACCESS MODES   STORAGECLASS     AGE
html-nginx-lvm-block-0   Bound    local-b048c19a-fe0b-455d-9f25-b23fdef03d8c   5Gi        RWO            open-local-lvm   36s
# kubectl describe pvc html-nginx-lvm-block-0
Name:          html-nginx-lvm-block-0
Namespace:     default
StorageClass:  open-local-lvm
...
Access Modes:  RWO
VolumeMode:    Block # 以块设备形式挂载入容器
Mounted By:    nginx-lvm-block-0
...

  ``` 
  
###### 6.IO 限流 
 
 ```java 
  open-local 支持为 PV 设置 IO 限流，支持 IO 限流的存储类模板如下：
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: open-local-lvm-io-throttling
provisioner: local.csi.aliyun.com
parameters:
  csi.storage.k8s.io/fstype: ext4
  volumeType: "LVM"
  bps: "1048576" # 读写吞吐量限制在 1024KiB/s 上下
  iops: "1024"   # IOPS 限制在 1024 上下
reclaimPolicy: Delete
volumeBindingMode: WaitForFirstConsumer
allowVolumeExpansion: true

  ``` 
  
创建一个 Statefulset，该 Statefulset 使用 open-local-lvm-io-throttling 存储类模板。 
 
 ```java 
  # kubectl apply -f https://raw.githubusercontent.com/alibaba/open-local/main/example/lvm/sts-io-throttling.yaml

  ``` 
  
Pod 处于 Running 状态后，进入 Pod 容器中： 
 
 ```java 
  # kubectl exec -it test-io-throttling-0 sh

  ``` 
  
此时存储卷是以原生块设备挂载在 /dev/sdd 上，执行 fio 命令： 
 
 ```java 
  # fio -name=test -filename=/dev/sdd -ioengine=psync -direct=1 -iodepth=1 -thread -bs=16k -rw=readwrite -numjobs=32 -size=1G -runtime=60 -time_based -group_reporting

  ``` 
  
结果如下所示，可见读写吞吐量限制在 1024KiB/s 上下： 
 
 ```java 
  ......
Run status group 0 (all jobs):
   READ: bw=1024KiB/s (1049kB/s), 1024KiB/s-1024KiB/s (1049kB/s-1049kB/s), io=60.4MiB (63.3MB), run=60406-60406msec
  WRITE: bw=993KiB/s (1017kB/s), 993KiB/s-993KiB/s (1017kB/s-1017kB/s), io=58.6MiB (61.4MB), run=60406-60406msec
Disk stats (read/write):
    dm-1: ios=3869/3749, merge=0/0, ticks=4848/17833, in_queue=22681, util=6.68%, aggrios=3112/3221, aggrmerge=774/631, aggrticks=3921/13598, aggrin_queue=17396, aggrutil=6.75%
  vdb: ios=3112/3221, merge=774/631, ticks=3921/13598, in_queue=17396, util=6.75%

  ``` 
  
###### 7.临时卷 
open-local 支持为 Pod 创建临时卷，其中临时卷生命周期与 Pod 一致，即 Pod 删除后临时卷也随之删除。此处可理解为 open-local 版本的 emptydir。 
 
 ```java 
  # kubectl apply -f ./example/lvm/ephemeral.yaml

  ``` 
  
其结果如下： 
 
 ```java 
  # kubectl describe po file-server
Name:         file-server
Namespace:    default
......
Containers:
  file-server:
    ......
    Mounts:
      /srv from webroot (rw)
      /var/run/secrets/kubernetes.io/serviceaccount from default-token-dns4c (ro)
Volumes:
  webroot:   # 此为 CSI 临时卷
    Type:              CSI (a Container Storage Interface (CSI) volume source)
    Driver:            local.csi.aliyun.com
    FSType:
    ReadOnly:          false
    VolumeAttributes:      size=2Gi
                           vgName=open-local-pool-0
  default-token-dns4c:
    Type:        Secret (a volume populated by a Secret)
    SecretName:  default-token-dns4c
    Optional:    false

  ``` 
  
###### 8.监控大盘 
open-local 自带了监控大盘，用户可通过 Grafana 查看集群本地存储信息，包含存储设备和存储卷信息。如下图所示： 
ACK Distro：总而言之，借助 open-local ，在运维方面可减少人力成本，提高集群运行时的稳定性；功能方面，将本地存储的优势最大化，使用户不仅能体验到本地盘的高性能，同时各种高级存储特性丰���了���用场景，让广大开发者体验云原生带来的红利，实现应用上云尤其是有状态应用云原生部署关键一步。 
记者： 感谢 ACK Distro 的精彩讲解，这三次的做客让我们对它和它的小伙伴都有了更深入的了解，也希望访谈内容能为正在阅读文章的您提供一些帮助。 
ACK Distro： 是的，我和项目组成员在 GitHub 社区和社群欢迎大家的“骚扰”！ 
#### 相关链接 
[1]open-local 开源仓库地址： https://github.com/alibaba/open-local [2]ACK Distro 官网： https://www.aliyun.com/product/aliware/ackdistro [3]ACK Distro 官方 GitHub： https://github.com/AliyunContainerService/ackdistro [4]让创新触手可及，阿里云容器服务 ACK 发行版开放免费下载：https://mp.weixin.qq.com/s/Lc2afj91sykHMDLUKA_0bw [5]第一弹深度访谈： https://mp.weixin.qq.com/s/wB7AS52vEA_VeRegUyrVkA [6]第二弹深度访谈： https://mp.weixin.qq.com/s/O095yS5xPtawkh55rvitTg
                                        