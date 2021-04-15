---
title: 推荐系列-Redux 中间件 到底怎么工作的呢-
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 877
cover_picture: 'https://oscimg.oschina.net/oscnet/up-5c4a6b4fe5984b704e3479898fe3091c3d9.png'
abbrlink: f696668e
date: 2021-04-15 09:08:53
---

&emsp;&emsp;中间件其实不仅仅是Redux专利，在Node框架中也有应用，比如koa，这里我们简单的默认为Redux 中间件，在进入正题前，先了解一下面向切面编程与中间件的关系 一、中间件与面向切面编程(AOP) 面...
<!-- more -->

                                                                                                                                                                                        中间件其实不仅仅是 ```java 
  Redux
  ``` 专利，在 ```java 
  Node
  ``` 框架中也有应用，比如 ```java 
  koa
  ``` ，这里我们简单的默认为 ```java 
  Redux
  ```  中间件，在进入正题前，先了解一下面向切面编程与中间件的关系 
#### 一、中间件与面向切面编程(AOP) 
面向切面编程(AOP)的存在，解决了我们熟悉的面向对象(OOP)的局限性，可以将其看作是OOP的补充。比如当我们要为某几个类新增一段共同的逻辑，在OOP模式下，即可通过修改它们共同的父类来实现，但这无疑使得公共类越来越臃肿。那如果换成AOP，则可将 扩展逻辑在工作流中的执行节点视为一个单独“切点”，形成一个可以拦截前序逻辑的“切面”。 
假设一个通用性很强，业务性很弱的日志追溯需求：要求在每个 ```java 
  Action
  ``` 被派发后，打出一个 ```java 
  console.log
  ``` 记录这个动作，面向切面编程(AOP)会如何处理？ ![Test](https://oscimg.oschina.net/oscnet/up-5c4a6b4fe5984b704e3479898fe3091c3d9.png Redux 中间件 到底怎么工作的呢-) 
可见，“切面”与业务逻辑是分离的，通过“即插即用”的方式自由的组织自己想要扩展的功能（异步���作流、性能打点、日志追溯等），它是典型的“非侵入式”的逻辑扩展思路，提升了组织逻辑的灵活度与干净度，规避逻辑冗余、逻辑耦合的问题。 
#### 二、中间件的引入 
通过分析了Redux源码的主流程，我们可以肯定 ```java 
  redux
  ``` 源码只有同步操作，也就是当 ```java 
  dispatch action
  ```  时， ```java 
  state
  ``` 会被立即更新。若需要引入异步数据流，Redux官方则建议使用中间件来增强 ```java 
  createStore
  ``` 的能力，它对外暴露了 ```java 
  applyMiddleware
  ``` 函数，接受任意个中间件作为入参，返回作为 ```java 
  createStore
  ``` 的入参的值 
 ```java 
  // 引入 redux
import { createStore } from 'redux'
// 创建 store
const store = createStore(
    reducer,
    initial_state,
    applyMiddleware(middleware1, middleware2, ...)
);

  ```  
#### 三、中间件的机制 
 
 我们顺着中间件引入的角度，简单提取一下 ```java 
  applyMiddleware
  ``` 源码框架，更加深刻的理解  ```java 
  applyMiddleware
  ```  是如何与  ```java 
  createStore
  ```  配合工作的？ 
 
 ```java 
  // 使用“...”运算符将入参收敛为一个数组
function applyMiddleware(...middlewares) {

  // createStore 对应的是 createStore 函数本身，而 args 入参则对应的是 createStore 函数 约定的入参 reducer 和 preloadedState
  return createStore => (...args) => {
  
      // 调用 `createStore`，创建一个 `store`
      const store = createStore(...args)
      // 避免在接下来中间件的串联过程中，dispatch 被调用，即 不允许在构建中间件时进行调度
      let dispatch = () => {
          throw new Error(`Dispatching while constructing your middleware is not allowed. ` + `Other middleware would not be applied to this dispatch.`)
      }
      
      ......下面代码依次放在此处......
      
  }
}

  ```  
 
 当 ```java 
  dispatch action
  ```  时， ```java 
  action
  ```  必须是一个普通对象，但使用过中间件的同学会发现  ```java 
  action
  ```  是允许为函数的，这背后 ```java 
  applyMiddleware
  ```  是如何改写 ```java 
  dispatch
  ``` 函数的？ 
 
1、以  ```java 
  middlewareAPI
  ```  作为中间件的入参，逐个调用传入的中间件，获取一个由“内层函数”组成的数组  ```java 
  chain
  ```  
 ```java 
      const middlewareAPI = {
      getState: store.getState,
      dispatch: (...args) => dispatch(...args)
    }
    
    const chain = middlewares.map(middleware => middleware(middlewareAPI))

  ```  
2、调用  ```java 
  compose
  ```  函数，将  ```java 
  chain
  ```  中的 “内层函数” 逐个组合起来，并调用最终组合出来的函数，传入  ```java 
  dispatch
  ```  作为入参 
 
 ```java 
      dispatch = compose(...chain)(store.dispatch)

  ```  
3、返回一个新的  ```java 
  store
  ```  对象，这个  ```java 
  store
  ```  对象的  ```java 
  dispatch
  ```  已经被改写过了 
 ```java 
      return {
      ...store,
      dispatch
    }

  ```  
 
 最后，我们深剖一下函数式编程中一个通用的概念，函数合成（ ```java 
  compose
  ```  函数） 
 
 ```java 
  // 利用 ... 运算符将入参收敛为数组格式
function compose(...funcs) {
  // 处理数组为空的边界情况
  if (funcs.length === 0) {
    return arg => arg
  }
  // 若只有一个函数，也就谈不上组合，直接返回
  if (funcs.length === 1) {
    return funcs[0]
  }
  // 若有多个函数，那么��用 reduce 方法来实现函数的组合
  return funcs.reduce((a, b) => (...args) => a(b(...args)))
}

  ```  
 ```java 
  reduce
  ```  会将数组中的每个元素执行指定的逻辑，并将结果汇总为单个返回值，假设有这样一个  ```java 
  compose
  ```  调用 
 ```java 
  compose(f1,f2,f3,f4)

  ```  
函数会被组合成这样的形式 
 ```java 
  (...args) => f1(f2(f3(f4(...args))))

  ```  
即 ```java 
  f1,f2,f3,f4
  ``` 这4个中间件的内层逻辑会被组合到一个函数中去，当这个函数被调用时，中间件会依次被调用 
#### 四、中间件的工作模式 
从中间件的机制中，我们知道 任何的中间件都可以用自己的方式解析 ```java 
  dispatch
  ``` 的内容，并继续传递 ```java 
  actions
  ```  给下一个中间件。但注意：当最后一个中间件开始  ```java 
  dispatch action
  ```  时， ```java 
  action
  ```  必须是一个普通对象，因为这是同步式的  ```java 
  Redux
  ```  数据流 开始的地方。 
##### 1、redux-thunk源码解析 
我们以为例，探究下中间件的工作模式 接下来，我们透过redux-thunk中间件的源码分析，验证上面的结论： 
 ```java 
  function createThunkMiddleware(extraArgument) {
  // 返回值是一个 thunk，它是一个函数
  return ({ dispatch, getState }) => (next) => (action) => {

    // thunk 若感知到 action 是一个函数，就会执行 action
    if (typeof action === 'function') {
      return action(dispatch, getState, extraArgument);
    }

    // 若 action 不是一个函数，则不处理，直接放过
    return next(action);
  };
}

const thunk = createThunkMiddleware(); // 创建 thunk
thunk.withExtraArgument = createThunkMiddleware;

export default thunk;

  ```  
从 ```java 
  redux-thunk
  ``` 源码层面可知道，它主要做的一件事就是 拦截到 ```java 
  action
  ``` 后，检查它是否是一个函数 
 
 若是函数，则执行它并返回执行的结果 
 若不是函数，则直接调用 ```java 
  next
  ``` ，工作流继续往下走 
 
##### 2、redux-thunk 模拟付款请求 
现在，我们假设有这样一个需求：我们需要感知每一次付款请求的发送和响应，并处理请求的结果 
 
 引入 
 
 ```java 
  import axios from 'axios' 
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import reducer from './reducers';

const store = createStore(
  reducer,
  applyMiddleware(thunk)
);

  ```  
 
 dispatch 一个 action，action 是一个函数 
 
 ```java 
  store.dispatch(payMoney(payInfo));

  ```  
 
 payMoney 的返回值是一个函数 
 
 ```java 
  // 支付信息
const payInfo = {
  userName: huamu,
  password: xxx,
  count: 1000000
}

const payMoney = (payInfo) => (dispatch) => {
  // 付款前发出准备信号
  dispatch({ type: 'payStart' })

  fetch().then(res => { dispatch()})

  return axios.post('/api/payMoney', {payInfo})
      .then(function (response) {
        console.log(response);
        // 付款成功信号
        dispatch({ type: 'paySuccess' })
      })
      .catch(function (error) {
        console.log(error);
        // 付款失败信号
        dispatch({ type: 'payError' })
      });
}

  ```  
##### 3、 ```java 
  Redux
  ``` 的工作流 
![Test](https://oscimg.oschina.net/oscnet/up-5c4a6b4fe5984b704e3479898fe3091c3d9.png Redux 中间件 到底怎么工作的呢-) 
结合上面的分析，中间件的工作模式有如下两点可掌握 
 
 中间件的执行时机：在 ```java 
  action
  ``` 被分发之后、 ```java 
  reducer
  ``` 触发之前 
 中间件的执行前提： ```java 
  applyMiddleware
  ``` 函数对 ```java 
  dispatch
  ``` 函数进行改写，使得 ```java 
  dispatch
  ``` 触发 ```java 
  reducer
  ``` 之前，执行 ```java 
  Redux
  ``` 中间件的链式调用。 

                                        