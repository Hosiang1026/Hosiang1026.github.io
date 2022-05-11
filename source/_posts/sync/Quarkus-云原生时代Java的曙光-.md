---
title: 推荐系列-Quarkus-云原生时代Java的曙光-
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 296
date: 2022-05-11 05:14:30
cover_picture: 'https://oscimg.oschina.net/oscnet/682af219-f173-4cd8-bd88-22e9027e5399.png'
---

&emsp;&emsp; 引言 至今已满27岁的Java语言已经长期占据服务端编程语言开发榜的榜首，无论是从生产环境的部署规模，还是从在开发者群体中的受欢迎程度来看，Java都拥有绝对的“统治”地位。庞大的开发者...
<!-- more -->

                                                                                                                                                                                         
  
   
   00 引言 
   至今已满27岁的Java语言已经长期占据服务端编程语言开发榜的榜首，无论是从生产环境的部署规模，还是从在开发者群体中的受欢迎程度来看，Java都拥有绝对的“统治”地位。庞大的开发者基础、丰富完善的类库和生态、以及大规模的线上服务和应用都使得Java拥有其他编程语言难以超越的优势，也奠定了Java如今的地位。但居安思危，Java能否一直保持这种领先优势以及如何保持这种优势地位是包括Oracle官方在内的所有开发者应该思考的问题，也值得每位使用Java作为生产力工具的开发者关注。 
   01 云原生时代下Java的挑战 
   （1）Compile Once，Run AnyWhere 
   Java诞生之初，得益于虚拟机的优势，使得“一次编译，到处运行”成为其最响亮的Slogan，在一定程度上加速了Java的火热，然而这种根植在Java基因中的优势在“容器时代”正在逐渐被淡化，至少不像之前那样重要。在以前，如果需要一套代码同时运行在Linux、Solaris、Windows等系统之上，那开发人员不得不考虑不同平台甚至不同指令集之间的差异性，而Java虚拟机恰好将开发/运维人员从这种“苦海”中解脱了出来。但随着容器等云原生技术的普及，能够包含底层操作系统和程序代码的镜像成为了一种更加标准化和通用的交付产品，并且开发人员只需要修改几行Dockerfile就能修改程序的运行时环境。在云原生时代，通过镜像屏蔽底层系统的差异，以极低的成本更新程序的运行环境等，这些都削弱了Java的传统优势特性。 
   （2）启动耗时&内存占用 
   无论是从JVM垃圾回收器的演进方向还是从JIT优化的角度来看，这都表明Java更适用于大规模、长时间运行的应用，对于运行时间很短或者需要频繁更新的应用来说，Java难免会表现出一些不适应。但随着Kubernetes等技术的飞速发展，应用的实时更新、蓝绿发布、动态扩缩容相比以前更加容易实现，而这些功能都需要应用频繁启停，不可能像之前一样长时间运行。从启动过程来看，Java程序在启动时需要执行虚拟机初始化、字节码文件加载解析、JIT预热等功能，这些都使得启动时间过长，难以在毫秒级时间内完成。从系统资源占用的角度来看，Java程序必须运行在虚拟机之上，虚拟机运行所必需的资源即是应用程序运行时占用资源的下限，一个简单的Spring Web应用即使在没有流量的情况下也会达到百兆级别的内存占用。 
   
   
    
     
    
   
   
   Java程序启动耗时，图片来源：周志明-云原生时代的Java 
   从上图可以看出：应用程序在启动过程中，类加载和JIT编译消耗了比较多的时间，并且在容器环境中，每个Java应用程序启动时都需要先启动Docker容器，然后在Docker内启动JVM，最后JVM再加载应用，整个过程的耗时将进一步增加。 
   在当前炙手可热的Serverless领���，Java应用的一些特性似乎都跟Serverless的设计理念背道而驰，比如：Java本身适合大规模长时间运行的应用，而Serverless要求应用程序尽量快速的运行完，AWS的Lambda的最长运行时间仅为15min；Java在启动时执行的一系列操作导致启动耗时较长，而Serverless按需极速扩容的特点却要求应用必须在尽量短的时间内启动。在Servlerless领域，“冷启动”一直是个“火热”的话题，如何保证函数的第一个请求能在尽量短的时间内完成计算并返回结果一直是大家反复探讨的话题，这个过程中涉及到准备Pod和镜像、打通网络、启动容器及应用，运行函数等多个步骤，如果应用本身的启动时间过长，那么无疑会增加“冷启动”耗时，甚至会成为“冷启动”优化的瓶颈。 
   02 Quarkus入局 
   面对危机和挑战，Oracle官方提出了很多“面向未来的变革”项目以保持Java未来的活力与竞争力，包括：Leyden、Valhalla、Loom、Portola等，此处只介绍相关名词，感兴趣的读者可以自行查阅相关资料。除此之外，社区和开发者也都在它们在各自的领域给出了一些优秀的解决方案，比如Quarkus—云原生时代的Java框架。 
   （1）Quarkus简介 
   Quarkus是由Red Hat于2018年开始研发的一款面向云原生的开源Java框架，旨在使 Java 成为 Kubernetes 和无服务环境中的领先平台，目前Star数已接近1W，累计发布了168个版本，有超过620位开发者贡献了代码，最新版本为V2.8.1。主要特点是： 
   1）云原生：支持通过GraalVM native-image将Java应用打包成可执行的本地二进制镜像，减少内存使用、缩短应用启动时间 
   2）低使用成本：遵循已有的标准，兼容常用的框架，如：Spring、Hibernate、Netty、RestEasy等，无需学习新的标准和规范 
   3）高开发效率：支持代码热更新，无需重启即可查看代码改动后的运行结果（dev环境下） 
   4）同时支持命令式和响应式代码 
   5）支持同时运行在GraalVM和HotSpot两种虚拟机上 
   
   
    
     
    
   
   
   Quarkus运行时内存、启动时间对比，图片来源：Quarkus官网 
   （2）Quarkus基本原理 
   Quarkus是基于GraalVM进行设计和开发的，因此只要我们理解了GraalVM的基本原理，对Quarkus的工作原理的理解也就水到渠成了。 
   GraalVM是Oracle发布的通用型虚拟机，可以用来运行Java程序，被称为下一代Java虚拟机，于2016年6月发布第一个release版本。主要特点有： 
   1）高性能：GraalVM 的高性能AOT（Ahead Of Time，运行前编译）编译器支持在构建阶段生成可直接运行的本地代码，得益于一系列高级的编译器优化和积极的内联技术，使得生成的本地代码运行速度更快，产生的垃圾对象和占用的 CPU均更少，可极大降低云和基础设施的成本。同时，由于没有使用JIT运行时优化，程序在启动时即可达到峰值性能，不需要预热时间。 
   
   
    
     
    
   
   
   AOT编译过程 ，图片来源自网络 
   从上图可以看出，AOT编译主要分为静态分析和提前编译两个阶段。其中，静态分析阶段主要是利用代码的可达性分析将运行期间不会用到的类排除在打包之外，以此来减少打包后的代码体积；提前编译阶段主要是将程序代码和运行时所需的环境打包成本地二进制文件并执行初始化代码以及将结果保存为堆镜像，程序在真正运行时直接基于堆镜像启动，以减少程序启动耗时。 
   2）快速启动、减少内存使用：GraalVM 0.20版本开始出现的一个极小型（相比于HotSpot）的运行时环境Substrate VM，其具有如下特点：1. 完全脱离了HotSpot虚拟机，拥有独立的运行时，包含异常处理、同步、线程管理、内存管理（垃圾回收）和JNI等组件；2. 在AOT编译时保存初始化好的堆内存快照，并支持以此为入口直接开始运行，避免重复运行初始化代码，以缩短启动时间。 
   
   
    
     
    
   
   
   内存占用对比 图片源自GraalVM官网 
   从上图可知，在利用GraalVM将Java应用打包成Native Image之后，运行时占用的内存约为在传统HotSpot上的五分之一左右。 
   说明：图中的Helidon、Micronaut为不同组织基于GraalVM开发的云原生Java 框架，功能与Quarkus类似，本文不做额外介绍。 
   
   
    
     
    
   
   
   启动时间对比，图片源自GraalVM官网 
   在利用GraalVM将应用打包成Native Image之后，应用启动的时间约为在传统HotSpot模式下的五十分之一。 
   3）多语言：支持多种语言编写的程序运行在GraalVM上并且支持多种语言之间互相调用 
   
   
    
     
    
   
   
   GraalVM多语言架构，图片源自GraalVM官网 
   GraalVM底层是将其他语言也编译成class文件，然后通过执行引擎进行解释执行，以此来支持多种编程语言。 
   得益于GraalVM技术的发展，Helidon、Micronaut、Spring Native、Quarkus等云原生Java框架应运而生，而Quarkus是这些“新星”中最耀眼的一个。其在GraalVM能力的基础上提供了： 
   A.丰富的编程接口，以方便开发人员利用GraalVM提供的基础能力； 
   B.同时支持命令式和响应式的编程模型； 
   C.代码热更新的能力，支持实时更新代码，���需重启即可生效； 
   D.丰富的生态：提供多种常用开发框架的适配包，开箱即用，如：Netty、RestEasy、Vertx、Hibernate等并且支持开发者对自定义应用编写Quarkus扩展； 
   GraalVM和Quarkus等技术提供了一种全新的思路来解决Java在云原生领域遇到的困境和挑战，让广大Java开发者看到了Java在云原生领域的一丝曙光。 
   03 Restlight的实践之路 
   上篇我们主要介绍了Quarkus的主要功能及底层实现原理，相信大家对Quarkus已经有了初步的了解。下面我们将围绕OPPO开源Web框架Restlight的Quarkus实践过程，分析在此过程中我们遇到的困难及相应的解决方案、最终达成的结果等。 
   Restlight是OPPO开源的一款轻量级、高性能的Web框架，目前已经在公司内外大规模使用。在Restlight作为公司FaaS平台的Runtime实现之后，我们迫切地希望基于Restlight开发的FaaS函数服务能占用尽量小的内存和CPU资源以节省业务运行成本，此外，我们还希望函数能快速的启动，以减少“冷启动”时间。经过前期的调研和选型，最终我们决定基于Quarkus开发Restlight的扩展模块，并将业务开发的FaaS函数打包成Native Image运行。经过实践，基于Quarkus扩展的Restlight应用在启动时间上相比传统HotSpot模式缩短了30倍，低负载运行时的内存缩小了10倍。 
   （1）自定义Quarkus扩展 
   传统的Java程序运行时空间是开放的，即完全可以在运行时动态地加载配置、类等资源并进行初始化，但Quarkus进行Native Image打包时，需要在构建过程中将程序运行时用到的所有类、资源文件等初始化好并以堆内存快照的形式保存起来，即Native Image要求程序的运行空间必须是封闭的。这就导致动态加载其他类库、反射、动态代理和CGlib代理等功能无法正常使用，需要开发人员利用Quarkus提供的一些高级特性，通过配置或者编码的方式在静态分析阶段对这些类和文件资源进行特殊的处理。 
   （2）SPI加载 
   Java的SPI提供了一种灵活、可扩展的机制来加载外部实现类，底层是依赖反射来实现的。Restlight基于分层架构设计和可扩展性的考虑，在内部大量使用了自定义的SPI加载机制，用来加载业务自定义的Filter、ParamResolver、ParamResolverAdvice、Interceptor、HandlerAdvice、ResponseEntityResolver、ResponseEntityResolverAdvice等，可以认为SPI加载机制是融入Restlight基因中的设计之一。但这些接口的实现类都是写入配置文件中，在运行时动态加载的，Quarkus本身无法在构建阶段通过静态代码分析感知到，因此如何使得这些实现类被应用程序感知到就成了我们在编写Quarkus扩展中面临的第一个问题。在分析了Restlight自定义SPI文件的路径和命名规则之后，我们通过自定义文件扫描器的方式在构建阶段将所有符合���则��SPI文件内容解析出来并封装成Quarkus需要的ReflectiveClassBuildItem形式，而后Quarkus在静态分析阶段自动将上述封装的类添加到静态代码分析的结果中去，以保证程序在运行期间可以正常找到需要的Class文件。具体代码如下： 
   
   
    
 ```java 
  @BuildStep
  ``` 
  
 ```java 
  List<ReflectiveClassBuildItem> reflections() throws IOException, ClassNotFoundException {
  ``` 
  
 ```java 
      Set<String> classNameSet = new HashSet<>();
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
      // reflection-configs from restlight-core.
  ``` 
  
 ```java 
      for (ReflectedClassInfo classInfo : ReflectionInfoUtil.loadReflections("restlight-core",
  ``` 
  
 ```java 
              Restlight.class)) {
  ``` 
  
 ```java 
          classNameSet.add(classInfo.getName());
  ``` 
  
 ```java 
      }
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
      List<ReflectiveClassBuildItem> reflections = new LinkedList<>();
  ``` 
  
 ```java 
      for (String className : classNameSet) {
  ``` 
  
 ```java 
          LOGGER.info("Load refection(" + className + ") when build quarkus-restlight-core");
  ``` 
  
 ```java 
          reflections.add(new ReflectiveClassBuildItem(true, true, Class.forName(className)));
  ``` 
  
 ```java 
      }
  ``` 
  
 ```java 
      return reflections;
  ``` 
  
 ```java 
  }
  ``` 
  
   
   
   在ReflectionInfoUtil#loadReflections方法中，我们通过加载和解析META-INF下面的/esa和/esa/internal中以io.esastack.restlight.xxx开头的文件并将解析出的实现类封装ReflectiveClassBuildItem。在实际的代码实现中，我们除了加载Restlight本身自定义的SPI资源文件之外，同样需要考虑Restlight依赖的httpserver、commons-net等项目的SPI文件的加载。此外，为了支持在不使用Quarkus时，Restlight能基于原生的GraalVM将应用打包成Native Image的功能，我们在Restlight源代码的/META-INF/native-image目录下配置了GraalVM用于打包Native Image所需的资源文件，包括反射类的配置，因此实际代码中我们是加载和解析该部分配置文件的内容并将其封装成Quarkus所需的ReflectiveClassBuildItem，但这并不影响读者了解Restlight在Quarkus场景下处理反射调用的思路和方法。 
   需要说明地是，对于Restlight自身的反射调用，我们通过开发Quarkus扩展的形式已经做了处理，但是对于业务代码中使用到的反射，却无法在框架层面做统一的处理，这部分需要业务自行处理。原生的GraalVM要求将反射用到的资源配置在指定的资源文件中，而Quarkus则提供了更加方便的功能，比如通过RegisterForReflection注解声明指定的类需要加入静态分析扫描的结果集。从这里也可以看出，Quarkus提供了对开发者更加友好和灵活的方式以便于利用GraalVM的各种高级特性。对于难以识别的反射调用，GraalVM还提供了native-image-agent，只需要将原有应用以JVM的方式启动和运行，该agent即可自动收集运行期间所有用到的反射、动态代理、JNI、序列化等资源并打印到指定的文件。但需要注意地是，该方式仅能识别程序运行期间已经使用到的反射、动态代理等资源，而不是全部，因此对于复杂的Java应用需要谨慎评估将应用打包成Native Image之后的系统稳定性风险。RegisterForReflection使用示例： 
   
   
    
 ```java 
  @RequestMapping("/hello/springmvc")
  ``` 
  
 ```java 
  @RegisterForReflection
  ``` 
  
 ```java 
  public class HelloController {
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
      @RequestMapping
  ``` 
  
 ```java 
      public String index() {
  ``` 
  
 ```java 
          return "Hello Restlight Quarkus(SpringMVC)";
  ``` 
  
 ```java 
      }
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
  }
  ``` 
  
   
   
   如上，HelloController将会在构建阶段被自动地添加到静态代码分析的结果中去，无需其它配置。 
   （3）延迟初始化 
   Quarkus在打包Native Image过程中将执行部分初始化的操作，比如执行静态变量的初始化和静态代码块等并将执行的结果保存到Native-Image Heap中，在真正运行时将直接从Native-Image Heap中获取保存的结果，以此来减少启动时的类加载和初始化操作，实现缩短启动时间的目的，但这种构建时的类初始化的操作并不都是安全的，比如： 
   
   
    
 ```java 
  class A {
  ``` 
  
 ```java 
      static B b = new B();
  ``` 
  
 ```java 
  }
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
  class B {
  ``` 
  
 ```java 
      static {
  ``` 
  
 ```java 
          C.doSomething();
  ``` 
  
 ```java 
      }
  ``` 
  
 ```java 
  }
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
  class C {
  ``` 
  
 ```java 
      static long currentTime;
  ``` 
  
 ```java 
      static {
  ``` 
  
 ```java 
          currentTime=System.currentTimeMillis();
  ``` 
  
 ```java 
      }
  ``` 
  
 ```java 
    static void doSomething(){…}
  ``` 
  
 ```java 
  }
  ``` 
  
   
   
   如上代码所示，在构建阶段执行类初始化得到的currentTime明显要小于运行时首次加���C类时得到的值，因此必须将C类延迟到运行时初始化，并且由于级联的依赖关系，可能导致C类构建时初始化的A类和B类也需要同时声明进行延迟初始化。 
   在Restlight中同样存在不安全的类初始化，需要延迟到运行时进行初始化，比如： 
   1）静态变量提前初始化导致的不安全 
   
   
    
 ```java 
  public final class Platforms {
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
      private static final int NCPU = Runtime.getRuntime().availableProcessors();
  ``` 
  
 ```java 
      private static final boolean IS_LINUX = isLinux0();
  ``` 
  
 ```java 
      private static final boolean IS_WINDOWS = isWindows0();
  ``` 
  
 ```java 
      private static final int JAVA_VERSION = getJavaVersion();
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
      private Platforms() {
  ``` 
  
 ```java 
      }
  ``` 
  
 ```java 
  }
  ``` 
  
   
   
   如上，在Platforms类的初始化阶段，需要获取跟当前运行环境相关的系统资源，Java版本等信息。如果在构建阶段初始化并保存对应的结果显然会导致无法预知的运行时异常，因为构建时的运行环境与实际运行环境经常是不相同的。 
   2）静态代码块提前初始化导致的不安全 
   
   
    
 ```java 
  public class NioTransport implements Transport {
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
      static NioTransport INSTANCE = new NioTransport();
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
      private static final boolean USE_UNPOOLED_ALLOCATOR;
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
      static {
  ``` 
  
 ```java 
          USE_UNPOOLED_ALLOCATOR =
  ``` 
  
 ```java 
                  SystemPropertyUtil.getBoolean("io.esastack.httpserver.useUnpooledAllocator", false);
  ``` 
  
 ```java 
          if (Loggers.logger().isDebugEnabled()) {
  ``` 
  
 ```java 
              Loggers.logger().debug("-Dio.esastack.httpserver.useUnpooledAllocator: {}", USE_UNPOOLED_ALLOCATOR);
  ``` 
  
 ```java 
          }
  ``` 
  
 ```java 
      }
  ``` 
  
 ```java 
      
  ``` 
  
 ```java 
  }
  ``` 
  
   
   
   如上，在NioTransport类中，我们在静态代码块中通过读取系统属性的值来决定是否使用池化，但是如果在构建阶段就执行该代码块并保存结果显然是不符合预期的，原因同上，这里不再赘述。 
   从以上两种情形可以看出，Restlight在编写扩展时必须明确识别出可能导致运行时异常的提前类初始化并通过指定的方式将识别出来的类配置成运行时初始化，相比于编写代码，如何完整且准确地识别出不安全的提前类初始化及其相应的级联依赖关系更具难度和挑战性，因为这需要开发人员熟悉框架所有的代码功能及常见的不安全提前初始化的场景。只要能够分析出不安全的提前初始化，解决该问题就相对简单了，如下所示： 
   
   
    
 ```java 
  @BuildStep
  ``` 
  
 ```java 
  List<RuntimeInitializedClassBuildItem> runtimeInitializedClass() {
  ``` 
  
 ```java 
      List<RuntimeInitializedClassBuildItem> runtimeInitializedClasses = new LinkedList<>();
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
      runtimeInitializedClasses.add(new RuntimeInitializedClassBuildItem(Platforms.class.getName()));
  ``` 
  
 ```java 
      runtimeInitializedClasses.add(new RuntimeInitializedClassBuildItem(BufferUtil.class.getName()));
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
      return runtimeInitializedClasses;
  ``` 
  
 ```java 
  }
  ``` 
  
   
   
   将需要运行时初始化的类封装成RuntimeInitializedClassBuildItem形式并通过@BuildStep明确告知Quarkus在运行时初始化即可。 
   （4）资源文件 
   Restlight中存在大量配置SPI实现类的资源文件，这些资源文件默认不会被Quarkus打包到Native Image中，因此必须由开发人员自行处理。Restlight在自定义Quarkus扩展时做了如下处理： 
   
   
    
 ```java 
  @BuildStep
  ``` 
  
 ```java 
  List<NativeImageResourceBuildItem> nativeImageResourceBuildItems() {
  ``` 
  
 ```java 
      List<NativeImageResourceBuildItem> resources = new LinkedList<>();
  ``` 
  
 ```java 
      resources.add(new NativeImageResourceBuildItem(
  ``` 
  
 ```java 
              "META-INF/native-image/io.esastack/commons-net-netty/resource-config.json"));
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
      resources.add(new NativeImageResourceBuildItem(
  ``` 
  
 ```java 
              "META-INF/native-image/io.esastack/restlight-common/resource-config.json"));
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
      resources.add(new NativeImageResourceBuildItem(
  ``` 
  
 ```java 
              "META-INF/native-image/io.esastack/restlight-core/resource-config.json"));
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
      resources.add(new NativeImageResourceBuildItem(
  ``` 
  
 ```java 
              "META-INF/native-image/io.esastack/restlight-server/resource-config.json"));
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
      return resources;
  ``` 
  
 ```java 
  }
  ``` 
  
   
   
   将定义Resource资源的文件封装成NativeImageResourceBuildItem并返回，具体的Resource资源文件定义如下： 
   
   
    
 ```java 
  {
  ``` 
  
 ```java 
    "resources":{
  ``` 
  
 ```java 
      "includes":[
  ``` 
  
 ```java 
        {"pattern":".*/io.esastack.commons.net.buffer.BufferAllocator$"},
  ``` 
  
 ```java 
        {"pattern":".*/io.esastack.commons.net.internal.buffer.BufferProvider$"},
  ``` 
  
 ```java 
        {"pattern":".*/io.esastack.commons.net.internal.http.CookieProvider$"}
  ``` 
  
 ```java 
      ]},
  ``` 
  
 ```java 
    "bundles":[]
  ``` 
  
 ```java 
  }
  ``` 
  
   
   
   如上所示， 
   {"pattern":".*/io.esastack.commons.net.buffer.BufferAllocator$"}表示匹配当前路径下所有以io.esastack.commons.net.buffer.BufferAllocator结尾的资源文件路径，Resource资源文件的更多用法请参考官方文档，此处不做过多的语法介绍。 
   需要注意地是，Quarkus在使用Native Image进行打包时对于同名的文件内容将采取覆盖而非合并的策略，这将导致应用运行时错误，必须进行特殊处理。比如：Restlight通过SPI资源文件加载ParamResolver，由于采用分层的架构设计，核心层以及SpringMVC和JAX-RS的适配层拥有各自不同的ParamResolver实现类，但文件名称却是相同的，如果采用默认的覆盖策略将导致部分ParamResolver无法生效，因此必须修改默认的覆盖方式，进行合并处理，如下所示： 
   
   
    
 ```java 
  @BuildStep
  ``` 
  
 ```java 
  List<UberJarMergedResourceBuildItem> mergedResources() throws IOException {
  ``` 
  
 ```java 
      List<UberJarMergedResourceBuildItem> mergedResources = new LinkedList<>();
  ``` 
  
 ```java 
      Set<String> spiPathSet = new HashSet<>();
  ``` 
  
 ```java 
      spiPathSet.addAll(SpiUtil.getAllSpiPaths(BaseRestlightServer.class));
  ``` 
  
 ```java 
      spiPathSet.addAll(SpiUtil.getAllSpiPaths(Restlight.class));
  ``` 
  
 ```java 
      spiPathSet.addAll(SpiUtil.getAllSpiPaths(UnpooledNettyBufferAllocator.class));
  ``` 
  
 ```java 
      for (String spiPath : spiPathSet) {
  ``` 
  
 ```java 
          LOGGER.info("Add mergedResources:" + spiPath);
  ``` 
  
 ```java 
          mergedResources.add(new UberJarMergedResourceBuildItem(spiPath));
  ``` 
  
 ```java 
      }
  ``` 
  
 ```java 
      return mergedResources;
  ``` 
  
 ```java 
  }
  ``` 
  
   
   
   （5）Unsafe使用 
   在Java中Unsafe是一个高效的处理并发安全的类，提供了很多高效的方法，但是其中的某些方法在打包成Native Image后可能导致无法预知的错误，必须进行特殊处理，比如用于获取某个属性在对象中偏移量的Unsafe#objectFieldOffset方法。Quarkus在将应用打包成Native Image之后将导致对象内存结构的改变，因此在构建阶段计算得到的偏移量在运行期间将不再准确，需要重新进行计算或者直接禁用该方法。对于直接使用的Unsafe#objectFieldOffset、Unsafe#arrayBaseOffset、Unsafe#arrayIndexScale等方法，Quarkus会在构建阶段自动标记该方法的使用，并在实际运行阶段进行重新计算，但对于间接使用该方法的情形，自动标记的功能将不再生效，需要开发人员自行处理。Restlight在实际处理过程中，采用了和Netty相同的做法，即在打包成Native Image的场景下直接禁用该功能，如下： 
   
   
    
 ```java 
  // See https://github.com/oracle/graal/blob/master/sdk/src/org.graalvm.nativeimage/src/org/graalvm/nativeimage/
  ``` 
  
 ```java 
  // ImageInfo.java
  ``` 
  
 ```java 
  private static final boolean RUNNING_IN_NATIVE_IMAGE = ConfigUtils.get().getStr(
  ``` 
  
 ```java 
          "org.graalvm.nativeimage.imagecode") != null;
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
  if (unsafeStaticFieldOffsetSupported() && UnsafeUtils.hasUnsafe()) {
  ``` 
  
 ```java 
      valueFieldOffset = UnsafeUtils.objectFieldOffset(abstractStringBuilder, "value");
  ``` 
  
 ```java 
  }
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
  private static boolean unsafeStaticFieldOffsetSupported() {
  ``` 
  
 ```java 
      return !RUNNING_IN_NATIVE_IMAGE;
  ``` 
  
 ```java 
  }
  ``` 
  
   
   
   通过GraalVM打包成Native Image时写入的系统属性来判断当前应用是否运行在二进制打包环境下，如果是的话则避免使用Unsafe#objectFieldOffset方法。需要注意地是，Restlight在代码中使用UnsafeUtils对Unsafe的操作进行了封装，因此可能会使得Quarkus的自动标记功能失效，所以才在框架层面做了容错的处理，对于直接使用Unsafe#objectFieldOffset的场景则无需额外处理。 
   （6）其他 
   Restlight的高性能是在完全压榨Netty性能的基础上取得的，换句话说Netty是Restlight高性能的重要基石。在Restlight编写Quarkus扩展的过程中，如何处理Netty相关的部分也是我们非常关注的问题，好在无论是Netty官方还是Quarkus社区都在这方面做出来积极的探索和尝试，提供了Netty自身打包成Native Image的解决方案和代码实现，这也为Restlight编写Quarkus扩展扫清了障碍。此处，仅介绍两个本文尚未提及的解决Native Image打包过程中相关问题的解决方案： 
   1）方法替代 
   在前文中我们使用延迟初始化的方法解决类初始化时不安全的问题，Quarkus同样支持使用方法替代的方式来解决该问题，如下： 
   
   
    
 ```java 
  @TargetClass(className = "io.netty.util.internal.logging.InternalLoggerFactory")
  ``` 
  
 ```java 
  final class Target_io_netty_util_internal_logging_InternalLoggerFactory {
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
      @Substitute
  ``` 
  
 ```java 
      private static InternalLoggerFactory newDefaultFactory(String name) {
  ``` 
  
 ```java 
          return JdkLoggerFactory.INSTANCE;
  ``` 
  
 ```java 
      }
  ``` 
  
 ```java 
  }
  ``` 
  
   
   
   在上述代码中，@Substitute表示替换@TargetClass中同名的静态方法，即InternalLoggerFactory在构建阶段执行newDefaultFactory(String)方法时将直接返回JdkLoggerFactory.INSTANCE而不是基于当前classpath路径下的日志组件包进行判断。 
   2）重新计算属性的偏移量 
   在解决Unsafe中的偏移量计算问题时，我们通过避免使用相关方法来解决构建之后偏移量不准确的问题，Quarkus同样提供了一种更灵活的方式来解决该问题—重新计算，如下： 
   
   
    
 ```java 
  @TargetClass(className = "io.netty.util.AbstractReferenceCounted")
  ``` 
  
 ```java 
  final class Target_io_netty_util_AbstractReferenceCounted {
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
      @Alias
  ``` 
  
 ```java 
      @RecomputeFieldValue(kind = RecomputeFieldValue.Kind.FieldOffset, name = "refCnt")
  ``` 
  
 ```java 
      private static long REFCNT_FIELD_OFFSET;
  ``` 
  
 ```java 
  }
  ``` 
  
   
   
   上述代码表示，Unsafe在构建时将重新计算io.netty.util.AbstractReferenceCounted中refCnt的内存偏移量。 
    （7）实践结果 
   上文我们详细介绍了Restlight在编写Quarkus过程中遇到的挑战和相应的解决方案，感兴趣的读者可以通过quarkus-restlight查看相关源码。 
   我们基于Restlight编写简单的Web应用，并分别测试在HotSpot和Native Image模式下，应用的启动时间、启动时的内存占用、压测场景下的TPS、CPU和内存占用情况。 
   （8）测试环境 
   CentOS物理机（6c 12g）环境下的对比测试 
   （9）启动时间&内存占用 
   HotSpot模式下应用的启动时间分别为：608ms、639ms、672ms，启动时内存占用约为362MB 
   Native Image打包后应用的启动时间分别为：17ms、16ms、18ms，启动时内存占用约为22MB 
   从以上数据大致可以得出结论：在将简单的基于Restlight开发的Web应用打包成Native Image之后，启动时间可以缩短为原来的1/40，启动时的内存消耗大概为HotSpot模式下的1/16。 
   （10）性能测试结果 
   使用wrk分别压测同一个接口在Native Image和HotSpot场景下的性能 
   压测参数：./wrk -t64 -c200 -d300s 
   HotSpot模式下的两次结果分别为： 
   
   
    
 ```java 
  # Round 1
  ``` 
  
 ```java 
  Running 5m test @ http://127.0.0.1:9999/hello/springmvc
  ``` 
  
 ```java 
    64 threads and 200 connections
  ``` 
  
 ```java 
    Thread Stats   Avg      Stdev     Max   +/- Stdev
  ``` 
  
 ```java 
      Latency     2.14ms    2.74ms 113.28ms   90.53%
  ``` 
  
 ```java 
      Req/Sec     1.89k   332.69     5.68k    70.38%
  ``` 
  
 ```java 
    36192976 requests in 5.00m, 3.81GB read
  ``` 
  
 ```java 
  Requests/sec: 120603.33
  ``` 
  
 ```java 
  Transfer/sec:     13.00MB
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
  # Round 2
  ``` 
  
 ```java 
  Running 5m test @ http://127.0.0.1:9999/hello/springmvc
  ``` 
  
 ```java 
    64 threads and 200 connections
  ``` 
  
 ```java 
    Thread Stats   Avg      Stdev     Max   +/- Stdev
  ``` 
  
 ```java 
      Latency     2.29ms    3.52ms 246.11ms   92.10%
  ``` 
  
 ```java 
      Req/Sec     1.82k   345.90     6.77k    71.62%
  ``` 
  
 ```java 
    34791685 requests in 5.00m, 3.66GB read
  ``` 
  
 ```java 
  Requests/sec: 115933.97
  ``` 
  
 ```java 
  Transfer/sec:     12.49MB
  ``` 
  
   
   
   Native Image模式下的两次结果为： 
   
   
    
 ```java 
  # Round 1
  ``` 
  
 ```java 
  Running 5m test @ http://127.0.0.1:9999/hello/springmvc
  ``` 
  
 ```java 
    64 threads and 200 connections
  ``` 
  
 ```java 
    Thread Stats   Avg      Stdev     Max   +/- Stdev
  ``` 
  
 ```java 
      Latency     2.56ms    3.12ms 202.59ms   90.75%
  ``` 
  
 ```java 
      Req/Sec     1.50k   295.64     5.07k    71.20%
  ``` 
  
 ```java 
    28702092 requests in 5.00m, 3.02GB read
  ``` 
  
 ```java 
  Requests/sec:  95641.48
  ``` 
  
 ```java 
  Transfer/sec:     10.31MB
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
  # Round 2
  ``` 
  
 ```java 
  Running 5m test @ http://127.0.0.1:9999/hello/springmvc
  ``` 
  
 ```java 
    64 threads and 200 connections
  ``` 
  
 ```java 
    Thread Stats   Avg      Stdev     Max   +/- Stdev
  ``` 
  
 ```java 
      Latency     2.58ms    3.14ms 206.28ms   90.73%
  ``` 
  
 ```java 
      Req/Sec     1.49k   292.98     7.83k    70.26%
  ``` 
  
 ```java 
    28533013 requests in 5.00m, 3.00GB read
  ``` 
  
 ```java 
  Requests/sec:  95078.52
  ``` 
  
 ```java 
  Transfer/sec:     10.25MB
  ``` 
  
   
   
   在压测过程中，我们也记录了应用进程在不同场景下占用的CPU和内存情况：HotSpot���式���，进程内存占用稳定在430MB左右，CPU利用率为300%左右；Native Image模式下，进程占用内存在290MB~550MB之间周期性变化，CPU利用率为350%左右。 
   根据上述结果，我们可以大致得出以下结论：在将应用打包成Native Image之后，应用的TPS大致为HotSpot模式下的80%，同时在大流量场景下会消耗更多的CPU和内存资源。 
   04 总结 
   本文首先介绍了云原生Java框架Quarkus的主要功能与底层原理，再以OPPO开源的Web框架Restlight的实践过程为例，详细介绍了在此过程中遇到的一些问题及相应的解决方案，在深入分析相应问题的原因及解决方案之后，相信读者对Quarkus的内部实现原理也会有更深刻的理解。最后，我们通过对比测试的方式，了解了Quarkus在将应用打包成Native Image之后的带来的启动时间和内存占用上的巨大提升，同时也认识到在大流量场景下Native Image将导致TPS的下降，相比HotSpot模式下消耗更多的内存和CPU资源。 
   综合来看，Quarkus解决了Java在云原生环境下面临的一些挑战，具有如下特点： 
   （1）高性能：支持将通过AOT编译以及将应用打包成Native Image，解决了HotSpot模式下Java应用镜像体积大、启动时间长、内存占用大的问题，带来了数十倍的启动时间和内存优化效果。 
   （2）云原生：Quarkus带来的启动时间和内存占用的优化，使其更适合云原生的应用场景，特别是Serverless领域。 
   （3）生态完善：提供了大量开箱即用的数据访问框架、消息和缓存中间件、Spring框架API、Web框架等的扩展支持，降低了开发成本。 
   但世界上没有“银弹”，Quarkus也不例外，要想将Quarkus真正应用到生产环境并非易事。主要原因如下： 
   （4）开发难度大：Native Image要求应用程序的运行时空间是封闭的，因此需要开发人员识别出运行期间用到的所有反射、动态代理、JNI等，对于复杂的应用来说这通常难度很大，甚至难以实现。 
   系统稳定性风险增加：构建时进行类初始化的操作可能导致难以识别的运行时错误，需要开发人员谨慎对待，否则将出现诡异的Bug，导致系统运行时的稳定性风险增大。 
   （5）监控能力的缺失：在Native Image模式下，应用完全脱离JVM运行，jmap、jstack等命令以及其他的性能诊断工具将无法使用，而Quarkus目前提供的性能分析工具还不成熟。监控和诊断能力的缺失，也是开发人员需要面临的一个问题。 
   Quarkus带来了一种新的思路和解决方案，以试图解决Java在云原生时代面临的一些困难与挑战，目前看来还不太成熟，在生产环境使用仍面临一些难题，这也许是Quarkus目前社区活跃，但并不为��大Java开发者熟知的原因。但无论如何，Quarkus仍然带来了一种新的思路，让开发人员看到了云原生时代Java的曙光，并且我们相信技术总是向前发展的，期待广大开发者一起参与社区建设，助力Quarkus日趋完善，最终从Quarkus中受益。 
     
   附录 
   [1]Quarkus文档：https://quarkus.io/ 
   [2]GraalVM文档：https://www.graalvm.org/ 
   [3]Restlight：https://github.com/esastack/esa-restlight 
   [4]Quarkus Restlight： 
   https://github.com/esastack/quarkus-restlight 
   [5]周志明-云原生时代的Java： 
   https://time.geekbang.org/column/article/321185 
   
   
    
   
   
    
     
     作者简介 
     Mkabaka  OPPO高级后端工程师 
     2018年加入OPPO，先后负责公司Web框架、服务治理框架、Http通讯组件的设计和开发工作，目前正积极参与OPPO开源社区ESA Stack的建设和推广 
     
    
   
  
  
 
本文分享自微信公众号 - OPPO数智技术（OPPO_tech）。如有侵权，请联系 support@oschina.cn 删除。本文参与“OSC源创计划”，欢迎正在阅读的你也加入，一起分享。
                                        