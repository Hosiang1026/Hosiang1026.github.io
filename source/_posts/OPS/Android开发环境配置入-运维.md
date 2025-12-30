---
title: Android开发环境配置入门
categories: 开发环境配置全攻略系列
tags:
  - Java
  - Kotlin
abbrlink: 957cd1b8
date: 2018-11-25 00:00:00
top: 4
---

Android是基于Linux的开源移动操作系统，由Google公司和开放手机联盟开发，现已成为全球市场份额最大的移动操作系统。本文详细介绍Android开发环境的配置方法，包括Android Studio安装、SDK配置、模拟器设置、真机调试配置等完整流程

<!-- more -->

![Android](/images/gAhSjg.jpg "Android开发环境配置-入门篇")


### 一、Android简介

#### 1.1 什么是Android

Android是基于Linux内核的开源移动操作系统，由Google公司和开放手机联盟（Open Handset Alliance）开发。Android最初于2007年发布，现已成为全球市场份额最大的移动操作系统。

```
Android的特点：
```
- 开源免费：基于Apache许可证开源
- 跨设备：支持手机、平板、电视、汽车等多种设备
- 丰富的API：提供大量开发API和工具
- 活跃的社区：拥有庞大的开发者社区

#### 1.2 Android应用开发

```
开发语言：
```
- Java：传统开发语言，广泛使用
- Kotlin：Google官方推荐，现代语言（推荐）

```
应用架构：
```
- MVC：传统架构模式
- MVP：Model-View-Presenter
- MVVM：Model-View-ViewModel（推荐）
- MVI：Model-View-Intent

### 二、系统要求

#### 2.1 硬件要求

```
Windows系统：
```
- 操作系统：Windows 7/8/10/11（64位）
- 内存：至少8GB RAM（推荐16GB）
- 磁盘空间：至少10GB可用空间（SDK和模拟器需要额外空间）
- 屏幕分辨率：至少1280x800

```
macOS系统：
```
- 操作系统：macOS 10.14或更高版本
- 内存：至少8GB RAM（推荐16GB）
- 磁盘空间：至少10GB可用空间

```
Linux系统：
```
- 操作系统：Ubuntu 18.04或更高版本
- 内存：至少8GB RAM
- 磁盘空间：至少10GB可用空间

#### 2.2 软件要求

```
必需软件：
```
- JDK：JDK 8或更高版本（推荐JDK 11或17）
- Android Studio：官方推荐的IDE
- Android SDK：Android软件开发工具包

### 三、开发工具

Android开发主要有两种IDE选择：Eclipse和Android Studio。目前Google官方推荐使用Android Studio，它提供了更好的开发体验和工具支持。

#### 3.1 Android Eclipse

Eclipse是一个开源的、基于Java的可扩展开发平台。虽然Google已经停止对Eclipse ADT插件的支持，但仍有部分开发者在使用。

```
Eclipse + ADT插件配置步骤：
```

1. 下载Eclipse IDE
```
   - 访问 [Eclipse官网](https://www.eclipse.org/downloads/)
```
   - 下载Eclipse IDE for Java Developers版本

2. 安装ADT插件
   - 打开Eclipse，选择 Help → Install New Software
   - 点击 Add，输入名称和URL：`https://dl-ssl.google.com/android/eclipse/`
   - 选择Developer Tools，点击Next完成安装

3. 配置Android SDK
   - 下载Android SDK
   - 在Eclipse中，选择 Window → Preferences → Android
   - 设置SDK Location路径

```
注意： Google已经停止对Eclipse ADT的支持，建议使用Android Studio进行开发。
```

#### 3.2 Android Studio

Android Studio是Google官方推荐的Android开发IDE，基于IntelliJ IDEA开发，提供了完整的Android开发工具链。

```
Android Studio安装步骤：
```

1. 下载Android Studio
```
   - 访问 [Android Studio官网](https://developer.android.com/studio)
```
   - 下载适合你操作系统的版本（Windows/Mac/Linux）

2. 安装Android Studio
   - 运行安装程序，按照向导完成安装
   - 首次启动会自动下载Android SDK和必要的组件

   - 打开Android Studio，选择 Configure → SDK Manager
   - 选择需要安装的SDK版本和工具
   - 推荐安装最新的稳定版本和常用的API级别

4. 创建AVD（Android Virtual Device）
   - 选择 Tools → AVD Manager
   - 点击 Create Virtual Device
   - 选择设备类型和系统镜像
   - 配置设备参数（内存、分辨率等）

```
Android Studio主要特性：
```

- 智能代码编辑器 - 提供代码补全、重构、代码分析等功能
- 可视化布局编辑器 - 拖拽式UI设计工具
- Gradle构建系统 - 强大的项目构建和依赖管理
- 实时预览 - 实时预览布局效果
- 性能分析工具 - CPU、内存、网络性能分析
- 版本控制集成 - 内置Git支持

```
推荐配置：
```

- JDK版本: JDK 8或更高版本
- 内存: 至少8GB RAM（推荐16GB）
- 磁盘空间: 至少10GB可用空间（SDK和模拟器需要额外空间）
- 操作系统: Windows 7/8/10/11, macOS 10.14+, Linux

```
常用快捷键：
```

- `Ctrl + Space`: 代码补全
- `Alt + Enter`: 快速修复
- `Ctrl + B`: 跳转到声明
- `Ctrl + Shift + F`: 全局搜索
- `Ctrl + Alt + L`: 格式化代码

### 四、安装Android Studio

#### 4.1 下载Android Studio

```
下载地址：
```
- 官方下载：https://developer.android.com/studio
- 选择适合操作系统的版本（Windows/Mac/Linux）

```
版本选择：
```
- 下载最新稳定版本
- 文件大小约1GB

#### 4.2 安装步骤

```
Windows平台：
```

1. 运行安装程序
   - 双击下载的`.exe`安装文件
   - 按照安装向导完成安装
   - 选择安装路径（默认：`C:\Program Files\Android\Android Studio`）

2. 安装选项
   - 选择安装组件（建议全选）：
     - Android Studio
     - Android SDK
     - Android Virtual Device
```
     - Performance (Intel HAXM)
```

3. 首次启动配置
   - 启动Android Studio
   - 选择是否导入设置（首次安装选择"Do not import settings"）
   - 等待下载SDK组件（可能需要较长时间）

```
macOS平台：
```

1. 下载`.dmg`文件
2. 将Android Studio拖拽到Applications文件夹
3. 首次启动，按照向导完成配置

```
Linux平台：
```

1. 下载`.tar.gz`文件
2. 解压到指定目录
3. 运行`bin/studio.sh`启动

#### 4.3 配置SDK

```
SDK Manager配置：
```

1. 打开Android Studio
2. 选择 Configure → SDK Manager
3. SDK Platforms标签：
   - 选择需要安装的Android版本
   - 推荐安装：最新稳定版、LTS版本
   - 勾选"Show Package Details"查看详细组件

4. SDK Tools标签：
   - Android SDK Build-Tools
   - Android SDK Platform-Tools
   - Android SDK Tools
   - Android Emulator
```
   - Intel x86 Emulator Accelerator (HAXM installer)
```

5. 点击"Apply"开始下载安装

```
SDK路径：
```
- Windows：`C:\Users\YourUsername\AppData\Local\Android\Sdk`
- macOS：`~/Library/Android/sdk`
- Linux：`~/Android/Sdk`

### 五、环境变量配置

#### 5.1 配置ANDROID_HOME

```
Windows系统：
```

1. 右键"此电脑" → 属性 → 高级系统设置 → 环境变量
2. 新建系统变量：
   - 变量名：`ANDROID_HOME`
   - 变量值：`C:\Users\YourUsername\AppData\Local\Android\Sdk`
3. 编辑Path变量，添加：
   - `%ANDROID_HOME%\platform-tools`
   - `%ANDROID_HOME%\tools`
   - `%ANDROID_HOME%\tools\bin`

```
macOS/Linux系统：
```

```bash
# 编辑.bash_profile或.zshrc
nano ~/.bash_profile
# 或
nano ~/.zshrc

# 添加以下内容
export ANDROID_HOME=$HOME/Library/Android/sdk  # macOS
# 或
export ANDROID_HOME=$HOME/Android/Sdk  # Linux

export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin

# 使配置生效
source ~/.bash_profile
# 或
source ~/.zshrc
```

#### 5.2 验证配置

```
验证ADB：
```

```bash
# 打开命令行
adb version

# 应该显示ADB版本信息
# Android Debug Bridge version 1.0.41
```

```
验证其他工具：
```

```bash
# 验证fastboot
fastboot --version

# 验证aapt
aapt version
```

### 六、配置Android模拟器

#### 6.1 创建AVD（Android Virtual Device）

```
步骤：
```

1. 打开Android Studio
2. 选择 Tools → AVD Manager
3. 点击 Create Virtual Device
4. 选择设备类型：
   - Phone：手机设备
   - Tablet：平板设备
   - TV：电视设备
   - Wear OS：可穿戴设备
   - Automotive：汽车设备

5. 选择系统镜像：
   - 选择Android版本（推荐最新稳定版）
   - 如果没有，点击"Download"下载
   - 选择x86_64架构（性能更好）

6. 配置设备参数：
   - AVD Name：设备名称
   - Graphics：图形渲染方式
     - Automatic：自动选择
     - Hardware - GLES 2.0：硬件加速（推荐）
     - Software - GLES 2.0：软件渲染
   - Memory and Storage：
     - RAM：至少2GB（推荐4GB）
     - VM heap：64MB
     - Internal Storage：至少2GB

7. 点击"Finish"完成创建

#### 6.2 启动模拟器

```
方法1：从Android Studio启动
```
- 在AVD Manager中点击播放按钮
- 或选择设备后点击运行

```
方法2：从命令行启动
```
```bash
# 列出所有AVD
emulator -list-avds

# 启动指定AVD
emulator -avd Pixel_5_API_33
```

#### 6.3 模拟器优化

```
启用硬件加速：
```

```
Windows（Intel）：
```
1. 安装Intel HAXM
2. 在BIOS中启用虚拟化技术（Intel VT-x）

```
macOS：
```
- 自动支持硬件加速

```
Linux：
```
1. 安装KVM
2. 配置用户权限

```
性能优化：
```
- 使用x86_64架构镜像
- 分配足够的内存（至少4GB）
- 启用硬件加速
- 关闭不需要的功能

### 七、创建第一个Android项目

#### 7.1 创建新项目

```
步骤：
```

1. 打开Android Studio
   - 启动Android Studio
   - 选择 Start a new Android Studio project

2. 选择项目模板
   - Empty Activity：空白Activity（推荐初学者）
   - Basic Activity：带导航的基础Activity
   - Bottom Navigation Activity：底部导航Activity
   - Navigation Drawer Activity：侧边栏导航Activity
   - Login Activity：登录界面模板

3. 配置项目信息
   - Name：项目名称（如：MyFirstApp）
   - Package name：包名（如：com.example.myfirstapp）
   - Save location：项目保存位置
   - Language：选择Java或Kotlin（推荐Kotlin）
   - Minimum SDK：最低支持的Android版本
     - API 21（Android 5.0）：覆盖约95%的设备
     - API 24（Android 7.0）：推荐最低版本
     - API 26（Android 8.0）：推荐生产环境

4. 点击Finish
   - 等待Gradle同步完成
   - 首次创建可能需要下载依赖，需要较长时间

#### 7.2 项目结构

```
标准Android项目结构：
```

```
MyFirstApp/
├── app/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/example/myfirstapp/
│   │   │   │   └── MainActivity.kt
│   │   │   ├── res/
│   │   │   │   ├── layout/
│   │   │   │   │   └── activity_main.xml
│   │   │   │   ├── values/
│   │   │   │   │   ├── strings.xml
│   │   │   │   │   └── colors.xml
│   │   │   │   └── mipmap/
│   │   │   │       └── ic_launcher.png
│   │   │   └── AndroidManifest.xml
│   │   └── test/
│   ├── build.gradle
│   └── proguard-rules.pro
├── gradle/
├── build.gradle
├── settings.gradle
└── gradle.properties
```

```
主要文件说明：
```

- MainActivity.kt/java：主Activity类
- activity_main.xml：布局文件
- AndroidManifest.xml：应用清单文件
- build.gradle：构建配置文件
- strings.xml：字符串资源文件

#### 7.3 运行项目

```
方法1：使用Android Studio运行
```

1. 点击工具栏的运行按钮（绿色三角形）
2. 或按快捷键：`Shift + F10`（Windows/Linux）或 `Ctrl + R`（macOS）
3. 选择运行设备：
   - 已连接的设备
   - 已启动的模拟器
   - 或创建新的模拟器

```
方法2：使用命令行运行
```

```bash
# 编译APK
./gradlew assembleDebug

# 安装到设备
adb install app/build/outputs/apk/debug/app-debug.apk

# 或直接运行
./gradlew installDebug
```

#### 7.4 真机调试配置

```
启用开发者选项：
```

1. 打开手机设置
2. 关于手机 → 连续点击"版本号"7次
3. 返回设置，找到"开发者选项"

```
启用USB调试：
```

1. 进入开发者选项
2. 启用"USB调试"
3. 启用"USB安装"（可选）

```
连接设备：
```

1. 使用USB线连接手机到电脑
2. 在手机上允许USB调试
3. 在Android Studio中，设备列表会显示连接的设备

```
验证连接：
```

```bash
# 查看连接的设备
adb devices

# 应该显示设备信息
# List of devices attached
# ABC123XYZ    device
```

### 八、Gradle配置优化

#### 8.1 配置Gradle镜像源

```
配置gradle.properties：
```

```properties
# 项目根目录/gradle.properties
# 使用阿里云镜像
org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.enableJetifier=true

# 配置仓库镜像
systemProp.http.proxyHost=mirrors.aliyun.com
systemProp.http.proxyPort=80
```

```
配置build.gradle：
```

```gradle
// 项目根目录/build.gradle
buildscript {
    repositories {
        maven { url 'https://maven.aliyun.com/repository/google' }
        maven { url 'https://maven.aliyun.com/repository/central' }
        maven { url 'https://maven.aliyun.com/repository/gradle-plugin' }
    }
}

allprojects {
    repositories {
        maven { url 'https://maven.aliyun.com/repository/google' }
        maven { url 'https://maven.aliyun.com/repository/central' }
        maven { url 'https://maven.aliyun.com/repository/jcenter' }
    }
}
```

#### 8.2 优化Gradle性能

```
gradle.properties优化：
```

```properties
# 启用Gradle守护进程
org.gradle.daemon=true

# 启用并行构建
org.gradle.parallel=true

# 启用构建缓存
org.gradle.caching=true

# 配置JVM参数
org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=512m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8
```

### 九、常用开发工具

#### 9.1 ADB（Android Debug Bridge）

```
常用ADB命令：
```

```bash
# 查看连接的设备
adb devices

# 安装APK
adb install app.apk

# 卸载应用
adb uninstall com.example.app

# 查看日志
adb logcat

# 过滤日志
adb logcat | grep "TAG"

# 清除日志
adb logcat -c

# 进入设备shell
adb shell

# 推送文件到设备
adb push local_file /sdcard/

# 从设备拉取文件
adb pull /sdcard/file local_path
```

#### 9.2 其他工具

```
Android Device Monitor：
```
- 查看设备信息
- 文件浏览器
- 日志查看器

```
Layout Inspector：
```
- 实时查看布局层次
- 调试UI问题

```
Profiler：
```
- CPU性能分析
- 内存分析
- 网络分析

### 十、常见问题解决

#### 10.1 安装问题

```
问题1：Gradle同步失败
```

```
解决方案：
```
```bash
# 1. 检查网络连接
ping maven.google.com

# 2. 配置Gradle镜像源（见7.1节）

# 3. 清理项目
Build → Clean Project

# 4. 删除.gradle缓存
rm -rf ~/.gradle/caches

# 5. 重新同步
File → Sync Project with Gradle Files
```

```
问题2：SDK下载缓慢
```

```
解决方案：
```
- 配置代理服务器
- 使用国内镜像源
- 手动下载SDK组件到SDK目录

```
问题3：JDK版本不兼容
```

```
解决方案：
```
- 检查JDK版本：`java -version`
- Android Studio要求JDK 8或更高版本
- 在Project Structure中配置正确的JDK路径

#### 10.2 运行问题

```
问题1：模拟器启动失败
```

```
解决方案：
```
- 检查是否启用了虚拟化技术（Intel VT-x或AMD-V）
- 在BIOS中启用虚拟化支持
- 检查HAXM是否正确安装
- 尝试使用真机调试

```
问题2：应用安装失败
```

```
解决方案：
```
```bash
# 检查设备连接
adb devices

# 检查设备存储空间
adb shell df -h

# 卸载旧版本
adb uninstall com.example.app

# 重新安装
adb install app.apk
```

```
问题3：构建错误
```

```
解决方案：
```
- 检查build.gradle配置
- 清理并重新构建：Build → Rebuild Project
- 检查依赖版本冲突
- 查看Gradle日志

#### 10.3 性能问题

```
问题1：Android Studio运行缓慢
```

```
解决方案：
```
- 增加IDE内存：Help → Edit Custom VM Options
- 禁用不必要的插件
- 使用SSD硬盘
- 增加系统内存

```
问题2：模拟器运行缓慢
```

```
解决方案：
```
- 使用x86_64架构镜像
- 启用硬件加速
- 分配更多内存
- 使用真机调试

### 十一、下一步学习

通过本文的学习，您已经掌握了Android开发环境的基础配置。接下来您可以：

1. 学习Android基础：Activity、Fragment、布局
2. 学习Kotlin/Java：掌握开发语言
3. 学习Android组件：Service、BroadcastReceiver、ContentProvider
4. 学习数据存储：SharedPreferences、SQLite、Room

在下一篇文章（进阶篇）中，我们将深入学习Android开发环境的高级配置，包括Gradle构建系统、依赖管理、性能优化、架构设计等内容。
