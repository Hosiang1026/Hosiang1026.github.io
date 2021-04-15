---
title: 推荐系列-JavaScript 基本数据类型
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 648
cover_picture: 'https://api.ixiaowai.cn/gqapi/gqapi.php'
abbrlink: d78db7c6
date: 2021-04-15 09:53:06
---

&emsp;&emsp;JavaScript 数据类型分为两种，一种是基本数据类型：String、Number、Boolean、undefined 和 null，另一种是复杂数据类型：Object。JavaScript 不支持任何创建自定义类型的机制，所有的值最终...
<!-- more -->

                                                                                                                                                                                        JavaScript 数据类型分为两种，一种是基本数据类型：String、Number、Boolean、undefined 和 null，另一种是复杂数据类型：Object。JavaScript 不支持任何创建自定义类型的机制，所有的值最终都将是上述六种数据类型之一。 
首先，我们了解一下基本数据类型。 
1. String 
JavaScript 采用 UTF-16 编码的 Unicode 字符集，JavaScript 中的字符串是由一组无符号的 16 位值组成的序列，最常用的 Unicode 字符都是通过 16 位的内码来表示的，并代表字符串中的单个字符 
var p = 'π'
var e = 'e'
p.length // 1; p 包含一个 16 位值
e.length // e 通过 UTF-16 编码之后包含两个 16 位值："\ud835\udc52" 
只要引用了字符串的属性，JavaScript 就会将字符串值通过new String(s)的方式转换为对象，这个对象继承了字符串的方法，一旦引用结束，这个新创建的对象就会被销毁 
var s = 'test'
s.len = 4
var t = s.len // undifined
复制代码 
 
 
这个临时对象称之为包装对象，字符串（还有数字和布尔值）的属性都是只读的，并不能赋值，有别于其他的对象 
字符串是存放在堆内存里面的，一旦创建就不可更改，如果想改变某个变量保存的字符串，就必须先销毁原来的字符串，再用一个新的来填充该变量。 
2. Number 
在 JavaScript 里，所有与数字有关的都是 Number 类型，Number 类型又分为整数值和浮点数值，但是保存浮点数的内存空间是保存整数的内存空间的两倍，所以 JavaScript 当然不希望在寸土寸金的内存空间里过多的存放浮点数，有下面两种情况会将浮点数转成整数： 
 
 小数点后面没有跟数字，比如 1. 
 小数点后面等于 0，比如 1.00 
 
都会转成整数 1 
在 Number 类型里还有一个值是 NaN(Not a Number)，如果面试官问你该怎么判断一个变量是不是 NaN 呢？你当然不能答使用x == NaN，因为这个特殊的值与任何值都不相等，要想判断它还得使出真功夫。有以下两种方法可以判断： 
 
 使用x != x来判断，因为这货连自己都不认识，只要返回 true，那就证明 x 是 NaN 无疑了 
 JavaScript 为我们提供了函数isNaN()来方便我们 
 
 
3. Boolean 
Boolean 类型没什么好说的，就两个值：true 和 false，但是需要注意的是在 JavaScript 中，类型转换为我们提供了更多的可能性，现在就让我们来简单了解一下其他数据类型转换成布尔类型。 
数值类型 转换成布尔值 undefined false null false 布尔值 true/false 数字 +0、-0 和 NaN 是 false，其他是 true 字符串 空字符串是 false，其他是 true 对象 true 
 
4. Undefined 
Undefined 类型只有一个值 undefined，这个值用来表示已声明但未被赋值的变量。 
5. Null 
Null 也是只有一个值：null，用来表示空对象指针。 
 
typeof 操作符 
了解基本数据类型的时候，就不得不来了解一下 typeof 操作符，它可是我们判断基本数据类型的一个好帮手。 
typeof 用来检测变量的数据类型，返回值一共有六个http://www.fuke029.com/ 
 
 'number' 
 'string' 
 'boolean' 
 'object' 
 'undefined' 
 'function' 
 
注意这六种都是字符串类型，如果我们写typeof(typeof('123'))那么返回的是'string' 
 
说完基本数据类型之后就是复杂类型了，复杂类型本身包含很多，后面我会针对每一种复杂类型进行详细讲述，欢迎关注让面试官刮目相看系列文章，如果有错或者更好的意见请指出，祝各位都能得到面试官的青睐，早日找到心仪工作！
                                        