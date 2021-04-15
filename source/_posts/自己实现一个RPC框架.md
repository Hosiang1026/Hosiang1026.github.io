---
title: 推荐系列-自己实现一个RPC框架
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 1798
cover_picture: 'https://static.oschina.net/uploads/img/202006/22110244_UuUs.jpg'
abbrlink: bd9cbc0f
date: 2021-04-15 09:19:21
---

&emsp;&emsp;RPC框架称为远程调用框架，其实现的核心原理就是消费者端使用动态代理来代理一个接口的方法(基于JDK的动态代理，当然如果使用CGLib可以直接使用无接口类的方法)，通过加入网络传输编程，传输...
<!-- more -->

                                                                                                                                                                                        RPC框架称为远程调用框架，其实现的核心原理就是消费者端使用动态代理来代理一个接口的方法(基于JDK的动态代理，当然如果使用CGLib可以直接使用无接口类的方法)，通过加入网络传输编程，传输调用接口方法名称，方法参数来给提供者获取，再通过反射，来执行该接口的方法，再将反射执行的结果通过网络编程传回消费者端。 
现在我们来依次实现这些概念。这里我们做最简单的实现，网络编程使用的是BIO，大家可以使用Reactor模式的Netty来改写性能更好的方式。而网络传输中使用的序列化和反序列化也是Java自带的，当然这样的传输字节比较大，可以使用google的protoBuffer或者kryo来处理。这里只为了方便说明原理。 
pom 
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.guanjian</groupId>
    <artifactId>rpc-framework</artifactId>
    <version>1.0-SNAPSHOT</version>
    
    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.7.0</version>
                <configuration>
                    <source>1.8</source>
                    <target>1.8</target>
                    <encoding>UTF-8</encoding>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project> 
首先当然是我们要进行远程调用的接口以及接口的方法。 
public interface HelloService {
    String sayHello(String content);
} 
接口实现类 
public class HelloServiceImpl implements HelloService {
    public String sayHello(String content) {
        return "hello," + content;
    }
} 
消费者端的动态代理，如果你是把提供者和消费者写在两个工程中，则提供者端需要上面的接口和实现类，而消费者端只需要上面的接口。 
public class ConsumerProxy {
    /**
     * 消费者端的动态代理
     * @param interfaceClass 代理的接口类
     * @param host 远程主机IP
     * @param port 远程主机端口
     * @param <T>
     * @return
     */
    @SuppressWarnings("unchecked")
    public static <T> T consume(final Class<T> interfaceClass,final String host,final int port) {
        return (T) Proxy.newProxyInstance(interfaceClass.getClassLoader(),
                new Class[]{interfaceClass}, (proxy,method,args) -> {
                    //创建一个客户端套接字
                    Socket socket = new Socket(host, port);
                    try {
                        //创建一个对外传输的对象流，绑定套接字
                        ObjectOutputStream output = new ObjectOutputStream(socket.getOutputStream());
                        try {
                            //将动态代理的方法名写入对外传输的对象流中
                            output.writeUTF(method.getName());
                            //将动态代理的方法的参数写入对外传输的对象流中
                            output.writeObject(args);
                            //创建一个对内传输的对象流，绑定套接字
                            //这里是为了获取提供者端传回的结果
                            ObjectInputStream input = new ObjectInputStream(socket.getInputStream());
                            try {
                                //从对内传输的对象流中获取结果
                                Object result = input.readObject();
                                if (result instanceof Throwable) {
                                    throw (Throwable) result;
                                }
                                return result;
                            } finally {
                                input.close();
                            }
                        } finally {
                            output.close();
                        }
                    } finally {
                        socket.close();
                    }
                }
        );
    }
} 
有关JDK动态代理的内容可以参考AOP原理与自实现 ，BIO的部分可以参考传统IO与NIO比较  
提供者端的网络传输和远程方式调用服务 
public class ProviderReflect {
    private static final ExecutorService executorService = Executors.newCachedThreadPool();

    /**
     * RPC监听和远程方法调用
     * @param service RPC远程方法调用的接口实例
     * @param port 监听的端口
     * @throws Exception
     */
    public static void provider(final Object service,int port) throws Exception {
        //创建服务端的套接字，绑定端口port
        ServerSocket serverSocket = new ServerSocket(port);
        while (true) {
            //开始接收客户端的消息，并以此创建套接字
            final Socket socket = serverSocket.accept();
            //多线程执行，这里的问题是连接数过大，线程池的线程数会耗尽
            executorService.execute(() -> {
                try {
                    //创建呢一个对内传输的对象流，并绑定套接字
                    ObjectInputStream input = new ObjectInputStream(socket.getInputStream());
                    try {
                        try {
                            //从对象流中读取接口方法的方法名
                            String methodName = input.readUTF();
                            //从对象流中读取接口方法的所有参数
                            Object[] args = (Object[]) input.readObject();
                            Class[] argsTypes = new Class[args.length];
                            for (int i = 0;i < args.length;i++) {
                                argsTypes[i] = args[i].getClass();

                            }
                            //创建一个对外传输的对象流，并绑定套接字
                            //这里是为了将反射执行结果传递回消费者端
                            ObjectOutputStream output = new ObjectOutputStream(socket.getOutputStream());
                            try {
                                Class<?>[] interfaces = service.getClass().getInterfaces();
                                Method method = null;
                                for (int i = 0;i < interfaces.length;i++) {
                                    method = interfaces[i].getDeclaredMethod(methodName,argsTypes);
                                    if (method != null) {
                                        break;
                                    }
                                }
                                Object result = method.invoke(service, args);
                                //将反射执行结果写入对外传输的对象流中
                                output.writeObject(result);
                            } catch (Throwable t) {
                                output.writeObject(t);
                            } finally {
                                output.close();
                            }
                        } catch (Exception e) {
                            e.printStackTrace();
                        } finally {
                            input.close();
                        }
                    } finally {
                        socket.close();
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }
            });
        }
    }
} 
启动提供者端的网络侦听和远程调用 
public class RPCProviderMain {
    public static void main(String[] args) throws Exception {
        HelloService service = new HelloServiceImpl();
        ProviderReflect.provider(service,8083);
    }
} 
启动消费者的动态代理调用 
public class RPCConsumerMain {
    public static void main(String[] args) throws InterruptedException {
        HelloService service = ConsumerProxy.consume(HelloService.class,"127.0.0.1",8083);
        for (int i = 0;i < 1000;i++) {
            String hello = service.sayHello("你好_" + i);
            System.out.println(hello);
            Thread.sleep(1000);
        }
    }
} 
运行结果 
hello,你好_0 hello,你好_1 hello,你好_2 hello,你好_3 hello,你好_4 hello,你好_5 
..... 
如果你要扩展成一个Netty+ProtoBuffer的高性能RPC框架可以参考Netty整合Protobuffer 的相关写法。有关Netty的相关内容可以参考Netty整理 、Netty整理（二） 、Netty整理（三）。
                                        