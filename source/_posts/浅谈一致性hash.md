---
title: 推荐系列-浅谈一致性hash
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 1235
cover_picture: 'https://static.oschina.net/uploads/img/202104/13110009_LCi7.png'
abbrlink: e765f1d1
date: 2021-04-15 09:26:24
---

&emsp;&emsp;文章目录 什么是Hash 普通Hash的分析 普通Hash存在的问题 一致性Hashg概念 实现普通Hash和一致性Hash 普通Hash实现 一致性Hash实现 不带虚拟节点实现 带虚拟节点实现 什么是Hash Hash就是把任...
<!-- more -->

                                                                                                                                                                                         
 
  
 ##### 文章目录 
  
  什么是Hash 
  普通Hash的分析 
  普通Hash存在的问题 
  一致性Hashg概念 
  实现普通Hash和一致性Hash 
   
    
    普通Hash实现 
    一致性Hash实现 
     
      
      不带虚拟节点实现 
      带虚拟节点实现 
       
     
  
 
 
 
### 什么是Hash 
 
假设服务有四台服务器，多个用户来访问我们的服务，以下的分析都用此假设 
 
### 普通Hash的分析 
当用户来访问我的服务我们对请求和服务数量进行简单的运算等到hash，然后根据算出的hash分发请求到不同的服务上。 hash计算方式为 hash = 请求%serverCount 假设现在有四个请求分别是 请求1，请求2，请求3，请求4，现在对四个请求进行计算分发请求到不同非服务上， 计算结果如下图 ![Test](https://static.oschina.net/uploads/img/202104/13110009_LCi7.png  '浅谈一致性hash') 
 
### 普通Hash存在的问题 
通过上图我们可以看到通过计算我们把不同的请求通过计算分别分发对应的服务器了， 但是这个方式会存在一定的问题，接下来我们就要分析了。 我们假设server3 宕机，name重新计算后的请求分发如下图 ![Test](https://static.oschina.net/uploads/img/202104/13110009_LCi7.png  '浅谈一致性hash') 在实际情况下发生服务宕机或者扩容的情况是很普遍的，当发生宕机或者扩容的时候，我们之前计算的所有hash都需要重新计算，在生产环境下我们后台服务器很多台，客户端也有很多，那么影响是很⼤的，缩容和扩容都会存在这样的问题，⼤量⽤户的请求会被路由到其他的⽬标服务器处理，⽤户在原来服务器中的会话都会丢失。 
 
### 一致性Hashg概念 
一致性Hash的出现就解决了上述的问题，在发生宕机或者和扩容的时候尽可能少的影响请求的分发。 
一致性Hash的思路如下： ![Test](https://static.oschina.net/uploads/img/202104/13110009_LCi7.png  '浅谈一致性hash') 首先有一条直线，直线的开始为0，结尾为2的32次方减1，这相当于一个地址，然后把直线弯曲形成一个圆环形成闭环，这就是hash环。我们对服务器求hash然后把服务器放到hash环上的对应位置上，当有请求到来时，对请求进行计算，把请求放到hash环的对应位置，然后顺时针获得最近的服务器节点。 示意图如下 ![Test](https://static.oschina.net/uploads/img/202104/13110009_LCi7.png  '浅谈一致性hash') 当发生服务宕机或者扩容是请求转发也是会发生变化的，这次我用扩容示例，宕机同理 假如我们在server1和server2之间加个server4，请求转发如下图 ![Test](https://static.oschina.net/uploads/img/202104/13110009_LCi7.png  '浅谈一致性hash') 由上图我们可以得出当发生扩容或者宕机的时候只会影响极少数一部分的用户，最大限度上提高的体验 
当然一致性hash也可能存在一些问题的，比如如下图所示， 服务器分布及其不合理， 大量的请求都落在同一个服务器上，对服务的压力较大。 ![Test](https://static.oschina.net/uploads/img/202104/13110009_LCi7.png  '浅谈一致性hash') 针对这种情况我们可以用增加虚拟节点的方式来尽可能更合理的分发请求来，减轻对某一服务的压力。 如下图我们对每个节点增加两个虚拟节点 ![Test](https://static.oschina.net/uploads/img/202104/13110009_LCi7.png  '浅谈一致性hash') 
 
### 实现普通Hash和一致性Hash 
 
#### 普通Hash实现 
 
 ```java 
  public static void main(String[] args) {
   
        String[] ips = new String[]
                {
   "101.1.1.1","101.1.1.2","101.1.1.3","101.1.1.4"};
        int serverCount = 4;
        for (String ip : ips) {
   
            System.out.println(ip + " 的请求分发到 server" + ip.hashCode()%serverCount);
        }
        System.out.println("======================宕机分割线==========================================");
        // 模拟宕机一个
        serverCount = 3;
        for (String ip : ips) {
   
            System.out.println(ip + " 的请求分发到 server" + ip.hashCode()%serverCount);
        }
    }
  ``` 
  
输出 
 
 ```java 
  101.1.1.1 的请求分发到 server3
101.1.1.2 的请求分发到 server0
101.1.1.3 的请求分发到 server1
101.1.1.4 的请求分发到 server2
======================宕机分割线==========================================
101.1.1.1 的请求分发到 server1
101.1.1.2 的请求分发到 server2
101.1.1.3 的请求分发到 server0
101.1.1.4 的请求分发到 server1
  ``` 
  
 
#### 一致性Hash实现 
 
##### 不带虚拟节点实现 
 
 ```java 
  public static void main(String[] args) {
   

        String[] serverIps = new String[]
                {
   "101.231.123.11","11.1.112.234","123.112.11.123","232.12.11.22"};

        // 用来存放服务器的
        SortedMap<Integer, String> hashServerMap = new TreeMap<>();

        for (String ip : serverIps) {
   
            hashServerMap.put(Math.abs(ip.hashCode()), ip);
        }
        // 客戶端ip
        String[] clientIps = new String[]
                {
   "101.23.234.33","11.1.112.2","123.112.11.12","23.121.11.22"};
        for (String ip : clientIps) {
   
            // tailMap 方法返回的是大于参数的集合
            SortedMap<Integer, String> serverMap = hashServerMap.tailMap(Math.abs(ip.hashCode()));
            // 取hash环上的第一个服务器
            if (serverMap.isEmpty()) {
   
                Integer firstKey = hashServerMap.firstKey();
                System.out.println(ip + " 的请求分发到 " + hashServerMap.get(firstKey));
            }else {
   
                // 获取结果集的第一个服务器
                System.out.println(ip + " 的请求分发到 " + hashServerMap.get(serverMap.firstKey()));
            }

        }
    }
  ``` 
  
分发结果 
 
 ```java 
  101.23.234.33 的请求分发到 232.12.11.22
11.1.112.2 的请求分发到 123.112.11.123
123.112.11.12 的请求分发到 11.1.112.234
23.121.11.22 的请求分发到 123.112.11.123
  ``` 
  
 
##### 带虚拟节点实现 
 
 ```java 
  public static void main(String[] args) {
   
        String[] serverIps = new String[]
                {
   "101.231.123.11","11.1.112.234"};
        // 每个节点的虚拟节点数
        int virtualNodeCount = 2;
        // 用来存放服务器的
        SortedMap<Integer, String> hashServerMap = new TreeMap<>();
        for (String ip : serverIps) {
   
            hashServerMap.put(Math.abs(ip.hashCode()), ip);

            // 处理虚拟节点
            for (int i = 0; i < virtualNodeCount; i++) {
   
                hashServerMap.put(Math.abs((ip + "#" + i).hashCode()), ip + "#" + i);
            }
        }
        // 客戶端ip
        String[] clientIps = new String[]
                {
   "101.23.234.33","11.1.112.2","123.112.11.12","23.121.11.22"};
        for (String ip : clientIps) {
   
            // tailMap 方法返回的是大于参数的集合
            SortedMap<Integer, String> serverMap = hashServerMap.tailMap(Math.abs(ip.hashCode()));
            // 取hash环上的第一个服务器
            if (serverMap.isEmpty()) {
   
                Integer firstKey = hashServerMap.firstKey();
                System.out.println(ip + " 的请求分发到 " + hashServerMap.get(firstKey));
            }else {
   
                // 获取结果集的第一个服务器
                System.out.println(ip + " 的请求分发到 " + hashServerMap.get(serverMap.firstKey()));
            }

        }
    }
  ``` 
  
分发结果 
 
 ```java 
  101.23.234.33 的请求分发到 101.231.123.11
11.1.112.2 的请求分发到 11.1.112.234
123.112.11.12 的请求分发到 11.1.112.234
23.121.11.22 的请求分发到 101.231.123.11#0
  ``` 
 
                                        