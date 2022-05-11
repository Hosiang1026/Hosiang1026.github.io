---
title: 推荐系列-Go 项目配置文件的定义和读取
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 219
cover_picture: 'https://api.ixiaowai.cn/gqapi/gqapi.php'
abbrlink: e1e166bd
date: 2022-05-11 05:12:46
---

&emsp;&emsp; 我们在写应用时，基本都会用到配置文件，从各种 shell 到 nginx 等，都有自己的配置文件。虽然这没有太多难度，但是配置项一般相对比较繁杂，解析、校验也会比较麻烦。本文就给大家讲讲...
<!-- more -->

                                                                                                                                                                                        #### 前言 
我们在写应用时，基本都会用到配置文件，从各种  
 ```java 
  shell
  ``` 
  到  
 ```java 
  nginx
  ``` 
  等，都有自己的配置文件。虽然这没有太多难度，但是配置项一般相对比较繁杂，解析、校验也会比较麻烦。本文就给大家讲讲我们是怎么简化配置文件的定义和解析的。 
#### 场景 
如果我们要写一个  
 ```java 
  Restful API
  ``` 
  的服务，配置项大概有如下内容： 
 
  
 ```java 
  Host
  ``` 
 ，侦听的  
 ```java 
  IP
  ``` 
 ，如果不填，默认用  
 ```java 
  0.0.0.0
  ``` 
  
  
 ```java 
  Port
  ``` 
 ，侦听的端口，必填，只能是数字，大于等于80，小于65535 
  
 ```java 
  LogMode
  ``` 
 ，日志模式，只能选  
 ```java 
  file
  ``` 
  或者  
 ```java 
  console
  ``` 
  
  
 ```java 
  Verbose
  ``` 
 ，看是否输出详细日志，可选，默认为  
 ```java 
  false
  ``` 
  
  
 ```java 
  MaxConns
  ``` 
 ，允许的最大并发连接数，默认  
 ```java 
  10000
  ``` 
  
  
 ```java 
  Timeout
  ``` 
 ，超时设置，默认  
 ```java 
  3s
  ``` 
  
  
 ```java 
  CpuThreshold
  ``` 
 ，设置  
 ```java 
  CPU
  ``` 
  使用率触发系统降载的阈值，默认  
 ```java 
  900
  ``` 
 ， 
 ```java 
  1000m
  ``` 
  表示  
 ```java 
  100%
  ``` 
  
 
之前我们用  
 ```java 
  json
  ``` 
  做配置文件，但是  
 ```java 
  json
  ``` 
  有个问题，无法加注释，所以我们后来切换到了  
 ```java 
  yaml
  ``` 
  格式。 
接下来让我们看看借助  
 ```java 
  go-zero
  ``` 
  怎么来方便的的定义和解析这样的配置文件～ 
#### 定义配置 
首先，我们需要将上述配置需求定义到 Go 结构体里，如下： 
 
 ```java 
  RestfulConf struct {
    Host         string        `json:",default=0.0.0.0"`
    Port         int           `json:",range=[80,65535)"`
    LogMode      string        `json:",options=[file,console]"`
    Verbose      bool          `json:",optional"`
    MaxConns     int           `json:",default=10000"`
    Timeout      time.Duration `json:",default=3s"`
    CpuThreshold int64         `json:",default=900,range=[0:1000]"`
}

  ``` 
  
可以看到，我们对每个配置项都有一定的定义和限制，其中一些定义如下： 
 
  
 ```java 
  default
  ``` 
 ，配置没填的话，使用该默认值，可以看到其中的  
 ```java 
  3s
  ``` 
  会自动解析成  
 ```java 
  time.Duration
  ``` 
  类型 
  
 ```java 
  optional
  ``` 
 ，此项可以不配置，没有的话，用类型零值 
  
 ```java 
  range
  ``` 
 ，限定数字类型，需要在给定的范围内 
  
 ```java 
  options
  ``` 
 ，限制配置的值只能是给出的这几个之一 
 
并且，一些属性可以叠加使用，比如： 
 
  
 ```java 
  default
  ``` 
  和  
 ```java 
  range
  ``` 
  一起使用，就可以既增加了范围限制，又提供了默认值 
  
 ```java 
  default
  ``` 
  和  
 ```java 
  options
  ``` 
  一起使用，就可以既增加了可选项限制，又提供了默认值 
 
#### 配置文件 
因为我们在定义配置的时候，给了很多的默认值，还有使用  
 ```java 
  optional
  ``` 
  指定为可选，所以我们的配置文件里的配置项就相对比较少了，能用默认值的就不用写了，如下： 
 
 ```java 
  # 因为很多都有默认值，所以只需要写需要指定值和没有默认值的
Port: 8080
LogMode: console
# 可以读取环境变量的值
MaxBytes: ${MAX_BYTES}

  ``` 
  
这里有个注意点，如果配置项的  
 ```java 
  value
  ``` 
  全部是数字，而你定义的配置类型是  
 ```java 
  string
  ``` 
 ，比如有人测试密码经常用  
 ```java 
  123456
  ``` 
 ，但是密码一般会定义为  
 ```java 
  string
  ``` 
 ，配置就要写成如下（只是举个例子哈，密码一般不建议裸写到配置文件里）： 
 
 ```java 
  Password: "123456"

  ``` 
  
这里的双引号不能少，少了会报  
 ```java 
  type mismatch
  ``` 
  之类的错误，因为  
 ```java 
  yaml
  ``` 
  解析器会把不带双引号的  
 ```java 
  123456
  ``` 
  解析成  
 ```java 
  int
  ``` 
 。 
#### 加载配置文件 
我们有了配置定义（ 
 ```java 
  config.go
  ``` 
 ）和配置文件（ 
 ```java 
  config.yaml
  ``` 
 ），接下来就是加载配置文件了，加载配置文件有三种方式： 
 
 必须加载成功，否则程序退出，我们一般这么用，如果配置不对，程序就无法继续了 
 
 
 ```java 
  // 有错误直接退出程序
var config RestfulConf
conf.MustLoad("config.yaml", &config)

  ``` 
  
 
 ```java 
  go-zero
  ``` 
  自带的  
 ```java 
  goctl
  ``` 
  生成的默认代码也是使用  
 ```java 
  MustLoad
  ``` 
  来加载配置文件的 
 
 加载配置，并自行判断是否有  
 ```java 
  error
  ``` 
  
 
 
 ```java 
  // 自己判断并处理 error
var config RestfulConf
// 为了更简洁，这里的 LoadConfig 后续会改为 Load，LoadConfig 已被标记为 Deprecated
if err := conf.LoadConfig("config.yaml", &config); err != nil {
    log.Fatal(err)
}

  ``` 
  
 
 加载配置并读取环境变量 
 
 
 ```java 
  // 自动读取环境变量
var config RestfulConf
conf.MustLoad(configFile, &config, conf.UseEnv())

  ``` 
  
这里为啥我们需要显式指定  
 ```java 
  conf.UseEnv()
  ``` 
 ，因为如果默认读取的话，可能在配置里大家写特定字符的时候就需要  
 ```java 
  escape
  ``` 
  了，所以默认不读取环境变量，这个设计也欢迎大家多提提建议哈 
#### 实现原理 
我们在实现类似  
 ```java 
  yaml/json
  ``` 
  解析的时候一般会直接使用  
 ```java 
  encoding/json
  ``` 
  或者对应的  
 ```java 
  yaml
  ``` 
  库，但是对于  
 ```java 
  go-zero
  ``` 
  来说，我们需要在  
 ```java 
  unmarshal
  ``` 
  的时候有更精确的控制，这就需要我们自己定制  
 ```java 
  yaml/json
  ``` 
  的解析了，完整的代码实现在： 
配置文件代码：https://github.com/zeromicro/go-zero/tree/master/core/conf 
 
 ```java 
  yaml/json
  ``` 
  解析代码：https://github.com/zeromicro/go-zero/tree/master/core/mapping 
这里也充分展示了  
 ```java 
  reflect
  ``` 
  的用法，以及复杂场景下如何通过单元测试保证代码的正确性。 
#### 总结 
我一直比较推荐  
 ```java 
  Fail Fast
  ``` 
  的思想，我们在加载配置文件的时候也是这样，一旦有错误，立马退出，这样运维在部署服务时就会及时发现问题，因为进程压根起不来。 
 
 ```java 
  go-zero
  ``` 
  的所有服务的配置项都是通过这样的方式来加载和自动验证的，包括我写的很多工具的配置也是基于此来实现的，希望能对你有所帮助！ 
#### 项目地址 
https://github.com/zeromicro/go-zero 
https://gitee.com/kevwan/go-zero 
欢迎使用  
 ```java 
  go-zero
  ``` 
  并 star 支持我们！ 
#### 微信交流群 
关注『微服务实践』公众号并点击 交流群 获取社区群二维码。 
如果你有  
 ```java 
  go-zero
  ``` 
  的使用心得文章，或者源码学习笔记，欢迎通过公众号联系投稿！
                                        