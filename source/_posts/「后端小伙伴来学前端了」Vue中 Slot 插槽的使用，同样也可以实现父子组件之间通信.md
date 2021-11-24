---
title: 推荐系列-「后端小伙伴来学前端了」Vue中 Slot 插槽的使用，同样也可以实现父子组件之间通信
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 274
cover_picture: 'https://img-blog.csdnimg.cn/img_convert/0cf26b13e214e2eb03e5f41ed853da3a.png'
abbrlink: baca2438
date: 2021-11-23 02:39:46
---

&emsp;&emsp; 插槽可以说是 Vue 中非常重要的一部分吧，在我学习和练习的过程中，当组件搭配着插槽一起使用的时候，会发挥的更好一些。更多时候也会更加方便。 今天介绍Vue中三种插槽吧：默认插槽、具...
<!-- more -->

                                                                                                                                                                                        #### 前言 
插槽可以说是 Vue 中非常重要的一部分吧，在我学习和练习的过程中，当组件搭配着插槽一起使用的时候，会发挥的更好一些。更多时候也会更加方便。 
今天介绍Vue中三种插槽吧：默认插槽、具名插槽、作用域插槽。 
#### 环境准备 
先搭个初始环境给大家看看哈。一步一步讲完这个插槽。 
就是写了一个类别组件，分别渲染这三种数据。 
 
Category组件 
 
 ```java 
  <template>
  <div class="category">
    <h1>{{title}}</h1>
    <ul>
      <li 
      v-for="(item,index) in listData"
      :key="index">{{item}}</li>
    </ul>
  </div>
</template>
<script>
export default {
  props: {
    listData:Array,
    title: String
  }
}
</script>
<style scoped>
.category{
  width: 200px;
  height: 300px;
  background-color:pink;
}
</style>

  ``` 
  
App组件 
 
 ```java 
  <template>
  <div id="app">
    <Category :listData="games" :title="'Games'" />
    <Category :listData="movies" :title="'Movies'" />
    <Category :listData="foods" :title="'Foods'" />
  </div>
</template>
<script>
import Category from './components/Category.vue'
export default {
  name: 'App',
  components: {
    Category
  },
  data () {
    return {
      games:['穿越火线','qq飞车','洛克王国'],
      movies:['你好，李焕英','青春派','匆匆那年'],
      foods:['邵阳米粉','长沙茶颜','重庆火锅']
    }
  }
}
</script>
<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  display: flex;
  justify-content: space-between;
}
</style>

  ``` 
  
 
最开始就是如上图一样的需求，但是现在业务需求更改了，电影变成了只宣传其中一个，其他的不进行宣传，吃的也变成只宣传一个拉。 
如下图： 
 
我们怎么改合适呢？ 
是在 
 ```java 
  Category
  ``` 
 组件中加 
 ```java 
  if
  ``` 
 一个个进行判断吗？还是有更好的方法勒？？？ 
 
一个个判断是不行的，那样子代码会变得十分繁杂，不易阅读，万一以后又要更改业务需求，代码都不好动。 
接下来就到默认插槽的出现拉。 
#### 一、默认插槽 
我们在子组件中不用再用 
 ```java 
  props
  ``` 
  接收数据，也不做渲染，而是定义一个插槽。 
 
 ```java 
  <template>
<div class="category">
    <!-- 定义插槽，插槽默认内容 -->
    <slot>如果当父组件不传值过来，即显示此默认</slot>
    </div>
</template>
<script>
    export default {
        props: {
        }
    }
</script>

  ``` 
  
App组件也作出更改 
 
 ```java 
  <template>
<div id="app">
    <Category>
        <h1>Games</h1>
        <!-- <ul>
<li v-for="(item, index) in games" :key="index">{{ item }}</li>
    </ul> -->
        <img src="https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fi0.hdslb.com%2Fbfs%2Farticle%2Fb352264fa7bfdb6d211f2e71e87cc2c48d85b805.jpg&refer=http%3A%2F%2Fi0.hdslb.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1639931135&t=0b2c6c622c84a1e387196cce8f50455e">
    </Category>
    
    <Category>
        <h1>Movies</h1>
        <img class="movies" src="https://gimg2.baidu.com/image_search/src=http%3A%2F%2Finews.gtimg.com%2Fnewsapp_bt%2F0%2F13236694597%2F641.jpg&refer=http%3A%2F%2Finews.gtimg.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1639931502&t=f89c2197bda9bb129d9404d3c4b30f2f">
        <!-- <ul> -->
        <!-- <li v-for="(item, index) in movies" :key="index">{{ item }}</li> -->
        <!-- </ul> -->
    </Category>
    <Category>
        <h1>Foods</h1>
        <ul>
            <li v-for="(item, index) in foods" :key="index">{{ item }}</li>
    </ul>
    </Category>
    
    <!-- 当我们什么都没有写的时候，看展示什么 -->
    <Category>
    </Category>
    </div>
</template>

<script>
    import Category from './components/Category.vue'

    export default {
        name: 'App',
        components: {
            Category
        },
        data () {
            return {
                games:['穿越火线','qq飞车','洛克王国'],
                movies:['你好，李焕英','青春派','匆匆那年'],
                foods:['邵阳米粉','长沙茶颜','重庆火锅']
            }
        }
    }
</script>

  ``` 
  
显示效果： 
 
解释： 
我们在子组件写了一个 
 ```java 
  <slot>如果当父组件不传值过来，即显示此默认</slot>
  ``` 
  标签，此处就相当于占了一个位置。 
我们在父组件中，也不再像之前一样 
 ```java 
  <Category/>
  ``` 
 写自闭和标签，而是写了非自闭和标签 
 ```java 
  <Category> 内容 </Category>
  ``` 
 。这样做，Vue就会默认的将写在组件标签中的内容渲染完，然后再放回子组件中的  
 ```java 
  <slot></slot>
  ``` 
  占好位置的地方去。 
 
 ```java 
  注意
  ``` 
 :CSS样式写在父组件或者子组件中都是可以的，因为它是渲染完后才放回子组件中的。写在子组件中，就是在放回子组件中时渲染。 
 
写完这里，客户突然觉得你们这么厉害，不满足啦，又开始给你们整幺蛾子。 
 
接下来就又到具名插槽登场啦哈。 
#### 二、具名插槽 
竟然我们能够想到用一个插槽啦，那么为什么不能想着用两个插槽来试一试勒？ 
改造子组件 
 
 ```java 
  <template>
  <div class="category">
    <!-- 必须加上名称 在父组件中才能指定要放入那个插槽 这也是为什么叫做具名插槽的原因--->
    <slot name="slot1">如果当父组件不传值过来，即显示此默认</slot>
    <slot name="slot2"></slot>
  </div>
</template>
<script>
export default {
  props: {
  }
}
</script>

  ``` 
  
父组件 
 
 ```java 
  <template>
	<div id="app">
    	<Category>
       	 <template slot="slot1">
          	  <h1>Games</h1>
            <img src="https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fi0.hdslb.com%2Fbfs%2Farticle%2Fb352264fa7bfdb6d211f2e71e87cc2c48d85b805.jpg&refer=http%3A%2F%2Fi0.hdslb.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1639931135&t=0b2c6c622c84a1e387196cce8f50455e"
                 />
	</template>
	<template slot="slot2">
		<button > qq登录</button>
		<button > 微信登录</button>
	</template>

</Category>
<Category>
    <template slot="slot1">
		<h1>Movies</h1>
			<img
     class="movies"
     src="https://gimg2.baidu.com/image_search/src=http%3A%2F%2Finews.gtimg.com%2Fnewsapp_bt%2F0%2F13236694597%2F641.jpg&refer=http%3A%2F%2Finews.gtimg.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1639931502&t=f89c2197bda9bb129d9404d3c4b30f2f"
     />
    </template>
    <template slot="slot2">
		<button > 点击购票</button>
    </template>
</Category>

<Category>
    <template slot="slot1">
		<h1>Foods</h1>
		<ul>
    		<li v-for="(item, index) in foods" :key="index">{{ item }}</li>
        </ul>
    </template>
</Category>

<!-- 当我们什么都没有写的时候，看展示什么 -->
<Category> </Category>
</div>
</template>

<script>
    import Category from './components/Category.vue'

    export default {
        name: 'App',
        components: {
            Category
        },
        data () {
            return {
                games:['穿越火线','qq飞车','洛克王国'],
                movies:['你好，李焕英','青春派','匆匆那年'],
                foods:['邵阳米粉','长沙茶颜','重庆火锅']
            }
        }
    }
</script>

  ``` 
  
效果展示  
解释： 
我们可以在组件中放多个slot，但是多个的时候必须要给他们命名，另外父组件中也要进行指定，这样才不会放不进去。 
 
#### 三、作用域插槽 
作用域插槽和前面稍稍有点不同，之前都是数据在父组件中，而作用域插槽是数据在子组件中，反过来传递给父组件，让父组件定义结构进行渲染。 
改造的子组件 
 
 ```java 
  <template>
  <div class="category">
    <slot name="slot1">如果当父组件不传值过来，即显示此默认</slot>
    <slot name="slot2" :foods="foods">如果当父组件不传值过来，即显示此默认</slot>
  </div>
</template>
<script>
export default {
  data () {
    return{
      foods:['邵阳米粉','长沙茶颜','重庆火锅']
    }
  }
}
</script>

  ``` 
  
父组件 
 
 ```java 
  <template>
  <div id="app">
    <Category>
      <template slot="slot1">
        <h1>Foods</h1>
      </template>
      <template slot="slot2" scope="listData">
        <!--如果不知道的 咱们可以输出看看这是什么· {{listData}}  -->
        <ul>
          <li v-for="(item, index) in listData.foods" :key="index">
            {{ item }}
          </li>
        </ul>
      </template>
    </Category>
    <Category>
      <template slot="slot1">
        <h1>Foods</h1>
      </template>
      <template slot="slot2" scope="listData">
        <ol>
          <li v-for="(item, index) in listData.foods" :key="index">
            {{ item }}
          </li>
        </ol>
      </template>
    </Category>
    <Category>
      <template slot="slot1">
        <h1>Foods</h1>
      </template>
      <template slot="slot2" scope="listData">
          <h4 v-for="(item, index) in listData.foods" :key="index">
            {{ item }}
          </h4>
      </template>
    </Category>
    <Category>
      <template slot="slot1" scope="listData">	
{{listData}}
      </template>
    </Category>
  </div>
</template>

<script>
import Category from './components/Category.vue'

export default {
  name: 'App',
  components: {
    Category
  }
}
</script>

  ``` 
  
效果图 
 
这种我在学习及练习过程中，并没有想到哪些使用场景，但是在官网上有案例，我想它必定是有存在的理由，只是我的见识太少，而未能利用到而已。 
解释： 
子组件中通过 
 ```java 
  :变量名="定义的数据"
  ``` 
  向父组件传值，父组件用 
 ```java 
   <template slot="slot2" scope="不用和子组件传递过来的名称相同">
  ``` 
  接收，因为还要. 一层，才到 
 
 ```java 
  <template slot="slot2" scope="listData">
<!--如果不知道的 咱们可以输出看看这是什么· {{listData}}  -->
<ul>
    <li v-for="(item, index) in listData.foods" :key="index">
        {{ item }}
    </li>
    </ul>
</template>

  ``` 
  
#### 后语 
大家一起加油！！！如若文章中有不足之处，请大家及时指出，在此郑重感谢。 

                                        