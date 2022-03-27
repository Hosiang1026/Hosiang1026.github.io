---
title: 推荐系列-TypeScript里string和String，真不是仅仅是大小写的区别
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 302
cover_picture: 'https://pic1.zhimg.com/80/v2-fc188a47ecda63e3345f98ddd015d684_720w.jpg'
abbrlink: 82ce8c4c
date: 2022-03-27 11:56:25
---

&emsp;&emsp;：通常来说，string表示原生类型，而String表示对象。 本文分享自华为云社区《TypeScript里string和String的区别》，作者：gentle_zhou 。 背景 与JavaScript语言不同的是，TypeScript使...
<!-- more -->

                                                                                                                    
            程序员健身是为了保养还是保命？参与话题讨论赢好礼 >>>
            
                                                                                                     
本文分享自华为云社区《TypeScript里string和String的区别》，作者：gentle_zhou 。 
 
#### 背景 
与JavaScript语言不同的是，TypeScript使用的是静态类型，比如说它指定了变量可以保存的数据类型。如下图所示，如果在JS中，指定变量可以保存的数据类型，会报错：“类型注释只可以在TS文件中被使用”： 
 
TypeScript是JavaScript的超集（superset），TypeScript需要编译（语法转换）生成JavaScript才能被浏览器执行，它也区分了string和String这两个数据类型。通常来说，string表示原生类型，而String表示对象。 
 
#### 原生string 
JavaScript在ES6标准里支持6种原生类型（number），string是其中之一。 
 
原生的string是不包含属性的值（即没有properties），包括字面上没有定义类型、字面上定义了string、字面上定义了String和一些从string函数调用返回的strings也都可以被归为原生类型： 
 
以上三个变���的类型（typeof()）是string。 
 
#### 对象String 
对象是不同属性的累积，一个对象可以调用许多相应的方法。 
 
  
 ```java 
  let msg3: String = new String('Hello world!');
  ``` 
  
 
这个变量msg3的类型就是object： 
 
  
 ```java 
  console.log(typeof(msg3)); // object
  ``` 
  
 
String对象支持的方法： 
 
 
 
#### 代码对比 
我们对下面4个变量进行类型的探索与比较： 
 
  
 ```java 
  let msg: string = 'Hello world!';
let msg2: String = 'Hello world!';
let msg22 = 'Hello world!';  //字面上没有定义类型
let msg3: String = new String('Hello world!');

console.log(typeof(msg));  //string
console.log(typeof(msg2));  //string
console.log(typeof(msg22));  //string
console.log(typeof(msg3));  //object
console.log(msg === msg2);  //true
console.log(msg === msg3);  //false
console.log(msg2 === msg3);  //false
  ``` 
  
 
 
#### 为什么需要String对象 
首先，当我们使用关键字new新建一个String对象的时候，TS会创建一个新的对象；即我们用new新建了两个String对象，即使内容相同，它们也是指向不同的内存。 
举下面两个栗子： 
1.当用a1,b1代表相同值的两个变量的时候，它们是相同的；而当用new新建两个对象的时候，即使值相同，它们也是不同的（下图会输出false, true）： 
 
2.eval()函数的作用：用来计算表达式的值。如果我们把eval()直接赋给string，而string里面是计算式的字符串，那么它会返回计算后的值；而如果我们把eval()赋给String，因为它不是原生类型，它只会返回String这个对象（下图会输出27， :"8 + 20"， 28）： 
 
其次，因为String对象可以有属性。我们可以用String对象在属性里保留一个额外的值。即使这个用法并不常见，但是仍然是TS的一个特性： 
 
  
 ```java 
  var prim = 'hello HW';
var obj = new String('hello HW Cloud');

prim.property = 'PaaS'; // Invalid
obj.property = 'PaaS';  // Valid
console.log(obj.property); //输出为PaaS
  ``` 
  
 
 
#### 两者区别总结 
 
 
#### 参考链接 
 
 https://www.geeksforgeeks.org/what-is-the-difference-between-string-and-string-in-typescript/?ref=lbp 
 https://www.geeksforgeeks.org/variables-datatypes-javascript/ 
 https://www.tutorialspoint.com/typescript/typescript_strings.htm 
 
  
点击关注，第一时间了解华为云新鲜技术~
                                        