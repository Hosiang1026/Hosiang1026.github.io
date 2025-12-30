---
title: Golang并发编程实践
categories: Java开发全栈系列
tags:
  - Go
  - Java
abbrlink: 54c0f351
date: 2021-02-13 00:00:00
top: 35
---


人是一种高并发的物种，细品。 初识 对 Go 语言的第一印象就是其原生地支持并发编程，而且使用的是协程，比线程更加轻量。 关于进程、线程和协程的区别 进程是“程序执行的一个实例” ，担当。..
<!-- more -->

                                                                                                                                                                                        ![Test](https://img-blog.csdnimg.cn/20210328003305838.jpg  'Golang 并发编程实践') 
人是一种高并发的物种，细品。 

### 一、Golang并发编程实践
#### 1.1 初识
刚开始接触 Go 语言的时候，最吸引人的就是它原生支持并发编程，而且用的是协程，比线程轻量多了。 
##### 关于进程、线程和协程的区别
 
 简单来说，进程是"程序执行的一个实例"，负责分配系统资源。创建进程需要分配完整的独立地址空间，进程切换只在内核态进行。 
 线程是进程的一个执行流，独立执行自己的程序代码，是程序执行流的最小单元，也是处理器调度和分派的基本单位。一个进程可以有一个或多个线程。 
 协程不是进程或线程，执行过程更像子例程，或者说是不带返回值的函数调用。在语言级别可以创建并发协程，然后编写代码进行管理。Go 把这一步承包了，让协程并发运行成本更低。 
 
##### Go 实现最简单的并发
 
 ```text
  for i := 0; i &lt; 10; i++ {
    go func(n int) {
        fmt.Println(n)
    }(i)

  ``` 
  
#### 1.2 项目实践
最近在项目中遇到一个需求：需要同时调用多个 job，并且要等所有 job 完成之后才能继续往下执行。 
##### 串行执行 job
最开始的做法很简单，就是串行执行所有的 job： 
 
 ```java
  func buildJob(name string) {
    ...
}

buildJob("A")
buildJob("B")
buildJob("C")

  ``` 
  
##### 并行执行 job
既然所有 job 可以并发执行，那就不用等上一个 job 完成再执行下一个了。用 Go 的关键字  
 `go` 
  就能快速启动一个  
 `goroutine` 
 ，下面并发执行三个 job： 
 
```
  go buildJob("A")
go buildJob("B")
go buildJob("C")
```

  ``` 
  
##### 等待所有 job 完成
问题是，怎么知道每个 job 是否已经完成？这时候可以用  
 `channel` 
  来通信，用  
 ```sql
SELECT 
``` 
  来检查执行结果： 
 
  func buildJob(ch chan error, name string) {
    var err error
    
    ... // build job
    
    ch &lt;- err // finnaly, send the result into channel
}

func build() error {
    jobCount := 3

    errCh := make(err chan error, jobCount)
    defer close(errCh) // 关闭 channel

    go buildJob(errCh, "A")
    go buildJob(errCh, "B")
    go buildJob(errCh, "C")

    for {
        select {
        case err := &lt;-ch:
            if err != nil {
                return err
            }
        
        jobCount--
        if jobCount &lt;= 0 {
            break
        }
    
    return nil
}

  ``` 
  
##### 发现问题
实际运行的时候发现了一个问题：当 job A 执行失败时， 
 `build` 
```
  方法会 `return err` 退出，并执行 `close(errCh)` 。但此时另外两个 job B 和 C 可能还在执行，它们也会把结果发给  
```
 `errCh` 
 ，可这时候  
  已经被关闭了，程序就会报错  
 `panic: send on closed channel` 
 。 
##### 优化代码
解决方法是：在给 channel 发送数据之前，先检查 channel 是否已经关闭。可以用接收数据的第二个返回值来判断： 
 
    
    
```
    if _, ok := &lt;-ch; !ok {
```
        return
    }
}


```
    for {
```
            }
        
            break
        }
    
}

  ``` 
  
#### 1.3 总结
Go 并发编程看起来很简单，一个关键字  
 `go` 
  就能启动一个  
``` 
 ，但实际用起来还是有不少坑要踩的。 
                                        
```