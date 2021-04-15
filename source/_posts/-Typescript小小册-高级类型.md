---
title: 推荐系列--Typescript小小册-高级类型
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 892
cover_picture: 'https://api.ixiaowai.cn/gqapi/gqapi.php'
abbrlink: 140bd56a
date: 2021-04-15 09:48:03
---

&emsp;&emsp;概述 Typescript 的高级类型指操作基本类型和复合类型而得的类型，包括： 联合 交叉 泛型 类型别名 在讲具体的高级类型之前，我们先了解一下 Typescript 的类型别名。类型别名也是一种类型，...
<!-- more -->

                                                                                                                                                                                        #### 概述 
Typescript 的高级类型指操作基本类型和复合类型而得的类型，包括： 
 
 联合 
 交叉 
 泛型 
 
#### 类型别名 
在讲具体的高级类型之前，我们先了解一下 Typescript 的类型别名。类型别名也是一种类型，用一个单词代表可能比较复杂的类型声明，用关键字 
 ```java 
  type
  ``` 
 表示。 
示例： 
 
 ```java 
  type S = string

let a: S = 'a'

  ``` 
  
这里用 
 ```java 
  S
  ``` 
 作为 
 ```java 
  string
  ``` 
 的别名，使用方法和 
 ```java 
  string
  ``` 
 一模一样。 
别名不仅可以代表基本类型，它可以代表任意类型。示例： 
 
 ```java 
  type SA = string[] // 代表字符串数组
type Handler = (x: string) => void // 代表函数
type I = {
  // 代表接口
  name: string
  value: number
}
class C {
  name: string = 'a'
  value: number = 0
}
type D = C // 代表类

  ``` 
  
#### 类型 
##### 联合 
联合类型是指变量为多个类型中的一种，是“或”的关系，用操作符 
 ```java 
  |
  ``` 
 表示。 
示例： 
 
 ```java 
  type StringOrNumber = string | number

let a: StringOrNumber = 'a'
let b: StringOrNumber = 0

function log(x: string | number) {
  console.log(x)
}

  ``` 
  
这里 
 ```java 
  StringOrNumber
  ``` 
 表示一种可以是字符串或者也可以是数字的类型，所以对于 
 ```java 
  StringOrNumber
  ``` 
 类型的变量，既可以赋值为字符串，也可以赋值为数字。 
在 Typescript 中， 
 ```java 
  null
  ``` 
 和 
 ```java 
  undefined
  ``` 
 与其它类型是同层级的，它们不是任何类型的子类型，也就是说我们不能用它们来表示一个特定类型的空指针。但是我们确实需要在一个变量未确定时保持为空状态，这时可以用联合类型来表示一个变量可为 
 ```java 
  null
  ``` 
 或 
 ```java 
  undefined
  ``` 
 。示例： 
 
 ```java 
  interface A {
  name: string
}

let a: A | null = null

  ``` 
  
###### 字面量类型 
Typescript 中字面量也可以作为一个类型。比如： 
 
 ```java 
  let a: 'A'

  ``` 
  
上述声明表示变量 
 ```java 
  a
  ``` 
 的值只能是 
 ```java 
  'A'
  ``` 
 ，赋值为其它值时会报错。 
数字和布尔也可以作为字面量类型。这看起来没什么用，但是这种特性一般会与联合结合起来使用。比如： 
 
 ```java 
  type Option = 'A' | 'B' | 'C' | 'D'

let a: Option = 'A'
let e: Option = 'E' // 错误

  ``` 
  
 
 ```java 
  Option
  ``` 
 类型的变量只能被赋值为 
 ```java 
  'A'
  ``` 
 、 
 ```java 
  'B'
  ``` 
 、 
 ```java 
  'C'
  ``` 
 、 
 ```java 
  'D'
  ``` 
 ���中一个值。这一种用法和枚举很像，比如： 
 
 ```java 
  enum Option {
  A,
  B,
  C,
  D
}

  ``` 
  
不同的是，字面量类型本质上是字符串，可以使用字符串的所有方法。而且，通过 
 ```java 
  keyof
  ``` 
 操作符，我们可以动态的生成字面量类型，这一点将在之后介绍。 
##### 交叉 
交叉类型是指多个类型合并成一个类型，是“且”的关系，用操作符 
 ```java 
  &
  ``` 
 表示。 
示例： 
 
 ```java 
  interface A {
  x: string
  y: number
}
interface B {
  x: string
  z: number
}

type C = A & B

let c: C = { x: 'x', y: 0, z: 1 }

  ``` 
  
交叉类型的成员包含了所有原类型的的所有成员，比如上述代码中， 
 ```java 
  c
  ``` 
 变量必须既是 
 ```java 
  A
  ``` 
 类型也是 
 ```java 
  B
  ``` 
 类型，也就是说它必须同时拥有两个类型要求的属性。 
有一些类型是无法交叉的，比如基本类型。示例： 
 
 ```java 
  type A = string & number

  ``` 
  
因为一个变量不可能既是字符串又是数字，所以最终 
 ```java 
  A
  ``` 
 类型是 
 ```java 
  never
  ``` 
 类型。 
如果被交叉的两个类型有同名但类型不同的成员，那么这两个同名成员也会被交叉。示例： 
 
 ```java 
  interface A {
  x: { a: string; b: number }
}
interface B {
  x: { a: string; c: number }
}

type C = A & B

let c: C = { x: { a: 'a', b: 0, c: 1 } }

  ``` 
  
类型 
 ```java 
  A
  ``` 
 和 
 ```java 
  B
  ``` 
 有同名但类型不同的成员 
 ```java 
  x
  ``` 
 ，交叉时两个 
 ```java 
  x
  ``` 
 成员也可以交叉，因此最终 
 ```java 
  x
  ``` 
 的类型为： 
 ```java 
  {a: string, b: number, c: number}
  ``` 
 。 
##### 泛型 
Typescript 中的泛型与其它面向对象语言中的泛型和相似，包括：泛型函数、泛型类和泛型接口。 
###### 泛型函数 
示例： 
 
 ```java 
  function merge<T, U>(x: T, y: U): { x: T; y: U } {
  let t: { x: T; y: U } = { x, y }

  return t
}

merge<string, number>('a', 0)

  ``` 
  
我们可以在中括号内声明函数中使用到的泛型变量，它代表了在调用函数时传入的类型。类型变量 
 ```java 
  T
  ``` 
 可以用在任何需要类型声明的地方，比如参数类型、返回值类型、局部变量类型等。 
箭头函数也可以包含泛型。示例： 
 
 ```java 
  const merge = <T, U>(x: T, y: U): { x: T; y: U } => {
  let t: { x: T; y: U } = { x, y }

  return t
}

  ``` 
  
###### 泛型类 
示例： 
 
 ```java 
  class Merge<T, U> {
  x: T
  y: U

  constructor(x: T, y: U) {
    this.x = x
    this.y = y
  }

  merge(): { x: T; y: U } {
    let t: { x: T; y: U } = { x: this.x, y: this.y }

    return t
  }
}

let merge = new Merge<string, number>()

  ``` 
  
我们可以在中括号内声明类中使用到的泛型变量，它代表了在实例化类时传入的类型。类型变量 
 ```java 
  T
  ``` 
 可以用在任何需要类型声明的地方，比如成员、构造方法参数类型等。 
###### 泛型接口 
示例： 
 
 ```java 
  interface Merge<T, U> {
  x: T
  y: U
}

let merge: Merge<string, number> = { x: 'a', y: 0 }

  ``` 
  
我们可以在中括号内声明接口中使用到的泛型变量，它代表了在声明变量类型时传入的类型。类型变量 
 ```java 
  T
  ``` 
 可以用在任何需要类型声明的地方，比如成员、方法参数类型等。 
###### 泛型约束 
由于在泛型类型中，泛型变量是在使用时传入的，所以在编译时无法得知其具体类型，那么读取类类型变量的任何成员都是不行的。比如： 
 
 ```java 
  function scale<T>(x: T): number {
  return x.length // 错误
}

  ``` 
  
虽然我们可能心里知道在使用时我们会传入一个具有 
 ```java 
  length
  ``` 
 成���的变量（比如字符串），但是在编译时编译器并不知道。因此，我们需要告诉编译器 
 ```java 
  T
  ``` 
 类型是那一类具有 
 ```java 
  length
  ``` 
 成员的类型。使用 
 ```java 
  extends
  ``` 
 关键字： 
 
 ```java 
  interface HasLength {
  length: number
}

function scale<T extends HasLength>(x: T): number {
  return x.length
}

scale('abc')

  ``` 
  
我们使用 
 ```java 
  extends
  ``` 
 对类型变量 
 ```java 
  T
  ``` 
 进行了约束，它必须具有 
 ```java 
  length
  ``` 
 属性。也就是是说 
 ```java 
  T
  ``` 
 类型必须实现或继承了 HasLength 类型。
                                        