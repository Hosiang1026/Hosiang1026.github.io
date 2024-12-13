---
title: 推荐系列-JavaScript核心原理解析
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 733
cover_picture: 'https://api.ixiaowai.cn/gqapi/gqapi.php'
abbrlink: c818cb7
date: 2021-04-15 09:10:30
---

&emsp;&emsp;download:JavaScript核心原理解析 代码规范通常包括以下几个方面: 变量和函数的命名规则 空格，缩进，注释的使用规则。 其他常用规范…… 规范的代码可以更易于阅读与维护。 代码规范一般在开...
<!-- more -->

                                                                                                                                                                                        download:JavaScript核心原理解析 
代码规范通常包括以下几个方面: 
 
 变量和函数的命名规则 
 空格，缩进，注释的使用规则。 
 其他常用规范…… 
 
规范的代码可以更易于阅读与维护。 
代码规范一般在开发前规定，可以跟你的团队成员来协商设置。 
 
 
#### 变量名 
变量名推荐使用驼峰法来命名(camelCase): 
 
 
   firstName = 
    
  "John"; 
   lastName = 
    
  "Doe"; 
   
   price = 
    
  19.90; 
   tax = 
    
  0.20; 
   
   fullPrice = price + (price * tax); 
  
 
 
 
#### 空格与运算符 
通常运算符 ( = + - * / ) 前后需要添加空格: 
 
  
 ##### 实例: 
  
  var 
   x = y + z; 
   
  var 
   values = [ 
  "Volvo", 
    
  "Saab", 
    
  "Fiat"]; 
  
 
 
 
#### 代码缩进 
通常使用 4 个空格符号来缩进代码块： 
 
  
 ##### 函数: 
  
  function 
   toCelsius(fahrenheit) { 
       
    
  return 
   ( 
  5 
   / 
    
  9) * (fahrenheit - 
    
  32); 
   } 
  

                                        