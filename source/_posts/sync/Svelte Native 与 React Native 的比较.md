---
title: 推荐系列-Svelte Native 与 React Native 的比较
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 305
date: 2022-05-11 05:27:50
cover_picture: 'https://oscimg.oschina.net/oscnet/up-c80049055052571a4828eaae91e2708be0d.png'
---

&emsp;&emsp;应用开发框架层出不穷，但是选择前最好别太武断，还是详细比较一番，否则掉进去的坑可不容易出来。 本文详细的对比 React Native 和 Svelte Native 两个移动开发框架，帮你做出选择。 Sv...
<!-- more -->

                                                                                                                                                                                         
移动应用开发框架层出不穷，但是选择前最好别太武断，还是详细比较一番，否则掉进去的坑可不容易出来。 
本文详细的对比 React Native 和 Svelte Native 两个移动开发框架，帮你做出选择。 
 
#### Svelte Native 是什么? 
Svelte Native 基于 Svelte 前端框架开发，它允许 Svelte 开发人员很方便的构建原生 Android 和 iOS 应用程序。 它最初由 Rollup 的作者 Rich Harris 于 2021 年 11 月发布。 
 
#### 为什么要用 Svelte Native? 
难道这类框架还不足够多吗，为什么要搞个新的出来？好吧，Svelte 的构建是为了流畅、交互、简单和高效。 Svelte 与你熟悉的框架相反，您将在本文中进一步了解它。 
Svelte Native 结合了 Native Script 和 Svelte 的优点。 
根据 Svelte Native 网站的介绍，它是“由 Svelte 提供支持的移动应用程序框架，使您能够使用已知的 Web 框架构建移动应用程序。” 
 
#### React Native 是什么? 
React Native 相信你已经比较熟悉了，这是一个基于 React 的跨平台��动应用开发框架，可让您构建原生 Android 和 iOS 应用。 它是顶级移动应用程序开发框架之一，由 Facebook 为其内部开发设计和开发。 在 2015 年成为了一个开源项目。 
 
在 React Native 之前，开发人员使用的是使用 HTML、CSS 和 JavaScript 等网络技术构建的混合移动应用程序。 尽管他们可以访问本机 API，但 UI 主要利用了您的移动设备 Web 视图。 
这导致了性能、速度和应用商店打击方面的许多问题。 进入 React Native，它允许 JavaScript 代码使用桥接器与本机代码对话，从而使应用程序更快、性能更高。 您将在本文的下一部分中看到有关此的更多详细信息。 
那么，如果 Svelte 和 React Native 都完成相同的任务，那么它们有何不同呢？ 我会讲到的。 首先，我将解释它们的内部工作。 让我们从 React Native 开始。 
 
#### React Native 的工作原理 
React Native 在应用程序和目标设备（Android/iOS）之间创建了一个原生桥梁，允许 JavaScript 代码与原生代码对话，反之亦然。 它通过创建三个线程来解释不同级别的 JavaScript 代码来做到这一点：一个 UI 线程、一个 Shadow 线程和一个 JavaScript 线程。 
 
##### React Native 的 UI 线程 
UI 线程负责运行您的应用程序，并且是唯一可以访问您的 UI 的线程。 因此，它可以更新您的 UI。 
 
##### Shadow 线程 
Shadow 线程计算您使用 React 创建的 UI 布局，并将它们发送到 UI 线程中的本机代码。 React Native 利用 Yoga 将 JavaScript UI 代码转换为主机平台可以理解的布局系统。 
 
##### JavaScript 线程 
JavaScript 线程处理您的 JavaScript UI 布局并将它们发送到 Shadow 线程进行计算，从而将它们发送到 UI 线程。 
 
然而，React Native 的设计带来了一些挑战。 对于具有多个动画且每秒在 UI 上堆积许多帧的应用程序，性能可能是个问题。 React Native 团队一直在研究 Fabrics 来解决这个问题，因为它可以让你的 React Native 代码直接与你的设备原生代码对话。 
最终，这将消除使用 React Native 桥接器带来的瓶颈。 您可以在 Emil Sjölander 的此演示文稿中了解有关 React Native 桥接以及 React Native 工作原理的更多信息。 
接下来我们来看看 Svelte Native。 
 
#### 使用 Svelte Native 
Svelte Native 使用的是 NativeScript，它允许您使用 JavaScript 开发本机应用程序，并允许 JavaScript 代码直接访问设备本机代码。 它没有包装器，这意味着您可以访问所有受支持的设备 API。 
 
 
#### Svelte Native 对比 React Native 
 
##### React Native 的 JSX 支持 
JSX 是一种 JavaScript 语法，可让您在一个文件内同时编写 HTML 和 JavaScript。 React Native 支持 JSX，因为每个切换到 React Native 的 React 开发人员都已经熟悉 JSX。 
但是，Svelte 不支持 JSX。 Svelte Native 允许您将视图组件编写为直接映射到设备的本机视图组件的 HTML。 
 
##### 双向数据绑定 
双向数据绑定允许不同组件的数据实时更新。 Svelte 允许您在 HTML 和/或组件中使用 bind:value 指令绑定数据。 
<script>
  let name = 'Eze';
</script>
<input bind:value={name}>
<h1>Hello {name}!</h1> 
React Native 没有这个特性。 但是，可以设置值和更改处理程序以实现与 React 的双向数据绑定，如下面的代码所示： 
import React, { useState } from 'react';
function App() {
  const [value, setValue] = useState("");
  const changeEventHandler = (e) => {
    setValue(e.currentTarget.value);
  };
  return (
    <>
    <p>Hello {value}</p>
      <input onChange={changeEventHandler}  value={value} />
    </>
  );
}
export default App; 
 
##### 平台相关代码 
当编写 Svelte Native 代码时，我注意到 Svelte 代码比编写的 JavaScript 还要多。 这是因为 Svelte 认为自己是自己的 Web 框架，而不是 JavaScript 框架，这与 React 不同，尽管大多数语法由更多的普通 HTML 和 JavaScript 组成。 
例如，React 中的循环将如下所示： 
import React from 'react';
function App() {
  const numbers = [1,2,3,4,5,6];
  return (
    <>
    {numbers.map((num)=><p>num</p>)}
    </>
  );
}
export default App; 
它本质上与将在 vanilla JS 中编写的代码相同。 但在 Svelte 中，情况就不同了——你必须学习编写循环的新方法。 该循环使用类似于 mustache 语法的模板标签： 
<script>
  let numbers = [1,2,3,4,5];
</script>

<div>
  {#each numbers as num }
    <p>{num}</p>
  {/each}
</div> 
太简单了！ 但这不是纯 JavaScript，所以只要您不打算在另一个项目中重复使用此代码，那就没什么问题。 
 
##### Svelte Native 和 React Native 受欢迎程度比较 
与 Svelte Native 相比，React Native 拥有跟庞大的社区。在写这篇文章时，React Native 有超过 10万的 Star 数，而 Svelte Native 加上 NativeScript 只有 2 万多。 
如果你在开发过程中遇见问题，使用 React Native 比使用 Svelte Native 更容易找到帮助，因为可能有很多开发人员遇到了相同的问题并分享了他们的解决方案。 
 
##### 学习曲线与开发速度 
与 Svelte Native 相比，React Native 的学习曲线陡峭。 任何了解 JavaScript 的开发人员现在都可以开始使用 Svelte Native，因为语法简单、简短且易于理解。 
React Native 需要 React 的知识，入门较难，因为您需要了解 JSX 是如何工作的以及生命周期钩子是如何工作的。 
开发速度在很大程度上取决于开发人员以及他们对如何使用该工具（React 或 Svelte）的了解程度。 如果你想从使用 React Native 过渡到 Svelte Native 怎么办？ 从 React Native 开发人员过渡到专注于 Svelte Native 的开发人员并不难，但是如果您从 Svelte Native 切换到 React Native，可能需要更多时间来学习。 
 
##### React Native 和 Svelte Native 开发环境安装 
为开发设置 React Native 很大程度上取决于您使用的工具。 如果您使用 React Native CLI，则设置 React Native 更具挑战性，因为您需要设置 Xcode 或 Android SDK 来编译和运行模拟器。 但是，使用 Expo 可以简化设置过程，因为它可以实时编译您的代码。 您还可以在 Expo 测试应用程序中轻松查看更改。 
对于 Svelte Native，您需要设置 Android SDK 来运行 NativeScript，因为目前还没有工具可以让您像 Expo 那样对 React Native 进行测试。 开发人员曾经使用预览版应用进行测试，但它已被弃用且不再维护。 希望将来会有一个。 
 
#### 结论 
这两个移动应用程序开发框架都很棒。但是没有最好，只有最适合。如果您打算开始一个新的移动应用程序项目并且您熟悉 JavaScript 并希望快速构建，请从 Svelte Native 开始。 
但是，如果您是 React 开发人员，您可能更喜欢使用 React Native 构建，因为它最适合 React 堆栈。 最后一点：截至撰写本文时，Svelte Native 仍处于测试阶段，预计随着时间的推移会有一些限制和持续改进。 谢谢阅读！ 
本文翻译自: Svelte Native vs. React Native: A comparison guide - LogRocket Blog
                                        