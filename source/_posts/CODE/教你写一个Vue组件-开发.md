---
title: 教你写一个Vue组件
categories: 前端开发技术系列
tags:
  - JavaScript
abbrlink: 48eae60d
date: 2019-06-08 00:00:00
top: 8
---


前言 我们为什么要写个组件上传到npm镜像上呢，我们肯定遇到过这样一个场景，项目中有很多地方与某个功能相似，你想到的肯定是把该功能封装成Component组件，后续方便我们调用。但是过了一段。..
<!-- more -->

### 一、教你写一个Vue组件
#### 1.1 前言
我们为什么要写个组件上传到 
 `npm` 
 镜像上呢，我们肯定遇到过这样一个场景，项目中有很多地方与某个功能相似，你想到的肯定是把该功能封装成 
 `Component` 
 组件，后续方便我们调用。但是过了一段时间，你的 
 `Leader` 
 让你去开发另一个项目，结果你在哪个项目中又看见了类似的功能，你这时会怎么做? 你也可以使用 
 `Ctrl + c + v` 
 大法，拿过来上一个项目封装好的代码，但是如果需求有些变动，你得维护两套项目的代码，甚至以后更多的项目。...，这时你就可以封装一个功能上传到你们公司内网的 
 `npm` 
```
 上(或者自己的账号上)，这样每次遇到类似的功能直接 
```
 `npm install` 
  安装 
 `import` 
 导入进来使用就可以，需求有变动时完全可以改动一处代码。 
#### 1.2 配置环境
笔者这里使用的是 
 `Webpack` 
```
 配置(有点菜，不要介意)，也可以安装一个 
```
 `Vue-cli` 
 简单版的，它那里面有暴露 
```
 的配置(也得修改自行配置)，我们来配置一下打包组件环境，一般开发组件库都是使用的 
```
 `umd` 
 格式，这种格式支持 
 `Es Module` 
 、 
 `CommonJs` 
 、 
 `AMD` 
 三种引入方式使用，主要就是 
 里的 
 `library` 
 和 
 `libraryTarget` 
 ，如果不明白的看这里详解webpack的out.libraryTarget属性 
 
##### 项目结构
 
 ```java
  |- /node_modules
|- /src
   |- Tag.vue
   |- main.js
|- index.html
|- webpack.config.js
|- package.json

  `##### 初始化Package.json```text
  npm init -y

  `##### 安装Webpack && Loader && Plugin```java
  cnpm i webpack webpack-cli -D
cnpm i css-loader style-loader -D
cnpm i file-loader -D
cnpm i vue-loader@15.7.0 vue vue-template-compiler -D
cnpm i html-webpack-plugin@3.2.0 -D

  `css-loader style-loader 配置```text
  .css
  ``` 
 文件及样式使用 
 file-loader 配置特殊字体和图片使用 
 vue-loader 处理 
 `.vue` 
 文件后缀 
 vue 使用Vue语法 
 vue-template-compiler 处理 
 文件里的 
 `template` 
 模板语法 
 
##### webpack.config.js
 
```javascript
  const VueLoaderPlugin = require('vue-loader/lib/plugin')
const HtmlWebpackPlugin = require("html-webpack-plugin")
module.exports = {
    mode: "development",
    entry: "./src/main.js",
    output: {
        filename: "index.js"
```
    },
```
    module: {
        rules: [
```
            {
```json
                test: /\.css$/,
                use: ["style-loader", "css-loader"]  
```
            },
            {
```
                test: /\.(ttf|eot|woff|svg|woff2)/,
                use: "file-loader"
```
            },
            {
```json
                test: /\.vue$/,
                use: "vue-loader"
```
            }
        ]
    },
```
    plugins: [
        new VueLoaderPlugin(),
        new HtmlWebpackPlugin({
            template: "./index.html"
```
        })
    ]
}

  `##### index.html```xml
```html
  <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <div id="app"></div>
</html>
```

  `以上我们基本环境就搭建完啦，可以在终端使用```text
  npx webpack
  ``` 
 运行看看哦。 
#### 1.3 封装组件
我这里只做一个示例哈，代码就不写那么复杂，大家知道怎么打包使用就行，具体封装成啥样看你们公司需求啦~。笔者这里使用 
 `Element Ui` 
 组件来做一个示例，相信大部分小伙伴公司也在使用 
 。假如我们项目中有以下类似的功能就可以单独封装起来。 
![Test](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d2b20b215853416f9e5823a577973610~tplv-k3u1fbpfcp-zoom-1.image  '手把手教你写一个Vue组件发布到npm且可外链引入使用') 
##### main.js
 
 ```bash
```python
  import Vue from 'vue'
import { Tag } from 'element-ui';
import 'element-ui/lib/theme-chalk/tag.css';
Vue.component(Tag.name, Tag)
export default Tag
```

  `##### Tag.vue```xml
```java
<template>
  <div class="Tag">
    {{ msg }}
    <el-tag type="success">标签二</el-tag>
  </div>
</template>
```

```python
<script>
export default {
 name: 'Tag',
  data() {
    return {
        msg: "hello 蛙人",
```
    }
  },
```
  created() {
```
  },
```
  components: {},
  watch: {},
  methods: {
```
  }
```html
</script>
<style scoped>
```

```html
</style>
```


  ``` 
  
##### Webpack.config.js
将 
 `webpack.config.js` 
 里的 
 `output` 
 修改为如下 
 
    filename: "index.js",
    library: "Modal",
    libraryTarget: "umd"
}

  `配置完之后就可以使用```text
  `打包，可以看到有一个```text
  dist
  `目录，该目录下存在一个```text
  index.js
  `, 这个文件就是我们封装的```text
  Tag.vue
  `文件, 你可以将它引入到你的项目中，进行调用，该文件支持```text
  Es Module
  `、```text
  CommonJs
  AMD
  `三种方式引入。```java
import CustomTag from "./index" // 打包完的，直接引入进来
new Vue({
    el: "#app",
    render: h => h(CustomTag)
})

  ``` 
  
#### 1.4 Npm发布
如果没有 
 `npm` 
 账号呢，先去官网注册一个 
 `npm` 
 账号这里 
##### 新建一个发布包项目文件夹
在终端执行 
 `npm init -y` 
  ，进行初始 
 `package.json` 
```
 文件，主要信息就是name和main字段，前者是这个包的名称(也就是npm instal xxx)，后者则是我们打包好的文件 
```
 `Tag` 
 文件，默认 
 `main` 
 就去找这个入口文件。 
 
 
 ```json
{
  "name": "custom-tag-waren",
  "version": "1.0.0",
  "description": "这是xxxx",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "WaRen",
  "license": "ISC"
}

  `如果淘宝镜像之前被更改，先改回来执行以下命令```text
  npm config set registry http://registry.npmjs.org

  `注册完之后，执行```text
  npm login
  `, 依次填写你的```text
  用户名
  密码
  邮箱
  `执行```text
  npm publish
  ``` 
 发布，然后等待进度条完成即可。 
##### 整理一些常见的发布错误
这是因为镜像设置成淘宝镜像了，设置回来即可 
 
 ```text
  no_perms Private mode enable, only admin can publish this module

  ``` 
  
一般是没有登录，重新登录一下  
 `npm login` 
  即可 
 
  npm publish failed put 500 unexpected status code 401

  ``` 
  
包名被占用，改个包名即可，最好在官网查一下是否有包名被占用，之后再重命名 
 
  npm ERR! you do not have permission to publish “your module name”. Are you logged in as the correct user?

  ``` 
  
邮箱未验证，去官网验证一下邮箱 
 
  you must verify your email before publishing a new package

  ``` 
  
#### 1.5 npm安装使用
 
 `cnpm i custom-tag-waren -D` 
  
 
import customTagWaren from "custom-tag-waren"  // 下载完引入进来
    render: h => h(customTagWaren)
})

  `到此为止就完成了一个组件的打包上传下载，这样我们在每个项目需要的时候直接```text
  npm install
  ``` 
 安装就行，当需求改动的时候只改一个文件然后再次发布就行。是不是很方便啦。 
#### 1.6 外链引入
我们也不上传 
 `npm` 
 上，直接使用外链的形式使用，下面我们来看看 
##### import引入
 
 ```xml
    <TagEl/>

import TagEl from "./index"
       
    }
  },
  components: {
      TagEl
  },


  `上面```text
  example
  `中，我们看到直接引入了```text
  ``` 
 文件并进行注册组件，直接就可以使用啦。 
##### script引入
 
```python
    <div id="app">
        <Tag/>
    <script src="https://cdn.bootcdn.net/ajax/libs/vue/2.6.9/vue.min.js"></script>
    <script type="text/javascript" src="./dist/index.js"></script>
</body>
            Tag: Tag.default
```
        }
    })

  `中，直接使用```text
  script
  ``` 
 标签引入进来，也是注册完使用就可以。那么我们怎么知道他名字是Tag，这个你在封装组件的使用，必须指定Name名称。 
 
	name: "Tag"
}

  ``` 
  
#### 1.7 感谢
谢谢你读完本篇文章，希望对你能有所帮助，如有问题欢迎各位指正。 
```
```
https://blog.csdn.net/weixin_43606158/article/details/1068086
                                        