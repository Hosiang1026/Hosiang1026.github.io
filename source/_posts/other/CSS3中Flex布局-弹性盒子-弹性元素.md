---
title: 推荐系列-CSS3中Flex布局-弹性盒子-弹性元素
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 2037
cover_picture: 'https://oscimg.oschina.net/oscnet/up-458c0e15734cc9d95787e4906585b9a6518.png'
abbrlink: c76bb171
date: 2021-04-15 09:46:45
---

&emsp;&emsp;CSS3中的 flex 属性，在布局方面做了非常大的改进，使得我们对多个元素之间的布局排列变得十分灵活，适应性非常强。其强大的伸缩性和自适应性，在网页开中可以发挥极大的作用。 Flex布局初体...
<!-- more -->

                                                                                                                                                                                        ![Test](https://oscimg.oschina.net/oscnet/up-458c0e15734cc9d95787e4906585b9a6518.png  'CSS3中Flex布局-弹性盒子-弹性元素') 
CSS3中的 flex 属性，在布局方面做了非常大的改进，使得我们对多个元素之间的布局排列变得十分灵活，适应性非常强。其强大的伸缩性和自适应性，在网页开中可以发挥极大的作用。 
 
默认文档流中，在一个父容器里放置多个块级的子元素，那么，这些子元素会默认从上往下排列 ![Test](https://oscimg.oschina.net/oscnet/up-458c0e15734cc9d95787e4906585b9a6518.png  'CSS3中Flex布局-弹性盒子-弹性元素') 
在此基础之上，如果我给父容器仅仅加一个  
 ```java 
  display: flex
  ``` 
 属性，此时，这些子元素的布局会摇身一变： 
![Test](https://oscimg.oschina.net/oscnet/up-458c0e15734cc9d95787e4906585b9a6518.png  'CSS3中Flex布局-弹性盒子-弹性元素') 
子元素们会在水平方向上，从左至右排列，到此为止，你已经掌握了关于 flex 的一半的知识。 
 
1、flex 布局的子元素不会脱离文档流，很好地遵从了“流的特性”。 
但你如果用 float 来做布局，float 属性的元素会脱离文档流，而且会涉及到各种 BFC、清除浮动的问题。浮动相关的问题，比较麻烦，所以也成了面试必问的经典题目。但有了 flex 布局之后，这些问题都不存在的。 
2、flex 是一种现代的布局方式，是 W3C 第一次提供真正用于布局的 CSS 规范。 flex 非常提供了丰富的属性，非常灵活，让布局的实现更佳多样化，且方便易用。 
 
flex 唯一的缺点就在于，它不支持低版本的 IE 浏览器。 
![Test](https://oscimg.oschina.net/oscnet/up-458c0e15734cc9d95787e4906585b9a6518.png  'CSS3中Flex布局-弹性盒子-弹性元素') 
 
 flex 布局不支持 IE9 及以下的版本； 
 IE10及以上也只是部分支持。 
 
如果你的页面不需要处理 IE浏览器的兼容性问题，则可以放心大胆地使用 flex 布局。 
但是，比如网易新闻、淘宝这样的大型网站，���对的是海量用户，即便使用低版本浏览器的用户比例很少，但绝对基数仍然是很庞大的。因此，这些网站为了兼容低版本的 IE 浏览器，暂时还不敢尝试使用 flex 布局。 
 
在讲 flex 的知识点之前，我们事先约定两个概念： 
 
  弹性盒子：指的是使用  
 ```java 
  display:flex
  ``` 
  或  
 ```java 
  display:inline-flex
  ``` 
  声明的父容器。  
  子元素/弹性元素：指的是父容器里面的子元素们（父容器被声明为 flex 盒子的情况下）。  
 
 
弹性盒子里面的子元素们，默认是从左至右排列的，这个方向，代表的就是主轴的方向。 
在此，我们引入主轴和侧轴的概念。 
![Test](https://oscimg.oschina.net/oscnet/up-458c0e15734cc9d95787e4906585b9a6518.png  'CSS3中Flex布局-弹性盒子-弹性元素') 
如上图所示： 
 
  主轴：flex容器的主轴，默认是水平方向，从左向右。  
  侧轴：与主轴垂直的轴称作侧轴，默认是垂直方向，从上往下。  
 
PS：主轴和侧轴并不是固定不变的，可以通过  
 ```java 
  flex-direction
  ``` 
  更换方向，我们在后面会讲到。 
 
##### 声明定义 
使用  
 ```java 
  display:flex
  ``` 
  或  
 ```java 
  display:inline-flex
  ``` 
  声明一个父容器为弹性盒子。此时，这个父容器里的子元素们，会遵循弹性布局。 
备注：一般是用  
 ```java 
  display:flex
  ``` 
 这个属性。 
 ```java 
  display:inline-flex
  ``` 
 用得较少。 
##### flex-direction 属性 
 
 ```java 
  flex-direction
  ``` 
 ：用于设置盒子中子元素的排列方向。属性值可以是： 
 
  
   
   属性值 
   描述 
   
  
  
   
   row 
   从左到右水平排列子元素（默认值） 
   
   
   column 
   从上到下垂直排列子元素 
   
   
   row-reverse 
   从右向左排列子元素 
   
   
   column-reverse 
   从下到上垂直排列子元素 
   
  
 
备注：如果我们不给父容器写 
 ```java 
  flex-direction
  ``` 
 这个属性，那么，子元素默认就是从左到右排列的。 
代码演示： 
 
 ```java 
  <!DOCTYPE html>
<html>
<head lang="en">
    <meta charset="UTF-8">
    <title></title>
    <style>
        *{
            margin: 0;
            padding: 0;
            list-style: none;
        }
       body{
           background-color: #eee;
           font-family: "Microsoft Yahei";
           font-size:22px;
       }

        h3{
            font-weight: normal;
        }
        section{
            width: 1000px;

            margin:40px auto;
        }

        ul{
            background-color: #fff;
            border: 1px solid #ccc;

        }

        ul li{
            width: 200px;
            height: 200px;
            background-color: pink;
            margin:10px;
        }
        section:nth-child(1) ul{
            overflow: hidden; /* 清除浮动 */
        }
        section:nth-child(1) ul li{
            float: left;
        }
        /* 设置伸缩盒子*/
        section:nth-child(2) ul{
            display: flex;
        }

        section:nth-child(3) ul{
            /* 设置伸缩布局*/
            display: flex;
            /* 设置主轴方向*/
            flex-direction: row;
        }

        section:nth-child(4) ul{
            /* 设置伸缩布局*/
            display: flex;
            /* 设置主轴方向 :水平翻转*/
            flex-direction: row-reverse;
        }

        section:nth-child(5) ul{
            /* 设置伸缩布局*/
            display: flex;
            /* 设置主轴方向 :垂直*/
            flex-direction: column;
        }

        section:nth-child(6) ul{
            /* 设置伸缩布局*/
            display: flex;
            /* 设置主轴方向 :垂直*/
            flex-direction: column-reverse;
        }
    </style>
</head>
<body>
    <section>
        <h3>传统布局</h3>
        <ul>
            <li>1</li>
            <li>2</li>
            <li>3</li>
        </ul>
    </section>

    <section>
        <h3>伸缩布局 display:flex</h3>
        <ul>
            <li>1</li>
            <li>2</li>
            <li>3</li>
        </ul>
    </section>

    <section>
        <h3>主轴方向 flex-direction:row</h3>
        <ul>
            <li>1</li>
            <li>2</li>
            <li>3</li>
        </ul>
    </section>

    <section>
        <h3>主轴方向 flex-direction:row-reverse</h3>
        <ul>
            <li>1</li>
            <li>2</li>
            <li>3</li>
        </ul>
    </section>

    <section>
        <h3>主轴方向 flex-direction:column</h3>
        <ul>
            <li>1</li>
            <li>2</li>
            <li>3</li>
        </ul>
    </section>

    <section>
        <h3>主轴方向 flex-direction:column-reverse</h3>
        <ul>
            <li>1</li>
            <li>2</li>
            <li>3</li>
        </ul>
    </section>
</body>
</html>

  ``` 
  
##### flex-wrap 属性 
 
 ```java 
  flex-wrap
  ``` 
 ：控制子元素溢出时的换行处理。 
##### justify-content 属性 
 
 ```java 
  justify-content
  ``` 
 ：控制子元素在主轴上的排列方式。 
 
##### justify-content 属性 
 
  
 ```java 
  justify-content: flex-start;
  ``` 
  设置子元素在主轴上的对齐方式。属性值可以是： 
   
    
 ```java 
  flex-start
  ``` 
  从主轴的起点对齐（默认值） 
    
 ```java 
  flex-end
  ``` 
  从主轴的终点对齐 
    
 ```java 
  center
  ``` 
  居中对齐 
    
 ```java 
  space-around
  ``` 
  在父盒子里平分 
    
 ```java 
  space-between
  ``` 
  两端对齐 平分 
    
 
代码演示：（在浏览器中打开看效果） 
 
 ```java 
  <!DOCTYPE html>
<html>
<head lang="en">
    <meta charset="UTF-8">
    <title></title>
    <style>
        *{
            margin: 0;
            padding: 0;
            list-style:none;}
        body{
            background-color: #eee;
            font-family: "Microsoft Yahei";

        }
        section{
            width: 1000px;
            margin:50px auto;
        }
        section h3{
            font-size:22px;
            font-weight: normal;
        }

        ul{
            border: 1px solid #999;
            background-color: #fff;
            display: flex;

        }

        ul li{
            width: 200px;
            height: 200px;
            background: pink;
            margin:10px;

        }

        section:nth-child(1) ul{
            /* 主轴对齐方式：从主轴开始的方向对齐*/
            justify-content: flex-start;
        }

        section:nth-child(2) ul{
            /* 主轴对齐方式：从主轴结束的方向对齐*/
            justify-content: flex-end;
        }

        section:nth-child(3) ul{
            /* 主轴对齐方式：居中对��*/
            justify-content: center;
        }

        section:nth-child(4) ul{
            /* 主轴对齐方式：在父盒子中平分*/
            justify-content: space-around;

           }

        section:nth-child(5) ul{
            /* 主轴对齐方式：两端对齐 平分*/
            justify-content: space-between;
        }
    </style>
</head>
<body>
    <section>
        <h3>主轴的对齐方式：justify-content:flex-start</h3>
        <ul>
            <li>1</li>
            <li>2</li>
            <li>3</li>
        </ul>
    </section>

    <section>
        <h3>主轴的对齐方式：justify-content:flex-end</h3>
        <ul>
            <li>1</li>
            <li>2</li>
            <li>3</li>
        </ul>
    </section>

    <section>
        <h3>主轴的对齐方式：justify-content:center</h3>
        <ul>
            <li>1</li>
            <li>2</li>
            <li>3</li>
        </ul>
    </section>

    <section>
        <h3>主轴的对齐方式：justify-content:space-round</h3>
        <ul>
            <li>1</li>
            <li>2</li>
            <li>3</li>
        </ul>
    </section>

    <section>
        <h3>主轴的对齐方式：justify-content:space-bettwen</h3>
        <ul>
            <li>1</li>
            <li>2</li>
            <li>3</li>
            <li>4</li>
        </ul>
    </section>
</body>
</html>

  ``` 
  
##### align-items 属性 
 
 ```java 
  align-items
  ``` 
 ：设置子元素在侧轴上的对齐方式。属性值可以是： -  
 ```java 
  flex-start
  ``` 
  从侧轴开始的方向对齐 -  
 ```java 
  flex-end
  ``` 
  从侧轴结束的方向对齐 -  
 ```java 
  baseline
  ``` 
  基线 默认同flex-start -  
 ```java 
  center
  ``` 
  中间对齐 -  
 ```java 
  stretch
  ``` 
  拉伸 
代码演示： 
 
 ```java 
  <!DOCTYPE html>
<html>
<head lang="en">
    <meta charset="UTF-8">
    <title></title>
    <style>
        *{
            margin: 0;
            padding: 0;
            list-style:none;
        }
        body{
            background-color: #eee;
            font-family: "Microsoft Yahei";

        }
        section{
            width: 1000px;
            margin:50px auto;
        }
        section h3{
            font-size:22px;
            font-weight: normal;
        }

        ul{
            border: 1px solid #999;
            background-color: #fff;
            display: flex;
            height:500px;

        }

        ul li{
            width: 200px;
            height: 200px;
            background: pink;
            margin:10px;

        }

        section:nth-child(1) ul{
            /* 侧轴对齐方式 ：从侧轴开始的方向对齐*/
            align-items:flex-start;
        }

        section:nth-child(2) ul{
            /* 侧轴对齐方式 ：从侧轴结束的方向对齐*/
            align-items:flex-end;
        }

        section:nth-child(3) ul{
            /* 侧轴对齐方式 ：居中*/
            align-items:center;
        }

        section:nth-child(4) ul{
            /* 侧轴对齐方式 ：基线 默认同flex-start*/
            align-items:baseline;
        }

        section:nth-child(5) ul{
            /* 侧轴对齐方式 ：拉伸*/
            align-items:stretch;

        }

        section:nth-child(5) ul li{
            height:auto;
        }


    </style>
</head>
<body>
<section>
    <h3>侧轴的对齐方式:align-items ：flex-start</h3>
    <ul>
        <li>1</li>
        <li>2</li>
        <li>3</li>
    </ul>
</section>

<section>
    <h3>侧轴的对齐方式：align-items:flex-end</h3>
    <ul>
        <li>1</li>
        <li>2</li>
        <li>3</li>
    </ul>
</section>

<section>
    <h3>侧轴的对齐方式：align-items:center</h3>
    <ul>
        <li>1</li>
        <li>2</li>
        <li>3</li>
    </ul>
</section>

<section>
    <h3>侧轴的对齐方式：align-itmes:baseline</h3>
    <ul>
        <li>1</li>
        <li>2</li>
        <li>3</li>
    </ul>
</section>

<section>
    <h3>侧轴的对齐方式：align-itmes: stretch</h3>
    <ul>
        <li>1</li>
        <li>2</li>
        <li>3</li>
    </ul>
</section>
</body>
</html>

  ``` 
  
#####  
 ```java 
  flex
  ``` 
 属性：设置子盒子的权重 
代码演示： 
 
 ```java 
  <!DOCTYPE html>
<html>
<head lang="en">
    <meta charset="UTF-8">
    <title></title>
    <style>
        *{
            margin: 0;
            padding: 0;
            list-style:none;
        }
        body{
            background-color: #eee;
            font-family: "Microsoft Yahei";

        }
        section{
            width: 1000px;
            margin:50px auto;
        }
        section h3{
            font-size:22px;
            font-weight: normal;
        }

        ul{
            border: 1px solid #999;
            background-color: #fff;
            display: flex;

        }

        ul li{
            width: 200px;
            height: 200px;
            background: pink;
            margin:10px;

        }

        section:nth-child(1) ul li:nth-child(1){
            flex:1;
        }

        section:nth-child(1) ul li:nth-child(2){
            flex:1;
        }

        section:nth-child(1) ul li:nth-child(3){
            flex:8;
        }

        section:nth-child(2) ul li:nth-child(1){

        }

        section:nth-child(2) ul li:nth-child(2){
            flex:1;
        }

        section:nth-child(2) ul li:nth-child(3){
           flex:4;
        }


    </style>
</head>
<body>
<section>
    <h3>伸缩比例:flex</h3>
    <ul>
        <li>1</li>
        <li>2</li>
        <li>3</li>
    </ul>
</section>

<section>
    <h3>伸缩比例:flex</h3>
    <ul>
        <li>1</li>
        <li>2</li>
        <li>3</li>
    </ul>
</section>


</body>
</html>

  ``` 
  
 
 
  【英文原版】 CSS Flexbox Fundamentals Visual Guide：https://medium.com/swlh/css-flexbox-fundamentals-visual-guide-1c467f480dac  
  【中文翻译】CSS Flexbox 可视化手册：https://zhuanlan.zhihu.com/p/56046851  
 
##### flex 相关的推荐文章 
 
  flex 效果在线演示：https://demos.scotch.io/visual-guide-to-css3-flexbox-flexbox-playground/demos/  
  CSS3 Flexbox 布局完全指南 | 中文翻译：https://www.html.cn/archives/8629  

                                        