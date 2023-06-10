# 中文博客源码备份（狂欢马克思） Blog-Backup 

## 作者：吉祥草

## 主域名：https://haoxiang.eu.org
## 备域名：https://hosiang1026.github.io


## 网站特点：云端写作、自动部署、钉钉通知

## 技术方案：Hexo + Travis-CI + Github-Pages + Serverless + CDN

## 替代方案：Hexo + Github-Actions + Github-Pages + Serverless + CDN

注：Travis-CI 开始收费，所以采用替代方案进行持续集成

![Blog Version](https://haoxiang.eu.org/images/blog_version.png "博客版本信息")

2017-12-14 

####  1. [创建第一个测试版](https://hexo.io/docs/)


####  2. 修改主题配置文件和添加文章md文件,生成站内文章搜索

2017-12-15 

####  1. [自动刷新-安装Browsersync调试插件(包括局域网移动端)](http://c7.gg/7BdR),还有livereload插件

####  2. [Admin管理-安装hexo-admin-qiniu插件](https://xbotao.github.io/hexo-admin-qiniu/)

####  3. 添加畅言评论和音乐

## 自动更新

    npm update //更新插件和Hexo版本
    npm outdated //检查插件更新
    npm install --save //开始更新
    npm install --ignore-scripts //上面更新报错，就用这个
    hexo version //查看当前版本号

开始更新

## 报错OpenSSL SSL_read: Connection was reset, errno 10054

    git config --global http.sslVerify "false"

## 执行hexo server提示找不到该指令 

解决办法： 

错误 Error: electron@13.1.8 postinstall: `node install.js`:

    npm config set electron_mirror "https://npm.taobao.org/mirrors/electron/"

    npm config set registry https://registry.npm.taobao.org

错误 warning: LF will be replaced by CRLF in js/utils.js.

    git config --global core.autocrlf false

在Hexo 3.0 后server被单独出来了，需要安装server，安装的命令如下：

    npm install hexo-server --save 

安装此server后再试，问题解决。

    npm install -g hexo-cli
    npm install hexo-deployer-git --save
    
    npm install hexo-renderer-ejs --save
    npm install hexo-renderer-stylus --save
    npm install hexo-renderer-marked --save

    npm install cnpm -g --registry=https://registry.npm.taobao.org
    
## 静态资源压缩

    $ npm install hexo-neat --save

    $ cnpm install hexo-all-minifier --save

    $ npm install gulp --save
    $ npm install gulp gulp-htmlclean gulp-htmlmin gulp-clean-css gulp-uglify-es gulp-imagemin del gulp-minify-inline-json --save-dev

    gulp-htmlclean // 清理html
    gulp-htmlmin // 压缩html
    gulp-minify-css // 压缩css
    gulp-uglify // 混淆js
    gulp-imagemin // 压缩图片

    > npm run build 打包构建
    > npm run dev 开发运行
    > npm run prod 发布线上
    详细命令如下:
    > hexo clean //先清除public目录
    > hexo g     //生成发布文件
    > gulp       //压缩代码
    > hexo d     //发布

    修复
    $ npm audit fix

     https://www.gitpod.io/ 

## 常见问题

     https://blog.csdn.net/qq_29304291/article/details/120049986

## 搜索引擎收录

    搜狗和百度联盟 还未通过验证

## 博客收录

    百度博客提交: http://utility.baidu.com/blogsearch/submit.php
    博客大全提交：http://lusongsong.com/daohang/login.asp
    Google博客提交：http://www.google.com/intl/zh-CN/add_url.html
    搜狗(SoGou)博客提交：http://www.sogou.com/feedback/blogfeedback.php

## 广告联盟收录

    Google adsense：https://www.google.com/adsense/g-app-single-1?hl=zh-CN
    百度联盟申请地址：http://union.baidu.com
    淘宝联盟：http://www.alimama.com/
    搜狗联盟：http://union.sogou.com/
    亚马逊网站联盟：https://associates.amazon.cn/
    京东商城销售联盟：http://cps.360buy.com/
  
## Star趋势

[![Stargazers over time](https://starchart.cc/fluid-dev/hexo-theme-fluid.svg)](https://starchart.cc/fluid-dev/hexo-theme-fluid)
