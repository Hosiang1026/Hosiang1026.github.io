---
title: 推荐系列-读scss-sass实例项目带你入门
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 715
cover_picture: 'https://oscimg.oschina.net/oscnet/up-986299058b72be00b696128941ed34f13e9.JPEG'
abbrlink: a04075ad
date: 2021-04-15 09:48:03
---

&emsp;&emsp;CSS（Cascading Style Sheet）级联样式表，前端必备技能之一。记得刚开始学习使用DIV+CSS布局的时候，有一个很有意思的网站《禅意花园》,通过模仿它开启了CSS设计之美。随着前端技术发展，纯...
<!-- more -->

                                                                                                                                                                                        ![Test](https://oscimg.oschina.net/oscnet/up-986299058b72be00b696128941ed34f13e9.JPEG  '读scss-sass实例项目带你入门') 
 
 ```java 
  CSS（Cascading Style Sheet）
  ``` 
 级联样式表，前端必备技能之一。记得刚开始学习使用 
 ```java 
  DIV+CSS
  ``` 
 布局的时候，有一个很有意思的网站《禅意花园》,通过模仿它开启了CSS设计之美。随着前端技术发展，纯CSS的弊端更加突显，就有后来的CSS预处理器SASS\SCSS、LESS、Stylus等。记得自己第一次接触 
 ```java 
  SCSS
  ``` 
 的时候，就“一见钟情”，从此在项目中就没有用过纯CSS的方式了。 
本文总结一下在项目中经常用到CSS预处理器的特征，趁此先来认识一下SCSS/SASS，LESS本文就不介绍了，大同小异。 
文章涉及实例项目代码：https://github.com/QuintionTang/scss-guide 
 
##### SASS/SCSS 
Sass 是一种 CSS 的预编译语言。提供了变量（variables）、嵌套（nested rules）、 混合（mixins）、 函数（functions）等功能，并且完全兼容 CSS 语法。Sass 能够帮助复杂的样式表更有条理， 并且易于在项目内部或跨项目共享设计。 
Sass是一个最初由Hampton Catlin设计并由Natalie Weizenbaum开发的层叠样式表语言。在开发最初版本之后，Weizenbaum和Chris Eppstein继续通过SassScript来继续扩充Sass的功能。SassScript是一个在Sass文件中使用的小型脚本语言。 
SASS诞生于2007年，最早也是最成熟的CSS预处理器，拥有ruby社区的支持和compass这一最强大的css框架，第一次接触的就是compass《CSS开发框架》。 
 
###### SASS/SCSS 区别 
sass和scss大致相同的东西，从概念上讲，没有太大区别，是属于sass的两种不同的语法： 
 
 
 Sass：缩进语法，看起来有点怪异，更短，没有花括号，没有分号 
 
 
 ```java 
  .element-a
    color: hotpink

    .element-b
        float: left

  ``` 
  
对应的CSS： 
 
 ```java 
  .element-a {
    color: hotpink;
}

.element-a .element-b {
    float: left;
}

  ``` 
  
 
 scss：css-like 语法，比sass更加贴近 CSS 语法，完全和 CSS 兼容的。 
 
 
 ```java 
  .element-a{
    color: hotpink;
     .element-b{
        float: left;
     }   
}

  ``` 
  
对应的CSS： 
 
 ```java 
  .element-a {
    color: hotpink;
}

.element-a .element-b {
    float: left;
}

  ``` 
  
 
###### 基本特征 
这里讲到的基本特征，只是简单列举了比较常用的特征。如果需要了解更多信息，建议查看官方文档，内容不是很多。 
文章的涉及的代码都是基于演示项目scss-guide，基于gulp来构建。 
 
###### 变量 
变量是重复利用的常见方式，特别对于CSS来说，变量可以减少很多重复。如可以定义静态资源路径（图片、字体）、颜色、尺寸（宽度、高度等）。scss 使用  
 ```java 
  $
  ``` 
  符号 作为变量开头。例如： 
 
 ```java 
  // scss 变量定义
$font-family-base: "Microsoft YaHei", "微软雅黑", "pingfang sc", "宋体", Arial,
    Helvetica, sans-serif;
$font-base-size: 14px;
$color: #444;

body {
    font-family: $font-family-base;
    font-size: $font-base-size;
    color: $color;
}

  ``` 
  
下面是生成的对应css代码： 
 
 ```java 
  body {
    font-family: "Microsoft YaHei", "微软雅黑", "pingfang sc", "宋体", Arial,
        Helvetica, sans-serif;
    font-size: 14px;
    color: #444;
}

  ``` 
  
 
###### 嵌套 
scss 允许使用嵌套 CSS 选择器，嵌套方式 与 HTML 的层次结构相同。scss嵌套语法，可以让css结构更加清晰，可维护性高。 
 
 ```java 
  .container {
    margin: 0px auto;
    ul, li {
        margin: 0px;
        padding: 0px;
    }
}

  ``` 
  
对应的CSS代码： 
 
 ```java 
  .container {
    margin: 0px auto;
}
.container ul, .container li {
    margin: 0px;
    padding: 0px;
}

  ``` 
  
 
###### 混合（mixins） 
在项目开发过程中有很多类名具有相同或者相似的样式，就可以用 scss 中的混合（mixins）来进行代码组织，以减少重复代码。例如一些常见的兼容性代码： 
 
 ```java 
  @mixin box-shadow($shadowVal...) {
    -webkit-box-shadow: $shadowVal;
    box-shadow: $shadowVal;
}
.card {
    @include box-shadow($shadow);
}

  ``` 
  
对应的CSS代码： 
 
 ```java 
  .card {
    -webkit-box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

  ``` 
  
 
###### 继承（@extend） 
继承（@extend）可以从一个选择器到另一个选择器共享一组CSS属性，即让一个css类继承另一个css类。 
继承有两种情况： 
 
 一种是继承class，定义以 
 ```java 
  .
  ``` 
 开头，被继承的模块独立存在与css中。 
 一个继承一个公共的模块，定义以 
 ```java 
  %
  ``` 
 开头，被继承的模块不会独立存在与css中。 
 
继承class 
 
 ```java 
  .button {
    display: inline-block;
    font-weight: $btn-font-weight;
    color: $btn-color;
    text-align: center;
    vertical-align: middle;
    user-select: none;
    background-color: $btn-background-color;
    border: $btn-border;
}
.button-noborder {
    @extend .button; // 继承.button的样式，编译后.button也存在与css中
    border: none;
    &:hover {
        font-size: 14px;
    }
}

  ``` 
  
编译成的css如下： 
 
 ```java 
  .button,
.button-noborder {
    display: inline-block;
    font-weight: 500;
    color: #fff;
    text-align: center;
    vertical-align: middle;
    user-select: none;
    background-color: #007bff;
    border: 1px solid rgba(0, 123, 255, 0.8);
}

.button-noborder {
    border: none;
}
.button-noborder:hover {
    font-size: 14px;
}

  ``` 
  
继承公共模块 
 
 ```java 
  %card-share {
    position: relative;
    display: flex;
    flex-direction: column;
    min-width: 0;
    word-wrap: break-word;
    background-color: $card-bg;
    background-clip: border-box;
    border: $card-border-width solid $card-border-color;
    border-radius: $card-border-radius;
}
.card {
    @extend %card-share;  // 继承公共模块%card-share，编译后的css中不存在：card-share
    @include box-shadow($shadow);
}

  ``` 
  
编译后的 css 如下： 
 
 ```java 
  .card {
    position: relative;
    display: flex;
    flex-direction: column;
    min-width: 0;
    word-wrap: break-word;
    background-color: #fff;
    background-clip: border-box;
    border: 1px solid rgba(0, 0, 0, 0.125);
    border-radius: 2px;
}
.card {
    -webkit-box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

  ``` 
  
 
###### 操作符 
scss操作符包括：引用父选择符 
 ```java 
  &
  ``` 
 、插值运算符 
 ```java 
  #{}
  ``` 
 、算术操作符、条件操作符、颜色操作符、字符串操作符、逻辑运算符。 
引用父选择符 & 
引用父选择符 
 ```java 
  &
  ``` 
 ，大部分时候用于伪类的书写。 
 
 ```java 
  a {
    display: inline-block;
    color: $black;
    &:hover {
        text-decoration: none;
    }
    &::before {
        content: "";
    }
    &.menu {
        margin: 0px 10px;
        color: $blue;
        &-item {
            margin-left: 20px;
        }
    }
}

  ``` 
  
编译后的css如下： 
 
 ```java 
  a {
    display: inline-block;
    color: #000000;
}
a:hover {
    text-decoration: none;
}
a::before {
    content: "";
}
a.menu {
    margin: 0px 10px;
    color: #007bff;
}
a.menu-item {
    margin-left: 20px;
}

  ``` 
  
插值操作符 
插值操作符 
 ```java 
  #{}
  ``` 
 ，用于拼接字符串。 
 
 ```java 
  .picture-bg {
    background: url("#{$image-path}main.jpg") center no-repeat;
}

  ``` 
  
编译后的css如下： 
 
 ```java 
  .picture-bg {
    background: url("./assets/images/main.jpg") center no-repeat;
}

  ``` 
  
算术操作符 
算术运算符包括： 
 ```java 
  +
  ``` 
 、 
 ```java 
  -
  ``` 
 、 
 ```java 
  /
  ``` 
 、 
 ```java 
  *
  ``` 
 、 
 ```java 
  %
  ``` 
  
 
 
 ```java 
  .sidebar {
    width: $max-width * 0.8 - 100px;
    height: $max-width % 75;
}

  ``` 
  
编辑后的css为计算后的结果： 
 
 ```java 
  .sidebar {
    width: 1052px;
    height: 15px;
}

  ``` 
  
关系操作符/逻辑运算符 
条件操作符号、关系操作符和逻辑运算符一般都在一起使用， 
关系操作符包括：等于（ 
 ```java 
  ==
  ``` 
 ）、不等于（ 
 ```java 
  !=
  ``` 
 ）、大于（ 
 ```java 
  >
  ``` 
 ）、大于等于（ 
 ```java 
  >=
  ``` 
 ）、小于（ 
 ```java 
  <
  ``` 
 ）小于等于（ 
 ```java 
  <=
  ``` 
 ） 
逻辑操作符包括与（ 
 ```java 
  and
  ``` 
 ）、或（ 
 ```java 
  or
  ``` 
 ）和非（ 
 ```java 
  not
  ``` 
 ） 
 
 ```java 
  img {
    cursor: zoom + -in;
    @if ($max-width>=1440px and $min-width>90%) {
        max-width: 95%;
    } @else if ($min-width<100%) {
        min-width: 100%;
    }
}

  ``` 
  
编译后css如下： 
 
 ```java 
  img {
    cursor: zoom-in;
    max-width: 95%;
}

  ``` 
  
字符串操作符 
字符串操作主要是拼接，使用 
 ```java 
  +
  ``` 
 来拼接字符串。 
 
 ```java 
  img {
    cursor: zoom + -in;
}

  ``` 
  
编译后的CSS： 
 
 ```java 
  img {
    cursor: zoom-in;
}

  ``` 
  
 
###### 指令 
scss常见指令包括导入 
 ```java 
  import
  ``` 
 、媒介查询 
 ```java 
  media
  ``` 
 。 
导入 
 ```java 
  import
  ``` 
 用于更好的组织scss代码，将不同功能的scss代码组织到独立的文件，如变量声明文件 
 ```java 
  _variables.scss
  ``` 
 ，然后使用 
 ```java 
  import
  ``` 
 导入到主文件。 
 
 ```java 
  @import "./partials/variables";
@import "./partials/mixins";
@import "./partials/common";

  ``` 
  
媒介查询 
 ```java 
  media
  ``` 
 主要用于响应式的定义。 
 
 ```java 
  @media screen and (max-width: 1024px) {
    .container {
        width: 100%;
    }
}

  ``` 
  
编译后的css代码如下： 
 
 ```java 
  @media screen and (max-width: 1024px) {
    .container {
        width: 100%;
    }
}

  ``` 
  
 
###### 流程操作符 
scss常见的流程操作符包括： 
 ```java 
  @if
  ``` 
 、 
 ```java 
  @if...@else if
  ``` 
 、 
 ```java 
  @for
  ``` 
 、 
 ```java 
  @each
  ``` 
 、 
 ```java 
  @while
  ``` 
 、 
 ```java 
  if
  ``` 
 。 
@if 
 
 ```java 
  p {
    @if 1 + 1 == 2 {
        border: 1px solid;
    }
    @if 5 < 3 {
        border: 2px dotted;
    }
    @if null {
        border: 3px double;
    }
}

  ``` 
  
编译后的css代码如下： 
 
 ```java 
  p {
    border: 1px solid;
}

  ``` 
  
@if @else if 
 
 ```java 
  .fullbox {
    @if ($max-width>=1440px and $min-width>90%) {
        max-width: 95%;
    } @else if ($min-width<100%) {
        min-width: 100%;
    }
}

  ``` 
  
编译后的css代码如下： 
 
 ```java 
  .fullbox {
    max-width: 95%;
}

  ``` 
  
@for 
 
 
 ```java 
  ul {
    &.sidenav {
        $nav-count: 5;
        $nav-colors: #ff0001, #ff0002, #ff0003, #ff0004, #ff0005;
        @for $i from 1 through $nav-count {
            .item-#{$i} {
                background-color: nth($nav-colors, $i); // 数组的使用
            }
        }
    }
}

  ``` 
  
编译后的css代码如下： 
 
 ```java 
  ul.sidenav .item-1 {
    background-color: #ff0001;
}

ul.sidenav .item-2 {
    background-color: #ff0002;
}

ul.sidenav .item-3 {
    background-color: #ff0003;
}

ul.sidenav .item-4 {
    background-color: #ff0004;
}

ul.sidenav .item-5 {
    background-color: #ff0005;
}

  ``` 
  
@each 
 
 ```java 
  @each $icon in excel, ppt, pdf, doc-around {
    .icon-#{$icon} {
        background-image: url("#{$image-path}#{$icon}.png");
    }
}

  ``` 
  
编译后的css代码如下： 
 
 ```java 
  .icon-excel {
    background-image: url("./assets/images/excel.png");
}

.icon-ppt {
    background-image: url("./assets/images/ppt.png");
}

.icon-pdf {
    background-image: url("./assets/images/pdf.png");
}

.icon-doc-around {
    background-image: url("./assets/images/doc-around.png");
}

  ``` 
  
@while 
 
 ```java 
  $number: 6;
@while $number > 0 {
    .row-#{$number} {
        width: 2em * $number;
    }
    $number: $number - 2;
}

  ``` 
  
编译后的css代码如下： 
 
 ```java 
  .row-6 {
    width: 12em;
}

.row-4 {
    width: 8em;
}

.row-2 {
    width: 4em;
}

  ``` 
  
三元运算符 if 
三元运算符 
 ```java 
  if(condition,exprIfTrue,exprIfFalse)
  ``` 
 ，在此示例中用到了 
 ```java 
  map-merge
  ``` 
 合并 
 ```java 
  key/value
  ``` 
 变量，获取相应key值的方法为： 
 ```java 
  map-get($map, key)
  ``` 
 。 
 
 ```java 
  $sizes: ();
$sizes: map-merge(
    (
        25: 25%,
        50: 50%,
        75: 75%,
        100: 100%,
    ),
    $sizes
);

@each $size, $length in $sizes {
    .size-#{$size} {
        width: $length !important;
        font-size: if($size % 50 == 0, "14px", "28px");
    }
}

  ``` 
  
编译后的css代码如下： 
 
 ```java 
  .size-25 {
    width: 25% !important;
    font-size: "28px";
}

.size-50 {
    width: 50% !important;
    font-size: "14px";
}

.size-75 {
    width: 75% !important;
    font-size: "28px";
}

.size-100 {
    width: 100% !important;
    font-size: "14px";
}

  ``` 
  
 
###### 内置函数 
scss包括一些内容函数，例如颜色相关的函数， 
 ```java 
  lighten()
  ``` 
  与  
 ```java 
  darken()
  ``` 
 函数可用于调亮或调暗颜色， 
 ```java 
  opacify()
  ``` 
 函数使颜色透明度减少， 
 ```java 
  transparent()
  ``` 
 函数使颜色透明度增加， 
 ```java 
  mix()
  ``` 
 函数可用来混合两种颜色。 
 
 ```java 
  .main-bg {
    background: mix(red, yellow, 35%);
}

  ``` 
  
编译后的css代码如下： 
 
 ```java 
  .main-bg {
    background: #ffa600;
}

  ``` 
  
这里就不展开介绍了，把常见的方法列出来。 
字符串函数 
向字符串添加引号的 
 ```java 
  quote()
  ``` 
 、获取字符串长度的 
 ```java 
  string-length()
  ``` 
 和将内容插入字符串给定位置的 
 ```java 
  string-insert()
  ``` 
 。 
数值函数 
 
 ```java 
  percentage()
  ``` 
 将无单元的数值转换为百分比， 
 ```java 
  round()
  ``` 
 将数字四舍五入为最接近的整数， 
 ```java 
  min()
  ``` 
 和 
 ```java 
  max()
  ``` 
 获取几个数字中的最小值或最大值， 
 ```java 
  random()
  ``` 
 返回一个随机数。 
List 函数 
 
 ```java 
  length()
  ``` 
 返回列表长度， 
 ```java 
  nth()
  ``` 
 返回列表中的特定项， 
 ```java 
  join()
  ``` 
 将两个列表连接在一起， 
 ```java 
  append()
  ``` 
 在列表末尾添加一个值。 
Map 函数 
 
 ```java 
  map-get()
  ``` 
 根据键值获取map中的对应值， 
 ```java 
  map-merge()
  ``` 
 来将两个map合并成一个新的map， 
 ```java 
  map-values()
  ``` 
 映射中的所有值。 
 
###### 自定义函数 
这里将通过代码介绍一下自定义函数，创建自定义函数需要两个scss指令，创建函数 
 ```java 
  @function
  ``` 
 和函数将返回的值 
 ```java 
  @return
  ``` 
 。 
下面示例用于生成media相关的样式。 
 
 ```java 
  $grid-breakpoints: ();
$grid-breakpoints: map-merge(
    (
        xs: 0,
        sm: 576px,
        md: 768px,
        lg: 992px,
        xl: 1200px,
    ),
    $grid-breakpoints
);
// 设置指定名称的 @media (min-width: 992px)，如果$name存在，将设置对应的@media。
@mixin media-breakpoint-up($name, $breakpoints: $grid-breakpoints) {
    $min: get-breakpoint($name, $breakpoints);
    @if $min {
        @media (min-width: $min) {
            @content;
        }
    } @else {
        @content;
    }
}

// 获取断点指定名称的断点，如不存在返回空。默认的断点为$grid-breakpoints
@function get-breakpoint($name, $breakpoints: $grid-breakpoints) {
    $min: map-get($breakpoints, $name);
    @return if($min != 0, $min, null);
}

.container-p-x {
    padding-right: $container-padding-x-sm !important;
    padding-left: $container-padding-x-sm !important;

    @include media-breakpoint-up(lg) {
        padding-right: $container-padding-x !important;
        padding-left: $container-padding-x !important;
    }
    @include media-breakpoint-up(xl) {
        padding-right: $container-padding-x * 2 !important;
        padding-left: $container-padding-x * 2 !important;
    }
}

  ``` 
  
编译后的css代码如下： 
 
 ```java 
  .container-p-x {
    padding-right: 1rem !important;
    padding-left: 1rem !important;
}
@media (min-width: 992px) {
    .container-p-x {
        padding-right: 2rem !important;
        padding-left: 2rem !important;
    }
}
@media (min-width: 1200px) {
    .container-p-x {
        padding-right: 4rem !important;
        padding-left: 4rem !important;
    }
}

  ``` 
  
 
###### 注释 
scss的注释常见有两种 
 
  标准注释：  
 ```java 
  /* comment */
  ``` 
 ，会保留到编译后的文件。  
  单行注释：  
 ```java 
  // comment
  ``` 
 ，只保留在scss源文件中，编译后被过滤，在css中不可见。  
 
一般在  
 ```java 
  /*
  ``` 
  后面加一个感叹号，表示这是“重要注释”。即使是压缩模式编译，也会保留这行注释，通常可以用于声明版权信息。 
 
 ```java 
  /*!
    author:devpoint
*/

  ``` 
  
 
###### 总结 
本文总结的scss内容基本可以满足大部分的项目，学习scss最好的方式就是通过编译的css来理解scss的逻辑，特别是函数。
                                        