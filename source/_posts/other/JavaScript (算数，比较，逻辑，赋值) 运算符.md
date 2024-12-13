---
title: 推荐系列-JavaScript (算数，比较，逻辑，赋值) 运算符
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 2031
cover_picture: 'https://api.ixiaowai.cn/gqapi/gqapi.php'
abbrlink: 706d5327
date: 2021-04-15 09:46:45
---

&emsp;&emsp;JavaScript 运算符用于赋值，比较值，执行算术运算等。 算数运算符 算术运算符用于执行两个变量或值的运算。 |运算符| 描述| |-|-| |+|加法| |-|减法| |*|乘法| |/|除法| |%|系数| |++|递增|...
<!-- more -->

                                                                                                                                                                                        JavaScript 运算符用于赋值，比较值，执行算术运算等。 
##### 算数运算符 
算术运算符用于执行两个变量或值的运算。 |运算符| 描述| |-|-| |+|加法| |-|减法| |*|乘法| |/|除法| |%|系数| |++|递增| |--|递减| |**| 幂| 加法运算符: 加法运算符  
 ```java 
  +
  ``` 
  加数： 
 
 ```java 
  var x = 7;
var y = 8;
var z = x + y; 

  ``` 
  
减法运算符: 减法运算符  
 ```java 
  -
  ``` 
  减数。 
 
 ```java 
  var x = 7;
var y = 8;
var z = x - y; 

  ``` 
  
乘法运算符: 乘法运算符  
 ```java 
  *
  ``` 
  乘数。 
 
 ```java 
  var x = 7;
var y = 8;
var z = x * y; 

  ``` 
  
除法运算符: 除法运算符  
 ```java 
  /
  ``` 
  除数。 
 
 ```java 
  var x = 7;
var y = 2;
var z = x / y; 

  ``` 
  
系数运算符： 系数运算符  
 ```java 
  %
  ``` 
  返回除法的余数。 
 
 ```java 
  var x = 7;
var y = 2;
var z = x % y; 

  ``` 
  
递增运算符: 递增运算符  
 ```java 
  ++
  ``` 
  对数值进行递增。 
 
 ```java 
  var x = 7;
x++;
var z = x;

  ``` 
  
递减运算符： 递减运算符  
 ```java 
  --
  ``` 
  对数值进行递减。 
 
 ```java 
  var x = 7;
x--;
var z = x; 

  ``` 
  
幂运算符： 取幂运算符  
 ```java 
  **
  ``` 
  将第一个操作数提升到第二个操作数的幂。 
 
 ```java 
  var x = 5;
var z = x ** 2;          // 结果是 25

  ``` 
  
 
##### 比较运算符 
比较运算符用于逻辑语句的判断，从而确定给定的两个值或变量是否相等。 |运算符| 描述| |-|-| |==|相等| |===|严格相等| |!=|不等| |!==|严格不等| |>|大于| |<|小于| |>=|大于等于| |<=|小于等于| 
相等运算符：  
 ```java 
  ==
  ``` 
  会为两个不同类型的操作数转换类型，然后进行严格比较。 
 
 ```java 
  console.log(1 == 1);    // true
console.log(1 == 2);    // false
console.log(1 == true); // true
console.log(1 == '1');  // true

  ``` 
  
 
 相等运算符，在对两个操作数进行比较之前，会将两个操作数转换成相同的类型。 
 
严格相等运算符:  
 ```java 
  ===
  ``` 
  不会对操作数进行类型转换，只有当值相等并且类型也是相等时才会返回 true。 
 
 ```java 
  console.log(1 === 1);     // true
console.log(1 === 2);     // false
console.log(1 === true);  // false
console.log(1 === false); // false
console.log(1 === '1');   // false

  ``` 
  
 
 不同类型的值进行比较时，会返回 false. 
 
不等运算符:  
 ```java 
  ！=
  ``` 
  只有当操作数不相等时才返回true，如果两操作数不是同一类型，会将操作数转为同意类型再进行比较。 
 
 ```java 
  var a = 1;
var b = 2;
var c = '1';

console.log(a != 1);  // false
console.log(a != b);  // true
console.log(a != c);  // false

  ``` 
  
严格不等运算符:  
 ```java 
  !==
  ``` 
  当操作数不相等或不同类型时返回 true。 
 
 ```java 
  var a = 1;
var b = 2;
var c = '1';

console.log(a !== 1);  // false
console.log(a !== b);  // true
console.log(a !== c);  // true

  ``` 
  
大于运算符:  
 ```java 
  >
  ``` 
  只有当左操作数大于右操作数时才返回 true。 
 
 ```java 
  console.log(5 > 1);   // true
console.log(5 > 10);  // false
console.log(5 > '5'); // false

  ``` 
  
小于运算符:  
 ```java 
  <
  ``` 
  只有当左操作数小于右操作数时才返回 true。 
 
 ```java 
  console.log(5 < 1);   // false
console.log(5 < 5);   // false
console.log(5 < 10);  // true
console.log(5 < '5'); // false

  ``` 
  
大于等于运算符:  
 ```java 
  >=
  ``` 
  只有当左操作数大于或者等于右操作数时才返回 true。 
 
 ```java 
  console.log(5 >= 1);   // true
console.log(5 >= 5);   // true
console.log(5 >= 10);  // false
console.log(5 >= '5'); // true

  ``` 
  
小于等于运算符:  
 ```java 
  < 
  ``` 
  只有当左操作数小于或者等于右操作数时才返回 true。 
 
 ```java 
  console.log(5 <= 1);   // false
console.log(5 <= 5);   // true
console.log(5 <= 10);  // true
console.log(5 <= '5'); // true

  ``` 
  
 
##### 逻辑运算符 
逻辑运算符用于判定变量或值之间的逻辑。 
 
 逻辑与  
 ```java 
  && 
  ``` 
  
 逻辑或  
 ```java 
  ||
  ``` 
  
 逻辑非  
 ```java 
  !
  ``` 
  
 
逻辑与  
 ```java 
  && 
  ``` 
 : 
 
 ```java 
  a1 = true  && true      // t && t 返回 true
a2 = true  && false     // t && f 返回 false
a3 = false && true      // f && t 返回 false
a4 = false && (3 == 4)  // f && f 返回 false
a5 = "Cat" && "Dog"     // t && t 返回 "Dog"
a6 = false && "Cat"     // f && t 返回 false
a7 = "Cat" && false     // t && f 返回 false
a8 = ''    && false     // f && f 返回 ""
a9 = false && ''        // f && f 返回 false

  ``` 
  
逻辑或  
 ```java 
  ||
  ``` 
 : 
 
 ```java 
  o1 = true  || true      // t || t 返回 true
o2 = false || true      // f || t 返回 true
o3 = true  || false     // t || f 返回 true
o4 = false || (3 == 4)  // f || f 返回 false
o5 = "Cat" || "Dog"     // t || t 返回 "Cat"
o6 = false || "Cat"     // f || t 返回 "Cat"
o7 = "Cat" || false     // t || f 返回 "Cat"
o8 = ''    || false     // f || f 返回 false
o9 = false || ''        // f || f 返回 ""

  ``` 
  
逻辑非  
 ```java 
  !
  ``` 
 : 
 
 ```java 
  n1 = !true              // !t 返回 false
n2 = !false             // !f 返回 true
n3 = !''                // !f 返回 true
n4 = !'Cat'             // !t 返回 false

  ``` 
  
 
##### 赋值运算符 
赋值运算符用于给 JavaScript 变量赋值。 
 
  
   
   运算符 
   描述 
   
  
  
   
   = 
   赋值 
   
   
   += 
   加法赋值 
   
   
   -= 
   减法赋值 
   
   
   *= 
   乘法赋值 
   
   
   /= 
   除法赋值 
   
   
   %= 
   取模赋值 
   
  
 
赋值运算符：  
 ```java 
  =
  ``` 
  赋值运算符向变量赋值。 
 
 ```java 
  var x = 7;

  ``` 
  
加法赋值运算符：  
 ```java 
  +=
  ``` 
  赋值运算符向变量添加值。 
 
 ```java 
  var x = 7;
x += 8; 

  ``` 
  
减法赋值运算符:  
 ```java 
  -=
  ``` 
  赋值运算符从变量中减去一个值。 
 
 ```java 
  var x = 7;
x -= 8; 

  ``` 
  
乘法赋值运算符:  
 ```java 
  *=
  ``` 
  赋值运算符相乘变量。 
 
 ```java 
  var x = 7;
x *= 8; 

  ``` 
  
除法赋值运算符:  
 ```java 
  /=
  ``` 
  赋值运算符对变量相除。 
 
 ```java 
  var x = 7;
x /= 8; 

  ``` 
  
取模赋值运算符:  
 ```java 
  %=
  ``` 
  赋值运算符把余数赋值给变量。 
 
 ```java 
  var x = 7;
x %= 8; 

  ``` 
 
                                        