---
title: 推荐系列-面试官-请说说什么是BFC-大白话讲清楚
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 627
cover_picture: ''
abbrlink: 232d570d
date: 2021-04-15 09:15:42
---

&emsp;&emsp;BFC到底是什么东西 BFC 全称：Block Formatting Context， 名为 "块级格式化上下文"。 W3C官方解释为：BFC它决定了元素如何对其内容进行定位，以及与其它元素的关系和相互作用，当涉及到可视...
<!-- more -->

                                                                                                                                                                                        #### BFC到底是什么东西 
 ```java 
  BFC
  ```  全称： ```java 
  Block Formatting Context
  ``` ， 名为 "块级格式化上下文"。 
 ```java 
  W3C
  ``` 官方解释为： ```java 
  BFC
  ``` 它决定了元素如何对其内容进行定位，以及与其它元素的关系和相互作用，当涉及到可视化布局时， ```java 
  Block Formatting Context
  ``` 提供了一个环境， ```java 
  HTML
  ``` 在这个环境中按照一定的规则进行布局。 
简单来说就是， ```java 
  BFC
  ``` 是一个完全独立的空间（布局环境），让空间里的子元素不会影响到外面的布局。那么怎么使用 ```java 
  BFC
  ``` 呢， ```java 
  BFC
  ``` 可以看做是一个 ```java 
  CSS
  ``` 元素属性 
#### 怎样触发BFC 
这里简单列举几个触发 ```java 
  BFC
  ``` 使用的 ```java 
  CSS
  ``` 属性 
 
 overflow: hidden 
 display: inline-block 
 position: absolute 
 position: fixed 
 display: table-cell 
 display: flex 
 
#### BFC的规则 
 
  ```java 
  BFC
  ``` 就是一个块级元素，块级元素会在垂直方向一个接一个的排列 
  ```java 
  BFC
  ``` 就是页面中的一个隔离的独立容器，容器里的标签不会影响到外部标签 
 垂直方向的距离由margin决定， 属于同一个 ```java 
  BFC
  ``` 的两个相邻的标签外边距会发生重叠 
 计算 ```java 
  BFC
  ``` 的高度时，浮动元素也参与计算 
 
#### BFC解决了什么问题 
##### 1.使用Float脱离文档流，高度塌陷 
 ```java 
  <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>高度塌陷</title>
    <style>
        .box {
            margin: 100px;
            width: 100px;
            height: 100px;
            background: red;
            float: left;
        }
        .container {
            background: #000;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="box"></div>
        <div class="box"></div>
    </div>
</body>
</html>

  ```  
效果： 
![Test](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d86802070eda44a5a3c84c8ae1469e12~tplv-k3u1fbpfcp-zoom-1.image  '面试官-请说说什么是BFC-大白话讲清楚') 
可以看到上面效果给 ```java 
  box
  ``` 设置完 ```java 
  float
  ``` 结果脱离文档流，使 ```java 
  container
  ``` 高度没有被撑开，从而背景颜色没有颜色出来，解决此问题可以给 ```java 
  container
  ``` 触发 ```java 
  BFC
  ``` ，上面我们所说到的触发 ```java 
  BFC
  ``` 属性都可以设置。 
修改代码 
 ```java 
  <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>高度塌陷</title>
    <style>
        .box {
            margin: 100px;
            width: 100px;
            height: 100px;
            background: red;
            float: left;
        }
        .container {
            background: #000;
            display: inline-block;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="box"></div>
        <div class="box"></div>
    </div>
</body>
</html>

  ```  
效果： 
![Test](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d86802070eda44a5a3c84c8ae1469e12~tplv-k3u1fbpfcp-zoom-1.image  '面试官-请说说什么是BFC-大白话讲清楚') 
##### 2.Margin边距重叠 
 ```java 
  <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        .box {
            margin: 10px;
            width: 100px;
            height: 100px;
            background: #000;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="box"></div>
        <div class="box"></div>
    </div>
</body>
</html>

  ```  
效果： 
![Test](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d86802070eda44a5a3c84c8ae1469e12~tplv-k3u1fbpfcp-zoom-1.image  '面试官-请说说什么是BFC-大白话讲清楚') 
可以看到上面我们为两个盒子的 ```java 
  margin
  ``` 外边距设置的是 ```java 
  10px
  ``` ，可结果显示两个盒子之间只有 ```java 
  10px
  ``` 的距离，这就导致了 ```java 
  margin
  ``` 塌陷问题，这时 ```java 
  margin
  ``` 边距的结果为最大值，而不是合，为了解决此问题可以使用 ```java 
  BFC
  ``` 规则（为元素包裹一个盒子形成一个完全独立的空间，做到里面元素不受外面布局影响），或者简单粗暴方法一个设置 ```java 
  margin
  ``` ，一个设置 ```java 
  padding
  ``` 。 
修改代码 
 ```java 
  <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Margin边距重叠</title>
    <style>
        .box {
            margin: 10px;
            width: 100px;
            height: 100px;
            background: #000;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="box"></div>
        <p><div class="box"></div></p>
    </div>
</body>
</html>

  ```  
效果： 
![Test](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d86802070eda44a5a3c84c8ae1469e12~tplv-k3u1fbpfcp-zoom-1.image  '面试官-请说说什么是BFC-大白话讲清楚') 
##### 3.两栏布局 
 ```java 
  <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>两栏布局</title>
    <style>
            div {
                 width: 200px;
                 height: 100px;
                 border: 1px solid red;
            }

    </style>
</head>
<body>
    <div style="float: left;">
        两栏布局两栏布局两栏布局两栏布局两栏布局两栏布局两栏布局两栏布局两栏布局两栏布局两栏布局两栏布局两栏布局
    </div>
    <div style="width: 300px;">
        我是蛙人，如有帮助请点个赞叭，如有帮助请点个赞叭，如有帮助请点个赞叭，如有帮助请点个赞叭，如有帮助请点个赞叭，如有帮助请点个赞叭
    </div>
</body>
</html>

  ```  
效果： 
![Test](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d86802070eda44a5a3c84c8ae1469e12~tplv-k3u1fbpfcp-zoom-1.image  '面试官-请说说什么是BFC-大白话讲清楚') 
可以看到上面元素，第二个 ```java 
  div
  ``` 元素为 ```java 
  300px
  ``` 宽度，但是被第一个 ```java 
  div
  ``` 元素设置 ```java 
  Float
  ``` 脱离文档流给覆盖上去了，解决此方法我们可以把第二个 ```java 
  div
  ``` 元素设置为一个 ```java 
  BFC
  ``` 。 
修改代码 
 ```java 
  <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>两栏布局</title>
    <style>
            div {
                 width: 200px;
                 height: 100px;
                 border: 1px solid red;
            }

    </style>
</head>
<body>
    <div style="float: left;">
        两栏布局两栏布局两栏布局两栏布局两栏布局两栏布局两栏布局两栏布局两栏布局两栏布局两栏布局两栏布局两栏布局
    </div>
    <div style="width: 300px;display:flex;">
        我是蛙人，如有帮助请点个赞叭，如有帮助请点个赞叭，如有帮助请点个赞叭，如有帮助请点个赞叭，如有帮助请点个赞叭，如有帮助请点个赞叭
    </div>
</body>
</html>

  ```  
效果： 
![Test](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d86802070eda44a5a3c84c8ae1469e12~tplv-k3u1fbpfcp-zoom-1.image  '面试官-请说说什么是BFC-大白话讲清楚') 
#### 结语 
谢谢你读完本篇文章，希望对你能有所帮助，如有问题欢迎各位指正。 
我是蛙人(✿◡‿◡)，如果觉得写得可以的话，请点个赞吧❤。 
感兴趣的小伙伴可以加入 [ 前端娱乐圈交流群 ] 欢迎大家一起来交流讨论 
写作不易，「点赞」+「在看」+「转发」 谢谢支持❤ 
#### 往期好文 
《分享15个Webpack实用的插件！！！》 
《手把手教你写一个Vue组件发布到npm且可外链引入使用》 
《分享12个Webpack中常用的Loader》 
《聊聊什么是CommonJs和Es Module及它们的区别》 
《带你轻松理解数据结构之Map》 
《这些工作中用到的JavaScript小技巧你都知道吗？》 
《【建议收藏】分享一些工作中常用的Git命令及特殊问题场景怎么解决》 
#### 参考 
https://blog.csdn.net/weixin_43213962/article/details/105959869 
https://blog.csdn.net/sinat_36422236/article/details/88763187
                                        