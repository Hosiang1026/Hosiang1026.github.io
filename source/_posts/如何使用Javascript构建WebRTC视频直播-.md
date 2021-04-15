---
title: 推荐系列-如何使用Javascript构建WebRTC视频直播-
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 1924
cover_picture: 'https://oscimg.oschina.net/oscnet/up-49c7774a6b3007c3eed1a44b183fdd2f1d1.png'
abbrlink: 57e3b6cc
date: 2021-04-15 09:46:45
---

&emsp;&emsp;WebRTC是一个免费的��源项目，它通过简单的API为浏览器和移动应用程序提供实时通信功能。本文将向你展示WebRTC的基本概念和功能，并指导你使用Node.js构建自己的WebRTC视频直播。 先决条件：...
<!-- more -->

                                                                                                                                                                                        WebRTC是一个免费的开源项目，它通过简单的API为浏览器和移动应用程序提供实时通信功能。本文将向你展示WebRTC的基本概念和功能，并指导你使用Node.js构建自己的WebRTC视频直播。 
 
##### 先决条件： 
 
 具有Java经验 
 掌握Socket.io基本知识 
 
 
##### WebRTC基础 
WebRTC支持在网络世界中进行实时通信，主要用于在网络上传输视频和音频数据。 在开始编写代码之前，我们首先来看一下WebRTC的最重要概念。 
 
 信令： 
 
WebRTC用于浏览器中的通信流，但还需要一种机制来协调通信并发送控制消息，该过程称为信令。 
���令用于以下任务： 
 
 初始化和关闭通讯 
 与外界共享网络配置（IP地址，端口） 
 报告连接错误 
 
信令方法不是WebRTC指定的，开发人员可以自行选择（本教程将使用Socket.io）。 
 
##### STUN和TURN服务器： 
如果主要的WebRTC对等连接遇到问题，则将STUN和TURN服务器用作备用方法。 STUN服务器用于获取计算机的IP地址，而TURN服务器用作对等连接失败的中继。 
既然我们已经了解了WebRTC的基本概念，就可以继续开发上面讨论的项目。 
 
##### 使用Socket.io发出信号 
在使用WebRTC通过对等连接发送视频广播之前，我们首先需要使用信令方法（在本例中为Socket.IO）实例化该连接。 
为此，我们创建项目并使用npm安装所需的依赖项： 
mkdir WebSocketsVideoBroadcast && cd WebSocketsVideoBroadcast
npm install express socket.io --save 
之后，我们创建以下文件夹结构： 
 
 ![Test](https://oscimg.oschina.net/oscnet/up-49c7774a6b3007c3eed1a44b183fdd2f1d1.png  '如何使用Javascript构建WebRTC视频直播-') 
 
我们从一个简单的Socket.io服务器框架开始： 
const express = require("express");
const app = express();

const port = 4000;

const http = require("http");
const server = http.createServer(app);

const io = require("socket.io")(server);
app.use(express.static(__dirname + "/public"));

io.sockets.on("error", e => console.log(e));
server.listen(port, () => console.log(`Server is running on port ${port}`)); 
然后，我们需要实现客户端和直播者与服务器的连接。 直播者的Socket ID保存到一个变量中，以便我们以后知道客户端需要连接到的位置。 
let broadcaster

io.sockets.on("connection", socket => {
  socket.on("broadcaster", () => {
    broadcaster = socket.id;
    socket.broadcast.emit("broadcaster");
  });
  socket.on("watcher", () => {
    socket.to(broadcaster).emit("watcher", socket.id);
  });
  socket.on("disconnect", () => {
    socket.to(broadcaster).emit("disconnectPeer", socket.id);
  });
}); 
之后，我们将实现socket.io事件以初始化WebRTC连接。 双方将使用这些事件来实例化对等连接。 
socket.on("offer", (id, message) => {
    socket.to(id).emit("offer", socket.id, message);
});
socket.on("answer", (id, message) => {
  socket.to(id).emit("answer", socket.id, message);
});
socket.on("candidate", (id, message) => {
  socket.to(id).emit("candidate", socket.id, message);
}); 
这就是我们Socket.io的服务器实现的全部内容，现在我们可以继续进行布局以及双方通信的实现。 
 
##### Layouts 
我们的布局由两个基本HTML文件组成，其中包含一个视频视图（稍后将显示我们正在发送的视频流）和一个CSS文件（用于某些基本样式）。 
index.html文件包含一个视频视图，该视图将显示来自广播公司的视频流。 它还会导入socket.io依赖项和我们的watch.js文件。 
<!DOCTYPE html>
<html>
<head>
	<title>Viewer</title>
	<meta charset="UTF-8" />
	<link href="/styles.css" rel="stylesheet">
</head>
<body>
<video playsinline autoplay></video>
<script src="/socket.io/socket.io.js"></script>
<script src="/watch.js"></script>
</body>
</html> 
broadcast.html文件与主布局非常相似，但会导入broadcast.js文件而不是watch.js。 
<!DOCTYPE html>
<html>
<head>
  <title>Broadcaster</title>
  <meta charset="UTF-8" />
  <link href="/styles.css" rel="stylesheet">
</head>
<body>
<video playsinline autoplay muted></video>
<script src="/socket.io/socket.io.js"></script>
<script src="/broadcast.js"></script>
</body>
</html> 
我还为视频视图提供了一些简单的CSS样式。 
html {
  overflow: hidden;
  height: 100%;
}

video {
  width: 100%;
  height: 100%;
  position: absolute;
  display: block;
  top: 0;
  left: 0;
  object-fit: cover;
}

body {
  background-color: black;
  margin: 0;
  height: 100%;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
} 
RTCPeerConnection 
RTCPeerConnections帮助我们将位于本地网络中的两台计算机相互连接。 在谈论这些类型的连接时，会涉及到很多术语： 
 
 ICE-互联网连接建立 
 STUN-通过网络地址转换器[NAT]进行的用户数据报协议[UDP]的会话遍历 
 
由于当今大多数设备都在NAT路由器后面，因此无法直接连接。 这就是为什么必须由STUN服务器初始化对等连接的原因，STUN服务器将返回我们可以连接的ICE候选对象。 
![Test](https://oscimg.oschina.net/oscnet/up-49c7774a6b3007c3eed1a44b183fdd2f1d1.png  '如何使用Javascript构建WebRTC视频直播-') 
在本指南中，我们有两个不同的连接部分。 一个是视频直播方，可以与客户端建立多个对等连接，并使用流发送视频。 第二个是客户端，它与当前视频直播方只有一个连接。 
 
##### 直播方 
首先，我们为对等连接和摄像机创建配置对象。 
const peerConnections = {};
const config = {
  iceServers: [
    {
      urls: ["stun:stun.l.google.com:19302"]
    }
  ]
};

const socket = io.connect(window.location.origin);
const video = document.querySelector("video");

// Media contrains
const constraints = {
  video: { facingMode: "user" }
  // Uncomment to enable audio
  // audio: true,
}; 
���们��用正式的google STUN服务器进行点对点连接，并使用媒体限制条件配置摄像机。 你也可以通过取消注释音频线路来启用音频。 
在创建对等连接之前，我们首先需要从摄像机获取视频，以便将其添加到我们的连接中。 
navigator.mediaDevices
  .getUserMedia(constraints)
  .then(stream => {
    video.srcObject = stream;
    socket.emit("broadcaster");
  })
  .catch(error => console.error(error)); 
接下来，我们将使用以下代码创建一个RTCPeerConnection： 
socket.on("watcher", id => {
  const peerConnection = new RTCPeerConnection(config);
  peerConnections[id] = peerConnection;

  let stream = video.srcObject;
  stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
    
  peerConnection.onicecandidate = event => {
    if (event.candidate) {
      socket.emit("candidate", id, event.candidate);
    }
  };

  peerConnection
    .createOffer()
    .then(sdp => peerConnection.setLocalDescription(sdp))
    .then(() => {
      socket.emit("offer", id, peerConnection.localDescription);
    });
});

socket.on("answer", (id, description) => {
  peerConnections[id].setRemoteDescription(description);
});

socket.on("candidate", (id, candidate) => {
  peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate));
}); 
每次有新客户端加入时，我们都会创建一个新的RTCPeerConnection并将其保存在我们的peerConnections对象中。 
然后，我们使用addTrack（）方法将本地流添加到连接中，并传递流和跟踪数据。 
当我们收到一个ICE候选者时，将调用peerConnection.onicecandidate事件，并将其发送到我们的服务器。 
之后，我们通过调用peerConnection.createOffer（）将连接提议发送给客户端，然后调用peerConnection.setLocalDescription（）来配置连接。 
当客户端断开连接时，关闭连接是应用程序的另一个重要部分，我们可以使用以下代码来实现： 
socket.on("disconnectPeer", id => {
  peerConnections[id].close();
  delete peerConnections[id];
}); 
最后，如果用户关闭窗口，我们将关闭socket连接。 
window.onunload = window.onbeforeunload = () => {
  socket.close();
}; 
  
 
##### 客户端 
客户端（观看视频的一方））具有几乎相同的功能。 唯一的区别是，他仅打开了与当前视频直播方的一个对等连接，并且他获取了视频，而不是流式传输视频。 
我们还需要为RTCPeerConnection创建一个配置。 
let peerConnection;
const config = {
  iceServers: [
    {
      urls: ["stun:stun.l.google.com:19302"]
    }
  ]
};

const socket = io.connect(window.location.origin);
const video = document.querySelector("video"); 
然后，我们可以创建我们的RTCPeerConnection并从视频直播方获取视频流。 
socket.on("offer", (id, description) => {
  peerConnection = new RTCPeerConnection(config);
  peerConnection
    .setRemoteDescription(description)
    .then(() => peerConnection.createAnswer())
    .then(sdp => peerConnection.setLocalDescription(sdp))
    .then(() => {
      socket.emit("answer", id, peerConnection.localDescription);
    });
  peerConnection.ontrack = event => {
    video.srcObject = event.streams[0];
  };
  peerConnection.onicecandidate = event => {
    if (event.candidate) {
      socket.emit("candidate", id, event.candidate);
    }
  };
}); 
在这里，我们像上面一样使用配置对象创建了一个新的RTCPeerConnection。 唯一的区别是，我们调用createAnswer（）函数将连接应答发送回视频直播方的请求。 
建立连接后，我们可以继续使用peerConnection对象的ontrack事件侦听器获取视频流。 
我们还需要为点对点连接实现其他生命周期功能，这将有助于我们打开和关闭新连接。 
socket.on("candidate", (id, candidate) => {
  peerConnection
    .addIceCandidate(new RTCIceCandidate(candidate))
    .catch(e => console.error(e));
});

socket.on("connect", () => {
  socket.emit("watcher");
});

socket.on("broadcaster", () => {
  socket.emit("watcher");
});

window.onunload = window.onbeforeunload = () => {
  socket.close();
  peerConnection.close();
}; 
至此，该应用程序已完成，可以继续在浏览器中对其进行测试。 
 
##### 测试应用程序 
现在我们已经完成了该应用程序，是时候对其进行测试，看看它是否可以工作了。 
我们可以使用以下命令启动该应用程序： 
node server.js 
该应用程序现在应该在你的localhost：4000上运行，并且可以通过连接到localhost：4000 / broadcast来添加新的视频直播品程序进行测试。 
之后，只需要访问localhost：4000即可作为客户端连接到服务器，并且你应该获得从视频直播方的流式传输的视频。 
 
##### 结论 
我希望本文能帮助您了解WebRTC的基础知识以及如何使用它来流式传输视频直播。 
EasyRTC视频会议云服务 
基于WebRTC技术而开发的EasyRTC，是TSINGSEE青犀视频团队在音视频领域多年的技术积累而研发的， 它是覆盖全球的实时音频开发平台，支持一对一、一对多等视频通话。 
 
 ![Test](https://oscimg.oschina.net/oscnet/up-49c7774a6b3007c3eed1a44b183fdd2f1d1.png  '如何使用Javascript构建WebRTC视频直播-') 
   
 
EasyRTC拥有MCU和SFU两种架构，无需安装客户端与插件，纯H5在线视频会议系统，支持微信小程序、H5页面、APP、PC客户端等接入方式，极大满足语音视频社交、在线教育和培训、视频会议和远程医疗等场景需求。 
随着移动互联网的高速发展，AI、5G等等新兴技术的到来，结合WebRTC技术，也将衍生出更多的应用场景，改变人类的衣、食、住、行等生活方式。
                                        