---
title: 推荐系列-前端 Docker 镜像体积优化
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 1728
cover_picture: 'https://static.oschina.net/uploads/img/202003/05105934_mxTJ.jpeg'
abbrlink: 8eb96f49
date: 2021-04-15 09:19:21
---

&emsp;&emsp;如果 2019 年技术圈有十大流行词，容器化肯定占有一席之地，随着 Docker 的风靡，前端领域应用到 Docker 的场景也越来越多，本文主要来讲述下开源的分布式图数据库 Nebula Graph 是如何将 Do...
<!-- more -->

                                                                                                                                                                                        ![Test](https://oscimg.oschina.net/oscnet/up-220236c32299c0d3718994fd689dc97baf1.png  '前端 Docker 镜像体积优化') 
如果 2019 年技术圈有十大流行词，容器化肯定占有一席之地，随着 Docker 的风靡，前端领域应用到 Docker 的场景也越来越多，本文主要来讲述下开源的分布式图数据库 Nebula Graph 是如何将 Docker 应用到可视化界面中，并将 1.3G 的 Docker 镜像优化到 0.3G 的实践经验。 
#### 为什么要用 Docker 
对于前端日常开发而言，有时也会用到 Docker，结合到 Nebula Graph Studio （分布式图数据库 Nebula Graph 的图形界面工具）使用 Docker 主要基于以下考虑: 
 
 统一运行环境：我们的工具背后有好几个服务组合在一起，诸如不同技术栈的现有服务，纯前端的静态资源。 
 用户使用成本低：目前云服务还在开发中，想让用户对服务组合无感，能直接在本地一键启动应用并使用。 
 快速部署：团队本就提供有 Nebula镜像版本 实践，给了我们前端一些参考和借鉴。 
 
#### Docker 镜像的构建 
既然要使用 Docker 来承载我们的应用，就得将项目进行镜像构建。与所有 build 镜像类似，需要配置一份命名为Dockerfile 的文件，文件是一些步骤的描述，简单来说就是把项目复制到镜像里，并设置好启动方式： 
 ```java 
  # 选择基础镜像
FROM node:10
# 设置工作目录
WORKDIR /nebula-web-console
# 把当前项目内容拷贝到镜像中的 /nebula-web-console 目录下
ADD . /nebula-web-console
# 在镜像中下载前端依赖
RUN npm install
# 执行构建
RUN npm run build
EXPOSE 7001
# 镜像启动时执行的部署命令
CMD ["npm", "run", "docker-start"]

  ```  
#### Docker 镜像体积优化 
如果按照上述的配置文件来构建 Docker 镜像，以我们的项目为例，将会生成一个体积约为 1.3GB 的镜像，这个看起来有点吓人，因为即使在网速快的用户电脑光下载镜像也需要等待不少时间，这是不能接受的。 
在调研了相应的资料后，了解到可以从以下几个方面缩小 Docker 镜像体积进行优化： 
##### 基础镜像源的选择 
所谓基础镜像源，就是我们在进行构建步骤时，选择的一个基础环境（如上  ```java 
  node:10
  ```  )，通过查看 Dockerhub 上有关 Node.js 的基础环境镜像时，我们会发现有多个版本，虽然都是 Node.js 相关基础镜像，但不同版本，他们除了 Node.js 版本不同外，在内部集成的环境也不一样，例如带有 alpine 的版本，相当于是一个比较精巧的 Linux 系统镜像，在此版本运行的容器中会发现不存在我们常规系统中所附带的工具，比如 bash、curl 等，由此来缩小体积。 
根据项目实际需要，当我把基础镜像换为 alpine 版本后，再次进行构建，此时镜像体积已大幅度减小，从 1.3GB 直降为 500+MB，体积优化效果明显，所以当你发现自己构建的镜像体积过大时，可以考虑从更换基础镜像源的方式来着手，看看是否使用了过于臃肿的镜像源。 
##### Multi-stage 构建镜像 
所谓 multi-stage 即是 Docker 镜像构建的时候采取的策略，详细可点击链接提供的资料。 
###### Docker 构建规则 
简言之就是利用 Docker 构建提供的规则：Dockerfile 的操作都会增加一个所谓镜像的“层”，每一层都会增加镜像体积，通过采用多步骤策略，每一步骤包含具有相同意义的一系列操作（例如构建，部署），步骤与步骤之间通过产物镜像引用的方式，由此来缩减最终构建镜像所需要的层数，具体操作比如： 
 ```java 
  # 设置第一步骤产生的镜像，并命名为builder
FROM node:10-alpine as builder
WORKDIR /nebula-web-console
# 复制当前项目内容至镜像中
ADD . /nebula-web-console
# 进行相应的构建
RUN npm install
RUN npm run build
....

# 进行第二步骤构建
FROM node:10-alpine
WORKDIR /nebula-web-console
# 复制第一步构建镜像的产物内容至当前镜像，只用到了一层镜像层从而节约了之前构建步骤的镜像层数
COPY --from=builder . /nebula-web-console
CMD ["npm", "run", "docker-start"]


  ```  
##### .dockerignore 
类似我们熟悉的  ```java 
  .gitignore
  ```  ，就是当我们在进行  ```java 
  COPY
  ```  或  ```java 
  ADD
  ```  文件复制操作时，将不必要的文件忽略掉（诸如文档文件、git文件、node_modules以及一些非生成必要文件等），从而减小镜像体积，更详细内容可参考文档连接：.dockerignore。 
##### 操作合并 
基于上述提到在 Dockerfile 构建镜像的过程做，每一个操作都会在前一步镜像基础上增加一“层”，可以利用  ```java 
  &
  ```  来合并多个操作，减少层数，比如： 
 ```java 
  # 以下两个操作分别代表两层
RUN npm install
RUN npm run build

  ```  
改为： 
 ```java 
  # 使用 & 后变了为一层
RUN npm install && npm run build

  ```  
由此我们减少了层数的增加，即减少了镜像的体积。同时，在构建镜像的过程中，我们也可以通过在达到相同目的的前提下，尽量减少不必要的操作来减少“层数”的添加。 
##### 前端常规性体积优化 
 
 压缩丑化代码，移除源码      此操作可以放在构建步骤阶段，这样会进一步缩小镜像的文件体积。 
 node_modules 只下载生产环境需要的代码      此操作可以放在部署阶段，只下载生产环境所需要的第���方依赖代码:  ```java 
  npm install --production
  ```  。 
 公共资源放在CDN      如果镜像被期待运行在联网环境，可以考虑将一些体积相比较大的公共文件（图片、第三方库等）放在CDN服务 器上，将部分资源剥离出去，也会进一步缩小体积。 
 ... 
 
以上只作为一个线索参考，更多前端常规的优化步骤，都可以迁移至镜像中进行，毕竟和我们本地开发一样，镜像构建也是一个运行代码的环境嘛。 
#### 小结 
以上便是我在此次使用 Docker 镜像来运行我们 Nebula Studio 所用到的一些优化镜像体积的方法，希望能给需要的人一些帮助和参考，可能还有一些认识不准确的地方，欢迎指出，同样欢迎你来试用 Nebula Graph Studio：https://github.com/vesoft-inc/nebula-web-docker  
![Test](https://oscimg.oschina.net/oscnet/up-220236c32299c0d3718994fd689dc97baf1.png  '前端 Docker 镜像体积优化')
                                        