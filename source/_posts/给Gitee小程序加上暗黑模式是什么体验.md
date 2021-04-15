---
title: 推荐系列-给Gitee小程序加上暗黑模式是什么体验
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 897
cover_picture: ''
abbrlink: b8ca02a2
date: 2021-04-15 09:08:53
---

&emsp;&emsp;前段时间利用空余时间基于 Gitee OpenApi 写了一个微信上的码云第三方非官方微信小程序，收获了一部分用户，一直想给它怼上跟随系统自动变化的暗黑模式，今天总算有时间给搞了。 实现原理 所...
<!-- more -->

                                                                                                                                                                                         
#### 实现原理 
 
所有代码基本没碰到JavaScript部分，也没有使用小程序的API进行操作，全程使用媒体查询与环境变量实现，如下： 
###### 原始小程序部分 
在小程序源代码根目录新建  ```java 
  theme.json
  ```  文件，用于保存暗黑模式和普通模式下的一些颜色值和配置： 
 ```java 
  {
  "light": {
    "backgroundColor": "#f5f5f5",
    "backgroundTextStyle": "dark",
    "backgroundColorTop": "#f5f5f5",
    "backgroundColorBottom": "#f5f5f5",
    "navigationBarBackgroundColor": "#f5f5f5",
    "navigationBarTextStyle": "black"
  },
  "dark": {
    "backgroundColor": "#222",
    "backgroundTextStyle": "light",
    "backgroundColorTop": "#222",
    "backgroundColorBottom": "#222",
    "navigationBarBackgroundColor": "#222",
    "navigationBarTextStyle": "white"
  }
}

  ```  
同时将这个配置文件引入到  ```java 
  app.json
  ```  中，同时将  ```java 
  window
  ```  节点中的颜色配置成上面的变量： 
 ```java 
  {
  "darkmode": true,
  "themeLocation": "theme.json",
  "pages": [
  ...
  ],
  "window": {
    "backgroundColor": "@backgroundColor",
    "backgroundTextStyle": "@backgroundTextStyle",
    "backgroundColorTop": "@backgroundColorTop",
    "backgroundColorBottom": "@backgroundColorBottom",
    "navigationBarBackgroundColor": "@navigationBarBackgroundColor",
    "navigationBarTitleText": "码云仓库",
    "navigationBarTextStyle": "@navigationBarTextStyle",
    "navigationStyle": "default"
  },
}

  ```  
这样，系统在切换显示模式时，小程序的导航栏部分就会自动跟着变色了 ：） 
###### 用户自定义页面部分 
这部分无法直接引用这个配置文件的设置，而且可能很多地方有自定义的颜色值，所以这里需要自己写媒体查询了 ：( 
这里编辑  ```java 
  app.wxss
  ```  或者每个页面单独的  ```java 
  *.wxss
  ```  ，当然，我为了省事，基本都写在了  ```java 
  app.wxss
  ```  中： 
 ```java 
  
@media (prefers-color-scheme: dark) {
	.title{
		color:white; /*将原本黑色的标题在暗黑模式下设置为白色 这里就需要各位自行调整颜色了*/
	}
}

  ```  
#### 收工体验 
欢迎微信搜索  ```java 
  码云仓库
  ```  来体验一下，小程序支持了查看仓库、Pull Requests、Issues、用户信息、粉丝关注、通知私信、组织信息等。 
你也可以扫码体验： 
![Test](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/df0ca2a7395644e4a613e4e3694e94a2~tplv-k3u1fbpfcp-zoom-1.image 给Gitee小程序加上暗黑模式是什么体验) 
#### 瞧瞧部分截图： 
![Test](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/df0ca2a7395644e4a613e4e3694e94a2~tplv-k3u1fbpfcp-zoom-1.image 给Gitee小程序加上暗黑模式是什么体验) ![Test](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/df0ca2a7395644e4a613e4e3694e94a2~tplv-k3u1fbpfcp-zoom-1.image 给Gitee小程序加上暗黑模式是什么体验) ![Test](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/df0ca2a7395644e4a613e4e3694e94a2~tplv-k3u1fbpfcp-zoom-1.image 给Gitee小程序加上暗黑模式是什么体验)
                                        