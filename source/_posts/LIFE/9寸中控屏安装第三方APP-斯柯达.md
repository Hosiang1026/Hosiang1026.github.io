---
title: 9寸中控屏安装第三方APP-斯柯达
categories: 柯迪亚克
author: 狂欢马克思
tags:
  - Skoda
top: 3
cover_picture: 'https://api.opics.org/api'
abbrlink: cebc765c
date: 2024-12-13 10:04:00
---

合众北斗9寸中控屏车机存在APP安装白名单限制，传统悟空推送方式无法使用。本文分享一个无需Root、安全无风险的通用解决方案，通过ADB命令轻松绕过白名单限制，实现第三方APP安装。无需开启手机热点或WiFi，只需一根双公头USB数据线连接电脑，即可完成APP安装，让您的车机功能更加丰富强大。

<!-- more -->

![Popular](https://hosiang1026.github.io/photos/image/2024/12/15/h2ktnw.png "#斯柯达#柯迪亚克9寸中控屏安装第三方APP")

### 一、准备要求

#### 1.1 硬件准备

1. Windows系统笔记本电脑
   - 用于操作ADB命令
   - 建议使用Windows 10或更高版本
   - 确保USB接口正常工作

2. 双公头USB数据线
   - 两端都是USB-A公头的特殊数据线
   - 用于连接车机和电脑
   - 可以在某宝搜索"双公头USB数据线"购买，价格实惠（通常10-20元）
   - 注意：必须是数据线，不能是只能充电的线

#### 1.2 软件准备

1. ADB工具包
   - Android Debug Bridge（Android调试桥）
   - 可以从Android开发者官网下载
   - 或者使用本文提供的工具包

2. 需要安装的APP安装包
   - 提前下载好需要安装的APK文件
   - 建议放在容易找到的路径（如D盘根目录）
   - 确保APK文件完整且未损坏

<div align="center">  
  <p>2018款柯迪亚克车机系统信息</p>  
  <img src="https://hosiang1026.github.io/photos/image/2024/12/15/h2l2td.png" alt="车机系统信息" title="车机系统信息">
</div>

<div align="center">  
  <p>双公头USB数据线</p>  
  <img src="https://hosiang1026.github.io/photos/image/2024/12/15/h2l49p.png" alt="双公头USB数据线" title="双公头USB数据线">
</div>

### 二、操作步骤

1. 解锁USB模式

重要说明：
- USB默认处于充电模式，无法进行数据传输
- 需要输入隐藏密码进行解锁，才能使用ADB连接

操作步骤：

1. 打开拨号界面：
   - 在车机主界面找到"电话"或"拨号"应用
   - 点击进入拨号界面

2. 输入解锁密码：
   - 打开USB模式：在拨号界面输入 `*#534*62559##*`
   - 输入完成后，系统会自动切换到USB调试模式
   - 屏幕上可能会显示"USB调试已开启"或类似提示

3. 关闭USB模式（操作完成后）：
   - 拨号界面输入 `*#62559*534##*`
   - 重要：操作结束后记得关闭USB模式，否则USB口不能充电

注意事项：
- 密码输入要准确，注意大小写和特殊字符
- 如果输入后没有反应，检查是否在拨号界面输入
- 某些车型的密码可能不同，如果无效请咨询车友或查看相关论坛  

<div align="center">  
  <p>解锁USB模式</p>  
  <img src="https://hosiang1026.github.io/photos/image/2024/12/15/h2l22l.png" alt="解锁USB模式" title="解锁USB模式">
</div>

2. 连接车机与电脑

连接步骤：

1. 找到车机USB接口：
   - 中控屏主USB插口通常位于靠近副驾驶位的位置
   - 注意区分主USB口和副USB口（通常主USB口支持数据传输）
   - 如果不确定，可以查看车辆说明书或咨询4S店

2. 连接数据线：
   - 将双公头USB数据线的一端插入中控屏主USB插口
   - 将另一端插入笔记本电脑的USB接口
   - 确保连接牢固，接触良好

3. 检查连接状态：
   - 连接成功后，车机可能会显示"USB已连接"提示
   - 电脑可能会弹出"发现新硬件"提示
   - 如果没有任何反应，检查数据线是否支持数据传输

注意事项：
- 确保使用主USB口，副USB口可能只支持充电
- 如果连接后电脑无法识别设备，尝试更换USB接口
- 某些情况下需要安装USB驱动，Windows 10通常会自动安装

<div align="center">  
  <p>查看设备连接状态</p>  
  <img src="https://hosiang1026.github.io/photos/image/2024/12/15/h2lglv.png" alt="查看设备连接" title="查看设备连接">
</div>

3. 安装ADB工具并执行命令

ADB工具使用说明：

ADB工具是免安装的，不需要配置全局环境变量。最简单的方法是：

1. 解压ADB工具包：
   - 将下载的ADB工具包解压到任意位置（如D:\adb）
   - 重要：adb的路径不要包含中文，建议使用英文路径

2. 打开命令提示符：
   - 进入ADB文件夹（如D:\adb）
   - 在文件夹地址栏输入 `cmd` 并按回车
   - 或者按住Shift键，右键点击文件夹空白处，选择"在此处打开命令窗口"

3. 执行ADB命令：

步骤一：查看设备连接状态
```bash
adb devices
```
- 如果连接成功，会显示设备列表
- 显示类似：`List of devices attached` 和 `xxxxxxxx device`
- 如果显示`unauthorized`，需要在车机上允许USB调试授权

步骤二：安装APP
```bash
adb install D:\SkodaEQ.apk
```
- 将`D:\SkodaEQ.apk`替换为你的APP实际路径
- 路径中可以使用反斜杠`\`或正斜杠`/`
- 如果路径包含空格，需要用引号括起来，如：`adb install "D:\My App\app.apk"`

安装结果：
- 如果显示`Success`，表示安装成功
- 如果显示错误信息，请查看错误提示并解决

常见错误处理：
- `device not found`：检查USB连接和USB模式是否开启
- `unauthorized`：在车机上允许USB调试授权
- `INSTALL_FAILED`：查看具体错误信息，可能是APP版本不兼容

<p align="center">APP路径</p>

![Popular](https://hosiang1026.github.io/photos/image/2024/12/15/h2lqsv.png "推荐系列-#斯柯达#柯迪亚克9寸中控屏安装第三方APP")

<p align="center">在adb所在路径上输入cmd, 按回车键</p>

![Popular](https://hosiang1026.github.io/photos/image/2024/12/15/h2ll52.png "推荐系列-#斯柯达#柯迪亚克9寸中控屏安装第三方APP")

<p align="center">使用adb命令详细如下</p>

![Popular](https://hosiang1026.github.io/photos/image/2024/12/15/h2ll7e.png "推荐系列-#斯柯达#柯迪亚克9寸中控屏安装第三方APP")


### 三、ADB命令

```bash
# 打开USB模式
*#534*62559##*

# 关闭USB模式
*#62559*534##*

# 连接车机
adb devices

# 安装APP
adb install <path_apk>

# 推送图片
adb  push  D:/19110104_032696c5d8.png sdcard/

# 所有APP列表
adb shell pm list packages

# 卸载APP
adb shell pm uninstall --user 0 <path_apk>

# APP的路径
adb shell pm path <path_apk>

# 导出APP安装包
adb pull <path_apk> <out_apk>

#温馨提示: 车机操作结束后，记得关闭USB模式(不关闭，USB口不能充电)

连接成功后输入以下命令重新挂载目录：
adb remount

继续输入以下命令设置目录读写权限：
adb shell mount -o remount,rw /system

继续输入以下命令获取此目录下的应用列表：
adb shell ls /system/app

找到PackageInstaller.apk注意大小写， 继续输入以下命令删除PackageInstaller.apk：
adb shell rm /system/app/PackageInstaller.apk

输入以下命令复制新的到PackageInstaller.apk到 /system/app目录下：
adb push PackageInstaller.apk /system/app/PackageInstaller.apk

输入以下命令设置PackageInstaller.apk的权限：
adb shell chmod 644 /system/app/PackageInstaller.apk

以上操作完成后重启车机或输入以下命令重启：
adb reboot

```

### 四、常见问题

1. 安装失败：INSTALL_FAILED_OLDER_SDK
- 原因：APP的最低支持版本 `minSdkVersion` 太高，中控屏系统版本较低。  
- 解决：更换低版本APP，例如：若APP要求Android 4.0以上，而车机仅支持1.3版本。

---

### 五、进阶操作

自定义中控功能，关闭默认收音机，替换为音乐播放器
注意：此操作有风险，替换脚本不正确可能导致系统异常。

1. 使用论坛提供的脚本设置第三方音乐播放器；
2. 若触控按键失效或系统重启，通过备份的`hkmanager.apk`恢复原功能。

![Popular](https://hosiang1026.github.io/photos/image/2024/12/15/h2lpx0.png "#斯柯达#柯迪亚克9寸中控屏安装第三方APP")

### 六、附件下载

相关帖子：  
- [9寸车机解锁USB模式](https://club.autohome.com.cn/bbs/thread/84fffc2a4d664764/86248552-1.html)  
- [破解收音机、安装APP限制](https://club.autohome.com.cn/bbs/thread/532d43b11f73ae35/81904759-1.html)  

附件下载：  

请前往[菜单栏-收藏](https://haoxiang.eu.org/collection)下载车机软件包

> 附件清单: adb工具、SkodaEQ
> 导航地图: 高德地图、腾讯地图

- 腾讯地图的优点: 主要是提供微信小程序进行爱车的定位显示
- 高德地图的优点: 开屏显示斯柯达车标版本，同步驾驶里程和常用地址收藏

![Popular](https://hosiang1026.github.io/photos/image/2024/12/17/gk5bku.jpg "推荐系列-#斯柯达#柯迪亚克9寸中控屏安装第三方APP")

### 七、工程模式

进入工程模式

- USB调试：部分车型的USB调试模式可能隐藏在工程菜单中。  
- 系统升级：若有原厂固件，可以在此进行升级或故障诊断。

这个截图，来自其他车型破解方法

![Popular](https://hosiang1026.github.io/photos/image/2024/12/15/126znpo.jpg "推荐系列-#斯柯达#柯迪亚克9寸中控屏安装第三方APP")

![Popular](https://hosiang1026.github.io/photos/image/2024/12/15/126zg10.jpg "推荐系列-#斯柯达#柯迪亚克9寸中控屏安装第三方APP")

![Popular](https://hosiang1026.github.io/photos/image/2024/12/15/126zgsj.jpg "推荐系列-#斯柯达#柯迪亚克9寸中控屏安装第三方APP")

- 在中控屏四角按顺序点击，进入工程菜单。
中控屏版本信息，屏幕的四角按顺序点击，就可以出现下面的隐藏页面：

![Popular](https://hosiang1026.github.io/photos/image/2024/12/15/126zh6v.jpg "推荐系列-#斯柯达#柯迪亚克9寸中控屏安装第三方APP")

工程模式，看上去很简单，不知道有没有隐藏啥后门，大家可以尝试碰碰运气

![Popular](https://hosiang1026.github.io/photos/image/2024/12/15/126zm4y.jpg "推荐系列-#斯柯达#柯迪亚克9寸中控屏安装第三方APP")

升级入口，有原厂固件就可以升级，甚至可以自己定制修改。

发生故障，可以通过日志排查问题，这一般都是我们开发人员查找问题依据。

![Popular](https://hosiang1026.github.io/photos/image/2024/12/15/126zk4j.jpg "推荐系列-#斯柯达#柯迪亚克9寸中控屏安装第三方APP")

![Popular](https://hosiang1026.github.io/photos/image/2024/12/15/126zmmb.jpg "推荐系列-#斯柯达#柯迪亚克9寸中控屏安装第三方APP")

收音机设置，左边输入数字，不知道是啥密码。上面的收音机参数，用处不太清楚，也不敢轻易修改。

注意事项
通过以上步骤，即可轻松绕过APP白名单限制，安全地在合众北斗9寸中控屏车机上安装第三方APP。请谨慎操作高级设置，遇到问题及时恢复备份，避免系统故障。

希望本文对你有所帮助，欢迎留言交流更多玩法！ 🚗✨