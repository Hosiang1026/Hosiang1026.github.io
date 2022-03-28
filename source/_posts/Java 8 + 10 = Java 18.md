---
title: 推荐系列-Java 8 + 10 = Java 18
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 310
cover_picture: 'https://api.ixiaowai.cn/gqapi/gqapi.php'
abbrlink: 5cfb0ec6
date: 2021-05-27 11:56:26
---

&emsp;&emsp;Java 18将正式发布， 虽然它不是长期支持 (LTS) 版本，但它却实现了九个 JEP（在Java 18列出）。有哪些特性值得关注呢？今天胖哥为你提前解读。再看、点赞、转发、关注来一波吧。 JEP 40...
<!-- more -->

                                                                                                                     
明天Java 18将正式发布， 虽然它不是长期支持 (LTS) 版本，但它却实现了九个 JEP（在Java 18列出）。有哪些特性值得关注呢？今天胖哥为你提前解读。再看、点赞、转发、关注来一波吧。 
##### JEP 400 
将 UTF-8 指定为标准 Java API 的默认字符集。通过此更改，依赖于默认字符集的 API 将在所有实现、操作系统、语言环境和配置中保持一致。 
##### JEP 408 
Java内部终于有原生的Web服务器了。但是请注意它没有可用的 CGI 或类似 Servlet 的功能。该工具可用于原型设计、临时编码和测试目的，尤其是在教育环境中。 
它并不是Jetty、Apache Tomcat等产品的竞品，也无法而且不推荐在生产环境中使用。仅仅是提供一个命令行工具来辅助帮助开发人员设计、测试、教学。 
##### JEP 413 
支持在Java API文档中使用代码片段。以前在Java代码的注释中如果要写一些样例非常麻烦，甚至还要进行字符转义。现在Java注释引入了一个新的标记  
 ```java 
  @snippet
  ``` 
  来解决注释中包含代码片段样例的问题。 
它可以内联使用： 
 
 ```java 
  /**
 * The following code shows how to use {@code Optional.isPresent}:
 * {@snippet :
 * if (v.isPresent()) {
 *     System.out.println("v: " + v.get());
 * }
 * }
 */


  ``` 
  
也可以引用外部片段： 
 
 ```java 
  /**
 * The following code shows how to use {@code Optional.isPresent}:
 * {@snippet file="ShowOptional.java" region="example"}
 */

  ``` 
  
 
 ```java 
  ShowOptional.java
  ``` 
 就是它引用的源代码： 
 
 ```java 
  public class ShowOptional {
    void show(Optional<String> v) {
        // @start region="example"
        if (v.isPresent()) {
            System.out.println("v: " + v.get());
        }
        // @end
    }
}

  ``` 
  
##### JEP 417 
引入一个 API 来表达向量计算，该计算可以在运行时可靠地编译为支持的 CPU 架构上的最佳向量指令，从而实现优于等效标量计算的性能。 目前是第三次孵化。 
##### JEP 418 
为主机名和地址解析定义服务提供者接口 (SPI)，以便 
 ```java 
  java.net.InetAddress
  ``` 
 可以使用平台内置解析器以外的解析器。 这个对于互联网一些协议的接入提供了入口，同时你也可以对现有方案进行一些改进和定制。 
##### JEP 419 
Foreign Function & Memory API ( JEP 419 ) 是此版本中实现的更重要的 JEP 之一，因为它是Project Panama中包含的孵化组件之一。 Panama 正在简化将 Java 程序连接到非 Java 组件的过程。这一特殊功能在其第二次孵化迭代中引入了一个 API，Java 程序通过该 API 调用Native类库并处理Native数据。目的是取代设计的非常不理想的Java Native Interface (JNI)。 
大家都知道其它语言有非常棒的一些类库，但是Java想调用其它语言的类库目前需要使用JNI。但是JNI被设计得太复杂��，让很多Java开发者难以上手。如果这一状况得到改变，那么利用Java去调用一些C或者C++音视频处理库和Python的机器学习库将是非常容易的事情。 
##### JEP 420 
实现的唯一真正影响 Java 语言的 JEP 是Pattern Matching for switch ( JEP 420 )，它在 Java 17 中首次预览（这是第二次预览）。其目的是“通过对switch 表达式和语句的模式匹配以及对模式语言的扩展来增强 Java 编程语言 。在 Java 16 中，JEP 394扩展了 
 ```java 
  instanceof
  ``` 
 运算符以采用类型模式并执行模式匹配： 
 
 ```java 
  // Old code
if (o instanceof String) {
    String s = (String)o;
    ... use s ...
}

// New code
if (o instanceof String s) {
    ... use s ...
}

  ``` 
  
我们使用 
 ```java 
  instanceof
  ``` 
 后无需再对对象进行类型转换就可以使用其真实的类型。 
Java 14又引入了 
 ```java 
  switch
  ``` 
 表达式： 
 
 ```java 
  int numLetters = switch (day) {
    case MONDAY, FRIDAY, SUNDAY -> 6;
    case TUESDAY                -> 7;
    case THURSDAY, SATURDAY     -> 8;
    case WEDNESDAY              -> 9;
    default                     -> 11;    
};

  ``` 
  
如果这两个能结合起来， 
 ```java 
  switch
  ``` 
 能进行模式匹配的话，下面的句子将大大简化： 
 
 ```java 
  static String formatter(Object o) {
    String formatted = "unknown";
    if (o instanceof Integer i) {
        formatted = String.format("int %d", i);
    } else if (o instanceof Long l) {
        formatted = String.format("long %d", l);
    } else if (o instanceof Double d) {
        formatted = String.format("double %f", d);
    } else if (o instanceof String s) {
        formatted = String.format("String %s", s);
    }
    return formatted;
}

  ``` 
  
JEP 420的预览特性，将会把上面冗长的代码简化为： 
 
 ```java 
  static String formatterPatternSwitch(Object o) {
    return switch (o) {
        case Integer i -> String.format("int %d", i);
        case Long l    -> String.format("long %d", l);
        case Double d  -> String.format("double %f", d);
        case String s  -> String.format("String %s", s);
        default        -> o.toString();
    };
}

  ``` 
  
是不是更加清晰了呢？ 
##### JEP 421 
 
 ```java 
  Object
  ``` 
 对象有一个 
 ```java 
  finalize
  ``` 
 方法，该方法用于实例被垃圾回收器回收的时触发的操作。当 GC (垃圾回收器) 确定不存在对该对象的有更多引用时，对象的垃圾回收器就会调用这个方法。当时它的设计用来避免内存泄露，现在已经有了更好的替代方案 
 ```java 
  try-with-resources
  ``` 
 和Java 9引入的  
 ```java 
  java.lang.ref.Cleaner
  ``` 
  。 
因此，所有该方法会被标记为过时，未来将被移除。 
#### 总结 
很少有人在生产中使用 JDK 18，因为它不是 LTS 版本。去年九月发布JDK 17 LTS 版本更为重要，很多类库，特别是Spring framework 6.0和Spring Boot 3.0 都将基于JDK17，你还要在Java 8坚持多久呢？已经相差了10个版本了。下一个是LTS是 2023 年 9 月的 Java 21。 
 
 ```java 
  关注公众号：Felordcn获取更多资讯
  ``` 
  
个人博客：https://felord.cn
                                        