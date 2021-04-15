---
title: 推荐系列-Android 启动优化（六）- 深入理解布局优化
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 899
cover_picture: 'https://api.ixiaowai.cn/gqapi/gqapi.php'
abbrlink: dab44600
date: 2021-04-15 09:53:06
---

&emsp;&emsp;前言 说到 Android 启动优化，你一般会想到什么呢？ Android 多线程异步加载 Android 首页懒加载 对，这是两种很常见的优化手段，但是如果让你主导这件事情，你会如何开始呢？ 梳理现有的业务...
<!-- more -->

                                                                                                                                                                                         
  
   
  
  
 ### 前言 
 说到 Android 启动优化，你一般会想到什么呢？ 
  
  Android 多线程异步加载 
  Android 首页懒加载 
  
 对，这是两种很常见的优化手段，但是如果让你主导这件事情，你会如何开始呢？ 
  
  梳理现有的业务，哪些是一定要在启动初始化的，哪些是不必要的 
  需要在启动初始化的，哪些是可以在主线程初始化的，哪些是可以在子线程初始化的 
  
 当我们把任务丢到子线程初始化，这时候，我们又会遇到两个问题。 
  
  在首页，我们需要用到这个库，如果直接使用，这个库可能还没有初始化，这时候直接调用该库，会发生异常，你要怎么解决 
  当我们的任务相互依赖时，比如 A 依赖于 B， C 也依赖于 B，要怎么解决这种依赖关系。 
  
 这些你有想过嘛。答案都在这几篇文章里面了，这里我就不展开讲了。有疑问的可以一起探讨探讨。 
 Android 启动优化（一） - 有向无环图 
 Android 启动优化（二） - 拓扑排序的原理以及解题思路 
 Android 启动优化（三）- AnchorTask 开源了 
 Android 启动优化（四）- AnchorTask 是怎么实现的 
 Android 启动优化（五）- AnchorTask 1.0.0 版本正式发布了 
 接下来，我们来说一下布局优化相关的。 
  
 ### 布局优化的现状与发展趋势 
  
 #### 耗时原因 
 众所周知，布局加载一直是耗时的重灾区。特别是启动阶段，作为第一个 View 加载，更是耗时。 
 而布局加载之所以耗时，有两个原因。 
  
  读取 xml 文件，这是一个 IO 操作。 
  解析 xml 对象，反射创建 View 
  
 一些很常见的做法是 
  
  减少布局嵌套层数，减少过度绘制 
  空界面，错误界面等界面进行懒加载那除了这些做法，我们还有哪些手段可以优化呢？ 
  
  
 #### 解决方案 
  
  异步加载 
  采用代码的方式编写布局 
  
  
 ##### 异步加载 
 google 很久之前提供了 AsyncLayoutInflater，异步加载的方案，不过这种方式有蛮多坑的，下文会介绍 
  
 ##### 采用代码的方式编写布局 
 代码编写的方式编写布局，我们可能想到使用 java 声明布局，对于稍微复杂一点的布局，这种方式是不可取的，存在维护性查，修改困难等问题。为了解决这个问题，github 上面诞生了一系列优秀的开源库。 
 litho: https://github.com/facebook/litho 
 X2C: https://github.com/iReaderAndroid/X2C 
  
 这两个开���库在大型的项目基本不会使用，不过他们的价值是值得肯定的，核心思想很有意义。 
 xml 布局加载耗时的问题， google 也想改善这种现状，最近 Compose beta 发布了，他是采用声明式 UI 的方式来编写布局，避免了 xml 带来的耗时。同时，还支持布局实时预览。这个应该是以后的发展趋势。 
 compose-samples: https://github.com/android/compose-samples 
  
 #### 小结 
 上面讲了布局优化的现状与发展趋势，接下来我们一起来看一下，有哪些布局优化手段，可以应用到项目中的。 
  
  渐进式加载 
  异步加载 
  compose 声明式 UI 
  
  
 ### 渐进式加载 
  
 #### 什么是渐进式加载 
 渐进式加载，简单来说，就是一部分一部分加载，当前帧加载完成之后，再去加载下一帧。 
 一种极致的做法是，加载 xml 文件，就想加载一个空白的 xml，布局全部使用 ViewStub 标签进行懒加载。 
 这样设计的好处是可以减缓同一时刻，加载 View 带来的压力，通常的做法是我们先加载核心部分的 View，再逐步去加载其他 View。 
 有人可能会这样问了，这样的设计很鸡肋，有什么用呢？ 
 确实，在高端机上面作用不明显，甚至可能看不出来，但是在中低端机上面，带来的效果还是很明显的。在我们项目当中，复杂的页面首帧耗时约可以减少 30%。 
 优点：适配成本低，在中低端机上面效果明显。 
 缺点：还是需要在主线程读取 xml 文件 
  
 #### 核心伪代码 
  
 ```java 
  1start(){2    loadA(){3        loadB(){4            loadC()5        }6    }7}
  ``` 
  
 上面的这种写法，是可以的，但是这种做法，有一个很明显的缺点，就是会造成回调嵌套层数过多。当然，我们也可以使用 RxJava 来解决这种问题。但是，如果项目中没用 Rxjava，引用进来，会造成包 size 增加。 
 一个简单的做法就是使用队列的思想，将所有的 ViewStubTask 添加到队列当中，当当前的 ViewStubTask 加载完成，才加载下一个，这样可以避免回调嵌套层数过多的问题。 
 改造之后的代码见 
  
 ```java 
  1val decorView = this.window.decorView2ViewStubTaskManager.instance(decorView)3            .addTask(ViewStubTaskContent(decorView))4            .addTask(ViewStubTaskTitle(decorView))5            .addTask(ViewStubTaskBottom(decorView))6            .start()
  ``` 
  
  
 ```java 
   1class ViewStubTaskManager private constructor(val decorView: View) : Runnable { 2 3    private var iViewStubTask: IViewStubTask? = null 4 5    companion object { 6 7        const val TAG = "ViewStubTaskManager" 8 9        @JvmStatic10        fun instance(decorView: View): ViewStubTaskManager {11            return ViewStubTaskManager(decorView)12        }13    }1415    private val queue: MutableList<ViewStubTask> = CopyOnWriteArrayList()16    private val list: MutableList<ViewStubTask> = CopyOnWriteArrayList()171819    fun setCallBack(iViewStubTask: IViewStubTask?): ViewStubTaskManager {20        this.iViewStubTask = iViewStubTask21        return this22    }2324    fun addTask(viewStubTasks: List<ViewStubTask>): ViewStubTaskManager {25        queue.addAll(viewStubTasks)26        list.addAll(viewStubTasks)27        return this28    }2930    fun addTask(viewStubTask: ViewStubTask): ViewStubTaskManager {31        queue.add(viewStubTask)32        list.add(viewStubTask)33        return this34    }353637    fun start() {38        if (isEmpty()) {39            return40        }41        iViewStubTask?.beforeTaskExecute()42        // 指定 decorView 绘制下一帧的时候会回调里面的 runnable43        ViewCompat.postOnAnimation(decorView, this)44    }4546    fun stop() {47        queue.clear()48        list.clear()49        decorView.removeCallbacks(null)50    }5152    private fun isEmpty() = queue.isEmpty() || queue.size == 05354    override fun run() {55        if (!isEmpty()) {56            // 当队列不为空的时候，先加载当前 viewStubTask57            val viewStubTask = queue.removeAt(0)58            viewStubTask.inflate()59            iViewStubTask?.onTaskExecute(viewStubTask)60            // 加载完成之后，再 postOnAnimation 加载下一个61            ViewCompat.postOnAnimation(decorView, this)62        } else {63            iViewStubTask?.afterTaskExecute()64        }6566    }6768    fun notifyOnDetach() {69        list.forEach {70            it.onDetach()71        }72        list.clear()73    }7475    fun notifyOnDataReady() {76        list.forEach {77            it.onDataReady()78        }79    }8081}8283interface IViewStubTask {8485    fun beforeTaskExecute()8687    fun onTaskExecute(viewStubTask: ViewStubTask)8889    fun afterTaskExecute()909192}
  ``` 
  
 源码地址：https://github.com/gdutxiaoxu/AnchorTask，核心代码主要在  
 ```java 
  ViewStubTask
  ``` 
 ， 
 ```java 
  ViewStubTaskManager
  ``` 
 , 有兴趣的可以看看 
  
 ### 异步加载 
 异步加载，简单来说，就是在子线程创建 View。在实际应用中，我们通常会先预加载 View，常用的方案有： 
  
  在合适的时候，启动子线程 inflate layout。然后取的时候，直接去缓存里面查找 View 是否已经创建好了，是的话，直接使用缓存。否则，等待子线程 inlfate 完成。 
  
  
 #### AsyncLayoutInflater 
 官方提供了一个类，可以来进行异步的inflate，但是有两个缺点： 
  
  每次都要现场new一个出来 
  异步加载的view只能通过callback回调才能获得（死穴） 
  
 因此，我们可以仿造官方的 AsyncLayoutInflater 进行改造。核心代码在 AsyncInflateManager。主要介绍两个方法。 
  
 ```java 
  asyncInflate
  ``` 
  方法，在子线程 inflateView，并将加载结果存放到 mInflateMap 里面。 
  
 ```java 
   1    @UiThread 2fun asyncInflate( 3        context: Context, 4        vararg items: AsyncInflateItem? 5    ) { 6        items.forEach { item -> 7            if (item == null || item.layoutResId == 0 || mInflateMap.containsKey(item.inflateKey) || item.isCancelled() || item.isInflating()) { 8                return 9            }10            mInflateMap[item.inflateKey] = item11            onAsyncInflateReady(item)12            inflateWithThreadPool(context, item)13        }1415    }
  ``` 
  
  
 ```java 
  getInflatedView
  ``` 
  方法，用来获得异步inflate出来的view，核心思想如下 
  
  先从缓存结果里面拿 View，拿到了view直接返回 
  没拿到view，但是子线程在inflate中，等待返回 
  如果还没开始inflate，由UI线程进行inflate 
  
  
 ```java 
   1    /** 2     * 用来获得异步inflate出来的view 3     * 4     * @param context 5     * @param layoutResId 需要拿的layoutId 6     * @param parent      container 7     * @param inflateKey  每一个View会对应一个inflateKey，因为可能许多地方用的同一个 layout，但是需要inflate多个，用InflateKey进行区分 8     * @param inflater    外部传进来的inflater，外面如果有inflater，传进来，用来进行可能的SyncInflate， 9     * @return 最后inflate出来的view10     */11    @UiThread12    fun getInflatedView(13        context: Context?,14        layoutResId: Int,15        parent: ViewGroup?,16        inflateKey: String?,17        inflater: LayoutInflater18    ): View {19        if (!TextUtils.isEmpty(inflateKey) && mInflateMap.containsKey(inflateKey)) {20            val item = mInflateMap[inflateKey]21            val latch = mInflateLatchMap[inflateKey]22            if (item != null) {23                val resultView = item.inflatedView24                if (resultView != null) {25                    //拿到了view直接返回26                    removeInflateKey(item)27                    replaceContextForView(resultView, context)28                    Log.i(TAG, "getInflatedView from cache: inflateKey is $inflateKey")29                    return resultView30                }3132                if (item.isInflating() && latch != null) {33                    //没拿到view，但是在inflate中，等待返回34                    try {35                        latch.await()36                    } catch (e: InterruptedException) {37                        Log.e(TAG, e.message, e)38                    }39                    removeInflateKey(item)40                    if (resultView != null) {41                        Log.i(TAG, "getInflatedView from OtherThread: inflateKey is $inflateKey")42                        replaceContextForView(resultView, context)43                        return resultView44                    }45                }4647                //如果还没开始inflate，则设置为false，UI线程进行inflate48                item.setCancelled(true)49            }50        }51        Log.i(TAG, "getInflatedView from UI: inflateKey is $inflateKey")52        //拿异步inflate的View失败，UI线程inflate53        return inflater.inflate(layoutResId, parent, false)54    }
  ``` 
  
  
 #### 简单 Demo 示范 
 第一步：选择在合适的时机调用  
 ```java 
  AsyncUtils#asyncInflate
  ``` 
  方法预加载 View， 
  
 ```java 
   1object AsyncUtils { 2 3    fun asyncInflate(context: Context) { 4        val asyncInflateItem = 5            AsyncInflateItem( 6                LAUNCH_FRAGMENT_MAIN, 7                R.layout.fragment_asny, 8                null, 9                null10            )11        AsyncInflateManager.instance.asyncInflate(context, asyncInflateItem)12    }1314    fun isHomeFragmentOpen() =15        getSP("async_config").getBoolean("home_fragment_switch", true)16}
  ``` 
  
 第二步：在获取 View 的时候，先去缓存里面查找 View 
  
 ```java 
   1    override fun onCreateView( 2        inflater: LayoutInflater, container: ViewGroup?, 3        savedInstanceState: Bundle? 4    ): View? { 5        // Inflate the layout for this fragment 6        val startTime = System.currentTimeMillis() 7        val homeFragmentOpen = AsyncUtils.isHomeFragmentOpen() 8        val inflatedView: View 910        inflatedView = AsyncInflateManager.instance.getInflatedView(11            context,12            R.layout.fragment_asny,13            container,14            LAUNCH_FRAGMENT_MAIN,15            inflater16        )1718        Log.i(19            TAG,20            "onCreateView: homeFragmentOpen is $homeFragmentOpen, timeInstance is ${System.currentTimeMillis() - startTime}, ${inflatedView.context}"21        )22        return inflatedView23//        return inflater.inflate(R.layout.fragment_asny, container, false)24    }
  ``` 
  
  
 #### 优缺点 
 优点： 
 可以大大减少 View 创建的时间，使用这种方案之后，获取 View 的时候基本在 10ms 之内的。 
 缺点 
  
  由于 View 是提前创建的，并且会存在在一个 map，需要根据自己的业务场景将 View 从 map 中移除，不然会发生内存泄露 
  View 如果缓存起来，记得在合适的时候重置 view 的状态，不然有时候会发生奇奇怪怪的现象。 
  
  
 ### 总结 
 参考文章：https://juejin.cn/post/6844903924965572615 
  
  View 的渐进式加载，在 JectPack compose 没有推广之后，推荐使用这种方案，适配成本低 
  View 的异步加载方案，虽然效果显著，但是适配成本也高，没搞好，容易发生内存泄露 
  JectPack compose 声明式 UI，基本是未来的趋势，有兴趣的可以提前了解一下他。 
  
 这篇文章,加上一些 Demo，足足花了我几个晚上的时间，觉得不错的话可以关注一下我的微信公众号程序员徐公，小弟在此感谢各位大佬们。主要分享 
  
  Android 开发相关的知识，包括 java，kotlin， Android 技术 
  面试相关的东西，包括常见的面试题目，面试经验分享 
  算法相关的知识，比如怎么学习算法，leetcode 常见算法总结 
  一些时事点评，主要是关于互联网的，比如小米高管屌丝事件，拼多多女员工猝死事件等 
  
 源码地址：https://github.com/gdutxiaoxu/AnchorTask 
  
   
  
  
 Android 启动优化（一） - 有向无环图 
 Android 启动优化（五）-  AnchorTask 1.0.0 版本正式发布了 
 什么？Android webView 的字体突然变小了 
 徐公啐啐念 - 蹭热点也要有底线 
 
本文分享自微信公众号 - 徐公码字（stormjun94）。如有侵权，请联系 support@oschina.cn 删除。本文参与“OSC源创计划”，欢迎正在阅读的你也加入，一起分享。
                                        