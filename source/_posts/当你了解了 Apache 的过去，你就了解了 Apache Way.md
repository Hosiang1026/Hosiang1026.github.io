---
title: 推荐系列-当你了解了 Apache 的过去，你就了解了 Apache Way
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 301
cover_picture: 'https://oscimg.oschina.net/oscnet/up-6b7495b977116810db93827c6b5f351ec18.png'
abbrlink: ade7cabf
date: 2021-07-23 11:55:56
---

&emsp;&emsp;16 世纪开始的北美印第安战争中，其中有一个与之抗争达数世纪，最后一个向美国政府投降部族——Apache 部族。他们的最后一任首领杰罗尼莫带领部族抗击美军直到 1909 年。 约莫一个世纪之后...
<!-- more -->

                                                                                                                    
约莫一个世纪之后，同样是在美洲大地上，一个自称是“hanging out with radicals”的计算机系学生 Brian Behlendorf 带领一小撮人站在了反抗大型科技公司的擂台上，并将自己的队伍命名为“Apache Group”。  
之后的故事基本就人尽皆知了。Brian 等人所发布的 Apache 在 Web 服务器领域攻城略地，巅峰时期市场占有率超过 7 成。而在 Apache HTTP 服务器的基础之上，一个更大的、为自由而战的软件“部落”Apache 软件基金会（Apache Software Foundation，简称为ASF）随之创立。到今天，ASF 中已经有来自全世界各地贡献者维护的近两百多个项目，在互联网中提供着“Trillions and Trillions Served”数以万亿的服务，也正应了那句“开源吞噬世界”。 
许多开源项目以被冠“Apache”之名为荣，也有人形容 ASF 是一个“草根”项目的归属地，软件是否能进入孵化、毕业全看项目本身发展而非出身，那些经过 ASF“认证”顺利毕业的项目也是各自领域中的翘楚。 
Apache HTTP 服务器打了个漂亮的开场仗，ASF 则制定了非常正确的战略，组合拳之下，这片斜插着的羽毛已经通过互联网实际存在全世界各个角落。 
 
### 三叉戟之战，凤凰涅槃 
1994 年，在加州大学伯克莱分校计算机系刚读了三年的“激进分子”Brian 离开学���，去追寻自己的理想。Brian 早期的工作是建立并维护 Wired 杂志的在线网站，和当时绝大多数的 Web 网页一样，Wired 依赖开源的 NCSA HTTP Server。NCSA HTTP Server 由伊利诺斯大学超级计算机应用程序国家中心（NCSA）组织研究生编写。 
Biran 当时也为 NCSA HTTP Server 贡献了许多补丁，后来 ASF 的创始成员早期也都是贡献者之一，比如联合创始人 Mark Cox 在 1993 年读博期间，也在为 NCSA Web 服务器创建新功能和错误修复。 
 
Brian Behlendorf 
但是就在 Brian 走出学校的这一年，图形界面网络浏览器的开发者安德森和克拉克联手成立了一家叫做 Netscape 的公司，在整个科技工业史上，Netscape 被认为是少数曾盖过微软风头的公司之一。 
Netscape 成立之后便推出产品“网景浏览器”，不到一年就卖出几百万份，到了 1995 年，Netscape 就挂牌上市，当天股价就从 28 美元涨到 75 美元，之后也在一路上涨。 
崭露头角之际，Netscape 盯上了 NCSA HTTP Server 这块肥肉。 
据 Brian 回忆：突然有一天，伊利诺伊大学的学生开发人员向 NCSA 网络服务器开发人员列表发送了一封电子邮件。邮件内容大致是表示他们将不会再为 NCSA HTTP Server 工作了，原因是他们都在 Netscape 找到了工作。这意味着，他们只能依赖一个没人编码、没人维护的开源网络服务器。 
Brian 和一些正在为 NCSA HTTP Server 做贡献的人意识到，他们处在一个非常不稳定的位置。于是，自救开始。 
他们先是查看了代码的版权许可，NCSA HTTP Server 当时采用的是一个 MIT License 精神下的宽容式软件协议，给了开发者极大的自由。Brian 决定延续这一想法和心态，让人们自愿一起工作，共同努力。同时，他想要为新软件起一个浪漫、有趣的名字，最终他锁定了 Apache 这个战斗到最后的部族名称。 
此外，Apache 对于新服务器来说还代表另外一个意义。ASF 的成员之一 Danese Cooper 解释，过去为服务器软件提交的东西被称为 Patchs 补丁，现在称为 PR，新的服务器正是由这些提交构成的，因此也是“a patchy software”，谐音 Apache。 
对于 Apache HTTP 服务器的出现，ASF 联合创始人之一 Jim Jagielski 形容它是凤凰涅槃：通过邮件列表来收集一群人的意见，并协调巩固，我们希望在自己的 NCSA web 服务器中看到的补丁、想法、功能和改进，并使用它来创建 Apache Web 服务器 。 
而 Apache Group 接下来则是要领导一场战斗，这场战斗中，科技巨头的形象是“不了解开源”、“反对开源”，Apache Group 则是要去创建一个软件，创造开源的基础设置，并且创建开源知识，用 Jim Jagielski 的话来说就是“像三叉戟之战”。 
“我们在这场战斗中获胜的想法是让开源成为人们开发软件���事实方式，这对 Apache 来说是一个长期的目标。”ASF 成员之一 Danese Cooper 如是说。 
 
《冰与火之歌》一书中，三叉戟之战（Battle of the Trident）是最终决定篡夺者战争结果的一场战斗。起义军和王室军队在三叉戟河的绿叉河畔，穿过后来被称为红宝石滩的渡口。这场战斗以起义军的胜利而告终。 
 
### “草根”保护伞 
“当 Apache 软件基金会成立时，我真的只是把它看做是一个产品的保护伞，我没有想象过会有数百个项目想要在同一个保护伞下。”这句来自 Mark Cox 的评价概括了 ASF 成立的初衷以及达成的效果。 
Apache Group 刚刚成立时仅有 8 个人，到了 0.8.8 版本时队伍扩大到 15 个人。到 1995 年12 月 1 日 Apache 1.0 发布后，迅速在一年内超过 NCSA，成为最常用的 Web 服务器。 
随着贡献者与使用者的增加，问题随之浮现。Apache HTTP 服务器不断收到来自世界各地的开发者的反馈和 PR，也有人成立类似“Apache Group”的小组。Apache 成员 Maximilian Michels 在谈及 ASF 的过去时回忆，“随着项目数量的增加，经济利益和潜在的法律问题威胁到 Apache 的存在。出于这种需要，Apache 软件基金会 (ASF) 于 1999 年 6 月作为美国 501(c)(3) 非营利组织成立。在美国，501(c)(3) 是专门设计的法律实体用于非营利慈善组织。” 
“ASF 成立后，新项目可以轻松利用基金会的服务。在接下来的一年中，每隔几个月就有一个新项目进入 ASF。Apache HTTP Server 之后的第一个项目是 Apache mod_perl（2000 年 3 月）、Apache tcl（2000 年 7 月）和 Apache Portable Runtime（2000 年 12 月）。在 2001 年的短暂休息之后，该公司曾采用计划化方法通过孵化器加入新项目，此后，ASF 每年有多达 12 个项目（2012 年）非常稳定地增长。” 
现在翻看 ASF 的项目增长曲线，每年新进入孵化器的项目都非常稳定。 
 
图源：https://projects.apache.org/ 
那么，ASF 为何能吸引这么多项目？保护伞更宽泛的作用在哪里？ 
我们不妨从一个亲历者的心声开始看起。 
1998 年，IBM 赞助了 ASF 第一场团队聚会，几乎所有人都是在这次聚会中，才和一起工作了几年的人见到面。第一届 ApacheCon 也在这一年召开。当年，Mark Cox 见到所有 Apache Web 服务器的开发人员聚集在一个地方，不由得担心一个问题：如果发生自然灾害，或是食物中毒，那么社区就会消失。不过，Mark Cox 担心的并不是代码，因为代码已经在世界各地的数万台服务器上，他真正担心的是担心会失去那些拥有核心价值观和相同使命的人，“项目的成功是基于人而不是代码，这就是定义成功的原因，这几乎就是 Apache Way。” 
 
CC BY Mark Cox. https://www.flickr.com/photos/iamamoose/albums/1381277/with/63963566/ 
 
CC BY Mark Cox https://www.flickr.com/photos/iamamoose/63963722/in/album-1381277/  
Apache way 是什么？有一句评价是：你去问 ASF 中的 10 个人 Apache Way 是什么，可能会得到 11 个答案。然而，如果你问 ASF 为什么成功，答案都离不开 Apache Way。 
Apache Way 早在 Apache Group 成立之时，就已经出现，“它是我们基金会获得成功的原因，同时我们也相信它对整个开源的胜利至关重要。”当然，这些年，Apache Way 也在不断改进，总得来说，Apache Way 根据现有法律和社会框架定义了开源，可以帮助其他人了解是什么可以让开源变得强大，以及如何参与开源。具体规定可查看 Apache Way 的官方解释，这里主要列下几点 Apache Way 最为人津津乐道的特征和表现。 
 
 社区大于代码 
 
这一点更多的是 ASF 成员所坚持的一个信念。正如 Mark Cox 所看重的，ASF 中，社区成员一直被看做是最宝贵的财富，ASF 坚信健康的社区比好的代码更重要，强大的社区可以纠正代码的问题，而不健康的社区可能会难以以可持续的方式去维护代码库。 
 
 透明邮件列表与明确的章程 
 
Brain 在纪录片中提到 ASF 的核心治理流程均以章程的形式或者其他方式可以有很好地记录。比如从一开始，Apache Group 所有的沟通和决策都是在公开的邮件列表里进行的。（一个小故事，Brian 和他的妻子也是在邮件列表中认识的。） 
此外，在慕名而来的孵化项目不断增加时，ASF 在 2002 年正式成立 Incubator，来指导新进项目的成长：志愿者、爱好者或公司员工均可向孵化器提案，包含项目名称、初始 PPMC（Podling PMC）成员名单，以及新项目的动机和目标；一旦 IPMC（Incubator PMC）讨论了提案，就会开始投票决定项目是否进入孵化阶段；在孵化阶段，项目名称中带有“孵化（Podling）”，毕业后消除；要毕业，项目必须证明自己足够成熟。ASF 项目成熟度模型主要包括社区活跃度、代码质量和合法合规方面。 
 
 独立性/中立性 
 
基金会对于当今开源界的项目来说，最基本的便是能提供一个中立性的背书，ASF 也不例外，并且执行非常严格的供应商中立：“任何组织都无法获得特权或控制项目的方向，无论是否雇用 Committer 从事 Apache 项目或赞助状态。” 
“这种独立性为那些迅速增长的开发人员群体创造了一个避风港。”ASF 董事会成员 Jim Jagielski 认为，ASF 项目增长的主要原因即为中立性，由于 ASF 的发展强调了对中立、以社区为中心的环境的需求和对需求的认可，在这个环境中，每个人都可以为项目工作并为项目做出贡献，而无需付费。在一个公司争相控制开源项目的生态系统中，ASF 提供了一个安全的空间，在这个空间中，社区本身拥有并且永远拥有对自己命运的控制权。尽管有些项目有一个庞大的、单一的企业‘协会’，但 ASF 和 PMC 在确保影响和控制权方面都非常小心。社区内个人的肩膀，而不是任何公司的需求。 
 
 精英治理和“懒惰”共识 
 
精英管理和“懒惰”共识是 Apache 软件基金会内部治理的核心原则。 
精英管理是源于古希腊的一种政治制度，与中国古代的选贤举能所类似，人们推选做出努力和贡献的，才德配位的人成为领导者，根据贡献不同，给予不同的身份。在 ASF 中，提交补丁的用户可能会获得提交者身份，推动项目发展的提交者可能会获得 PMC 身份，而积极参与项目与基金会工作的 PMC 成员可以获得会员身份。这样，便能确保新人在进入社区时可以更好的融入，也有了一个清晰的进阶指南。 
另外，基金会和项目内的决策通常使用“懒惰”共识来执行。共识很容易理解，投票决策一定能确定一个更多人支持的共识。而“懒惰”共识，是指只要没人反对，即使是少数人也可以直接讨论，并决策。当然，讨论必须在邮件列表中公开进行。这个规则的一大好处就是，不需要每个决策都调动全员参与，便能在推动项目发展中减少摩擦，提快速度。 
不难发现，ASF 旗下项目很少出现严重的社区纠纷，也几乎不会出现项目的管理层和贡献者发生冲突的事情。能同时管理一百多个不小的开源项目，并且让几乎所有的项目都越来越好，这似乎已经证明��� Apache Way 的高明。而随着 ASF 项目的增加与普及，Apache 最初的梦想——让开源开发成为事实上的开发方式，似乎离实现也并不遥远了。 
  
  
 
                                        