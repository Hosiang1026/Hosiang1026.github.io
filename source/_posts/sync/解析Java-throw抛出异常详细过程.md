---
title: 推荐系列-解析Java-throw抛出异常详细过程
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 280
cover_picture: 'https://pic1.zhimg.com/80/v2-613e86336af3e91f1683c8f7a2756fc8_720w.jpg'
abbrlink: 5adc4396
date: 2022-05-11 05:14:30
---

&emsp;&emsp;：Java有3种抛出异常的形式：throw、throws、系统自动抛异常。 本文分享自华为云社区《Java-throw异常详解以及过程》，作者： gentle_zhou 。 首先，我们知道Java有3种抛出异常的形式：t...
<!-- more -->

                                                                                                                                                                                         
本文分享自华为云社区《Java-throw异常详解以及过程》，作者： gentle_zhou 。 
首先，我们知道Java有3种抛出异常的形式：throw（执行的时候一定抛出某种异常对象）, throws（出现异常的可能性，不一定会发生）, 系统自动抛异常。 
throw用在一个语句抛出异常的时候，throw (an instance of exception class)比如一个方法/函数里，try{…}catch(Exception e){throw new ArithmeticException(“XXX”);}finally{…}； 
throws则是用在声明方法可能抛出异常的时候，throw (exception class)比如public int division(int x, int y) throws ArithmeticException {…}； 
系统自动抛异常则是当程序语句出现逻辑错误，主义错误或类型转换错误的时候，系统自动抛出异常，比如int a = 5; int b = 0; c = a/b; 这个时候移动会自动抛出ArithmeticException。 
 
#### 什么是异常 
异常，顾名思义，就是有异于正常状态，有错误发生。而这错误会阻止Java当前函数方法的运行。 
那么Java里面异常的体系是怎么样的呢？ 
1.Java里面所有不正常类都继承于Throwable类；而Throwable类包括2类：Error类和Exception类。 
2.Error类包括虚拟机错误（VirtualMachineError）和线程死锁（ThreadDeath）。 
3.Exception类则是我们在说的异常；包括运行时异常（RuntimeException）和检查异常；这里的异常通常是编码，环境，用户操作输入出现了问题。 
4.运行时异常（RuntimeException）包括以下4种异常：空指针异常（NullPointerException），数组下标越界异常（ArrayIndexOutOfBoundsException），类型转换异常（ClassCastException），算术异常（ArithmeticException）。 
空指针异常： 
 
 
数组下标越界异常： 
 
 
类型转换异常： 
 
 
算术异常： 
 
 
5.最后剩下的检查异常则是剩下各种异常的集合；这里发生异常的原因有很多，文件异常（IOException），连接异常（SQLException）等等；和运行时异常不同的是，这里的异常我们必须手动在代码里添加try…catch…(finally…)语句来捕获处理。 
今天又了解学习到了一些具体的额外的异常： 
 
 
#### Throw抛出异常详细过程 
和throws声明方法可能会发生异常不同，throw语句则是直接抛出一个异常。 
前面有提到，throw (an instance of exception class)，这里的一个exception类的实例其实也可以说是一个ExceptionObject（Throwable类或则其子类 的对象；也可以是自定义的继承自Throwable的直接或间接的异常类）。如果，我们用了throw new String(“异常XXX”); 则会在编译的时候报错，因为String 类并不是Throwable类的子类。 
接着让我们回到怎么用throw语句的阶段。 
一般我们有两种方式来用throw：直接在某处会发生异常的地方用throw语句 或则 用try…catch…finally…语句来捕获处理异常和关闭释放资源。 
首先是第一种，直接在某处会发生异常的地方用throw语句；这是一种主动的方法，主动抛出异常去处理。而第二种，用try…catch…finally…语句来捕获处理异常和关闭释放资源 则是被动的方法。try里面放入可能会发生异常的语句块，如果在运行期间遇到了异常，则会交给catch来处理异常（catch可以是多个，处理不同的异常），finally则是无论有没有异常发生，只要加上了就会运行。 
首先我们来看第一种方法的函数： 
 
我们的int c = 4/2，其实是正确的；但是我们的throw 语句主动抛出了异常，那么程序就会到catch里面找有没有这个异常，有的话进行处理。所以我们要主动抛异常的话，要很确信这个代码一定会发生异常且后期不太会去变动了（最好放在if条件语句里）。所以我们得到的结果如下： 
 
接着我们来看第二种方法。我们一开始先测正确的，只是把主动抛出异常语句给注释掉： 
 
因为try里面的语句块没有异常，所以只执行了try和finally里面的语句块。运行的结果如下： 
 
我们接着来测当try里面的语句块有异常，且没有主动抛出异常的时候，try会不会捕捉到异常吧： 
 
得到的结果如下，会去处理异常和执行finally里面的语句块： 
 
最后深入理解一点try里面的异常触发会逐层向上的这个概念。在我们try语句里主动/被动抛出异常的时候，程序会调向调用者程序（上面的例子里就是我们自己这个函数；但有的时候我们会在try语句里执行别的函数比如B，这个函数B里我们假如触发了异常，它会调向try语句所在的函数A），寻找和它相匹配的catch语句，执行catch语句里面相应的异常处理程序；但假如没有找到相匹配的catch语句，那么它会再转向上一层的调用程序…这样逐层向上，直到最外层的异常程序终止程序并打印出stack trace。 
  
点击关注，第一时间了解华为云新鲜技术~
                                        