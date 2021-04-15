---
title: 推荐系列-NetCore的缓存使用详例
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 2085
cover_picture: 'https://gitee.com/happlyfox/img/raw/master/qrcode_8cm.jpg'
abbrlink: b351a9d2
date: 2021-04-15 09:46:45
---

&emsp;&emsp;关于我 作者博客|文章首发 缓存基础知识 缓存可以减少生成内容所需的工作，从而显著提高应用程序的性能和可伸缩性。 缓存最适用于不经常更改的 数据，生成 成本很高。 通过缓存，可以比从数据...
<!-- more -->

                                                                                                                                                                                        ### 关于我 
作者博客|文章首发 
### 缓存基础知识 
缓存可以减少生成内容所需的工作，从而显著提高应用程序的性能和可伸缩性。 缓存最适用于不经常更改的 数据，生成 成本很高。 通过缓存，可以比从数据源返回的数据的副本速度快得多。 应该对应用进行编写和测试，使其 永不 依赖于缓存的数据。 
ASP.NET Core 支持多个不同的缓存。 最简单的缓存基于 IMemoryCache。  
 ```java 
  IMemoryCache
  ``` 
  表示存储在 web 服务器的内存中的缓存。 在服务器场上运行的应用 (多台服务器) 应确保会话在使用内存中缓存时处于粘滞状态。 粘滞会话确保来自客户端的后续请求都将发送到相同的服务器。 
内存中缓存可以存储任何对象。 分布式缓存接口仅限  
 ```java 
  byte[]
  ``` 
  。 内存中和分布式缓存将缓存项作为键值对。 
### 缓存指南 
 
 代码应始终具有回退选项，以获取数据，而 不是依赖于可用的缓存值。 
 缓存使用稀有资源内存,限制缓存增长： 
   
   不要 使用外部 输入作为缓存键。 
   使用过期限制缓存增长。 
   使用 SetSize、Size 和 SizeLimit 限制缓存大小]。 ASP.NET Core 运行时不会根据内存 压力限制缓存 大小。 开发人员需要限制缓存大小。 
    
 
### 使用 
#### DI注入 
创建一个NetCore控制台项目，进行缓存的项目演示。 
控制台项目只有一个初始化的Program.cs文件。基于NetCore进行项目编码，每一步就是创建一个基础模板，使用依赖注入的方式。 
 
 ```java 
  nuget install Microsoft.Extensions.Hosting

  ``` 
  
 
 ```java 
    public static class Program
    {
        static async void Main(string[] args)
        {
           var builder = new HostBuilder().ConfigureServices((context, service) =>
            {

            });

           await builder.RunConsoleAsync();
        }
    }

  ``` 
  
注入缓存服务,控制台需要下载库 Microsoft.Extensions.Caching.Memory 
 
 ```java 
  nuget install Microsoft.Extensions.Caching.Memory

  ``` 
  
 
 ```java 
    public static class Program
    {
        static async void Main(string[] args)
        {
           var builder = new HostBuilder().ConfigureServices((context, service) =>
            {
      		  service.AddMemoryCache();
      		  
              service.AddScoped<CacheService>();//实际测试服务

              service.AddHostedService<BackgroundJob>();//后台执行方法
            });

           await builder.RunConsoleAsync();
        }
    }

  ``` 
  
后台服务 
 
 ```java 
  public class BackgroundJob : IHostedService
    {
        private readonly CacheService _cacheService;

        public BackgroundJob(CacheService cacheService)
        {
            _cacheService = cacheService;
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            _cacheService.Action();

            return Task.CompletedTask;
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }
    }

  ``` 
  
#### MemoryCache使用总结 
通过构造函数自动注入IMemoryCache 
 
 ```java 
  public class CacheService
{
    private readonly IMemoryCache _memoryCache;

    public CacheService(IMemoryCache memoryCache)
    {
   		 _memoryCache = memoryCache;
    }
}

  ``` 
  
#### 最基本的使用 
Set方法根据Key设置缓存，默认缓存不过期 
Get方法根据Key取出缓存 
 
 ```java 
  /// <summary>
/// 缓存设置
/// </summary>
public void BaseCache()
{
    string cacheKey = "timestamp";
    //set cache
    _memoryCache.Set(cacheKey, DateTime.Now.ToString());

    //get cache
    Console.WriteLine(_memoryCache.Get(cacheKey));
}

  ``` 
  
IMemoryCache提供一些好的语法糖供开发者使用，具体内容看下方文档 
 
 ```java 
  /// <summary>
/// 特殊方法的使用
/// </summary>
public void ActionUse()
{
    //场景-如果缓存存在，取出。如果缓存不存在，写入
    //原始写法
    string cacheKey = "timestamp";
    if (_memoryCache.Get(cacheKey) != null)
    {
        _memoryCache.Set(cacheKey, DateTime.Now.ToString());
    }
    else
    {
        Console.WriteLine(_memoryCache.Get(cacheKey));
    }

    //新写法
    var dataCacheValue = _memoryCache.GetOrCreate(cacheKey, entry =>
     {
         return DateTime.Now.ToString();
     });
    Console.WriteLine(dataCacheValue);

    //删除缓存
    _memoryCache.Remove(cacheKey);

    //场景 判断缓存是否存在的同时取出缓存数据
    _memoryCache.TryGetValue(cacheKey, out string cacheValue);
    Console.WriteLine(cacheValue);

}

  ``` 
  
##### 缓存过期策略 
设置缓存常用的方式主要是以下二种 
 
 绝对到期（指定在一个固定的时间点到期） 
 滑动到期（在一个时间长度内没有被命中则过期） 
 组合过期 (绝对过期+滑动过期） 
 
###### 绝对到期 
过期策略 5秒后过期 
 
 ```java 
  //set absolute cache
string cacheKey = "absoluteKey";
_memoryCache.Set(cacheKey, DateTime.Now.ToString(), TimeSpan.FromSeconds(5));

//get absolute cache
for (int i = 0; i < 6; i++)
{
    Console.WriteLine(_memoryCache.Get(cacheKey));
    Thread.Sleep(1000);
}

  ``` 
  
###### 滑动到期 
过期策略 2秒的滑动过期时间，如果2秒内有访问，过期时间延后。当2秒的区间内没有访问，缓存过期 
 
 ```java 
  //set slibing cache
string cacheSlibingKey = "slibingKey";
MemoryCacheEntryOptions options = new MemoryCacheEntryOptions();
options.SlidingExpiration = TimeSpan.FromSeconds(2);

_memoryCache.Set(cacheSlibingKey, DateTime.Now.ToString(), options);

//get slibing cache
for (int i = 0; i < 2; i++)
{
    Console.WriteLine(_memoryCache.Get(cacheSlibingKey));
    Thread.Sleep(1000);
}
for (int i = 0; i < 2; i++)
{
    Thread.Sleep(2000);
    Console.WriteLine(_memoryCache.Get(cacheSlibingKey));
}

  ``` 
  
###### 组合过期 
过期策略 
6秒绝对过期+2秒滑动过期 
满足任意一个缓存都将失效 
 
 ```java 
  string cacheCombineKey = "combineKey";
MemoryCacheEntryOptions combineOptions = new MemoryCacheEntryOptions();
combineOptions.SlidingExpiration = TimeSpan.FromSeconds(2);
combineOptions.AbsoluteExpiration = DateTime.Now.AddSeconds(6);

_memoryCache.Set(cacheCombineKey, DateTime.Now.ToString(), combineOptions);

//get slibing cache
for (int i = 0; i < 2; i++)
{
    Console.WriteLine(_memoryCache.Get(cacheCombineKey));
    Thread.Sleep(1000);
}

for (int i = 0; i < 6; i++)
{
    Thread.Sleep(2000);
    Console.WriteLine(i+"|" + _memoryCache.Get(cacheCombineKey));
}

Console.WriteLine("------------combineKey End----------------");

  ``` 
  
#### 缓存状态变化事件 
当缓存更新、删除时触发一个回调事件，记录缓存变化的内容。 
 
 ```java 
  /// <summary>
/// cache状态变化回调
/// </summary>
public void CacheStateCallback()
{
    MemoryCacheEntryOptions options = new MemoryCacheEntryOptions();
    options.AbsoluteExpiration = DateTime.Now.AddSeconds(3
        );
    options.RegisterPostEvictionCallback(MyCallback, this);

    //show callback console
    string cacheKey = "absoluteKey";
    _memoryCache.Set(cacheKey, DateTime.Now.ToString(), options);

    Thread.Sleep(500);
    _memoryCache.Set(cacheKey, DateTime.Now.ToString(), options);

    _memoryCache.Remove(cacheKey);

}

private static void MyCallback(object key, object value, EvictionReason reason, object state)
{
    var message = $"Cache entry state change:{key} {value} {reason} {state}";
    ((CacheService)state)._memoryCache.Set("callbackMessage", message);

    Console.WriteLine(message);
}

  ``` 
  
#### 缓存依赖策略 
 
 
 ```java 
  /// <summary>
/// 缓存依赖策略
/// </summary>
public void CacheDependencyPolicy()
{
    string DependentCTS = "DependentCTS";
    string cacheKeyParent = "CacheKeys.Parent";
    string cacheKeyChild = "CacheKeys.Child";

    var cts = new CancellationTokenSource();
    _memoryCache.Set(DependentCTS, cts);

    //创建一个cache策略
    using (var entry = _memoryCache.CreateEntry(cacheKeyParent))
    {
        //当前key对应的值
        entry.Value = "parent" + DateTime.Now;

        //当前key对应的回调事件
        entry.RegisterPostEvictionCallback(MyCallback, this);

        //基于些key创建一个依赖缓存
        _memoryCache.Set(cacheKeyChild, "child" + DateTime.Now, new CancellationChangeToken(cts.Token));
    }

    string ParentCachedTime = _memoryCache.Get<string>(cacheKeyParent);
    string ChildCachedTime = _memoryCache.Get<string>(cacheKeyChild);
    string callBackMsg = _memoryCache.Get<string>("callbackMessage");
    Console.WriteLine("第一次获取");
    Console.WriteLine(ParentCachedTime + "|" + ChildCachedTime + "|" + callBackMsg);

    //移除parentKey
    _memoryCache.Get<CancellationTokenSource>(DependentCTS).Cancel();
    Thread.Sleep(1000);

    ParentCachedTime = _memoryCache.Get<string>(cacheKeyParent);
    ChildCachedTime = _memoryCache.Get<string>(cacheKeyChild);
    callBackMsg = _memoryCache.Get<string>("callbackMessage");
    Console.WriteLine("第二次获取");
    Console.WriteLine(ParentCachedTime + "|" + ChildCachedTime + "|" + callBackMsg);
}

  ``` 
  
### 参考资料 
AspNetCore中的缓存内存 
.NetCore缓存篇之MemoryCache 
Asp.Net Core 轻松学-在.Net Core 使用缓存和配置依赖策略 
拥抱.NET Core系列：MemoryCache 缓存过期 
推荐阅读 
Redis��具收费后新的开源已出现 
GitHub上Star最高的工程师技能图谱 
中国程序员最容易发错的单词  
推荐!!! Markdown图标索引网站 
### 最后 
本文到此结束，希望对你有帮助 😃 
如果还有什么疑问或者建议，可以多多交流，原创文章，文笔有限，才疏学浅，文中若有不正之处，万望告知。 
更多精彩技术文章汇总在我的 公众号【程序员工具集】，持续更新，欢迎关注订阅收藏。 
![Test](https://gitee.com/happlyfox/img/raw/master/qrcode_8cm.jpg  'NetCore的缓存使用详例')
                                        