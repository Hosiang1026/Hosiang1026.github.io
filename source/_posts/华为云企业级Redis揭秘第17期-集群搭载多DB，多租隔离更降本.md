---
title: 推荐系列-华为云企业级Redis揭秘第17期-集群搭载多DB，多租隔离更降本
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 301
cover_picture: 'https://pic4.zhimg.com/80/v2-7be7ac15c9317eb2c80456da96d1b633_720w.jpg'
abbrlink: 9c7237b1
date: 2022-03-27 11:56:25
---

&emsp;&emsp;：GaussDB(for Redis)支持真正可扩展的多DB，轻松实现降本增效。 本文分享自华为云社区《华为云企业级Redis揭秘第17期：集群搭载多DB，多租隔离更降本》，作者： GaussDB 数据库 。 背景...
<!-- more -->

                                                                                                                    
            程序员健身是为了保养还是保命？参与话题讨论赢好礼 >>>
            
                                                                                                     
本文分享自华为云社区《华为云企业级Redis揭秘第17期：集群搭载多DB，多租隔离更降本》，作者： GaussDB 数据库 。 
背景：GaussDB(for Redis)是华为云数据库团队推出的企业级Redis，完全兼容开源Redis，既能显著降低成本，又能提供更稳定可靠的KV存储服务。 
 
#### 一、一切要从某个深夜的需求说起 
某天深夜，作为后端小能手的小强强刚准备收工，老板打来电话：“小强强，咱们Redis用的也太杂了，好几十套，啥规格都有！这里面肯定有不少资源浪费！你负责搞个降本增效专项吧，把Redis使用成本降下来，也让运维同学轻松点。” 
别看我们小伙子年轻，实则经验老道。小强强拍着胸脯接下需求，大致有了思路（如图）： 
 
图1 Redis资源整合+降成本+轻松运维 
“搞定这件事的核心办法就是‘一Redis多用’！”，小强强立刻想到2个方案： 
方案1：让业务同学给key加前缀。该方案看似搞定了需求，但隔离性差，大量key前缀占空间，业务改造也很麻烦，因此它并不是优选。 
方案2：使用Redis的多DB。业务通过select命令访问专属DB，flushdb命令又能一键清数据，隔离效果不错，按理说还是很方便的。 
 
#### 二、开源Redis的多DB是鸡肋 
但是，作为经验十足的后端开发，小强强提前识别到了方案2的严重隐患： 
 
 开源Redis的“多DB”只能用于单机，不支持集群，搞不定后期扩容。 
 而单机Redis扩容到64G已经是极限，更不用说fork导致的容量利用率只有50%。 
 
也就是说，随着后期业务增长，多个业务挤在一套容量只有64G的开源Redis中，意味着当内存不足时，必须得有业务迁出！ 
 
图2 开源Redis多DB无法扩展，后期只能重新拆分 
这不就回到了最初的问题原点吗？开源Redis的多DB方案明显不符合资深后端的身份，对此，小强强坚决say no！ 
好吧，开源Redis的多DB，看来你是真的帮不上忙！ 
 
#### 三、当多DB遇上GaussDB(for Redis) 
前面提到，“多DB”是小强强此刻最需要的功能，但开源Redis多DB却有着后期无法扩容的严重隐患。为了解决问题，小强强找到了真正解决该痛点的产品：GaussDB(for Redis)。 
在多DB的使用上，GaussDB(for Redis)与开源Redis用法完全一致，实现了同一实例下的数据隔离。GaussDB(for Redis)的多DB核心价值在于： 
 
 吞吐可水平扩展至百万QPS，容量支持12TB，解决了扩展性问题； 
 相比开源Redis，成本可降20%~70%； 
 单实例支持6w+DB数，搞定大规模业务多租隔离。 
 
基于GaussDB(for Redis)多DB功能，业务多租户可以放心共用一套GaussDB(for Redis)，不但轻松实现降本，而且能完美cover住后期业务增长。 
 
图3 GaussDB(for Redis)多DB实现业务多租隔离 
终于搞定一个靠谱方案！小强强可以放心地交差了。最后，再一次为好用的产品打call： 
GaussDB(for Redis)支持真正可扩展的多DB，轻松降本，简直yyds！ 
 
#### 四、附录 
 
 本文作者：华为云数据库GaussDB(for Redis)团队 
 杭州/西安/深圳简历投递：yuwenlong4@huawei.com 
 官方博客：https://bbs.huaweicloud.com/blogs/248875 
 
华为云开年采购季盛大开幕！点击了解详情：https://activity.huaweicloud.com/dbs_Promotion/index.html 
  
点击关注，第一时间了解华为云新鲜技术~
                                        