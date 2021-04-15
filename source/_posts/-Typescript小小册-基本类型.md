---
title: 推荐系列--Typescript小小册-基本类型
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 2086
cover_picture: 'https://api.ixiaowai.cn/gqapi/gqapi.php'
abbrlink: e87f58f0
date: 2021-04-15 09:46:45
---

&emsp;&emsp;概述 Javascript没有强制的类型检查，不同类型的变量可以互相赋值，因此可能会引发一些因为类型匹配而发生的问题。Typescript的变量都具有类型，包括基本类型和复合类型，不同的类型之间不一...
<!-- more -->

                                                                                                                                                                                        #### 概述 
Javascript没有强制的类型检查，不同类型的变量可以互相赋值，因此可能会引发一些因为类型匹配而发生的问题。Typescript的变量都具有类型，包括基本类型和复合类型，不同的类型之间不一定兼容。 
#### 声明 
要声明一个变量的类型，需要采用如下的语法： 
 
 ```java 
  let a: string = 'a'

  ``` 
  
其中 
 ```java 
  : string
  ``` 
 表示变量 
 ```java 
  a
  ``` 
 是一个字符串类型。等号之后表达式的值必须与变量类型兼容，否则编译器会报错。 
在变量初始化定义语句中，如果没有声明等号左边的变量的类型，编译器会根据等号右边变量的类型来推断等号左边变量的类型。 
示例： 
 
 ```java 
  let a = 'a' // a是string类型
let b =  1 // b是number类型
let c = a // c是string类型
c = b // 错误。无法将number类型赋值给string类型


  ``` 
  
#### 类型 
Typescript的基本类型有： 
 
 string 
 number 
 boolean 
 symbol 
 null 
 undefined 
 any 
 unknown 
 never 
 void 
 
###### string, number, boolean, symbol 
 
 ```java 
  string
  ``` 
 、 
 ```java 
  number
  ``` 
 、 
 ```java 
  boolean
  ``` 
 、 
 ```java 
  symbol
  ``` 
 对应Javascript中包装类 
 ```java 
  String
  ``` 
 、 
 ```java 
  Number
  ``` 
 、 
 ```java 
  Boolean
  ``` 
 、 
 ```java 
  Symbol
  ``` 
 的区别。但是前者是类型，后者本质上是构造函数。 
在编程中，应始终使用前者来表示变量的类型。 
###### null, undefined 
 
 ```java 
  null
  ``` 
 和 
 ```java 
  undefined
  ``` 
 被单独作为变量类型，与其它类型并不兼容。 
 ```java 
  null
  ``` 
 表示空指针，但是不能将 
 ```java 
  null
  ``` 
 理解为其它面向对象语言中未实例化的空变量。 
###### any 
当一个变量的类型是任意或无法确定时，我们可以声明它为 
 ```java 
  any
  ``` 
 类型。 
 
 ```java 
  any
  ``` 
 类型变量可以赋值给任意类型的变量，也可以被赋值为任意类型变量。可以读取它的任意属性（即使不存在），读取的属性也是 
 ```java 
  any
  ``` 
 类型。 
编译器不会对 
 ```java 
  any
  ``` 
 类型变量做类型检查，因此有时候可能有风险，在一些语法检查工具（如ESLint）常常不允许使用 
 ```java 
  any
  ``` 
 。 
示例： 
 
 ```java 
  let a: any = 0

let b: number = a
let c: string = a
let d = a.value
a = 'a'

  ``` 
  
###### unknown 
为了弥补 
 ```java 
  any
  ``` 
 过于宽泛和自由的弊病，但同时有需要一种表示未知的类型， 
 ```java 
  unknown
  ``` 
 出现了。 
 
 ```java 
  unknown
  ``` 
 可以被赋值为任意类型的变量，但是只能赋值给 
 ```java 
  unknown
  ``` 
 或 
 ```java 
  any
  ``` 
 类型的变量，同时也不能读取它的任何属性。 
示例： 
 
 ```java 
  let a: unknown = 0

let b: number = a // 错误
let c: string = a // 错误
let d = a.value // 错误
a = 'a' // 合法

  ``` 
  
它的作用之一是预先声明一个不确定类型的变量，等到实际使用时再转换类型。示例： 
 
 ```java 
  let a: unknown // 声明
a = 'a' // 赋值
let b:string = a as string // 使用 

  ``` 
  
也可以作为两种无法兼容的类型转换时的中间类型（这种操作可能有风险）。示例： 
 
 ```java 
  let a:string = (0 as unknown) as string

  ``` 
  
有关类型转换的内容将在之后介绍。 
###### never 
 
 ```java 
  never
  ``` 
 表示正常情况下无法到达的类型，比如抛出异常的函数： 
 
 ```java 
  function error(): never {
  throw new Error('error')
}

  ``` 
  
###### void 
 
 ```java 
  void
  ``` 
 表示空类型，通常用在没有返回值的函数上。 
示例： 
 
 ```java 
  function log(arg: string): void{
  console.log(arg)
}

  ``` 
 
                                        