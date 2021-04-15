---
title: 推荐系列-实战 - 认识 RecyclerView
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 845
cover_picture: 'https://devrel.andfun.cn/devrel/posts/2021/04/cfd26a1f5e254.png'
abbrlink: a37a06d8
date: 2021-04-15 10:08:52
---

&emsp;&emsp;RecyclerView 是一款非常强大的 widget，它可以帮助您灵活地显示列表数据。当我开始学习 RecyclerView 的时候，我发现对于复杂的列表界面有很多资源可以参考，但是对于简单的列表展现就鲜有可...
<!-- more -->

                                                                                                                                                                                        RecyclerView 是一款非常强大的 widget，它可以帮助您灵活地显示列表数据。当我开始学习 RecyclerView 的时候，我发现对于复杂的列表界面有很多资源可以参考，但是对于简单的列表展现就鲜有可参考的资源了。虽然 RecyclerView 的组成结构乍一看有些复杂，但是深入理解以后您会发现它其实非常简单明了。 
本文会通过创建一个简单的 RecyclerView 实现一个列表来显示不同种类的花的名字。在实现的过程中，我也会将 RecyclerView 的每个部分揉碎了展现给大家，这样大家就可以在自己的应用中实现了。 
#### RecyclerView 是 "何方神圣"？为什么选择它呢？ 
RecyclerView 是一个容器，它用于显示列表形式 (list) 或者网格形式 (grid) 的数据，比如文本或者照片。 
当列表滑动的时候，实际上只有少量邻近的视图会显示在屏幕上。当视图滑出屏幕时，RecyclerView 会复用它并且填充新的数据。由于它是通过回收已有的结构而不是持续创建新的列表项，所以它可以有效提高应用的时间效率和空间效率。 
![Test](https://devrel.andfun.cn/devrel/posts/2021/04/cfd26a1f5e254.png  '实战 - 认识 RecyclerView') 
 
为什么您需要使用 RecyclerView 呢？ 
 
 RecyclerView 使用 ViewHolder 模式，这样做可以提高性能，因为它无需频繁调用 findViewById() 方法即可访问表项的视图； 
 RecyclerView 使用 LayoutManager，它支持纵向滑动的列表和横向滑动的列表，以及交错布局的列���和��格布局的列表。您还可以创建自定义的 LayoutManager； 
 RecyclerView 提供默认的表项动画以及自定义动画的入口。 
 
总之，RecyclerView 兼顾了灵活性和个性化，所以它是功能强大的工具。 
#### 实现 RecyclerView 
本文会为大家展示如何实现一个简单的  
 ```java 
  RecyclerView
  ``` 
 ，用它来显示不同种类花的名称。下面的代码会使用 Kotlin 语言，但是  
 ```java 
  RecyclerView
  ``` 
  也可以在 Java 语言中使用。 
![Test](https://devrel.andfun.cn/devrel/posts/2021/04/cfd26a1f5e254.png  '实战 - 认识 RecyclerView') 
首先在 Android Studio 里创建一个工程，并且使用 Empty Activity 模板。设置项目名称，并且选择 Kotlin 作为项目所用的语言。 
![Test](https://devrel.andfun.cn/devrel/posts/2021/04/cfd26a1f5e254.png  '实战 - 认识 RecyclerView') 
接下来在 app 级的  
 ```java 
  build.gradle
  ``` 
  文件里引入 最新版本 的  
 ```java 
  RecyclerView
  ``` 
  依赖。 
 
 ```java 
   2019 Google LLC. 
   SPDX-License-Identifier: Apache-2.0 -->

// 在 https://developer.android.google.cn/jetpack/androidx/releases/recyclerview 获得最新版本号
def recyclerview_version = "1.1.0"

implementation 'androidx.recyclerview:recyclerview:$recyclerview_version

  ``` 
  
#### RecyclerView 数据 
 
 ```java 
  RecyclerView
  ``` 
  最重要的组成部分之一就是需要显示的数据。对于比较复杂的应用来说，数据可能是来自数据库或者来自于网络，不过这里我们简单使用字符串资源文件作为应用的数据源。 
在  
 ```java 
  strings.xml
  ``` 
  文件中，创建一个字符串数组来存放花的名称。 
 
 ```java 
   <!-- Copyright 2019 Google LLC. 
   SPDX-License-Identifier: Apache-2.0 -->

<resources>
    <string name="app_name">RecyclerSample</string>
    <string-array name="flower_array">
        <item>Lily</item>
        <item>Poppy</item>
        <item>Sunflower</item>
        <item>Freesia</item>
        <item>Daisy</item>
        <item>Rose</item>
        <item>Daffodil</item>
        <item>Lavender</item>
        <item>Peony</item>
        <item>Lilac</item>
        <item>Dahlia</item>
        <item>Tulip</item>
        <item>Dandelion</item>
        <item>Geranium</item>
        <item>Gardenia</item>
        <item>Rhododendron</item>
        <item>Azalea</item>
    </string-array>

</resources>

  ``` 
  
然后，创建一个类，名字为  
 ```java 
  Datasource
  ``` 
 ，并且可以接收一个 Context 类型的参数。创建一个叫做  
 ```java 
  getFlowerList()
  ``` 
  的函数，它负责返回花的名称列表。 
 
 ```java 
  <!-- Copyright 2019 Google LLC. 
   SPDX-License-Identifier: Apache-2.0 -->

class Datasource(val context: Context) {
    fun getFlowerList(): Array<String> {
        return context.resources.getStringArray(R.array.flower_array)
    }
}

  ``` 
  
在  
 ```java 
  MainActivity.onCreate()
  ``` 
  中，创建一个变量叫做  
 ```java 
  flowerList
  ``` 
 ，然后将  
 ```java 
  getFlowerList()
  ``` 
  的返回结果赋给它。 
 
 ```java 
  <!-- Copyright 2019 Google LLC. 
   SPDX-License-Identifier: Apache-2.0 -->

override fun onCreate(savedInstanceState: Bundle?) {
  super.onCreate(savedInstanceState)
  setContentView(R.layout.activity_main)
  val flowerList = Datasource(this).getFlowerList()
}

  ``` 
  
#### RecyclerView 布局 
接下来，在  
 ```java 
  activity_main
  ``` 
  布局文件中将  
 ```java 
  TextView
  ``` 
  替换为  
 ```java 
  RecyclerView
  ``` 
 ，并且将其  
 ```java 
  layoutManager
  ``` 
  设置为  
 ```java 
  LinearLayoutManager
  ``` 
 。使用  
 ```java 
  LinearLayoutManager
  ``` 
  意味着未来数据将以纵向列表或者横向列表的形式显示 (默认是纵向列表)。 
 
 ```java 
   <!-- Copyright 2019 Google LLC. 
   SPDX-License-Identifier: Apache-2.0 -->

<FrameLayout xmlns:android="http://schemas.android.com/apk/res/android"
   android:layout_width="match_parent"
   android:layout_height="match_parent"
   xmlns:app="http://schemas.android.com/apk/res-auto">

   <androidx.recyclerview.widget.RecyclerView
       android:id="@+id/recycler_view"
       android:layout_width="match_parent"
       android:layout_height="match_parent"
       app:layoutManager="LinearLayoutManager"/>
</FrameLayout>

  ``` 
  
#### 表项布局 
![Test](https://devrel.andfun.cn/devrel/posts/2021/04/cfd26a1f5e254.png  '实战 - 认识 RecyclerView') 
上面的示意图表示一个包含数据表项的  
 ```java 
  RecyclerView
  ``` 
 。在这里，组成  
 ```java 
  RecyclerView
  ``` 
  的表项 (Item) 里会包含花的名称。 
创建一个新的布局文件，将它命名为  
 ```java 
  flower_item
  ``` 
 ，它用来决定每一个表项的显示布局。本例中布局仅需要显示一个鲜花的名称，所以这里只需要  
 ```java 
  TextView
  ``` 
 。 
 
 ```java 
  <!-- Copyright 2019 Google LLC. 
   SPDX-License-Identifier: Apache-2.0 -->

<FrameLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="wrap_content">

    <TextView
        android:id="@+id/flower_text"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:textSize="32sp" />
</FrameLayout>

  ``` 
  
#### 拆分 Adapter 类 
接下来是  
 ```java 
  RecyclerView
  ``` 
  的重头戏了，也就是 ViewHolder 和 Adapter 类。ViewHolder 负责存储 RecyclerView 中每一个单独的表项所需要显示的信息。RecyclerView 仅需要创建当前所显示的表项数量的 ViewHolder 外加缓存中的几个 ViewHolder 即可。随着用户滑动屏幕，ViewHolder会被回收 (使用新数据进行填充)，已有的表项会在一端消失，并且在另一端显示一个新的表项。Adapter 类从数据源获得数据，并且将数据传递给正在更新其所持视图的 ViewHolder。下图显示了 RecyclerView、Adapter、ViewHolder 和数据之间的协作关系。 
![Test](https://devrel.andfun.cn/devrel/posts/2021/04/cfd26a1f5e254.png  '实战 - 认识 RecyclerView') 
创建 Adapter 
创建一个叫做 FlowerAdapter 的类，所需显示的列表数据作为该类的参数。 
 
 ```java 
  <!-- Copyright 2019 Google LLC. 
   SPDX-License-Identifier: Apache-2.0 -->

class FlowerAdapter(val flowerList: Array<String>) {

}

  ``` 
  
创建 ViewHolder 
创建一个叫做 FlowerViewHolder 的内部类，并且它可以接收一个 itemView 作为参数。在 ViewHolder 中，创建一个变量来引用 TextView，然后将它指向表项布局里对应的视图。然后创建 bind() 函数，它用来将花的名字 (字符串) 和携带数据的 UI (flowerTextView) 关联起来。bind() 函数接收传入的字符串，并且将字符串作为 flowerTextView 的文本内容。 
 
 ```java 
  <!-- Copyright 2019 Google LLC. 
   SPDX-License-Identifier: Apache-2.0 -->

class FlowerViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView){
  private val flowerTextView:TextView = itemView.findViewById(R.id.flower_text)
  fun bind(word: String){
    flowerTextView.text = word
  }
}

  ``` 
  
继承 RecyclerView.Adapter 
更新 FlowerAdapter 的类定义，使其继承 RecyclerView.Adapter 类，并且将 FlowerViewHolder作为参数传入。 
 
 ```java 
  <!-- Copyright 2019 Google LLC. 
   SPDX-License-Identifier: Apache-2.0 -->

class FlowerAdapter(val flowerList: Array<String>) :
    RecyclerView.Adapter<FlowerAdapter.FlowerViewHolder>() {

}

  ``` 
  
重写  
 ```java 
  RecyclerView.Adapter
  ``` 
  的类需要重写三个方法  
 ```java 
  onCreateViewHolder()
  ``` 
 、 
 ```java 
  onBindViewHolder()
  ``` 
  和  
 ```java 
  getItemCount()
  ``` 
 。 
重写 onCreateViewHolder() 
当  
 ```java 
  ViewHolder
  ``` 
  创建的时候会调用该方法。在该方法里进行初始化和填充  
 ```java 
  RecyclerView
  ``` 
  中的表项视图。该视图使用前面我们创建的用于显示文本的布局。 
 
 ```java 
  <!-- Copyright 2019 Google LLC. 
   SPDX-License-Identifier: Apache-2.0 -->

override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): FlowerViewHolder {
  val view = LayoutInflater.from(parent.context)
  .inflate(R.layout.flower_item, parent, false)
  return FlowerViewHolder(view)
}

  ``` 
  
重写 onBindViewHolder() 
 
 ```java 
  onBindViewHolder()
  ``` 
  被调用的时候，会传入参数  
 ```java 
  ViewHolder
  ``` 
  和一个位置 (position)，它表示在 flowerList 中所绑定的表项的位置。该位置可以用于提取表项所需的数据，并且将数据传递给 ViewHolder 来使数据绑定到对应的 UI。 
 
 ```java 
  <!-- Copyright 2019 Google LLC. 
   SPDX-License-Identifier: Apache-2.0 -->

override fun onBindViewHolder(holder: FlowerViewHolder, position: Int) {
  holder.bind(flowerList[position])
}

  ``` 
  
重写 getItemCount() 
RecyclerView ���示��个列表，所以它需要知道列表里共有多少项。由于 flowerList 就是数据源，所以直接返回它的长度即可。 
 
 ```java 
  <!-- Copyright 2019 Google LLC. 
   SPDX-License-Identifier: Apache-2.0 -->

override fun getItemCount(): Int {
  return flowerList.size
}

  ``` 
  
完成 Adapter 代码 
 
 ```java 
  <!-- Copyright 2019 Google LLC. 
   SPDX-License-Identifier: Apache-2.0 -->

class FlowerAdapter(val flowerList: Array<String>) :
    RecyclerView.Adapter<FlowerAdapter.FlowerViewHolder>() {

    // 描述表项视图并且将它放在 RecyclerView 中
    class FlowerViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val flowerTextView: TextView = itemView.findViewById(R.id.flower_text)

        fun bind(word: String) {
            flowerTextView.text = word
        }
    }

    // 返回一个新的 ViewHolder
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): FlowerViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.flower_item, parent, false)

        return FlowerViewHolder(view)
    }

    // 返回数据列表的长度
    override fun getItemCount(): Int {
        return flowerList.size
    }

    // 显示一个指定位置的数据
    override fun onBindViewHolder(holder: FlowerViewHolder, position: Int) {
        holder.bind(flowerList[position])
    }
}

  ``` 
  
#### 连接到 MainActivity 
我们已经创建了布局、数据列表和 adapter。现在我们可以将  
 ```java 
  RecyclerView
  ``` 
  添加到  
 ```java 
  MainActivity
  ``` 
 ，并且将  
 ```java 
  Adapter
  ``` 
  赋值给它。 
定义一个变量叫做  
 ```java 
  recyclerView
  ``` 
 ，然后将  
 ```java 
  activity_main
  ``` 
  中的  
 ```java 
  RecyclerView
  ``` 
  赋值给  
 ```java 
  recyclerView
  ``` 
 。将  
 ```java 
  FlowerAdapter
  ``` 
  作为您  
 ```java 
  recyclerView
  ``` 
  的 adapter。 
 
 ```java 
  <!-- Copyright 2019 Google LLC. 
   SPDX-License-Identifier: Apache-2.0 -->

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        val flowerList = Datasource(this).getFlowerList()
        val recyclerView: RecyclerView = findViewById(R.id.recycler_view)
        recyclerView.adapter = FlowerAdapter(flowerList)
    }
}

  ``` 
  
现在我们运行一下，然后看看它操作起来如何: 
![Test](https://devrel.andfun.cn/devrel/posts/2021/04/cfd26a1f5e254.png  '实战 - 认识 RecyclerView') 
#### 下一步 
完整代码请点击 这里。 
上面的例子为大家展示了如何实现 RecyclerView 的几个组成部分来显示简单的文本元素。当然 RecyclerView 可以包含更多有趣和复杂的元素，我们将在未来的文章和示例中为大家展示。 
更多资源，请参阅: 
 
 RecyclerView Sample — Kotlin 
 RecyclerView Sample — Java 
 RecyclerView Documentation 
 Create a List with RecyclerView 

                                        