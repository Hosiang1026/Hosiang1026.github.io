---
title: 推荐系列-使用 Jetpack ActivityResult 处理 Activity 之间的数据通信
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 1974
cover_picture: 'https://devrel.andfun.cn/devrel/posts/2021/04/28438119828b0.jpg'
abbrlink: bd52ecc0
date: 2021-04-15 09:46:45
---

&emsp;&emsp;作者 / Yacine Rezgui 无论您是在应用中请求某项权限，从文件管理系统中选择某个文件，还是期望从第三方应用中获取到某些数据，都会涉及到在 Activity 之间传递数据，而这也正是 Android 中进...
<!-- more -->

                                                                                                                                                                                        ![Test](https://devrel.andfun.cn/devrel/posts/2021/04/28438119828b0.jpg  '使用 Jetpack ActivityResult 处理 Activity 之间的数据通信') 
作者 / Yacine Rezgui 
无论您是在应用中请求某项权限，从文件管理系统中选择某个文件，还是期望从第三方应用中获取到某些数据，都会涉及到在 Activity 之间传递数据，而这也正是 Android 中进程间通信的核心要点。近期我们发布了新的 ActivityResult API 来帮助简化 Activity 间的数据通信。 
之前，想要从启动的 Activity 中获取到返回结果，应用需要在 Activity 和 Fragment 中实现 onActivityResult() 方法，然后检查回调关联到哪一个 requestCode，并验证该 requestCode 的结果是否为 OK，最终再去验证返回数据或扩��数据。 
但是这样的处理方式会让我们的代码变得非常复杂，并且也无法保证在 Activity 发送或接收数据时参数的类型安全。 
#### ActivityResult API 是什么 
ActivityResult API 被加入到 Jetpack 的 Activity 和 Fragment 库中，旨在通过提供类型安全的 contract (协定) 来简化处理来自 Activity 的数据。这些 协定 为一些常见操作 (比如: 拍照或请求权限) 定义了预期的输入和输出类型，除此之外您还能够 自定义协定 来满足不同场景的需求。 
 
 ```java 
  ActivityResult API
  ``` 
  提供了一些组件用于注册 Activity 的处理结果、发起请求以及在系统返回结果后立即进行相应处理。您也可以在启动 Activity 的地方使用一个独立的类接收返回结果，这样依然能够保证类型安全。 
#### 如何使用 
接下来我们通过一个打开文档的示例，来演示如何使用  
 ```java 
  ActivityResult
  ``` 
  API。 
首先，您需要在 gradle 文件中添加以下依赖: 
 
 ```java 
   repositories {
    google()
    maven()
}
 
dependencies {
  // 在 https://developer.android.google.cn/jetpack/androidx/releases/activity 获得最新版本号
  def activity_version = "1.2.0"
  // 在 https://developer.android.google.cn/jetpack/androidx/releases/fragment 获得最新版本号
  def fragment_version = "1.3.0"
  
  implementation "androidx.activity:activity:$activity_version"
  implementation "androidx.fragment:fragment:$fragment_version”
}

  ``` 
  
您需要在协定中注册一个 回调，在其中定义它输入输出的类型。 
在下列代码中，GetContent() 指的是 ACTION_GET_DOCUMENT intent，它是在 Activity 库中已定义好的默认协定之一。您可以在这里找到完整的 已定义协定列表。 
 
 ```java 
  val getContent = registerForActivityResult(GetContent()) { uri: Uri? ->
    // 处理返回的 Uri
}

  ``` 
  
现在我们需要使用返回的 launcher 来启动我们的 Activity。您可以设置一个 mime 类型的过滤器对所选文件进行过滤，GetContent.launch() 接收一个字符串作为参数: 
 
 ```java 
   val getContent = registerForActivityResult(GetContent()) { uri: Uri? ->
    // 处理返回的 Uri
}
 
override fun onCreate(savedInstanceState: Bundle?) {
    // ...
 
    val selectButton = findViewById<Button>(R.id.select_button)
 
    selectButton.setOnClickListener {
        // 传入您想让用户选择的 mime 类型作为输入
        getContent.launch("image/*")
    }
}

  ``` 
  
一旦图片被选中并返回到您的 Activity，就会携带着预期结果执行您之前注册的回调函数。正如您看到的代码片段，ActivityResult 在处理来自 Activity 的返回数据时带来了更便捷的开发体验。 
现在就使用最新稳定版的  
 ```java 
  Activity
  ``` 
  和  
 ```java 
  Fragment
  ``` 
  库，通过  
 ```java 
  ActivityResult
  ``` 
  API 以类型安全的方式处理您的 Intent 结果吧！ 
 
 查看 Activity 库的最新版本 
 查看 Fragment 库的最新版本 
 
我们也希望听到来自各位开发者的反馈，如果您有任何建议或意见，都可以在这里给我们 提交反馈。
                                        