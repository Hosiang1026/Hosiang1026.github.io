---
title: 推荐系列-手把手教你写一个Vue组件发布到npm且可外链引入使用
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 1523
cover_picture: ''
abbrlink: 5777c75f
date: 2021-04-15 09:26:24
---

&emsp;&emsp;前言 我们为什么要写个组件上传到npm镜像上呢，我们肯定遇到过这样一个场景，项目中有很多地方与某个功能相似，你想到的肯定是把该功能封装成Component组件，后续方便我们调用。但是过了一段...
<!-- more -->

                                                                                                                                                                                        #### 前言 
我们为什么要写个组件上传到 
 ```java 
  npm
  ``` 
 镜像上呢，我们肯定遇到过这样一个场景，项目中有很多地方与某个功能相似，你想到的肯定是把该功能封装成 
 ```java 
  Component
  ``` 
 组件，后续方便我们调用。但是过了一段时间，你的 
 ```java 
  Leader
  ``` 
 让你去开发另一个项目，结果你在哪个项目中又看见了类似的功能，你这时会怎么做? 你也可以使用 
 ```java 
  Ctrl + c + v
  ``` 
 大法，拿过来上一个项目封装好的代码，但是如果需求有些变动，你得维护两套项目的代码，甚至以后更多的项目....，这时你就可以封装一个功能上传到你们公司内网的 
 ```java 
  npm
  ``` 
 上(或者自己的账号上)，这样每次遇到类似的功能直接 
 ```java 
  npm install
  ``` 
  安装 
 ```java 
  import
  ``` 
 导入进来使用就可以，需求有变动时完全可以改动一处代码。 
#### 配置环境 
笔者这里使用的是 
 ```java 
  Webpack
  ``` 
 配置(有点菜，不要介意)，也可以安装一个 
 ```java 
  Vue-cli
  ``` 
 简单版的，它那里面有暴露 
 ```java 
  Webpack
  ``` 
 的配置(也得修改自行配置)，我们来配置一下打包组件环境，一般开发组件库都是使用的 
 ```java 
  umd
  ``` 
 格式，这种格式支持 
 ```java 
  Es Module
  ``` 
 、 
 ```java 
  CommonJs
  ``` 
 、 
 ```java 
  AMD
  ``` 
 三种引入方式使用，主要就是 
 ```java 
  Webpack
  ``` 
 里的 
 ```java 
  library
  ``` 
 和 
 ```java 
  libraryTarget
  ``` 
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

  ``` 
  
##### 初始化Package.json 
 
 ```java 
  npm init -y

  ``` 
  
##### 安装Webpack && Loader && Plugin 
 
 ```java 
  cnpm i webpack webpack-cli -D
cnpm i css-loader style-loader -D
cnpm i file-loader -D
cnpm i vue-loader@15.7.0 vue vue-template-compiler -D
cnpm i html-webpack-plugin@3.2.0 -D

  ``` 
  
 
 css-loader style-loader 配置 
 ```java 
  .css
  ``` 
 文件及样式使用 
 file-loader 配置特殊字体和图片使用 
 vue-loader 处理 
 ```java 
  .vue
  ``` 
 文件后缀 
 vue 使用Vue语法 
 vue-template-compiler 处理 
 ```java 
  .vue
  ``` 
 文件里的 
 ```java 
  template
  ``` 
 模板语法 
 
##### webpack.config.js 
 
 ```java 
  const VueLoaderPlugin = require('vue-loader/lib/plugin')
const HtmlWebpackPlugin = require("html-webpack-plugin")
module.exports = {
    mode: "development",
    entry: "./src/main.js",
    output: {
        filename: "index.js"
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"]  
            },
            {
                test: /\.(ttf|eot|woff|svg|woff2)/,
                use: "file-loader"
            },
            {
                test: /\.vue$/,
                use: "vue-loader"
            }
        ]
    },
    plugins: [
        new VueLoaderPlugin(),
        new HtmlWebpackPlugin({
            template: "./index.html"
        })
    ]
}

  ``` 
  
##### index.html 
 
 ```java 
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
  
以上我们基本环境就搭建完啦，可以在终端使用 
 ```java 
  npx webpack
  ``` 
 运行看看哦。 
#### 封装组件 
我这里只做一个示例哈，代码就不写那么复杂，大家知道怎么打包使用就行，具体封装成啥样看你们公司需求啦~。笔者这里使用 
 ```java 
  Element Ui
  ``` 
 组件来做一个示例，相信大部分小伙伴公司也在使用 
 ```java 
  Element Ui
  ``` 
 。假如我们项目中有以下类似的功能就可以单独封装起来。 
![Test](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d2b20b215853416f9e5823a577973610~tplv-k3u1fbpfcp-zoom-1.image  '手把手教你写一个Vue组件发布到npm且可外链引入使用') 
##### main.js 
 
 ```java 
  import Vue from 'vue'
import { Tag } from 'element-ui';
import 'element-ui/lib/theme-chalk/tag.css';
Vue.component(Tag.name, Tag)
export default Tag

  ``` 
  
##### Tag.vue 
 
 ```java 
  <template>
  <div class="Tag">
    {{ msg }}
    <el-tag type="success">标签二</el-tag>
  </div>
</template>

<script>
export default {
 name: 'Tag',
  data() {
    return {
        msg: "hello 蛙人",
    }
  },
  created() {
  },
  components: {},
  watch: {},
  methods: {
  }
}
</script>
<style scoped>

</style>


  ``` 
  
##### Webpack.config.js 
将 
 ```java 
  webpack.config.js
  ``` 
 里的 
 ```java 
  output
  ``` 
 修改为如下 
 
 ```java 
  output: {
    filename: "index.js",
    library: "Modal",
    libraryTarget: "umd"
}

  ``` 
  
配置完之后就可以使用 
 ```java 
  npx webpack
  ``` 
 打包，可以看到有一个 
 ```java 
  dist
  ``` 
 目录，该目录下存在一个 
 ```java 
  index.js
  ``` 
 , 这个文件就是我们封装的 
 ```java 
  Tag.vue
  ``` 
 文件, 你可以将它引入到你的项目中，进行调用，该文件支持 
 ```java 
  Es Module
  ``` 
 、 
 ```java 
  CommonJs
  ``` 
 、 
 ```java 
  AMD
  ``` 
 三种方式引入。 
 
 ```java 
  import Vue from 'vue'
import { Tag } from 'element-ui';
import 'element-ui/lib/theme-chalk/tag.css';
Vue.component(Tag.name, Tag)
import CustomTag from "./index" // 打包完的，直接引入进来
new Vue({
    el: "#app",
    render: h => h(CustomTag)
})

  ``` 
  
#### Npm发布 
如果没有 
 ```java 
  npm
  ``` 
 账号呢，先去官网注册一个 
 ```java 
  npm
  ``` 
 账号这里 
##### 新建一个发布包项目文件夹 
在终端执行 
 ```java 
  npm init -y
  ``` 
  ，进行初始 
 ```java 
  package.json
  ``` 
 文件，主要信息就是name和main字段，前者是这个包的名称(也就是npm instal xxx)，后者则是我们打包好的文件 
 ```java 
  Tag
  ``` 
 文件，默认 
 ```java 
  main
  ``` 
 就去找这个入口文件。 
 
 
 ```java 
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

  ``` 
  
如果淘宝镜像之前被更改，先改回来执行以下命令 
 
 ```java 
  npm config set registry http://registry.npmjs.org

  ``` 
  
注册完之后，执行 
 ```java 
  npm login
  ``` 
 , 依次填写你的 
 ```java 
  用户名
  ``` 
 、 
 ```java 
  密码
  ``` 
 、 
 ```java 
  邮箱
  ``` 
  
执行 
 ```java 
  npm publish
  ``` 
 发布，然后等待进度条完成即可。 
##### 整理一些常见的发布错误 
这是因为镜像设置成淘宝镜像了，设置回来即可 
 
 ```java 
  no_perms Private mode enable, only admin can publish this module

  ``` 
  
一般是没有登录，重新登录一下  
 ```java 
  npm login
  ``` 
  即可 
 
 ```java 
  npm publish failed put 500 unexpected status code 401

  ``` 
  
包名被占用，改个包名即可，最好在官网查一下是否有包名被占用，之后再重命名 
 
 ```java 
  npm ERR! you do not have permission to publish “your module name”. Are you logged in as the correct user?

  ``` 
  
邮箱未验证，去官网验证一下邮箱 
 
 ```java 
  you must verify your email before publishing a new package

  ``` 
  
#### npm安装使用 
 
 ```java 
  cnpm i custom-tag-waren -D

  ``` 
  
##### main.js 
 
 ```java 
  import Vue from 'vue'
import { Tag } from 'element-ui';
import 'element-ui/lib/theme-chalk/tag.css';
import customTagWaren from "custom-tag-waren"  // 下载完引入进来
Vue.component(Tag.name, Tag)
new Vue({
    el: "#app",
    render: h => h(customTagWaren)
})

  ``` 
  
到此为止就完成了一个组件的打包上传下载，这样我们在每个项目需要的时候直接 
 ```java 
  npm install
  ``` 
 安装就行，当需求改动的时候只改一个文件然后再次发布就行。是不是很方便啦。 
#### 外链引入 
我们也不上传 
 ```java 
  npm
  ``` 
 上，直接使用外链的形式使用，下面我们来看看 
##### import引入 
 
 ```java 
  <template>
  <div class="Tag">
    <TagEl/>
  </div>
</template>

<script>
import TagEl from "./index"
export default {
 name: 'Tag',
  data() {
    return {
       
    }
  },
  components: {
      TagEl
  },
}
</script>
<style scoped>

</style>

  ``` 
  
上面 
 ```java 
  example
  ``` 
 中，我们看到直接引入了 
 ```java 
  index.js
  ``` 
 文件并进行注册组件，直接就可以使用啦。 
##### script引入 
 
 ```java 
  <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <div id="app">
        <Tag/>
    </div>
    <script src="https://cdn.bootcdn.net/ajax/libs/vue/2.6.9/vue.min.js"></script>
    <script type="text/javascript" src="./dist/index.js"></script>
</body>
<script>
    new Vue({
        el: "#app",
        components: {
            Tag: Tag.default
        }
    })
</script>
</html>

  ``` 
  
上面 
 ```java 
  example
  ``` 
 中，直接使用 
 ```java 
  script
  ``` 
 标签引入进来，也是注册完使用就可以。那么我们怎么知道他名字是Tag，这个你在封装组件的使用，必须指定Name名称。 
 
 ```java 
  export default {
	name: "Tag"
}

  ``` 
  
#### 感谢 
谢谢你读完本篇文章，希望对你能有所帮助，如有问题欢迎各位指正。 
我是蛙人(✿◡‿◡)，如果觉得写得可以的话，请点个赞吧❤。 
感兴趣的小伙伴可以加入 [ 前端娱乐圈交流群 ] 欢迎大家一起来交流讨论 
写作不易，「点赞」+「在看」+「转发」 谢谢支持❤ 
#### 往期好文 
《分享12个Webpack中常用的Loader》 
《聊聊什么是CommonJs和Es Module及它们的区别》 
《带你轻松理解数据结构之Map》 
《这些工作中用到的JavaScript小技巧你都知道吗？》 
《【建议收藏】分享一些工作中常用的Git命令及特殊问题场景怎么解决》 
《你真的了解ES6中的函数特性么？》 
#### 参考 
https://blog.csdn.net/weixin_43606158/article/details/1068086
                                        