---
title: 推荐系列-别再用PS了，我用五行Python代码就实现了批量抠图
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 1729
cover_picture: 'https://static.oschina.net/uploads/img/202004/20133412_KRiv.jpg'
abbrlink: fa27462a
date: 2021-04-15 09:19:21
---

&emsp;&emsp;对于会PhotoShop的人来说，抠图是非常简单的操作了，有时候几秒钟就能扣好一张图。不过对于一些比较复杂的图，有时候还是需要花点时间的，今天就给大家带了一个非常快速简单的办法，用Pytho...
<!-- more -->

                                                                                                                                                                                        对于会PhotoShop的人来说，抠图是非常简单的操作了，有时候几秒钟就能扣好一张图。不过对于一些比较复杂的图，有时候还是需要花点时间的，今天就给大家带了一个非常快速简单的办法，用Python来批量抠取人像。 
效果展示 
刚开始，我也不看好什么自动抠图，总觉得不够精确，抠不出满意的图。下面我就直接展示一下效果图吧。 
我们先看看原图 ： 
![Test](https://imgconvert.csdnimg.cn/aHR0cHM6Ly9tbWJpei5xcGljLmNuL21tYml6X2pwZy91eUhWNkVWTm94bEdvQVB1Tm82NDREME5ZQ3Q1cmpPWmRnbVI2YWljZFA2MGlhOU9DYWlhaWF1eFFNODNWQkVwbjVZSVZ2QTFjTmpLaWFMVGt2SE9JZXAyaWJudy82NDA?x-oss-process=image/format,png  '别再用PS了，我用五行Python代码就实现了批量抠图')​ 
  
  
  
  
  
  
这张图片背景是纯色，我们平时用PhotoShop抠起来也比较简单，对我们计算机来说也不是什么难题，下面是效果图： 
![Test](https://imgconvert.csdnimg.cn/aHR0cHM6Ly9tbWJpei5xcGljLmNuL21tYml6X2pwZy91eUhWNkVWTm94bEdvQVB1Tm82NDREME5ZQ3Q1cmpPWmRnbVI2YWljZFA2MGlhOU9DYWlhaWF1eFFNODNWQkVwbjVZSVZ2QTFjTmpLaWFMVGt2SE9JZXAyaWJudy82NDA?x-oss-process=image/format,png  '别再用PS了，我用五行Python代码就实现了批量抠图')​ 
  
  
  
  
  
  
因为本身是PNG图片，而且原图是白色背景，所以看不出什么区别。为了显示效果，我把原图和抠好的图放到一张黄色背景图片上： 
![Test](https://imgconvert.csdnimg.cn/aHR0cHM6Ly9tbWJpei5xcGljLmNuL21tYml6X2pwZy91eUhWNkVWTm94bEdvQVB1Tm82NDREME5ZQ3Q1cmpPWmRnbVI2YWljZFA2MGlhOU9DYWlhaWF1eFFNODNWQkVwbjVZSVZ2QTFjTmpLaWFMVGt2SE9JZXAyaWJudy82NDA?x-oss-process=image/format,png  '别再用PS了，我用五行Python代码就实现了批量抠图') 
这样一看效果明显多了，感觉抠图效果还是非常好的。但是，抠这种简单的图片，不怎么过瘾，我们再来看看复杂一点的图片： 
![Test](https://imgconvert.csdnimg.cn/aHR0cHM6Ly9tbWJpei5xcGljLmNuL21tYml6X2pwZy91eUhWNkVWTm94bEdvQVB1Tm82NDREME5ZQ3Q1cmpPWmRnbVI2YWljZFA2MGlhOU9DYWlhaWF1eFFNODNWQkVwbjVZSVZ2QTFjTmpLaWFMVGt2SE9JZXAyaWJudy82NDA?x-oss-process=image/format,png  '别再用PS了，我用五行Python代码就实现了批量抠图')​ 
  
  
  
  
  
  
  
  
  
这张图片背景色比之前复杂一些，而且有渐变，我们来看看抠图后的效果如何： 
![Test](https://imgconvert.csdnimg.cn/aHR0cHM6Ly9tbWJpei5xcGljLmNuL21tYml6X2pwZy91eUhWNkVWTm94bEdvQVB1Tm82NDREME5ZQ3Q1cmpPWmRnbVI2YWljZFA2MGlhOU9DYWlhaWF1eFFNODNWQkVwbjVZSVZ2QTFjTmpLaWFMVGt2SE9JZXAyaWJudy82NDA?x-oss-process=image/format,png  '别再用PS了，我用五行Python代码就实现了批量抠图')​ 
  
  
  
  
  
  
这个原图背景不是白色，我就不弄黄色背景了，感觉这个效果也还算满意。 
那么，对于多人物的图片，效果如何呢？我们再看看下面这张图片： 
![Test](https://imgconvert.csdnimg.cn/aHR0cHM6Ly9tbWJpei5xcGljLmNuL21tYml6X2pwZy91eUhWNkVWTm94bEdvQVB1Tm82NDREME5ZQ3Q1cmpPWmRnbVI2YWljZFA2MGlhOU9DYWlhaWF1eFFNODNWQkVwbjVZSVZ2QTFjTmpLaWFMVGt2SE9JZXAyaWJudy82NDA?x-oss-process=image/format,png  '别再用PS了，我用五行Python代码就实现了批量抠图')​ 
  
  
  
  
  
  
这里有三个人，我们看看程序能不能自动抠出来： 
![Test](https://imgconvert.csdnimg.cn/aHR0cHM6Ly9tbWJpei5xcGljLmNuL21tYml6X2pwZy91eUhWNkVWTm94bEdvQVB1Tm82NDREME5ZQ3Q1cmpPWmRnbVI2YWljZFA2MGlhOU9DYWlhaWF1eFFNODNWQkVwbjVZSVZ2QTFjTmpLaWFMVGt2SE9JZXAyaWJudy82NDA?x-oss-process=image/format,png  '别再用PS了，我用五行Python代码就实现了批量抠图')​ 
  
  
  
  
  
  
虽然是有点瑕疵，不过还是很不错了。 
下面我们看看最后一个例子： 
![Test](https://imgconvert.csdnimg.cn/aHR0cHM6Ly9tbWJpei5xcGljLmNuL21tYml6X2pwZy91eUhWNkVWTm94bEdvQVB1Tm82NDREME5ZQ3Q1cmpPWmRnbVI2YWljZFA2MGlhOU9DYWlhaWF1eFFNODNWQkVwbjVZSVZ2QTFjTmpLaWFMVGt2SE9JZXAyaWJudy82NDA?x-oss-process=image/format,png  '别再用PS了，我用五行Python代码就实现了批量抠图') 
这个比前面的图都复杂的多，那么效果如何呢，我们来看看： 
![Test](https://imgconvert.csdnimg.cn/aHR0cHM6Ly9tbWJpei5xcGljLmNuL21tYml6X2pwZy91eUhWNkVWTm94bEdvQVB1Tm82NDREME5ZQ3Q1cmpPWmRnbVI2YWljZFA2MGlhOU9DYWlhaWF1eFFNODNWQkVwbjVZSVZ2QTFjTmpLaWFMVGt2SE9JZXAyaWJudy82NDA?x-oss-process=image/format,png  '别再用PS了，我用五行Python代码就实现了批量抠图') 
哈哈，不仅识别出了人，还把火炬识别出来并抠了出来。总的来说，在完成人物抠图方面是没有什么问题的。 
这是如何实现的？ 
看完效果，你肯定想问这是如何实现的呢？这就需要用到飞桨了，飞桨是一个开源的深度学习平台，使用其工具仅用十几行代码就能实现迁移学习。 
下载安装命令

## CPU版本安装命令
pip install -f https://paddlepaddle.org.cn/pip/oschina/cpu paddlepaddle

## GPU版本安装命令
pip install -f https://paddlepaddle.org.cn/pip/oschina/gpu paddlepaddle-gpu 
在使用之前，我们先来安装飞桨，可以进入官网，按指引快速安装： 
https://www.paddlepaddle.org.cn/install/quick 
为了方便，这里直接使用pip安装CPU版本的。我们执行下列语句： 
 
  ```java 
  python -m pip install paddlepaddle -i https://mirror.baidu.com/pypi/simple

  ```  
 
安装完成后，可以在环境中测试一下是否成功。我这里使用命令行窗口，先运行python.exe（前提是你已经配置了环境变量）： 
 
  ```java 
  C:\Users\zaxwz>python

  ```  
 
然后在程序中运行如下代码： 
 
  ```java 
  import paddle.fluidpaddle.fluid.install_check.run_check()

  ```  
 
如果控制台显示Your Paddle is installed successfully! Let's start deep Learning with Paddle now，就代表我们已经安装成功了。另外我们还需要安装PaddleHub： 
 
  ```java 
  pip install -i https://mirror.baidu.com/pypi/simple paddlehub

  ```  
 
下面我们就���以开始写代码了。 
开始抠图 
实现抠图的代码很简单，大概分为下面几个步骤： 
 
  导入模块  
  加载模型  
  获取文件列表  
  抠图  
 
实现起来没有什么难度，为了方便读代码，我将代码写清楚一点： 
1、导入模块 
 
  ```java 
  import os
import paddlehub as hub

  ```  
 
2、加载模型 
 
  ```java 
  humanseg = hub.Module(name='deeplabv3p_xception65_humanseg')

  ```  
 
 3、获取文件列表 
 
  ```java 
  # 图片文件的目录
path = 'D:/CodeField/Workplace/PythonWorkplace/PillowTest/11_yellow/img/'
# 获取目录下的文件
files = os.listdir(path)
# 用来装图片的
imgs = []
# 拼接图片路径
for i in files:
   imgs.append(path + i)
#抠图
results = humanseg.segmentation(data={'image':imgs})

  ```  
 
4、获取文件列表 
我们在控制台运行一下这个程序： 
 
  ```java 
  python 抠图.py

  ```  
 
输出： 
 
  
   
    [2020-03-10 21:42:34,587] [    INFO] - Installing deeplabv3p_xception65_humanseg module [2020-03-10 21:42:34,605] [    INFO] - Module deeplabv3p_xception65_humanseg already installed in C:\Users\zaxwz\.paddlehub\modules\deeplabv3p_xception65_humanseg [2020-03-10 21:42:35,472] [    INFO] - 0 pretrained paramaters loaded by PaddleHub  
   
  
 
运行完成后，我们可以在项目下看到humanseg_output目录，抠好的图片就会存放在该目录下。当然了，上面的代码我们在获取文件列表的操作还可以简化一下： 
 
  ```java 
  import os, paddlehub as hub
humanseg = hub.Module(name='deeplabv3p_xception65_humanseg')        # 加载模型
path = 'D:/CodeField/Workplace/PythonWorkplace/PillowTest/11_yellow/img/'    # 文件目录
files = [path + i for i in os.listdir(path)]    # 获取文件列表
results = humanseg.segmentation(data={'image':files})    # 抠图

  ```  
 
至此，我们就完成了5行代码批量抠图，感兴趣的开发者赶紧上手试试吧！ 
飞桨官网： 
https://www.paddlepaddle.org.cn/ 
下载安装命令

## CPU版本安装命令
pip install -f https://paddlepaddle.org.cn/pip/oschina/cpu paddlepaddle

## GPU版本安装命令
pip install -f https://paddlepaddle.org.cn/pip/oschina/gpu paddlepaddle-gpu 
PaddleHub平台： 
https://github.com/PaddlePaddle/PaddleHub 
飞桨开源框架项目地址： 
GitHub:https://github.com/PaddlePaddle/Paddle 
Gitee:  https://gitee.com/paddlepaddle/Paddle 
如在使用过程中有问题，可加入飞桨官方QQ群进行交流：703252161 
>> 访问 PaddlePaddle 官网，了解更多相关内容。 
                                        