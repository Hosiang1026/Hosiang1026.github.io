---
title: 推荐系列-深度推荐模型之DIN
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 1985
cover_picture: 'https://img-blog.csdnimg.cn/20210118190044920.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3d1emhvbmdxaWFuZw==,size_1,color_FFFFFF,t_70#pic_center'
abbrlink: ced2bb3a
date: 2021-04-15 09:46:45
---

&emsp;&emsp;1 背景 在embedding&MLP方法中，维数有限的用户表示向量将成为表达用户兴趣的瓶颈。以电子商务网站展示广告为例，用户在访问电子商务网站时可能同时对不同种类的商品感兴趣，也就是说，用户的...
<!-- more -->

                                                                                                                                                                                         
### 1 背景 
       在embedding&MLP方法中，维数有限的用户表示向量将成为表达用户兴趣的瓶颈。以电子商务网站展示广告为例，用户在访问电子商务网站时可能同时对不同种类的商品感兴趣，也就是说，用户的兴趣是多样的，当涉及到CTR预测任务时，通常从用户行为数据中获取用户兴趣。embedding&MLP方法通过将用户行为的嵌入向量转化为一个固定长度的向量来学习对某个用户所有兴趣的表示，该向量在欧氏空间中，所有用户的表示向量都是固定长度的。换句话说，用户的不同兴趣被压缩成一个固定长度的向量，这限制了嵌入MLP方法的表达能力。为了能够表达用户的不同兴趣，需要对定长向量的维数进行大幅度的扩展。然而它将极大地扩大学习参数的大小��并加剧在有限数据下过拟合的风险。此外，它增加了计算和存储的负担，这对于工业在线系统来说是不可容忍的。 
       另一方面，在预测候选广告时，没有必要将某个用户的所有不同兴趣压缩到同一个向量中，因为只有用户的部分兴趣会影响他的行为（点击或不点击）。例如，一位女游泳运动员会点击推荐的护目镜，主要是因为她买了泳衣，而不是她上周购物清单上的鞋子。基于此，作者提出了一个新的模型：深度兴趣网络（Deep Interest Network，DIN），它通过考虑给定候选广告的历史行为的相关性，自适应地计算用户兴趣的表示向量，DIN通过软搜索历史行为的相关部分来关注相关的用户兴趣，并采用加权和池化的方法得到用户兴趣对候选广告的表示，与候选广告关联度越高的行为得到越高的激活权重，从而控制用户兴趣的表示兴趣。 
 
### 2 模型结构与原理 
       在具体分析DIN模型之前，我们还得先介绍两块小内容，一个是DIN模型的数据集和特征表示，一个是深度学习模型的基线模型。 
 
#### 2.1 特征表示 
       工业上的CTR预测数据集一般都是 
 ```java 
  multi-group categorial form
  ``` 
 的形式，就是类别型特征最为常见，这种数据集一般长这样： 
      ![Test](https://img-blog.csdnimg.cn/20210118190044920.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3d1emhvbmdxaWFuZw==,size_1,color_FFFFFF,t_70#pic_center  '深度推荐模型之DIN') 
       这里的亮点就是框出来的那个特征，这个包含着丰富的用户兴趣信息。 
       对于特征编码，作者这里举了个例子： [weekday=Friday, gender=Female, visited_cate_ids={Bag,Book}, ad_cate_id=Book] ，这种情况我们知道一般是通过one-hot的形式对其编码，转成系数的二值特征的形式。但是这里我们会发现一个 visted_cate_ids ，也就是用户的历史商品列表，对于某个用户来讲，这个值是个多值型的特征，而且还要知道这个特征的长度不一样长，也就是用户购买的历史商品个数不一样多，这个显然。这个特征的话，我们一般是用到multi-hot编码，也就是可能不止1个1了，有哪个商品，对应位置就是1，所以经过编码后的数据长下面这个样子： 
        ![Test](https://img-blog.csdnimg.cn/20210118190044920.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3d1emhvbmdxaWFuZw==,size_1,color_FFFFFF,t_70#pic_center  '深度推荐模型之DIN') 
       这个就是喂入模型的数据格式了，这里还要注意一点就是上面的特征里面没有任何的交互组合，也就是没有做特征交叉。这个交互信息交给后面的神经网络去学习。 
 
#### 2.2 基线模型 
    ![Test](https://img-blog.csdnimg.cn/20210118190044920.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3d1emhvbmdxaWFuZw==,size_1,color_FFFFFF,t_70#pic_center  '深度推荐模型之DIN') 
       基准模型的结构相对比较简单，我们前面也一直用这个基准，分为三大模块：Embedding layer，Pooling & Concat layer和MLP。 
       Embedding layer。 
       Pooling layer and concat layer：pooling层的作用是将用户的历史行为embedding这个最终变成一个定长的向量，因为每个用户历史购买的商品数是不一样的，也就是每个用户multi-hot中1个个数不一致，这样经过embedding层，得到的用户历史行为embedding的个数不一样多，也就是上面的embedding列表 ![Test](https://img-blog.csdnimg.cn/20210118190044920.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3d1emhvbmdxaWFuZw==,size_1,color_FFFFFF,t_70#pic_center  '深度推荐模型之DIN') 不一样长，那么这样的话，每个用户的历史行为特征拼起来就不一样长了。而后面如果加全连接网络的话，我们知道，他需要定长的特征输入。所以往往用一个pooling layer先把用户历史行为embedding变成固定长度(统一长度)，所以有了这个公式： ![Test](https://img-blog.csdnimg.cn/20210118190044920.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3d1emhvbmdxaWFuZw==,size_1,color_FFFFFF,t_70#pic_center  '深度推荐模型之DIN')。 
       MLP。 
       Loss： ![Test](https://img-blog.csdnimg.cn/20210118190044920.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3d1emhvbmdxaWFuZw==,size_1,color_FFFFFF,t_70#pic_center  '深度推荐模型之DIN')。基线模型通过汇集用户行为特征组上的所有嵌入向量获得用户兴趣的固定长度表示向量。对于给定的用户，无论候选广告是什么，这个表示向量都保持不变。这样，有限维的用户表示向量将成为表达用户不同兴趣的瓶颈。为了使其具有足够的能力，一种简单的方法是扩展嵌入向量的维数，这将极大地增加学习参数的大小。 
        DIN通过给定一个候选广告，然后去注意与该广告相关的局部兴趣的表示来模拟此过程。DIN不会通过使用同一向量来表达所有用户的不同兴趣，而是通过考虑历史行为的相关性来自适应地计算用户兴趣的表示向量（对于给的的广告）。该表示向量随不同广告而变化。下面看一下DIN模型。 
 
#### 2.3 DIN模型架构 
       ![Test](https://img-blog.csdnimg.cn/20210118190044920.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3d1emhvbmdxaWFuZw==,size_1,color_FFFFFF,t_70#pic_center  '深度推荐模型之DIN') 
       DIN依然是采用了基模型的结构，只不过是在这个的基础上加了一个Attention机制来学习用户兴趣与当前候选广告间的关联程度，用论文里面的话是，引入了一个新的local activation unit，这个东西用在了用户历史行为特征上面，能够根据用户历史行为特征和当前广告的相关性给用户历史行为特征embedding进行加权。 
       Local activation unit：具体而言，激活单元应用于用户行为特征，其作为加权求和池化来执行，以自适应地计算给定候选广告 ![Test](https://img-blog.csdnimg.cn/20210118190044920.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3d1emhvbmdxaWFuZw==,size_1,color_FFFFFF,t_70#pic_center  '深度推荐模型之DIN') 的用户表示 ![Test](https://img-blog.csdnimg.cn/20210118190044920.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3d1emhvbmdxaWFuZw==,size_1,color_FFFFFF,t_70#pic_center  '深度推荐模型之DIN') ： ![Test](https://img-blog.csdnimg.cn/20210118190044920.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3d1emhvbmdxaWFuZw==,size_1,color_FFFFFF,t_70#pic_center  '深度推荐模型之DIN') 。 
 
### 3 代码实现 
       这里主要和大家说一下DIN模型的总体运行逻辑，这样可以让大家从宏观的层面去把握模型的编写过程。该模型所使用的数据集是movielens数据集， 具体介绍可以参考后面的GitHub。因为上面反复强调了DIN的应用场景，需要基于用户的历史行为数据，所以在这个数据集中会有用户过去对电影评分的一系列行为。这在之前的数据集中往往是看不到的。大家可以导入数据之后自行查看这种行为特征(hist_behavior)。另外还有一点需要说明的是这种历史行为是序列性质的特征，并且不同的用户这种历史行为特征长度会不一样，但是我们的神经网络是要求序列等长的，所以这种情况我们一般会按照最长的序列进行padding的操作(不够长的填0)，而到具体层上进行运算的时候，会用mask掩码的方式标记出这些填充的位置，好保证计算的准确性。在我们给出的代码中，大家会在AttentionPoolingLayer层的前向传播中看到这种操作。下面开��说编写逻辑： 
       首先，DIN模型的输入特征大致上分为了三类：Dense(连续型), Sparse(离散型), VarlenSparse(变长离散型)，也就是指的上面的历史行为数据。而不同的类型特征也就决定了后面处理的方式会不同： 
 
   
 Dense型特征：由于是数值型了，这里为每个这样的特征建立Input层接收这种输入，然后拼接起来先放着，等离散的那边处理好之后，和离散的拼接起来进DNN 
 Sparse型特征：为离散型特征建立Input层接收输入，然后需要先通过embedding层转成低维稠密向量，然后拼接起来放着，等变长离散那边处理好之后，一块拼起来进DNN，但是这里面要注意有个特征的embedding向量还得拿出来用，就是候选商品的embedding向量，这个还得和后面的计算相关性，对历史行为序列加权。 
 VarlenSparse型特征：这个一般指的用户的历史行为特征，变长数据，首先会进行padding操作成等长，然后建立Input层接收输入，然后通过embedding层得到各自历史行为的embedding向量，拿着这些向量与上面的候选商品embedding向量进入AttentionPoolingLayer去对这些历史行为特征加权合并，最后得到输出。 
 
       通过上面的三种处理，就得到了处理好的连续特征，离散特征和变长离散特征，接下来把这三种特征拼接，进DNN网络，得到最后的输出结果即可。所以有了这个解释，就可以放DIN模型的代码全貌了，大家可以感受下我上面解释的： 
 
 ```java 
  # DIN网络搭建
def DIN(feature_columns, behavior_feature_list, behavior_seq_feature_list):
    """
    这里搭建DIN网络，有了上面的各个模块，这里直接拼起来
    :param feature_columns: A list. 里面的每个元素是namedtuple(元组的一种扩展类型，同时支持序号和属性名访问组件)类型，表示的是数据的特征封装版
    :param behavior_feature_list: A list. 用户的候选行为列表
    :param behavior_seq_feature_list: A list. 用户的历史行为列表
    """
    # 构建Input层并将Input层转成列表作为模型的输入
    input_layer_dict = build_input_layers(feature_columns)
    input_layers = list(input_layer_dict.values())
    
    # 筛选出特征中的sparse和Dense特征， 后面要单独处理
    sparse_feature_columns = list(filter(lambda x: isinstance(x, SparseFeat), feature_columns))
    dense_feature_columns = list(filter(lambda x: isinstance(x, DenseFeat), feature_columns))
    
    # 获取Dense Input
    dnn_dense_input = []
    for fc in dense_feature_columns:
        dnn_dense_input.append(input_layer_dict[fc.name])
    
    # 将所有的dense特征拼接
    dnn_dense_input = concat_input_list(dnn_dense_input)   # (None, dense_fea_nums)
    
    # 构建embedding字典
    embedding_layer_dict = build_embedding_layers(feature_columns, input_layer_dict)

    # 离散的这些特特征embedding之后，然后拼接，然后直接作为全连接层Dense的输入，所以需要进行Flatten
    dnn_sparse_embed_input = concat_embedding_list(sparse_feature_columns, input_layer_dict, embedding_layer_dict, flatten=True)
    
    # 将所有的sparse特征embedding特征拼接
    dnn_sparse_input = concat_input_list(dnn_sparse_embed_input)   # (None, sparse_fea_nums*embed_dim)
    
    # 获取当前行为特征的embedding， 这里有可能有多个行为产生了行为列表，所以需要列表将其放在一起
    query_embed_list = embedding_lookup(behavior_feature_list, input_layer_dict, embedding_layer_dict)
    
    # 获取历史行为的embedding， 这里有可能有多个行为产生了行为列表，所以需要列表将其放在一起
    keys_embed_list = embedding_lookup(behavior_seq_feature_list, input_layer_dict, embedding_layer_dict)
    # 使用注意力机制将历史行为的序列池化，得到用户的兴趣
    dnn_seq_input_list = []
    for i in range(len(keys_embed_list)):
        seq_embed = AttentionPoolingLayer()([query_embed_list[i], keys_embed_list[i]])  # (None, embed_dim)
        dnn_seq_input_list.append(seq_embed)
    
    # 将多个行为序列的embedding进行拼接
    dnn_seq_input = concat_input_list(dnn_seq_input_list)  # (None, hist_len*embed_dim)
    
    # 将dense特征，sparse特征， 即通过注意力机制加权的序列特征拼接起来
    dnn_input = Concatenate(axis=1)([dnn_dense_input, dnn_sparse_input, dnn_seq_input]) # (None, dense_fea_num+sparse_fea_nums*embed_dim+hist_len*embed_dim)
    
    # 获取最终的DNN的预测值
    dnn_logits = get_dnn_logits(dnn_input, activation='prelu')
    
    model = Model(inputs=input_layers, outputs=dnn_logits)
    
    return model
  ``` 
  
![Test](https://img-blog.csdnimg.cn/20210118190044920.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3d1emhvbmdxaWFuZw==,size_1,color_FFFFFF,t_70#pic_center  '深度推荐模型之DIN') 
![Test](https://img-blog.csdnimg.cn/20210118190044920.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3d1emhvbmdxaWFuZw==,size_1,color_FFFFFF,t_70#pic_center  '深度推荐模型之DIN') 
 
### 4 思考 
       DIN是2018年阿里巴巴提出的模型，之后阿里又提出了DIEN，强调用户的兴趣是在不断变化的，获取兴趣的动态性对于兴趣表示非常重要。但是包括DIN和DIEN在内的大多数模型都直接利用用户行为信息，而用户行为背后的时间因素也富含价值，通过加入时间因素，结合Attention进行对用户行为中和target Ad的筛选，抓住用户兴趣的动态性以及针对性，来对点击率进行预测，可以有效地应对用户兴趣中某一部分的消失或者漂移问题。 
 
### 参考资料 
 
 Zhou G, Zhu X, Song C, et al. Deep interest network for click-through rate prediction[C]//Proceedings of the 24th ACM SIGKDD International Conference on Knowledge Discovery & Data Mining. 2018: 1059-1068. 
 AI上推荐 之 AFM与DIN模型（当推荐系统遇上了注意力机制） 
 DataWhale https://github.com/datawhalechina/team-learning-rs/blob/master/DeepRecommendationModel/DIN.md 

                                        