---
title: 推荐系列-Java数组详解
categories: 热门文章
tags:
  - Popular
author: csdn
top: 8
cover_picture: 'https://profile.csdnimg.cn/3/6/8/3_jixtlhh'
abbrlink: d96c231d
date: 2021-04-15 08:14:57
---

&emsp;&emsp;在我们了解数组这个概念之前，我们先思考下面几个问题。如果我们需要两个数据，那么直接创建两个变量即可int a;int b;如果需要五个数据，那么可以创建五个变量int a;int b;int c;int d;int f;但如果我们需要100个甚至是1万个数据，那么我们创一万个变量？显然这是不现实的。这个时候就需要我们的数组来起作用！帮我们“批量”创建变量。由上可以得出：数组的本质就是让我们能“批量”创建相同类型的变量！数组一.数组的概念数组是一种数据
<!-- more -->

        
                
                    目录 
一.数组的概念 
二.创建数组 
三.数组的使用 
四.数组的遍历 
五.数组作为方法的参数 
六.数组相关方法Arrays 

在我们了解数组这个概念之前，我们先思考下面几个问题。 
如果我们需要两个数据，那么直接创建两个变量即可 
 
如果需要五个数据，那么可以创建五个变量 
 
但如果我们需要100个甚至是1万个数据，那么我们创一万个变量？显然这是不现实的。这个时候就需要我们的数组来起作用！帮我们“批量”创建变量。 
由上可以得出：数组的本质就是让我们能“批量”创建相同类型的变量！ 
数组 
#### 一.数组的概念 
数组是一种数据结构，用来存储同一类型的集合，也就是说数组包含的变量必须是相同类型！ 
#### 二.创建数组 
基本语法如下： 
 
代码示例 
 
 ```java 
  public class TestDemo {
    public static void main(String[] args) {
        //动态初始化
        //数据类型[] 数组名称 = new 数据类型 []{初始化数据};
        int[] arr1 = new int[]{1,2,3};
        //静态初始化
        //数据类型[] 数组名称 = {初始化数据};
        int[] arr2 ={1,2,3};
    }
}

  ``` 
  
注意：静态初始化的时候，数组元素的个数和初始化数据的格式是一样的！ 
如果你学过其他语言，例如C语言，c语言的数组创建是这样的 
 
其实Java中也可以做到这样，但是不推荐这么写，Java是一种强类型语言，变量前面就是类型，一目了然！ 
#### 三.数组的使用 
我们看一个例子，如何获取数组的长度？ 
如果你学过C语言，那么肯定会说  
 
 ```java 
  int sz = sizeof(arr) / sizeof(arr[0]);
  ``` 
  
其实Java比c语言更方便，直接使用“数组名.length”就可以求出来数组的长度。 
代码如下： 
 
 ```java 
  public class TestDemo {
    public static void main(String[] args) {
         int[] arr ={1,2,3};
         int len = arr.length;
        System.out.println(len);//3
    }
}
  ``` 
  
毫无疑问这个代码运行结果是3； 
那么我们如何访问数组元素呢？ 
我们来看下面的代码： 
 
 ```java 
  public class TestDemo {
    public static void main(String[] args) {
         int[] arr ={1,2,3};
         int len = arr.length;
        System.out.println(len);//3
        System.out.println(arr[0]);//1
        System.out.println(arr[1]);//2
        System.out.println(arr[2]);//3
    }
}

  ``` 
  
显而易见的是，直接使用数组名[数组元素下标]来访问数组元素。但出现了一个问题，为什么arr[0]是1而arr[1]是2？为什么不是arr[1]是1 arr[2]是2吗？ 
这里我们得出一个结论，数组的下标是从0开始的，不是从1开始的。 
我们来尝试访问一下arr[3]看会出现什么情况. 
 
 ```java 
  public class TestDemo {
    public static void main(String[] args) {
         int[] arr ={1,2,3};
         int len = arr.length;
        System.out.println(len);//3
        System.out.println(arr[0]);//1
        System.out.println(arr[1]);//2
        System.out.println(arr[2]);//3
        System.out.println(arr[3]);
    }
}
  ``` 
  
 
我们发现前面都和我们预想一样输出结果都正确，但唯独出现了一串红字，这串红字说明存在数组越界。 
我们由此得出一个结论：在Java下标访问操作中不能超出有效范围也就是[0,length-1],如果超出有效范围，会抛出下标越界异常。 
#### 四.数组的遍历 
所谓遍历，是指将数组中的所有元素都访问一遍，不重不漏，需要搭配循环语句！ 
我们学了数组的访问，那么我们如何遍历数组呢？有两种常用方法 一种是for循环，一种是foreach循环。 
for循环示例 
 
 ```java 
  public class TestDemo {
    public static void main(String[] args) {
        int[] arr = {1,2,3,4,5};
        for(int i = 0 ;i < arr.length;i++){
            System.out.print(arr[i]+" ");
        }
    }
}
  ``` 
  
 
我们发现打印出来了数组的元素。for-each示例 
 
 
 ```java 
  public class TestDemo {
    public static void main(String[] args) {
        int[] arr = {1,2,3,4,5};
        for(int x:arr){
            System.out.print(x+" ");
        }
    }
}
  ``` 
  
 
执行结果一致。 
那么我们什么时候使用for循环，什么时候使用foreach循环？ 
foreach循环适用于不知道循环次数，或者是循环次数很难计算。 
for循环适用于知道循环次数，在复杂的循环中效率更高。 
如果是在循环中使用增删查改操作，for循环可以实现，因为foreach循环不能实现这些操作。 
#### 五.数组作为方法的参数 
基本用法： 
1.打印数组内容 
代码示例： 
 
 ```java 
  public class TestDemo {
    public static void printArray(int[] arr){
        for(int x:arr){
            System.out.print(x+" ");
        }
    }
    public static void main(String[] args) {
        int[] arr = {2,3,4,5,6};
        printArray(arr);
    }
}
  ``` 
  
 
2.求数组元素的和 
 
 ```java 
  public class TestDemo {
    public static int sum(int []arr) {
        int sum = 0;//一定要初始化为0，不然是随机值
        for (int i = 0; i < arr.length; i++) {
            sum += arr[i];
        }
        return sum;
    }

    public static void main(String[] args) {
        int[] arr = {1,2,3,4,5};
        int ret = sum(arr);
        System.out.println(ret);
    }
}
  ``` 
  
 
3.数组每个元素乘2输出 
 
 ```java 
  public class TestDemo {
    public static void multiplication(int[] arr){
        for(int i = 0 ;i < arr.length;i++){
            arr[i]=arr[i]*2;
        }
    }
    public static void printArray(int[] arr){
        for(int x:arr){
            System.out.print(x+" ");
        }
    }
    public static void main(String[] args) {
        int [] arr = {1,2,3,4};
        System.out.println("乘2前:");
        printArray(arr);
        System.out.println();
        System.out.println("乘2后:");
        multiplication(arr);
        printArray(arr);
    }
}
  ``` 
  
 
#### 六.数组相关方法Arrays 
Arrays是操作Java数组的工具类。 
如果要对数组做什么事情，可以通过它来做，当然，有些事情是它做不了的，但是只要它能做到，我们调用它就OK。 
1.数组转字符串：使用Arrays.toString(); 
 
 ```java 
  import java.util.Arrays;

public class TestDemo {
    public static void main(String[] args) {
        int[] arr= {1,2,3,4,5,6};
        String arr1 = Arrays.toString(arr);
        System.out.println(arr1);
    }
}
  ``` 
  
 
这个方法打印出来是以字符串形式打印，把我们要打印的数组，放到toString里面，那么就会帮我们把当前数组，转变为字符串进行输出 
2.数组拷贝 
如何将数组拷贝？最直观的方法是创建一个与当前数组大小相同，类型相同的数组，使用循环一个一个赋值。但Java中存在一些方法可以直接拷贝。 
使用Arrays.copyOf(数组名，数组的长度）； 
 
 ```java 
  import java.util.Arrays;

public class TestDemo {
    public static void main(String[] args) {
        int[] arr1 ={1,2,3,4,5,6};
        int[] arr2 = Arrays.copyOf(arr1,arr1.length);
        System.out.println("拷贝的数组元素为:"+Arrays.toString(arr2));
    }
}
  ``` 
  
 
范围拷贝使用Arrays.copyOfRange(数组名，从开始下标，到结束下标） 
 
 ```java 
  import java.util.Arrays;

public class TestDemo {
    public static void main(String[] args) {
        int[] arr1 = {1,2,3,4,5,6};
        int[] arr2 = Arrays.copyOfRange(arr1,1,3);
        System.out.println("范围拷贝的数组内容为:"+Arrays.toString(arr2));
    }
}
  ``` 
  
 
注意：copyOfRange函数中，数组元素依然是从下标为0开始，且最后一个参数是取不到的，也就是说是取[1,3)左闭右开的元素。 
3.数组排序 
如果你学过C++，那么一定会对sort函数很熟悉，C++中sort函数使用代码示例如下 
 
 ```java 
  #include <iostream>
#include <algorithm>

using namespace std;

const int N = 100;

int main()
{
	int arr[N];
	int n = 0;
	cin >> n;
	for (int i = 0; i < n; i++)
	{
		cin >> arr[i];
	}
	sort(arr,arr+n);
	for (int i = 0; i < n; i++)
	{
		cout << arr[i] << ' ';
	}
	return 0;
}
  ``` 
  
 
而Java中也存在这样的函数：Arrays.sort 
 
 ```java 
  import java.util.Arrays;

public class TestDemo {
    public static void main(String[] args) {
        int[] arr = {5,4,3,2,1};
        Arrays.sort(arr);
        System.out.println(Arrays.toString(arr));
    }
}
  ``` 
  
 
我们可以看到，sort函数均是以升序排列。 
4.数组查找 
①.顺序查找： 
 
 ```java 
  public class TestDemo {
    public static int find(int[] arr,int x){
        for(int i = 0;i<arr.length;i++){
            if(arr[i]==x) return i;
        }
        return -1;//表示没有找到
    }
    public static void main(String[] args) {
        int [] arr = {1,2,3,4,5};
        System.out.println(find(arr,10));
    }
}
  ``` 
  
 
②.二分查找 
手动实现： 
 
 ```java 
  public class TestDemo {
    public static int binarySearch(int [] arr,int x){
        int left = 0;
        int right = arr.length-1;
        while(left<=right){
            int mid = left+right>>1;
            if(x<arr[mid]){
                //表示在左边
                right=mid-1;
            }
            else if(x>arr[mid]){
                //表示在右边
                left = mid + 1;
            }
            else {
                //相等说明找到
                return mid;
            }
        }
        return -1;//循环结束，说明没找到;
    }
    public static void main(String[] args) {
        int [] arr = {1,2,3,4,5};
        System.out.println(binarySearch(arr,4));
    }
}
  ``` 
  
 
但Java中 这个方法以及被封装好了 我们可以使用Arrays.binarySearch(数组名，要找的元素);来实现 
 
 ```java 
  import java.util.Arrays;

public class TestDemo {
    public static void main(String[] args) {
        int [] arr = {1,2,3,4,5};
        System.out.println(Arrays.binarySearch(arr,4));
    }
}
  ``` 
  
 
以上就是Java的数组讲解，感谢观看。
                
        