---
title: 推荐系列-云原生爱好者周刊-M1 芯片 Mac 可以成功运行 Linux
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 286
cover_picture: 'https://oscimg.oschina.net/oscnet/up-8df5ddd1b1364abddecc9c565eee7eb5499.png'
abbrlink: dea679e8
date: 2021-06-01 11:53:55
---

&emsp;&emsp;月 19 日，也就是前两天，Asahi Linux 官方推特宣布：首个原生支持 M1 系列芯片的 Linux 测试版现已发布，所有人皆可使用！ Asahi Linux 起初只是一个众筹项目，计划为 Apple Silicon Mac ...
<!-- more -->

                                                                                                                    
Asahi Linux 起初只是一个众筹项目，计划为 Apple Silicon Mac 设备移植 Linux 系统，后来才被命名为 Asahi Linux，开始加速开发。虽然现在还很粗糙，很多功能无法正常工作（例如 GPU 加速、视频编解码器加速、网络摄像头等等），但它的终极目标是可以部署在 M1 芯片 Mac 上作为日常操作系统使用，加油，这是 Asahi Linux 的一小步，却是 Linux 的一大步。 
 
#### 开源项目推荐 
##### KubePlus 
KubePlus 是一个 Kubernetes Operator，可以将任何容器化的应用程序转化为 SaaS，它通过自动化多租户管理和 day2 操作（如监控、故障排除和应用升级）将其作为服务交付。 
 
##### Drift 
Drift 是一款 GitHub Gist 的开源替代品，可自行部署，摆脱 Gist 的龟速。这里有一个 Demo：https://drift.maxleiter.com/post/57512966-e9b9-44a4-808d-bb00841bed46 
 
##### SQLite Viewer Web App 
一个可以在浏览器里使用的 SQLite 数据库浏览工具，使用了浏览器的原生文件系统 API 来打开 .sqlite 文件，也可以作为 PWA 安装。 
 
##### Fig 
Fig 可以在终端添加 IDE 风格的智能提示，目前仅在 Mac OS 下可用，集成了 Docker、Kubernetes 等常见的 CLI。 
 
 
##### Skill Icons 
这个项目提供了各种编程语言和工具的图标，你��以利用它在 GitHub 上展示你的技能图谱。 
 
#### 文章推荐 
##### 如何利用 Kasten 10 为云原生应用保驾护航 
在云原生大规模落地阶段，更多企业级应用需要更坚实的云原生底座，用以实现更好的数据安全和工作负载保护。本文将以开源容器平台 KubeSphere 为底座，联合 Kasten K10 by Veeam 构建云原生应用保护方案，最终实现云原生应用的快速备份与恢复、数据长期保留等特性，并在文中为您展示相关的部署、配置全过程。 
##### KubeSphere DevOps 系统功能实战 
KubeSphere DevOps 系统是专为 Kubernetes 中的 CI/CD 工作流设计的，它提供了一站式的解决方案，帮助开发和运维团队用非常简单的方式构建、测试和发布应用到 Kubernetes。它还具有插件管理、Binary-to-Image (B2I)、Source-to-Image (S2I)、代码依赖缓存、代码质量分析、流水线日志等功能。 
 
##### 大规模 Kubernetes 集群需要 GitOps 
本文描述了企业在大规模部署 Kubernetes 集群时所面临的问题和挑战。介绍了 GitOps 流程和工具如何让企业能够正确控制这些高度分布式的环境，此外还能够改进安全性和合规性最佳实践。 
#### 云原生动态 
##### OpenFunction 0.6.0 发布 
今天，OpenFunction 发布了最新版本 v0.6.0。在该版本中，核心 v1alpha1 API 已被弃用并移除。 
主要变化如下： 
 
 重构 Async（原名：OpenFuncAsync）运行时定义，并将核心 API 升级到 v1beta1。 
 通过让 Knative 运行时使用 Dapr，为异步函数添加 HTTP 触发器。 
 添加一个统一的 scaleOptions 来控制 Knative 和 Async 运行时的缩放。 
 添加函数插件支持（支持使用全局配置及针对每个函数进行配置）。 
 为同步和异步函数添加 SkyWalking 追踪支持。 
 
##### 开发者门户项目 Backstage 成为 CNCF 孵化项目 
CNCF 技术监督委员会(TOC) 已投票接受 Backstage 作为 CNCF 孵化项目。 
Backstage 是一个开放平台，用于构建由全球社区维护的开发者门户网站。它将组织的工具、服务、应用程序、数据和文档统一到一个单一的、一致的 UI 中，使开发人员能够轻松地创建、管理和探索软件。 
Backstage 于 2016 年在 Spotify 成立，当时公司发展迅速，新工程师入职成为一项挑战。该项目成为 Spotify 的关键任务工具，用于控制软件混乱并让工程师更快、更高效地工作。Spotify 于 2020 年 3 月开源 Backstage，与更广泛的社区分享其经验。 
##### NSA & CISA 发布了新版本的 Kubernetes 强化指南 – 1.1 版 
2022 年 3 月，NSA & CISA 发布了新版本的 Kubernetes 强化指南 – 1.1 版。它更新了 2021 年 8 月发布 的先前版本。Kubernetes 发展迅速，Kubernetes 的采用率增长得更快。Kubernetes 已经成为一个非常受欢迎的目标，因此需要不断加强保护措施。 
该文件的新版本表明，其作者非常关注 Kubernetes 和云安全，并试图帮助行业为攻击方法的演变以及 Kubernetes 和云平台提供的新功能所驱动的下一波威胁做好准备。 
新版本 Kubernetes 强化指南中提到的几个最重要的点： 
 
 Kubernetes 基础设施加固 
 用户认证 
 弃用 PSP 
 准入控制器 
 POD 服务帐户令牌保护 
 应用容器加固 
 审计和日志记录 
 
##### Flagger 发布 1.19.0 版本带来 Gateway API 支持 
日前，Flagger 发布 1.19.0 版本，在该版本中，新增了对 Kubernetes Gateway API 的支持。 
Flagger 是一个渐进的交付工具，它为运行在 Kubernetes 上的应用程序自动化了发布过程。它通过在测量指标和运行一致性测试的同时，逐渐将流量转移到新版本，降低了在生产中引入新软件版本的风险。 
Flagger[2]旨在让开发人员使用交付技术，如： 
 
 金丝雀（canary）发布（渐进式流量转移） 
 A/B 测试（HTTP 头和 cookies 流量路由） 
 蓝/绿（流量交换和镜像） 
 
##### cr8escape：CrowdStrike 发现的 CRI-O 容器引擎中的新漏洞 (CVE-2022-0811) 
CrowdStrike 的云威胁研究团队在 CRI-O（支持 Kubernetes 的容器运行时引擎）中发现了一个新漏洞 ( CVE-2022-0811 )。被称为“cr8escape”的攻击者在被调用时可以逃离 Kubernetes 容器并获得对主机的 root 访问权限，并能够在集群中的任何位置移动。调用 CVE-2022-0811 可以让攻击者对目标执行各种操作，包括执行恶意软件、数据泄露和跨 pod 横向移动。 
CrowdStrike 向 Kubernetes 披露了该漏洞，Kubernetes 与 CRI-O 合作发布了补丁。 

                                        