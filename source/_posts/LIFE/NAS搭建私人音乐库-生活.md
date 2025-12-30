---
title: NAS搭建私人音乐库
categories: 生活情感日记系列
tags:
  - Shell
  - Life
abbrlink: 1d8f5496
date: 2019-07-03 00:00:00
top: 60
---

在版权限制和平台限制日益严格的今天，搭建私人音乐库成为音乐爱好者的理想选择。详细介绍如何使用设备搭建Navidrome私人音乐服务器，实现音乐文件的集中管理、在线播放、多设备同步和分享功能。

<!-- more -->

![8e819928fca747fe43b386a0a9d626b4b8f41775](https://hosiang1026.github.io/photos/image/2024/12/17/qo0rn2.jpg)

### 一、Navidrome简介

#### 1.1 什么是Navidrome

Navidrome是一个功能全面的跨平台开源音乐流媒体服务器，旨在帮助用户搭建自己的本地音乐库，并通过流媒体服务随时访问。

核心特性：

- 跨平台支持：支持macOS、Linux、Windows以及Docker容器化部署
- 格式兼容：兼容MP3、FLAC、WAV、AAC、OGG等常见音频格式
- Web界面：提供友好的Web管理界面，方便管理和访问音乐库
- API支持：提供完整的RESTful API，支持第三方客户端接入
- 智能播放列表：支持动态播放列表、智能推荐等功能
- 用户权限控制：支持多用户、权限管理、分享功能
- 跨平台同步：支持多设备同步，随时随地访问音乐库

#### 1.2 适用场景

个人使用：

- 收藏的经典老歌、无法在线收听的版权音乐
- 打造专属的播放环境，自定义播放体验
- 多设备同步，随时随地听音乐

分享使用：
- 与家人朋友分享音乐和播放列表
- 搭建家庭音乐服务器
- 团队音乐库共享

#### 1.3 相关资源

- 官方网站：[Navidrome官网](https://www.navidrome.org/)
- GitHub仓库：[Navidrome GitHub](https://github.com/navidrome/navidrome/)
- 文档：详细的安装和使用文档可在官网查看

#### 1.4 环境要求

本教程操作环境：

- 操作系统：Linux Ubuntu系统
- 前置要求：需要先安装Docker或docker-compose
- 硬件要求：根据音乐库大小，建议至少2GB内存和足够的存储空间

### 二、安装方法

通过Docker安装

```bash
docker run -d --name navidrome --restart=unless-stopped --user $(id -u):$(id -g) -v /mnt/sda1/webdav/music:/music -v /mnt/sda1/webdav/music/data:/data  -p 4533:4533 -e ND_LOGLEVEL=info deluan/navidrome:latest

```
这条命令会将Navidrome运行在后台，并设置自动重启。你需要根据自己的实际路径调整 /mnt/sda1/webdav/music 和 /mnt/sda1/webdav/music/data，这些路径分别对应你的音乐文件夹和数据存储目录。

2. 电脑端访问

安装成功后，打开浏览器，输入 localhost:4533，你将看到Navidrome的登录界面。首次登录时需要设置用户名和密码。

![155621](https://hosiang1026.github.io/photos/image/2024/12/17/prrvde.png)

3. 移动端访问

Navidrome支持多种移动端客户端，您可以根据自己的需求和设备选择合适的APP。目前主流的移动端客户端包括：

#### 2.1 音流（MusicStream）

平台支持：

- Android（安卓设备）
- iOS（苹果设备）
- Windows（PC端）

特点：

- 界面美观，操作流畅
- 支持在线播放和离线下载
- 自动同步音乐库
- 支持歌词显示和封面展示
- 部分高级功能需要付费，但免费版功能已足够日常使用

下载地址：

- 官方网站：[音流程序下载](https://music.aqzscn.cn)
- 支持从官网直接下载各平台客户端

使用方法：

1. 在APP中选择"Navidrome"服务器类型
2. 填写服务器地址（如：`http://192.168.1.100:4533`）
3. 输入用户名和密码
4. 点击"立即同步"，自动刷新资源库
5. 开始享受您的私人音乐库

![60b87-ca3fefb87f148b5c03ecf069fb1f95ab](https://hosiang1026.github.io/photos/image/2024/12/17/prrmbl.png)

#### 2.2 箭头音乐（Arrows）

- 开源免费，完全免费使用
- 界面简洁，专注于音乐播放
- 支持Subsonic API协议（Navidrome兼容）
- 轻量级应用，占用资源少
- 支持离线下载和缓存
- 支持歌词和封面显示

优势：
- 完全开源，安全可靠
- 无广告，无内购
- 持续更新维护
- 社区活跃，问题反馈及时

1. 从应用商店或GitHub下载安装
2. 添加服务器，选择"Subsonic"类型
3. 输入服务器地址、用户名和密码
4. 连接成功后即可访问音乐库

- GitHub：[Arrows GitHub](https://github.com/radialapps/arrows)
- 应用商店搜索"Arrows Music"或"箭头音乐"

#### 2.3 Amperfy

- 开源免费的音乐客户端
- 支持Subsonic API协议
- 界面现代化，用户体验优秀
- 支持离线下载和播放
- 支持歌词同步显示
- 支持专辑封面和艺术家图片
- 支持播放列表管理
- 完全免费，无广告
- 开源项目，代码透明
- 支持多种音乐服务器（Navidrome、Airsonic等）
- 功能丰富，满足高级用户需求

使用方法：

1. 从GitHub或应用商店下载安装
2. 添加服务器，选择"Subsonic"协议
3. 配置服务器地址、端口、用户名和密码
4. 连接成功后同步音乐库
5. 支持离线下载，随时随地听音乐

下载地址：

- GitHub：[Amperfy GitHub](https://github.com/BLeeEZ/amperfy)
- 应用商店搜索"Amperfy"

#### 2.4 客户端对比

| 客户端 | 平台支持 | 开源 | 付费 | 特点 |
|--------|---------|------|------|------|
| 音流 | Android/iOS/Windows | 否 | 部分功能付费 | 界面美观，功能丰富 |
| 箭头音乐 | Android/iOS | 是 | 完全免费 | 轻量简洁，开源安全 |
| Amperfy | Android/iOS | 是 | 完全免费 | 功能强大，体验优秀 |

选择建议：

- 追求美观和丰富功能：推荐音流
- 注重开源和免费：推荐箭头音乐或Amperfy
- Windows用户：推荐音流（目前唯一支持Windows的客户端）
- 轻量级需求：推荐箭头音乐
- 功能全面：推荐Amperfy

通用配置说明：
无论使用哪个客户端，连接Navidrome服务器时都需要以下信息：
- 服务器类型：选择"Subsonic"或"Navidrome"
- 服务器地址：您的NAS IP地址（如：192.168.1.100）
- 端口：Navidrome服务端口（默认：4533）
- 用户名：Navidrome登录用户名
- 密码：Navidrome登录密码
- 协议：通常选择HTTPS（如果配置了SSL）或HTTP

### 三、下载歌曲

[XiaoMusic GitHub](https://github.com/hanxi/xiaomusic)：让小爱音箱真正实现无限听歌，释放更多可能！

借助 yt-dlp 强大的下载功能，XiaoMusic 支持语音口令自动下载和播放歌曲。例如，当你对小爱音箱说"播放歌曲王菲的《心愿》"，XiaoMusic 会智能化地先将《心愿》下载至本地设备，然后立即播放，确保高质量的音乐体验。无论是热门歌曲还是经典老歌，都能轻松实现播放，让你的音乐时光更加流畅、自由。

```bash
docker run -dit --restart=always --name xiaomusic -p 8090:8090 -v /mnt/mmcblk1p1/music:/app/music -v /mnt/mmcblk1p1/xiaomusic/conf:/app/conf hanxi/xiaomusic
```

### 四、歌词及封面

为了使你的音乐体验更加完美，你可能需要为歌曲添加歌词和封面。这里有两种方法可以实现这一功能：

方法一：

LyricAPI是一个支持酷狗、聚合API获取LRC歌词的服务，它还提供获取专辑、艺术家封面等功能。你可以通过以下命令启动：

```bash
docker run -d --name lyricapi -p 28883:28883 -v /vol1/1000/musics:/music hisatri/lyricapi
```

LyricAPI默认监听在28883端口，API地址为：

1. 获取歌词：http://192.168.1.112:28883/lyrics
2. 获取专辑封面：http://192.168.1.112:28883/cover

将这些API接口集成到客户端软件中（音流、箭头音乐、Amperfy等），设置好歌词接口和封面接口地址后，即可同步歌词和封面。

客户端配置说明：

- 音流：在设置中找到"歌词接口"和"封面接口"，填入LyricAPI的地址
- 箭头音乐：支持自定义歌词和封面API，在服务器设置中配置
- Amperfy：同样支持自定义API接口，可在设置中配置歌词和封面服务

方法二：

如果你希望编辑歌曲的标题、专辑、艺术家、歌词和封面信息，可以使用音乐标签编辑器，它支持多种音频格式，如FLAC、MP3、M4A等。你可以通过以下链接下载：

2. Web版：https://github.com/xhongc/music-tag-Web

![1767201-20191031191519781-1684570911](https://hosiang1026.github.io/photos/image/2024/12/17/qgsj8r.gif)


![160214](https://hosiang1026.github.io/photos/image/2024/12/17/qwq04d.png)


### 五、总结

Navidrome作为一款开源的音乐服务器，提供了简单易用且功能强大的音乐管理解决方案。它支持多种音频格式，并允许通过多平台访问和管理自己的音乐库。无论你是在家中还是在外出旅行，使用Navidrome搭建自己的私人音乐流媒体库，都能随时随地享受音乐带来的乐趣。通过Docker安装，配置过程相对简单，几步即可完成，尤其适合希望搭建本地音乐平台的用户。

