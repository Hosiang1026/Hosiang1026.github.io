---
title: 推荐系列-Vue起步（模板语法-循环语句）
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 814
cover_picture: 'https://api.ixiaowai.cn/gqapi/gqapi.php'
abbrlink: ca912390
date: 2021-04-15 09:48:03
---

&emsp;&emsp;Vue.js起步 每一个Vue应用都需要通过实例化Vue来实现。 实例：
<!-- more -->

                                                                                                                                                                                        #### Vue.js起步 
每一个Vue应用都需要通过实例化Vue来实现。 
 
 ```java 
  <script>
	var vm = new Vue({
		// 选项
	})
</script>	


  ``` 
  
实例： 
 
 ```java 
  <!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8" />
		<title></title>
		<script src="js/vue.js" type="text/javascript" charset="utf-8"></script>
	</head>
<body>
        
	<div id="demo1">
		<h1>site: {{site}}</h1>
		<h1>url: {{url}}</h1>
		<h1>{{details()}}</h1>
	</div>
		
	<script>
	
			var vm = new Vue({
				el: '#demo1',
				data:{
					site: 'Chenih',
					url: 'chenihsys.ltd',
					alexa: '10000'
				},
				methods: {
					details: function(){
						return this.site + " - 时间不在于你拥有多少，而在于你怎样使用。"
					}
				}
			})
			
	</script>
</body>
</html>

  ``` 
  
在Vue构造器中有一个el参数，它是DOM元素中的id。 
data用于定义属性。 
methods用户定义函数，可以通过return来返回数值。 
当一个 Vue 实例被创建时，它向 Vue 的响应式系统中加入了其 data 对象中能找到的所有的属性。当这些属性的值发生改变时，html 视图将也会产生相应的变化。 
#### Vue.js模板语法 
##### 插值 
文本 
数据绑定最常见的形式就是使用 
 ```java 
  {{ }}
  ``` 
 双大括号的文本插值。 
 
 ```java 
  <div id='app'>
    <p>
        {{ message }}
    </p>
</div>

  ``` 
  
Html 
使用v-html指令用于输出html代码： 
 
 ```java 
  <div id="app">
    <div v-html="message"></div>
</div>

<script>
	var vm = new Vue({
        el: '#app',
        data: {
            message: '<h1>Chenih</h1>'
        }
    })
</script>

  ``` 
  
属性 
HTML属性中的值应该使用v-bind指令 
实例：判断 use 的值，如果为 true 使用 class1 类的样式，否则不使用该类 
 
 ```java 
  <div id="app">
  <label for="r1">修改颜色</label><input type="checkbox" v-model="use" id="r1">
  <br><br>
  <div v-bind:class="{'class1': use}">
    v-bind:class 指令
  </div>
</div>

<script>
new Vue({
    el: '#app',
    data:{
    use: false
  }
});
</script>

  ``` 
  
 
##### 指令 
指令是带有v-前缀的特殊属性 
指令用于在表达式的值改变时，将某些行为应用到DOM上。 
 
 ```java 
  <div id="demo">
    <p v-if="seen">
        你可以看见我了
    </p>
</div>

<script>
	new Vue({
       	el: "#demo",
        data: {
            seen: true
        }
    })
</script>

  ``` 
  
 
 ```java 
  v-if
  ``` 
 指令将根据表达式seen的值（true或者false）来决定是否插入p元素。 
参数 
参数在指令后以冒号指明。 
 
 ```java 
  <div id="demo3">
		<pre>
			<a v-bind:href="url">Chenih</a>
		</pre>
</div>

<script>
	var vmmm = new Vue({
				el:"#demo3",
				data:{
					url: 'http://chenihsys.ltd'
				}
			})
</script>

  ``` 
  
href就是参数，告知v-bind指令将该元素的href属性与表达式url的值绑定。 
##### 用户输入 
在input输入框中我们可以使用v-model指令来实现双向数据绑定： 
 
 ```java 
  <div id="app">
    <p>
        {{message}}
    </p>
    <input v-model="message">
</div>

<script>
	new Vue({
        el: "#app",
        data: {
            message: "我就是信息"
        }
    })
</script>

  ``` 
  
 
 ```java 
  v-model
  ``` 
 指令用来在 input、select、textarea、checkbox、radio 等表单控件元素上创建双向数据绑定，根据表单上的值，自动更新绑定的元素的值。 
按钮的事件可以使用  
 ```java 
  v-on
  ``` 
  监听事件，并对用户的输入进行响应。 
 
 ```java 
  <div id="demo4">
		<p>{{ message }}</p>
		<input v-model="message"/>
		<button v-on:click="reverseMessage">反转字符串</button>
</div>

<script>
new Vue({
				el:"#demo4",
				data:{
					message: "Hahaha"
				},
				methods:{
					reverseMessage: function(){
						this.message = this.message.split('').reverse().join('')
					}
				}
			})
</script>

  ``` 
  
#### Vue.js 循环语句 
循环使用 v-for 指令。 
v-for 指令需要以 site in sites 形式的特殊语法， sites 是源数据数组并且 site 是数组元素迭代的别名。 
v-for 可以绑定数据到数组来渲染一个列表： 
 
 ```java 
  <div id="app">
  <ol>
    <li v-for="site in sites">
      {{ site.name }}
    </li>
  </ol>
</div>
 
<script>
new Vue({
  el: '#app',
  data: {
    sites: [
      { name: 'Runoob' },
      { name: 'Google' },
      { name: 'Taobao' }
    ]
  }
})
</script>

  ``` 
 
                                        