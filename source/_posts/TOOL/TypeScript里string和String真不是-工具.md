---
title: TypeScript里string和String真不是一回事
categories:
  - 工具
  - 前端
tags:
  - JavaScript
  - TypeScript
abbrlink: 923d20a2
date: 2025-01-01 00:00:00
top: 183
published: false
---

与JavaScript语言不同的是，TypeScript使用的是静态类型，比如说它指定了变量可以保存的数据类型。如下图所示，如果在JS中，指定变量可以保存的数据类型，会报错：“类型注释只可以在TS文件中被使用”：

<!-- more -->

### 一、TypeScript中string和String的区别

#### 1.1 背景

与JavaScript语言不同的是，TypeScript使用的是静态类型，比如说它指定了变量可以保存的数据类型。如下图所示，如果在JS中，指定变量可以保存的数据类型，会报错：“类型注释只可以在TS文件中被使用”：

TypeScript是JavaScript的超集（superset），TypeScript需要编译（语法转换）生成JavaScript才能被浏览器执行，它也区分了string和String这两个数据类型。通常来说，string表示原生类型，而String表示对象。

#### 1.3 原生string

JavaScript在ES6标准里支持6种原生类型（number），string是其中之一。

原生的string是不包含属性的值（即没有properties），包括字面上没有定义类型、字面上定义了string、字面上定义了String和一些从string函数调用返回的strings也都可以被归为原生类型：

```typescript
let msg: string = 'Hello world!';
let msg2: String = 'Hello world!';
let msg22 = 'Hello world!'; // 字面上没有定义类型
```

以上三个变量的类型（`typeof()`）是 `string`。

#### 1.4 对象String

对象是不同属性的累积，一个对象可以调用许多相应的方法。`let msg3: String = new String('Hello world!');` 这个变量 `msg3` 的类型就是 `object`：`console.log(typeof(msg3)); // object`。String对象支持的方法：

#### 1.5 代码对比

我们对下面4个变量进行类型的探索与比较：

```typescript
let msg: string = 'Hello world!';
let msg2: String = 'Hello world!';
let msg22 = 'Hello world!'; // 字面上没有定义类型
let msg3: String = new String('Hello world!');

console.log(typeof(msg)); // string
console.log(typeof(msg2)); // string
console.log(typeof(msg22)); // string
console.log(typeof(msg3)); // object
console.log(msg === msg2); // true
console.log(msg === msg3); // false
console.log(msg2 === msg3); // false
```

#### 1.6 为什么需要String对象

首先，当我们使用关键字 `new` 新建一个 String 对象的时候，TS会创建一个新的对象；即我们用 `new` 新建了两个 String 对象，即使内容相同，它们也是指向不同的内存。
举下面两个栗子：
1. 当用 `a1`、`b1` 代表相同值的两个变量的时候，它们是相同的；而当用 `new` 新建两个对象的时候，即使值相同，它们也是不同的（下图会输出 false, true）：

```typescript
var a1 = 'hello';
var b1 = 'hello';
console.log(a1 == b1); // true

var a2 = new String('hello');
var b2 = new String('hello');
console.log(a2 == b2); // false
console.log(a1 == a2); // true
```

2. `eval()` 函数的作用：用来计算表达式的值。如果我们把 `eval()` 直接赋给 string，而 string 里面是计算式的字符串，那么它会返回计算后的值；而如果我们把 `eval()` 赋给 String，因为它不是原生类型，它只会返回 String 这个对象（下图会输出 27，"8 + 20"，28）：

```typescript
console.log(eval('8 + 19')); // 27
console.log(eval(new String('8 + 20'))); // "8 + 20"
console.log(eval('8 + 20')); // 28
```

其次，因为 String 对象可以有属性。我们可以用 String 对象在属性里保留一个额外的值。即使这个用法并不常见，但是仍然是 TS 的一个特性：

```typescript
var prim = 'hello HW';
var obj = new String('hello HW Cloud');

prim.property = 'PaaS'; // Invalid
obj.property = 'PaaS'; // Valid
console.log(obj.property); // 输出为PaaS
```

#### 1.7 两者区别总结

https://www.geeksforgeeks.org/what-is-the-difference-between-string-and-string-in-typescript/?ref=lbp

https://www.geeksforgeeks.org/variables-datatypes-javascript/
https://www.tutorialspoint.com/typescript/typescript_strings.htm
