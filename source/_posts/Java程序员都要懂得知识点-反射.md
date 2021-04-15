---
title: 推荐系列-Java程序员都要懂得知识点-反射
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 1987
cover_picture: 'https://pic4.zhimg.com/80/v2-012ce80b13792111e8998e4cbca9fed7_720w.jpg'
abbrlink: d694a995
date: 2021-04-15 09:46:45
---

&emsp;&emsp;摘要：Java反射机制是在运行状态中，对于任意一个类，都能够��道这个类的所有属性和方法；对于任意一个对象，都能够调用它的任意一个方法和属性；这种动态获取的信息以及动态调用对象的方法的...
<!-- more -->

                                                                                                                                                                                         
本文分享自华为云社区《java知识点问题精选之反射》，原文作者：breakDraw 。 
Java反射机制是在运行状态中，对于任意一个类，都能够知道这个类的所有属性和方法；对于任意一个对象，都能够调用它的任意一个方法和属性；这种动态获取的信息以及动态调用对象的方法的功能称为java语言的反射机制。 
反射就是把java类中的各种成分映射成一个个的Java对象。 
例如：一个类有：成员变量、方法、构造方法、包等等信息，利用反射技术可以对一个类进行解剖，把个个组成部分映射成一个个对象。 
（其实：一个类中这些成员方法、构造方法、在加入类中都有一个类来描述） 
 
#### 反射 
Q： 调用类对象.class 和 forName(类名)的区别？ 
 
  
 ```java 
  Class<A> classA = A.class;
Class<A> classA = Class.forName("A");
  ``` 
  
 
A： 仅使用.class不能进行第一次静态初始化， forname函数则可以 
例如B是A的基类,下面这段代码如何？ 假设有父子2个类，如下： 
 
  
 ```java 
  static class Parent { }

static class Son extends Parent{}
  ``` 
  
 
Q： 用instanceof 可以和父类比较吗，且会返回true吗？ 
 
  
 ```java 
          Son son = new Son();
        if (son instanceof  Parent) {
            System.out.println("a instanof B");
        }
  ``` 
  
 
A： 可以比较，且返回true。 
Q： 用getClass并用== 可以和父类比较吗，且会返回true吗，下面这样： 注意A是B的子类。 
 
  
 ```java 
          Son son = new Son();
        if (son.getClass() == Parent.class){
            System.out.println("son class == Parent.class");
        }
  ``` 
  
 
A： 不可以，编译就会报错了。和Class<泛型>的 ==号比较有关。 
![Test](https://pic4.zhimg.com/80/v2-012ce80b13792111e8998e4cbca9fed7_720w.jpg  'Java程序员都要懂得知识点-反射') 
因为getClass返回的是<? extends Son>， .class返回的是Class<Parent> 
Q： 用getClass并用.equals可以和父类比较吗，且会返回true吗，下面这样： 
 
  
 ```java 
              Son son = new Son();
        if (son.getClass().equals(Parent.class)){
            System.out.println("son class.equals(Parent.class)");
        }
  ``` 
  
 
A： 可以比较，正常编译， 但是会返回false，即不相等！ 
Q： getDeclaredXXX 有哪几种？ A： 5种： 
 
 注解Annotation 
 内部类Classed 
 构造方法Construcotor 
 字段Field 
 方法Method 
 
![Test](https://pic4.zhimg.com/80/v2-012ce80b13792111e8998e4cbca9fed7_720w.jpg  'Java程序员都要懂得知识点-反射') 
Q：getMethods()返回哪些方法， getDeclaredMethods()会返回哪些方法？ 
A： getMethods()返回 本类、父类、父接口 的public方法 getDeclaredMethods()只 返回本类的 所有 方法 
其他getXXX和getDeclaredXXX的区别同理。 
拿到Filed、Method、Constructor之后咋用 
 
 Method可以invoke（object， args） 
 Constructor可以newInstance(Object…)来做构造调用。 
 Filed可以用get(object)、set(object)来设置属性值。 
 
Q： 反射拿到Method对象后， 该对象.getModifiers() 是干嘛的？ A： 返回该方法的修饰符，并且是1个整数。 
![Test](https://pic4.zhimg.com/80/v2-012ce80b13792111e8998e4cbca9fed7_720w.jpg  'Java程序员都要懂得知识点-反射') 
Q： 下面这段代码会发生什么？ 
 
  
 ```java 
  package com.huawei.test

public class A {
    public A(int i ) {
        System.out.printf("i=" +i);
    }

    public static void main(String[] args) {
        try {
            A a = (A)Class.forName("com.huawei.test.A").newInstance();
        } catch (ClassNotFoundException e) {
            System.out.printf("ClassNotFoundException");
        } catch (InstantiationException e) {
            System.out.printf("InstantiationException");
        } catch (IllegalAccessException e) {
            System.out.printf("IllegalAccessException");
        }
    }
}
  ``` 
  
 
A: 打印InstantiationException初始化错误。因为A没有默认构造器了，所以不可以用newInstance来构造。应该改成这样,通过获取正确的构造器来进行构造。 
 
  
 ```java 
  A a = (A)Class.forName("A").getConstructor(int.class).newInstance(123);
  ``` 
  
 
Q：如何提高反射的效率？ A： 
 
 使用高性能反射包，例如ReflectASM 
 缓存反射的对���，避免每次都要重复去字节码中获取。（缓存！缓存！） 
 method反射可设置method.setAccessible(true)来关闭安全检查。 
 尽量不要getMethods()后再遍历筛选，而直接用getMethod(methodName)来根据方法名获取方法 
 利用hotspot虚拟机中的反射优化技术（jit技术） 参考资料： https://segmentfault.com/q/1010000003004720 https://www.cnblogs.com/coding-night/p/10772631.html 
 
Q： 用反射获取到的method对象， 是返回一个method引用，还是返回1个拷贝的method对象？ A： 反射拿method对象时， 会做一次拷贝，而不是直接返回引用，因此最好对频繁使用的同一个method做缓存，而不是每次都去查找。 
![Test](https://pic4.zhimg.com/80/v2-012ce80b13792111e8998e4cbca9fed7_720w.jpg  'Java程序员都要懂得知识点-反射') 
Q: getMethods()后自己做遍历获取方法，和getMethod(methodName) 直接获取方法， 为什么性能会有差异？ A： getMethods() 返回method数组时，每个method都做了一次拷贝。 getMethod(methodName)只会返回那个方法的拷贝， 性能的差异就体现在拷贝上。 
![Test](https://pic4.zhimg.com/80/v2-012ce80b13792111e8998e4cbca9fed7_720w.jpg  'Java程序员都要懂得知识点-反射') 
Q: 获取方法时，jvm内部其实有缓存，但是返回给外部时依然会做拷贝。那么该method的缓存是持久存在的吗？ A: 不是持久存在的，内存不足时会被回收。源码如下： 
![Test](https://pic4.zhimg.com/80/v2-012ce80b13792111e8998e4cbca9fed7_720w.jpg  'Java程序员都要懂得知识点-反射') 
 
  
 ```java 
  private Class.ReflectionData<T> reflectionData() {
    SoftReference<Class.ReflectionData<T>> reflectionData = this.reflectionData;
    int classRedefinedCount = this.classRedefinedCount;
    Class.ReflectionData rd;
    return reflectionData != null && (rd = (Class.ReflectionData)reflectionData.get()) != null
    && rd.redefinedCount == classRedefinedCount ? rd : this.newReflectionData(reflectionData,     classRedefinedCount);
}
  ``` 
  
 
![Test](https://pic4.zhimg.com/80/v2-012ce80b13792111e8998e4cbca9fed7_720w.jpg  'Java程序员都要懂得知识点-反射') 
可以看到这是一个软引用。 
软引用的定义：内存紧张时可能会被回收，不过也可以通过-XX:SoftRefLRUPolicyMSPerMB参数控制回收的时机，只要发生GC就会将其回收。 
如果reflectionData被回收之后，又执行了反射方法，那只能通过newReflectionData方法重新创建一个这样的对象了。 
Q： 反射是线程安全的吗? A: 是线程安全的。 获取反射的数据时，通过cas去获取。 cas概念可以见多线程一节。 
![Test](https://pic4.zhimg.com/80/v2-012ce80b13792111e8998e4cbca9fed7_720w.jpg  'Java程序员都要懂得知识点-反射') 
Q: a普通方法调用 b反射方法调用 c关闭安全检查的反射方法调用，性能差异如下： 
![Test](https://pic4.zhimg.com/80/v2-012ce80b13792111e8998e4cbca9fed7_720w.jpg  'Java程序员都要懂得知识点-反射') 
b反射方法调用和c关闭安全检查的反射方法调用的性能差异在哪？普通方法调用和关闭安全检查的反射方法调用的性能差异在哪？ A: 
 
 安全检查的性能消耗在于 ，SecurityManager.checkPermission(SecurityConstants.CHECK_MEMBER_ACCESS_PERMISSION); 这项检测需要运行时申请RuntimePermission(“accessDeclaredMembers”)。 所以如果不考虑安全检查， 对反射方法调用invoke时， 应当设置 Method#setAccessible(true) 
 普通方法和反射方法的��能差异在于 
 
 
 Method#invoke 方法会对参数做封装和解封操作 
 需要检查方法可见性 
 需要校验参数 
 反射方法难以内联 
 JIT 无法优化 
 
  
点击关注，第一时间了解华为云新鲜技术~
                                        