---
title: 推荐系列-撸了一个 Feign 增强包 V2.0 升级版
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 318
cover_picture: 'https://tva1.sinaimg.cn/large/e6c9d24ely1h1wsydvy1mj20rs0rsmy3.jpg'
abbrlink: 26fbf4f7
date: 2022-05-11 05:14:30
---

&emsp;&emsp; 大概在两年前我写过一篇 撸了一个 Feign 增强包，当时准备是利用 SpringBoot + K8s 构建应用，这个库可以类似于 SpringCloud 那样结合 SpringBoot 使用声明式接口来达到服务间通讯的目的...
<!-- more -->

                                                                                                                                                                                         
### 前言 
大概在两年前我写过一篇 撸了一个 Feign 增强包，当时准备是利用  
 ```java 
  SpringBoot + K8s
  ``` 
  构建应用，这个库可以类似于  
 ```java 
  SpringCloud
  ``` 
  那样结合  
 ```java 
  SpringBoot
  ``` 
  使用声明式接口来达到服务间通讯的目的。 
但后期由于技术栈发生变化（改为 Go），导致该项目只实现了基本需求后就搁置了。 
巧合的时最近内部有部分项目又计划采用  
 ```java 
  SpringBoot + K8s
  ``` 
  开发，于是便着手继续维护；现已经内部迭代了几个版本比较稳定了，也增加了一些实用功能，在此分享给大���。 
https://github.com/crossoverJie/feign-plus 
首先是新增了一些  
 ```java 
  features
  ``` 
 : 
 
 更加统一的 API。 
 统一的请求、响应、异常日志记录。 
 自定义拦截器。 
 Metric 支持。 
 异常传递。 
 
### 示例 
结合上面提到的一些特性做一些简单介绍，统一的 API 主要是在使用层面： 
在上一个版本中声明接口如下： 
 
 ```java 
  @FeignPlusClient(name = "github", url = "${github.url}")
public interface Github {
    @RequestLine("GET /repos/{owner}/{repo}/contributors")
    List<githubres> contributors(@Param("owner") String owner, @Param("repo") String repo);
}

  ``` 
  
其中的  
 ```java 
  @RequestLine
  ``` 
  等注解都是使用 feign 包所提供的。 
这次更新后改为如下方式： 
 
 ```java 
  @RequestMapping("/v1/demo")
@FeignPlusClient(name = "demo", url = "${feign.demo.url}", port = "${feign.demo.port}")
public interface DemoApi {
    @GetMapping("/id")
    String sayHello(@RequestParam(value = "id") Long id);

    @GetMapping("/id/{id}")
    String id(@PathVariable(value = "id") Long id);

    @PostMapping("/create")
    Order create(@RequestBody OrderCreateReq req);

    @GetMapping("/query")
    Order query(@SpringQueryMap OrderQueryDTO dto);
}

  ``` 
  
熟悉的味道，基本都是  
 ```java 
  Spring
  ``` 
  自带的注解，这样在使用上学习成本更低，同时与项目中原本的接口写法保持一致。 
> @SpringQueryMap(top.crossoverjie.feign.plus.contract.SpringQueryMap) 是由 feign-plus 提供，其实就是从 SpringCloud 中 copy 过来的。 
我这里写了两个 demo 来模拟调用：  
 
 ```java 
  provider
  ``` 
 ： 作为服务提供者提供了一系列接口供消费方调用，并对外提供了一个 api 模块。  
 
 
 ```java 
  demo
  ``` 
 ：作为服务消费者依赖  
 ```java 
  provider-api
  ``` 
  模块，根据其中声明的接口进行远程调用。  配置文件： 
 
 ```java 
  server:
  port: 8181

feign:
  demo:
    url : http://127.0.0.1
    port: 8080

logging:
  level:
    top:
      crossoverjie: debug

management:
  endpoints:
    web:
      base-path: /actuator
      exposure:
        include: '*'
  metrics:
    distribution:
      percentiles:
        all: 0.5,0.75,0.95,0.99
    export:
      prometheus:
        enabled: true
        step: 1m
spring:
  application:
    name: demo

  ``` 
  
当我们访问  
 ```java 
  http://127.0.0.1:8181/hello/2
  ``` 
  接口时从控制台可以看到调用结果：  
### 日志记录 
从上图中可以看出  
 ```java 
  feign-plus
  ``` 
  会用 debug 记录请求/响应结果，如果需要打印出来时需要将该包下的日志级别调整为 debug： 
 
 ```java 
  logging:
  level:
    top:
      crossoverjie: debug

  ``` 
  
由于内置了拦截器，也可以自己继承  
 ```java 
  top.crossoverjie.feign.plus.log.DefaultLogInterceptor
  ``` 
  来实现自己的日志拦截记录，或者其他业务逻辑。 
 
 ```java 
  @Component
@Slf4j
public class CustomFeignInterceptor extends DefaultLogInterceptor {
    @Override
    public void request(String target, String url, String body) {
        super.request(target, url, body);
        log.info("request");
    }

    @Override
    public void exception(String target, String url, FeignException feignException) {
        super.exception(target, url, feignException);
    }

    @Override
    public void response(String target, String url, Object response) {
        super.response(target, url, response);
        log.info("response");
    }
}

  ``` 
  
### 监控 metric 
 
 ```java 
  feign-plus
  ``` 
  会自行记录每个接口之间的调用耗时、异常等情况。  访问  
 ```java 
  http://127.0.0.1:8181/actuator/prometheus
  ``` 
  会看到相关埋点信息，通过  
 ```java 
  feign_call*
  ``` 
  的 key 可以自行在  
 ```java 
  Grafana
  ``` 
  配置相关面板，类似于下图：  
### 异常传递 
 
 ```java 
  rpc
  ``` 
 （远程调用）要使用起来真的类似于本地调用，异常传递必不可少。 
 
 ```java 
  // provider
	public Order query(OrderQueryDTO dto) {
		log.info("dto = {}", dto);
		if (dto.getId().equals("1")) {
			throw new DemoException("provider test exception");
		}
		return new Order(dto.getId());
	}

// consumer
        try {
            demoApi.query(new OrderQueryDTO(id, "zhangsan"));
        } catch (DemoException e) {
            log.error("feignCall:{}, sourceApp:[{}], sourceStackTrace:{}", e.getMessage(), e.getAppName(), e.getDebugStackTrace(), e);
        }	

  ``` 
  
比如  
 ```java 
  provider
  ``` 
  中抛出了一个自定义的异常，在  
 ```java 
  consumer
  ``` 
  中可以通过  
 ```java 
  try/catch
  ``` 
  捕获到该异常。 
为了在 feign-plus 中实现该功能需要几个步骤： 
 
 自定义一个通用异常。 
 服务提供方需要实现一个全局拦截器，当发生异常时统一对外响应数据。 
 服务消费方需要自定义一个异常解码器的 bean。 
 
这里我在  
 ```java 
  provider
  ``` 
  中自定义了一个  
 ```java 
  DemoException
  ``` 
 ：  
> 通常这个类应该定义在公司内部的通用包中，这里为了演示方便。 
接着定义了一个  
 ```java 
  HttpStatus
  ``` 
  的类用于统一对外响应。 
 
 ```java 
  @Data
@AllArgsConstructor
@NoArgsConstructor
public class HttpStatus {
    private String appName;
    private int code;
    private String message;
    private String debugStackTrace;
}

  ``` 
  
> 这个也应该放在通用包中。 
然后在  
 ```java 
  provider
  ``` 
  中定义全局异常处理：  
当出现异常时便会返回一个 http_code=500 的数据：  
到这一步又会出现一个引战话题：HTTP 接口返回到底是全部返回 200 然后通过 code 来来判断，还是参考 http_code 进行返回? 
这里不做过多讨论，具体可以参考耗子叔的文章： “一把梭：REST API 全用 POST” 
 
 ```java 
  feign-plus
  ``` 
  默认采用的 http_code !=200 才会认为发生了异常。 
而这里的 http_status 也是参考了 Google 的 api 设计：  具体可以参考这个链接： https://cloud.google.com/apis/design/errors#propagating_errors 
然后定义一个异常解析器： 
 
 ```java 
  @Configuration
public class FeignExceptionConfig {
    @Bean
    public FeignErrorDecoder feignExceptionDecoder() {
        return (methodName, response, e) -&gt; {
            HttpStatus status = JSONUtil.toBean(response, HttpStatus.class);
            return new DemoException(status.getAppName(), status.getCode(), status.getMessage(), status.getDebugStackTrace());
        };
    }
}

  ``` 
  
> 通常这块代码也是放在基础包中。 
 
这样当服务提供方抛出异常时，消费者便能成功拿到该异常：  
#### 实现原理 
实现原理其实也比较简单，了解  
 ```java 
  rpc
  ``` 
  原理的话应该会知道，服务提供者返回的异常调用方是不可能接收到的，这和是否由一种语言实现也没关系。 
毕竟两个进程之间的栈是完全不同的，不在一台服务器上，甚至都不在一个地区。 
所以  
 ```java 
  provider
  ``` 
  抛出异常后，消费者只能拿到一串报文，我们只能根据这段报文解析出其中的异常信息，然后再重新创建一个内部自定义的异常（比如这里的  
 ```java 
  DemoException
  ``` 
 ），也就是我们自定义异常解析器所干的事情。 
下图就是这个异常传递的大致流程：  
#### code message 模式 
由于 feign-plus 默认是采用  
 ```java 
  http_code != 200
  ``` 
  的方式来抛出异常的，所以采用  
 ```java 
  http_code=200, code message
  ``` 
  的方式响应数据将不会传递异常，依然会任务是一次正常调用。 
不过基于该模式���递异常也是可以实现的，但没法做到统一，比如有些团队习惯  
 ```java 
  code !=0
  ``` 
  表示异常，甚至字段都不是 code；再或者异常信息有些是放在 message 或 msg 字段中。 
每个团队、个人习惯都不相同，所以没法抽象出一个标准，因此也就没做相关适配。 
> 这也印证了使用国际标准所带来的好处。 
限于篇幅，如果有相关需求的朋友也可以在评论区沟通，实现上会比现在稍微复杂一点点🤏🏻。 
### 总结 
项目源码： https://github.com/crossoverJie/feign-plus 
基于2022年云原生这个背景，当然更推荐大家使用  
 ```java 
  gRPC
  ``` 
  来做服务间通信，这样也不需要维护类似于这样的库了。 
不过在一些调用第三方接口而对方也没有提供 SDK 时，这个库也有一定用武之地，虽然使用原生 feign 也能达到相同目的，但使用该库可以使得与  
 ```java 
  Spring
  ``` 
  开发体验一致，同时内置了日志、 
 ```java 
  metric
  ``` 
  等功能，避免了重复开发。 
你的点赞与分享是对我最大的支持 </githubres>
                                        