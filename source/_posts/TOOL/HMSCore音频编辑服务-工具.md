---
title: HMSCore音频编辑服务
categories:
  - 工具
  - 工程效能
tags:
  - Java
abbrlink: 71a5f7af
date: 2021-01-05 00:00:00
top: 92
---

Demo演示下面我们来实操一下如何接入华为音频编辑服务，实现音源分离效果。开发实战

<!-- more -->

 （推荐）通过setAccessToken方法设置Access Token，在应用启动时初始化设置

```
HAEApplication.getInstance().setAccessToken("your access token");
```

 通过setApiKey方法设置api_key，在应用启动时初始化设置一次即可，无需多次设置。

```
HAEApplication.getInstance().setApiKey("your ApiKey");
```

### 2.2初始化环境

初始化音频编辑管理类、创建时间线以及需要的泳道。

```java
  // 创建音频编辑管理类
HuaweiAudioEditor mEditor = HuaweiAudioEditor.create(mContext);
// 初始化Editor的运行环境
mEditor.initEnvironment();
// 创建时间线
HAETimeLine mTimeLine = mEditor.getTimeLine();
// 创建泳道
HAEAudioLane audioLane = mTimeLine.appendAudioLane();
导入音乐。
// 泳道末尾添加音频资源
HAEAudioAsset audioAsset = audioLane.appendAudioAsset("/sdcard/download/test.mp3", mTimeLine.getCurrentTime());

  ##### 3. 音源分离功能集成

```
  调用getInstruments和startSeparationTasks接口进行音源分离。
// 音源分离
// SeparationCloudCallBack：获取类型的回调
HAEAudioSeparationFile haeAudioSeparationFile = new HAEAudioSeparationFile();
haeAudioSeparationFile.getInstruments(new SeparationCloudCallBack<List<SeparationBean>>() {
    @Override
    public void onFinish(List<SeparationBean> response) {
        // 返回的数据
    }
    public void onError(int errorCode) {
        // 失败返回
    }
});
// 设置要提取的伴奏参数
haeAudioSeparationFile.setInstruments(伴奏id集合);
// 开始分离
haeAudioSeparationFile.startSeparationTasks(inAudioPath, outAudioDir, outAudioName, new AudioSeparationCallBack() {
    public void onResult(SeparationBean separationBean) { }
    public void onFinish(List<SeparationBean> separationBeans) {}
    public void onFail(int errorCode) {}
    public void onCancel() {}
});
// 取消分离任务
haeAudioSeparationFile.cancel();

  ```

除了音源分离功能，华为音频编辑服务还为开发者提供了一站式音频编辑服务，涵盖了音频/音乐处理所需的几十项专业能力，开发者只需要通过简单的集成方式即可让应用获取强大的音频处理能力，可极大帮助客户提升音频/音乐方面的处理效率。
华为移动服务开源仓库地址：GitHub、Gitee

```
