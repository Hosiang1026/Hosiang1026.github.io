---
title: 推荐系列-Fizz Gateway网关接入gRPC指南
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 879
cover_picture: 'https://www.fizzgate.com/grpc_service1.png'
abbrlink: b937286f
date: 2021-04-15 09:48:03
---

&emsp;&emsp;#前提条件 Fizz网关v1.5.0或以上版本 (安装教程 (opens new window)) gRPC服务 本文使用的gRPC服务样例：https://github.com/wehotel/fizz-examples/tree/master/fizz-example-grpc(opens ne...
<!-- more -->

                                                                                                                                                                                         
#### #前提条件 
 
 Fizz网关v1.5.0或以上版本 (安装教程 (opens new window)) 
 gRPC服务 
 
本文使用的gRPC服务样例：https://github.com/wehotel/fizz-examples/tree/master/fizz-example-grpc(opens new window) 
本文后面使用的接口为findById, 接口会回显入参的ID和返回name字段，JSON如下： 
 
  
 ```java 
  {
	"name": "call findById",
	"id": "入参ID"
}

  ``` 
  
 
 
#### #服务和接口维护 
把gRPC服务实例和接口集中维护，方便在服务编排里多次调用。因网关是通过泛化调用gRPC接口，所以gRPC服务本身需启用反射功能，请参考样例： 
 
  
 ```java 
  server = ServerBuilder.forPort(port)
     .addService(new UserService())
     .addService(new ShoppingCartService())
     // 开启gRPC反射
     .addService(ProtoReflectionService.newInstance())
     .build();

  ``` 
  
 
进入Fizz管理后台， 打开RPC管理 -> 服务管理, 点击新增填写服务名和实例等信息，多个实例用逗号分隔，网关会轮询调用。 
![Test](https://www.fizzgate.com/grpc_service1.png  'Fizz Gateway网关接入gRPC指南') 
打开RPC管理 -> 接口管理, 点击新增把你需要的接口录入到系统，没有用到的接口可以不录入 
![Test](https://www.fizzgate.com/grpc_service1.png  'Fizz Gateway网关接入gRPC指南') 
 
#### #服务编排调用gRPC接口 
打开服务编排 -> 接口列表，新增一个接口, 选择所属服务（如：func-test）, 如果还没有服务可点击右边的新增服务按钮添加, 接口路径为/grpc/user/findById, 如图： ![Test](https://www.fizzgate.com/grpc_service1.png  'Fizz Gateway网关接入gRPC指南') 
![Test](https://www.fizzgate.com/grpc_service1.png  'Fizz Gateway网关接入gRPC指南') 
选择前面步骤录入的grpc接口, 并设置grpc接口入参，采用引用值引用服务编排接口的Query参数， 关于参数的配置可参考文档：(服务编排-数据转换 (opens new window)) 
![Test](https://www.fizzgate.com/grpc_service1.png  'Fizz Gateway网关接入gRPC指南') 
配置服务编排接口的输出： 
![Test](https://www.fizzgate.com/grpc_service1.png  'Fizz Gateway网关接入gRPC指南') 
保存接口 
 
#### #配置路由 
打开网关管理 -> 路由管理, 点击新增配置以下路由 
![Test](https://www.fizzgate.com/grpc_service1.png  'Fizz Gateway网关接入gRPC指南') 
 
#### #测试 
回到服务编排的接口，点击测试. 填写Query参数id=666, 服务编排接口是透传了gRPC服务的findById的数据，得到以下结果： 
![Test](https://www.fizzgate.com/grpc_service1.png  'Fizz Gateway网关接入gRPC指南') 
 
#### #发布 
服务编排接口需要发布才可以对外提供服务，打开编排审核 -> 我的申请，新增一个发布申请，为了方便操作选择超级管理员为审核人 
![Test](https://www.fizzgate.com/grpc_service1.png  'Fizz Gateway网关接入gRPC指南') 
打开待审核列表，审核上一步的单子： 
![Test](https://www.fizzgate.com/grpc_service1.png  'Fizz Gateway网关接入gRPC指南') 
打开我的申请，点击申请单的查看操作： 
![Test](https://www.fizzgate.com/grpc_service1.png  'Fizz Gateway网关接入gRPC指南') 
发布接口: 
![Test](https://www.fizzgate.com/grpc_service1.png  'Fizz Gateway网关接入gRPC指南') 
 
#### #访问正式接口 
访问http://[网关IP]:8600/proxy/func-test/grpc/user/findById?id=666 
结果： 
![Test](https://www.fizzgate.com/grpc_service1.png  'Fizz Gateway网关接入gRPC指南')
                                        