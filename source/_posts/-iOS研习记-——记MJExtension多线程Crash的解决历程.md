---
title: 推荐系列--iOS研习记-——记MJExtension多线程Crash的解决历程
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 668
cover_picture: 'https://oscimg.oschina.net/oscnet/up-d46736eb6d252e729616cf2a6d78d6e5920.png'
abbrlink: d9716e6a
date: 2021-04-15 09:53:06
---

&emsp;&emsp;[iOS研习记]——记MJExtension多线程Crash的解决历程 难缠的Crash问题 本篇博客的起源是由于收集到线上用户产生的一些难缠的Crash问题，通过堆栈信息观察，Crash的堆栈信息主要有两类： 一类...
<!-- more -->

                                                                                                                                                                                         
### [iOS研习记]——记MJExtension多线程Crash的解决历程 
 
#### 难缠的Crash问题 
    本篇博客的起源是由于收集到线上用户产生的一些难缠的Crash问题，通过堆栈信息观察，Crash的堆栈信息主要有两类： 
一类如下： 
 
 ```java 
  1   MJExtensionDemo                     0x000000010903a5e0 main + 0,
2   MJExtension                         0x000000010923f00d +[NSObject(MJClass) mj_setupBlockReturnValue:key:] + 333,
3   MJExtension                         0x000000010923ec86 +[NSObject(MJClass) mj_setupIgnoredPropertyNames:] + 70,
4   MJExtensionTests                    0x00000001095ebe1b -[MJExtensionTests testNestedModelArray] + 1467,
5   CoreFoundation                      0x00007fff204272fc __invoking___ + 140,
6   CoreFoundation                      0x00007fff204247b6 -[NSInvocation invoke] + 303,
  ``` 
  
一类如下: 
 
 ```java 
  1   MJExtensionDemo                     0x000000010729e5e0 main + 0,
2   MJExtension                         0x00000001074a3255 +[NSObject(MJClass) mj_totalObjectsWithSelector:key:] + 453,
3   MJExtension                         0x00000001074a2ccf +[NSObject(MJClass) mj_totalIgnoredPropertyNames] + 47,
4   MJExtension                         0x00000001074a3dcb -[NSObject(MJKeyValue) mj_setKeyValues:context:] + 443,
5   MJExtension                         0x00000001074a3bdf -[NSObject(MJKeyValue) mj_setKeyValues:] + 79,
6   MJExtension                         0x00000001074a6536 +[NSObject(MJKeyValue) mj_objectWithKeyValues:context:] + 710,
7   MJExtension                         0x00000001074a623f +[NSObject(MJKeyValue) mj_objectWithKeyValues:] + 79,
  ``` 
  
此时使用的MJExtension版本为3.2.4，虽然堆栈信息比较清楚，然而其最后的调用都是在MJExtension内部，且发生此Crash的几率非常小(约为万分之几)，定位和解决此Crash并不容易。 
     通过分析，发现此Crash有如下特点： 
 
 调用栈中最终定位到的函数都在MJExtension进行JSON转对象或模型setup配置时。 
 只有在多线程使用MJExtension方法时会出现此Crash。 
 是App在某次版本更新后才开始出现此类Crash。 
 
通过分析上面的特点，可以推理出： 
 
 问题一定出在mj_objectWithKeyValues方法或mj_setup相关方法中。 
 此问题一定是由于业务的某种使用方式或场景的改变触发的。 
 一定和多线程相关，推测和锁可能相关。 
 
 
#### 问题的定位与复现 
    对于iOS端开发，定位和解决Crash毕竟两个流程，首先是根据线索来分析和定位问题，得到一个大概的猜想，之后按照自己的猜想去提供外部条件，来尝试复现问题，如果问题能够成功复现并复原与线程问题相似的堆栈现场，则基本完成了90%的工作，剩下的10%才是修复此问题。 
    首先，根据前面我们对问题的分析和推理，可以从mj_objectWithKeyValues和mj_setup方法进行切入，通过对MJExtension代码的Review，可以发现这些方法中有一个宏使用的非常频繁，后来也证明问题确实出在这个宏的定义上： 
![Test](https://oscimg.oschina.net/oscnet/up-d46736eb6d252e729616cf2a6d78d6e5920.png  '-iOS研习记-——记MJExtension多线程Crash的解决历程') 
这几个宏的定义如下： 
 
 ```java 
  #ifndef MJ_LOCK
#define MJ_LOCK(lock) dispatch_semaphore_wait(lock, DISPATCH_TIME_FOREVER);
#endif

#ifndef MJ_UNLOCK
#define MJ_UNLOCK(lock) dispatch_semaphore_signal(lock);
#endif

// 信号量
#define MJExtensionSemaphoreCreate \
static dispatch_semaphore_t signalSemaphore; \
static dispatch_once_t onceTokenSemaphore; \
dispatch_once(&onceTokenSemaphore, ^{ \
    signalSemaphore = dispatch_semaphore_create(1); \
});

#define MJExtensionSemaphoreWait MJ_LOCK(signalSemaphore)
#define MJExtensionSemaphoreSignal MJ_UNLOCK(signalSemaphore)


  ``` 
  
可以看到，这个宏的最终使用方式是通过信号量来实现锁逻辑。问题出在static和宏定义本身，宏定义是做简单的替换，因此在实际使用时，dispatch_semaphore_t信号量变量被定义成了局部静态变量，局部静态 变量有一个特点：其被创建后会被放入全局数据区，但是其受函数作用域的控制，即创建后不会销毁，函数内永远可用，但是对函数外来说是隐藏的。如果在不同的函数中使用了相同名称的静态局部变量，真正放入全局数据区的实际上是多个不同的变量。 
 
 到此，我们基本将问题定位到了，当多线程对MJExtension中的多个不同的函数进行调用时，如果这些函数中都有此加锁逻辑，实际上这个锁逻辑并没有生效，会产生多线程数据读写Crash。要复现这个场景就非常简单了： 
 
 ```java 
  dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_HIGH, 0), ^{
    for (int i = 0; i < 1000; i++) {
        MJStatusResult *result = [MJStatusResult mj_objectWithKeyValues:dict];
    }
});
for (int i = 0; i < 1000; i++) {
    [MJStatus mj_setupIgnoredPropertyNames:^NSArray *{
        return @[@"name"];
    }];
}
  ``` 
  
通过场景复现，基本可以定位此问题原因。 
 
#### 几个疑问的解答 
 
##### 1. 产生此Crash的核心原理 
多线程锁失效导致的多线程读写异常。 
 
##### 2.为何版本更新后会出现 
需要从业务使用上来分析，之前的版本类似mj_setup相关方法的调用会放入类的+load方法中，这个在main函数调用之前，所有类的解析配置都已完成，基本不会出现多线程问题，新版本做了冷启动的优化，将mj_setup相关方法放入了+(void)initialize方法中，使得多线程问题被触发的概率大大增加了。 
 
#### MJExtension后续版本 
截止到本篇博客编写时间，MJExtension最新版本3.2.5已经处理了这个锁问题的Bug，其修复方式是将static修改为了extern，使这个信号量变量被声明为了一个全局变量，如下： 
 
 ```java 
  #ifndef MJ_LOCK
#define MJ_LOCK(lock) dispatch_semaphore_wait(lock, DISPATCH_TIME_FOREVER);
#endif

#ifndef MJ_UNLOCK
#define MJ_UNLOCK(lock) dispatch_semaphore_signal(lock);
#endif

// 信号量
#define MJExtensionSemaphoreCreate \
extern dispatch_semaphore_t mje_signalSemaphore; \
extern dispatch_once_t mje_onceTokenSemaphore; \
dispatch_once(&mje_onceTokenSemaphore, ^{ \
    mje_signalSemaphore = dispatch_semaphore_create(1); \
});


// .m文件中
dispatch_semaphore_t mje_signalSemaphore;
dispatch_once_t mje_onceTokenSemaphore;
  ``` 
  
修改后的代码保证了锁的唯一性。 
 
#### 建议 
使用MJExtension库时，如果需要进行解析配置，优先使用复写相关配置+方法来实现，例如： 
 
 ```java 
  // 不建议的使用方式
+ (void)initialize {
    [self mj_setupObjectClassInArray:^NSDictionary *{
        return @{
            @"nicknames" : MJStatus.class
        };
    }];
}

// 建议的使用方式
+ (NSDictionary *)mj_objectClassInArray {
    return @{
        @"nicknames" : @"MJStatus"
    };
}

  ``` 
  
并且，在配置类型时，尽量使用NSString而不要使用Class，避免类过早的被加载。
                                        