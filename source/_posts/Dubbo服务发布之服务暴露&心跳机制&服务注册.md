---
title: 推荐系列-Dubbo服务发布之服务暴露&心跳机制&服务注册
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 2092
cover_picture: 'https://images.pexels.com/photos/886521/pexels-photo-886521.jpeg?cs=srgb&dl=art-close-up-ecology-886521.jpg&fm=jpg'
abbrlink: c1aba8a6
date: 2021-04-15 09:19:21
---

&emsp;&emsp;Dubbo服务发布 Dubbo服务发布影响流程的主要包括三个部分，依次是： 服务暴露 心跳 服务注册 服务暴露是对外提供服务及暴露端口，以便消费端可以正常调通服务。心跳机制保证服务器端及客户端...
<!-- more -->

                                                                                                                                                                                         
### Dubbo服务发布 
Dubbo服务发布影响流程的主要包括三个部分，依次是： 
 
 服务暴露 
 心跳 
 服务注册 
 
服务暴露是对外提供服务及暴露端口，以便消费端可以正常调通服务。心跳机制保证服务器端及客户端正常长连接的保持，服务注册是向注册中心注册服务暴露服务的过程。 
 
#### Dubbo服务暴露 
此处只记录主要代码部分以便能快速定位到主要的核心代码： 
ServiceConfig.java中代码 
 ```java 
  if (registryURLs != null && registryURLs.size() > 0
        && url.getParameter("register", true)) {
    // 循环祖册中心 URL 数组 registryURLs
    for (URL registryURL : registryURLs) {
        // "dynamic" ：服务是否动态注册，如果设为false，注册后将显示后disable状态，需人工启用，并且服务提供者停止时，也不会自动取消册，需人工禁用。
        url = url.addParameterIfAbsent("dynamic", registryURL.getParameter("dynamic"));
        // 获得监控中心 URL
        URL monitorUrl = loadMonitor(registryURL);
        if (monitorUrl != null) {
            // 将监控中心的 URL 作为 "monitor" 参数添加到服务提供者的 URL 中，并且需要编码。通过这样的方式，服务提供者的 URL 中，包含了监控中心的配置。
            url = url.addParameterAndEncoded(Constants.MONITOR_KEY, monitorUrl.toFullString());
        }
        if (logger.isInfoEnabled()) {
            logger.info("Register dubbo service " + interfaceClass.getName() + " url " + url + " to registry " + registryURL);
        }
        // 使用 ProxyFactory 创建 Invoker 对象
        // 调用 URL#addParameterAndEncoded(key, value) 方法，将服务体用这的 URL 作为 "export" 参数添加到注册中心的 URL 中。通过这样的方式，注册中心的 URL 中，包含了服务提供者的配置。
        // 创建 Invoker 对象。该 Invoker 对象，执行 #invoke(invocation) 方法时，内部会调用 Service 对象( ref )对应的调用方法。
        Invoker<?> invoker = proxyFactory.getInvoker(ref, (Class) interfaceClass, registryURL.addParameterAndEncoded(Constants.EXPORT_KEY, url.toFullString()));
        // 使用 Protocol 暴露 Invoker 对象
        /**
         * Protocol$Adaptive => ProtocolFilterWrapper => ProtocolListenerWrapper => RegistryProtocol
         * =>
         * Protocol$Adaptive => ProtocolFilterWrapper => ProtocolListenerWrapper => DubboProtocol
         */
        Exporter<?> exporter = protocol.export(invoker);
        // 添加到 `exporters`
        exporters.add(exporter);
    }
}
  ```  
循环注册中心，对每个注册中心都执行代码块中的执行过程 
1.如果url中没有dynamic 参数，则从registerUrl中取值，并赋予url dynamic是服务动态注册的标识，默认为true，如果设置为false,则服务注册后显示disable状态，需人工启动 
2.加载注册中心对应的监控中心配置 
3.如果注册中心不为空则设置url的 monitor参数 
4.Invoker proxyFactory.getInvoker  proxyFactory 默认为JavassistProxyFactory对象，这段代码为创建 ref 服务对象的代理对象。 proxyFactory.getInvoker(ref, (Class) interfaceClass, registryURL.addParameterAndEncoded(Constants.EXPORT_KEY, url.toFullString())); 获取ref的代理对象并在registryURL 中添加export属性，代理对象中属性参数如下 ![Test](https://oscimg.oschina.net/oscnet/b3ce042b0cdf415c14b4721241a95d72154.jpg  'Dubbo服务发布之服务暴露&心跳机制&服务注册') 
5.protocol.export(invoker) 为暴露服务的核心实现部分,协议的调用链如下： 
 
其中DubboProtocol 实现了服务暴露及心跳检测功能  RegistryProtocol 调用了DubboProtocol及注册服务 
接下来经过两个扩展类(包装器) ProtocolFilterWrapper和ProtocolListenerWrapper 进入RegistryProtocol 核心代码如下： 
 ```java 
  public <T> Exporter<T> export(final Invoker<T> originInvoker) throws RpcException {
    // 暴露服务
    //export invoker
    final ExporterChangeableWrapper<T> exporter = doLocalExport(originInvoker);

    //registry provider
    final Registry registry = getRegistry(originInvoker);
    // 获得服务提供者 URL
    final URL registedProviderUrl = getRegistedProviderUrl(originInvoker);

    registry.register(registedProviderUrl);
    // 订阅override数据
    // FIXME 提供者订阅时，会影响同一JVM即暴露服务，又引用同一服务的的场景，因为subscribed以服务名为缓存的key，导致订阅信息覆盖。
    final URL overrideSubscribeUrl = getSubscribedOverrideUrl(registedProviderUrl);
    final OverrideListener overrideSubscribeListener = new OverrideListener(overrideSubscribeUrl, originInvoker);
    overrideListeners.put(overrideSubscribeUrl, overrideSubscribeListener);
    registry.subscribe(overrideSubscribeUrl, overrideSubscribeListener);
    //保证每次export都返回一个新的exporter实例
    return new Exporter<T>() {
        public Invoker<T> getInvoker() {
            return exporter.getInvoker();
        }

        public void unexport() {
            try {
                exporter.unexport();
            } catch (Throwable t) {
                logger.warn(t.getMessage(), t);
            }
            try {
                registry.unregister(registedProviderUrl);
            } catch (Throwable t) {
                logger.warn(t.getMessage(), t);
            }
            try {
                overrideListeners.remove(overrideSubscribeUrl);
                registry.unsubscribe(overrideSubscribeUrl, overrideSubscribeListener);
            } catch (Throwable t) {
                logger.warn(t.getMessage(), t);
            }
        }
    };
}
  ```  
   
 ```java 
  /**
 * 暴露服务。
 *
 * 此处的 Local 指的是，本地启动服务，但是不包括向注册中心注册服务的意思。
 * @param originInvoker
 * @param <T>
 * @return
 */
@SuppressWarnings("unchecked")
private <T> ExporterChangeableWrapper<T> doLocalExport(final Invoker<T> originInvoker) {
    // 获得在 `bounds` 中的缓存 Key
    //dubbo://192.168.20.218:20880/com.alibaba.dubbo.demo.DemoService?anyhost=true&application=demo-provider&default.accepts=1000&default.threadpool=fixed&default.threads=100&default.timeout=5000&dubbo=2.0.0&generic=false&
    // interface=com.alibaba.dubbo.demo.DemoService&methods=sayHello&owner=uce&pid=1760&side=provider&timestamp=1530150456618
    String key = getCacheKey(originInvoker);
    ExporterChangeableWrapper<T> exporter = (ExporterChangeableWrapper<T>) bounds.get(key);
    if (exporter == null) {
        synchronized (bounds) {
            exporter = (ExporterChangeableWrapper<T>) bounds.get(key);
            // 未暴露过，进行暴露服务
            if (exporter == null) {
                // InvokerDelegete 实现 com.alibaba.dubbo.rpc.protocol.InvokerWrapper 类，主要增加了 #getInvoker() 方法，获得真实的，非 InvokerDelegete 的 Invoker 对象。
                // 因为，可能会存在 InvokerDelegete.invoker 也是 InvokerDelegete 类型的情况。  getProviderUrl 同上 key = getCacheKey
                final Invoker<?> invokerDelegete = new InvokerDelegete<T>(originInvoker, getProviderUrl(originInvoker));
                // 暴露服务，创建 Exporter 对象

                Exporter<T> export = (Exporter<T>) protocol.export(invokerDelegete);
                // 使用 创建的Exporter对象 + originInvoker ，创建 ExporterChangeableWrapper 对象
                exporter = new ExporterChangeableWrapper<T>(export, originInvoker);
                bounds.put(key, exporter);
            }
        }
    }
    return exporter;
}
  ```  
1.代用同步锁+double-check的方式来保证同样的服务不重复暴露。 
2.new InvokerDelegete<T>(originInvoker, getProviderUrl(originInvoker)); InvokerDelegete 实现 com.alibaba.dubbo.rpc.protocol.InvokerWrapper（invoke） 类，主要增加了 #getInvoker() 方法，获得真实的，非 InvokerDelegete 的 Invoker 对象。 ![Test](https://oscimg.oschina.net/oscnet/b3ce042b0cdf415c14b4721241a95d72154.jpg  'Dubbo服务发布之服务暴露&心跳机制&服务注册') 
3.调用protocol.export接��� 经过ProtocolFilterWrapper.invoker方法 创过滤器链再暴露服务： 
protocol.export(buildInvokerChain(invoker, Constants.SERVICE_FILTER_KEY, Constants.PROVIDER)); 
 ```java 
  /**
 * 构建过滤器链
 * @param invoker injvm://127.0.0.1/com.alibaba.dubbo.demo.DemoService?anyhost=true&application=demo-provider&default.accepts=1000&default.threadpool=fixed&default.threads=100&default.timeout=5000&dubbo=2.0.0&generic=false&interface=com.alibaba.dubbo.demo.DemoService&methods=sayHello&owner=uce&pid=9932&side=provider&timestamp=1527930395583
 * @param key service.filter 该参数用于获得 ServiceConfig 或 ReferenceConfig 配置的自定义过滤器
 *            以 ServiceConfig 举例子，例如 url = injvm://127.0.0.1/com.alibaba.dubbo.demo.DemoService?anyhost=true&application=demo-provider&bind.ip=192.168.3.17&bind.port=20880&default.delay=-1&default.retries=0&default.service.filter=demo&delay=-1&dubbo=2.0.0&generic=false&interface=com.alibaba.dubbo.demo.DemoService&methods=sayHello&pid=81844&qos.port=22222&service.filter=demo&side=provider&timestamp=1520682156043 中，
 *            service.filter=demo，这是笔者配置自定义的 DemoFilter 过滤器。
 *            <dubbo:service interface="com.alibaba.dubbo.demo.DemoService" ref="demoService" filter="demo" />
 * @param group provider  属性，分组
 *              在暴露服务时，group = provider 。
 *              在引用服务时，group = consumer 。
 * @param <T>
 * @return
 */
private static <T> Invoker<T> buildInvokerChain(final Invoker<T> invoker, String key, String group) {
    Invoker<T> last = invoker;
    List<Filter> filters = ExtensionLoader.getExtensionLoader(Filter.class).getActivateExtension(invoker.getUrl(), key, group);
   /* EchoFilter
      ClassLoaderFilter
      GenericFilter
      ContextFilter
      TraceFilter
      TimeoutFilter
      MonitorFilter
      ExceptionFilter
      DemoFilter 【自定义】*/
    //倒序循环 Filter ，创建带 Filter 链的 Invoker 对象。因为是通过嵌套声明匿名类循环调用的方式，所以要倒序。可以手工模拟下这个过程。通过这样的方式，实际过滤的顺序，还是我们上面看到的正序
    if (filters.size() > 0) {
        for (int i = filters.size() - 1; i >= 0; i--) {
            final Filter filter = filters.get(i);
            final Invoker<T> next = last;
            last = new Invoker<T>() {

                @Override
                public Class<T> getInterface() {
                    return invoker.getInterface();
                }
                @Override
                public URL getUrl() {
                    return invoker.getUrl();
                }
                @Override
                public boolean isAvailable() {
                    return invoker.isAvailable();
                }
                @Override
                public Result invoke(Invocation invocation) throws RpcException {
                    return filter.invoke(next, invocation);
                }
                @Override
                public void destroy() {
                    invoker.destroy();
                }
                @Override
                public String toString() {
                    return invoker.toString();
                }
            };
        }
    }
    return last;
}
  ```  
List<Filter> filters = ExtensionLoader.getExtensionLoader(Filter.class).getActivateExtension(invoker.getUrl(), key, group); 获取Active的属于指定组的过过滤器列表 参考文章：https://my.oschina.net/LucasZhu/blog/1835048 
接下来执行DubboProrocol进行服务暴露的过程。 
 ```java 
  public <T> Exporter<T> export(Invoker<T> invoker) throws RpcException {
    URL url = invoker.getUrl();

    // export service.
    String key = serviceKey(url);
    // 创建 DubboExporter 对象，并添加到 `exporterMap` 。
    DubboExporter<T> exporter = new DubboExporter<T>(invoker, key, exporterMap);
    exporterMap.put(key, exporter);

    //export an stub service for dispaching event
    Boolean isStubSupportEvent = url.getParameter(Constants.STUB_EVENT_KEY, Constants.DEFAULT_STUB_EVENT);
    Boolean isCallbackservice = url.getParameter(Constants.IS_CALLBACK_SERVICE, false);
    if (isStubSupportEvent && !isCallbackservice) {
        String stubServiceMethods = url.getParameter(Constants.STUB_EVENT_METHODS_KEY);
        if (stubServiceMethods == null || stubServiceMethods.length() == 0) {
            if (logger.isWarnEnabled()) {
                logger.warn(new IllegalStateException("consumer [" + url.getParameter(Constants.INTERFACE_KEY) +
                        "], has set stubproxy support event ,but no stub methods founded."));
            }
        } else {
            stubServiceMethodsMap.put(url.getServiceKey(), stubServiceMethods);
        }
    }
    // 启动服务器
    openServer(url);
    return exporter;
}
  ```  
1.获取invoker的 URL信息 2.获取key信息 为URL中interface与暴露端口的拼装字符串：com.alibaba.dubbo.demo.DemoService:20880 3.创建DubboExporter对象 并且入参为exporterMap 4.将exporter对象添加到exporterMap中   
 ```java 
   /**
  * 启动服务器
  *
  * @param url URL
  */
private void openServer(URL url) {
    // find server.
    String key = url.getAddress();
    //client 也可以暴露一个只有server可以调用的服务。
    boolean isServer = url.getParameter(Constants.IS_SERVER_KEY, true);
    if (isServer) {
        ExchangeServer server = serverMap.get(key);
        if (server == null) {
            serverMap.put(key, createServer(url));
        } else {
            //server支持reset,配合override功能使用
            server.reset(url);
        }
    }
}
  ```  
调用createServer()方法 并存入DubboProtocol的serverMap中   
 ```java 
  private ExchangeServer createServer(URL url) {
    //默认开启server关闭时发送readonly事件
    url = url.addParameterIfAbsent(Constants.CHANNEL_READONLYEVENT_SENT_KEY, Boolean.TRUE.toString());
    //默认开启heartbeat
    url = url.addParameterIfAbsent(Constants.HEARTBEAT_KEY, String.valueOf(Constants.DEFAULT_HEARTBEAT));
    String str = url.getParameter(Constants.SERVER_KEY, Constants.DEFAULT_REMOTING_SERVER);
    // 校验 Server 的 Dubbo SPI 拓展是否存在
    if (str != null && str.length() > 0 && !ExtensionLoader.getExtensionLoader(Transporter.class).hasExtension(str))
        throw new RpcException("Unsupported server type: " + str + ", url: " + url);
    // 设置codec为 `"Dubbo"`
    url = url.addParameter(Constants.CODEC_KEY, Version.isCompatibleVersion() ? COMPATIBLE_CODEC_NAME : DubboCodec.NAME);
    ExchangeServer server;
    try {
        server = Exchangers.bind(url, requestHandler);
    } catch (RemotingException e) {
        throw new RpcException("Fail to start server(url: " + url + ") " + e.getMessage(), e);
    }
    str = url.getParameter(Constants.CLIENT_KEY);
    if (str != null && str.length() > 0) {
        Set<String> supportedTypes = ExtensionLoader.getExtensionLoader(Transporter.class).getSupportedExtensions();
        if (!supportedTypes.contains(str)) {
            throw new RpcException("Unsupported client type: " + str);
        }
    }
    return server;
}
  ```  
1.默认开启server 关闭时发送readonly事件：channel.readonly.sent : true 2.默认开启 heartbeat  3.获取服务暴露的 server 传输 ， 默认为netty 4.设置编码器为Dubbo也就是 DubboCountCodec 5.Exchangers#bind(url, requestHandler) 启动服务器，requestHandler结构如下 
![Test](https://oscimg.oschina.net/oscnet/b3ce042b0cdf415c14b4721241a95d72154.jpg  'Dubbo服务发布之服务暴露&心跳机制&服务注册') 
具体实现代码如下： 
 ```java 
  private ExchangeHandler requestHandler = new ExchangeHandlerAdapter() {

    public Object reply(ExchangeChannel channel, Object message) throws RemotingException {
        if (message instanceof Invocation) {
            Invocation inv = (Invocation) message;
            Invoker<?> invoker = getInvoker(channel, inv);
            //如果是callback 需要处理高版本调用低版本的问题
            if (Boolean.TRUE.toString().equals(inv.getAttachments().get(IS_CALLBACK_SERVICE_INVOKE))) {
                String methodsStr = invoker.getUrl().getParameters().get("methods");
                boolean hasMethod = false;
                if (methodsStr == null || methodsStr.indexOf(",") == -1) {
                    hasMethod = inv.getMethodName().equals(methodsStr);
                } else {
                    String[] methods = methodsStr.split(",");
                    for (String method : methods) {
                        if (inv.getMethodName().equals(method)) {
                            hasMethod = true;
                            break;
                        }
                    }
                }
                if (!hasMethod) {
                    logger.warn(new IllegalStateException("The methodName " + inv.getMethodName() + " not found in callback service interface ,invoke will be ignored. please update the api interface. url is:" + invoker.getUrl()) + " ,invocation is :" + inv);
                    return null;
                }
            }
            RpcContext.getContext().setRemoteAddress(channel.getRemoteAddress());
            return invoker.invoke(inv);
        }
        throw new RemotingException(channel, "Unsupported request: " + message == null ? null : (message.getClass().getName() + ": " + message) + ", channel: consumer: " + channel.getRemoteAddress() + " --> provider: " + channel.getLocalAddress());
    }

    @Override
    public void received(Channel channel, Object message) throws RemotingException {
        if (message instanceof Invocation) {
            reply((ExchangeChannel) channel, message);
        } else {
            super.received(channel, message);
        }
    }

    @Override
    public void connected(Channel channel) throws RemotingException {
        invoke(channel, Constants.ON_CONNECT_KEY);
    }

    @Override
    public void disconnected(Channel channel) throws RemotingException {
        if (logger.isInfoEnabled()) {
            logger.info("disconected from " + channel.getRemoteAddress() + ",url:" + channel.getUrl());
        }
        invoke(channel, Constants.ON_DISCONNECT_KEY);
    }

    private void invoke(Channel channel, String methodKey) {
        Invocation invocation = createInvocation(channel, channel.getUrl(), methodKey);
        if (invocation != null) {
            try {
                received(channel, invocation);
            } catch (Throwable t) {
                logger.warn("Failed to invoke event method " + invocation.getMethodName() + "(), cause: " + t.getMessage(), t);
            }
        }
    }

    private Invocation createInvocation(Channel channel, URL url, String methodKey) {
        String method = url.getParameter(methodKey);
        if (method == null || method.length() == 0) {
            return null;
        }
        RpcInvocation invocation = new RpcInvocation(method, new Class<?>[0], new Object[0]);
        invocation.setAttachment(Constants.PATH_KEY, url.getPath());
        invocation.setAttachment(Constants.GROUP_KEY, url.getParameter(Constants.GROUP_KEY));
        invocation.setAttachment(Constants.INTERFACE_KEY, url.getParameter(Constants.INTERFACE_KEY));
        invocation.setAttachment(Constants.VERSION_KEY, url.getParameter(Constants.VERSION_KEY));
        if (url.getParameter(Constants.STUB_EVENT_KEY, false)) {
            invocation.setAttachment(Constants.STUB_EVENT_KEY, Boolean.TRUE.toString());
        }
        return invocation;
    }
};
  ```  
Exchangeers.bind(URL url, ExchangeHandler handler) 
 ```java 
  public static ExchangeServer bind(URL url, ExchangeHandler handler) throws RemotingException {
    if (url == null) {
        throw new IllegalArgumentException("url == null");
    }
    if (handler == null) {
        throw new IllegalArgumentException("handler == null");
    }
    url = url.addParameterIfAbsent(Constants.CODEC_KEY, "exchange");
    return getExchanger(url).bind(url, handler);
}
public static Exchanger getExchanger(URL url) {
    String type = url.getParameter(Constants.EXCHANGER_KEY, Constants.DEFAULT_EXCHANGER);
    return getExchanger(type);
}
public static Exchanger getExchanger(String type) {
    return ExtensionLoader.getExtensionLoader(Exchanger.class).getExtension(type);
}
  ```  
接口作用是设置exchanger params为header 并且获取Exchanger.class的header扩展接口HeaderExchanger， 并调用bind方法： 
 ```java 
  public class HeaderExchanger implements Exchanger {
    public static final String NAME = "header";
    public ExchangeClient connect(URL url, ExchangeHandler handler) throws RemotingException {
        return new HeaderExchangeClient(Transporters.connect(url, new DecodeHandler(new HeaderExchangeHandler(handler))), true);
    }
    public ExchangeServer bind(URL url, ExchangeHandler handler) throws RemotingException {
        return new HeaderExchangeServer(Transporters.bind(url, new DecodeHandler(new HeaderExchangeHandler(handler))));
    }
}
  ```  
先将 DubboProtocol入参 传过来的ExchangeHandler对象ExchangeHandlerAdapter() 进行包装组成handler链：最后返回ChannelHandler对象，接下来调用：Transporters.bind(url, new DecodeHandler(new HeaderExchangeHandler(handler))) Server Transporters.bind(URL url, ChannelHandler... handlers) Transpoter$Adaptive.bind() 
![Test](https://oscimg.oschina.net/oscnet/b3ce042b0cdf415c14b4721241a95d72154.jpg  'Dubbo服务发布之服务暴露&心跳机制&服务注册') 
数据透传 NettyTransporter.java Server NettyTransporter.bind(URL url, ChannelHandler listener) 
 ```java 
  public Server bind(URL url, ChannelHandler listener) throws RemotingException {
    return new NettyServer(url, listener);
}
  ```  
作用是： 
返回一个NettyServer实例： 
  
 ```java 
  public NettyServer(URL url, ChannelHandler handler) throws RemotingException {
    super(url, ChannelHandlers.wrap(handler, ExecutorUtil.setThreadName(url, SERVER_THREAD_POOL_NAME)));
}
  ```  
ExecutorUtil.setThreadName(url, SERVER_THREAD_POOL_NAME)) 只用是生成获取ThreadName的名称 为URL添加threadname的param ChannelHandlers.wrap(ChannelHandler handler, URL url)  代码如下： 
 ```java 
  public class ChannelHandlers {

    private static ChannelHandlers INSTANCE = new ChannelHandlers();

    protected ChannelHandlers() {
    }
    public static ChannelHandler wrap(ChannelHandler handler, URL url) {
        return ChannelHandlers.getInstance().wrapInternal(handler, url);
    }
    protected static ChannelHandlers getInstance() {
        return INSTANCE;
    }
    static void setTestingChannelHandlers(ChannelHandlers instance) {
        INSTANCE = instance;
    }
    protected ChannelHandler wrapInternal(ChannelHandler handler, URL url) {
        return new MultiMessageHandler(new HeartbeatHandler(ExtensionLoader.getExtensionLoader(Dispatcher.class)
                .getAdaptiveExtension().dispatch(handler, url)));
    }
}
  ```  
ExtensionLoader.getExtensionLoader(Dispatcher.class).getAdaptiveExtension().dispatch(handler, url)： ![Test](https://oscimg.oschina.net/oscnet/b3ce042b0cdf415c14b4721241a95d72154.jpg  'Dubbo服务发布之服务暴露&心跳机制&服务注册') 
获取到AllDispatcher分发器进行透传： 
 ```java 
  public class AllDispatcher implements Dispatcher {
    public static final String NAME = "all";

    public ChannelHandler dispatch(ChannelHandler handler, URL url) {
        return new AllChannelHandler(handler, url);
    }
}
  ```  
结构如图所示：![Test](https://oscimg.oschina.net/oscnet/b3ce042b0cdf415c14b4721241a95d72154.jpg  'Dubbo服务发布之服务暴露&心跳机制&服务注册') 
调用WrappedChannelHandler的构造方法： 
 ```java 
  public WrappedChannelHandler(ChannelHandler handler, URL url) {
    this.handler = handler;
    this.url = url;
    executor = (ExecutorService) ExtensionLoader.getExtensionLoader(ThreadPool.class).getAdaptiveExtension().getExecutor(url);

    String componentKey = Constants.EXECUTOR_SERVICE_COMPONENT_KEY;
    if (Constants.CONSUMER_SIDE.equalsIgnoreCase(url.getParameter(Constants.SIDE_KEY))) {
        componentKey = Constants.CONSUMER_SIDE;
    }
    DataStore dataStore = ExtensionLoader.getExtensionLoader(DataStore.class).getDefaultExtension();
    dataStore.put(componentKey, Integer.toString(url.getPort()), executor);
}
  ```  
这段代码的功能为： 
1.将 之前头创的DecoderHandler对象再进包装 包装为AllChannelHandler 2.生成线程池对象Executor对象 3.获取默认的DataStore对象，并将线程池对象放入DataStore 中 key为 : java.util.concurrent.ExecutorService 字符串和服务暴露的端口 值为线程池对象 
return new MultiMessageHandler(new HeartbeatHandler(ExtensionLoader.getExtensionLoader(Dispatcher.class)                 .getAdaptiveExtension().dispatch(handler, url))); 接下来将返回的AllChannelHandler对象用HeartbeatHandler 和 MultiMessageHandler 进行包装处理并返回ChannelHandler.wrap() 的上一端。 
NettyTransporter.bind(URL url, ChannelHandler listener) -> new NettyServer(URL url, ChannelHandler handler) ->  super(url, ChannelHandlers.wrap(handler, ExecutorUtil.setThreadName(url, SERVER_THREAD_POOL_NAME))); 接下来是创建NettyServer对象的最后一步： 
 ```java 
  NettyServer ==>
public NettyServer(URL url, ChannelHandler handler) throws RemotingException {
    super(url, ChannelHandlers.wrap(handler, ExecutorUtil.setThreadName(url, SERVER_THREAD_POOL_NAME)));
}
AbstractServer==>
public AbstractServer(URL url, ChannelHandler handler) throws RemotingException {
    super(url, handler);
    localAddress = getUrl().toInetSocketAddress();
    String host = url.getParameter(Constants.ANYHOST_KEY, false)
            || NetUtils.isInvalidLocalHost(getUrl().getHost())
            ? NetUtils.ANYHOST : getUrl().getHost();
    bindAddress = new InetSocketAddress(host, getUrl().getPort());
    this.accepts = url.getParameter(Constants.ACCEPTS_KEY, Constants.DEFAULT_ACCEPTS);
    this.idleTimeout = url.getParameter(Constants.IDLE_TIMEOUT_KEY, Constants.DEFAULT_IDLE_TIMEOUT);
    try {
        doOpen();
        if (logger.isInfoEnabled()) {
            logger.info("Start " + getClass().getSimpleName() + " bind " + getBindAddress() + ", export " + getLocalAddress());
        }
    } catch (Throwable t) {
        throw new RemotingException(url.toInetSocketAddress(), null, "Failed to bind " + getClass().getSimpleName()
                + " on " + getLocalAddress() + ", cause: " + t.getMessage(), t);
    }
    //fixme replace this with better method
    DataStore dataStore = ExtensionLoader.getExtensionLoader(DataStore.class).getDefaultExtension();
    executor = (ExecutorService) dataStore.get(Constants.EXECUTOR_SERVICE_COMPONENT_KEY, Integer.toString(url.getPort()));
}

AbstractEndpoint ==>
public AbstractEndpoint(URL url, ChannelHandler handler) {
    super(url, handler);
    this.codec = getChannelCodec(url);
    this.timeout = url.getPositiveParameter(Constants.TIMEOUT_KEY, Constants.DEFAULT_TIMEOUT);
    this.connectTimeout = url.getPositiveParameter(Constants.CONNECT_TIMEOUT_KEY, Constants.DEFAULT_CONNECT_TIMEOUT);
}
AbstractPeer==>
public AbstractPeer(URL url, ChannelHandler handler) {
    if (url == null) {
        throw new IllegalArgumentException("url == null");
    }
    if (handler == null) {
        throw new IllegalArgumentException("handler == null");
    }
    this.url = url;
    this.handler = handler;
}
  ```  
调用栈如上所示： 因为之前设置了codec为dubbo 所以返回DubboCountCodec实例 获取超时时间timeout ,和链接的超时时间connectTimeout localAddress为本地IP:PORT  port为服务暴露的端口 host 为0.0.0.0 bindAddress为 host:port port为服务暴露的端口 this.accept 为默认获取最大连接数 idleTimeout为 url中 idle.timeout 核心代码：doOpen() 
 ```java 
  @Override
protected void doOpen() throws Throwable {
    NettyHelper.setNettyLoggerFactory();
    ExecutorService boss = Executors.newCachedThreadPool(new NamedThreadFactory("NettyServerBoss", true));
    ExecutorService worker = Executors.newCachedThreadPool(new NamedThreadFactory("NettyServerWorker", true));
    ChannelFactory channelFactory = new NioServerSocketChannelFactory(boss, worker, getUrl().getPositiveParameter(Constants.IO_THREADS_KEY, Constants.DEFAULT_IO_THREADS));
    bootstrap = new ServerBootstrap(channelFactory);

    final NettyHandler nettyHandler = new NettyHandler(getUrl(), this);
    channels = nettyHandler.getChannels();
    // https://issues.jboss.org/browse/NETTY-365
    // https://issues.jboss.org/browse/NETTY-379
    // final Timer timer = new HashedWheelTimer(new NamedThreadFactory("NettyIdleTimer", true));
    bootstrap.setPipelineFactory(new ChannelPipelineFactory() {
        public ChannelPipeline getPipeline() {
            NettyCodecAdapter adapter = new NettyCodecAdapter(getCodec(), getUrl(), NettyServer.this);
            ChannelPipeline pipeline = Channels.pipeline();
            /*int idleTimeout = getIdleTimeout();
            if (idleTimeout > 10000) {
                pipeline.addLast("timer", new IdleStateHandler(timer, idleTimeout / 1000, 0, 0));
            }*/
            pipeline.addLast("decoder", adapter.getDecoder());
            pipeline.addLast("encoder", adapter.getEncoder());
            pipeline.addLast("handler", nettyHandler);
            return pipeline;
        }
    });
    // bind
    channel = bootstrap.bind(getBindAddress());
}

  ```  
1.首先进行Netty的日志配置 接下来先生成 NettyCodecAdapter 入参为之前生成的codec , URL信息(主要用到buffer属性配置Netty缓冲区)及 this (Handler) 对象 接下来就是设置Netty的Encoder Decoder 来进行数据的编码与解码 其会调用 this的handler链来进行数据处理。Dubbo2.5.6采用的是Netty3来进行通讯的，此处就不进行赘述。 
AbstractServer 接下来获取到从DataStore对象中获取之前缓存的线程池 ，设置 NettyServer的 executor属性。 
自此，Dubbo服务暴露的代码解析完毕，NettyServer的类结构图如下： 
![Test](https://oscimg.oschina.net/oscnet/b3ce042b0cdf415c14b4721241a95d72154.jpg  'Dubbo服务发布之服务暴露&心跳机制&服务注册') 
 
#### 心跳服务 
Dubbo provider的心跳服务是 HeaderExchanger bind代码执行的最后一步：参数是上面生成的Server对象 (NettyServer)。 
![Test](https://oscimg.oschina.net/oscnet/b3ce042b0cdf415c14b4721241a95d72154.jpg  'Dubbo服务发布之服务暴露&心跳机制&服务注册') 
 ```java 
  public HeaderExchangeServer(Server server) {
    if (server == null) {
        throw new IllegalArgumentException("server == null");
    }
    this.server = server;
    this.heartbeat = server.getUrl().getParameter(Constants.HEARTBEAT_KEY, 0);
    this.heartbeatTimeout = server.getUrl().getParameter(Constants.HEARTBEAT_TIMEOUT_KEY, heartbeat * 3);
    if (heartbeatTimeout < heartbeat * 2) {
        throw new IllegalStateException("heartbeatTimeout < heartbeatInterval * 2");
    }
    startHeatbeatTimer();
}
  ```  
1.初始化 server信息 2.获取server URL中heartbeat信息 及心跳超时信息，默认为heartbeat的三倍 3.执行心跳代码 startHeatbeatTimer() 
 ```java 
  private void startHeatbeatTimer() {
    stopHeartbeatTimer();
    if (heartbeat > 0) {
        heatbeatTimer = scheduled.scheduleWithFixedDelay(
                new HeartBeatTask(new HeartBeatTask.ChannelProvider() {
                    public Collection<Channel> getChannels() {
                        return Collections.unmodifiableCollection(
                                HeaderExchangeServer.this.getChannels());
                    }
                }, heartbeat, heartbeatTimeout),
                heartbeat, heartbeat, TimeUnit.MILLISECONDS);
    }
}
  ```  
1.停止定时任务——首先停止定时器中所有任务，置空 beatbeatTimer； 2.重新设置定时器 ， ���环��测 
接下来在DubboProtocol的openServer(URL) 方法中将创建的ExchangeServer对象放入 DubboProtocol的 serverMap 集合对象中  key为服务的ip:port 如 192.168.20.218:20880 value为之前创建的ExchangeServer对象 
DubboProtocol export方法到此执行完毕，最终返回的是 DubboExporter对象包装了入参的invoker对象，serviceKey信息，及服务暴露的 exporterMap对象。 
![Test](https://oscimg.oschina.net/oscnet/b3ce042b0cdf415c14b4721241a95d72154.jpg  'Dubbo服务发布之服务暴露&心跳机制&服务注册') 
![Test](https://oscimg.oschina.net/oscnet/b3ce042b0cdf415c14b4721241a95d72154.jpg  'Dubbo服务发布之服务暴露&心跳机制&服务注册') 
 
#### 服务注册 
我们接着来看RegistryProtocol 接下来的执行代码： 
 ```java 
  public <T> Exporter<T> export(final Invoker<T> originInvoker) throws RpcException {
    // 暴露服务
    //export invoker
    final ExporterChangeableWrapper<T> exporter = doLocalExport(originInvoker);

    //registry provider 添加定时任务  ping request response
    final Registry registry = getRegistry(originInvoker);
    // 获得服务提供者 URL
    final URL registedProviderUrl = getRegistedProviderUrl(originInvoker);

    registry.register(registedProviderUrl);
    // 订阅override数据
    // FIXME 提供者订阅时，会影响同一JVM即暴露服务，又引用同一服务的的场景，因为subscribed以服务名为缓存的key，导致订阅信息覆盖。
    final URL overrideSubscribeUrl = getSubscribedOverrideUrl(registedProviderUrl);
    final OverrideListener overrideSubscribeListener = new OverrideListener(overrideSubscribeUrl, originInvoker);
    overrideListeners.put(overrideSubscribeUrl, overrideSubscribeListener);
    registry.subscribe(overrideSubscribeUrl, overrideSubscribeListener);
    //保证每次export都返回一个新的exporter实例
    return new Exporter<T>() {
        public Invoker<T> getInvoker() {
            return exporter.getInvoker();
        }

        public void unexport() {
            try {
                exporter.unexport();
            } catch (Throwable t) {
                logger.warn(t.getMessage(), t);
            }
            try {
                registry.unregister(registedProviderUrl);
            } catch (Throwable t) {
                logger.warn(t.getMessage(), t);
            }
            try {
                overrideListeners.remove(overrideSubscribeUrl);
                registry.unsubscribe(overrideSubscribeUrl, overrideSubscribeListener);
            } catch (Throwable t) {
                logger.warn(t.getMessage(), t);
            }
        }
    };
}
  ```  
1.ExporterChangeableWrapper<T> doLocalExport(final Invoker<T> originInvoker) 为暴露服务的执行过程，上面流程已经走过。 返回的数据格式如下： ![Test](https://oscimg.oschina.net/oscnet/b3ce042b0cdf415c14b4721241a95d72154.jpg  'Dubbo服务发布之服务暴露&心跳机制&服务注册') 
2.根据originInvoker中注册中心信息获取对应的Registry对象,因为这里是zookeeper协议，所以为ZookeeperRegistry对象 3.从注册中心的URL中获得 export 参数对应的值，即服务提供者的URL. 4.registry.register(registedProviderUrl); 用之前创建的注册中心对象注册服务 5.   
// TODO  
  
上面提到 Registry getRegistry(final Invoker<?> originInvoker) 是根据invoker的地址获取registry实例代码如下： 
 ```java 
  private Registry getRegistry(final Invoker<?> originInvoker) {
    // registry://127.0.0.1:2181/com.alibaba.dubbo.registry.RegistryService?application=demo-provider&dubbo=2.0.0&export=dubbo%3A%2F%2F192.168.20.218%3A20880%2Fcom.alibaba.dubbo.demo.DemoService%3Fanyhost%3Dtrue%26application%3Ddemo-provider%26default.accepts%3D1000%26default.threadpool%3Dfixed%26default.threads%3D100%26default.timeout%3D5000%26dubbo%3D2.0.0%26generic%3Dfalse%26interface%3Dcom.alibaba.dubbo.demo.DemoService%26methods%3DsayHello%26owner%3Duce%26pid%3D12028%26side%3Dprovider%26timestamp%3D1531912729429&owner=uce&pid=12028&registry=zookeeper&timestamp=1531912729343
    URL registryUrl = originInvoker.getUrl();
    if (Constants.REGISTRY_PROTOCOL.equals(registryUrl.getProtocol())) {
        String protocol = registryUrl.getParameter(Constants.REGISTRY_KEY, Constants.DEFAULT_DIRECTORY);
        registryUrl = registryUrl.setProtocol(protocol).removeParameter(Constants.REGISTRY_KEY);
    }
    // zookeeper://127.0.0.1:2181/com.alibaba.dubbo.registry.RegistryService?application=demo-provider&dubbo=2.0.0&export=dubbo%3A%2F%2F192.168.20.218%3A20880%2Fcom.alibaba.dubbo.demo.DemoService%3Fanyhost%3Dtrue%26application%3Ddemo-provider%26default.accepts%3D1000%26default.threadpool%3Dfixed%26default.threads%3D100%26default.timeout%3D5000%26dubbo%3D2.0.0%26generic%3Dfalse%26interface%3Dcom.alibaba.dubbo.demo.DemoService%26methods%3DsayHello%26owner%3Duce%26pid%3D12028%26side%3Dprovider%26timestamp%3D1531912729429&owner=uce&pid=12028&timestamp=1531912729343
    return registryFactory.getRegistry(registryUrl);
}
  ```  
上面代码的意思是： 1.获取originalInvoker中的URL信息 (注册中心的配置信息) 2.将URL中信息中Param中registry参数获取到，并替换URL中的protocol属性，并删除Param中的registry信息，上面代码中的注释为执行前和执行后的的结果。 3.获取protocol 为 zookeeper对应的RegistryFactory接口的扩展对象 ZookeeperRegistryFactory 并执行getRegistry 方法： 
![Test](https://oscimg.oschina.net/oscnet/b3ce042b0cdf415c14b4721241a95d72154.jpg  'Dubbo服务发布之服务暴露&心跳机制&服务注册') 
ZookeeperRegistryFactory的继承结构和对应类中属性如下图所示： ![Test](https://oscimg.oschina.net/oscnet/b3ce042b0cdf415c14b4721241a95d72154.jpg  'Dubbo服务发布之服务暴露&心跳机制&服务注册')其中REGISTRIES = new ConcurrentHashMap<String, Registry>(); 代表注册中心的配置，其中可以有多个注册中心配置 
AbstractRegistryFactory.getRegistry执行代码如下： 
 ```java 
  public Registry getRegistry(URL url) {
    url = url.setPath(RegistryService.class.getName())
            .addParameter(Constants.INTERFACE_KEY, RegistryService.class.getName())
            .removeParameters(Constants.EXPORT_KEY, Constants.REFER_KEY);
    String key = url.toServiceString();   // zookeeper://192.168.1.157:2181/com.alibaba.dubbo.registry.RegistryService
    // 锁定注册中心获取过程，保证注册中心单一实例
    LOCK.lock();
    try {
        Registry registry = REGISTRIES.get(key);
        if (registry != null) {
            return registry;
        }
        registry = createRegistry(url);
        if (registry == null) {
            throw new IllegalStateException("Can not create registry " + url);
        }
        REGISTRIES.put(key, registry);
        return registry;
    } finally {
        // 释放锁
        LOCK.unlock();
    }
}
  ```  
1.设置Path属性，添加interface参数信息，及移除export 和 refer 参数信息。执行结果如下： zookeeper://127.0.0.1:2181/com.alibaba.dubbo.registry.RegistryService?application=demo-provider&dubbo=2.0.0&interface=com.alibaba.dubbo.registry.RegistryService&owner=uce&pid=12028&timestamp=1531912729343 2.获取url对应的serviceString信息：zookeeper://127.0.0.1:2181/com.alibaba.dubbo.registry.RegistryService，由于我使用的是本地的zookeeper 所以IP为 127.0.0.1 3.顺序地创建注册中心：Registry ZookeeperRegistryFactory.createRegistry(URL url); 
 ```java 
  public Registry createRegistry(URL url) {
    return new ZookeeperRegistry(url, zookeeperTransporter);
}
// 构造ZookeeperRegistry的调用链如下所示
public ZookeeperRegistry(URL url, ZookeeperTransporter zookeeperTransporter) {
    super(url);
    if (url.isAnyHost()) {
        throw new IllegalStateException("registry address == null");
    }
    String group = url.getParameter(Constants.GROUP_KEY, DEFAULT_ROOT);
    if (!group.startsWith(Constants.PATH_SEPARATOR)) {
        group = Constants.PATH_SEPARATOR + group;
    }
    this.root = group;
    zkClient = zookeeperTransporter.connect(url);
    zkClient.addStateListener(new StateListener() {
        public void stateChanged(int state) {
            if (state == RECONNECTED) {
                try {
                    recover();
                } catch (Exception e) {
                    logger.error(e.getMessage(), e);
                }
            }
        }
    });
}
public FailbackRegistry(URL url) {
    super(url);
    int retryPeriod = url.getParameter(Constants.REGISTRY_RETRY_PERIOD_KEY, Constants.DEFAULT_REGISTRY_RETRY_PERIOD);
    this.retryFuture = retryExecutor.scheduleWithFixedDelay(new Runnable() {
        public void run() {
            // 检测并连接注册中心
            try {
                retry();
            } catch (Throwable t) { // 防御性容错
                logger.error("Unexpected error occur at failed retry, cause: " + t.getMessage(), t);
            }
        }
    }, retryPeriod, retryPeriod, TimeUnit.MILLISECONDS);
}
public AbstractRegistry(URL url) {
    setUrl(url);
    // 启动文件保存定时器
    syncSaveFile = url.getParameter(Constants.REGISTRY_FILESAVE_SYNC_KEY, false);
    String filename = url.getParameter(Constants.FILE_KEY, System.getProperty("user.home") + "/.dubbo/dubbo-registry-" + url.getHost() + ".cache");
    File file = null;
    if (ConfigUtils.isNotEmpty(filename)) {
        file = new File(filename);
        if (!file.exists() && file.getParentFile() != null && !file.getParentFile().exists()) {
            if (!file.getParentFile().mkdirs()) {
                throw new IllegalArgumentException("Invalid registry store file " + file + ", cause: Failed to create directory " + file.getParentFile() + "!");
            }
        }
    }
    this.file = file;
    loadProperties();
    notify(url.getBackupUrls());
}
  ```  
ZookeeperRegistry 的类继承结构图如图所示： 
![Test](https://oscimg.oschina.net/oscnet/b3ce042b0cdf415c14b4721241a95d72154.jpg  'Dubbo服务发布之服务暴露&心跳机制&服务注册') ZooKeeperRegistry.FailbackRegistry.AbstractRegistry中 1.setUrl设置url属性信息 2.是否启用文件的异步保存 3.注册中心对应的本地文件保存的位置信息：如C:\Users\Administrator/.dubbo/dubbo-registry-127.0.0.1.cache 4.给file赋值 并且加载文件信息到properties属性中 5.notify(url.getBackupUrls) 这段代码不知道什么意思。 
ZooKeeperRegistry.FailbackRegistry中 1.获取定时任务的时间间隔。 2.开启定时任务定时检测失败的注册，并重新注册。 
ZooKeeperRegistry 中 1.获取注册中心的group参数 ，默认为/dubbo , 并未root赋予group值 2.zkClient = zookeeperTransporter.connect(url); 链接zookeeper信息并添加状态监听事件，具体再更文详述吧，代码如下： 
 ```java 
  public ZkclientZookeeperClient(URL url) {
    super(url);
    client = new ZkClient(url.getBackupAddress());
    client.subscribeStateChanges(new IZkStateListener() {
        @Override
        public void handleStateChanged(KeeperState state) throws Exception {
            ZkclientZookeeperClient.this.state = state;
            if (state == KeeperState.Disconnected) {
                stateChanged(StateListener.DISCONNECTED);
            } else if (state == KeeperState.SyncConnected) {
                stateChanged(StateListener.CONNECTED);
            }
        }

        @Override
        public void handleNewSession() throws Exception {
            stateChanged(StateListener.RECONNECTED);
        }
    });
}
  ```  
3.添加重连状态的状态监听事件 调用 recover()方法。 至此 ZookeeperRegistry创建完毕。 
ZookeeperRegistryFactory中最后将registry放入 ZookeeperRegistryFactory.REGISTRIES中  key 为zookeeper://127.0.0.1:2181/com.alibaba.dubbo.registry.RegistryService value 为之前创建的ZookeeperRegistry对象。 
接着返回RegistryProtocol 的export方法 ， 1.上面说到了调用doLocalExport(originInvoker);进行服务暴露的过程及调用getRegistry(originInvoker)方法通过ZookeeperRegistryFactory 工厂生成 ZookeeperRegistry 方法，然后加入到工厂REGISTRIES 缓存中，并返回ZookeeperRegistry 实例的过程。 
2.接下来RegistryProtocol 的export方法中调用 final URL registedProviderUrl = getRegistedProviderUrl(originInvoker); 获取服务提供者的URL信息 ， 它是从注册中心的URL中获得export参数对应的值转换的URL信息。（去除掉不需要在注册中心上看到的字段） ![Test](https://oscimg.oschina.net/oscnet/b3ce042b0cdf415c14b4721241a95d72154.jpg  'Dubbo服务发布之服务暴露&心跳机制&服务注册') 
3.接下来调用registry.register(registedProviderUrl); 进行服务的注册将暴露的服务信息注册到注册中心，并且将已经注册的服务URL缓存到ZookeeperRegistry.registered 已注册服务的缓存中。 
 ```java 
  FailbackRegistry.register
/**
 * 进行服务注册逻辑的实现
 */
@Override
public void register(URL url) {
    if (destroyed.get()){
        return;
    }
    // 调用AbstractRegistry.register进行服务对应URL的缓存
    super.register(url);
    failedRegistered.remove(url);
    failedUnregistered.remove(url);
    try {
        // 向服务器端发送注册请求，将服务注册到注册中心，可以使用各个注册协议(注册中心)的实现 此处使用zookeeper  ZookeeperRegistry.doRegister
        doRegister(url);
    } catch (Exception e) {
        Throwable t = e;

        // 如果开启了启动时检测，则直接抛出异常
        boolean check = getUrl().getParameter(Constants.CHECK_KEY, true)
                && url.getParameter(Constants.CHECK_KEY, true)
                && !Constants.CONSUMER_PROTOCOL.equals(url.getProtocol());
        boolean skipFailback = t instanceof SkipFailbackWrapperException;
        if (check || skipFailback) {
            if (skipFailback) {
                t = t.getCause();
            }
            throw new IllegalStateException("Failed to register " + url + " to registry " + getUrl().getAddress() + ", cause: " + t.getMessage(), t);
        } else {
            logger.error("Failed to register " + url + ", waiting for retry, cause: " + t.getMessage(), t);
        }

        // 将失败的注册请求记录到失败列表，定时重试
        failedRegistered.add(url);
    }
}
AbstractRegistry.register
public void register(URL url) {
    if (url == null) {
        throw new IllegalArgumentException("register url == null");
    }
    if (logger.isInfoEnabled()) {
        logger.info("Register: " + url);
    }
    // 缓存已经注册的服务
    registered.add(url);
}
ZookeeperRegistry.doRegister
protected void doRegister(URL url) {
    try {
        // 此处为具体服务暴露的代码 toUrlPath 根据URL生成写入zk的路径信息
        zkClient.create(toUrlPath(url), url.getParameter(Constants.DYNAMIC_KEY, true));
    } catch (Throwable e) {
        throw new RpcException("Failed to register " + url + " to zookeeper " + getUrl() + ", cause: " + e.getMessage(), e);
    }
}
  ```  
4.由registryProviderUrl获取overrideSubscribeUrl 再构建OverrideListener   
 
#### 赞赏支持 
![Test](https://oscimg.oschina.net/oscnet/b3ce042b0cdf415c14b4721241a95d72154.jpg  'Dubbo服务发布之服务暴露&心跳机制&服务注册') 
  
  
  
 
                                        