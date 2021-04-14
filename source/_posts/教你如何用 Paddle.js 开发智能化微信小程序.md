---
title: 推荐系列-教你如何用 Paddle.js 开发智能化微信小程序
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 752
cover_picture: 'https://static.oschina.net/uploads/img/202009/04143726_V6ia.jpg'
abbrlink: 366dcda7
date: 2021-04-14 07:54:42
---

&emsp;&emsp;早在今年5月百度飞桨联手百度APP技术团队开源了飞桨前端推理引擎Paddle.js，一时间国内Web开发的小伙伴们欢欣鼓舞，毕竟是国内首个开源的机器学习Web在线预测方案。 GitHub项目地址： https:...
<!-- more -->

                                                                                                                                                                                        早在今年5月百度飞桨联手百度APP技术团队开源了飞桨前端推理引擎Paddle.js，一时间国内Web开发的小伙伴们欢欣鼓舞，毕竟是国内首个开源的机器学习Web在线预测方案。 
GitHub项目地址： 
https://github.com/PaddlePaddle/Paddle.js 
这款Web前端AI方案相对于Native应用，有着开发使用简单、部署方便等优势，而且推理速度也完全能够满足实时性的在线预测场景需要。前期还推出了Paddle.js的在线直播课程，手把手的���Web开发的同学们使用Web智能化的能力。 
前端变化风起云涌，不会点AI都不好意思说自己是个时髦的前端开发者，赶快点开看看吧。Paddle.js AI快车道直播的录播地址: 
https://www.bilibili.com/video/BV1gZ4y1H7UA?p=6 
下载安装命令

## CPU版本安装命令
pip install -f https://paddlepaddle.org.cn/pip/oschina/cpu paddlepaddle

## GPU版本安装命令
pip install -f https://paddlepaddle.org.cn/pip/oschina/gpu paddlepaddle-gpu 
 
##### Paddle.js 插件+微信小程序= 懂AI的微信小程序 
在Web前端开发领域，自然少不了微信小程序的身影。相对于网页等形式的Web开发来说，微信小程序有着自身的一些优势，那么是否可以非常简单的在微信小程序中使用Web智能化的能力呢？百度Paddle.js开发团队非常关注前端小伙伴的诉求，在这个夏天为同学们推出了Paddle.js微信小程序插件，让微信小程序中使用AI能力变得So easy！ 
​ 
Paddle.js 微信小程序插件有什么神奇的功效？ 
它抹平了微信小程序与h5在canvas、fetch等api上的差异。微信小程序由渲染层和逻辑层两个线程管理，渲染层的界面使用 WebView 进行渲染；逻辑层专注运行 JavaScript 代码。通过简单的插件引入，即可在微信小程序中使用Paddle.js的能力高效地进行AI模型预测。 
 
采用插件方式非常便捷，小程序开发者可直接在小程序内使用插件，无需重复开发。但是插件不能独立运行，必须嵌入在其他小程序中才能被用户使用；而第三方小程序在使用插件时，也无法看到插件的代码。因此，插件适合用来封装自己的功能或服务，提供给第三方小程序进行展示和使用。 
首先，无论是Web网页还是微信小程序，想要实现在线AI能力都需要加载训练好的神经网络模型，飞桨提供了强大和内容丰富的模型库，供广大开发者选择。 
接下来先一起看一看，智能化的微信小程序是什么效果吧！ 
 
##### 01Paddle.js实例1：人脸框选小程序 
图中是一个利用Paddle.js插件实现的头部框选小程序，是在小程序端进行计算的，由于Web端的算力日趋强大，用户Web端计算不仅可以节省服务端的计算压力，而且可以提供非常快速的实时响应，所以在小程序中做视频流的实时人脸框选任务已成为可能。 
 
 
##### Paddle.js实例2：校名识别小程序 
图中是利用Paddle.js实现的校名识别小程序，输入不同的高校图片能够快速检测出学校名称结果，而且这些图片并没有上传到服务端，既可以快速地得到计算结果又没有将用户信息上传到服务端，Web AI能够很好的保护用户的隐私。 
 
 
##### Paddle.js微信小程序插件 
怎么用？ 
那么，如何开发一个智能化的微信小程序呢？使用Paddle.js插件只需要3个步骤：在开发者的小程序中添加插件，引入插件代码包，最后使用插件。 
1. 添加插件 
在使用插件前，首先要在微信小程序的管理后台“设置-第三方服务-插件管理”中添加插件。开发者可登录小程序管理后台，通过appid: wx7138a7bb793608c3或者插件名称（paddlejs）查找插件并添加。本插件无需申请，添加后可直接使用。 
 
2. 引入插件代码包 
用插件前，需要在微信小程序的 app.json 中声明需要使用的插件，例如plugins 定义段中可以包含Paddle.js插件声明，每个插件声明以一个使用者自定义的插件引用名作为标识，并指明插件的 appid 和需要使用的版本号。 
 
代码示例： 
 
  ```java 
  {
...
"plugins": {
 "paddlejs-plugin": {
   "version": "0.0.2",
   "provider": "wx7138a7bb793608c3"
 }
}
...
}


  ```  
 
3. 小程序代码中使用插件（以酒瓶识别为例） 
1) 使用npm包引入paddle.js插件, 微信小程序使用npm包的方法可参见文档： 
https://developers.weixin.qq.com/miniprogram/dev/devtools/npm.html 
 
  ```java 
  {
    "name": "yourProject",
    "version": "0.0.1",
    "main": "dist/index.js",
    "license": "ISC",
    "dependencies": {
        "paddlejs": "^1.0.7"，
    }
}


  ```  
 
2) 在app.js的onLaunch里���用插件的register函数。 
 
  ```java 
  const paddlejs = require('paddlejs');
const plugin = requirePlugin("paddlejs-plugin");
//app.js
App({
  globalData: {
    Paddlejs: paddlejs.runner
  },
  onLaunch: function () {
    plugin.register(paddlejs, wx);
  }
});


  ```  
 
3) 接下来可以在小程序的页面中使用globalData.Paddlejs了，可结合示例代码，按照如下步骤完成模型预测： 
 
  paddlejs实例初始化  
  加载神经网络模型&预热  
  以相册选择图片为例，获取图片的像素信息作为模型输入  
  在线预测计算  
  对预测结果进行后处理  
 
 
  ```java 
  const app = getApp();
let pdjs;

Page({
    onLoad: function () {
        // 1. paddlejs实例初始化
        pdjs = new app.globalData.Paddlejs({

            // 网络模型地址
            modelPath: 'https://paddlejs.cdn.bcebos.com/models/wine/', 

            // 分片参数文件数目
            fileCount: 3,

            // 模型输入shape
            feedShape: {
                fw: 224,
                fh: 224
            },

            // 模型输出shape
            fetchShape: [1, 40, 1, 1],

            // 以下三个参数为输入处理所需参数
            // 输入缩放容器大小
            scale: 256,

            // 输入裁剪容器大小
            targetSize: {
                height: 224,
                width: 224
            },     

            // 均值&方差
            mean: [0.485, 0.456, 0.406],
            std: [0.229, 0.224, 0.225]
        });

        const me = this;
        // 2. 加载神经网络模型&预热
        pdjs.loadModel().then(res => {
            me.setData({
                loaded: true
            })
        });
    }，
    chooseImage() {
        // 3. 以相册选择图片为例，获取图片的像素信息作为模型输入
        const me = this;
        wx.chooseImage({
            count: 1,
            sizeType: ['original'],
            sourceType: ['album', 'camera'],
            success(res) {
                // tempFilePath可以作为img标签的src属性显示图片
                me.getImageInfo(res.tempFilePaths[0]);
            }
        });
    }
    getImageInfo(imgPath) {
        // 获取到图片的像素信息
        const me = this;
        wx.getImageInfo({
            src: imgPath,
            success: (imgInfo) => {
                const {
                    width,
                    height,
                    path
                } = imgInfo;

                const canvasId = 'myCanvas';
                // 获取页面中的canvas上下文，tips：canvas设置的宽高要大于选择的图片宽高，canvas位置可以绝对定位到视口不可以见
                ctx = wx.createCanvasContext(canvasId);
                ctx.drawImage(path, 0, 0, width, height);
                ctx.draw(false, () => {
                    // API 1.9.0 获取图像数据
                    wx.canvasGetImageData({
                        canvasId: canvasId,
                        x: 0,
                        y: 0,
                        width: width,
                        height: height,
                        success(res) {
                            me.predict({
                                data: res.data,
                                width: width,
                                height: height
                            });
                        }
                    });
                });
            }
        });
    },
    predict(imgObj) {
        // 4. 在线预测计算
        const me = this;
        pdjs.predict(imgObj, function (data) {
            // 5. 对预测结果进行后处理
            const maxItem = pdjs.utils.getMaxItem(data);
            me.setData({
                result: maps[maxItem.index]
            });
        });
    }
});


  ```  
 
下面是酒瓶识别小程序效果展示： 
​ 
除了上述示例所使用到的模型以外，Paddle.js还支持更多场景，包括不限于手势检测、人像分割、人脸检测等等，这里提供了已经实现的Demo样例： 
https://paddlejs.baidu.com/ 
当然，百度飞桨提供了非常丰富的模型资源库，开发者也可以通过Paddle.js自带的模型转换工具施加魔法将Paddle模型变成Web可用模型，转化方法： 
https://github.com/PaddlePaddle/Paddle.js/tree/master/tools/ModelConverter 
不过需要您了解的是，Paddle.js目前只支持了有限的一组算子操作，如果您的模型中使用了不支持的算子，那么Paddle.js将运行失败并提示您的模型中有哪些op算子目前还不支持。如果您的模型中存在目前Paddle.js不支持的算子，欢迎在GitHub上提出Issue，让我们知道你需要支持。 
目前支持算子列表如下所示： 
https://github.com/PaddlePaddle/Paddle.js/blob/master/src/factory/fshader/README.md 
插播小广告~~~ 
百度APP前端智能化研发团队招人啦，可以通过百度招聘官网查询相关职位，或直接发简历到wangqun@baidu.com。 
如在使用过程中有问题，可加入Paddle.js爱好者qq群进行交流：583045070。 
·Paddle.js官方文档· 
https://github.com/PaddlePaddle/Paddle.js/blob/master/README_cn.md 
·Paddle.js GitHub项目地址· 
https://github.com/PaddlePaddle/Paddle.js 
·PaddleX官网地址· 
https://www.paddlepaddle.org.cn/paddle/paddlex 
下载安装命令

## CPU版本安装命令
pip install -f https://paddlepaddle.org.cn/pip/oschina/cpu paddlepaddle

## GPU版本安装命令
pip install -f https://paddlepaddle.org.cn/pip/oschina/gpu paddlepaddle-gpu
 
 
  
   
   >> 访问 PaddlePaddle 官网，了解更多相关内容。 
   
  

                                        