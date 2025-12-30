---
title: 读scsssass实例项目带
categories: 其他系列
tags:
  - CSS
  - Solidity
abbrlink: 273586ca
date: 2024-01-05 00:00:00
top: 167
---


CSS（Cascading Style Sheet）级联样式表，前端必备技能之一。记得刚开始学习使用DIV+CSS布局的时候，有一个很有意思的网站《禅意花园》,通过模仿它开启了CSS设计之美。随着前端技术发展，纯。..
<!-- more -->

![Test](https://oscimg.oschina.net/oscnet/up-986299058b72be00b696128941ed34f13e9.JPEG '读scss-sass实例项目带你入门') 
 
 `CSS（Cascading Style Sheet）` 
 级联样式表，前端必备技能之一。记得刚开始学习使用 
 `DIV+CSS` 
 布局的时候，有一个很有意思的网站《禅意花园》,通过模仿它开启了CSS设计之美。随着前端技术发展，纯CSS的弊端更加突显，就有后来的CSS预处理器SASS\SCSS、LESS、Stylus等。记得自己第一次接触 
 `SCSS` 
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
 
 
 ```text
  .element-a
    color: hotpink

    .element-b
        float: left

  `对应的CSS：```java
  .element-a {
    color: hotpink;
}

.element-a .element-b {
    float: left;
}

  `scss：css-like 语法，比sass更加贴近 CSS 语法，完全和 CSS 兼容的。```java
  .element-a{
     .element-b{
     }   

}

}

  ``` 
  
 
###### 基本特征
这里讲到的基本特征，只是简单列举了比较常用的特征。如果需要了解更多信息，建议查看官方文档，内容不是很多。 
文章的涉及的代码都是基于演示项目scss-guide，基于gulp来构建。 
 
###### 变量
变量是重复利用的常见方式，特别对于CSS来说，变量可以减少很多重复。如可以定义静态资源路径（图片、字体）、颜色、尺寸（宽度、高度等）。scss 使用  
 `$` 
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

  `下面是生成的对应css代码：```java
    font-family: "Microsoft YaHei", "微软雅黑", "pingfang sc", "宋体", Arial,
    font-size: 14px;
    color: #444;
}

  ``` 
  
 
###### 嵌套
scss 允许使用嵌套 CSS 选择器，嵌套方式 与 HTML 的层次结构相同。scss嵌套语法，可以让css结构更加清晰，可维护性高。 
 
 ```css
.container {
    margin: 0px auto;
    ul, li {
        margin: 0px;
        padding: 0px;
    }

  `对应的CSS代码：```css
}
.container ul, .container li {
}

  ``` 
  
 
###### 混合（mixins）
在项目开发过程中有很多类名具有相同或者相似的样式，就可以用 scss 中的混合（mixins）来进行代码组织，以减少重复代码。例如一些常见的兼容性代码： 
 
```
  @mixin box-shadow($shadowVal...) {
    -webkit-box-shadow: $shadowVal;
    box-shadow: $shadowVal;
```
}
```
.card {
    @include box-shadow($shadow);
```
}

```
    -webkit-box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
```
}

  ``` 
  
 
###### 继承（@extend）
继承（@extend）可以从一个选择器到另一个选择器共享一组CSS属性，即让一个css类继承另一个css类。 
继承有两种情况： 
 
 一种是继承class，定义以 
 `.` 
 开头，被继承的模块独立存在与css中。 
 一个继承一个公共的模块，定义以 
 `%` 
 开头，被继承的模块不会独立存在与css中。 
 
继承class 
 
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
    }

  `编译成的css如下：```java
  .button,
    font-weight: 500;
    color: #fff;
    background-color: #007bff;
    border: 1px solid rgba(0, 123, 255, 0.8);
}

}
.button-noborder:hover {
}

  `继承公共模块```css
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
    @extend %card-share;  // 继承公共模块%card-share，编译后的css中不存在：card-share
}

  `编译后的 css 如下：```css
    background-color: #fff;
    border: 1px solid rgba(0, 0, 0, 0.125);
    border-radius: 2px;
}
}

  ``` 
  
 
###### 操作符
scss操作符包括：引用父选择符 
 `&` 
```
 、插值运算符 `#{}` 、算术操作符、条件操作符、颜色操作符、字符串操作符、逻辑运算符。 
```
引用父选择符 & 
 `&` 
 ，大部分时候用于伪类的书写。 
 
```
  a {
    color: $black;
        text-decoration: none;
```
    }
```
    &::before {
        content: "";
```
    }
```
    &.menu {
        margin: 0px 10px;
        color: $blue;
        &-item {
            margin-left: 20px;
```
        }

  `编译后的css如下：```css
```
  a {
    color: #000000;
```
}
```
a:hover {
```
}
```
a::before {
```
}
```
a.menu {
    color: #007bff;
```
}
```
a.menu-item {
```
}

  ``` 
  
插值操作符 
插值操作符 `#{}` ，用于拼接字符串。 
 
  .picture-bg {
    background: url("#{$image-path}main.jpg") center no-repeat;
}

  `编译后的css如下：```java
    background: url("./assets/images/main.jpg") center no-repeat;
}

  ``` 
  
算术操作符 
算术运算符包括： 
 `+` 
 、 
 `-` 
 、 
 `/` 
 、 
 `*` 
 、 
 `%`
```
.sidebar {
    width: $max-width * 0.8 - 100px;
    height: $max-width % 75;
```
}

  `编辑后的css为计算后的结果：```css
```
    width: 1052px;
    height: 15px;
```
}

  ``` 
  
关系操作符/逻辑运算符 
条件操作符号、关系操作符和逻辑运算符一般都在一起使用， 
关系操作符包括：等于（ `==` ）、不等于（ `!=` ）、大于（ `>` ）、大于等于（ `>=` ）、小于（ `<` ）小于等于（ `<=` ） 
逻辑操作符包括与（ 
 `and` 
 ）、或（ 
 `or` 
 ）和非（ 
 `not` 
 ） 
 
  img {
    cursor: zoom + -in;
    @if ($max-width>=1440px and $min-width>90%) {
        max-width: 95%;
    } @else if ($min-width<100%) {
        min-width: 100%;
    }

  `编译后css如下：```java
  img {
    cursor: zoom-in;
}

  ``` 
  
字符串操作符 
字符串操作主要是拼接，使用 
 `+` 
 来拼接字符串。 
 
```
  img {
```
}

  `编译后的CSS：```java
```
  img {
```
}

  ``` 
  
 
###### 指令
scss常见指令包括导入 
 `import` 
 、媒介查询 
 `media` 
 。 
导入 
 用于更好的组织scss代码，将不同功能的scss代码组织到独立的文件，如变量声明文件 
 `_variables.scss` 
 ，然后使用 
 导入到主文件。 
 
  @import "./partials/variables";
@import "./partials/mixins";
@import "./partials/common";

  `媒介查询```text
  media
  `主要用于响应式的定义。```css
  @media screen and (max-width: 1024px) {
        width: 100%;
    }

  `编译后的css代码如下：```css
    }

  ``` 
  
 
###### 流程操作符
scss常见的流程操作符包括： 
 `@if` 
 、 
 `@if...@else if` 
 、 
 `@for` 
 、 
 `@each` 
 、 
 `@while` 
 、 
 `if` 
 。 
```
@if 
```
 
```
  p {
    @if 1 + 1 == 2 {
        border: 1px solid;
```
    }
```
    @if 5 < 3 {
        border: 2px dotted;
```
    }
```
    @if null {
        border: 3px double;
```
    }

  `编译后的css代码如下：```java
```
  p {
```
}

  `@if @else if```css
```
.fullbox {
```
    }

}

  `@for```css
```python
  ul {
    &.sidenav {
        $nav-count: 5;
        $nav-colors: #ff0001, #ff0002, #ff0003, #ff0004, #ff0005;
        @for $i from 1 through $nav-count {
            .item-#{$i} {
                background-color: nth($nav-colors, $i); // 数组的使用
```
            }

```
  ul.sidenav .item-1 {
    background-color: #ff0001;
```
}

```
ul.sidenav .item-2 {
    background-color: #ff0002;
```
}

```
ul.sidenav .item-3 {
    background-color: #ff0003;
```
}

```
ul.sidenav .item-4 {
    background-color: #ff0004;
```
}

```
ul.sidenav .item-5 {
    background-color: #ff0005;
```
}

  `@each```java
```
  @each $icon in excel, ppt, pdf, doc-around {
    .icon-#{$icon} {
        background-image: url("#{$image-path}#{$icon}.png");
```
    }

```
  .icon-excel {
    background-image: url("./assets/images/excel.png");
```
}

```
.icon-ppt {
    background-image: url("./assets/images/ppt.png");
```
}

```
.icon-pdf {
    background-image: url("./assets/images/pdf.png");
```
}

```
.icon-doc-around {
    background-image: url("./assets/images/doc-around.png");
```
}

  `@while```java
```
  $number: 6;
@while $number > 0 {
    .row-#{$number} {
        width: 2em * $number;
```
    }
```
    $number: $number - 2;
```
}

```
  .row-6 {
    width: 12em;
```
}

```
.row-4 {
    width: 8em;
```
}

```
.row-2 {
    width: 4em;
```
}

  ``` 
  
三元运算符 if 
三元运算符 `if(condition,exprIfTrue,exprIfFalse)` ，在此示例中用到了 
 `map-merge` 
 合并 
 `key/value` 
 变量，获取相应key值的方法为： `map-get($map, key)` 。 
 
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
}

.size-100 {
    width: 100% !important;
}

  ``` 
  
 
###### 内置函数
```
scss包括一些内容函数，例如颜色相关的函数， `lighten()` 与 `darken()` 函数可用于调亮或调暗颜色， `opacify()` 函数使颜色透明度减少， `transparent()` 函数使颜色透明度增加， `mix()` 函数可用来混合两种颜色。 
```
 
```
  .main-bg {
    background: mix(red, yellow, 35%);
```
}

```
    background: #ffa600;
```
}

  ``` 
  
这里就不展开介绍了，把常见的方法列出来。 
字符串函数 
向字符串添加引号的 `quote()` 、获取字符串长度的 `string-length()` 和将内容插入字符串给定位置的 `string-insert()` 。 
数值函数 `percentage()` 将无单元的数值转换为百分比， `round()` 将数字四舍五入为最接近的整数， `min()` 和 `max()` 获取几个数字中的最小值或最大值， `random()` 返回一个随机数。 
List 函数 `length()` 返回列表长度， `nth()` 返回列表中的特定项， `join()` 将两个列表连接在一起， `append()` 在列表末尾添加一个值。 
Map 函数 `map-get()` 根据键值获取map中的对应值， `map-merge()` 来将两个map合并成一个新的map， `map-values()` 映射中的所有值。 
 
###### 自定义函数
这里将通过代码介绍一下自定义函数，创建自定义函数需要两个scss指令，创建函数 
 `@function` 
 和函数将返回的值 
 `@return` 
 。 
下面示例用于生成media相关的样式。 
 
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

    padding-right: 1rem !important;
    padding-left: 1rem !important;
}
@media (min-width: 992px) {
        padding-right: 2rem !important;
        padding-left: 2rem !important;
    }
@media (min-width: 1200px) {
        padding-right: 4rem !important;
        padding-left: 4rem !important;
    }

  ``` 
  
 
###### 注释
scss的注释常见有两种 
 
  标准注释：  
 `/* comment */` 
 ，会保留到编译后的文件。  
  单行注释：  
 `// comment` 
 ，只保留在scss源文件中，编译后被过滤，在css中不可见。  
 
一般在  
 `/*` 
  后面加一个感叹号，表示这是“重要注释”。即使是压缩模式编译，也会保留这行注释，通常可以用于声明版权信息。 
 
```
  /*!
    author:devpoint
```
*/

  ``` 
  
 
###### 总结
本文总结的scss内容基本可以满足大部分的项目，学习scss最好的方式就是通过编译的css来理解scss的逻辑，特别是函数。