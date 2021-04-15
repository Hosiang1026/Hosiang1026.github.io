---
title: 推荐系列-全面支持三大主流环境 -百度PaddlePaddle新增Windows环境支持
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 1747
cover_picture: 'https://static.oschina.net/uploads/img/202004/03131843_WWz7.jpg'
abbrlink: 68e3b6fb
date: 2021-04-15 09:19:21
---

&emsp;&emsp;引言 PaddlePaddle作为国内首个深度学习框架，最近发布了更加强大的Fluid1.2版本, 增加了对Windows环境的支持，全面支持了Linux、Mac、 Windows三大环境。 PaddlePaddle在功能完备的基础上，...
<!-- more -->

                                                                                                                                                                                        引言 
PaddlePaddle作为国内首个深度学习框架，最近发布了更加强大的Fluid1.2版本, 增加了对Windows环境的支持，全面支持了Linux、Mac、 Windows三大环境。 PaddlePaddle在功能完备的基础上，也尽量秉承易学易用的特点，在Windows的安装方面，体现了一键式的特点，大部分情况下，只需要一条简单的命令就可以完成安装。 用户在使用的过程中可能会面对安装和编译方面的问题，下面就从这两个方面来分别说明。 
下载安装命令

## CPU版本安装命令
pip install -f https://paddlepaddle.org.cn/pip/oschina/cpu paddlepaddle

## GPU版本安装命令
pip install -f https://paddlepaddle.org.cn/pip/oschina/gpu paddlepaddle-gpu 
安装 
在深度学习框架上， Python语言由于本身的易用性和丰富的类库，被众多深度学习框架作为了应用方面的首选，PaddlePaddle也将Python语言作为了自己的应用语言，如下介绍在Python下怎么安装PaddlePaddle。 
 
##### 1.系统检查 
PaddlePaddle目前支持Windows7,8,10系列的专业和企业版本，且只支持64位的操作系统。 PaddlePaddle目前支持的Python版本覆盖了2.7,3.5,3.6,3.7版本，基本上包含了目前主流使用的所有python版本，可以通过如下方式检查操作系统和python版本情况 
 
   ```java 
  >>>import platform
  ```   
   ```java 
  >>>platform.architecture()
  ```   
   ```java 
  ('64bit','WindowsPE') # 64 bits on windows 64 bits
  ```   
   ```java 
  >>> platform.version()
  ```   
   ```java 
  '10.0.17134' # windows 10
  ```   
   ```java 
  >>> platform.python_version()
  ```   
   ```java 
  '2.7.15' # python 2.7
  ```   
 
如笔者自己的系统就显示了如上信息。 
 
##### 2.拉取安装包的方式 
PaddlePaddle可以选择通过pip命令在线或离线安装，下面展示一下如何离线下载安装包。 
PaddlePaddle的安装包已经放到了python官方支持的发布渠道上，打开https://pypi.org/ 网站，按图中所示输入Paddlepaddle， 
![Test](https://oscimg.oschina.net/oscnet/up-0edf9a222901a52d6335db40c964d817116.png  '全面支持三大主流环境 -百度PaddlePaddle新增Windows环境支持')![Test](https://oscimg.oschina.net/oscnet/up-0edf9a222901a52d6335db40c964d817116.png  '全面支持三大主流环境 -百度PaddlePaddle新增Windows环境支持') 
用户将会得到当前所有的PaddlePaddle安装包，根据系统和Python版本号选择对应版本即可 
![Test](https://oscimg.oschina.net/oscnet/up-0edf9a222901a52d6335db40c964d817116.png  '全面支持三大主流环境 -百度PaddlePaddle新增Windows环境支持')![Test](https://oscimg.oschina.net/oscnet/up-0edf9a222901a52d6335db40c964d817116.png  '全面支持三大主流环境 -百度PaddlePaddle新增Windows环境支持') 
 
##### 3.安装过程 
如果是在线安装，用户直接输入 pip install paddlepaddle即可正常安装。 如果是离线安装，用户输入 pip install paddlepaddle_xxx.whl 包也可以完成安装。 
通常情况下pip命令伴随Python安装包一起已经得到安装，如果用户发现自己没有安装pip，可以到https://pip.pypa.io/en/stable/installing/ ，按照提示安装pip即可。 
如果出现错误，用户可以检查 
请使用管理员权限账户操作（比如Administrator账号），并确保使用64位Python（查看系统检查章节） 
![Test](https://oscimg.oschina.net/oscnet/up-0edf9a222901a52d6335db40c964d817116.png  '全面支持三大主流环境 -百度PaddlePaddle新增Windows环境支持') 
通过 控制面板 – 账号 – 管理用户账号 即可看到如上界面。 
 
##### 4.安装完成检查 
安装完成后，用户可以打开Python命令，输入如下语句， 
 
   ```java 
  >>> import paddle.fluid
  ```   
   ```java 
  >>> print(paddle.__version__)
  ```   
   ```java 
  1.2.0 # 当前paddle版本
  ```   
 
如果出现错误，用户可以检查PaddlePaddle依赖python的动态库，如果当前Python没有选择安装到环境变量，则可能出现找不到依赖库的情况，用户可以在如下图中加入环境路径，再次启动即可。 
![Test](https://oscimg.oschina.net/oscnet/up-0edf9a222901a52d6335db40c964d817116.png  '全面支持三大主流环境 -百度PaddlePaddle新增Windows环境支持')![Test](https://oscimg.oschina.net/oscnet/up-0edf9a222901a52d6335db40c964d817116.png  '全面支持三大主流环境 -百度PaddlePaddle新增Windows环境支持') 
编译 
不想自己做编译的用户可以直接跳过此节。 
 
##### 1.前期准备 
 
###### 1）环境检查:当前Paddle的编译只支持window10 专业/企业版本。 
 
###### 2）工具准备 
 
 
##### 2. 编译过程 
PaddlePaddle的编译过程需要保证网络可用，因为部分依赖包需要通过网络环境获取。 PaddlePaddle编译需要访问 https://github.com/ 
 
###### 1）用户需要到  
 
###### https://github.com/paddlepaddle/paddle 下载源代码，选择 release 1.2 分支，下载zip包或者 通过命令 
 
 
###### 2）在源代码目录下，建一个build子目录并进入 
 
###### 3）运行 
 
   ```java 
  cmake .. -G "Visual Studio 14 2015 Win64" -DPYTHON_INCLUDE_DIR=${PYTHON_INCLUDE_DIRS} -DPYTHON_LIBRARY=${PYTHON_LIBRARY} -DPYTHON_EXECUTABLE=${PYTHON_EXECUTABLE} -DWITH_FLUID_ONLY=ON -DWITH_GPU=OFF -DWITH_TESTING=OFF -DCMAKE_BUILD_TYPE=Release
  ```   
 
注释： 
a.其中PYTHONINCLUDEDIRS指的是python的include目��，比如 c:\Python35\include\ b.其中PYTHONLIBRARY指定是pythonxx.lib所在的目录，比如c:\Python35\libs\ c.其中PYTHONEXECUTABLE指的是python.exe，比如c:\Python35\ python.exe d.其中DWITHFLUIDONLY=ON指的是paddlepaddle在windows下只支持fluid版本 e.其中WITHGPU=OFF指的是paddlepaddle当前只支持CPU f.其中WITHTESTING=OFF指的是关闭测试 g.其中CMAKEBUILDTYPE=Release指的是只支持Release编译 h.其中-G "Visual Studio 14 2015 Win64"指的是只支持VS2016的64bit编译 
 
##### 4） 目录下会生成paddle.sln文件，用Visual Studio 2015打开，选择64位Release模式，开始编译。 
编译完成检查 
 
###### 1. 检查方法 
如果编译过程不出错则表明编译成功，用户可以到 build\python\dist 目录下查找对应的生成 whl 文件。 
 
###### 2. 常见编译问题 
【问】为什么我的paddle.sln文件没有生成？ 【答】请按编译过程要求检查是安装了指定的软件和版本 
【问】编译过程中为什么出现ssl一类的网络错误？ 【答】编译过程需要访问网络，请检查系统代理和网络连通情况。 
【问】whl文件为什么没有生成？ 【答】请按编译过程要求检查python的变量是否正确设置。 
训练模型检测 
 
##### 1.导入网络 
PaddlePaddle在使用方面为了贴合用户需求，尽量做到了将复杂的概念简化，深度学习用户将网络结构会理解为多个层结构的叠加，相对应的，PaddlePaddle也对应的有了层的封装。 在定义网络方面，用户可以统一使用fluid.layers里面定义好的结构，来方面的构建一个神经网络结构，比如 
 
   ```java 
  # Include libraries.
  ```   
   ```java 
  import paddle
  ```   
   ```java 
  import paddle.fluid as fluid
  ```   
   ```java 
  import numpy
  ```   
   ```java 
  # Configure the neural network.
  ```   
   ```java 
  def net(x, y):
  ```   
   ```java 
     y_predict = fluid.layers.fc(input=x, size=1, act=None)
  ```   
   ```java 
     cost = fluid.layers.square_error_cost(input=y_predict, label=y)
  ```   
   ```java 
     avg_cost = fluid.layers.mean(cost)
  ```   
   ```java 
     return y_predict, avg_cost
  ```   
 
 
##### 2. 定义训练和预测函数 
训练和预测方面，可以统一成为输入，计算和输出三个大的方面，用户可以使用fluid.layers.data来定义输入数据，对应在具体在执行层面，executor的run函数中，使用feed来接受输入数据。 
下面可以定义预测函���和训练函数，示例 
 
   ```java 
  # Define train function.
  ```   
   ```java 
  def train(save_dirname):
  ```   
   ```java 
     x = fluid.layers.data(name='x', shape=[13], dtype='float32')
  ```   
   ```java 
     y = fluid.layers.data(name='y', shape=[1], dtype='float32')
  ```   
   ```java 
     y_predict, avg_cost = net(x, y)
  ```   
   ```java 
     sgd_optimizer = fluid.optimizer.SGD(learning_rate=0.001)
  ```   
   ```java 
     sgd_optimizer.minimize(avg_cost)
  ```   
   ```java 
     train_reader = paddle.batch(
  ```   
   ```java 
         paddle.reader.shuffle(paddle.dataset.uci_housing.train(), buf_size=500),
  ```   
   ```java 
         batch_size=20)
  ```   
   ```java 
     place = fluid.CPUPlace()
  ```   
   ```java 
     exe = fluid.Executor(place)
  ```   
   ```java 
     def train_loop(main_program):
  ```   
   ```java 
         feeder = fluid.DataFeeder(place=place, feed_list=[x, y])
  ```   
   ```java 
         exe.run(fluid.default_startup_program())
  ```   
   ```java 
         PASS_NUM = 1000
  ```   
   ```java 
         for pass_id in range(PASS_NUM):
  ```   
   ```java 
             total_loss_pass = 0
  ```   
   ```java 
             for data in train_reader():
  ```   
   ```java 
                 avg_loss_value, = exe.run(
  ```   
   ```java 
                     main_program, feed=feeder.feed(data), fetch_list=[avg_cost])
  ```   
   ```java 
                 total_loss_pass += avg_loss_value
  ```   
   ```java 
                 if avg_loss_value < 5.0:
  ```   
   ```java 
                     if save_dirname is not None:
  ```   
   ```java 
                         fluid.io.save_inference_model(
  ```   
   ```java 
                             save_dirname, ['x'], [y_predict], exe)
  ```   
   ```java 
                     return
  ```   
   ```java 
             print("Pass %d, total avg cost = %f" % (pass_id, total_loss_pass))
  ```   
   ```java 
     train_loop(fluid.default_main_program())
  ```   
   ```java 
  # Infer by using provided test data.
  ```   
   ```java 
  def infer(save_dirname=None):
  ```   
   ```java 
     place = fluid.CPUPlace()
  ```   
   ```java 
     exe = fluid.Executor(place)
  ```   
   ```java 
     inference_scope = fluid.core.Scope()
  ```   
   ```java 
     with fluid.scope_guard(inference_scope):
  ```   
   ```java 
         [inference_program, feed_target_names, fetch_targets] = (
  ```   
   ```java 
             fluid.io.load_inference_model(save_dirname, exe))
  ```   
   ```java 
         test_reader = paddle.batch(paddle.dataset.uci_housing.test(), batch_size=20)
  ```   
   ```java 
         test_data = test_reader().next()
  ```   
   ```java 
         test_feat = numpy.array(map(lambda x: x[0], test_data)).astype("float32")
  ```   
   ```java 
         test_label = numpy.array(map(lambda x: x[1], test_data)).astype("float32")
  ```   
   ```java 
         results = exe.run(inference_program,
  ```   
   ```java 
                           feed={feed_target_names[0]: numpy.array(test_feat)},
  ```   
   ```java 
                           fetch_list=fetch_targets)
  ```   
   ```java 
         print("infer results: ", results[0])
  ```   
   ```java 
         print("ground truth: ", test_label)
  ```   
 
 
##### 3. 执行训练和预测 
接着可以简单调用上面定义函数，训���过程会产生输出，用户可以自定义输出目录，在后面的预测过程中，加载训练输出的模型 
 
   ```java 
  # Run train and infer.
  ```   
   ```java 
  if __name__ == "__main__":
  ```   
   ```java 
     save_dirname = "fit_a_line.inference.model"
  ```   
   ```java 
     train(save_dirname)
  ```   
   ```java 
     infer(save_dirname)
  ```   
 
![Test](https://oscimg.oschina.net/oscnet/up-0edf9a222901a52d6335db40c964d817116.png  '全面支持三大主流环境 -百度PaddlePaddle新增Windows环境支持') 
程序将输出预测结果，比如在笔者的环境中输出为（仅作参考，用户环境可能有出入） 非常欢迎您为PaddlePaddle贡献文档，我们的文档在PaddlePaddle/FluidDoc (https://github.com/PaddlePaddle/FluidDoc) 中统一管理，如您对PaddlePaddle有任何问题，也非常欢迎您在此Repo提交Issue，您的反馈是我们进步的动力！ 
下载安装命令

## CPU版本安装命令
pip install -f https://paddlepaddle.org.cn/pip/oschina/cpu paddlepaddle

## GPU版本安装命令
pip install -f https://paddlepaddle.org.cn/pip/oschina/gpu paddlepaddle-gpu 
>> 访问 PaddlePaddle 官网，了解更多相关内容 
![Test](https://oscimg.oschina.net/oscnet/up-0edf9a222901a52d6335db40c964d817116.png  '全面支持三大主流环境 -百度PaddlePaddle新增Windows环境支持')
                                        