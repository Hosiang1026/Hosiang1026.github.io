---
title: 推荐系列-关于从入门 three.js 到做出 3d 地球这件事
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 417
cover_picture: 'https://oscimg.oschina.net/oscnet/e2bcd1c6-76ff-41b0-9c99-1c50ad543fc9.png'
abbrlink: 95d8ca5b
date: 2021-04-15 10:04:00
---

&emsp;&emsp;转载自：lulu_up https://segmentfault.com/a/1190000039647481 开篇介绍 如果你没接触过3d可视化技术, 你也许会认为可视化非常难, 光是一个物体的阴影要如何计算就相当复杂, 但是告诉你个好...
<!-- more -->

                                                                                                                                                                                         
 转载自：lulu_up 
 https://segmentfault.com/a/1190000039647481 
  
   
  ##### 开篇介绍 
  如果你没接触过3d可视化技术, 你也许会认为可视化非常难, 光是一个物体的阴影要如何计算就相当复杂, 但是告诉你个好消息, 阴影的计算都是集成好的, 而我们只要设置好光源的位置,绘制好物体就可以了, 真的没有想象中那么复杂, 本文面向有前端基础,但零可视化基础的同学, 我会从最基础的入门知识说起。 
  学习可视化方面的技术会让我们对计算机, 对前端技术有更深的理解, 还可以做出更多有趣味的东西来, 本文是我踩了好多坑后总结出来的, 我更清楚一个初入门的小白哪里不懂。 
   
 ```java 
  three.js
  ``` 
  是  
 ```java 
  webgl
  ``` 
  的第三方库, 它更适合不太复杂的可视化项目, 而我们要做的3d地球项目使用它来做会更简单, 所以选择了它, 放心后面也会说 
 ```java 
  webgl
  ``` 
 相关知识 。 
  当前效果如下:![Test](https://oscimg.oschina.net/oscnet/e2bcd1c6-76ff-41b0-9c99-1c50ad543fc9.png  '关于从入门 three.js 到做出 3d 地球这件事') 
   
  ##### 一. 关于此系列文章 
   
    
     
      
 ```java 
  自食其力:
  ``` 
 不管是在公司还是网上都有类似的库, 但是当遇到bug或是缺少功能的情况时就会很麻烦, 例如我们公司的FGL库(一个内网绘制3d景象的技术), 它官网上的例子很多都是错的, 使用起来也是一堆问题, 比如无法精准选择某个国家, 点击事件消融等bug。还比如说 
      
 ```java 
  Echarts
  ``` 
 的地球, 它太注重真实感并且用起来有点卡, 以及交互做的不太好。 
     
    
     
      
 ```java 
  直指核心:
  ``` 
  去年我通过看书、看文章、看视频认真的学习 
      
 ```java 
  three.js
  ``` 
 , 并做出了3d地球这个项目, 而这个系列文章将会直指做出3d地图的核心知识, 尽量不随意扩散知识面。 
     
    
     
      
 ```java 
  更好入门:
  ``` 
  网上的教学文章千篇一律, 点进去阅读完感觉其对于一个 
      
 ```java 
  three.js
  ``` 
 零基础的同学来说都不太好懂, 教学视频里的知识点太广泛, 事无巨细的罗列, 而这个系列文章将更突出绘制3d地球这个重点。 
     
    
     
      
 ```java 
  同道中人:
  ``` 
  我学习 
      
 ```java 
  three.js
  ``` 
 就是为了做出3d地球, 期间走了不少弯路, 被某些问题卡了很久, 所以我更懂一个刚入门的人困惑的点在哪里。 
     
    
     
      
 ```java 
  专注vue:
  ``` 
  市面上较少专门针对 
      
 ```java 
  vue
  ``` 
 做到开箱即用的3d地球插件, 而我们就要编写这���一款产品。 
     
    
     
      
 ```java 
  不断学习:
  ``` 
  编写文章也是我提高自己能力的一种方法, 死磕每个知识点让自己的理解更上一层楼。 
     
   
   
  ##### 二. 任务目标 
   
    
    
      入门 
      
 ```java 
  three.js
  ``` 
 技术。 
     
    
    
      绘制出3d地球。 
     
    
    
      做成专门 
      
 ```java 
  vue
  ``` 
 使用的库。 
     
    
    
      后期也会介绍 
      
 ```java 
  着色器
  ``` 
 的概念与基本的使用技巧。 
     
    
    
      会介绍少量 
      
 ```java 
  webgl
  ``` 
 的相关用法, 并且会有部分数学知识。 
     
   
   
  ##### 三. 文章主线剧情与支线任务 
   
    
    
      主线剧情: 围绕着如何做出3d地球, 这部分在vue工程里面进行。 
     
    
    
      支线任务: 每个分散的知识点, 可能与3d地球没关系, 但是它能帮助我们更好的理解3d技术, 而这些知识点我就不在vue项目里面演示了, 会单独创建一个html文件来演示说明。 
     
   
   
  ##### 四. 理解坐标系: 别着急写代码先有基本模型 
  像绘制图形这类技术, 最基本的概念就坐标系, 下图是 
 ```java 
  二维坐标系
  ``` 
 , 我们的故事就从这个家伙开始。![Test](https://oscimg.oschina.net/oscnet/e2bcd1c6-76ff-41b0-9c99-1c50ad543fc9.png  '关于从入门 three.js 到做出 3d 地球这件事')     我们用 
 ```java 
  (0, 0)
  ``` 
 表示坐标的中心点, 绘制一条起点为中心点长度为1的线段可以使用  
 ```java 
  (0, 0) (1, 0)
  ``` 
 这两个点相连表示。 
   
  关于向量的概念后面需要用数学知识的时候再介绍, 前几篇文章就越通俗越好。 
  在 
 ```java 
  three.js
  ``` 
 中我们要打交道的就是下面这位 
 ```java 
  三维坐标系
  ``` 
 ![Test](https://oscimg.oschina.net/oscnet/e2bcd1c6-76ff-41b0-9c99-1c50ad543fc9.png  '关于从入门 three.js 到做出 3d 地球这件事')     他的坐标原点就是 
 ```java 
  (0, 0, 0)
  ``` 
 , 绘制一条起点为中心点的长度为1的线段可以是  
 ```java 
  (0, 0, 0) (1, 0, 0)
  ``` 
 。 
  这里要记住,  
 ```java 
  three.js
  ``` 
 里面设置的默认坐标系就是这种形式 
 ```java 
  x向右, y向上, z向前
  ``` 
 , 之所以说是默是因为它可以修改。 
  上图中, 观看这个三维坐标系的目光其实是在斜上方, 正常情况下在我们开发的时候 
 ```java 
  z轴
  ``` 
 是正对着我们的眼睛的, 所以你只能看到 
 ```java 
  z轴
  ``` 
 是一个点,![Test](https://oscimg.oschina.net/oscnet/e2bcd1c6-76ff-41b0-9c99-1c50ad543fc9.png  '关于从入门 three.js 到做出 3d 地球这件事') 
   
  在开发与学习的时候, 最好先把坐标系绘制到页面上, 方便我们更好的绘制。 
   
  ##### 五. 相机的概念 
  假设现在我们的正前方有一个 
 ```java 
  三维坐标系
  ``` 
 的全息投影, 那么此时你的眼睛就相当于一架相机, 你看到的  
 ```java 
  坐标系
  ``` 
 景象取决于你站的位置。 
  在 
 ```java 
  three.js
  ``` 
 中就有这样一个对象, 他就是负责从哪个角度观察我们绘制的3d世界, 也就是 
 ```java 
  相机
  ``` 
 这个概念的由来。 
  相机分为两种, 正投影相机和透视投影相机, 正投影相机就是你站的多远你看到的物体的大小都不变, 透视投影相机就是物体会 
 ```java 
  近大远小
  ``` 
 , 下面是张引用图 (图片来自网络)。 
   
   ![Test](https://oscimg.oschina.net/oscnet/e2bcd1c6-76ff-41b0-9c99-1c50ad543fc9.png  '关于从入门 three.js 到做出 3d 地球这件事') 
   
  正投影相机可以用在 
 ```java 
  工程制图
  ``` 
 上, 或者可以做一些视觉欺骗小游戏。 
   
  本文主要目的是绘制3d地球所以主要使用透视投影相机 
   
  ##### 六. 绘制坐标系, 安放摄像机 (代码安排上) 
  引入 
 ```java 
  three.js
  ``` 
 , 可以把包下载到本地, 也可以直接获取在cdn上的资源, 引入之后全局会出现 
 ```java 
  THREE
  ``` 
 对象, 我们就可以开始编程之旅了。 
   
 ```java 
  <script src="https://cdn.bootcdn.net/ajax/libs/three.js/r122/three.min.js"></script>
  ``` 
  
  一个普普通通的html空文件的script标签里面, 发生着这样的故事: 让我们逐句解析 
   
  第一步:创建场景, 也就是虚拟的空间 
  我们之后绘制的 
 ```java 
  3d物体
  ``` 
 都要放入这个空间里面, 你可以把它当做一个鸿蒙空间神器, 里面有一个小世界, 而我们是掌控者(很中二)。 
   
 ```java 
  const scene = new THREE.Scene();
  ``` 
  
   
  第二步:创建相机 
  相机的概念上面讲述过了,  
 ```java 
  PerspectiveCamera
  ``` 
 这个类就是 
 ```java 
  透视投影相机
  ``` 
 , 我们来逐个攻破他参数的意思。 
   
    
     
      
 ```java 
  35
  ``` 
 : 
      
 ```java 
  视角
  ``` 
 也就是我们左眼与右眼可以看到的横向角度, 其越小物体则越大, 因为目光变狭窄会突出物体, 你可以做一个实验, 聚精会神的盯着看一个物体, 你就会发现此时你左右两边本来靠余光可以看到的物体你现在看不清, 这个就是你的视角变小了, 变小视角还可以使目标物体比例变大, 我们知道这些就够理解这个数字了, 后期可以利用这个原理做一些令人惊讶的动画特效。 
     
    
     
      
 ```java 
  window.innerWidth / window.innerHeight
  ``` 
 : 纵横比 
      
 ```java 
  宽/高
  ``` 
 , 这里宽高不会去写 
      
 ```java 
  px
  ``` 
 这种单位, 坐标系里面是一种抽象的长度单位, 所以要告诉浏览器咱们当前显示图像的区域的宽高比例(可以当它是百分比布局, 就像我们写css布局时使用 
      
 ```java 
  vh
  ``` 
  
      
 ```java 
  vw
  ``` 
 为单位)。 
     
    
     
      
 ```java 
  1
  ``` 
 : 
      
 ```java 
  近平面
  ``` 
 , 简单理解就是当一个 
      
 ```java 
  图像
  ``` 
 距离 
      
 ```java 
  相机
  ``` 
 的距离小于1的时候, 就不显示这个图像了。 
     
    
     
      
 ```java 
  1000
  ``` 
 : 
      
 ```java 
  远平面
  ``` 
 , 简单理解就是当一个 
      
 ```java 
  图像
  ``` 
 距离 
      
 ```java 
  相机
  ``` 
 的距离大于1000的时候, 就不显示这个图像了。 
     
    
     
      
 ```java 
  camera.position.z = 10;
  ``` 
  相机的坐标不设置的话, 默认就是(0, 0, 0)坐标原点, 这样类似脑袋在坐标轴原点上看坐标轴, 所以这里要设置距离坐标中心有一定距离, 也就是远距离观察这个坐标系。 
     
   
   
 ```java 
  const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 1000);camera.position.z = 10;
  ``` 
  
   
    
    
      无聊的知识: 我们在玩 
      
 ```java 
  3d游戏
  ``` 
 的时候, 是不是有时候与另一个游戏人物距离太近了就会出现 
      
 ```java 
  人物中空
  ``` 
 的效果, 这些很可能就是他的某些部分距离你相机的距离, 小于了 
      
 ```java 
  近平面
  ``` 
 的距离导致的。 
     
    
    
      物体距离眼睛越近越大, 越远越小, 因为一个物品无限大与无限远没有意义, 显示起来浪费性能, 所以才会设置近平面与远平面。 
     
    
     
      
     
   
   
  第三步:生成渲染实例 
   
    
     
      
 ```java 
  WebGLRenderer
  ``` 
 生成一个渲染实例, 用来渲染我们所有的3d效果。 
     
    
     
      
 ```java 
  setSize
  ``` 
 设置场景的宽高。 
     
    
     
      
 ```java 
  setClearColor
  ``` 
 设置背景色, 这个背景色不是平面的, 是全方位的, 你可以想想成你在一个屋子里, 这个颜色就是屋子墙壁、地板、天花板的颜色(.5是透明度)。 
     
    
     
      
 ```java 
  renderer.domElement
  ``` 
 生成的渲染的实例, 这个要放到对应的dom容器里面(是个canvas标签)。 
     
   
   
 ```java 
  const renderer = new THREE.WebGLRenderer();renderer.setSize(window.innerWidth, window.innerHeight);renderer.setClearColor(0x00FFFF, .5)document.body.appendChild(renderer.domElement);
  ``` 
  
   
    
    
      知识点: 
      
 ```java 
  setClearColor
  ``` 
 不写就是黑色 
     
    
    
      知识点: 
      
 ```java 
  setClearColor
  ``` 
 可以直接写"red"这种, 不用必须16进制。 
     
   
   
  第四步:插入坐标系实例 
   
    
     
      
 ```java 
  AxisHelper
  ``` 
 : 用于生成辅助坐标实例, 
      
 ```java 
  2
  ``` 
 代表这个坐标系的长度, 因为我们不一定需要多长的辅助线。 
     
    
     
      
 ```java 
  scene
  ``` 
 : 老朋友 
      
 ```java 
  场景
  ``` 
 , 它的 
      
 ```java 
  add
  ``` 
 方法就是把某某某加入到场景中来。 
     
   
   
 ```java 
  const axisHelper = new THREE.AxisHelper(2)scene.add(axisHelper)
  ``` 
  
   
  第五步:渲染出来 
   
    
    
      第一个参数是 
      
 ```java 
  场景
  ``` 
 , 第二个参数是 
      
 ```java 
  相机
  ``` 
 。 
     
   
   
 ```java 
  renderer.render(scene, camera);
  ``` 
  
  下面是效果图, z轴正对着我们所以看不到:![Test](https://oscimg.oschina.net/oscnet/e2bcd1c6-76ff-41b0-9c99-1c50ad543fc9.png  '关于从入门 three.js 到做出 3d 地球这件事') 
  在斜上方看到是如下的效果, 之后的章节会说如何调整相机的位置与角度![Test](https://oscimg.oschina.net/oscnet/e2bcd1c6-76ff-41b0-9c99-1c50ad543fc9.png  '关于从入门 three.js 到做出 3d 地球这件事') 
  完整的代码如下 
   
 ```java 
  <html><body>    <script src="https://cdn.bootcdn.net/ajax/libs/three.js/r122/three.min.js"></script>    <script>        const scene = new THREE.Scene();        const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 1000);        camera.position.z = 10;        const renderer = new THREE.WebGLRenderer();        renderer.setSize(window.innerWidth, window.innerHeight);        renderer.setClearColor(0x00FFFF, .5)        document.body.appendChild(renderer.domElement);        const axisHelper = new THREE.AxisHelper(2)        scene.add(axisHelper)        renderer.render(scene, camera);    </script></body></html>
  ``` 
  
   
  ##### 七. 第一个立方体 
  不画一个立方体感觉对不起  
 ```java 
  第一篇
  ``` 
 这个题目, 要注意了在 
 ```java 
  three.js
  ``` 
 中你可以理解为绘制一个几何体需要两部分, 一个是 
 ```java 
  几何体
  ``` 
 本身, 比如这个几何体的长宽高, 另一个就是 
 ```java 
  材质
  ``` 
 可以简单理解为表面的颜色样式。      
 ```java 
  geometry
  ``` 
 这个单词我们会经常打交道的, 来一起记下它吧。 
   
   ![Test](https://oscimg.oschina.net/oscnet/e2bcd1c6-76ff-41b0-9c99-1c50ad543fc9.png  '关于从入门 three.js 到做出 3d 地球这件事') 
   
   
   
 ```java 
  BoxGeometry
  ``` 
  长方体 
   
 ```java 
  const geometry = new THREE.BoxGeometry(1, 2, 3);
  ``` 
  
   
    
     
      
 ```java 
  1:
  ``` 
  '长', 也可以理解为在不设置坐标的时候在x轴上的长度。 
     
    
     
      
 ```java 
  2:
  ``` 
  '高', 也可以理解为在不设置坐标的时候在y轴上的长度。 
     
    
     
      
 ```java 
  3:
  ``` 
  '宽', 也可以理解为在不设置坐标的时候在z轴上的长度。 
     
   
  new出来的实例上面会有这个几何体的点的信息, 面的信息等等, 这个后面再详细说这次主要入门。 
   
   
 ```java 
  MeshBasicMaterial
  ``` 
  材质 
  颜色与上面设置 
 ```java 
  setClearColor
  ``` 
 一样, 什么写法都行的, 下面是我设置了一个红色的材质。 
 ```java 
  const material = new THREE.MeshBasicMaterial({ color: 'red' });
  ``` 
  
   
  生成'网格'  
 ```java 
  Mesh
  ``` 
  
   
 ```java 
  const cube = new THREE.Mesh(geometry, material);
  ``` 
 网格上含有位置信息、旋转信息、缩放信息等等, 他需要用 
 ```java 
  几何体
  ``` 
 �� 
 ```java 
  材质
  ``` 
 两个参数, 但其实并不像网上说的必须要有材质, 不传材质也能显示。 
   
  放入场景 
  也就是场景对象 
 ```java 
  scene
  ``` 
 本身有个 
 ```java 
  add
  ``` 
 方法。 
 ```java 
  scene.add(cube);
  ``` 
  
  ![Test](https://oscimg.oschina.net/oscnet/e2bcd1c6-76ff-41b0-9c99-1c50ad543fc9.png  '关于从入门 three.js 到做出 3d 地球这件事')右上方视角![Test](https://oscimg.oschina.net/oscnet/e2bcd1c6-76ff-41b0-9c99-1c50ad543fc9.png  '关于从入门 three.js 到做出 3d 地球这件事') 
   
  放入场景的几种方式 
  1: 我直接放入 
 ```java 
  geometry
  ``` 
  
 ```java 
  scene.add(geometry);
  ``` 
  会报错了, 可以理解为不是网格对象所以报错了。以后遇到这类报错一定要考虑类型问题。![Test](https://oscimg.oschina.net/oscnet/e2bcd1c6-76ff-41b0-9c99-1c50ad543fc9.png  '关于从入门 three.js 到做出 3d 地球这件事') 
  2: 未设置 
 ```java 
  材质
  ``` 
  
   
 ```java 
  const cube = new THREE.Mesh(geometry);scene.add(cube);
  ``` 
  
  ![Test](https://oscimg.oschina.net/oscnet/e2bcd1c6-76ff-41b0-9c99-1c50ad543fc9.png  '关于从入门 three.js 到做出 3d 地球这件事')![Test](https://oscimg.oschina.net/oscnet/e2bcd1c6-76ff-41b0-9c99-1c50ad543fc9.png  '关于从入门 three.js 到做出 3d 地球这件事') 
  白白的一片, 并且控制台没有报错。 
   
  ##### 八. 全部代码 
   
 ```java 
  <html><body>    <script src="https://cdn.bootcdn.net/ajax/libs/three.js/r122/three.min.js"></script>    <script src="./utils/OrbitControls.js"></script>    <script>        const scene = new THREE.Scene();        const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 1000);        camera.position.z = 10;        const renderer = new THREE.WebGLRenderer();        renderer.setSize(window.innerWidth, window.innerHeight);        renderer.setClearColor(0x00FFFF, .5)        document.body.appendChild(renderer.domElement);        const axisHelper = new THREE.AxisHelper(2)        scene.add(axisHelper)        const geometry = new THREE.BoxGeometry(1, 2, 3);        const material = new THREE.MeshBasicMaterial({ color: 'red' });        const cube = new THREE.Mesh(geometry, material);        scene.add(cube);        renderer.render(scene, camera);    </script></body></html>
  ``` 
  
   
  ##### end 
  第一篇写的内容并不多, 等基本知识储备够了就可以开始编写 
 ```java 
  3d地球
  ``` 
 了, 那里将会很有意思。希望与你一起进步。 
  
  
 #### 最后 
 
   欢迎关注【前端瓶子君】✿✿ヽ(°▽°)ノ✿ 
   
  
  
  回复「 
  算法 
  」，加入前端算法源码编程群，每日一刷（工作日），每题瓶子君都会很认真的解答哟！ 
   
  
  
  回复「交流」，吹吹水、聊聊技术、吐吐槽！ 
  
  
  回复「 
  阅读 
  」，每日刷刷高质量好文！ 
  
  
  如果这篇文章对你有帮助，「在看」是最大的支持 
  
  
  ![Test](https://oscimg.oschina.net/oscnet/e2bcd1c6-76ff-41b0-9c99-1c50ad543fc9.png  '关于从入门 three.js 到做出 3d 地球这件事') 
  
  
  》》面试官也在看的算法资料《《 
  
  
   
    
     
      
      “在看和转发” 
      就是最大的支持 
      
     
    
   
  
 
本文分享自微信公众号 - 前端瓶子君（pinzi_com）。如有侵权，请联系 support@oschina.cn 删除。本文参与“OSC源创计划”，欢迎正在阅读的你也加入，一起分享。
                                        