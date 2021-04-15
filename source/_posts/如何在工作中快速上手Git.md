---
title: 推荐系列-如何在工作中快速上手Git
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 601
cover_picture: 'https://api.ixiaowai.cn/gqapi/gqapi.php'
abbrlink: 300088f4
date: 2021-04-15 09:15:42
---

&emsp;&emsp;听说微信搜索《Java鱼仔》会变更强！ 本文收录于JavaStarter ，里面有我完整的Java系列文章，学习或面试都可以看看哦 （一）Git是用来做什么的 如果你进入的是一家互联网公司，那么一定会听到...
<!-- more -->

                                                                                                                                                                                         
### （一）Git是用来做什么的 
如果你进入的是一家互联网公司，那么一定会听到版本控制这个东西，所谓版本控制就是在开发过程中对文件、代码等内容的修改历史进行记录，方便查看、备份以及回滚历史代码。 
同时可以用于管理多人协同开发项目，通过版本控制实现多个人并行开发，提高开发效率。 
Git就是版本控制的一种实现，同样的还有Svn等。 
Git又可以称为分布式版本控制，所有的版本信息仓库全部同步到每隔用户的本地，可以离线在本地提交，在有网络的时候push到相应的服务器上即可。 
### （二）Git的使用 
Git的使用一般都是用命令行，如果是windows电脑，安装完成之后鼠标右键可以看到git bash和git gui，建议使用git bash。mac电脑安装完成之后直接在终端使用git命令即可。 
#### 2.1 配置信息 
 ```java 
  #查看所有配置信息
git config --list
#查看系统配置
git config --system --list
#查看全局配置
git config --global --list

  ```  
#### 2.2 设置用户名和邮箱 
 ```java 
  git config --global user.name "javayz"
git config --global user.email "xxx@qq.com"

  ```  
前面两步属于git安装之后的配置部分，接下来介绍git的使用 
#### 2.3 初始化本地git仓库 
如果想把本地的某个文件夹变成git仓库，只需要执行 
 ```java 
  git init

  ```  
#### 2.4 克隆远程仓库 
如果想把远程仓库的代码下载到本地，只需要在某个目录下执行 
 ```java 
  git clone [url]
git clone -b [branchname] [url]

  ```  
其中-b表示克隆指定分支的代码 
#### 2.5 提交文件三步曲 
 ```java 
  #添加文件到暂存区
git add filename
#将暂存区中的文件提交到本地
git commit -m "提交信息"
git push

  ```  
我们也可以使用直接对代码进行拉取和提交，更��方便。 
### （三）Git的工作原理 
git中有四个重要的区域： 
工作目录（Working Directory）：平常存放项目代码的地方 
暂存区（Stage）：临时存放改动 
资源库（Repsitory/Git Directory）：提交的所有版本的数据 
远程仓库（Remote Directory）：代码托管的平台 
工作目录-->git add files-->暂存区-->git commit-->资源库-->git push-->远程仓库 
### （四）Git忽略文件上传 
在主目录下建立.gitignore文件可以忽略提交某些文件 
 ```java 
  *.txt #忽略所有.txt结尾的文件
!a.txt  #a.txt除外
temp/ #忽略temp目录下的文件

  ```  
### （五）ssh免密登陆 
 ```java 
  ssh-keygen -t rsa -C "xxx@qq.com"

  ```  
连续三次回车后在.ssh目录下会生成一个id_rsa和id_rsa.pub，把id_rsa.pub中的字符串保存到gitee设置中的ssh公钥中，即可免密提交下载代码 
### （六）分支管理 
分支是分布式版本控制的核心，各个分支之间互相不关联，基本上每次版本迭代都会创建一个新的分支出来。 
 ```java 
  #列出所有分支
git branch

#列出所有远程分支
git branch -r

#新建一个分支，但依然停留在当前分支
git branch [branch-name]

#新建一个分支，并切换到该分支
git checkout -b [branch]

#合并指定分支到当前分支
git merge [branch]

#删除分支
git branch -d [branch-name]

#删除远程分支
git push origin --delete [branch-name]
git branch -dr [remote/branch]

  ```  
### （七）Git与Idea的集成 
Idea本身就支持对Git的集成，当我们clone一个项目到本地后，用Idea打开后会发现右上角多出了git的标志： 
![Test](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/af5239fd45ac4504861affea00dd902f~tplv-k3u1fbpfcp-zoom-1.image  '如何在工作中快速上手Git') 
第一个蓝色箭头表示把远程仓库的代码pull到本地。 
第二个绿色对勾表示提交代码，勾选要commit和push的代码，填写提交信息，然后commit and push即可。 
第三个闹钟形状的是提交历史，可查看历史提交信息。 
![Test](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/af5239fd45ac4504861affea00dd902f~tplv-k3u1fbpfcp-zoom-1.image  '如何在工作中快速上手Git') 
### （八）总结 
对于工作来说，只需要会用Idea提交拉取代码即可。但是我们需要了解git的工作原理。我是鱼仔，我们下期再见！
                                        