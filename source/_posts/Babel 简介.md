---
title: 推荐系列-Babel 简介
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 733
cover_picture: ''
abbrlink: cb1eeada
date: 2021-04-15 09:16:07
---

&emsp;&emsp;本教程我们学习 Babel 的基础知识，Babel 是一个用于 web 开发，且自由开源的 JavaScript 编译器、转换器。主要用于在当前和较旧的浏览器或环境中将 ECMAScript 2015+ 代码转换为 JavaScript...
<!-- more -->

                                                                                                                                                                                        本教程我们学习  ```java 
  Babel 
  ```  的基础知识， ```java 
  Babel
  ```  是一个用于  ```java 
  web
  ```  开发，且自由开源的  ```java 
  JavaScript
  ```  编译器、转换器。主要用于在当前和较旧的浏览器或环境中将  ```java 
  ECMAScript 2015+
  ```  代码转换为  ```java 
  JavaScript
  ```  的向后兼容版本。 
 ```java 
  Babel
  ```  使软件开发者能够以偏好的编程语言或风格来写作源代码，并将其利用  ```java 
  Babel
  ```  翻译成  ```java 
  JavaScript
  ``` ，是现今在浏览器最常用的编程语言。 
下列是  ```java 
  Babel
  ```  的使用场景： 
 
 语法转换。 
 目标环境中缺少的  ```java 
  Polyfill
  ```  功能。 
 源代码转换（codemods） 
 
示例： 
例如将  ```java 
  ES2015
  ```  中的箭头函数编译成  ```java 
  ES5
  ``` ： 
 ```java 
  [1, 2, 3].map((n) => n + 1);

  ```  
编译后的  ```java 
  ES5
  ```  代码如下所示： 
 ```java 
  [1, 2, 3].map(function (n) {
  return n + 1;
});

  ```  
这两段代码的功能是一样的，但是因为  ```java 
  ES2015
  ```  和  ```java 
  ES5
  ```  的语法有所不同，所以���译后的代码也不同。 
###### Babel运行方式和插件 
 ```java 
  Babel
  ```  的编译总共分为三个阶段：解析（parsing），转换（transformation），生成（generate）。 
 ```java 
  Babel
  ```  本身不具有任何转化功能， ```java 
  Babel
  ```  的转换功能都是通过插件（plugin）来实现的，把转化的功能都分解到一个个插件里面。因此当我们不配置任何插件时，经过  ```java 
  Babel
  ```  的代码和输入是相同的。 
插件总共分为两种： 
 
 语法插件：当我们添加语法插件之后，在解析这一步就使得  ```java 
  Babel
  ```  能够解析更多的语法。 
 转译插件：而添加转译插件之后，在转换这一步把源码转换并输出。这也是我们使用  ```java 
  Babel
  ```  最本质的需求。 
 
同一类语法可能同时存在语法插件版本和转译插件版本。如果我们使用了转译插件，就不用再使用语法插件了。 
###### preset 
 ```java 
  preset
  ```  预定义的一系列插件的组合，用于将特定的语法转换为当前环境使用的语法，避免了自己单独去挑选插件。 
 ```java 
  preset
  ```  分为以下几种： 
 
 官方内容，目前包括  ```java 
  env
  ``` 、 ```java 
  react
  ``` 、 ```java 
  flow
  ``` 、 ```java 
  minify
  ```  、 ```java 
  typescript
  ```  等。 
  ```java 
  stage-x
  ``` ，这里面包含的都是当年最新规范的草案，每年更新。可以细分为： 
   
    ```java 
  Stage 0
  ``` ：设想（Strawman）：只是一个想法，可能有 Babel插件。 
    ```java 
  Stage 1
  ``` ：建议（Proposal）：这是值得跟进的。 
    ```java 
  Stage 2
  ``` ： 草案（Draft）：初始规范。 
    ```java 
  Stage 3
  ``` ： 候选（Candidate）：完成规范并在浏览器上初步实现。 
    ```java 
  Stage 4
  ``` ：完成（Finished）：将添加到下一个年度版本发布中。 
    

                                        