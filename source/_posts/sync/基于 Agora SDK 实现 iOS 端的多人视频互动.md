---
title: 推荐系列-基于 Agora SDK 实现 iOS 端的多人视频互动
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 270
date: 2022-05-11 05:14:30
cover_picture: 'https://img-blog.csdnimg.cn/388f8b4690814da0b50a93eb85020ab0.png#pic_center'
---

&emsp;&emsp;互动直播是当前比较热门的玩法，我们经常见到有PK 连麦、直播答题、一起 KTV、电商直播、互动大班课、视频相亲等。 本文将教你如何通过声网Agora 视频 SDK 在iOS端实现一个视频直播应用。...
<!-- more -->

                                                                                                                                                                                        视频互动直播是当前比较热门的玩法，我们经常见到有PK 连麦、直播答题、一起 KTV、电商直播、互动大班课、视频相亲等。 
本文将教你如何通过声网Agora 视频 SDK 在iOS端实现一个视频直播应用。注册声网账号后，开发者每个月可获得 10000 分钟的免费使用额度，可实现各类实时音视频场景。 
话不多说，我们开始动手实操。 
#### 一、 通过开源Demo，体验视频直播 
可能有些人，还不了解我们要实现的功能最后是怎样的。所以我们在 GitHub上提供一个开源的基础视频直播示例项目，在开始开发之前你可以通过该示例项目体验视频直播的体验效果。 
 image622×1108 87.4 KB 
 image608×1102 99 KB 
Agora 在 GitHub 上提供开源的互动直播示例项目 OpenLive-iOS-Objective-C 与 OpenLive-iOS-Swift。在实现相关功能前，你可以下载并查看源代码。 
Objective-C Github链接：Basic-Video-Broadcasting/OpenLive-iOS-Objective-C at master · AgoraIO/Basic-Video-Broadcasting · GitHub 4 Swift Github链接：Basic-Video-Broadcasting/OpenLive-iOS at master · AgoraIO/Basic-Video-Broadcasting · GitHub 1 
#### 二、 视频直播的技术原理 
我们在这里要实现的是视频直播，Agora 的视频直播可以实现互动效果，所以也经常叫互动直播。你可以理解为是多个用户通过加入同一个频道，实现的音视频的互通，而这个频道的数据，会通过声网的 Agora SD-RTN 实时网络来进行低延时传输的。 
需要特别说明的是，Agora互动直播不同于视频直播。视频通话不区分主播和观众，所有用户都可以发言并看见彼此；而互动直播的用户分为主播和观众，只有主播可以自由发言，且被其他用户看见。 
下图展示在 App 中集成 Agora 互动直播的基本工作流程： 
image870×600 51.2 KB 
如图所示，实现视频直播的步骤如下： 
 
 获取 Token：当 app 客户端加入频道时，你需要使用 Token 验证用户身份。在测试或生产环境中，从 app 服务器中获取 Token。 
 加入频道：调用 joinChannel 创建并加入频道。使用同一频道名称的 app 客户端默认加入同一频道。频道可理解为专用于传输实时音视频数据的通道。 
 在频道内发布和订阅音视频流：加入频道后，app 客户端均可以在频道内发布和订阅音视频。 
 
App 客户端加入频道需要以下信息： 
 
 App ID：Agora 随机生成的字符串，用于识别你的 App，可从 Agora 控制台获取，（Agora控制台链接：Dashboard 
 用户 ID：用户的唯一标识。你需要自行设置用户 ID，并确保它在频道内是唯一的。 
 Token：在测试或生产环境中，app 客户端从你的服务器中获取 Token。在本文介绍的流程中，你可以从 Agora 控制台获取临时 Token。临时 Token 的有效期为 24 小时。 
 频道名称：用于标识视频直播频道的字符串。 
 
#### 三、 开发环境 
声网Agora SDK 的兼容性良好，对硬件设备和软件系统的要求不高，开发环境和测试环境满足以下条件即可： • Xcode 9.0或以上版本 • 支持语音和视频功能的真机 • App 要求支持iOS 8.0或以上版本的iOS设备 
以下是本文的开发环境和测试环境： 
开发环境 • macOS 11.6版本 • Xcode Version 13.1 
测试环境 • iPhone7 (iOS 15.3) 
如果你此前还未接触过声网 Agora SDK，那么你还需要做以下准备工作： • 注册一个声网账号，进入后台创建 AppID、获取 Token， • 下载声网官方最新的视频直播SDK；（视频直播SDK链接：下载 - 视频通话 - 文档中心 - 声网Agora 
#### 四、 项目设置 
##### 1. 实现视频直播之前，参考如下步骤设置你的项目： 
a) 如需创建新项目, Xcode里，打开 Xcode 并点击 Create a new Xcode project。（创建 iOS项目链接：https://developer.apple.com/documentation/xcode/creating-an-xcode-project-for-an-app） 1 
b) 选择平台类型为 iOS、项目类型为 Single View App，并点击 Next。 
c) 输入项目名称（Product Name）、开发团队信息（Team）、组织名称（Organization Name）和语言（Language）等项目信息，并点击 Next。 注意：如果你没有添加过开发团队信息，会看到 Add account… 按钮。点击该按钮并按照屏幕提示登入 Apple ID，完成后即可选择你的 Apple 账户作为开发团队。 
d) 选择项目存储路径，并点击 Create。 
##### 2. 集成SDK 
选择如下任意一种方式获取最新版 Agora iOS SDK。 
###### 方法一：使用 CocoaPods 获取 SDK 
a) 开始前确保你已安装 Cocoapods。参考 Getting Started with CocoaPods 安装说明。（Getting Started with CocoaPods 安装说明链接：CocoaPods Guides - Getting Started 1 
 
 ```java 
  # platform :ios, '9.0'
target 'Your App' do
    pod 'AgoraRtcEngine_iOS'
end

  ``` 
  
b) 在终端里进入项目根目录，并运行 pod init 命令。项目文件夹下会生成一个 Podfile 文本文件。 c) 打开 Podfile 文件，修改文件为如下内容。注意将 Your App 替换为你的 Target 名称。 方法二：从官网获取 SDK a) 前往 SDK 下载页面，获取最新版的 Agora iOS SDK，然后解压。（视频直播SDK链接：下载 - 视频通话 - 文档中心 - 声网Agora b) 根据你的需求，将 libs 文件夹中的动态库复制到项目的 ./project_name 文件夹下（project_name 为你的项目名称）。 c) 打开 Xcode，进入 TARGETS > Project Name > Build Phases > Link Binary with Libraries 菜单，点击 + 添加如下库（如：）。在添加 AgoraRtcEngineKit.framework 文件时，还需在点击 + 后点击 Add Other…，找到本地文件并打开。 
共需要添加11个库文件： i. AgoraRtcEngineKit.framework ii. Accelerate.framework iii. AudioToolbox.framework iv. AVFoundation.framework v. CoreMedia.framework vi. CoreML.framework vii. CoreTelephony.framework viii. libc++.tbd ix. libresolv.tbd x. SystemConfiguration.framework xi. VideoToolbox.framework 注意：如需支持 iOS 9.0 或更低版本的设备，请在 Xcode 中将对 CoreML.framework 的依赖设为 Optional。 
d) 打开 Xcode，进入 TARGETS > Project Name > General > Frameworks, Libraries, and Embedded Content 菜单。 e) 点击 + > Add Other… > Add Files 添加对应动态库，并确保添加的动态库 Embed 属性设置为 Embed & Sign。添加完成后，项目会自动链接所需系统库。 
注意： · 根据 Apple 官方要求，app 的 Extension 中不允许包含动态库。如果项目中的 Extension 需要集成 SDK，则添加动态库时需将文件状态改为 Do Not Embed。 · Agora SDK 默认使用 libc++ (LLVM)，如需使用 libstdc++ (GNU)，请联系 sales@agora.io。SDK 提供的库是 FAT Image，包含 32/64 位模拟器、32/64 位真机版本。 
##### 3. 权限设置 
 
  Xcode进入 TARGETS > Project Name > General > Signing 菜单，选择 Automatically manage signing，并在弹出菜单中点击 Enable Automatic。 image856×258 51.4 KB  
  添加媒体设备权限 根据场景需要，在 info.plist 文件中，点击 + 图标开始添加如下内容，获取相应的设备权限： image868×198 46.9 KB  
 
 872×846 143 KB 
##### 4. 导入Agora相关的类 
在项目中导入 AgoraRtcEngineKit 类： 
 
 ```java 
  // Objective-C
// 导入 AgoraRtcKit 类
// 自 3.0.0 版本起，AgoraRtcEngineKit 类名更换为 AgoraRtcKit
// 如果获取的是 3.0.0 以下版本的 SDK，请改用 #import <AgoraRtcEngineKit/AgoraRtcEngineKit.h>
#import <AgoraRtcKit/AgoraRtcEngineKit.h>
// 声明 AgoraRtcEngineDelegate，用于监听回调
@interface ViewController : UIViewController <AgoraRtcEngineDelegate>
// 定义 agoraKit 变量
@property (strong, nonatomic) AgoraRtcEngineKit *agoraKit;

// Swift
// 导入 AgoraRtcKit 类
// 自 3.0.0 版本起，AgoraRtcEngineKit 类名更换为 AgoraRtcKit
// 如果获取的是 3.0.0 以下版本的 SDK，请改用 import AgoraRtcEngineKit
import AgoraRtcKit
class ViewController: UIViewController {
    ...
    // 定义 agoraKit 变量
    var agoraKit: AgoraRtcEngineKit?
}

  ``` 
  
##### 5. 设置Agora账号信息 
在KeyCenter.swift文件中，将你的AppID填写到对应位置，可替换“Your App ID”; 
 
 ```java 
  //  Objective-C
//  AppID.m
//  Agora iOS Tutorial 
NSString *const appID = <#Your App ID#>;

//  Swift
// AppID.swift
//  Agora iOS Tutorial
Static let AppID: String = Your App ID

  ``` 
  
#### 五、 客户端实现 
本节介绍如何使用Agora视频SDK在你的App里实现视频直播的几个小贴士： 
##### 1. 创建用户界面 
根据场景需要，为你的项目创建视频直播的用户界面。我们推荐你在项目中添加元素：本地视频窗口、远端视频窗口。 
你可以参考以下代码创建一个基础的用户界面。 
 
 ```java 
  // Objective-C
// 导入 UIKit
#import <UIKit/UIKit.h>
@interface ViewController ()
// 定义 localView 变量
@property (nonatomic, strong) UIView *localView;
// 定义 remoteView 变量
@property (nonatomic, strong) UIView *remoteView;
@end
@implementation ViewController
...
- (void)viewDidLoad {
    [super viewDidLoad];
    // 调用初始化视频窗口函数
    [self initViews];
    // 后续步骤调用 Agora API 使用的函数
    [self initializeAgoraEngine];
    [self setChannelProfile];
    [self setClientRole];
    [self setupLocalVideo];
    [self joinChannel];
}
// 设置视频窗口布局
- (void)viewDidLayoutSubviews {
    [super viewDidLayoutSubviews];
    self.remoteView.frame = self.view.bounds;
    self.localView.frame = CGRectMake(self.view.bounds.size.width - 90, 0, 90, 160);
}
- (void)initViews {
    // 初始化远端视频窗口。只有当远端用户为主播时，才会显示视频画面
    self.remoteView = [[UIView alloc] init];
    [self.view addSubview:self.remoteView];
    // 初始化本地视频窗口。只有当本地用户为主播时，才会显示视频画面
    self.localView = [[UIView alloc] init];
    [self.view addSubview:self.localView];
}

// Swift
// 导入 UIKit
import UIKit
class ViewController: UIViewController {
    ...
    // 定义 localView 变量
    var localView: UIView!
    // 定义 remoteView 变量
    var remoteView: UIView!
     override func viewDidLoad() {
        super.viewDidLoad()
        // 调用初始化视频窗口函数
        initView()
       // 后续步骤调用 Agora API 使用的函数
        initializeAgoraEngine()
        setChannelProfile()
        setClientRole()
        setupLocalVideo()
        joinChannel()  
    }
    // 设置视频窗口布局
    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        remoteView.frame = self.view.bounds
        localView.frame = CGRect(x: self.view.bounds.width - 90, y: 0, width: 90, height: 160)
    }
    func initView() {
        // 初始化远端视频窗口。只有当远端用户为主播时，才会显示视频画面
        remoteView = UIView()
        self.view.addSubview(remoteView)
        // 初始化本地视频窗口。只有当本地用户为主播时，才会显示视频画面
        localView = UIView()
        self.view.addSubview(localView)
    }
}

  ``` 
  
##### 2. 实现视频直播逻辑 
现在，我们已经将 Agora iOS SDK 集成到项目中了。接下来我们要在 ViewController 中调用 Agora iOS SDK 提供的核心 API 实现基础的视频直播功能。你可以在Agora 在 GitHub 上提供开源的互动直播示例项目 OpenLive-iOS-Objective-C 与 OpenLive-iOS-Swift。在实现相关功能前，你可以下载并查看源代码。 
###### API 调用时序见下图： 
 image678×1184 83 KB 
###### 按照以下步骤实现该逻辑： 
a) 初始化AgoraRtcEngineKit对象 在调用其他 Agora API 前，需要创建并初始化 AgoraRtcEngineKit 对象。调用 sharedEngineWithAppId 方法，传入获取到的 App ID，即可初始化 AgoraRtcEngineKit 。 
 
 ```java 
  // Objective-C
// 输入 App ID 并初始化 AgoraRtcEngineKit 类。
- (void) viewDidLoad{
self.rtcEngine = [AgoraRtcEngineKit sharedEngineWithAppId:[KeyCenter AppId] delegate:self];
}

// Swift
// 输入 App ID 并初始化 AgoraRtcEngineKit 类。
private lazy var agoraKit: AgoraRtcEngineKit = {
        let engine = AgoraRtcEngineKit.sharedEngine(withAppId: KeyCenter.AppId, delegate: nil)
        return engine
    }()

  ``` 
  
你还可以根据场景需要，在初始化时注册想要监听的回调事件，如本地用户加入频道，及解码远端用户视频首帧等。 
b) 设置频道场景 调用 setChannelProfile 方法，将频道场景设为直播。一个 AgoraRtcEngineKit 只能使用一种频道场景。如果想切换为其他频道场景，需要先调用 destroy 方法销毁当前的 AgoraRtcEngineKit 对象，然后使用 sharedEngineWithAppId 方法创建一个新的对象，再调用setChannelProfile 设置新的频道场景。 
 
 ```java 
  // Objective-C
// 设置频道场景为直播模式
[self.rtcEngine setChannelProfile:AgoraChannelProfileLiveBroadcasting];

// Swift
// 设置频道场景为直播模式
agoraKit.setChannelProfile(.liveBroadcasting)

  ``` 
  
c) 设置用户角色 直播频道有两种用户角色：主播和观众，其中默认的角色为观众。设置频道场景为直播后，你可以在 app 中参考如下步骤设置用户角色： 
 
 让用户选择自己的角色是主播还是观众； 
 调用 setClientRole 方法，然后使用用户选择的角色进行传参。 
 
注意，直播频道内的用户，只能看到主播的画面、听到主播的声音。加入频道后，如果你想切换用户角色，也可以调用 setClientRole 方法。 
 
 ```java 
  // Objective-C
// 设置用户角色
- (IBAction)doBroadcastPressed:(UIButton *)sender {
if (self.isBroadcaster) {
		// 设置用户角色为主播
        self.clientRole = AgoraClientRoleAudience;
        if (self.fullSession.uid == 0) {
            self.fullSession = nil;
        }
} else {
		// 设置用户角色为观众
        self.clientRole = AgoraClientRoleBroadcaster;
    }
    
    [self.rtcEngine setClientRole:self.clientRole];
    [self updateInterfaceWithAnimation:YES];
}

// Swift
// 选择用户角色
@IBAction func doBroadcasterTap(_ sender: UITapGestureRecognizer) {
// 选择用户角色为主播
        selectedRoleToLive(role: .broadcaster)
    }
    
@IBAction func doAudienceTap(_ sender: UITapGestureRecognizer) 
// 选择用户角色为观众
selectedRoleToLive(role: .audience)

// 设置用户角色
agoraKit.setClientRole(settings.role)
// 设置为主播角色时
if settings.role == .broadcaster {
            addLocalSession()
            agoraKit.startPreview()
        }

//设置为观众角色时
let isHidden = settings.role == .audience

  ``` 
  
d) 设置本地视图 成功初始化 AgoraRtcEngineKit 对象后，需要在加入频道前设置本地视图，以便在通话中看到本地图像。参考以下步骤设置本地视图： · 调用 enableVideo 方法启用视频模块。 · 调用 setupLocalVideo 方法设置本地视图。 
 
 ```java 
  // Objective-C
// 启用视频模块。
[self.rtcEngine enableVideo];
// 设置本地视图。
- (void)addLocalSession {
    VideoSession *localSession = [VideoSession localSession];
[self.videoSessions addObject:localSession];
// 设置本地视图。
    [self.rtcEngine setupLocalVideo:localSession.canvas];
    [self updateInterfaceWithAnimation:YES];
}

// VideoSession部分
//  VideoSession.m
#import "VideoSession.h"
@implementation VideoSession
- (instancetype)initWithUid:(NSUInteger)uid {
    if (self = [super init]) {
        self.uid = uid;
        
        self.hostingView = [[UIView alloc] init];
        self.hostingView.translatesAutoresizingMaskIntoConstraints = NO;
        
        self.canvas = [[AgoraRtcVideoCanvas alloc] init];
        self.canvas.uid = uid;
        self.canvas.view = self.hostingView;
        self.canvas.renderMode = AgoraVideoRenderModeHidden;
    }
    return self;
}

+ (instancetype)localSession {
    return [[VideoSession alloc] initWithUid:0];
}
@end


// Swift
// 启用视频模块。
agoraKit.enableVideo()
// 设置本地视图。
agoraKit.setupLocalVideo(videoCanvas)


// VideoSession部分
// VideoSession.swift
hostingView = VideoView(frame: CGRect(x: 0, y: 0, width: 100, height: 100))
hostingView.translatesAutoresizingMaskIntoConstraints = false
canvas = AgoraRtcVideoCanvas()
canvas.uid = uid
canvas.view = hostingView.videoView
canvas.renderMode = .hidden

  ``` 
  
e) 加入频道 频道是人们在同一个视频直播中的公共空间。完成初始化和设置本地视图后（视频直播场景），你就可以调用 joinChannelByToken 方法加入频道。你需要在该方法中传入如下参数： 
 
 channelId: 传入能标识频道的频道 ID。输入频道 ID 相同的用户会进入同一个频道。 
 token: 传入能标识用户角色和权限的 Token。你可以设置如下值： a) nil 。 b) 控制台中生成的临时 Token。一个临时 Token 的有效期为 24 小时，详情见获取临时 Token。 c) 你的服务器端生成的正式 Token。适用于对安全要求较高的生产环境，详情见生成 Token。若项目已启用 App 证书，请使用 Token。 d) uid: 本地用户的 ID。数据类型为整型，且频道内每个用户的 uid 必须是唯一的。若将 uid 设为 0，则 SDK 会自动分配一个 uid ，并在 joinSuccessBlock 回调中报告。 e) joinSuccessBlock：成功加入频道回调。 joinSuccessBlock 优先级高于 didJoinChannel ，2 个同时存在时， didJoinChannel 会被忽略。需要有 didJoinChannel 回调时，请将 joinSuccessBlock 设置为 nil 。 
 
更多的参数设置注意事项请参考 joinChannelByToken 接口中的参数描述。 
 
 ```java 
  // Objective-C
// 加入频道。
self.rtcEngine joinChannelByToken:[KeyCenter Token] channelId:self.roomName info:nil uid:0 joinSuccess:nil 

// Swift
// 加入频道。
agoraKit.joinChannel(byToken: KeyCenter.Token, channelId: channelId, info: nil, uid: 0, joinSuccess: nil)

  ``` 
  
f) 设置远端视图 视频互动直播中，通常你也需要看到其他主播。远端主播成功加入频道后，SDK 会触发 didJoinedOfUid 回调，该回调中会包含这个远端主播的 uid 信息。在该回调中调用 setupRemoteVideo 方法，传入获取到的 uid，设置远端主播的视图。 
 
 ```java 
  // Objective-C
// 监听 didJoinedOfUid 回调
// 远端主播加入频道时，会触发该回调
- (void)rtcEngine:(AgoraRtcEngineKit *)engine didJoinedOfUid:(NSUInteger)uid elapsed:(NSInteger)elapsed {
    AgoraRtcVideoCanvas *videoCanvas = [[AgoraRtcVideoCanvas alloc] init];
    videoCanvas.uid = uid;
    videoCanvas.renderMode = AgoraVideoRenderModeHidden;
    videoCanvas.view = self.remoteView;
    // 设置远端视图
    [self.agoraKit setupRemoteVideo:videoCanvas];
}

// Swift
//需要在额外添加以下代码
extension LiveRoomViewController: AgoraRtcEngineDelegate {
    // 监听 didJoinedOfUid 回调
    // 远端主播加入频道时，会触发该回调
    func rtcEngine(_ engine: AgoraRtcEngineKit, didJoinedOfUid uid: UInt, elapsed: Int) {
        guard videoSessions.count <= maxVideoSession else {
            return
        }
        let userSession = videoSession(of: uid)
		// 设置远端视图
        agoraKit.setupRemoteVideo(userSession.canvas)
    }
  }

  ``` 
  
g) 离开频道 根据场景需要，如结束通话、关闭 App 或 App 切换至后台时，调用 leaveChannel 离开当前通话频道。 
 
 ```java 
  // Objective-C
// 离开频道的步骤
- (void)leaveChannel {
    [self setIdleTimerActive:YES];
[self.rtcEngine setupLocalVideo:nil]; // nil means unbind
// 离开频道。
    [self.rtcEngine leaveChannel:nil];    // leave the channel, callback = nil
    if (self.isBroadcaster) {
        [self.rtcEngine stopPreview];
    }
    
    for (VideoSession *session in self.videoSessions) {
        [session.hostingView removeFromSuperview];
    }
    [self.videoSessions removeAllObjects];
    
    if ([self.delegate respondsToSelector:@selector(liveVCNeedClose:)]) {
        [self.delegate liveVCNeedClose:self];
    }
}

// Swift
// 离开频道的步骤
func leaveChannel() {
        // Step 1, release local AgoraRtcVideoCanvas instance
        agoraKit.setupLocalVideo(nil)
        // Step 2, leave channel and end group chat
        agoraKit.leaveChannel(nil)
        
        // Step 3, if current role is broadcaster,  stop preview after leave channel
        if settings.role == .broadcaster {
            agoraKit.stopPreview()
        }
        setIdleTimerActive(true)
        navigationController?.popViewController(animated: true)
    }

  ``` 
  
h) 销毁AgoraRtcEngineKit对象 最后，离开频道，我们需要调用 destroy 销毁 AgoraRtcEngineKit 对象，释放 Agora SDK 使用的所有资源。 
 
 ```java 
  // Objective-C
// 将以下代码填入你定义的函数中
[AgoraRtcEngineKit destroy];

// Swift
// 将以下代码填入你定义的函数中
AgoraRtcEngineKit.destroy()

  ``` 
  
至此，完成，运行看看效果。拿两部手机安装编译好的App，加入同一个频道名，分别选择主播角色和观众角色，如果2个手机都能看见同一个自己，说明你成功了。 
如果你在开发过程中遇到问题，可以访问论坛提问与声网工程师交流（链接：https://rtcdeveloper.agora.io/） 1 也可以访问后台获取更进一步的技术支持（链接：https://agora-ticket.agora.io/ 2 ）
                                        