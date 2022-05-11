---
title: 推荐系列-如何使用Tomcat实现WebSocket即时通讯服务服务端
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 320
cover_picture: 'https://pic3.zhimg.com/80/v2-27e70c33cd6e3399aeaca088cedcd0b2_720w.jpg'
abbrlink: 4fa0c386
date: 2022-05-11 05:14:30
---

&emsp;&emsp;：HTTP协议是“请求-响应”模式，浏览器必须先发请求给服务器，服务器才会响应该请求。即服务器不会主动发送数据给浏览器。 本文分享自华为云社区《Tomcat支持WebSocket吗？》，作者： ...
<!-- more -->

                                                                                                                                                                                         
本文分享自华为云社区《Tomcat支持WebSocket吗？》，作者： JavaEdge 。 
HTTP协议是“请求-响应”模式，浏览器必须先发请求给服务器，服务器才会响应该请求。即服务器不会主动发送数据给浏览器。 
实时性要求高的应用，如在线游戏、股票实时报价和在线协同编辑等，浏览器需实时显示服务器的最新数据，因此出现Ajax和Comet技术： 
 
 Ajax本质还是轮询 
 Comet基于HTTP长连接做了一些hack 
 
但它们实时性不高，频繁请求也会给服务器巨大压力，也浪费网络流量和带宽。于是HTML5推出WebSocket标准，使得浏览器和服务器之间任一方都可主动发消息给对方，这样服务器有新数据时可主动推给浏览器。 
 
#### WebSocket原理 
网络上的两个程序通过一个双向链路进行通信，这个双向链路的一端称为一个Socket。一个Socket对应一个IP地址和端口号，应用程序通常通过Socket向网络发出或应答网络请求。 
Socket不是协议，是对TCP/IP协议层抽象出来的API。 
WebSocket跟HTTP协议一样，也是应用层协议。为兼容HTTP协议，它通过HTTP协议进行一次握手，握手后数据就直接从TCP层的Socket传输，与HTTP协议再无关。 
这里的握手指应用协议层，不是TCP层，握手时，TCP连接已建立。即HTTP请求里带有websocket的请求头，服务端回复也带有websocket的响应头。 
浏览器发给服务端的请求会带上跟WebSocket有关的请求头，比如Connection: Upgrade和Upgrade: websocket 
 
若服务器支持WebSocket，同样会在HTTP响应加上WebSocket相关的HTTP头部： 
 
这样WebSocket连接就建立好了。 
WebSocket的数据传输以frame形式传输，将一条消息分为几个frame，按先后顺序传输出去。为何这样设计？ 
 
 大数据的传输可以分片传输，无需考虑数据大小问题 
 和HTTP的chunk一样，可边生成数据边传输，提高传输效率 
 
 
#### Tomcat如何支持WebSocket 
 
##### WebSocket聊天室案例 
浏览器端核心代码： 
 
  
 ```java 
  var Chat = {};
Chat.socket = null;
Chat.connect = (function(host) {

    //判断当前浏览器是否支持WebSocket
    if ('WebSocket' in window) {
        // 若支持,则创建WebSocket JS类
        Chat.socket = new WebSocket(host);
    } else if ('MozWebSocket' in window) {
        Chat.socket = new MozWebSocket(host);
    } else {
        Console.log('WebSocket is not supported by this browser.');
        return;
    }

  	// 再实现几个回调方法
    // 回调函数，当和服务器的WebSocket连接建立起来后，浏览器会回调这个方法
    Chat.socket.onopen = function () {
        Console.log('Info: WebSocket connection opened.');
        document.getElementById('chat').onkeydown = function(event) {
            if (event.keyCode == 13) {
                Chat.sendMessage();
            }
        };
    };

    // 回调函数，当和服务器的WebSocket连接关闭后，浏览器会回��这个方法
    Chat.socket.onclose = function () {
        document.getElementById('chat').onkeydown = null;
        Console.log('Info: WebSocket closed.');
    };

    // 回调函数，当服务器有新消息发送到浏览器，浏览器会回调这个方法
    Chat.socket.onmessage = function (message) {
        Console.log(message.data);
    };
});
  ``` 
  
 
服务器端Tomcat实现代码： 
Tomcat端的实现类加上**@ServerEndpoint**注解，value是URL路径 
 
  
 ```java 
  @ServerEndpoint(value = "/websocket/chat")
public class ChatEndpoint {

    private static final String GUEST_PREFIX = "Guest";
 
    // 记录当前有多少个用户加入到了聊天室，它是static全局变量。为了多线程安全使用原子变量AtomicInteger
    private static final AtomicInteger connectionIds = new AtomicInteger(0);
 
    //每个用户用一个CharAnnotation实例来维护，请你注意它是一个全局的static变量，所以用到了线程安全的CopyOnWriteArraySet
    private static final Set<ChatEndpoint> connections =
            new CopyOnWriteArraySet<>();

    private final String nickname;
    private Session session;

    public ChatEndpoint() {
        nickname = GUEST_PREFIX + connectionIds.getAndIncrement();
    }

    //新连接到达时，Tomcat会创建一个Session，并回调这个函数
    @OnOpen
    public void start(Session session) {
        this.session = session;
        connections.add(this);
        String message = String.format("* %s %s", nickname, "has joined.");
        broadcast(message);
    }

    //浏览器关闭连接时，Tomcat会回调这个函数
    @OnClose
    public void end() {
        connections.remove(this);
        String message = String.format("* %s %s",
                nickname, "has disconnected.");
        broadcast(message);
    }

    //浏览器发送消息到服务器时，Tomcat会回调这个函数
    @OnMessage
    public void incoming(String message) {
        // Never trust the client
        String filteredMessage = String.format("%s: %s",
                nickname, HTMLFilter.filter(message.toString()));
        broadcast(filteredMessage);
    }

    // WebSocket连接出错时，Tomcat会回调这个函数
    @OnError
    public void onError(Throwable t) throws Throwable {
        log.error("Chat Error: " + t.toString(), t);
    }

    // 向聊天室中的每个用户广播消息
    private static void broadcast(String msg) {
        for (ChatAnnotation client : connections) {
            try {
                synchronized (client) {
                    client.session.getBasicRemote().sendText(msg);
                }
            } catch (IOException e) {
              ...
            }
        }
    }
}
  ``` 
  
 
根据Java WebSocket规范的规定，Java WebSocket应用程序由一系列的WebSocket Endpoint组成。Endpoint是一个Java对象，代表WebSocket连接的一端，就好像处理HTTP请求的Servlet一样，你可以把它看作是处理WebSocket消息的接口。 
跟Servlet不同的地方在于，Tomcat会给每一个WebSocket连接创建一个Endpoint实例。 
可以通过两种方式。 
 
#### 定义和实现Endpoint 
 
##### 编程式 
编写一个Java类继承javax.websocket.Endpoint，并实现它的onOpen、onClose和onError方法。这些方法跟Endpoint的生命周期有关，Tomcat负责管理Endpoint的生命周期并调用这些方法。并且当浏览器连接到一个Endpoint时，Tomcat会给这个连接创建一个唯一的Session（javax.websocket.Session）。Session在WebSocket连接握手成功之后创建，并在连接关闭时销毁。当触发Endpoint各个生命周期事件时，Tomcat会将当前Session作为参数传给Endpoint的回调方法，因此一个Endpoint实例对应一个Session，我们通过在Session中添加MessageHandler消息处理器来接收消息，MessageHandler中定义了onMessage方法。在这里Session的本质是对Socket的封装，Endpoint通过它与浏览器通信。 
 
##### 注解式 
实现一个业务类并给它添加WebSocket相关的注解。 
 
  
 ```java 
  @ServerEndpoint(value = "/websocket/chat")
  ``` 
  
 
注解，它表明当前业务类ChatEndpoint是个实现了WebSocket规范的Endpoint，并且注解的value值表明ChatEndpoint映射的URL是/websocket/chat。ChatEndpoint类中有@OnOpen、@OnClose、@OnError和在@OnMessage注解的方法，见名知义。 
我们只需关心具体的Endpoint实现，比如聊天室，为向所有人群发消息，ChatEndpoint在内部使用了一个全局静态的集合CopyOnWriteArraySet维护所有ChatEndpoint实例，因为每一个ChatEndpoint实例对应一个WebSocket连接，即代表了一个加入聊天室的用户。 
当某个ChatEndpoint实例收到来自浏览器的消息时，这个ChatEndpoint会向集合中其他ChatEndpoint实例背后的WebSocket连接推送消息。 
 
 Tomcat主要做了哪些事情呢？ Endpoint加载和WebSocket请求处理。 
 
 
#### WebSocket加载 
Tomcat的WebSocket加载是通过SCI，ServletContainerInitializer，是Servlet 3.0规范中定义的用来接收Web应用启动事件的接口。 
为什么要监听Servlet容器的启动事件呢？这样就有机会在Web应用启动时做一些初始化工作，比如WebSocket需要扫描和加载Endpoint类。 
将实现ServletContainerInitializer接口的类增加HandlesTypes注解，并且在注解内指定的一系列类和接口集合。比如Tomcat为了扫描和加载Endpoint而定义的SCI类如下： 
 
定义好SCI，Tomcat在启动阶段扫描类时，会将HandlesTypes注解指定的类都扫描出来，作为SCI的onStartup参数，并调用SCI#onStartup。 
WsSci#HandlesTypes注解定义了ServerEndpoint.class、ServerApplicationConfig.class和Endpoint.class，因此在Tomcat的启动阶段会将这些类的类实例（不是对象实例）传递给WsSci#onStartup。 
 
 WsSci的onStartup方法做了什么呢？ 
 
构造一个WebSocketContainer实例，你可以把WebSocketContainer理解成一个专门处理WebSocket请求的Endpoint容器。即Tomcat会把扫描到的Endpoint子类和添加了注解@ServerEndpoint的类注册到这个容器，并且该容器还维护了URL到Endpoint的映射关系，这样通过请求URL就能找到具体的Endpoint来处理WebSocket请求。 
 
#### WebSocket请求处理 
 
 Tomcat连接器的组件图 
 
 
Tomcat用ProtocolHandler组件屏蔽应用层协议的差异，ProtocolHandler两个关键组件：Endpoint和Processor。 
这里的Endpoint跟上文提到的WebSocket中的Endpoint完全是两回事，连接器中的Endpoint组件用来处理I/O通信。WebSocket本质是个应用层协议，不能用HttpProcessor处理WebSocket请求，而要用专门Processor，在Tomcat就是UpgradeProcessor。 
因为Tomcat是将HTTP协议升级成WebSocket协议的，因为WebSocket是通过HTTP协议握手的，当WebSocket握手请求到来时，HttpProtocolHandler首先接收到这个请求，在处理这个HTTP请求时，Tomcat通过一个特殊的Filter判断该当前HTTP请求是否是一个WebSocket Upgrade请求（即包含Upgrade: websocket的HTTP头信息），如果是，则在HTTP响应里添加WebSocket相关的响应头信息，并进行协议升级。 
就是用UpgradeProtocolHandler替换当前的HttpProtocolHandler，相应的，把当前Socket的Processor替换成UpgradeProcessor，同时Tomcat会创建WebSocket Session实例和Endpoint实例，并跟当前的WebSocket连接一一对应起来。这个WebSocket连接不会立即关闭，并且在请求处理中，不再使用原有的HttpProcessor，而是用专门的UpgradeProcessor，UpgradeProcessor最终会调用相应的Endpoint实例来处理请求。 
 
Tomcat对WebSocket请求的处理没有经过Servlet容器，而是通��UpgradeProcessor组件直接把请求发到ServerEndpoint实例，并且Tomcat的WebSocket实现不需要关注具体I/O模型的细节，从而实现了与具体I/O方式的解耦。 
 
#### 总结 
WebSocket技术实现了Tomcat与浏览器的双向通信，Tomcat可以主动向浏览器推送数据，可以用来实现对数据实时性要求比较高的应用。这需要浏览器和Web服务器同时支持WebSocket标准，Tomcat启动时通过SCI技术来扫描和加载WebSocket的处理类ServerEndpoint，并且建立起了URL到ServerEndpoint的映射关系。 
当第一个WebSocket请求到达时，Tomcat将HTTP协议升级成WebSocket协议，并将该Socket连接的Processor替换成UpgradeProcessor。这个Socket不会立即关闭，对接下来的请求，Tomcat通过UpgradeProcessor直接调用相应的ServerEndpoint来处理。 
还可以通过Spring来实现WebSocket应用。 
  
点击关注，第一时间了解华为云新鲜技术~
                                        