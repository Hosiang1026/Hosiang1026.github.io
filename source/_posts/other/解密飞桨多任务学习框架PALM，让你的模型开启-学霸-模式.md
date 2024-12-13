---
title: 推荐系列-解密飞桨多任务学习框架PALM，让你的模型开启-学霸-模式
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 1813
cover_picture: 'https://static.oschina.net/uploads/img/202006/05135450_btvY.jpg'
abbrlink: a655b046
date: 2021-04-15 09:19:21
---

&emsp;&emsp;随着预训练技术的到来，作为深度学习重要应用领域之一，自然语言处理也迎来了新的春天。通过使用预训练模型可以大大减少模型训练对数据的依赖，仅需要使用少量数据在下游任务中微调（Fine-tu...
<!-- more -->

                                                                                                                                                                                        随着预训练技术的到来，作为深度学习重要应用领域之一，自然语言处理也迎来了新的春天。通过使用预训练模型可以大大减少模型训练对数据的依赖，仅需要使用少量数据在下游任务中微调（Fine-tune），就可以获得效果非常优秀的模型。不过如果希望获得更好的效果，该怎么办呢？有人也许会说：多训练几个epoch嘛！但是对于这种单一任务且有监督学习的微调方式，单独增加训练epoch并不是一个好方法，过度的训练容易损害模型的泛化能力，发生过拟合现象。 
![Test](https://imgconvert.csdnimg.cn/aHR0cHM6Ly9tbWJpei5xcGljLmNuL21tYml6X3BuZy9zS2lhMUZLRmlhZmdncHpqaWF6eUM0Y25taWFyTFF0eHY0RmJYOEloY2tKWkNkcDBqZTZJWW1FYjBxZ0JqcUtqdzJSR0xRVEFDQVdJY2xvU3Bla2p6M216Z0EvNjQw?x-oss-process=image/format,png  '解密飞桨多任务学习框架PALM，让你的模型开启-学霸-模式')​ 
要知道训练一个模型就像在养育一个孩子一样。在子女的教育问题上，每个家长都会投入尽可能多的人力和资源，希望把自己孩子教育成才，能够举一反三、触类旁通，成为一个“学霸”。 
但是如果到考试时发现自己的孩子只会做课本上的原题，题目稍微改改就做不好，我想家长一定会欲哭无泪吧。相比模型训练又何尝不是呢？开发者不仅要投入大量的服务器硬件资源，还要辛辛苦苦写代码，结果最后训练出的模型泛化能力极差，跳出训练数据的范围，就啥也干不了，相信这绝对不是任何一个开发者希望看到的。 
那么有什么方法可以提高模型的泛化能力，让模型可以更加聪明呢？其实可以在微调阶段引入辅助任务信号，通过多任务学习的方式，即将多个目标任务场景联合学习，就可以显著提高模型所学到的表征的通用性，使得模型具备更强的泛化能力。 
但是基于传统的深度学习框架，多任务学习方式的代码实现门槛较高，策略调整不够灵活，成本高，且容易出错。为此，飞桨开源深度学习平台发布了High-Level的多任务学习框架PALM，该框架灵活且易于使用，旨在帮助用户快速开发具备强泛化能力的NLP模型，为模型添加学霸属性！ 
下载安装命令

## CPU版本安装命令
pip install -f https://paddlepaddle.org.cn/pip/oschina/cpu paddlepaddle

## GPU版本安装命令
pip install -f https://paddlepaddle.org.cn/pip/oschina/gpu paddlepaddle-gpu 
 
##### 什么是多任务学习 
在了解PALM之前，首先我们来看下什么是多任务学习。多任务学习是机器学习领域的一个研究分支，通过让模型在学习阶段同时解决多个任务，使其可以学习到任务之间的共性和差异性。 
对于大部分NLP任务来说，都依赖于一个通用的文本表示模块（Encoder）来完成文本的语义向量表示，这部分往往可以看作是各任务的共性知识；而要解决不同的NLP任务，则需要在任务的输出层来编码各个不同任务所独有的强相关的知识，因此输出层往往可以表征任务之间的差异性。 
![Test](https://imgconvert.csdnimg.cn/aHR0cHM6Ly9tbWJpei5xcGljLmNuL21tYml6X3BuZy9zS2lhMUZLRmlhZmdncHpqaWF6eUM0Y25taWFyTFF0eHY0RmJYOEloY2tKWkNkcDBqZTZJWW1FYjBxZ0JqcUtqdzJSR0xRVEFDQVdJY2xvU3Bla2p6M216Z0EvNjQw?x-oss-process=image/format,png  '解密飞桨多任务学习框架PALM，让你的模型开启-学霸-模式') 
图1 多任务学习网络示意图 
当预训练模型应用于多任务学习中时，预训练模型本身往往作为各个任务的“共有部分”。在训练过程中，多个任务同时学习，不同任务之间共享预训练参数，从而最终得到一个更加鲁棒、更强泛化能力的模型。就像让一个孩子同时学习不同学科的知识，将不同学科的知识融会贯通，这样将来考试时无论是考课内的，还是课外的，单独学科还是考文理综合，都会信手拈来！ 
![Test](https://imgconvert.csdnimg.cn/aHR0cHM6Ly9tbWJpei5xcGljLmNuL21tYml6X3BuZy9zS2lhMUZLRmlhZmdncHpqaWF6eUM0Y25taWFyTFF0eHY0RmJYOEloY2tKWkNkcDBqZTZJWW1FYjBxZ0JqcUtqdzJSR0xRVEFDQVdJY2xvU3Bla2p6M216Z0EvNjQw?x-oss-process=image/format,png  '解密飞桨多任务学习框架PALM，让你的模型开启-学霸-模式') 
 
##### PALM多任务学习框架概览 
了解了什么是多任务学习后，咱们来看看飞桨的PALM多任务学习框架的内部是如何组成的。如图2所示，PALM的架构包含三层，从下到上依次是组件层（Component Layer）、训练器层（Trainer Layer）和高级训练器层（High-level Trainer Layer）： 
 
  组件层：PALM提供了6个 解耦的组件来实现NLP任务。每个组件包含丰富的预定义类和一个基类。预定义类是针对典型的NLP任务的，而基类则是帮助用户完成该组件的自定义。  
  训练器层：通过使用选定的构件建立计算图，用于进行训练和推理。该层描述了训练策略、模型保存和加载、评估和推理过程。一个训练器只能处理一个任务。  
  高级训练器层：用于复杂的学习和推理策略，如多任务学习。通过添加辅助任务来训练健壮的NLP模型（提高模型的测试集和领域外的性能），或者联合训练多个相关任务来获得每个任务的更高性能。  
 
![Test](https://imgconvert.csdnimg.cn/aHR0cHM6Ly9tbWJpei5xcGljLmNuL21tYml6X3BuZy9zS2lhMUZLRmlhZmdncHpqaWF6eUM0Y25taWFyTFF0eHY0RmJYOEloY2tKWkNkcDBqZTZJWW1FYjBxZ0JqcUtqdzJSR0xRVEFDQVdJY2xvU3Bla2p6M216Z0EvNjQw?x-oss-process=image/format,png  '解密飞桨多任务学习框架PALM，让你的模型开启-学霸-模式') 
图2 PALM的运行原理图 
飞桨PALM涉及的模块如下表所示。 
![Test](https://imgconvert.csdnimg.cn/aHR0cHM6Ly9tbWJpei5xcGljLmNuL21tYml6X3BuZy9zS2lhMUZLRmlhZmdncHpqaWF6eUM0Y25taWFyTFF0eHY0RmJYOEloY2tKWkNkcDBqZTZJWW1FYjBxZ0JqcUtqdzJSR0xRVEFDQVdJY2xvU3Bla2p6M216Z0EvNjQw?x-oss-process=image/format,png  '解密飞桨多任务学习框架PALM，让你的模型开启-学霸-模式')​ 
现在介绍完框架结构和模块了，相当于演员都到场了，该开始唱戏了！下面咱们再来看看如何使用这些模块实现多任务学习功能的吧！ 
![Test](https://imgconvert.csdnimg.cn/aHR0cHM6Ly9tbWJpei5xcGljLmNuL21tYml6X3BuZy9zS2lhMUZLRmlhZmdncHpqaWF6eUM0Y25taWFyTFF0eHY0RmJYOEloY2tKWkNkcDBqZTZJWW1FYjBxZ0JqcUtqdzJSR0xRVEFDQVdJY2xvU3Bla2p6M216Z0EvNjQw?x-oss-process=image/format,png  '解密飞桨多任务学习框架PALM，让你的模型开启-学霸-模式')​ 
 
##### 如何使用PALM? 
1. 安装PALM 
PALM的安装非常简单，可以通过pip直接安装，也可以通过git clone的方式从github上获取。 
 
  ```java 
  pip install paddlepalm
#或
git clone  https://github.com/PaddlePaddle/PALM.git


  ```  
 
PALM同时支持了Python2 和 Python3、Linux 和Windows、CPU 和 GPU等不同软硬件环境。PALM安装完成后会根据所处环境自动切换模型训练/推理设备。 
此外PALM中还内置了丰富的预训练模型，用户可以轻松的切换预训练模型，探索其作为多任务学习的模型主干的有效性。 
如果要查看所有可用的预训练模型并下载，请在python解释器中运行如下代码。 
 
  ```java 
  >>> from paddlepalm import downloader
>>> downloader.ls('pretrain')
Available pretrain items:
  => RoBERTa-zh-base
  => RoBERTa-zh-large
  => ERNIE-v2-en-base
  => ERNIE-v2-en-large
  => XLNet-cased-base
  => XLNet-cased-large
  => ERNIE-v1-zh-base
  => ERNIE-v1-zh-base-max-len-512
  => BERT-en-uncased-large-whole-word-masking
  => BERT-en-cased-large-whole-word-masking
  => BERT-en-uncased-base
  => BERT-en-uncased-large
  => BERT-en-cased-base
  => BERT-en-cased-large
  => BERT-multilingual-uncased-base
  => BERT-multilingual-cased-base
  => BERT-zh-base

>>> downloader.download('pretrain', 'BERT-en-uncased-base', './pretrain_models')


  ``` 
 
 
2. 参考如下例子编写代码 
这里举一个对话系统构建的例子。在任务完成型的对话系统中，我们为了理解用户的对话输入，需要完成两个NLP任务：一个是意图理解，这个可以看做是一个文本分类任务；另一个是槽位填充，即识别出意图中的相关属性和属性值，这个可以看做是序列标注任务。我们希望将这两个NLP任务进行联合训练，来得到更佳的模型。 
基于PALM可以非常轻松的实现这个多任务训练需求。代码如下所示。（为了简化说明，这里省略了模型组网、迭代训练等部分的相关代码，仅体现PALM相关的内容。） 
 
  ```java 
  # 创建数据集的读取与预处理工具
seq_label_reader = palm.reader.SequenceLabelReader(vocab_path, max_seqlen, label_map, seed=random_seed) 
cls_reader = palm.reader.ClassifyReader(vocab_path, max_seqlen, seed=random_seed)

# 加载训练数据
seq_label_reader.load_data(train_slot, file_format='tsv', num_epochs=None, batch_size=batch_size) 
cls_reader.load_data(train_intent, batch_size=batch_size, num_epochs=None)

# 创建骨干网络提取文本特征
ernie = palm.backbone.ERNIE.from_config(config)

# 在ERNIE的骨干网络上注册数据集读取与预处理工具
seq_label_reader.register_with(ernie) 
cls_reader.register_with(ernie)

#  创建任务的输出层
seq_label_head = palm.head.SequenceLabel(num_classes, input_dim, dropout_prob) 
cls_head = palm.head.Classify(num_classes_intent, input_dim, dropout_prob)

# 创建任务训练单元和多任务训练模块
trainer_seq_label = palm.Trainer("slot", mix_ratio=1.0) 
trainer_cls = palm.Trainer("intent", mix_ratio=1.0)
trainer = palm.MultiHeadTrainer([trainer_seq_label, trainer_cls])

# 构建包含主干网络和任务头的前向图
loss1 = trainer_cls.build_forward(ernie, cls_head) 
loss2 = trainer_seq_label.build_forward(ernie, seq_label_head) 
loss_var = trainer.build_forward()

# 使能warmup策略以获取更好的微调效果
n_steps = seq_label_reader.num_examples * 1.5 * num_epochs
warmup_steps = int(0.1 * n_steps) 
sched = palm.lr_sched.TriangularSchedualer(warmup_steps, n_steps)

# 构建优化器
adam = palm.optimizer.Adam(loss_var, lr, sched)

# 构建反向图
trainer.build_backward(optimizer=adam, weight_decay=weight_decay)

#将准备好的reader和数据给到训练单元。
trainer.fit_readers_with_mixratio([seq_label_reader, cls_reader], "slot", num_epochs)

# 加载预训练模型
trainer.load_pretrain('./pretrain/ERNIE-v2-en-base')

# 设置训练期间保存模型
trainer.set_saver(save_path='./outputs/', save_steps=300)

# 开始训练
trainer.train(print_steps=10)


  ```  
 
其它实现细节和完整的示例代码请参见 
https://github.com/PaddlePaddle/PALM/tree/master/examples/multi-task 
运行代码后，部分训练日志如下所示，可以看到不同的训练任务都在执行过程中。 
 
  ```java 
  global step: 5, slot: step 3/309 (epoch 0), loss: 68.965, speed: 0.58 steps/s 
global step: 10, intent: step 3/311 (epoch 0), loss: 3.407, speed: 8.76 steps/s 
global step: 15, slot: step 12/309 (epoch 0), loss: 54.611, speed: 1.21 steps/s 
global step: 20, intent: step 7/311 (epoch 0), loss: 3.487, speed: 10.28 steps/s


  ```  
 
 
##### 更多示例 
除了上面的示例之外，飞桨PALM还可以用来帮助复现EMNLP2019 MRQA比赛中的夺冠方案D-Net。通过使用飞桨PALM，可以帮助机器阅读理解引入Mask Language Model和段落打分辅助任务的过程变得非常容易。 
此外，Github Repo中还提供了情感分析、问题相似度匹配、命名实体识别、机器阅读理解等更多的NLP示例，在��些��任务示例的基础上尝试引入更多相关的辅助任务可以预期得到泛化能力更强的模型，快去试试吧！ 
如果您加入官方QQ群，您将遇上大批志同道合的深度学习同学。官方QQ群：703252161。 
如果您想详细了解更多飞桨的相关内容，请参阅以下文档。 
下载安装命令

## CPU版本安装命令
pip install -f https://paddlepaddle.org.cn/pip/oschina/cpu paddlepaddle

## GPU版本安装命令
pip install -f https://paddlepaddle.org.cn/pip/oschina/gpu paddlepaddle-gpu 
官网地址： 
https://www.paddlepaddle.org.cn 
PLAM项目地址： 
https://github.com/PaddlePaddle/PALM 
飞桨开源框架项目地址：  
GitHub: https://github.com/PaddlePaddle/Paddle 
Gitee:  https://gitee.com/paddlepaddle/Paddle 
 
  
   
    
     
      
       
        
         
          
           
            
             
              
               
                
                 
                  
                  >> 访问 PaddlePaddle 官网，了解更多相关内容。 
                  
                 
                
               
              
             
            
           
          
         
        
       
      
     
    
   
  

                                        