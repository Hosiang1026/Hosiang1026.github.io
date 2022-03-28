---
title: 推荐系列-Web3D 从入门到跑路 · 3D 初体验
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 310
cover_picture: 'https://oscimg.oschina.net/oscnet/b595b171-85f5-475b-8608-b1b9c405a959.png'
abbrlink: de28351d
date: 2022-02-01 11:53:55
---

&emsp;&emsp;整理自老冯于 凹凸 2022 年技术分享，带领大家从案例、应用、技术生态出发，让大家了解一下 3D 在 Web 端的现状。 3D初体验 Hey 3D what's up，最近在 Web 圈混得怎样 在“元宇宙”概念越...
<!-- more -->

                                                                                                                    
  
  ###  
   
  ### 本文整理自老冯于 凹凸 2022 年技术分享，带领大家从案例、应用、技术生态出发，让大家了解一下 3D 在 Web 端的现状。 
   
  ### 3D初体验 
   
  在“元宇宙”概念越来越火热的背景下，我们准备了一系列的 3D 元宇宙公开课及教学文章，教大家如何从 0 到 1 快速搭建一个 3D 项目，从中可以学习到 WebGL 底层原理、图形学、热门引擎的使用方法等。在入门前，我们先从案例、应用、技术生态出发，让大家了解一下 3D 在 Web 端的现状。 
   
   
  #### 一、案例展示— 
   
  ##### 1.1 组成部分 
  先从一个基础的 DEMO 出发，一个基础的 3D 一般会有以下模块组成： 
   
  ###### （1）渲染 
  打开一个 3D 页面，首先会下载模型文件，然后渲染到页面中 
   
  ###### （2）动画 
  逐帧渲染动画 
   
  ###### （3）事件绑定 
  通过 js 的事件绑定，触发对应的渲染。比如点击地面人物移动 
   
  ###### （4）场景切换 
  众所周知，游戏里有很多场景，比如游戏加载、游戏开始、游戏结束，就是三个不同的场景。如图就是从主玩法到编辑场景 
   
   
  ##### 1.2 完整案例 
   
  ###### （1）PC 端 
  下面来看一些有趣的例子，先从PC端开始这是一名开发者博客，他从开始场景切换成主场景，然后渲染一些树、车 3D 模型，用键盘控制模型的方向，碰撞后将模型旋转，并同时播放对应的音频等。点击体验一下 👉 https://bruno-simon.com/[1] 
  这是 playcanvas 官网上的宝马 demo，它渲染了动画，点击下面的图片，可以更换这个模型的纹理。点击体验一下 👉 https://playcanv.as/p/RqJJ9oU9[2] 
   
  ###### （2）H5端 
  再看看移动端的案例上面的赛车游戏，也是从开始场景切到主玩法，之后通过下方的 touch bar 对车/地图的进行位移和其他物体碰撞后，检测触发加速等事件。扫码或点击体验一下👉 Mercedes-EQ Formula E Team - Speedboard Game[3] 
  然后是大家熟知的例子，神庙逃亡，也可以看到很明显的场景切换、碰撞检测等。扫码或点击体验一下👉 Play Temple Run 2 on Poki[4] 
   
   
  #### 二、应用场景— 
  再来看看 3D 在国内一些正式的应用场景。 
   
  ##### 2.1 App 端 
  比如 VR 看房，VR 线上看房可以没有导购员的干扰，节省带看成本，用户操作上也为该房产留下了大量的数据留存； 
  还有如果在一些购物 App 上看鞋，它会有鞋 3D 模型预览，以及 AR 试穿，可以看清鞋子的细节以及个人试穿后的样子。 
   
  ##### 2.2 H5 端 
  一些互动小游戏中，也有 3D 的部分 
  微信小游戏中，也有 3D 的小游戏 
   
   
  #### 三、技术生态— 
   
  ##### 3.1 游戏引擎的定义 
  首先，想要“快速”实现一个 3D 游戏，需要 3D 的游戏引擎，那么到底什么是游戏引擎呢？ 
  （1）已编写好的可编辑电脑游戏系统（2）交互式实时图像应用程序的核心组件（3）能容易和快速地做出游戏程式 
   
   
  ##### 3.2 游戏引擎的组成 
  大多数游戏引擎包含以下系统：（1）渲染引擎即“渲染器”，绘制图像，并向外部表达图像的系统，含二维图像引擎和三维图像引擎 
  （2）物理引擎通过为刚性物体赋予真实的物理属性的方式来计算运动、旋转和碰撞反映 
  （3）脚本引擎提供脚本接口，让开发者通过脚本设计游戏，使游戏的开发更加灵活 
  （4）网络引擎数据交换的模块，在开发多人在线游戏时使用 
  （5）人工智能代替游戏开发中部分劳动密集型内容的生成，如道路检测 
   
   
  ##### 3.3 如何选择合适的游戏引擎 
  如何选择适合游戏引擎，我们一般从以下三个方面考虑： 
   
  ###### （1）入门 
   
    
    
      开发语言 
     
    
    
      学习资源与技术支持能力 
     
    
    
      工作流支持力度 
     
   
  如果是刚入门的先要考虑是否是自己熟悉的开发语言，考察该引擎的官方的资源文档、团队的问题修复能力、社区活跃度，以及引擎的工作流支持力度，如是否有 playground 等。 
   
  ###### （2）参考 
   
    
    
      商业化成熟案例 
     
    
    
      应用广度 
     
   
  从参考实例上考虑，该引擎是否有现实的有名的项目正在使用，使用的广度； 
   
  ###### （3）设计 
   
    
    
      设计理念 
     
    
    
      性能 
     
   
  从设计上面考虑，引擎的设计理念是否容易理解、方便第三方介入接入。以及需要结合项目的规模及功能要求，需要选择符合要求的性能优化、内存管理、资源管理的引擎。 
   
   
  ##### 3.4 技术栈 
  选取了 Github 上 star 数最多的游戏引擎，选几个来分析一下其优点及不足： 
   
  ###### （1）Three.js 
  Three.js 是最流行的 JavaScript 库之一，用于使用 WebGL 在 Web 浏览器中创建和动画化 3D 计算机图形。 
  A. 优点： 
   
    
    
      易于学习：非常容易上手，同样适合新手 
     
    
    
      大型社区：示例多，用户多，社区丰富 
     
    
    
      好的文档：强大的文档通常是一个强大的库的一个很好的指标，而 Three.js 具有出色的文档 
     
    
    
      性能优势：出色的性能，能很好地执行复杂的渲染功能 
     
    
    
      PBR 渲染：具有内置的 PBR 渲染，这使得渲染图形更加准确 
     
   
  B. 不足： 
   
    
    
      不算是游戏引擎：渲染以外的功能很少 
     
    
    
      面向新手：由于 API 面向新手，因此隐藏了许多高级功能 
     
   
   
  ###### （2）Babylon.js 
  Babylon.js 是一个强大的、简单的、开放的游戏和渲染引擎。 
  A. 优点： 
   
    
    
      出色的测试工具：Playground 是在进行全面开发之前对事物进行测试的出色工具，并且具有出色的启动文档 
     
    
    
      强大的社区支持：社区活跃和丰富 
     
    
    
      更新迭代频繁：该框架拥有频繁更新的代码库，并且第三方工具正在积极开发中 
     
    
    
      PBR渲染：对PBR渲染的支持非常出色 
     
    
    
      大牌支持：Babylon 得到 Adobe，Microsoft 等大型品牌的使用和支持 
     
    
    
      问题修复：BUG 修复很快，问题很快能得到解决 
     
   
  B. 不足： 
   
    
    
      成熟度：2013 年的第一个版本，与许多竞争对手相比，它还算年轻； 
     
    
    
      文档：API 文档部分参数字段描述不够清晰； 
     
    
    
      规模：不适合较小的项目 
     
   
   
  ###### （3）Aframe 
   
    
    
      使用简单，声明性 HTML：A-Frame 只需插入 
      
 ```java 
  <a-scene>
  ``` 
  
     
    
    
      实体组件体系结构：A-Frame 是 Three.js 之上的强大框架，为 Three.js 提供了声明性，可组合且可重用的实体组件结构 
     
    
    
      性能：一个框架是在 Three.js 之上的一个瘦框架 
     
    
    
      跨平台，有视觉检查器，功能丰富 
     
    
    
      设计理念：由于设计理念与其他引擎不同，接入第三方物理引擎的时候，不太方便做适配 
     
   
   
  ###### （4）Playcanvas 
  侧重于游戏引擎而不是渲染引擎，是一款优秀的全功能游戏引擎。但是私有项目收费，没有碰撞偏移，缺少示例。 
   
  ###### （5）Whs 
   
    
    
      使用简单，集成 Three.js 渲染引擎，rendering 渲染自动化，加速 3D 场景原型制作，based 基于组件的场景图 
     
    
    
      即使使用 Worker（多线程），也可以轻松集成任何高性能物理 
     
    
    
      基于 ES2015+，pack Webpack 友好 
     
   
   
  ###### （6）其他 
  A. Egret 白鹭、LayaAir 还有国内的一些引擎，当我们用中文搜索“游戏引擎”，一般都会推荐白鹭、LayaAir 这两个，它们的优点就是有专门的企业进行开发和维护，也可以花钱让其做定制化需求，并且支持多端开发。白鹭的话比较偏向于 2D，3D 是近几年开始在 2D 基础上迭代的。而 Laya 比较多的人用来做微信小游戏。不足的是，他们的社区不够活跃，文档更新不及时，对于开发者来说，开发体验不是非常友好。 
  B. oasis 去年淘宝开源 oasis，用于支付宝的蚂蚁庄园以及其他的一些互动游戏。现在已经有 3500 个 star 了，从它的官方文档上看，使用方式与 three 类似，API 比较简单，也具有基础的物理相关示例，还是比较实用小型、功能小的项目的。 
   
  ###### 7. 小程序 
  如果想要兼容微信小程序端，微信官方有Adapter的示例: Adapter | 微信开放文档[5] 
  有以下开源仓库，可供大家参考一下： 
   
    
     
     weapp-adapter 仓库 
     [6] 
     
    
     
     three-platformize 仓库 
     [7] 
     
    
     
     threejs-miniprogram 仓库 
     [8] 
     
   
   
   
  ### 参考资料 
  #####  
   
   [1]https://bruno-simon.com/: https://bruno-simon.com/ 
   [2]https://playcanv.as/p/RqJJ9oU9: https://playcanv.as/p/RqJJ9oU9 
   [3]Mercedes-EQ Formula E Team - Speedboard Game: https://www.mercedes-benz.com/storage/formula-e/2021-eq-house-digital-showroom/speedboard/20211129-v2.html 
   [4]Play Temple Run 2 on Poki: https://poki.com/en/g/temple-run-2# 
   [5]Adapter | 微信开放文档: https://developers.weixin.qq.com/minigame/dev/guide/best-practice/adapter.html 
   [6]weapp-adapter 仓库: https://github.com/finscn/weapp-adapter 
   [7]three-platformize 仓库: https://github.com/deepkolos/three-platformize 
   [8]threejs-miniprogram 仓库: https://github.com/wechat-miniprogram/threejs-miniprogram 
   [9]游戏引擎 - 维基百科: https://zh.wikipedia.org/wiki/%E6%B8%B8%E6%88%8F%E5%BC%95%E6%93%8E 
   [10]XR地产：VR、AR看房场景: https://zhuanlan.zhihu.com/p/370788498 
   [11]Choosing the right game engine: https://www.gdquest.com/tutorial/getting-started/learn-to/choosing-a-game-engine 
   [12]如何选择H5游戏引擎: https://cloud.tencent.com/developer/article/1073996 
   [13]JavaScript Game Engines: https://github.com/collections/javascript-game-engines 
   [14]HTML5 Game Engines: https://html5gameengine.com/ 
   [15]H5游戏开发：游戏引擎入门推荐: https://aotu.io/notes/2017/12/27/h5-game-engine-recommend/index.html 
   [16]Top 6 JavaScript and HTML5 game engines: https://blog.logrocket.com/top-6-javascript-and-html5-game-engines/ 
   [17]Top JS Gaming Engines and Libraries for 2020: https://blog.bitsrc.io/9-1.top-js-gaming-engines-and-libraries-for-2020-81707d9f095 
   
  
  
 
本文分享自微信公众号 - 凹凸实验室（AOTULabs）。如有侵权，请联系 support@oschina.cn 删除。本文参与“OSC源创计划”，欢迎正在阅读的你也加入，一起分享。
                                        