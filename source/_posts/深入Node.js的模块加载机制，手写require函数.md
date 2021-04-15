---
title: 推荐系列-深入Node.js的模块加载机制，手写require函数
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 1995
cover_picture: 'https://test-dennis.oss-cn-hangzhou.aliyuncs.com/QRCode/QR1270.png'
abbrlink: b2218b02
date: 2021-04-15 09:46:45
---

&emsp;&emsp;模块是Node.js里面一个很基本也很重要的概念，各种原生类库是通过模块提供的，第三方库也是通过模块进行管理和引用的。本文会从基本的模块原理出发，到最后我们会利用这个原理，自己实现一个...
<!-- more -->

                                                                                                                                                                                        模块是Node.js里面一个很基本也很重要的概念，各种原生类库是通过模块提供的，第三方库也是通过模块进行管理和引用的。本文会从基本的模块原理出发，到最后我们会利用这个原理，自己实现一个简单的模块加载机制，即自己实现一个 
 ```java 
  require
  ``` 
 。 
本文完整代码已上传GitHub：https://github.com/dennis-jiang/Front-End-Knowledges/blob/master/Examples/Node.js/Module/MyModule/index.js 
#### 简单例子 
老规矩，讲原理前我们先来一个简单的例子，从这个例子入手一步一步深入原理。Node.js里面如果要导出某个内容，需要使用 
 ```java 
  module.exports
  ``` 
 ，使用 
 ```java 
  module.exports
  ``` 
 几乎可以导出任意类型的JS对象，包括字符串，函数，对象，数组等等。我们先来建一个 
 ```java 
  a.js
  ``` 
 导出一个最简单的 
 ```java 
  hello world
  ``` 
 : 
 
 ```java 
  // a.js 
module.exports = "hello world";

  ``` 
  
然后再来一个 
 ```java 
  b.js
  ``` 
 导出一个函数： 
 
 ```java 
  // b.js
function add(a, b) {
  return a + b;
}

module.exports = add;

  ``` 
  
然后在 
 ```java 
  index.js
  ``` 
 里面使用他们，即 
 ```java 
  require
  ``` 
 他们， 
 ```java 
  require
  ``` 
 函数返回的结果就是对应文件 
 ```java 
  module.exports
  ``` 
 的值： 
 
 ```java 
  // index.js
const a = require('./a.js');
const add = require('./b.js');

console.log(a);      // "hello world"
console.log(add(1, 2));    // b导出的是一个加法函数，可以直接使用，这行结果是3

  ``` 
  
##### require会先运行目标文件 
当我们 
 ```java 
  require
  ``` 
 某个模块时，并不是只拿他的 
 ```java 
  module.exports
  ``` 
 ，而是会从头开始运行这个文件， 
 ```java 
  module.exports = XXX
  ``` 
 其实也只是其中一行代码，我们后面会讲到，这行代码的效果其实就是修改模块里面的 
 ```java 
  exports
  ``` 
 属性。比如我们再来一个 
 ```java 
  c.js
  ``` 
 ： 
 
 ```java 
  // c.js
let c = 1;

c = c + 1;

module.exports = c;

c = 6;

  ``` 
  
在 
 ```java 
  c.js
  ``` 
 里面我们导出了一个 
 ```java 
  c
  ``` 
 ，这个 
 ```java 
  c
  ``` 
 经过了几步计算，当运行到 
 ```java 
  module.exports = c;
  ``` 
 这行时 
 ```java 
  c
  ``` 
 的值为 
 ```java 
  2
  ``` 
 ，所以我们 
 ```java 
  require
  ``` 
 的 
 ```java 
  c.js
  ``` 
 的值就是 
 ```java 
  2
  ``` 
 ，后面将 
 ```java 
  c
  ``` 
 的值改为了 
 ```java 
  6
  ``` 
 并不影响前面的这行代码: 
 
 ```java 
  const c = require('./c.js');

console.log(c);  // c的值是2

  ``` 
  
前面 
 ```java 
  c.js
  ``` 
 的变量 
 ```java 
  c
  ``` 
 是一个基本数据类型，所以后面的 
 ```java 
  c = 6;
  ``` 
 不影响前面的 
 ```java 
  module.exports
  ``` 
 ，那他如果是一个引用类型呢？我们直接来试试吧： 
 
 ```java 
  // d.js
let d = {
  num: 1
};

d.num++;

module.exports = d;

d.num = 6;

  ``` 
  
然后在 
 ```java 
  index.js
  ``` 
 里面 
 ```java 
  require
  ``` 
 他： 
 
 ```java 
  const d = require('./d.js');

console.log(d);     // { num: 6 }

  ``` 
  
我们发现在 
 ```java 
  module.exports
  ``` 
 后面给 
 ```java 
  d.num
  ``` 
 赋值仍然生效了，因为 
 ```java 
  d
  ``` 
 是一个对象，是一个引用类型，我们可以通过这个引用来修改他的值。其实对于引用类型来说，不仅仅在 
 ```java 
  module.exports
  ``` 
 后面可以修改他的值，在模块外面也可以修改，比如 
 ```java 
  index.js
  ``` 
 里面就可以直接改： 
 
 ```java 
  const d = require('./d.js');

d.num = 7;
console.log(d);     // { num: 7 }

  ``` 
  
####  
 ```java 
  require
  ``` 
 和 
 ```java 
  module.exports
  ``` 
 不是黑魔法 
我们通过前面的例子可以看出来， 
 ```java 
  require
  ``` 
 和 
 ```java 
  module.exports
  ``` 
 干的事情并不复杂，我们先假设有一个全局对象 
 ```java 
  {}
  ``` 
 ，初始情况下是空的，当你 
 ```java 
  require
  ``` 
 某个文件时，就将这个文件拿出来执行，如果这个文件里面存在 
 ```java 
  module.exports
  ``` 
 ，当运行到这行代码时将 
 ```java 
  module.exports
  ``` 
 的值加入这个对象，键为对应的文件名，最终这个对象就长这样： 
 
 ```java 
  {
  "a.js": "hello world",
  "b.js": function add(){},
  "c.js": 2,
  "d.js": { num: 2 }
}

  ``` 
  
当你再次 
 ```java 
  require
  ``` 
 某个文件时，如果这个对象里面有对应的值，就直接返回给你，如果没有就重复前面的步骤，执行目标文件，然后将它的 
 ```java 
  module.exports
  ``` 
 加入这个全局对象，并返回给调用者。这个全局对象其实就是我们经常听说的缓存。**所以 
 ```java 
  require
  ``` 
 和 
 ```java 
  module.exports
  ``` 
 并没有什么黑魔法，就只是运行并获取目标文件的值，然后加入缓存，用的时候拿出来用就行。**再看看这个对象，因为 
 ```java 
  d.js
  ``` 
 是一个引用类型，所以你在任何地方获取了这个引用都可以更改他的值，如果不希望自己模块的值被更改，需要自己写模块时进行处理，比如使用 
 ```java 
  Object.freeze()
  ``` 
 ， 
 ```java 
  Object.defineProperty()
  ``` 
 之类的方法。 
#### 模块类型和加载顺序 
这一节的内容都是一些概念，比较枯燥，但是也是我们需要了解的。 
##### 模块类型 
Node.js的模块有好几种类型，前面我们使用的其实都是 
 ```java 
  文件模块
  ``` 
 ，总结下来，主要有这两种类型： 
 
 内置模块：就是Node.js原生提供的功能，比如 
 ```java 
  fs
  ``` 
 ， 
 ```java 
  http
  ``` 
 等等，这些模块在Node.js进程起来时就加载了。 
 文件模块：我们前面写的几个模块，还有第三方模块，即 
 ```java 
  node_modules
  ``` 
 下面的模块都是文件模块。 
 
##### 加载顺序 
加载顺序是指当我们 
 ```java 
  require(X)
  ``` 
 时，应该按照什么顺序去哪里找 
 ```java 
  X
  ``` 
 ，在官方文档上有详细伪代码，总结下来大概是这么个顺序： 
 
 优先加载内置模块，即使有同名文件，也会优先使用内置模块。 
 不是内置模块，先去缓存找。 
 缓存没有就去找对应路径的文件。 
 不存在对应的文件，就将这个路径作为文件夹加载。 
 对应的文件和文件夹都找不到就去 
 ```java 
  node_modules
  ``` 
 下面找。 
 还找不到就报错了。 
 
##### 加载文件夹 
前面提到找不到文件就找文件夹，但是不可能将整个文件夹都加载进来，加载文件夹的时候也是有一个加载顺序的： 
 
 先看看这个文件夹下面有没有 
 ```java 
  package.json
  ``` 
 ，如果有就找里面的 
 ```java 
  main
  ``` 
 字段， 
 ```java 
  main
  ``` 
 字段有值就加载对应的文件。所以如果大家在看一些第三方库源码时找不到入口就看看他 
 ```java 
  package.json
  ``` 
 里面的 
 ```java 
  main
  ``` 
 字段吧，比如 
 ```java 
  jquery
  ``` 
 的 
 ```java 
  main
  ``` 
 字段就是这样： 
 ```java 
  "main": "dist/jquery.js"
  ``` 
 。 
 如果没有 
 ```java 
  package.json
  ``` 
 或者 
 ```java 
  package.json
  ``` 
 里面没有 
 ```java 
  main
  ``` 
 就找 
 ```java 
  index
  ``` 
 文件。 
 如果这两步都找不到就报错了。 
 
##### 支持的文件类型 
 
 ```java 
  require
  ``` 
 主要支持三种文件类型： 
 
 .js： 
 ```java 
  .js
  ``` 
 文件是我们最常用的文件类型，加载的时候会先运行整个JS文件，然后将前面说的 
 ```java 
  module.exports
  ``` 
 作为 
 ```java 
  require
  ``` 
 的返回值。 
 .json： 
 ```java 
  .json
  ``` 
 文件是一个普通的文本文件，直接用 
 ```java 
  JSON.parse
  ``` 
 将其转化为对象返回就行。 
 .node： 
 ```java 
  .node
  ``` 
 文件是C++编译后的二进制文件，纯前端一般很少接触这个类型。 
 
#### 手写 
 ```java 
  require
  ``` 
  
前面其实我们已经将原理讲的七七八八了，下面来到我们的重头戏，自己实现一个 
 ```java 
  require
  ``` 
 。实现 
 ```java 
  require
  ``` 
 其实就是实现整个Node.js的模块加载机制，我们再来理一下需要解决的问题： 
 
 通过传入的路径名找到对应的文件。 
 执行找到的文件，同时要注入 
 ```java 
  module
  ``` 
 和 
 ```java 
  require
  ``` 
 这些方法和属性，以便模块文件使用。 
 返回模块的 
 ```java 
  module.exports
  ``` 
  
 
本文的手写代码全部参照Node.js官方源码，函数名和变量名尽量保持一致，其实就是精简版的源码，大家可以对照着看，写到具体方法时我也会贴上对应的源码地址。总体的代码都在这个文件里面：https://github.com/nodejs/node/blob/c6b96895cc74bc6bd658b4c6d5ea152d6e686d20/lib/internal/modules/cjs/loader.js 
##### Module类 
Node.js模块加载的功能全部在 
 ```java 
  Module
  ``` 
 类里面，整个代码使用面向对象的思想，如果你对JS的面向对象还不是很熟悉可以先看看这篇文章。 
 ```java 
  Module
  ``` 
 类的构造函数也不复杂，主要是一些值的初始化，为了跟官方 
 ```java 
  Module
  ``` 
 名字区分开，我们自己的类命名为 
 ```java 
  MyModule
  ``` 
 ： 
 
 ```java 
  function MyModule(id = '') {
  this.id = id;       // 这个id其实就是我们require的路径
  this.path = path.dirname(id);     // path是Node.js内置模块，用它来获取传入参数对应的文件夹路径
  this.exports = {};        // 导出的东西放这里，初始化为空对象
  this.filename = null;     // 模块对应的文件名
  this.loaded = false;      // loaded用来标识当前模块是否已经加载
}

  ``` 
  
##### require方法 
我们一直用的 
 ```java 
  require
  ``` 
 其实是 
 ```java 
  Module
  ``` 
 类的一个实例方法，内容很简单，先做一些参数检查，然后调用 
 ```java 
  Module._load
  ``` 
 方法，源码看这里：https://github.com/nodejs/node/blob/c6b96895cc74bc6bd658b4c6d5ea152d6e686d20/lib/internal/modules/cjs/loader.js#L970。精简版的代码如下： 
 
 ```java 
  MyModule.prototype.require = function (id) {
  return Module._load(id);
}

  ``` 
  
##### MyModule._load 
 
 ```java 
  MyModule._load
  ``` 
 是一个静态方法，这才是 
 ```java 
  require
  ``` 
 方法的真正主体，他干的事情其实是： 
 
 先检查请求的模块在缓存中是否已经存在了，如果存在了直接返回缓存模块的 
 ```java 
  exports
  ``` 
 。 
 如果不在缓存中，就 
 ```java 
  new
  ``` 
 一个 
 ```java 
  Module
  ``` 
 实例，用这个实例加载对应的模块，并返回模块的 
 ```java 
  exports
  ``` 
 。 
 
我们自己来实现下这两个需求，缓存直接放在 
 ```java 
  Module._cache
  ``` 
 这个静态变量上，这个变量官方初始化使用的是 
 ```java 
  Object.create(null)
  ``` 
 ，这样可以使创建出来的原型指向 
 ```java 
  null
  ``` 
 ，我们也这样做吧： 
 
 ```java 
  MyModule._cache = Object.create(null);

MyModule._load = function (request) {    // request是我们传入的路劲参数
  const filename = MyModule._resolveFilename(request);

  // 先检查缓存，如果缓存存在且已经加载，直接返回缓存
  const cachedModule = MyModule._cache[filename];
  if (cachedModule !== undefined) {
    return cachedModule.exports;
  }

  // 如果缓存不存在，我们就加载这个模块
  // 加载前先new一个MyModule实例，然后调用实例方法load来加载
  // 加载完成直接返回module.exports
  const module = new MyModule(filename);
  
  // load之前就将这个模块缓存下来，这样如果有循环引用就会拿到这个缓存，但是这个缓存里面的exports可能还没有或者不完整
  MyModule._cache[filename] = module;
  
  module.load(filename);
  
  return module.exports;
}

  ``` 
  
上述代码对应的源码看这里：https://github.com/nodejs/node/blob/c6b96895cc74bc6bd658b4c6d5ea152d6e686d20/lib/internal/modules/cjs/loader.js#L735 
可以看到上述源码还调用了两个方法： 
 ```java 
  MyModule._resolveFilename
  ``` 
 和 
 ```java 
  MyModule.prototype.load
  ``` 
 ，下面我们来实现下这两个方法。 
#####  
 ```java 
  MyModule._resolveFilename
  ``` 
  
 
 ```java 
  MyModule._resolveFilename
  ``` 
 从名字就可以看出来，这个方法是通过用户传入的 
 ```java 
  require
  ``` 
 参数来解析到真正的文件地址的，源码中这个方法比较复杂，因为按照前面讲的，他要支持多种参数：内置模块，相对路径，绝对路径，文件夹和第三方模块等等，如果是文件夹或者第三方模块还要解析里面的 
 ```java 
  package.json
  ``` 
 和 
 ```java 
  index.js
  ``` 
 。我们这里主要讲原理，所以我们就只实现通过相对路径和绝对路径来查找文件，并支持自动添加 
 ```java 
  js
  ``` 
 和 
 ```java 
  json
  ``` 
 两种后缀名: 
 
 ```java 
  MyModule._resolveFilename = function (request) {
  const filename = path.resolve(request);   // 获取传入参数对应的绝对路径
  const extname = path.extname(request);    // 获取文件后缀名

  // 如果没有文件后缀名，尝试添加.js和.json
  if (!extname) {
    const exts = Object.keys(MyModule._extensions);
    for (let i = 0; i &lt; exts.length; i++) {
      const currentPath = `${filename}${exts[i]}`;

      // 如果拼接后的文件存在，返回拼接的路径
      if (fs.existsSync(currentPath)) {
        return currentPath;
      }
    }
  }

  return filename;
}

  ``` 
  
上述源码中我们还用到了一个静态变量 
 ```java 
  MyModule._extensions
  ``` 
 ，这个变量是用来存各种文件对应的处理方法的，我们后面会实现他。 
 
 ```java 
  MyModule._resolveFilename
  ``` 
 对应的源码看这里：https://github.com/nodejs/node/blob/c6b96895cc74bc6bd658b4c6d5ea152d6e686d20/lib/internal/modules/cjs/loader.js#L822 
#####  
 ```java 
  MyModule.prototype.load
  ``` 
  
 
 ```java 
  MyModule.prototype.load
  ``` 
 是一个实例方���，这个方法就是真正用来加载模块的方法，这其实也是不同类型文件加载的一个入口，不同类型的文件会对应 
 ```java 
  MyModule._extensions
  ``` 
 里面的一个方法： 
 
 ```java 
  MyModule.prototype.load = function (filename) {
  // 获取文件后缀名
  const extname = path.extname(filename);

  // 调用后缀名对应的处理函数来处理
  MyModule._extensions[extname](this, filename);

  this.loaded = true;
}

  ``` 
  
注意这段代码里面的 
 ```java 
  this
  ``` 
 指向的是 
 ```java 
  module
  ``` 
 实例，因为他是一个实例方法。对应的源码看这里: https://github.com/nodejs/node/blob/c6b96895cc74bc6bd658b4c6d5ea152d6e686d20/lib/internal/modules/cjs/loader.js#L942 
##### 加载js文件: MyModule._extensions['.js'] 
前面我们说过不同文件类型的处理方法都挂载在 
 ```java 
  MyModule._extensions
  ``` 
 上面的，我们先来实现 
 ```java 
  .js
  ``` 
 类型文件的加载： 
 
 ```java 
  MyModule._extensions['.js'] = function (module, filename) {
  const content = fs.readFileSync(filename, 'utf8');
  module._compile(content, filename);
}

  ``` 
  
可以看到 
 ```java 
  js
  ``` 
 的加载方法很简单，只是把文件内容读出来，然后调了另外一个实例方法 
 ```java 
  _compile
  ``` 
 来执行他。对应的源码看这里：https://github.com/nodejs/node/blob/c6b96895cc74bc6bd658b4c6d5ea152d6e686d20/lib/internal/modules/cjs/loader.js#L1098 
##### 编译执行js文件：MyModule.prototype._compile 
 
 ```java 
  MyModule.prototype._compile
  ``` 
 是加载JS文件的核心所在，也是我们最常使用的方法，这个方法需要将目标文件拿出来执行一遍，执行之前需要将它整个代码包裹一层，以便注入 
 ```java 
  exports, require, module, __dirname, __filename
  ``` 
 ，这也是我们能在JS文件里面直接使用这几个变量的原因。要实现这种注入也不难，假如我们 
 ```java 
  require
  ``` 
 的文件是一个简单的 
 ```java 
  Hello World
  ``` 
 ，长这样： 
 
 ```java 
  module.exports = "hello world";

  ``` 
  
那我们怎么来给他注入 
 ```java 
  module
  ``` 
 这个变量呢？答案是执行的时候在他外面再加一层函数，使他变成这样： 
 
 ```java 
  function (module) { // 注入module变量，其实几个变量同理
  module.exports = "hello world";
}

  ``` 
  
所以我们如果将文件内容作为一个字符串的话，为了让他能够变成上面这样，我们需要再给他拼接上开头和结尾，我们直接将开头和结尾放在一个数组里面: 
 
 ```java 
  MyModule.wrapper = [
  '(function (exports, require, module, __filename, __dirname) { ',
  '\n});'
];

  ``` 
  
注意我们拼接的开头和结尾多了一个 
 ```java 
  ()
  ``` 
 包裹，这样我们后面可以拿到这个匿名函数，在后面再加一个 
 ```java 
  ()
  ``` 
 就可以传参数执行了。然后将需要执行的函数拼接到这个方法中间： 
 
 ```java 
  MyModule.wrap = function (script) {
  return MyModule.wrapper[0] + script + MyModule.wrapper[1];
};

  ``` 
  
这样通过 
 ```java 
  MyModule.wrap
  ``` 
 包装的代码就可以获取到 
 ```java 
  exports, require, module, __filename, __dirname
  ``` 
 这几个变量了。知道了这些就可以来写 
 ```java 
  MyModule.prototype._compile
  ``` 
 了: 
 
 ```java 
  MyModule.prototype._compile = function (content, filename) {
  const wrapper = Module.wrap(content);    // ��取包装后函数体

  // vm是nodejs的虚拟机沙盒模块，runInThisContext方法可以接受一个字符串并将它转化为一个函数
  // 返回值就是转化后的函数，所以compiledWrapper是一个函数
  const compiledWrapper = vm.runInThisContext(wrapper, {
    filename,
    lineOffset: 0,
    displayErrors: true,
  });

  // 准备exports, require, module, __filename, __dirname这几个参数
  // exports可以直接用module.exports，即this.exports
  // require官方源码中还包装了一层，其实最后调用的还是this.require
  // module不用说，就是this了
  // __filename直接用传进来的filename参数了
  // __dirname需要通过filename获取下
  const dirname = path.dirname(filename);

  compiledWrapper.call(this.exports, this.exports, this.require, this,
    filename, dirname);
}

  ``` 
  
上述代码要注意我们注入进去的几个参数和通过 
 ```java 
  call
  ``` 
 传进去的 
 ```java 
  this
  ``` 
 : 
 
 this: 
 ```java 
  compiledWrapper
  ``` 
 是通过 
 ```java 
  call
  ``` 
 调用的，第一个参数就是里面的 
 ```java 
  this
  ``` 
 ，这里我们传入的是 
 ```java 
  this.exports
  ``` 
 ，也就是 
 ```java 
  module.exports
  ``` 
 ，也就是说我们 
 ```java 
  js
  ``` 
 文件里面 
 ```java 
  this
  ``` 
 是对 
 ```java 
  module.exports
  ``` 
 的一个引用。 
 exports:  
 ```java 
  compiledWrapper
  ``` 
 正式接收的第一个参数是 
 ```java 
  exports
  ``` 
 ，我们传的也是 
 ```java 
  this.exports
  ``` 
 ,所以 
 ```java 
  js
  ``` 
 文件里面的 
 ```java 
  exports
  ``` 
 也是对 
 ```java 
  module.exports
  ``` 
 的一个引用。 
 require: 这个方法我们传的是 
 ```java 
  this.require
  ``` 
 ，其实就是 
 ```java 
  MyModule.prototype.require
  ``` 
 ，也就是 
 ```java 
  MyModule._load
  ``` 
 。 
 module: 我们传入的是 
 ```java 
  this
  ``` 
 ，也就是当前模块的实例。 
 __filename：文件所在的绝对路径。 
 __dirname: 文件所在文件夹的绝对路径。 
 
到这里，我们的JS文件其实已经记载完了，对应的源码看这里:https://github.com/nodejs/node/blob/c6b96895cc74bc6bd658b4c6d5ea152d6e686d20/lib/internal/modules/cjs/loader.js#L1043 
##### 加载json文件: MyModule._extensions['.json'] 
加载 
 ```java 
  json
  ``` 
 文件就简单多了，只需要将文件读出来解析成 
 ```java 
  json
  ``` 
 就行了： 
 
 ```java 
  MyModule._extensions['.json'] = function (module, filename) {
  const content = fs.readFileSync(filename, 'utf8');
  module.exports = JSONParse(content);
}

  ``` 
  
####  
 ```java 
  exports
  ``` 
 和 
 ```java 
  module.exports
  ``` 
 的区别 
网上经常有人问， 
 ```java 
  node.js
  ``` 
 里面的 
 ```java 
  exports
  ``` 
 和 
 ```java 
  module.exports
  ``` 
 到底有什么区别，其实前面我们的手写代码已经给出答案了，我们这里再就这个问题详细讲解下。 
 ```java 
  exports
  ``` 
 和 
 ```java 
  module.exports
  ``` 
 这两个变量都是通过下面这行代码注入的。 
 
 ```java 
  compiledWrapper.call(this.exports, this.exports, this.require, this,
    filename, dirname);

  ``` 
  
初始状态下， 
 ```java 
  exports === module.exports === {}
  ``` 
 ， 
 ```java 
  exports
  ``` 
 是 
 ```java 
  module.exports
  ``` 
 的一个引用，如果你一直是这样使用的: 
 
 ```java 
  exports.a = 1;
module.exports.b = 2;

console.log(exports === module.exports);   // true

  ``` 
  
上述代码中， 
 ```java 
  exports
  ``` 
 和 
 ```java 
  module.exports
  ``` 
 都是指向同一个对象 
 ```java 
  {}
  ``` 
 ，你往这个对象上添加属性并没有改变这个对象本身的引用地址，所以 
 ```java 
  exports === module.exports
  ``` 
 一直成立。 
但是如果你哪天这样使用了: 
 
 ```java 
  exports = {
  a: 1
}

  ``` 
  
或者这样使用了: 
 
 ```java 
  module.exports = {
	b: 2
}

  ``` 
  
那其实你是给 
 ```java 
  exports
  ``` 
 或者 
 ```java 
  module.exports
  ``` 
 重新赋值了，改变了他们的引用地址，那这两个属性的连接就断开了，他们就不再相等了。需要注意的是，你对 
 ```java 
  module.exports
  ``` 
 的重新赋值会作为模块的导出内容，但是你对 
 ```java 
  exports
  ``` 
 的重新赋值并不能改变模块导出内容，只是改变了 
 ```java 
  exports
  ``` 
 这个变量而已，因为模块始终是 
 ```java 
  module
  ``` 
 ，导出内容是 
 ```java 
  module.exports
  ``` 
 。 
#### 循环引用 
Node.js对于循环引用是进行了处理的，下面是官方例子： 
 
 ```java 
  a.js
  ``` 
 : 
 
 ```java 
  console.log('a 开始');
exports.done = false;
const b = require('./b.js');
console.log('在 a 中，b.done = %j', b.done);
exports.done = true;
console.log('a 结束');

  ``` 
  
 
 ```java 
  b.js
  ``` 
 : 
 
 ```java 
  console.log('b 开始');
exports.done = false;
const a = require('./a.js');
console.log('在 b 中，a.done = %j', a.done);
exports.done = true;
console.log('b 结束');

  ``` 
  
 
 ```java 
  main.js
  ``` 
 : 
 
 ```java 
  console.log('main 开始');
const a = require('./a.js');
const b = require('./b.js');
console.log('在 main 中，a.done=%j，b.done=%j', a.done, b.done);

  ``` 
  
当  
 ```java 
  main.js
  ``` 
  加载  
 ```java 
  a.js
  ``` 
  时，  
 ```java 
  a.js
  ``` 
  又加载  
 ```java 
  b.js
  ``` 
 。 此时，  
 ```java 
  b.js
  ``` 
  会尝试去加载  
 ```java 
  a.js
  ``` 
 。 为了防止无限的循环，会返回一个  
 ```java 
  a.js
  ``` 
  的  
 ```java 
  exports
  ``` 
  对象的 未完成的副本 给  
 ```java 
  b.js
  ``` 
  模块。 然后  
 ```java 
  b.js
  ``` 
  完成加载，并将  
 ```java 
  exports
  ``` 
  对象提供给  
 ```java 
  a.js
  ``` 
  模块。 
那么这个效果是怎么实现的呢？答案就在我们的 
 ```java 
  MyModule._load
  ``` 
 源码里面，注意这两行代码的顺序: 
 
 ```java 
  MyModule._cache[filename] = module;

module.load(filename);

  ``` 
  
上述代码中我们是先将缓存设置了，然后再执行的真正的 
 ```java 
  load
  ``` 
 ，顺着这个思路我能来理一下这里的加载流程: 
 
  
 ```java 
  main
  ``` 
 加载 
 ```java 
  a
  ``` 
 ， 
 ```java 
  a
  ``` 
 在真正加载前先去缓存中占一个位置 
  
 ```java 
  a
  ``` 
 在正式加载时加载了 
 ```java 
  b
  ``` 
  
  
 ```java 
  b
  ``` 
 又去加载了 
 ```java 
  a
  ``` 
 ，这时候缓存中已经有 
 ```java 
  a
  ``` 
 了，所以直接返回 
 ```java 
  a.exports
  ``` 
 ，即使这时候的 
 ```java 
  exports
  ``` 
 是不完整的。 
 
#### 总结 
 
  
 ```java 
  require
  ``` 
 不是黑魔法，整个Node.js的模块加载机制都是 
 ```java 
  JS
  ``` 
 实现的。 
 每个模块里面的 
 ```java 
  exports, require, module, __filename, __dirname
  ``` 
 五个参数都不是全局变量，而是模块加载的时候注入的。 
 为了注入这几个变量，我们需要将用户的代码用一个函数包裹起来，拼一个字符串然后调用沙盒模块 
 ```java 
  vm
  ``` 
 来实现。 
 初始状态下，模块里面的 
 ```java 
  this, exports, module.exports
  ``` 
 都指向同一个对象，如果你对他们重新赋值，这种连接就断了。 
 对 
 ```java 
  module.exports
  ``` 
 的重新赋值会作为模块的导出内容，但是你对 
 ```java 
  exports
  ``` 
 的重新赋值并不能改变模块导出内容，只是改变了 
 ```java 
  exports
  ``` 
 这个变量而已，因为模块始终是 
 ```java 
  module
  ``` 
 ，导出内容是 
 ```java 
  module.exports
  ``` 
 。 
 为了解决循环引用，模块在加载前就会被加入缓存，下次再加载会直接返回缓存，如果这时候模块还没加载完，你可能拿到未完成的 
 ```java 
  exports
  ``` 
 。 
 Node.js实现的这套加载机制叫CommonJS。 
 
��文��整代码已上传GitHub：https://github.com/dennis-jiang/Front-End-Knowledges/blob/master/Examples/Node.js/Module/MyModule/index.js 
#### 参考资料 
Node.js模块加载源码：https://github.com/nodejs/node/blob/c6b96895cc74bc6bd658b4c6d5ea152d6e686d20/lib/internal/modules/cjs/loader.js 
Node.js模块官方文档：http://nodejs.cn/api/modules.html 
文章的最后，感谢你花费宝贵的时间阅读本文，如果本文给了你一点点帮助或者启发，请不要吝啬你的赞和GitHub小星星，你的支持是作者持续创作的动力。 
“前端进阶知识”系列文章及示例源码： https://github.com/dennis-jiang/Front-End-Knowledges 
欢迎关注我的公众号进击的大前端第一时间获取高质量原创~ 
![Test](https://test-dennis.oss-cn-hangzhou.aliyuncs.com/QRCode/QR1270.png  '深入Node.js的模块加载机制，手写require函数')
                                        