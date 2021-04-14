---
title: 推荐系列-你写的Java对象究竟占多少内存-
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 687
cover_picture: 'https://static.oschina.net/uploads/img/202003/05110146_kWb8.jpeg'
abbrlink: 6f69ef7c
date: 2021-04-14 07:54:42
---

&emsp;&emsp;概述 Java 作为一个面向对象语言，给我们带来了多态，继承，封装等特性，使得我们可以利用这些特性很轻松的就能构建出易于扩展，易于维护的代码。作为一个Javaer，天天搞“对象”，那你写的对...
<!-- more -->

                                                                                                                                                                                         
#### 概述 
Java 作为一个面向对象语言，给我们带来了多态，继承，封装等特性，使得我们可以利用这些特性很轻松的就能构建出易于扩展，易于维护的代码。作为一个 ```java 
  Javaer
  ``` ，天天搞“对象”，那你写的对象究竟占用了多少内存呢？我们来看看你的“对象”是如何“败家”的。 
 
#### Java 对象头内存模型 
我们先来看看，一个Java 对象的内存模型是怎么样的？由于我们的虚拟机是分为32位和64位，那肯定它们的模型也是有区别的，下面我列出列32位虚拟机和64位虚拟机下的 ```java 
  Java
  ``` 对象头内存模型。  
 
 
因为笔者的本地环境是 ```java 
  jdk1.8
  ``` ,64位虚拟机，这里我以64位虚拟机（开启指针压缩）来分析，因为默认情况下， ```java 
  jdk1.8
  ```  在64位虚拟机默认开启指针压缩。 
Java 对象头主要包括两部分，第一部分就是  ```java 
  Mark Word
  ``` ，这也是  ```java 
  Java
  ```  锁实现原理中重要的一环，另外一部分是  ```java 
  Klass Word
  ``` 。 
Klass Word 这里其实是虚拟机设计的一个 ```java 
  oop-klass model
  ``` 模型，这里的 ```java 
  OOP
  ``` 是指 ```java 
  Ordinary Object Pointer
  ``` （普通对象指针），看起来像个指针实际上是藏在指针里的对象。而  ```java 
  klass
  ```  则包含 元数据和方法信息，用来描述  ```java 
  Java
  ```  类。它在64位虚拟机开启压缩指针的环境下占用 32bits 空间。 
Mark Word 是我们分析的重点，这里也会设计到锁的相关知识。 ```java 
  Mark Word
  ```  在64位虚拟机环境下占用 64bits 空间。整个 ```java 
  Mark Word
  ``` 的分配有几种情况： 
 
 未锁定（Normal）： 哈希码（ ```java 
  identity_hashcode
  ``` ）占用31bits，分代年龄（ ```java 
  age
  ``` ）占用4 bits，偏向模式（ ```java 
  biased_lock
  ``` ）占用1 bits，锁标记（ ```java 
  lock
  ``` ）占用2 bits，剩余26bits 未使用(也就是全为0) 
 可偏向（Biased）： 线程id 占54bits， ```java 
  epoch
  ```  占2 bits，分代年龄（ ```java 
  age
  ``` ）占用4 bits，偏向模式（biased_lock）占用1 bits，锁标记（lock）占用2 bits，剩余 1bit 未使用。 
 轻量锁定（Lightweight Locked）： 锁指针占用62bits，锁标记（ ```java 
  lock
  ``` ）占用2 bits。 
 重量级锁定（Heavyweight Locked）：锁指针占用62bits，锁标记（ ```java 
  lock
  ``` ）占用2 bits。 
 GC 标记：标记位占2bits，其余为空（也就是填充0） 
 
以上就是我们对Java对象头内存模型的解析，只要是Java对象，那么就肯定会包括对象头，也就是说这部分内存占用是避免不了的。所以，在笔者64位虚拟机，Jdk1.8（开启了指针压缩）的环境下，任何一个对象，啥也不做，只要声明一个类，那么它的内存占用就至少是96bits，也就是至少12字节。 
#### 验证模型 
我们来写点代码来验证一下上述的内存模型，这里推荐openjdk的jol工具，它可以帮助你查看对象内存的占用情况。 
首先添加maven依赖 
 ```java 
          <dependency>
            <groupId>org.openjdk.jol</groupId>
            <artifactId>jol-core</artifactId>
            <version>0.10</version>
        </dependency>

  ```  
我们先来看看，如果只是新建一个普通的类，什么属性也不添加，占用的空间是多少？ 
 ```java 
  /**
 * @description:
 * @author: luozhou
 * @create: 2020-02-26 10:00
 **/
public class NullObject {

}

  ```  
按照我们之前的Java对象内存模型分析，一个空对象，那就是只有一个对象头部，在指针压缩的条件下会占用 96 bit，也就是12byte。 
运行工具查看空间占用 
 ```java 
   public static void main(String[] args) {
        System.out.println(ClassLayout.parseInstance(new NullObject()).toPrintable());
    }

  ```  
上面这行代码会解析你新建一个NullObject对象，占用了多少内存。我们执行看看结果如何：  
这里我们发现结果显示： ```java 
  Instance size：16 bytes
  ``` ,结果就是16字节，我们之前预测的12字节不一样，为什么会这样呢？我们看到上图中有3行 object header，每个占用4字节，所以头部就是12字节，这里和我们的计算是一致的，最后一行是虚拟机填充的4字节，那为什么虚拟机要填充4个字节呢？ 
#### 内存对齐 
想要知道为什么虚拟机要填充4个字节，我们需要了解什么是内存对齐？ 
我们程序员看内存是这样的： 
 
上图表示一个坑一个萝卜的内存读取方式。但实际上 CPU 并不会以一个一个字节去读取和写入内存。相反 CPU 读取内存是一块一块读取的，块的大小可以为 2、4、6、8、16 字节等大小。块大小我们称其为内存访问粒度。如下图： 
 
假设一个32位平台的 CPU，那它就会以4字节为粒度去读取内存块。那为什么需要内存对齐呢？主要有两个原因： 
 
 平台（移植性）原因：不是所有的硬件平台都能够访问任意地址上的任意数据。例如：特定的硬件平台只允许在特定地址获取特定类型的数据，否则会导致异常情况。 
 性能原因：若访问未对齐的内存，将会导致 CPU 进行两次内存访问，并且要花费额外的时钟周期来处理对齐及运算。而本身就对齐的内存仅需要一次访问就可以完成读取动作。 
 
我用图例来说明 CPU 访问非内存对齐的过程： 
 
在上图中，假设CPU 是一次读取4字节，在这个连续的8字节的内存空间中，如果我的数据没有对齐，存储的内存块在地址1，2，3，4中，那CPU的读取就会需要进行两次读取，另外还有额外的计算操作： 
 
 CPU 首次读取未对齐地址的第一个内存块，读取 0-3 字节。并移除不需要的字节 0。 
 CPU 再次读取未对齐地址的第二个内存块，读取 4-7 字节。并移除不需要的字节 5、6、7 字节。 
 合并 1-4 字节的数据。 
 合并后放入寄存器。 
 
所以，没有进行内存对齐就会导致CPU进行额外的读取操作，并且需要额外的计算。如果做了内存对齐，CPU可以直接从地址0开始读取，一次就读取到想要的数据，不需要进行额外读取操作和运算操作，节省了运行时间。我们用了空间换时间，这就是���什么我们需要内存对齐。 
回到Java空对象填充了4个字节的问题，因为原字节头是12字节，64位机器下，内存对齐的话就是128位，也就是16字节，所以我们还需要填充4个字节。 
#### 非空对象占用内存计算 
我们知道了一个空对象是占用16字节，那么一个非空对象究竟占用多少字节呢？我们还是写一个普通类来验证下： 
 ```java 
  public class TestNotNull {
    private NullObject nullObject=new NullObject();
    private int a;
}

  ```  
这个演示类中引入了别的对象，我们知道 ```java 
  int
  ``` 类型是占用4个字节, ```java 
  NullObject
  ``` 对象占用16字节，对象头占12字节，还有一个很重要的情况  ```java 
  NullObject
  ``` 在当前这个类中是一个引用，所以不会存真正的对象，而只存引用地址，引用地址占4字节，所以总共就是12+4+4=20字节，内存对齐后就是24字节。我们来验证下是不是这个结果： 
 ```java 
  public static void main(String[] args) {
        //打印实例的内存布局
        System.out.println(ClassLayout.parseInstance(new TestNotNull()).toPrintable());
        //打印对象的所有相关内存占用
        System.out.println(GraphLayout.parseInstance(new TestNotNull()).toPrintable());
        //打印对象的所有内存结果并统计
         System.out.println(GraphLayout.parseInstance(new TestNotNull()).toFootprint());
    }

  ```  
结果如下： 
 
我们可以看到 ```java 
  TestNotNull
  ``` 的类占用空间是24字节，其中头部占用12字节，变量 ```java 
  a
  ``` 是 ```java 
  int
  ``` 类型，占用4字节,变量 ```java 
  nullObject
  ``` 是引用，占用了4字节，最后填充了4个字节，总共是24个字节，与我们之前的预测一致。但是，因为我们实例化了 ```java 
  NullObject
  ``` ,这个对象一会存在于内存中，所以我们还需要加上这个对象的内存占用16字节，那总共就是24bytes+16bytes=40bytes。我们图中最后的统计打印结果也是40字节，所以我们的分析正确。 
这也是如何分析一个对象真正的占用多少内存的思路，根据这个思路加上openJDK的jol工具就可以基本的掌握自己写的“对象”究竟败家了你多少内存。 
#### 总结 
本文我主要讲述了如何分析一个Java对象究竟占用多少内存空间，主要总结点如下： 
 
 Java对象头部内存模型在32位虚拟机和64位虚拟机是不一样的，64位虚拟机又分为开启指针压缩和不开启指针压缩两种对象头模型，所以总共有3种对象头模型。 
 内存对齐主要是因为平台的原因和性能的原因，本文主要解析的是性能方面的原因。 
 空对象的内存占用计算注意要计算内存对齐，非空对象的内存计算注意加上引用内存占用和原实例对象的空间占用。 
 
#### 参考 
1.http://cr.openjdk.java.net/~lfoltan/bug_jdk8067480/src/share/vm/oops/klass.hpp.html 
2.https://gist.github.com/arturmkrtchyan/43d6135e8a15798cc46c 
3.https://weekly-geekly.github.io/articles/447848/index.html 
4.https://developer.ibm.com/articles/pa-dalign/
                                        