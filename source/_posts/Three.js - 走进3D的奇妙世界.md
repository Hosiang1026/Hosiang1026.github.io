---
title: 推荐系列-Three.js - 走进3D的奇妙世界
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 697
cover_picture: 'https://cdn.pixabay.com/photo/2017/05/08/13/15/spring-bird-2295436__480.jpg'
abbrlink: e1d7b329
date: 2021-04-14 07:56:10
---

&emsp;&emsp;摘要：本文将通过Three.js的介绍及示例带我们走进3D的奇妙世界。 文章来源：宜信技术学院 & 宜信支付结算团队技术分享第6期-支付结算部支付研发团队前端研发高级工程师-刘琳《three.js - 走进...
<!-- more -->

                                                                                                                                                                                        摘要：本文将通过Three.js的介绍及示例带我们走进3D的奇妙世界。 
 
随着人们对用户体验越来越重视，Web开发已经不满足于2D效果的实现，而把目标放到了更加炫酷的3D效果上。Three.js是用于实现web端3D效果的JS库，它的出现让3D应用开发更简单，本文将通过Three.js的介绍及示例带我们走进3D的奇妙世界。 
#### 一、Three.js相关概念 
##### 1.1 Three.JS 
Three.JS是基于WebGL的Javascript开源框架，简言之，就是能够实现3D效果的JS库。 
##### 1.2 WebGL 
WebGL是一种Javascript的3D图形接口，把JavaScript和OpenGL ES 2.0结合在一起。 
##### 1.3 OpenGL 
OpenGL是开放式图形标准，跨编程语言、跨平台，Javascript、Java 、C、C++ 、 python 等都能支持OpenG ，OpenGL的Javascript实现就是WebGL，另外很多CAD制图软件都采用这种标准。OpenGL ES 2.0是OpenGL的子集，针对手机、游戏主机等嵌入式设备而设计。 
##### 1.4 Canvas 
Canvas是HTML5的画布元素，在使用Canvas时，需要用到Canvas的上下文，可以用2D上下文绘制二维的图像，也可以使用3D上下文绘制三维的图像，其中3D上下文就是指WebGL。 
 
#### 二、Three.js应用场景 
利用Three.JS可以制作出很多酷炫的3D动画，并且Three.js还可以通过鼠标、键盘、拖拽等事件形成交互，在页面上增加一些3D动画和3D交互可以产生更好的用户体验。 
通过Three.JS可以实现全景视图，这些全景视图应用在房产、家装行业能够带来更直观的视觉体验。在电商行业利用Three.JS可以实现产品的3D效果，这样用户就可以360度全方位地观察商品了，给用户带来更好的购物体验。另外，使用Three.JS还可以制作类似微信跳一跳那样的小游戏。随着技术的发展、基础网络的建设，web3D技术还能得到更广泛的应用。 
 
#### 三、主要组件 
在Three.js中，有了场景（scene）、相机（camera）和渲染器（renderer） 这3个组建才能将物体渲染到网页中去。 
1）场景 
场景是一个容器，可以看做摄影的房间，在房间中可以布置背景、摆放拍摄的物品、添加灯光设备等。 
2）相机 
相机是用来拍摄的工具，通过控制相机的位置和方向可以获取不同角度的图像。 
3）渲染器 
渲染器利用场景和相机进行渲染，渲染过程好比摄影师拍摄图像，如果只渲染一次就是静态的图像，如果连续渲染就能得到动态的画面。在JS中可以使用requestAnimationFrame实现高效的连续渲染。 
##### 3.1 常用相机 
 
1）透视相机 
透视相机模拟的效果与人眼看到的景象最接近，在3D场景中也使用得最普遍，这种相机最大的特点就是近大远小，同样大小的物体离相机近的在画面上显得大，离相机远的物体在画面上显得小。透视相机的视锥体如上图左侧所示，从近端面到远端面构成的区域内的物体才能显示在图像上。 
透视相机构造器 
PerspectiveCamera( fov : Number, aspect : Number, near : Number, far : Number ) 
 
 fov — 摄像机视锥体垂直视野角度 
 aspect — 摄像机视锥体长宽比 
 near — 摄像机视锥体近端面 
 far — 摄像机视锥体远端面 
 
2）正交相机 
使用正交相机时无论物体距离相机远或者近，在最终渲染的图片中物体的大小都保持不变。正交相机的视锥体如上图右侧所示，和透视相机一样，从近端面到远端面构成的区域内的物体才能显示在图像上。 
正交相机构造器 
OrthographicCamera( left : Number, right : Number, top : Number, bottom : Number, near : Number, far : Number ) 
 
 left — 摄像机视锥体左侧面 
 right — 摄像机视锥体右侧面 
 top — 摄像机视锥体上侧面 
 bottom — 摄像机视锥体���侧面 
 near — 摄像机视锥体近端面 
 far — 摄像机视锥体远端面 
 
##### 3.2 坐标系 
在场景中，可以放物品、相机、灯光，这些东西放置到什么位置就需要使用坐标系。Three.JS使用右手坐标系，这源于OpenGL默认情况下，也是右手坐标系。从初中、高中到大学的课堂上，教材中所涉及的几何基本都是右手坐标系。 
 
上图右侧就是右手坐标系，五指并拢手指放平，指尖指向x轴的正方向，然后把四个手指垂直弯曲大拇指分开，并拢的四指指向y轴的正方向，大拇指指向的就是Z轴的正方向。 
在Three.JS中提供了坐标轴工具（THREE.AxesHelper），在场景中添加坐标轴后，画面会出现3条垂直相交的直线，红色表示x轴，绿色表示y轴，蓝色表示z轴（如下图所示）。 
 
##### 3.3 示例代码 
 ```java 
  /* 场景 */
var scene = new THREE.Scene();
scene.add(new THREE.AxesHelper(10)); // 添加坐标轴辅助线

/* 几何体 */
// 这是自定义的创建几何体方法，如果创建几何体后续会介绍
var kleinGeom = createKleinGeom(); 
scene.add(kleinGeom); // 场景中添加几何体

/* 相机 */
var camera = new THREE.PerspectiveCamera(45, width/height, 1, 100);
camera.position.set(5,10,25); // 设置相机的位置
camera.lookAt(new THREE.Vector3(0, 0, 0)); // 相机看向原点

/* 渲染器 */
var renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(width, height);
// 将canvas元素添加到body
document.body.appendChild(renderer.domElement);
// 进行渲染
renderer.render(scene, camera);

  ```  
#### 四、几何体 
计算机内的3D世界是由点组成，两个点能够组成一条直线，三个不在一条直线上的点就能够组成一个三角形面，无数三角形面就能够组成各种形状的几何体。 
 
以创建一个简单的立方体为例，创建简单的立方体需要添加8个顶点和12个三角形的面，创建顶点时需要指定顶点在坐标系中的位置，添加面的时候需要指定构成面的三个顶点的序号，第一个添加的顶点序号为0，第二个添加的顶点序号为1… 
创建立方体的代码如下： 
 ```java 
  var geometry = new THREE.Geometry();

// 添加8个顶点
geometry.vertices.push(new THREE.Vector3(1, 1, 1));
geometry.vertices.push(new THREE.Vector3(1, 1, -1));
geometry.vertices.push(new THREE.Vector3(1, -1, 1));
geometry.vertices.push(new THREE.Vector3(1, -1, -1));
geometry.vertices.push(new THREE.Vector3(-1, 1, -1));
geometry.vertices.push(new THREE.Vector3(-1, 1, 1));
geometry.vertices.push(new THREE.Vector3(-1, -1, -1));
geometry.vertices.push(new THREE.Vector3(-1, -1, 1));

// 添加12个三角形的面
geometry.faces.push(new THREE.Face3(0, 2, 1));
geometry.faces.push(new THREE.Face3(2, 3, 1));
geometry.faces.push(new THREE.Face3(4, 6, 5));
geometry.faces.push(new THREE.Face3(6, 7, 5));
geometry.faces.push(new THREE.Face3(4, 5, 1));
geometry.faces.push(new THREE.Face3(5, 0, 1));
geometry.faces.push(new THREE.Face3(7, 6, 2));
geometry.faces.push(new THREE.Face3(6, 3, 2));
geometry.faces.push(new THREE.Face3(5, 7, 0));
geometry.faces.push(new THREE.Face3(7, 2, 0));
geometry.faces.push(new THREE.Face3(1, 3, 4));
geometry.faces.push(new THREE.Face3(3, 6, 4));

  ```  
##### 4.1 正面和反面 
创建几何体的三角形面时，指定了构成面的三个顶点，如： new THREE.Face3(0, 2, 1)，如果把顶点的顺序改成0,1,2会有区别吗？ 
通过下图可以看到，按照0,2,1添加顶点是顺时针方向的，而按0,1,2添加顶点则是逆时针方向的，通过添加顶点的方���就可以判断当前看到的面是正面还是反面，如果顶点是逆时针方向添加，当前看到的面是正面，如果顶点是顺时针方向添加，则当前面为反面。 
下图所看到的面就是反面。如果不好记，可以使用右手沿顶点添加的方向握住，大拇指所在的面就是正面，很像我们上学时学的电磁感应定律。 
 
#### 五、材质 
创建几何体时通过指定几何体的顶点和三角形的面确定了几何体的形状，另外还需要给几何体添加皮肤才能实现物体的效果，材质就像物体的皮肤，决定了物体的质感。常见的材质有如下几种： 
 
 
 基础材质：以简单着色方式来绘制几何体的材质，不受光照影响。 
 深度材质：按深度绘制几何体的材质。深度基于相机远近端面，离近端面越近就越白，离远端面越近就越黑。 
 法向量材质：把法向量映射到RGB颜色的材质。 
 Lambert材质：是一种需要光源的材质，非光泽表面的材质，没有镜面高光，适用于石膏等表面粗糙的物体。 
 Phong材质：也是一种需要光源的材质，具有镜面高光的光泽表面的材质，适用于金属、漆面等反光的物体。 
 材质捕获：使用存储了光照和反射等信息的贴图，然后利用法线方向进行采样。优点是可以用很低的消耗来实现很多特殊风格的效果；缺点是仅对于固定相机视角的情况较好。 
 
下图是使用不同贴图实现的效果： 
 
#### 六、光源 
前面提到的光敏材质（Lambert材质和Phong材质）需要使用光源来渲染出3D效果，在使用时需要将创建的光源添加到场景中，否则无法产生光照效果。下面介绍一下常用的光源及特点。 
##### 6.1 点光源 
点光源类似蜡烛放出的光，不同的是蜡烛有底座，点光源没有底座，可以把点光源想象成悬浮在空中的火苗，点光源放出的光线来自同一点，且方向辐射向四面八方，点光源在传播过程中有衰弱，如下图所示，点光源在接近地面的位置，物体底部离点光源近，物体顶部离光源远，照到物体顶部的光就弱些，所以顶部会比底部暗些。 
 
##### 6.2 平行光 
平行光模拟的是太阳光，光源发出的所有光线都是相互平行的，平行光没有衰减，被平行光照亮的整个区域接受到的光强是一样的。 
 
##### 6.3 聚光灯 
类似舞台上的聚光灯效果，光源的光线从一个锥体中射出，在被照射的物体上产生聚光的效果。聚光灯在传播过程也是有衰弱的。 
 
##### 6.4 环境光 
环境光是经过多次反射而来的光，环境光源放出的光线被认为来自任何方向，物体无论法向量如何，都将表现为同样的明暗程度。 
 
环境光通常不会单独使用，通过使用多种光源能够实现更真实的光效，下图是将环境光与点光源混合后实现的效果，物体的背光面不像点光源那样是黑色的，而是呈现出深褐色，更自然。 
 
#### 七、纹理 
在生活中纯色的物体还是比较少的，更多的是有凹凸不平的纹路或图案的物体，要用Three.JS实现这些物体的效果，就需要使用到纹理贴图。3D世界的纹理是由图片组成的，将纹理添加在材质上以一定的规则映射到几何体上，几何体就有了带纹理的皮肤。 
##### 7.1 普通纹理贴图 
 
在这个示例中使用上图左侧的地球纹理，在球形几何体上进行贴图就能制作出一个地球。 
代码如下： 
 ```java 
  /* 创建地球 */
function createGeom() {
    // 球体
    var geom = new THREE.SphereGeometry(1, 64, 64);
    // 纹理
    var loader = new THREE.TextureLoader();
    var texture = loader.load('./earth.jpg');
    // 材质
    var material = new THREE.MeshLambertMaterial({
        map: texture
    });
    var earth = new THREE.Mesh(geom, material);
    return earth;
}

  ```  
##### 7.2 反面贴图实现全景视图 
 
这个例子是通过在球形几何体的反面进行纹理贴图实现的全景视图，实现原理是这样的：创建一个球体构成一个球形的空间，把相机放在球体的中心，相机就像在一个球形的房间中，在球体的里面（也就是反面）贴上图片，通过改变相机拍摄的方向，就能看到全景视图了。 
材质默认是在几何体的正面进行贴图的，如果想要在反面贴图，需要在创建材质的时候设置side参数的值为THREE.BackSide，代码如下： 
 ```java 
  /* 创建反面贴图的球形 */
// 球体
var geom = new THREE.SphereGeometry(500, 64, 64);
// 纹理
var loader = new THREE.TextureLoader();
var texture = loader.load('./panorama.jpg');
// 材质
var material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.BackSide
});
var panorama = new THREE.Mesh(geom, material);

  ```  
##### 7.3 凹凸纹理��图 
 
凹凸纹理利用黑色和白色值映射到与光照相关的感知深度，不会影响对象的几何形状，只影响光照，用于光敏材质（Lambert材质和Phong材质）。 
如果只用上图左上角的砖墙图片进行贴图的话，就像一张墙纸贴在上面，视觉效果很差，为了增强立体感，可以使用上图左下角的凹凸纹理，给物体增加凹凸不平的效果。 
凹凸纹理贴图使用方式的代码如下： 
 ```java 
  // 纹理加载器
var loader = new THREE.TextureLoader();
// 纹理
var texture = loader.load( './stone.jpg');
// 凹凸纹理
var bumpTexture = loader.load( './stone-bump.jpg');
// 材质
var material =  new THREE.MeshPhongMaterial( {
    map: texture,
    bumpMap: bumpTexture
} );

  ```  
##### 7.4 法线纹理贴图 
 
法线纹理也是通过影响光照实现凹凸不平视觉效果的，并不会影响物体的几何形状，用于光敏材质（Lambert材质和Phong材质）。上图左下角的法线纹理图片的RGB值会影响每个像素片段的曲面法线，从而改变物体的光照效果。 
使用方式的代码如下： 
 ```java 
  // 纹理
var texture = loader.load( './metal.jpg');
// 法线纹理
var normalTexture = loader.load( './metal-normal.jpg');
var material =  new THREE.MeshPhongMaterial( {
    map: texture,
    normalMap: normalTexture
} );

  ```  
##### 7.5 环境贴图 
 
环境贴图是将当前环境作为纹理进行贴图，能够模拟镜面的反光效果。在进行环境贴图时需要使用立方相机在当前场景中进行拍摄，从而获得当前环境的纹理。立方相机在拍摄环境纹理时，为避免反光效果的小球出现在环境纹理的画面上，需要将小球设为不可见。 
环境贴图的主要代码如下： 
 ```java 
  /* 立方相机 */
var cubeCamera = new THREE.CubeCamera( 1, 10000, 128 );
/* 材质 */
var material = new THREE.MeshBasicMaterial( {
    envMap: cubeCamera.renderTarget.texture
});
/* 镜面反光的球体 */
var geom = new THREE.SphereBufferGeometry( 10, 32, 16 );
var ball = new THREE.Mesh( geom, material );
// 将立方相机添加到球体
ball.add( cubeCamera );
scene.add( ball );

// 立方相机生成环境纹理前将反光小球隐藏
ball.visible = false;
// 更新立方相机，生成环境纹理
cubeCamera.update( renderer, scene );
balls.visible = true;

// 渲染
renderer.render(scene, camera);

  ```  
#### 八、加载外部3D模型 
Three.JS已经内置了很多常用的几何体，如：球体、立方体、圆柱体等等，但是在实际使用中往往需要用到一些特殊形状的几何体，这时可以使用3D建模软件制作出3D模型，导出obj、json、gltf等格式的文件，然后再加载到Three.JS渲染出效果。 
 
上图的椅子是在3D制图软件绘制出来的，chair.mtl是导出的材质文件，chair.obj是导出的几何体文件，使用材质加载器加载材质文件，加载完成后得到材质对象，给几何体加载器设置材质，加载后得到几何体对象，然后再创建场景、光源、摄像机、渲染器等进行渲染，这样就等得到如图的效果。主要的代码如下： 
 ```java 
  // .mtl材质文件加载器
var mtlLoader = new THREE.MTLLoader();
// .obj几何体文件加载器
var objLoader = new THREE.OBJLoader();

mtlLoader.load('./chair.mtl', function (materials) {
    objLoader.setMaterials(materials)
        .load('./chair.obj', function (obj) {
            scene.add(obj);
            …
        });
});

  ```  
#### ��、说明 
以上内容对Three.JS的基本使用进行了介绍，文中涉及到的示例源码已上传到github，感兴趣的同学可以下载查看，下载地址：https://github.com/liulinsp/three-demo。使用时如果有不清楚的地方可以查看Three.JS的官方文档：https://threejs.org/docs/index.html。
                                        