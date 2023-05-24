---
title: 推荐系列-Deferred Components-实现Flutter运行时动态下发Dart代码 - 京东云技术团队
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 10
cover_picture: 'https://api.ixiaowai.cn/gqapi/gqapi.php'
abbrlink: e188ae99
date: 2023-05-24 09:23:09
---

&emsp;&emsp; Deferred Components，官方实现的Flutter代码动态下发的方案。本文主要介绍官方方案的实现细节，探索在国内环境下使用Deferred Components，并且实现了最小验证demo。读罢本文，你就可以...
<!-- more -->

                                                                                                                                                                                         
#### 导读 
Deferred Components，官方实现的Flutter代码动态下发的方案。本文主要介绍官方方案的实现细节，探索在国内环境下使用Deferred Components，并且实现了最小验证demo。读罢本文，你就可以实现Dart文件级别代码的动态下发。 
 
#### 一、引言 
Deferred Components是Flutter2.2推出的功能，依赖于Dart2.13新增的对Split AOT编译支持。将可以在运行时每一个可单独下载的Dart库、assets资源包称之为延迟加载组件，即Deferred Components。Flutter代码编译后，所有的业务逻辑都会打包在libapp.so一个文件里。但如果使用了延迟加载，便可以分拆为多个so文件，甚至一个Dart文件也可以编译成一个单独的so文件。 
这样带来的好处是显而易见的，可以将一些不常用功能放到单独的so文件中，当用户使用时再去下载，可以大大降低安装包的大小，提高应用的下载转换率。另外，因为Flutter具备了运行时动态下发的能力，这让���家���到了实现Flutter热修复的另一种可能。截止目前来讲，官方的实现方案必须依赖Google Play，虽然也针对中国的开发者给出了不依赖Google Play的自定义方案，但是并没有给出实现细节，市面上也没有自定义实现的文章。本文会先简单介绍官方实现方案，并探究其细节，寻找自定义实现的思路，最终会实现一个最小Demo供大家参考。 
 
#### 二、官方实现方案探究 
 
##### 2.1 基本步骤 
2.1.1.引入play core依赖。 
 
 ```java 
  dependencies {
  implementation "com.google.android.play:core:1.8.0"
}

  ``` 
  
2.1.2.修改Application类的onCreate方法和attachBaseContext方法。 
 
 ```java 
  @Override
protected void onCreate(){
 super.onCreate()
// 负责deferred components的下载与安装
 PlayStoreDeferredComponentManager deferredComponentManager = new
  PlayStoreDeferredComponentManager(this, null);
FlutterInjector.setInstance(new FlutterInjector.Builder()
    .setDeferredComponentManager(deferredComponentManager).build());
}


@Override
protected void attachBaseContext(Context base) {
    super.attachBaseContext(base);
    // Emulates installation of future on demand modules using SplitCompat.
    SplitCompat.install(this);
}

  ``` 
  
2.1.3.修改pubspec.yaml文件。 
 
 ```java 
  flutter:
    deferred-components:

  ``` 
  
2.1.4.在flutter工程里新增box.dart和some_widgets.dart两个文件，DeferredBox就是要延迟加载的控件，本例中box.dart被称为一个加载单元，即loading_unit，每一个loading_unit对应唯一的id，一个deferred component可以包含多个加载单元。记得这个概念，后续会用到。 
 
 ```java 
  // box.dart


import 'package:flutter/widgets.dart';


/// A simple blue 30x30 box.
class DeferredBox extends StatelessWidget {
  DeferredBox() {}


  @override
  Widget build(BuildContext context) {
    return Container(
      height: 30,
      width: 30,
      color: Colors.blue,
    );
  }
}

  ``` 
  
<!----> 
 
 ```java 
  import 'box.dart' deferred as box;


class SomeWidget extends StatefulWidget {
  @override
  _SomeWidgetState createState() => _SomeWidgetState();
}


class _SomeWidgetState extends State<SomeWidget> {
  Future<void> _libraryFuture;


  @override
  void initState() {
 //只有调用了loadLibrary方法，才会去真正下载并安装deferred components.
    _libraryFuture = box.loadLibrary();
    super.initState();
  }


  @override
  Widget build(BuildContext context) {
    return FutureBuilder<void>(
      future: _libraryFuture,
      builder: (BuildContext context, AsyncSnapshot<void> snapshot) {
        if (snapshot.connectionState == ConnectionState.done) {
          if (snapshot.hasError) {
            return Text('Error: ${snapshot.error}');
          }
          return box.DeferredBox();
        }
        return CircularProgressIndicator();
      },
    );
  }
}

  ``` 
  
2.1.5.然后在main.dart里面新增一个跳转到SomeWidget页面的按钮。 
 
 ```java 
   Navigator.push(context, MaterialPageRoute(
      builder: (context) {
        return const SomeWidget();
      },
    ));

  ``` 
  
2.1.6.terminal里运行 flutter build appbundle 命令。此时，gen_snapshot不会立即去编译app，而是先运行一个验证程序，目的是验证此工程是否符合动态下发dart代码的格式，第一次构建时肯定不会成功，你只需要按照编译提示去修改即可。当全部修改完毕后，会得到最终的.aab类型的安装包。 
以上便是官方实现方案的基本步骤，更多细节可以参考官方文档 https://docs.flutter.dev/perf/deferred-components 
 
##### 2.2 本地验证 
在将生成的aab安装包上传到Google Play上之前，最好先本地验证一下。 
首先你需要下载bundletool，然后依次运行下列命令就可以将aab安装包装在手机上进行最终的验证了。 
 
 ```java 
  java -jar bundletool.jar build-apks --bundle=<your_app_project_dir>/build/app/outputs/bundle/release/app-release.aab --output=<your_temp_dir>/app.apks --local-testing


java -jar bundletool.jar install-apks --apks=<your_temp_dir>/app.apks

  ``` 
  
 
### 2.3 loadLibrary()方法调用的生命周期 
 
图1 官方实现方案介绍图 
（来源：https://github.com/flutter/flutter/wiki/Deferred-Components） 
从官方的实现方案中可以知道，只有调用了loadLibrary方法后，才会去真正执行deferred components的下载与安装工作，现在着重看下此方法的生命周期。 
调用完loadLibrary方法后，dart会在内部查询此加载单元的id，并将其一直向下传递，当到达jni层时，jni负责将此加载单元对应的deferred component的名字以及此加载单元id一块传递给 PlayStoreDynamicFeatureManager，此类负责从Google Play Store服务器下载对应的Deferred Components并负责安装。安装完成后会逐层通知，最终告诉dart层，在下一帧渲染时展示动态下发的控件。 
 
#### 三、自定义实现 
 
##### 3.1 思路 
梳理了loadLibrary方法调用的生命周期后，只需要自己实现一个类来代替 PlayStoreDynamicFeatureManager的功能即可。在官方方案中具体负责完成PlayStoreDynamicFeatureManager功能的实体类是io.flutter.embedding.engine.deferredcomponents.PlayStoreDeferredComponentManager，其继承自DeferredComponentManager，分析源码得知，它最重要的两个方法是installDeferredComponent和loadDartLibrary。 
 
 installDeferredComponent：这个方法主要负责component的下载与安装，下载安装完成后会调用loadLibrary方法，如果是asset-only component，那么也需要调用DeferredComponentChannel.completeInstallSuccess或者DeferredComponentChannel.completeInstallError方法。 
 
<!----> 
 
 loadDartLibrary：主要是负责找到so文件的位置，并调用FlutterJNI dlopen命令打开so文件，你可以直接传入apk的位置，flutterJNI会直接去apk里加载so，避免处理解压apk的逻辑。 
 
那基本思路就有了，自己实现一个实体类，继承DeferredComponentManager，实现这两个方法即可。 
 
##### 3.2 代码实现 
本例只是最小demo实现，cpu架构采用arm64，且暂不考虑asset-only类型的component。 
3.2.1.新增 CustomDeferredComponentsManager类，继承DeferredComponentManager。 
3.2.2.实现installDeferredComponent方法，将so文件放到外部SdCard存储里，代码负责将其拷贝到应用的私有存储中，以此来模拟网络下载过程。代码如下： 
 
 ```java 
  @Override
public void installDeferredComponent(int loadingUnitId, String componentName) {
    String resolvedComponentName = componentName != null ? componentName : loadingUnitIdToComponentNames.get(loadingUnitId);
    if (resolvedComponentName == null) {
         Log.e(TAG, "Deferred component name was null and could not be resolved from loading unit id.");
         return;
     }
     // Handle a loading unit that is included in the base module that does not need download.
     if (resolvedComponentName.equals("") && loadingUnitId > 0) {
     // No need to load assets as base assets are already loaded.
         loadDartLibrary(loadingUnitId, resolvedComponentName);
         return;
     }
     //耗时操作，模拟网络请求去下载android module
     new Thread(
         () -> {
//将so文件从外部存储移动到内部私有存储中
              boolean result = moveSoToPrivateDir();
              if (result) {
                 //模拟网络下载，添加2秒网络延迟
                 new Handler(Looper.getMainLooper()).postDelayed(
                                () -> {
                                    loadAssets(loadingUnitId, resolvedComponentName);
                                    loadDartLibrary(loadingUnitId, resolvedComponentName);
                                    if (channel != null) {
                                        channel.completeInstallSuccess(resolvedComponentName);
                                    }
                                }
                                , 2000);
                 } else {
                        new Handler(Looper.getMainLooper()).post(
                                () -> {
                                    Toast.makeText(context, "未在sd卡中找到so文件", Toast.LENGTH_LONG).show();


                                    if (channel != null) {
                                        channel.completeInstallError(resolvedComponentName, "未在sd卡中找到so文件");
                                    }


                                    if (flutterJNI != null) {
                                        flutterJNI.deferredComponentInstallFailure(loadingUnitId, "未在sd卡中找到so文件", true);
                                    }
                                }
                        );
                  }
              }
        ).start();
    }

  ``` 
  
3.2.3.实现loadDartLibrary方法，可以直接拷贝 PlayStoreDeferredComponentManager类中的此方法，注释已加，其主要作用就是在内部私有存储中找到so文件，并调用FlutterJNI dlopen命令打开so文件。 
 
 ```java 
    @Override
    public void loadDartLibrary(int loadingUnitId, String componentName) {
        if (!verifyJNI()) {
            return;
        }
        // Loading unit must be specified and valid to load a dart library.
        //asset-only的component的unit id为-1，不需要加载so文件
        if (loadingUnitId < 0) {
            return;
        }


        //拿到so的文件名字
        String aotSharedLibraryName = loadingUnitIdToSharedLibraryNames.get(loadingUnitId);
        if (aotSharedLibraryName == null) {
            // If the filename is not specified, we use dart's loading unit naming convention.
            aotSharedLibraryName = flutterApplicationInfo.aotSharedLibraryName + "-" + loadingUnitId + ".part.so";
        }


        //拿到支持的abi格式--arm64_v8a
        // Possible values: armeabi, armeabi-v7a, arm64-v8a, x86, x86_64, mips, mips64
        String abi;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            abi = Build.SUPPORTED_ABIS[0];
        } else {
            abi = Build.CPU_ABI;
        }
        String pathAbi = abi.replace("-", "_"); // abis are represented with underscores in paths.


        // TODO(garyq): Optimize this apk/file discovery process to use less i/o and be more
        // performant and robust.


        // Search directly in APKs first
        List<String> apkPaths = new ArrayList<>();
        // If not found in APKs, we check in extracted native libs for the lib directly.
        List<String> soPaths = new ArrayList<>();


        Queue<File> searchFiles = new LinkedList<>();
        // Downloaded modules are stored here--下载的 modules 存储位置
        searchFiles.add(context.getFilesDir());
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            //第一次通过appbundle形式安装的split apks位置
            // The initial installed apks are provided by `sourceDirs` in ApplicationInfo.
            // The jniLibs we want are in the splits not the baseDir. These
            // APKs are only searched as a fallback, as base libs generally do not need
            // to be fully path referenced.
            for (String path : context.getApplicationInfo().splitSourceDirs) {
                searchFiles.add(new File(path));
            }
        }


        //查找apk和so文件
        while (!searchFiles.isEmpty()) {
            File file = searchFiles.remove();
            if (file != null && file.isDirectory() && file.listFiles() != null) {
                for (File f : file.listFiles()) {
                    searchFiles.add(f);
                }
                continue;
            }
            String name = file.getName();
            // Special case for "split_config" since android base module non-master apks are
            // initially installed with the "split_config" prefix/name.
            if (name.endsWith(".apk")
                    && (name.startsWith(componentName) || name.startsWith("split_config"))
                    && name.contains(pathAbi)) {
                apkPaths.add(file.getAbsolutePath());
                continue;
            }
            if (name.equals(aotSharedLibraryName)) {
                soPaths.add(file.getAbsolutePath());
            }
        }


        List<String> searchPaths = new ArrayList<>();


        // Add the bare filename as the first search path. In some devices, the so
        // file can be dlopen-ed with just the file name.
        searchPaths.add(aotSharedLibraryName);


        for (String path : apkPaths) {
            searchPaths.add(path + "!lib/" + abi + "/" + aotSharedLibraryName);
        }
        for (String path : soPaths) {
            searchPaths.add(path);
        }
//打开so文件
        flutterJNI.loadDartDeferredLibrary(loadingUnitId, searchPaths.toArray(new String[searchPaths.size()]));
    }

  ``` 
  
3.2.4.修改Application的代码并删除 com.google.android.play:core的依赖。 
 
 ```java 
  override fun onCreate() {
        super.onCreate()
        val deferredComponentManager = CustomDeferredComponentsManager(this, null)
        val injector = FlutterInjector.Builder().setDeferredComponentManager(deferredComponentManager).build()
        FlutterInjector.setInstance(injector)

  ``` 
  
至此，核心代码全部实现完毕，其他细节代码可以见 https://coding.jd.com/jd_logistic/deferred_component_demo/，需要加权限的联系shenmingliang1即可。 
 
##### 3.3 本地验证 
 
 运行 flutter build appbundle --release --target-platform android-arm64 命令生成app-release.aab文件。 
 .运行下列命令将app-release.aab解析出本地可以安装的apks文件：java -jar bundletool.jar build-apks --bundle=app-release.aab --output=app.apks --local-testing 
 解压上一步生成的app.apks文件，在加压后的app文件夹下找到splits/scoreComponent-arm64_v8a_2.apk，继续解压此apk文件，在生成的scoreComponent-arm64_v8a_2文件夹里找到lib/arm64-v8a/libapp.so-2.part.so 文件。 
 执行 java -jar bundletool.jar install-apks --apks=app.apks命令安装app.apks，此时打开安装后的app，点击首页右下角的按钮跳转到DeferredPage页面，此时页面不会成功加载，并且会提示你“未在sd卡中找到so文件”。 
 将第3步找到的lipase.so-2.part.so push到指定文件夹下，命令如下 adb push libapp.so-2.part.so /storage/emulated/0/Android/data/com.example.deferred_official_demo/files。重启app进程，并重新打开DeferredPage界面即可。 
 
 
#### 四、 总结 
官方实现方案对国内的使用来讲，最大的限制无疑是Google Play，本文实现了一个脱离Google Play限制的最小demo，验证了deferred components在国内使用的可行性。 
参考： 
 
 https://docs.flutter.dev/perf/deferred-components 
 https://github.com/flutter/flutter/wiki/Deferred-Components 
 

                                        