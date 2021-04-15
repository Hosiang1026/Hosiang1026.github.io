---
title: 推荐系列-python 生产实战 跨域资源那些事儿～
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 1977
cover_picture: 'https://oscimg.oschina.net/oscnet/1aff0f76-ebc0-4c8d-b892-d4ab31979546.jpg'
abbrlink: 8a50130d
date: 2021-04-15 09:46:45
---

&emsp;&emsp;点击python编程从入门到实践，置顶 公众号重磅 python入门资料，第一时间送达 还是牛 读完需要 8 分钟 速读仅需 3 分钟 / python 生产实战 跨域资源那些事儿 / CORS 是一个 W3C 标准，全称是...
<!-- more -->

                                                                                                                                                                                         
  
 点击python编程从入门到实践，置顶 公众号重磅 python入门资料，第一时间送达 
  
 ![Test](https://oscimg.oschina.net/oscnet/1aff0f76-ebc0-4c8d-b892-d4ab31979546.jpg  'python 生产实战 跨域资源那些事儿～') 
  
   
    
     
      
       
        
         
        还是牛 
         
        
       
      
      
       
       读完需要 
       
         8 
       分钟 
       速读仅需 3 分钟 
       
      
     
    
   
  
  
   
  
 / python 生产实战 跨域资源那些事儿 / 
 CORS 是一个 W3C 标准，全称是"跨域资源共享"（Cross-origin resource sharing）。它允许浏览器向跨源服务器，发出 XMLHttpRequest 请求，从而克服了 AJAX 只能同源使用的限制。本文详细介绍 CORS 的内部机制 
 我们看一下百度百科给出的解释:CORS 是一种允许当前域（domain）的资源（比如 html/js/web service）被其他域（domain）的脚本请求访问的机制，通常由于同域安全策略（the same-origin security policy）浏览器会禁止这种跨域请求。 
 1 
  
  
 ####     
 CORS 实现两种模型 
 1.1 
  
  
 #####     
 简单模型 
 支持 get/post/put/delete 请求，例如返回 Access-Control-Allow-Origin:*,但是不允许自定义 header 且会忽略 cookies，且 post 数据格式有限制，只支持 ‘text/plain', 'application/x-www-urlencoded'and'multipart/form-data'，其中’text/plain'默认支持，后面两种需要下面的预检请求和服务器协商。 
 1.2 
  
  
 #####     
 协商模型/预检请求（Preflighted Request） 
 举例：浏览器发出 PUT 请求，OPTION 请求返回 Access-Control-Allow-Origin: 允许浏览器的脚本执行服务器返回的数据。 
 跨域资源共享标准新增了一组 HTTP 首部字段，允许服务器声明哪些源站通过浏览器有权限访问哪些资源。另外，规范要求，对那些可能对服务器数据产生副作用的 HTTP 请求方法（特别是 GET 以外的 HTTP 请求，或者搭配某些 MIME 类型的 POST 请求），浏览器必须首先使用 OPTIONS 方法发起一个预检请求（preflight request），从而获知服务端是否允许该跨域请求。服务器确认允许之后，才发起实际的 HTTP 请求。在预检请求的返回中，服务器端也可以通知客户端，是否需要携带身份凭证（包括 Cookies 和 HTTP 认证相关数据）。 
 2 
  
  
 ####     
 FastAPI 利用 CORSMiddleware 中间件来实现 CORS。 
 2.1 
  
  
 #####     
 使用 CORSMiddleware 
 我们通过以下流程在 FastAPI 应用中使用 CORSMiddleware1、导入 CORSMiddleware2、创建允许的 origins 列表3、在应用中引入 CORSMiddleware 中间件4、鉴权信息(Authorization headers, Cookies 等)5、支持的 HTTP 方法(POST，GET，或者所有"") 
  
   
 ```java 
  from fastapi import FastAPI
  ``` 
  
 ```java 
  from fastapi.middleware.cors import CORSMiddleware
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
  app = FastAPI()
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
  origins = [
  ``` 
  
 ```java 
      "http://127.0.0.1",
  ``` 
  
 ```java 
      "https://www.baidu.com",
  ``` 
  
 ```java 
      "https://www.hao123.com",
  ``` 
  
 ```java 
      "http://localhost:8080",
  ``` 
  
 ```java 
  ]
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
  app.add_middleware(
  ``` 
  
 ```java 
      CORSMiddleware,
  ``` 
  
 ```java 
      allow_origins=origins,
  ``` 
  
 ```java 
      allow_credentials=True,
  ``` 
  
 ```java 
      allow_methods=["*"],
  ``` 
  
 ```java 
      allow_headers=["*"],
  ``` 
  
 ```java 
  )
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
  @app.get("/")
  ``` 
  
 ```java 
  async def main():
  ``` 
  
 ```java 
      return {"message": "Hello World,"}
  ``` 
  
 ```java 
  
  ``` 
  
  
  
 2.2 
  
  
 #####     
 CORSMiddleware 解析 
 CORSMiddleware 的参数默认值是受限制的，为了在跨域访问中支持相应的功能，我们应当显示指定具体参数的的信息。CORSMiddleware 支持参数信息如下：1、allow_origins：允许跨域请求的域名列表，例如 ['https://example.org ', 'https://www.example.org'] 或者 ['']2、allow_origin_regex：允许允许跨域请求的域名正则表达式，例如 'https://..example.org'3、allow_methods：允许跨域请求的 HTTP 方法列表，默认为['GET']，[''] 表示允许所有 HTTP 方法 
 4、allow_headers：跨域请求支持的 HTTP 头信息列表。['']表示允许所有头信息。Accept, Accept-Language, Content-Language 和 Content-Type 头信息默认全都支持 
 5、allow_credentials：表示在跨域请求时是否支持 cookie，默认为 False 
 6、expose_headers：表示对浏览器可见的返回结果头信息，默认为[]7、max_age：浏览器缓存 CORS 返回结果的最大时长，默认为 600 (单位秒) 
 3 
  
  
 ####     
 请求种类 
 浏览器将 CORS 请求分成两类：简单请求(Simple requests)和非简单请求，也叫预检请求(CORS preflight requests)。 
 3.1 
  
  
 #####     
 简单请求与非简单请求界定 
 只要同时满足以下两大条件，就属于简单请求。 
 1.请求方法是以下三种方法之一：HEAD、GET 、POST 
 2.HTTP 的头信息不超出以下几种字段：AcceptAccept-LanguageContent-LanguageLast-Event-IDContent-Type：只限于三个值 application/x-www-form-urlencoded、multipart/form-data、text/plain 凡是不同时满足上面两个条件，就属于非简单请求。 
 3.2 
  
  
 #####     
 浏览区处理两种请求的区别 
 1、简单请求对于简单请求，浏览器直接发出 CORS 请求。具体来说，就是在头信息之中，增加一个 Origin 字段。Origin 字段用来说明，本次请求来自哪个源（协议 + 域名 + 端口）。服务器根据这个值，决定是否同意这次请求。在这种情况下，中间件会正常传递请求信息，但会在返回结果中包含恰当的 CORS 头信息。 
 2、预检请求非简单请求是那种对服务器有特殊要求的请求，比如请求方法是 PUT 或DELETE ，或者 Content-Type 字段的类型是 application/json。 
 非简单请求的 CORS 请求，会在正式通信之前，增加一次 HTTP 查询请求，称为"预检"请求（preflight）。 
 浏览器先询问服务器，当前网页所在的域名是否在服务器的许可名单之中，以及可以使用哪些 HTTP 方法和头信息字段。只有得到肯定答复，浏览器才会发出正式的请求，否则就报错。 
 "预检"请求用的请求方法是 OPTIONS，表示这个请求是用来询问的。头信息里面，关键字段是 Origin，表示请求来自哪个源。 
 除了 Origin 字段，"预检"请求的头信息包括两个特殊字段。 
 1.Access-Control-Request-Method 该字段是必须的，用来列出浏览器的 CORS 请求会用到哪些 HTTP 方法，上例是 PUT 。 
 2.Access-Control-Request-Headers 该字段是一个逗号分隔的字符串，指定浏览器 CORS 请求会额外发送的头信息字段，上例是 X-Custom-Header。服务器收到"预检"请求以后，检查了 Origin、Access-Control-Request-Method 和 Access-Control-Request-Headers 字段以后，确认是否允许跨源请求，就可以做出回应。 
 在这种情况下，中间件会拦截请求信息并且根据是否允许跨域请求返回不同的请求结果信息。 
 4 
  
  
 ####     
 与 JSONP 的比较 
 CORS 与 JSONP 的使用目的相同，但是比 JSONP 更强大。JSONP 只支持 GET 请求，CORS 支持所有类型的 HTTP 请求。JSONP 的优势在于支持老式浏览器，以及可以向不支持 CORS 的网站请求数据。 
 5 
  
  
 ####     
 CORS 总结： 
 1.给出 CORS 的定义2.在 fastapi 中如何使用 CORSMiddleware 中间件实现 CORS3.给出 CORS 与 JSONP 的比较 
 扩展资料: 
 1.https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CORS 
  
 原创不易，只愿能帮助那些需要这些内容的同行或刚入行的小伙伴，你的每次 点赞、分享 都是我继续创作下去的动力，我希望能在推广 python 技术的道路上尽我一份力量，欢迎在评论区向我提问，我都会一一解答，记得一键三连支持一下哦！ 
  
 加入python学习交流微信群，请后台回复「入群」 
  
  
  
   
    
     
     往期推荐 
     
    
    
     
      
       
       python生产实战 python 闭包之庖丁解牛篇 
       
     
     
      
       
       大型fastapi项目实战 靠 python 中间件解决方案涨薪了 
       
     
     
      
       
       大型fastapi项目实战 高并发请求神器之aiohttp(下) 
       
     
     
      
       
       大型fastapi项目实战 高并发请求神器之aiohttp(上) [建议收藏] 
       
     
    
   
  
  
 
本文分享自微信公众号 - python编程军火库（PythonCoder1024）。如有侵权，请联系 support@oschina.cn 删除。本文参与“OSC源创计划”，欢迎正在阅读的你也加入，一起分享。
                                        