---
title: 推荐系列-Zadig v1.11.0 发布-不止于环境，与开发者一起交付全球业务
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 228
date: 2022-05-11 05:14:30
cover_picture: 'https://oscimg.oschina.net/oscnet/up-fb41042ce55eb99d474e90c202205b154fc.png'
---

&emsp;&emsp;dig on Github https://github.com/koderover/zadig Zadig on Gitee https://gitee.com/koderover/zadig Zadig 正式推出新版 v1.11.0，以开发者体验为重要使命，重磅推出“自测模式”又一亮...
<!-- more -->

                                                                                                                                                                                         
Zadig on Github https://github.com/koderover/zadig 
Zadig on Gitee https://gitee.com/koderover/zadig 
Zadig 正式推出新版 v1.11.0，以开发者体验为重要使命，重磅推出“自测模式”又一亮点功能，数百工程师上千微服务可以基于一套环境实现高效协作；面向企业级场景，支持更为复杂的环境配置管理、支持融合、跨云跨地域按需交付，满足全球化业务的产品交付；面向生态伙伴，更广泛友好支持 Jenkins、Gerrit、Gitee 代码源、微软云/阿里云 ACR 等丰富的场景化需求。Enjoy ～ 
 
### 云原生技术实现环境共享能力，开发者联调不用愁 
Zadig “自测模式” 是继 Zadig 环境复制、环境托管能力后重磅推出的又一亮点功能，基于 Istio + Tracing 技术方案实现上百开发者一套环境下的高效协作，可以在低成本、低操作复杂度的情况下，为开发者提供自测联调子环境。 
管理员：开启自测模式 
选择环境，并开启自测模式 
 
  
工程师：日常自测联调 
在 dev 基准环境中通过点击创建子环境，按需选择服务即可创建包含部分服务的子环境 dev-test-env1 
 
 
  
当需要请求服务 a 时，在请求的 Header 头中加入 x-env:dev-test-env1 即可将请求流量转发到子环境 dev-test-env1 中，子环境中的服务 a 会接收到请求并给出响应，对于请求链路上的 b/c 服务，dev 环境中的服务会给出正常响应，实现子环境和 dev 环境的自测联调。效果如下所示： 
 
 
### 环境支持配置管理，运行时��理稳定、安全可靠 
相比以往的本地手工操作环境配置，运维的复杂度和管理风险都很高，Zadig 支持了基于环境级别配置和管理 Ingress/ConfigMap/Secret/PVC 资源，保障更加安全可靠的运行时环境。 
 
 
  
 
### 支持融合架构交付，跨云跨地域全球丝滑交付 
基于不同云厂商、自建 K8s 集群，端云混合，一套业务按需选择部分服务、自动部署到全球不同区域业务。 
 
  
 
### 更广泛友好的生态支持，接入场景更多源、开放灵活 
代码源支持 Gitee ，更广泛支持中国本土工程师 
 
Helm Chart 模板库支持 Gerrit 作为代码源进行导入 
创建 Helm Chart 模板时，选择 Gerrit 代码源并选择 Chart 目录即可成功导入 
 
  
服务导入支持微软云、阿里云 ACR 仓库 Chart 源 
在 HELM 仓库中集成阿里云 ACR 仓库后，便可在创建服务时使用 
 
  
Jenkins 接入更灵活，方便工程师使用构建变量 
使用内置变量一步到位配置镜像构建产物，避免每次执行工作流时都需要手动输入 
 
  
 
### 新增功能详情列表 
项目： 
 
  支持 Helm 版本管理 retag image   
  支持 Helm Chart 模板库导入 Gerrit 代码源  
  支持 Helm Chart 从微软云、阿里云 ACR 仓库导入  
  支持自定义 Helm Release 名称  
  支持 Pod Debug 权限独立管理  
 
环境： 
 
  K8s YAML 项���环���支持开启自测模式  
  K8s YAML 项目创建环境支持选择部分服务  
  K8s Helm Chart 项目创建环境支持选择部分服务  
  环境配置支持 Ingress/ConfigMap/Secret/PVC 资源类型  
  服务部署支持镜像名和服务 container 名称不一致  
  主机环境支持登录调试  
 
工作流： 
 
  工作流支持分发部署步骤  
  Jenkins 构建执行参数支持 IMAGE 变量规则 & Choice 参数类型  
  构建支持将指定文件上传至 S3 对象存储  
 
系统设置： 
 
  代码源支持 Gitee 集成  
  敏感信息做加密处理  
  支持镜像仓库配置自签证书  
  镜像缓存支持定时清理  
  基础设施兼容 Kubernetes 1.22 版本  
  PVC 缓存支持自定义缓存目录  
  主机管理增加主机状态展示  
 
功能优化： 
 
  工作流任务执行支持不配置“分发”步骤也可选择 TAG  
  同一 Helm Chart 中的多服务组件更新只需一次部署  
  工作流扩展步骤请求参数增强  
  主机项目构建脚本支持主机信息、环境信息等相关环境变量  
  K8s YAML 项目更新环境变量支持变量搜索  
  镜像名称支持使用 Commit ID 前八位生成规则  
 
缺陷修复： 
 
  修复配置多个同地址 GitLab，Webhook 触发服务更新失效的问题  
  修复构建超时后，构建 Job 未及时清理的问题  
  修复工作流定时器快捷开关无效的问题  
  修复有 Ingress 资源时环境加载慢的问题  
  修复主机项目中新创建的服务不能同步更新到环境的问题  
  修复协作模式相关问题  
 
  
 
### Release Note 
Project: 
 
  Enable image retag while creating version for helm project.   
  Service can now be imported from Microsoft Azure container registry and Aliyun ACR.  
  Helm chart templates can now be imported from Gerrit.  
  Helm release name can be customized for each service.  
  Pod debug authorization can be configured separately.  
 
Environment: 
 
  Services in projects can be deployed partially to an environment except for VM services  
  Ingress/ConfigMap/Secret/PVC can be deployed to an environment separately.  
  Container name and image name can be different now for service.  
  VMs login tests have been supported.  
 
Workflows: 
 
  Support deploy image to a selected environment after the distribution of that image.  
  Jenkins workflows now support IMAGE as a variable & choice type parameter  
  Files can be uploaded to object storage in workflow.  
 
System: 
 
  Support Gitee as a codehost.  
  Sensitive information has been masked in the API.  
  Docker registry can now use self-signed certificate.  
  Kubernetes V1.22 has been supported.  
  Define custom path for PVC type workflow cache.  
 
Improvement: 
 
  Tags can be selected in workflow even if there is no distribution stage.  
  Update of multiple service modules will only trigger one helm release.  
  Image tag rules can now be generated from short commit ID.  
  Added several environment variables for VM script.  
  Enhanced variables for external system modules in workflow.   
  Enable search for environment variables in kubernetes environments.  
 
Bugfix: 
 
  Fixed a bug where multiple codehost with same host will cause webhook trigger to function abnormally.  
  Build job will now be deleted correctly.  
  Fixed timer switch in workflow.  
  Improve loading speed of environment when there are ingresses in the cluster.  
  New services in VM project can now be updated to environment correctly.  
  Fixed collaboration mode bugs.  
 
特别感谢以下社区小伙伴，提出的宝贵建议： 
@Charles @张旭东 @Neural @moka @一个有内涵的渣渣灰 @浮世万千 @努力努力再努力@moka @ᯤ⁵ᴳ @Mr.Du @LGJ @朱亚光 @120386135/GitHub  @slcnx/GitHub @(｡･ω･｡) @王老吉 @Happy 小二 @ekb-西红熊 @charliewang @Mi manchi @Quinton @gaopeng/Slack 
  
Zadig，让工程师更专注创造！欢迎加入开源吐槽群🔥 
Zadig on Github https://github.com/koderover/zadig 
Zadig on Gitee https://gitee.com/koderover/zadig
                                        