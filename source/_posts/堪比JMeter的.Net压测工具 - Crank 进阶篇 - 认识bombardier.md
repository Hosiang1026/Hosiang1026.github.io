---
title: 推荐系列-3. 堪比JMeter的.Net压测工具 - Crank 进阶篇 - 认识bombardier
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 320
cover_picture: 'https://asciinema.org/a/Uz2fTLkoBmIVD8Xc7HwQqJAqg.svg'
abbrlink: 5fa8ea16
date: 2021-07-11 11:55:56
---

&emsp;&emsp; 前言 通过之前的学习，我们已经了解了各参数以及配置的意义，接下来的文章我们分别从bombardier以及wrk入手，进一步了解彼此之间的联系 2. 认识 bombardier bombardier 是一个 HTTP(S) 基...
<!-- more -->

                                                                                                                    
通过之前的学习，我们已经了解了各参数以及配置的意义，接下来的文章我们分别从bombardier以及wrk入手，进一步了解彼此之间的联系 
#### 2. 认识 bombardier 
bombardier 是一个 HTTP(S) 基准测试工具。它是用 Go 编程语言编写的，并使用优秀的fasthttp代替 Go 的默认 http 库，因为它具有闪电般的快速性能，详细文档查看 
其支持参数： 
 
 ```java 
  -c, --connections=125       Maximum number of concurrent connections
-t, --timeout=2s            Socket/request timeout
-l, --latencies             Print latency statistics
-m, --method=GET            Request method
-b, --body=""               Request body
-f, --body-file=""          File to use as request body
-s, --stream                Specify whether to stream body using chunked
                            transfer encoding or to serve it from memory
    --cert=""               Path to the client's TLS Certificate
    --key=""                Path to the client's TLS Certificate Private Key
-k, --insecure              Controls whether a client verifies the server's
                            certificate chain and host name
-H, --header="K: V" ...     HTTP headers to use(can be repeated)
-n, --requests=[pos. int.]  Number of requests
-d, --duration=10s          Duration of test
-r, --rate=[pos. int.]      Rate limit in requests per second
    --fasthttp              Use fasthttp client
    --http1                 Use net/http client with forced HTTP/1.x
    --http2                 Use net/http client with enabled HTTP/2.0
-p, --print=<spec>          Specifies what to output. Comma-separated list of
                            values 'intro' (short: 'i'), 'progress' (short:
                            'p'), 'result' (short: 'r'). Examples:

                              * i,p,r (prints everything)
                              * intro,result (intro & result)
                              * r (result only)
                              * result (same as above)
-q, --no-print              Don't output anything
-o, --format=<spec>         Which format to use to output the result. <spec>
                            is either a name (or its shorthand) of some format
                            understood by bombardier or a path to the
                            user-defined template, which uses Go's
                            text/template syntax, prefixed with 'path:' string
                            (without single quotes), i.e.
                            "path:/some/path/to/your.template" or
                            "path:C:\some\path\to\your.template" in case of
                            Windows. Formats understood by bombardier are:

                              * plain-text (short: pt)
                              * json (short: j)

  ``` 
  
并且bombardier支持多平台，可以在Windows、Linux、OSX系统上运行，那接下来我们使用bombardier测试一下百度的压测情况 
安装（WSL-Ubuntu）： 
 
 ```java 
  sudo apt install wget
sudo wget https://github.com/codesenberg/bombardier/releases/download/v1.2.5/bombardier-linux-arm64

  ``` 
  
运行： 
 
 ```java 
  ./bombardier-linux-arm64  -c 200 -d 1s --insecure -l https://www.baidu.com --print r --format json

  ``` 
  
 
其中: 
 
 req1xx代表http响应码为1** 
 req2xx代表http响应码为2** 
 req3xx代表http响应码为3** 
 req4xx代表http响应码为4** 
 req5xx代表http响应码为5** 
 result.rps.mean代表每秒请求数 
 result.rps.max代表每秒最大请求数 
 result.latency.mean代表每毫秒延迟 
 result.latency.max代表每毫秒最大延迟 
 
#### 3. 了解Microsoft.Crank.Jobs.Bombardier 
在Microsoft.Crank.Jobs.Bombardier项目中Program.cs 
 
 根据参数获取-w、-d、-n、-f参数信息 
 校验压测时长、请求数等参数信息 
 判断当前运行环境是Windows、Linux、OSX，根据环境下载对应的bombardier，并根据传递的 
 根据yml参数最后拼装bombardier的原始命令: 
 
 
 
 将输出的结果使用追加到stringBuilder上，再赋值给output 
 通过JObject.Parse解析指标，最后通过BenchmarksEventSource存储并输出到控制台或数据库、csv、json中 
 
其中 
 
 请求总数 = req1xx + req2xx + req3xx + req4xx + req5xx + others 
 成功请求数 = req2xx + req3xx 
 失败请求数 = 请求总数 - 成功请求数 
 
 
 ```java 
  BenchmarksEventSource.Register("bombardier/requests;http/requests", Operations.Max, Operations.Sum, "Requests", "Total number of requests", "n0");
BenchmarksEventSource.Register("bombardier/badresponses;http/requests/badresponses", Operations.Max, Operations.Sum, "Bad responses", "Non-2xx or 3xx responses", "n0");

BenchmarksEventSource.Register("bombardier/latency/mean;http/latency/mean", Operations.Max, Operations.Avg, "Mean latency (us)", "Mean latency (us)", "n0");
BenchmarksEventSource.Register("bombardier/latency/max;http/latency/max", Operations.Max, Operations.Max, "Max latency (us)", "Max latency (us)", "n0");

BenchmarksEventSource.Register("bombardier/rps/mean;http/rps/mean", Operations.Max, Operations.Sum, "Requests/sec", "Requests per second", "n0");
BenchmarksEventSource.Register("bombardier/rps/max;http/rps/max", Operations.Max, Operations.Sum, "Requests/sec (max)", "Max requests per second", "n0");
BenchmarksEventSource.Register("bombardier/throughput;http/throughput", Operations.Max, Operations.Sum, "Read throughput (MB/s)", "Read throughput (MB/s)", "n2");

BenchmarksEventSource.Register("bombardier/raw", Operations.All, Operations.All, "Raw results", "Raw results", "json");

var total =
    document["result"]["req1xx"].Value<long>()
    + document["result"]["req2xx"].Value<long>()
    + document["result"]["req3xx"].Value<long>()
    + document["result"]["req3xx"].Value<long>()
    + document["result"]["req4xx"].Value<long>()
    + document["result"]["req5xx"].Value<long>()
    + document["result"]["others"].Value<long>();

var success = document["result"]["req2xx"].Value<long>() + document["result"]["req3xx"].Value<long>();

BenchmarksEventSource.Measure("bombardier/requests;http/requests", total);
BenchmarksEventSource.Measure("bombardier/badresponses;http/requests/badresponses", total - success);

BenchmarksEventSource.Measure("bombardier/latency/mean;http/latency/mean", document["result"]["latency"]["mean"].Value<double>());
BenchmarksEventSource.Measure("bombardier/latency/max;http/latency/max", document["result"]["latency"]["max"].Value<double>());

BenchmarksEventSource.Measure("bombardier/rps/max;http/rps/max", document["result"]["rps"]["max"].Value<double>());
BenchmarksEventSource.Measure("bombardier/rps/mean;http/rps/mean", document["result"]["rps"]["mean"].Value<double>());

BenchmarksEventSource.Measure("bombardier/raw", output);

var bytesPerSecond = document["result"]["bytesRead"].Value<long>() / document["result"]["timeTakenSeconds"].Value<double>();

// B/s to MB/s
BenchmarksEventSource.Measure("bombardier/throughput", bytesPerSecond / 1024 / 1024);

  ``` 
  
#### 4. 解读bombardier.yml各参数作用 
 
 connections: 最大并发连接数，默认: 256 
 warmup: 预热时间，默认15s，与执行duration类似，而并非压测次数 
   
   当warmup > 0时，会先预热warmup秒后再执行一次压测，第二次的压测才是最后返回的结果 
   当warmup = 0时，不进行预热，直接开始压测 
    
 duration: 测试时长，单位: s 
 requests: 请求数 
 rate: 每秒请求数限制 
 transport: 传输方式。默认: fasthttp 、支持fasthttp、http1、http2三种 
 presetHeaders: 预设header，根据全局参数headers，自选其一即可，选择json，那请求的header即为: --header "Accept: application/json,text/html;q=0.9,application/xhtml+xml;q=0.9,application/xml;q=0.8,/;q=0.7" --header "Connection: keep-alive" 
 customHeaders: 自定义headers，如果预设headers中没有需要的header，则通过重写customHeaders，以完成自定义header的目的 
 serverUri: 自定义url，如果此参数存在，则请求地址为: {serverUri}:{serverPort}{path} 
 serverPort: 服务端口 
 serverScheme: 服务的Scheme，默认http、支持http、https两种 
 serverAddress: 服务地址、不包含http、例如: www.baidu.com，如果serverUri存在，此配置无效，如果不存在，请求格式为: {serverScheme}://{serverAddress}:{serverPort}{path} 
 path: 服务接口地址，不包含域，例如: /api/check/healthy 
 bodyFile: body内容，仅在非Get请求时使用，支持远程路径与本地绝对路径（Agent服务的绝对地址，非Controller端的绝对地址） 
 verb: 请求方式: 默认GET、支持POST、PUT、DELETE、PATCH、GET 
 
#### 5. 总结 
优势: 
 
 跨平台 
 用法简单 
 使用go语言开发、性能高 
 
劣势: 
 
 不支持动态参数 
 不支持多个接口同时压测 
 
 
源码地址：https://github.com/doddgu/crank/tree/sample 
#### 开源地址 
MASA.BuildingBlocks：https://github.com/masastack/MASA.BuildingBlocks 
MASA.Contrib：https://github.com/masastack/MASA.Contrib 
MASA.Utils：https://github.com/masastack/MASA.Utils 
MASA.EShop：https://github.com/masalabs/MASA.EShop 
MASA.Blazor：https://github.com/BlazorComponent/MASA.Blazor 
如果你对我们的 MASA Framework 感兴趣，无论是代码贡献、使用、提 Issue，欢迎联系我们 

                                        