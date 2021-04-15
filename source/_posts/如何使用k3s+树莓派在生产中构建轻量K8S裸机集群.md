---
title: 推荐系列-如何使用k3s+树莓派在生产中构建轻量K8S裸机集群
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 2067
cover_picture: 'https://static.oschina.net/uploads/img/201910/31105553_xgZY.jpg'
abbrlink: 9cce842e
date: 2021-04-15 09:19:21
---

&emsp;&emsp;Boogie Software是欧洲著名的金融科技公司，多年来致力于为银行提供Fintech、AI、大数据高性能后端、移动应用程序、数据分析及UX等创新服务，帮助银行推动数字化转型。凭借过去十多年在该领域...
<!-- more -->

                                                                                                                                                                                         
![Test](https://oscimg.oschina.net/oscnet/9e0c9d2e8b69df9c13653466ca762eb87e2.jpg  '如何使用k3s+树莓派在生产中构建轻量K8S裸机集群') 
Boogie Software的IT团队在很多客户银行的核心银行业务数字化的项目中使用到了Kubernetes和容器技术，因此我们��终在想Kubernetes能如何使用更合适的硬件在本地工作。在本文中，我将详细介绍我们如何在树莓派上构建轻量级裸机集群，以在公司网络中运行应用程序和服务。 
我们之所以这么做，有两个原因：第一，通过建立集群，我们将可以拥有一个平台，来可靠、灵活地运行公司网络内部应用程序和服务；第二，我们可以通过这次机会学习更多关于Kubernetes、微服务以及容器的技能。如果你也想要参照我们的经验来构建一个相似的系统，我建议你至少要了解关于Docker容器、Kubernetes关键概念（节点、pod、服务、deployment等）以及IP网络的基础知识。 
### 硬件准备 
你需要准备以下设备： 
 
  树莓派2B/3B/3B+ 的型号，至少一个。你甚至在单个开发板上运行某些应用程序，但是建议使用两个或更多的开发板来分散负载并增加冗余。  
  电源和可用于树莓派的SD卡，现有的以太网交换机或空闲端口以及一些电缆。  
 
在我们的设置中，我们目前有4个树莓派3代B+开发板，所以在集群中有一个master/server和3个代理节点。如果树莓派有外壳当然更好，我们的同事用3d打印机设计了一个。此外，机壳的背面有两个用于冷却的风扇，每个开发板都位于一个托盘上，该托盘可以热插拔以进行维护。这些托盘前面还设有activity/heartbeat LED和电源开关的位置，它们都连接到开发板的GPIO接头。 
![Test](https://oscimg.oschina.net/oscnet/9e0c9d2e8b69df9c13653466ca762eb87e2.jpg  '如何使用k3s+树莓派在生产中构建轻量K8S裸机集群') 
![Test](https://oscimg.oschina.net/oscnet/9e0c9d2e8b69df9c13653466ca762eb87e2.jpg  '如何使用k3s+树莓派在生产中构建轻量K8S裸机集群') 
### 软件准备 
对于Kubernetes的实现，我们使用的是k3s。k3s是由Rancher Labs推出的一款轻量级、通过CNCF一致性认证的Kubernetes发行版。尽管这是一款刚推出不久的产品，但它真的十分稳定和易用，可以实现秒级启动。让k3s从其他轻量的Kubernetes发行版脱颖而出的原因是，k3s可供生产使用，而诸如microk8s或Minikube之类的项目则无法实现这一目的，并且k3s十分轻巧，还可以在基于ARM的硬件上很好地运行。在k3s中，任何设备上安装Kubernetes所需的一切都包含在这一个40MB的二进制文件当中。 
k3s几乎能在任何Linux发行版中很好地运行，因此我们决定将Raspbian Stretch Lite作为基础OS，因为我们不需要在开发板上添加任何额外的服务或者桌面UI。k3s确实需要在Linux内核中启用cgroup，这可以在Raspbian上通过向/boot/cmdline.txt:添加以下参数来实现： 
 ```java 
  cgroup_enable=cpuset cgroup_memory=1 cgroup_enable=memory

  ```  
### 安装k3s 
k3s非常友好的地方在于，它可以实现平滑安装过程。你准备好你的server硬件之后，仅需几分钟就可以完成设置，因为它仅需一行命令就能安装server（主节点）： 
 ```java 
  curl -sfL https://get.k3s.io | sh -

  ```  
代理节点也是如此： 
 ```java 
  curl -sfL https://get.k3s.io | K3S_TOKEN=<token_from_server> K3S_URL=https://<server_ip>:6443 sh -

  ```  
其中token_from_server是来自服务器的文件/ var / lib / rancher / k3s / server / node-token的内容，server_ip是服务器节点的IP地址。至此，我们的集群已经启动并正在运行，我们可以开始部署工作负载： 
 ```java 
  root@k3s-server:~# kubectl get nodes
NAME         STATUS   ROLES    AGE    VERSION
k3s-node1    Ready    <none>   40s    v1.13.4-k3s.1
k3s-server   Ready    <none>   108s   v1.13.4-k3s.1

  ```  
为了管理和监控集群，我们安装了Kubernetes Dashboard，它能够提供给非常方便的web界面来查看整个系统的状态、执行管理员操作并访问日志。同时，本地安装和运行kubectl命令也非常有帮助，因为它可以让你从自己的计算机管理集群，而无需ssh进入集群。为此，你只需要安装kubectl，然后将集群信息从服务器节点config /etc/rancher/k3s/k3s.yaml复制到本地kubeconfig文件中（通常是${HOME}/.kube/config）。 
### 使用负载均衡器暴露服务 
默认情况下，部署在Kubernetes集群上的应用程序仅可以在集群中获取（默认服务类型是ClusterIP）。如果想要从集群外部获取应用程序，有两个选项。你可以使用NodePort类型配置服务，该服务在静态端口的每个节点IP上暴露服务，你也可以使用负载均衡器（服务类型LoadBalancer）。然而，NodePort服务有限制：它们使用自己专用的端口范围，我们只能通过端口号来区分应用。k3s内置了一个简单的负载均衡器，但由于它使用的是节点的IP地址，我们可能很快就会用完IP/端口组合并且无法将服务绑定到某个虚拟IP。基于这些原因，我们决定部署MetalLB——一种用于裸机集群的负载均衡器实现。 
只需应用YAML manifest即可安装MetalLB。在现有网络中运行MetalLB的最简单方法是使用所谓的第2层模式，这意味着集群节点通过ARP协议宣布本地网络中服务的虚拟IP。为此，我们从内部网络保留了一小部分IP地址用于集群服务。MetalLB的配置如下所示： 
 ```java 
  apiVersion: v1
kind: ConfigMap
metadata:
  namespace: metallb-system
  name: config
data:
  config: |
    address-pools:
    - name: company-office
      protocol: layer2
      addresses:
      - 10.10.10.50-10.10.10.99

  ```  
使用此配置，集群服务将被暴露在范围为10.10.10.50—10.10.10.99的地址中。为了绑定服务到指定的IP，你可以在服务清单中使用loadBalancerIP参数： 
 ```java 
  apiVersion: v1
kind: Service
metadata:
  name: my-web-app
spec:
  ports:
  - name: http
    port: 80
    protocol: TCP
    targetPort: 8080
  loadBalancerIP: 10.10.10.51
  selector:
    app: my-web-app
  type: LoadBalancer

  ```  
在负载均衡中，我们面临诸多挑战。例如，Kubernetes中限制在单个负载均衡器中同时使用TCP和UDP端口。要解决这一问题，你可以定义两个服务实例，一个用于TCP端口，另一个用于UDP端口。其缺点是，除非启用IP地址共享，否则你需要在不同的IP地址中运行这两个服务。而且，由于MetalLB是一个年轻项目，因此也存在一些小问题，但我们相信这些很快都会得到解决。 
### 添加存储 
k3s暂时没有内置的存储解决方案，所以为了使Pod能够访问持久性文件存储，我们需要使用Kubernetes的插件来创建一个。由于Kubernetes的目标之一是使应用程序与基础架构解耦并使其可移植，因此Kubernetes中用PersistentVolume（PV）和PersistentVolumeClaim（PVC）的概念定义了用于存储的抽象层。详细的概念解释可以参照我们之前发过的文章：详解Kubernetes存储关键概念。PV是通常由管理员配置并可供应用程序使用的存储资源。另一方面，PVC描述了应用程序对某种类型和一定数量的存储的需求。创建PVC（通常作为应用程序的一部分）时，如果有一个尚未使用且满足应用程序PVC要求的可用PVC，它将绑定到PV。配置和维护所有这些需要手动工作，因此动态配置卷应运而生。 
在我们的基础架构中，我们已经有一个现有的NFS服务器，因此我们决定将其用于集群持久性文件存储。在我们的案例中，最简单的方法是使用支持动态配置PV的NFS-Client Provisioner。Provisioner只需在现有的NFS共享上为每个新PV（集群映射到PVC）上创建新目录，然后将PV目录挂载在使用它的容器中。这样就无需配置NFS共享到单个pod中的卷，而是全部动态运行。 
### 为ARM交叉构建容器镜像 
显然，在基于ARM的硬件上（如树莓派）运行应用程序容器时，需要根据ARM的架构构建容器。在ARM架构容器中构建自己的应用程序时，可能会遇到一些陷阱。首先，基础镜像需要可用于你的目标架构体系。对于树莓派3来说，通常需要使用arm32v7的基础镜像，它们可以在大部分Docker镜像仓库中被调用。所以，当交叉构建应用程序时，确保你的Dockerfile包含以下代码： 
 ```java 
  FROM arm32v7/alpine:latest

  ```  
第二件需要注意的事是，你的主机Docker需要能够运行ARM二进制文件。如果你在mac上运行Docker，那操作将十分轻松，因为它对此有内置支持。如果是在Linux上，你需要执行一些步骤： 
#### 添加QEMU二进制文件到你的基础镜像 
为了在Linux上的Docker中运行ARM二进制文件，镜像需要一个QEMU二进制文件。你可以选择一个已经包含了QEMU二进制文件的基础镜像，也可以在镜像构建过程中复制 
qemu-arm-static二进制文件到其中，例如，通过将以下行添加到你的Dockerfile中： 
 ```java 
  COPY --from=biarms/qemu-bin /usr/bin/qemu-arm-static /usr/bin/qemu-arm-static

  ```  
 
然后，你需要在创建Docker镜像的主机OS上注册QEMU。这可以简单地通过以下方式实现： 
 ```java 
  docker run --rm --privileged multiarch/qemu-user-static:register --reset

  ```  
可以在构建实际镜像之前将该命令添加到你的构建脚本中。总结一下，你的Dockerfile.arm应该看起来像这样： 
 ```java 
  FROM arm32v7/alpine:latest
COPY --from=biarms/qemu-bin /usr/bin/qemu-arm-static /usr/bin/qemu-arm-static
# commands to build your app go here…
# e.g. RUN apk add --update <pkgs that you need…>

  ```  
并且你的build /CI脚本应该是： 
 ```java 
  docker run --rm --privileged multiarch/qemu-user-static:register --reset
docker build -t my-custom-image-arm . -f Dockerfile.arm

  ```  
这将为你提供ARM架构的容器镜像。如果你对细节很感兴趣，请参阅： 
https://www.ecliptik.com/Cross-Building-and-Running-Multi-Arch-Docker-Images/ 
### 自动化构建和上传到镜像仓库 
最后一步是自动化整个流程，以便容器镜像可以自动构建并且自动上传到一个镜像仓库，在那里可以轻松地将其部署到我们地k3s集群。在内部，我们使用GitLab进行源代码管理和CI/CD，因此我们自然希望在其中运行这些构建，它甚至包括一个内置的容器镜像仓库，因此���需要设置单独的镜像仓库。 
关于构建Docker镜像，GitLab有十分完善的文档（https://docs.gitlab.com/ee/ci/docker/using_docker_build.html ） ，因此我们不在此赘述。在为docker构建配置GitLab Runner之后，剩下要做的就是为该项目创建.gitlab-ci.yml文件。在我们的例子中，它看起来像这样： 
 ```java 
  image: docker:stable

stages:
  - build
  - release
 
variables:
  DOCKER_DRIVER: overlay2
  CONTAINER_TEST_IMAGE: ${CI_REGISTRY_IMAGE}/${CI_PROJECT_NAME}-arm:${CI_COMMIT_REF_SLUG}
  CONTAINER_RELEASE_IMAGE: ${CI_REGISTRY_IMAGE}/${CI_PROJECT_NAME}-arm:latest
 
before_script:
- docker info
- docker login -u gitlab-ci-token -p $CI_JOB_TOKEN $CI_REGISTRY
 
build_image:
  stage: build
  script:
    - docker pull $CONTAINER_RELEASE_IMAGE || true
    - docker run --rm --privileged multiarch/qemu-user-static:register --reset
    - docker build --cache-from $CONTAINER_RELEASE_IMAGE -t $CONTAINER_TEST_IMAGE . -f Dockerfile.arm
    - docker push $CONTAINER_TEST_IMAGE
 
release:
  stage: release
  script:
    - docker pull $CONTAINER_TEST_IMAGE
    - docker tag $CONTAINER_TEST_IMAGE $CONTAINER_RELEASE_IMAGE
    - docker push $CONTAINER_RELEASE_IMAGE

  ```  
既然在容器镜像仓库中我们有了我们的镜像，我们只需要将它们部署到我们的集群中。为了授予集群访问镜像仓库的权限，我们在GitLab中创建了一个deploy令牌，然后将令牌凭据作为docker-registry 密钥添加到集群中： 
 ```java 
  kubectl create secret docker-registry deploycred --docker-server=<your-registry-server> --docker-username=<token-username> --docker-password=<token-password> --docker-email=<your-email>

  ```  
之后，可以在YAML文件PodSpec中使用deploy 令牌密钥： 
 ```java 
  imagePullSecrets:
      - name: deploycred
     containers:
      - name: myapp
        image: gitlab.mycompany.com:4567/my/project/my-app-arm:latest

  ```  
完成所有这些步骤之后，我们终于拥有了一个从私有镜像仓库中的源代码到ARM容器镜像的自动CI / CD流水线，可以将其部署到集群中。 
### 结 语 
总而言之，事实证明，建立和运行自己的裸机Kubernetes集群比预期的要容易。而且k3s确实是在边缘计算场景中和一般配置较低的硬件上运行容器化服务的明智选择。 
一个小缺点是k3s尚不支持高可用（多主设备配置）。尽管单个主服务器设置已经具有相当的弹性，因为即使主服务器离线，服务仍可在代理节点上继续运行，我们还是希望为主节点提供一些冗余。显然，此功能正在开发中，但在此功能可用之前，我们建议从服务器节点配置中进行备份。
                                        