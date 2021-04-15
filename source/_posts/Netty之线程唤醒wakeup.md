---
title: 推荐系列-Netty之线程唤醒wakeup
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 686
cover_picture: 'https://oscimg.oschina.net/oscnet/up-23567a6015e440746726b734b422a2fd13c.png'
abbrlink: f3c6fac8
date: 2021-04-15 09:53:06
---

&emsp;&emsp;首先回顾下, Netty中的IO线程主要完成三件事 1.轮询IO事件 2.处理IO事件 3.执行任务 在轮询IO事件的过程中,在Linux系统下, 使用epoll实现. 涉及的Netty代码如下 private void select() { //...
<!-- more -->

                                                                                                                                                                                        首先回顾下, Netty中的IO线程主要完成三件事 
1.轮询IO事件 2.处理IO事件 3.执行任务 
在轮询IO事件的过程中,在Linux系统下, 使用epoll实现. 涉及的Netty代码如下 
 
 ```java 
  private void select() {

    // ...
    int selectedKeys = selector.select(timeoutMillis);
    // ...

}

具体源码位置:
io.netty.channel.nio.NioEventLoop#select

  ``` 
  
![Test](https://oscimg.oschina.net/oscnet/up-23567a6015e440746726b734b422a2fd13c.png  'Netty之线程唤醒wakeup') 
当IO线程执行以上代码的时候, 如果超时时间timeoutMillis还没有到达的情况下, IO线程就会处于阻塞状态. 这个时候如果非IO线程需要向对端写数据, 由于Netty是异步的框架, 它的实现是非IO线程将写数据封装成一个任务提交到IO线程的任务队列里. 
![Test](https://oscimg.oschina.net/oscnet/up-23567a6015e440746726b734b422a2fd13c.png  'Netty之线程唤醒wakeup') 
当任务提交到任务队列后, 那么就会面临一个问题.此时的IO线程处于阻塞状态, 是否需要唤醒它呢? 答案是需要唤醒, 之所以要把它唤醒, 是需要让IO线程可以及时的处理刚刚非IO线程提交的任务. 
 
 ```java 
  @Override
protected void wakeup(boolean inEventLoop) {
    if (!inEventLoop && wakenUp.compareAndSet(false, true)) {
        // 唤醒IO线程
        selector.wakeup();
    }
}

源码位置: io.netty.channel.nio.NioEventLoop#wakeup



  ``` 
  
以上代码, 就是唤醒的代码, 主要调用的方法就是wakeup. 
![Test](https://oscimg.oschina.net/oscnet/up-23567a6015e440746726b734b422a2fd13c.png  'Netty之线程唤醒wakeup') 
接下来通过查看它的系统调用, 弄清楚它到底是如何实现的. 
![Test](https://oscimg.oschina.net/oscnet/up-23567a6015e440746726b734b422a2fd13c.png  'Netty之线程唤醒wakeup') 
代码如下 
 
 ```java 
  // WakeUp.java
import java.net.InetSocketAddress;
import java.nio.channels.SelectionKey;
import java.nio.channels.Selector;
import java.nio.channels.ServerSocketChannel;

public class WakeUp {

    public static void main(String[] args) throws Exception {

        ServerSocketChannel serverSocketChannel;

        Selector selector = Selector.open();
        serverSocketChannel = ServerSocketChannel.open();

        serverSocketChannel.socket().bind(new InetSocketAddress("127.0.0.1", 8080), 64);
        serverSocketChannel.configureBlocking(false);
        serverSocketChannel.register(selector, SelectionKey.OP_ACCEPT);

        new Thread() {
            @Override
            public void run() {
                try {
                    System.out.print("Thread[" + Thread.currentThread().getName() + "]invoke select\r\n");
                    // 底层调用epoll_wait而阻塞
                    int readyChannels = selector.select();
                } catch (Exception x) {
                    x.printStackTrace();
                }
                System.out.print("Success...\r\n");
            }
        }.start();

        // 之所以设置的时间比较久, 是为了让程序暂时不结束
        Thread.sleep(5_60_000);
        System.out.print("Thread[" + Thread.currentThread().getName() + "]invoke wakeup\r\n");
        // 唤醒阻塞线程
        selector.wakeup();

    }
}


  ``` 
  
以上代码的逻辑比较简单, 一个线程调用select()方法阻塞, 另一个线程唤醒它. 首先javac编译以上代码, 然后使用一个查看系统调用的命令strace. strace -ff -o strace java WakeUp 
![Test](https://oscimg.oschina.net/oscnet/up-23567a6015e440746726b734b422a2fd13c.png  'Netty之线程唤醒wakeup') 
 
 ```java 
  具体如何使用strace请童鞋自行Google

  ``` 
  
执行以后, 通过以下步骤进行分析 
![Test](https://oscimg.oschina.net/oscnet/up-23567a6015e440746726b734b422a2fd13c.png  'Netty之线程唤醒wakeup') 
使用jps查看进程ID号 
![Test](https://oscimg.oschina.net/oscnet/up-23567a6015e440746726b734b422a2fd13c.png  'Netty之线程唤醒wakeup') 
获得PID=1141 
![Test](https://oscimg.oschina.net/oscnet/up-23567a6015e440746726b734b422a2fd13c.png  'Netty之线程唤醒wakeup') 
进入 /proc/1141/fd目录下, 就可以查看到当前进程(PID=1141)打开的文件描述符 
![Test](https://oscimg.oschina.net/oscnet/up-23567a6015e440746726b734b422a2fd13c.png  'Netty之线程唤醒wakeup') 
0,1,2这三个文件描述符是标准输入,标准输出和错误输出. 4号文件描述符是在使用epoll实现的多路复用IO创建的一个文件描述符. 5,6这两个文件描述符是一对管道. 7,8这两个文件描述符是一对套接字. 
![Test](https://oscimg.oschina.net/oscnet/up-23567a6015e440746726b734b422a2fd13c.png  'Netty之线程唤醒wakeup') 
在上面执行strace命令的时候, 在它的同目录下会生成如下文件 
![Test](https://oscimg.oschina.net/oscnet/up-23567a6015e440746726b734b422a2fd13c.png  'Netty之线程唤醒wakeup') 
通过搜索strace命令打印的文件内容, 查看具体的系统调用方法. 
使用grep命令搜索关键字pipe 
![Test](https://oscimg.oschina.net/oscnet/up-23567a6015e440746726b734b422a2fd13c.png  'Netty之线程唤醒wakeup') 
程序调用pipe这个系统调用创建管道. 其中的5和6是两个文件描述符,也就是在/proc/1141/fd目录下的那两个5和6文件描述符. 5这个描述符用来读取数据, 6这个描述符用来写入数据, 这样就实现了两个进程之间的通信. 
使用grep命令搜索关键字socketpair 
![Test](https://oscimg.oschina.net/oscnet/up-23567a6015e440746726b734b422a2fd13c.png  'Netty之线程唤醒wakeup') 
程序调用socketpair这个系统调用创建套接字. 其中的8和9是两个文件描述符,也就是在/proc/1141/fd目录下的那两个8和9文件描述符. 8这个描述符用来读取数据, 9这个描述符用来写入数据, 这样就实现了两个进程之间的通信. 
![Test](https://oscimg.oschina.net/oscnet/up-23567a6015e440746726b734b422a2fd13c.png  'Netty之线程唤醒wakeup') 
 
使用grep命令搜索关键字epoll 
![Test](https://oscimg.oschina.net/oscnet/up-23567a6015e440746726b734b422a2fd13c.png  'Netty之线程唤醒wakeup') 
通过epoll_create创建4号文件描述符. 5和7这两个文件描述符添加到epoll上(底层是添加到内核的红黑树). 
  
在上面的Java代码中, 当调用int readyChannels = selector.select()方法的时候, 底层就会调用epoll_wait方法, 那么线程就会阻塞在此. 当另一个线程调用selector.wakeup()的时候, 它就会向6号文件描述符写入数据, 通过pipe通信的方式, 唤醒另一个阻塞的线程. 可以通过grep搜索关键字write验证结论. 
![Test](https://oscimg.oschina.net/oscnet/up-23567a6015e440746726b734b422a2fd13c.png  'Netty之线程唤醒wakeup') 
通过write系统调用向6号文件描述符写入数据, 具体数据没有任何含义, 它就是想唤醒阻塞的线程. 与6号文件描述符对应的是5号文件描述符. 由于epoll管理着5号文件描述符, 这样epoll发现有文件描述符就绪(5号文件描述符就绪), 被阻塞的线程也就会被操作系统重新调度. 
  
以上简单介绍了Netty中IO线程如何阻塞和被唤醒的底层系统调用. 
 
                                        