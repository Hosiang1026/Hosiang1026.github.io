---
title: 推荐系列-码云目前已经初步支持 Git 部分克隆
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 1891
cover_picture: 'https://static.oschina.net/uploads/img/202002/03143425_w5vI.jpg'
abbrlink: 2ef4ab56
date: 2021-04-15 09:19:21
---

&emsp;&emsp;最近 Git 2.25.0 发布，此次发布推出了 partial clones 功能，partial clones 即用户克隆远程存储库的时候，可以选择只下载自身所需的对象，而不是存储库的所有对像（或者特定 commit 所关联...
<!-- more -->

                                                                                                                                                                                        ![Test](https://oscimg.oschina.net/oscnet/up-081b43f13c07751fb26d6a6f7911e3a7e23.JPEG  '码云目前已经初步支持 Git 部分克隆') 最近 Git 2.25.0 发布，此次发布推出了 partial clones 功能，partial clones 即用户克隆远程存储库的时候，可以��择只下载自身所需的对象，而不是存储库的所有对像（或者特定 commit 所关联的所有对像）。这和微软之前发布的 VFSForGit 原理有异曲同工之妙。使用部分克隆可以大大的减小用户克隆巨大存储库的耗时，也会减小网络数据传输。部分克隆完全依赖 Git Wire Protocol （v2 Protocol）。经过几行代码的适配和线上的批量更新，Gitee 目前已经支持部分克隆了，当你的 Git 版本大于等于 2.25.0，则可以使用如下的命令克隆特定的存储库： 
 ```java 
  git -c protocol.version=2 clone --filter=blob:none git@gitee.com:YOUR-COUNT/YOUR-REPO.git

  ```  
在这个命令中  ```java 
  -c protocol.version=2
  ```  确保始终使用 v2 协议（当然可以  ```java 
  git config -g protocol.version=2
  ```  设置始终使用 v2 协议），  ```java 
  --filter
  ```  则对克隆过程进行过滤，详细说明如下： 
 
  
   
   filter-spec 
   details 
   example 
   
  
  
   
    ```java 
  --filter=blob:none
  ```  
   忽略所有 Blob，只会下载将被检出的对象 
   N/A 
   
   
    ```java 
  --filter=blob:limit=<n>[kmg]
  ```  
   限制 Blob 大小，超过多大的就忽略了 
    ```java 
  --filter=blob:limit=10M
  ```  
   
   
    ```java 
  --filter=sparse:oid=<blob-ish>
  ```  
   稀疏检出相关 
    
   
   
    ```java 
  --filter=tree:<depth>
  ```  
   限制 tree（目录）深度 
    ```java 
  --filter=tree:2
  ```  
   
  
 
更多的部分克隆过滤器参数信息可以参考：rev-list-options.txt#L735-L780 
基于部分克隆实现稀疏检出（这里需要提前设置  ```java 
  git -c protocol.version=2
  ``` ）： 
 ```java 
  $ git clone --filter=blob:none --no-checkout /your/repository/here repo
$ cd repo
$ cat >.git/info/sparse-checkout <<EOF
/*
!/*
EOF
$ git config core.sparseCheckout 1
$ git checkout .

  ```  
关于稀疏检出的更多细节可以参考相关文档。 
与浅表克隆不同的是，部分克隆能够创建提交，这和微软发布的 VFSforGit 类似，但 VFSforGit 实现了文件系统驱动级别的过滤器，可以使用文件系统占位符避免文件的下载，在读写这些文件时，ProjFS 则会从远程存储库下载这些文件。综合来看，Git 的部分克隆是一个巨大的进步，但还有很大的进步空间。 
Git 2.25.0 更新信息如下： 
 
 https://lore.kernel.org/git/xmqqtv4zjgv5.fsf@gitster-ct.c.googlers.com 
 https://github.blog/2020-01-13-highlights-from-git-2-25 

                                        