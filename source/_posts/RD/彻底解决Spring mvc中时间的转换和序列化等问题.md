---
title: 推荐系列-彻底解决Spring mvc中时间的转换和序列化等问题
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 753
cover_picture: 'https://static.oschina.net/uploads/img/201910/15110152_Lki2.jpg'
abbrlink: ed97338a
date: 2021-04-14 07:54:42
---

&emsp;&emsp;痛点 在使用Spring mvc 进行开发时我们经常遇到前端传来的某种格式的时间字符串无法用java8的新特性java.time包下的具体类型参数来直接接收。 我们使用含有java.time封装类型的参数接收也会报...
<!-- more -->

                                                                                                                                                                                        #### 痛点 
在使用Spring mvc 进行开发时我们经常遇到前端传来的某种格式的时间字符串无法用java8的新特性 ```java 
  java.time
  ``` 包下的具体类型参数来直接接收。 我们使用含有 ```java 
  java.time
  ``` 封装类型的参数接收也会报反序列化问题，在返回前端带时间类型的同样会出现一些格式化的问题。今天我们来彻底解决他们。 
#### 建议 
其实最科学的建议统一使用时间戳来代表时间。这个是最完美的，避免了前端浏览器的兼容性问题，同时也避免了其它一些中间件的序列化/反序列化问题。但是用时间表达可能更清晰语义化。两种方式各有千秋，如果我们坚持使用java8的时间类库也不是没有办法。下面我们会以 ```java 
  java.time.LocalDateTime
  ``` 为例逐一解决这些问题。 
#### 局部注解方式 
网上有很多文章说该注解是前端指向后端的，也就是前端向后端传递时间参数格式化使用的，这没有错！但是有一个小问题，该方式只能适用于不涉及反序列化的情况下。也就是以下场景才适用： 
 ```java 
      @GetMapping("/local")
    public Map<String, String> data(@DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime localDateTime) {
        Map<String, String> map = new HashMap<>(1);
        map.put("data", localDateTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
        return map;
    }


  ```  
如果你在下面这个场景使用就不行了： 
 ```java 
  
@Data
public class UserInfo {

    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime birthday;
    private String name;
    private Integer age;
}


   @PostMapping("/user")
    public Object postData(@RequestBody UserInfo userInfo) {
        System.out.println("userInfo = " + userInfo);
        return userInfo;
    }

  ```  
原因是Post请求参数在body中，需要反序列化成对象。默认是jackson类库来进行反序列化，并不触发 ```java 
  @DateTimeFormat
  ``` 注解机制。 这时我们就需要使用jackson的格式化注解 ```java 
  @JsonFormat
  ``` 。我们将实体类 ```java 
  UserInfo
  ``` 改造成下面的就可以了： 
 ```java 
  @Data
public class UserInfo {

    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime birthday;
    private String name;
    private Integer age;
}

  ```  
以上两个注解可以并存，但是一定要清楚各自的使用场景。这里还有一个小细节：格式一定要对应好时间类型。比如 ```java 
  yyyy-MM-dd
  ```  对应 ```java 
  java.time.LocalDate
  ```  。如果再个性化一些 ```java 
  @JsonFormat
  ```  可以被 ```java 
  @JsonDeserialize
  ``` 和 ```java 
  @JsonSerialize
  ```  代替。但是它们的 ```java 
  using
  ``` 参数需要你自己实现为你对应的时间类型类型。 如果 ```java 
  @JsonFormat
  ``` 、 ```java 
  @JsonDeserialize
  ``` 和 ```java 
  @JsonSerialize
  ``` 同时存在 ```java 
  @JsonFormat
  ``` 的优先级要更高。 
#### 局部处理的好处 
局部处理的好处在于八个字：百花齐放，百家争鸣 。可以保持多样性、个性化 。但是局部带来了一个新的问题 ：没有共同的标准 、不兼容。进而不方便维护。所以有时候基于业务需要我们全局化可以统一管理。下面我们将讲解如何进行全局化配置。 
#### 全局化化时间格式配置 
全局化其实也是基于  ```java 
  @DateTimeFormat
  ```  和 ```java 
  @JsonFormat
  ```  两种场景来进行配置。对于 ```java 
  @DateTimeFormat
  ``` 的场景我们通过实现Spring提供的接口： 
DateTimeFormatter : 
 ```java 
       // 时间格式化
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss", Locale.CHINA);


  ```  
类型转换接口： 
 ```java 
   org.springframework.core.convert.converter.Converter<S,T>

  ```  
实现： 
 ```java 
      @Bean
    public Converter<String, LocalDateTime> localDateConverter() {
        return new Converter<String, LocalDateTime>() {
            @Override
            public LocalDateTime convert(String source) {
                return LocalDateTime.parse(source, FORMATTER);
            }
        };
    }

  ```  
或者格式化接口： 
 ```java 
   org.springframework.format.Formatter<T>

  ```  
实现 ： 
 ```java 
      @Bean
    public Formatter<LocalDateTime> localDateFormatter() {
        return new Formatter<LocalDateTime>() {
            @Override
            public LocalDateTime parse(String text, Locale locale) throws ParseException {
                return LocalDateTime.parse(text, FORMATTER);
            }

            @Override
            public String print(LocalDateTime object, Locale locale) {
                return object.format(FORMATTER);
            }
        };
    }

  ```  
以上两个接口的实现都要注册为Spring Bean，配置的时候二者选其一即可，其中S即Source也就是来源，其实就是前端的时间字符串。T即Target也就是目标，代表你需要转化或者格式化的时间java类型。 
那么对于时间序列化和反序列化我们进行如下配置就行了（基于默认jackson,以LocalDateTime 为例）： 
 ```java 
      @Bean
    public Jackson2ObjectMapperBuilderCustomizer jackson2ObjectMapperBuilderCustomizer() {

        return jacksonObjectMapperBuilder -> jacksonObjectMapperBuilder
                 // 反序列化
                .deserializerByType(LocalDateTime.class, new LocalDateTimeDeserializer(FORMATTER))
                 // 序列化
                .serializerByType(LocalDateTime.class, new LocalDateTimeSerializer(FORMATTER));
    }


  ```  
同样该jsonMapper自定义构建器要注册成Spring Bean才行。 
#### 全局配置要点 
全局配置的一些优缺点上面已经阐述了，这里我还是要啰嗦一下要点避免你踩坑。全局配置跟局部配置一样。同样要约定pattern。这就要求我们全局保持一致。我们可以实现多个以上的全局配置来对其他诸如 ```java 
  LocalDate
  ``` 、 ```java 
  OffsetDateTime
  ```  的适配。同时如果��们接入了其它一些需要用到序列化/反序列化的中间件，比如redis、rabbitmq，我们也要注意进行适配。 
#### 总结 
通过以上对时间格式的局部和全局处理方式的介绍，相信困扰你的Spring mvc 时间问题不会再存在了。如果感觉写对可以请转发告诉其他同学，点个赞，关注一下。 
 ```java 
  关注公众号：码农小胖哥 获取更多资讯
  ``` 
                                        