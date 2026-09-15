---
title: 自己实现一个RPC框
categories:
  - 开发
  - 前端
tags:
  - Java
abbrlink: 2a99d64a
date: 2021-01-11 00:00:00
top: 96
---

/** * RPC监听和远程方法调用 * @param service RPC远程方法调用的接口实例 * @param port 监听的端口 * @throws Exception

<!-- more -->

        ServerSocket serverSocket = new ServerSocket(port);
        while (true) {
            //开始接收客户端的消息，并以此创建套接字
            final Socket socket = serverSocket.accept();
            //多线程执行，这里的问题是连接数过大，线程池的线程数会耗尽
            executorService.execute(() -> {
                try {
                    //创建呢一个对内传输的对象流，并绑定套接字
                    try {
                            //从对象流中读取接口方法的方法名
                            String methodName = input.readUTF();
                            //从对象流中读取接口方法的所有参数
                            Object[] args = (Object[]) input.readObject();
                            Class[] argsTypes = new Class[args.length];
                            for (int i = 0;i < args.length;i++) {
                                argsTypes[i] = args[i].getClass();
```

                            }
```
                            //创建一个对外传输的对象流，并绑定套接字
                            //这里是为了将反射执行结果传递回消费者端
                            try {
                                Class<?>[] interfaces = service.getClass().getInterfaces();
                                Method method = null;
                                for (int i = 0;i < interfaces.length;i++) {
                                    method = interfaces[i].getDeclaredMethod(methodName,argsTypes);
                                    if (method != null) {
                                        break;
```
                                    }
```
                                Object result = method.invoke(service, args);
                                //将反射执行结果写入对外传输的对象流中
                                output.writeObject(result);
                            } catch (Throwable t) {
                                output.writeObject(t);
```
                            }
```
                        } catch (Exception e) {
                            e.printStackTrace();
```
                        }
                    }
                }
```
            });
```
启动提供者端的网络侦听和远程调用
```
public class RPCProviderMain {
    public static void main(String[] args) throws Exception {
        HelloService service = new HelloServiceImpl();
        ProviderReflect.provider(service,8083);
```
    }
启动消费者的动态代理调用
```
public class RPCConsumerMain {
    public static void main(String[] args) throws InterruptedException {
        HelloService service = ConsumerProxy.consume(HelloService.class,"127.0.0.1",8083);
        for (int i = 0;i < 1000;i++) {
            String hello = service.sayHello("你好_" + i);
            System.out.println(hello);
            Thread.sleep(1000);
```
        }
运行结果
hello，你好_0 hello，你好_1 hello，你好_2 hello，你好_3 hello，你好_4 hello，你好_5
.....
```
