---
title: Java版支付宝支付接
categories: Java开发全栈系列
tags:
  - Java
abbrlink: e5aec429
date: 2022-02-06 00:00:00
top: 45
---


本篇文章详细讲解如何使用Java调用支付宝电脑网站支付接口，包括沙箱环境配置、项目搭建、代码实现和支付流程。通过本文，您可以快速集成支付宝支付功能到自己的项目中。

<!-- more -->

![Alipay](https://hosiang1026.github.io/photos/image/2024/12/15/10s76ok.jpg "Alipay支付宝支付接口调用-Java版")

---

## 项目信息

```
项目框架： SpringBoot + Maven
```

```
开发工具： IntelliJ IDEA / Eclipse
```

```
JDK版本： JDK 1.8及以上
```

```
测试环境： 支付宝沙箱环境
```

```
完整代码： [GitHub仓库](https://github.com/Hosiang1026/alipay-demo)
```

---

## 一、准备工作

### 一、1 注册支付宝开放平台账号

```
1. 访问[支付宝开放平台](https://open.alipay.com)
```
2. 使用支付宝账号登录
3. 完成开发者认证（个人/企业）

### 二、2 创建应用

```
1. 进入控制台 -> 网页&移动应用 -> 创建应用
```
2. 选择"电脑网站支付"功能
3. 填写应用信息并提交审核

### 三、3 配置密钥

#### 3.1 生成RSA密钥对

支付宝支持RSA2（推荐）和RSA两种签名方式，推荐使用RSA2。

```
使用OpenSSL生成密钥（Linux/Mac）：
```

```bash
# 生成私钥
openssl genrsa -out rsa_private_key.pem 2048

# 生成公钥
openssl rsa -in rsa_private_key.pem -pubout -out rsa_public_key.pem

# 将私钥转换为PKCS8格式（支付宝要求）
openssl pkcs8 -topk8 -inform PEM -in rsa_private_key.pem -outform PEM -nocrypt -out rsa_private_key_pkcs8.pem

```

#### 3.2 配置应用公钥

```json
1. 在应用详情页面，点击"设置" -> "接口加签方式"
```
2. 选择"公钥"方式
3. 将生成的公钥内容（去除头尾和换行）粘贴到"应用公钥"输入框
4. 保存后，系统会自动生成"支付宝公钥"，需要保存备用

### 四、4 沙箱环境配置

#### 4.1 获取沙箱账号信息

```
1. 登录[支付宝开放平台](https://open.alipay.com)
2. 进入"研发服务" -> "沙箱环境"
```
3. 获取以下信息：
   - APPID（应用ID）
   - 应用私钥（rsa_private_key_pkcs8.pem的内容）
   - 支付宝公钥（系统自动生成）

#### 4.2 下载沙箱版支付宝APP

2. 使用沙箱提供的买家账号登录测试

---

## 二、项目搭建

### 五、1 创建SpringBoot项目

使用Spring Initializr创建项目，选择以下依赖：
- Spring Web
- Lombok（可选，简化代码）

### 六、2 添加支付宝SDK依赖

在`pom.xml`中添加依赖：

```xml
<dependencies>
    <!-- Spring Boot Web -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <!-- 支付宝SDK -->
        <groupId>com.alipay.sdk</groupId>
        <artifactId>alipay-sdk-java</artifactId>
        <version>4.38.200.ALL</version>
    
    <!-- Lombok -->
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
</dependencies>

```

### 七、3 配置文件

在`application.yml`中配置支付宝参数：

```yaml
alipay:
  app-id: 你的APPID
  private-key: 你的应用私钥（去除头尾和换行）
  public-key: 支付宝公钥（去除头尾和换行）
  server-url: https://openapi.alipaydev.com/gateway.do  # 沙箱环境
  # server-url: https://openapi.alipay.com/gateway.do  # 正式环境
  return-url: http://localhost:8080/alipay/return  # 同步回调地址
  notify-url: http://你的域名/alipay/notify  # 异步回调地址
  sign-type: RSA2  # 签名方式
  charset: UTF-8
  format: JSON

```

---

## 三、代码实现

### 八、1 配置类

创建`AlipayConfig`配置类：

```java
package com.example.alipay.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "alipay")
public class AlipayConfig {
    private String appId;
    private String privateKey;
    private String publicKey;
    private String serverUrl;
    private String returnUrl;
    private String notifyUrl;
    private String signType;
    private String charset;
    private String format;
}

```

### 九、2 支付服务类

创建`AlipayService`服务类：

```go
package com.example.alipay.service;
```

```python
import com.alipay.api.AlipayApiException;
import com.alipay.api.AlipayClient;
import com.alipay.api.DefaultAlipayClient;
import com.alipay.api.domain.AlipayTradePagePayModel;
import com.alipay.api.request.AlipayTradePagePayRequest;
import com.alipay.api.response.AlipayTradePagePayResponse;
import com.example.alipay.config.AlipayConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
```

```java
@Service
@RequiredArgsConstructor
public class AlipayService {
```
    
```java
    private final AlipayConfig alipayConfig;
```
    
```
    /**
     * 创建支付订单
     * @param outTradeNo 商户订单号
     * @param totalAmount 订单总金额
     * @param subject 订单标题
     * @param body 订单描述
     * @return 支付表单HTML
```
     */
```java
    public String createOrder(String outTradeNo, String totalAmount, 
                             String subject, String body) throws AlipayApiException {
        // 获得初始化的AlipayClient
        AlipayClient alipayClient = new DefaultAlipayClient(
            alipayConfig.getServerUrl(),
            alipayConfig.getAppId(),
            alipayConfig.getPrivateKey(),
            alipayConfig.getFormat(),
            alipayConfig.getCharset(),
            alipayConfig.getPublicKey(),
            alipayConfig.getSignType()
```
        );
        
```
        // 设置请求参数
        AlipayTradePagePayRequest alipayRequest = new AlipayTradePagePayRequest();
        alipayRequest.setReturnUrl(alipayConfig.getReturnUrl());
        alipayRequest.setNotifyUrl(alipayConfig.getNotifyUrl());
```
        
```
        // 商户订单号，商户网站订单系统中唯一订单号，必填
        // 付款金额，必填
        // 订单名称，必填
        // 商品描述，可空
        AlipayTradePagePayModel model = new AlipayTradePagePayModel();
        model.setOutTradeNo(outTradeNo);
        model.setTotalAmount(totalAmount);
        model.setSubject(subject);
        model.setBody(body);
        model.setProductCode("FAST_INSTANT_TRADE_PAY"); // 固定值
```
        
```
        alipayRequest.setBizModel(model);
```
        
```
        // 请求
        AlipayTradePagePayResponse response = alipayClient.pageExecute(alipayRequest);
```
        
```
        if (response.isSuccess()) {
            return response.getBody();
        } else {
            throw new RuntimeException("创建支付订单失败：" + response.getMsg());
```
        }

```

### 十、3 控制器类

创建`AlipayController`控制器：

package com.example.alipay.controller;

import com.example.alipay.service.AlipayService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.UUID;

@Controller
@RequestMapping("/alipay")
public class AlipayController {
    
    private final AlipayService alipayService;
    
    /**
     * 发起支付
     */
    @PostMapping("/pay")
    public void pay(@RequestParam String totalAmount,
                   @RequestParam String subject,
                   @RequestParam(required = false) String body,
                   HttpServletResponse response) throws AlipayApiException, IOException {
        // 生成商户订单号
        String outTradeNo = UUID.randomUUID().toString().replace("-", "");
        
        // 创建支付订单
        String form = alipayService.createOrder(outTradeNo, totalAmount, subject, body);
        
        // 将表单写入响应
        response.setContentType("text/html;charset=UTF-8");
        response.getWriter().write(form);
        response.getWriter().flush();
        response.getWriter().close();
    }
    
    /**
     * 同步回调（支付成功后跳转）
     */
    @GetMapping("/return")
    public String returnUrl(@RequestParam(required = false) String out_trade_no,
                           @RequestParam(required = false) String trade_no,
                           @RequestParam(required = false) String total_amount) {
        // 这里可以验证签名，更新订单状态等
        // 注意：同步回调不可靠，应该以异步回调为准
        
        return "redirect:/pay/success?outTradeNo=" + out_trade_no;
    }
    
    /**
     * 异步回调（支付结果通知）
     */
    @PostMapping("/notify")
    @ResponseBody
    public String notifyUrl(@RequestParam java.util.Map<String, String> params) {
        // 验证签名
        // 更新订单状态
        // 返回success给支付宝
        
        return "success";
    }

```

### 十一、4 签名验证工具类

创建签名验证工具类：

```go
package com.example.alipay.util;
```

```python
import com.alipay.api.internal.util.AlipaySignature;
import org.springframework.stereotype.Component;
```

```java
import java.util.Map;
```

```java
@Component
public class AlipaySignatureUtil {
```
    
    
```
    /**
     * 验证签名
```
     */
```java
    public boolean verifySignature(Map<String, String> params) {
        try {
            return AlipaySignature.rsaCheckV1(
```
                params,
            );
```
        } catch (AlipayApiException e) {
            e.printStackTrace();
            return false;
```
        }

```

---

## 四、支付流程

### 十二、1 支付流程说明

1. 用户下单：用户在网站选择商品，点击支付
2. 创建订单：后端生成订单号，调用支付宝接口创建支付订单
3. 跳转支付：前端跳转到支付宝收银台页面
4. 用户支付：用户在支付宝页面完成支付
5. 同步回调：支付成功后，支付宝跳转回商户网站（return_url）
6. 异步通知：支付宝服务器异步通知商户服务器（notify_url）

### 十三、2 前端页面示例

```html
```html
<!DOCTYPE html>
<html>
<head>
    <title>支付页面</title>
</head>
<body>
    <form id="payForm" action="/alipay/pay" method="post">
        <input type="hidden" name="totalAmount" value="0.01">
        <input type="hidden" name="subject" value="测试商品">
        <input type="hidden" name="body" value="这是一个测试订单">
        <button type="submit">立即支付</button>
    </form>
</body>
</html>
```

```

---

## 五、注意事项

### 十四、1 安全性

1. 私钥保护：应用私钥绝对不能泄露，不要提交到代码仓库
2. 签名验证：必须验证支付宝回调的签名，防止伪造请求
3. 幂等性处理：异步通知可能重复发送，需要保证处理幂等性
4. 金额校验：验证回调中的金额是否与订单金额一致

### 十五、2 订单状态管理

// 订单状态枚举
public enum OrderStatus {
    PENDING,    // 待支付
    PAID,       // 已支付
    REFUNDED,   // 已退款
    CLOSED      // 已关闭
}

public void updateOrderStatus(String outTradeNo, OrderStatus status) {
    // 更新数据库订单状态
    // 记录订单日志
    // 发送通知等
}
`### 5.3 异常处理```java
try {
    String form = alipayService.createOrder(...);
    // 处理支付宝API异常
    log.error("支付宝接口调用失败", e);
} catch (Exception e) {
    // 处理其他异常
    log.error("创建订单失败", e);
}
```

---

## 六、测试

### 十六、1 沙箱测试账号

在沙箱环境中，可以使用以下测试账号：
- 买家账号：沙箱环境提供
- 支付密码：沙箱环境提供
- 测试金额：建议使用0.01元测试

### 十七、2 测试步骤

1. 启动项目，访问支付页面
2. 填写订单信息，点击支付
3. 跳转到支付宝收银台
4. 使用沙箱账号登录并支付
5. 验证同步回调和异步回调

---

## 七、常见问题

### 十八、Q1: 如何切换到正式环境

```
A: 修改配置文件中的`server-url`为正式环境地址，并配置正式环境的APPID和密钥。
```

### 十九、Q2: 异步通知没有收到怎么办

```
A: 检查notify_url是否可公网访问，检查服务器防火墙设置，查看支付宝商户中心的通知记录。
```

### 二十、Q3: 如何实现退款


### 二十一、Q4: 支付成功后如何更新订单状态

```
A: 在异步回调中验证签名和订单信息后，更新数据库订单状态。
```

---

## 八、完整代码

```
完整代码已上传至GitHub：[alipay-demo](https://github.com/Hosiang1026/alipay-demo)
```

包含功能：
- ✅ 电脑网站支付
- ✅ 手机网站支付
- ✅ APP支付
- ✅ 签名验证
- ✅ 订单管理

---

![alipay](https://hosiang1026.github.io/photos/image/2024/12/16/reqm3x.gif "Java调用支付宝电脑网站支付接口")

---

## 总结

通过本文，您已经了解了如何使用Java集成支付宝支付功能。关键步骤包括：

1. 注册支付宝开放平台账号并创建应用
2. 配置密钥和沙箱环境
3. 添加支付宝SDK依赖
4. 实现支付服务和控制层
5. 处理同步和异步回调
6. 验证签名和更新订单状态

在实际开发中，还需要注意安全性、异常处理和订单状态管理。希望本文对您有所帮助！
