---
title: JavaScript代码规范
categories:
  - 开发
  - Java
tags:
  - Java
abbrlink: aa03cc2

updated: 2026-09-15 14:00:00
sticky: 4
top: 64
---

命名、缩进、注释等 JavaScript 代码规范。

<!-- more -->

- 变量和函数的命名规则
- 空格，缩进，注释的使用规则。
- 其他常用规范……

规范的代码可以更易于阅读与维护。
代码规范一般在开发前规定，可以跟你的团队成员来协商设置。

### 一、JavaScript代码规范

#### 1.1 变量名

变量名推荐使用驼峰法来命名(camelCase):

```
firstName = "John";
lastName = "Doe";

price = 19.90;
tax = 0.20;

fullPrice = price + (price * tax);
```

#### 1.2 空格与运算符

通常运算符 ( = + - * / ) 前后需要添加空格:

#### 实例:

```
var x = y + z;

var values = [
  "Volvo",
  "Saab",
  "Fiat"
];
```

#### 1.3 代码缩进

通常使用 4 个空格符号来缩进代码块：

#### 函数:

```
function toCelsius(fahrenheit) {
    return (5 / 9) * (fahrenheit - 32);
}
```
