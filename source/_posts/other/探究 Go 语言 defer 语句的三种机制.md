---
title: 推荐系列-探究 Go 语言 defer 语句的三种机制
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 878
cover_picture: 'https://static.oschina.net/uploads/img/202003/20104905_xf4F.jpeg'
abbrlink: 2edec8a8
date: 2021-04-14 07:54:42
---

&emsp;&emsp;Golang 的 1.13 版本 与 1.14 版本对 defer 进行了两次优化，使得 defer 的性能开销在大部分场景下都得到大幅降低，其中到底经历了什么原理？ 这是因为这两个版本对 defer 各加入了一项新的机...
<!-- more -->

                                                                                                                                                                                        Golang 的 1.13 版本 与 1.14 版本对 defer 进行了两次优化，使得 defer 的性能开销在大部分场景下都得到大幅降低，其中到底经历了什么原理？ 
这是因为这两个版本对  ```java 
  defer
  ```  各加入了一项新的机制，使得  ```java 
  defer
  ```  语句在编译时，编译器会根据不同版本与情况，对每个  ```java 
  defer
  ```  选择不同的机制，以更轻量的方式运行调用。 
##### 堆上分配 
在 Golang 1.13 之前的版本中，所有  ```java 
  defer
  ```  都是在堆上分配，该机制在编译时会进行两个步骤： 
 
 在  ```java 
  defer
  ```  语句的位置插入  ```java 
  runtime.deferproc
  ``` ，当被执行时，延迟调用会被保存为一个  ```java 
  _defer
  ```  记录，并将被延迟调用的入口地址及其参数复制保存，存入 Goroutine 的调用链表中。 
 在函数返回之前的位置插入  ```java 
  runtime.deferreturn
  ``` ，当被执行时，会将延迟调用从 Goroutine 链表中取出��执行，多个延迟调用则以 jmpdefer 尾递归调用方式连续执行。 
 
这种机制的主要性能问题存在于每个  ```java 
  defer
  ```  语句产生记录时的内存分配，以及记录参数和完成调用时参数移动的系统调用开销。 
##### 栈上分配 
Go 1.13 版本新加入  ```java 
  deferprocStack
  ```  实现了在栈上分配的形式来取代  ```java 
  deferproc
  ``` ，相比后者，栈上分配在函数返回后  ```java 
  _defer
  ```  便得到释放，省去了内存分配时产生的性能开销，只需适当维护  ```java 
  _defer
  ```  的链表即可。 
编译器有自己的逻辑去选择使用  ```java 
  deferproc
  ```  还是  ```java 
  deferprocStack
  ``` ，大部分情况下都会使用后者，性能会提升约 30%。不过在  ```java 
  defer
  ```  语句出现在了循环语句里，或者无法执行更高阶的编译器优化时，亦或者同一个函数中使用了过多的  ```java 
  defer
  ```  时，依然会使用  ```java 
  deferproc
  ``` 。 
##### 开放编码 
Go 1.14 版本继续加入了开发编码（open coded），该机制会将延迟调用直接插入函数返回之前，省去了运行时的  ```java 
  deferproc
  ```  或  ```java 
  deferprocStack
  ```  操作，在运行时的  ```java 
  deferreturn
  ```  也不会进行尾递归调用，而是直接在一个循环中遍历所有延迟函数执行。 
这种机制使得  ```java 
  defer
  ```  的开销几乎可以忽略，唯一的运行时成本就是存储参与延迟调用的相关信息，不过使用此机制需要一些条件： 
 
 没有禁用编译器优化，即没有设置  ```java 
  -gcflags "-N"
  ``` ； 
 函数内  ```java 
  defer
  ```  的数量不超过 8 个，且返回语句与延迟语句个数的乘积不超过 15； 
  ```java 
  defer
  ```  不是在循环语句中。 
 
该机制还引入了一种元素 —— 延迟比特（defer bit），用于运行时记录每个  ```java 
  defer
  ```  是否被执行（尤其是在条件判断分支中的  ```java 
  defer
  ``` ），从而便于判断最后的延迟调用该执行哪些函数。 
延迟比特的原理： 同一个函数内每出现一个  ```java 
  defer
  ```  都会为其分配 1 个比特，如果被执行到则设为 1，否则设为 0，当到达函数返回之前需要判断延迟调用时，则用掩码判断每个位置的比特，若为 1 则调用延迟函数，否则跳过。 
为了轻量，官方将延迟比特限制为 1 个字节，即 8 个比特，这就是为什么不能超过 8 个  ```java 
  defer
  ```  的原因，若超过依然会选择堆栈分配，但显然大部分情况不会超过 8 个。 
用代码演示如下： 
 ```java 
  deferBits = 0  // 延迟比特初始值 00000000

deferBits |= 1<<0  // 执行第一个 defer，设置为 00000001
_f1 = f1  // 延迟函数
_a1 = a1  // 延迟函数的参数
if cond {
    // 如果第二个 defer 被执行，则设置为 00000011，否则依然为 00000001
    deferBits |= 1<<1
    _f2 = f2
    _a2 = a2
}
...
exit:
// 函数返回之前，倒序检查延迟比特，通过掩码逐位进行与运算，来判断是否调用函数

// 假如 deferBits 为 00000011，则 00000011 & 00000010 != 0，因此调用 f2
// 否则 00000001 & 00000010 == 0，不调用 f2
if deferBits & 1<<1 != 0 {
    deferBits &^= 1<<1  // 移位为下次判断准备
    _f2(_a2)
}
// 同理，由于 00000001 & 00000001 != 0，调用 f1
if deferBits && 1<<0 != 0 {
    deferBits &^= 1<<0
    _f1(_a1)
}

  ```  
##### 总结 
以往 Golang defer 语句的性能问题一直饱受诟病，最近正式发布的 1.14 版本终于为这个争议画上了阶段性的句号。如果不是在特殊情况下，我们不需要再计较 defer 的性能开销。 
##### 参考资料 
[1] Ou Changkun - Go 语言原本: https://changkun.de/golang/zh-cn/part2runtime/ch09lang/defer/ 
[2] 峰云就她了 - go1.14实现defer性能大幅度提升原理: http://xiaorui.cc/archives/6579 
[3] 34481-opencoded-defers: https://github.com/golang/proposal/blob/master/design/34481-opencoded-defers.md 
 
本文属于原创，首发于微信公众号「面向人生编程」，如需转载请后台留言。
                                        