---
title: 推荐系列-在 Node.js 上接入 Paddle Lite，让你的网站具备 AI 推理能力
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 856
cover_picture: 'https://static.oschina.net/uploads/img/202008/05162516_mIGa.jpg'
abbrlink: bb98e2f8
date: 2021-04-14 07:54:42
---

&emsp;&emsp;【飞桨开发者说】李睿，北京邮电大学学生，人工智能和移动开发爱好者。 随着桌面端Electron技术逐步崛起，基于Electron开发的代码编辑器、聊天软件、游戏等层出不穷。 对于习惯使用Node.js进...
<!-- more -->

                                                                                                                                                                                        【飞桨开发者说】李睿，北京邮电大学学生，人工智能和移动开发爱好者。​ 
随着桌面端Electron技术逐步崛起，基于Electron开发的代码编辑器、聊天软件、游戏等层出不穷。 
对于习惯使用Node.js进行后端开发的朋友来说，开发一套漂亮的桌面UI客户端还是有一定难度的；而Electron开发不要太简单，只要会写HTML，就能写客户端，剩下的交给时间慢慢打磨即可。而且，这款开源的技术允许开发者使用JavaScript、HTML 和 CSS 构建跨平台的桌面应用程序。不同平台UI效果和网页显示效果一致，非常易用。 
那么在桌面客户端上面，我们能否帮开发者实现本地部署Paddle Lite进行推理呢？答案是肯定的。Paddle Lite提供C++接口，并且在2.6.0版本中支持了Windows开发环境。这为我们将Paddle Lite封装成Node.js的C++插件提供了可能。如果能够成功移植，开发桌面应用的时候就可以实现在客户端上完成图片分类等任务。同时Paddle Lite提供的模型非常轻量化，常规PC机足以跑出不错的性能。 
而且，对于其他Node.js场景来说，比如网站后端，也可以直接使用Paddle Lite进行推理。  
于是我做了一个Demo，其本质上是将Paddle Lite的C++ API封装为Paddle Lite类，这个类目前提供了两个方法，分别是set_model_file和infer_float。在此之上，我使用N-API来编写Node.js插件，将其组合起来，允许Node.js调用Paddle Lite的C++ API。 
下载安装命令

## CPU版本安装命令
pip install -f https://paddlepaddle.org.cn/pip/oschina/cpu paddlepaddle

## GPU版本安装命令
pip install -f https://paddlepaddle.org.cn/pip/oschina/gpu paddlepaddle-gpu 
 
##### 项目效果 
1. 下载预编译结果：可以直接在Paddle Node的Release界面下载预编译的结果，包括以下三个文件： 
 
  paddlenode.node ：编译后的Node.js模块  
  libiomp5md.dll ：OpenMP DLL  
  mklml.dll ：MKL数学核心库  
 
2. 下载并转化预训练模型：从官方开放的模型库中下载mobilenet_v1模型，并使用opt工具（Paddle Lite自带此工具）转换： 
1.安装Paddle Lite : 
 
  ```java 
  pip install paddlelite

  ```  
 
2. 转化模型： 
 
  ```java 
  paddle_lite_opt –model_dir=./mobilenet_v1 –valid_targets=x86 –optimize_out=mobilenetv1_opt


  ```  
 
执行上面步骤后我们可以得到转化后的模型文件：mobilenetv1_opt.nb 
3. 在Node.js中进行推理： 
 
  ```java 
  var addon = require('./paddlenode')
var arr = new Array(150528)
for(var i=0; i<arr.length; i++) arr[i]=1;
addon.set_model_file("./mobilenetv1_opt.nb")
addon.infer_float(arr,[1, 3, 224, 224])


  ```  
 
这里我们输入全1的数组进行模拟，set_model_file方法直接对应Paddle Lite中的set_model_from_file，infer_float的第一个参数是我们要传入的数据，第二个是传入数据的尺寸。如果各个元素乘积大小和传入数据的大小不同，将会抛出一个错误。之后我们会得到一个1001维的数组： 
 
其中0号元素为结果向量的大小，方便进行遍历，其他元素即为模型本身的输出。 
 
##### 手动编译 
如果你决定手动编译，首先需要从Paddle Lite的Release中找到x86的预编译结果，目前最新版本是v2.6.1。下载下来之后定位到binding.gyp,将lite_dir变量设定为预编译库 
文件夹的绝对路径，示例如下： 
 
  ```java 
  {
    'variables': {
        'lite_dir%': 'C:/Users/Li/Desktop/Exp/inference_lite_lib.win.x86.MSVC.C++_static.py37.full_publish',
    },
    "targets": [
        {
            'target_name': "paddlenode",
            'sources': ["paddlelib.h","paddlelib.cc","paddlenode.cc"],
            'defines': [
            ],
            'include_dirs': [
                "<(lite_dir)/cxx/include",
                "<(lite_dir)/third_party/mklml/include"
            ],
            'libraries': [
                "-l<(lite_dir)/cxx/lib/libpaddle_api_light_bundled.lib",
                "-l<(lite_dir)/third_party/mklml/lib/libiomp5md.lib",
                "-l<(lite_dir)/third_party/mklml/lib/mklml.lib",
                "-lshlwapi.lib"
            ]
        }
    ]
}

  ```  
 
之后定位到我们的源码所在目录，确保你已经安装好了node-gyp和windows-build-tools，运行： 
 
  ```java 
  node-gyp configure build


  ```  
 
即可生成最终结果，但是记得从预编译库中复制两个dll动态链接库到编译结果目录。因为官方发布的为Release版lib文件，这里如果使用debug版会导致不匹配的错误。 
 
##### 原理介绍 
这个项目实际上是在Paddle Lite的C++ Demo上套了一层壳，我们最需要关注的是怎么将N-API和C的对象互相转换，在Node.js的官方文档中给出了非常多的函数和解释，在此基础上做转换即可。这里给出一些函数的解释： 
 
  napidefineproperties - 定义资源  
  napigetcb_info - 获取调用的信息  
  napithrowerror - 抛出错误  
  napitypeo - 获取napivalue的类型  
  napigetvaluestringutf8 - 将napi_value转换为utf8字符串  
  napigetarraylength - 获取napivalue对应的数组长度  
  napigetvaluedouble - 获取napivalue对应的双精度数组元素  
  napigetvalueint32 - 将napivalue转换为32位整型  
  napigetvaluedouble - 将napivalue转换为双精度浮点数  
  napicreatedouble - 将双精度浮点数转换为napi_value  
 
还有一些函数大体作用相同，仅仅作为转换作用。 
 
##### 写在最后 
飞桨已经推出的Paddle.js支持直接在浏览器中进行推理。而本文介绍的Paddle Node项目从另一个角度为Node.js提供可能。飞桨的中文生态给国内开发者和入���者提供了非常大的便利，大大降低了大家的学习成本。希望飞桨能够做得越来越好，进一步降低用户使用门槛，非常感谢。 
下载安装命令

## CPU版本安装命令
pip install -f https://paddlepaddle.org.cn/pip/oschina/cpu paddlepaddle

## GPU版本安装命令
pip install -f https://paddlepaddle.org.cn/pip/oschina/gpu paddlepaddle-gpu
 
 
 >> 访问 PaddlePaddle 官网，了解更多相关内容。 

                                        