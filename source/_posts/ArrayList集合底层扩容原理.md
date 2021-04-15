---
title: 推荐系列-ArrayList集合底层扩容原理
categories: 热门文章
tags:
  - Popular
author: csdn
top: 5
date: 2021-04-15 08:14:57
cover_picture: 'https://profile.csdnimg.cn/B/5/1/3_shishilunhui'
---

&emsp;&emsp;ArrayList集合底层扩容原理前言概述对象创建扩容操作第一章 前言概述第01节 概述底层说明ArrayList是List的实现类，它的底层是用Object数组存储，线程不安全后期应用适合用于频繁的查询工作，因为底层是数组，可以快速通过数组下标进行查找第02节 区别区别方向Array集合LinkedList集合线程安全不安全不安全底层原理Object类型数组双向链表随机访问支持（实现 RandomAccess接口）不支持
<!-- more -->

        
                
                    
                        
                    
                    ### ArrayList集合底层扩容原理 
 
前言概述核心代码扩容操作 
 
#### 第一章 前言概述 
##### 第01节 概述 
底层说明 
 
 ```java 
  ArrayList是List的实现类，它的底层是用Object数组存储，线程不安全

  ``` 
  
后期应用 
 
 ```java 
  适合用于频繁的查询工作，因为底层是数组，可以快速通过数组下标进行查找

  ``` 
  
 
##### 第02节 区别 
区别方向ArrayList集合LinkedList集合线程安全不安全不安全底层原理Object类型数组双向链表随机访问支持（实现 RandomAccess接口）不支持内存占用ArrayList 浪费空间，底层是数组，末尾预留一部分容量空间LinkedList占用空间比ArrayList多，存在头尾地址值占用空间
小结 
 
 ```java 
  ArrayList 集合的特点：
	1. 线程不安全
	2. 底层数据结构是数组（查询快，增删慢，支持快速随机访问）
	3. 内存占用会存在部分浪费，末尾会预留一部分容量空间

  ``` 
  
 
#### 第二章 核心代码 
##### 第01节 成员变量 
代码 
 
 ```java 
  public class ArrayList<E> extends AbstractList<E> implements List<E>, RandomAccess, Cloneable, java.io.Serializable{ 

	/**
	 * 默认初始容量大小, 默认初始化容量为10
	 */
	private static final int DEFAULT_CAPACITY = 10;

	/**
	 * 空数组。当集合内容置空的时候，底层使用空数组标记
	 */
	private static final Object[] EMPTY_ELEMENTDATA = {};

	/**
	* 用于无参数构造方法，创建对象的时候，使用这个数组定义。
	* 相比上面的数组 EMPTY_ELEMENTDATA 可以进行区分，知道在添加元素的过程当中，容量增加多少
	*/
	private static final Object[] DEFAULTCAPACITY_EMPTY_ELEMENTDATA = {};

	/**
	 * 保存ArrayList数据的数组，这个数组会不断的改变，前面没有被 final 修饰表示地址值会发生的变化
	 */
	transient Object[] elementData; // non-private to simplify nested class access

	/**
	 * ArrayList 所包含的元素个数，也就是在 ArrayList 集合底层，通过 size()方法，获取到的元素个数
	 */
	private int size; 
}

  ``` 
  
补充 
 
 ```java 
  1. ArrayList 集合底层存在6个成员变量
	还有一个 private static final long serialVersionUID = 8683452581122892189L;  
	序列化使用, 目前针对于当前的操作过程当中, 暂时不会使用得到。

2. ArrayList 集合当中核心的两个成员变量
	A. 底层维护数组  		transient Object[] elementData;
	B. 存储的元素个数		private int size; 

  ``` 
  
 
##### 第02节 构造方法 
代码 
 
 ```java 
  public class ArrayList<E> extends AbstractList<E> implements List<E>, RandomAccess, Cloneable, java.io.Serializable{ 

    /**
     * 构造一个初始长度为0的空数组。
     */
    public ArrayList() {
        this.elementData = DEFAULTCAPACITY_EMPTY_ELEMENTDATA;
    }

    /**
     * 在构造方法当中，传递一个参数集合c，将集合 c 转换成为新的列表
	 * elementData 当中的数据，就是新集合存放的数据
     * c.toArray 就是将原始集合的数据取出
	 * 如果取出的集合长度不为零的情况下，则复制 参数集合c 到 elementData 当中
	 * 如果取出的集合长度为零的情况下，则赋值为空数组  EMPTY_ELEMENTDATA 
     */
    public ArrayList(Collection<? extends E> c) {
        elementData = c.toArray();
        if ((size = elementData.length) != 0) { 
            if (elementData.getClass() != Object[].class)
                elementData = Arrays.copyOf(elementData, size, Object[].class);
        } else { 
            this.elementData = EMPTY_ELEMENTDATA;
        }
    }
	
	 /**
     * 指定参数的长度大小
	 * 如果初始化的长度大于0，则返回新的数组
	 * 如果初始化的长度等于0，则返回默认的空数组作为集合 this.elementData = EMPTY_ELEMENTDATA;
	 * 如果初始化的长度小于0，则出现非法参数异常
     */
    public ArrayList(int initialCapacity) {
        if (initialCapacity > 0) {
            this.elementData = new Object[initialCapacity];
        } else if (initialCapacity == 0) {
            this.elementData = EMPTY_ELEMENTDATA;
        } else {
            throw new IllegalArgumentException("Illegal Capacity: "+ initialCapacity);
        }
    }
}

  ``` 
  
 
补充（一） 无参构造创建对象 
 
补充（二）带参构造创建对象，带有int类型参数 
 
补充（三）带参构造创建对象，带有 集合类型参数 
 
 
#### 第三章 扩容操作 
##### 第01节 扩容代码 
核心方法介绍 
 
 ```java 
  来自于 ArrayList 集合当中的方法：
	1. public boolean add(E e){ ... }
	2. private void add(E e, Object[] elementData, int s){ .... }
	3. private Object[] grow()
	4. private Object[] grow(int minCapacity)

来自于其他类当中的功能
	1. Arrays.copyOf(elementData, newCapacity);  表示来自于 数组工具类 Arrays 当中的 copyOf() 底层使用的是 System.arraycopy() 方法
	2. Math.max(DEFAULT_CAPACITY, minCapacity)   表示来自于 数学工具类 Math 当中的 max() 方法，比较两个数据最大值，取较大者，返回

  ``` 
  
核心代码解释 
 
 ```java 
  
public class ArrayList<E> extends AbstractList<E> implements List<E>, RandomAccess, Cloneable, java.io.Serializable{ 

    /**
     * 将指定的元素添加到此集合的末尾位置
     *
     * modCount 是来自于父类的 AbstractList 当中的成员变量
     * add(e, elementData, size) 调用自己下面的重载方法
	 * return true  表示当前的方法，一定可以添加成功，因为List系列的集合添加数据都是允许成功的 true 如果是Set此方法返回false
     */
    public boolean add(E e) {
        modCount++;
        add(e, elementData, size);
        return true;
    }
	
	
	/**
     * 这个方法是私有方法，仅仅自己可以使用。不允许外界访问得到。便于上面的 add() 方法重载调用的
	 * 参数1: 表示需要添加的元素数据 E e
	 * 参数2: 表示成员变量当中, 需要维护管理的底层数组  Object[] elementData
     * 参数3: 表示成员变量当中, size 容器 elementData 当中存放的真实有效的数据个数
	 * 方法里面的逻辑: 当size已经等于了内部容器 elementData 的最大长度，则准备进行扩容的操作，扩容使用 grow() 方法
	 * 无论上面是否进行了扩容的操作，这里都需��将添加的元素赋值到数组当中，也就是 elementData[s] = e;
	 * 并且将当前成员变量的 size 在原始数据的基础上面，增加1，表示添加了新的元素之后，长度变化了，增加了1
     */
    private void add(E e, Object[] elementData, int s) {
        if (s == elementData.length)
            elementData = grow();
        elementData[s] = e;
        size = s + 1;
    }
	
	
	/**
     * 这个方法是私有方法，仅仅自己可以使用。不允许外界访问得到。便于上面的 add() 方法调用的
	 * 方法的内部调用了 ArrayList 当中自己重载的方法 grow(size + 1) 同时传入了参数。
	 * 这里参数的含义，表示的是 集合当中总长度 size + 1 表示在原始size基础上增加1 
	 * 方法的返回值是一个新的数组，也就是扩容之后的数组
     */
	private Object[] grow() {
        return grow(size + 1);
    }


    /**
     * 这个方法是私有方法，仅仅自己可以使用。不允许外界访问得到。便于上面的 grow() 方法调用的
	 * 这里的参数 minCapacity ，就是上面传入的参数 size + 1，也就是说最小容量 minCapacity = size + 1
	 * 方法体当中的执行逻辑:
	 * 		1. 获取到了底层维护数组的长度 int oldCapacity = elementData.length; 这里就是旧容量 oldCapacity
	 *      2. 判断旧容量 oldCapacity 是否小于0，也就是 else 的逻辑，
	 *				如果满足 if 当中的逻辑， 则表示 旧数组当中存在数据，并且 旧数组并不是 默认容量的空数组地址值
	 *					说明: 扩容过的就不会是之前默认 DEFAULTCAPACITY_EMPTY_ELEMENTDATA 的地址值
	 *					在这种情况下，就会得到 1.5被的数组长度整数，传递给 Arrays.copyOf()方法进行扩容，得到新数组返回
	 * 				如果满足 else 当中的逻辑，则返回 DEFAULT_CAPACITY 和 minCapacity 较大值。
	 * 					说明: DEFAULT_CAPACITY 值表示的是成员变量，默认为 10   
	 *					说明: minCapacity 在低于10的时候，表示的会是扩容添加的长度1,2,3..9.10.11..
     */
    private Object[] grow(int minCapacity) {
        int oldCapacity = elementData.length;
        if (oldCapacity > 0 || elementData != DEFAULTCAPACITY_EMPTY_ELEMENTDATA) {
            int newCapacity = ArraysSupport.newLength(oldCapacity,
                    minCapacity - oldCapacity, /* minimum growth */
                    oldCapacity >> 1           /* preferred growth */);
            return elementData = Arrays.copyOf(elementData, newCapacity);
        } else {
            return elementData = new Object[Math.max(DEFAULT_CAPACITY, minCapacity)];
        }
    }
}

  ``` 
  
 
##### 第02节 动态过程说明 
 

                
                
                
        