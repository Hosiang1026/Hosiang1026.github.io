---
title: 推荐系列-Kotlin Vocabulary - ���构声明详解
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 829
cover_picture: 'https://devrel.andfun.cn/devrel/posts/2021/04/c537e0702d709.jpg'
abbrlink: 21f35cec
date: 2021-04-15 10:04:46
---

&emsp;&emsp;有时候您会想要将一个包含了多个字段的对象分解，以初始化几个单独的变量。为了实现这点，您可以使用 Kotlin 的解构声明功能。继续阅读本文以了解解构的使用、Kotlin 默认提供的类型、如何在...
<!-- more -->

                                                                                                                                                                                        ![Test](https://devrel.andfun.cn/devrel/posts/2021/04/c537e0702d709.jpg  'Kotlin Vocabulary - ���构声明详解') 
有时候您会想要将一个包含了多个字段的对象分解，以初始化几个单独的变量。为了实现这点，您可以使用 Kotlin 的解构声明功能。继续阅读本文以了解解构的使用、Kotlin 默认提供的类型、如何在您自己的类和您无法控制但认为将会从解构中受益的类中实现解构，以及这一切的内部实现。 
#### 用法 
解构声明允许我们使用以下方式定义本地值或变量: 
 
 ```java 
  /* Copyright 2020 Google LLC.  
   SPDX-License-Identifier: Apache-2.0 */

fun play() {
  val (name, breed) = goodDoggo
  println("Best doggo: $name")
}

  ``` 
  
使用解构可以非常方便地处理来自函数或集合的数据: 
 
 ```java 
   /* Copyright 2020 Google LLC.  
   SPDX-License-Identifier: Apache-2.0 */

fun getBestDoggoAndOwner(): Pair<Doggo, Owner> { ...}

// 数据来自 Pair 时的用法
fun play() {
    val (doggo, owner) = getBestDoggoAndOwner()
}


fun play(doggoOwner: Map<Doggo, Owner>) {
    // 在集合和循环中使用解构
    for( (doggo, owner) in doggoOwner){
        ...
    }
}

  ``` 
  
默认情况下，所有数据类均支持解构。 
对于一个类的字段，您可以选择只用其变量的子集: 
 
 ```java 
  /* Copyright 2020 Google LLC.  
   SPDX-License-Identifier: Apache-2.0 */

data class Doggo(
    val name: String,
    val breed: String,
    val rating: Int = 11
)

val (name, breed, rating) = goodDoggo
val (name, breed) = goodDoggo //不需要时可以忽略 rating 字段

  ``` 
  
解构不允许您选择使用某个确切的字段；它永远使用前 x 个字段，这里的 x 是您所声明的变量数。这样做的缺点是很容易造成错误，比如下面这段代码便可能造成意外的结果: 
 
 ```java 
  val (name, rating) = goodDoggo

  ``` 
  
rating 值事实上会持有 goodDoggo.breed 的值。您将会看到一个警告: "Variable name ‘rating’ matches the name of a different component" (‘rating’ 变量名匹配了名字不同的 component) 并且建议您将 rating 重命名为 breed。由于��个警告只存在于 IDE 中，而且不是编译器警告，您很容易就会注意不到它: 
![Test](https://devrel.andfun.cn/devrel/posts/2021/04/c537e0702d709.jpg  'Kotlin Vocabulary - ���构声明详解') 
 
如果您只需要一部分不连续的字段，可以使用 _ 代替那些您不感兴趣的字段，Kotlin 将会跳过它们。这样一来示例就会变成下面这样: 
 
 ```java 
  val (name, _, rating) = goodDoggo

  ``` 
  
#### 内部原理 
让我们通过反编译后的数据类代码来看看究竟发生了什么。本文将会只专注于那些为解构生成的函数，如果需要了解更多关于数据类的信息，请期待我们未来的文章。 
想要查看反编译后的 Java 代码，您可以在 Android studio 中使用 Tools -> Kotlin -> Show Kotlin Bytecode 然后点击 Decompile 按钮。 
 
 ```java 
   /* Copyright 2020 Google LLC.  
   SPDX-License-Identifier: Apache-2.0 */
   
public final class Doggo {
   @NotNull
   private final String name;
   @NotNull
   private final String breed;
 
  public Doggo(@NotNull String name, @NotNull String breed, int rating) {
   ...
   }
   ...

   @NotNull
   public final String component1() {
      return this.name;
   }

   @NotNull
   public final String component2() {
      return this.breed;
   }
...
}

  ``` 
  
我们看到编译器为主构造函数中声明的每个属性都生成了一个名为 componentN 的函数，这里的 N 是字段在主构造函数中的索引。 
#### 实现解构 
正如我们前面所看到的，解构的实现有赖于 componentN 函数。所以如果您想要为一个不支持解构的类添加解构功能，只需要实现对应的 componentN operator 函数即可。请确保您的函数使用了 operator 前缀。 
 
 ```java 
  /* Copyright 2020 Google LLC.  
   SPDX-License-Identifier: Apache-2.0 */

class Doggo(
    val name: String,
    val breed: String
) {
    operator fun component1(): String = name
    
    operator fun component2(): String = breed

    ...
}

  ``` 
  
#### 为不属于您的类实现解构 
Kotlin 允许您通过扩展函数为不属于您的类实现解构。举个例子，Map.Entry 是一个接口并且不支持解构。为了方便使用，Kotlin 为其创建了 component1() 和 component2() 函数，分别返回 Map.Entry 的键和值。 
#### 总结 
当您需要将一个对象的字段拆解为值或者变量时，可以使用解构功能。它在内部是通过提供一系列的 componentN operator 函数实现的，所以当您认为可以通过此功能受益时，可以自己为您的类提供这些函数，便可以实现解构功能。
                                        