---
title: 推荐系列-SpringCloud Alibaba实战二十九 - SpringCloud Gateway 请求响应日志
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 1947
cover_picture: 'https://oscimg.oschina.net/oscnet/5d1b13e8-31f4-44f1-8fcb-ece41f90bac6.png'
abbrlink: 2d677f2f
date: 2021-04-15 09:46:45
---

&emsp;&emsp;请求响应日志是日常开发调试定位问题的重要手段，在微服务中引入SpringCloud Gateway后我们希望在网关层统一进行日志的收集。 本节内容将实现以下两个功能： 获取请求的输入输出参数，封装成...
<!-- more -->

                                                                                                                                                                                         
   
 请求响应日志是日常开发调试定位问题的重要手段，在微服务中引入SpringCloud Gateway后我们希望在网关层统一进行日志的收集。 
 本节内容将实现以下两个功能： 
  
   获取请求的输入输出参数，封装成自定义日志  
   将日志发送到MongoDB进行存储  
  
  
 #### 获取输入输出参数 
  
   首先我们先定义一个日志体  
  
  
 ```java 
  @Data
public class GatewayLog {
    /**访问实例*/
    private String targetServer;
    /**请求路径*/
    private String requestPath;
    /**请求方法*/
    private String requestMethod;
    /**协议 */
    private String schema;
    /**请求体*/
    private String requestBody;
    /**响应体*/
    private String responseData;
    /**请求ip*/
    private String ip;
 /**请求时间*/
    private Date requestTime;
 /**响应时间*/
    private Date responseTime;
    /**执行时间*/
    private long executeTime;
}

  ``` 
  
  
   【关键】在网关定义日志过滤器，获取输入输出参数  
  
  
 ```java 
  /**
 * 日志过滤器，用于记录日志
 * @author jianzh5
 * @date 2020/3/24 17:17
 */
@Slf4j
@Component
public class AccessLogFilter implements GlobalFilter, Ordered {
    @Autowired
    private AccessLogService accessLogService;

    private final List<HttpMessageReader<?>> messageReaders = HandlerStrategies.withDefaults().messageReaders();

    @Override
    public int getOrder() {
        return -100;
    }

    @Override
    @SuppressWarnings("unchecked")
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {

        ServerHttpRequest request = exchange.getRequest();

        // 请求路径
        String requestPath = request.getPath().pathWithinApplication().value();

        Route route = getGatewayRoute(exchange);


        String ipAddress = WebUtils.getServerHttpRequestIpAddress(request);

        GatewayLog gatewayLog = new GatewayLog();
        gatewayLog.setSchema(request.getURI().getScheme());
        gatewayLog.setRequestMethod(request.getMethodValue());
        gatewayLog.setRequestPath(requestPath);
        gatewayLog.setTargetServer(route.getId());
        gatewayLog.setRequestTime(new Date());
        gatewayLog.setIp(ipAddress);

        MediaType mediaType = request.getHeaders().getContentType();

        if(MediaType.APPLICATION_FORM_URLENCODED.isCompatibleWith(mediaType) || MediaType.APPLICATION_JSON.isCompatibleWith(mediaType)){
            return writeBodyLog(exchange, chain, gatewayLog);
        }else{
            return writeBasicLog(exchange, chain, gatewayLog);
        }
    }

    private Mono<Void> writeBasicLog(ServerWebExchange exchange, GatewayFilterChain chain, GatewayLog accessLog) {
        StringBuilder builder = new StringBuilder();
        MultiValueMap<String, String> queryParams = exchange.getRequest().getQueryParams();
        for (Map.Entry<String, List<String>> entry : queryParams.entrySet()) {
            builder.append(entry.getKey()).append("=").append(StringUtils.join(entry.getValue(), ","));
        }
        accessLog.setRequestBody(builder.toString());

        //获取响应体
        ServerHttpResponseDecorator decoratedResponse = recordResponseLog(exchange, accessLog);

        return chain.filter(exchange.mutate().response(decoratedResponse).build())
                .then(Mono.fromRunnable(() -> {
                    // 打印日志
                    writeAccessLog(accessLog);
                }));
    }


    /**
     * 解决 request body 只能读取一次问题，
     * 参考: org.springframework.cloud.gateway.filter.factory.rewrite.ModifyRequestBodyGatewayFilterFactory
     * @param exchange
     * @param chain
     * @param gatewayLog
     * @return
     */
    @SuppressWarnings("unchecked")
    private Mono writeBodyLog(ServerWebExchange exchange, GatewayFilterChain chain, GatewayLog gatewayLog) {
        ServerRequest serverRequest = ServerRequest.create(exchange,messageReaders);

        Mono<String> modifiedBody = serverRequest.bodyToMono(String.class)
                .flatMap(body ->{
                    gatewayLog.setRequestBody(body);
                    return Mono.just(body);
                });

        // 通过 BodyInserter 插入 body(支持修改body), 避免 request body 只能获取一次
        BodyInserter bodyInserter = BodyInserters.fromPublisher(modifiedBody, String.class);
        HttpHeaders headers = new HttpHeaders();
        headers.putAll(exchange.getRequest().getHeaders());
        // the new content type will be computed by bodyInserter
        // and then set in the request decorator
        headers.remove(HttpHeaders.CONTENT_LENGTH);

        CachedBodyOutputMessage outputMessage = new CachedBodyOutputMessage(exchange, headers);

        return bodyInserter.insert(outputMessage,new BodyInserterContext())
                .then(Mono.defer(() -> {
                    // 重新封装请求
                    ServerHttpRequest decoratedRequest = requestDecorate(exchange, headers, outputMessage);

                    // 记录响应日志
                    ServerHttpResponseDecorator decoratedResponse = recordResponseLog(exchange, gatewayLog);

                    // 记录普通的
                    return chain.filter(exchange.mutate().request(decoratedRequest).response(decoratedResponse).build())
                            .then(Mono.fromRunnable(() -> {
                                // 打印日志
                                writeAccessLog(gatewayLog);
                            }));
                }));
    }

    /**
     * 打印日志
     * @author javadaily
     * @date 2021/3/24 14:53
     * @param gatewayLog 网关日志
     */
    private void writeAccessLog(GatewayLog gatewayLog) {
        log.info(gatewayLog.toString());  
    }



    private Route getGatewayRoute(ServerWebExchange exchange) {
        return exchange.getAttribute(ServerWebExchangeUtils.GATEWAY_ROUTE_ATTR);
    }


    /**
     * 请求装饰器，重新计算 headers
     * @param exchange
     * @param headers
     * @param outputMessage
     * @return
     */
    private ServerHttpRequestDecorator requestDecorate(ServerWebExchange exchange, HttpHeaders headers,
                                                       CachedBodyOutputMessage outputMessage) {
        return new ServerHttpRequestDecorator(exchange.getRequest()) {
            @Override
            public HttpHeaders getHeaders() {
                long contentLength = headers.getContentLength();
                HttpHeaders httpHeaders = new HttpHeaders();
                httpHeaders.putAll(super.getHeaders());
                if (contentLength > 0) {
                    httpHeaders.setContentLength(contentLength);
                } else {
                    // TODO: this causes a 'HTTP/1.1 411 Length Required' // on
                    // httpbin.org
                    httpHeaders.set(HttpHeaders.TRANSFER_ENCODING, "chunked");
                }
                return httpHeaders;
            }

            @Override
            public Flux<DataBuffer> getBody() {
                return outputMessage.getBody();
            }
        };
    }


    /**
     * 记录响应日志
     * 通过 DataBufferFactory 解决响应体分段传输问题。
     */
    private ServerHttpResponseDecorator recordResponseLog(ServerWebExchange exchange, GatewayLog gatewayLog) {
        ServerHttpResponse response = exchange.getResponse();
        DataBufferFactory bufferFactory = response.bufferFactory();

        return new ServerHttpResponseDecorator(response) {
            @Override
            public Mono<Void> writeWith(Publisher<? extends DataBuffer> body) {
                if (body instanceof Flux) {
                    Date responseTime = new Date();
                    gatewayLog.setResponseTime(responseTime);
                    // 计算执行时间
                    long executeTime = (responseTime.getTime() - gatewayLog.getRequestTime().getTime());

                    gatewayLog.setExecuteTime(executeTime);

                    // 获取响应类型，如果是 json 就打印
                    String originalResponseContentType = exchange.getAttribute(ServerWebExchangeUtils.ORIGINAL_RESPONSE_CONTENT_TYPE_ATTR);


                    if (ObjectUtil.equal(this.getStatusCode(), HttpStatus.OK)
                            && StringUtil.isNotBlank(originalResponseContentType)
                            && originalResponseContentType.contains("application/json")) {

                        Flux<? extends DataBuffer> fluxBody = Flux.from(body);
                        return super.writeWith(fluxBody.buffer().map(dataBuffers -> {

                            // 合并多个流集合，解决返回体分段传输
                            DataBufferFactory dataBufferFactory = new DefaultDataBufferFactory();
                            DataBuffer join = dataBufferFactory.join(dataBuffers);
                            byte[] content = new byte[join.readableByteCount()];
                            join.read(content);

                            // 释放掉内存
                            DataBufferUtils.release(join);
                            String responseResult = new String(content, StandardCharsets.UTF_8);



                            gatewayLog.setResponseData(responseResult);

                            return bufferFactory.wrap(content);
                        }));
                    }
                }
                // if body is not a flux. never got there.
                return super.writeWith(body);
            }
        };
    }
}

  ``` 
  
 代码较长建议直接拷贝到编辑器，只要注意下面一个关键点： 
  
 ```java 
  getOrder()
  ``` 
 方法返回的值必须要<-1，「否则标准的NettyWriteResponseFilter将在您的过滤器被调用的机会之前发送响应，即不会执行获取后端响应参数的方法」 
 通过上面的两步我们已经可以获取到请求的输入输出参数了，在  
 ```java 
  writeAccessLog()
  ``` 
 中将其输出到了日志文件，大家可以在Postman发送请求观察日志。 
  
 #### 存储日志 
 如果需要将日志持久化方便后期检索的话可以考虑将日志存储在MongoDB中，实现过程很简单。（安装MongoDB可以参考这篇文章：实战|MongoDB的安装配置） 
  
   引入MongoDB  
  
  
 ```java 
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-mongodb-reactive</artifactId>
</dependency>

  ``` 
  
 由于gateway是基于webflux，所以我们需要选择reactive版本。 
  
   在GatewayLog上添加对应的注解  
  
  
 ```java 
  @Data
@Document
public class GatewayLog {
    @Id
    private String id;
 ...
}

  ``` 
  
  
   建立AccessLogRepository  
  
  
 ```java 
  @Repository
public interface AccessLogRepository extends ReactiveMongoRepository<GatewayLog,String> {
  
}

  ``` 
  
  
   建立Service  
  
  
 ```java 
  public interface AccessLogService {

    /**
     * 保存AccessLog
     * @param gatewayLog 请求响应日志
     * @return 响应日志
     */
    Mono<GatewayLog> saveAccessLog(GatewayLog gatewayLog);

}

  ``` 
  
  
   建立实现类  
  
  
 ```java 
  @Service
public class AccessLogServiceImpl implements AccessLogService {
    @Autowired
    private AccessLogRepository accessLogRepository;

    @Override
    public Mono<GatewayLog> saveAccessLog(GatewayLog gatewayLog) {
        return accessLogRepository.insert(gatewayLog);
    }
}

  ``` 
  
  
   在Nacos配置中心添加MongoDB对应配置  
  
  
 ```java 
  spring:
  data:
    mongodb:
      host: xxx.xx.x.xx
      port: 27017
      database: accesslog
      username: accesslog
      password: xxxxxx

  ``` 
  
  
   执行请求，打开MongoDB客户端，查看日志结果  
  
 ![Test](https://oscimg.oschina.net/oscnet/5d1b13e8-31f4-44f1-8fcb-ece41f90bac6.png  'SpringCloud Alibaba实战二十九 - SpringCloud Gateway 请求响应日志') 
   
   
 以上，希望对你有所帮助！ 
   
   
 ![Test](https://oscimg.oschina.net/oscnet/5d1b13e8-31f4-44f1-8fcb-ece41f90bac6.png  'SpringCloud Alibaba实战二十九 - SpringCloud Gateway 请求响应日志') 
   
   
   
   
 
本文分享自微信公众号 - JAVA日知录（javadaily）。 如有侵权，请联系 support@oschina.cn 删除。 本文参与“OSC源创计划”，欢迎正在阅读的你也加入，一起分享。
                                        