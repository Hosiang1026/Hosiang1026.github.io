---
title: 推荐系列-MeterSphere在开源压测工具JMeter上的分布式优化和实践
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 88
cover_picture: 'https://oscimg.oschina.net/oscnet/up-dda779ea1b0f1834df937580760432ab365.png'
abbrlink: 6e7bd40e
date: 2022-03-27 11:53:15
---

&emsp;&emsp;ache JMeter是一款100%纯Java的开源软件，旨在加载测试功能行为和测量性能。它可以用来测试静态和动态资源的性能，例如静态文件、Java Servlet、CGI Scripts、Java Object、数据库和FTP服务...
<!-- more -->

                                                                                                                    
            程序员健身是为了保养还是保命？参与话题讨论赢好礼 >>>
            
                                                                                                    Apache JMeter是一款100%纯Java的开源软件，旨在加载测试功能行为和测量性能。它可以用来测试静态和动态资源的性能，例如静态文件、Java Servlet、CGI Scripts、Java Object、数据库和FTP服务器等。JMeter可以用于模拟大量负载来测试一台服务器、网络或者对象的健壮性或者分析不同负载下的整体性能。相比于其他的性能测试软件，JMeter具备以下优势： 
■ 开源：JMeter是一款开源的免费软件，支持多种协议的接口和性能测试； 
■ 轻量级：JMeter的软件包小巧轻量，只需要在JDK环境下就可以运行，无需其他额外的部署安装（单机版）； 
■ 功能强大：JMeter设计之初只是一个简单的Web性能测试工具，但经过不断地更新扩展，现在可以完成数据库、FTP、LDAP、WebService等方面的测试。基于JMeter自身的开源性，用户可以根据自己的需求扩展其功能。 
 
#### JMeter分布式性能压测方案的局限性 
近几年，随着互联网+、在线电商等在线化业务的发展，性能测试也逐渐成为企业高频测试的类型之一。JMeter作为运用最为广泛的开源性能压测工具，已经被很多企业运用至实际的环境中。 
但是JMeter的单机版本在一般的压力机配置下，因为受限于JMeter其本身的机制和硬件配置，最多可以支持几百至一千左右的模拟请求线程。规模再次扩充后，容易造成卡顿、无响应等情况。有时候，企业为了尽量模拟业务场景，需要模拟大量的并发请求，这时JMeter单台压力机就显得有心无力。 
针对这个情况，JMeter的解决方案是支持分布式性能压测，即将大量的模拟并发分配给多台压力机，来满足这种大流量的并发请求场景。JMeter原生的分布式性能压测方案原理如下： 
 
1. 在分布式测试中，选择一台机器作为主控机（Controller），其他的机器作为测试执行的从机（Agent）； 
2. 执行测试时，由Controller通过命令行将测试脚本发给Agent，然后由Agent执行测试，同时将测试结果发送给Controller； 
3. 测试完成后，可以在Controller上的监听器中看到Agent发来的测试结果，结果为多个Agent的测试结果汇总而成。 
不过，JMeter原生的主从方案虽能够支持大并发的压测需求，但是其方案也存在一定的局限性，具体表现在以下几个方面： 
1. JMeter主从方案部署繁琐。除了为了确保Controller和Agent机器在同一个子网内，还需要保证JMeter版本、Java版本、插件版本的一致性； 
2. 如果JMeter压测需要用到CSV或者额外的JAR包等，需要在���台Agent上复制一份，并且保证所有的路径配置一致； 
3. 如果JMeter压测的CSV需要每台Agent压测机读取的数据不一样，则需要人为提前进行切分、裁剪和放置； 
4. JMeter压测时依赖的JAR包、JMX文件、压测报告等，都是在本地保存和管理的，无法统一管理和留存，管理上会造成不便和混乱； 
5. JMeter压测时通过插件可以覆盖基础的CPU、内存等监控，但是无法覆盖应用级别的监控，例如MySQL连接数、JVM使用等，无法支持用户自定义监控。 
 
#### MeterSphere基于JMeter分布式性能压测的优化 
鉴于JMeter分布式性能压测方案存在上述短板，MeterSphere开源持续测试平台从技术和管理两个维度对JMeter的性能压测进行了优化，同时保证了对JMeter使用上的兼容性。与此同时，MeterSphere还支持调用Kubernetes环境和云环境进行压测，轻松支持高并发、大规模的性能测试。MeterSphere性能测试概览仪表盘如下图所示： 
 
MeterSphere分布式性能测试方案与涉及的组件如下（注：组件介绍参考MeterSphere官网链接：https://metersphere.io/docs/system_arch/）： 
■ Node Controller：为性能测试提供独立节点类型的测试资源池, 接收来自系统的性能测试任务, 动态地启动JMeter容器完成性能测试； 
■ MySQL：MeterSphere项目的主要数据均存储在MySQL数据库； 
■ Kafka：接收JMeter产生的性能测试结果数据； 
■ Data Streaming：从Kafka中获取性能测试结果数据，处理后存入MySQL数据库； 
■ Docker Engine：为Node Controller提供JMeter容器运行环境。 
MeterSphere分布式性能压测方案的方案架构图如下图所示。 
 
1. 用户在MeterSphere界面设置性能压测参数（并发、时间、梯度、压测资源池、文件切分等）； 
2. MeterSphere根据用户设置的压测配置参数，自动化选择资源池，分发压测脚本和文件，自动启动JMeter压测节点（通过Docker启动）进行压测； 
3. 压测节点根据分发的脚本与参数，实时或者本地计算后将压测数据推送至Kafka集群； 
4. Data Streaming集群实时消费Kafka集群中压测数据，然后再经过计算动态写入MySQL数据库中； 
5. 如配置了相关的Prometheus监控，MeterSphere在压测的同时会自动收���被���测端系统的性能监控数据； 
6. 压测结束后，所有的数据在数据库中保存，方便后续进行分析、分享和查询。 
结合上述MeterSphere分布式压测方案原理，我们发现，MeterSphere分布式压测方案相对JMeter原生分布式压测方案具备以下几点优势： 
1. 管理方面的优势 
■ 所有的压测脚本和依赖包，如JAR包等文件，都在MeterSphere进行统一的存储和管理，压测时由MeterSphere统一分发至不同的压测集群，并且支持分发时的CSV文件自动切分； 
■ MeterSphere每次压测完成后，报告都会进行持久化存储，方便后续的查询、分享与分析使用，并在使用上支持对同一次的不同测试报告进行比对； 
■ 支持团队、项目、人员、权限的管理。在一些大规模的性能测试中，有可能涉及到不同团队人员，比如运维人员、DBA、开发人员等，MeterSphere可以很好地进行不同团队人员的协同管理。 
2. 技术方面的优势 
■ MeterSphere完全兼容JMeter的插件与协议栈，在MeterSphere中除了支持JMeter最常见的压测HTTP（HTTPS）协议外，还完全支持WebSocket、MQTT、FTP、SSH、数据库等方面的性能测试； 
■ 所有的压测集群在收到MeterSphere压测任务时，都采用Docker自动启动JMeter，无需人为地部署JMeter机器，同时保证了所有压测节点的JMeter版本和Java环境的一致性； 
■ 所有的JMeter压测主机无同一子网的网络依赖要求。基于这一特性，在MeterSphere中可以很容易地模拟不同地域的互联网流量访问，比如可以通过MeterSphere调度上海区域、杭州区域、北京区域等公有云的主机对目标系统进行压测； 
■ 引入Kafka消息队列和Data Streaming计算集群，所有的压测数据不直接回传到MeterSphere，减轻了MeterSphere的压力（JMeter原生方案中压测数据是回传至主控机）； 
■ 内置集成Prometheus监控系统。在压测同时，用户可以自定义设置监控指标，除了常用的CPU、内存、磁盘等，同样可以支持MySQL连接数、JVM等监控指标； 
■ 所有的组件（Kafka、Node Controller压测集群、Kubernetes压测集群、Data Streaming计算集群）都可以动态扩容扩展，当压测并发需要更高时可以动态扩容不同的组件，从而提升性能压测的并发能力。 
 
#### MeterSphere分布式性能测试实践 
1. 部署MeterSphere平台 
MeterSphere的平台部署方法可以参考官网（https://metersphere.io/docs/quick_start/quick_start/），官网给出了详细的一键部署脚本： 
curl -sSL https://github.com/metersphere/metersphere/releases/latest/download/quick_start.sh | sh 
2. 部署分压测节点（Node-Controller） 
部署分压测节点，可以先安装整个MeterSphere服务，然后对配置文件进行修改，具体操作如下： 
① 安装MeterSphere：curl -sSL https://github.com/metersphere/metersphere/releases/latest/download/quick_start.sh | sh 
② 停止服务：msctl down 
③ 修改安装模式：vim /opt/metersphere/.env 
 
④ 启动服务：msctl reload 
3. 界面添加分压测节点 
登录到MeterSphere平台，依次选择“系统设置”→“测试资源池”，编辑NODE-LOACL资源池，添加分压测节点并保存。 
 
4. 上传本地JMX压测脚本和依赖文件  
① 依次选择“性能测试”→“测试”→“创建性能测试”。 
 ② 选择“加载JMX文件”选项，建议JMX压测脚本中不要采用前后置脚本，以免影响性能测试的准确性。 
 
如果压测的JMX脚本中包含依赖的文件、第三方插件或者自定义JAR包，需要修改JMX脚本中的地址为绝对路径。 
常见需要修改的有两个地方，具体如下： 
■ 测试计划中的JAR包目录 
 
■ CSV文件设置中的CSV地址 
 
③ 如果压测的JMX脚本中包含依赖的CSV文件，或者第三方插件或者JAR，需要同时选择“加载文件”选项进行上传。 
 
5. 设置压力测试参数 
进入“压力配置”页面，此时可以设置相应的压测配置参数了（注意：此参数会覆盖JMeter线程组中的配置）。 
 
分配策略默认为均分，如果要不同压测节点分摊不同压力的话，可以选择“自定义”分配方式。此分配方式可以自定义设置不同的压力分配权重。 
 
6. CSV切分与配置监控 
如果压测的JMX脚本中包含依赖的CSV文件需要不同的压测节点以读取不同的数据，可以开启“高级配置”页面下的“CSVDataSet”选项，进行CSV自动化切分，参见下图： 
 
关于监控的配置和设计细节可以参考MeterSphere官方教程：https://blog.csdn.net/FIT2CLOUD/article/details/119673564。 
此次���加的监控配置如下： 
 
7. 报告的查看、对比与分析 
所有的配置完成后，选择“保存并执行”选项，MeterSphere会自动刷新与显示压测数据报告。 
 
在压测的同时，可以通过后台查看，添加的分压测节点已经自动化运行JMeter容器进行压力测试。 
] 
MeterSphere生成的测试报告支持展示测试详情，在“测试详情”页面中可以选择不同的显示项和时间范围。一旦选择了时间范围，报告数值会按照选择时间范围进行重新计算。 
 
在“监控详情”页面中，可以查看压测时被压测端的监控数据。 
 
针对某一性能测试，可以在“报告对比”页面选择不同的报告，并进行对比分析。 
 
 
 
#### 总结 
由此可见，MeterSphere开源持续测试平台的分布式性能压测相对于JMeter原生的分布式性能压测更适合测试团队和测试人员进行使用。 
首先，MeterSphere的部署方案更简单，MeterSphere压测执行节点支持按需创建和安装，组件可以动态扩容，轻松支持大规模性能测试； 
其次，MeterSphere更加易于管理，MeterSphere开源持续测试平台采用B/S架构设计，性能测脚本、性能测试任务和性能测试报告可以以项目、团队的维度进行有效隔离和分享协作。
                                        