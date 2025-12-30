---
title: 极速精简Go版Logstash
categories: 其他系列
tags:
  - TypeScript
  - Java
abbrlink: 3aebe5fd
date: 2019-02-26 00:00:00
top: 14
---


前言 今天来介绍 go-zero 生态的另一个组件 go-stash。这是一个 logstash 的 Go 语言替代版，我们用 go-stash 相比原先的 logstash 节省了2/3的服务器资源。如果你在用 logstash，不妨试试，...
<!-- more -->

### 一、极速精简Go版Logstash
#### 1.1 前言
今天来介绍  
 `go-zero` 
  生态的另一个组件  
 `go-stash` 
 。这是一个  
 `logstash` 
  的 Go 语言替代版，我们用  
  相比原先的  
  节省了2/3的服务器资源。如果你在用  
 ，不妨试试，也可以看看基于  
  实现这样的工具是多么的容易，这个工具作者仅用了两天时间。 
#### 1.2 整体架构
先从它的配置中，我们来看看设计架构。 
 
 ```sql
  Clusters:
  - Input:
      Kafka:
        # Kafka 配置 --&gt; 联动 go-queue
    Filters:
    	# filter action
      - Action: drop            
      - Action: remove_field
      - Action: transfer      
    Output:
      ElasticSearch:
        # es 配置 {host, index}

  `看配置名：```text
  kafka
  `是数据输出端，```text
  es
  `是数据输入端，```text
  filter
  ``` 
  抽象了数据处理过程。 
对，整个  
  就是如 config 配置中显示的，所见即所得。 
![Test](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/630092133bfb4b0ba8889ab1cdd799cf~tplv-k3u1fbpfcp-watermark.image  '极速精简 Go 版 Logstash') 
#### 1.3 启动
从  
 `stash.go` 
  的启动流程大致分为几个部分。因为可以配置多个  
 `cluster` 
 ，那从一个  
  分析： 
 
 建立与  
 `es` 
  的连接【传入  
 `es` 
  配置】 
 构建  
 `filter processors` 
 【 
 `es` 
  前置处理器，做数据过滤以及处理，可以设置多个】 
 完善对  
 `es` 
  中 索引配置，启动  
 `handle` 
  ，同时将  
 `filter` 
  加入handle【处理输入输出】 
 连接下游的  
 `kafka` 
 ，将上面创建的  
  传入，完成  
  和  
 `es` 
  之间的数据消费和数据写入 
 
#### 1.4 MessageHandler
在上面架构图中，中间的  
  只是从 config 中看到，其实更详细是  
 `MessageHandler` 
  的一部分，做数据过滤和转换，下面来说说这块。 
> 以下代码：https://github.com/tal-tech/go-stash/tree/master/stash/handler/handler.go 
 
 ```java
  type MessageHandler struct {
	writer  *es.Writer
	indexer *es.Index
	filters []filter.FilterFunc
}

  `这个就对应上面说的，```text
  `只是其中一部分，在结构上```text
  MessageHandler
  `是对接下游```text
  es
  `，但是没有看到对```text
  kafka
  ``` 
  的操作。 
别急，从接口设计上  
  实现了  
 `go-queue` 
  中  
 `ConsumeHandler` 
  接口。 
这里，上下游就串联了： 
 
  
  接管了  
 `es` 
  的操作，负责数据处理到数据写入 
 对上实现了  
  的  
 `Consume` 
  操作。这样在消费过程中执行  
 `handler` 
  的操作，从而写入  
 `es` 
  
 
```
实际上， `Consume()` 也是这么处理的： 
```
 
```java
  func (mh *MessageHandler) Consume(_, val string) error {
	var m map[string]interface{}
  // 反序列化从 kafka 中的消息
	if err := jsoniter.Unmarshal([]byte(val), &amp;m); err != nil {
```
		return err
	}
```
	// es 写入index配置
	index := mh.indexer.GetIndex(m)
  // filter 链式处理【因为没有泛型，整个处理都是 `map进map出`】
	for _, proc := range mh.filters {
		if m = proc(m); m == nil {
```
			return nil
		}
```
	bs, err := jsoniter.Marshal(m)
	if err != nil {
```
	}
```
	// es 写入
	return mh.writer.Write(index, string(bs))
```
}

  ``` 
  
#### 1.5 数据流
说完了数据处理，以及上下游的连接点。但是数据要从 `kafka -&gt; es` ，数据流出这个动作从  
  角度看，应该是由开发者主动  
 `pull data from kafka` 
 。 
那么数据流是怎么动起来？我们回到主程序 https://github.com/tal-tech/go-stash/blob/master/stash/stash.go 
其实 启动 整个流程中，其实就是一个组合模式： 
 
 ```css
```go
  func main() {
	// 解析命令行参数，启动优雅退出
```
	...
```python
  // service 组合模式
	group := service.NewServiceGroup()
	defer group.Stop()
```

```
	for _, processor := range c.Clusters {
		// 连接es
```
    ...
```
		// filter processors 构建
```
    ...
```
    // 准备es的写入操作 {写入的index, 写入器writer}
		handle := handler.NewHandler(writer, indexer)
		handle.AddFilters(filters...)
		handle.AddFilters(filter.AddUriFieldFilter("url", "uri"))
    // 按照配置启动kafka，并将消费操作传入，同时加入组合器
		for _, k := range toKqConf(processor.Input.Kafka) {
			group.Add(kq.MustNewQueue(k, handle))
```
		}
```
	// 启动这个组合器
	group.Start()
```
}

  `整个数据流，就和这个```text
  group
  `组合器有关了。```java
```
	|- group.doStart()
		|- [service.Start() for service in group.services]
```

  `那么说明加入```text
  group
  `的```text
  service
  `都是实现```java
```
  Start()
```
  `。也就是说```text
  kafka
  `端的启动逻辑在```java
  `：```java
```go
  func (q *kafkaQueue) Start() {
	q.startConsumers()
	q.startProducers()
```

```
	q.producerRoutines.Wait()
	close(q.channel)
	q.consumerRoutines.Wait()
```
}

  `启动```text
  kafka
  ``` 
  消费程序 
 启动  
  消费拉取端【可能会被名字迷惑，实际上是从  
  拉取消息到  
 `q.channel` 
 】 
 消费程序终止，收尾工作 
 
而我们传入  
  中的  
 ，上文说过其实是  
 ，而这个方法就是在 `q.startConsumers()` 中执行的： 
 
	|- [q.consumeOne(key, value) for msg in q.channel]
		|- q.handler.Consume(key, value)

  ``` 
  
这样整个数据流就彻底串起来了： 
#### 1.6 总结
作为  
  第一篇文章，本篇从架构和设计上整体介绍  
  ，有关性能和为什么我们要开发一个这样的组件，我们下篇文章逐渐揭晓。 
https://github.com/tal-tech/go-stash 
关于  
https://github.com/tal-tech/go-zero 

https://gitee.com/kevwan/go-zero 
欢迎使用 go-zero 并 star 支持我们！ 