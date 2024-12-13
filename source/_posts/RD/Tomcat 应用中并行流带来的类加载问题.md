---
title: 推荐系列-Tomcat 应用中并行流带来的类加载问题
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 738
cover_picture: 'https://static.oschina.net/uploads/img/201910/31105041_yR4Z.jpg'
abbrlink: 66cbd16
date: 2021-04-14 07:56:10
---

&emsp;&emsp;本文首发于 vivo互联网技术 微信公众号 链接：https://mp.weixin.qq.com/s/f-X3n9cvDyU5f5NYH6mhxQ 作者：肖铭轩、王道环 随着 Java8 的不断流行，越来越多的开发人员使用并行流（parallel）...
<!-- more -->

                                                                                                                                                                                         
随着 Java8 的不断流行，越来越多的开发人员使用并行流（parallel）这一特性提升代码执行效率。但是，作者发现在 Tomcat 容器中使用并行流会出现动态加载类失败的情况，通过对比 Tomcat 多个版本的源码，结合并行流和 JVM 类加载机制的原理，成功定位到问题来源。本文对这个问题展开分析，并给出解决方案。 
 
#### 一、问题场景 
在某应用中，服务启动时会通过并行流调用 Dubbo，调用代码如下： 
 ```java 
  Lists.partition(ids, BATCH_QUERY_LIMIT).stream()
     .parallel()
     .map(Req::new)
     .map(client::batchQuery)
     .collect(Collectors.toList());

  ```  
调用日志中发现大量的 WARN 日志com.alibaba.com.caucho.hessian.io.SerializerFactory.getDeserializer Hessian/Burlap:‘XXXXXXX’ is an unknown class in null:java.lang.ClassNotFoundException: XXXXXXX，在使用接口返回结果的时候抛出错误 java.lang.ClassCastException: java.util.HashMap cannot be cast to XXXXXXX。 
 
#### 二、原因分析 
 
##### 1、初步定位 
首先根据错误日志可以看到，由于依赖的 Dubbo 服务返回参数的实体类没有找到，导致 Dubbo 返回的数据报文在反序列化时无法转换成对应的实体，类型强制转化中报了java.lang.ClassCastException。通过对线程堆栈和WARN日志定位到出现问题的类为com.alibaba.com.caucho.hessian.io.SerializerFactory，由于 _loader 为 null 所以无法对类进行加载，相关代码如下： 
 ```java 
  try {
       Class cl = Class.forName(type, false, _loader);
       deserializer = getDeserializer(cl);
   } catch (Exception e) {
       log.warning("Hessian/Burlap: '" + type + "' is an unknown class in " + _loader + ":\n" + e);
    log.log(Level.FINER, e.toString(), e);
   }

  ```  
接下来继续向上定位为什么** _loader** 会为 null，SerializerFactory 构造方法中对 _loader 进行了初始化，初始化代码如下，可以看出 _loader 使用的是当前线程的 contextClassLoader。 
 ```java 
  public SerializerFactory() {
    this(Thread.currentThread().getContextClassLoader());
}
 
public SerializerFactory(ClassLoader loader) {
    _loader = loader;
}

  ```  
根据堆栈看到当前线程为ForkJoinWorkerThread，ForkJoinWorkerThread是Fork/Join框架内的工作线程（Java8 并行流使用的就是Fork/Join）。JDK文档指出： 
 
因此当前的线程contextClassLoader应该和创建此线程的父线程保持一致才对，不应该是null啊？ 
继续看ForkJoinWorkerThread创建的源码，首先使用ForkJoinWorkerThreadFactory创建一个线程，然后将创建的线程注册到ForkJoinPool中，线程初始化的逻辑和普通线程并无差别，发现单独从JDK自身难以发现问题，因此将分析转移到Tomcat中。 
 
##### 2、Tomcat升级带来的问题 
取 Tomcat7.0.x 的一些版本做了实验和对比，发现7.0.74之前的版本无此问题，但7.0.74之后的版本出现了类似问题，实验结果如下表。 
 
至此已经将问题定位到了是Tomcat的版本所致��通过源代码比对，发现7.0.74版本之后的Tomcat中多了这样的代码： 
 ```java 
  if (forkJoinCommonPoolProtection && IS_JAVA_8_OR_LATER) {
    // Don't override any explicitly set property
    if (System.getProperty(FORK_JOIN_POOL_THREAD_FACTORY_PROPERTY) == null) {
        System.setProperty(FORK_JOIN_POOL_THREAD_FACTORY_PROPERTY,
                "org.apache.catalina.startup.SafeForkJoinWorkerThreadFactory");
    }
}

  ```  
 ```java 
  private static class SafeForkJoinWorkerThread extends ForkJoinWorkerThread {
 
   protected SafeForkJoinWorkerThread(ForkJoinPool pool) {
       super(pool);
       setContextClassLoader(ForkJoinPool.class.getClassLoader());
   }
}

  ```  
在 Java8 环境下，7.0.74 版本之后的 Tomcat 会默认将 SafeForkJoinWorkerThreadFactory 作为 ForkJoinWorkerThread 的创建工厂，同时将该线程的 contextClassLoader 设置为ForkJoinPool.class.getClassLoader()，ForkJoinPool 是属于rt.jar包的类，由BootStrap ClassLoader加载，所以对应的类加载器为null。至此，_loader为空的问题已经清楚，但是Tomcat为什么要多此一举，将null作为这个 ForkJoinWorkerThread的contextClassLoader呢？ 
继续对比Tomcat的changeLog http://tomcat.apache.org/tomcat-7.0-doc/changelog.html 发现Tomcat在此版本修复了由ForkJoinPool引发的内存泄露问题 Bug 60620 - [JRE] Memory leak found in java.util.concurrent.ForkJoinPool，为什么线程的contextClassLoader会引起内存泄露呢？ 
 
##### 3、contextClassLoader内存泄露之谜 
在JDK1.2以后，类加载器的双亲委派模型被广泛引入。它的工作过程是：如果一个类加载���收到了类加载的请求，它首先不会自己去尝试加载这个类，而是把整个请求委派给父类加载器去完成，每一个层次的类加载器都是如此，因此所有的加载请求最终都应该传送到顶层的启动类加载器中，只有当父加载器反馈自己无法完成这个加载请求时，子加载器才会尝试自己去加载，流程如下图。 
 
然而双亲委派的模型并不能保证应用程序加载类的过程，一个典型的例子就是JNDI服务，这些接口定义在rt.jar并由第三方提供实现，Bootstrap ClassLoader显然不认识这些代码。为了解决这个问题，JDK1.2同时引入了线程上下文类加载器（Thread Context ClassLoader）进行类加载，作为双亲委派模型的补充。 
回到内存泄漏的问题上，设想一个场景，如果某个线程持有了ClassLoaderA（由ClassLoaderA加载了若干类），当应用程序需要对ClassLoaderA以及由ClassLoaderA加载出来的类卸载完成后，线程A仍然持有了ClassLoaderA的引用，然而业务方以为这些类以及加载器已经卸载干净，由于类加载器和其加载出的类双向引用，这就造成了类加载器和其加载出来的类无法垃圾回收，造成内存泄露。在并行流中，ForkJoinPool和ForkJoinWorkerThreadFactory默认是静态且共享的（JDK官方推荐，创建线程本身是相对重的操作，尽量避免重复创建ForkJoinWorkerThread 造成资源浪费），下图描绘了发生内存泄露的场景： 
 
因此 Tomcat 默认使用SafeForkJoinWorkerThreadFactory作为ForkJoinWorkerThreadFactory，并将该工厂创建的ForkJoinWorkerThread的contextClassLoader都指定为ForkJoinPool.class.getClassLoader()，而不是JDK默认的继承父线程的contextClassLoader，进而避免了Tomcat应用中由并行流带来的类加载器内存泄露。 
 
#### 三、总结 
在开发过程中，如果在计算密集型任务中使用了并行流，请避免在子任务中动态加载类；其他业务场景请尽量使用线程池，而非并行流。总之，我们需要避免在Tomcat应用中通过并行流进行自定义类或者第三方类的动态加载。 
更多内容敬请关注 vivo 互联网技术 微信公众号 
 
注：转载文章请先与微信号：labs2020 联系
                                        