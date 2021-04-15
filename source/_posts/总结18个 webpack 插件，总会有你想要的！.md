---
title: 推荐系列-总结18个 webpack 插件，总会有你想要的！
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 812
cover_picture: 'https://oscimg.oschina.net/oscnet/4d2e3f5d-88d2-41fd-998b-1ef5dd391759.jpg'
abbrlink: 76318c53
date: 2021-04-15 09:15:42
---

&emsp;&emsp;作者：lzg9527 https://juejin.cn/post/6844904193589772301 何为插件(Plugin)？专注处理 webpack 在编译过程中的某个特定的任务的功能模块，可以称为插件。 Plugin 是一个扩展器，它丰富了 ...
<!-- more -->

                                                                                                                                                                                         
  
   
  
 ![Test](https://oscimg.oschina.net/oscnet/4d2e3f5d-88d2-41fd-998b-1ef5dd391759.jpg  '总结18个 webpack 插件，总会有你想要的！') 
  
  作者：lzg9527 
  https://juejin.cn/post/6844904193589772301 
  
  
  
  何为插件(Plugin)？专注处理 webpack 在编译过程中的某个特定的任务的功能模块，可以称为插件。 
  Plugin 是一个扩展器，它丰富了 webpack 本身，针对是 loader 结束后，webpack 打包的整个过程，它并不直接操作文件，而是基于事件机制工作，会监听 webpack 打包过程中的某些节点，执行广泛的任务。 
  Plugin 的特点 
   
    
    
      是一个独立的模块 
     
    
    
      模块对外暴露一个 js 函数 
     
    
    
      函数的原型 
      ```java 
  (prototype)
  ```  上定义���一个注入 
      ```java 
  compiler
  ```  对象的 
      ```java 
  apply
  ``` 方法 
      ```java 
  apply
  ```  函数中需要有通过 
      ```java 
  compiler
  ```  对象挂载的 
      ```java 
  webpack
  ```  事件钩子，钩子的回调中能拿到当前编译的 
      ```java 
  compilation
  ```  对象，如果是异步编译插件的话可以拿到回调 
      ```java 
  callback
  ```  
     
    
    
      完成自定义子编译流程并处理 
      ```java 
  complition
  ```  对象的内部数据 
     
    
    
      如果异步编译插件的话，数据处理完成后执行 
      ```java 
  callback
  ```  回调。 
     
   
  下面介绍 18 个常用的 webpack 插件。 
  本文在gitthub做了收录： 
  https://github.com/Michael-lzg/my--article/blob/master/webpack/%E6%80%BB%E7%BB%9318%E4%B8%AAwebpack%E6%8F%92%E4%BB%B6.md 
   
  #### HotModuleReplacementPlugin 
  模块热更新插件。 ```java 
  Hot-Module-Replacement
  ```  的热更新是依赖于  ```java 
  webpack-dev-server
  ``` ，后者是在打包文件改变时更新打包文件或者 reload 刷新整个页面， ```java 
  HRM
  ```  是只更新修改的部分。 
   ```java 
  HotModuleReplacementPlugin
  ``` 是 ```java 
  webpack
  ``` 模块自带的，所以引入 ```java 
  webpack
  ``` 后，在 ```java 
  plugins
  ``` 配置项中直接使用即可。 
   ```java 
  const webpack = require('webpack')plugins: [  new webpack.HotModuleReplacementPlugin(), // 热更新插件]
  ```  
   
  #### html-webpack-plugin 
  生成 html 文件。将 webpack 中 ```java 
  entry
  ``` 配置的相关入口  ```java 
  chunk
  ```  和  ```java 
  extract-text-webpack-plugin
  ``` 抽取的 css 样式 插入到该插件提供的 ```java 
  template
  ``` 或者 ```java 
  templateContent
  ``` 配置项指定的内容基础上生成一个 html 文件，具体插入方式是将样式 ```java 
  link
  ``` 插入到 ```java 
  head
  ``` 元素中， ```java 
  script
  ``` 插入到 ```java 
  head
  ``` 或者 ```java 
  body
  ``` 中。 
   ```java 
  const HtmlWebpackPlugin = require('html-webpack-plugin')plugins: [  new HtmlWebpackPlugin({    filename: 'index.html',    template: path.join(__dirname, '/index.html'),    minify: {      // 压缩HTML文件      removeComments: true, // 移除HTML中的注释      collapseWhitespace: true, // 删除空白符与换行符      minifyCSS: true, // 压缩内联css    },    inject: true,  }),]
  ```  
  inject 有四个选项值 
   
    
    
      true：默认值， 
      ```java 
  script
  ```  标签位于 
      ```java 
  html
  ```  文件的 
      ```java 
  body
  ```  底部 
     
    
    
      body： 
      ```java 
  script
  ```  标签位于 
      ```java 
  html
  ```  文件的 
      ```java 
  body
  ```  底部（同 true） 
     
    
    
      head： 
      ```java 
  script
  ```  标签位于 
      ```java 
  head
  ```  标签内 
     
    
    
      false：不插入生成的 js 文件，只是单纯的生成一个 
      ```java 
  html
  ```  文件 
     
   
  多页应用打包 
  有时，我们的应用不一定是一个单页应用，而是一个多页应用，那么如何使用 webpack 进行打包呢。 
   ```java 
  const path = require('path')const HtmlWebpackPlugin = require('html-webpack-plugin')module.exports = {  entry: {    index: './src/index.js',    login: './src/login.js',  },  output: {    path: path.resolve(__dirname, 'dist'),    filename: '[name].[hash:6].js',  },  //...  plugins: [    new HtmlWebpackPlugin({      template: './public/index.html',      filename: 'index.html', //打包后的文件名    }),    new HtmlWebpackPlugin({      template: './public/login.html',      filename: 'login.html', //打包后的文件名    }),  ],}
  ```  
  如果需要配置多个  ```java 
  HtmlWebpackPlugin
  ``` ，那么  ```java 
  filename
  ```  字段不可缺省，否则默认生成的都是  ```java 
  index.html
  ``` 。 
  但是有个问题， ```java 
  index.html
  ```  和  ```java 
  login.html
  ```  会发现，都同时引入了  ```java 
  index.f7d21a.js
  ```  和  ```java 
  login.f7d21a.js
  ``` ，通常这不是我们想要的，我们希望  ```java 
  index.html
  ```  中只引入  ```java 
  index.f7d21a.js
  ``` ， ```java 
  login.html
  ```  只引入  ```java 
  login.f7d21a.js
  ``` 。 
   ```java 
  HtmlWebpackPlugin
  ```  提供了一个  ```java 
  chunks
  ```  的参数，可以接受一个数组，配置此参数仅会将数组中指定的 js 引入到 html 文件中 
   ```java 
  module.exports = {  //...  plugins: [    new HtmlWebpackPlugin({      template: './public/index.html',      filename: 'index.html', //打包后的文件名      chunks: ['index'],    }),    new HtmlWebpackPlugin({      template: './public/login.html',      filename: 'login.html', //打包后的文件名      chunks: ['login'],    }),  ],}
  ```  
  这样执行  ```java 
  npm run build
  ``` ，可以看到  ```java 
  index.html
  ```  中仅引入了 index 的 js 文件，而  ```java 
  login.html
  ```  中也仅引入了 login 的 js 文件。 
   
  #### clean-webpack-plugin 
   ```java 
  clean-webpack-plugin
  ```  用于在打包前清理上一次项目生成的 bundle 文件，它会根据  ```java 
  output.path
  ```  自动清理文件夹；这个插件在生产环境用的频率非常高，因为生产环境经常会通过 hash 生成很多 bundle 文件，如果不进行清理的话每次都会生成新的，导致文件夹非常庞大。 
   ```java 
  const { CleanWebpackPlugin } = require('clean-webpack-plugin')plugins: [  new HtmlWebpackPlugin({    template: path.join(__dirname, '/index.html'),  }),  new CleanWebpackPlugin(), // 所要清理的文件夹名称]
  ```  
   
  #### extract-text-webpack-plugin 
  将 css 成生文件，而非内联 。该插件的主要是为了抽离 css 样式,防止将样式打包在 js 中引起页面样式加载错乱的现象 
   ```java 
  const ExtractTextPlugin = require('extract-text-webpack-plugin')plugins: [  // 将css分离到/dist文件夹下的css文件夹中的index.css  new ExtractTextPlugin('css/index.css'),]
  ```  
   
  #### mini-css-extract-plugin 
  将 CSS 提取为独立的文件的插件，对每个包含 css 的 js 文件都会创建一个 CSS 文件，支持按需加载 css 和  ```java 
  sourceMap
  ``` 。只能用在 webpack4 中，对比另一个插件 extract-text-webpack-plugin 有以下特点: 
   
    
    
      异步加载 
     
    
    
      不重复编译，性能更好 
     
    
    
      更容易使用 
     
    
    
      只针对 CSS 
     
   
  这个插件应该只用在生产环境配置，并且在  ```java 
  loaders
  ```  链中不使用  ```java 
  style-loader
  ``` , 而且这个插件暂时不支持 HMR 
   ```java 
  const MiniCssExtractPlugin = require('mini-css-extract-plugin')module.exports = {  module: {    rules: [      {        test: /\.(le|c)ss$/,        use: [          {            loader: MiniCssExtractPlugin.loader,            options: {              publicPath: '../',            },          },          'css-loader',          'postcss-loader',          'less-loader',        ],      },    ],  },  plugins: [    new MiniCssExtractPlugin({      filename: 'css/[name].[contenthash:8].css',      chunkFilename: 'css/[id].[contenthash:8].css',    }),  ],}
  ```  
   
  #### purifycss-webpack 
  有时候我们 css 写得多了或者重复了，这就造成了多余的代码，我们希望在生产环境进行去除。 
   ```java 
  const path = require('path')const PurifyCssWebpack = require('purifycss-webpack') // 引入PurifyCssWebpack插件const glob = require('glob') // 引入glob模块,用于扫描全部html文件中所引用的cssmodule.exports = merge(common, {  plugins: [    new PurifyCssWebpack({      paths: glob.sync(path.join(__dirname, 'src/*.html')),    }),  ],})
  ```  
   
  #### optimize-css-assets-webpack-plugin 
  我们希望减小 css 打包后的体积，可以用到  ```java 
  optimize-css-assets-webpack-plugin
  ``` 。 
   ```java 
  const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin") // 压缩css代码optimization: {  minimizer: [    // 压缩css    new OptimizeCSSAssetsPlugin({})  ]
  ```  
   
  #### UglifyJsPlugin 
   ```java 
  uglifyJsPlugin
  ```  是  ```java 
  vue-cli
  ```  默认使用的压缩代码方式，用来对 js 文件进行压缩，从而减小 js 文件的大小，加速 load 速度。它使用的是单线程压缩代码，打包时间较慢，所以可以在开发环境将其关闭，生产环境部署时再把它打开。 
   ```java 
  const UglifyJsPlugin = require('uglifyjs-webpack-plugin')plugins: [  new UglifyJsPlugin({    uglifyOptions: {      compress: {        warnings: false      }    },    sourceMap: true,  //是否启用文件缓存    parallel: true   //使用多进程并行运行来提高构建速度  })
  ```  
   
  #### ParallelUglifyPlugin 
  开启多个子进程，把对多个文件压缩的工作分别给多个子进程去完成，每个子进程其实还是通过  ```java 
  UglifyJS
  ```  去压缩代码，但是变成了并行执行。 
   ```java 
  const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin')plugins: [  new ParallelUglifyPlugin({    //cacheDir 用于配置缓存存放的目录路径。    cacheDir: '.cache/',    sourceMap: true,    uglifyJS: {      output: {        comments: false,      },      compress: {        warnings: false,      },    },  }),]
  ```  
   
  #### terser-webpack-plugin 
  Webpack4.0 默认是使用  ```java 
  terser-webpack-plugin
  ```  这个压缩插件，在此之前是使用  ```java 
  uglifyjs-webpack-plugin
  ``` ，两者的区别是后者对 ES6 的压缩不是很好，同时我们可以开启  ```java 
  parallel
  ```  参数，使用多进程压缩，加快压缩。 
   ```java 
  const TerserPlugin = require('terser-webpack-plugin') // 压缩js代码optimization: {  minimizer: [    new TerserPlugin({      parallel: 4, // 开启几个进程来处理压缩，默认是 os.cpus().length - 1      cache: true, // 是否缓存      sourceMap: false,    }),  ]}
  ```  
   
  #### NoErrorsPlugin 
  报错但不退出 webpack 进程。编译出现错误时，使用  ```java 
  NoEmitOnErrorsPlugin
  ```  来跳过输出阶段。这样可以确保输出资源不会包含错误。 
   ```java 
  plugins: [new webpack.NoEmitOnErrorsPlugin()]
  ```  
   
  #### compression-webpack-plugin 
  所有现代浏览器都支持  ```java 
  gzip
  ```  压缩，启用  ```java 
  gzip
  ```  压缩可大幅缩减传输资源大小，从而缩短资源下载时间，减少首次白屏时间，提升用户体验。 
  gzip 对基于文本格式文件的压缩效果最好（如：CSS、JavaScript 和 HTML），在压缩较大文件时往往可实现高达 70-90% 的压缩率，对已经压缩过的资源（如：图片）进行 gzip 压缩处理，效果很不好。 
   ```java 
  const CompressionPlugin = require('compression-webpack-plugin')plugins: [  new CompressionPlugin({    // gzip压缩配置    test: /\.js$|\.html$|\.css/, // 匹配文件名    threshold: 10240, // 对超过10kb的数据进行压缩    deleteOriginalAssets: false, // 是否删除原文件  }),]
  ```  
  当然，这个方法还需要后端配置支持。 
   
  #### DefinePlugin 
  我们可以通过  ```java 
  DefinePlugin
  ```  可以定义一些全局的变量，我们可以在模块当中直接使用这些变量，无需作任何声明， ```java 
  DefinePlugin
  ```  是  ```java 
  webpack
  ```  自带的插件。 
   ```java 
  plugins: [  new webpack.DefinePlugin({    DESCRIPTION: 'This Is The Test Text.',  }),]// 直接引用console.log(DESCRIPTION)
  ```  
   
  #### ProvidePlugin 
  自动加载模块。任何时候，当  ```java 
  identifier
  ```  被当作未赋值的变量时， module 就会自动被加载，并且  ```java 
  identifier
  ```  会被这个 module 输出的内容所赋值。这是 webpack 自带的插件。 
   ```java 
  module.exports = {  resolve: {    alias: {      jquery: './lib/jquery',    },  },  plugins: [    //提供全局的变量，在模块中使用无需用require引入    new webpack.ProvidePlugin({      $: 'jquery',      React: 'react',    }),  ],}
  ```  
   
  #### DLLPlugin 
  这是在一个额外的独立的 webpack 设置中创建一个只有 dll 的  ```java 
  bundle(dll-only-bundle)
  ``` 。这个插件会生成一个名为  ```java 
  manifest.json
  ```  的文件，这个文件是用来让  ```java 
  DLLReferencePlugin
  ```  映射到相关的依赖上去的。 
  使用步骤如下 
  1、在 build 下创建  ```java 
  webpack.dll.config.js
  ```  
   ```java 
  const path = require('path')const webpack = require('webpack')module.exports = {  entry: {    vendor: [      'vue-router',      'vuex',      'vue/dist/vue.common.js',      'vue/dist/vue.js',      'vue-loader/lib/component-normalizer.js',      'vue',      'axios',      'echarts',    ],  },  output: {    path: path.resolve('./dist'),    filename: '[name].dll.js',    library: '[name]_library',  },  plugins: [    new webpack.DllPlugin({      path: path.resolve('./dist', '[name]-manifest.json'),      name: '[name]_library',    }),    // 建议加上代码压缩插件，否则dll包会比较大。    new webpack.optimize.UglifyJsPlugin({      compress: {        warnings: false,      },    }),  ],}
  ```  
  2、在  ```java 
  webpack.prod.conf.js
  ```  的 plugin 后面加入配置 
   ```java 
  new webpack.DllReferencePlugin({  manifest: require('../dist/vendor-manifest.json'),})
  ```  
  3、 ```java 
  package.json
  ``` 文件中添加快捷命令 ```java 
  (build:dll)
  ```  
   ```java 
    "scripts": {    "dev": "webpack-dev-server --inline --progress --config build/webpack.dev.conf.js",    "start": "npm run dev",    "lint": "eslint --ext .js,.vue src",    "build": "node build/build.js",    "build:dll": "webpack --config build/webpack.dll.conf.js"  }
  ```  
  生产环境打包的时候先 ```java 
  npm run build:dll
  ``` 命令会在打包目录下生成  ```java 
  vendor-manifest.json
  ```  文件与 vendor.dll.js 文件。然后 ```java 
  npm run build
  ``` 生产其他文件。 
  4、根目录下的入口  ```java 
  index.html
  ```  加入引用 
   ```java 
  <script type="text/javascript" src="./vendor.dll.js"></script>
  ```  
   
  #### HappyPack 
   ```java 
  HappyPack
  ```  能让 webpack 把任务分解给多个子进程去并发的执行，子进程处理完后再把结果发送给主进程。要注意的是  ```java 
  HappyPack
  ```  对  ```java 
  file-loader
  ``` 、 ```java 
  url-loader
  ```  支持的不友好，所以不建议对该 loader 使用。 
  1、HappyPack 插件安装 
   ```java 
  npm i -D happypack
  ```  
  2、 ```java 
  webpack.base.conf.js
  ```  文件对 module.rules 进行配置 
   ```java 
  module: {  rules: [    {      test: /\.js$/,      use: ['happypack/loader?id=babel'],      include: [resolve('src'), resolve('test')],      exclude: path.resolve(__dirname, 'node_modules'),    },    {      test: /\.vue$/,      use: ['happypack/loader?id=vue'],    },  ]}
  ```  
  3、在生产环境  ```java 
  webpack.prod.conf.js
  ```  文件进行配置 
   ```java 
  const HappyPack = require('happypack')// 构造出共享进程池，在进程池中包含5个子进程const HappyPackThreadPool = HappyPack.ThreadPool({ size: 5 })plugins: [  new HappyPack({    // 用唯一的标识符id，来代表当前的HappyPack是用来处理一类特定的文件    id: 'babel',    // 如何处理.js文件，用法和Loader配置中一样    loaders: ['babel-loader?cacheDirectory'],    threadPool: HappyPackThreadPool,  }),  new HappyPack({    id: 'vue', // 用唯一的标识符id，来代表当前的HappyPack是用来处理一类特定的文件    loaders: [      {        loader: 'vue-loader',        options: vueLoaderConfig,      },    ],    threadPool: HappyPackThreadPool,  }),]
  ```  
  注意，当项目较小时，多线程打包反而会使打包速度变慢。 
   
  #### copy-webpack-plugin 
  我们在  ```java 
  public/index.html
  ```  中引入了静态资源，但是打包的时候 webpack 并不会帮我们拷贝到 dist 目录，因此  ```java 
  copy-webpack-plugin
  ```  就可以很好地帮我做拷贝的工作了。 
   ```java 
  const CopyWebpackPlugin = require('copy-webpack-plugin')module.exports = {  plugins: [    new CopyWebpackPlugin({      patterns: [        {          from: 'public/js/*.js',          to: path.resolve(__dirname, 'dist', 'js'),          flatten: true,        },      ],    }),  ],}
  ```  
   
  #### IgnorePlugin 
  这是 webpack 内置插件，它的作用是：忽略第三方包指定目录，让这些指定目录不要被打包进去。 
  比如我们要使用  ```java 
  moment
  ```  这个第三方依赖库，该库主要是对时间进行格式化，并且支持多个国家语言。虽然我设置了语言为中文，但是在打包的时候，是会将所有语言都打包进去的。这样就导致包很大，打包速度又慢。对此，我们可以用  ```java 
  IgnorePlugin
  ```  使得指定目录被忽略，从而使得打包变快，文件变小。 
   ```java 
  const Webpack = require('webpack')plugins: [  //moment这个库中，如果引用了./locale/目录的内容，就忽略掉，不会打包进去  new Webpack.IgnorePlugin(/\.\/locale/, /moment/),]
  ```  
  我们虽然按照上面的方法忽略了包含 ```java 
  ’./locale/'
  ``` 该字段路径的文件目录，但是也使得我们使用的时候不能显示中文语言了，所以这个时候可以手动引入中文语言的目录。 
   ```java 
  import moment from 'moment'//手动引入所需要的语言包import 'moment/locale/zh-cn'moment.locale('zh-cn')let r = moment().endOf('day').fromNow()console.log(r)
  ```  
  
   
  
  
   
   
   
  
  
     
   
   
    
    
    
     
     
     
      
      
      
       
       
       
        
        
         
          
           
            
             
              
               
                
                 
                  
                  请各位帅哥美女多多支持帅编，回复 ```java 
  “1”
  ``` 即可加入前端技术交流群，回复 ```java 
  "2"
  ``` 即可领取 500G 前端干货 
                   
                  ![Test](https://oscimg.oschina.net/oscnet/4d2e3f5d-88d2-41fd-998b-1ef5dd391759.jpg  '总结18个 webpack 插件，总会有你想要的！') 
                  
                 
                
               
              
             
            
           
          
        
       
       
       
      
      
      
     
     
     
    
    
    
   
   
   
   
   
   
    
    
    
     
     
     ![Test](https://oscimg.oschina.net/oscnet/4d2e3f5d-88d2-41fd-998b-1ef5dd391759.jpg  '总结18个 webpack 插件，总会有你想要的！')觉得不错，请点个在看呀
    
    
    
   
   
    
 
本文分享自微信公众号 - 前端开发社区（pt1173179243）。如有侵权，请联系 support@oschina.cn 删除。本文参与“OSC源创计划”，欢迎正在阅读的你也加入，一起分享。
                                        