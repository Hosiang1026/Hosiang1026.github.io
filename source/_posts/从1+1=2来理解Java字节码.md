---
title: 推荐系列-从1+1=2来理解Java字节码
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 786
cover_picture: 'https://static.oschina.net/uploads/img/202001/09181317_HsIR.jpg'
abbrlink: 7a4d828d
date: 2021-04-14 07:54:42
---

&emsp;&emsp;背景 前不久《深入理解Java虚拟机》第三版发布了，赶紧买来看了看新版的内容，这本书更新了很多新版本虚拟机的内容，还对以前的部分内容进行了重构，还是值得去看的。本着复习和巩固的态度，...
<!-- more -->

                                                                                                                                                                                         
#### 背景 
前不久《深入理解Java虚拟机》第三版发布了，赶紧买来看了看新版的内容，这本书更新了很多新版本虚拟机的内容，还对以前的部分内容进行了重构，还是值得去看的。本着复习和巩固的态度，我决定来编译一个简单的类文件来分析Java的字节码内容，来帮助理解和巩固Java字节码知识，希望也对阅读本文的你有所帮助。 
 
#### 编译“1+1”代码 
首先我们需要写个简单的小程序，1+1的程序，学习就要从最简单的1+1开始，代码如下： 
 ```java 
  package top.luozhou.test;

/**
 * @description:
 * @author: luozhou
 * @create: 2019-12-25 21:28
 **/
public class TestJava {
    public static void main(String[] args) {
        int a=1+1;
        System.out.println(a);
    }
}


  ```  
写好java类文件后，首先执行命令 ```java 
  javac TestJava.java
  ```  编译类文件，生成 ```java 
  TestJava.class
  ``` 。 然后执行反编译命令 ```java 
  javap -verbose TestJava
  ``` ，字节码结果显示如下： 
 ```java 
    Compiled from "TestJava.java"
public class top.luozhou.test.TestJava
  minor version: 0
  major version: 56
  flags: ACC_PUBLIC, ACC_SUPER
Constant pool:
   #1 = Methodref          #5.#14         // java/lang/Object."<init>":()V
   #2 = Fieldref           #15.#16        // java/lang/System.out:Ljava/io/PrintStream;
   #3 = Methodref          #17.#18        // java/io/PrintStream.println:(I)V
   #4 = Class              #19            // top/luozhou/test/TestJava
   #5 = Class              #20            // java/lang/Object
   #6 = Utf8               <init>
   #7 = Utf8               ()V
   #8 = Utf8               Code
   #9 = Utf8               LineNumberTable
  #10 = Utf8               main
  #11 = Utf8               ([Ljava/lang/String;)V
  #12 = Utf8               SourceFile
  #13 = Utf8               TestJava.java
  #14 = NameAndType        #6:#7          // "<init>":()V
  #15 = Class              #21            // java/lang/System
  #16 = NameAndType        #22:#23        // out:Ljava/io/PrintStream;
  #17 = Class              #24            // java/io/PrintStream
  #18 = NameAndType        #25:#26        // println:(I)V
  #19 = Utf8               top/luozhou/test/TestJava
  #20 = Utf8               java/lang/Object
  #21 = Utf8               java/lang/System
  #22 = Utf8               out
  #23 = Utf8               Ljava/io/PrintStream;
  #24 = Utf8               java/io/PrintStream
  #25 = Utf8               println
  #26 = Utf8               (I)V
{
  public top.luozhou.test.TestJava();
    descriptor: ()V
    flags: ACC_PUBLIC
    Code:
      stack=1, locals=1, args_size=1
         0: aload_0
         1: invokespecial #1                  // Method java/lang/Object."<init>":()V
         4: return
      LineNumberTable:
        line 8: 0

  public static void main(java.lang.String[]);
    descriptor: ([Ljava/lang/String;)V
    flags: ACC_PUBLIC, ACC_STATIC
    Code:
      stack=2, locals=2, args_size=1
         0: iconst_2
         1: istore_1
         2: getstatic     #2                  // Field java/lang/System.out:Ljava/io/PrintStream;
         5: iload_1
         6: invokevirtual #3                  // Method java/io/PrintStream.println:(I)V
         9: return
      LineNumberTable:
        line 10: 0
        line 11: 2
        line 12: 9
}

  ```  
#### 解析字节码 
1.基础信息 
上述结果删除了部分不影响解析的冗余信息，接下来我们便来解析字节码的结果。 
 ```java 
   minor version: 0 次版本号，为0表示未使用
 major version: 56 主版本号，56表示jdk12，表示只能运行在jdk12版本以及之后的虚拟机中

  ```  
 ```java 
  flags: ACC_PUBLIC, ACC_SUPER

  ```  
 ```java 
  ACC_PUBLIC
  ``` :这就是一个是否是public类型的访问标志。 
 ```java 
   ACC_SUPER
  ``` : 这个falg是为了解决通过  ```java 
  invokespecial
  ```  指令调用 super 方法的问题。可以将它理解成 Java 1.0.2 的一个缺陷补丁，只有通过这样它才能正确找到 super 类方法。从 Java 1.0.2 开始，编译器始终会在字节码中生成 ACC_SUPER 访问标识。感兴趣的同学可以点击这里来了解更多。 
2.常量池 
接下来，我们将要分析常量池,你也可以对照上面整体的字节码来理解。 
 ```java 
  #1 = Methodref          #5.#14         // java/lang/Object."<init>":()V

  ```  
这是一个方法引用，这里的 ```java 
  #5
  ``` 表示索引值，然后我们可以发现索引值为5的字节码如下 
 ```java 
  #5 = Class              #20            // java/lang/Object

  ```  
它表示这是一个 ```java 
  Object
  ``` 类，同理 ```java 
  #14
  ``` 指向的是一个 ```java 
  "<init>":()V
  ``` 表示引用的是初始化方法。 
 ```java 
  #2 = Fieldref           #15.#16        // java/lang/System.out:Ljava/io/PrintStream;

  ```  
上面这段表示是一个字段引用，同样引用了 ```java 
  #15
  ``` 和 ```java 
  #16
  ``` ,实际上引用的就是 ```java 
  java/lang/System
  ``` 类中的 ```java 
  PrintStream
  ``` 对象。其他的常量池分析思路是一样的，鉴于篇幅我就不一一说明了，只���下���中的几个关键类型和信息。 
 ```java 
  NameAndType
  ``` :这个表示是名称和类型的常量表，可以指向方法名称或者字段的索引，在上面的字节码中都是表示的实际的方法。 
 ```java 
  Utf8
  ``` ：我们经常使用的是字符编码，但是这个不是只有字符编码的意思，它表示一种字符编码是 ```java 
  Utf8
  ``` 的字符串。它是虚拟机中最常用的表结构，你可以理解为它可以描述方法，字段，类等信息。 比如： 
 ```java 
  #4 = Class              #19 
#19 = Utf8               top/luozhou/test/TestJava

  ```  
这里表示 ```java 
  #4
  ``` 这个索引下是一个类，然后指向的类是 ```java 
  #19
  ``` , ```java 
  #19
  ``` 是一个 ```java 
  Utf8
  ``` 表，最终存放的是 ```java 
  top/luozhou/test/TestJava
  ``` ,那么这样一连接起来就可以知道 ```java 
  #4
  ``` 位置引用的类是 ```java 
  top/luozhou/test/TestJava
  ``` 了。 
3.构造方法信息 
接下来，我们分析下构造方法的字节码，我们知道，一个类初始化的时候最先执行它的构造方法，如果你没有写构造方法，系统会默认给你添加一个无参的构造方法。 
 ```java 
  public top.luozhou.test.TestJava();
    descriptor: ()V
    flags: ACC_PUBLIC
    Code:
      stack=1, locals=1, args_size=1
         0: aload_0
         1: invokespecial #1                  // Method java/lang/Object."<init>":()V
         4: return
      LineNumberTable:
        line 8: 0

  ```  
 ```java 
   descriptor: ()V
  ```  :表示这是一个没有返回值的方法。 
 ```java 
  flags: ACC_PUBLIC
  ``` :是公共方法。 
 ```java 
  stack=1, locals=1, args_size=1
  ```  :表示栈中的数量为1，局部变量表中的变量为1，调用参数也为1。 
这里为什么都是1呢？这不是默认的构造方法吗？哪来的参数？其实Java语言有一个潜规则：在任何实例方法里面都可以通过 ```java 
  this
  ``` 来访问到此方法所属的对象。而这种机制的实现就是通过Java编译器在编译的时候作为入参传入到方法中了，熟悉 ```java 
  python
  ``` 语言的同学肯定会知道，在 ```java 
  python
  ``` 中定义一个方法总会传入一个 ```java 
  self
  ``` 的参数,这也是传入此实例的引用到方法内部，Java只是把这种机制后推到编译阶段完成而已。所以，这里的1都是指 ```java 
  this
  ``` 这个参数而已。 
 ```java 
           0: aload_0
         1: invokespecial #1                  // Method java/lang/Object."<init>":()V
         4: return
    LineNumberTable:
        line 8: 0

  ```  
经过上面这个分析对于这个构造方法表达的意思也就很清晰了。 
 ```java 
  aload_0
  ``` :表示把局部变量表中的第一个变量加载到栈中，也就是 ```java 
  this
  ``` 。 
 ```java 
  invokespecial
  ``` :直接调用初始化方法。 
 ```java 
  return
  ``` :调用完毕方法结束。 
 ```java 
  LineNumberTable:
  ``` 这是一个行数的表，用来记录字节码的偏移量和代码行数的映射关系。 ```java 
  line 8: 0
  ``` 表示，源码中第8行对应的就是偏移量 ```java 
  0
  ``` 的字节码，因为是默认的构造方法，所以这里并无法直观体现出来。 
另外这里会执行 ```java 
  Object
  ``` 的构造方法是因为， ```java 
  Object
  ``` 是所有类的父类，子类的构造要先构造父类的构造方法。 
4.main方法信息 
 ```java 
  public static void main(java.lang.String[]);
    descriptor: ([Ljava/lang/String;)V
    flags: ACC_PUBLIC, ACC_STATIC
    Code:
      stack=2, locals=2, args_size=1
         0: iconst_2
         1: istore_1
         2: getstatic     #2                  // Field java/lang/System.out:Ljava/io/PrintStream;
         5: iload_1
         6: invokevirtual #3                  // Method java/io/PrintStream.println:(I)V
         9: return
      LineNumberTable:
        line 10: 0
        line 11: 2
        line 12: 9

  ```  
有了之前构造方法的分析，我们接下来分析 ```java 
  main
  ``` 方法也会熟悉很多，重复的我就略过了，这里重点分析 ```java 
  code
  ``` 部分。 
 ```java 
  stack=2, locals=2, args_size=1
  ``` :这里的栈和局部变量表为2，参数还是为1。这是为什么呢？因为 ```java 
  main
  ``` 方法中声明了一个变量 ```java 
  a
  ``` ,所以局部变量表要加一个，栈也是，所以他们是2。那为什么 ```java 
  args_size
  ``` 还是1呢？你不是说默认会把 ```java 
  this
  ``` 传入的吗？应该是2啊。注意：之前说的是在任何实例方法中，而这个main方法是一个静态方法，静态方法直接可以通过类+方法名访问，并不需要实例对象，所以这里就没必要传入了。 
 ```java 
  0: iconst_2
  ``` :将 ```java 
  int
  ``` 类型2推送到栈顶。 
 ```java 
   1: istore_1
  ``` :将栈顶 ```java 
  int
  ``` 类型数值存入第二个本地变量。 
 ```java 
  2: getstatic #2 // Field java/lang/System.out:Ljava/io/PrintStream;
  ``` :获取 ```java 
  PrintStream
  ``` 类。 
 ```java 
  5: iload_1
  ``` : 把第二个 ```java 
  int
  ``` 型本地变量推送到栈顶。 
 ```java 
   6: invokevirtual #3 // Method java/io/PrintStream.println:(I)V
  ``` :调用 ```java 
  println
  ``` 方法。 
 ```java 
  9: return
  ``` :调用完毕结束方法。 
这里的 ```java 
  LineNumberTable
  ``` 是有源码的，我们可以对照下我前面描述是否正确：  
 ```java 
  line 10: 0
  ``` : 第10行表示 ```java 
   0: iconst_2
  ``` 字节码，这里我们发现编译器直接给我们计算好了把2推送到栈顶了。 
 ```java 
  line 11: 2
  ``` :第11行源码对应的是 ```java 
   2: getstatic
  ```  获取输出的静态类 ```java 
  PrintStream
  ``` 。 
 ```java 
  line 12: 9
  ``` :12行源码对应的是 ```java 
  return
  ``` ，表示方法结束。 
这里我也画了一个动态图片来演示 ```java 
  main
  ``` 方法执行的过程，希望能够帮助你理解：  
#### 总结 
这篇文章我从1+1的的源码编译开始，分析了生成后的Java字节码，包括类的基本信息，常量池，方法调用过程等，通过这些分析，我们对Java字节码有了比较基本的了解，也知道了Java编译器会把优化手段通过编译好的字节码体现出来，比如我们的1+1=2，字节码字节赋值一个2给变量，而不是进行加法运算，从而优化了我们的代码，提搞了执行效率。 
#### 参考 
 
 https://bugs.openjdk.java.net/browse/JDK-6527033 

                                        