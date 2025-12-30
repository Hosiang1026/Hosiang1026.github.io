---
title: 如何实现Go超时控
categories: 其他系列
tags:
  - Go
  - Java
abbrlink: 9a43d001
date: 2021-02-17 00:00:00
top: 110
---


为什么需要超时控制？ 请求时间过长，用户侧可能已经离开本页面了服务端还在消耗资源处理，得到的结果没有意义 过长时间的服务端处理会占用过多资源，导致并发能力下降，甚至出现不可用事故。..
<!-- more -->

### 一、Go超时控制
#### 1.1 为什么需要超时控制？
 
 请求时间过长，用户侧可能已经离开本页面了，服务端还在消耗资源处理，得到的结果没有意义 
 过长时间的服务端处理会占用过多资源，导致并发能力下降，甚至出现不可用事故 
 
#### 1.2 Go 超时控制必要性
Go 正常都是用来写后端服务的，一般一个请求是由多个串行或并行的子任务来完成的，每个子任务可能是另外的内部请求，那么当这个请求超时的时候，我们就需要快速返回，释放占用的资源，比如goroutine，文件描述符等。 
![Test](https://gitee.com/kevwan/static/raw/master/doc/images/call-chain.png  '一文搞懂如何实现 Go 超时控制') 
##### 服务端常见的超时控制
 
 进程内的逻辑处理 
 读写客户端请求，比如HTTP或者RPC请求 
 调用其它服务端请求，包括调用RPC或者访问DB等 
 
#### 1.3 没有超时控制会怎样
为了简化本文，我们以一个请求函数  
 `hardWork` 
  为例，用来做啥的不重要，顾名思义，可能处理起来比较慢。 
 
 ```java
  func hardWork(job interface{}) error {
	time.Sleep(time.Minute)
	return nil
}

func requestWork(ctx context.Context, job interface{}) error {
  return hardWork(job)
}

  ``` 
  
这时客户端看到的就一直是大家熟悉的画面 
```html
<img src="https://oscimg.oschina.net/oscnet/loading.jpg" width="25%"> 
```
绝大部分用户都不会看一分钟菊花，早早弃你而去，空留了整个调用链路上一堆资源的占用，本文不究其它细节，只聚焦超时实现。 
下面我们看看该怎么来实现超时，其中会有哪些坑。 
#### 1.4 第一版实现
大家可以先不往下看，自己试着想想该怎么实现这个函数的超时，第一次尝试： 
 
```python
	ctx, cancel := context.WithTimeout(ctx, time.Second*2)
	defer cancel()
```

```
	done := make(chan error)
	go func() {
		done &lt;- hardWork(job)
	}()
```

```sql
	select {
	case err := &lt;-done:
```
		return err
```
	case &lt;-ctx.Done():
		return ctx.Err()
```
	}

  `我们写个 main 函数测试一下```text
```javascript
  func main() {
	const total = 1000
	var wg sync.WaitGroup
	wg.Add(total)
	now := time.Now()
	for i := 0; i &lt; total; i++ {
			defer wg.Done()
			requestWork(context.Background(), "any")
		}()
	wg.Wait()
	fmt.Println("elapsed:", time.Since(now))
```
}

  `跑一下试试效果```text
  ➜ go run timeout.go
```
elapsed: 2.005725931s
```

  ``` 
  
超时已经生效。但这样就搞定了吗？ 
#### 1.5 goroutine 泄露
让我们在main函数末尾加一行代码看看执行完有多少goroutine 
 
 ```text
```
  time.Sleep(time.Minute*2)
fmt.Println("number of goroutines:", runtime.NumGoroutine())
```

  ``` 
  
sleep 2分钟是为了等待所有任务结束，然后我们打印一下当前goroutine数量。让我们执行一下看看结果 
 
number of goroutines: 1001

  `goroutine泄露了，让我们看看为啥会这样呢？首先，```text
  requestWork
  `函数在2秒钟超时后就退出了，一旦```text
  `函数退出，那么```text
  done channel
  `就没有goroutine接收了，等到执行```java
  ``` 
  这行代码的时候就会一直卡着写不进去，导致每个超时的请求都会一直占用掉一个goroutine，这是一个很大的bug，等到资源耗尽的时候整个服务就失去响应了。 
那么怎么fix呢？其实也很简单，只要 `make chan` 的时候把  
 `buffer size` 
  设为1，如下： 
 
 `done := make(chan error, 1)` 
  
```
这样就可以让 `done &lt;- hardWork(job)` 不管在是否超时都能写入而不卡住goroutine。此时可能有人会问如果这时写入一个已经没goroutine接收的channel会不会有问题，在Go里面channel不像我们常见的文件描述符一样，不是必须关闭的，只是个对象而已， `close(channel)` 只是用来告诉接收者没有东西要写了，没有其它用途。 
```
改完这一行代码我们再测试一遍： 
 
```
elapsed: 2.005655146s
```
number of goroutines: 1

  ``` 
  
goroutine泄露问题解决了！ 
#### 1.6 panic 无法捕获
让我们把  
  函数实现改成 `panic("oops")` 修改  
 `main` 
  函数加上捕获异常的代码如下： 
 
  defer func() {
    if p := recover(); p != nil {
      fmt.Println("oops, panic")
    }
  }()

}()

  `此时执行一下就会发现panic是无法被捕获的，原因是因为在```text
  ``` 
  内部起的goroutine里产生的panic其它goroutine无法捕获。 
解决方法是在  
 `requestWork` 
  里加上  
 `panicChan` 
  来处理，同样，需要  
  的  
  为1，如下： 
 

```java
	done := make(chan error, 1)
	panicChan := make(chan interface{}, 1)
				panicChan &lt;- p
```
			}
```
		}()
```

```
	}()
```

```
	case p := &lt;-panicChan:
		panic(p)
```
	}

  `改完就可以在```text
  `的调用方处理```text
  panic
  ``` 
  了。 
#### 1.7 超时时长一定对吗
上面的  
  实现忽略了传入的  
 `ctx` 
  参数，如果  
 `ctx` 
  已有超时设置，我们一定要关注此传入的超时是不是小于这里给的2秒，如果小于，就需要用传入的超时， 
 `go-zero/core/contextx` 
  已经提供了方法帮我们一行代码搞定，只需修改如下： 
 
  ctx, cancel := contextx.ShrinkDeadline(ctx, time.Second*2)

  ``` 
  
#### 1.8 Data race
这里  
  只是返回了一个  
 `error` 
  参数，如果需要返回多个参数，那么我们就需要注意  
 `data race` 
  go-zero/zrpc/internal/serverinterceptors/timeoutinterceptor.go
  ``` 
 ，这里不做赘述。 
#### 1.9 完整示例
 
  package main

import (
	"context"
	"fmt"
	"runtime"
	"sync"
	"time"

	"github.com/tal-tech/go-zero/core/contextx"
)

	time.Sleep(time.Second * 10)
}


			}
		}()

	}()

	}

	const total = 10
				}
			}()

		}()
	time.Sleep(time.Second * 20)
}

  ``` 
  
#### 1.10 更多细节
 `go-zero` 
  源码： 
 
  
 `go-zero/core/fx/timeout.go`
  go-zero/zrpc/internal/clientinterceptors/timeoutinterceptor.go
  ``` 
  
 
#### 1.11 项目地址
https://github.com/tal-tech/go-zero 

https://gitee.com/kevwan/go-zero 
欢迎使用  
  并 star 支持我们！ 
#### 1.12 微信交流
                                        