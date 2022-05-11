---
title: 推荐系列-使用 JetBrains Gateway 和 Gitpod 进行远程开发
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 157
date: 2022-05-11 05:12:46
cover_picture: 'https://oscimg.oschina.net/oscnet/e68bb645-d634-4847-be9f-e29a98f09673.png'
---

&emsp;&emsp;十分高兴地与 Gitpod 的朋友共同宣布，Gitpod 已与我们的远程开发解决方案 JetBrains Gateway 集成。 这意味着您将可以从最喜欢的 JetBrains IDE 中访问托管在临时开发环境中的源代码，根...
<!-- more -->

                                                                                                                                                                                         
 我们十分高兴地与 Gitpod 的朋友共同宣布，Gitpod 已与我们的远程开发解决方案 JetBrains Gateway 集成。  
 这意味着您将可以从最喜欢的 JetBrains IDE 中访问托管在临时开发环境中的源代码，根据需要随时在云端运行。 所有语言处理都将在您的 Gitpod 环境中进行，而您可以在本地使用功能丰富的瘦客户端工作以获得熟悉的 JetBrains IDE 体验。 
  
 使用 JetBrains Gateway 
 进行远程开发 
 JetBrains Gateway 是我们在 2021 年 11 月宣布推出的远程开发解决方案��它是一款独立应用，可通过 SSH 连接到远程服务器，下载并安装 IDE 作为后端服务，并打开托管在远程机器上的项目。 
 Gateway 随后将启动 JetBrains Client，这是一款能够连接到 IDE 后端服务并以本地运行方式呈现您的项目的瘦客户端。 它基于 IntelliJ 平台，为您提供了非常丰富、熟悉且可定制的界面，但所有编译、索引和语言处理都在强大的云机器上完成。 
 Gateway 会负责连接到远程机器并确保 IDE 后端已安装并运行，但它不负责管理远程服务器。 可以通过多种方式运行远程服务器：连接到物理机器、在内部网络中托管虚拟机、在云端运行 Docker 镜像等。Gateway 没办法处理所有这些过程。 相反，服务器管理方面的问题需要单独考虑。 事实上，作为集成团队环境 Space 的一部分，我们拥有自己的编排平台，它可以为您管理开发环境、安装 IDE 和“预热”环境 – 下载所有依赖项、构建项目，甚至在保存快照之前确保所有索引均已完成。 
 Gitpod 与 Gateway 集成 
  
 今天，我们宣布与 Gitpod 合作，将 Gateway 带到您的临时开发环境中。Gitpod 是一款用于自动化开发环境的知名开源编排和预配平台。 
  
 Gitpod 为 Gateway 打造了一个插件，让您可以轻松连接到基于托管在 GitHub、GitLab 或 Bitbucket 中的仓库的开发环境。 从 Gateway 欢迎屏幕中安装插件，连接您的 Gitpod 帐户后，即可借助 Gitpod 集成浏览并连接到您的现有工作区。 您可以从仓库创建新的工作区以及选择要安装哪种 JetBrains IDE – 目前支持 IntelliJ IDEA、GoLand、PyCharm 和 PhpStorm，即将支持更多 IDE。 然后，Gitpod 将配置远程服务器，并将事务递交给 Gateway 以启动 IDE 后端并连接 Client。 就是这样！ 现在，您已准备就绪，可以使用在云端或本地部署环境中运行的最喜欢的 JetBrains IDE 了。 
  
 这可以为您带来很多好处。 例如，您无论是在办公室使用台式计算机还是在家中使用性能不足的笔记本电脑工作，都可以借助强大的云机器来处理您的项目。 源代码始终位于远程机器上，因此安全十足，您无需担心遗失自己的笔记本电脑！ 借助 Gitpod 集成，您可以创建会随每次提交保持更新的临时开发环境，从而随时快速开始工作。 
 当然，不要忘记访问 Gitpod 偏好设置，将您最喜欢的 JetBrains IDE 设置为打开工作区时的默认桌面编辑器！ 
  
 我们要祝贺 Gitpod 构建了如此出色的集成，期待在未来与他们合作推出新的功能。您也可以访问 Gitpod 并了解更多信息。 
  
   Gitpod: https://www.gitpod.io/blog/gitpod-jetbrains  
  
 本博文英文原作者：Matt Ellis 
  
 ⏬ 戳「阅读原文」查看博客原文 
 
本文分享自微信公众号 - JetBrains（JetBrainsChina）。 如有侵权，请联系 support@oschina.cn 删除。 本文参与“OSC源创计划”，欢迎正在阅读的你也加入，一起分享。
                                        