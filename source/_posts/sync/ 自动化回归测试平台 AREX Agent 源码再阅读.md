---
title: 推荐系列- 自动化回归测试平台 AREX Agent 源码再阅读
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 19
cover_picture: 'https://api.ixiaowai.cn/gqapi/gqapi.php'
abbrlink: '67e1662'
date: 2023-05-24 09:23:09
---

&emsp;&emsp;EX 启动过程 通用 Java Agent 的启动过程 Java Agent 是一种 Java 应用程序，它可以在 Java 应用程序启动时动态地注入到 JVM 中，并在应用程序运行时监视和修改应用程序的行为。Java Agen...
<!-- more -->

                                                                                                                                                                                        ### AREX 启动过程 
#### 通用 Java Agent 的启动过程 
Java Agent 是一种 Java 应用程序，它可以在 Java 应用程序启动时动态地注入到 JVM 中，并在应用程序运行时监视和修改应用程序的行为。Java Agent 通常用于性能分析、代码覆盖率、安全检查等方面。 
以下是 Java Agent 的启动过程： 
 
  编写 Java Agent 程序，实现  
 ```java 
  premain 
  ``` 
 方法。 
 ```java 
  premain 
  ``` 
 方法是 Java Agent 的入口方法，它会在 Java 应用程序启动时被调用。在  
 ```java 
  premain 
  ``` 
 方法中，可以进行一些初始化操作，如设置代理、加载配置文件等。  
  将 Java Agent 打包成 jar 文件，并在 MANIFEST.MF 文件中指定  
 ```java 
  Premain-Class 
  ``` 
 属性，该属性指定了 Java Agent 的入口类。  
  在启动Java应用程序时，通过 -javaagent 参数指定 Java Agent 的 jar 文件路径。例如：  
 ```java 
  java -javaagent:/path/to/agent.jar -jar myapp.jar

  ``` 
  在上面的命令中，/path/to/agent.jar 是 Java Agent 的 jar 文件路径，myapp.jar 是 Java 应用程序的 jar 文件路径。  
  当 Java 应用程序启动时，JVM 会加载 Java Agent 的 jar 文件，并调用  
 ```java 
  premain 
  ``` 
 方法。在  
 ```java 
  premain 
  ``` 
 方法中，Java Agent 可以使用 Java Instrumentation API 来修改 Java 应用程序的字节���，实现对应用程序的监视和修改。  
 
#### AREX 源码视角的启动过程 
##### 步骤一 
在 
 ```java 
  arex-agent module 
  ``` 
 的 
 ```java 
  pom.xml
  ``` 
 文件中，通过配置 
 ```java 
  manifestEntries
  ``` 
 ，将 
 ```java 
  Premain-Class
  ``` 
 属性设置为 
 ```java 
  io.arex.agent.ArexJavaAgent
  ``` 
 。这意味着在构建 
 ```java 
  arex-agent.jar
  ``` 
 时，将在 
 ```java 
  manifest
  ``` 
 文件中指定 
 ```java 
  ArexJavaAgent
  ``` 
 类作为 Agent 的入口点。 
##### 步骤二 
在 
 ```java 
  ArexJavaAgent
  ``` 
 类中，实现了 
 ```java 
  premain
  ``` 
 方法作为Agent的入口方法。在 
 ```java 
  premain
  ``` 
 方法中，它调用了 
 ```java 
  agentmain
  ``` 
 方法。在 
 ```java 
  agentmain
  ``` 
 方法中，进一步调用了 
 ```java 
  init(Instrumentation inst, String agentArgs)
  ``` 
 函数。这个函数接受一个 
 ```java 
  Instrumentation
  ``` 
 对象和一个字符串参数 
 ```java 
  agentArgs
  ``` 
 。 
##### 步骤三 
在 
 ```java 
  init
  ``` 
 函数中，有两个重要的操作： 
 ```java 
  installBootstrapJar()
  ``` 
 和 
 ```java 
  AgentInitializer.initialize()
  ``` 
 。 
######  
 ```java 
  installBootstrapJar()
  ``` 
  
 
 ```java 
  installBootstrapJar()
  ``` 
 函数根据 
 ```java 
  AgentInitializer.class
  ``` 
 找到其所在的 jar 包，并通过调用 
 ```java 
  inst.appendToBootstrapClassLoaderSearch(jar)
  ``` 
 将其添加到Bootstrap ClassLoader的搜索路径中。Bootstrap ClassLoader是Java虚拟机中负责加载核心类库（如 
 ```java 
  java.lang
  ``` 
 和 
 ```java 
  java.util
  ``` 
 等）的特殊类加载器。通过调用 
 ```java 
  appendToBootstrapClassLoaderSearch
  ``` 
 方法，可以将自定义的类库添加到Bootstrap ClassLoader的搜索路径中，从而使得Java应用程序能够使用这些自定义的类库。 
如要根据 class 对象或者 jar 包的实现，获取一个类所在的 jar 包，可以按照以下步骤进行： 
 
 获取该类的 
 ```java 
  Class
  ``` 
 对象。 
 调用 
 ```java 
  Class
  ``` 
 对象的 
 ```java 
  getProtectionDomain()
  ``` 
 方法获取该类的 
 ```java 
  ProtectionDomain
  ``` 
 对象。 
 调用 
 ```java 
  ProtectionDomain
  ``` 
 对象的 
 ```java 
  getCodeSource()
  ``` 
 方法获取该类的 
 ```java 
  CodeSource
  ``` 
 对象。 
 调用 
 ```java 
  CodeSource
  ``` 
 对象的 
 ```java 
  getLocation()
  ``` 
 方法获取该类所在的jar包的URL。 
 通过URL对象的 
 ```java 
  getFile()
  ``` 
 方法获取该jar包的路径。 
 
######  
 ```java 
  AgentInitializer.initialize()
  ``` 
  
 
 ```java 
  AgentInitializer.initialize()
  ``` 
 函数是根据 
 ```java 
  ArexJavaAgent.class
  ``` 
 找到其所在的jar包（ 
 ```java 
  AgentInitializer.java
  ``` 
 文件），然后设置 
 ```java 
  arex.agent.jar.file.path
  ``` 
 变量，即代理jar包所在的目录。 
接下来，它会在该目录下查找 
 ```java 
  /extensions/
  ``` 
 子目录，并读取该目录下的所有jar包文件，这些文件是扩展包所在的位置。 
然后，调用 
 ```java 
  createAgentClassLoader(agent jar, 扩展包.jar)
  ``` 
 函数，创建一个 
 ```java 
  AgentClassLoader
  ``` 
 对象，它是AREX自定义的类加载器。使用自定义的类加载器是为了隔离，防止应用程序能够访问AREX Agent的代码。 
接着，调用 
 ```java 
  createAgentInstaller()
  ``` 
 函数，该函数使用前面生成的 
 ```java 
  AgentClassLoader
  ``` 
 加载类 
 ```java 
  io.arex.agent.instrumentation.InstrumentationInstaller
  ``` 
 ，获取其构造函数并创建实例，然后返回指向 
 ```java 
  AgentInstaller
  ``` 
 接口的对象。 
 
 ```java 
  AdviceClassesCollector
  ``` 
 收集代理jar文件和扩展jar文件。 
使用指向 
 ```java 
  AgentInstaller
  ``` 
 接口的 
 ```java 
  installer
  ``` 
 （前面返回的对象）调用 
 ```java 
  install()
  ``` 
 函数，实际上会调用 
 ```java 
  BaseAgentInstaller
  ``` 
 类的 
 ```java 
  install()
  ``` 
 函数，该函数调用 
 ```java 
  init(String agentArgs)
  ``` 
 进行初始化。 
在 
 ```java 
  BaseAgentInstaller
  ``` 
 类的 
 ```java 
  install()
  ``` 
 函数中，调用 
 ```java 
  init()
  ``` 
 函数执行以下操作： 
 
 初始化 
 ```java 
  TraceContextManager
  ``` 
 ，生成 
 ```java 
  IDGenerator
  ``` 
 用于生成 
 ```java 
  TransactionID
  ``` 
 。 
 初始化 
 ```java 
  installSerializer
  ``` 
 。 
 初始化 
 ```java 
  RecordLimiter
  ``` 
 ，设置录制频率限制。 
  
 ```java 
  ConfigService
  ``` 
 加载代理配置，包括设置调试模式、动态类配置、排除操作配置、Dubbo回放阈值、记录速率配置等。 
 初始化数据收集器，根据运行模式进行判断，并启动数据收集器。 
 再次从服务器获取代理配置，进行三次重试，然后解析配置并进行再次设置和更新（注意：存在一个BUG，第二次从服务器获取配置后，并没有看到Dubbo的回放阈值得到更新）。 
 
在 
 ```java 
  BaseAgentInstaller
  ``` 
 类的 
 ```java 
  install()
  ``` 
 函数中，调用了名为 
 ```java 
  transform()
  ``` 
 的抽象函数。实际上，这个抽象函数的具体实现在 
 ```java 
  InstrumentationInstaller
  ``` 
 类的 
 ```java 
  transform()
  ``` 
 函数中。 
通过这些配置和操作， 
 ```java 
  ArexJavaAgent
  ``` 
 类将被作为Agent的入口点，在Java应用程序启动时被加载，并对Bootstrap ClassLoader进行扩展，使得应用程序能够使用自定义的类库。 
##### 步骤四 
在 InstrumentationInstaller 类的 transform() 函数中实现了对目标应用程序的代码注入操作。 
 
 通过 getAgentBuilder() 获取了 ByteBuddy 的 AgentBuilder。 
 通过 SPI 函数获取了所有标识为 ModuleInstrumentation.class 的类的列表，这些类使用了 com.google.auto.service 注解 @AutoService(ModuleInstrumentation.class)。 
 根据上文获取的List, 逐个调用 InstallModule()，即使用步骤 6.a 中获取的 AgentBuilder 和 ModuleInstrumentation 注册模块。 
 在 ModuleInstrumentation 类中获取了 TypeInstrumentation 的列表，针对每个 TypeInstrumentation，找到其对应的 MethodInstrumentation 列表。 
 对于每个 MethodInstrumentation，调用 AgentBuilder.Identified 的 transform() 函数进行代码注入。 
 
简而言之，这一步过程是实现了模块化的插桩功能。通过实现 ModuleInstrumentation 接口，可以定义需要进行代码注入的模块。在每个模块中，通过实现 TypeInstrumentation 接口可以定义需要注入代码的具体类型。而在每个类型中，通过实现 MethodInstrumentation 接口可以定义需要注入代码的具体方法。这样，AREX Agent 就可以根据这些定义，将录制和回放的代码注入到相应的方法中，实现了对应功能的记录和重放。 
##### 步骤五 
完成所有类的注入，完成 AREX 的启动后 AREX 开始运行。 
### AREX 录制回放 
#### 录制回放概述 
AREX的录制功能不仅仅是单独录制请求报文，而是将请求、应答报文以及内部调用的请求和应答一并保存下来。核心目标是将请求、应答和内部调用的请求应答一一关联起来保存。AREX采用类似 OpenTelemetry 的 Tracing 技术，实现全链路跟踪并保存关联的 Tracing ID。 
##### 录制 
录制分为入口录制和内部调用录制两部分。入口请求中没有Tracing ID，需要生成唯一的Tracing ID，并记录下来。入口录制保存请求和Tracing ID。内部调用录制保存Tracing ID和内部调用的请求、应答。 
入口请求的响应报文也需要记录，即入口调用的应答和Tracing ID（这里提到的 Tracing ID 在后文中称为 AREX Record ID）。 
##### 回放 
回放过程中，入口请求中包含AREX-Replay-ID和Record ID的报文。根据Record ID从数据库中获取相应的应答，并返回给调用方。同时，关联Replay ID记录回放过程中的数据并保存到数据库。 
在内部调用过程中，如果检测到当前处于回放状态，则根据Record ID从数据库中获取数据返回（模拟应答），并记录内部调用的请求，关联Replay ID并保存到数据库。 
根据Replay ID，找到入口调用��应答报文以及内部调用的请求报文，并进行录制场景和回放场景的差异比对。 
最后输出差异结果，结束回放过程。 
#### AREX Servlet 的入口录制和回放 
代码所在目录 arex-agent-java\arex-instrumentation\servlet 
##### AREX 注入代码三要素 
 
 ModuleInstrumentation: FilterModuleInstrumentationV3 
 TypeInstrumentation: FilterInstrumentationV3 
 MethodInstrumentation: 
 
 
 ```java 
       @Override
    public List<MethodInstrumentation> methodAdvices() {
        ElementMatcher<MethodDescription> matcher = named("doFilter")
                .and(takesArgument(0, named("javax.servlet.ServletRequest")))
                .and(takesArgument(1, named("javax.servlet.ServletResponse")));

        return Collections.singletonList(new MethodInstrumentation(matcher, FilterAdvice.class.getName()));
    } 

  ``` 
  
##### 录制回放的步骤 
 
  改写 javax.servlet.Filter 类的 doFilter(request, response) 函数。  
  在函数入口处（OnMethodEnter）进行改写，并获取两个参数，0 位是 request，1 位是 response。 a. 调用 ServletAdviceHelper.onServiceEnter()，传入请求和应答。 b. 调用 CaseEventDispatcher.onEvent(CaseEvent.ofEnterEvent())，其中包括调用了 TimeCache.remove()、TraceContextManager.remove() 和 ContextManager.overdueCleanUp()。 c. 调用 CaseEventDispatcher.onEvent(CaseEvent.ofCreateEvent())，其中包括调用了 initContext(source) 和 initClock()。 initContext() 函数调用设置 ArexContext，入口处会生成 TraceID。ContextManager.currentContext(true, source.getCaseId()) 中的 createIfAbsent 参数传入 True，会调用 TRACE_CONTEXT.set(messageId)。 initClock() 函数判断当前是否处于回放状态，如果是则解析时间并调用TimeCache.put(millis)。如果当前是录制状态（即ArexContext不为空且不处于回放状态ContextManager.needRecord()），则调用RecordMocker。  
  在函数出口处（OnMethodExit）进行改写，调用ServletAdviceHelper.onServiceExit()。 调用 new ServletExtractor<>(adapter, httpServletRequest, httpServletResponse).execute() 函数。 然后调用 doExecute()，构建 Mocker 对象，并为 Mocker 对象设置请求头、Body 和属性。同时为 Mocker 对象设置响应对象、Body 和 Type。 如果当前处于回放状态，则回放 Mocker 数据。如果当前处于录制状态，则保存 Mocker 数据。  
 
类似的实现方式也适用于入口录制和回放，原理类似，不再赘述。 
 
 对于 Dubbo，可以在 DubboProviderExtractor 类的 onServiceEnter() 中实现。 
 对于 Netty，可以在io.netty.channel.DefaultChannelPipeline 类中的 add 前缀函数和 replace 函数中实现。 
 
#### AREX 内部调用的录制回放 
代码所在目录 arex-agent-java\arex-instrumentation\netty\arex-netty-v4 
##### AREX 注入代码三要素: 
 
 ModuleInstrumentation: NettyModuleInstrumentation 
 TypeInstrumentation: ChannelPipelineInstrumentation 
 MethodInstrumentation: 
 
 
 ```java 
       @Override
    public List<MethodInstrumentation> methodAdvices() {
        return singletonList(new MethodInstrumentation(
                isMethod().and(nameStartsWith("add").or(named("replace")))
                        .and(takesArgument(1, String.class))
                        .and(takesArgument(2, named("io.netty.channel.ChannelHandler"))),
                AddHandlerAdvice.class.getName()));
    } 

  ``` 
  
##### 录制回放的步骤 
在 Java Netty 中，ChannelPipeline 是一个事件处理机制，用于处理入站和出站事件。它是Netty的核心组件之一，用于管理 ChannelHandler 的处理流程。当一个事件被触发时，它会被传递给ChannelPipeline，然后由Pipeline中的每个 ChannelHandler 依���处理。每个 ChannelHandler 都可以对事件进行处理或者转发给下一个 ChannelHandler。addAfter方法是用于向ChannelPipeline中添加一个新的ChannelHandler，并将其插入到指定的 ChannelHandler 之后。这个方法可以用于动态地修改 ChannelPipeline 中的处理流程，以便在运行时根据需要添加或删除处理器。 
在改写 io.netty.channel.DefaultChannelPipeline 类的 add 前缀函数或者 replace 函数时，我们可以在函数 OnMethodExit 时获取当前对象的 ChannelPipeline，以及参数 1 handleNamer 和参数 2 handler。 
我们可以进行以下判断和处理： 
 
  如果 handler 是HttpRequestDecoder实例，则调用RequestTracingHandler()来处理回放的数据。  
  如果handler是HttpResponseEncoder实例，则调用ResponseTracingHandler()来处理录制的数据。  
  如果handler是HttpServerCodec实例，则调用ServerCodecTracingHandler()来处理。HttpServerCodec是Java Netty中的一个ChannelHandler，用于将HTTP请求和响应消息编码和解码为HTTP消息。它实现了HTTP协议的编解码，可以将HTTP请求和响应消息转换为字节流，以便在网络中传输。  
 
#### 异步访问的处理 
在Java生态系统中存在多种异步框架和类库，如Reactor、RxJava等，同时还有一些类库提供了异步访问的实现，例如 lettuce 提供了同步和异步访问 Redis 的方式。不同的场景通常需要不同的解决方案。 
以 ApacheAsyncClient 为例，它是通过在固定运行的线程中监听响应并发起回调（Callback）来实现异步处理。在整个调用、监听和回调的过程中，需要确保多个跨线程的 Trace 传递。 
在注入代码中，需要使用 FutureCallbackWrapper 中的 TraceTransmitter 来传递 Trace。具体的注入位置如下： 
 
  ModuleInstrumentation: SyncClientModuleInstrumentation  
  TypeInstrumentation: InternalHttpAsyncClientInstrumentation（用于异步情况）、InternalHttpClientInstrumentation  
  MethodInstrumentation: 注入到org.apache.http.impl.nio.client.InternalHttpAsyncClient类的execute函数，使用named("execute")方法进行识别。  
 
##### 录制回放的步骤 
在注入函数中，我们针对org.apache.http.impl.nio.client.InternalHttpAsyncClient类的execute函数进行操作，使用函数名named("execute")来标识该函数。 
首先，我们获取execute函数的第三个参数FutureCallback，并将其赋值给AREX实现的封装类FutureCallbackWrapper的callback参数。FutureCallback接口定义了两个方法：onSuccess和onFailure。当异步操作成功完成时，onSuccess方法将被调用，并传递异步操作的结果作为参数。当异步操作失败时，onFailure方法将被调用，并传递异常作为参数。 
然后，我们进行以下判断： 
 
  如果需要进行录制，则 FutureCallbackWrapper 的封装类重写了 completed(T) 函数，在 completed 函数中保存响应数据，然后调用原始的 FutureCallback 的 completed 方法。同样地，FutureCallbackWrapper 的封装类也重写了 failed() 函数，在 failed 函数中记录响应数据，并调用原始的 FutureCallback 的 failed 方法。  
  如果需要进行回放，则获取回放数据并将其保存在本地的 mockResult 变量中。  
 
最后，在注入函数的出口处，如果 mockResult 变量的数据不为空，并且 callback 是 AREX 封装类的实例，那么调用封装类的 replay 函数进行回放操作。 
通过以上操作，我们在 execute 函数的入口和出口处对跨线程的 Trace 传递进行了处理，包括录制和回放功能的实现。 
#### AREX 录制频率设置 
在 ServletAdviceHelper 类的 onServiceEnter 函数中（就是 Servlet 进入的函数中），实现了 AREX 的录制频率设置。 
 
 ```java 
  CaseEventDispatcher.onEvent(CaseEvent.ofEnterEvent());
if (shouldSkip(adapter, httpServletRequest)) {
            return null;
}

  ``` 
  
首先，根据报文头和配置进行录制判断： 
 
 如果请求报文头中有caseID字段，查询配置项arex.disable.replay，如果该配置项的值为true，则直接跳过录制。 
 如果请求报文头中存在arex-force-record字段，并且该字段的值为true，则不能跳过录制。 
 如果请求报文头中存在arex-replay-warm-up字段，并且该字段的值为true，则跳过录制。 
 
接下来，会解析请求报文： 
 
 如果请求URL为空，则跳过录制。 
 如果请求URL在配置中的录制忽略列表中，则跳过录制。 
 
接着，会调用Config类的invalidRecord方法进行录制有效性的检查： 
 
 如果配置处于debug状态，则不能跳过录制，直接返回false。 
 如果配置的录制速率小于0，则跳过录制。 
 
最后，根据请求的路径和录制速率判断是否需要跳过录制，这里使用 com.google.common.util.concurrent.RateLimiter 类的 acquire 函数。RateLimiter 是 Google Guava 库中的一个类，用于限制操作的频率。它可以用于控制某个操作在一定时间内最多能执行多少次，或者在一定时间内最多能执行多少次操作。使用 
 ```java 
  RateLimiter
  ``` 
 类，需要先创建一个 
 ```java 
  RateLimiter
  ``` 
 对象，并指定它的速率限制。然后，我们可以使用  
 ```java 
  acquire() 
  ``` 
 方法获取一个许可证，表示可以执行一个操作。 
 
 如果当前速率已经达到了限制，acquire 函数会阻塞等待，直到能够获取到许可证为止。 
 如果能够获取到许可证，则不跳过录制。 
 
### AREX 代码隔离 
在Java虚拟机中，判断两个类是否相等时，不仅会比较它们的全限定名，还会比较它们的加载器。如果两个类的全限定名相同，但加载它们的ClassLoader不同，Java虚拟机会认为这是两个不同的类。 
这种设计有助于保证Java虚拟机的安全性和隔离性。不同的ClassLoader可以加载同一个类，但它们加载的类是相互独立的，互相不可见的。这样可以避免不同应用程序或模块之间的类冲突和干扰。 
在 AREX 中，涉及的 ClassLoader 有以下几种： 
 
  
 ```java 
  arex-agent
  ``` 
 ：由 AppClassLoader 加载，用于加载 AREX Agent 的核心组件。 
  
 ```java 
  arex-agent-bootstrap
  ``` 
 ：由引导类加载器（Bootstrap ClassLoader）加载，用于加载 AREX Agent 的引导类。 
  
 ```java 
  arex-agent-core
  ``` 
 ：由 AgentClassLoader 加载，这是 AREX 自定义的 ClassLoader，负责加载 arex-agent-core 等 jar。 
  
 ```java 
  arex-instrumentation
  ``` 
 ：由 UserClassLoader 加载，用于加载 AREX 的 Instrumentation、Module 和 Advice 等组件。 
   
    
 ```java 
  XXX Instrumentation & Module & Advice
  ``` 
 ：由 AgentClassLoader 加载，用于加载具体的 Instrumentation、Module 和 Advice 等实现。 
    
  
 ```java 
  arex-instrumentation-api
  ``` 
 ：由 AgentClassLoader 加载，包括 API 和 Runtime 两部分。 
   
    
 ```java 
  api
  ``` 
 ：由 AgentClassLoader 加载，提供给用户使用的 API。 
    
 ```java 
  runtime
  ``` 
 ：由 AppClassLoader 加载，用于 AREX 运行时的一些功能。 
    
 arex-instrumentation-foundation`：由 AgentClassLoader 加载，用于加载 AREX 的基础功能，如后端实现等。 
 
这些不同的 ClassLoader 之间具有隔离性，确保了各个组件的独立性和安全性。 
其中： 
 
  AgentClassLoader：AREX 自定义的 ClassLoader。  
  Bootstrap ClassLoader: Java Instrumentation API 是 Java SE 5 中引入的一个功能强大的工具，它允许在运行时修改Java类的行为。 其中，Instrumentation类是Java Instrumentation API的核心类之一，它提供了一些方法来监测和修改Java应用程序的运行状态。 其中，appendToBootstrapClassLoaderSearch方法是Instrumentation类中的一个方法，它的作用是将指定的jar文件添加到Bootstrap ClassLoader的搜索路径中。 Bootstrap ClassLoader是Java虚拟机中的一个特殊的类加载器，它负责加载Java运行时环境中的核心类库，如java.lang和java.util等。 通过调用appendToBootstrapClassLoaderSearch方法，可以将自定义的类库添加到Bootstrap ClassLoader的搜索路径中，从而使得Java应用程序可以使用这些自定义的类库。 需要注意的是，由于appendToBootstrapClassLoaderSearch 方法会修改 Java 虚拟机的运行状态，因此只有具有足够权限的用户才能调用该方法。  
  AppClassLoader是Java应用程序默认的ClassLoader，它负责加载应用程序的类。AppClassLoader会从CLASSPATH环境变量或者系统属性java.class.path指定的路径中加载类文件。 如果需要加载的类不在AppClassLoader的搜索路径中，它会委托给父ClassLoader进行加载，直到BootstrapClassLoader为止。  
  UserClassLoader 用户自定义ClassLoader,如SPIUtil类中Load方法如下获取ClassLoader加载  
 ```java 
  ClassLoader cl = Thread.currentThread().getContextClassLoader();

  ``` 
   

                                        