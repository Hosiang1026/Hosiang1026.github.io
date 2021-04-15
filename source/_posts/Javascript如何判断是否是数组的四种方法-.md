---
title: 推荐系列-Javascript如何判断是否是数组的四种方法-
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 851
cover_picture: 'https://api.ixiaowai.cn/gqapi/gqapi.php'
abbrlink: 188f734f
date: 2021-04-15 09:48:03
---

&emsp;&emsp;一、通过instanceof判断：返回一个布尔值 let a = []; a instanceof Array; //true let b = {}; b instanceof Array; //false instanceof运算符检测Array.prototype属性是否存在于变量a的原型...
<!-- more -->

                                                                                                                                                                                         
 
 ```java 
  let a = [];
a instanceof Array; //true
let b = {};
b instanceof Array; //false

  ``` 
  
 
 ```java 
  instanceof
  ``` 
 运算符检测 
 ```java 
  Array.prototype
  ``` 
 属性是否存在于变量a的原型链上，显然变量a是一个数组，拥有 
 ```java 
  Array.prototype
  ``` 
 属性，所以为 
 ```java 
  true
  ``` 
  
 
 存在问题： 
 
 
 ```java 
  prototype
  ``` 
 属性是可以修改的，所以并不是最初判断为 
 ```java 
  true
  ``` 
 就一定永远为真。 
当我们的脚本拥有多个全局环境，例如html中拥有多个iframe对象， 
 ```java 
  instanceof
  ``` 
 的验证结果可能不会符合预期，例如： 
 
 ```java 
  //为body创建并添加一个iframe对象
var iframe = document.createElement('iframe');
document.body.appendChild(iframe);
//取得iframe对象的构造数组方法
xArray = window.frames[0].Array;
//通过构造函数获取一个实例
var arr = new xArray(1,2,3); 
arr instanceof Array;
//false

  ``` 
  
 
 导致这种问题是因为 
 ```java 
  iframe
  ``` 
 会产生新的全局环境，它也会拥有自己的 
 ```java 
  Array.prototype
  ``` 
 属性，让不同环境下的属性相同很明显是不安全的做法 
 所以 
 ```java 
  Array.prototype !== window.frames[0].Array.prototype
  ``` 
 ，想要 
 ```java 
  arr instanceof Array
  ``` 
 为 
 ```java 
  true
  ``` 
 ，须保证 
 ```java 
  arr
  ``` 
 为原始 
 ```java 
  Array
  ``` 
 构造函数创建才可行。 
 
 
实例的构造函数属性 
 ```java 
  constructor
  ``` 
 指向构造函数，通过 
 ```java 
  constructor
  ``` 
 属性也可以判断是否为一个数组。 
 
 ```java 
  let a = [1,3,4];
a.constructor === Array;//true

  ``` 
  
这种判断也会存在多个全局环境的问题，导致的问题与 
 ```java 
  instanceof
  ``` 
 相同。 
 
 ```java 
  //为body创建并添加一个iframe标签
var iframe = document.createElement('iframe');
document.body.appendChild(iframe);
//取得iframe对象的构造数组方法
xArray = window.frames[window.frames.length-1].Array;
//通过构造函数获取一个实例
var arr = new xArray(1,2,3); 
arr.constructor === Array;//false

  ``` 
  
 
 
 ```java 
  Object.prototype.toString().call()
  ``` 
 可以获取到对象的不同类型 
 
 ```java 
  //检验是否为数组
let a = [1,2,3]
Object.prototype.toString.call(a) === '[object Array]';//true
//检验是否是函数
let b = function () {};
Object.prototype.toString.call(b) === '[object Function]';//true
//检验是否是数字
let c = 1;
Object.prototype.toString.call(c) === '[object Number]';//true
//检验是否为对象
let d = {};
Object.prototype.toString.call(d) === '[object Object]' //true

  ``` 
  
对于多全局环境时，  
 ```java 
  Object.prototype.toString().call()
  ``` 
 也能符合预期处理判断。 
 
 ```java 
  //为body创建并添加一个iframe标签
var iframe = document.createElement('iframe');
document.body.appendChild(iframe);
//取得iframe对象的构造数组方法
xArray = window.frames[window.frames.length-1].Array;
//通过构造函数获取一个实例
var arr = new xArray(1,2,3); 
console.log(Object.prototype.toString.call(arr) === '[object Array]');//true

  ``` 
  
 
 
 ```java 
  Array.isArray()
  ``` 
  用于确定传递的值是否是一个数组，返回一个布尔值。 
 
 ```java 
  let a = [1,2,3]
Array.isArray(a);//true

  ``` 
  
简单好用，且对于多全局环境， 
 ```java 
  Array.isArray()
  ``` 
  同样能准确判断， 
 
 Array.isArray() 是在ES5中提出，可能会存在ES5之前不支持此方法的情况 
 解决方法： 
 
配合 
 ```java 
  Object.prototype.toString().call()
  ``` 
 进行封装 
 
 ```java 
  function checkArray(arg){
    if (!Array.isArray) {
      Array.isArray = function(arg) {
        return Object.prototype.toString.call(arg) === '[object Array]';
      };
    }
}

  ``` 
  
 
 
 从ES5新增isArray()方法正是为了提供一个稳定可用的数组判断方法 
 对于ES5之前不支持此方法的问题，我们可以做好兼容进行自行封装 

                                        