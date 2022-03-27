---
title: 推荐系列-HMS Core音频编辑服务，实时分离人声-伴奏和乐器声
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 293
cover_picture: 'https://oscimg.oschina.net/oscnet/up-c10e7e4fd56321f94da2ca9f66b7c3f142c.gif'
abbrlink: '58734335'
date: 2022-03-27 11:55:11
---

&emsp;&emsp;取一首歌的伴奏却找不到资源怎么办？没关系，我们可以自己解决。音频编辑服务提供音源分离的功能，帮助开发者在应用中构建人声与伴奏分离的功能。 目前，音源分离功能已经开放了人声与伴...
<!-- more -->

                                                                                                                    
            程序员健身是为了保养还是保命？参与话题讨论赢好礼 >>>
            
                                                                                                    想获取一首歌的伴奏却找不到资源怎么办？没关系，我们可以自己解决。音频编辑服务提供音源分离的功能，帮助开发者在应用中构建人声与伴奏分离的功能。 目前，音源分离功能已经开放了人声与伴奏、乐器等多种分离的方式，可以实时解析并将乐器中的人声和各种乐器元素提取到独立的音轨上，满足创作者对伴奏制作、扒带、音乐创作等多种场景的应用需求。并且，无需专业的音频处理软件，只要集成华为音频编辑服务，就能在移动端轻松完成音频剪辑，让创作者更加便捷的感受到声音的魅力。 
 Demo演示 
下面我们来实操一下如何接入华为音频编辑服务，实现音源分离效果。 
开发实战 
##### 1. 开发准备 
详细准备步骤可参考华为开发者联盟官网： https://developer.huawei.com/consumer/cn/doc/development/Media-Guides/config-agc-0000001154009063?ha_source=hms1 
##### 2. 编辑工程集成 
###### 2.1设置应用的鉴权信息 
开发者需要通过api_key或者Access Token来设置应用鉴权信息。 
 
 （推荐）通过setAccessToken方法设置Access Token，在应用启动时初始化设置 
 
HAEApplication.getInstance().setAccessToken("your access token"); 
 
 通过setApiKey方法设置api_key，在应用启动时初始化设置一次即可，无需多次设置。 
 
HAEApplication.getInstance().setApiKey("your ApiKey"); 
###### 2.2初始化环境 
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

  ``` 
  
##### 3. 音源分离功能集成 
 
 ```java 
  调用getInstruments和startSeparationTasks接口进行音源分离。
// 音源分离
// SeparationCloudCallBack：获取类型的回调
HAEAudioSeparationFile haeAudioSeparationFile = new HAEAudioSeparationFile();
haeAudioSeparationFile.getInstruments(new SeparationCloudCallBack<List<SeparationBean>>() {
    @Override
    public void onFinish(List<SeparationBean> response) {
        // 返回的数据
    }
    @Override
    public void onError(int errorCode) {
        // 失败返回
    }
});
// 设置要提取的伴奏参数
haeAudioSeparationFile.setInstruments(伴奏id集合);
// 开始分离
haeAudioSeparationFile.startSeparationTasks(inAudioPath, outAudioDir, outAudioName, new AudioSeparationCallBack() {
    @Override
    public void onResult(SeparationBean separationBean) { }
    @Override
    public void onFinish(List<SeparationBean> separationBeans) {}
    @Override
    public void onFail(int errorCode) {}
    @Override
    public void onCancel() {}
});
// 取消分离任务
haeAudioSeparationFile.cancel();

  ``` 
  
除了音源分离功能，华为音频编辑服务还为开发者提供了一站式音频编辑服务，涵盖了音频/音乐处理所需的几十项专业能力，开发者只需要通过简单的集成方式即可让应用获取强大的音频处理能力，可极大帮助客户提升音频/音乐方面的处理效率。 
更多华为音频编辑服务详情，请参考： 服务官网：https://developer.huawei.com/consumer/cn/hms/huawei-audio-editor/?ha_source=hms1 获取指导文档：https://developer.huawei.com/consumer/cn/doc/development/Media-Guides/client-dev-0000001107465102?ha_source=hms1 
了解更多详情>> 
访问华为开发者联盟官网 获取开发指导文档 华为移动服务开源仓库地址：GitHub、Gitee 
关注我们，第一时间了解 HMS Core 最新技术资讯~
                                        