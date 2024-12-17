---
title: 柯迪亚克9寸中控大屏实现HA汽车定位-斯柯达
categories: 原创文章
author: 狂欢马克思
tags:
  - Hobby
top: 3
cover_picture: 'https://pic.haoxiang.eu.org/image/2024/12/15/h2lx3a.png'
abbrlink: f9583615
date: 2024-12-13 10:04:00
---

本篇文章介绍了如何通过斯柯达柯迪亚克的9寸中控大屏实现汽车定位功能，结合高德地图和Home Assistant系统，通过简单的步骤实现汽车实时定位。文章首先阐明了所需的前提条件，包括车载设备的安卓系统、高德地图版本、以及Home Assistant 2023.4及以上版本的支持。

<!-- more -->

![Popular](https://pic.haoxiang.eu.org/image/2024/12/17/nk44hp.jpg "HA汽车定位")

### 一、前提条件  

在实现HA（Home Assistant）与柯迪亚克9寸中控大屏的定位功能之前，您需要满足以下前提条件：  

1. **车载中控设备**：拥有9寸中控大屏，并且运行的是安卓系统。  
2. **高德地图版本要求**：  
   - 中控大屏需安装**高德地图车机版**5.0及以上版本。  
   - 手机端需安装**2021年以前的高德地图老版本**APP。  
3. **智能家居环境**：Home Assistant 2023.4版本或更新版本已安装。  

---

### 二、操作方法  

1. 登录高德地图账号  

- **车机版与手机版高德地图**需使用**同一账号**登录。  
- 在车机端通过扫码功能，快速完成登录。  

<p align="center">扫码登录高德地图车机版</p> 

![推荐系列-#斯柯达#柯迪亚克9寸中控屏安装第三方APP](https://pic.haoxiang.eu.org/image/2024/12/17/ha997u.jpg)  

---

2. 手机端抓取数据  

在手机高德地图APP上进行抓包操作，重点抓取以下参数：  

- **key**：路径 `/ws/tservice/internal/link/mobile/get?ent=2&in=...` 后的长字符串。  
- **sessionid**：示例 `cpuywkud2f0jvhpXXXXXXXXXX`。  
- **POST主体参数**：例如 `oMYpXXXXXXXXXX`。  

以下为操作截图参考：  

![抓包截图1](https://pic.haoxiang.eu.org/image/2024/12/17/hbicro.jpg)  
![抓包截图2](https://pic.haoxiang.eu.org/image/2024/12/17/hbhyjj.jpg)  
![抓包截图3](https://pic.haoxiang.eu.org/image/2024/12/17/hbi9tm.jpg)  
![抓包截图4](https://pic.haoxiang.eu.org/image/2024/12/17/hbigo7.jpg)  

---

3. Home Assistant 安装插件  

- 安装插件 **autoamap**：  
  插件仓库地址：[https://github.com/dscao/autoamap](https://github.com/dscao/autoamap)。  

- **获取高德地图开发者KEY**：  
  前往高德地图官网注册 [高德账号Web服务KEY](https://lbs.amap.com/dev/key)，以便后续接口调用。  

<p align="center">选项 - 高德地图开发 - 获取key</p>

![高德开发者KEY](https://pic.haoxiang.eu.org/image/2024/12/17/hbi1uc.jpg)  

---

###  三、实现效果  

通过上述操作完成后，HA可以接入高德地图的定位数据，实现车辆实时位置与状态展示。  

1. **实时车辆位置展示**  
   - 手机抓取的高德地图定位信息同步至Home Assistant。  
   - 在车辆导航状态或停车关闭导航前，均能获取并同步位置信息。  
   - 汽车通电后，连接手机热点或车载WiFi，系统可自动更新位置信息，支持实时路况播报。  

<p align="center">显示汽车位置</p> 

![车辆位置展示](https://pic.haoxiang.eu.org/image/2024/12/17/hbi2wx.jpg)  

2. **车辆状态信息展示**  
   - 通过HA界面显示车辆基本信息，如速度、状态、导航详情等。  

<p align="center">显示汽车信息</p> 

![汽车信息展示](https://pic.haoxiang.eu.org/image/2024/12/17/hbhy5p.png)  

---

###  四、注意事项  

在操作过程中，请注意以下问题：  

1. **多设备账号问题**  
   - 如果同一高德账号登录了多个车机版高德地图，插件将仅显示第一个车辆信息。  

2. **设备数量限制**  
   - 高德账号最多支持6个车机设备登录，若超过限制，可能无法获取位置信息。  
   - 解决方法：注销账号重新注册，或新注册一个账号用于抓取数据。  

---

###  五、总结  

通过本教程，您可以轻松实现柯迪亚克9寸中控大屏与Home Assistant的汽车定位功能，利用高德地图API和HA的强大集成能力，达到实时监控车辆位置与信息的效果。  

如果您在操作过程中遇到任何问题，欢迎在评论区留言交流！  
