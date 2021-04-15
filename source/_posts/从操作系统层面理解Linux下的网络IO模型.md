---
title: 推荐系列-从操作系统层面理解Linux下的网络IO模型
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 1759
cover_picture: 'https://static.oschina.net/uploads/img/202002/03143333_a9iy.jpg'
abbrlink: efc2b93a
date: 2021-04-15 09:19:21
---

&emsp;&emsp;I/O（ INPUT OUTPUT），包括文件I/O、网络I/O。 计算机世界里的速度鄙视： 内存读数据：纳秒级别。 千兆网卡读数据：微妙级别。1微秒=1000纳秒，网卡比内存慢了千倍。 磁盘读数据：毫秒级别。...
<!-- more -->

                                                                                                                                                                                        I/O（ INPUT OUTPUT），包括文件I/O、网络I/O。 
计算机世界里的速度鄙视： 
 
 内存读数据：纳秒级别。 
 千兆网卡读数据：微妙级别。1微秒=1000纳秒，网卡比内存慢了千倍。 
 磁盘读数据：毫秒级别。1毫秒=10万纳秒 ，硬盘比内存慢了10万倍。 
 CPU一个时钟周期1纳秒上下，内存算是比较接近CPU的，其他都等不起。 
 
CPU 处理数据的速度远大于I/O准备数据的速度 。 
任何编程语言都会遇到这种CPU处理速度和I/O速度不匹配的问题! 
在网络编程中如何进行网络I/O优化：怎么高效地利用CPU进行网络数据处理？？？ 
#### 一、相关概念 
从操作系统层面怎么理解网络I/O呢？计算机的世界有一套自己定义的概念。如果不明白这些概念，就无法真正明白技术的设计思路和本质。所以在我看来，这些概念是了解技术和计算机世界的基础。 
##### 1.1 同步与异步，阻塞与非阻塞 
理解网络I/O避不开的话题：同步与异步，阻塞与非阻塞。 
拿山治烧水举例来说，(山治的行为好比用户程序，烧水好比内核提供的系统调用)，这两组概念翻译成大白话可以这么理解。 
 
 同步/异步关注的是水烧开之后需不需要我来处理。 
 阻塞/非阻塞关注的是在水烧开的这段时间是不是干了其他事。 
 
##### 1.1.1 同步阻塞 
点火后，傻等，不等到水开坚决不干任何事（阻塞），水开了关火（同步）。 
![Test](https://oscimg.oschina.net/oscnet/up-d0bcb16731cc02e9ce38b2284ee91f4fac2.png  '从操作系统层面理解Linux下的网络IO模型') 
###### 1.1.2 同步非阻塞 
点火后，去看电视（非阻塞），时不时看水开了没有，水开后关火（同步）。 
![Test](https://oscimg.oschina.net/oscnet/up-d0bcb16731cc02e9ce38b2284ee91f4fac2.png  '从操作系统层面理解Linux下的网络IO模型') 
###### 1.1.3 异步阻塞 
按下开关后，傻等水开（阻塞），水开后自动断电（异步）。 
![Test](https://oscimg.oschina.net/oscnet/up-d0bcb16731cc02e9ce38b2284ee91f4fac2.png  '从操作系统层面理解Linux下的网络IO模型') 
网络编程中不存在的模型。 
###### 1.1.4 异步非阻塞 
按下开关后，该干嘛干嘛 （非阻塞），水开后自动断电（异步）。 
![Test](https://oscimg.oschina.net/oscnet/up-d0bcb16731cc02e9ce38b2284ee91f4fac2.png  '从操作系统层面理解Linux下的网络IO模型') 
##### 1.2 内核空间 、用户空间 
![Test](https://oscimg.oschina.net/oscnet/up-d0bcb16731cc02e9ce38b2284ee91f4fac2.png  '从操作系统层面理解Linux下的网络IO模型') 
 
 内核负责网络和文件数据的读写。 
 用户程序通过系统调用获得网络和文件的数据。 
 
###### 1.2.1 内核态 用户态 
![Test](https://oscimg.oschina.net/oscnet/up-d0bcb16731cc02e9ce38b2284ee91f4fac2.png  '从操作系统层面理解Linux下的网络IO模型') 
 
 程序为读写数据不得不发生系统调用。 
 通过系统调用接口，线程从用户态切换到内核态，内核读写数据后，再切换回来。 
 进程或线程的不同空间状态。 
 
###### 1.2.2 线程的切换 
![Test](https://oscimg.oschina.net/oscnet/up-d0bcb16731cc02e9ce38b2284ee91f4fac2.png  '从操作系统层面理解Linux下的网络IO模型') 
用户态和内核态的切换耗时，费资源（内存、CPU） 
优化建议： 
 
 更少的切换。 
 共享空间。 
 
##### 1.3 套接字 – socket 
![Test](https://oscimg.oschina.net/oscnet/up-d0bcb16731cc02e9ce38b2284ee91f4fac2.png  '从操作系统层面理解Linux下的网络IO模型') 
 
 有了套接字，才可以进行网络编程。 
 应用程序通过系统调用socket(),建立连接，接收和发送数据（I / O）。 
 SOCKET 支持了非阻塞，应用程序才能非阻塞调用，支持了异步，应用程序才能异步调用 
 
##### 1.4 文件描述符 –FD 句柄 
![Test](https://oscimg.oschina.net/oscnet/up-d0bcb16731cc02e9ce38b2284ee91f4fac2.png  '从操作系统层面理解Linux下的网络IO模型') 
![Test](https://oscimg.oschina.net/oscnet/up-d0bcb16731cc02e9ce38b2284ee91f4fac2.png  '从操作系统层面理解Linux下的网络IO模型') 
![Test](https://oscimg.oschina.net/oscnet/up-d0bcb16731cc02e9ce38b2284ee91f4fac2.png  '从操作系统层面理解Linux下的网络IO模型') 
网络编程都需要知道FD？？？ FD是个什么鬼？？？ 
Linux：万物都是文件，FD就是文件的引用。像不像JAVA中万物都是对象?程序中操作的是对象的引用。JAVA中创建对象的个数有内存的限制，同样FD的个数也是有限制的。 
![Test](https://oscimg.oschina.net/oscnet/up-d0bcb16731cc02e9ce38b2284ee91f4fac2.png  '从操作系统层面理解Linux下的网络IO模型') 
Linux在处理文件和网络连接时，都需要打开和关闭FD。 
每个进程都会有默认的FD： 
 
 0 标准输入 stdin 
 1 标准输出 stdout 
 2 错误输出 stderr 
 
##### 1.5 服务端处理网络请求的过程 
![Test](https://oscimg.oschina.net/oscnet/up-d0bcb16731cc02e9ce38b2284ee91f4fac2.png  '从操作系统层面理解Linux下的网络IO模型') 
 
 连接建立后。 
 等待数据准备好（CPU 闲置）。 
 将数据从内核拷贝到进程中（CPU闲置）。 
 
怎么优化呢？ 
对于一次I/O访问（以read举例），数据会先被拷贝到操作系统内核的缓冲区，然后才会从操作系统内核的缓冲区拷贝到应用程序的地址空间。 
所以说，当一个read操作发生时，它会经历两个阶段： 
 
 等待数据准备 (Waiting for the data to be ready)。 
 将数据从内核拷贝到进程中 (Copying the data from the kernel to the process)。 
 
正是因为这两个阶段，Linux系统升级迭代中出现了下面三种网络模式的解决方案。 
#### 二、IO模型介绍 
##### 2.1 阻塞 I/O - Blocking I/O 
![Test](https://oscimg.oschina.net/oscnet/up-d0bcb16731cc02e9ce38b2284ee91f4fac2.png  '从操作系统层面理解Linux下的网络IO模型') 
简介：最原始的网络I/O模型。进程会一直阻塞���直到数据拷贝完成。 
缺点：高并发时，服务端与客户端对等连接，线程多带来的问题： 
 
 CPU资源浪费，上下文切换。 
 内存成本几何上升，JVM一个线程的成本约1MB。 
 
 ```java 
  public static void main(String[] args) throws IOException {
        ServerSocket ss = new ServerSocket();
        ss.bind(new InetSocketAddress(Constant.HOST, Constant.PORT));
        int idx =0;
        while (true) {
            final Socket socket = ss.accept();//阻塞方法
            new Thread(() -> {
                handle(socket);
            },"线程["+idx+"]" ).start();
        }
    }

    static void handle(Socket socket) {
        byte[] bytes = new byte[1024];
        try {
            String serverMsg = "  server sss[ 线程："+ Thread.currentThread().getName() +"]";
            socket.getOutputStream().write(serverMsg.getBytes());//阻塞方法
            socket.getOutputStream().flush();
        } catch (Exception e) {
            e.printStackTrace();
        } 
    }

  ```  
##### 2.2 非阻塞 I/O - Non Blocking IO 
![Test](https://oscimg.oschina.net/oscnet/up-d0bcb16731cc02e9ce38b2284ee91f4fac2.png  '从操作系统层面理解Linux下的网络IO模型') 
简介：进程反复系统调用，并马上返回结果。 
缺点：当进程有1000fds,代表用户进程轮询发生系统调用1000次kernel，来回的用户态和内核态的切换，成本几何上升。 
 ```java 
  public static void main(String[] args) throws IOException {
        ServerSocketChannel ss = ServerSocketChannel.open();
        ss.bind(new InetSocketAddress(Constant.HOST, Constant.PORT));
        System.out.println(" NIO server started ... ");
        ss.configureBlocking(false);
        int idx =0;
        while (true) {
            final SocketChannel socket = ss.accept();//阻塞方法
            new Thread(() -> {
                handle(socket);
            },"线程["+idx+"]" ).start();
        }
    }
    static void handle(SocketChannel socket) {
        try {
            socket.configureBlocking(false);
            ByteBuffer byteBuffer = ByteBuffer.allocate(1024);
            socket.read(byteBuffer);
            byteBuffer.flip();
            System.out.println("请求：" + new String(byteBuffer.array()));
            String resp = "服务器响应";
            byteBuffer.get(resp.getBytes());
            socket.write(byteBuffer);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

  ```  
##### 2.3 I/O 多路复用 - IO multiplexing 
![Test](https://oscimg.oschina.net/oscnet/up-d0bcb16731cc02e9ce38b2284ee91f4fac2.png  '从操作系统层面理解Linux下的网络IO模型') 
简介：单个线程就可以同时处理多个网络连接。内核负责轮询所有socket，当某个socket有数据到达了，就通知用户进程。多路复用在Linux内核代码迭代过程中依次支持了三种调用，即SELECT、POLL、EPOLL三种多路复用的网络I/O模型。下文将画图结合Java代码解释。 
###### 2.3.1 I/O 多路复用- select 
![Test](https://oscimg.oschina.net/oscnet/up-d0bcb16731cc02e9ce38b2284ee91f4fac2.png  '从操作系统层面理解Linux下的网络IO模型') 
简介：有连接请求抵达了再检查处理。 
缺点： 
 
 句柄上限- 默认打开的FD有限制,1024个。 
 重复初始化-每次调用 select()，需要把 fd 集合从用户态拷贝到内核态，内核进行遍历。 
 逐个排查所有FD状态效率不高。 
 
服务端的select 就像一块布满插口的插排，client端的连接连上其中一个插口，建立了一个通道，然后再在通道依次注册读写事件。一个就绪、读或写事件处理时一定记得删除，要不下次还能处理。 
 ```java 
  public static void main(String[] args) throws IOException {
        ServerSocketChannel ssc = ServerSocketChannel.open();//管道型ServerSocket
        ssc.socket().bind(new InetSocketAddress(Constant.HOST, Constant.PORT));
        ssc.configureBlocking(false);//设置非阻塞
        System.out.println(" NIO single server started, listening on :" + ssc.getLocalAddress());
        Selector selector = Selector.open();
        ssc.register(selector, SelectionKey.OP_ACCEPT);//在建立好的管道上，注册关心的事件 就绪
        while(true) {
            selector.select();
            Set<SelectionKey> keys = selector.selectedKeys();
            Iterator<SelectionKey> it = keys.iterator();
            while(it.hasNext()) {
                SelectionKey key = it.next();
                it.remove();//处理的事件，必须删除
                handle(key);
            }
        }
    }
    private static void handle(SelectionKey key) throws IOException {
        if(key.isAcceptable()) {
                ServerSocketChannel ssc = (ServerSocketChannel) key.channel();
                SocketChannel sc = ssc.accept();
                sc.configureBlocking(false);//设置非阻塞
                sc.register(key.selector(), SelectionKey.OP_READ );//在建立好的管道上，注册关心的事件 可读
        } else if (key.isReadable()) { //flip
            SocketChannel sc = null;
                sc = (SocketChannel)key.channel();
                ByteBuffer buffer = ByteBuffer.allocate(512);
                buffer.clear();
                int len = sc.read(buffer);
                if(len != -1) {
                    System.out.println("[" +Thread.currentThread().getName()+"] recv :"+ new String(buffer.array(), 0, len));
                }
                ByteBuffer bufferToWrite = ByteBuffer.wrap("HelloClient".getBytes());
                sc.write(bufferToWrite);
        }
    }

  ```  
###### 2.3.2 I/O 多路复用 – poll 
![Test](https://oscimg.oschina.net/oscnet/up-d0bcb16731cc02e9ce38b2284ee91f4fac2.png  '从操作系统层面理解Linux下的网络IO模型') 
简介：设计新的数据结构(链表)提供使用效率。 
poll和select相比在本质上变化不大，只是poll没有了select方式的最大文件描述符数量的限制。 
缺点：逐个排查所有FD状态效率不高。 
###### 2.3.3 I/O 多路复用- epoll 
简介：没有fd个数限制，用户态拷贝到内核态只需要一次，使用事件通知机制来触发。通过epoll_ctl注册fd，一旦fd就绪就会通过callback回调机制来激活对应fd，进行相关的I/O操作。 
缺点： 
 
 跨平台，Linux 支持最好。 
 底层实现复杂。 
 同步。 
 
 ```java 
   public static void main(String[] args) throws Exception {
        final AsynchronousServerSocketChannel serverChannel = AsynchronousServerSocketChannel.open()
                .bind(new InetSocketAddress(Constant.HOST, Constant.PORT));
        serverChannel.accept(null, new CompletionHandler<AsynchronousSocketChannel, Object>() {
            @Override
            public void completed(final AsynchronousSocketChannel client, Object attachment) {
                serverChannel.accept(null, this);
                ByteBuffer buffer = ByteBuffer.allocate(1024);
                client.read(buffer, buffer, new CompletionHandler<Integer, ByteBuffer>() {
                    @Override
                    public void completed(Integer result, ByteBuffer attachment) {
                        attachment.flip();
                        client.write(ByteBuffer.wrap("HelloClient".getBytes()));//业务逻辑
                    }
                    @Override
                    public void failed(Throwable exc, ByteBuffer attachment) {
                        System.out.println(exc.getMessage());//失败处理
                    }
                });
            }

            @Override
            public void failed(Throwable exc, Object attachment) {
                exc.printStackTrace();//失败处理
            }
        });
        while (true) {
            //不while true main方法一瞬间结束
        }
    }

  ```  
当然上面的缺点相比较它优点都可以忽略。JDK提供��异步方式实现，但在实际的Linux环境中底层还是epoll，只不过多了一层循环，不算真正的异步非阻塞。而且就像上图中代码调用，处理网络连接的代码和业务代码解耦得不够好。Netty提供了简洁、解耦、结构清晰的API。 
 ```java 
   public static void main(String[] args) {
        new NettyServer().serverStart();
        System.out.println("Netty server started !");
    }

    public void serverStart() {
        EventLoopGroup bossGroup = new NioEventLoopGroup();
        EventLoopGroup workerGroup = new NioEventLoopGroup();
        ServerBootstrap b = new ServerBootstrap();
        b.group(bossGroup, workerGroup)
                .channel(NioServerSocketChannel.class)
                .childHandler(new ChannelInitializer<SocketChannel>() {
                    @Override
                    protected void initChannel(SocketChannel ch) throws Exception {
                        ch.pipeline().addLast(new Handler());
                    }
                });
        try {
            ChannelFuture f = b.localAddress(Constant.HOST, Constant.PORT).bind().sync();
            f.channel().closeFuture().sync();
        } catch (InterruptedException e) {
            e.printStackTrace();
        } finally {
            workerGroup.shutdownGracefully();
            bossGroup.shutdownGracefully();
        }
    }
}

class Handler extends ChannelInboundHandlerAdapter {
    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
        ByteBuf buf = (ByteBuf) msg;
        ctx.writeAndFlush(msg);
        ctx.close();
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
        cause.printStackTrace();
        ctx.close();
    }
}

  ```  
bossGroup 处理网络请求的大管家（们），网络连接就绪时，交给workGroup干活的工人（们）。 
#### 三、总结 
##### 回顾 
 
 同步/异步，连接建立后，用户程序读写时，如果最终还是需要用户程序来调用系统read()来读数据，那就是同步的，反之是异步。Windows实现了真正的异步，内核代码甚为复杂，但对用户程序来说是透明的。 
 阻塞/非阻塞，连接建立后，用户程序在等待可读可写时，是不是可以干别的事儿。如果可以就是非阻塞，反之阻塞。大多数操作系统都支持的。 
 
##### Redis,Nginx,Netty,Node.js 为什么这么香？ 
这些技术都是伴随Linux内核迭代中提供了高效处理网络请求的系统调用而出现的。了解计算机底层的知识才能更深刻地理解I/O，知其然，更要知其所以然。与君共勉！ 

                                        