---
title: 推荐系列-百度 Serverless 函数计算引擎 EasyFaaS 正式开源
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 723
cover_picture: 'https://oscimg.oschina.net/oscnet/up-089044190ad5c3eea057edc9175b94d908a.png'
abbrlink: 72de3e5
date: 2021-04-15 09:53:06
---

&emsp;&emsp;"2021年4月，百度函数计算引擎 EasyFaaS，���式开源!" 1. 什么是 EasyFaaS？ EasyFaaS 是一个依赖轻、适配性强、资源占用少、无状态且高性能的函数计算服务引擎。它有以下几个特点： 依赖轻：...
<!-- more -->

                                                                                                                                                                                        ![Test](https://oscimg.oschina.net/oscnet/up-089044190ad5c3eea057edc9175b94d908a.png  '百度 Serverless 函数计算引擎 EasyFaaS 正式开源') 
"2021年4月，百度函数计算引擎 EasyFaaS，正式开源!" 
  
 
### 1. 什么是 EasyFaaS？ 
 
####   
EasyFaaS 是一个依赖轻、适配性强、资源占用少、无状态且高性能的函数计算服务引擎。它有以下几个特点： 
  
 
  依赖轻：EasyFaaS只依赖Linux内核，不强制依赖Docker、Kubernetes等外部服务  
  适配性强：EasyFaaS可以运行在多种系统环境，包括Docker、Kubernetes及裸机等  
  资源占用少：���块��，服务系统模块占用更小  
  无状态：每个EasyFaaS Pod本身无状态且内部自治  
  高性能：调度链路更短，更小的系统开销和更优的性能  
 
  
适用于以下场景： 
私有化部署、边缘计算、物��网、CICD、数据和事件处理、多媒体处理、响应式对话、定时任务等场景。 
  
 
### 2. EasyFaaS 能做什么？ 
 
###   
随着 Serverless 相关技术的发布，企业和开发者纷纷探索通过无服务器架构，在适合的场景取代传统的后端服务架构，进一步为企业降本增效。 
  
百度云原生 Serverless 计算团队通过在边缘计算场景、技能场景、小程序等一站式开发场景的探索，提炼出可供开发者快速搭建平台的函数引擎 EasyFaaS，支持业内爱好者共同建设。 
  
EasyFaaS 的核心价值在于帮助开发者迅速搭建一套轻量级的函数计算平台，其核心功能在于： 
 
  提供基于事件机制，按需弹性伸缩的计算能力  
  支持多种语言运行时，开发者只需使用适合的语言编写自定义函数，无需管理底层基础设施  
  负责用户容器的全生命周期管理  
  支持用户配置函数的容器资源容量，提供动态的容器容量调度  
  支持同步和异步两种调用模式，支持多种可扩展的事件触发器  
  支持可自定义的函数管理服务  
  支持自定义语言运行时  
  支持多种运行平台，包括Docker、Kubernetes及裸机等  
 
  
 
### 3. EasyFaaS 技术架构 
  
![Test](https://oscimg.oschina.net/oscnet/up-089044190ad5c3eea057edc9175b94d908a.png  '百度 Serverless 函数计算引擎 EasyFaaS 正式开源') 
  
EasyFaaS 以单 Pod为最小服务单位，每个Pod中包含3个容器，分别为 controller、funclet 和 runner-runtime。分别介绍如下： 
  
1）controller 负责流量调度及容器池状态管理： 
 
  实现容器调度功能；  
  支持配置函数级别的并发；  
  支持容器状态管理、按策略调度容器状态；  
  支持健康检查，可以根据runtime的状态决定colddown/reborn。  
 
  
2）funclet 负责管理用户工作容器，包括基础容器资源及函数运行资源： 
 
  容器管理：实现容器的init/warmup/reset流程；  
  网络管理：实现容器网络相关功能，合理管理网络资源；  
  挂载管理：实现用户容器的动态挂载，并定期回收用户容器的挂载目录；  
  进程管理：需妥善管理用户容器产生的子进程，处理异常退出的子进程；  
  资源容量管理：实现用户工作容器的内存资源动态调整。  
 
  
3）runner-runtime仅为init容器，准备必要的资源后即退出。其中： 
 
  runner负责管理用户函数运行时；  
  runtime支持各开发语言运行时；  
 
目前该组件仅提供容器镜像。 
 
####   
 
### 4. 使用指南 
  
EasyFaaS 基于 Linux4.0 以上的内核、提前建议安装 docker 容器再继续进行。 
  
EasyFaaS 提供三种方式进行体验： 
方式 1：使用 all-in-one 方式运行 
方式2：使用 docker-compose 运行（推荐有 docker-compose 经验的开发者采用） 
方式3：编译打包部署（推荐开发者采用此种方式体验） 
 
####   
 
### 5. 未来规划 
 
####   
EasyFaaS 目前主要针对函数服务的核心能力，完成了对于提供轻量级函数计算平台常用的功能要素。 
  
后续将会进一步聚焦在核心引擎能力的完善和性能的提升上，如对于加载性能、安全容器隔、日志处理等。接下下来我们还会更多的关注以 EasyFaaS 为引擎的周边服务模块的建设和开源，逐步完善产品级能力，为 Serverless 生态建设做出更大的贡献。 
  
 
### 6. 贡献和反馈 
 
####   
项目开源地址 
【Github地址】： 
https://github.com/baidu/EasyFaaS 
【Gitee地址】： 
https://gitee.com/baidu/EasyFaaS 
如果您有任何意见或问题都可以提issue到Github或Gitee，我们将及时为您解答。 
  
如在使用中遇到问题，快速沟通，可微���扫描二维码，加入EasyFaaS技术交流群，添加下列管理员微信，并备注“EasyFaaS”，管理员邀您入群： 
  
![Test](https://oscimg.oschina.net/oscnet/up-089044190ad5c3eea057edc9175b94d908a.png  '百度 Serverless 函数计算引擎 EasyFaaS 正式开源') 
了解更多微服务、云原生技术的相关信息，请关注我们的微信公众号【云原生计算】！ 
![Test](https://oscimg.oschina.net/oscnet/up-089044190ad5c3eea057edc9175b94d908a.png  '百度 Serverless 函数计算引擎 EasyFaaS 正式开源') 
  
  
 
                                        