---
title: 推荐系列-还在使用 SVN 的企业，如何快速迁移到 Gitee
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 700
cover_picture: 'https://static.oschina.net/uploads/img/202002/20113637_9ZIl.jpeg'
abbrlink: 57af8598
date: 2021-04-14 07:54:42
---

&emsp;&emsp;前言 2000 年 CollabNet 创建了 Subversion 项目，一晃 SVN 已经诞生 20 年了，截至 r1873568 SVN 主分支共有 59674 次提交，32 个开发者，288 次发布，2005 年 Linus Torvalds 创建了 Git，...
<!-- more -->

                                                                                                                                                                                        ### 前言 
2000 年 CollabNet 创建了 Subversion 项目，一晃 SVN 已经诞生 20 年了，截至 r1873568 SVN 主分支共有 59674 次提交，32 个开发者，288 次发布，2005 年 Linus Torvalds 创建了 Git，截至 de93cc14ab7e8db7645d8dbe4fd2603f76d5851f，git 主分支共有 58209 次提交，1343 个贡献者，742 次发布，诸如 Google，Microsoft，Facebook 这样的巨无霸公司都在使用 Git，Git 主要开发者来自 Google 和 Microsoft。 
人多力量大，众人拾柴火焰高，有钱能使鬼推磨，贡献越多码越好，我们可以看到 SVN 只是缓慢变好，而 Git 却在飞速增强，到了今天为什么还不从 SVN 迁移到 Git？ 
### Git 与 SVN 的比较 
Git 是最流行的分布式版本控制系统，而 SVN 是集中式版本控制系统，顾名思义，SVN 的存储库将存储在中央服务器，而 Git 的存储库是存储在本地，当网络连接断开后，SVN 便无法进行提交，使用 Git 的开发者则可以先将代码提交到本地存储库，待网络恢复后再推送到远程服务器。 
 
  
   
   特征 
   Git 
   Subversion 
   
  
  
   
   分类 
   分布式版本控制系统 
   集中式版本控制系统 
   
   
   许可协议 
   GPLv2 
   Apache 
   
   
   基金会 
   Software Freedom Conservancy 
   Apache Software Foundation 
   
   
   交流会议 
   Git Merge 
    
   
   
   技术资讯 
   Git Rev News 
    
   
   
   分支 
   轻量级分支（引用），创建分支非常简单 
   复杂的分支模型，但 SVN 创建分支会使用写时复制功能，因此也不会太慢 
   
   
   访问控制 
   通常无细粒度权限控制，但可以通过策略限制 
   目录级别的权限控制 
   
   
   团队协作 
   可以使用 PR 模式合作 
   存在提交竞赛，合并较麻烦 
   
   
   学习难度 
   及其简单 
   简单 
   
   
   存储库备份 
   非常容易 
   麻烦 
   
   
   创建提交 
   创建提交在本地运行，速度更快 
   创建提交受网络影响，更慢 
   
  
 
我们查看 Compare Repositories，可以发现，尽管 SVN 时非常优秀的版本控制系统，但大多数的人们还是选了更具活力更好的 Git。 
### Gitee 的功能 
用户在使用 SVN 时，通常感到舒适的功能有部分检出，目录权限控制等等，并一直以此为理由否定 Git 的进步，随着 Git 的不断增强，Gitee 开发者的不断努力，Gitee 逐渐拥有了这些功能。 
2019 年 5 月底，Gitee 新增只读目录支持：SVN 的文件和目录只读特性，能否在 Git 也实现？ 并且，我写了一篇文章介绍如何实现 Git 目录权限控制。 
2020 年 1 月 17 日，码云目前已经初步支持 Git 部分克隆，结合部分克隆和稀疏检出能够提供比 SVN 更好的部分检出体验。 
Gitee 除了在 Git 功能上推陈出新，还在团队协作，企业管理上增加了很多功能，自定义权限管理更切合企业实际，任务，里程碑，成员周报能够让开发者异地完成诸多任务，并被考核。 2019 年度疫情爆发以来，各地交通管制，返程复工有诸多不便，使用 Gitee 远程工作正当其时，为什么还不从 SVN 迁移到 Gitee 呢？ 
### 将 SVN 存储库迁移到 Gitee 
企业只需要在 Gitee 上创建空存储库，然后将 SVN 存储库转换成 Git 存储库推送到 Gitee，便完成了向 Gitee 的迁移。 
#### 使用 git svn 工具转换 
将 SVN 存储库转换成 Git 存储库非常简单，使用 git 自带的命令便可以完成： 
 ```java 
  # convert repo to git repo
git svn clone https://example.io/path/svn/repo -T trunk -b branches -t tags
git remote add gitee git@gitee.com:example/name.git
git push -u gitee --all

  ```  
如果你以后无需追踪原有的 SVN 存储库，可以在 Push 之前运行： 
 ```java 
  git branch -m trunk master

  ```  
当存储库越来越大时， ```java 
  git svn
  ```  的缺陷便很明显了，转换耗时比较长，这也是 GCC 从 SVN 转成 Git 反反复复花了好几年的原因。 
#### 使用 svn2git(ruby) 转换 
在 Github 上有个实用工具 svn2git，这个工具主要是简化了转换流程： 
 ```java 
  sudo gem install svn2git
svn2git http://svn.example.com/path/to/repo

  ```  
这个工具能够提供更好的提交日志，唯一遗憾的是，自 2016 年以来便不在更新。 
#### 使用 svn-all-fast-export/svn2git 转换 
KDE 的开发者开发了 svn-all-fast-export/svn2git 这个工具在服务器上将 SVN 存储库转换成 git 存储库，由于省去网络传输和检出，速度要远胜于 git svn/svn2git(ruby)。 
KDE 开发者撰写了使用示例：UsingSvn2Git，这一工具使用难度较高，需要创建规则文件，如果存储库较小，不建议使用此类工具。 
 ```java 
  create repository kdelibs
match /trunk/KDE/kdelibs/
  min revision 123453
  max revision 456789
  repository kdelibs
  branch master
end match
end repository

  ```  
#### 使用 git-svn-fast-import 转换 
Gitee 还移植了一个 SVN to Git 的工具 git-svn-fast-import，这个转换又快又简单： 
 ```java 
  $ mkdir -p repo.git && cd repo.git
$ git init
$ git-svn-fast-import --stdlayout -r 0:100000 /path/to/svnrepo
progress Skipped revision 0
progress Imported revision 1
progress Imported revision 2
progress Imported revision 3
...
progress Imported revision 99999
progress Imported revision 100000

  ```  
Gitee 开发者曾用此工具为某私有化客户将存储库从 SVN 转到 Git。 
### 简易 Git 命令指南 
 
  
   
   Git 任务 
   说明 
   命令 
   
  
  
   
   配置用户名 
   在创建提交时需要配置用户名 
    ```java 
  git config --global user.email 'name@email.io'; git config --global user.name 'Your Name'
  ```  
   
   
   初始化存储库 
    
    ```java 
  git init
  ```  
   
   
   克隆存储库 
   本地存储库 
    ```java 
  git clone /path/to/local/repo
  ```  
   
   
    
   SSH 
    ```java 
  git clone git@gitee.com:example/example.git
  ```  
   
   
    
   HTTPS 
    ```java 
  git clone https://gitee.com/example/example.git
  ```  
   
   
   查看本地状态 
    
    ```java 
  git status
  ```  
   
   
   查看本地更改 
    
    ```java 
  git diff
  ```  
   
   
   添加修改 
   比如新增或者增加了文件  ```java 
  A.txt
  ```  
    ```java 
  git add A.txt
  ```  
   
   
   提交更改 
    
    ```java 
  git commit -m "Add a new file 'A.txt'"
  ```  
   
   
   推送到 Gitee 
    
    ```java 
  git push
  ```  
   
   
   创建分支 
    
    ```java 
  git checkout -b NewBranchName
  ```  
   
  
 
更多的命令可以访问 ProGit 或者运行  ```java 
  git help command
  ```  查看特定子命令的帮助信息。 
### 在 Gitee 上使用 SVN 功能 
随着开发者投入的逐步减少，因此使用 SVN 接入 Gitee 并不被提倡。 
但是，如果你仍然想要在迁移到 Gitee 后，使用落后的 SVN，你可以在项目设置页面打开 SVN，然后使用： 
 ```java 
  svn co svn+ssh://gitee.com/example/repo

  ```  
这将使用  ```java 
  SVN Over SSH
  ```  的方式访问远程存储库，只需要配置好 SSH 公钥，便可免密使用 SVN 协议访问远程 Git 存储库。 
更多的 Gitee SVN 可以访问：码云 SVN 支持 
### 总结 
开发者为开发者，Gitee 不断改进 Git 的体验，愿更多的企业从 SVN 迁移到 Gitee，享受更好的体验。
                                        