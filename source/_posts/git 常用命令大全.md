---
title: 推荐系列-git 常用命令大全
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 2070
cover_picture: 'https://api.ixiaowai.cn/gqapi/gqapi.php'
abbrlink: 72442b0b
date: 2021-04-15 09:46:45
---

&emsp;&emsp;1.git 常用命令 $ git remote add origin git@github.com:yeszao/dofiler.git # 配置远程git版本库 $ git pull origin master # 下载代码及快速合并 $ git push or......
<!-- more -->

                                                                                                                                                                                        1.git 常用命令   
 
 ```java 
  $ git remote add origin git@github.com:yeszao/dofiler.git    
# 配置远程git版本库
$ git pull origin master                                     # 下载代码及快速合并
$ git push origin master                                     # 上传代码及快速合并
$ git fetch origin                                           # 从远程库获取代码
$ git branch                                                 # 显示所有分支
$ git checkout master                                         # 切换到master分支
$ git checkout -b dev                                         # 创建并切换到dev分支
$ git commit -m "first version"                               # 提交
$ git status                                                 # 查看状态
$ git log                                                     # 查看提交历史
$ git config --global core.editor vim                         # 设置默认编辑器为vim（git默认用nano）
$ git config core.ignorecase false                           # 设置大小写敏感
$ git config --global user.name "YOUR NAME"                   # 设置用户名
$ git config --global user.email "YOUR EMAIL ADDRESS"         # 设置邮箱
  ``` 
  
2. 别名 alias 
 
 ```java 
  $ git config --global alias.br="branch"                
# 创建/查看本地分支
$ git config --global alias.co="checkout"              
# 切换分支
$ git config --global alias.cb="checkout -b"            
# 创建并切换到新分支
$ git config --global alias.cm="commit -m"              
# 提交
$ git config --global alias.st="status"                
# 查看状态
$ git config --global alias.pullm="pull origin master"  
# 拉取分支
$ git config --global alias.pushm="push origin master"  
# 提交分支
$ git config --global alias.log="git log --oneline --graph --decorate --color=always" 
# 单行、分颜色显示记录
$ git config --global alias.logg="git log --graph --all --format=format:'%C(bold blue)%h%C(reset) - %C(bold green)(%ar)%C(reset) %C(white)%s%C(reset) %C(bold white)— %an%C(reset)%C(bold yellow)%d%C(reset)' --abbrev-commit --date=relative" 
# 复杂显示
  ``` 
  
3. 创建版本库 
 
 ```java 
  $ git clone <url>                
# 克隆远程版本库
$ git init                        
# 初始化本地版本库
  ``` 
  
4. 修改和提交 
 
 ```java 
  $ git status                      
# 查看状态
$ git diff                        
# 查看变更内容
$ git add .                      
# 跟踪所有改动过的文��
$ git add <file>                  
# 跟踪指定的文件
$ git mv <old> <new>              
# 文件改名
$ git rm <file>                  
# 删除文件
$ git rm --cached <file>          
# 停止跟踪文件但不删除
$ git commit -m “commit message”  
# 提交所有更新过的文件
$ git commit --amend              
# 修改最后一次提交
  ``` 
  
5. 查看历史 
 
 ```java 
  
$ git log                        
# 查看提交历史
$ git log -p <file>              
# 查看指定文件的提交历史
$ git blame <file>                
# 以列表方式查看指定文件的提交历史
  ``` 
  
6. 撤销 
 
 ```java 
  $ git reset --hard HEAD          
# 撤消工作目录中所有未提交文件的修改内容
$ git reset --hard <version>      
# 撤销到某个特定版本
$ git checkout HEAD <file>        
# 撤消指定的未提交文件的修改内容
$ git checkout -- <file>          
# 同上一个命令
$ git revert <commit>            
# 撤消指定的提交分支与标签
  ``` 
  
7. 分支与标签 
 
 ```java 
  $ git branch                      
# 显示所有本地分支
$ git checkout <branch/tag>      
# 切换到指定分支或标签
$ git branch <new-branch>        
# 创建新分支
$ git branch -d <branch>          
# 删除本地分支
$ git tag                        
# 列出所有本地标签
$ git tag <tagname>              
# 基于最新提交创建标签
$ git tag -a "v1.0" -m "一些说明"  
# -a指定标签名称，-m指定标签说明
$ git tag -d <tagname>            
# 删除标签
$ git checkout dev                
# 合并特定的commit到dev分支上
$ git cherry-pick 62ecb3
  ``` 
  
8. 合并与衍合 
 
 ```java 
  $ git merge <branch>              
# 合并指定分支到当前分支
$ git merge --abort              
# 取消当前合并，重建合并前状态
$ git merge dev -Xtheirs          
# 以合并dev分支到当前分支，有冲突则以dev分支为准
$ git rebase <branch>            
# 衍合指定分支到当前分支
  ``` 
  
9. 远程操作 
 
 ```java 
  $ git remote -v                  
# 查看远程版本库信息
$ git remote show <remote>        
# 查看指定远程版本库信息
$ git remote add <remote><url>  
# 添加远程版本库
$ git remote remove <remote>      
# 删除指定的远程版本库
$ git fetch <remote>              
# 从远程库获取代码
$ git pull <remote><branch>      
# 下载代码及快速合并
$ git push <remote><branch>      
# 上传代码及快速合并
$ git push <remote>:<branch/tag-name>
# 删除远程分支或标签
$ git push --tags                
# 上传所有标签
  ``` 
  
10. 打包 
 
 ```java 
  $ git archive --format=zip --output ../file.zip master    
# 将master分支打包成file.zip文件，保存在上一级目录
$ git archive --format=zip --output ../v1.2.zip v1.2      
# 打包v1.2标签的文件，保存在上一级目录v1.2.zip文件中
$ git archive --format=zip v1.2>../v1.2.zip            
# 作用同上一条命令

  ``` 
  
11. 全局和局部配置 
 
 ```java 
  全局配置保存在：$Home/.gitconfig
本地仓库配置保存在：.git/config
  ``` 
  
12. 打包 
 
 ```java 
  $ git init                              
# 初始化本地代码仓
$ git add .                            
# 添加本地代码
$ git commit -m "add local source"      
# 提交本地代码
$ git pull origin master                
# 下载远程代码
$ git merge master                      
# 合并master分支
$ git push -u origin master            
# 上传代码
  ``` 
  
 
                                        