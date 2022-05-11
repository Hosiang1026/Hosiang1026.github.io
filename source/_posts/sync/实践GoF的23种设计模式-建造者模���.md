---
title: 推荐系列-实践GoF的23种设计模式-建造者模���
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 317
cover_picture: >-
  https://tva1.sinaimg.cn/large/007S8ZIlgy1ghky4kprezj319e0kuu0x.jpg#crop=0&crop=0&crop=1&crop=1&id=rf2mz&originHeight=750&originWidth=1634&originalType=binary&ratio=1&rotation=0&showTitle=false&status=done&style=none&title=
abbrlink: 64c2c09d
date: 2022-05-11 05:14:30
---

&emsp;&emsp;：针对这种对象成员较多，创建对象逻辑较为繁琐的场景，非常适合使用建造者模式来进行优化。 本文分享自华为云社区《【Go实现】实践GoF的23种设计模式：建造者模式》，作者： 元闰子。 ...
<!-- more -->

                                                                                                                                                                                         
本文分享自华为云社区《【Go实现】实践GoF的23种设计模式：建造者模式》，作者： 元闰子。 
 
#### 简述 
在程序设计中，我们会经常遇到一些复杂的对象，其中有很多成员属性，甚至嵌套着多个复杂的对象。这种情况下，创建这个复杂对象就会变得很繁琐。对于 C++/Java 而言，最常见的表现就是构造函数有着长长的参数列表： 
 
 ```java 
  MyObject obj = new MyObject(param1, param2, param3, param4, param5, param6, ...)

  ``` 
  
对于 Go 语言来说，最常见的表现就是多层的嵌套实例化： 
 
 ```java 
  obj := &MyObject{
  Field1: &Field1 {
    Param1: &Param1 {
      Val: 0,
    },
    Param2: &Param2 {
      Val: 1,
    },
    ...
  },
  Field2: &Field2 {
    Param3: &Param3 {
      Val: 2,
    },
    ...
  },
  ...
}

  ``` 
  
上述的对象创建方法有两个明显的缺点：（1）对使用者不友好，使用者在创建对象时需要知道的细节太多；（2）代码可读性很差。 
针对这种对象成员较多，创建对象逻辑较为繁琐的场景，非常适合使用建造者模式来进行优化。 
建造者模式的作用有如下几个：1、封装复杂对象的创建过程，使对象使用者不感知复杂的创建逻辑。 2、可以一步步按照顺序对成员进行赋值，或者创建嵌套对象，并最终完成目标对象的创建。 3、对多个对象复用同样的对象创建逻辑。 其中，第1和第2点比较常用，下面对建造者模式的实现也主要是针对这两点进行示例。 
 
#### UML 结构 
 
 
#### 代码实现 
 
##### 示例 
在简单的分布式应用系统（示例代码工程）中，我们定义了服务注册中心，提供服务注册、去注册、更新、 发现等功能。要实现这些功能，服务注册中心就必须保存服务的信息，我们把这些信息放在了  
 ```java 
  ServiceProfile
  ``` 
  这个数据结构上，定义如下： 
 
 ```java 
  // demo/service/registry/model/service_profile.go
// ServiceProfile 服务档案，其中服务ID唯一标识一个服务实例，一种服务类型可以有多个服务实例
type ServiceProfile struct {
    Id       string           // 服务ID
    Type     ServiceType      // 服务类型
    Status   ServiceStatus    // 服务状态
    Endpoint network.Endpoint // 服务Endpoint
    Region   *Region          // 服务所属region
    Priority int              // 服务优先级，范围0～100，值越低，优先级越高
    Load     int              // 服务负载，负载越高表示服务处理的业务压力越大
}

// demo/service/registry/model/region.go
// Region 值对象，每个服务都唯一属于一个Region
type Region struct {
	Id      string
	Name    string
	Country string
}

// demo/network/endpoint.go
// Endpoint 值对象，其中ip和port属性为不可变，如果需要变更，需要整对象替换
type Endpoint struct {
	ip   string
	port int
}

  ``` 
  
 
##### 实现 
如果按照直接实例化方式应该是这样的： 
 
 ```java 
  // 多层的嵌套实例化
profile := &ServiceProfile{
	Id:       "service1",
	Type:     "order",
	Status:   Normal,
	Endpoint: network.EndpointOf("192.168.0.1", 8080),
	Region: &Region{ // 需要知道对象的实现细节
		Id:      "region1",
		Name:    "beijing",
		Country: "China",
	},
	Priority: 1,
	Load:     100,
}

  ``` 
  
虽然  
 ```java 
  ServiceProfile
  ``` 
  结构体嵌套的层次不多，但是从上述直接实例化的代码来看，确实存在对使用者不友好和代码可读性较差的缺点。比如，使用者必须先���  
 ```java 
  Endpoint
  ``` 
  和  
 ```java 
  Region
  ``` 
  进行实例化，这实际上是将  
 ```java 
  ServiceProfile
  ``` 
  的实现细节暴露给使用者了。 
下面我们引入建造者模式对代码进行优化重构： 
 
 ```java 
  // demo/service/registry/model/service_profile.go
// 关键点1: 为ServiceProfile定义一个Builder对象
type serviceProfileBuild struct {
    // 关键点2: 将ServiceProfile作为Builder的成员属性
	profile *ServiceProfile
}

// 关键点3: 定义构建ServiceProfile的方法
func (s *serviceProfileBuild) WithId(id string) *serviceProfileBuild {
	s.profile.Id = id
    // 关键点4: 返回Builder接收者指针，支持链式调用
	return s
}

func (s *serviceProfileBuild) WithType(serviceType ServiceType) *serviceProfileBuild {
	s.profile.Type = serviceType
	return s
}

func (s *serviceProfileBuild) WithStatus(status ServiceStatus) *serviceProfileBuild {
	s.profile.Status = status
	return s
}

func (s *serviceProfileBuild) WithEndpoint(ip string, port int) *serviceProfileBuild {
	s.profile.Endpoint = network.EndpointOf(ip, port)
	return s
}

func (s *serviceProfileBuild) WithRegion(regionId, regionName, regionCountry) *serviceProfileBuild {
    s.profile.Region = &Region{Id: regionId, Name: regionName, Country: regionCountry}
	return s
}

func (s *serviceProfileBuild) WithPriority(priority int) *serviceProfileBuild {
	s.profile.Priority = priority
	return s
}

func (s *serviceProfileBuild) WithLoad(load int) *serviceProfileBuild {
	s.profile.Load = load
	return s
}

// 关键点5: 定义Build方法，在链式调用的最后调用，返回构建好的ServiceProfile
func (s *serviceProfileBuild) Build() *ServiceProfile {
	return s.profile
}

// 关键点6: 定义一个实例化Builder对象的工厂方法
func NewServiceProfileBuilder() *serviceProfileBuild {
	return &serviceProfileBuild{profile: &ServiceProfile{}}
}

  ``` 
  
实现建造者模式有 6 个关键点： 
 
 为  
 ```java 
  ServiceProfile
  ``` 
  定义一个 Builder 对象  
 ```java 
  serviceProfileBuild
  ``` 
 ，通常我们将它设计为包内可见，来限制客户端的滥用。 
 把需要构建的  
 ```java 
  ServiceProfile
  ``` 
  作为 Builder 对象  
 ```java 
  serviceProfileBuild
  ``` 
  的成员属性，用来存储构建过程中的状态。 
 为 Builder 对象  
 ```java 
  serviceProfileBuild
  ``` 
  定义用来构建  
 ```java 
  ServiceProfile
  ``` 
  的一系列方法，上述代码中我们使用了  
 ```java 
  WithXXX
  ``` 
  的风格。 
 在构建方法中返回 Builder 对象指针本身，也即接收者指针，用来支持链式调用，提升客户端代码的简洁性。 
 为 Builder 对象定义 Build() 方法，返回构建好的  
 ```java 
  ServiceProfile
  ``` 
  实例，在链式调用的最后调用。 
 定义一个实例化 Builder 对象的工厂方法  
 ```java 
  NewServiceProfileBuilder()
  ``` 
 。 
 
那么，使用建造者模式实例化逻辑是这样的： 
 
 ```java 
  // 建造者模式的实例化方法
profile := NewServiceProfileBuilder().
                WithId("service1").
                WithType("order").
                WithStatus(Normal).
                WithEndpoint("192.168.0.1", 8080).
                WithRegion("region1", "beijing", "China").
                WithPriority(1).
                WithLoad(100).
                Build()

  ``` 
  
当使用建造者模式来进行对象创建时，使用者不再需要知道对象具体的实现细节（这里体现为无须预先实例化  
 ```java 
  Endpoint
  ``` 
  和  
 ```java 
  Region
  ``` 
  对象），代码可读性、简洁性也更好了。 
 
#### 扩展 
 
##### Functional Options 模式 
进一步思考，其实前文提到的建造者实现方式，还有 2 个待改进点： 
 
 我们额外新增了一个 Builder 对象，如果能够把 Builder 对象省略掉，同时又能避免长长的入参列表就更好了。 
 熟悉 Java 的同学应该能够感觉出来，这种实现具有很强的“Java 风格”。并非说这种风格不好，而是在 Go 中理应有更具“Go 风格”的建造者模式实现。 
 
针对这两点，我们可以通过 Functional Options 模式 来优化。Functional Options 模式也是用来构建对象的，这里我们也把它看成是建造者模式的一种扩展。它利用了 Go 语言中函数作为一等公民的特点，结合函数的可变参数，达到了优化上述 2 个改进点的目的。 使用 Functional Options 模式的实现是这样的： 
 
 ```java 
  // demo/service/registry/model/service_profile_functional_options.go
// 关键点1: 定义构建ServiceProfile的functional option，以*ServiceProfile作为入参的函数
type ServiceProfileOption func(profile *ServiceProfile)

// 关键点2: 定义实例化ServiceProfile的工厂方法，使用ServiceProfileOption作为可变入参
func NewServiceProfile(svcId string, svcType ServiceType, options ...ServiceProfileOption) *ServiceProfile {
    // 关键点3: 可为特定的字段提供默认值
	profile := &ServiceProfile{
		Id:       svcId,
		Type:     svcType,
		Status:   Normal,
		Endpoint: network.EndpointOf("192.168.0.1", 80),
		Region:   &Region{Id: "region1", Name: "beijing", Country: "China"},
		Priority: 1,
		Load:     100,
	}
    // 关键点4: 通过ServiceProfileOption来修改字段
	for _, option := range options {
		option(profile)
	}
	return profile
}

// 关键点5: 定义一系列构建ServiceProfile的方法，在ServiceProfileOption实现构建逻辑，并返回ServiceProfileOption
func Status(status ServiceStatus) ServiceProfileOption {
	return func(profile *ServiceProfile) {
		profile.Status = status
	}
}

func Endpoint(ip string, port int) ServiceProfileOption {
	return func(profile *ServiceProfile) {
		profile.Endpoint = network.EndpointOf(ip, port)
	}
}

func SvcRegion(svcId, svcName, svcCountry string) ServiceProfileOption {
	return func(profile *ServiceProfile) {
		profile.Region = &Region{
			Id:      svcId,
			Name:    svcName,
			Country: svcCountry,
		}
	}
}

func Priority(priority int) ServiceProfileOption {
	return func(profile *ServiceProfile) {
		profile.Priority = priority
	}
}

func Load(load int) ServiceProfileOption {
	return func(profile *ServiceProfile) {
		profile.Load = load
	}
}

  ``` 
  
实现 Functional Options 模式有 5 个关键点： 
 
 定义 Functional Option 类型  
 ```java 
  ServiceProfileOption
  ``` 
 ，本质上是一个入参为构建对象  
 ```java 
  ServiceProfile
  ``` 
  的指针类型。（注意必须是指针类型，值类型无法达到修改目的） 
 定义构建  
 ```java 
  ServiceProfile
  ``` 
  的工厂方法，以  
 ```java 
  ServiceProfileOption
  ``` 
  的可变参数作为入参。函数的可变参数就意味着可以不传参，因此一些必须赋值的属性建议还是定义对应的函数入参。 
 可为特定的属性提供默认值，这种做法在 为配置对象赋值的场景 比较常见。 
 在工厂方法中，通过  
 ```java 
  for
  ``` 
  循环利用  
 ```java 
  ServiceProfileOption
  ``` 
  完成构建对象的赋值。 
 定义一系列的构建方法，以需要构建的属性作为入参，返回  
 ```java 
  ServiceProfileOption
  ``` 
  对象，并在 
 ```java 
  ServiceProfileOption
  ``` 
  中实现属性赋值。 
 
Functional Options 模式 的实例化逻辑是这样的： 
 
 ```java 
  // Functional Options 模式的实例化逻辑
profile := NewServiceProfile("service1", "order",
	Status(Normal),
	Endpoint("192.168.0.1", 8080),
	SvcRegion("region1", "beijing", "China"),
	Priority(1),
	Load(100))

  ``` 
  
相比于传统的建造者模式，Functional Options 模式的使用方式明显更加的简洁，也更具“Go 风格”了。 
 
##### Fluent API 模式 
前文中，不管是传统的建造者模式，还是 Functional Options 模式，我们都没有限定属性的构建顺序，比如： 
 
 ```java 
  // 传统建造者模式不限定属性的构建顺序
profile := NewServiceProfileBuilder().
                WithPriority(1).  // 先构建Priority也完全没问题
                WithId("service1").
                ...
// Functional Options 模式也不限定属性的构建顺序
profile := NewServiceProfile("service1", "order",
    Priority(1),  // 先构建Priority也完全没问题
	Status(Normal),
    ...

  ``` 
  
但是在一些特定的场景，对象的属性是要求有一定的构建顺序的，如果违反了顺序，可能会导致一些隐藏的错误。 当然，我们可以与使用者的约定好属性构建的顺序，但这种约定是不可靠的，你很难保证使���者会一直遵守该约定。所以，更好的方法应该是通过接口的设计来解决问题， Fluent API 模式 诞生了。 
下面，我们使用 Fluent API 模式进行实现： 
 
 ```java 
  // demo/service/registry/model/service_profile_fluent_api.go
type (
    // 关键点1: 为ServiceProfile定义一个Builder对象
	fluentServiceProfileBuilder struct {
        // 关键点2: 将ServiceProfile作为Builder的成员属性
		profile *ServiceProfile
	}
    // 关键点3: 定义一系列构建属性的fluent接口，通过方法的返回值控制属性的构建顺序
	idBuilder interface {
		WithId(id string) typeBuilder
	}
	typeBuilder interface {
		WithType(svcType ServiceType) statusBuilder
	}
	statusBuilder interface {
		WithStatus(status ServiceStatus) endpointBuilder
	}
	endpointBuilder interface {
		WithEndpoint(ip string, port int) regionBuilder
	}
	regionBuilder interface {
		WithRegion(regionId, regionName, regionCountry string) priorityBuilder
	}
	priorityBuilder interface {
		WithPriority(priority int) loadBuilder
	}
	loadBuilder interface {
		WithLoad(load int) endBuilder
	}
	// 关键点4: 定义一个fluent接口返回完成构建的ServiceProfile，在最后调用链的最后调用
	endBuilder interface {
		Build() *ServiceProfile
	}
)

// 关键点5: 为Builder定义一系列构建方法，也即实现关键点3中定义的Fluent接口
func (f *fluentServiceProfileBuilder) WithId(id string) typeBuilder {
	f.profile.Id = id
	return f
}

func (f *fluentServiceProfileBuilder) WithType(svcType ServiceType) statusBuilder {
	f.profile.Type = svcType
	return f
}

func (f *fluentServiceProfileBuilder) WithStatus(status ServiceStatus) endpointBuilder {
	f.profile.Status = status
	return f
}

func (f *fluentServiceProfileBuilder) WithEndpoint(ip string, port int) regionBuilder {
	f.profile.Endpoint = network.EndpointOf(ip, port)
	return f
}

func (f *fluentServiceProfileBuilder) WithRegion(regionId, regionName, regionCountry string) priorityBuilder {
	f.profile.Region = &Region{
		Id:      regionId,
		Name:    regionName,
		Country: regionCountry,
	}
	return f
}

func (f *fluentServiceProfileBuilder) WithPriority(priority int) loadBuilder {
	f.profile.Priority = priority
	return f
}

func (f *fluentServiceProfileBuilder) WithLoad(load int) endBuilder {
	f.profile.Load = load
	return f
}

func (f *fluentServiceProfileBuilder) Build() *ServiceProfile {
	return f.profile
}

// 关键点6: 定义一个实例化Builder对象的工厂方法
func NewFluentServiceProfileBuilder() idBuilder {
	return &fluentServiceProfileBuilder{profile: &ServiceProfile{}}
}

  ``` 
  
实现 Fluent API 模式有 6 个关键点，大部分与传统的建造者模式类似： 
 
 为  
 ```java 
  ServiceProfile
  ``` 
  定义一个 Builder 对象  
 ```java 
  fluentServiceProfileBuilder
  ``` 
 。 
 把需要构建的  
 ```java 
  ServiceProfile
  ``` 
  设计为 Builder 对象  
 ```java 
  fluentServiceProfileBuilder
  ``` 
  的成员属性。 
 定义一系列构建属性的 Fluent 接口，通过方法的返回值控制属性的构建顺序，这是实现 Fluent API 的关键。比如  
 ```java 
  WithId
  ``` 
  方法的返回值是  
 ```java 
  typeBuilder
  ``` 
  类型，表示紧随其后的就是  
 ```java 
  WithType
  ``` 
  方法。 
 定义一个 Fluent 接口（这里是  
 ```java 
  endBuilder
  ``` 
 ）返回完成构建的  
 ```java 
  ServiceProfile
  ``` 
 ，在最后调用链的最后调用。 
 为 Builder 定义一系列构建方法，也即实现关键点 3 中定义的 Fluent 接口，并在构建方法中返回 Builder 对象指针本身。 
 定义一个实例化 Builder 对象的工厂方法  
 ```java 
  NewFluentServiceProfileBuilder()
  ``` 
 ，返回第一个 Fluent 接口，这里是  
 ```java 
  idBuilder
  ``` 
 ，表示首先构建的是  
 ```java 
  Id
  ``` 
  属性。 
 
Fluent API 的使用与传统的建造者实现使用类似，但是它限定了方法调用的顺序。如果顺序不对，在编译期就报错了，这样就能提前把问题暴露在编译器，减少了不必要的错误使用。 
 
 ```java 
  // Fluent API的使用方法
profile := NewFluentServiceProfileBuilder().
	WithId("service1").
	WithType("order").
	WithStatus(Normal).
	WithEndpoint("192.168.0.1", 8080).
	WithRegion("region1", "beijing", "China").
	WithPriority(1).
	WithLoad(100).
	Build()

// 如果方法调用不按照预定的顺序，编译器就会报错
profile := NewFluentServiceProfileBuilder().
	WithType("order").
	WithId("service1").
	WithStatus(Normal).
	WithEndpoint("192.168.0.1", 8080).
	WithRegion("region1", "beijing", "China").
	WithPriority(1).
	WithLoad(100).
	Build()
// 上述代码片段把WithType和WithId的调用顺序调换了，编译器会报如下错误
// NewFluentServiceProfileBuilder().WithType undefined (type idBuilder has no field or method WithType)

  ``` 
  
 
#### 典型应用场景 
建造者模式主要应用在实例化复杂对象的场景，常见的有： 
 
 配置对象。比如创建 HTTP Server 时需要多个配置项，这种场景通过 Functional Options 模式就能够很优雅地实现配置功能。 
 SQL 语句对象。一些 ORM 框架在构造 SQL 语句时也经常会用到 Builder 模式。比如 xorm 框架中构建一个 SQL 对象是这样的： 
 ```java 
  builder.Insert().Into("table1").Select().From("table2").ToBoundSQL()
  ``` 
  
 复杂的 DTO 对象。 
 … 
 
 
#### 优缺点 
 
##### 优点 
1、将复杂的构建逻辑从业���逻���中分离出来，遵循了单一职责原则。 2、可以将复杂对象的构建过程拆分成多个步骤，提升了代码的可读性，并且可以控制属性构建的顺序。 3、对于有多种构建方式的场景，可以将 Builder 设计为一个接口来提升可扩展性。 4、Go 语言中，利用 Functional Options 模式可以更为简洁优雅地完成复杂对象的构建。 
 
##### 缺点 
1、传统的建造者模式需要新增一个 Builder 对象来完成对象的构造，Fluent API 模式下甚至还要额外增加多个 Fluent 接口，一定程度上让代码更加复杂了。 
 
#### 与其他模式的关联 
抽象工厂模式和建造者模式类似，两者都是用来构建复杂的对象，但前者的侧重点是构建对象/产品族，后者的侧重点是对象的分步构建过程。 
 
#### 参考 
[1] 【Go实现】实践GoF的23种设计模式：SOLID原则, 元闰子 
[2] Design Patterns, Chapter 3. Creational Patterns, GoF 
[3] GO 编程模式：FUNCTIONAL OPTIONS, 酷壳 CoolShell 
[4] Fluent API: Practice and Theory, Ori Roth 
[5] XORM BUILDER, xorm 
[6] 生成器模式, refactoringguru.cn 
  
点击关注，第一时间了解华为云新鲜技术~
                                        