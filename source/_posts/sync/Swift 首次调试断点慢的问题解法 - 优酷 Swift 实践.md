---
title: 推荐系列-Swift 首次调试断点慢的问题解法 - 优酷 Swift 实践
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 281
date: 2022-05-11 05:14:30
cover_picture: 'https://api.ixiaowai.cn/gqapi/gqapi.php'
---

&emsp;&emsp;：段继统 & 夏磊 调试断点是与开发体验关系最为密切点之一，优酷iOS团队在外部调研时候发现，大量国内的iOS APP研发团队也遇到了类似的问题。考虑到国内Swift如火如荼的现状，我们尽快整...
<!-- more -->

                                                                                                                                                                                         
作者：段继统 & 夏磊 
 
### 前言 
众所周知，Swift是苹果公司于2014年苹果开发者年会（WWDC2014）上发布的编译式新开发语言，支持多编程范式，可以用来撰写基于macOS、iOS、iPadOS、watchOS和tvOS上的APP。对于广大iOS开发同学来说，这也是研发未来iOS APP开发必须要掌握的语言技能。Swift语言在发布后的数年里得到了飞速发展，在2019年苹果发布了Swift5.0版本并宣告Swift ABI稳定。 
在Swift5.0版本的ABI稳定后，Swift正式具备了完善的生产研发基础，优酷iOS研发团队也开始进行优酷iOS、iPadOS版本的Swift迁移。优酷在被阿里巴巴收购后，获得了大量集团移动基建和中间件的支持，因此优酷iOS App在持续演化数年后，基本成为标准的大型组件化工程，由数十个垂直团队负责各自业务并行开发。其中，优酷播放详情页场景是最重要的视频内容消费场景，也率先在2020年初开始业务页面框架、播放器框架及业务模块的Swift迁移。 
2020年底，优酷iOS消费团队完成了业务页面框架和播放器框架的Swift化，这两个框架代码量较少，内部代码结果合理清晰，而且对外部依赖较少。因此在完全Swift化后，性能上得到了提升，并且得益于Swift的优秀语法，团队开发业务需求代码行数下降，团队效能也获得了增幅。整个过程都比较顺畅，也并未遇到明显的工程开发或者质量问题。 
进入2021年后，在业务页面框架及播放器框架Swift版本的基础上，优酷iOS团队全面启动了业务层代码Swift迁移，而在这个阶段，Swift调试断点慢的问题开始出现并日趋严重。 在视频内容场景，核心主业务模块代码7万多行，外部依赖各种模块达200以上，在这个业务模块里，首次断点的时间恶劣情况下可以达到180秒以上，团队研发效率被严重制约。 
2022年初优酷iOS团队完成了80%以上业务代码的Swift迁移，调试首次断点慢的问题已经成为业务场的效率瓶颈。在内部的研发幸福感问卷调查里，97%的iOS开发同学认为调试首次断点慢是目前研发过程的最大痛点，这个问题给iOS研发同学带来的挫败感，足以打消Swift的其他优势。因此，解决这个问题也成为优酷iOS团队年度首要目标。 
### 调试首次断点慢现象及初步分析 
Swift调试断点慢主要现象是，当Xcode工程运行起来之后，我们进行首次断点的等待时间会特别漫长。大部分情况下，工程首次断点生效后，第二次及后续断点的等待时间都十分短暂，基本可以认为无等待时间。不过从团队内部收集的情况来看，不同Mac电脑开发设备和不同的iOS设备表现不全一致，部分同学首次断点之后进行断点的等待时间也极其缓慢。 
这个现象或者说问题在团队内部频繁出现后，我们首先与外部资深iOS开发团队交流，并附上了详细的工程文档。对方也基于反馈在内部进行了调查和验证，并最终给我们答复，表示内部并没有类似问题的发现。在交流过程中我们发现，其内部的大型APP工程模式都是传统的单工程模式，与国内的组件化多个工程模式截然不同。基于各方面汇总信息，我们对这个问题开始进行初步分析和解决。 
从下表中可以分析，播放器框架模块和播放主业务模块情况结合断点时间来看，断点时间似乎与外部依赖数量呈现等比关系，所以可以初步断定断点时间和外部依赖数量存在较强的相关性。 
 
另外还有一个现象，如果子工程和壳工程所依赖SDK的module没有对齐，lldb会很快断点生效，但是打印报错信息，同时无法po任何值。通过此现象也可以初步分析出来，在断点时lldb对子工程依赖的module进行了扫描。 
但仅仅依赖表象分析还不够，所以后续的工作我们从���个方向着手，第一是从播放主业务模块的解耦测试，快速解耦播放主业务模块的外部依赖，测试耦合数量的减少对断点时间是否能有帮助；第二是从lldb自身断点原理的分析，看首次断点如此长的时间中lldb究竟在做什么动作。 
### 通过业务模块解耦入手 
我们通过删除及整理工程依赖引用代码的方式，快速清理外部模块依赖，最终将播放主业务模块的外部依赖降到90个左右。整理完毕后，播放主业务首次调试断点时间也从200秒左右降到120秒左右，对团队开发困难现状有所缓解。但是经过实际验证和应用后，我们也发现这种依赖业务层解耦的方式是对于团队来说不可行的，根本原因有二： 
1、改造成本高 
播放主业务模块从200多个模块依赖降到了90多个，一方面来说说对于防止工程腐化起到了积极帮助，另一方面在业务需求的压力下，研发人员需要投入了巨大的精力来进行代码重构和解耦。长期来看，不同垂直业务团队面临的情况不同，未来的业务技术需求复杂度也不尽相同，这个方案是无法做到快速复用。从人力成本来说，这个方案只能短期进行工程治理，无法长期坚持下去。 
2、实际收益低 
从获得的收益来看，播放主业务模块外部依赖降低到90多个后，我们原来的预期是调试首次断点时间能降低50%甚至更低，但是结果来看，在外部依赖已经无法解除的情况下，首次断点等待时间依然长达120秒以上，这样的收益结果是我们无法接受的。因此也得出来结论，在优酷iOS这样大型组件化多工程的模式下，我们用业务模块解耦的方式是无法根治该问题的。 
### 通过LLDB分析入手 
经过工程治理后，我们觉得还是应该从正面攻克该问题，从LLDB分析来查看根本原因并且解决。如果要分析LLDB入手，对于工程师来说最好的办法还是查看Swift源码，跑起来看一看内部的原型机制。我们首先根据苹果的文档将源码下载下来，然后进行配置，具体文档可以参考 How to Set Up an Edit-Build-Test-Debug Loop，一步一步的跟着做就可以。 
由于Swift是依赖于LLVM，并且在其基础上做了自己的定制化开发，所以切换分支不能只切换Swift源码的，需要将LLVM一起切到对应的分支上， 保证代码同步。正好Swift提供了相应的工具来帮助我们切换对应分支，只需要运行Swift文件下的utils/update-checkout相关命令即可。优酷iOS团队目前使用的是Swift5.4版本，对应Xcode版本为13.2.1。 
1、使用LLVM自带耗时工具 
想要看到底在断点命中后，到底哪块最耗时，就需要使用工具来计算耗时，而这块LLVM有自带的工具类TimeProfiler，里面封装了计时方法，并且输出相关json文件，然后可以用chrome自带的tracing工具解析后现实相关图表 
 
 ```java 
  //TimeProfiler.h 
void timeTraceProfilerBegin(StringRef Name, StringRef Detail); 
void timeTraceProfilerBegin(StringRef Name, 
                            llvm::function_ref<std::string()> Detail); 
void timeTraceProfilerEnd();

  ``` 
  
2、耗时最多的两个地方 
通过TimeProfiler对关键函数进行耗时埋点，发现有两个函数耗时较多，如下代码： 
 
 ```java 
  // SwiftASTContext.cpp
bool SwiftASTContext::GetCompileUnitImportsImpl(
    SymbolContext &sc, lldb::StackFrameWP &stack_frame_wp,
    llvm::SmallVectorImpl<swift::AttributedImport<swift::ImportedModule>>
        *modules,
    Status &error)

  ``` 
  
 
 ```java 
  // SymbolFileDWARF.cpp
void SymbolFileDWARF::FindTypes(
    ConstString name, const CompilerDeclContext &parent_decl_ctx,
    uint32_t max_matches,
    llvm::DenseSet<lldb_private::SymbolFile *> &searched_symbol_files,
    TypeMap &types)

  ``` 
  
一个是SwiftASTContext类的GetCompileUnitImportsImpl方法，这个方法主要是解析当前编译单元与Module相关的操作，另一个则是在某一个变量如果是Any类型，则需要对其进行解析，找到其类型相关的操作，而最终这两个函数的操作都与当前工程的二进制依赖分析有关系，所以，如果能减少在断点命中后对依赖的分析，那么断点时间就会越快。 
#### 无效的解决方案 
根据上面对源码的分析，我们最开始的考虑是否能够通过编译器的一些选项，跳过对一些module的扫描，从而提升首次断点速度，以比较小的成本来尽快解决。 
##### 无效方案1 - 对编译选项的修改 
通过对编译日志的分析，在构建的时候发现一个参数-serialize-debugging-options，从名字判断是用于debug调试的时候序列化生成调试关联产物，接着我们再通过swiftc -frontend --help命令发现了以下这个选项： 
 
针对这个参数，我们进行了尝试，在Xcode构建设置里的Other Swift Flags里加上这个参数，但是从结果发现也没生效。于是我们再次查内外部资料，并且在官方Swift论坛发帖进行咨询，这其中有个外国的iOS开发者回复表示需要添加自定义flag SWIFT_SERIALIZE_DEBUGGING_OPTIONS=NO。随后我们立刻在Xcode工程里加上该选项后并进行验证，从实际结果来说，首次断点速度获得了显著的提升，但也同时发现了严重的缺陷。当团队同学想要po打印相关变量的时候，却什么都打不出来，lldd直接无法解析，从实际开发角度来说该方案不行。 
##### 无效方案2 - 对依赖库的修改 
在我们自己构建的lldb去调试工程的时候，由于编译的lldb是debug包，当命中断点后，lldb会打印一些debug的log信息。这其中有一堆log非常引人注目，会持续地打好几十秒，因此我们立刻对这部份log俩进行分析，下面是部分截取的log： 
 
 ```java 
  warning: (arm64) /Users/ray/workspace/YouKuUniversal/Pods/SOME/SOME.framework/SOME(SOME9999999.o) 0x00004c50: unable to locate module needed for external types: /Users/remoteserver/build/14695183/workspace/iphone-out/ModuleCache.noindex/2YQ3UYLF0BE3R/UIKit-1XGSPECLTDLOB.pcm
error: '/Users/remoteserver/build/14695183/workspace/iphone-out/ModuleCache.noindex/2YQ3UYLF0BE3R/UIKit-1XGSPECLTDLOB.pcm' does not exist
Debugging will be degraded due to missing types. Rebuilding the project will regenerate the needed module files.

  ``` 
  
这块log是其中某一个依赖库的报错，大概问题是说在找这个库的modulecache的时候无法找到其路径。因为优酷iOS的二进制依赖库都是通过阿里远程编译集群生成，因此在生成这个库的debug调试信息的时候，其路径指向的是远程机器的路径。因此，在我们本地机器上去搜索这个远程服务器的地址肯定是找不到的，然后报错。 
通过这个现象，我们猜测是否是因为无法找到正确的modulecache，导致我们当前工程的整个工程Swift依赖库的cache都无法正确的构建起来，所以每次断点都得重新搜索依赖库，然后构建cache。 
那么，这个路径是哪儿带进来的呢？通过研究发现，这个路径是卸载Mach-O文件DWARF的debug信息里的： 
 
那核心就在于怎么处理这个信息，想要修改相对来说有点麻烦，还得弄个Mach-O修改工具，那最快的方式就是去掉这个section。编译设置里面恰好有这个选项可以直接去掉，叫做 
 ```java 
  Generate Debug Symbol
  ``` 
 。 
因为报错这个log涉及到几百个库，即使改这个选项有用，那改一个肯定是看不出效果的，所以我们直接修改了一百来个库，将这些库在release编译环境下把这个选项都改为NO，试试是否有效果。 
结果令人失望，通过我们的测试，即使改了这么多库的情况，对首次断点速度也毫无提升，问题依旧存在。 
既然这两种路都走不通，那lldb自身有相关设置吗？如果有的话那是否lldb的设置可以生效呢？ 
#### 有效的解决方案 - LLDB配置优化 
从上述我们对lldb的分析上已经可以知道，调试首次断点开始，从执行到断点正式生效包含的时间主要包含两部分，其中大部分是模块依赖的module化解析构建，另一部分是自身Any类型的解析。既然业务解耦的工程化以及对编译选项的配置修改明确不可行，那我们就考虑从lldb自身着手，通过setting list命令找到所有与Swift调试有关的设置项，在这其中发现最关键的有两个： 
##### memory-module-load-level 
在调试时从内存加载module信息的级别，默认为complete，另外还有partial和minimal两种，其中minimal最快。 
 
 ```java 
  memory-module-load-level            -- Loading modules from memory can be
                                         slow as reading the symbol tables and
                                         other data can take a long time
                                         depending on your connection to the
                                         debug target. This setting helps users
                                         control how much information gets
                                         loaded when loading modules from
                                         memory.'complete' is the default value
                                         for this setting which will load all
                                         sections and symbols by reading them
                                         from memory (slowest, most accurate).
                                         'partial' will load sections and
                                         attempt to find function bounds
                                         without downloading the symbol table
                                         (faster, still accurate, missing
                                         symbol names). 'minimal' is the
                                         fastest setting and will load section
                                         data with no symbols, but should
                                         rarely be used as stack frames in
                                         these memory regions will be
                                         inaccurate and not provide any context
                                         (fastest).

  ``` 
  
##### use-swift-clangimporter 
Swift调试时是否重新构建所依赖的module，默认值为true。 
 
 ```java 
  use-swift-clangimporter      -- Reconstruct Clang module dependencies from
                                 headers when debugging Swift code

  ``` 
  
所以我们从以上两个配置项着手，在命中任意断点时执行以下两个命令： 
 
 ```java 
  settings set target.memory-module-load-level minimal
settings set symbols.use-swift-clangimporter false

  ``` 
  
执行后发现断点速度明显提升，首次断点从180秒缩短到40秒，两条命令单独测试，memory-module-load-level设置优化约6秒左右，其他时间优化来源于use-swift-clangimporter设置。在论证这个方式后，我们在此配置基础上，征集优酷及集团内部iOS同学试用。验证不同的开发环境后，我们惊喜地发现，首次断点时间均有大幅度提升，基本达到可用程度。 
阿里巴巴集团内部验证结果如图： 
 
#### 配置优化后存在的问题及解决 
当然，在在进行上述优化设置后，我们也发现了问题，会出现部分OC属性无法po的情况，例如Swift继承OC基类的情况: 
 
 ```java 
  //oc
@interface OPVideo : NSObject

@property (nonatomic, strong) NSString *sid;

@end

//swift
@objc public class DetailVideoSwift: OPVideo {
    @objc public var desc: String?
}

  ``` 
  
此时“po video.sid”无法输出，但是“po video.desc”正常，这样就导致调试时有很大的局限性。通过查阅lldb文档发现，lldb可以把指定代码绑定到自定义命令，所以我们可以使用这个机制解决部分属性无法po的问题。 
首先新建Swift代码库，外部同学参考时可以放入到自身工程的相关基础库中，在库里实现方法： 
 
 ```java 
  public func aliprint(_ target:Any?,selector:String?){
    if let target = target as AnyObject?{
        if let selector = selector {
            let returnValue = target.perform(NSSelectorFromString(selector))
            print("(String(describing: returnValue?.takeUnretainedValue()))")
        }else{
            print("(String(describing: target))")
        }
    }
}

  ``` 
  
打包后将包含该代码的模块SDK加入主工程依赖，再通过命令 
 
 ```java 
  command regex px 's/(.+) (.+)/expr -l Swift -O -- import AliOneUtils; aliprint(%1,selector:%2);/'

  ``` 
  
将px命令绑定到aliprint方法，注意此处px为自定义命令，这样就解决了部分属性无法po 的问题，经测试完全可用： 
 
### 总结 
优酷iOS团队在作为阿里内部Swift迁移的先驱，在Swift迁移过程中遇到了不少问题，也总结了大量的经验。调试断点是与开发体验关系最为密切点之一，我们在外部���研��候发现，大量国内的iOS APP研发团队也遇到了类似的问题。 
考虑到国内Swift如火如荼的现状，我们尽快整理了该方案并分享外部，希望能在这个问题上帮助到大家。同时，如果有iOS团队和大神有更加优秀的解决方案，也希望能够分享出来，共同帮助国内iOS Swift开发生态的蓬勃发展。 
目前，优酷iOS团队在此方向上做的投入和研究只是一个开始，后续在性能体验、编译速度、包大小优化等方向上也将积极探索，希望通过开发效能和技术的革新，为用户带来更好的优质服务体验。 
关注【阿里巴巴移动技术】，阿里前沿移动干货&实践给你思考！
                                        