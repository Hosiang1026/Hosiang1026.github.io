---
title: 推荐系列-如何只使用CSS提升页面渲染速度
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 2058
cover_picture: 'https://oscimg.oschina.net/oscnet/a8cae92a-02eb-4036-a8a6-d382ce8bb34b.png'
abbrlink: 98dd32af
date: 2021-04-15 09:46:45
---

&emsp;&emsp;作者 | Rumesh Eranga Hapuarachchi 译者 | 张健欣 策划 | 田晓旭 用户喜欢快速的 Web 应用。他们期望页面加载速度快，运行流畅。如果滚动时出现动画中断或延迟，用户很可能就会离开你的网站...
<!-- more -->

                                                                                                                                                                                         
 作者 | Rumesh Eranga Hapuarachchi 
  
  
    译者 | 张健欣 
   
  
    策划 | 田晓旭 
   
   
    
   
   
    
   
  用户喜欢快速的 Web 应用。他们期望页面加载速度快，运行流畅。如果滚动时出现动画中断或延迟，用户很可能就会离开你的网站。作为一名开发者，你可以做很多事情来提升用户体验。本文主要介绍你可以用来提升页面渲染速度的 4 个 CSS 技巧。 
   
   1. Content-visibility 
   
  一般来说，大部分 Web 应用都有复杂的 UI 元素，并且它的扩展超出了用户在浏览器视图中所能看到的范围。在这种情况下，我们可以使用 
 ```java 
  content-visibility
  ``` 
 来跳过渲染屏幕之外的内容。如果你有大量屏幕之外的内容的话，这会大大减少页面渲染时间。 
  这个功能是最新添加的功能之一，而且它是提升渲染性能最有影响力的功能之一。 
 ```java 
  content-visibility
  ``` 
 接受几个值，我们可以在一个元素上使用 
 ```java 
  content-visibility: auto;
  ``` 
 来立即获得性能提升。 
  我们可以看下面这个页面，包含很多显示不同信息的卡片。虽然屏幕能显示大约 12 个卡片，但列表中有差不多 375 个卡片。如你所见，浏览器花费 1037ms 来渲染这个页面。 
  ![Test](https://oscimg.oschina.net/oscnet/a8cae92a-02eb-4036-a8a6-d382ce8bb34b.png  '如何只使用CSS提升页面渲染速度')一般 HTML 页面 
  下一步，你可以向所有的卡片中加入 
 ```java 
  content-visibility
  ``` 
 。 
   
  ![Test](https://oscimg.oschina.net/oscnet/a8cae92a-02eb-4036-a8a6-d382ce8bb34b.png  '如何只使用CSS提升页面渲染速度')使用 content-visibility 
  如你所见，content-visibility 的功能很强大，对于改善页面渲染时间非常有用。根据我们目前为止讨论的内容，你一定在想它是针对页面渲染的灵丹妙药。 
   
   content-visibility 的限制 
   
  然而，也有一些领域 content-visibility 不适合。我想强调 2 点供你考虑。 
  这个功能还是实验性的。目前，Firefox（PC 和 Android 版本）、Internet Explorer (我不认为他们计划向 IE 中添加这个功能) 以及 Safari (Mac 和 iOS) 不支持 content-visibility。 
  与滚动条行为相关的问题。由于元素最初渲染的高度是 0px，当你向下滚动时，这些元素会进入屏幕。实际的内容会被渲染，这个元素的高度会被相应地更新。这会使滚动条出现预料之外的行为。 
  ![Test](https://oscimg.oschina.net/oscnet/a8cae92a-02eb-4036-a8a6-d382ce8bb34b.png  '如何只使用CSS提升页面渲染速度')使用 content-visibility 的滚动行为 
  
    为了修复这个滚动条问题，你可以使用另一个 CSS 属性， 
    
 ```java 
  contain-intrinsic-size
  ``` 
 。它指定了一个元素的自然大小。因此，这个元素会用指定的高度渲染，而不是 0px。 
    
   
   
    
 ```java 
  .element{    content-visibility: auto;    contain-intrinsic-size: 200px;}
  ``` 
  
   
  然而，在实验时，我发现即使使用 
 ```java 
  containt-intrinsic-size
  ``` 
 ，如果我们有很多元素都使用 
 ```java 
  content-visibility
  ``` 
 且设置为 
 ```java 
  auto
  ``` 
 ，你仍然会有微小的滚动条问题。因此，我的建议是规划你的布局，将它分解为几个部分，然后在那几个部分上使用 content-visibility 来获取更好的滚动条行为。 
   
   2. 
 ```java 
  Will-change
  ``` 
 属性 
   
  浏览器上的动画并不是一个新鲜事物。通常，这些动画与其它元素一起正常渲染。然而，浏览器现在能够使用 GPU 来优化这些动画的某些操作。 
   
  底层发生的是，浏览器会为这个元素创建一个单独的层。然后，浏览器将这个元素的渲染委托给 GPU，以及其它一些优化。由于 GPU 加速接管了动画渲染，最终这个动画会更流畅。 
  
    考虑如下 CSS 类： 
    
   
   
    
 ```java 
  // In stylesheet.animating-element {  will-change: opacity;}// In HTML<div class="animating-elememt">  Animating Child elements</div>
  ``` 
  
   
  当在浏览器中渲染上面的代码时，它会识别出 
 ```java 
  will-change
  ``` 
 属性，并优化未来与不透明度 opacity 相关的变更。 
   
  ![Test](https://oscimg.oschina.net/oscnet/a8cae92a-02eb-4036-a8a6-d382ce8bb34b.png  '如何只使用CSS提升页面渲染速度')不使用 will-change；图片来源：Maximilian 
  ![Test](https://oscimg.oschina.net/oscnet/a8cae92a-02eb-4036-a8a6-d382ce8bb34b.png  '如何只使用CSS提升页面渲染速度')使用 will-change；图片来源：Maximilian 
   
   什么时候不要用 will-change 
   
  尽管 
 ```java 
  will-change
  ``` 
 是用来提升性能的，但如果你误用它，也会降低 Web 应用的性能。 
  使用 
 ```java 
  will-change
  ``` 
 表明这个元素将来会改变。 
  
    因此，如果你试图将 
    
 ```java 
  will-change
  ``` 
 与同步动画一起使用，它不会给你优化。因此，建议在父元素上使用 will-change，在子元素上使用动画。 
    
   
   
    
 ```java 
  .my-class{  will-change: opacity;}.child-class{  transition: opacity 1s ease-in-out;}
  ``` 
  
   
  不要使用未设置动画的元素。当你在一个元素上使用 
 ```java 
  will-change
  ``` 
 ，浏览器会尝试通过将它放到一个新层中并将转换移交给 GPU 来优化它。如果你没有要转换的东西，这会导致资源浪费。 
  最后要记住的是，建议在完成所有动画之后将 will-change 从元素上删除。 
   
   3. 减少渲染阻塞时间 
   
  今天，许多 Web 应用必须满足许多形式因素，包括 PC、平板电脑和移动手机等。为了实现这种响应式特性，我们必须根据媒介大小编写新的样式。在页面渲染时，直到 CSS 对象模型（CSS Object Model，CSSOM）准备就绪，它才开始渲染阶段。根据你的 Web 应用，你可能有一个很大的样式表来满足所有的设备形式因素。 
   
   
     然而，假设我们根据形式因素将它拆分成多个样式表。在这种情况下，我们可以只让主 CSS 文件阻塞关键路径，并将其优先下载，让其它样式表以低优先级的方式下载。 
     
    
    
     
 ```java 
  <link rel="stylesheet" href="styles.css">
  ``` 
  
    
   
  ![Test](https://oscimg.oschina.net/oscnet/a8cae92a-02eb-4036-a8a6-d382ce8bb34b.png  '如何只使用CSS提升页面渲染速度')单个样式表 
  
    在将它分解成多个样式表后： 
    
   
   
    
 ```java 
  <!-- style.css contains only the minimal styles needed for the page rendering --><link rel="stylesheet" href="styles.css" media="all" /><!-- Following stylesheets have only the styles necessary for the form factor --><link rel="stylesheet" href="sm.css" media="(min-width: 20em)" /><link rel="stylesheet" href="md.css" media="(min-width: 64em)" /><link rel="stylesheet" href="lg.css" media="(min-width: 90em)" /><link rel="stylesheet" href="ex.css" media="(min-width: 120em)" /><link rel="stylesheet" href="print.css" media="print" />
  ``` 
  
   
  ![Test](https://oscimg.oschina.net/oscnet/a8cae92a-02eb-4036-a8a6-d382ce8bb34b.png  '如何只使用CSS提升页面渲染速度') 
  如你所见，根据形式因素拆分样式表能够减少渲染阻塞时间。 
   
   4. 避免使用 @import 来包含多个样式表 
   
  使用 
 ```java 
  @import
  ``` 
 ，我们可以在一个样式表中包含另一个样式表。当我们在处理一个大型项目时，使用 
 ```java 
  @import
  ``` 
 会让代码更简洁。 
   
   关于 @import 的一个关键事实是，它是一个阻塞调用，因为它必须发起一个网络请求来获取这个文件，解析它，然后将它包含在样式表中。如果我们在样式表中有嵌套的 @import，它会妨碍渲染性能。 
    
     
 ```java 
  # style.css@import url("windows.css");# windows.css@import url("componenets.css");
  ``` 
  
    
   
  ![Test](https://oscimg.oschina.net/oscnet/a8cae92a-02eb-4036-a8a6-d382ce8bb34b.png  '如何只使用CSS提升页面渲染速度')使用 imports 的瀑布图 
  与其使用 
 ```java 
  @import
  ``` 
 ，我们可以使用多个链接 link 实现相同的功能且具有更好的性能，因为它允许并行下载样式表。 
  ![Test](https://oscimg.oschina.net/oscnet/a8cae92a-02eb-4036-a8a6-d382ce8bb34b.png  '如何只使用CSS提升页面渲染速度')使用链接的瀑布图 
   
       结论     
   
  除了本文我们讨论的 4 个方面，还有一些其它的方法我们可以使用 CSS 来提高 Web 页面的性能。CSS 最新的特性之一， 
 ```java 
  content-visibility,
  ``` 
 在未来几年看起来很有前景，因为它可以在页面渲染方面带来数倍的性能提升。 
   
  我相信，你可以结合以上特性，为最终用户构建性能更好的 Web 应用。我希望这篇文章是有用的，如果你知道任何可以提升 Web 应用性能的 CSS 技巧，请在评论中留言。谢谢！ 
   
    延伸阅读 
   
  https://blog.bitsrc.io/improve-page-rendering-speed-using-only-css-a61667a16b2 
  
  
 #### 最后 
  
   
  
  
   
    
     
      
      “在看和转发” 
      就是最大的支持 
      
     
    
   
  
 
本文分享自微信公众号 - 前端壹栈（Ecmscript）。如有侵权，请联系 support@oschina.cn 删除。本文参与“OSC源创计划”，欢迎正在阅读的你也加入，一起分享。
                                        