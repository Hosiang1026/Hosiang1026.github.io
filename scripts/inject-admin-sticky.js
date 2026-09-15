'use strict';

const path = require('path');
const fs = require('fs');

const root = path.join(__dirname, '..');
const www = path.join(root, 'node_modules/hexo-admin-qiniu/www');
const indexPath = path.join(www, 'index.html');
const enhanceSrc = path.join(__dirname, 'admin-sticky-enhance.js');
const enhanceDest = path.join(www, 'sticky-enhance.js');
const bundlePath = path.join(www, 'bundle.js');
const loginPath = path.join(www, 'login/index.html');

if (!fs.existsSync(indexPath) || !fs.existsSync(enhanceSrc)) {
  process.exit(0);
}

fs.copyFileSync(enhanceSrc, enhanceDest);

let html = fs.readFileSync(indexPath, 'utf8');
html = html.replace(/<title>.*?<\/title>/, '<title>博客后台</title>');
html = html.replace('lang="en"', 'lang="zh-CN"');
if (!html.includes('sticky-enhance.js')) {
  html = html.replace(
    '</head>',
    '<script src="sticky-enhance.js"></script>\n</head>'
  );
}
fs.writeFileSync(indexPath, html);

if (fs.existsSync(bundlePath)) {
  let bundle = fs.readFileSync(bundlePath, 'utf8');
  const reps = [
    ['"Hexo Admin"', '"博客后台"'],
    ['"New Post"', '"新建文章"'],
    ['"New Page"', '"新建页面"'],
    ['"New page"', '"新建页面"'],
    ['"Publish"', '"发布"'],
    ['"Unpublish"', '"取消发布"'],
    ['"Loading..."', '"加载中..."'],
    ['"Draft"', '"草稿"'],
    ['title: "Remove"', 'title: "删除"'],
    ['title: "Settings"', 'title: "设置"'],
    ['title: "Cancel"', 'title: "取消"'],
    ['title: "Click to rename"', 'title: "点击重命名"'],
    ['title: "Rename File"', 'title: "重命名文件"'],
    ['title: "Check for Writing Improvements"', 'title: "写作检查"'],
    ['"Delete this post?"', '"确定删除这篇文章？"'],
    ["'Delete this post?'", "'确定删除这篇文章？'"],
    [
      "'This operation will move current draft into source/_discarded folder.'",
      "'文章将移到 source/_discarded，可从磁盘恢复。'"
    ],
    ["confirmLabel: 'Yes'", "confirmLabel: '确定'"],
    ["abortLabel: 'No'", "abortLabel: '取消'"],
    ['prefix: "saved "', 'prefix: "已保存 "'],
    ['" words"', '" 字"'],
    ['\n            Preview\n', '\n            预览\n'],
    ['"Date"', '"日期"'],
    ['"Author"', '"作者"'],
    ['"Tags"', '"标签"'],
    ['"Categories"', '"分类"'],
    ['value: "Deploy"', 'value: "部署"'],
    ['placeholder: "Deploy/commit message"', 'placeholder: "部署/提交说明"'],
    [
      '"Type a message here and hit `deploy` to run your deploy script."',
      '"填写提交说明后点击部署。"'
    ],
    ['"Std Output"', '"标准输出"'],
    ['"Std Error"', '"标准错误"'],
    ['React.DOM.h1(null, "Settings")', 'React.DOM.h1(null, "设置")'],
    ['"Editor Settings"', '"编辑器设置"'],
    ['"Image Pasting Settings"', '"粘贴图片设置"'],
    [
      '"Set various settings for your admin panel and editor."',
      '"在这里配置后台与编辑器选项。"'
    ],
    [
      '"Hexo admin can be secured with a password."',
      '"可以为后台设置登录密码。"'
    ],
    ['"Setup authentification here."', '"点此配置认证。"'],
    ["label: 'Enable line numbering.'", "label: '显示行号'"],
    [
      "label: 'Enable spellchecking. (buggy on older browsers)'",
      "label: '启用拼写检查（旧浏览器可能有问题）'"
    ],
    ["label: 'Always ask for filename.'", "label: '粘贴图片时询问文件名'"],
    [
      "label: 'Overwrite images if file already exists.'",
      "label: '同名图片直接覆盖'"
    ],
    ["label: 'Image directory'", "label: '图片目录'"],
    ["label: 'Image filename prefix'", "label: '图片文件名前缀'"],
    [
      '"Hexo-admin allows you to paste images you copy from the web or elsewhere directly"',
      '"支持把网页或其他地方复制的图片直接粘贴到编辑器。"'
    ],
    [
      `"into the editor. Decide how you'd like to handle the pasted images."`,
      '"请选择粘贴图片的处理方式。"'
    ],
    ['"This is the Hexo Admin Plugin"', '"Hexo 博客后台"'],
    [
      '"Goal: Provide an awesome admin experience for managing your blog."',
      '"目标：提供好用的博客管理后台。"'
    ],
    ['"Useful links:"', '"相关链接："'],
    ['"Hexo site"', '"Hexo 官网"'],
    ['"Github page for Hexo-admin"', '"Hexo-admin GitHub"'],
    ['"add \'qiniu\' to Hexo-admin"', '"Hexo-admin 七牛版"'],
    ['"Helper:"', '"帮助："'],
    ['"Authentification Setup"', '"认证配置"'],
    [
      '"You can secure hexo-admin with a password by adding a section to your\u00a0"',
      '"通过在 "'
    ],
    [
      '". This page is here to easily get it setup up."',
      '" 中添加配置来保护后台。本页用于快速生成配置。"'
    ],
    [
      '"Simply fill in the following fields and copy and paste the generated"',
      '"填写下列字段，然后复制生成的"'
    ],
    [
      '"text section into your config file."',
      '"配置段到你的配置文件中。"'
    ],
    ['"Username:"', '"用户名："'],
    ['"Password:"', '"密码："'],
    ['"Secret:"', '"密钥："'],
    [
      `"The username you'll use to log in."`,
      '"登录时使用的用户名。"'
    ],
    [
      `"The password you'll use to log in. This will be encrypted to store in your config."`,
      '"登录密码，会加密后写入配置。"'
    ],
    [
      '"This is used to encrypt cookies; make it long and obscure."',
      '"用于加密 Cookie，请设置得长且复杂。"'
    ],
    ['"Admin Config Section"', '"后台配置段"'],
    [
      '"Copy this into your "',
      '"复制以下内容到 "'
    ],
    [
      `", and restart Hexo. Now you'll"`,
      '"，然后重启 Hexo。完成后"'
    ],
    ['"be protected with a password!"', '"将启用密码保护！"'],
    ['"Writing Suggestions"', '"写作建议"'],
    ['"Brought to you by "', '"引擎："'],
    [
      '"Nice! No possible improvements were found!"',
      '"不错！没有发现可改进之处！"'
    ],
    [
      '"' + String.fromCharCode(0xa0) + 'Nice! No possible improvements were found!"',
      '"不错！没有发现可改进之处！"'
    ],
    ['"Back to Preview"', '"返回预览"'],
    ['"Untitled"', '"未命名"'],
    ["'Untitled'", "'未命名'"],
    ['text: \'Untitled\'', "text: '未命名'"]
  ];
  let n = 0;
  for (const [a, b] of reps) {
    if (bundle.includes(a)) {
      const c = bundle.split(a).length - 1;
      bundle = bundle.split(a).join(b);
      n += c;
    }
  }
  fs.writeFileSync(bundlePath, bundle);
  console.log('bundle replaced', n);
}

if (fs.existsSync(loginPath)) {
  fs.writeFileSync(
    loginPath,
    `<html>
<head>
    <meta charset="utf-8">
    <title>博客后台登录</title>
    <link type="text/css" rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/0.95.2/css/materialize.css" media="screen,projection"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
</head>
<body>
<script type="text/javascript" src="https://code.jquery.com/jquery-2.1.1.min.js"></script>
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/materialize/0.95.2/js/materialize.min.js"></script>
<div class="row" style="margin-top: 200px">
    <form class="col s12" method="post">
        <div class="row">
            <div class="input-field col s6" style="float: none; margin:auto">
                <input id="username" name="username" type="text" class="validate" autofocus>
                <label for="username">用户名</label>
            </div>
        </div>
        <div class="row">
            <div class="input-field col s6" style="float: none; margin:auto">
                <input id="password" name="password" type="password" class="validate">
                <label for="password">密码</label>
            </div>
        </div>
        <div class="row">
            <div class="input-field col s6" style="float: none; margin:auto">
                <button class="btn waves-effect waves-light" type="submit">登录
                    <i class="mdi-content-send right"></i>
                </button>
            </div>
        </div>
    </form>
</div>
</body>
</html>
`
  );
}

console.log('admin zh + actions injected');
