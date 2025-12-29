# 中文博客源码备份（狂欢马克思）

## 作者：吉祥草

## 主域名：https://haoxiang.eu.org
## 备域名：https://hosiang1026.github.io

## 网站特点：云端写作、自动部署、钉钉通知

## 技术方案：Hexo + Travis-CI + Github-Pages + Serverless + CDN

## 替代方案：Hexo + Github-Actions + Github-Pages + Serverless + CDN

## 最新方案：Hexo + Github-Actions + Github-Pages + Cloudflare

目前博客分别部署在Github和Cloudflare上面，Github-Pages作为备份网站，Cloudflare作为主网站，也是直接同步Github博客仓库代码部署的。

注：Travis-CI 开始收费，所以采用Github-Actions替代方案进行持续集成

![Blog Version](https://haoxiang.eu.org/images/blog_version.png "博客版本信息")

2017-12-14 

####  1. [创建第一个测试版](https://hexo.io/docs/)

####  2. 修改主题配置文件和添加文章md文件,生成站内文章搜索

2017-12-15 

####  1. [自动刷新-安装Browsersync调试插件(包括局域网移动端)](http://c7.gg/7BdR),还有livereload插件

####  2. [Admin管理-安装hexo-admin-qiniu插件](https://xbotao.github.io/hexo-admin-qiniu/)

####  3. 添加Gitalk评论和批量初始化评论脚本gitalk-auto-init.js

## 自动更新

    npm update -g //更新插件和Hexo版本
    pm update --save //更新系统插件
    npm outdated //检查插件更新
    npm install --save //开始更新
    npm install --ignore-scripts //上面更新报错，就用这个
    hexo version //查看当前版本号

    npm install -g npm-checknpm install -g npm-upgrade

开始更新

## 报错OpenSSL SSL_read: Connection was reset, errno 10054

    git config --global http.sslVerify "false"

## 执行hexo server提示找不到该指令 

解决办法:

错误 Error: electron@13.1.8 postinstall: `node install.js`:

    npm config set electron_mirror "https://npm.taobao.org/mirrors/electron/"

    npm config set registry https://registry.npm.taobao.org

错误 warning: LF will be replaced by CRLF in js/utils.js.

    git config --global core.autocrlf false

在Hexo 3.0 后server被单独出来了，需要安装server，安装的命令如下：

    npm install --force
    npm install hexo-server --save 

安装此server后再试，问题解决。

    //升级nodejs
    npm install -g npm-checknpm install -g npm-upgrade

    npm install -g hexo-cli //升级 Hexo
    npm install hexo@7.3.0 --save //升级 Hexo 7.3.0

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

## 文章密码加密

博客使用 `hexo-blog-encrypt` 插件对文章进行加密保护。为了不在源码中明文存储密码，采用 Base64 编码方式存储密码。

### 工作原理

1. 在 front matter 中存储 Base64 编码的密码（如 `aG9zaWFuZzEwMjY=`）
2. `scripts/password-decoder.js` 脚本在构建时自动将 Base64 编码的密码解码为明文（`123456`）
3. `hexo-blog-encrypt` 插件使用解码后的明文密码对文章内容进行加密
4. 用户访问时输入原始密码 `123456` 即可解密查看文章

### 使用方法

1. 将密码编码为 Base64：
   ```bash
   node -e "console.log(Buffer.from('你的密码', 'utf8').toString('base64'));"
   ```

2. 在文章的 front matter 中使用编码后的值：
   ```yaml
   ---
   title: 文章标题
   password: aG9zaWFuZzEwMjY=
   ---
   ```

3. 用户访问时输入原始密码即可

### 加密技术栈

- **密钥派生**：PBKDF2 + SHA-256
- **加密算法**：AES-256-CBC
- **消息认证码**：HMAC-SHA256

## GitHub Pages Action

    https://github.com/peaceiris/actions-gh-pages#readme
    https://github.com/peaceiris/actions-gh-pages#%EF%B8%8F-first-deployment-with-github_token

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
