---
title: Hexo中文博客站点入门教程
categories: Hexo博客搭建指南系列
tags:
  - JavaScript
abbrlink: 8cec6709
date: 2018-09-08 00:00:00
top: 2
---

Hexo是一个快速、简洁且高效的静态博客框架，使用Markdown语法编写文章，在几秒内即可生成美观的静态网页。本文作为Hexo中文博客站点搭建的入门指南，详细介绍Windows平台下的环境准备、Hexo安装配置、主题选择、文章编写等基础操作

<!-- more -->

![Hexo](/photo/album/image_082.png  "Hexo中文博客站点-入门篇")

### 一、Hexo简介

#### 1.1 什么是Hexo

Hexo是一个快速、简洁且高效的静态博客框架，由Node.js驱动。它使用Markdown语法编写文章，在几秒内即可生成美观的静态网页。

```
Hexo的特点：
```
- 快速生成：使用Node.js驱动，生成速度快
- Markdown支持：使用Markdown语法编写文章
- 主题丰富：拥有大量精美的主题
- 插件生态：丰富的插件支持
- 部署简单：支持Git、FTP等多种部署方式

#### 1.2 为什么选择Hexo

```
优势：
```
- 免费：完全免费开源
- 简单：配置简单，易于上手
- 快速：生成速度快，访问速度快
- 灵活：可以自定义主题和功能
- SEO友好：静态页面，搜索引擎友好

```
适用场景：
```
- 个人技术博客
- 文档站点
- 项目展示网站
- 知识分享平台

### 二、环境准备

#### 2.1 系统要求

```
必需环境：
```
- Node.js：12.0或更高版本（推荐LTS版本）
- Git：用于版本控制和部署
- npm：Node.js包管理器（随Node.js安装）

```
推荐配置：
```
- 操作系统：Windows 7+、macOS 10.12+、Linux
- 内存：至少2GB RAM
- 磁盘空间：至少500MB可用空间

#### 2.2 安装Git

```
Windows平台：
```

1. 下载Git
   - 访问 https://git-scm.com/download/win
   - 下载Windows安装程序

2. 安装Git
   - 运行安装程序
   - 按照向导完成安装（使用默认选项即可）
   - 安装完成后重启命令行窗口

3. 验证安装
   ```bash
   git --version
   # 应该显示Git版本信息
   ```

```
macOS平台：
```

```bash
# 使用Homebrew安装
brew install git

# 或从官网下载安装包
# https://git-scm.com/download/mac
```

```
Linux平台：
```

```bash
# Ubuntu/Debian
sudo apt install git

# CentOS/RHEL
sudo yum install git
```

#### 2.3 安装Node.js

```
Windows平台：
```

1. 下载Node.js
   - 访问 https://nodejs.org/
   - 下载LTS版本（推荐）

2. 安装Node.js
   - 运行安装程序
   - 按照向导完成安装
   - 确保勾选"Add to PATH"

3. 验证安装
   ```bash
   node -v
   npm -v
   ```

```
macOS平台：
```

```bash
# 使用Homebrew安装
brew install node

# 或从官网下载安装包
```

```
Linux平台：
```

```bash
# 使用NodeSource仓库
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 三、安装Hexo

#### 3.1 全局安装Hexo

```
安装命令：
```

```bash
# 全局安装Hexo
npm install -g hexo-cli

# 验证安装
hexo version
```

```
如果安装失败：
```

```bash
# 检查npm权限
npm config get prefix

# 如果权限不足，使用管理员权限运行
# Windows: 右键命令提示符 → 以管理员身份运行
# macOS/Linux: 使用sudo
sudo npm install -g hexo-cli
```

#### 3.2 初始化Hexo项目

```
创建博客目录：
```

```bash
# 创建并进入博客目录
mkdir my-blog
cd my-blog

# 初始化Hexo
hexo init

# 或指定目录名
hexo init hexo-blog
cd hexo-blog
```

```
项目结构：
```

```
hexo-blog/
├── _config.yml          # 站点配置文件
├── package.json         # 项目依赖
├── scaffolds/           # 模板文件夹
├── source/              # 源文件目录
│   ├── _posts/          # 文章目录
│   └── _drafts/         # 草稿目录
├── themes/              # 主题目录
└── public/              # 生成的静态文件（自动生成）
```

#### 3.3 安装依赖

```bash
# 进入项目目录
cd hexo-blog

# 安装依赖
npm install

# 这会安装package.json中定义的所有依赖
```

### 四、配置Hexo

#### 4.1 基本配置

```
编辑_config.yml文件：
```

```yaml
# Site
title: 我的博客                    # 网站标题
subtitle: '技术分享与学习'          # 网站副标题
description: '个人技术博客'         # 网站描述
author: 您的名字                    # 作者
language: zh-CN                    # 语言
timezone: 'Asia/Shanghai'          # 时区

# URL
url: https://yourname.github.io     # 网站URL
root: /                             # 网站根目录
permalink: :year/:month/:day/:title/ # 文章永久链接格式
permalink_defaults:

# Directory
source_dir: source                  # 源文件目录
public_dir: public                  # 生成的静态文件目录
tag_dir: tags                       # 标签目录
archive_dir: archives               # 归档目录
category_dir: categories            # 分类目录
code_dir: downloads/code            # 代码目录
i18n_dir: :lang                     # 国际化目录
skip_render:

# Writing
new_post_name: :title.md            # 新文章文件名格式
default_layout: post                # 默认布局
titlecase: false                    # 标题转换为标题大小写
external_link: true                  # 在新窗口打开外部链接
filename_case: 0                     # 文件名大小写
render_drafts: false                 # 渲染草稿
post_asset_folder: false            # 启用资源文件夹
relative_link: false                 # 使用相对链接
future: true                         # 显示未来文章
highlight:                          # 代码高亮
  enable: true
  line_number: true
  auto_detect: false
  tab_replace: ''

# Category & Tag
default_category: uncategorized     # 默认分类
category_map:
tag_map:

# Date / Time format
date_format: YYYY-MM-DD              # 日期格式
time_format: HH:mm:ss               # 时间格式

# Pagination
per_page: 10                         # 每页文章数
pagination_dir: page                 # 分页目录

# Extensions
theme: landscape                     # 主题名称
```

#### 4.2 部署配置

```
配置Git部署：
```

```yaml
# Deployment
deploy:
  type: git
  repo: https://github.com/yourname/yourname.github.io.git
  branch: main
  message: "更新博客"
```

```
安装部署插件：
```

```bash
npm install hexo-deployer-git --save
```

### 五、创建和编写文章

#### 5.1 创建新文章

```bash
# 创建新文章
hexo new "文章标题"

# 或使用简写
hexo n "文章标题"

# 文章文件会创建在 source/_posts/ 目录下
```

```
文章Front Matter：
```

```markdown
---
title: 文章标题
date: 2020-05-30 00:00:00
tags:
  - 标签1
  - 标签2
categories:
  - 分类1
---
```

#### 5.2 编写文章

```
Markdown语法示例：
```

```markdown
# 一级标题

## 二级标题

### 三级标题

粗体文本

*斜体文本*

- 列表项1
- 列表项2

1. 有序列表1
2. 有序列表2

[链接文本](https://example.com)

![图片描述](图片路径)

```代码块
代码内容
```

> 引用文本
```

#### 5.3 文章分类和标签

```
分类：
```

```markdown
---
categories:
  - 技术
  - Java
---
```

```
标签：
```

```markdown
---
tags:
  - Spring
  - 框架
  - 教程
---
```

### 六、本地预览

#### 6.1 生成静态文件

```bash
# 生成静态文件
hexo generate

# 或使用简写
hexo g
```

#### 6.2 启动本地服务器

```bash
# 启动服务器
hexo server

# 或使用简写
hexo s

# 指定端口
hexo server -p 4000

# 指定IP和端口
hexo server -i 0.0.0.0 -p 4000
```

#### 6.3 访问博客

在浏览器中打开：`http://localhost:4000`

```
常用操作：
```
- 修改文章后，刷新浏览器即可看到更新
- 修改配置后，需要重启服务器
- 按`Ctrl+C`停止服务器

### 七、更换主题

#### 7.1 选择主题

```
主题网站：
- [Hexo官方主题](https://hexo.io/themes/)
- [GitHub主题搜索](https://github.com/search?q=hexo-theme)
```

```
推荐主题：
```
- Next：简洁美观，功能丰富
- Butterfly：现代化设计
- Fluid：Material Design风格
- Stun：简洁优雅

#### 7.2 安装主题

```
方法1：使用Git克隆（推荐）
```

```bash
# 进入themes目录
cd themes

# 克隆主题（以Next为例）
git clone https://github.com/next-theme/hexo-theme-next.git next

# 返回项目根目录
cd ..
```

```
方法2：使用npm安装
```

```bash
# 安装主题包
npm install hexo-theme-next
```

#### 7.3 启用主题

```
编辑_config.yml：
```

```yaml
theme: next  # 替换为你的主题名称
```

```
更新主题：
```

```bash
# 如果使用Git安装，可以更新主题
cd themes/next
git pull
cd ../..
```

### 八、部署到GitHub Pages

#### 8.1 创建GitHub仓库

1. 登录GitHub
2. 创建新仓库
3. 仓库名格式：`yourname.github.io`
4. 设置为公开仓库

#### 8.2 配置部署

```
安装部署插件：
```

```bash
npm install hexo-deployer-git --save
```

```
配置_config.yml：
```

```yaml
deploy:
  type: git
  repo: https://github.com/yourname/yourname.github.io.git
  branch: main
  message: "更新博客: {{ now('YYYY-MM-DD HH:mm:ss') }}"
```

#### 8.3 部署博客

```bash
# 清理缓存
hexo clean

# 生成静态文件
hexo generate

# 部署到GitHub
hexo deploy

# 或使用简写
hexo d

# 也可以组合使用
hexo clean && hexo g && hexo d
```

```
访问博客：
```
- 部署完成后，访问：`https://yourname.github.io`
- 首次部署可能需要几分钟生效

### 九、常用命令

#### 9.1 Hexo命令

```bash
# 创建新文章
hexo new "文章标题"
hexo n "文章标题"

# 创建页面
hexo new page "页面名称"

# 生成静态文件
hexo generate
hexo g

# 启动服务器
hexo server
hexo s

# 部署网站
hexo deploy
hexo d

# 清理缓存和生成的文件
hexo clean

# 组合命令
hexo clean && hexo g && hexo s  # 清理、生成、启动
hexo clean && hexo g && hexo d  # 清理、生成、部署
```

#### 9.2 常用插件

```
安装插件：
```

```bash
# 安装插件
npm install hexo-plugin-name --save

# 卸载插件
npm uninstall hexo-plugin-name
```

```
推荐插件：
```

```bash
# 本地搜索
npm install hexo-generator-search --save

# 站点地图
npm install hexo-generator-sitemap --save

# RSS订阅
npm install hexo-generator-feed --save

# 文章字数统计
npm install hexo-wordcount --save

# 图片懒加载
npm install hexo-lazyload-image --save
```

### 十、常见问题解决

#### 10.1 安装问题

```
问题1：npm命令找不到
```

```
解决方案：
```
- 检查Node.js是否正确安装
- 检查环境变量PATH
- 重启命令行窗口

```
问题2：Hexo命令找不到
```

```
解决方案：
```
```bash
# 检查是否全局安装
npm list -g hexo-cli

# 重新安装
npm install -g hexo-cli
```

#### 10.2 运行问题

```
问题1：端口被占用
```

```
解决方案：
```
```bash
# 使用其他端口
hexo server -p 5000

# 或查找并关闭占用端口的进程
# Windows
netstat -ano | findstr :4000
taskkill /PID <进程ID> /F

# macOS/Linux
lsof -i :4000
kill -9 <进程ID>
```

```
问题2：生成失败
```

```
解决方案：
```
```bash
# 清理缓存
hexo clean

# 检查Markdown语法
# 检查配置文件格式

# 重新生成
hexo generate
```

#### 10.3 部署问题

```
问题1：部署失败
```

```
解决方案：
```
- 检查Git配置
- 检查仓库地址是否正确
- 检查是否有写权限
- 配置SSH密钥（推荐）

```
问题2：GitHub Pages不更新
```

```
解决方案：
```
- 检查仓库设置中的Pages配置
- 等待几分钟让GitHub处理
- 检查分支名称是否正确（main或master）

### 十一、下一步学习

通过本文的学习，您已经掌握了Hexo博客搭建的基础知识。接下来您可以：

1. 学习主题定制：修改主题配置和样式
2. 学习插件使用：安装和使用各种插件
3. 学习高级配置：SEO优化、CDN加速等
4. 学习自定义功能：添加评论、统计等

在下一篇文章（基础篇）中，我们将深入学习Hexo的配置文件详解、主题深度定制、插件开发等内容。



