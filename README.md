# 中文博客源码备份（狂欢马克思） Blog-Backup 

## 作者：吉祥草

## 域名：https://www.hosiang.cn

## 网站特点：云端写作、自动部署、钉钉通知

## 技术方案：语雀 + Hexo + Travis-CI + Github-Pages + Serverless + CDN

2017-12-14 

####  1. [创建第一个测试版](https://hexo.io/docs/)


####  2. 修改主题配置文件和添加文章md文件,生成站内文章搜索

2017-12-15 

####  1. [自动刷新-安装Browsersync调试插件(包括局域网移动端)](http://c7.gg/7BdR),还有livereload插件

####  2. [Admin管理-安装hexo-admin-qiniu插件](https://xbotao.github.io/hexo-admin-qiniu/)

####  3. 添加畅言评论和音乐


## 执行hexo server提示找不到该指令 

解决办法： 
在Hexo 3.0 后server被单独出来了，需要安装server，安装的命令如下：

    npm install hexo-server --save 

安装此server后再试，问题解决。

    npm install hexo-deployer-git --save
    
    npm install hexo-renderer-ejs --save
    npm install hexo-renderer-stylus --save
    npm install hexo-renderer-marked --save

    npm install cnpm -g --registry=https://registry.npm.taobao.org
    
## 静态资源压缩

    $ npm install gulp -g
    $ npm install gulp-minify-css gulp-uglify gulp-htmlmin gulp-htmlclean gulp --save

    > hexo clean //先清除public目录
    > hexo g     //生成发布文件
    > gulp       //压缩代码
    > hexo d     //发布

     https://www.gitpod.io/ 
     
## Star趋势

[![Stargazers over time](https://starchart.cc/fluid-dev/hexo-theme-fluid.svg)](https://starchart.cc/fluid-dev/hexo-theme-fluid)
