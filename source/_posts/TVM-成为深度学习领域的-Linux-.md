---
title: 推荐系列-TVM-成为深度学习领域的-Linux-
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 123
cover_picture: 'https://oscimg.oschina.net/oscnet/c7d6b63b-c315-4583-aa66-fb9d3aca2d9d.png'
abbrlink: c1a96bce
date: 2022-02-01 11:53:15
---

&emsp;&emsp;｜wandb.ai 翻译｜刘志勇 如你所知���PyTorch、TensorFlow、OneFlow等深度学习框架关注的重心是在GPU等硬件上训练模型，但要想将训练的模型部署到手机、物联网设备以及专用加速器（FPGA、...
<!-- more -->

                                                                                                                    
  
   
  
  
    
  
  
  来源｜wandb.ai 
  
  
  翻译｜刘志勇 
   
  
  
    
  
  
  如你所知，PyTorch、TensorFlow、OneFlow等深度学习框架关注的重心是在GPU等硬件上训练模型，但要想将训练的模型部署到手机、物联网设备以及专用加速器（FPGA、ASIC）等不同平台，就需要TVM、XLA、TensorRT等深度学习编译器来解决。   
  
  
    
  
  
  作为目前业界炙手可热的编译器，TVM（Tensor Virtual Machine）于2017年8月由华盛顿大学的Luis Ceze、陈天奇等人开源，利用这一工具，机器学习算法可以被自动编译成可供下层硬件执行的机器语言，从而可以利用多种类型的算力。 
  
  
    
  
  
  TVM主要用于张量计算，提供独立于硬件底层的中间表示，采用各种方式（循环分块、缓存优化等）对相应的计算进行优化。第一代TVM的设计借鉴了传统编译器框架LLVM的设计思路，设计抽象出中间表示层，不同的模型只需要开发相应的前端接口，不同的硬件只需要开发相应的后端。  
  
  
    
  
  
  2019年，华盛顿大学TVM团队成立创业公司OctoML，联合创始人包括华盛顿大学计算机科学教授Luis Ceze（CEO）、前英特尔首席工程师和 AI 负责人Jason Knight（CPO）、华盛顿大学博士陈天奇（CTO）等。他们致力于打造一个可扩展、开放、中立的端到端栈，用于深度学习模型的优化和部署，目标是减少企业为特定硬件开发和深度学习软件部署所花费的成本和时间。截止目前，该项目已在GitHub上获得7800个Star，OctoML累计融资超过1亿美元。 
  
  
    
  
  
   
  
  
  从左到右依次为Jason Knight、Luis Ceze、Josh Fromm、Jared Roesch、Tianqi Chen和Thierry Moreau 
  
  
    
  
  
  其中，担任OctoML CEO 的Luis Ceze此前曾创立Corensic，并于2012被F5 Networks 收购。此外，他还是麦德罗纳风险投资集团的兼职普通合伙人，且领导该公司的技术顾问委员会。 
  
  
    
  
  
  作为使机器学习在各种硬件系统上高效运行的专家，Luis的研究重点是计算机系统结构、编程语言、机器学习、分子生物学的交叉领域，在Lukas Biewald主持的机器学习节目Gradient Dissent上，他介绍了TVM编译器的发展路径、系统优化性能技术细节和模型部署的挑战，并分享了OctoML的创业思路。 
  
  
    
  
  
  以下为对话内容，OneFlow社区做了不改变原意的编译： 
  
  
   
  
  
  1 
  
  
 ####  
   
   TVM、OctoML和Octomizer 
   
  
    
  
  
  Lukas：OctoML是一个基于Apache TVM的创业公司，你是这个项目的作者，能为那些不了解这个领域的人做个介绍么？ 
  
  
    
  
  
  Luis： 
  我身兼两职，OctoML 的首席执行官和华盛顿大学计算机科学工程的教授。机器学习系统是什么意思？它意味着构建能够让机器学习应用快速、高效地运行的计算机系统，并以尽可能简单的方式实现目标。除了让计算机系统帮助机器学习，我们也经常使用机器学习来改进机器学习系统。 
  
  
    
  
  
  说到Apache TVM，TVM是张量虚拟机（Tensor Virtual Machine）的缩写。大约五年前，它始于我们在华盛顿大学的研究小组。 
  
  
    
  
  
  按照机器学习日新月异的发展速度来算，五年前就像是很久以前一样，已经有越来越多的机器学习模型受到人们关注。在模型集合越来越快的增长过程中，软件生态系统已经出现碎片化的迹象，如 TensorFlow、PyTorch、MXNet和Keras等。其次是硬件方面，那时候CPU占主导地位，GPU 才刚刚起步，当时还出现了另外一些加速器。 
  
  
    
  
  
  软件生态碎片化正在变得越来越严重。一个软件栈要么特定于希望部署模型的硬件；要么特定于像计算机视觉或自然语言处理等用例。我们希望创建一个简洁的抽象统一解决这些问题，希望用一个干净、统一的管理平台把所有的系��和硬件都清晰地抽象出来，以便能够部署模型，并最大限度地利用好目标硬件。这样数据科学家和机器学习工程师就不用再为模型部署而发愁，只须将精力集中在模型的统计特性上。 
  
  
    
  
  
  就像大家都知道的那样，机器学习代码对性能十分敏感，需要使用大量内存带宽，这意味着重度依赖内存和计算引擎之间搬运数据的能力，同时还需要大量的原始计算能力。这也是为何如今适用于机器学习的硬件看起来越来越像以前的超级计算机。比如向量处理、矩阵、张量核心等等，充分利用这些非常困难。现在的代码优化工作已经很困难了，如果你去优化诸如机器学习之类性能敏感的代码，那么是非常艰难的。但不管怎样，我都会试着去做，虽然这条路还很漫长，但希望这些都是值得的。 
  
  
    
  
  
  因此，在开始TVM项目时考虑的问题是，我们是否可以根据用户要部署的目标硬件，来自动地调整机器学习模型和实际代码，而不需要依靠人工优化的库，也不需要依靠大量的人工编码来提高模型的速度。 
  
  
    
  
  
  其工作原理是，TVM通过运行一系列的小实验，来建立目标硬件行为的特征，或者说个性，然后利用它来指导如何在一个非常大的观察空间来调整模型和代码。从用户角度来看，最终的结果就是，把所有的这些输入都集中在TVM里，并选择一个目标硬件，TVM会为你的模型找到合适的调优方式，并且在目标硬件上编译成一个非常高效的二进制文件。 
  
  
    
  
  
  Lukas：创办OctoML的动机是什么？ 
  
  
    
  
  
  Luis： 
  TVM已经变得相当流行，大约两年前我们就开始创办公司。那是一个群星闪耀的时刻。当时TVM的应用非常广泛，而且我们发现，有更多的硬件厂商开始将TVM作为首选软件栈。当我们在西雅图举行第二次开发者会议时，我看见屋里坐满了人。我想这是一个机会，要广泛地普及TVM能够做的事情。 
  
  
    
  
  
  而在那之前的几年里，我已经成为了正教授，TVM的许多核心成员博士都即将毕业。TVM的主要倡导者之一的Jason Knight，当时在Intel工作，他也希望寻找新的起点，于是这一刻“群星闪耀”，他成了联合创始人。我很庆幸有这么一批人准备创办公司，而且我们有很好的合作关系。 
  
  
    
  
  
  这里面有许多的协同作用，但它和“群星闪耀”的一段是一样的。从技术角度来讲，我们大家都很清楚已经拥有了这种模型和硬件的交叉产品，有如此巨大的机会去创建一个干净的抽象，同时自动消除使机器学习真正有用和可部署的难题。 
  
  
    
  
  
  说实话，我并不喜欢MLOps这个术语，因为它意味着很多东西，但从数据到部署模型，很显然创建模型的工具已变得很好用了，现在有很多人可以创建很好的模型，有大量可用的模型库。 
  
  
    
  
  
  但经过与一些潜在的客户的访谈，我们意识到，事实上，人们在模型部署方面遇到了许多困难，需要解决软件工程、性能要求和成本要求才行。所以，我们创办了OctoML，实质就是让TVM更易于获取，或让更多的模型构建者能够使用，并且让其成为一种流程。 
  
  
    
  
  
  让我来简要介绍一下Octomizer。Octomizer是一种用于加速机器学习的平台，其核心是TVM。只需几个调用操作，“上传模型、选择、下载模型、优化模型”，然后选择想要的目标硬件。Octomizer会调用 TVM，或者也可以使用 ONNX-Runtime，我们将继续添加更多类似的运行时后端。同样，我们想为用户提供一个抽象的概念，就是你可以把模型上传，这样就可以获得最快速的模型，并可以在硬件上以完全自动化的方式进行部署。 
  
  
    
  
  
  你要么可以下载一个 Python程序，或者使用我们正在研究的gRPC包装，在云或云功能等方面进行部署。因此，这里的增值之处是我们在TVM之上提供的所有这些自动化。还有一个事实是，TVM使用机器学习进行机器学习，我们准备了一个数据集，用于全世界都关心的许多核心硬件目标。 
  
  
    
  
  
  2 
  
  
 ####  
   
   自由选择软硬件堆栈 
   
  
    
  
  
  Lukas：我不是硬件专家，当我看到那些尝试在不同的硬件上使用机器学习模型的例子，似乎越来越难以对硬件做抽象。看上去，人们似乎真的在利用特定硬件来构建模型，有时候需要特定的内存容量等等。 
  
  
    
  
  
  Luis： 
  这就是我们要改变的。我们希望消除模型构建者的顾虑，让他们集中精力解决最佳的统计特性，剩下的事情都应该交给TVM工程师和Octomizer这样的引擎。 
  
  
    
  
  
  Lukas：所以，TVM其实就像一台虚拟机？在模型运行阶段，它是否对硬件进行了即时编译？ 
  
  
    
  
  
  Luis： 
  这是工作的一部分。大体上来说，TVM是即时编译的。即时编译之所以重要，是因为在运行、评估模型后，你才会对模型有更多了解。其次，你可以测试性能，然后确定剩下的工作要怎么做。 
  
  
    
  
  
  从这种意义上讲，它是一种简洁抽象，是一台虚拟机，但它并非VMware意义上的虚拟机，而更像是Java虚拟机意义上的虚拟机。作为一名计算机系统架构师，TVM对这种抽象类型的思考更加贴近我的世界。但TVM是一台虚拟机，它有一个定义明确的接口，允许用来描述模型的功能，并能把模型逐步递降到目标硬件。 
  
  
    
  
  
  Lukas：这是用在部署环节，还是在训���时���能使用？ 
  
  
    
  
  
  Luis： 
  这是一个很好的问题。现在TVM主要用来做推理。一般的工作流程是这样的：假如你有一个正在训练的模型，可能也进行过量化，可以利用上所有可能会修改模型统计特性的优化技巧，你最终对模型进行验证，确保对模型的准确性满意。然后就交给TVM，从那时起，我们只做能完整地保留模型数学性质的过程。我们并不希望影响模型的数学性质，而是把它看作对模型构建者之前所做所有优化的一种补充。 
  
  
    
  
  
  因此，这真的很像一个编译器。它是一个编译器、代码生成器和运行时系统，为模型和目标硬件提供了所有的专门优化。实际上，我们制作了一个定制包可以进行部署，所有东西都可以定制，包括为模型定制的算子、运行时系统，并将其封装成一个包，就可以立即进行部署。 
  
  
    
  
  
  Lukas：很多时候，这是一个类似于边缘的低功耗计算环境？或者说更合适服务器？ 
  
  
    
  
  
  Luis： 
  之前我提过自动化过程，以及利用机器学习来找出硬件所能做到的和不能做到的并以此作为优化的指南。这样就不用再做边缘端还是服务器这样的选择了，因为它们基本上是一样的，没有什么“魔法”。显然，如果你有一个类似于GPT-3这样的巨大模型，想在一块毫瓦功率的微控制器上运行，这根本行不通。 
  
  
    
  
  
  但就目标硬件代价模型的基本流程而言，使用这些预测模型如何指导针对特定目标硬件优化模型，从微小的微控制器到强大的GPU或加速器，抑或基于FPGA基本上都是一样的。这说明 TVM对这两者都没有任何偏好或限制。因此，我们在开源��区和研究领域都有这些用例，而且自己在做这些用例。由于其基本技术实际上是相同的，OctoML同时拥有边缘部署和云部署的客户。 
  
  
    
  
  
  当然边缘部署和服务器部署在实际部署方面和工作管线上稍有改变。举个例子，你在一个微小的设备上部署，可能连一个操作系统都没有，这和服务器的部署是不一样的，但在关键问题上，如何让模型在目标硬件上快速工作，这是基本一致的。 
  
  
    
  
  
  Lukas：我认为，在服务器级部署方面，除了TPU和少数公司以外，似乎所有人都会在NVDIA 之类软件栈上部署。它是否类似于CUDA和cuDNN，或者转换成CUDA可以编译的内容？ 
  
  
    
  
  
  Luis： 
  这个问题问得好。考虑一下只有NVIDIA的世界，让我们从这样的“垄断”中解脱，而这实际上正是我们的目的之一。当然，我爱NVIDIA，很欣赏他们的工作，但是人们应该有更多选择，业界还有许多优秀的非NVIDIA硬件。 
  
  
    
  
  
  NVIDIA的最底层是它的编译栈，但他们没有公开指令集，这其实是机密，他们不会公之于众。你必须用CUDA来进行编程，这是程序员可见的最低级别的编程接口。这上面还有cuDNN，还有与之平行的TensorRT更像是一个编译器，可以把模型编译到目标硬件上。TVM与之类似，同时也使用NVIDIA提供的这些库。 
  
  
    
  
  
  通常，cuDNN和TensorRT都会按照人们关心的模型进行指导、调优和改善。模型要部署到哪里，预先编译好的结果就会被带到哪里。而TVM是为每一种新模型的部署环境生成新的代码。这就意味着，TVM在一些情况下要优于TensorRT和cuDNN，仅仅是因为TVM可以以完全自动的方式为你所用的特定NVIDIA GPU做专门优化。 
  
  
    
  
  
  从本质上讲，你将模型运行到TVM，那就是一大堆CUDA代码，你将它编译为二进制，可以在特定的NVIDIA GPU上部署。但在这个过程中，TVM不会拘泥于你只能用TVM的教条主义观念。有些情况，如果NVIDIA的库或者NVIDIA的编译器（如TensorRT）会做得更好，我们也可以利用它们。 
  
  
    
  
  
  因此，TVM 所做的就是我们所说的“在所有候选中选择最好的”。在编译模型时，对于模型的一部分，比如一组算子，它“看到”TVM 的版本，以及cuDNN和TensorRT的版本，然后会想，“哦，这个算子用cuDNN更好”，只要把它放进去就行了。 
  
  
    
  
  
  我们将所有这些连接起来，给你的结果可能就是一个完整的二进制。所以，里面的片段可以是 cuDNN的一部分，也可能是TensorRT或TVM所生成的代码，并生成一个包，基本上是专门针对你的模型，当然像是否应该使用NVIDIA的软件栈这样的选择实际上TVM已经帮你做了。 
  
  
    
  
  
  对了，这只是关于TVM的情况。再谈一下Octomizer，在这里面你想把所有这些进一步抽象化。也就是说，上传你的模型，然后可以选择目标硬件，Octomizer有一个包含多种硬件的复选框。 
  
  
    
  
  
  有Intel CPU、AMD CPU、NVIDIA GPU、树莓派（Raspberry PI），很快还会有AMD GPU，有时可以在一些场合下选择运行并使用一个本地的栈，对怎么优化这些模型的性能连想都不用想，而这正是我们所希望的。 
  
  
    
  
  
  现在，让我们来看看开源的Apache TVM，它对于终端用户和硬件厂商来说，有着巨大的吸引力。微软、亚马逊、Facebook等终端用户都在广泛使用。如今，硬件厂商也开始涉足TVM，像ARM这样的厂商在TVM之上构建了CPU、GPU、NPU编译器和软件栈。我们也正在为AMD GPU提供支持，高通已经使用TVM构建自己的软件栈。除了这些，我们将进一步扩展其支持硬件的范围。 
  
  
    
  
  
  之所以这么说，是因为我们已经让AMD GPU这样的硬件在TVM上得到了很好的应用，我们将开始为用户提供更多有意义的选择。他们可以选择更适合他们的硬件，而不需要受困于这种硬件在软件栈上的不足。 
  
  
    
  
  
  Lukas：高通公司经常谈论ONNX，我的理解是，这是一种模型和可以部署的硬件的转换，它如何与TVM连接？ 
  
  
    
  
  
  Luis： 
  现在我无法向你展示视觉效果，但你可以将它想象成一个栈。在最底层有硬件、编译器、操作系统，还有代码生成器，TVM就在这一层。再往上，就是你的模型框架，比如TensorFlow、PyTorch、Keras、MXNet，诸如此类。 
  
  
    
  
  
  ONNX 是一种很好的规范，本质上是一种用来描述模型的通用语言。TVM接受符合ONNX规范的模型作为输入，但同时也会接受原生TensorFlow、PyTorch、Keras、MXNet等。如果你现在想用Octomizer的服务，可以上传一个ONNX模型，在Octomizer的内部，它可以通过调用TVM来导入模型并施展它的“魔法”进行性能优化。 
  
  
    
  
  
   
  
  
    
  
  
  3 
  
  
 ####  
   
   软件栈如何提升系统性能 
   
  
    
  
  
  Lukas：我听说，NVIDIA在很多时候都很难被替代，它成为人们部署大部分产品的主要方式，其中原因之一是cuDNN库很好用。有没有想过，随着TVM变得越来越强大，它会给硬件公司带来市场机会？ 
  
  
    
  
  
  Luis： 
  NVIDIA已经做得非常好了。我认为，他们拥有广泛的、可用的、最好的底层机器学习系统软件栈，有巨大优势。硬件也很好，有些硬件在原始处理、功率模型、内存和架构等方面都很优秀。如果只有硬件，没有好的软件栈，将毫无竞争力。我们相信TVM也可以为人们提供这种选择。 
  
  
    
  
  
  再说一遍，我不希望这听上去好像我们在跟NVIDIA竞争。这不是重点。想一下操作系统，Linux可以用在你感兴趣的任何硬件上，但至少在相同的硬件上，也可以选择使用Windows。TVM可以视为在你的硬件上使用何种操作系统的选项，只是你不必选择专用的操作系统。在机器学习领域，如果你不愿意直接手工编写CUDA层级的代码，除了NVIDIA，你基本上别无选择。 
  
  
    
  
  
  Lukas：让我们想想模型的作用，例如，卷积、矩阵乘法。因为我有数学背景，对我来说似乎很简单。我只是在想，做了那么多年的库，矩阵乘法怎么还能挖掘出来20%的速度？这到底是怎么回事？ 
  
  
    
  
  
  Luis： 
  这个问题问得好。让我们再想一想计算机系统结构。假设你是一个执行引擎，就像处理器或 GPU 中的核心。出于某种原因，你必须从内存中的某个地方抓取数据。 
  
  
    
  
  
  事实证明，计算机内存的组织方式，以及数据在内存中的实际地址，在很大程度上，这会给你带来比其他人更好的性能。数据的特定布局可以让我们更加充分地利用内存和处理器、缓存与硅本身的实际执行引擎的连接。 
  
  
    
  
  
  但要确定该怎么做才会得到最优解，这就变成了一个组合问题。不但要选数据结构，还要考虑到实现卷积的嵌套循环，例如，如果有四层嵌套循环，应该按什么次序去执行？在很多合法有效的多层循环里，应该选哪个顺序来完成这些操作？更重要的是，你可能要在分块的基础上遍历，比如，要遍历多大的块？这一切与卷积参数有很大关系。这里拿卷积做个例子，但这对一般的矩阵乘法也适用。 
  
  
    
  
  
  长话短说，对于任何给定的算子，都有潜在的数十亿种方法通过编译来输出逐位等价的程序，但是某一个版本可能会比最慢的那个快一千倍，选对正确的方法非常难。之前，这往往是通过人类的直觉和一些自动优化来完成的。 
  
  
    
  
  
  cuDNN能让你的模型跑得越来越快的原因是，NVIDIA能够雇得起大量才华横溢的程序员，他们一直在关注着模型的发展。如果他们看到很重要的模型，就会去查看所有算子的参数，以及如何将其连接在一起。他们会对库进行调整，以保证能更好地进行数据布局，更好地循环次序，更好地分块，从而让数据结构得到更好编排，他们会选择他们所遍历的方向。 
  
  
    
  
  
  而这只是在单个算子上做的优化，只是众多优化方法中的一种而已。算子与其它算子可能会进行协作，就是所谓的“算子融合”。如果将两个算子（比如矩阵乘法、卷积）融合到一个算子，就可以更好的利用数据局部性，可以更好地利用内存分级，这也是另一个能显著提升性能的办法。 
  
  
    
  
  
  Lukas：我想象，在这个计算图里的每一步都可以分别进行优化…… 
  
  
    
  
  
  Luis： 
  不，你得把它们放在一起。其实，如果你读过TVM的核心论文，其中最重要的信息之一是高级图优化和代码生成要结合起来，这是许多力量的源泉。 
  
  
    
  
  
  基本上，如果你选择在图中融合两个算子，那么就必须为它们生成真正好的代码。所以，你就可以开始使用自动的高度专业化的代码生成器。它们利用机器学习来搜索新算子，将两个具有不同参数的算子融合在一起。通过将高级图优化和专门用于此的低级代码生成相结合，就可得到具有显著乘法效应的性能优化机会。 
  
  
    
  
  
  Lukas：新的TPU架构是否会改变这种优化方式？或者是否会改变你正在做的事情？ 
  
  
    
  
  
  Luis： 
  TPU是另一种不同的硬件架构，因此你还得对其进行调整。不过，要记住TPU同样包括一堆晶体管功能单元、浮点单元和向量单元，还有连线，以及以某种方式组织的存储器。从某种意义上说，许多专门的架构，它们所做的和GPU是一样的，事实上TVM也拥有一个开源的、类似于TPU的加速器，它是完全开源的硬件，可以在FPGA上实现，一些人已经在实际的专用芯片中实现了，它提供了一种模板，帮助你理解这些加速器。 
  
  
    
  
  
  专用加速器也有参数，比如内存和缓冲区的大小，支持的数据类型，多少功能单元才能有合适的吞吐量等等。这一切都是为了取得平衡：如何组织内存，投入多少芯片面积用于计算和存储，有多少连线，以及互连网络如何在此连接的情况下移动数据等等。 
  
  
    
  
  
  我之所以这么说，是因为在许多情况下，要考虑这样一种权衡：你可能会为了极大提升效率，让硬件变得更加复杂，同时编程变得更加困难。这也就意味着，我们现在要更多地依赖编译器来生成真正好的代码，并研究如何将代码编译到某个特定的目标硬件。 
  
  
    
  
  
  编译可能会很复杂，但只需要做一次。但如果你在运行时再做优化，那么就要在每一次数据流动时都要这么做。总之，提前做会好很多。 
  
  
   
  
  
  4 
  
  
 ####  
   
   效率和复杂性的平衡 
   
  
    
  
  
  Lukas：在非深度学习的芯片里，故事是不是更简单，就像一个小型的指令集，并且尝试着让它变得更简单？这似乎与增加硬件复杂性，然后依靠编译器来处理它的方向相反。 
  
  
    
  
  
  Luis： 
  没错。这可能是完全不同的话题，但整体而言，当在我所教的计算机体系结构研究生课程中发生RISC和CISC的争论时，我就让他们争论。关键在于，通过访问一个更简单的指令集，可以有更简单的硬件，这样实际上可以用更快的时钟。指令变得很小，但是在相同一段时间内执行了更多指令，因此它们运行得更快。 
  
  
    
  
  
  事实证明，甚至现在的x86和Intel这样的复杂指令计算机，都能自动将复杂指令拆分成微小的结构，里面看上去仍然是一台RISC计算机。但快进到今天，我们发现在不同的计算机架构中，性能的发展趋势已经发生巨大变化。 
  
  
    
  
  
  当我们逐渐逼近晶体管技术的极限时，会出现这样的情形：你拥有一定数量的晶体管，这些晶体管会变得越来越小，同时也越来越节能。但是，随着晶体管越来越小，却并不一定会比原先更节能，也就是说，你可以将更多的晶体管封装到芯片中，但是却无法将所有的晶体管同时开启。 
  
  
    
  
  
  我为什么要跟你说这些？因为这就是越来越专用化的全部理由，拥有一块有许多不同的“更专用的功能单元”构成的更大芯片。它们不是通用的，但它们的效率要高得多，这是因为每次在硬件中增强通用性时，从根本上说，都是在添加更多的电路。 
  
  
   
  
  
  举例来说，通用CPU可以做任何事情。芯片里超过一半的晶体管只是简单地坐在那里“问”：“我是做这个还是做那个？如果我要做这个，那么我就做这个。” 然后你就得根据流过的数据来作出决定，这就是通用芯片的工作方式。 
  
  
    
  
  
  所以，我们目前所见到的趋势是，必须提高这件事的效率，不然的话，我们就没有能力去运营一个全球性基础设施，也没有能力去运行机器学习。你得从某些方面压榨效率，而要压榨出效率的方法，就是“去掉”所有这些只是坐在那里琢磨应该干什么的晶体管，而只留下只能干某一件事的晶体管，它把一件事做得非常非常非常好。 
  
  
    
  
  
  当然，这样做会让编程变得更加困难，因为你现在要搞明白什么时候以及怎么去用这些就效能功耗比而言更有效率（比通用计算机更快）的专门功能部件。 
  
  
    
  
  
  Lukas：真是难以置信。我感觉终于���了一个清晰的回答，我一直都在思考这些问题。那我应该将什么想象成专用指令？专用指令是什么样的？是不是有一个卷积结构...... 
  
  
    
  
  
  Luis： 
  是的。例如，它是一个8×8矩阵乘法器，单指令的。当你发出一条指令。它可以被分解成多个周期，这取决于它是如何被调度的。但从你的视角来看，那里有硬件，基本上晶体管按某种排列组织方式来实现你想要的功能单元。 
  
  
   
  
  
  5 
  
  
 ####  
   
   硬件设计与性能优化 
   
  
    
  
  
  Lukas：如果是物理学法则在推动这一趋势，那么你可能会认为这一趋势会持续很长时间？若真是如此，那它将走向何方？在硬件方面会不会有更多更复杂的结构，这会让我们的研究更加困难吗？如果你要创建一个新的激活函数，但是硬件上没有这个功能该怎么办？ 
  
  
    
  
  
  Luis： 
  没错。现在，我们已经有不错的多样性，不仅仅有不同硬件芯片和硬件部件，比如Intel处理器已经加入了关于机器学习的专门指令等等。这种情况还会持续，老实说，没有别的办法能够提高效率了。 
  
  
   
  
  
  让我现在做一个无聊的推测，除非我们可以教会原子在原子层面上排列自己，这就好比为了让芯片做一件新的事情，“只需要重新安排导线的位置”那样。 
  
  
    
  
  
  Lukas：有一种这样的芯片吧，比如FPGA。 
  
  
    
  
  
  Luis： 
  是的，但是没有什么“魔法”。FPGA只是那里有一堆线，只需要用数据来告诉你应该如何使用，应该使用哪些线，但这些线总是在那里。事实上，有一个表格告诉你，“如果我有这个位（bit），我将使用这根线。如果我有那个位，我将使用其他线”，这就造成了效率低下，所以可以将其视为一种权衡，衡量你的通用程度或难易程度。更通用、更节能，就更易编程；更专业、更高效，就更难编程等等。 
  
  
    
  
  
  从本质上讲，FPGA是一种具有很复杂编程模型的通用结构。由于FPGA是一包线和小的路由表，在均匀对称的结构上“散布”着某些乘法和累加，或者越来越多的激活函数和其他流行的计算单元。你只需设置一些位，来确定如何对数据进行路由。 
  
  
    
  
  
  所以，编程的方式看上去和设计硬件的方式一样，只要做得对，它们将会非常高效。但从根本上说，它们并不像真正的专用功能芯片那样高效。在为针对性的应用进行专门设计时，你才会看到FPGA与GPU等芯片之间的竞争，即便是在硬件效率受到影响的情况下，你也能获得成功。 
  
  
    
  
  
  例如，如果你决定要用两位的数据流。打个比方，假设在一层中量化为两位，在另一层量化为三位，还有一层为一位。现在还没有一种芯片可以为现有CPU 、GPU做到这一点。很有可能的是，问题处于一个8位的数据平面上，而你会忽视其中的某些位，这样就会造成效率浪费，或是会进行低效封装。但通过FPGA，你可以将其组织起来，只需要将线路路由到使用2位或1位或3位就可以了。 
  
  
    
  
  
  在这种情况下，由于数据类型比较独特，可以根据你的模型进行专门化，然后使用FPGA就可以做得非常好。 
  
  
    
  
  
  说实话，我觉得这项研究变得更加有意思了。或许我年纪大了，有点古板，但我还是很乐观，因为我从未见过计算机系统结构和系统优化如此有趣。 
  
  
    
  
  
  有一段时间我们一直在研究这个问题，那就是让微处理器变得更快，让编译器变得更好。不过，现在我们需要专用化，因为有了机器学习这个真正令人兴奋的应用空间，为优化提供了很多机会，而且你还有像FPGA这样的芯片，设计芯片越来越容易，我们可以为学术研究和产业革新创造更多的机遇。 
  
  
    
  
  
  所以，我们可以看到所有这些美妙的新芯片，赛灵思有新的FPGA，还有新的FPGA公司，还有一些是新颖的可重构结构以及所有这些很酷的目标硬件。 
  
  
    
  
  
  Lukas：你是否真的可以把模型性能和模型设计方式分开？感觉模型中的许多性能改善源自对卷积或者矩阵运算进行精确处理放松了限制。拿量化而言，在很低的精确度级别，就看起来工作得非常好。 
  
  
    
  
  
  Luis： 
  当然不是。我的意思并不是我们只应该做一次模型编译。我曾经说过，假设你会朝着选择花尽可能少计算量的方向来调整模型，这是理想情况。但你说得对，在模型层面上做了一些优化，它实际上改变了模型的统计表征，使得新的优化成为可能，我们也能做到，譬如TVM在不断地增加对量化的支持。 
  
  
    
  
  
  但我特别感兴趣的是，一般来说，如何把像TVM这样的东西放在整个网络架构搜索循环中。当你对模型架构做出决策时，对不同的模型架构进行再训练时，可以在模型层上做出新的优化决策，改变卷积、数据类型以及做剪枝和压缩等等。 
  
  
    
  
  
  现在，将编译器置于诸如TVM之类的流程中，并衡量经搜索所获得的性能，这将会带来真正的协同效应。原则上你可以将它们分开，并且仍然会做得相对较好。不过，如果你把它们两个放在一起做，你将会获得更多的潜在机遇。 
  
  
    
  
  
  这就是TVM在高级图和底层优化方面所做到的。通过把它们放在一起做，我们能够证明做到更好。我有数据显示，当在构建和调整模型时，同时进行低成本的模型编译和硬件调优，可能会比分开做要更好。 
  
  
    
  
  
  Lukas：这两者之间是否存在权衡？就像GCC一样可以对内存进行优化，也可以对速度进行优化。在这个层面，会权衡延迟和内存容量吗？或者它们之间是相互配合的？ 
  
  
    
  
  
  Luis： 
  当然，如果你对模型进行压缩或者进行量化，那么它一定会对内存利用的优化产生一定影响。所以，从FP32到Int8，空间占用降低了4倍，从32位降到了8位。 
  
  
    
  
  
  Lukas：但这样做也会让程序的运行速度加快？如果量化可以维持用户界面的性能，那么就不需要考虑什么了？ 
  
  
    
  
  
  Luis： 
  或许吧。假设你要用量化，有同样的模型架构，只需要修改数据类型就可以了。但这有点像简单、懒惰的量化。正确的做法是，只要你改变了数据类型，就有机会真正去重新训练它，而你的模型中的某一些部分也将继续减少。 
  
  
    
  
  
  要想量化，正确的办法不仅仅是“量化你的数据类型，然后忘掉它”。当你改变数据类型时，实际上会有新的、对模型进行重大改动的机会，使量化有可能更加有效。 
  
  
    
  
  
  那么，延迟和占用空间之间如何权衡？也许是你确实对模型进行了量化，但实际上让模型变得更深，从而弥补了某些准确性的损失，这可能会使你的模型变得更慢但占用的内存却更少。这也是一种权衡。 
  
  
    
  
  
  Lukas：我觉得对模型来说，它是二进制的，要么可以把它放进树莓派的内存中就会运行，要么不能把它放进树莓派的内存中。这看起来不像是关于优化的问题，这种情况常见吗？ 
  
  
    
  
  
  Luis： 
  很难说这是不是常见。通常情况下，至少对于我们遇到的模型来说，我们知道现在可以运行。比如你实际只需要每秒半帧的帧率，但现在已经可以做到每秒20帧了，模型就已经满足要求了。 
  
  
    
  
  
  但是通常，性能优化同时也会降低模型的尺寸，一个原因就是量化，假设你可以从FP16到Int8，并且非常有效。你可能提高了性能，也减少了模型大小。但是我已经看到了模型已经可以运行的很多情况，难的是真正的目标延迟，这实际上使模型变得有用。 
  
  
    
  
  
  其实我们常常会遇到这样的情形，当使模型运转时，你会调整到让它足够快，但它永远不够快，然后你快到目标了，结果发现前面还有距离现在10倍的距离，这样它才会真正有用。 
  
  
   
  
  
  6 
  
  
 ####  
   
   ML的挑战和被忽视的应用 
   
  
    
  
  
  Lukas：在数据中心里，似乎应用机器学习的比例越来越高，而且数据中心在全球能源使用中的比重也在不断增加。这会对环境造成什么影响？ 
  
  
    
  
  
  Luis： 
  基本上，每次在同一硬件上提高运算速度，都是在降低二氧化碳排放量，降低资源压力。性能优化是这种奇妙的事情，可以从很多方面受益。如果使其速度更快，那么用户将会很开心。不过，即便他对延迟并不敏感，财务人员也会更加开心，因为减少了在云计算服务上的开销。但是到最后，所消耗的能源就会减少。这真的非常重要。 
  
  
    
  
  
  正如你所指出的，世界上有越来越多的能源被用于计算。我不打算谈论加密货币，我们现在没有涉足加密货币的计划，这是一个完全不同的话题，需要考虑到它的能源成本。 
  
  
    
  
  
  训练和大规模部署模型在内的机器学习基础设施所需要的能源成本不可低估。可以这么说，在当今的机器学习典型应用中，大多数时钟周期都是用来进行机器学习计算和访存的，而维持这种活动必须需要能量。 
  
  
    
  
  
  无论是在用户体验方面还是在能源效率方面，任何能让硬件更高效、让模型更高效，或是通过编译和优化特定于模型的硬件来实现的事情，都是一场胜利。通过提高能源效率，可以大大降低对环境的影响。 
  
  
    
  
  
  这是毋庸置疑的。尤其在大规模应用的情况下，要抓紧每一次机会来降低模型消耗的能量。尽管从用户体验来说，这无关紧要，但我们还是要这么做，因为这是正确的事情。 
  
  
    
  
  
  Lukas：在机器学习领域，你觉得哪些研究主题没有引起足够的重视？ 
  
  
    
  
  
  Luis： 
  我的大部分研究都是关于机器学习和机器学习自动化系统设计方面。我认为，目前已经有更多人在关注这个问题。TVM就是一个范例，它利用机器学习来更好地进行模型优化和编译。但是，如果要同时进行硬件设计和FPGA编程，就实在是太困难了，机器学习在这方面可能会有很大的发展空间。 
  
  
    
  
  
  我要的是一个真正的“输入模型，自动化输出硬件和软件”，而且随时可以部署。 
  这就是我最感兴趣的事情，这会有很大的影响力，人们也能从很多方面受益。 
  
  
    
  
  
  当你开启新的应用时，你将获得新的体验，同时也让它变得更为节能。所以，我想我们应该一直在思考，如果要进行大规模部署，我们的能源成本是多少。富裕国家不会考虑这些，即便是价格高昂，你也要为能源买单。不过，如果认真想想，大规模运行这些设备会给环境带来什么后果，那就应该注意这个问题。 
  
  
    
  
  
  Lukas：也就是要用机器学习来对模型进行优化？ 
  
  
    
  
  
  Luis： 
  利用机器学习，不仅要优化模型，还要优化运行模型的系统，这样你就能得到更好的行为。它们可以做到更快，每美元的吞吐量更高，能耗也更低。这简直太让人激动，也太有希望了。所以这只是其中一方面。 
  
  
    
  
  
  我想讲一个以前不太受重视，但最近却受到越来越多的重视的话题，那就是机器学习在分子生物学中的影响。 
  
  
    
  
  
  作为我个人研究的一部分，在过去六年左右的时间里，我一直致力于设计使用DNA分子进行数据存储和简单形式计算的系统。其中一些实际上与机器学习有关。比如，我们最近演示了直接用化学反应进行相似搜索的能力。这不仅很酷，而且绝对是一种新设备技术的替代品，非常可行，而且经过了时间考验。 
  
  
    
  
  
  它可以节省能源，并且从根本上讲，分子系统的设计是如此复杂，我无法想象除了使用机器学习来设计这些模型之外，还有什么其他方法。我们一直这样做。去年年底，我们在Nature Communications上发表了一篇关于Porcupine的论文，我们用机器学习的方式来设计 DNA 分子，使它们在DNA测序仪上看起来如此不同，它们不会是天然DNA，你可以用这个来做标记。 
  
  
    
  
  
  我们设计了这些分子去标记“艺术”或“衣服”，诸如此类。基本上可以快速采集样本，运行测序仪，然后根据这些分子痕迹来鉴定。这之所以成为可能，要归功于设计分子的机器学习，以及从DNA测序仪中解读信号等等。 
  
  
    
  
  
  这个领域现在得到的关注越来越多，我发现这难以置信地令人感到兴奋，我在研究和工业领域所做的事情的很多高级动机就是促成这样的用例。但那些需要大量计算的事情，没有一个非常有效、非常快速的系统是不可能实现的。 
  
  
    
  
  
  Lukas：今天让机器学习在现实世界中发挥作用的最大挑战是什么？或者当你与客户交谈，在他们优化模型，把模型部署并用于最终用例时，遇到的挑战是什么？ 
  
  
    
  
  
  Luis： 
  我人生中的很大一部分时间都投入到部署中，但我不想说这是最大的问题，这听起来太自私了。在技能方面，因为它要求人们了解软件工程，了解底层系统软件，并了解机器学习，这是一个巨大的障碍。 
  
  
    
  
  
  还有其他的一些方法，就是确保你的模型在部署后能按照预期方式运行。比如可观察性，确保没有意外输入来使模型表现失常，出现故障安全行为等等。我觉得这并不新鲜，某些应用需求或者是由于模型做出重大决策时，这样做是对的。你希望知道它们是如何完成的，并且确保它们在意外的输入中确实成立。所以我认为这是一个比较困难的问题，像任何一个考虑整个系统的工程师一样，你要考虑系统故障中最薄弱的环节。 
  
  
    
  
  
  （本文已获得编译授权，原文： 
  
  
  https://wandb.ai/wandb_fc/gradient-dissent/reports/Luis-Ceze-Accelerating-Machine-Learning-Systems--Vmlldzo4MDA3OTk?galleryTag=gradient-dissent） 
  
  
   
  
  
  其他人都在看 
  
  
  OneFlow实习岗位热招 
  黄仁勋口述：英伟达的发展之道和星辰大海 
  深度学习崛起十年：“开挂”的OpenAI革新者 
  Tenstorrent虫洞分析：挑战英伟达的新玩家 
  计算机架构的新黄金时代，GPU能否继续保持辉煌 
  30年做成三家独角兽公司，AI芯片创业的底层逻辑 
  
  
  点击“ 
  阅读原文 
  ” 
  ，欢迎下载体验OneFlow新一代开源深度学习框架 
   
  
  
   
   ####  
     
   
  
  
   
   
  
 
本文分享自微信公众号 - OneFlow（OneFlowTechnology）。如有侵权，请联系 support@oschina.cn 删除。本文参与“OSC源创计划”，欢迎正在阅读的你也加入，一起分享。
                                        