---
title: 推荐系列-golang令牌桶算法实现库 go-rate
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 365
cover_picture: ''
abbrlink: bc593011
date: 2021-04-15 09:15:42
---

&emsp;&emsp;关于我 我的博客|文章首发 go-rate是速率限制器库,基于 Token Bucket(令牌桶)算法实现。 go-rate被用在LangTrend的生产中 用于遵守GitHub API速率限制。 速率限制可以完成一些特殊的功能需求...
<!-- more -->

                                                                                                                                                                                        #### 关于我 
我的博客|文章首发 
go-rate是速率限制器库,基于 Token Bucket(令牌桶)算法实现。 go-rate被用在LangTrend的生产中 用于遵守GitHub API速率限制。 
速率限制可以完成一些特殊的功能需求，包括但不限于服务器端垃圾邮件保护、防止api调用饱和等。 
#### 库使用说明 
##### 构造限流器 
我们首先构造一个限流器对象： 
 ```java 
  limiter := NewLimiter(10, 1);

  ```  
这里有两个参数： 
 
 第一个参数是  ```java 
  r Limit
  ``` 。代表每秒可以向 Token 桶中产生多少 token。Limit 实际上是 float64 的别名。 
 第二个参数是  ```java 
  b int
  ``` 。b 代表 Token 桶的容量大小。 
 
上述的限流器的含义是：拥有一个容量为1的令牌桶，以每钞10个的速度向桶中放令牌。 
除了直接指定每秒产生的 Token 个数外，还可以用 Every 方法来指定向 Token 桶中放置 Token 的间隔，例如： 
 ```java 
  limiter := NewLimiter(Every(100 * time.Millisecond), 1);

  ```  
以上就表示每 100ms 往桶中放一个 Token。本质上也就是一秒钟产生 10 个。 
##### 消费令牌Token 
Limiter 提供了三类方法供用户消费 Token，用户可以每次消费一个 Token，也可以一次性消费多个 Token。 而每种方法代表了当 Token 不足时，各自不同的对应手段。 
###### Wait/WaitN 
 ```java 
  func (lim *Limiter) Wait(ctx context.Context) (err error)
func (lim *Limiter) WaitN(ctx context.Context, n int) (err error)

  ```  
Wait 实际上就是  ```java 
  WaitN(ctx,1)
  ``` 。 
当使用 Wait 方法消费 Token 时，如果此时桶内 Token 数组不足 (小于 N)，那么 Wait 方法将会阻塞一段时间，直至 Token 满足条件。如果充足则直接返回。 
这里可以看到，Wait 方法有一个 context 参数。我们可以设置 context 的 Deadline 或者 Timeout，来决定此次 Wait 的最长时间。 
###### Allow/AllowN 
Allow 实际上就是  ```java 
  AllowN(time.Now(),1)
  ``` 。 
AllowN 方法表示，截止到某一时刻，目前桶中数目是否至少为 n 个，满足则返回 true，同时从桶中消费 n 个 token。 反之返回不消费 Token，false。 
通常对应这样的线上场景，如果请求速率过快，就直接丢到某些请求。 
###### Reserve/ReserveN 
Reserve 相当于  ```java 
  ReserveN(time.Now(), 1)
  ``` 。 
ReserveN 的用法就相对来说复杂一些，当调用完成后，无论 Token 是否充足，都会返回一个 Reservation * 对象。 
你可以调用该对象的 Delay() 方法，该方法返回了需要等待的时间。如果等待时间为 0，则说明不用等待。必须等到等待时间之后，才能进行接下来的工作。 
或者，如果不想等待，可以调用 Cancel() 方法，该方法会将 Token 归还。 
使用一个伪代码来举例，我们可以如何使用 Reserve 方法。 
 ```java 
  r := lim.Reserve()
//是否愿意等待
f !r.OK() {
    //不愿意等待直接退出
    return
}

//如果愿意等待，将等待时间抛给用户 time.Sleep代表用户需要等待的时间。
time.Sleep(r.Delay())
Act() // 一段时间后生成生成新的令牌，开始执行相关逻辑

  ```  
###### 动态调整速率 
Limiter 支持可以调整速率和桶大小： 
 
 SetLimit(Limit) 改变放入 Token 的速率 
 SetBurst(int) 改变 Token 桶大小 
 
有了这两个方法，可以根据现有环境和条件以及我们的需求，动态地改变 Token 桶大小和速率。 
#### 案例1-单位时间只允许一次邮件发送操作 
客户端软件客户点击发送邮件，如果客户一秒钟内点击10次，就会发送10次，这明显是不合适的。如果使用速率限制，我们就可以限制一秒内只能发送一次，实现方法为： 
(令牌桶)容量为1，速度为每一秒生成一个令牌，这样可以保证一秒钟只会被执行��次，伪代码实现如下 
 ```java 
  //初始化 limiter 每秒生成1个令牌，令牌桶容量为20
limiter := rate.NewLimiter(rate.Every(time.Second), 1)
//模拟单位时间执行多次操作
for i := 0; i < 5; i++ {
	if limiter.Allow() {
		fmt.Println("发送邮件")
	} else {
		fmt.Println("请求多次，过滤")
	}
}
if limiter.Allow() {
		fmt.Println("发送邮件")
}

  ```  
 
我们发现，第一次执行是可以被允许的因为第一次的令牌被允许，之后的请求失败是因为还没有生成新的令牌，所以需要等待1秒，之后又可以进行发送邮件操作。 
通过这样一个案例，相信大家对令牌桶的实现场景有了一个基本的了解。 
#### 案例2——令牌取出单个和多个 
初始化令牌桶容量为20，设置每100毫秒生成一个令牌，即1秒生产10个令牌。编码测试功能 
 ```java 
  //初始化 limiter 每秒10个令牌，令牌桶容量为20
limiter := rate.NewLimiter(rate.Every(time.Millisecond*100), 20)
for i := 0; i < 25; i++ {
	if limiter.Allow() {
		fmt.Println("success") //do something
	} else {
		fmt.Println("busy")
	}
}

//阻塞直到获取足够的令牌或者上下文取消
ctx, _ := context.WithTimeout(context.Background(), time.Second*2)
fmt.Println("start get token", time.Now())
err := limiter.WaitN(ctx, 20)
if err != nil {
	fmt.Println("error", err)
	return
}
fmt.Println("success get token", time.Now())

  ```  
第二段编码阻塞的场景在于，一次性取出20个令牌给予2秒的等待时间，如果有20个令牌可以取出打印成功消息，如果2秒等待时间内没有20个令牌可以取出，程序直接退出，即失败。 
#### 参考 
go-rate 
Golang 标准库限流器 time/rate 使用介绍 
Golang限流器rate使用 
#### END 
欢迎关注公众号 程序员工具集 👍👍 致力于分享优秀的开源项目、学习资源 、常用工具 
回复关键词“关注礼包”，送你一份最全的程序员技能图谱。
                                        