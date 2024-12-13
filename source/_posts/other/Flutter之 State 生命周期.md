---
title: 推荐系列-Flutter之 State 生命周期
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 1710
cover_picture: 'https://static.oschina.net/uploads/img/201910/15114244_PTei.jpg'
abbrlink: 5d450429
date: 2021-04-15 09:19:21
---

&emsp;&emsp;State 的生命周期，指的是在用户参与的情况下，其关联的 Widget 所经历的，从创建到显示，再到更新最后到停止，直至销毁等各个阶段 不同的阶段涉及到特定的任务处理 State 的生命周期流程如下...
<!-- more -->

                                                                                                                                                                                        State 的生命周期，指的是在用户参与的情况下，其关联的 Widget 所经历的，从创建到显示，再到更新最后到停止，直至销毁等各个阶段 
不同的阶段涉及到特定的任务处理 
State 的生命周期流程如下图所示 
![Test](https://oscimg.oschina.net/oscnet/59cc50b995ed1a2914b8453ba44bcb99304.jpg  'Flutter之 State 生命周期') 
由图可知：State 的生命周期可以分为三个阶段：创建（插入视图树）、更新（在视图树中存在）、销毁（从视图树中移除） 
创建 
State 初始化时会依次执行：构造方法 -> initState -> didChangeDependencies -> build，随后完成页面渲染 
 
 构造方法：State 生命周期的起点，Flutter 会通过调用 StatefulWidget.createState() 来创建一个 State。可以通过构造方法，来接收父 Widget 传递的初始化 UI 配置数据，而这些配置数据，决定了 Widget 最初的呈现状态 
 initState：在 State 对象被插入视图树时调用。在 State �����命周期中只会被调用一次，因此可以在 initState 函数中做一些初始化操作 
 didChangeDependencies：专门用来处理 State 对象依赖关系变化，会在 initState() 调用结束后调用 
 build：构建视图。经过构造方法、initState、didChangeDependencies 后，Framework 认为 State 已经准备就绪，于是便调用 build。在 build 中，需要根据父 Widget 传递过来的初始化配置数据及 State 的当前状态，创建一个 Widget 然后返回 
 
更新 
Widget 的状态更新，主要由 setState、didChangeDependencies 和 didUpdateWidget 触发 
 
 setState：当状态数据发生变化时，可以通过调用 setState 方法告诉 Flutter 使用更新后数据重建 UI 
 didChangeDependencies：State 对象的依赖关系发生变化后，Flutter 会回调该方法，随后触发组件构建。State 对象依赖关系发生变化的典型场景：系统语言 Locale 或应用主题改变时，系统会通知 State 执行 didChangeDependencies 回调方法 
 didUpdateWidget：Widget 的配置发生变化时，或热重载时，系统会回调该方法 
 
一旦这三个方法被调用，Flutter 随后便会销毁旧的 Widget，并调用 build 方法重建 Widget 
销毁 
组件销毁相对创建和更新而言更简单。比如页面销毁时或是组件被移除时，系统会调用 deactivate 和 dispose 这两个方法，来移除或销毁组件 
 
 当组件的可见状态发生变化时，deactivate 方法会被调用，这时 State 会被暂时从视图树中移除。 注意：页面切换时，由于 State 对象在视图树中的位置发生了变化，需要先暂时移除后再重新添加，重新触发组件构建，因此也会调用 deactivate 方法 
 当 State 被永久地从视图树中移除时，Flutter 会调用 dispose 方法，而一旦 dispose 方法被调用，组件就要被销毁了，因此可以在 dispose 方法中进行最终的资源释放、移除监听、清理环境等工作 
 
![Test](https://oscimg.oschina.net/oscnet/59cc50b995ed1a2914b8453ba44bcb99304.jpg  'Flutter之 State 生命周期') 
![Test](https://oscimg.oschina.net/oscnet/59cc50b995ed1a2914b8453ba44bcb99304.jpg  'Flutter之 State 生命周期')
                                        