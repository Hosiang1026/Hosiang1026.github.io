---
title: 推荐系列-Vue使用ECharts完成2020年全国各地区GDP总量大数据可视化面板（附源码）
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 878
cover_picture: 'https://img-blog.csdnimg.cn/20210412092055140.png'
abbrlink: 57101def
date: 2021-04-15 10:16:57
---

&emsp;&emsp;就在上周全国各地区GDP总量上了热搜，一时性起就想写个大数据面板展示 既然决定要写，那么就要考虑到图表和图标的使用，这里我是用了我最熟悉的两大框架ECharts和element-ui 一、我的构思步骤...
<!-- more -->

                                                                                                                                                                                        就在上周全国各地区GDP总量上了热搜，一时性起就想写个大数据面板展示 既然决定要写，那么就要考虑到图表和图标的使用，这里我是用了我最熟悉的两大框架ECharts和element-ui 
##### 一、我的构思步骤 
###### 1. 确定主题色彩 
首先我们通过ECharts主题定制确定我们的总体图表颜色 ![Test](https://img-blog.csdnimg.cn/20210412092055140.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQyNzgzNjU0,size_16,color_FFFFFF,t_70  'Vue使用ECharts完成2020年全国各地区GDP总量大数据可视化面板（附源码）') 
也可以自行定制，替换掉我里面的macarons.json文件就行了 
![Test](https://img-blog.csdnimg.cn/20210412092055140.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQyNzgzNjU0,size_16,color_FFFFFF,t_70  'Vue使用ECharts完成2020年全国各地区GDP总量大数据可视化面板（附源码）') 
 
 ```java 
  import macarons from './macarons.json' // 引入默认主题

    export default {
        data () {
            return {
                chart: null
            }
        },
        mounted () {
            this.$echarts.registerTheme('macarons', macarons); // 覆盖默认主题
            this.initChart();
        },
        methods: {
            initChart () {
                // 初始化echart
                this.chart = this.$echarts.init(this.$el, 'macarons')
                this.chart.setOption(this.options, true)
            }
        }
    }

  ``` 
  
###### 2. 选择合适的图表 
这里我使用了折线图、柱状图、饼图、地图、滚动列表，重点说一下地图和滚动列表 地图的话我们需要找该地区的json或js地图数据文件引入或用其他地图插件（如百度地图），但我个人感觉这种轮廓地图要好看点。 ![Test](https://img-blog.csdnimg.cn/20210412092055140.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQyNzgzNjU0,size_16,color_FFFFFF,t_70  'Vue使用ECharts完成2020年全国各地区GDP总量大数据可视化面板（附源码）') 
我文件里下载了一个中国省区地图，和地级市地图，需要可以自取，我用到的是地级市地图 
 
 ```java 
  import chinaCityJson from './china-cities.json'
	export default {
		methods: {
            initChart() {
            	//...关键语句
                this.$echarts.registerMap("china", chinaCityJson);
            }
        }
	}

  ``` 
  
滚动列表我使用的是vue-seamless-scroll，因为我这里表格用了element-ui的一个表格，为了控制表头不滚动，我其实是写了两个表格，一个隐藏主体内容，一个隐藏表头，不想使用这个插件的可以参考我之前的文章Vue实现简单列表无限循环滚动（鼠标悬停）自己修改一个适合自己的滚动列表 vue-seamless-scroll组件参考代码： 
 
 ```java 
  import vueSeamlessScroll from 'vue-seamless-scroll'
export default {
    data() {},
    components: {    //组件
        vueSeamlessScroll
    },
    computed: {
     optionSingleHeight() {
       return {
        step: 0.2, // 数值越大速度滚动越快
        limitMoveNum: 2, // 开始无缝滚动的数据量 this.List.length
        hoverStop: true, // 是否开启鼠标悬停stop
        direction: 1, // 0向下 1向上 2向左 3向右
        openWatch: true, // 开启数据实时监控刷新dom
        singleHeight: 0, // 单步运动停止的高度(默认值0是无缝不停止的滚动) direction => 0/1
        singleWidth: 0, // 单步运动停止的宽度(默认值0是无缝不停止的滚动) direction => 2/3
        waitTime: 1000 // 单步运动停止的时间(默认值1000ms)
      }
    }
  },
}

  ``` 
  
###### 3. 样式美化 
我们可以插入一些图片和做一些动态边框、透明背景来实现美化界面 这里我只用了两张背景图做美化，那就是大屏的背景图和一线城市的背景图 这里考虑到打包到服务器会找不到背景图一些原因，我们把样式写到data里面 
 
 ```java 
  export default {
     data() {
         return {
             note: {
                 backgroundImage: "url(" + require("../assets/img/bg.jpg") + ")",
                 backgroundSize: "100% 100%",
             },
             box: {
                 margin:"10px 10px 10px 10px",
                 height: "2rem",
                 border: "0.25rem solid transparent",
                 borderImage: "url("+require("../assets/img/border.png")+") 51 32 18 66",
             },
         };
     },
}

  ``` 
  
###### 4. 大屏比例和防抖 
像素我用的是rem，这是一个CSS3的像素单位，主要是相对于HTML根元素变化，而px是相对于屏幕宽度变化，这里可以根据自己需求改动，宽度我是利用element-ui的Layout布局做的响应式，这里我最适应的屏幕大小是1920*944，但这是浏览器宽高，不适合大屏展示，所以我又写了一个全屏js，当然如果需要的话要调整一个布局高度，不然下面会因为内容没填满出现白边 
 
 ```java 
  export default {
    data() {
        return {
            fullscreen: false,
        };
    },
    methods:{
        // 全屏事件
        handleFullScreen() {
            let element = document.documentElement;
            if (this.fullscreen) {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitCancelFullScreen) {
                    document.webkitCancelFullScreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
            } else {
                if (element.requestFullscreen) {
                    element.requestFullscreen();
                } else if (element.webkitRequestFullScreen) {
                    element.webkitRequestFullScreen();
                } else if (element.mozRequestFullScreen) {
                    element.mozRequestFullScreen();
                } else if (element.msRequestFullscreen) {
                    // IE11
                    element.msRequestFullscreen();
                }
            }
            this.fullscreen = !this.fullscreen;
        },
    },
}

  ``` 
  
全屏主要是用于展厅大屏展示、公司大屏展示等 
防抖函数是利用时间差去销毁重构图表，以起到防止变化过快出现的抖动 
 
 ```java 
  /**
 * @param {Function} fn 防抖函数
 * @param {Number} delay 延迟时间
 */
export function debounce(fn, delay) {
  var timer;
  return function () {
    var context = this;
    var args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function () {
      fn.apply(context, args);
    }, delay);
  };
}

  ``` 
  
###### 5. 动态数据 
因为我这里只用了一年的数据，就没什么动态效果，如果有多个年份的数据可以做地区城市攀爬和动态数据，所以是只是做了随机展示地图上的数据内容 
 
 ```java 
  export default {
    methods:{
        // 开启定时器
        startInterval() {
            if (this.intervalId !== null) {
                clearInterval(this.intervalId);
            }
            this.intervalId = setInterval(() => {
                this.reSelectMapRandomArea();
            }, 2000);
        },
        // 重新随机选中地图区域
        reSelectMapRandomArea() {
            this.$nextTick(() => {
                let index = Math.floor(Math.random() * this.data.length);
                this.chart.dispatchAction({
                    type: 'showTip',
                    seriesIndex: 0,
                    dataIndex: index,
                });
                this.chart.dispatchAction({
                    type: 'select',
                    seriesIndex: 0,
                    dataIndex: index,
                });
            });
        },
        handleMapRandomSelect() {
            this.$nextTick(() => {
                setTimeout(() => {
                    this.reSelectMapRandomArea();
                }, 0);
                // 移入区域，清除定时器、取消之前选中并选中当前
                this.chart.on('mouseover', (params)=> {
                    clearInterval(this.intervalId);
                });
                // 移出区域重新随机选中地图区域，并开启定时器
                this.chart.on('globalout', ()=> {
                    this.reSelectMapRandomArea();
                    this.startInterval();
                });
                this.startInterval();
            });
        },
    },
}

  ``` 
  
##### 二、最��效��展示 
演示地址：http://zspt_sf.gitee.io/data-visualization-view 效果图： ![Test](https://img-blog.csdnimg.cn/20210412092055140.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQyNzgzNjU0,size_16,color_FFFFFF,t_70  'Vue使用ECharts完成2020年全国各地区GDP总量大数据可视化面板（附源码）') 动态效果图： ![Test](https://img-blog.csdnimg.cn/20210412092055140.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQyNzgzNjU0,size_16,color_FFFFFF,t_70  'Vue使用ECharts完成2020年全国各地区GDP总量大数据可视化面板（附源码）') 
##### 三、源码地址 
github地址：https://github.com/zsptsf/data-visualization 
gitee地址：https://gitee.com/zspt_sf/data-visualization
                                        