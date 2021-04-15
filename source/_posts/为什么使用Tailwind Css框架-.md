---
title: 推荐系列-为什么使用Tailwind Css框架-
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 887
cover_picture: 'https://oscimg.oschina.net/oscnet/0bfa44b8-69f7-41d9-87cd-6fa160b9f68b.png'
abbrlink: 5ef9891a
date: 2021-04-15 09:08:53
---

&emsp;&emsp;在还没有前端开发这个概念的时代，CSS 其实作为一个比较简单的 DSL 还相对凑合够用，但随着前端项目越来越复杂，前端各种开发模式都在随着项目规模扩大的需求而不断进化，比如前端服务上我们...
<!-- more -->

                                                                                                                                                                                         
  
   
   在还没有前端开发这个概念的时代，CSS 其实作为一个比较简单的 DSL 还相对凑合够用，但随着前端项目越来越复杂，前端各种开发模式���在随着项目规模扩大的需求而不断进化，比如前端服务上我们由服务端直出变为简单的前后端分离再慢慢的升级成前后端融合的 serverless，再比如 JS 的写法上我们从开始最原始的单文件脚本慢慢引入了各种模块化的方案再到今天组件化全面开花。同样的进化当然也会发生在 CSS 的开发上。 
   CSS 作为一个（曾经）只有全局作用域的 DSL 其实从来都不适合大型工程，毕竟 HTML 被发明时只是用来写文档，CSS 也只是为了加些简单的样式而不是设计用于富应用的。但随着前端项目规模的扩大， CSS 也不得不适应这一历史进程。在 node 刚刚被发明前后那段时间前端工程化还不是很成熟的阶段，工程师们想了各种办法来尽量缓和这一矛盾，比如 BEM、OOCSS、SMACSS 等命名方案来分离关注点，又比如 less、Sass 等工具丰富一下 CSS 的语法并且可以有一个 build 的过程使 CSS 有了初级的模块化能力。但 CSS 不适用于大型工程的问题依然严重，Facebook 的开发经理（也是 prettier 的作者之一）vjeux 在 2014 年的一次演讲[1]中总结了 CSS 不适用于大型项目的几个痛点。 
   ![Test](https://oscimg.oschina.net/oscnet/0bfa44b8-69f7-41d9-87cd-6fa160b9f68b.png 为什么使用Tailwind Css框架-) 
    
   #### Why CSS modules 
   CSS modules 就是为了解决上面那些痛点而被发明的，具体的原理就是通过编译生成全局唯一类名，从而完全不用类名样式担心冲突。它很好的解决了项目规模增大的问题，配合 less 或者 Sass 这种预处理器也可以实现相当程度的工程化，对于大部分的场景他已经足够使用。但 CSS modules 也有着��自己的缺点： 
    
     
     
       如果你重度使用了 less 或者 Sass 这种预处理器，引入了各种变量、mixin、函数等等特性，会造成 JS 和 CSS 中工程化生态的割裂。 
      
     
     
       不好删代码：一来只要是 CSS 文件就让人有 copy-paste 的欲望很容易造成代码的冗余，二来 CSS 文件里的类没法和外面的 JS 代码关联起来，需要借助额外的工具才能引入类型系统。虽然不一定会影响最终的代码体积（ 
      PurgeCSS 
      [2]），但对于工程的可读性和可维护性还是有一定污染的。 
      
    
   个人还有很讨厌 CSS modules 的一点就是一旦你用 CSS modules 你就必须得分两个文件，对于可读性的影响积累下来其实非常大，碰到一个稍微复杂一点的组件就得左右两头来回改。现代基于组件的 web 开发其实更适合把模板、逻辑、样式都尽量放在一起，最好是放在一个文件[3]里。 
    
   #### Why CSS in JS 
   其实相比于 CSS modules，CSS in JS 的方案被 vjeux 提出的时间要更早，当然最开始的 CSS in JS 基本上可以理解为单纯的把行内样式放到对象里去，与目前流行的基于 Tagged Templates 的 CSS in JS 方案差别非常大。 
   得益于组件化理念深入人心，开发者们不再关心具体的 HTML 和 CSS，复用组件就是安装引入 npm 包后直接使用。CSS in JS 的方案可以很好的契合这一开发方式，开发者不需要引入 CSS，不再需额外处理 CSS 的 bundle、prefix，所有都是 JS 也就不再需要配置各种 CSS 预处理器，极大降低了开发成本。 
    
    
   #### Why Tailwind CSS 
   https://tailwindcss.com/ 
   Tailwind CSS 其实就是把在现代工程化框架里把原子 CSS 做到极致的一个 CSS 框架。其实原子 CSS 很早就出现了，最经典的如  ```java 
  clearfix
  ```  ，在很多早期的 web 项目里都会有或多或少的原子 CSS。但早期的原子 CSS 并不被认为是一种最佳实践，或者说被认为是一种很差的方案。那个时代提倡所谓的「关注点分离」，HTML 的 class 应该有自己的语义，不应该把样式或者逻辑附在上面。不过随着时代的发展，在组件化流行的今天我们其实已经并不怎么关心 HTML 的语义（甚至那都不是 HTML，叫 JSX），语义化的功能已经被组件所取代了。对于每一个 div 标签，我们关心的其实只有他的样式��在这种背景下原子 CSS 就显得很有用了。 
    
   ##### 使用统一的「系统」变量可以极大减小心智负担。 
    
   在今天一个稍微严肃一点的前端项目，都会有一套所谓的「设计语言」（哪怕是直接套用现有的），他会规范页面中各种元素的「Design Token」，比如蓝色是那个蓝，红色是哪个红，圆角是多少间距是多少。现在比如说我需要把需要把这个按钮的背景色变成蓝色，你该怎么写？只是为了完成需求那笨办法有很多无庸赘述，但我们其实应该把这个我们所用的设计语言的「Design Token」在工程里维护起来。tailwind 天然就支持这一点。 
    ```java 
  // BAD.button {  background: #3370ff; // 不知道哪里来的神秘字符串}// GOOD.button {  @apply bg-blue-500; // blue-500 是我们设计语言中规定的正蓝色}
  ```  
    
    ![Test](https://oscimg.oschina.net/oscnet/0bfa44b8-69f7-41d9-87cd-6fa160b9f68b.png 为什么使用Tailwind Css框架-) 
    
   再比如我们的项目的 CSS 中经常会有各种神秘数字，比如 17px、27px、35px 这种，这种 magic number 积累多了以后其实对于心智负担相当大，因为你并不知道该选择哪个数字合适只能看着调。使用 tailwind 规定了「Design Token」之后可以很大程度缓解这一点。其实对于设计师来说，基于 4px 的设计方案也是一种好的选择[4]。 
    ```java 
  // BAD.sliceContainer {  padding: 24px 24px 13px; // why 13 ?}// GOOD.sliceContainer {  @apply px-6 pt-6 pb-3;}
  ```  
    
   ##### 使用原子类可以大大减少需要起名的场景 
    
    ![Test](https://oscimg.oschina.net/oscnet/0bfa44b8-69f7-41d9-87cd-6fa160b9f68b.png 为什么使用Tailwind Css框架-) 
    
   命名可以算是开发中最难的事情之一，尤其是在组件化开发已经深入人心的今天，你其实完全没必要给你的 div 起一个有意义的名字。使用这个组件的页面并不会关心你组件的顶部叫 header，底部叫 footer（除非你是些基础组件需要给外界复用），你只需要把样式放上去就好了。 
    
    
    ![Test](https://oscimg.oschina.net/oscnet/0bfa44b8-69f7-41d9-87cd-6fa160b9f68b.png 为什么使用Tailwind Css框架-) 
     
     ![Test](https://oscimg.oschina.net/oscnet/0bfa44b8-69f7-41d9-87cd-6fa160b9f68b.png 为什么使用Tailwind Css框架-) 
     
    
    
   也许有人会觉得大量的内联样式类很不好维护，不过就我们实践下来的几个大型项目的经验来说，相比 CSS modules ，行内样式在可维护性上其实是要更好一些的。 
    
   ##### 与组件内联可以更好的实现「高内聚低耦合」 
   所有使用 CSS（包括 CSS modules）的解决方案其实都有一个问题，就是不好删代码：你很难确定这段样式是不是真的没用了，直到出线上事故为止。使用 tailwind css 你可以让样式到死都跟着组件走，组件删了样式也就去掉了，几乎零成本的降低了冗余代码的可能性。 
    
   ##### Utility-First, not Utility-Only 
   最后，使用 tailwind 不是一个必选项，他可以很好的和其他方案结合着使用，用它也几乎不会带来任何成本。在原子样式或者说「Design Token」上有更为激进需求的可以考虑 chakra，几乎就是 tailwind 的 react/vue 版。 
    
   #### 参考阅读 
   React: CSS in JS – NationJS[5] 
   CSS Modules Welcome to the Future[6] 
   CSS Utility Classes and Separation of Concerns[7] 
   Why Tailwind CSS[8] 
    
   ##### 参考资料 
    
    [1]演讲: https://blog.vjeux.com/2014/javascript/react-css-in-js-nationjs.html 
    [2]PurgeCSS: https://purgecss.com/ 
    [3]放在一个文件: https://vuejs.org/v2/guide/single-file-components.html#What-About-Separation-of-Concerns 
    [4]好的选择: https://www.uisdc.com/4px-design 
    [5]React: CSS in JS – NationJS: https://blog.vjeux.com/2014/javascript/react-css-in-js-nationjs.html 
    [6]CSS Modules Welcome to the Future: https://glenmaddern.com/articles/css-modules 
    [7]CSS Utility Classes and Separation of Concerns: https://adamwathan.me/css-utility-classes-and-separation-of-concerns 
    [8]Why Tailwind CSS: https://www.swyx.io/why-tailwind 
    
   
  
  
   
    
     
      
     
    
   
   
    
     
      
       
        
         
          
           
            
             
            
            
             
              
              END 
              
             
            
            
             
              
               
                
                 
                
               
               
               ![Test](https://oscimg.oschina.net/oscnet/0bfa44b8-69f7-41d9-87cd-6fa160b9f68b.png 为什么使用Tailwind Css框架-) 
               
               
                
                 
                
               
              
             
            
           
          
         
        
       
      
     
    
   
  
  
  如果觉得这篇文章还不错 
  
  
  点击下面卡片关注我 
  
  
  来个【分享、点赞、在看】三连支持一下吧![Test](https://oscimg.oschina.net/oscnet/0bfa44b8-69f7-41d9-87cd-6fa160b9f68b.png 为什么使用Tailwind Css框架-) 
  
  
   
  
  
  
    “分享、点赞、在看” 支持一波 ![Test](https://oscimg.oschina.net/oscnet/0bfa44b8-69f7-41d9-87cd-6fa160b9f68b.png 为什么使用Tailwind Css框架-)  
 
本文分享自微信公众号 - 大前端技术沙龙（is_coder）。如有侵权，请联系 support@oschina.cn 删除。本文参与“OSC源创计划”，欢迎正在阅读的你也加入，一起分享。
                                        