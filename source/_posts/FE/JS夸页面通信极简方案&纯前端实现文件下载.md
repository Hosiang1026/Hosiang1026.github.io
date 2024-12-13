---
title: 推荐系列-JS夸页面通信极简方案&纯前端实现文件下载
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 771
cover_picture: 'https://oscimg.oschina.net/oscnet/66b660fb-8b9a-4a4e-b4a7-f135f63624cf.png'
abbrlink: 890e6a2e
date: 2021-04-15 09:53:06
---

&emsp;&emsp;由于笔者之前维护了几个比较老的项目是用jquery全家桶开发的，其中有些需求是需要跨页面交互和父子页面通信，故借此总结一下。另一块是前端实现文件下载功能，虽然方法很多，为了不用重复造轮...
<!-- more -->

                                                                                                                                                                                         
  
   
    
   
  
  
  ![Test](undefined  'JS夸页面通信极简方案&纯前端实现文件下载') 
   
  
  
 ##### 文章摘要 
  
  实现页面之间通信的方法 
  实现父子页面和子页面与子页面之间通信的方法 
  前端实现文件下载功能 
  
 由于本文介绍的主要还是基于javascript，不涉及任何框架方面的问题（如果想研究vue，react，angular方面的技术问题，可以移步我的其他文章），所以让我们用原生javascript来解决我们上面提到的问题吧。 
  
 ##### 正文 
  
 ###### 1. 实现页面之间通信的方法 
 虽然我们使用postmessage也可以实现页面通信，但这里我们主要使用window.opener这个API，MDN对它的解释如下： 
  
 意思就是window提供的opener接口返回一个打开当前页面的页面的一个引用，换句话说，如果A页面打开B，那么B页面的opener将返回A。通过这种方式，我们可以在A页面定���全局的方法挂载在window上，那么B页面就可以通过opener拿到A页面的方法从而控制A页面的行为。 
 目前主流的浏览器对这个API支持的都比较好，所以我们在大部分场景下可以考虑使用这个API。 
 为了更方便的理解他的应用场景，我们这里实现一个小功能：我们定义两个页面，A，B，当A页面打开B页面的时候，用B页面改变A页面的背景色。代码如下： 
   
  
  
   
   
    
 ```java 
  // A页面
  ``` 
  
 ```java 
  <body>
  ``` 
  
 ```java 
      <h1>父页面A</h1>
  ``` 
  
 ```java 
      <a href="./b.html" target="_blank">打开b页面</a>
  ``` 
  
 ```java 
      <script>
  ``` 
  
 ```java 
          function changeColor(color) {
  ``` 
  
 ```java 
              document.body.style.background = color
  ``` 
  
 ```java 
          }
  ``` 
  
 ```java 
  </script>
  ``` 
  
 ```java 
  </body>
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
  // B页面
  ``` 
  
 ```java 
  <body>
  ``` 
  
 ```java 
      <h1>父页面B</h1>
  ``` 
  
 ```java 
      <script>
  ``` 
  
 ```java 
          window.opener.changeColor('blue')
  ``` 
  
 ```java 
  </script>
  ``` 
  
 ```java 
  </body>
  ``` 
 
  
  
   
 首先我们在A页面里定义一个全局方法，当点击a标签跳转到新开的B页面时，B页面就是通过opener，调用A定义的changeColor，并传入参数给A页面，从而改变A页面的背景色。效果如下： 
  
  ![Test](undefined  'JS夸页面通信极简方案&纯前端实现文件下载') 
  
  
  ![Test](undefined  'JS夸页面通信极简方案&纯前端实现文件下载') 
  
  
  ![Test](undefined  'JS夸页面通信极简方案&纯前端实现文件下载') 
  
  
 ###### 2.实现父子页面和子页面与子页面之间通信的方法 
 父子页面这里主要针对iframe而言，即iframe和父页面以及iframe页面之间的通信。比如下图： 
  
  ![Test](undefined  'JS夸页面通信极简方案&纯前端实现文件下载') 
  
 我们想实现父页面A操控子页面A，B，并且让子页面和父页面交互，这里我们主要使用 iframe的 
  
  
  contentWindow 
  parent.window 通过contentWindow，我们可以拿到iframe内部的方法和dom元素，进而可以操控iframe页面 
  
 首先我们来看看父页面操控子页面的场景：父页面A调用子页面的方法传递一条数据，并并显示在子页面中： 
   
  
  
   
   
    
 ```java 
  // 父页面
  ``` 
  
 ```java 
  window.onload = function() {
  ``` 
  
 ```java 
      let iframe1 = $id('a1').contentWindow;
  ``` 
  
 ```java 
      // 控制子页面dom
  ``` 
  
 ```java 
      iframe1.document.body.style.background = "#000"
  ``` 
  
 ```java 
      iframe1.loadData({a: '1'})
  ``` 
  
 ```java 
  }
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
  function $id(id) {
  ``` 
  
 ```java 
      return document.getElementById(id)
  ``` 
  
 ```java 
  }
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
  // 子页面
  ``` 
  
 ```java 
  function loadData(data) {
  ``` 
  
 ```java 
      document.body.append(`父页面的数据数据${data.a}`)
  ``` 
  
 ```java 
  }
  ``` 
 
  
  
   
 由上可知，父页面通过contentWindow拿到iframe的window对象从而向其传递数据并调用其方法。 
 同样，子页面也可以操控父页面： 
   
  
  
   
   
    
 ```java 
  // 父页面
  ``` 
  
 ```java 
  function $id(id) {
  ``` 
  
 ```java 
      return document.getElementById(id)
  ``` 
  
 ```java 
  }
  ``` 
  
 ```java 
  // 子页面
  ``` 
  
 ```java 
  parent.window.$id('bridge').innerHTML = '子页面操控父页面dom'复制代码
  ``` 
 
  
  
   
 从代码可以看到，我们使用parent.window拿到父页面的window，然后调用父页面提供的$id方法来操作父页面dom。 
  
  ![Test](undefined  'JS夸页面通信极简方案&纯前端实现文件下载') 
  
 接下来我们来解决子页面和子页面通信的问题，其实方法在上面已经提到了，我们可以把父页面作为一个桥梁，子页面A通过parent.window拿到父页面��window，进而可以获取另一个子页面B的dom，这样我们就可以让子页面A操作子页面B了，反之也是一样的。 
   
  
  
   
   
    
 ```java 
  // 子页面A
  ``` 
  
 ```java 
  let iframeBWin = parent.window.$id('a2').contentWindow
  ``` 
  
 ```java 
  iframeBWin.onload = function() {
  ``` 
  
 ```java 
      iframeBWin.document.getElementById('show').innerHTML = "来自子页面A的问候"
  ``` 
  
 ```java 
  }复制代码
  ``` 
 
  
  
   
 由上面代码我们可以知道，我们通过parent.window来拿到子页面B进而实现和子页面B通信的目的，通过这种方式，我们可以实现很多有意思的东西。![Test](undefined  'JS夸页面通信极简方案&纯前端实现文件下载') 
 注意，我们所讨论的这些方法都是基于同域下的，其实实现跨域的方法也有很多，比如使用中间iframe实现桥接，通过设置window.domain将window提高到顶层等等，不过实现起来还是有些坑的，不过大部分场景都能满足。 
  
 ###### 4.前端实现文件下载功能 
 对于下载文件来说，大部分场景都是后端来实现，前端只需求请求接口就好了，但是有时候这种方式反而会占用多余的资源和带宽，如果需要下载的是用户自己生成的内容或者内容已经返回到客户端了，这时候能不经过服务端而直接生成下载任务，能节省不少的资源和时间开销。 
 一般来说前端实现的思路就是通过动态创建a标签，设置其download属性，最后删除a就好了，对于不是图片的文件一般都可以下载，但是如果是图片，有些浏览器会自动打开图片，所以我们需要手动把它转化为data:URLs或blob:URLs，基于这个原理，我们可以用fileReader，也可以用fetch-URL.createObjectURL，这里经过大量测试我采用后者： 
   
  
  
   
   
    
 ```java 
  function download(url, filename) {
  ``` 
  
 ```java 
      return fetch(url).then(res => res.blob().then(blob => {
  ``` 
  
 ```java 
          let a = document.createElement('a');
  ``` 
  
 ```java 
          let url = window.URL.createObjectURL(blob);
  ``` 
  
 ```java 
          a.href = url;
  ``` 
  
 ```java 
          a.download = filename;
  ``` 
  
 ```java 
          a.click();
  ``` 
  
 ```java 
          window.URL.revokeObjectURL(url);
  ``` 
  
 ```java 
      }))
  ``` 
  
 ```java 
  }
  ``` 
 
  
  
   
 该方法传入一个文件的地址和希望使用的文件名，这样，我们就能优雅的使用它来实现下载了。 
 ❤️爱心三连击 
 1.看到这里了就点个在看支持下吧，你的「点赞，在看」是我创作的动力。 
 2.关注公众号趣谈前端，进程序员优质学习交流群, 字节, 阿里大佬和你一起学习成长！ 
 3.也可添加微信【Mr_xuxiaoxi】获取大厂内推机会。 
 ![Test](undefined  'JS夸页面通信极简方案&纯前端实现文件下载') 
 
本文分享自微信公众号 - 趣谈前端（beautifulFront）。如有侵权，请联系 support@oschina.cn 删除。本文参与“OSC源创计划”，欢迎正在阅读的你也加入，一起分享。
                                        