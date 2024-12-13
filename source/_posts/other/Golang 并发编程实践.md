---
title: 推荐系列-Golang 并发编程实践
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 2079
cover_picture: 'https://img-blog.csdnimg.cn/20210328003305838.jpg'
abbrlink: eadf16b0
date: 2021-04-15 09:46:45
---

&emsp;&emsp;人是一种高并发的物种，细品。 初识 对 Go 语言的第一印象就是其原生地支持并发编程，而且使用的是协程，比线程更加轻量。 关于进程、线程和协程的区别 进程是“程序执行的一个实例” ，担当...
<!-- more -->

                                                                                                                                                                                        ![Test](https://img-blog.csdnimg.cn/20210328003305838.jpg  'Golang 并发编程实践') 
人是一种高并发的物种，细品。 
#### 初识 
对 Go 语言的第一印象就是其原生地支持并发编程，而且使用的是协程，比线程更加轻量。 
![Test](https://img-blog.csdnimg.cn/20210328003305838.jpg  'Golang 并发编程实践') 
##### 关于进程、线程和协程的区别 
 
 进程是“程序执行的一个实例” ，担当分配系统资源的实体。进程创建必须分配一个完整的独立地址空间。进程切换只发生在内核态。 
 线程：线程是进程的一个执行流，独立执行它自己的程序代码，是程序执行流的最小单元，是处理器调度和分派的基本单位。一个进程可以有一个或多个线程。 
 协程：协程不是进程或线程，其执行过程更类似于子例程，或者说不带返回值的函数调用。在语言级别可以创建并发协程，然后编写代码去进行管理。Go 将这一步承包下来，使协程并发运行成本更低。 
 
![Test](https://img-blog.csdnimg.cn/20210328003305838.jpg  'Golang 并发编程实践') 
##### Go 实现最简单的并发 
 
 ```java 
  for i := 0; i &lt; 10; i++ {
    go func(n int) {
        fmt.Println(n)
    }(i)
}

  ``` 
  
#### 项目实践 
最近有个项目需要同时调用多个 job，并要等待这些 job 完成之后才能往下执行。 
##### 串行执行 job 
最开始，我们拥有一个执行 job 的方法，并且串行执行所有的 job： 
 
 ```java 
  func buildJob(name string) {
    ...
}

buildJob("A")
buildJob("B")
buildJob("C")

  ``` 
  
##### 并行执行 job 
因为所有 job 是可以并发执行的，这样就不用必须等待上一个 job 执行完成后，才能继续执行其他 job。我们可以使用 Go 语言的关键字  
 ```java 
  go
  ``` 
  来快速启用一个  
 ```java 
  goroutine
  ``` 
 ，下面我们将并发地执行三个 job： 
 
 ```java 
  go buildJob("A")
go buildJob("B")
go buildJob("C")

  ``` 
  
##### 等待所有 job 完成 
怎样才能知道每个 job 是否已经完成，这里可以使用  
 ```java 
  channel
  ``` 
  进行通信，并使用  
 ```java 
  select
  ``` 
  检查执行结果： 
 
 ```java 
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
        }
        
        jobCount--
        if jobCount &lt;= 0 {
            break
        }
    }
    
    return nil
}

  ``` 
  
##### 发现问题 
当 job A 执行失败时， 
 ```java 
  build
  ``` 
  方法会  
 ```java 
  return err
  ``` 
  退出，并执行  
 ```java 
  close(errCh)
  ``` 
 。可是此时另外两个 job B 和 C 可能还没执行完成，同时也会把结果发给  
 ```java 
  errCh
  ``` 
 ，但由于这个时候  
 ```java 
  errCh
  ``` 
  已经被关闭了，会导致程序退出  
 ```java 
  panic: send on closed channel
  ``` 
 。 
##### 优化代码 
在给 channel 发送数据的时候，可以使用接收数据的第二个值判断 channel 是否关闭： 
 
 ```java 
  func buildJob(ch chan error, name string) {
    var err error
    
    ... // build job
    
    if _, ok := &lt;-ch; !ok {
        return
    }
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
        }
        
        jobCount--
        if jobCount &lt;= 0 {
            break
        }
    }
    
    return nil
}

  ``` 
  
#### 总结 
Go 并发编程看似只需要一个关键字  
 ```java 
  go
  ``` 
  就可以跑起来一个  
 ```java 
  goroutine
  ``` 
 ，但真正实践中，还是有需要问题需要去处理的。 
原文链接：https://k8scat.com/posts/code-with-golang-concurrency/
                                        