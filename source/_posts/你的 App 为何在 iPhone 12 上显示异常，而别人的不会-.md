---
title: 推荐系列-你的 App 为何在 iPhone 12 上显示异常，而别人的不会-
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 620
cover_picture: 'https://oscimg.oschina.net/oscnet/fbe79c30-6671-4e94-bcf7-d98045cec1b7.png'
abbrlink: b3172a17
date: 2021-04-15 09:16:39
---

&emsp;&emsp;作者 | hite和落雁 来源 | 简书，点击阅读原文查看作者更多文章 背景 10月14日 iPhone 12 系列正式发布，当我观看直播看到介绍 iPhone 12 系列的分辨率后，我注意到这些分辨率是全新的，我立...
<!-- more -->

                                                                                                                                                                                         
  
   
  
  
  作者 | hite和落雁来源 | 简书，点击阅读原文查看作者更多文章 
   
  
  
 #### 背景 
 10月14日 iPhone 12 系列正式发布，当我观看直播看到介绍 iPhone 12 系列的分辨率后，我注意到这些分辨率是全新的，我立即在群里吐槽——又需要适配一波了。我以为只是宽高变化会导致字号、间距的变化，然而更严重的问题是我们判断是否是刘海屏使用了如下代码（这种写法是不完善的，但我相信很多 App 里都是这么写的）； 
  ```java 
  self.is_iphonex =  (SCREEN_MAX_LENGTH==812.f || SCREEN_MAX_LENGTH==896.f);
  ```  
 是否是刘海屏是枚举所有符合预期的设备高度来判断的，它的好处是快速稳定，但遇到新机型就悲催了。在新 iPhone 12 系列中，屏幕高度分别为： 
  
   
    
    Device 
    Retina 
    屏幕点(pt) 
    物理像素 (px) 
    
   
   
    
    iPhone 12 Pro Max 6.7″ 
    3X 
    926 x 428 
    2778 x 1284 
    
    
    iPhone 12 Pro 6.1″ 
    3X 
    390 x 844 
    2532 x 1170 
    
    
    iPhone 12 6.1″ 
    3X 
    390 x 844 
    2532 x 1170 
    
    
    iPhone 12 Mini 5.4″ 
    3X 
    360 x 780 
    2340 x 1080 
    
    
    iPhone 11 Pro Max 
    3X 
    414 x 896 
    2688 x 1242 
    
   
  
 所以如果( ```java 
  SCREEN_MAX_LENGTH==812.f || SCREEN_MAX_LENGTH==896.f
  ``` ) 代码来判断刘海屏，定位导航栏位置肯定是错误的。预期表现是导航栏被刘海遮住。 
 实际情况如何呢？ 
  
 #### 巡查App Store 的 App 在 iPhone 12 的表现 
 当我拿到蓝色 iPhone 12 的第一件事情就是看看各个 App 在适配方面有哪些异常表现，大概看了10 几个 App，除了 斗鱼，哔哩哔哩 外大部分适配都没有大问题。 
 ![Test](https://oscimg.oschina.net/oscnet/fbe79c30-6671-4e94-bcf7-d98045cec1b7.png  '你的 App 为何在 iPhone 12 上显示异常，而别人的不会-') 
 有问题，我不意外，但是其他 App ，包括我们自己的 App，全屏的界面导航都没问题。 
 ![Test](https://oscimg.oschina.net/oscnet/fbe79c30-6671-4e94-bcf7-d98045cec1b7.png  '你的 App 为何在 iPhone 12 上显示异常，而别人的不会-') 
  
 #### 为什么有些 OK，有些异常？ 
 经过实际测试，用 Xcode 12.0 和 Xcode 12.1 分别在真机 iPhone 12 上运行；发现 Xcode 12.1 build 的 App 真机运行是有问题的。目前 App Store 里运行有问题的 App，如斗鱼，都是用了最新版本 Xcode 12.1 上传的 ipa。 
 所以二者的的差别在哪里？ 
 观察到， Xcode 12.1 里已经有 iPhone 12 的模拟器，所以说 Xcode 12.1 是认识 iPhone 12 的。回想几年前当 iPhone X 出现时，旧的 App 是如何在 iPhone X 上表现的—— App 运行在屏幕的中间，上下部分都留有黑边，表现如我找到网络图： 
 ![Test](https://oscimg.oschina.net/oscnet/fbe79c30-6671-4e94-bcf7-d98045cec1b7.png  '你的 App 为何在 iPhone 12 上显示异常，而别人的不会-') 
 这里引出所谓的兼容模式。 
  
 #### 苹果 App 的向后兼容规则 
 当 App 运行在自己不认识的新设备上时，系统会把新设备当做上一代的设备来使用。换言之，新设备运行的 App 在兼容模式，避免 App 去处理 build 之时还不存在的设备上逻辑。 
  
 这个兼容规则也用着显示模式的设置里（在用户在设置 -> 显示和亮度 -> 放大显示 里设置了放大效果）。 
 例如， iPhone 11 Pro Max 标准显示（Standard Zoom） 下分辨率是 414×896 points；而如果设置为放大显示（Display Zoom）会被当做 iPhone 11 Pro 设备，此时分辨率是 375×812 points。当设备运作在兼容模式，大部分设备的一些常见的高度，如 statusbar、 bottombar 的尺寸会被影响。 
  
 除了运行在兼容模式，退化为旧设备分辨率外，iPhone 还有一种尺寸适配策略：downsampling，例如全新一代的 iPhone12 mini，被当做 iPhone 11 Pro 渲染即 375×812 points，如果按照3x 图渲染，实际的渲染像素是 1125 x 2436，在 1080×2340 pixel 屏幕上显示不下，需要 downsampling / 1.04，不能按照 3x 图渲染；这样导致它的顶部安全距离是奇葩的 50 pt。 
 关于如何 downsampling ，这里用 8P 的渲染示例，截图取自 
 ![Test](https://oscimg.oschina.net/oscnet/fbe79c30-6671-4e94-bcf7-d98045cec1b7.png  '你的 App 为何在 iPhone 12 上显示异常，而别人的不会-') 
  
 #### 结论 
 因为用 Xcode 12.0 打的 ipa，在 iPhone 12 上运行在兼容模式，尺寸是 iPhone 11，重点是顶部安全距离、底部安全距离都和 iPhone 11 保持一致，所以不会有问题；而用 Xcode 12.1 打的包，采用全新的分辨率运行，如果没有适配，肯定出问题。关注公众号 逆锋起笔，回复 pdf，下载你需要的各种学习资料。 
 因为今年疫情的影响导致苹果产品发布流程被打乱，出现了 Xcode 版本早于 iPhone 真机上市的情况，导致一些线上 App 在新机上有兼容问题。 
  
 #### 附录 
 1、正确判断是否是刘海屏的方法，苹果会推荐我们使用 safeAreaInsets 来获取。如从 ViewController.view 获取时，时机太迟了，需要从更早创建的地方获取如 keyWindow，如： 
  ```java 
  + (CGFloat)topOffset{    if (@available(iOS 11, *)) {        return [UIApplication sharedApplication].keyWindow.safeAreaInsets.top;// 其实也有隐患，如果是从推送打开 App ，可能还不存在 keyWindow    }        return 20;}
  ```  
 直接使用 topOffset 来设置顶部安全距离或者通过判断 bottomOffset 是否大于 0 来确认是否是刘海屏，进而设置不同尺寸。 
 2、如果是判断刘海屏然后再加 statusbar 高度的作法（不推荐），你还需要完整的 statusbar 高度的表； 
  ```java 
  iPhone11: 48iPhone12/12 pro/12 pro max: 47iPhone12 mini: 50iPad Pro、IPad Air: 24Other iPhones: 44.非刘海屏：20
  ```  
  
 #### 参考 
 [1] https://links.jianshu.com/go?to=https%3A%2F%2Fhacknicity.medium.com%2Fhow-ios-apps-adapt-to-the-various-iphone-12-screen-sizes-e45c021e1b8b[2] https://links.jianshu.com/go?to=https%3A%2F%2Fdeveloper.apple.com%2Fvideos%2Fplay%2Fwwdc2019%2F224%2F%3Ftime%3D123[3]https://links.jianshu.com/go?to=https%3A%2F%2Fwww.paintcodeapp.com%2Fnews%2Fultimate-guide-to-iphone-resolutions 
  
  
  这 14 款 APP，违法，违规！ 
   
  
  
  App Clip 离落地有多远？ 
   
  
  
  iOS APP图标版本化 
   
  
  
  12 岁学习编程，17 岁香港高中生成苹果 WWDC2020 Swift 开发者挑战赛赢家！ 
   
  
  
 ![Test](https://oscimg.oschina.net/oscnet/fbe79c30-6671-4e94-bcf7-d98045cec1b7.png  '你的 App 为何在 iPhone 12 上显示异常，而别人的不会-') 
 点个『在看』支持下 ![Test](https://oscimg.oschina.net/oscnet/fbe79c30-6671-4e94-bcf7-d98045cec1b7.png  '你的 App 为何在 iPhone 12 上显示异常，而别人的不会-') 
 
本文分享自微信公众号 - code小生（codexiaosheng）。如有侵权，请联系 support@oschina.cn 删除。本文参与“OSC源创计划”，欢迎正在阅读的你也加入，一起分享。
                                        