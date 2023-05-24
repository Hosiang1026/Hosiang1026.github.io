---
title: 推荐系列-理论+实操，带你了解多沙箱容器运行时Kuasar
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 20
cover_picture: 'https://api.ixiaowai.cn/gqapi/gqapi.php'
abbrlink: 78068ea
date: 2023-05-24 09:23:09
---

&emsp;&emsp;：华为云DTSE技术布道师张天阳结合沙箱容器发展历程，介绍华为云多沙箱容器运行时 Kuasar 项目优势，开启多沙箱容器运行时上手实践体验。 本文分享自华为云社区《理论+实操，带你了解多沙...
<!-- more -->

                                                                                                                                                                                         
本文分享自华为云社区《理论+实操，带你了解多沙箱容器运行时Kuasar》，作者：华为云社区精选。 
本期《多沙箱容器运行时Kuasar开发上手实践》主题直播中，华为云DTSE技术布道师张天阳结合沙��容器发展历程，介绍华为云多沙箱容器运行时 Kuasar 项目优势，为开发者演示 Kuasar 的安装运行方式，开启多沙箱容器运行时上手实践体验。 
 
#### 顺势而出的沙箱容器 
2013年，docker 横空出世，云计算进入容器时代，所谓的容器也就是运行在宿主机上的进程，通过 Namespace 和 Cgroup 技术进行隔离和限制，和主机共享内核。 
2014年，kubernetes 开源并成为主流的容器编排工具。在 kubernetes 中，Pod 是一个或多个容器的集合，容器间可以共享网络和存储，为此引入了 pause 容器来实现这一特性。 
“与宿主机系统共享内核的容器，是存在着巨大的安全隐患。”华为云DTSE技术布道师张天阳讲到。 
也正是看到这个问题，在2017年底，沙箱（Sandbox）容器技术兴起，它将容器进程限制在一个封闭的沙箱环境中，防止其对系统和其他容器造成破坏，具有极高的安全性。 
沙箱天然符合 Pod 的定义，它为一组容器提供了一个隔离的环境，在沙箱环境中运行的容器，就是沙箱容器。根据沙箱隔离的边界可分为： 
 
 轻量虚拟机沙箱（MicroVM Sandbox）：在宿主机上模拟一套完整的虚拟机，容器运行在虚拟机内，具有非常高的安全隔离效果。 
 用户态内核沙箱（Application Kernel Sandbox）：通过一个运行在用户态的内核程序，拦截并实现容器的系统调用，从而保证容器间的安全隔离性。 
 WebAssembly沙箱（Wasm Sandbox）：将容器运行在 WebAssembly 的运行时中，依赖 WebAssembly 的能力提供进进程级别的隔离。 
 
 
  
 
每种沙箱在极速弹性、安全隔离和标准通用维度有各自的优势，目前云厂商都已在生产环境布局了沙箱容器产品，每个沙箱借助 containerd Shim v2 均实现了一套管理面的程序，彼此之间不相兼容。 
 
  
 
2023年3月，containerd 在其 v1.7.0 版本中发布了 Sandbox API 特性，该特性提供了一套管理沙箱的API，它的出现使得容器和沙箱的概念解耦，“容器归容器，沙箱归沙箱”，创建 Pod 就是创建沙箱，不再需要借助 pasue 容器。 
沙箱容器已成为云原生场景下的安全的解决方案，我们希望借助 Sandbox API 的力量，实现一种支持多种沙箱技术的容器运行时。 
然而单一容器隔离技术无法满足用户云上业务对安全隔离、极速弹性、标准通用等多个维度的诉求。基于此，华为云于2023 年 4 月在荷兰阿姆斯特丹举办的 KubeCon + CloudNativeCon Europe 2023 云原生峰会上正式开源Kuasar 。新开源的多沙箱容器运行时 Kuasar 可以充分利用节点资源、降本增效，为用户提供更安全高效的沙箱场景解决方案。 
 
#### Kuasar架构技术大揭秘 
Kuasar 是一个多沙箱容器运行时，那么什么是容器运行时？简单说容器运行时是一个负责拉起容器，管理容器运行状态的运行时组件，可以分为高阶容器运行时和低阶容器运行时两类： 
 
 高阶容器运行时：负责 CRI 的实现，从高维度管理容器和镜像实例，containerd, CRI-O, docker 还有 iSulad 都是典型的高阶容器运行时。 
 低阶容器运行时：负责 OCI 实现，真正操作容器。Kata-containers 和 runC 等都是低阶容器运行时。 
 
Kuasar 属于低阶容器运行时，和高阶容器运行 containerd 交互，Kuasar 主要由两个模块组成： 
 
 Kuasar-Sandboxer：实现了 Sandbox API，负责管理沙箱生命周期和资源分配。Sandboxer 以插件的形式和 containerd 交互。 
 Kuasar-Task：实现了 Task API，负责管理容器的生命周期和资源分配。 
 
 
  
 
MicroVM Sandboxer：虚机进程提供了完整的虚拟化层和 Linux 内核， vmm-sandboxer 负责创建虚机和调用 API， vmm-task 作为虚机里的 init 进程负责拉起容器进程，容器的 IO 流则可通过虚机的 vsock 或 uds 导出。 
App Kernel Sandboxer： Quark 是一种新型的 App Kernel Sandbox，使用自己的 QVisor 作为 hypervisor 和自定义内核 QKernel。QVisor 只负责KVM虚拟机的生命周期管理，Qkernel 拦截所有的系统调用，并通知 QVisor 处理。quark-sandboxer 拉起 Qvisor 和 Qkernel，每当需要启动容器时，QVisor 中的 quark-task 将调用 Qkernel 来启动一个新的容器。同一 Pod 中的所有容器都将在同一个进程中运行。 
Wasm Sandboxer：WebAssembly 沙箱定义了一套新的指令集和虚拟机。所有程序必须编译成 Wasm 指令集才能在 Wasm 虚拟机中运行，因此对应用程序有很高的要求。wasm-sandboxer 和 wasm-task 为一个独立的进程，每当需要在沙箱中启动容器时，wasm-task 将 fork 一个新进程，启动一个新的 WasmEdge runtime，并在其中运行 Wasm 代码。 
Kuasar改变当前的Shim V2 的管理模型，带来以下收益： 
 
 sandbox 管理逻辑清晰：sandbox 管理逻辑和 container 管理逻辑完全分开，开发友好，语义清晰 
 简化 container 调用链：取消 Task API 到 Shim v2 API 的转化，直接调用，链路简化 
 高效的sandboxer进程： Sandboxer 进程常驻减掉了冷启动 Shim 进程的耗时， 1:N 管理模型大幅减少了进程数量，Rust 程序内存安全，相比 Golang 开销小 
 pause 容器消失：创建 Pod 不再创建 pause 容器，不再需要准备 pause 容器镜像快照 
 
为了更好地展现Kuasar 性能优势，张天阳选择 “端到端容器启动时间”和“管理面组件内存消耗”作为衡量 Kuasar 性能的两个指标，在保持环境变量一致的前提下和同类竞品进行对比测试。 
启动时间测试分为两组，一组统计单个 Pod 的启动时间，另一组统计并行启动50个 Pod 的时间： 
Kuasar 100% 的启动速度提升主要得益于两方面，一方面是 Sandbox API 的实现，使得创建容器不再单独创建 pause 容器，节省了准备pause容器镜像快照的时间；另一方面得益于1:N 的管理模型，Sandboxer 进程常驻，从而节省了冷启动 Shim 进程的时间，这使得容器的启动速度大大提升。 
内存消耗测试共分三轮，每轮分别启动了1、5、10、20、30和50个Pod，查询Sandboxer 进程和所有 Shim 进程的 PSS 数值。 
Kuasar 节省近99%的内存，原因也可分为两点：主要是 1:N 的管理模型使得 N 个进程减少为1个进程，带来的内存收益与 Pod 数成正比；其次，Kuasar 采用了 Rust 编程语言，相比于 Kata Shim 进程使用的 Golang 语言，语言本身也会带来一些内存收益。 
 
#### 五分钟教你操作Kuasar 
了解了Kuasar相关技能和特性，相信大家对产品有了一个大致的了解。接下来，就花几分钟带大家从安装上手，实际操作了解和认识Kuasar。 
为了让大家更好地体验，在Kuasar安装配置操作上，为大家准备了一指禅，如下： 
 
 方式一：Ubuntu 22.04 操作系统，可按照 Github Release 发布说明直接下载安装: https://github.com/kuasar-io/kuasar/releases/tag/v0.0.1-alpha1 
 方式二：如果是源码编译，需要按照 README 里的说明进行：https://github.com/kuasar-io/kuasar#quick-start 
 
温馨小提醒，在安装配置前需要大家预准备一下内容： 
 
  
 
面向未来，作为一个开放和可扩展的 多沙箱容器运行时，Kuasar 将发挥沙箱接口的优势，拥抱业界最新的 DRA(Dynamic Resource Allocation)、CDI(Container Device Interface) 等管理接口，为云原生场景带来更安全、高效、便捷的容器解决方案，为云原生应用提供更安全的保障。 
  
点击关注，第一时间了解华为云新鲜技术~
                                        