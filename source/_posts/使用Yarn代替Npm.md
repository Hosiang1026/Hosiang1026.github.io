---
title: 推荐系列-使用Yarn代替Npm
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 2018
cover_picture: 'https://api.ixiaowai.cn/gqapi/gqapi.php'
abbrlink: 16a3025f
date: 2021-04-15 09:46:45
---

&emsp;&emsp;一、Yarn介绍 Yarn是由Facebook、Google、Exponent 和 Tilde 联合推出了一个新的 JS 包管理工具 ，正如官方文档中写的，Yarn 是为了弥补 npm 的一些缺陷而出现的。 二、Yarn优势 1、速度快 ...
<!-- more -->

                                                                                                                                                                                        #### 一、Yarn介绍 
Yarn是由Facebook、Google、Exponent 和 Tilde 联合推出了一个新的 JS 包管理工具 ，正如官方文档中写的，Yarn 是为了弥补 npm 的一些缺陷而出现的。 
#### 二、Yarn优势 
##### 1、速度快 
速度快主要来自以下两个方面： 
1.1、并行安装：无论 npm 还是 Yarn 在执行包的安装时，都会执行一系列任务。npm 是按照队列执行每个 package，也就是说必须要等到当前 package 安装完成之后，才能继续后面的安装。而 Yarn 是同步执行所有任务，提高了性能。 
1.2、离线模式：如果之前已经安装过一个软件包，用Yarn再次安装时之间从缓存中获取，就不用像npm那样再从网络下载了。 
##### 2、安装版本统一 
为了防止拉取到不同的版本，Yarn 有一个锁定文件 (lock file) 记录了被确切安装上的模块的版本号。每次只要新增了一个模块，Yarn 就会创建（或更新）yarn.lock 这个文件。这么做就保证了，每一次拉取同一个项目依赖时，使用的都是一样的模块版本。npm 其实也有办法实现处处使用相同版本的 packages，但需要开发者执行 npm shrinkwrap 命令。这个命令将会生成一个锁定文件，在执行 npm install 的时候，该锁定文件会先被读取，和 Yarn 读取 yarn.lock 文件一个道理。npm 和 Yarn 两者的不同之处在于，Yarn 默认会生成这样的锁定文件，而 npm 要通过 shrinkwrap 命令生成 npm-shrinkwrap.json 文件，只有当这个文件存在的时候，packages 版本信息才会被记录和更新。 
##### 3、更简洁的输出 
npm 的输出信息比较冗长。在执行 npm install 的时候，命令行里会不断地打印出所有被安装上的依赖。相比之下，Yarn 简洁太多：默认情况下，结合了 emoji直观且直接地打印出必要的信息，也提供了一些命令供开发者查询额外的安装信息。 
##### 4、多注册来源处理 
所有的依赖包，不管他被不同的库间接关联引用多少次，安装这个包时，只会从一个注册来源去装，要么是 npm 要么是 bower, 防止出现混乱不一致。 
##### 5、更好的语义化 
yarn改变了一些npm命令的名称，比如 yarn add/remove，感觉上比 npm 原本的 install/uninstall 要更清晰。 
#### 三、Yarn安装 
 
 ```java 
  npm install -g yarn

  ``` 
  
#### 四、Yarn命令 
1、查看版本 
 
 ```java 
  yarn -v

  ``` 
  
2、创建工程 
 
 ```java 
  yarn init

  ``` 
  
3、安装依赖 
 
 ```java 
  yarn 或者 yarn install

  ``` 
  
4、运行脚本 
 
 ```java 
  yarn run 

  ``` 
  
5、打包构建 
 
 ```java 
  yarn build

  ``` 
  
6、显示某个包信息 
 
 ```java 
  yarn info 

  ``` 
  
7、列出当前项目的依赖 
 
 ```java 
  yarn list

  ``` 
  
8、显示当前配置 
 
 ```java 
  yarn config list

  ``` 
  
9、列出已缓存的每个包 
 
 ```java 
  sudo yarn cache list 

  ``` 
  
10、清除缓存 
 
 ```java 
  sudo yarn cache clean

  ``` 
  
#### 五、NPM对比 
 
  
   
   Npm 
   Yarn 
   
  
  
   
   npm install 
   yarn 
   
   
   npm install react --save 
   yarn add react 
   
   
   npm uninstall react --save 
   yarn remove react 
   
   
   npm install react --save-dev 
   yarn add react --dev 
   
   
   npm update --save 
   yarn upgrade 
   
  

                                        