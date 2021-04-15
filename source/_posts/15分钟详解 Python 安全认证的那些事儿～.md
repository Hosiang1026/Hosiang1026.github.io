---
title: 推荐系列-15分钟详解 Python 安全认证的那些事儿～
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 852
cover_picture: 'https://oscimg.oschina.net/oscnet/df64a9c2-8ff3-476f-82dc-31f6d000287e.jpg'
abbrlink: '81793302'
date: 2021-04-15 09:53:06
---

&emsp;&emsp; python 生产实战 安全认证的那些事儿 / 系统安全可能往往是被大家所...
<!-- more -->
  
 ![Test](https://oscimg.oschina.net/oscnet/df64a9c2-8ff3-476f-82dc-31f6d000287e.jpg  '15分钟详解 Python 安全认证的那些事儿～') 
  
   
    
     
      
       
        
         
                                     还是牛 
         
        
       
      
      
       
       读完需要 
       
         14 
       分钟 
       速读仅需 5 分钟 
       
      
     
    
   
  
  
   
  
 / python 生产实战 安全认证的那些事儿 / 
 系统安全可能往往是被大家所忽略的，我们的很多系统说是在互联网上"裸奔"一点都不夸张，很容易受到攻击，系统安全其实是一个复杂且庞大的话题，若要详细讲来估计用几本书的篇幅都讲不完，基于此本篇及下一篇会着重讲解在我们开发系统过程中遇到的一些安全校验机制，希望能起到抛砖引玉的作用，望各位在开发过程中多多思考不要只局限于功能实现上，共勉～ 
 在系统安全、身份验证以及权限授权方面通常来说有各种各样的处理方式，但大多都比较复杂。在很多框架和系统里，涉及安全和身份验证的工作往往都比较繁琐，并且代码量也巨大，基于此也出现了一些相关的协议和相关库 我们今天就一起来了解一下相关的内容 
 1 
  
  
 ####     
 常见认证规范/协议 
 1.1 
  
  
 #####     
 OAuth2 
 OAuth2 是一种协议规范，定义了几种用来身份验证和权限授权的处理方式。它是一种可扩展的协议规范，涵盖了几种复杂的使用场景。并且包含了基于第三方身份验证的处理方法。我们常见的"使用微信登陆"、"使用 QQ 登陆"等第三方登陆方式的底层技术就是基于 OAuth2 实现的。 
 1.2 
  
  
 #####     
 OpenID Connect 
 OpenIDConnect 是另一种基于 OAuth2 的协议规范。它扩展了 OAuth2 的部分功能，让以前相对模糊的功能变得可操作性更强。常见的 Google 登陆就是基于 OpenID Connect 实现的。 
 1.3 
  
  
 #####     
 OpenAPI 
 OpenAPI 是一套构建 API 的开放标准。FastAPI 是基于 OpenAPI 构建而成。 
 OpenAPI 支持以下几种安全机制: 
 1.apiKey:应用指定的 key 来自于 
 (1) 查询参数(2) header 信息(3) cookie 信息 
 2.http：支持标准的 http 身份验证系统，包括： 
 bearer：头信息 Authorization 的内容中带有 Bearer 和 token 信息，继承自 OAuth2HTTP 基本认证HTTP 摘要认证 
 3.oauth2 
 4.openIdConnect 
 FastAPI 通过引入 fastapi.security 模块，可以支持以上所有安全机制，并且简化了使用方法。 
 2 
  
  
 ####     
 JWT 
 2.1 
  
  
 #####     
 JWT 的概念 
 JSON Web Token（JWT）是一个非常轻巧的规范。这个规范允许我们使用 JWT 在用户和服务器之间传递安全可靠的信息。 
 2.2 
  
  
 #####     
 JWT 的组成 
 一个 JWT 实际上就是一个字符串，它由三部分组成：头部、载荷与签名。将这三段信息文本用.链接一起就构成了 Jwt 字符串。就像这样:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ 
 头部（Header） 
 JWT 的头部承载两部分信息:1、声明类型，这里是 jwt2、声明加密的算法，通常直接使用 HMAC SHA256我们使用 base64 解析一下 eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9 这个子串 可以得到: 
  
   
 ```java 
  {
  ``` 
  
 ```java 
    "typ": "JWT",
  ``` 
  
 ```java 
    "alg": "HS256"
  ``` 
  
 ```java 
  }
  ``` 
  
  
 可以看出: 在头部指明了签名算法是 HS256 算法。 
 2.3 
  
  
 #####     
 载荷（Payload） 
 载荷就是存放有效信息的地方。这些有效信息包含三个部分1、标准中注册的声明2、公共的声明3、私有的声明 
 标准中注册的声明 (建议但不强制使用) ：1、iss(Issuer): 签发人2、sub(Subject): 主题3、aud(Audience): 受众4、exp(Expiration Time): 过期时间，这个过期时间必须要大于签发时间5、nbf(Not Before): 生效时间6、iat(Issued At): 签发时间7、jti(JWT ID) : JWT 的唯一身份标识，主要用来作为一次性 token，从而回避重放攻击。 
 公共的声明：公共的声明可以添加任何的信息，一般添加用户的相关信息或其他业务需要的必要信息。但不建议添加敏感信息，因为该部分在客户端可解密。 
 私有的声明：私有声明是提供者和消费者所共同定义的声明，一般不建议存放敏感信息，因为 base64 是对称解密的，意味着该部分信息可以归类为明文信息。 
 我们使用 base64 解析一下 eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9 就可以得到 之前定义的一个 payload: 
  
   
 ```java 
  {
  ``` 
  
 ```java 
    "sub": "1234567890",
  ``` 
  
 ```java 
    "name": "John Doe",
  ``` 
  
 ```java 
    "admin": true
  ``` 
  
 ```java 
  }
  ``` 
  
  
  
 2.4 
  
  
 #####     
 签名（Signature） 
 JWT 的第三部分是一个签证信息，这个签证信息由三部分组成：1、header (base64 后的)2、payload (base64 后的)3、secret 
 这个部分需要 base64 加密后的 header 和 base64 加密后的 payload 使用.连接组成的字符串，然后通过 header 中声明的加密方式进行加盐 secret 组合加密，然后就构成了 JWT 的第三部分。 
  
   
 ```java 
  Signature = HMACSHA256(base64UrlEncode(header) + "." +  base64UrlEncode(payload), secret)；
  ``` 
  
 ```java 
  Token = base64(头部).base64(载荷).Signature
  ``` 
  
  
 注意:secret 是保存在服务器端的，在任何场景都不应该流露出去。 
 2.5 
  
  
 #####     
 使用 
 在请求头 headers 中加入 Authorization，并加上 Bearer 标注headers = {...'Authorization': 'Bearer ' + token...} 
 3 
  
  
 ####     
 基于 JWT 的 Token 的认证过程 
 3.1 
  
  
 #####     
 登陆认证过程 
 1.第一次认证：第一次登录，用户从浏览器输入用户名/密码，提交后到服务器的登录处理的 Action 层（Login Action）2.Login Action 调用认证服务进行用户名密码认证，如果认证通过，LoginAction 层调用用户信息服务获取用户信息（包括完整的用户信息及对应权限信息）3.返回用户信息后，Login Action 从配置文件中获取 Token 签名生成的秘钥信息，进行 Token 的生成4.生成 Token 的过程中可以调用第三方的 JWT Lib 生成签名后的 JWT 数据5.完成 JWT 数据签名后，将其设置到 COOKIE 对象中，并重定向到首页，完成登录过程 
 我们再通过完整的图来看一下登陆的整个认证过程： 
 ![Test](https://oscimg.oschina.net/oscnet/df64a9c2-8ff3-476f-82dc-31f6d000287e.jpg  '15分钟详解 Python 安全认证的那些事儿～') 
  
 3.2 
  
  
 #####     
 请求认证 
 1.基于 Token 的认证机制会在每一次请求中都带上完成签名的 Token 信息，这个 Token 信息可能在 COOKIE 中，也可能在 HTTP 的 Authorization 头中2.客户端（APP 客户端或浏览器）通过 GET 或 POST 请求访问资源（页面或调用 API）3.认证服务作为一个 Middleware HOOK 对请求进行拦截，首先在 COOKIE 中查找 Token 信息，如果没有找到，则在 HTTP Authorization Head 中查找4.如果找到 Token 信息，则根据配置文件中的签名加密秘钥，调用 JWT Lib 对 Token 信息进行解密和解码5.完成解码并验证签名通过后，对 Token 中的 exp、nbf、aud 等信息进行验证6.全部通过后，根据获取的用户的角色权限信息，进行对请求的资源的权限逻辑判断如果权限逻辑判断通过则通过 Response 对象返回；否则则返回 HTTP 401 
 我们再通过完整的图来看一下登陆的整个请求认证过程： 
 ![Test](https://oscimg.oschina.net/oscnet/df64a9c2-8ff3-476f-82dc-31f6d000287e.jpg  '15分钟详解 Python 安全认证的那些事儿～') 
  
 3.3 
  
  
 #####     
 基于 JWT 的 Token 认证的几点总结: 
 1.一个 Token 就是一些信息的集合，是一个字符串信息2.在 Token 中包含足够多的信息，以便在后续请求中减少查询数据库的几率3.服务端需要对 COOKIE 和 HTTP Authrorization Header 进行 Token 信息的检查4.基于上一点，可以用一套 Token 认证代码来面对浏览器类客户端和非浏览器类客户端5.因为 Token 是被签名的，所以我们可以认为一个可以解码认证通过的 Token 是由我们系统发放的，其中带的信息是合法有效的 
 4 
  
  
 ####     
 获取 Token 实战 
 在写代码之前我们先来了解一下 OAuth2PasswordBearer 这个类的功能。OAuth2PasswordBearer 是接收 URL 作为参数的一个类：客户端会向该 URL 发送 username 和 password 参数，然后得到一个 Token 值。OAuth2PasswordBearer 并不会创建相应的 URL 路径操作，只是指明了客户端用来获取 Token 的目标 URL。 
 当请求到来的时候，FastAPI 会检查请求的 Authorization 头信息，如果没有找到 Authorization 头信息，或者头信息的内容不是 Bearer Token，它会返回 401 状态码(UNAUTHORIZED)。我们再从源码上认识一下: 
  
   
 ```java 
  class OAuth2PasswordBearer(OAuth2):
  ``` 
  
 ```java 
      def __init__(
  ``` 
  
 ```java 
          self,
  ``` 
  
 ```java 
          tokenUrl: str,
  ``` 
  
 ```java 
          scheme_name: str = None,
  ``` 
  
 ```java 
          scopes: dict = None,
  ``` 
  
 ```java 
          auto_error: bool = True,
  ``` 
  
 ```java 
      ):
  ``` 
  
 ```java 
          if not scopes:
  ``` 
  
 ```java 
              scopes = {}
  ``` 
  
 ```java 
          flows = OAuthFlowsModel(password={"tokenUrl": tokenUrl, "scopes": scopes})
  ``` 
  
 ```java 
          super().__init__(flows=flows, scheme_name=scheme_name, auto_error=auto_error)
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
      async def __call__(self, request: Request) -> Optional[str]:
  ``` 
  
 ```java 
          authorization: str = request.headers.get("Authorization")
  ``` 
  
 ```java 
          scheme, param = get_authorization_scheme_param(authorization)
  ``` 
  
 ```java 
          if not authorization or scheme.lower() != "bearer":
  ``` 
  
 ```java 
          if self.auto_error:
  ``` 
  
 ```java 
                  raise HTTPException(
  ``` 
  
 ```java 
                      status_code=HTTP_401_UNAUTHORIZED,
  ``` 
  
 ```java 
                      detail="Not authenticated",
  ``` 
  
 ```java 
                      headers={"WWW-Authenticate": "Bearer"},
  ``` 
  
 ```java 
                  )
  ``` 
  
 ```java 
              else:
  ``` 
  
 ```java 
                  return None
  ``` 
  
 ```java 
          return param
  ``` 
  
 ```java 
  
  ``` 
  
  
 为了完成我们接下来的功能，需要大家进行���两个模块的安装: 
  
   
 ```java 
  pip install pyjwt
  ``` 
  
 ```java 
  pip install python-multipart
  ``` 
  
  
 简单解释一下：pyjwt 是用来产生和校验 JWT tokenpython-multipart 是因为 OAuth2 需要通过表单数据来发送 username 和 password 信息 
 在生产实践过程中，获取 token 的代码： 
  
   
 ```java 
  from datetime import datetime, timedelta
  ``` 
  
 ```java 
  from typing import Optional
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
  from fastapi import Depends, FastAPI
  ``` 
  
 ```java 
  from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
  ``` 
  
 ```java 
  import jwt
  ``` 
  
 ```java 
  from pydantic import BaseModel
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
  # to get a string like this run:
  ``` 
  
 ```java 
  # openssl rand -hex 32
  ``` 
  
 ```java 
  SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
  ``` 
  
 ```java 
  ALGORITHM = "HS256"
  ``` 
  
 ```java 
  ACCESS_TOKEN_EXPIRE_MINUTES = 30
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
  class Token(BaseModel):
  ``` 
  
 ```java 
      access_token: str
  ``` 
  
 ```java 
      token_type: str
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
  app = FastAPI()
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
  # oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token")
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
  # 生成token
  ``` 
  
 ```java 
  def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
  ``` 
  
 ```java 
      to_encode = data.copy()
  ``` 
  
 ```java 
      if expires_delta:
  ``` 
  
 ```java 
          expire = datetime.utcnow() + expires_delta
  ``` 
  
 ```java 
      else:
  ``` 
  
 ```java 
          expire = datetime.utcnow() + timedelta(minutes=15)
  ``` 
  
 ```java 
      to_encode.update({"exp": expire})
  ``` 
  
 ```java 
      encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
  ``` 
  
 ```java 
      return encoded_jwt
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
  # 请求接口
  ``` 
  
 ```java 
  @app.post("/token", response_model=Token)
  ``` 
  
 ```java 
  async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
  ``` 
  
 ```java 
      access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
  ``` 
  
 ```java 
      access_token = create_access_token(
  ``` 
  
 ```java 
          data={"sub": "test"}, expires_delta=access_token_expires
  ``` 
  
 ```java 
      )
  ``` 
  
 ```java 
  return {"access_token": access_token, "token_type": "bearer"}
  ``` 
  
 ```java 
  
  ``` 
  
  
 我们运行一下代码可以看一下效果： 
 ![Test](https://oscimg.oschina.net/oscnet/df64a9c2-8ff3-476f-82dc-31f6d000287e.jpg  '15分钟详解 Python 安全认证的那些事儿～') 
 ![Test](https://oscimg.oschina.net/oscnet/df64a9c2-8ff3-476f-82dc-31f6d000287e.jpg  '15分钟详解 Python 安全认证的那些事儿～') 
 我们对 access_token 进行一下解析来看一下每一部分的组成： 
 1. 子串"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9"的解析结果为： 
 ![Test](https://oscimg.oschina.net/oscnet/df64a9c2-8ff3-476f-82dc-31f6d000287e.jpg  '15分钟详解 Python 安全认证的那些事儿～') 
 2. 子串"eyJzdWIiOiJ0ZXN0IiwiZXhwIjoxNjE4MTExNTA4fQ"的解析结果为： 
 ![Test](https://oscimg.oschina.net/oscnet/df64a9c2-8ff3-476f-82dc-31f6d000287e.jpg  '15分钟详解 Python 安全认证的那些事儿～') 
 3.子串"pwoiwQmQZbIFVvmdlmkSPXdoHrtZyoNNTRhoWAZWU9o"的解析结果为： 
 ![Test](https://oscimg.oschina.net/oscnet/df64a9c2-8ff3-476f-82dc-31f6d000287e.jpg  '15分钟详解 Python 安全认证的那些事儿～') 
  
 5 
  
  
 ####     
 本期总结 
 1.介绍了常见的 认证规范/协议2.对 JWT 进行了深入的研究和分析3.在实际生产过程中如何产生一个有效的 Token 在代码层面进行落地4.本篇不仅可以让"守"方清楚了如何有效的制作一个 Token 来进行防御，另一方面若是做逆向的"攻"方也了解了如何进行破防，下一期我们会重点站在实践的角度去走一个登陆请求的认证的全流程 
  
 原创不易，只愿能帮助那些需要这些内容的同行或刚入行的小伙伴，你的每次 点赞、分享 都是我继续创作下去的动力，我希望能在推广 python 技术的道路上尽我一份力量，欢迎在评论区向我提问，我都会一一解答，记得一键三连支持一下哦！ 
  
 加入python学习交流微信群，请后台回复「入群」 
  
  
  
   
    
     
     往期推荐 
     
    
    
     
      
       
       python生产实战 python 闭包之庖丁解牛篇 
       
     
     
      
       
       大型fastapi项目实战 靠 python 中间件解决方案涨薪了 
       
     
     
      
       
       大型fastapi项目实战 高并发请求神器之aiohttp(下) 
       
     
     
      
       
       大型fastapi项目实战 高并发请求神器之aiohttp(上) [建议收藏] 
       
     
    
