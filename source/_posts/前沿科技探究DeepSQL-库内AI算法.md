---
title: 推荐系列-前沿科技探究DeepSQL-库内AI算法
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 320
cover_picture: 'https://static.oschina.net/uploads/img/202203/25112058_QNRj.gif'
abbrlink: cc7a5449
date: 2022-02-19 11:56:26
---

&emsp;&emsp;库DeepSQL特性实现DB4AI功能，即在数据库内实现AI算法，以更好的支撑大数据的快速分析和计算。这里提供了一整套基于SQL的机器学习、数据挖掘以及统计学的算法，用户可以直接使用SQL进行机...
<!-- more -->

                                                                                                                    
 
  概述  
  环境部署  
  使用指导  
  最佳实践  
  常见问题处理  
 
 
### 一、概述 
DeepSQL是对openGauss DB4AI能力的增强，让对MADLib比较熟悉的数据分析师或开发者可以轻松迁移到openGauss上进行工作。DeepSQL将常用的机器学习算法封装为SQL语句，支持60多个常用算法。其中包括回归算法（例如线性回归，逻辑回归，随机森林等）、分类算法（比如KNN等）、聚类算法（比如K-means）等。除了基础的机器学习算法之外，还包括图相关的算法，比如最短路径，图形直径等等算法；此外还支持数据处理（比如PCA），稀疏向量，统计学常用算法（比如协方差，Pearson系数计算等），训练集测试集分割方法，交叉验证方法等。 
表 1 支持的机器学习算法 - 回归类算法 
 
 
  
   
    算法中文名称  
    算法英文名称  
    应用场景  
   
  
  
   
    逻辑回归  
    Logistic Regression  
    例如寻找某疾病的危险因素，金融商业机构需要对企业进行评估等。 预测：根据模型预测���同的自变量情况下某病或某情况的发生概率。 判别：实际上跟预测类似，也是根据模型判断某人属于某病或属于某种情况的概率有多大，即判断某��有多大可能是属于某病。  
   
   
    Cox比例风险回归  
    Cox Proportional Hazards Regression  
    该模型以生存结局和生存时间为因变量，可同时分析众多因素对生存期的影响，能分析带有截尾生存时间的资料，且不要求估计资料的生存分布类型。由于上述优良性质，该模型自问世以来，在医学类研究中得到广泛的应用，是迄今生存分析中应用最多的多因素分析方法。  
   
   
    弹性网络回归  
    Elastic Net Regularization  
    弹性回归是岭回归和套索回归的混合技术，它同时使用 L2 和 L1 正则化。当有多个相关的特征时，套索回归很可能随机选择其中一个，而弹性回归很可能都会选择。  
   
   
    广义线性模型  
    Generalized Linear Models  
    在一些实际问题中，变量间的关系并不都是线性的，这种情况就应该用曲线去进行拟合。  
   
   
    边际效应  
    Marginal Effects  
    提供边际效应的计算。  
   
   
    多类回归  
    Multinomial Regression  
    如果目标类别数超过两个，这时就需要使用多类回归，如疗效可能是“无效”，“显效”，“痊愈”三类。  
   
   
    序数回归  
    Ordinal Regression  
    在统计学中，序数回归是一种用于预测序数变量的回归分析，即其值存在于任意范围内的变量，不同值之间的度量距离也不同。它可以被认为是介于回归和分类之间的一类问题。例如，病情的分级（1、2、3、4级），症状的感觉分级（不痛、微痛、较痛和剧痛），对药物剂量反应的分级（无效、微效、中效和高效）等等。不同级别之间的差异不一定相等，如不痛与微痛的差值不一定等于较痛与剧痛的差值。  
   
   
    聚类方差  
    Clustered Variance  
    Clustered Variance模块调整聚类的标准误差。例如，将一个数据集合复制100次，不应该增加参数估计的精度，但是在符合独立同分布假设（Independent Identically Distributed，IID）下执行这个过程实际上会提高精度。  
   
   
    稳健方差  
    Robust Variance  
    Robust Variance模块中的函数用于计算线性回归、逻辑回归、多类逻辑回归和Cox比例风险回归的稳健方差（Huber-White估计）。它们可用于计算具有潜在噪声异常值的数据集中数据的差异。  
   
   
    支持向量机  
    Support Vector Machines(SVM)  
    用于文本和超文本的分类、图像分类，比起传统的查询优化方案，支持向量机能够获取明显更高的搜索准确度。这同样也适用于图像分割系统。  
   
   
    线性回归  
    Linear Regression  
    应用广泛，例如经济学、金融学等。  
   
  
 
 
表 2 支持的机器学习算法 - 其他监督学习 
 
 
  
   
    算法名称（中文）  
    算法名称（英文）  
    应用场景  
   
  
  
   
    决策树  
    Decision Tree  
    最为广泛的归纳推理算法之一，处理类别型或连续型变量的分类预测问题，可以用图形和if-then的规则表示模型，可读性较高。  
   
   
    随机森林  
    Random Forest  
    随机森林是一类专门为决策树分类器设计的组合方法。它组合多棵决策树作出的预测。  
   
   
    条件随机场  
    Conditional Random Field (CRF)  
    条件随机场（CRF）是一种判别的，无向概率的图形模型。线性链CRF是一种特殊类型的CRF，它假定当前状态仅取决于先前的状态。在分词、词性标注和命名实体识别等序列标注任务中取得了很好的效果。  
   
   
    朴素贝叶斯  
    Naive Bayes  
    通过计算概率来进行分类，可以用来处理多分类问题，比如：垃圾邮件过滤器。  
   
   
    神经网络  
    Neural Networks  
    拥有广泛的应用场景，譬如语音识别、图像识别、机器翻译等等。在模式识别的领域中算是标准监督学习算法，并在计算神经学中，持续成为被研究的课题。MLP已被证明是一种通用的函数近似方法，可以被用来拟合复杂的函数或解决分类问题。  
   
   
    k临近算法  
    k-Nearest Neighbors  
    K近邻分类方法通过计算每个训练样例到待分类样品的距离，取和待分类样品距离最近的K个训练样例，K个样品中哪个类别的训练样例占多数，则待分类元组就属于哪个类别。 可用于：文字识别，面部识别，基因模式识别，客户流失预测、欺诈侦测。  
   
  
 
 
表 3 支持的机器学习算法 - 数据处理类算法 
 
 
  
   
    算法名称（中文）  
    算法名称（英文）  
    应用场景  
   
  
  
   
    数组操作  
    Array Operations  
    数组、向量操作运算，包括基础的加减乘除、幂运算、开方、cos、sin、绝对值、方差等。  
   
   
    主成成分分析  
    Dimensionality Reduction (PCA)  
    降维，计算主成分。  
   
   
    变量编码  
    Encoding Categorical Variables  
    当前支持one-hot和dummy编码技术。 当需要用一组特定的预测变量与其它预测变量组作比较时，通常使用哑编码（dummy coding），与之比较的变量组称为参照组。One-hot编码与哑编码类似，两者的区别是前者为每种分类值建立数字类型的0/1指示列。在每行数据中（对应一个数据点），只有一个分类编码列的值可以为1。  
   
   
    矩阵操作  
    Matrix Operations  
    运用矩阵分解，将大型矩阵分解成简单矩阵的乘积形式，则可大大降低计算的难度以及计算量。 矩阵加减乘除、最值、均值、求秩、求逆、矩阵分解(QR，LU，Cholesky)，特征提取。  
   
   
    规范化和距离函数  
    Norms and Distance Functions  
    求范数，余弦相似度，向量间距离。  
   
   
    稀疏向量  
    Sparse Vectors  
    实现稀疏向量类型，如果向量中重复值较多，可以用来压缩储存节省空间。  
   
   
    透视图  
    Pivot  
    透视表或枢轴表，通常用来实现OLAP或报表系统中一类常见的行列转置需求。pivot函数能够对一个表中存储的数据执行基本行转列操作，并将汇总后的结果输出到另一个表中。使行列转置操作变得更为简单与灵活。  
   
   
    模式匹配  
    Path  
    是在一系列行上执行常规模式匹配，并提取有关模式匹配的有用信息。有用的信息可以是简单的匹配计数或更多涉及的内容，如聚合或窗口函数。  
   
   
    会话  
    Sessionize  
    会话化功能对包括事件序列的数据集执行面向时间的会话重建。定义的不活动时段表示一个会话��结束和下一个会话的开始。 可以用于：网络分析，网络安全，制造，财务和运营分析。  
   
   
    共轭梯度法  
    Conjugate gradient  
    求解系数矩阵为对称正定矩阵的线性方程组的数值解的方法。  
   
   
    词干提取  
    Stemming  
    词干提取简单说就是找出单词中的词干部分，场景比如：搜索引擎建立网页主题概念。 在英文网站优化作用明显，对其他语言有借鉴意义。  
   
   
    训练集测试集分割  
    Train-Test Split  
    分割数据集，把一份数据集划分成训练集和测试集，train的部分用于训练，test部分用于验证。  
   
   
    交叉验证  
    Cross Validation  
    交叉验证。  
   
   
    预测指标  
    Prediction Metrics  
    用于评估模型预测的质量，包括均方误差，AUC值、混淆矩阵、修正R方等用于评价模型的函数。  
   
   
    小批量预处理  
    Mini-Batch Preprocessor  
    把数据打包成小份进行训练，优点是它可以比随机梯度下降（默认MADlib优化器）表现更好，会更快更平滑的收敛。  
   
  
 
 
表 4 支持的机器学习算法 - 图类 
 
 
  
   
    算法名称（中文）  
    算法名称（英文）  
    应用场景  
   
  
  
   
    所有对间最短路径  
    All Pairs Shortest Path (APSP)  
    所有对最短路径（APSP）算法找到所有顶点对之间的最短路径的长度（总和权重），使得路径边缘的权重之和最小化。  
   
   
    广度优先算法  
    Breadth-First Search  
    广度优先算法遍历路径。  
   
   
    超链接诱导主题搜索  
    Hyperlink-Induced Topic Search (HITS)  
    HITS算法输出每个节点的authority评分和hub评分，其中authority评分给出页面内容的分数，hub评估出连接到其他页面的分数。  
   
   
    平均路径长度  
    Average Path Length  
    此函数计算每对顶点之间的最短路径的平均值。平均路径长度基于“可到达的目标顶点”，因此它忽略了未连接的顶点之间的无限长度路径。  
   
   
    中心性  
    Closeness Centrality  
    接近度度量是和的倒数，平均值的倒数，以及到所有可到达目标顶点（不包括源顶点）的最短距离的倒数之和。  
   
   
    图表直径  
    Graph Diameter  
    直径被定义为图中所有最短路径中最长的。  
   
   
    入度出度  
    In-Out Degree  
    计算图中每个点的入度出度，入度指指向此点的边的数量，出度指此点指向其他点的边的数量。  
   
   
    网页排名  
    PageRank  
    给定图形，给定图形，PageRank算法输出概率分布，该概率分布表示随机遍历图形的人将到达任何特定顶点的可能性。  
   
   
    单源最短路径  
    Single Source Shortest Path (SSSP)  
    给定图形和源顶点，单源最短路径（SSSP）算法找到从源顶点到图中的每个其他顶点的路径，使得路径边缘的权重之和最小化（每条边权值非负）。  
   
   
    弱连通分量  
    Weakly Connected Component  
    给定有向图，弱连通分量（WCC）是原始图的子图，其中所有顶点通过某个路径彼此连接，忽略边的方向。在无向图的情况下，弱连通分量也是强连通分量。该模块还包括许多在WCC输出上运行的辅助函数。  
   
  
 
 
表 5 支持的机器学习算法 - 时间序列 
 
 
  
   
    算法名称（中文）  
    算法名称（英文）  
    应用场景  
   
  
  
   
    差分整合移动平均自回归模型  
    Autoregressive Integrated Moving Average model(ARIMA)  
    时间序列预测，用于理解和预测一系列数据的未来值。 比如：国际航空旅客数据，预测旅客人数。  
   
  
 
 
表 6 支持的机器学习算法 - 采样 
 
 
  
   
    算法名称（中文）  
    算法名称（英文）  
    应用场景  
   
  
  
   
    采样函数  
    sample  
    抽样。  
   
   
    分层抽样  
    Stratified Sampling  
    分层随机抽样，又称类型随机抽样，它是先将总体各单位按一定标准分成各种类型（或层）；然后根据各类型单位数与总体单位数的比例，确定从各类型中抽取样本单位的数量；最后，按照随机原则从各类型中抽取样本。  
   
   
    对称抽样  
    Balanced Sampling  
    一些分类算法仅在每个类中的样本数大致相同时才最佳地执行。高度偏斜的数据集在许多领域中是常见的（例如，欺诈检测），因此重新采样以抵消这种不平衡可以产生更好的决策边界。  
   
  
 
 
表 7 支持的机器学习算法 - 统计学 
 
 
  
   
    算法名称（中文）  
    算法名称（英文）  
    应用场景  
   
  
  
   
    汇总统计函数  
    Summary  
    生成任何数据表的摘要统计信息。  
   
   
    协方差和相关系数  
    Correlation and Covariance  
    描述性统计，求Pearson系数，相关系数，另一个输出协方差。了解数据从统计学上反映的量的特征，以便我们更好地认识这些将要被挖掘的数据。  
   
   
    统计频率算法  
    CountMin (Cormode-Muthukrishnan)  
    统计一个实时的数据流中元素出现的频率，并且准备随时回答某个元素出现的频率，不需要的精确的计数。  
   
   
    基数估计算法  
    FM (Flajolet-Martin)  
    获取指定列中的不同值的数量。 找出这个数字集合中不重复的数字的个数。  
   
   
    最频繁值  
    MFV (Most Frequent Values)  
    计算频繁值的场景。  
   
   
    假设检验  
    Hypothesis Tests  
    包含F-test，chi2-test等。  
   
   
    概率函数  
    Probability Functions  
    概率函数模块为各种概率分布提供累积分布，密度、质量和分位数函数。  
   
  
 
 
表 8 支持的机器学习算法 - 其他算法 
 
 
  
   
    算法名称（中文）  
    算法名称（英文）  
    应用场景  
   
  
  
   
    k-聚类算法  
    K-means  
    聚类场景。  
   
   
    隐含狄利克雷分布  
    Latent Dirichlet Allocation (LDA)  
    LDA 在主题模型中占有非常重要的地位，常用来文本分类。  
   
   
    关联规则算法  
    Apriori Algorithm  
    关联规则算法，关联规则挖掘的目标是发现数据项集之间的关联关系。比如经典的“啤酒和尿布”。  
   
  
 
  
 
### 二、环境部署 
DeepSQL环境包括编译数据库和安装算法库两个部分。 
 
#### 前提条件 
 
 环境中安装python2.7.12以上版本Python。 
 数据库需要开启对PL/Python存储过程的支持。 
 安装算法库需要拥有管理员权限的用户。 
 
 
#### 操作步骤 
 
  检查部署Python环境。 安装前，请查看系统安装的python版本，当前DeepSQL需要python2.7.12以上版本的环境。 
   
   如果当前系统python2版本高于2.7.12，可以直接安装python-devel包。 
   如果版本过低，或者无法安装python-devel包，可以下载最新python2源码，手动配置编译python2，并配置环境变量。 
  算法库中，部分算法调用了python包，如numpy，pandas等。用户可以安装以下python库：  
 ```java 
  pip install numpy
pip install pandas
pip install scipy

  ``` 
  
    
  编译部署数据库。 数据库需要开启对PL/Python存储过程的支持。默认编译数据库，不包含此模块。因此需要编译数据库时，在configure阶段，加入--with-python参数； 其他编译保持步骤不变； 编译完成后，需要重新gs_initdb； 默认PL/Python存储过程模块不被加载，请执行“CREATE EXTENSION plpythonu”来加载模块。  
  算法库编译和安装。 算法库使用开源的MADlib机器学习框架。源码包和相应patch可以从第三方库的代码仓库里获取。安装命令如下：  
 ```java 
  tar -zxf apache-madlib-1.17.0-src.tar.gz
cp madlib.patch apache-madlib-1.17.0-src           
cd apache-madlib-1.17.0-src/
patch -p1 < madlib.patch

  ``` 
  编译命令如下： 
 ```java 
  ./configure -DCMAKE_INSTALL_PREFIX={YOUR_MADLIB_INSTALL_FOLDER} -DPOSTGRESQL_EXECUTABLE=$GAUSSHOME/bin/ -DPOSTGRESQL_9_2_EXECUTABLE=$GAUSSHOME/bin/ -DPOSTGRESQL_9_2_CLIENT_INCLUDE_DIR=$GAUSSHOME/bin/ -DPOSTGRESQL_9_2_SERVER_INCLUDE_DIR=$GAUSSHOME/bin/ # 以上均为configure命令。 make make install 
  ``` 
  其中， {YOUR_MADLIB_INSTALL_FOLDER}需要改为用户的实际安装路径。 
    
  将算法库安装到数据库中。  
 
a.进入{YOUR_MADLIB_INSTALL_FOLDER}路径。 
b.进入bin文件夹。 
c.执行如下命令。 
 
 ```java 
     ./madpack -s <SCHEMA_NAME> -p opengauss -c <USER_NAME>@127.0.0.1:<PORT>/<DATABASE_NAME> install

  ``` 
  
命令中参数说明如下： 
 
 -s：schema的名称。 
 -p：数据库平台，使用opengauss即可。 
 -c：连接数据库的参数。包括用户名、‘@’、IP地址、端口号和目标数据库名称。 
 
install为安装的命令，除此之外，还有reinstall（重新安装），uninstall（卸载）等命令可用。 
 
  
 
### 三、使用指导 
 
#### PL/Python存储过程 
当前PL/Python存储过程优先支持python2；默认版本也是python2。 
PL/Python中的函数通过标准的CREATE FUNCTION声明： 
 
 ```java 
  CREATE FUNCTION funcname (argument-list)
RETURNS return-type
AS $$
# PL/Python function body
$$ LANGUAGE plpythonu;

  ``` 
  
函数体是一个简单的Python脚本，当函数被调用的时候，它的参数作为列表args的元素传递；命名参数也会被当做普通的变量传递到Python脚本中。命名参数的使用通常更易读。 结果将使用return或yield（结果集语句的情况） 照常从Python代码中返回。如果没有提供返回值，Python返回缺省的None。 PL/Python将Python中的None认为SQL空值。 
例如，返回两个整数中较大者的函数定义如下。 
 
 ```java 
  CREATE FUNCTION pymax(a integer, b integer) RETURNS integer AS $$   
if a > b:     
    return a
return b 
$$ LANGUAGE plpythonu;

  ``` 
  
 
 
#### 数据库Null, None和空串处理 
如果向函数传递了一个SQL null值，参数值在Python中将会显示为None。在数据库中，不同的兼容性下，空串的行为会被当做NULL处理。 
同一个函数，在不同的兼容性下表现不同。 
 
 ```java 
  CREATE FUNCTION quote(t text, how text) RETURNS text AS $$
if how == "literal":
    return plpy.quote_literal(t)    
elif how == "nullable":
    return plpy.quote_nullable(t)    
elif how == "ident":
    return plpy.quote_ident(t)
else:        
    raise plpy.Error("unrecognized quote type %s" % how)
$$ LANGUAGE plpythonu;

  ``` 
  
示例1： 
 
 ```java 
  SELECT quote(t, 'literal') FROM (VALUES ('abc'),('a''bc'),('''abc'''),(''),(''''),('xyzv')) AS v(t);

  ``` 
  
数据库不同兼容性下的结果为： 
 
  兼容性为A时，返回结果如下：  
 ```java 
  ERROR:  TypeError: argument 1 must be string, not None
CONTEXT:  Traceback (most recent call last):
PL/Python function "quote", line 3, in <module>
return plpy.quote_literal(t)
referenced column: quote

  ``` 
   
  兼容性为B时，返回结果如下：  
 ```java 
  quote
-----------
'abc'
'a''bc'
'''abc'''
''
''''
'xyzv'
(6 rows)

  ``` 
   
 
示例2： 
 
 ```java 
  SELECT quote(t, 'nullable') FROM (VALUES ('abc'),('a''bc'),('''abc'''),(''),(''''),(NULL)) AS v(t);

  ``` 
  
数据库不同兼容性下的结果为： 
 
  兼容性为A时，返回结果如下：  
 ```java 
  quote
-----------
'abc'
'a''bc'
'''abc'''
NULL
''''
NULL
(6 rows)

  ``` 
   
  兼容性为B时，返回结果如下：  
 ```java 
  quote
-----------
'abc'
'a''bc'
'''abc'''
''
''''
NULL
(6 rows)

  ``` 
   
 
可以看到，在兼容性“A”中，空串被当为NULL了。 
 
#### 触发器 
当前PL/Python存储过程中，不支持触发器功能。 
 
#### 匿名代码块 
PL/Python也支持DO声明的匿名代码块： 
 
 ```java 
  DO $$
# PL/Python code
$$ LANGUAGE plpythonu;

  ``` 
  
一个匿名代码块不接受参数，并且丢弃它可能返回的值。 
 
#### 共享数据 
每个函数都在Python解释器里获得自己的执行环境。 
全局字典SD在函数调用之间用于存储数据。这些变量是私有静态数据。每一个函数都有自己的SD数据空间，函数A的全局数据和函数参数是函数B不可用的。 
全局字典GD是公共数据，在一个gsql会话中，所有python函数都可访问和改变，使用时需要小心。 
当gsql断开或退出，共享数据就被释放。 
 
 
#### 数据库访问 
PL/Python语言模块自动import一个叫plpy的Python模块。 
plpy模块提供几个函数执行数据库命令：比如plpy.execute，plpy.prepare等。 
plpy模块也提供了函数plpy.debug(msg)、 plpy.log(msg)、plpy.info(msg)、 plpy.notice(msg)、plpy.warning(msg)、 plpy.error(msg)和plpy.fatal(msg)。 plpy.error和 plpy.fatal实际上抛出了一个Python异常，会导致当前事务或者子事务退出。 
另一个实用函数集是plpy.quote_literal(string)、 plpy.quote_nullable(string)和 plpy.quote_ident(string)。 
 
#### 关于审计 
PL/Python存储过程支持审计功能。具体设置可以参考审计。 
 
#### 关于并发执行 
当前PL/Python存储过程对并发执行不友好，建议串行执行。 
 
 
#### 库内算法 
具体库内算法介绍和使用，可参考MADlib官方网站（MADlib文档）。 
 
 
#### 其他算法支持 
除了MADlib提供的算法外，openGauss又额外提供了以下三个算法。 
表 1 额外增加的模块列表 
 
 
  
   
    算法名称（中文）  
    算法名称（英文）  
   
  
  
   
   梯度提升树 
    gbdt  
   
   
    梯度提升  
    xgboost  
   
   
    时间序列预测的算法  
    facebook_prophet  
   
  
 
 
使用时，需要安装依赖的python库： 
 
  如果使用prophet算法：  
 ```java 
  pip install pystan
pip install holidays==0.9.8
pip install fbprophet==0.3.post2

  ``` 
   
  如果使用xgboost算法：  
 ```java 
  pip install xgboost
pip install scikit-learn

  ``` 
   
  gbdt不需要额外安装其他库。  
 
详细操作请参考最佳实践。 
 
 
### 四、最佳实践 
本章节介绍部分算法的使用，主要包含分类、回归、聚类、gbdt算法、xgboost算法和prohpet算法。 
首先需要创建一个数据库，并安装算法。 
 
 ```java 
  create database test1 dbcompatibility='B';
./madpack -s madlib -p opengauss -c opg@127.0.0.1:7651/test1 install

  ``` 
  
 
#### 分类算法 
以svm分类房价为例子： 
 
  数据集准备。  
 ```java 
  DROP TABLE IF EXISTS houses;
CREATE TABLE houses (id INT, tax INT, bedroom INT, bath FLOAT, price INT,  size INT, lot INT);
INSERT INTO houses VALUES
(1 ,  590 ,       2 ,    1 ,  50000 ,  770 , 22100),
(2 , 1050 ,       3 ,    2 ,  85000 , 1410 , 12000),
(3 ,   20 ,       3 ,    1 ,  22500 , 1060 ,  3500),
(4 ,  870 ,       2 ,    2 ,  90000 , 1300 , 17500),
(5 , 1320 ,       3 ,    2 , 133000 , 1500 , 30000),
(6 , 1350 ,       2 ,    1 ,  90500 ,  820 , 25700),
(7 , 2790 ,       3 ,  2.5 , 260000 , 2130 , 25000),
(8 ,  680 ,       2 ,    1 , 142500 , 1170 , 22000),
(9 , 1840 ,       3 ,    2 , 160000 , 1500 , 19000),
(10 , 3680 ,       4 ,    2 , 240000 , 2790 , 20000),
(11 , 1660 ,       3 ,    1 ,  87000 , 1030 , 17500),
(12 , 1620 ,       3 ,    2 , 118600 , 1250 , 20000),
(13 , 3100 ,       3 ,    2 , 140000 , 1760 , 38000),
(14 , 2070 ,       2 ,    3 , 148000 , 1550 , 14000),
(15 ,  650 ,       3 ,  1.5 ,  65000 , 1450 , 12000);

  ``` 
   
  模型训练。 训练前配置相应schema和兼容性参数：  
 ```java 
  SET search_path="$user",public,madlib;
SET behavior_compat_options = 'bind_procedure_searchpath';

  ``` 
  使用默认的参数进行训练，分类的条件为‘price < 100000’，SQL语句如下：  
 ```java 
  DROP TABLE IF EXISTS houses_svm, houses_svm_summary; 
SELECT madlib.svm_classification('public.houses','public.houses_svm','price < 100000','ARRAY[1, tax, bath, size]');

  ``` 
   
  查看模型。  
 ```java 
  \x on
SELECT * FROM houses_svm;
\x off

  ``` 
  结果如下：  
 ```java 
  -[ RECORD 1 ]------+-----------------------------------------------------------------
coef               | {.113989576847,-.00226133300602,-.0676303607996,.00179440841072}
loss               | .614496714256667
norm_of_gradient   | 108.171180769224
num_iterations     | 100
num_rows_processed | 15
num_rows_skipped   | 0
dep_var_mapping    | {f,t}

  ``` 
   
  进行预测。  
 ```java 
  DROP TABLE IF EXISTS houses_pred; 
SELECT madlib.svm_predict('public.houses_svm','public.houses','id','public.houses_pred');

  ``` 
  
   
    查看预测结果  
 ```java 
  SELECT *, price < 100000 AS actual FROM houses JOIN houses_pred USING (id) ORDER BY id;

  ``` 
  结果如下：  
 ```java 
   id | tax  | bedroom | bath | price  | size |  lot  | prediction | decision_function | actual
----+------+---------+------+--------+------+-------+------------+-------------------+--------
  1 |  590 |       2 |    1 |  50000 |  770 | 22100 | t          |      .09386721875 | t
  2 | 1050 |       3 |    2 |  85000 | 1410 | 12000 | t          |     .134445058042 | t
  3 |   20 |       3 |    1 |  22500 | 1060 |  3500 | t          |   1.9032054712902 | t
  4 |  870 |       2 |    2 |  90000 | 1300 | 17500 | t          |    .3441000739464 | t
  5 | 1320 |       3 |    2 | 133000 | 1500 | 30000 | f          |   -.3146180966186 | f
  6 | 1350 |       2 |    1 |  90500 |  820 | 25700 | f          |  -1.5350254452892 | t
  7 | 2790 |       3 |  2.5 | 260000 | 2130 | 25000 | f          |  -2.5421154971142 | f
  8 |  680 |       2 |    1 | 142500 | 1170 | 22000 | t          |    .6081106124962 | f
  9 | 1840 |       3 |    2 | 160000 | 1500 | 19000 | f          |   -1.490511259749 | f
 10 | 3680 |       4 |    2 | 240000 | 2790 | 20000 | f          |   -3.336577140997 | f
 11 | 1660 |       3 |    1 |  87000 | 1030 | 17500 | f          |  -1.8592129109042 | t
 12 | 1620 |       3 |    2 | 118600 | 1250 | 20000 | f          |  -1.4416201011046 | f
 13 | 3100 |       3 |    2 | 140000 | 1760 | 38000 | f          |   -3.873244660547 | f
 14 | 2070 |       2 |    3 | 148000 | 1550 | 14000 | f          |  -1.9885277913972 | f
 15 |  650 |       3 |  1.5 |  65000 | 1450 | 12000 | t          |   1.1445697772786 | t
(15 rows)

  ``` 
   
    查看误分率  
 ```java 
  SELECT COUNT(*) FROM houses_pred JOIN houses USING (id) WHERE houses_pred.prediction != (houses.price < 100000);

  ``` 
  结果如下：  
 ```java 
  count
-------
     3
(1 row)

  ``` 
   
   
  使用svm其他核进行训练。  
 ```java 
  DROP TABLE IF EXISTS houses_svm_gaussian, houses_svm_gaussian_summary, houses_svm_gaussian_random; 
SELECT madlib.svm_classification( 'public.houses','public.houses_svm_gaussian','price < 100000','ARRAY[1, tax, bath, size]','gaussian','n_components=10', '', 'init_stepsize=1, max_iter=200' );

  ``` 
  进行预测，并查看训练结果。  
 ```java 
  DROP TABLE IF EXISTS houses_pred_gaussian; 
SELECT madlib.svm_predict('public.houses_svm_gaussian','public.houses','id', 'public.houses_pred_gaussian');
SELECT COUNT(*) FROM houses_pred_gaussian JOIN houses USING (id) WHERE houses_pred_gaussian.prediction != (houses.price < 100000);

  ``` 
  结果如下。  
 ```java 
   count 
-------+    
0 
(1 row)

  ``` 
   
  其他参��� 除了指定不同的核方法外，还可以指定迭代次数，初始参数，比如init_stepsize, max_iter, class_weight等。  
 
 
 
#### 回归算法 
我们以线性回归预测波士顿房价为例： 
 
  数据集准备。 同svm的数据集，请参见1。  
  训练模型。  
 ```java 
  SET search_path="$user",public,madlib;
SET behavior_compat_options = 'bind_procedure_searchpath';
    
DROP TABLE IF EXISTS houses_linregr, houses_linregr_summary;
SELECT madlib.linregr_train( 'public.houses', 'public.houses_linregr',  'price', 'ARRAY[1, tax, bath, size]');

  ``` 
   
  查看模型内容。  
 ```java 
  \x ON
SELECT * FROM houses_linregr;
\x OFF

  ``` 
  返回结果如下。  
 ```java 
  -[ RECORD 1 ]------------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
coef                     | {-12849.4168959872,28.9613922651775,10181.6290712649,50.516894915353}
r2                       | .768577580597462
std_err                  | {33453.0344331377,15.8992104963991,19437.7710925915,32.9280231740856}
t_stats                  | {-.384103179688204,1.82156166004197,.523806408809163,1.53416118083608}
p_values                 | {.708223134615411,.0958005827189556,.610804093526516,.153235085548177}
condition_no             | 9002.50457069858
num_rows_processed       | 15
num_missing_rows_skipped | 0
variance_covariance      | {
    {1119105512.7847,217782.067878005,-283344228.394538,-616679.693190829},{217782.067878005,252.784894408806,-46373.1796964038,-369.864520095145},{-283344228.394538,-46373.1796964038,377826945.047986,-209088.217319699},{-616679.693190829,-369.864520095145,-209088.217319699,1084.25471015312}}

  ``` 
   
  预测，并对比结果。  
 ```java 
  SELECT houses.*,
    madlib.linregr_predict( m.coef, ARRAY[1,tax,bath,size]) as predict,
    price - madlib.linregr_predict( m.coef, ARRAY[1,tax,bath,size]) as residual
FROM public.houses, public.houses_linregr AS m 
ORDER BY id;

  ``` 
  返回结果如下。  
 ```java 
   id | tax  | bedroom | bath | price  | size |  lot  |     predict      |     residual
----+------+---------+------+--------+------+-------+------------------+-------------------
  1 |  590 |       2 |    1 |  50000 |  770 | 22100 | 53317.4426965543 | -3317.44269655428
  2 | 1050 |       3 |    2 |  85000 | 1410 | 12000 | 109152.124955627 | -24152.1249556268
  3 |   20 |       3 |    1 |  22500 | 1060 |  3500 | 51459.3486308555 | -28959.3486308555
  4 |  870 |       2 |    2 |  90000 | 1300 | 17500 |  98382.215907206 | -8382.21590720599
  5 | 1320 |       3 |    2 | 133000 | 1500 | 30000 | 121518.221409606 |  11481.7785903935
  6 | 1350 |       2 |    1 |  90500 |  820 | 25700 | 77853.9455638568 |  12646.0544361432
  7 | 2790 |       3 |  2.5 | 260000 | 2130 | 25000 | 201007.926371722 |  58992.0736282778
  8 |  680 |       2 |    1 | 142500 | 1170 | 22000 | 76130.7259665615 |  66369.2740334385
  9 | 1840 |       3 |    2 | 160000 | 1500 | 19000 | 136578.145387499 |  23421.8546125013
 10 | 3680 |       4 |    2 | 240000 | 2790 | 20000 | 255033.901596231 | -15033.9015962306
 11 | 1660 |       3 |    1 |  87000 | 1030 | 17500 | 97440.5250982859 | -10440.5250982859
 12 | 1620 |       3 |    2 | 118600 | 1250 | 20000 | 117577.415360321 |  1022.58463967856
 13 | 3100 |       3 |    2 | 140000 | 1760 | 38000 | 186203.892319614 | -46203.8923196141
 14 | 2070 |       2 |    3 | 148000 | 1550 | 14000 | 155946.739425522 | -7946.73942552213
 15 |  650 |       3 |  1.5 |  65000 | 1450 | 12000 | 94497.4293105374 | -29497.4293105374
(15 rows)

  ``` 
   
 
 
#### 聚类算法 
以kmeans为例： 
 
  准备数据。  
 ```java 
  DROP TABLE IF EXISTS km_sample; 
CREATE TABLE km_sample(pid int, points double precision[]); 
INSERT INTO km_sample VALUES 
(1,  '{14.23, 1.71, 2.43, 15.6, 127, 2.8, 3.0600, 0.2800, 2.29, 5.64, 1.04, 3.92, 1065}'), 
(2,  '{13.2, 1.78, 2.14, 11.2, 1, 2.65, 2.76, 0.26, 1.28, 4.38, 1.05, 3.49, 1050}'), 
(3,  '{13.16, 2.36,  2.67, 18.6, 101, 2.8,  3.24, 0.3, 2.81, 5.6799, 1.03, 3.17, 1185}'), 
(4,  '{14.37, 1.95, 2.5, 16.8, 113, 3.85, 3.49, 0.24, 2.18, 7.8, 0.86, 3.45, 1480}'), 
(5,  '{13.24, 2.59, 2.87, 21, 118, 2.8, 2.69, 0.39, 1.82, 4.32, 1.04, 2.93, 735}'), 
(6,  '{14.2, 1.76, 2.45, 15.2, 112, 3.27, 3.39, 0.34, 1.97, 6.75, 1.05, 2.85, 1450}'), 
(7,  '{14.39, 1.87, 2.45, 14.6, 96, 2.5, 2.52, 0.3, 1.98, 5.25, 1.02, 3.58, 1290}'), 
(8,  '{14.06, 2.15, 2.61, 17.6, 121, 2.6, 2.51, 0.31, 1.25, 5.05, 1.06, 3.58, 1295}'), 
(9,  '{14.83, 1.64, 2.17, 14, 97, 2.8, 2.98, 0.29, 1.98, 5.2, 1.08, 2.85, 1045}'), 
(10, '{13.86, 1.35, 2.27, 16, 98, 2.98, 3.15, 0.22, 1.8500, 7.2199, 1.01, 3.55, 1045}');

  ``` 
   
  运行kmeans算法。 使用kmeans++进行计算，距离函数使用欧几里得距离。  
 ```java 
  SET search_path="$user",public,madlib;
SET behavior_compat_options = 'bind_procedure_searchpath';
    
DROP TABLE IF EXISTS km_result; 
CREATE TABLE km_result AS SELECT * FROM madlib.kmeanspp( 'public.km_sample',   -- Table of source data                              
                                                         'points',      -- Column containing point co-ordinates                              
                                                         2,             -- Number of centroids to calculate                              
                                                         'madlib.squared_dist_norm2',   -- Distance function                              
                                                         'madlib.avg',  -- Aggregate function                              
                                                         20,            -- Number of iterations                             
                                                         0.001          -- Fraction of centroids reassigned to keep iterating
);

  ``` 
  kmeans执行完后，不会自动创建表保存内容，所以需要用户自行创建table。  
 ```java 
  \x on
 select * from km_result;
\x off

  ``` 
  返回结果如下。  
 ```java 
  -[ RECORD 1 ]----+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
centroids        | {
    {14.0333333333333,1.84111111111111,2.41,15.5111111111111,96.2222222222222,2.91666666666667,3.01111111111111,.282222222222222,1.95444444444444,5.88553333333333,1.02222222222222,3.38222222222222,1211.66666666667},{13.24,2.59,2.87,21,118,2.8,2.69,.39,1.82,4.32,1.04,2.93,735}}
cluster_variance | {257041.999707571,0}
objective_fn     | 257041.999707571
frac_reassigned  | 0
num_iterations   | 2

  ``` 
   
  应用聚类结果。 执行以下函数，计算每个节点的临近节点和相应距离。  
 ```java 
  DROP TABLE IF EXISTS km_points_silh; 
SELECT * FROM madlib.simple_silhouette_points('public.km_sample',          -- Input points table
                                              'public.km_points_silh',      -- Output table
                                              'pid',                 -- Point ID column in input table
                                              'points',              -- Points column in input table
                                              'public.km_result',           -- Centroids table
                                              'centroids',           -- Column in centroids table containing centroids
                                              'madlib.squared_dist_norm2'   -- Distance function
); 
SELECT * FROM km_points_silh ORDER BY pid;

  ``` 
  返回结果如下。  
 ```java 
   pid | centroid_id | neighbor_centroid_id |       silh
-----+-------------+----------------------+------------------
   1 |           0 |                    1 | .793983543638996
   2 |           0 |                    1 | .688301735667703
   3 |           0 |                    1 | .996324103148159
   4 |           0 |                    1 | .869765755931474
   5 |           1 |                    0 |                1
   6 |           0 |                    1 | .888416176253661
   7 |           0 |                    1 | .980107240092519
   8 |           0 |                    1 | .975880363039906
   9 |           0 |                    1 | .712384473959954
  10 |           0 |                    1 | .712198411442872
(10 rows)

  ``` 
   
 
 
#### gbdt算法 
gdbt的基学习器虽然是回归树，但算法本身支持分类和回归两种操作。以下将展示两种任务的具体实现。这里值得注意的一点是，本方法不支持标签列含有空值（NULL）的情况。 
分类任务： 
 
  准备数据。  
 ```java 
  DROPTABLEIFEXISTS dt_golf CASCADE;
DROPTABLEIFEXISTS train_output,train_output_summary;
CREATETABLE dt_golf (
    id integerNOTNULL,
"OUTLOOK"text,
    temperature double precision,
    humidity double precision,
"Cont_features"double precision[],
    cat_features text[],
    windy boolean,
    class integer
) ;
INSERTINTO dt_golf (id,"OUTLOOK",temperature,humidity,"Cont_features",cat_features, windy,class) VALUES
(1, 'sunny', 85, 85,ARRAY[85, 85], ARRAY['a', 'b'], false, 0),
(2, 'sunny', 80, 90, ARRAY[80, 90], ARRAY['a', 'b'], true, 0),
(3, 'overcast', 83, 78, ARRAY[83, 78], ARRAY['a', 'b'], false, 1),
(4, 'rain', 70, NULL, ARRAY[70, 96], ARRAY['a', 'b'], false, 1),
(5, 'rain', 68, 80, ARRAY[68, 80], ARRAY['a', 'b'], false, 1),
(6, 'rain', NULL, 70, ARRAY[65, 70], ARRAY['a', 'b'], true, 0),
(7, 'overcast', 64, 65, ARRAY[64, 65], ARRAY['c', 'b'], NULL , 1),
(8, 'sunny', 72, 95, ARRAY[72, 95], ARRAY['a', 'b'], false, 0),
(9, 'sunny', 69, 70, ARRAY[69, 70], ARRAY['a', 'b'], false, 1),
(10, 'rain', 75, 80, ARRAY[75, 80], ARRAY['a', 'b'], false, 1),
(11, 'sunny', 75, 70, ARRAY[75, 70], ARRAY['a', 'd'], true, 1),
(12, 'overcast', 72, 90, ARRAY[72, 90], ARRAY['c', 'b'], NULL, 1),
(13, 'overcast', 81, 75, ARRAY[81, 75], ARRAY['a', 'b'], false, 1),
(15, NULL, 81, 75, ARRAY[81, 75], ARRAY['a', 'b'], false, 1),
(16, 'overcast', NULL, 75, ARRAY[81, 75], ARRAY['a', 'd'], false,1),
(14, 'rain', 71, 80, ARRAY[71, 80], ARRAY['c', 'b'], true, 0);

  ``` 
   
  训练模型。  
 ```java 
  select madlib.gbdt_train('dt_golf',         -- source table
                  'train_output',    -- output model table
                  'id'  ,            -- id column
                  'class',           -- response
                  '"OUTLOOK", temperature',          -- features
                  NULL,        -- exclude columns
                  1,       --weight
                  10,                -- num of trees
                  NULL,                 -- num of random features
                  10,       -- max depth
                  1,        -- min split
                  1,        -- min bucket
                  8,        -- number of bins per continuous variable
                  'max_surrogates=0',
                  TRUE
);

  ``` 
  模型训练结束会生成两个表，其中一张表train_output中保存着gdbt中的回归树模型，内容包括对每一个基学习器的参数记录。  
 ```java 
         Column       |     Type      | Modifiers | Storage  | Stats target | Description
--------------------+---------------+-----------+----------+--------------+-------------
 iteration          | integer       |           | plain    |              |
 tree               | madlib.bytea8 |           | external |              |
 cat_levels_in_text | text[]        |           | extended |              |
 cat_n_levels       | integer[]     |           | extended |              |
 tree_depth         | integer       |           | plain    |              |

  ``` 
   
 ```java 
   iteration |  cat_levels_in_text   | cat_n_levels | tree_depth
-----------+-----------------------+--------------+------------
         0 | {sunny,rain,overcast} | {3}          |          4
         1 | {sunny,rain,overcast} | {3}          |          5
         2 | {sunny,rain,overcast} | {3}          |          6
         3 | {sunny,rain,overcast} | {3}          |          4
         4 | {sunny,rain,overcast} | {3}          |          5
         5 | {sunny,rain,overcast} | {3}          |          5
         6 | {sunny,rain,overcast} | {3}          |          5
         7 | {sunny,rain,overcast} | {3}          |          5
         8 | {sunny,rain,overcast} | {3}          |          4
         9 | {sunny,rain,overcast} | {3}          |          3
(10 rows)

  ``` 
  另一张表train_output_summary，内容是对gdbt训练的整体描述：  
 ```java 
  select * from train_output_summary;
 method | cat_features | con_features | source_table | model_table  | null_proxy | learning_rate | is_classification | predict_dt_prob | num_trees
--------+--------------+--------------+--------------+--------------+------------+---------------+-------------------+-----------------+-----------
 GBDT   | "OUTLOOK"    | temperature  | dt_golf      | train_output |            |           .01 | t                 | response        |        10
(1 row)

  ``` 
   
  预测。  
 ```java 
  select madlib.gbdt_predict('dt_golf2','train_output','test_output','id');

  ``` 
  查看预测结果  
 ```java 
  select test_output.id, test_prediction,class from test_output join dt_golf using (id);
id | test_prediction | class
----+-----------------+-------
  1 |             1.0 |     0
  2 |             1.0 |     0
  3 |             1.0 |     1
  4 |             1.0 |     1
  5 |             1.0 |     1
  6 |             1.0 |     0
  7 |             1.0 |     1
  8 |             0.0 |     0
  9 |             1.0 |     1
 10 |             1.0 |     1
 11 |             1.0 |     1
 12 |             1.0 |     1
 13 |             1.0 |     1
 15 |             0.0 |     1
 16 |             1.0 |     1
 14 |             0.0 |     0
(16 rows)

  ``` 
   
 
 
#### 回归任务 
 
  准备数据。  
 ```java 
  DROP TABLE IF EXISTS crime;
CREATE TABLE crime (
    id SERIAL NOT NULL,
    CrimeRat DOUBLE PRECISION,
    MaleTeen INTEGER,
    South SMALLINT,
    Educ DOUBLE PRECISION,
    Police60 INTEGER,
    Police59 INTEGER,
    Labor INTEGER,
    Males INTEGER,
    Pop   INTEGER,
    NonWhite INTEGER,
    Unemp1  INTEGER,
    Unemp2  INTEGER,
    Median  INTEGER,
    BelowMed INTEGER
);
    
INSERT INTO crime(
    CrimeRat, MaleTeen, South, Educ, Police60, Police59, Labor, Males, Pop,
    NonWhite, Unemp1, Unemp2, Median, BelowMed
) VALUES
(79.1, 151, 1, 9.1, 58, 56, 510, 950, 33, 301, 108, 41, 394, 261),
(163.5, 143, 0, 11.3, 103, 95, 583, 1012, 13, 102, 96, 36, 557, 194),
(57.8, 142, 1, 8.9, 45, 44, 533, 969, 18, 219, 94, 33, 318, 250),
(196.9, 136, 0, 12.1, 149, 141, 577, 994, 157, 80, 102, 39, 673, 167),
(123.4, 141, 0, 12.1, 109, 101, 591, 985, 18, 30, 91, 20, 578, 174),
(68.2, 121, 0, 11.0, 118, 115, 547, 964, 25, 44, 84, 29, 689, 126),
(96.3, 127, 1, 11.1, 82, 79, 519, 982, 4, 139, 97, 38, 620, 168),
(155.5, 131, 1, 10.9, 115, 109, 542, 969, 50, 179, 79, 35, 472, 206),
(85.6, 157, 1, 9.0, 65, 62, 553, 955, 39, 286, 81, 28, 421, 239),
(70.5, 140, 0, 11.8, 71, 68, 632, 1029, 7, 15, 100, 24, 526, 174),
(167.4, 124, 0, 10.5, 121, 116, 580, 966, 101, 106, 77, 35, 657, 170),
(84.9, 134, 0, 10.8, 75, 71, 595, 972, 47, 59, 83, 31, 580, 172),
(51.1, 128, 0, 11.3, 67, 60, 624, 972, 28, 10, 77, 25, 507, 206),
(66.4, 135, 0, 11.7, 62, 61, 595, 986, 22, 46, 77, 27, 529, 190),
(79.8, 152, 1, 8.7, 57, 53, 530, 986, 30, 72, 92, 43, 405, 264),
(94.6, 142, 1, 8.8, 81, 77, 497, 956, 33, 321, 116, 47, 427, 247),
(53.9, 143, 0, 11.0, 66, 63, 537, 977, 10, 6, 114, 35, 487, 166),
(92.9, 135, 1, 10.4, 123, 115, 537, 978, 31, 170, 89, 34, 631, 165),
(75.0, 130, 0, 11.6, 128, 128, 536, 934, 51, 24, 78, 34, 627, 135),
(122.5, 125, 0, 10.8, 113, 105, 567, 985, 78, 94, 130, 58, 626, 166),
(74.2, 126, 0, 10.8, 74, 67, 602, 984, 34, 12, 102, 33, 557, 195),
(43.9, 157, 1, 8.9, 47, 44, 512, 962, 22, 423, 97, 34, 288, 276),
(121.6, 132, 0, 9.6, 87, 83, 564, 953, 43, 92, 83, 32, 513, 227),
(96.8, 131, 0, 11.6, 78, 73, 574, 1038, 7, 36, 142, 42, 540, 176),
(52.3, 130, 0, 11.6, 63, 57, 641, 984, 14, 26, 70, 21, 486, 196),
(199.3, 131, 0, 12.1, 160, 143, 631, 1071, 3, 77, 102, 41, 674, 152),
(34.2, 135, 0, 10.9, 69, 71, 540, 965, 6, 4, 80, 22, 564, 139),
(121.6, 152, 0, 11.2, 82, 76, 571, 1018, 10, 79, 103, 28, 537, 215),
(104.3, 119, 0, 10.7, 166, 157, 521, 938, 168, 89, 92, 36, 637, 154),
(69.6, 166, 1, 8.9, 58, 54, 521, 973, 46, 254, 72, 26, 396, 237),
(37.3, 140, 0, 9.3, 55, 54, 535, 1045, 6, 20, 135, 40, 453, 200),
(75.4, 125, 0, 10.9, 90, 81, 586, 964, 97, 82, 105, 43, 617, 163),
(107.2, 147, 1, 10.4, 63, 64, 560, 972, 23, 95, 76, 24, 462, 233),
(92.3, 126, 0, 11.8, 97, 97, 542, 990, 18, 21, 102, 35, 589, 166),
(65.3, 123, 0, 10.2, 97, 87, 526, 948, 113, 76, 124, 50, 572, 158),
(127.2, 150, 0, 10.0, 109, 98, 531, 964, 9, 24, 87, 38, 559, 153),
(83.1, 177, 1, 8.7, 58, 56, 638, 974, 24, 349, 76, 28, 382, 254),
(56.6, 133, 0, 10.4, 51, 47, 599, 1024, 7, 40, 99, 27, 425, 225),
(82.6, 149, 1, 8.8, 61, 54, 515, 953, 36, 165, 86, 35, 395, 251),
(115.1, 145, 1, 10.4, 82, 74, 560, 981, 96, 126, 88, 31, 488, 228),
(88.0, 148, 0, 12.2, 72, 66, 601, 998, 9, 19, 84, 20, 590, 144),
(54.2, 141, 0, 10.9, 56, 54, 523, 968, 4, 2, 107, 37, 489, 170),
(82.3, 162, 1, 9.9, 75, 70, 522, 996, 40, 208, 73, 27, 496, 224),
(103.0, 136, 0, 12.1, 95, 96, 574, 1012, 29, 36, 111, 37, 622, 162),
(45.5, 139, 1, 8.8, 46, 41, 480, 968, 19, 49, 135, 53, 457, 249),
(50.8, 126, 0, 10.4, 106, 97, 599, 989, 40, 24, 78, 25, 593, 171),
(84.9, 130, 0, 12.1, 90, 91, 623, 1049, 3, 22, 113, 40, 588, 160);

  ``` 
   
  训练模型。  
 ```java 
  select madlib.gbdt_train('crime',         -- source table
                  'train_output',    -- output model table
                  'id'  ,            -- id column
                  'CrimeRat',           -- response
                 '*',          -- features
                  NULL,        -- exclude columns
                  1,       --weight
                  20,                -- num of trees
                  4,                 -- num of random features
                  10,       -- max depth
                  1,        -- min split
                  1,        -- min bucket
                  8,        -- number of bins per continuous variable
                  'max_surrogates=0',
                  FALSE
);

  ``` 
  当is_clasification设为FALSE时，模型为回归任务。默认状态下gbdt提供回归计算支持。方法生成两个表，其中一张表记录每棵树的集体信息和模型的二进制，一张表记录方法的参数信息。  
  预测。  
 ```java 
  select madlib.gbdt_predict('crime','train_output','test_output','id');

  ``` 
  查看预测结果：  
 ```java 
  select test_output.id, test_prediction,CrimeRat  from test_output join crime using (id);
    
 id |  test_prediction   | crimerat
----+--------------------+----------
  1 |               79.1 |     79.1
  2 |              163.5 |    163.5
  3 |               57.8 |     57.8
  4 |              196.9 |    196.9
  5 |              123.4 |    123.4
  6 |               68.2 |     68.2
  7 |   96.2999999992251 |     96.3
  8 | 155.49842087765936 |    155.5
  9 |              84.35 |     85.6
 10 |  70.50157912234037 |     70.5
 11 |  167.4000000007749 |    167.4
 12 |               84.9 |     84.9
 13 |               51.1 |     51.1
 14 |               66.4 |     66.4
 15 |               79.8 |     79.8
 16 |               94.6 |     94.6
 17 |               53.9 |     53.9
 18 |               92.9 |     92.9
 19 |               75.0 |       75
 20 |              122.5 |    122.5
 21 |               74.2 |     74.2
 22 |               43.9 |     43.9
 23 |              121.6 |    121.6
 24 |               96.8 |     96.8
 25 |               52.3 |     52.3
 26 |              199.3 |    199.3
 27 |               34.2 |     34.2
 28 |              121.6 |    121.6
 29 |              104.3 |    104.3
 30 |               69.6 |     69.6
 31 |               37.3 |     37.3
 32 |               75.4 |     75.4
 33 |              107.2 |    107.2
 34 |               92.3 |     92.3
 35 |   65.2999999992251 |     65.3
 36 | 127.19842087765963 |    127.2
 37 |  84.35000000002215 |     83.1
 38 |  56.60155638297881 |     56.6
 39 |  82.45000000075257 |     82.6
 40 | 115.10002273936168 |    115.1
 41 |               88.0 |       88
 42 |  54.19997726063828 |     54.2
 43 |  82.44999999999999 |     82.3
 44 | 103.00002273936173 |      103
 45 | 45.500000000000156 |     45.5
 46 |               50.8 |     50.8
 47 |               84.9 |     84.9
(47 rows)

  ``` 
   
 
 
#### xgboost算法 
新增的xgboost支持分类和回归两种操作。下面以分类iris花为例，展示xgboost算法。 
xgboost支持grid search方式，可以同时训练多组参数。 
 
  准备数据。  
 ```java 
  DROP TABLE IF EXISTS iris;
create table iris (id serial, a float, d float, c float, b float, label int);
    
INSERT into iris (a, b, c, d, label) values 
(5.1, 3.5, 1.4, 0.2, 0),(4.9, 3.0, 1.4, 0.2, 0),(4.7, 3.2, 1.3, 0.2, 0),(4.6, 3.1, 1.5, 0.2, 0),
(5.0, 3.6, 1.4, 0.2, 0),(5.4, 3.9, 1.7, 0.4, 0),(4.6, 3.4, 1.4, 0.3, 0),(5.0, 3.4, 1.5, 0.2, 0),
(4.4, 2.9, 1.4, 0.2, 0),(4.9, 3.1, 1.5, 0.1, 0),(5.4, 3.7, 1.5, 0.2, 0),(4.8, 3.4, 1.6, 0.2, 0),
(4.8, 3.0, 1.4, 0.1, 0),(4.3, 3.0, 1.1, 0.1, 0),(5.8, 4.0, 1.2, 0.2, 0),(5.7, 4.4, 1.5, 0.4, 0),
(5.4, 3.9, 1.3, 0.4, 0),(5.1, 3.5, 1.4, 0.3, 0),(5.7, 3.8, 1.7, 0.3, 0),(5.1, 3.8, 1.5, 0.3, 0),
(5.4, 3.4, 1.7, 0.2, 0),(5.1, 3.7, 1.5, 0.4, 0),(4.6, 3.6, 1.0, 0.2, 0),(5.1, 3.3, 1.7, 0.5, 0),
(4.8, 3.4, 1.9, 0.2, 0),(5.0, 3.0, 1.6, 0.2, 0),(5.0, 3.4, 1.6, 0.4, 0),(5.2, 3.5, 1.5, 0.2, 0),
(5.2, 3.4, 1.4, 0.2, 0),(4.7, 3.2, 1.6, 0.2, 0),(4.8, 3.1, 1.6, 0.2, 0),(5.4, 3.4, 1.5, 0.4, 0),
(5.2, 4.1, 1.5, 0.1, 0),(5.5, 4.2, 1.4, 0.2, 0),(4.9, 3.1, 1.5, 0.2, 0),(5.0, 3.2, 1.2, 0.2, 0),
(5.5, 3.5, 1.3, 0.2, 0),(4.9, 3.6, 1.4, 0.1, 0),(4.4, 3.0, 1.3, 0.2, 0),(5.1, 3.4, 1.5, 0.2, 0),
(5.0, 3.5, 1.3, 0.3, 0),(4.5, 2.3, 1.3, 0.3, 0),(4.4, 3.2, 1.3, 0.2, 0),(5.0, 3.5, 1.6, 0.6, 0),
(5.1, 3.8, 1.9, 0.4, 0),(4.8, 3.0, 1.4, 0.3, 0),(5.1, 3.8, 1.6, 0.2, 0),(4.6, 3.2, 1.4, 0.2, 0),
(5.3, 3.7, 1.5, 0.2, 0),(5.0, 3.3, 1.4, 0.2, 0),(7.0, 3.2, 4.7, 1.4, 1),(6.4, 3.2, 4.5, 1.5, 1),
(6.9, 3.1, 4.9, 1.5, 1),(5.5, 2.3, 4.0, 1.3, 1),(6.5, 2.8, 4.6, 1.5, 1),(5.7, 2.8, 4.5, 1.3, 1),
(6.3, 3.3, 4.7, 1.6, 1),(4.9, 2.4, 3.3, 1.0, 1),(6.6, 2.9, 4.6, 1.3, 1),(5.2, 2.7, 3.9, 1.4, 1),
(5.0, 2.0, 3.5, 1.0, 1),(5.9, 3.0, 4.2, 1.5, 1),(6.0, 2.2, 4.0, 1.0, 1),(6.1, 2.9, 4.7, 1.4, 1),
(5.6, 2.9, 3.6, 1.3, 1),(6.7, 3.1, 4.4, 1.4, 1),(5.6, 3.0, 4.5, 1.5, 1),(5.8, 2.7, 4.1, 1.0, 1),
(6.2, 2.2, 4.5, 1.5, 1),(5.6, 2.5, 3.9, 1.1, 1),(5.9, 3.2, 4.8, 1.8, 1),(6.1, 2.8, 4.0, 1.3, 1),
(6.3, 2.5, 4.9, 1.5, 1),(6.1, 2.8, 4.7, 1.2, 1),(6.4, 2.9, 4.3, 1.3, 1),(6.6, 3.0, 4.4, 1.4, 1),
(6.8, 2.8, 4.8, 1.4, 1),(6.7, 3.0, 5.0, 1.7, 1),(6.0, 2.9, 4.5, 1.5, 1),(5.7, 2.6, 3.5, 1.0, 1),
(5.5, 2.4, 3.8, 1.1, 1),(5.5, 2.4, 3.7, 1.0, 1),(5.8, 2.7, 3.9, 1.2, 1),(6.0, 2.7, 5.1, 1.6, 1),
(5.4, 3.0, 4.5, 1.5, 1),(6.0, 3.4, 4.5, 1.6, 1),(6.7, 3.1, 4.7, 1.5, 1),(6.3, 2.3, 4.4, 1.3, 1),
(5.6, 3.0, 4.1, 1.3, 1),(5.5, 2.5, 4.0, 1.3, 1),(5.5, 2.6, 4.4, 1.2, 1),(6.1, 3.0, 4.6, 1.4, 1),
(5.8, 2.6, 4.0, 1.2, 1),(5.0, 2.3, 3.3, 1.0, 1),(5.6, 2.7, 4.2, 1.3, 1),(5.7, 3.0, 4.2, 1.2, 1),
(5.7, 2.9, 4.2, 1.3, 1),(6.2, 2.9, 4.3, 1.3, 1),(5.1, 2.5, 3.0, 1.1, 1),(5.7, 2.8, 4.1, 1.3, 1),
(6.3, 3.3, 6.0, 2.5, 2),(5.8, 2.7, 5.1, 1.9, 2),(7.1, 3.0, 5.9, 2.1, 2),(6.3, 2.9, 5.6, 1.8, 2),
(6.5, 3.0, 5.8, 2.2, 2),(7.6, 3.0, 6.6, 2.1, 2),(4.9, 2.5, 4.5, 1.7, 2),(7.3, 2.9, 6.3, 1.8, 2),
(6.7, 2.5, 5.8, 1.8, 2),(7.2, 3.6, 6.1, 2.5, 2),(6.5, 3.2, 5.1, 2.0, 2),(6.4, 2.7, 5.3, 1.9, 2),
(6.8, 3.0, 5.5, 2.1, 2),(5.7, 2.5, 5.0, 2.0, 2),(5.8, 2.8, 5.1, 2.4, 2),(6.4, 3.2, 5.3, 2.3, 2),
(6.5, 3.0, 5.5, 1.8, 2),(7.7, 3.8, 6.7, 2.2, 2),(7.7, 2.6, 6.9, 2.3, 2),(6.0, 2.2, 5.0, 1.5, 2),
(6.9, 3.2, 5.7, 2.3, 2),(5.6, 2.8, 4.9, 2.0, 2),(7.7, 2.8, 6.7, 2.0, 2),(6.3, 2.7, 4.9, 1.8, 2),
(6.7, 3.3, 5.7, 2.1, 2),(7.2, 3.2, 6.0, 1.8, 2),(6.2, 2.8, 4.8, 1.8, 2),(6.1, 3.0, 4.9, 1.8, 2),
(6.4, 2.8, 5.6, 2.1, 2),(7.2, 3.0, 5.8, 1.6, 2),(7.4, 2.8, 6.1, 1.9, 2),(7.9, 3.8, 6.4, 2.0, 2),
(6.4, 2.8, 5.6, 2.2, 2),(6.3, 2.8, 5.1, 1.5, 2),(6.1, 2.6, 5.6, 1.4, 2),(7.7, 3.0, 6.1, 2.3, 2),
(6.3, 3.4, 5.6, 2.4, 2),(6.4, 3.1, 5.5, 1.8, 2),(6.0, 3.0, 4.8, 1.8, 2),(6.9, 3.1, 5.4, 2.1, 2),
(6.7, 3.1, 5.6, 2.4, 2),(6.9, 3.1, 5.1, 2.3, 2),(5.8, 2.7, 5.1, 1.9, 2),(6.8, 3.2, 5.9, 2.3, 2),
(6.7, 3.3, 5.7, 2.5, 2),(6.7, 3.0, 5.2, 2.3, 2),(6.3, 2.5, 5.0, 1.9, 2),(6.5, 3.0, 5.2, 2.0, 2),
(6.2, 3.4, 5.4, 2.3, 2),(5.9, 3.0, 5.1, 1.8, 2);

  ``` 
   
  执行分类训练操作。  
 ```java 
  SET search_path="$user",public,madlib;
SET behavior_compat_options = 'bind_procedure_searchpath';
select madlib.xgboost_sk_Classifier('public.iris', 'public.iris_model_xgbc', 'id', 'label', 'a,b,c,d', NULL, 
$${'booster': ['gbtree'], 'eta':   (0.1, 0.9), 'max_depth': (5,1), 'objective': ('multi:softmax',)}$$,   -- 训练参数组合，如果有多个参数，请用元组或者列表的方式传入
TRUE);                                  -- 是否评估模型，多分类评价为精确度和kappa值；二分类评价指标为precision, recall, fscore和support；回归评价指标为mae, mse, R2squared和rmse

  ``` 
  xgboost支持多组参数并行训练，比如用例中eta值为0.1和0.9，最大深度为5或者1。  
 ```java 
  select id, train_timestamp, source_table, y_type, metrics, features, params from iris_model_xgbc;

  ``` 
  查看模型结果如下。  
 ```java 
   id |        train_timestamp        | source_table | y_type  |          metrics           | features  |                                     params
----+-------------------------------+--------------+---------+----------------------------+-----------+---------------------------------------------------------------------------------
  1 | 2020-12-14 20:15:05.904184+08 | public.iris  | integer | {'acc': 1.0, 'kappa': 1.0} | {a,b,c,d} | ('objective = multi:softmax', 'eta = 0.1', 'max_depth = 5', 'booster = gbtree')
  2 | 2020-12-14 20:15:05.904184+08 | public.iris  | integer | {'acc': 1.0, 'kappa': 1.0} | {a,b,c,d} | ('objective = multi:softmax', 'eta = 0.1', 'max_depth = 1', 'booster = gbtree')
  3 | 2020-12-14 20:15:05.904184+08 | public.iris  | integer | {'acc': 1.0, 'kappa': 1.0} | {a,b,c,d} | ('objective = multi:softmax', 'eta = 0.9', 'max_depth = 5', 'booster = gbtree')
  4 | 2020-12-14 20:15:05.904184+08 | public.iris  | integer | {'acc': 1.0, 'kappa': 1.0} | {a,b,c,d} | ('objective = multi:softmax', 'eta = 0.9', 'max_depth = 1', 'booster = gbtree')
(4 rows)

  ``` 
  结果表中，记录着训练时间，特征，结果类型，所用参数等。 在本示例函数输入中，eta选择为2种，max_depth选择为2种，总共4种参数组合。所以在结果中，有4行结果；在metrics列中，记录4种参数组合的训练后的评价结果。用户可以输入多种参数组合，训练后，用户可以选择合适的模型留下。  
  预测结果。  
 ```java 
  select madlib.xgboost_sk_predict('public.iris', 'public.iris_model_xgbc', 'public.iris_xgbc_out', 'id');
select t1.id, prediction, label from iris as t1, iris_xgbc_out as t2 where t1.id = t2.id and prediction <> label;

  ``` 
  查看结果，预测和训练结果的对比，当前不匹配的行数为0，证明分类准确性较高。  
 ```java 
   id | prediction | label
----+------------+-------
(0 rows)

  ``` 
   
 
 
#### prophet算法 
新增facebook的prophet时序预测算法。下面以时序数据为例，展示prophet算法使用。 
 
  准备数据。  
 ```java 
  DROP TABLE IF EXISTS ts_data;
CREATE TABLE ts_data(date date, value float);
    
INSERT into ts_data (date, value) values 
('2016-11-29 21:20:00', 5.6),('2016-11-29 21:30:00', 5.2),('2016-11-29 21:40:00', 5.3),('2016-11-29 21:50:00', 5.3),
('2016-11-29 22:00:00', 5.1),('2016-11-29 22:10:00', 5.8),('2016-11-29 22:20:00', 5.6),('2016-11-29 22:30:00', 5.4),
('2016-11-29 22:40:00', 5.4),('2016-11-29 22:50:00', 5.1),('2016-11-29 23:00:00', 5.2),('2016-11-29 23:10:00', 5.9),
('2016-11-29 23:20:00', 5.9),('2016-11-29 23:30:00', 5.1),('2016-11-29 23:40:00', 5.8),('2016-11-29 23:50:00', 6.0),
('2016-11-30 00:00:00', 5.9),('2016-11-30 00:10:00', 5.3),('2016-11-30 00:20:00', 5.4),('2016-11-30 00:30:00', 5.1),
('2016-11-30 00:40:00', 5.6),('2016-11-30 00:50:00', 5.7),('2016-11-30 01:00:00', 5.8),('2016-11-30 01:10:00', 5.4),
('2016-11-30 01:20:00', 5.8),('2016-11-30 01:30:00', 5.1),('2016-11-30 01:40:00', 5.6),('2016-11-30 01:50:00', 5.6),
('2016-11-30 02:00:00', 5.6),('2016-11-30 02:10:00', 5.9),('2016-11-30 02:20:00', 5.7),('2016-11-30 02:30:00', 5.4),
('2016-11-30 02:40:00', 5.6),('2016-11-30 02:50:00', 5.4),('2016-11-30 03:00:00', 5.1),('2016-11-30 03:10:00', 5.0),
('2016-11-30 03:20:00', 5.9),('2016-11-30 03:30:00', 5.8),('2016-11-30 03:40:00', 5.4),('2016-11-30 03:50:00', 5.7),
('2016-11-30 04:00:00', 5.6),('2016-11-30 04:10:00', 5.9),('2016-11-30 04:20:00', 5.1),('2016-11-30 04:30:00', 5.8),
('2016-11-30 04:40:00', 5.5),('2016-11-30 04:50:00', 5.1),('2016-11-30 05:00:00', 5.8),('2016-11-30 05:10:00', 5.5),
('2016-11-30 05:20:00', 5.7),('2016-11-30 05:30:00', 5.2),('2016-11-30 05:40:00', 5.7),('2016-11-30 05:50:00', 6.0),
('2016-11-30 06:00:00', 5.8),('2016-11-30 06:10:00', 5.6),('2016-11-30 06:20:00', 5.2),('2016-11-30 06:30:00', 5.8),
('2016-11-30 06:40:00', 5.3),('2016-11-30 06:50:00', 5.4),('2016-11-30 07:00:00', 5.8),('2016-11-30 07:10:00', 5.2),
('2016-11-30 07:20:00', 5.3),('2016-11-30 07:30:00', 5.3),('2016-11-30 07:40:00', 5.8),('2016-11-30 07:50:00', 5.9),
('2016-11-30 08:00:00', 5.6),('2016-11-30 08:10:00', 5.2),('2016-11-30 08:20:00', 5.4),('2016-11-30 08:30:00', 5.6),
('2016-11-30 08:40:00', 6.0),('2016-11-30 08:50:00', 5.4),('2016-11-30 09:00:00', 6.0),('2016-11-30 09:10:00', 5.1),
('2016-11-30 09:20:00', 5.1),('2016-11-30 09:30:00', 5.5),('2016-11-30 09:40:00', 5.6),('2016-11-30 09:50:00', 5.0),
('2016-11-30 10:00:00', 5.1),('2016-11-30 10:10:00', 5.7),('2016-11-30 10:20:00', 5.4),('2016-11-30 10:30:00', 5.4),
('2016-11-30 10:40:00', 5.7),('2016-11-30 10:50:00', 5.2),('2016-11-30 11:00:00', 5.4),('2016-11-30 11:10:00', 5.3),
('2016-11-30 11:20:00', 5.6),('2016-11-30 11:30:00', 5.0),('2016-11-30 11:40:00', 5.2),('2016-11-30 11:50:00', 5.2),
('2016-11-30 12:00:00', 5.5),('2016-11-30 12:10:00', 5.1),('2016-11-30 12:20:00', 5.7),('2016-11-30 12:30:00', 5.4),
('2016-11-30 12:40:00', 5.2),('2016-11-30 12:50:00', 5.5),('2016-11-30 13:00:00', 5.0),('2016-11-30 13:10:00', 5.5),
('2016-11-30 13:20:00', 5.6),('2016-11-30 13:30:00', 5.3),('2016-11-30 13:40:00', 5.5),('2016-11-30 13:50:00', 5.9),
('2016-11-30 14:00:00', 10.9),('2016-11-30 14:10:00', 10.6),('2016-11-30 14:20:00', 10.3),('2016-11-30 14:30:00', 11.0),
('2016-11-30 14:40:00', 10.0),('2016-11-30 14:50:00', 10.1),('2016-11-30 15:00:00', 10.2),('2016-11-30 15:10:00', 10.2),
('2016-11-30 15:20:00', 10.3),('2016-11-30 15:30:00', 10.1),('2016-11-30 15:40:00', 10.9),('2016-11-30 15:50:00', 10.1),
('2016-11-30 16:00:00', 11.0),('2016-11-30 16:10:00', 10.2),('2016-11-30 16:20:00', 10.7),('2016-11-30 16:30:00', 10.2),
('2016-11-30 16:40:00', 10.2),('2016-11-30 16:50:00', 10.2),('2016-11-30 17:00:00', 10.8),('2016-11-30 17:10:00', 10.6),
('2016-11-30 17:20:00', 10.5),('2016-11-30 17:30:00', 10.7),('2016-11-30 17:40:00', 10.9),('2016-11-30 17:50:00', 10.9),
('2016-11-30 18:00:00', 10.1),('2016-11-30 18:10:00', 10.3),('2016-11-30 18:20:00', 10.1),('2016-11-30 18:30:00', 10.6),
('2016-11-30 18:40:00', 10.3),('2016-11-30 18:50:00', 10.8),('2016-11-30 19:00:00', 10.9),('2016-11-30 19:10:00', 10.8),
('2016-11-30 19:20:00', 10.6),('2016-11-30 19:30:00', 11.0),('2016-11-30 19:40:00', 10.3),('2016-11-30 19:50:00', 10.9),
('2016-11-30 20:00:00', 10.6),('2016-11-30 20:10:00', 10.6),('2016-11-30 20:20:00', 10.5),('2016-11-30 20:30:00', 10.4),
('2016-11-30 20:40:00', 10.9),('2016-11-30 20:50:00', 10.9),('2016-11-30 21:00:00', 10.7),('2016-11-30 21:10:00', 10.6),
('2016-11-30 21:20:00', 10.5),('2016-11-30 21:30:00', 10.8),('2016-11-30 21:40:00', 10.4),('2016-11-30 21:50:00', 10.0),
('2016-11-30 22:00:00', 10.6),('2016-11-30 22:10:00', 10.6),('2016-11-30 22:20:00', 10.6),('2016-11-30 22:30:00', 10.1),
('2016-11-30 22:40:00', 10.4),('2016-11-30 22:50:00', 10.8),('2016-11-30 23:00:00', 10.4),('2016-11-30 23:10:00', 10.6),
('2016-11-30 23:20:00', 10.1),('2016-11-30 23:30:00', 10.2),('2016-11-30 23:40:00', 10.6),('2016-11-30 23:50:00', 10.8),
('2016-12-01 00:00:00', 10.6),('2016-12-01 00:10:00', 10.2),('2016-12-01 00:20:00', 10.9),('2016-12-01 00:30:00', 10.3),
('2016-12-01 00:40:00', 10.3),('2016-12-01 00:50:00', 10.1),('2016-12-01 01:00:00', 10.7),('2016-12-01 01:10:00', 10.5),
('2016-12-01 01:20:00', 10.4),('2016-12-01 01:30:00', 10.7),('2016-12-01 01:40:00', 10.5),('2016-12-01 01:50:00', 10.7),
('2016-12-01 02:00:00', 10.8),('2016-12-01 02:10:00', 10.9),('2016-12-01 02:20:00', 10.9),('2016-12-01 02:30:00', 10.1),
('2016-12-01 02:40:00', 10.4),('2016-12-01 02:50:00', 10.7),('2016-12-01 03:00:00', 10.7),('2016-12-01 03:10:00', 10.5),
('2016-12-01 03:20:00', 10.2),('2016-12-01 03:30:00', 10.2),('2016-12-01 03:40:00', 10.8),('2016-12-01 03:50:00', 10.2),
('2016-12-01 04:00:00', 10.9),('2016-12-01 04:10:00', 10.4),('2016-12-01 04:20:00', 10.6),('2016-12-01 04:30:00', 11.0),
('2016-12-01 04:40:00', 10.4),('2016-12-01 04:50:00', 10.3),('2016-12-01 05:00:00', 10.7),('2016-12-01 05:10:00', 10.6),
('2016-12-01 05:20:00', 10.9),('2016-12-01 05:30:00', 11.0),('2016-12-01 05:40:00', 10.9),('2016-12-01 05:50:00', 10.0),
('2016-12-01 06:00:00', 10.8),('2016-12-01 06:10:00', 10.0),('2016-12-01 06:20:00', 10.1),('2016-12-01 06:30:00', 10.5),
('2016-12-01 06:40:00', 15.5),('2016-12-01 06:50:00', 15.7),('2016-12-01 07:00:00', 15.1),('2016-12-01 07:10:00', 15.6),
('2016-12-01 07:20:00', 15.5),('2016-12-01 07:30:00', 15.4),('2016-12-01 07:40:00', 15.7),('2016-12-01 07:50:00', 15.6),
('2016-12-01 08:00:00', 15.3),('2016-12-01 08:10:00', 15.6),('2016-12-01 08:20:00', 15.1),('2016-12-01 08:30:00', 15.6),
('2016-12-01 08:40:00', 15.9),('2016-12-01 08:50:00', 16.0),('2016-12-01 09:00:00', 15.4),('2016-12-01 09:10:00', 15.0),
('2016-12-01 09:20:00', 15.0),('2016-12-01 09:30:00', 15.4),('2016-12-01 09:40:00', 15.9),('2016-12-01 09:50:00', 15.6),
('2016-12-01 10:00:00', 15.7),('2016-12-01 10:10:00', 15.4),('2016-12-01 10:20:00', 15.2),('2016-12-01 10:30:00', 15.2),
('2016-12-01 10:40:00', 15.8),('2016-12-01 10:50:00', 15.4),('2016-12-01 11:00:00', 16.0),('2016-12-01 11:10:00', 15.9),
('2016-12-01 11:20:00', 15.1),('2016-12-01 11:30:00', 15.0),('2016-12-01 11:40:00', 15.0),('2016-12-01 11:50:00', 15.4),
('2016-12-01 12:00:00', 15.5),('2016-12-01 12:10:00', 15.3),('2016-12-01 12:20:00', 16.0),('2016-12-01 12:30:00', 15.1),
('2016-12-01 12:40:00', 15.5),('2016-12-01 12:50:00', 16.0),('2016-12-01 13:00:00', 15.7),('2016-12-01 13:10:00', 15.9),
('2016-12-01 13:20:00', 15.4),('2016-12-01 13:30:00', 15.3),('2016-12-01 13:40:00', 15.9),('2016-12-01 13:50:00', 15.8),
('2016-12-01 14:00:00', 15.4),('2016-12-01 14:10:00', 15.9),('2016-12-01 14:20:00', 15.3),('2016-12-01 14:30:00', 16.0),
('2016-12-01 14:40:00', 15.5),('2016-12-01 14:50:00', 15.0),('2016-12-01 15:00:00', 15.1),('2016-12-01 15:10:00', 16.0),
('2016-12-01 15:20:00', 15.8),('2016-12-01 15:30:00', 15.9),('2016-12-01 15:40:00', 15.4),('2016-12-01 15:50:00', 15.1),
('2016-12-01 16:00:00', 15.8),('2016-12-01 16:10:00', 15.2),('2016-12-01 16:20:00', 15.4),('2016-12-01 16:30:00', 15.8),
('2016-12-01 16:40:00', 15.8),('2016-12-01 16:50:00', 15.1),('2016-12-01 17:00:00', 15.3),('2016-12-01 17:10:00', 15.6),
('2016-12-01 17:20:00', 15.3),('2016-12-01 17:30:00', 15.8),('2016-12-01 17:40:00', 15.0),('2016-12-01 17:50:00', 15.3),
('2016-12-01 18:00:00', 15.5),('2016-12-01 18:10:00', 15.4),('2016-12-01 18:20:00', 15.3),('2016-12-01 18:30:00', 15.8),
('2016-12-01 18:40:00', 15.2),('2016-12-01 18:50:00', 15.9),('2016-12-01 19:00:00', 15.4),('2016-12-01 19:10:00', 15.3),
('2016-12-01 19:20:00', 15.1),('2016-12-01 19:30:00', 15.3),('2016-12-01 19:40:00', 15.9),('2016-12-01 19:50:00', 15.3),
('2016-12-01 20:00:00', 15.3),('2016-12-01 20:10:00', 15.2),('2016-12-01 20:20:00', 15.0),('2016-12-01 20:30:00', 15.3),
('2016-12-01 20:40:00', 15.1),('2016-12-01 20:50:00', 15.1),('2016-12-01 21:00:00', 15.6),('2016-12-01 21:10:00', 15.8),
('2016-12-01 21:20:00', 15.4),('2016-12-01 21:30:00', 15.2),('2016-12-01 21:40:00', 16.0),('2016-12-01 21:50:00', 15.5),
('2016-12-01 22:00:00', 15.4),('2016-12-01 22:10:00', 15.7),('2016-12-01 22:20:00', 15.3),('2016-12-01 22:30:00', 15.9),
('2016-12-01 22:40:00', 15.9),('2016-12-01 22:50:00', 15.2),('2016-12-01 23:00:00', 15.8),('2016-12-01 23:10:00', 15.9),
('2016-12-01 23:20:00', 20.9),('2016-12-01 23:30:00', 20.4),('2016-12-01 23:40:00', 20.3),('2016-12-01 23:50:00', 20.1),
('2016-12-02 00:00:00', 20.7),('2016-12-02 00:10:00', 20.7),('2016-12-02 00:20:00', 20.5),('2016-12-02 00:30:00', 20.4),
('2016-12-02 00:40:00', 20.4),('2016-12-02 00:50:00', 20.1),('2016-12-02 01:00:00', 20.2),('2016-12-02 01:10:00', 20.9),
('2016-12-02 01:20:00', 20.6),('2016-12-02 01:30:00', 20.0),('2016-12-02 01:40:00', 20.4),('2016-12-02 01:50:00', 20.2),
('2016-12-02 02:00:00', 20.6),('2016-12-02 02:10:00', 20.4),('2016-12-02 02:20:00', 20.5),('2016-12-02 02:30:00', 20.4),
('2016-12-02 02:40:00', 20.5),('2016-12-02 02:50:00', 20.7),('2016-12-02 03:00:00', 20.2),('2016-12-02 03:10:00', 20.2),
('2016-12-02 03:20:00', 20.1),('2016-12-02 03:30:00', 20.5),('2016-12-02 03:40:00', 20.5),('2016-12-02 03:50:00', 20.0),
('2016-12-02 04:00:00', 20.7),('2016-12-02 04:10:00', 20.8),('2016-12-02 04:20:00', 20.6),('2016-12-02 04:30:00', 20.4),
('2016-12-02 04:40:00', 20.5),('2016-12-02 04:50:00', 20.8),('2016-12-02 05:00:00', 20.1),('2016-12-02 05:10:00', 20.9),
('2016-12-02 05:20:00', 20.5),('2016-12-02 05:30:00', 20.4),('2016-12-02 05:40:00', 20.2),('2016-12-02 05:50:00', 20.4),
('2016-12-02 06:00:00', 20.8),('2016-12-02 06:10:00', 20.7),('2016-12-02 06:20:00', 20.9),('2016-12-02 06:30:00', 20.1),
('2016-12-02 06:40:00', 20.3),('2016-12-02 06:50:00', 20.2),('2016-12-02 07:00:00', 20.4),('2016-12-02 07:10:00', 20.7),
('2016-12-02 07:20:00', 20.4),('2016-12-02 07:30:00', 20.8),('2016-12-02 07:40:00', 20.8),('2016-12-02 07:50:00', 20.1),
('2016-12-02 08:00:00', 20.3),('2016-12-02 08:10:00', 20.7),('2016-12-02 08:20:00', 20.9),('2016-12-02 08:30:00', 21.0),
('2016-12-02 08:40:00', 20.2),('2016-12-02 08:50:00', 20.5),('2016-12-02 09:00:00', 20.2),('2016-12-02 09:10:00', 20.8),
('2016-12-02 09:20:00', 20.9),('2016-12-02 09:30:00', 20.5),('2016-12-02 09:40:00', 20.9),('2016-12-02 09:50:00', 20.7),
('2016-12-02 10:00:00', 20.3),('2016-12-02 10:10:00', 21.0),('2016-12-02 10:20:00', 20.5),('2016-12-02 10:30:00', 20.3),
('2016-12-02 10:40:00', 20.2),('2016-12-02 10:50:00', 20.3),('2016-12-02 11:00:00', 20.4),('2016-12-02 11:10:00', 20.4),
('2016-12-02 11:20:00', 21.0),('2016-12-02 11:30:00', 20.3),('2016-12-02 11:40:00', 20.3),('2016-12-02 11:50:00', 20.9),
('2016-12-02 12:00:00', 20.8),('2016-12-02 12:10:00', 20.9),('2016-12-02 12:20:00', 20.7),('2016-12-02 12:30:00', 20.7);

  ``` 
   
  执行训练操作：  
 ```java 
  SET search_path="$user",public,madlib;
SET behavior_compat_options = 'bind_procedure_searchpath';
select madlib.prophet_fit('public.ts_data', 'public.prophet_model', 
$${'ds': 'date', 'y': 'value'}$$, -- 列名映射， prophet要求时间列名必须为'ds'， 时序值列名'y'
$${'growth': 'linear', 'changepoints': ['2016-11-30 05:40:00']}$$ -- 训练参数组合，如果有多个参数，请用元组方式传入
);
  ``` 
  查询模型表：  
 ```java 
   select id, y_type, params from public.prophet_model;
    
 id |      y_type      |                            params
----+------------------+---------------------------------------------------------------
  1 | double precision | {'changepoints': ['2016-11-30 05:40:00'], 'growth': 'linear'}

  ``` 
  在模型表中，记录着训练时间，结果类型，所用参数等。  
  执行预测操作  
 ```java 
  select madlib.prophet_predict('public.prophet_model','public.prophet_output', 10, '10T');

  ``` 
  查看预测结果：  
 ```java 
  select ds, yhat, yhat_lower, yhat_upper from public.prophet_output;
    
     ds     |     yhat      |  yhat_lower   |  yhat_upper
------------+---------------+---------------+---------------
 2016-12-02 | 20.6943848045 | 17.7671496048 | 23.4160694837
 2016-12-02 | 20.7408355633 | 17.9264413164 | 23.6426403933
 2016-12-02 | 20.7872863221 | 17.9298207895 | 23.4548814727
 2016-12-02 |  20.833737081 |  18.234443228 | 23.5317342873
 2016-12-02 | 20.8801878398 | 18.2471709649 | 23.8345735574
 2016-12-02 | 20.9266385986 | 18.1780101465 |  23.696087927
 2016-12-02 | 20.9730893575 | 18.4292088648 | 23.7209823631
 2016-12-02 | 21.0195401163 | 18.2623494126 | 23.7341427068
 2016-12-02 | 21.0659908751 | 18.1173966769 | 23.7919478206
 2016-12-02 |  21.112441634 | 18.5018042056 | 23.9508963879
(10 rows)
  ``` 
     
 
 
### 五、常见问题处理 
 
  问题描述：编译数据库时，提示python模块，“can not be used when making a shared object；recompile with -fPIC”或者 “libpython22.7.a: could not read symbols: Bad value”。 处理方式： 
   
   请检查python版本和环境变量。 
   查看是否安装python-devel，或者编译python时，是否启用了–enable-shared。 
   
  问题描述：执行gdb或者gstack命令，报错 “gdb: symbol lookup error: gdb: undefined symbol: PyUnicodeUCS4_FromEncodedObject”。 处理方式：这个问题一般发生在自行编译python2的环境上，Python2在编译安装时可以通过参数 –enable-unicode=ucs2 或 –enable-unicode=ucs4分别指定使用2个字节或者4个字节表示一个unicode字符，python2缺省使用–enable-unicode=ucs2。Python3默认使用4个字节表示一个unicode字符。 可以在系统中自带的python2下执行：“import sys；print sys.maxunicode”并查看结果，如果结果是65535，说明系统默认的是ucs2；如果结果是1114111，说明用的ucs4编码。 自行编译python2时，如果系统中内置的python2使用的ucs4，系统中的gdb也会依赖ucs4。因此自行编译的python2在configure时，需要添加–enable-unicode=ucs4。  
  问题描述：在kmeans等算法里，报错“Data table does not exist”。 处理方式：算法所在的schema和输入表不在一个schema下，可以设置SET behavior_compat_options = 'bind_procedure_searchpath';解决这个问题。  
  问题描述：python启动报错，或者import报错。 处理方式： 
   
   检查环境变量比如PYTHONHOME，PYTHONPATH。 
   安装必备依赖包。 
   
  问题描述：Regression等算法报错“ERROR: spiexceptions.UndefinedFunction: operator does not exist: json ->> unknown.”。 处理方式：数据库不支持json导出功能，不支持此功能。  
  问题描述：MADlib中进行编译时，如果使用make -sj，会遇到boost相关的报错。例如，“fatal error: boost/mpl/if.hpp: No such file or directory”。 处理方式：非问题，MADlib编译时，会先解压这几个安装包。如果是并行编译，会出现一边编译，一边解压的情况。如果编译用到这个文件，另一边还没有解压完成，会出现这类报错。再次执行make -sj即可解决。  
  问题描述：执行./madpack 安装时，遇到报错：“ERROR : Failed to connect to database”。 处理方式：需要排查数据库是否启动，目标库是否存在，数据库端口是否被占用，安装用户是否具有管理员权限。另外执行madpack安装时，IP请使用127.0.0.1，不要使用localhost，否则也会出现连接失败的情况。  
 
今天的分享就到这里了，感谢小伙伴的阅读，让我们一起探索数据库前沿知识。
                                        