---
title: 推荐系列-关于AJAX（你一定要知道的秘密）
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 1951
cover_picture: 'https://oscimg.oschina.net/oscnet/up-30478219a0c93d547d9d512d7b6229510cd.png'
abbrlink: 9109cfe0
date: 2021-04-15 09:46:45
---

&emsp;&emsp;简介 AJAX 是一种在无需重新加载整个网页的情况下，能够更新部分网页的技术 应用场景： 无刷新分页 短信无刷新获取 无刷新搜索 ... 不用刷新整个页面便可以与服务器通讯的方法 1. Flash 2. ...
<!-- more -->

                                                                                                                                                                                        简介 
 
 ```java 
  AJAX 是一种在无需重新加载整个网页的情况下，能够更新部分网页的技术

应用场景：
无刷新分页
短信无刷新获取
无刷新搜索
...

  ``` 
  
不用刷新整个页面便可以与服务器通讯的方法 
 
 ```java 
  1. Flash
2. Java applet
3. 框架：如果使用一组框架构造一个网页，可以只更新其中的一个框架，而不必惊动整个页面
4. 隐藏的frame
5. XMLHttpRequest：该对象是JavaScript的一个扩展，可使网页与服务器进行通信。是创建AJAX应用的最佳选择

  ``` 
  
全局刷新和局部刷新 
 
 ```java 
  全局刷新：浏览器在得到服务器端返回的数据后，只能展示得到的数据，不能同时展示浏览器之前的内容
局部刷新：浏览器在得到服务端返回的数据后，同时展示原有的数据和得到的新数据

全局刷新的工作原理：
1. 必须由浏览器负责将请求协议包推送到服务端
2. 导致服务端将响应协议包直接推送到浏览器的内存
3. 导致浏览器内存中原有的数据被覆盖
4. 导致此时浏览器在展示数据时，只能展示得到的响应数据，无法展���原有的数据

局部刷新的工作原理：
1. 必须禁止由浏览器向服务端发送请求（此时不能用超链接，from，window.location）
2. 由浏览器内存中一个脚本对象代替浏览器将请求协议包发送到服务端
3. 导致服务端返回的响应包直接推送到这个脚本对象上
4. 导致脚本对象内容被覆盖，但此时浏览器内存中绝大多数内容没有受到影响
5. 开发人员从脚本对象上取出响应数据并更新到浏览器中的指定标签上
6. 此时浏览器展示数据时，既可以展示响应结果，又可以展示原有的内容

  ``` 
  
AJAX的优缺点 
 
 ```java 
  优点：
1）页面无刷新更新数据
2）异步与服务器通信
3）前端和后端负载平衡
4）基于标准被广泛支持，不需要下载插件或者小程序
5）界面与应用分离

缺点：
1. 由JavaScript和AJAX引擎导致的浏览器的兼容（可使用JQuery封装的AJAX）
2. 页面局部刷新，导致后退等功能失效
3. 对流媒体的支持没有Flash，Java applet好
4. 一些手持设备的支持性差
5. 一些安全问题，AJAX暴露了与服务器交互的细节
6. 破坏了程序的异常机制,不容易调试

  ``` 
  
AJAX的工作原理 
 
 ```java 
  发起请求 --> AJAX处理 --> 接收结果

  ``` 
  
![Test](https://oscimg.oschina.net/oscnet/up-30478219a0c93d547d9d512d7b6229510cd.png  '关于AJAX（你一定要知道的秘密）') 
![Test](https://oscimg.oschina.net/oscnet/up-30478219a0c93d547d9d512d7b6229510cd.png  '关于AJAX（你一定要知道的秘密）') 
AJAX工具包 
 
 ```java 
  AJAX并不是一项新技术，它实际上是几种技术以一种全新的方式聚合在一起：
1. 服务器端语言：服务器需要具备向浏览器发送特定信息的能力（AJAX与服务器端语言无关）（语言可以是node，php，python等）
2. XML是一种描述数据的格式（AJAX程序需要某种格式化的格式来在服务器和客户端之间传递信息。XML是其中的一种，同样还可以选择JSON，文本等）
3. XHTML和CSS：标准化呈现
4. DOM：实现动态显示和交互
5. 使用XMLHTTP组件中的XMLHttpRequest对象对服务器进行异步数据读取
6. 使用JavaScript绑定和处理所有数据

  ``` 
  
AJAX的开发步骤 
 
 ```java 
  1. 在浏览器内存中创建一个脚本对象（异步请求对象）
2. 为异步请求对象添加工作状态监听器，来帮助开发人员确认何时从异步请求对象身上得到服务器端返回响应数据
3. 初始化异步请求对象
	1) 通知异步请求对象采用何种方式发送请求协议包（get/post）
	2) 通知异步请求对象本次要访问的资源文件地址
	3) 通知异步请求对象在其工作期间，浏览器是否会等他
4. 命令通知异步请求对象代替浏览器发送请求

1. 创建一个异步对象
	var xhr=new XMLHttpRequest();
2. 设置请求方式和请求地址
    xhr.open('get',url)
3. 发送请求
	xhr.send()
4. 监听状态的变化
   xhr.onreadystatechange=function(){
   	  if(xhr.readyState===4 && xhr.status==200){
       		 ...
    	  }
   }
5. 处理返回结果（在监听状态变化中处理）

  ``` 
  
AJAX对象的创建 
 
 ```java 
  原生JS创建AJAX对象：
对于高版本浏览器：（除IE5，IE6）
var xx=new XMLHttpRequest();

对于低版本浏览器（IE5,IE6）：
var xx=new ActiveXObject('Microsoft.XMLHTTP');  //ActiveXObject()只有IE支持

兼容写法：
function getHttpObject(){
	var xhr=false;
	if(window.XMLHttpRequest){
    	xhr=new XMLHttpRequest();
	}
	else if(window.ActiveXObject){
    	xhr=new ActiveXObject('Microsoft.XMLHTTP');
	}
	return xhr;
}

  ``` 
  
关于XMLHttpRequest对象（方法，属性，事件） 
 
 ```java 
  一些相关方法：

  ``` 
  
![Test](https://oscimg.oschina.net/oscnet/up-30478219a0c93d547d9d512d7b6229510cd.png  '关于AJAX（你一定要知道的秘密）') 
 
 ```java 
  一些相关属性：

  ``` 
  
![Test](https://oscimg.oschina.net/oscnet/up-30478219a0c93d547d9d512d7b6229510cd.png  '关于AJAX（你一定要知道的秘密）') 
 
 ```java 
  一些相关事件：

  ``` 
  
![Test](https://oscimg.oschina.net/oscnet/up-30478219a0c93d547d9d512d7b6229510cd.png  '关于AJAX（你一定要知道的秘密）') 
 
 ```java 
  （详细的方法，属性，事件可查看网址：https://blog.csdn.net/huang100qi/article/details/104125906）

  ``` 
  
AJAX发送请求 
 
 ```java 
  XMLHttpRequest实例与服务器进行通信包含3个关键部分：
1. onreadystatechange事件（由服务器触发的，每次readyState属性改变时都会触发此事件）
2. open方法：建立与服务器的连接
3. send方法：向服务器发送请求

若发送请求的方式为post，则还需要设置请求头：setRequestHeader(header,value);（否则默认的方式为options，会无法进行正常的网络请求）
要在open方法和send方法之间调用
xhr.setRequestHeader('content-type','application/x-www-form-urlencoded');  //post请求时发送请求头
并且send()中要传递参数

  ``` 
  
AJAX接收响应 
 
 ```java 
  以下属性可被服务器更改：
1. readyState：表示ajax请求当前的状态
2. status：服务器发送的状态码都保存在这个属性中
3. responseText：包含了从服务器发送的非XML数据（当readyState属性为4时，此属性才可用，表明ajax请求结束）
4. responseXML：若服务器返回的是XML数据，那么数据将存储在此属性中（只有服务器发送了带有正确首部信息的数据时，此属性才可用，MINE类型必须为text/xml）

  ``` 
  
AJAX清除缓存（针对IE） 
 
 ```java 
  可在请求地址后面加一个时间戳（或一串随机数）
如：在发送请求的函数中加上：this.href（对应地址属性）=this.href+'?date='+new Date()

  ``` 
  
JS封装ajax 
![Test](https://oscimg.oschina.net/oscnet/up-30478219a0c93d547d9d512d7b6229510cd.png  '关于AJAX（你一定要知道的秘密）') 
调用时，传入一个相关的参数对象就可以了 
关于XML 
 
 ```java 
  可扩展的标记语言
被用来传输和存储数据
而HTML是被用来显示数据

XML常用于简化数据的存储和共享，简化平台变更，可用于创建新的互联网语言

编写xml文件的基本格式：
<?xml version="1.0" encoding="UTF-8"?>  //XML 声明。它定义 XML 的版本（1.0）和所使用的编码（UTF-8 : 万国码, 可显示各种语言）
<note>  //描述文档的根元素（或者其他（可自定义））
	//一些子元素（都可自定义）
	<to>...</to>
	<from>...</from>
	<heading>...</heading>
	<body>...</body>
</note>

xml中的一些注意事项：
1. 一定要有xml声明
2. 所有的 XML 元素都必须有一个关闭标签
3. XML 标签对大小写敏感
4. XML 标签必须正确嵌套
5. XML 属性值必须加引号
6. 在 XML 中，空格会被保留（不会有空白折叠）
7. XML 以 LF 存储换行
8. XML 元素必须遵循以下命名规则：
	1) 名称可以包含字母、数字以及其他的字符
	2) 名称不能以数字或者标点符号开始
	3) 名称不能以字母 xml（或者 XML、Xml 等等）开始
	4) 名称不能包含空格
	5) 可使用任何名称，没有保留的字词。

若服务器返回的是xml数据，则ajax请求中可用responseXML()来接收数据
若PHP中需要返回xml数据，必须在PHP文件的顶部设置：header('content-type:text/xml;charset=utf-8')

接收xml数据后，提取元素里面的数据：
xx.querySelector(对应的xml元素).innerHTML;

  ``` 
  
关于JSON 
 
 ```java 
  JSON是一种简单的数据格式，比xml更轻巧，是JavaScript原生格式。意味着处理JSON数据不需要任何特殊的API或工具包
JSON格式：
{
	"名称":"值",
	...
}
或
[
	{
    	'名称':'值',
    	...
	},
	...
]

在ajax请求中，JSON会被存储在responseText属性中
为了读取存储在responseText属性中的JSON数据，可以用到JavaScript的eval语句或其他方法

将字符串转换成json的三种方式：
1. eval()
如：
function strToJson(str){ 
    	var json = eval('(' + str + ')'); 
    	return json; 
} 

2. new Function()
如：
function strToJson(str){ 
   		var json = (new Function("return " + str))(); 
    	return json; 
} 

3. JSON.parse()
如：
JSON.parse(JsonStr,[callback]);
参数1：必选，需要转换的对象
参数2：可选，对需要转换的对象过滤，可是数组和function。function提供key，value两个参数

将JSON对象转换为字符串：JSON.stringify(ojbect,filter/(array,function),indent)
参数1：必选，需要转换的对象
参数2：可选，对需要转换的对象过滤，可是数组和function。function提供key，value两个参数
参数3：可选，缩进

  ``` 
  
JQuery中的AJAX 
 
 ```java 
  JQuery对AJAX操作进行了封装（共三层）
在JQuery中最底层的方法是：$.ajax({})
第二层是load(),$.get()和$.post()
第三层是$.getScript()和$.getJSON() 

$.ajax()：通过 HTTP 请求加载远程数据
可有参数（一个JSON对象），可无参数
常用的几个参数：type，url，data，async，dataType，success，error
相关参数：

  ``` 
  
![Test](https://oscimg.oschina.net/oscnet/up-30478219a0c93d547d9d512d7b6229510cd.png  '关于AJAX（你一定要知道的秘密）') 
 
 ```java 
  load()：是JQuery中最简单和最常用的AJAX方法，能载入远程的HTML代码并插入到DOM中
load(url,[,data][,callback])
url：请求的URL地址
data：发送到服务器的key/value数据
callback：请求完成时的回调函数，无论请求失败或成功
使用：DOM（要插入数据的DOM元素）.load(...)

$.get()：使用get方式来进行异步请求
$.get(url,[,data][,callback][,type])
url：请求的URL地址
data：发送到服务器的key/value数据会作为QueryString附加到请求URL中
callback：载入成功时的回调函数（自动将请求结果和状态传递给此方法）（有三个参数：data（返回的数据内容），textstatus（请求状态），xhr（包含 XMLHttpRequest 对象））
type：服务器返回的内容格式

$.post()：通过 HTTP POST 请求向服务器提交数据
$.post(URL[,data][,callback])
URL：规定您希望请求的 URL
data：规定连同请求发送的数据（有三个参数：data（返回的数据内容），textstatus（请求状态），xhr（包含 XMLHttpRequest 对象）
callback：请求成功后所执行的函数名

$.getScript()：使用AJAX的HTTP GET请求，获取和运行 JavaScript
$(selector).getScript(url,success(response,status))
url：必需。规定将请求发送到哪个 URL。
success(response,status)：可选。规定当请求成功时运行的函数。
额外的参数：
response：包含来自请求的结果数据
status：包含请求的状态 （"success"、"notmodified"、"error"、"timeout"、"parsererror"）

$.getJSON()：使用AJAX的HTTP GET请求获取JSON数据（需要以JSON返回数据）
$(selector).getJSON(url,data,success(data,status,xhr))
url：必需。规定将请求发送到哪个 URL。
data：可选。规定发送到服务器的数据。
success(data,status,xhr)：可选。规定当请求成功时运行的函数。
额外的参数：
data：包含从服务器返回的数据
status：包含请求的状态（"success"、"notmodified"、"error"、"timeout"、"parsererror"）
xhr：包含XMLHttpRequest对象

  ``` 
  
服务器的准备 
 
 ```java 
  可安装Web服务相关软件：Apache，IIS，Tomcat，Nginx，NodeJs等
综合性的软件：WAMPServer
W：windows操作系统
A：Apache 世界排名第一的服务器软件（简单，速度快，性能稳定）
M：MySQL 开源免费的数据库软件（体积小，速度快，使用成本低）
P：PHP 超文本预处理器，直接将代码嵌入HTML文档中执行（简单易学，容易上手）

  ``` 
  
get请求和post请求 
 
 ```java 
  相同点：
都是将数据提交到远程服务器

不同点：
1. 提交数��存��的位置不同
   get请求将数据放到URL后面
   post请求将数据放到请求头中
   
2. 提交的数据大小限制不同
   get请求对数据有大小限制（一般不超过2kb，不过每个浏览器有每个的限制长度）（get的最大长度限制是因为浏览器和web服务器限制了URL的长度，而http协议并未规定限制其长度）
   每个浏览器对get请求限制的字符长度：
   1) Microsoft Internet Explorer (Browser)：
      IE浏览器对URL的最大限制为2083个字符，如果超过这个数字，提交按钮没有任何反应。
   2) Firefox (Browser)
      对于Firefox浏览器URL的长度限制为65,536个字符。
   3) Safari (Browser)
      URL最大长度限制为 80,000个字符。
   4) Opera (Browser)
      URL最大长度限制为190,000个字符。
   5) Google (chrome)
      URL最大长度限制为8182个字符。
   6) Apache (Server)
      能接受最大url长度为8,192个字符。
   7) Microsoft Internet Information Server(IIS)
      能接受最大url的长度为16,384个字符。
   post请求对数据没有大小限制
   
3. 应用场景不同
   get请求用于提交非敏感数据和小数据
   post请求用于提交敏感数据和大数据
   
4. 速度不同
   post请求比get请求慢 
   
5. 发送的数据类型
   post请求比get请求能发送更多的数据类型（GET只接受ASCII字符的参数的数据类型，而POST没有限制） 

  ``` 
  
中断ajax的方法 
 
 ```java 
  若一个ajax请求长时间得不到响应，则需要中断此次ajax请求
方法：可加上一个定时器，并在规定的时间利用abort方法中断请求
if(规定的时间)
{
	timer（定时器名）=setInterval(function(){
   		xhr（异步对象）.abort();  //中断ajax请求
    	clearInterval(timer);
	}, 规定的时间)
}

  ``` 
  
解决url尾部不能拼接中文的问题 
 
 ```java 
  可利用方法：encodeURIComponent(uri) 
参数：uri：一个字符串，含有 URI 组件或其他要编码的文本
该方法可把字符串作为 URI 组件进行编码，可对中文进行相应的编码，随后拼接到URL中
该方法不会对 ASCII 字母和数字进行编码，也不会对这些 ASCII 标点符号进行编码： - _ . ! ~ * ' ( ) 

  ``` 
  
关于AJAX的跨域问题 
 
 ```java 
  只有协议+主机名+端口号 (如存在)相同，则允许相互访问。也就是说JavaScript只能访问和操作自己域下的资源，不能访问和操作其他域下的资源
跨域问题是针对JS和ajax的

不能跨域时，控制台会有这样的报错：

  ``` 
  
![Test](https://oscimg.oschina.net/oscnet/up-30478219a0c93d547d9d512d7b6229510cd.png  '关于AJAX（你一定要知道的秘密）') 
 
 ```java 
  会发生跨域和不会发生跨域的情况：

  ``` 
  
![Test](https://oscimg.oschina.net/oscnet/up-30478219a0c93d547d9d512d7b6229510cd.png  '关于AJAX（你一定要知道的秘密）') 
 
 ```java 
  4种解决方法：
1. 响应头添加Header允许访问
2. jsonp 只支持get请求不支持post请求
3. httpClient内部转发
4. 使用接口网关——nginx、springcloud zuul   (互联网公司常规解决方案)

详细方法可查看网址：	https://blog.csdn.net/itcats_cn/article/details/82318092

  ``` 
  
AJAX---解决中文乱码的问题 
 
 ```java 
  出现乱码的原因：
1) 请求数据中包含中文，服务器端程序接受错误导致乱码
2) 响应数据中包含中文，编码设置错误导致浏览器中看到的结果是乱码

解决第一种原因：
保证页面端定义的charset和http响应头的Content-Type中定义的charset一致即可。
特例：IE6中XMLHttpRequest对象在页面端和http响应头的Content-Type中定义的charset都为GB2312时，中文响应数据出现乱码。解决办法：
1) http响应头的Content-Type中charset设置为utf-8
2) 仅仅使用”MSXML2.XMLHTTP”,”Microsoft.XMLHTTP”这两个中的一个来创建XMLHttpRequest对象

解决第二种原因：
分别从页面端和服务器端着���：
1) 页面端：利用javascript中的encodeURI进行两次编码处理
2) 服务器端：获取到的请求数据通过URLDecode类的decode方法按照utf-8的方式进行decode解码处理。

服务器传送给浏览器数据发生乱码：response设置编码的时候和浏览器页面的编码一致便可以解决
浏览器传送给服务器数据发生乱码：如果是post方式，request设置编码便可以解决。
                          如果是get方式，Tomcat下，使用ISO8859-1编码得到原本的二进制数组，再使用UTF-8编码便可以解决

以上处理都在XMLHttpRequest对象中编写解决

  ``` 
 
                                        