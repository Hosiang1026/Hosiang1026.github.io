---
title: 推荐系列-聊聊 Vue3.0 响应式数据那些事儿
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 855
cover_picture: 'https://cdn.pixabay.com/photo/2017/03/23/14/54/easter-2168521__480.jpg'
abbrlink: 277b8939
date: 2021-04-14 07:54:42
---

&emsp;&emsp;"别再更新了，实在是学不动了"这句话道出了多少前端开发者的心声，"不幸"的是 Vue 的作者在国庆区间发布了 Vue3.0 的 pre-Aplha 版本，这意味着 Vue3.0 快要和我们见面了。既来之则安之，扶我...
<!-- more -->

                                                                                                                                                                                        "别再更新了，实在是学不动了"这句话道出了多少前端开发者的心声，"不幸"的是 Vue 的作者在国庆区间发布了 Vue3.0 的 pre-Aplha 版本，这意味着 Vue3.0 快要和我们见面了。既来之则安之，扶我起来我要开始讲了。Vue3.0 为了达到更快、更小、更易于维护、更贴近原生、对开发者更友好的目的，在很多方面进行了重构： 
 
 使用 Typescript 
 放弃 class 采用 function-based API 
 重构 complier 
 重构 virtual DOM 
 新的响应式机制 
 
今天咱就聊聊重构后的响应式数据。 
 
#### 尝鲜 
重构后的 Vue3.0 和之前在写法上有很大的差别，早前在网络上对于 Vue3.0 这种激进式的重构方式发起了一场讨论，见仁见智。不多说先看看 Vue3.0 在写法上激进到什么程度。 
 ```java 
  <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Document</title>
  <script src="../packages/vue/dist/vue.global.js"></script>
</head>
<body>
  <div id="app"></div>
  <script>
    const { reactive, computed, effect, createApp } = Vue
    const App = {
      template: `
        <div id="box">
            <button @click="add">{{ state.count }}</button>
        </div> 
      `,
      setup() {
        const state = reactive({
          count: 0
        })
        function add() {
          state.count++
        }
        effect(() => {
          console.log('count改变', state.count);
        })
        return {
          state,
          add
        }
      }
    }
    createApp().mount(App, '#app')
  </script>
</body>
</html>
  ```  
确实写法上和 Vue2.x 差别有点大，还整出了个 setup。不过我的第一感觉倒不是写法上的差异，毕竟写过 React，这种写法也没啥特别的。关键是这种响应式数据的写法好像在哪里见过有没有？写过 React 项目的人可能一眼就能看出来，没错就是它 mobx，一种 React 的响应式状态管理插件 
 ```java 
  import {observable,computed,autorun} from "mobx"
var numbers = observable([1,2,3]);
var sum = computed(() => numbers.reduce((a, b) => a + b, 0));

var disposer = autorun(() => console.log(sum.get()));
// 输出 '6'
numbers.push(4);
// 输出 '10'
numbers.push(5);
  ```  
再看看 Vue3.0 暴露的这几个和响应式数据相关的方法： 
 
 reactive(value) 创建可观察的变量，参数可以是 JS 原始类型、引用、纯对象、类实例、数组、集合（Map|Set）。  
 effect(fn) effect 意思是副作用，此方法默认会先执行一次。如果 fn 中有依赖的可观察属性变化时，会再次触发此回调函数  
 computed(()=>expression) 创建一个计算值， ```java 
  computed
  ```  实现也是���于  ```java 
  effect
  ```  来实现的，特点是  ```java 
  computed
  ```  中的函数不会立即执行，多次取值是有缓存机制的， ```java 
  expression
  ```  不应该有任何副作用，而仅仅是返回一个值。当这个  ```java 
  expression
  ```  依赖的可观察属性变化时，这个表达式会重新计算。  
 
和 mobx 有异曲同工之妙。 
Vue3.0 把创建响应式对象从组件实例初始化中抽离了出来，通过暴露 API 的方式将响应式对象创建的权利交给开发者，开发者可以自由的决定何时何地创建响应式对象，就冲这点 Vue3.0 我先粉了。 
 
#### 重构后的响应式机制带来了哪些改变？ 
每一个大版本的发布都意味着新功能、新特性的出现，那么重构后的响应式数据部分相比 3.0 之前的版本有了哪些方面的改变呢？下面听我娓娓道来： 
 
##### 对数组的全面监听 
Vue2.x 中被大家吐槽的最多的一点就是针对数组只实现了  ```java 
  push,pop,shift,unshift,splice,sort,reverse' 
  ``` 这七个方法的监听，以前通过数组下标改变值的时候，是不能触发视图更新的。这里插一个题外话，很多人认为 Vue2.x 中数组不能实现全方位监听是 Object.defineProperty 不能监听数组下标的改变，这可就冤枉人家了，人家也能侦听数组下标变化的好吗，不信你看 
 ```java 
  const arr = ["2019","云","栖","音","乐","节"];
arr.forEach((val,index)=>{
    Object.defineProperty(arr,index,{
        set(newVal){
            console.log("赋值");
        },
        get(){
            console.log("取值");
            return val;
        }
    })
})
let index = arr[1];
//取值
arr[0] = "2050";
//赋值
  ```  
没毛病，一切变化都在人家的掌握中。上面这段代码，有没有人没看懂，我假装你们都不懂，贴张图 
 
从数组的数据结构来看，数组也是一个 Key-Value 的键值对集合，只是 Key 是数字罢了，自然也可以通过Object.defineProperty 来实现数组的下标访问和赋值拦截了。其实 Vue2.x 没有实现数组的全方位监听主要有两方面原因： 
 
 数组和普通对象相比，JS 数组太"多变"了。比如： ```java 
  arr.length=0
  ``` ，可以瞬间清空一个数组； ```java 
  arr[100]=1
  ``` 又可以瞬间将一个数组的长度变为 100（其他位置用空元素填充），等等骚操作。对于一个普通对象，我们一般只会改变 Key 对应的 Value 值，而不会连key都改变了,而数组就不一样了 Key 和 Value 都经常增加或减少，因此每次变化后我们都需要重新将整个数组的所有 key 递归的使用 Object.defineProperty 加上 setter 和 getter，同时我们还要穷举每一种数组变化的可能，这样势必就会带来性能开销问题，有的人会觉得这点性能开销算个 x 呀，但是性能问题都是由小变大的，如果数组中存的数据量大而且操作频繁时，这就会是一个大问题。React16.x 在就因为在优化 textNode 的时候，移除了无意义的 span 标签，性能据说都提升了多少个百分点，所以性能问题不可小看。 
 数组在应用中经常会被操作，但是通常  ```java 
  push,pop,shift,unshift,splice,sort,reverse
  ```  这 7 种操作就能达到目的。因此，出于性能方面的考虑 Vue2.x 做出了一定的取舍。 
 
那么 Vue3.0 怎么又走回头路去实现了数组的全面监听了呢？答案就是 Proxy 和 Reflet 这一对原生 CP 的出现，Vue3.0 使用 Proxy 作为响应式数据实现的核心，用 Proxy 返回一个代理对象，通过代理对象来收集依赖和触发更新。大概的原理像这段代码一样： 
 ```java 
  const arr = ["2019","云","栖","音","乐","节"];
let ProxyArray = new Proxy(arr,{
    get:function(target, name, value, receiver) {
        console.log("取值")
        return Reflect.get(target,name);
    },
    set: function(target, name, value, receiver) {
       console.log("赋值")
       Reflect.set(target,name, value, receiver);;
    }
 })
 const index = ProxyArray[0];
 //取值
 ProxyArray[0]="2050"
 //赋值
  ```  
效果和 Object.defineProperty 一样一样的，又显得清新脱俗有没有？而且 Proxy 只要是对象都能代理，后面还会提到。当然 Vue3.0 是虽然有了新欢，但也没忘记旧爱，对于在之前版本中数组的几种方法的监听还是照样支持的。 
 
##### 惰性监听 
什么是"惰性监听"? 
简单讲就是"偷懒"，开发者可以选择性的生成可观察对象。在平时的开发中常有这样的场景，一些页面上的数据在页面的整个生命周期中是不会变化的，这时这部分数据不需要具备响应式能力，这在 Vue3.0 以前是没有选择余地的，所有在模板中使用到的数据都需要在 data 中定义，组件实例在初始化的时候会将 data 整个对象变为可观察对象。 
惰性监听有什么好处？ 
 
 提高了组件实例初始化速度 Vue3.0 以前组件实例在初始化的时候会将 data 整个对象变为可观察对象，通过递归的方式给每个 Key 使用Object.defineProperty 加上 getter 和 settter，如果是数组就重写代理数组对象的七个方法。而在 Vue3.0 中，将可响应式对象创建的权利交给了开发者，开发者可以通过暴露的 reactive, compted, effect 方法自定义自��需要响应式能力的数据，实例在初始化时不需要再去递归 data 对象了，从而降低了组件实例化的时间。  
 降低了运行内存的使用 Vue3.0 以前生成响应式对象会对对象进行深度遍历，同时为每个 Key 生成一个 def 对象用来保存 Key 的所有依赖项，当 Key 对应的 Value 变化的时候通知依赖项进行 update。但如果这些依赖项在页面整个生命周期内不需要更新的时候，这时 def 对象收集的依赖项不仅没用而且还会占用内存，如果可以在初始化 data 的时候忽略掉这些不会变化的值就好了。Vue3.0 通过暴露的 reactive 方法，开发者可以选择性的创建可观察对象，达到减少依赖项的保存，降低了运行内存的使用。  
 
 
##### Map、Set、WeakSet、WeakMap的监听 
前面提到 Proxy 可以代理所有的对象，立马联想到了 ES6 里面新增的集合 Map、Set， 聚合类型的支持得益于 Proxy 和 Reflect。讲真的这之前还真不知道 Proxy 这么刚啥都能代理，二话不说直接动手用 Proxy 代理了一个 map 试试水 
 ```java 
  let map = new Map([["name","zhengcaiyun"]])
let mapProxy = new Proxy(map, {
  get(target, key, receiver) {
    console.log("取值:",key)
    return Reflect.get(target, key, receiver)
  }
})
mapProxy.get("name")
  ```  
 
一盆凉水泼来，报错了。原来  ```java 
  Map、Set
  ```  对象赋值、取值和他们内部的 this 指向有关系，但这里的 this 指向的是其实是 Proxy 对象，所以得这样干 
 ```java 
  let map = new Map([['name','wangyangyang']])
let mapProxy = new Proxy(map, {
  get(target, key, receiver) {
    var value = Reflect.get(...arguments)
     console.log("取值:",...arguments)
    return typeof value == 'function' ? value.bind(target) : value
  }
})
mapProxy.get("name")
  ```  
当获取的是一个函数的时候，通过作用域绑定的方式将原对象绑定到  ```java 
  Map、Set
  ```  对象上就好了。 
Vue3.0 是如何实现集合类型数据监听的？ 
眼尖的同学看完上面这段代码会发现一个问题，集合是没有 set 方法，集合赋值用的是 add 操作,那咋办呢？来看看那么 Vue3.0 是怎么处理的，上一段简化后的源码 
 ```java 
  function reactive(target: object) {
  return createReactiveObject(
    target,
    rawToReactive,
    reactiveToRaw,
    mutableHandlers,
    mutableCollectionHandlers
  )
}

function createReactiveObject(
  target: any,
  toProxy: WeakMap<any, any>,
  toRaw: WeakMap<any, any>,
  baseHandlers: ProxyHandler<any>,
  collectionHandlers: ProxyHandler<any>
) {
  //collectionTypes = new Set<Function>([Set, Map, WeakMap, WeakSet])
  const handlers = collectionTypes.has(target.constructor)
    ? collectionHandlers
    : baseHandlers
  //生成代理对象
  observed = new Proxy(target, handlers)
  toProxy.set(target, observed)
  toRaw.set(observed, target)
  if (!targetMap.has(target)) {
    targetMap.set(target, new Map())
  }
  return observed
}
  ```  
根据 target 类型适配不同的 handler，如果是集合 （ ```java 
  Map、Set
  ``` ）就使用 collectionHandlers，是其他类型就使用 baseHandlers。接下来看看 collectionHandlers 
 ```java 
  export const mutableCollectionHandlers: ProxyHandler<any> = {
  get: createInstrumentationGetter(mutableInstrumentations)
}
export const readonlyCollectionHandlers: ProxyHandler<any> = {
  get: createInstrumentationGetter(readonlyInstrumentations)
}
  ```  
没有意外只有 get，骚就骚在这儿: 
 ```java 
  // 可变数据插桩对象，以及一系列相应的插桩方法
const mutableInstrumentations: any = {
  get(key: any) {
    return get(this, key, toReactive)
  },
  get size() {
    return size(this)
  },
  has,
  add,
  set,
  delete: deleteEntry,
  clear,
  forEach: createForEach(false)
}
// 迭代器相关的方法
const iteratorMethods = ['keys', 'values', 'entries', Symbol.iterator]
iteratorMethods.forEach(method => {
  mutableInstrumentations[method] = createIterableMethod(method, false)
  readonlyInstrumentations[method] = createIterableMethod(method, true)
})
// 创建getter的函数
function createInstrumentationGetter(instrumentations: any) {
  return function getInstrumented(
    target: any,
    key: string | symbol,
    receiver: any
  ) {
    target =
      hasOwn(instrumentations, key) && key in target ? instrumentations : target
    return Reflect.get(target, key, receiver)
  }
}
  ```  
由于 Proxy 的 traps 跟  ```java 
  Map|Set
  ```  集合的原生方法不一致，因此无法通过 Proxy 劫持 set，所以作者在在这里进行了"偷梁换柱"，这里新创建了一个和集合对象具有相同属性和方法的普通对象，在集合对象 get 操作时将 target 对象换成新创建的普通对象。这样，当调用 get 操作时 Reflect 反射到这个新对象上，当调用 set 方法时就直接调用新对象上可以触发响应的方法，是不是很巧妙？所以多看源码好处多多，可以多学学人家的骚操作。 
 
#### IE 怎么办？ 
这是个实在不想提但又绕不开的话题，IE 在前端开发者眼里和魔鬼没什么区别。在 Vue3.0 之前，响应式数据的实现是依赖 ES5 的 Object.defineProperty，因此只要支持 ES5 的浏览器都支持 Vue，也就是说 Vue2.x 能支持到 IE9。Vue3.0 依赖的是 Proxy 和 Reflect 这一对出生新时代的 CP，且无法被转译成 ES5，或者通过 Polyfill 提供兼容，这就尴尬了。开发者技术前线获悉的信息，官方在发布最终版本之前会做到兼容 IE11，至于更低版本的 IE 那就只有送上一曲凉凉了。 
其实也不用太纠结IE的问题，因为连微软自己都已经放弃治疗 IE 拥抱 Chromium 了，我们又何必纠结呢？ 
 
#### 结语 
在使用开源框架时不要忘了，我们之所以能免费试用他，靠的维护者投入的大量精力。希望我们多去发现它带来的优点和作者想通过它传递的编程思想。最后期待 Vue3.0 正式版本的早日到来。
                                        