---
title: 推荐系列-Apache SeaTunnel (Incubating) 2.1.0 发布，内核重构-全面支持 Flink
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 232
cover_picture: 'https://oscimg.oschina.net/oscnet/up-4cbdeed86499539b8e3d1f16eedc56d9a93.png'
abbrlink: f83cb87b
date: 2022-03-27 11:55:54
---

&emsp;&emsp;21 年 12 月 9 日，SeaTunnel (原名 Waterdrop) 成功加入 Apache 孵化器，进入孵化器后，SeaTunnel 社区花费了大量时间来梳理整个项目的外部依赖以确保整个项目的合规性，终于在贡献者们四...
<!-- more -->

                                                                                                                    
                                                                                                     
2021 年 12 月 9 日，SeaTunnel (原名 Waterdrop) 成功加入 Apache 孵化器，进入孵化器后，SeaTunnel 社区花费了大量时间来梳理整个项目的外部依赖以确保整个项目的合规性，终于在贡献者们四个月的努力下，社区于 2022 年 3 月 18 日正式发布了首个 Apache 版本，该版本一次性通过 Apache 孵化器严苛的 2 轮投票审查，最大程度地保证了 SeaTunnel 软件 License 的合规性。同时这意味着 2.1.0 版本，是经过 SeaTunnel 社区和 Apache 孵化器双重检查后发布的第一个 Apache 官方版本，企业和个人用户可以放心安全使用。 
2.1.0 下载地址： 
https://seatunnel.apache.org/download 
GitHub Release: 
https://github.com/apache/incubator-seatunnel/releases/tag/2.1.0 
Note： 
License 是一种具有法律性质的合同或指导，目的在于规范受著作权保护的软件的使用或散布行为。软件许可是软件开发者与其用户之间的一份合约，用来保证在符合许可范围的情况下，用户将会受到保护。这里非常建议广大用户及开发者在选择开源软件前，首先关注该软件的 License 许可是否适用于自己的产品中，而 Apache License 是一种对商业十分友好的 License。 
01 本次发布版本说明 
新特性 
1.对微内核插件化的架构内核部分进行了大量优化，内核以 Java 为主，并对命令行参数解析，插件加载等做了大量改进，同时插件扩展可根据用户（或贡献者）所擅长的语言去做开发，极大程度地降低了插件开发门槛。 
2.全面支持 Flink，但同时用户也可自由选择底层引擎，本次更新也为大家带来了大量的 Flink 插件，也欢迎大家后续贡献相关插件。 
3.提供本地开发极速启动环境支持（example），贡献者或用户可以在不更改任何代码的情况下快速丝滑启动，方便本地快速开发调试体验。对于需要自定义插件的贡献者或者用户来讲，这无疑是个令人激动的好消息。事实上，我们在发布前的测试中，也有大量贡献者采用这种方式快速对插件进行测试。 
4.提供 Docker 容器安装，用户可以极快地通过 Docker 部署安装使用 SeaTunnel，未来我们也会围绕 Docker&K8s 做出大量迭代，欢迎大家讨论交流。 
具体功能说明 
 
  使用 JCommander 来做命令行参数解析，使得开发者更关注逻辑本身。  
  Flink 从 1.9 升级至 1.13.5，保持兼容旧版本，同时为后续 CDC 做好铺垫。  
  支持 Doris 、Hudi、Phoenix、Druid 等 Connector 插件，完整的插件支持你可以在这里找到 [plugins-supported-by-seatunnel] 。  
  本地开发极速启动环境支持，你可以在使用 example 模块，不修改任何代码的前提下快速启动，方便开发者本地调试体验。  
  支持通过 Docker 容器安装和试用 SeaTunnel。  
  Sql 组件支持 SET 语句，支持配置变量。  
  Config 模块重构，减少贡献者理解成本，同时保证项目的代码合规 (License)。  
  项目结构重新调整，以适应新的 Roadmap。  
  CI&CD 的支持，代码质量自动化管控，（后续会有更多的计划来支持 CI&CD 开发）。  
 
02 用户寄语 
一路见证了SeaTunnel的成长，从早期的waterdrop 开始，虎牙就一直使用作为数据pipline对接的核心组件，插件化的能力极大的简化了数据对接的繁琐工作。近期 SeaTunnel 多方面都进行了深度优化，尤其在扩展能力方面取得了巨大进展：引擎方面同时支持 Spark 和 Flink，具备其他引擎的扩展能力；插件方面支持了近20余种常见的数据存储，具备其他多语言开发插件的扩展能力。经过社区的持续努力，SeaTunnel 在文档、配置和开发测试环境都取得了前所未有的进步，同时 SeaTunnel 在项目结构上也做出大胆调整，为未来的 CDC、CI&CD、代码质量自动化等特性的支持做好铺垫。SeaTunnel 未来可期，希望大家持续关注中国自己主导的开源项目，Fighting！ 
--- 虎牙数据架构师 黄强 
很高兴看到 SeaTunnel 第一个 Apache 版本的发布，新版本代码结构更加清晰，支持的插件更加丰富。后续我也会继续参加对 SeaTunnel 的贡献。与社区一起让使用更简单，更高效。 
--- OPPO 高级工程师 范未太 
SeaTunnel 独特的架构设计、模块化和插件化的先进思想非常值得借鉴。当 Seatunnel 还是 Waterdrop 的时候，我们就持续关注项目的发展，并在多种 etl 场景中验证。我们结合了图形化界面，使用户可以通过简单的配置，进行 ETL 操作，并大规模应用在生产环境中。希望 SeaTunnel 发展越来越好！ 
--- 理想汽车大数据基础平台负责人 聂磊 
恭喜Seatunnel加入Apache后首个Apache版本发布，2.1.0基于更加清晰的代码结构，更加丰富的插件家族，优秀而简单易用，使其非常适合二开及企业落地，另外架构的升级优化、性能的提升，将更高效的助力于企业的数据传输，提升数据价值。 
--- 哔哩哔哩资深开发 张宗耀 
Apache SeaTunnel(Incubating) 的出现弥补了大数据开源生态中高并发数据推送和清洗的空白，其插件式思想的架构，吸引了一大批贡献者不断补充完善，使得多源数据交换更加简单便捷，而这些亮点，在最新版本2.1.0中也都得到了最好的体现，大大节省了其使用者二开的成本。作为 Apache SeaTunnel(Incubating) 的粉丝之一，由衷的祝愿 SeaTunnel越来越好，未来也会将个人和公司的使用经验同步到社区，为 SeaTunnel 的更高效更易用添砖加瓦。 
--- 孩子王OLAP平台架构师 袁洪军 
恭喜SeaTunnel首个Apache版本的发布，刚接触到SeaTunnel时，就被其简单易用所吸引，新版本不但在架构上有很大的提升，而且支持的数据源也更加丰富。同时社区也越来越成熟，希望更多热爱开源的小伙伴一同参与进来，让SeaTunnel大放异彩。 
--- 蜀海供应链大数据工程师 吴迪 
很高兴看到 Seatunnel 加入 Apache 后发布了第一版本，新版本在系统架构、配置优化、性能提升等方面都获得巨大进步。如果您还在为分布式数据接入和清洗而努力，不妨加入 Seatunnel 社区，这里有巨大惊喜在等着您！ 
--- CETC 陈胡 
03 致谢 
感谢以下参与贡献的同学(为 GitHub ID，排名不分先后)： 
Al-assad, BenJFan, CalvinKirs, JNSimba, JiangTChen, Rianico, TyrantLucifer, Yves-yuan, ZhangchengHu0923, agendazhang, an-shi-chi-fan, asdf2014, bigdataf, chaozwn, choucmei, dailidong, dongzl, felix-thinkingdata, fengyuceNv, garyelephant, kalencaya, kezhenxu94, legendtkl, leo65535, liujinhui1994, mans2singh, marklightning, mosence, nielifeng, ououtt, ruanwenjun, simon824, totalo, wntp, wolfboys, wuchunfu, xbkaishui, xtr1993, yx91490, zhangbutao, zhaomin1423, zhongjiajie, zhuangchong, zixi0825. 
同时也诚挚的感谢我们的 Mentor ： 
Zhenxu Ke，Willem Jiang， William Guo，LiDong Dai ，Ted Liu, Kevin，JB 
在这个过程中给予的帮助。 
04 未来几个版本的规划 
 
  CDC (Change Data Capture) 是一种用于捕捉数据库变更数据的技术,未来我们会支持Spark、FlinkCDC 的支持；  
  监控体系,包括数据读取耗时/s，任务读取输入数据总量，数据传输记录等常用指标的监控。  
  UI 系统的支持，支持用户界面编辑；  
  SDK 的支持，支持服务化，更便于用户使用。  
  更多的 Connector 支持，以及更高效的 Sink 支持，如 ClickHouse，很快会在下个版本跟大家见面。  
 
后续 Feature 是由社区共同决定的，我们也在这里呼吁大家一同参与社区后续建设，如果大家关注哪个特性，可以提 Issue 或者在 Issue 回复，关注多的问题将优先实现。 
05 社区发展 
近期概况 
自进入 Apache 孵化器以来，贡献者从13 人增长至 55 人，且持续保持上升趋势，平均周 Commits 维持在20+，来自不同公司的三位贡献者(Lei Xie, HuaJie Wang,Chunfu Wu,) 通过他们对社区的贡献被邀请成为 Committer。 
我们举办了两场 MeetUp，来自 B 站，OPPO、唯品会等企业讲师分享了 SeaTunnel 在他们在企业中的大规模生产落地实践(后续我们也会保持每月一次的 meetup，欢迎各位使用 SeaTunnel 的用户或者贡献者分享 SeaTunnel 和你们的故事)。 
Apache SeaTunnel (Incubating) 的用户 
Apache SeaTunnel (Incubating) 目前登记用户如上，如果您也在使用 Apache SeaTunnel，欢迎在 Who is using SeaTunne (https://github.com/apache/incubator-seatunnel/issues/686）中登记！ 
 
Note:仅包含已登记用户 
06 PPMC 感言 
Apache SeaTunnel (Incubating) PPMC LiFeng Nie 在谈及首个 Apache 版本发布的时候说，从进入 Apache Incubator 的第一天，我们就一直在努力学习 Apache Way 以及各种 Apache 政策，第一个版本发布的过程花费了大量的时间（主要是合规性），但我们认为这种时间是值得花费的，这也是我们选择进入 Apache 的一个很重要的原因，我们需要让用户用得放心，而 Apache 无疑是最佳选择，其 License 近乎苛刻的检查会让用户尽可能地避免相关的合规性问题，保证软件合理合法的流通。另外，其践行 Apache Way，例如公益使命、实用主义、社区胜于代码、公开透明与共识决策、任人唯贤等，可以帮助 SeaTunnel 社区更加开放、透明，向多元化方向发展。 
**07 Committer & Contributor 寄语 ** 
Apache SeaTunnel 链接数据,释放价值. 从进入Apache 孵化器到现在第一个Apache版本的发布, 一直深度关注, 并参与其中, 非常高兴 SeaTunnel 第一个Apache版本的发布, 新版本在代码架构和规范上都得到很大提升, Apache SeaTunnel 社区也非常活跃, 后续我会继续贡献, 欢迎更多的小伙伴加入其中, 为SeaTunnel 的发展贡献一份力量. 
--- Apache SeaTunnel Committer 王华杰 
很开心看到 SeaTunnel 发布了第一个 Apache 版本，虽然是第一个版本，但是 SeaTunel 在易用性方面，数据源支持方面已经具有很强的能力，能帮助用户简单快速高效的完成数据同步任务。同时社区也在蓬勃发展中，希望大家能够一起参与到 Apache SeaTunnel(Incubating) 的贡献之中，为 SeaTunnel 的成长献出自己的力量。 
--- Apache SeaTunnel Contributor 范佳 
经过社区小伙伴们共同的努力下，我们很高兴的迎来了进入 Apache 孵化器的首个 Apache 版本，首个 Apache 版本相对于之前的非 Apache 版本从代码层面上做了大量的重构工作，不管从代码规范性上还是从插件丰富性上还是稳定性上等方面都有了很大的提升，Apache SeaTunnel 社区非常活跃，也希望更多的小伙伴能加入进来贡献你的一份力量。 
--- Apache SeaTunnel Committer 武春甫 
08 关于 SeaTunnel 
SeaTunnel(原 Waterdrop) 是一个非常易用的支持海量数据实时同步的超高性能分布式数据集成平台，每天可以稳定高效同步千亿数据，已在近百家公司生产上使用。 
为什么我们需要 SeaTunnel 
SeaTunnel 尽所能为您解决海量数据同步中可能遇到的问题： 
 
  数据丢失与重复  
  任务堆积与延迟  
  吞吐量低  
  应用到生产环境周期长  
  缺少应用运行状态监控  
 
SeaTunnel 使用场景 
 
  海量数据同步  
  海量数据集成  
  海量数据的 ETL  
  海量数据聚合  
  多源数据处理  
 
SeaTunnel 的特性 
 
如何快速上手 SeaTunnel? 
想要快速体验SeaTunnel吗。2.1.0 十秒钟带你极速体验： 
https://seatunnel.apache.org/docs/2.1.0/developement/setup 
如何参与贡献？ 
我们诚邀各位有志于让本土开源立足全球的伙伴加入 SeaTunnel 贡献者大家庭，一起共建开源! 
提交问题和建议： 
https://github.com/apache/incubator-seatunnel/issues 
贡献代码： 
https://github.com/apache/incubator-seatunnel/pulls 
订阅社区开发邮件列表： 
dev-subscribe@seatunnel.apache.org 
开发邮件列表： 
dev@seatunnel.apache.org 
加入 Slack: 
https://join.slack.com/t/apacheseatunnel/shared_invite/zt-10u1eujlc-g4E~ppbinD0oKpGeoo_dAw 
关注 Twitter:   
https://twitter.com/ASFSeaTunnel 
衷心欢迎你们的加入！ 
欢迎加运营微信哟！ 

                                        