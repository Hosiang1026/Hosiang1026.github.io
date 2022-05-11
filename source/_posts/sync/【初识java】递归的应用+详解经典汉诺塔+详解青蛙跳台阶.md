---
title: 推荐系列-【初识java】递归的应用+详解经典汉诺塔+详解青蛙跳台阶
categories: 热门文章
tags:
  - Popular
author: csdn
top: 6
cover_picture: 'https://profile.csdnimg.cn/3/3/5/3_qq_36935038'
abbrlink: 4f1c1caf
date: 2022-05-11 05:16:57
---

&emsp;&emsp;递归知识点的重难点进行讲解分析，帮助大家掌握递归。对经典题目汉诺塔以及青蛙跳台阶问题的难点进行分析，通过代码解决了这两个经典问题。
<!-- more -->

        
                
                    
                        
                    
                     


 ##### 文章目录
 一、递归1.1递归的定义1.2递归过程分析1..3递归练习
  二、汉诺塔问题的详解三、青蛙跳台阶

 

 
### 一、递归 
#### 1.1递归的定义 
 
递归相当于数学上的 “数学归纳法”, 有一个起始条件, 然后有一个递推公式. 
 
递归的难点就在于找到一个问题的起始条件（终止条件）和合适的递归公式。 
递归代码示例:求N的阶乘 
 
 ```java 
     public static int factor(int n) {
        //起始条件(终止条件)
        if(n == 1) {
            return 1;
        } else { //递归公式
            return n*factor(n-1);//factor调用自身
        }
    }
 	public static void main(String[] args) {
        int n = 5;
        System.out.println(fact(n));
    }
//==>120

  ``` 
  
#### 1.2递归过程分析 
要想理解清楚递归，就要理解方法的执行过程，下面一张图来详解一下递归的整个过程。  
值得一提的是，递归必须有一个结束条件，否则的话，栈上会不断为调佣的方法开辟栈帧空间，导致内存溢出问题 
#### 1…3递归练习 
练习1:按顺序打印数字的每一位(如456打印出 4 5 6) 
 
 
 ```java 
  public static void print(int n) {
        if(n>=10) {
            print(n/10);
        }
        System.out.println(n%10);
    }

  ``` 
  
练习2:输入一个非负整数，返回组成它的数字之和. 例如，输入 1729, 则应该返回1+7+2+9，它的和是19； 
 
 
 ```java 
  public static int sum(int n) {
        if(n<=9){
            return n;
        } else {
            return n%10+sum(n/10);
        }
    }

  ``` 
  
练习3：求斐波那契数列的第n项  
 
 ```java 
    public static int fib(int n) {
        if(n==1 ||n==2) {
            return 1;
        } else {
            return fib(n-1)+fib(n-2);//前两项之和
        }
    }

  ``` 
  
但是在实际开发过程中如果有需求运用到斐波那契数列，并不推荐使用递归方式，使用递归求取斐波那契数列会出现重复计算的问题，一般都是利用迭代的方式来解决斐波那契数列问题。 
### 二、汉诺塔问题的详解 
 
如果单独看这个，我第一次看到时候是一脸懵逼的，其实当我们利用图像来理解时候，这个问题就会清晰很多。 
 
64个盘子情况我们暂且先不讨论，先以3个盘子的情况入手，通过上图我们可以构造一个数学模型。 
 
汉诺塔问题就是将A柱上的盘子，通过ABC柱最后按照从小到大的顺序移动到C柱上。 假设A柱上只有1个盘子，则如下图>： 
 
则直接将盘子从A柱移动到C柱即可，我们过程记为: 
 
假设A柱上有2个盘子，则如下图 
 移动过程动图： 
 
 
最后再来看看刚刚提到的3个盘子情况  
将盘子从A柱移动到C柱的过程我们记为: 
 
 
这也是为什么我们不讨论64个盘子的情况，试想2^64-1次，这得是多少年才可以移动完！ 
但是我们的着重点在于如何通过递归的方式解决汉诺塔的问题，通过递归找到移动盘子的最终方式。 
 
 
代码实现: 
模块1：模拟鼠标移动 
 
 ```java 
  
/**
     * move:模拟鼠标移动的一次过程
     * pos1位置移动到pos2位置，打印出来，相当于A -> C
     * @param pos1
     * @param pos2
     */
    public static void move(char pos1,char pos2) {
        System.out.print(pos1+" -> "+pos2+" ");
    }

 


  ``` 
  
模块2:汉诺塔递归的实现 
 
 ```java 
    
/**
     * @param n 代表盘子个数
     * @param pos1 A柱
     * @param pos2 B柱
     * @param pos3 C柱
     */
    public static void hanoi(int n,char pos1,char pos2,char pos3) {
        //n==1时为终止条件，直接将A柱上的盘子移动到C柱即可
        if(n==1) {
            move(pos1,pos3);//pos1为起始位置，pos3为目的地位置
        } else {
            hanoi((n-1),pos1,pos3,pos2);//pos1(A)为起始位置，pos3(C)为中途位置，pos2(B)为目的地位置。含义：将n-1个盘子从A柱上通过C柱移动到B柱上(递推公式)
            move(pos1,pos3);//pos1为起始位置，pos3为目的地位置.将n-1个盘子移动走后，将A柱上最后的盘子移动到C柱上
            hanoi((n-1),pos2,pos1,pos3);//pos2(B)为起始位置，pos1(A)为中途位置，pos2CB)为目的地位置。将B柱上n-1个盘子，从B柱上通过A柱移动到C柱上
        }
    }

    public static void main(String[] args) {
        hanoi(3,'A','B','C');//给pos1,pos2,pos3指定是哪一个柱子
    }

  ``` 
  
 
 
### 三、青蛙跳台阶 
 
当台阶为1级时，有一种跳法，当台阶为2时，有两种跳法，分别是一次跳一级台阶，总共需要跳2次和一次跳2级，总共跳一次。 
当台阶为3级时候呢？可以第一次跳1级，总共跳3次，和第一次跳一级，最后跳2级，总共跳2次，以及第一次跳2级，最后跳一级，总共跳2次，共3种方法(题目中有说先后次序不同算不同的结果) 我们不难发现，跳3级台阶时候是跳一级台阶的跳法种类加上跳二级台阶时候的跳法种类共3次。 
 
则这个问题转换成代码就是: 
 
 ```java 
  public static int jump(int n) {
        if(n==1) {
            return 1;
        } else if(n==2) {
            return 2;
        } else {
            return jump(n-1)+jump(n-2);
        }
    }

  ``` 
  
 

                
                
                
        