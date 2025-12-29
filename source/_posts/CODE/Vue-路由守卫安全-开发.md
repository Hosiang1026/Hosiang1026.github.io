---
title: Vue 路由守卫安全
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 2024
cover_picture: 'https://oscimg.oschina.net/oscnet/03783f42-8444-449f-9ecf-abdc4bb28a2c.jpg'
abbrlink: 3dab86b6
date: 2021-04-15 09:46:45
---


<!-- more -->

![Test](https://oscimg.oschina.net/oscnet/03783f42-8444-449f-9ecf-abdc4bb28a2c.jpg  'Vue 路由守卫安全')

## 导读大纲

本文将从以下几个方面详细介绍Vue路由守卫：

1. **路由守卫分类** - 了解路由守卫的三种类型
2. **全局路由守卫** - 学习如何设置全局路由守卫
3. **单个路由独享守卫** - 掌握路由级别的守卫
4. **组件路由守卫** - 理解组件内的路由守卫
5. **路由守卫执行的完整过程** - 掌握路由守卫的执行顺序

## 路由守卫分类

Vue Router提供了三种类型的路由守卫：

1. **全局路由守卫** - 作用于所有路由
2. **单个路由独享守卫** - 作用于特定路由
3. **组件路由守卫** - 作用于特定组件

## 全局路由守卫

全局路由守卫是在路由实例上直接定义的守卫函数，它们会在路由跳转时被调用。Vue Router提供了三种全局守卫：

### beforeEach

`beforeEach` 是在路由跳转之前执行的守卫，常用于权限验证。

```javascript
// 全局验证路由
const router = createRouter({
  history: createWebHashHistory(),
  routes
});

// 白名单，不需要验证的路由
const whiteList = ['/', '/register', '/login'];

router.beforeEach((to, from, next) => {
  // 判断是否在白名单中
  if (whiteList.indexOf(to.path) !== -1) {
    // 放行，进入下一个路由
    next();
  } else if (!sessionStorage.getItem('token')) {
    // 没有token，跳转到登录页
    next('/login');
  } else {
    // 有token，放行
    next();
  }
});
```

**参数说明：**
- `to`: 即将要进入的目标路由对象
- `from`: 当前导航正要离开的路由对象
- `next`: 调用该方法来 resolve 这个钩子

**next() 的用法：**
- `next()`: 进行管道中的下一个钩子
- `next(false)`: 中断当前的导航
- `next('/')` 或 `next({ path: '/' })`: 跳转到一个不同的地址
- `next(error)`: 如果传入的参数是一个 Error 实例，则导航会被终止且该错误会被传递给 `router.onError()` 注册过的回调

### beforeResolve

`beforeResolve` 在导航被确认之前，同时在所有组件内守卫和异步路由组件被解析之后调用。

```javascript
router.beforeResolve((to, from, next) => {
  // 在导航被确认之前执行
  // 此时组件已经解析完成
  if (to.meta.requiresAuth) {
    // 检查用户权限
    if (checkUserPermission()) {
      next();
    } else {
      next('/unauthorized');
    }
  } else {
    next();
  }
});
```

### afterEach

`afterEach` 在路由跳转完成后执行，此时已经进入了目标路由，无法改变导航。

```javascript
router.afterEach((to, from) => {
  // 路由跳转完成后执行
  // 可以用于页面访问统计、设置页面标题等
  document.title = to.meta.title || '默认标题';
  
  // 页面访问统计
  if (window.gtag) {
    window.gtag('config', 'GA_MEASUREMENT_ID', {
      page_path: to.path
    });
  }
});
```

## 单个路由独享守卫

单个路由独享守卫是在路由配置中直接定义的 `beforeEnter` 守卫，只作用于该路由。

### beforeEnter

```javascript
const routes = [
  {
    path: '/superior',
    component: Superior,
    meta: {
      icon: 'el-icon-s-check',
      title: '上级文件'
    },
    beforeEnter: (to, from, next) => {
      // 路由级别的守卫
      // 检查用户是否有权限访问该路由
      if (hasPermission('superior')) {
        next();
      } else {
        next('/unauthorized');
      }
    }
  }
];
```

**使用场景：**
- 特定路由需要特殊权限验证
- 路由级别的数据预加载
- 路由参数验证

## 组件路由守卫

组件路由守卫是在组件内部定义的路由守卫，它们可以直接访问组件实例。

### beforeRouteEnter

在进入该组件对应的路由前调用，此时组件实例还未创建，无法访问 `this`。

```javascript
export default {
  name: 'UserProfile',
  beforeRouteEnter(to, from, next) {
    // 组件实例还未创建
    // 可以通过 next 回调访问组件实例
    next(vm => {
      // 通过 vm 访问组件实例
      vm.loadUserData(to.params.id);
    });
  }
};
```

### beforeRouteUpdate

在当前路由改变，但是该组件被复用时调用。例如，对于带有动态参数的路径 `/user/:id`，在 `/user/1` 和 `/user/2` 之间跳转时，组件会被复用。

```javascript
export default {
  name: 'UserProfile',
  beforeRouteUpdate(to, from, next) {
    // 可以访问组件实例 this
    // 当路由参数变化时，重新加载数据
    if (to.params.id !== from.params.id) {
      this.loadUserData(to.params.id);
    }
    next();
  }
};
```

### beforeRouteLeave

在离开该组件对应的路由前调用，常用于防止用户在未保存的情况下离开页面。

```javascript
export default {
  name: 'EditForm',
  data() {
    return {
      hasUnsavedChanges: false
    };
  },
  beforeRouteLeave(to, from, next) {
    // 检查是否有未保存的更改
    if (this.hasUnsavedChanges) {
      const answer = window.confirm('您有未保存的更改，确定要离开吗？');
      if (answer) {
        next();
      } else {
        next(false);
      }
    } else {
      next();
    }
  }
};
```

## 路由守卫执行的完整过程

路由守卫的执行顺序如下：

1. **导航被触发**
2. **在失活的组件里调用 `beforeRouteLeave` 守卫**
3. **调用全局的 `beforeEach` 守卫**
4. **在重用的组件里调用 `beforeRouteUpdate` 守卫**
5. **在路由配置里调用 `beforeEnter` 守卫**
6. **解析异步路由组件**
7. **在被激活的组件里调用 `beforeRouteEnter` 守卫**
8. **调用全局的 `beforeResolve` 守卫**
9. **导航被确认**
10. **调用全局的 `afterEach` 钩子**
11. **触发 DOM 更新**
12. **调用 `beforeRouteEnter` 守卫中传给 `next` 的回调函数，创建好的组件实例会作为回调函数的参数传入**

**执行流程图：**

```
导航触发
  ↓
beforeRouteLeave (组件内)
  ↓
beforeEach (全局)
  ↓
beforeRouteUpdate (组件内，如果组件被复用)
  ↓
beforeEnter (路由配置)
  ↓
解析异步路由组件
  ↓
beforeRouteEnter (组件内)
  ↓
beforeResolve (全局)
  ↓
导航确认
  ↓
afterEach (全局)
  ↓
DOM 更新
  ↓
beforeRouteEnter 的 next 回调
```

**完整示例：**

```javascript
// router/index.js
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/user/:id',
      component: UserProfile,
      beforeEnter: (to, from, next) => {
        console.log('路由配置守卫');
        next();
      }
    }
  ]
});

// 全局守卫
router.beforeEach((to, from, next) => {
  console.log('全局 beforeEach');
  next();
});

router.beforeResolve((to, from, next) => {
  console.log('全局 beforeResolve');
  next();
});

router.afterEach((to, from) => {
  console.log('全局 afterEach');
});

// 组件内守卫
export default {
  beforeRouteEnter(to, from, next) {
    console.log('组件 beforeRouteEnter');
    next(vm => {
      console.log('组件 beforeRouteEnter 回调');
    });
  },
  beforeRouteUpdate(to, from, next) {
    console.log('组件 beforeRouteUpdate');
    next();
  },
  beforeRouteLeave(to, from, next) {
    console.log('组件 beforeRouteLeave');
    next();
  }
};
```

## 总结

路由守卫是Vue Router中非常重要的功能，它们可以帮助我们：

1. **权限控制** - 根据用户权限决定是否可以访问某个路由
2. **数据预加载** - 在进入路由前加载必要的数据
3. **页面保护** - 防止用户在未保存的情况下离开页面
4. **访问统计** - 记录页面访问情况
5. **页面标题设置** - 根据路由动态设置页面标题

合理使用路由守卫可以让我们的应用更加安全和用户友好。

