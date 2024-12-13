---
title: 推荐系列-关于Vim-Neovim-SpaceVim的一些思考
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 659
cover_picture: 'https://img-blog.csdnimg.cn/20210413104514281.png'
abbrlink: cd3f220b
date: 2021-04-15 10:16:56
---

&emsp;&emsp;1 前言 最近看到了Neovim以及SpaceVim，于是上手试了一下。 2 Neovim与SpaceVim Neovim是Vim的一个分支，具有更加现代的GUI、嵌入式以及脚本化的终端、异步工作控制等等特点，默认配置文件为...
<!-- more -->

                                                                                                                                                                                        ### 1 前言 
最近看到了 
 ```java 
  Neovim
  ``` 
 以及 
 ```java 
  SpaceVim
  ``` 
 ，于是上手试了一下。 
### 2  
 ```java 
  Neovim
  ``` 
 与 
 ```java 
  SpaceVim
  ``` 
  
 
 ```java 
  Neovim
  ``` 
 是 
 ```java 
  Vim
  ``` 
 的一个分支，具有更加现代的 
 ```java 
  GUI
  ``` 
 、嵌入式以及脚本化的终端、异步工作控制等等特点，默认配置文件为 
 ```java 
  ~/.config/nvim/init.vim
  ``` 
 。而 
 ```java 
  SpaveVim
  ``` 
 ，是一个社区驱动的模块化的 
 ```java 
  Vim IDE
  ``` 
 ，以模块的方式组织管理插件以及相关配置，为不同的语言开发量身定制了相关的开发模块，提供了自动补全、语法检查、格式化、调试等特性，默认配置文件为 
 ```java 
  ~/.SpaveVim.d/init.toml
  ``` 
 。 
![Test](https://img-blog.csdnimg.cn/20210413104514281.png  '关于Vim-Neovim-SpaceVim的一些思考') 
### 3 使用感受 
#### 3.1  
 ```java 
  Neovim
  ``` 
  
首先是安装， 
 ```java 
  Neovim
  ``` 
 的安装很简单，可以直接通过包管理器安装： 
 
 ```java 
  paru -S neovim

  ``` 
  
安装了之后可以使用 
 ```java 
  nvim
  ``` 
 命令打开。 
简单使用了一下，发现 
 ```java 
  Neovim
  ``` 
 并没有和 
 ```java 
  Vim
  ``` 
 （版本 
 ```java 
  8.2
  ``` 
 ）有太大的区别。一般情况下，这样的 
 ```java 
  Neovim
  ``` 
 不能成为一个 
 ```java 
  IDE
  ``` 
 ，需要添加若干插件才能使用。流行的插件管理器有如下几个： 
 
  
 ```java 
  vim-plug
  ``` 
  
  
 ```java 
  vundle
  ``` 
  
  
 ```java 
  neobundle
  ``` 
  
  
 ```java 
  Pathogen
  ``` 
  
 
笔者用的是 
 ```java 
  vim-plug
  ``` 
 ，插件安装不难，在 
 ```java 
  init.vim
  ``` 
 中的两个 
 ```java 
  call
  ``` 
 之间加上插件的名字： 
 
 ```java 
  call plug#begin('~/.vim/plugged')
Plug 'junegunn/vim-easy-align'
call plug#end()

  ``` 
  
然后在 
 ```java 
  Neovim
  ``` 
 中键入 
 ```java 
  :PlugInstall
  ``` 
 即可进行安装。 
一般来说，如果需要打造成为一个 
 ```java 
  IDE
  ``` 
 ，那么至少需要具备以下功能： 
 
 补全：可用插件YouCompleteMe、vim-snippets 
 高亮：可用插件semantic-highlight.vim 
 工程目录树：可用插件nerdtree 
 运行与调试：可用插件Vdebug 
 
但是，安装使用了之后，测试了一下 
 ```java 
  Java
  ``` 
 ，效果并不怎么样，拿最常用的补全来说，补全提示的速度比不快，另一方面，提示的速度比 
 ```java 
  IDEA
  ``` 
 慢，而且提示不够智能，不能根据当前光标处的变量提示最接近的补全。另一方面，并不能自动 
 ```java 
  import
  ``` 
 （虽然可以通过脚本做到，但是又需要额外的配置）。 
#### 3.2  
 ```java 
  SpaceVim
  ``` 
  
 
 ```java 
  SpaveVim
  ``` 
 相当于一个开箱即用的 
 ```java 
  IDE
  ``` 
 ，默认就提供了 
 ```java 
  IDE
  ``` 
 的常见功能，比如： 
 
 补全 
 高亮 
 工程目录树 
 运行调试 
 快速定位 
 构建工具支持 
 
等等。首先，不可否认的是 
 ```java 
  SpaceVim
  ``` 
 默认就提供了一个用户友好的界面： 
![Test](https://img-blog.csdnimg.cn/20210413104514281.png  '关于Vim-Neovim-SpaceVim的一些思考') 
会默认记录最近打开的文件，并且可以通过数字快速定位。笔者同样使用了 
 ```java 
  Java
  ``` 
 进行测试，虽然内置了代码补全插件，但是，令人遗憾的是并没有自动 
 ```java 
  import
  ``` 
 的功能，并且也没有变量名自动补全的功能（指创建一个叫 
 ```java 
  arrayList
  ``` 
 的变量）： 
![Test](https://img-blog.csdnimg.cn/20210413104514281.png  '关于Vim-Neovim-SpaceVim的一些思考') 
当然，这也有可能是没有完全配置好的原因，想要配置一个更加好用的 
 ```java 
  SpaceVim
  ``` 
 ，可以参考这篇文章。 
### 4 建议 
下面是个人建议的使用 
 ```java 
  Neovim
  ``` 
 的原因： 
 
 需要一个从零开始配置的 
 ```java 
  IDE
  ``` 
 或者 
 ```java 
  Vim
  ``` 
  
 动手能力强，能解决各种问题 
 能够熟练记忆并使用各种各样的快捷键 
 熟悉各种插件，包括但不限于 
 ```java 
  nerdtree
  ``` 
 、 
 ```java 
  YouCompleteMe
  ``` 
 等等 
 
因为如果想把 
 ```java 
  Neovim
  ``` 
 用好，最起码���要���点时间，利用插件安装好各种各样的插件之后（当然因为有些插件只是针对 
 ```java 
  Vim
  ``` 
 的，所以可能会遇上不兼容的问题），熟悉它们的使用并知道快捷键，这对记忆力以及学习能力都是一个考验，在这过程中，需要无数次的打开 
 ```java 
  init.vim
  ``` 
 进行配置。 
建议使用 
 ```java 
  SpaveVim
  ``` 
 的原因： 
 
 不想手动配置太多的插件以及快捷键 
 需要一个开箱即用且轻量级的 
 ```java 
  IDE
  ``` 
  
 不需要开发很大的工程 
 
在 
 ```java 
  SpaveVim
  ``` 
 里面，大部分都是已经配置好的，剩下的只是需要通过官网文档熟悉界面，最主要的是熟悉 
 ```java 
  Space
  ``` 
 组合键的使用，比如： 
 
  
 ```java 
  Space+数字键
  ``` 
 ：切换窗口 
  
 ```java 
  Space+b/B
  ``` 
 ：缓冲区操作 
  
 ```java 
  Space+c
  ``` 
 ：命令操作 
  
 ```java 
  Space+f
  ``` 
 ：文件操作 
  
 ```java 
  Space+l
  ``` 
 ：语言相关操作，比如运行等等 
  
 ```java 
  Space+w
  ``` 
 ：窗口操作 
 
相比起 
 ```java 
  Neovim
  ``` 
 需要在 
 ```java 
  init.vim
  ``` 
 中配置各种 
 ```java 
  map
  ``` 
 去映射键， 
 ```java 
  SpaceVim
  ``` 
 的快捷键学习曲线会低了很多。 
但是相比起现代级的 
 ```java 
  IDE
  ``` 
 ， 
 ```java 
  Neovim
  ``` 
 与 
 ```java 
  SpaceVim
  ``` 
 还是有很大差距的，最明显的就是对各种库、各种包以及一键部署运行的支持，因此，个人认为 
 ```java 
  SpaceVim
  ``` 
 / 
 ```java 
  Neovim
  ``` 
 不是特别适合大项目的。不过当然有一些折中的方案，比如 
 ```java 
  VSCode
  ``` 
 ，在各种各样的插件加持之下，可以堪称是又轻又快的现代 
 ```java 
  IDE
  ``` 
 。 
### 5 资源 
如果想学习 
 ```java 
  Neovim
  ``` 
 / 
 ```java 
  SpaceVim
  ``` 
 或者想把两者配置成一个更好用的 
 ```java 
  IDE
  ``` 
 ，这里提供了一些资源： 
 
 Neovim文档 
 SpaceVim文档 
 vim-plug文档 
 Vundle文档 
 24.3k star的vimrc配置 
 VimAwesome-Vim插件合集网站 
 8.9k star的如何将Vim配置成C/C++ IDE的仓库 

                                        