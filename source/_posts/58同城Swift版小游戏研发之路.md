---
title: 推荐系列-58同城Swift版小游戏研发之路
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 289
cover_picture: 'https://oscimg.oschina.net/oscnet/944c6904-90a1-49df-a790-875924def828.png'
abbrlink: 95eca492
date: 2022-03-27 11:55:11
---

&emsp;&emsp;同城现状与同城Swift版小游戏研发背景 混天项目：58集团共建的Swift基础设施平台建设， 主要目的是推进集团App对Swift语言进行使用，并打造复杂工程下Swift-OC混编、编译耗时优化、包大小检...
<!-- more -->

                                                                                                                    
                                                                                                     
  
   
    
     
      
       
        
        1 
        
       
      
     
    
    
     
      
      同城现状与同城Swift版小游戏研发背景 
      
     
     
      
       
        
       
      
     
    
   
  
  
   
  
  
  混天项目： 
  58集团共建的Swift基础设施平台建设， 主要目的是推进集团App对Swift语言进行使用，并打造复杂工程下Swift-OC混编、编译耗时优化、包大小检测（支持Swift）等基础能力的建设。 
   
  
 小游戏Native化背景：梦想小镇在同城10.7.0版本前， 是由H5技术研发，优点是可以跨平台，完美支持iOS以及Andriod系统。但是，小游戏的核心业务模式是通过用户合成升级， 当达到一定等级后，给予用户现金奖励（在同城中是发放神器矿石）。但在10.9.0版本苹果审核人员明确表明此业务模式触发了4.7.7审核条款， 如果继续使用H5的技术手段，只能去掉奖励。但是如果去掉奖励的话， 也基本失去了用户玩小游戏的动力，对App的日活以及业务导流都会有比较大的影响。 
 基于上述同城对混编语言建设的现状， 以及苹果对H5游戏审核政策的变化，使我们坚定了用Swift语言开发游戏的新思路。 
 ####  
  
   
    
     
      
       
        
        02 
        
       
      
     
    
    
     
      
      游戏实现业内技术方案调研与快速打造Native游戏开发团队 
      
     
     
      
       
        
       
      
     
    
   
  
 业内技术方案调研：为了处理审核问题， 我们迅速调研了业界主流 App 中的小游戏开发的技术方案，发现主流小游戏主要使用 H5 (不知道为什么可以审核通过...)技术方案实现，其中有极个别的游戏使用了RN实现，还有一些比较特别的是在应用中嵌入了OpenGL、EJJavaScriptView 实现游戏场景。 
 2.1 如何快速打造Native游戏开发团队 
  
   
 ```java 
  同城虽然是由几十个有着丰富研发经验人员组成的团队， 但平时业务研发基本都使用OC语言。虽然一直对Swift语言有所关注，但确实没有在一个复杂的业务场景中使用，那么如何克服这个困难呢？主要通过一下3个方面：
  ``` 
  
  
 1、快速学习， 利用Swift重写同城首页，迅速积累实战经验 
  
   
 ```java 
  Swift ABI稳定后， 随着苹果越来越多的技术、SimpleCode都向Swift倾斜， 团队内部部分研发已经从Swift函数执行原理、Swift代码在Mach-O中的存储结构进行语言深入的理解，并定期组织Swift语言相关分享。同时，为了让更多技术参与其中，首批由5人组成Swift语言兴趣小组，迅速从Swift官方文档、WWDC视频、Swift研发群/社区快速积累语言的使用经验， 并通过重写同城首页，积累实战经验。掌握Swift相比OC语言不同的特点以及性能相关的数据，发现Swift在代码数量、函数执行速度上优势明显。
  ``` 
  
  
  2、快速搭建梦想小镇核心游戏场景，增强SpriteKit落地游戏业务场景信心 
  
   
 ```java 
  因为业内并没有发现其他原生App+SpriteKit游戏框架的业务模式，为了快速验证梦想小镇的游戏在同城的可行性， 我们迅速从SpriteKit官方文档掌握游戏开发的基础知识，在Github下载相关的开源游戏的进行学习，快速掌握了SKScene、SKNode、SKSpriteNode等场景以及精灵之间的关系， 以及了解了通过SKAction实现复杂游戏动效。并且针对最核心的游戏场景，快速实现了车、房场景的布局，以及车、房合并处理（涉及精灵间的碰撞检测）。
  ``` 
  
  
  
  
 ```java 
   
  ``` 
  
 3、多人合作，任务分解，定期汇总游戏研发进度 
  
   
 ```java 
  完成了Swift语言学习以及SpriteKit游戏框架相关知识点的积累， 我们内部通过多人合作的方式，将梦想小镇游戏进行任务分解， 将游戏的各个模块已天为维度进行划分，并每日收集完成进度， 确保游戏整体进度的顺利推进。
  ``` 
  
  
  
 ```java 
   
  ``` 
  
 介绍了整体背景和研发流程后，下面介绍一些梦想小镇小游戏研发过程中的一些技术细节。 
 ####  
  
   
    
     
      
       
        
        03 
        
       
      
     
    
    
     
      
      Native游戏实现之混编环境搭建与研发细节 
      
     
     
      
       
        
       
      
     
    
   
  
  
 ##### 3.1 混编环境搭建 
  
   
 ```java 
  因为同城在梦想小镇业务之前， 99%的代码都是纯OC组成的，因此，想使用Swift+SpriteKit的语言以及游戏框架，首先要解决Swift与OC不同语言间混编的问题。这样，游戏场景中的网络请求、数据存储等基础能力， 就可以使用OC中的基础库，大大降低研发成本，下面介绍一下小游戏中混编的解决方案。
  ``` 
  
  
 相同Pod下OC与Swift混编调用： 
  
   
 ```java 
  当在某个Pod下第一次创建Swift文件，会提示生成桥接文件(bridge), 规则是Pod名-Bridge-Header.h，在这个文件中如果引入OC头文件，在Swift的代码环境中就可以调用到OC的类或者创建OC的对象。
  ``` 
  
  
   
  
   
 ```java 
  那么，相同Pod下，如何在OC中调用到Swift类呢？通常情况下， 当前Pod添加Swift文件后，会自动生成一个Pod名-Swift.h的头文件， 如果OC要调用Swift的类的方法， 就要在头文件中引用Pod名-Swift.h文件。当然，Swift接口想要暴露在OC环境下，需要用@objc声明，同时接口要声明成public, 这样就可以顺利在OC中调用Swift的类和方法了。
  ``` 
  
  
  
 不同Pod间OC与Swift混编调用： 
 JYLOCO开启module选项，在podspec中添加：\'DEFINES_MODULE\' => \'YES\'， 为了Compents Pod 可以引用到JYLOCO中Swift文件暴露的类和方法， 第一步需要让JYLOCO开启module， 需要在JYLOCO的podspect中的xcconfig下，添加\'DEFINES_MODULE\' => \'YES\'，详见下方截图： 
  
 Components要调用JYLOCO中的Swift，需要在Components里的podspec添加moudule依赖，s.dependency \'JYLOCO\' 
  
 配置好上述的依赖配置后，就可以进行OC与Swift的混合调用了。 
 Components调用JYLOCO中的Swift代码使用@import： 
 通过@import方式引用即可，这样Components中当前的OC文件， 就可以调用JYLOCO中的OC的方法以及对外暴露的Swift接口，当然，暴露Swift接口想要暴露在OC环境下，需要用@objc声明，同时接口要声明成public 
  
 #####  
  
 ##### 3.2 梦想小镇游戏研发细节 
 游戏框架：万事具备，小游戏依赖的代码依赖打通后，可以开始撰写小游戏的具体代码了。首先结合梦想小镇游戏介绍一下游戏的框架： 
  
   
 ```java 
  梦想小镇中，游戏区域由<strong>游戏场景</strong>呈现。游戏场景中，主要合并区域为中心<strong>十二宫格</strong>区域，十二宫格上有十二个<strong>地基</strong>，地基承载着<strong>房子</strong>节点。
  ``` 
  
  
 配置游戏场景-SKScene： 
  
   
 ```java 
  小游戏中，游戏场景为GameScene的实例。
  ``` 
  
 ```java 
  GameScene是<strong>SKScene</strong>的子类。一个SKScene对象表示SpriteKit中的内容场景，SpriteKit中，所有内容都是通过SKScene对象进行展示的。我们通过<strong>SKView</strong>对象来呈现游戏场景：
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
  override func viewDidLoad() {
  ``` 
  
 ```java 
    super.viewDidLoad()
  ``` 
  
 ```java 
    // SKView为UIView的子类，可以呈现一个游戏场景
  ``` 
  
 ```java 
    let skView: SKView = SKView(frame: view.bounds)
  ``` 
  
 ```java 
    view.addSubview(skView)
  ``` 
  
 ```java 
    // 场景大小可以设置为任意大小，与UIKit结合使用
  ``` 
  
 ```java 
    let GameScene = GameScene(size: view.bounds.size)
  ``` 
  
 ```java 
    // 通过presentScene(_:)方法呈现游戏场景
  ``` 
  
 ```java 
    skView.presentScene(GameScene)  
  ``` 
  
 ```java 
  }
  ``` 
  
  
 十二宫格网格-SKNode： 
  
   
 ```java 
  小游戏中心合并区域十二宫格为GridNode的实例，GridNode是<strong>SKNode</strong>的子类。SKNode是所有SpriteKit节点的基类，其本身并不展示任何内容，而是为其子类提供基本属性，并可用作其他节点的容器或布局工具。在梦想小镇中，GridNode便承载了12个地基节点，并通过position(for:)方法为地基布局：
  ``` 
  
 ```java 
  func position(for location: Int) -> CGPoint {
  ``` 
  
 ```java 
    // 将传入的location转换为基于 0 的 locationIndex
  ``` 
  
 ```java 
    let locationIndex = location - 1
  ``` 
  
 ```java 
     
  ``` 
  
 ```java 
    // column and row are 0 based;
  ``` 
  
 ```java 
    // For example, locationIndex = 11, (column = 2, row = 3)
  ``` 
  
 ```java 
    let column = CGFloat(locationIndex % 3)
  ``` 
  
 ```java 
    let row = CGFloat(locationIndex / 3)
  ``` 
  
 ```java 
     
  ``` 
  
 ```java 
    let positionX: CGFloat = groundNodeWidth / 2 + (groundNodeWidth + nodeMargin) * column
  ``` 
  
 ```java 
    let positionY: CGFloat = -groundNodeHeight / 2 - groundNodeHeight * row
  ``` 
  
 ```java 
    return CGPoint(x: positionX, y: positionY)
  ``` 
  
 ```java 
  }
  ``` 
  
  
 得到的position即为地基在十二宫格中的位置坐标。 
  
   
 ```java 
  groundNode.position = position(for: location)
  ``` 
  
  
 在GameScene的didMove(to:)方法中创建并添加十二宫格节点。 
  
   
 ```java 
  // 场景被视图展示时调用
  ``` 
  
 ```java 
  override func didMove(to view: SKView) {
  ``` 
  
 ```java 
    super.didMove(to: view)
  ``` 
  
 ```java 
    // 创建十二宫格节点
  ``` 
  
 ```java 
    let foundation = GridNode()
  ``` 
  
 ```java 
    // 设置十二宫格节点位置坐标
  ``` 
  
 ```java 
    foundation.position = CGPoint(x: sideMargin, y: kScreenHeight / 2 + 2 * groundNodeHeight)
  ``` 
  
 ```java 
    // 添加节点
  ``` 
  
 ```java 
    self.addChild(self.foundation)
  ``` 
  
 ```java 
  }
  ``` 
  
  
 地基-SKSpriteNode： 
  
   
 ```java 
  网格节点上有12个地基节点，均为GroundNode的实例。GroundNode为SKSpriteNode的子类，SKSpriteNode是一个屏幕上的图形元素，可以用图像或纯色初始化。
  ``` 
  
  
 小游戏中，我们为GroundNode提供了特殊的构造方法： 
  
   
 ```java 
  init(level: Int?) {
  ``` 
  
 ```java 
    // 使用"base"图片作为地基纹理
  ``` 
  
 ```java 
    super.init(texture: SKTexture(imageNamed: "base"), color: .clear, size: CGSize(width: groundNodeWidth, height: groundNodeHeight))
  ``` 
  
 ```java 
    // 更新等级信息更新地基节点
  ``` 
  
 ```java 
    update(level: level)
  ``` 
  
 ```java 
  }
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
  在GridNode中，根据十二宫格信息gridInfo来配置地基。gridInfo类型为[Int: Int?]，key为地基节点位置，value为节点等级。
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
  func updateGroundNode(gridInfo: [Int: Int?]) {
  ``` 
  
 ```java 
    for (location, level) in gridInfo {
  ``` 
  
 ```java 
        if let groundNode = self.houseGroundNodes[location] {
  ``` 
  
 ```java 
            // 如果该位置已存在地基节点，则进行更新
  ``` 
  
 ```java 
            groundNode.update(level: level)
  ``` 
  
 ```java 
        } else {
  ``` 
  
 ```java 
            // 如果该location不存在地基节点，则创建新的地基节点并将其添加到十二宫格中，并设置其position
  ``` 
  
 ```java 
            let groundNode = GroundNode(level: level)
  ``` 
  
 ```java 
            groundNode.position = position(for: location)
  ``` 
  
 ```java 
            addChild(groundNode)
  ``` 
  
 ```java 
            houseGroundNodes[location] = groundNode
  ``` 
  
 ```java 
        }
  ``` 
  
 ```java 
    }
  ``` 
  
 ```java 
  }
  ``` 
  
  
 房子-SKSpriteNode： 
  
   
 ```java 
  地基节点上可以承载不同等级的房子节点，房子节点类型为HouseNode，HouseNode也是SKSpriteNode的子类。我们通过配置gridInfo，如果对应location地基上存在房子节点，则该location对应的value为房子等级，否则，为nil。在GroundNode的update(level:)方法中，根据等级信息来配置房子节点：
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
  // 更新元素节点
  ``` 
  
 ```java 
  func update(level: Int?) {
  ``` 
  
 ```java 
    guard let level = level else {
  ``` 
  
 ```java 
        // 如果根据十二宫格该地基上没有房子，则清除该地基上的房子节点
  ``` 
  
 ```java 
        clearElement()
  ``` 
  
 ```java 
        return
  ``` 
  
 ```java 
     }
  ``` 
  
 ```java 
    if houseNode == nil {
  ``` 
  
 ```java 
        addElement(level: level)
  ``` 
  
 ```java 
    } else if self.currentLevel != level {
  ``` 
  
 ```java 
        // 如果房子等级发生变化，则更新房子节点等级信息
  ``` 
  
 ```java 
        houseNode?.updateLevelInfo(level: level)
  ``` 
  
 ```java 
    }
  ``` 
  
 ```java 
    self.currentLevel = level
  ``` 
  
 ```java 
  }
  ``` 
  
  
 其中，添加/删除房子节点的方法分别为： 
  
   
 ```java 
  private func addElement(level: Int) {
  ``` 
  
 ```java 
    let node = ElementNode(size: self.size, level: level)
  ``` 
  
 ```java 
    houseNode = node
  ``` 
  
 ```java 
    node.position = CGPoint(x: 0, y: -groundNodeHeight / 2)
  ``` 
  
 ```java 
    addChild(node)
  ``` 
  
 ```java 
  }
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
  private func clearElement() {
  ``` 
  
 ```java 
    self.houseNode?.removeFromParent();
  ``` 
  
 ```java 
    self.houseNode = nil;
  ``` 
  
 ```java 
  }
  ``` 
  
  
 HouseNode中，提供了传入等级level信息的构造方法，和更新等级level的方法： 
  
   
 ```java 
  init(size: CGSize, level: Int) {
  ``` 
  
 ```java 
    let texture: SKTexture = SKTexture(imageNamed: "lv.(level)")
  ``` 
  
 ```java 
    super.init(texture: texture, color: .clear, size: size)
  ``` 
  
 ```java 
    self.anchorPoint = CGPoint(x: 0.5, y: 0)
  ``` 
  
 ```java 
  }
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
  func updateLevelInfo(level: Int) {
  ``` 
  
 ```java 
    texture = SKTexture(imageNamed: "lv.(level)")
  ``` 
  
 ```java 
  }
  ``` 
  
 ```java 
  接下来，我们便可以在十二宫格网格信息方式变化时，调用GridNode的updateGroundNode(gridInfo:)方法，来配置/更新游戏合并区域。
  ``` 
  
  
 Swift语言特性在小游戏中的使用： 
 函数式编程思想 
  
   
 ```java 
  Swift作为最现代的语言，完美的支持了函数式编程的思想，即一切皆函数，函数作为一等公民，可以是被当作变量，参数，返回值。因此系统提供了很多高阶函数，所以filter，map，reduce，flatmap是必备的高阶函数，那么小游戏中如何结合具体的业务场景应用函数式编程思想的呢？
  ``` 
  
  
   1.reduce函数介绍&使用： 
  
   
 ```java 
  Swift中的reduce函数的作用就是接受一个初始化值，并且接受一个闭包作为规则，自动遍历集合的每一个元素，使用闭包的规则去处理这些元素，合并处理结果
  ``` 
  
  
 reduce函数案例-金币位置计算： 
 SpriteKit中自定义字体只能使用.ttf格式的字体，小游戏场景中的金币的金额只有0~9这10个数字，UI设计成了图片格式，不容易转成.ttf格式的字体，最终还是使用图片格式展示金额数据。金额一般都是一串连续的数字，换成图片的话，每个数字都是一张图片，对UI布局的话涉及到图片UI的坐标计算，使用reduce函数能很简单的对连续的一串图片进行坐标计算。 
  
   
 ```java 
  private var _text : String = "" {
  ``` 
  
 ```java 
        didSet {
  ``` 
  
 ```java 
            let start = _text.startIndex
  ``` 
  
 ```java 
            for i in 0..<_text.count {
  ``` 
  
 ```java 
                let index = _text.index(start, offsetBy: i)
  ``` 
  
 ```java 
                update(charactor: _text[index], at: i)
  ``` 
  
 ```java 
            }
  ``` 
  
 ```java 
            if _text.count < nodes.count {
  ``` 
  
 ```java 
                while nodes.count > _text.count {
  ``` 
  
 ```java 
                    nodes.removeLast().removeFromParent()
  ``` 
  
 ```java 
                }
  ``` 
  
 ```java 
            }
  ``` 
  
 ```java 
            let width = nodes.reduce(0, {$0 + $1.size.width})
  ``` 
  
 ```java 
            let height = nodes.reduce(0, {max($0, $1.size.height)})
  ``` 
  
 ```java 
            self.size = CGSize(width:width, height: height)
  ``` 
  
 ```java 
            if let first = nodes.first {
  ``` 
  
 ```java 
                let firstX = -(width / 2 - first.size.width / 2)
  ``` 
  
 ```java 
                first.position = CGPoint(x: firstX , y: 0)
  ``` 
  
 ```java 
                _ = nodes.reduce(nil) { (prev, cur) -> SKSpriteNode? in
  ``` 
  
 ```java 
                    guard let pre = prev else { return cur }
  ``` 
  
 ```java 
                      let x = pre.position.x + pre.size.width / 2 + cur.size.width / 2
  ``` 
  
 ```java 
                    let y = pre.position.y
  ``` 
  
 ```java 
                    cur.position = CGPoint(x: x, y: y)
  ``` 
  
 ```java 
                    return cur
  ``` 
  
 ```java 
                }
  ``` 
  
 ```java 
            }
  ``` 
  
 ```java 
        }
  ``` 
  
 ```java 
     }  
  ``` 
  
  
 2.filter函数的介绍&使用： 
  
   
 ```java 
  Swift中的filter函数的作用就是接受一个闭包作为筛选规则，自动遍历集合的每一个元素，保留符合闭包规则的元素，生成一个新的集合
  ``` 
  
  
 filter函数案例-埋点数据过滤：小游戏业务中，后端下发的数据是比较全而杂，需要我们对数据进行过滤，获取对应的字段，这时候filter函数就能很好的帮助我们解决问题。 
  
   
 ```java 
  //弹窗展示埋点
  ``` 
  
 ```java 
  let logKeys = ["elementtype", "userlevel", "houselevel"]
  ``` 
  
 ```java 
  let adLogs = logParams.filter({ logKeys.contains($0.key) })
  ``` 
  
 ```java 
  log(pageType: "mergehousegame", actionType: "nocoinsremindshow", logParams: adLogs)
  ``` 
  
  
 3.map函数的介绍&使用： 
  
   
 ```java 
  Swift中的map函数的作用就是接受一个闭包作为规则，自动遍历集合的每一个元素，使用闭包的规则去处理这些元素，生成一个结构相同的集合
  ``` 
  
  
 map函数案例-Post请求参数类型转换：小游戏中的网络请求是独立开发封装的，不依赖与三方的网络库，post请求中需要将请求参数转成data格式。业务上写的参数一般都是字典格式，使用map函数可以简便的对字典数据做转换。 
  
   
 ```java 
  func createFormBody(_ params: [String: Any]) -> Data?{
  ``` 
  
 ```java 
      if params.isEmpty { return nil }
  ``` 
  
 ```java 
      return params.map { (key, value) -> String in
  ``` 
  
 ```java 
          return "(key)=(value)"
  ``` 
  
 ```java 
      }.joined(separator: "&").data(using: .utf8)
  ``` 
  
 ```java 
  }
  ``` 
  
  
 4.compactMap函数的使用： 
  
   
 ```java 
  Swift中的compactMap函数的作用就是接受一个闭包作为规则，自动遍历集合的每一个元素，使用闭包的规则去处理这些元素，将处理结果直接放入到一个新的集合里面，可以出现数组降维，并且会自动过滤nil(自动解包)，如果是不包含nil元素的一维数组的和map的作用效果是一样的，所以推荐使用flatMap
  ``` 
  
  
 compactMap函数案例-帧动画过滤图片：小游戏场景中使用了atlas来构建序列帧动画，为了节省App包大小，图片都使用预先从服务端下载，再构建atlas对象，所以可能会遇到某张图片异常的情况，使用compactMap做图片数据的过滤，保证动画稳定播放。 
  
   
 ```java 
    let textures = atlas.textureNames.sorted { (first, second) -> Bool in
  ``` 
  
 ```java 
        let firstInt = Int(first.replacingOccurrences(of: "merge", with: "")) ?? 0
  ``` 
  
 ```java 
        let secondInt = Int(second.replacingOccurrences(of: "merge", with: "")) ?? 0
  ``` 
  
 ```java 
        return firstInt < secondInt
  ``` 
  
 ```java 
    }.compactMap({atlas.textureNamed($0)})
  ``` 
  
  
 小游戏中的范型使用： 
  
   
 ```java 
  泛型式编程是现代编程语言中比较常见的一种能力很多主流编程语言如JAVA，也已经有了泛型的思想。Swift中的泛型可以结合协议（Protocol），类（class），方法（method），拓展（extension）起到抽象类类功能或限制拓展的实现范围等功能。可谓是非常强大。Swift Foundation库中的Array， Dictionary，等基础数据结构都广泛的使用了泛型来达到支持多种数据结构的目的。
  ``` 
  
  
 通常，泛型式编程主要解决了静态强类型语言中方法多态性问题。多态性是指为不同数据类型实体使用统一的方法接口。用单一的符号标识不同的类型。[1] 
 泛化函数参数，解决函数接口多态性问题： 
  
   
 ```java 
  通常函数的多态性可以使用继承关系来实现。但是如果对于同一个接口，需要传入的入参不确定，且不具有继承关系这种情况。一种方法是，对于所有该方法需要支持的数据类型进行分别实现。但这种方法会产生大量的冗余代码。大大降低了代码的可读性和维护性。另一种方法是使用泛型实现，同时，对泛化的类型做约束，保证实现的正确性。
  ``` 
  
  
 梦想小镇中展示弹窗时，我们使用了泛型来编写统一的入口方法： 
  
   
 ```java 
  func show<T: Config, V: CenterConfig & AnimatedView>(with data: T, content: V.Type) {
  ``` 
  
 ```java 
     let window = Popup(frame: view.bounds)
  ``` 
  
 ```java 
         window.tag = Popup.offlineTag
  ``` 
  
 ```java 
         popupView = window
  ``` 
  
 ```java 
         let promotion = content.init(frame: .zero)
  ``` 
  
 ```java 
         view.addSubview(window)
  ``` 
  
 ```java 
         window.centerContent = promotion
  ``` 
  
 ```java 
         window.config(with: data...)
  ``` 
  
 ```java 
         window.showContent(animated: true)
  ``` 
  
 ```java 
  }
  ``` 
  
  
  
   
 ```java 
  该方法是为了给Popup容器输送展示的内容物，并展示出来。由于Popup的内容物和其数据模型���不确定性。如果为每个内容View实现一个show方法，一方面重复代码过多。另一方面，接口过于分散，后期更改时难以维护。所以这里使用了泛型，对数据模型进行一定程度的约束。只要传入遵循`Config `的模型`T`、同时遵循`CenterConfig `和`AnimatedView `的内容View，就可以展示。目前使用泛型的概念，达到了如下图通过一个方法，生成多个弹窗的效果
  ``` 
  
  
  
  
   
 ```java 
  使用这种方式，方便修改，易于维护。当弹窗管理由对单个弹窗实例的管理转变为对多个弹窗实例的弹窗队列管理时。添加队列的方法就可以只对一个弹窗方法进行修改，由设置单一变量，改为添加至队列。
  ``` 
  
  
 合并同质化数据，抽象特质化数据，优化数据结构： 
  
   
 ```java 
  泛型不仅仅可以应用在解决多态性问题上，对数据模型的抽象和封装也有很大的帮助。当多个不同数据结构存在某些共同特征时，可以将共同的特征抽象出来，形成数据容器，这样数据层级一目了然，利于不同层级的View获取数据。例如，小镇的网络请求数据。
  ``` 
  
  
  
   
 ```java 
  {
  ``` 
  
 ```java 
  "msg": "操作成功",
  ``` 
  
 ```java 
  "result": {},
  ``` 
  
 ```java 
  "status": 1
  ``` 
  
 ```java 
  }
  ``` 
  
  
  
   
 ```java 
  外层是用来标识服务端数据状态的信息，data里层是非同质化的数据。这里通常的方案是使用字典来表示内部数据，然后需要用到的时候再使用对应的key值进行获取。
  ``` 
  
 ```java 
  但是小镇的数据模型使用了Swift的Codable协议，使用协议的目标是网络请求回传数据直接生成封装好的数据模型。所以，这里可以将所有网络请求返回数据封装成一个同质化的数据结构NetworkResult,内容的特质化数据`Result`则可以使用泛型，在运行时由调用程序决定。这样上面的json数据则可以转化成为下面的模型。
  ``` 
  
  
  
 ```java 
  
  ``` 
  
  
   
 ```java 
    struct NetworkResult<T>: Codable where T: Codable {
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
     
  ``` 
  
 ```java 
     enum CustomKeys: String, CodingKey {
  ``` 
  
 ```java 
         case code
  ``` 
  
 ```java 
         case message
  ``` 
  
 ```java 
         case result
  ``` 
  
 ```java 
  }
  ``` 
  
 ```java 
     var code: Int?
  ``` 
  
 ```java 
     var message: String?
  ``` 
  
 ```java 
     var result: T?
  ``` 
  
 ```java 
  }
  ``` 
  
  
  
   
 ```java 
  这样使用泛型抽象了特质化的数据，在调用时指定内容数据的数据结构。再结合Swift Codable，网络请求就可以直接返回所需要的数据模型类。如果担心抽象的result太过泛化，则可以如上面的`NetworkResult`，使用`where`关键字要求传入的泛型T遵守Codable的协议。这样可以放心的使用`NetworkResult`结构体对返回的网络请求进行解析了。
  ``` 
  
  
  
 ```java 
  
  ``` 
  
 例如，后端返回的数据为Bool类型的值，使用时需要调用的用网络请求代码如下 
  
   
 ```java 
  NetworkManager.shared.request(remote: info, resultType: NetworkResult<Bool>.self) {[weak self] (status) in
  ``` 
  
 ```java 
             switch status {
  ``` 
  
 ```java 
             case .fail(let error):
  ``` 
  
 ```java 
                 //失败处理
  ``` 
  
 ```java 
                 debugPrint(error?.localizedDescription)
  ``` 
  
 ```java 
                 //当返回出现问题，无法解析数据，返回nil, handler状态不变
  ``` 
  
 ```java 
             case .success(let data):
  ``` 
  
 ```java 
                 if data.message == "成功",
  ``` 
  
 ```java 
                    let resultData = data as? NetworkResult<Bool>,
  ``` 
  
 ```java 
                    let result = resultData.result {
  ``` 
  
 ```java 
                     //改变handler状态
  ``` 
  
 ```java 
                     //获取result的内容Bool
  ``` 
  
 ```java 
                 } else {
  ``` 
  
 ```java 
                     //当服务器返回请求失败时，返回nil，handler状态不变
  ``` 
  
 ```java 
                 }
  ``` 
  
  
 小游戏中遇到的坑��� 
 模型解析的容错 
  
   
 ```java 
  上面提到的Swift Codable，是系统提供的对JSON数据转换为数据模型类的方法。这种方法的API要求数据模型中的每个变量的类型与JSON数据保持一致，否则在解析过程中就会出现异常，如下：
  ``` 
  
  
  
   
 ```java 
   struct ElementModel: Codable {    
  ``` 
  
 ```java 
       enum CodingKeys: String, CodingKey {        
  ``` 
  
 ```java 
         case level        case name    
  ``` 
  
 ```java 
       }    
  ``` 
  
 ```java 
       var level: Int?    
  ``` 
  
 ```java 
       var name: String?    
  ``` 
  
 ```java 
       init(from decoder: Decoder) throws {       
  ``` 
  
 ```java 
         let container = try decoder.container(keyedBy: CodingKeys.self)        
  ``` 
  
 ```java 
         level = try container.decodeIfPresent(Int.self, forKey: .level)        
  ``` 
  
 ```java 
         name = try container.decodeIfPresent(String.self, forKey: .name)   
  ``` 
  
 ```java 
       }
  ``` 
  
 ```java 
  }
  ``` 
  
  
  
   
 ```java 
  上面的**ElementModel**是一个Swift Codable 的数据模型，只有level、name参数类型与数据模型一直的JSON数据才能够正常解析。如：
  ``` 
  
  
  
 ```java 
  
  ``` 
  
  
   
 ```java 
  /* 
  ``` 
  
 ```java 
  与模型参数类型一致的JSON数据可以解析出 ElementModel
  ``` 
  
 ```java 
  level = 10
  ``` 
  
 ```java 
  name = "小五"
  ``` 
  
 ```java 
  */
  ``` 
  
 ```java 
  {
  ``` 
  
 ```java 
   "level":10,
  ``` 
  
 ```java 
   "name":"小五"
  ``` 
  
 ```java 
  }
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
  /* 
  ``` 
  
 ```java 
  与模型参数类型不一致的JSON数据，其ElementModel参数会有缺失
  ``` 
  
 ```java 
  level = nil
  ``` 
  
 ```java 
  name = nil
  ``` 
  
 ```java 
  */
  ``` 
  
 ```java 
  {
  ``` 
  
 ```java 
   "level":"10",
  ``` 
  
 ```java 
   "name":"小五"
  ``` 
  
 ```java 
  }
  ``` 
  
  
  
   
 ```java 
  虽然在日常开发中一般情况下客户端与服务端接口在定制接口协议的时候会提前约定下发字段的类型，然而在实际后端接口下发中，有时会遇到类型不匹配， 发生崩溃。为了解决这个问题，可以采取如下的方式兼容Codable的解析:
  ``` 
  
  
  
   
 ```java 
  struct ElementModel: Codable {
  ``` 
  
 ```java 
     
  ``` 
  
 ```java 
     enum CodingKeys: String, CodingKey {
  ``` 
  
 ```java 
         case level
  ``` 
  
 ```java 
         case name
  ``` 
  
 ```java 
     }
  ``` 
  
 ```java 
     
  ``` 
  
 ```java 
     var level: Int?
  ``` 
  
 ```java 
     var name: String?
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
     init(from decoder: Decoder) throws {
  ``` 
  
 ```java 
         let container = try decoder.container(keyedBy: CodingKeys.self)
  ``` 
  
 ```java 
         level = ElementModel.decodeIntValue(by: decoder, for: .level, container: container);
  ``` 
  
 ```java 
         name = ElementModel.decodeStringValue(by: decoder, for: .name, container: container);
  ``` 
  
 ```java 
     }
  ``` 
  
 ```java 
      //兼容解析Int类型的数据
  ``` 
  
 ```java 
     static func decodeIntValue(by decoder:Decoder,for key:ElementModel.CodingKeys,container:KeyedDecodingContainer<CodingKeys>) -> Int {
  ``` 
  
 ```java 
         var rtValue:Int = 0;
  ``` 
  
 ```java 
         if let intValue = try? container.decodeIfPresent(Int.self, forKey: key) {
  ``` 
  
 ```java 
             rtValue = intValue
  ``` 
  
 ```java 
         } else if let stringValue = try? container.decodeIfPresent(String.self, forKey: key) {
  ``` 
  
 ```java 
             rtValue = Int(stringValue) ?? 0
  ``` 
  
 ```java 
         } else if let doubleValue = try? container.decodeIfPresent(Double.self, forKey: key) {
  ``` 
  
 ```java 
             rtValue = Int(doubleValue)
  ``` 
  
 ```java 
         } else {
  ``` 
  
 ```java 
             rtValue = 0
  ``` 
  
 ```java 
         }
  ``` 
  
 ```java 
         return rtValue
  ``` 
  
 ```java 
     }
  ``` 
  
 ```java 
         //兼容解析String类型的数据
  ``` 
  
 ```java 
        static func decodeStringValue(by decoder:Decoder,for key:ElementModel.CodingKeys,container:KeyedDecodingContainer<CodingKeys>)  -> String {
  ``` 
  
 ```java 
         var rtValue:String = "";
  ``` 
  
 ```java 
         if let stringValue = try? container.decodeIfPresent(String.self, forKey: key) {
  ``` 
  
 ```java 
             rtValue = stringValue
  ``` 
  
 ```java 
         } else if let intValue = try? container.decodeIfPresent(Int.self, forKey: key) {
  ``` 
  
 ```java 
             rtValue = String(intValue)
  ``` 
  
 ```java 
         } else if let doubleValue = try? container.decodeIfPresent(Double.self, forKey: key) {
  ``` 
  
 ```java 
             rtValue = String(doubleValue)
  ``` 
  
 ```java 
         } else {
  ``` 
  
 ```java 
             rtValue = ""
  ``` 
  
 ```java 
         }
  ``` 
  
 ```java 
         return rtValue
  ``` 
  
 ```java 
     }
  ``` 
  
 ```java 
  }
  ``` 
  
  
  
 ```java 
  
  ``` 
  
 SKSpritekit坐标系 
  
   
 ```java 
  UIView的坐标系默认原点在左上角，也就是左上角坐标为（0，0），锚点的位置为中心（0.5，0.5）；
  ``` 
  
  
 SKScene的左边系默认原点在坐下角，也就是左下角的坐标为（0，0），锚点的默认位置也是左下角（0，0）；  
 SpriteNode的默认坐标原点在中心，也就是中心位置的坐标为（0，0），锚点位置也是在中心（0.5，0.5）。 
 UIView修改锚点位置不会改变原点的位置，但是SpriteNode修改锚点的位置，会改变原点的位置，下图中修改出售Node的锚点位置，设置同样的坐标，出售Node的位置会不一样。 
  
   
 ```java 
  //使用默认锚点位置（0.5，0.5），此时的原点在中心位置
  ``` 
  
 ```java 
    private lazy var sellButtonNode: SKSpriteNode = {
  ``` 
  
 ```java 
        let texture = SKTexture(imageNamed: "btn_bottom_sell")
  ``` 
  
 ```java 
        let node = SKSpriteNode(texture: texture, size: CGSize(width: 60, height: 60))
  ``` 
  
 ```java 
  //       node.anchorPoint = CGPoint(x: 0, y: 0)
  ``` 
  
 ```java 
        node.position = CGPoint(x: 30, y: 114)
  ``` 
  
 ```java 
        let sellBody = SKPhysicsBody(rectangleOf: node.size)
  ``` 
  
 ```java 
        sellBody.categoryBitMask = PhysicsCategory.sellButton
  ``` 
  
 ```java 
        sellBody.isDynamic = false
  ``` 
  
 ```java 
        node.physicsBody = sellBody
  ``` 
  
 ```java 
        node.name = "normalsell"
  ``` 
  
 ```java 
        return node
  ``` 
  
 ```java 
    }()
  ``` 
  
  
  
   
  
  
   
   
    
 ```java 
  //修改默认锚点位置（0，0），此时的原点位置移动到左下角
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
    private lazy var sellButtonNode: SKSpriteNode = {
  ``` 
  
 ```java 
        let texture = SKTexture(imageNamed: "btn_bottom_sell")
  ``` 
  
 ```java 
        let node = SKSpriteNode(texture: texture, size: CGSize(width: 60, height: 60))
  ``` 
  
 ```java 
        node.anchorPoint = CGPoint(x: 0, y: 0)
  ``` 
  
 ```java 
        node.position = CGPoint(x: 30, y: 114)
  ``` 
  
 ```java 
        let sellBody = SKPhysicsBody(rectangleOf: node.size)
  ``` 
  
 ```java 
        sellBody.categoryBitMask = PhysicsCategory.sellButton
  ``` 
  
 ```java 
        sellBody.isDynamic = false
  ``` 
  
 ```java 
        node.physicsBody = sellBody
  ``` 
  
 ```java 
        node.name = "normalsell"
  ``` 
  
 ```java 
        return node
  ``` 
  
 ```java 
    }()
  ``` 
 
  
  
   
 SKView和UIView的交互问题： 
  
  UIView上不能直接添加SKSpriteNode和SKScene，需要通过SKView实现。具体需要先在UIView上添加SKView为子视图，SKView上添加SKScene，然后再添加SKSpriteNode到SKScene上。 
  SKSpriteNode和SKScene上不能添加UIView。 
  
  
   
 ```java 
  self.view.addSubview(skView)
  ``` 
  
 ```java 
  skView.presentScene(GameScene)
  ``` 
  
 ```java 
  GameScene.addChild(foundationNode)
  ``` 
  
  
 混编API参数类型兼容问题：
  
  
  
   
   
    
 ```java 
  在混编环境下，大部分的OC函数都可以在Swift中很方便的直接调用。然而有部分API在使用时需要增加一些兼容逻辑，如：id类型的问题。我们需要对这种API的参数进行一些类型强转操作，导致调用起来并不是那么顺手。这种情况下，我们会选择将这些API进行类型的转换装。这样封装后的API就可以很方便的调用了。
  ``` 
 
  
  
  例如下面的API：
  
  
  
   
   
    
 ```java 
  @interface ObjectCache : NSObject
  ``` 
  
 ```java 
  - (id)objectForKey:(NSString *)key;
  ``` 
  
 ```java 
  @end
  ``` 
 
  
  
  
  
  
  
   
   
    
 ```java 
  当我们在使用这个API时，返回结果类型是一个id类型。需要将获取到的结果进行类型转换才能正常使用，不是特别方便。于是我们对这个API进行封装，增加多个便利的API供Swift使用。
  ``` 
 
  
  
  
  
  
  
   
   
    
 ```java 
    @interface ObjectCache : NSObject
  ``` 
  
 ```java 
  - (id)objectForKey:(NSString *)key;
  ``` 
  
 ```java 
  - (BOOL)boolForKey:(NSString *)key;
  ``` 
  
 ```java 
  - (NSInteger)integerForKey:(NSString *)key;
  ``` 
  
 ```java 
  - (CGFloat)floatForKey:(NSString *)key;
  ``` 
  
 ```java 
  @end
  ``` 
 
  
  
   
  
   
    
     
      
       
        
        04 
        
       
      
     
    
    
     
      
      同城Swift版小游戏的收益 
      
     
     
      
       
        
       
      
     
    
   
  
  
 ```java 
  包大小与游戏首次进入时长收益：
  ``` 
  
  
   
 ```java 
  在App冷启动过程中，游戏中大部分图片资源都通过预加载的方式下载，节约了4.7M的包大小。同时，在相较之前H5小游戏， 因为很难使用资源预加载方案，导致首次进入游戏场景较慢。而Native版小游戏，在不同机型中，成功将首次启动时间控制在2秒以下， 较H5的游戏进入时间提升了3倍以上，具体数据详见下图：           
  ``` 
  
  
  
 ```java 
      
  ``` 
  
 FPS游戏帧率收益： 
  
   
 ```java 
  由于Swift良好的代码执行速度，相对于H5小游戏，在不同的业务场景下小游戏FPS（帧率）提升至少15%以上
  ``` 
  
  
  
 内存使用收益： 
  
   
 ```java 
  内存占用方面，因Swift语言特点，业务中大量使用了值类型而非引用类型，在出栈后会变量会直接释放；同时，Swift中引用类型也是通过引用计数管理对象的生命周期，而非GC，所以原生小游戏内存占用比H5小游戏在主要的业务场景中， 内存使用至少降低了20%。
  ``` 
  
  
  
 ```java 
   
  ``` 
  
 梦想小镇资源加载优化： 
  
  
  每次App冷启动， 从后端获取图片下发资源的配置表； 
  若配置表资源有更新，根据配置表中图片资源的地址进行下载， 并将下载结果进行缓存； 
  用户点击梦想小镇游戏入口， 因资源已预加载完毕，直接读取本地图片进行游戏场景加载。 
  
 预加载流程收益： 
  
  与内置方案相比，可降低4.7M包大小体积； 
  Native预加载 VS  H5进入游戏场景加载， 首次进入游戏加载时间降低70%以上，极大提高首次进入游戏的成功率。 
  
  
 ####  
  
   
    
     
      
       
        
        05 
        
       
      
     
    
    
     
      
      对业界可借鉴的经验进行一下总结 
      
     
     
      
       
        
       
      
     
    
   
  
 ####  
 通过在同城中对游戏业务模式的探索，我们当前有些心得分享给大家 
  
  使用Swift研发业务， 可通过混编的方式，降低Swift的研发成本。如一些OC中间层的能力， 如网络库、日志库可，可在Swift代码中通过混编的方式调用OC版本的接口， 后续在逐步改造成Swift版本。 
  对于Native的小游戏场景， 为了解决苹果审核问题， 可采用SpriteKit+Swift的研发方式，学习成本较低，游戏性出色。 
  对于包大小的问题， 可通过资源的动态下载的方式处理，部分非必要的游戏场景， 进入游戏后在进行资源的 
  
 由于同城小游戏还在持续迭代中，对于后续的一些经验的分享，也会进行持续的更新，敬请期待。 
 如想对58技术了解更多，请关注我们的开源项目：基于Mach-O性能工具集（内含静态库、动态库、Mach-O的包大小检测工具）：https://github.com/wuba/WBBlades。 
 同时， 作为58同城用价部门，我们时刻关注新的技术领域，如机器学习、AR技术、各种大前端的设计方案， 并且负责App的启动耗时、包大小等各种核心指标的优化。如您对新技术、在超大型App上持续优化有深厚的兴趣以及动力，欢迎与我们并肩作战，请投递你的简历发送至：jiangyan05@58.com，期待你的加入！ 
 ####  
  
 #### 作者简介 
  
  蒋演：58同城-用户价值增长部 
  王新元：58同城-用户价值增长部 
  张容：58同城-用户价值增长部 
  王晓晖：58同城-用户价值增长部 
  
  
 #### 参考文献 
 Swift官方API设计规范 
 Airbnb Swift Style Guide 
  
  表格.xlsx 
  
 
本文分享自微信公众号 - 58技术（architects_58）。如有侵权，请联系 support@oschina.cn 删除。本文参与“OSC源创计划”，欢迎正在阅读的你也加入，一起分享。
                                        