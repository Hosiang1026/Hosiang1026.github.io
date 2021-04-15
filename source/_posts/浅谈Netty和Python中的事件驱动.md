---
title: 推荐系列-浅谈Netty和Python中的事件驱动
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 814
cover_picture: 'https://oscimg.oschina.net/oscnet/up-af301d474b7019902142d5ee5a367326dd9.png'
abbrlink: 3ad6854d
date: 2021-04-15 09:08:53
---

&emsp;&emsp;如果把Netty比作一台工厂车间, 那么IO线程就是车间里面的运作机器, IO线程一直在无限循环地做着三件事 1.轮询IO事件 2.处理IO事件 3.执行task任务 无限循环源码位置: io.netty.channel.nio....
<!-- more -->

                                                                                                                                                                                        如果把Netty比作一台工厂车间, 那么IO线程就是车间里面的运作机器, IO线程一直在无限循环地做着三件事 1.轮询IO事件 2.处理IO事件 3.执行task任务 
 ```java 
  无限循环源码位置: io.netty.channel.nio.NioEventLoop#run
select()方法源码位置: io.netty.channel.nio.NioEventLoop#select

  ```  
在Netty中轮询IO事件是通过调用select()方法, 至于底层基于select,poll,epoll哪一种, 这个和平台有关.总之, 通过select()方法, 监听着ACCEPT,CONNECT,READ,WRITE等事件.一旦有相应的事件发生, Netty就会根据不同的事件调用不同的方法. 
 ```java 
  处理不同事件的源码位置: io.netty.channel.nio.NioEventLoop#processSelectedKey(java.nio.channels.SelectionKey, io.netty.channel.nio.AbstractNioChannel)

  ```  
![Test](https://oscimg.oschina.net/oscnet/up-af301d474b7019902142d5ee5a367326dd9.png 浅谈Netty和Python中的事件驱动) 
CONNECT事件. 在前面的文章谈及过, Netty客户端在向服务端发起连接的时候, 并不��阻塞, 而是直接返回, 然后会注册一个CONNECT事件. 当三次握手完成之后, Netty客户端监听到CONNECT事件, 于是调用到上面的方法地方, 最终会注册一个READ事件,这才表示客户端可以接收数据了. 
WRITE事件. 这个事件一般情况是不会出现, 只有当Netty向网络中写数据的时候, 由于TCP写缓冲区满了, 至于为什么满, 可能是对端处理数据比较慢, 也可能是网络拥塞等原因. 最终导致无法向TCP写缓冲区写数据了, 这个时候Netty就会注册一个写事件, 当TCP写缓冲区有空余空间的时候, 就会触发这个WRITE事件, Netty就会将之前没有写完的数据, 继续向TCP写缓冲区写入. 
READ事件. 当网卡接收到数据之后, 经过内核协议栈之后, 最终到达TCP读缓冲区. Netty监测到READ事件之后,就会读取数据, 经过解码等操作, 将数据交给业务逻辑处理. 
ACCEPT事件. 当服务端绑定完端口之后, 就会注册一个ACCEPT事件, 表示此时可以接收客户端的连接了. 当一个客户端发起连接的时候, Netty监测到ACCEPT事件, 最终会调用accept()方法, 接收连接, 以及后面的一系列操作. 
总结: 在Netty中, 通过一个无限循环(即for( ;; ){...} ), 调用select()方法, 监听着感兴趣的事件. 不同的事件由不同的方法处理. 
select + 事件驱动 + 处理逻辑 
在Python中, 也是有IO多路复用的实现. 
 ```java 
  #! /usr/bin/env python

import socket
from selectors import DefaultSelector, EVENT_READ, EVENT_WRITE

# 解码器. 在Netty中也有解码器,它们的作用都是一样的,将接收到的数据流,解码成有意义的数据
class DecoderHandler(object):

    def __init__(self):
        self.data = b''

    def decode(self, data):
        self.data = self.data + data
        if len(self.data) &gt; 4:
            data = self.data[0:5].decode()
            print('接收数据:{}'.format(data))
            self.data = self.data[5:]


class Server(object):

    def __init__(self):
        self.address = ('127.0.0.1', 8080)
        self.selector = DefaultSelector()
        self.decoder = DecoderHandler()
        self.server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

    def start(self):
        self.server.bind(self.address)
        self.server.listen(50)
        self.server.setblocking(False)
        # 注册ACCEPT事件
        self.selector.register(self.server.fileno(), EVENT_READ, (self.connected, self.server))
        self.loop()

    # 处理ACCEPT事件
    def connected(self, key, mask):
        client, addr = key.data[1].accept()  # client, addr = self.server.accept()
        print('接收客户端{}连接...'.format(addr))
        client.setblocking(False)
        # 注册读事件
        self.selector.register(client.fileno(), EVENT_READ,  (self.read_write, client))

    def read_write(self, key, mask):
        if mask &amp; EVENT_READ:  # 读事件
            self.recv(key)
        if mask &amp; EVENT_WRITE:  # 写事件
            self.send(key, '\r\nHello, Python\r\n')

    def recv(self, key):
        client = key.data[1]
        data = client.recv(1024)
        self.decoder.decode(data)

        self.send(key, '\r\nHello, World\r\n')

    def send(self, key, msg):
        client = key.data[1]
        # print('发送数据...')
        d = client.send(str(msg).encode())
        print(d)

    def loop(self):
        # 一个无限循环, 和Netty中的run()方法功能一样,通过调用select()方法,一直轮询着事件
        while True:
            data = self.selector.select()
            for key, mask in data:
                callback = key.data[0]
                callback(key, mask)


if __name__ == '__main__':

    server = Server()
    server.start()


  ```  
 ```java 
  代码位置: 
https://github.com/infuq/infuq-others/blob/master/Python/my_server_select.py

  ```  
以上代码, 是自己实现的一个IO多路复用的例子. 它的核心和上面说的Netty一样, 也需要调用select()方法, 轮询着事件, 也有一个无限循环, 当监听到对应的事件之后, 也有对应的方法处理. 
其实, 不管是Netty还是Python中的IO多路复用, 它们的思想都是一样的, 处理过程也是一样的,只是实现的语言不同, 写法不同而已. 
其中一点要注意的是, 在上面Python代码中, 它只有两个事件, 一个是读事件EVENT_READ, 一个是写事件EVENT_WRITE. 没有接收事件ACCEPT. 如果仔细观察上面Netty处理事件的代码,会发现 READ和ACCEPT是在一起的, 都是调用了read方法. 其实ACCEPT事件和READ事件一样, 都是需要进行读取操作的.
                                        