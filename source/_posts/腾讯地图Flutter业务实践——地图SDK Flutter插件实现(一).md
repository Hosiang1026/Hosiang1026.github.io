---
title: 推荐系列-腾讯地图Flutter业务实践——地图SDK Flutter插件实现(一)
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 835
cover_picture: 'https://api.ixiaowai.cn/gqapi/gqapi.php'
abbrlink: 18f6ffe6
date: 2021-04-15 09:53:06
---

&emsp;&emsp;前言 Flutter 作为目前通用的业界跨平台解决方案，开辟了一套全新的设计理念，通过自研的 UI 框架，支持高效构建多端平台上的应用，同时保持着原生应用一样的高性能。 在Flutter项目开发过程...
<!-- more -->

                                                                                                                                                                                        #### 前言 
Flutter 作为目前通用的业界跨平台解决方案，开辟了一套全新的设计理念，通过自研的 UI 框架，支持高效构建多端平台上的应用，同时保持着原生应用一样的高性能。 在Flutter项目开发过程中，对插件的开发和复用能够提高开发效率，降低工程的耦合度。Flutter开发者可以引入对应插件就可以为项目快速集成相关能力，从而专注于具体业务功能的实现。 而在Flutter项目开发过程中面对通用业务逻辑拆分、或者需要对原生能力封装等场景时，开发者需要开发新的组件。 
为减少开发者同时开发Android和iOS应用的成本，提升开发效率，降低集成地图SDK的门槛，腾讯位置服务团队也计划于业务实践中基于原生地图SDK能力封装一套地图Flutter插件，支持Flutter开发者跨平台调用地图SDK接口。 笔者在2019年实习期间，曾基于当时的最新版本4.2.4的Android地图SDK，将地图SDK中一些常用的基础的地图操作功能封装，构建了一套Android端的地图SDK Flutter插件。 
现如今，地图SDK已经迭代到了4.4.0版本，笔者也将地图Flutter插件进行了一次相关版本升级。 本篇文章将介绍地图Flutter插件项目的构建、地图实例的加载以及demo示例呈现。对于地图基础操作的功能封装细节将在后续文章中进行详细讲解说明。 
#### 地图Flutter插件项目的构建 
##### 地图Flutter插件项目结构 
地图Flutter插件项目构架的整体结构如下图所示： 
![Test](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0502845844684f60821bcb1029e409b1~tplv-k3u1fbpfcp-watermark.image  '腾讯地图Flutter业务实践——地图SDK Flutter插件实现(一)') 
android/ios目录：原生代码。对应为Android/iOS Flutter插件目录。<br> lib目录：Dart 代码。Flutter开发者将会使用这里的Flutter插件实现的接口。<br> example目录：地图SDK的demo程序。用于验证Flutter插件的可用性的使用示例。 
##### 地图Flutter插件依赖配置项 
Android端的Flutter插件配置项与官网关于Android地图SDK的配置说明类似，需要配置android目录下的两个文件：build.gradle、AndroidManifest.xml。 其中Android端的Flutter插件的包名为com.tencent.tencentmap，AndroidManifest.xml文件配置如下： 
 
 ```java 
  <manifest xmlns:android="http://schemas.android.com/apk/res/android"
  package="com.tencent.tencentmap">
    <!-- 腾讯地图 sdk 要求的权限(开始) -->
    <!-- 访问网络获取地图服务 -->
    <uses-permission android:name="android.permission.INTERNET" />
    <!-- 检查网络可用性 -->
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <!-- 访问WiFi状态 -->
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
    <!-- 需要外部存储写权限用于保存地图缓存 -->
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <!-- 获取 device id 辨别设备 -->
    <uses-permission android:name="android.permission.READ_PHONE_STATE" />
    <!-- 获取日志读取权限，帮助我们提高地图 sdk 稳定性 -->
    <uses-permission android:name="android.permission.READ_LOGS" />
    <!-- 腾讯地图 sdk 要求的权限(结束) -->


    <!-- 腾讯定位 sdk 要求的权限  (开始) -->
    <!-- 通过GPS得到精确位置 -->
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <!-- 通过网络得到粗略位置 -->
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <!-- 访问网络. 某些位置信息需要从网络服务器获取 -->
    <uses-permission android:name="android.permission.INTERNET" />
    <!-- 访问WiFi状态. 需要WiFi信息用于网络定位 -->
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
    <!-- 修改WiFi状态. 发起WiFi扫描, 需要WiFi信息用于网络定位 -->
    <uses-permission android:name="android.permission.CHANGE_WIFI_STATE" />
    <!-- 访问网络状态, 检测网络的可用性. 需要网络运营商相关信息用于网络定位 -->
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <!-- 访问网络的变化, 需要某些信息用于网络定位 -->
    <uses-permission android:name="android.permission.CHANGE_NETWORK_STATE" />
    <!-- 访问手机当前状态, 需要device id用于网络定位 -->
    <uses-permission android:name="android.permission.READ_PHONE_STATE" />

    <!-- 腾讯定位 sdk 要求的权限 (结束) -->
    <application>

        <!-- 如果您key确认无误，却依然授权没有通过，请检查您的key的白名单配置 -->
        <meta-data
            android:name="TencentMapSDK"
            android:value="Your key"/>
    </application>
</manifest>

  ``` 
  
本文使用的Android端地图SDK版本为4.4.0。同时，本文Flutter插件的实现语言是基于Kotlin实现。build.gradle的依赖配置项如下： 
 
 ```java 
  dependencies {
    implementation 'com.android.support:appcompat-v7:27.1.1'
    implementation 'com.tencent.map:tencent-map-vector-sdk:4.4.0'
    implementation "org.jetbrains.kotlin:kotlin-stdlib-jdk7:$kotlin_version"
    compile "org.jetbrains.kotlin:kotlin-script-runtime:1.2.71"
}


  ``` 
  
#### 地图Flutter插件加载地图实例 
Flutter插件在上层UI Dart端与底层Native SDK端之间起到了一层桥接的作用。 Flutter端与Native端之间通信的流程如下图所示： 
![Test](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0502845844684f60821bcb1029e409b1~tplv-k3u1fbpfcp-watermark.image  '腾讯地图Flutter业务实践——地图SDK Flutter插件实现(一)') 
Flutter 跟Native代码可以通过 MethodChannel 进行通信。客户端通过 MethodChannel 将方法调用和参数发生给服务端，服务端也通过 MethodChannel 接收相关的数据。 因此，在Flutter插件开发中，MethodChannel与EventChannel是两个不可避免用到的类。 用比较通俗的语言来解释这两个类的功能： 
 
 
后续文章将详细讲解MethodChannel与EventChannel在地图SDK插件中的使用。 言归正传，本文重点要讲解使用PlatformView对地图实例进行加载的流程。 PlatformView的使用方式是与MethodChannel的使用方式类似的，具体的加载地图实例流程如下： 
（1）Native端创建TencentMapView 
TencentMapView继承自PlatformView。 PlatformView为Flutter 1.0版本中的通用组件，区分为Android和iOS。在Android平台上叫做 AndroidView组件，在iOS平台，叫UIKitView组件。 因此利用PlatformView构建加载Native SDK中的地图实例并在PlatformView中维护地图实例的生命周期。 TencentMapView中也加入了MethodChannel与EventChannel的注册逻辑，主要用于地图的接口进行双端交互，对于这两部分的说明将在后续文章中进行详细介绍。 Android端的TencentMapView实现如下： 
 
 ```java 
  class TencentMapView(context: Context, private val id: Int, private val activityState: AtomicInteger, tencentMapOptions: TencentMapOptions) : PlatformView, Application.ActivityLifecycleCallbacks{

	// 加载构建地图实例
    private val mapView = MapView(context, tencentMapOptions)
    private val registrarActivityHashCode: Int = TencentmapPlugin.registrar.activity().hashCode()
    
	// 维护地图实例生命周期
    fun setup(){
        when(activityState.get()){
            STOPPED -> {
                mapView.onStop()
            }
            RESUMED -> {
                mapView.onResume()
            }
            CREATED -> {
				mapView.onStart()
            }
            DESTROYED -> {
	            mapView.onDestroy()
            }
        }

        // flutter端调用地图native SDK相关功能的MethodChannel
        val mapChannel = MethodChannel(registrar.messenger(), "$mapChannelName$id")
        mapChannel.setMethodCallHandler { methodCall, result ->
            MAP_METHOD_HANDLER[methodCall.method]
                    ?.with(mapView.map)
                    ?.onMethodCall(methodCall, result) ?: result.notImplemented()
        }
        
        // native SDK通知flutter层相关消息的EventChannel
        val mapEventChannel = EventChannel(registrar.messenger(), "$mapChannelName$id")

    }
}

  ``` 
  
（2）在插件Native层的入口文件TencentmapPlugin.kt中注册刚写好的TencentMapView实例tencentMapView： 
 
 ```java 
  @JvmStatic
    fun registerWith(registrar: PluginRegistry.Registrar){
	//将TencentMapView实例注册到插件中
	registrar.platformViewRegistry().registerViewFactory("com.tencentmap/map", tencentMapView)
    }

  ``` 
  
（3）在Flutter端的dart代码使用AndroidView，将AndroidView嵌入到TencentMapView中： 
 
 ```java 
  class TencentMapView extends StatelessWidget{
  const TencentMapView({
    this.onTencentMapViewCreated,
});
  final MapCreatedCallback onTencentMapViewCreated;
  @override
  Widget build(BuildContext context) {
    if (defaultTargetPlatform == TargetPlatform.android) {
      return AndroidView(
          viewType: 'com.tencentmap/map',
          onPlatformViewCreated: _onViewCreated,
          creationParams: {

          },
          creationParamsCodec: const StandardMessageCodec(),
      );
    }
  }
}

  ``` 
  
这里要注意的一点是，在Android端和Flutter端注册的viewType中的字符串值必须保持一致，用于唯一标识。在本文中的标识字符串为'com.tencentmap/map'，将Flutter端的AndroidView与Native端的TencentMapView建立了关联。 
#### Flutter插件对应Demo示例呈现 
##### Demo示例 
demo UI采用了Flutter自支持的Material Design风格的一套UI组件。 Flutter demo调用地图SDK展示地图实例的界面如图所示： 
![Test](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0502845844684f60821bcb1029e409b1~tplv-k3u1fbpfcp-watermark.image  '腾讯地图Flutter业务实践——地图SDK Flutter插件实现(一)') 
demo中还实现了地图基础操作的相关功能性接口，例如相关覆盖物的绘制等，示例如下图所示： 
![Test](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0502845844684f60821bcb1029e409b1~tplv-k3u1fbpfcp-watermark.image  '腾讯地图Flutter业务实践——地图SDK Flutter插件实现(一)') 
![Test](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0502845844684f60821bcb1029e409b1~tplv-k3u1fbpfcp-watermark.image  '腾讯地图Flutter业务实践——地图SDK Flutter插件实现(一)') 
##### 版本升级过程中遇到的小坑 
在实际版本升级过程中，原有项目的demo运行起来是白屏，控制台打印出如下信息： 
 
 ```java 
  [VERBOSE-2:ui_dart_state.cc(157)] Unhandled Exception: ServicesBinding.defaultBinaryMessenger was accessed before the binding was initialized.
If you're running an application and need to access the binary messenger before `runApp()` has been called (for example, during plugin initialization), then you need to explicitly call the `WidgetsFlutterBinding.ensureInitialized()` first.
If you're running a test, you can call the `TestWidgetsFlutterBinding.ensureInitialized()` as the first line in your test's `main()` method to initialize the binding.
#0      defaultBinaryMessenger.<anonymous closure> (package:flutter/src/services/binary_messenger.dart:76:7)
#1      defaultBinaryMessenger (package:flutter/src/services/binary_messenger.dart:89:4)
#2      MethodChannel.binaryMessenger (package:flutter/src/services/platform_channel.dart:140:62)
#3      MethodChannel.invokeMethod (package:flutter/src/services/platform_channel.dart:314:35)
#4      MethodChannel.invokeMapMethod (package:flutter/src/services/platfo<…>

  ``` 
  
根据控制台的输出信息，经过查阅相关资料后找到了原因：该问题由Flutter版本升级导致的重大更改引起的：https://groups.google.com/g/flutter-announce/c/sHAL2fBtJ1Y/m/mGjrKH3dEwAJ 具体解决方法为：在main.dart文件中的main方法中，需要在runApp()前显式调用如下代码： 
 
 ```java 
  WidgetsFlutterBinding.ensureInitialized();

  ``` 
  
#### 总结 
本文主要介绍了腾讯地图SDK Flutter插件项目的构建、地图实例加载、demo呈现，对地图基础功能性接口的封装细节，将会在后续文章持续讲解。 

                                        