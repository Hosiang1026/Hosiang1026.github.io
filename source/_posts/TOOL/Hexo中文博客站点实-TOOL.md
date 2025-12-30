---
title: Hexo中文博客站点实
categories: Hexo博客搭建指南系列
tags:
  - Shell
  - JavaScript
author: 狂欢马克思
abbrlink: 6159a286
date: 2018-09-04 00:00:00
top: 1
---



本文作为Hexo中文博客站点的实战指南，通过完整的项目案例，展示Hexo中文博客站点在实际开发中的应用。从项目规划、架构设计到具体实现，手把手教您完成一个完整的Hexo中文博客站点项目，将理论知识转化为实际技能。

<!-- more -->

### 一、项目概述

#### 1.1 项目需求

```
**项目背景：** 搭建一个完整的个人技术博客，支持文章发布、分类管理、标签系统、搜索功能、评论系统等。
```

```
**核心需求：**
```
- 美观的博客主题
- 文章分类和标签管理
- 搜索功能
- 评论系统（Gitalk/Valine）
- 访问统计（不蒜子/Google Analytics）
- 多平台部署（GitHub Pages + Gitee Pages）
- 自定义域名
- RSS订阅

#### 1.2 技术选型

```
**技术栈：**
```
- **静态站点生成器**: Hexo 6.0+
- **主题**: Next主题（推荐）/ Butterfly / Fluid
- **部署平台**: GitHub Pages + Gitee Pages
- **评论系统**: Gitalk / Valine / Giscus
- **搜索**: Algolia / Local Search
- **图床**: 七牛云 / 阿里云OSS / GitHub

```
**开发工具：**
```
- **编辑器**: VS Code / Typora
- **版本控制**: Git
- **图片处理**: PicGo

### 二、项目架构

#### 2.1 整体架构

```
┌─────────────────────────────────────┐
│      Hexo博客源码 (本地)             │
│  - 文章Markdown文件                  │
│  - 主题配置                         │
│  - 插件配置                         │
├─────────────────────────────────────┤
│      Git仓库 (GitHub/Gitee)         │
│  - 源码仓库 (私有)                  │
│  - 静态站点仓库 (公开)              │
├─────────────────────────────────────┤
│      静态站点 (GitHub Pages)        │
│  - 生成的HTML/CSS/JS文件            │
│  - 访问地址: username.github.io     │
└─────────────────────────────────────┘
```

#### 2.2 项目结构

```
hexo-blog/
├── _config.yml              # Hexo主配置文件
├── package.json             # 依赖管理
├── scaffolds/               # 模板文件夹
│   ├── post.md
│   ├── draft.md
│   └── page.md
├── source/                  # 源文件目录
│   ├── _posts/              # 文章目录
│   │   ├── 2024-01-01-文章标题.md
│   │   └── ...
│   ├── _drafts/             # 草稿目录
│   ├── _pages/              # 页面目录
│   │   ├── about.md
│   │   ├── archives.md
│   │   └── tags.md
│   └── images/              # 图片资源
├── themes/                  # 主题目录
│   └── next/                # Next主题
│       ├── _config.yml      # 主题配置文件
│       └── ...
├── public/                  # 生成的静态文件（自动生成）
└── .deploy_git/             # 部署仓库（自动生成）
```

### 三、核心实现

#### 3.1 项目初始化

```
**1. 创建Hexo项目：**
```

```bash
# 安装Hexo CLI
npm install -g hexo-cli

# 初始化博客
hexo init my-blog
cd my-blog

# 安装依赖
npm install

# 安装部署插件
npm install hexo-deployer-git --save

# 安装其他常用插件
npm install hexo-generator-search --save
npm install hexo-generator-sitemap --save
npm install hexo-generator-baidu-sitemap --save
```

```
**2. 配置Hexo主配置文件：**
```

```yaml
# _config.yml

# 网站信息
title: 我的技术博客
subtitle: '记录技术成长之路'
description: '个人技术博客，分享开发经验和技术心得'
author: 你的名字
language: zh-CN
timezone: 'Asia/Shanghai'

# URL配置
url: https://yourname.github.io
root: /
permalink: :year/:month/:day/:title/
permalink_defaults:

# 目录配置
source_dir: source
public_dir: public
tag_dir: tags
archive_dir: archives
category_dir: categories
code_dir: downloads/code
i18n_dir: :lang
skip_render:

# 写作配置
new_post_name: :title.md
default_layout: post
titlecase: false
external_link: true
filename_case: 0
render_drafts: false
post_asset_folder: false
relative_link: false
future: true
highlight:
  enable: true
  line_number: true
  auto_detect: false
  tab_replace: ''

# 分类和标签
default_category: uncategorized
category_map:
tag_map:

# 日期格式
date_format: YYYY-MM-DD
time_format: HH:mm:ss

# 分页
per_page: 10
pagination_dir: page

# 主题
theme: next

# 部署配置
deploy:
  type: git
  repo: 
    github: https://github.com/yourname/yourname.github.io.git
    gitee: https://gitee.com/yourname/yourname.git
  branch: main
  message: "Site updated: {{ now('YYYY-MM-DD HH:mm:ss') }}"
```

#### 3.2 主题配置

```
**安装Next主题：**
```

```bash
cd themes
git clone https://github.com/next-theme/hexo-theme-next.git next
cd ..
```

```
**配置Next主题：**
```

```yaml
# themes/next/_config.yml

# 主题样式
scheme: Muse  # 可选: Muse | Mist | Pisces | Gemini

# 菜单配置
menu:
  home: / || fa fa-home
  about: /about/ || fa fa-user
  tags: /tags/ || fa fa-tags
  categories: /categories/ || fa fa-th
  archives: /archives/ || fa fa-archive

# 侧边栏
sidebar:
  position: left  # left | right
  display: post  # always | post | hide

# 社交链接
social:
  GitHub: https://github.com/yourname || fab fa-github
  Email: mailto:yourname@example.com || fa fa-envelope

# 搜索
local_search:
  enable: true
  trigger: auto
  top_n_per_article: 1

# 评论系统
gitalk:
  enable: true
  githubID: yourname
  repo: yourname.github.io
  ClientID: your_client_id
  ClientSecret: your_client_secret
  adminUser: yourname
  distractionFreeMode: true

# 访问统计
busuanzi_count:
  enable: true
  total_visitors: true
  total_visitors_icon: fa fa-user
  total_views: true
  total_views_icon: fa fa-eye
  post_views: true
  post_views_icon: fa fa-eye

# 代码高亮
highlight_theme: normal  # normal | night | night eighties | night blue | night bright

# 动画效果
motion:
  enable: true
  async: false
```

#### 3.3 文章管理

```
**创建文章：**
```

```bash
# 创建新文章
hexo new "文章标题"

# 创建草稿
hexo new draft "草稿标题"

# 发布草稿
hexo publish "草稿标题"

# 创建页面
hexo new page "about"
```

```
**文章Front Matter：**
```

```markdown
---
title: 文章标题
date: 2020-07-05 00:00:00
updated: 2024-01-02 12:00:00
tags:
  - 标签1
  - 标签2
categories:
  - 分类1
cover: /images/cover.jpg
description: 文章描述
toc: true
comments: true
---
```

#### 3.4 插件配置

```
**搜索插件：**
```

```yaml
# _config.yml
search:
  path: search.xml
  field: post
  format: html
  limit: 10000
```

```
**RSS插件：**
```

```bash
npm install hexo-generator-feed --save
```yaml
# _config.yml
feed:
```
  type: atom
  path: atom.xml
  limit: 20
```
  hub:
```
  content: true
  content_limit: 140
  content_limit_delim: ' '
```
```

**图片插件：**

```bash
npm install hexo-asset-image --save
```

### 四、部署上线

#### 4.1 GitHub Pages部署

**1. 创建GitHub仓库：**

1. 登录GitHub
2. 创建新仓库：`yourname.github.io`
3. 设置为公开仓库

**2. 配置SSH密钥：**

```bash
# 生成SSH密钥
ssh-keygen -t rsa -C "your_email@example.com"

# 复制公钥
cat ~/.ssh/id_rsa.pub

# 添加到GitHub
# Settings → SSH and GPG keys → New SSH key
```

**3. 配置部署：**

```yaml
# _config.yml
deploy:
```java
  type: git
  repo: git@github.com:yourname/yourname.github.io.git
  branch: main
```
```

**4. 部署命令：**

```bash
# 清理并生成
hexo clean && hexo generate

# 部署到GitHub
hexo deploy

# 或使用简写
hexo d -g
```

#### 4.2 Gitee Pages部署

**1. 创建Gitee仓库：**

1. 登录Gitee
2. 创建新仓库：`yourname`
3. 同步GitHub代码

**2. 开启Gitee Pages：**

1. 仓库 → 服务 → Gitee Pages
2. 选择分支和目录
3. 点击"启动"
4. 访问地址：`https://yourname.gitee.io`

**3. 自动部署脚本：**

```bash
#!/bin/bash
# deploy.sh

# 生成静态文件
hexo clean
hexo generate

# 部署到GitHub
hexo deploy

# 同步到Gitee
cd .deploy_git
git remote add gitee https://gitee.com/yourname/yourname.git
git push gitee main --force
cd ..
```

#### 4.3 自定义域名

**1. 购买域名：**

- 在域名注册商购买域名（如：阿里云、腾讯云）

**2. 配置DNS：**

```
类型    主机记录    记录值
CNAME   www        yourname.github.io
CNAME   @          yourname.github.io
```

**3. 添加CNAME文件：**

```bash
# 在source目录创建CNAME文件
echo "www.yourdomain.com" > source/CNAME

# 或直接编辑
# source/CNAME
www.yourdomain.com
```

**4. GitHub Pages设置：**

1. 仓库 → Settings → Pages
2. Custom domain: 输入域名
3. 等待DNS生效（通常几分钟到几小时）

### 五、项目总结

#### 5.1 经验总结

**开发过程中的关键点：**

1. **主题选择**：Next主题功能完善，文档齐全
2. **文章管理**：使用Markdown编写，便于版本控制
3. **图片管理**：使用图床或GitHub存储图片
4. **SEO优化**：配置sitemap、RSS、meta标签
5. **访问统计**：使用不蒜子或Google Analytics

#### 5.2 优化建议

**性能优化：**
- 使用CDN加速静态资源
- 压缩图片大小
- 启用Gzip压缩
- 使用懒加载

**SEO优化：**
- 配置sitemap
- 添加meta标签
- 优化文章标题和描述
- 内链建设

**功能扩展：**
- 添加搜索功能
- 集成评论系统
- 添加访问统计
- 实现RSS订阅
- 添加打赏功能

### 六、总结

通过本系列文章的学习，您已经全面掌握了Hexo中文博客站点从入门到实战的完整知识体系。希望这些内容能够帮助您在Hexo中文博客站点开发中取得更好的成果。