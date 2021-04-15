---
title: 推荐系列-初入项目，JS可能遇到的问题优化以及处理方法
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 885
cover_picture: ''
abbrlink: 130ca4f
date: 2021-04-15 09:08:53
---

&emsp;&emsp;简介： 在刚进入项目时候，很可能遇到一些问题，我这里分成了三个模块，第一个模块是ES6的一些方法的妙用，整理了一些可能会被人忽略的函数以及一些参数的使用；第二个模块是有关if else的一...
<!-- more -->

                                                                                                                                                                                        简介： 在刚进入项目时候，很可能遇到一些问题，我这里分成了三个模块，第一个模块是ES6的一些方法的妙用，整理了一些可能会被人忽略的函数以及一些参数的使用；第二个模块是有关if else的一些技巧，说来也是刚到阿里园区受到一位老哥影响，做了一些学习，对一些使用做了下整理；最后一个模块是有关react hook的入门，对于hook来说，最常用的一些地方就是组件传值以及组件传方法，在这里我对这部分所涉及的各种情况做了一些整理，希望对大家有所帮助，当然我也是能力有限，一些笔误或者使用上不够规范的欢迎留言或私我讨论。 
 
### ES6篇 
 
### 1.Array.from() 
为什么先提到Array.from()，在开发中发现数组才是最常见的一种格式，不仅是在渲染列表，表格，还是在数据请求上，都有着重要的意义。 
首先，先看看Array.from()定义，它可以将一个类数组或可遍历对象转成一个真实的数组。所谓类数组，就是我们在非箭头函数中所属的arguments类型等等；可遍历对象，便如Map类型等等。 
使用规则为 
 ```java 
  Array.from(arrayLike, mapFn, thisArg)
/*
arrayLike: 必选，1、类数组(argumentg)2、可迭代对象(set,map)。
mapFn: 可选，相当于Array.from(arrayLike).map(mapFn, thisArg)。
thisArg: 可选，执行回调函数mapFn时候的this对象。非常有用，利于解耦。可以把被处理的数据和对象分离，thisArg中定义处理函数handle，用来在mapFn中返回调用handle之后的结果。
*/
  ```  
功能上他能实现什么呢？ 
 
### 1.将string类型转为数组 
  
 ```java 
  const str = 'wangjingyu';
const arr = Array.from(str);
console.log(arr);
// (10) ["w", "a", "n", "g", "j", "i", "n", "g", "y", "u"]
  ```  
 
### 2.将Set类型转为数组 
 ```java 
  const set = new Set([1,2,3]);
const arr = Array.from(set);
console.log(arr);
// (3) [1, 2, 3]
  ```  
 
### 3.将Map类型转为数组 
 ```java 
  const map = new Map([[1,2,3],[4,5,6]]);
const arr = Array.from(map);
console.log(arr);
// [ [ 1, 2, 3 ], [ 4, 5, 6 ] ]
  ```  
 
### 4.将类数组arguments转为数组 
 ```java 
  const fun = function(a,b,c){
    const args = Array.from(arguments);
    console.log(args)
}
fun(1,2,3)
// [ 1, 2, 3 ]
  ```  
 
### 5.使用第二个参数构造函数返回新数组 
 ```java 
  const newArr = Array.from([1,2,3], value => value * value);
console.log(newArr);
// [ 1, 4, 9 ]
const lenArr = Array.from({length: 10}, (v, i) => i + 10);
console.log(lenArr);  
// [10, 11, 12, 13, 14,15, 16, 17, 18, 19]
  ```  
 
### 6.数组去重合并 
 ```java 
  const arr_a = [1,2,3];
const arr_b = [2,3,4];
const arr_c = [3,4,5];
const combine = function(a,b,c){
    const arrAll = [].concat.apply([],arguments);
    console.log(Array.from(new Set(arrAll)))
}
combine(arr_a,arr_b,arr_c);
// [ 1, 2, 3, 4, 5 ]
  ```  
 
### 7.获取数组对象中的某指定属性的所有值 
 ```java 
  const cities = [
    { name: 'Paris', visited: 'no' },
    { name: 'Lyon', visited: 'no' },  
    { name: 'Marseille', visited: 'yes' },  
    { name: 'Rome', visited: 'yes' },  
    { name: 'Milan', visited: 'no' },  
    { name: 'Palermo', visited: 'yes' },  
    { name: 'Genoa', visited: 'yes' },  
    { name: 'Berlin', visited: 'no' },  
    { name: 'Hamburg', visited: 'yes' },  
    { name: 'New York', visited: 'yes' }
 ];
console.log(Array.from(cities, ({name}) => name))
// (10) ["Paris", "Lyon", "Marseille", "Rome", "Milan", "Palermo", "Genoa", "Berlin", "Hamburg", "New York"]
  ```  
 
### 8.采用第三个参数进行数据和对象抽离 
 ```java 
  const arr = [1,2,3,4,5];
const obj = {
    double: x => x * 2,
    triple: x => x * 3,
    sqrt: x => x * x,
}
console.log(Array.from(arr, function(x){ return this.triple(x) }, obj))
// [ 3, 6, 9, 12, 15 ]
  ```  
通过Array.from()方法，我们可以使用更少的代码完成我们需要做到的功能。 
 
### 2.解构原始数据 
我们大多数在使用对象时候，会将一个大对象分出小的属性，属性值来使用，其中，我们可能会觉得某一个对象里面的属性值太多，而我们只需要其中的若干个，这里我们就可以使用这种方法来做解构。 
 ```java 
  const rawUser = {  
    name: 'WangJingyu',
    surname: 'Jack',  
    email: 'wangjingyu@gmail.com',  
    displayName: 'WhmJack',  
    joined: '2021-03-04',  
    image: 'github',  
    followers: 1000
}
let user = {}, userDetails = {};
({name:user.name,surname:user.surname,...userDetails} = rawUser)
console.log(user,userDetails)
// { name: 'WangJingyu', surname: 'Jack' }  
// {
//   email: 'wangjingyu@gmail.com',
//   displayName: 'WhmJack',
//   joined: '2021-03-04',
//   image: 'github',
//   followers: 1000
// }
  ```  
这样我们就可以把自己需要的某几个对象属性取出来来使用了。 
 
### 3.动态属性名 
在ES5时代，我们获取属性一般有两种方式，要不是直接.xxx，要不就是定义变量名去通过[]获取： 
 ```java 
  const person = {
    name : 'wjy',
    age : 23,
}
const attName = 'name';
console.log(person[attName],person.name)  
// wjy wjy
  ```  
我们可以把attName作为变量名，但是只能在对象之外对他做赋值操作，并不能做到让person对象的属性动态变化。可能有的人要说，那我把那么当成一个变量就好了，就比如： 
 ```java 
  const attName = 'name';
const person = {
    attName : 'wjy',
    age : 23,
}
console.log(person[attName],person.attName)  
// undefined wjy
  ```  
好像不太行的样子，我们来看看原因，person.attName获取的属性就是字符串attName，所以可以获取到，而person[attName]获取的则是person.name，但是我们的attName在person对象里只是一个字符串，并不是一个变量，所以获取不到，那么怎么办呢？ 
  
ES6中提出了把属性名用[]包起来的方法，在括号中就可以使用前面定义的变量了。就是： 
 ```java 
  const attName = 'sex';
const person = {
    name : 'wjy',
    [attName] : 'male',
    age : 23,
}
console.log(person[attName])
// male
  ```  
这样我们就可以动态设定对象的属性名了。   
 
### 4.symbol的对象使用 
作为ES6新提出的变量类型，虽然symbol属性已经出来很久了，但是很多时候我们还是很少使用它，这里提到一种小小的用法，仅仅作为抛砖，更多的方法等着各位dalao来补充扩展。 
  
对于一个已经存在的对象，里面可能存在一个属性key，名字暂且为'id',在多人开发时候可能会有其他人也对此对象做了内部属性命名��id的���作，或者说他继承了这个对象，并且对这个对象做了重写，那么这样会导致这个对象的id被覆盖。从而出现一些问题。这个时候就可以让symbol大显身手了。 
 ```java 
  const custId = Symbol.for('id');
const obj = {
    [custId] : '0100110100',
    'id' : '23322232',
    'iq' : '150',
};
console.log(obj);
// { id: '23322232', iq: '150', [Symbol(id)]: '0100110100' }
  ```  
那么问题来了，我们怎么把他取出来呢，如果采用常规的for循环，结果是这样的： 
 ```java 
  for(let [key,value] of Object.entries(obj)){
    console.log('let of',key,value)
}
// let of id 23322232
// let of iq 150
  ```  
确实不太行，我们可以用symbol的api去获取： 
 ```java 
  Object.getOwnPropertySymbols(obj).forEach((item) => {
    console.log(obj[item])
})
// 0100110100
  ```  
确实是可以的，但是如果我们想for循环整体obj呢，这时候可以使用反射Reflect的相关api： 
 ```java 
  Reflect.ownKeys(obj).forEach(item => {
    console.log(obj[item])
})
// 23322232
// 150
// 0100110100
  ```  
这样我们就可以把值取出来了，并且达到了我们的效果。 
 
### 分支优化篇 
这一块主要是针对if else做的一个优化方法策略的整理总结，在做项目中，难免会出现越来越多的判断情况，而我们也需要根据这些判断数值来做选择，两个三个分支选择还好，如果选择多了起来，那么我们可能就会出现这样的情况： 
 ```java 
  const ifOperation = (status) => {
  if(status === 1){
    consoleLog('one');
    consoleRun('oneEvent');
  } else if(status === 2){
    consoleLog('two');
    consoleRun('TwoEvent');
  } else if(status === 222){
    consoleLog('two');
    consoleRun('TwoEvent');
  } else if(status === 3){
    consoleLog('three');
    consoleRun('ThreeEvent');
  } else if(status === 4){
    consoleLog('four');
    consoleRun('FourEvent');
  } else {
    consoleLog('other');
    consoleRun('OtherEvent');
  }
}
  ```  
虽然只有六个分支，但是已经看起来臃肿不堪了，可能我们可以把某一个else if变得厚重一下？ 
 ```java 
  const ifOperation = (status) => {
  if(status === 1){
    consoleLog('one');
    consoleRun('oneEvent');
  } else if(status === 2 || status === 222){
    consoleLog('two');
    consoleRun('TwoEvent');
  } else if(status === 3){
    consoleLog('three');
    consoleRun('ThreeEvent');
  } else if(status === 4){
    consoleLog('four');
    consoleRun('FourEvent');
  } else {
    consoleLog('other');
    consoleRun('OtherEvent');
  }
}
  ```  
看起来可能好一些，不过更多的人应该会选择switch case，那么它就会变成： 
 ```java 
  const switchOperation = (status) => {
  switch(status){
    case 1:
      consoleLog('one');
      consoleRun('oneEvent');
      break;
    case 2:
    case 222:
      consoleLog('two');
      consoleRun('TwoEvent');
      break;
    case 3:
      conosleLog('three');
      consoleRun('ThreeEvent');
      break;
    case 4:
      consoleLog('four');
      consoleRun('FourEvent');
      break;
    default:
      consoleLog('other');
      consoleRun('OtherEvent');
      break;
  }
}
  ```  
在工作中其实这种已经是我们的常态了，不过我们可以更进一步，借助其他数据类型帮助我们简化代码，比如用个对象存储if else的各种情况： 
 ```java 
  const obj = {
  1 : ['one','oneEvent'],
  2 : ['two','TwoEvent'],
  3 : ['three','ThreeEvent'],
  4 : ['four','FourEvent'],
  222 : ['two','TwoEvent'],
  'default' : ['other', 'OtherEvent']
}
const consoleLog = (status) => {
  console.log(status);
}
const consoleRun = (status) => {
  console.log(status);
}
const objOperation = (status) => {
  let operation = obj[status] || obj['default'];
  consoleLog(operation[0]);
  consoleRun(operation[1])
}
objOperation('222')
  ```  
这样就清爽很多了，比如我在做播放录音点击修改倍速时候可以写得更加精简，比如： 
 ```java 
  // 设置点击修改倍速条件
const obj = {
    1: [1.5],
    1.5: [2],
    2: [0.5],
    0.5: [1],
};
const objOperation = (status) => {
    const operation = obj[status];
    const speedChoose = operation[0];
    setSpeed(speedChoose);
};
objOperation(speed);
  ```  
当然，如果你不想用Object表示，你还可以用Map来表示呀： 
 ```java 
  const map = new Map([
  [1 , ['one','oneEvent']],
  [2 , ['two','TwoEvent']],
  [3 , ['three','ThreeEvent']],
  [4 , ['four','FourEvent']],
  [222 , ['two','TwoEvent']],
  ['default' , ['other', 'OtherEvent']]
])
const consoleLog = (status) => {
  console.log(status);
}
const consoleRun = (status) => {
  console.log(status);
}
const mapOperation = (status) => {
  let operation = map.get(status) || map.get('default');
  consoleLog(operation[0]);
  consoleRun(operation[1])
}
mapOperation(222)
  ```  
不过，在Object对象和Map对象都能使用的情况下，我们优先选择哪种呢？ 
 
 
现在我们可能需要做更多的事情，比如我们现在有两层判断了，不仅仅需要判断条件a，还要判断条件b，比如： 
 ```java 
  /*
 * param {number} status 表示状态
 * param {string} roommate 表示舍友名称
*/
const ifOperation = (status,roommate) => {
    if(roommate === 'ly'){
        if(status === 1){
            consoleLog('lyone');
        } else if(status === 2){
            consoleLog('lytwo');
        } else if(status === 3){
            consoleLog('lythree');
        } else if(status === 4){
            consoleLog('lyfour');
        } else {
            consoleLog('sbother');
        }
    } else if(roommate === 'wjy'){
        if(status === 1){
            consoleLog('wjyone');
        } else if(status === 2){
            consoleLog('wjytwo');
        } else if(status === 3){
            consoleLog('wjythree');
        } else if(status === 4){
            consoleLog('wjyfour');
        } else {
            consoleLog('sbother');
        }
    } else {
        consoleLog('sbother');
    }
}
  ```  
这。。。看起来也太长了，如果说单层判断还可以接受，那么这种长度的判断，看起来确实有点难受，不过这种情况也很普遍，可能我遇到了这样的问题，也会首先采用这种模式去进行代码的编写。但是我们要知道，一旦判断层级多了一级，那么我们增加的条件就是2(n)倍，这时候要怎么去写呢？我们仍然可以采用map或者object去处理： 
 ```java 
  const map = new Map([
    ['ly_1', () => {consoleLog('lyone');consoleRun('ly_1')}],
    ['ly_2', () => {consoleLog('lytwo');consoleRun('ly_2')}],
    ['ly_3', () => {consoleLog('lythree');consoleRun('ly_3')}],
    ['ly_4', () => {consoleLog('lyfour');consoleRun('ly_4')}],
    ['wjy_1', () => {consoleLog('wjyone');consoleRun('wjy_1')}],
    ['wjy_2', () => {consoleLog('wjytwo');consoleRun('wjy_2')}],
    ['wjy_3', () => {consoleLog('wjythree');consoleRun('wjy_3')}],
    ['wjy_4', () => {consoleLog('wjyfour');consoleRun('wjy_4')}],    
    ['default', () => {consoleLog('sbother');consoleRun('other roommate')}],
])
const mapOperation = (status,roommate)=>{
  let mapAction = map.get(`${roommate}_${status}`) || map.get('default')
  mapAction.call(this)
}
mapOperation(1,'wjy')
// wjyone
// wjy_1
  ```  
用Object来写也是一样，如下： 
 ```java 
  const obj = {
    'ly_1': () => {consoleLog('lyone');consoleRun('ly_1')},
    'ly_2': () => {consoleLog('lytwo');consoleRun('ly_2')},
    'ly_3': () => {consoleLog('lythree');consoleRun('ly_3')},
    'ly_4': () => {consoleLog('lyfour');consoleRun('ly_4')},
    'wjy_1': () => {consoleLog('wjyone');consoleRun('wjy_1')},
    'wjy_2': () => {consoleLog('wjytwo');consoleRun('wjy_2')},
    'wjy_3': () => {consoleLog('wjythree');consoleRun('wjy_3')},
    'wjy_4': () => {consoleLog('wjyfour');consoleRun('wjy_4')},  
    'default': () => {consoleLog('sbother');consoleRun('other roommate')},
}
const objOperation = (status,roommate)=>{
  let objAction = obj[`${roommate}_${status}`] || obj['default']
  objAction.call(this)
}
objOperation(1,'wjy')
// wjyone
// wjy_1
  ```  
这类方法的核心就是把两个条件拼接成一个unique的字符串，然后将拼接的字符串作为主键，来进行对应的函数处理，从原理上讲，条件层级越多，这个方法就越简单越省事。当然，可能有些同学觉得这样不够规范，觉得下划线不正规，也可以采用对象方式。 
 ```java 
  const map = new Map([
    [{status:'1',roommate:'ly'}, () => {consoleLog('lyone');consoleRun('ly_1')}],
    [{status:'2',roommate:'ly'}, () => {consoleLog('lytwo');consoleRun('ly_2')}],
    [{status:'3',roommate:'ly'}, () => {consoleLog('lythree');consoleRun('ly_3')}],
    [{status:'4',roommate:'ly'}, () => {consoleLog('lyfour');consoleRun('ly_4')}],
    [{status:'1',roommate:'wjy'}, () => {consoleLog('wjyone');consoleRun('wjy_1')}],
    [{status:'2',roommate:'wjy'}, () => {consoleLog('wjytwo');consoleRun('wjy_2')}],
    [{status:'3',roommate:'wjy'}, () => {consoleLog('wjythree');consoleRun('wjy_3')}],
    [{status:'4',roommate:'wjy'}, () => {consoleLog('wjyfour');consoleRun('wjy_4')}],    
    ['default', () => {consoleLog('sbother');consoleRun('other roommate')}],
])
const mapOperation = (status,roommate)=>{
  let mapAction = [...map].filter(([key,value])=>(key.roommate === roommate && key.status === status))
  if(mapAction.length === 0){
    mapAction = map.get('default');
    mapAction.call(this);
  } else {
    mapAction.forEach(([key,value])=>value.call(this))      
  }
}
  ```  
这样我们就可以看到Object和Map的一个主要区别了，在使用Map类型时候我们可以选择通过对象来作为key值。当然还有可能出现这种情况，比如同一个方法在某几个条件中都被同时使用，并且传了相同的参数比如： 
 ```java 
  const map = new Map([
    [{status:'1',roommate:'ly'}, () => {consoleRun('ly')}],
    [{status:'2',roommate:'ly'}, () => {consoleRun('ly')}],
    [{status:'3',roommate:'ly'}, () => {consoleRun('ly')}],
    [{status:'4',roommate:'ly'}, () => {consoleRun('ly4')}],
    ['default', () => {consoleRun('other roommate')}],
])
  ```  
这个时候就可以采用正则去进行了，把前四条作为一个整体去匹配正则，比如： 
 ```java 
  const map = () => {
    return new Map([
        [/^ly_[1,4]$/, () => consoleRun('ly')],
        [/^default$/, () => {consoleLog('sbother');consoleRun('other roommate')}],
    ])  
}
  ```  
通过正则去做匹配，当然这也是由于Map类型可以将各种类型作为key。下面举一个更为具体的小例子，由于本人能力有限可能有很多没想到的地方，所以写出的代码可能还是有些冗余，欢迎大家提意见，先看看古老的if else方式： 
 ```java 
  const ifOperation = (status,roommate) => {
    if(roommate === 'ly'){
        if(status === 1){
            consoleLog('lyone');
        } else if(status === 2){
            consoleLog('lytwo');
        } else if(status === 3){
            consoleLog('lythree');
        } else if(status === 4){
            consoleLog('lyfour');
        } else {
            consoleLog('lyother');
        }
    } else if(roommate === 'wjy'){
        if(status === 1){
            consoleLog('wjyone');
        } else if(status === 2){
            consoleLog('wjytwo');
        } else if(status === 3){
            consoleLog('wjythree');
        } else if(status === 4){
            consoleLog('wjyfour');
        } else {
            consoleLog('wjyother');
        }
    } else {
        consoleLog('sbother');
    }
}
  ```  
这里可以发现，和前面只有一点不同，就是三个else分别是三个不同的条件，这样用default处理就要分成三部分，这里采用正则试试看咯： 
 ```java 
  const map = () => {
    return new Map([
        [/^ly_1$/, () => consoleLog('lyone')],
        [/^ly_2$/, () => consoleLog('lytwo')],
        [/^ly_3$/, () => consoleLog('lythree')],
        [/^ly_4$/, () => consoleLog('lyfour')],
        [/^ly_.*$/, () => consoleLog('lyother')],
        [/^wjy_1$/, () => consoleLog('wjyone')],
        [/^wjy_2$/, () => consoleLog('wjytwo')],
        [/^wjy_3$/, () => consoleLog('wjythree')],
        [/^wjy_4$/, () => consoleLog('wjyfour')],    
        // [/^ly_((?![1-4]{1}[\S]{0}).)*|^ly_[1-4]{2,}$/g, () => consoleLog('lyother')],
        [/^wjy_.*$/, () => consoleLog('wjyother')],
        [/^.*.*$/, () => consoleLog('sbother')],
    ])
}
const mapArray = new Map([
    [2, (operation) => operation.pop()],
    [3, (operation) => {
        // console.log(operation);
        operation.pop();    
        operation.pop();
    }],
    ['default', () => {}],
])
const mapOperation = (status,roommate) => {
    let operation = [...map()].filter(([key,value]) => {
        if(key.test(`${roommate}_${status}`)){
            return value;            
        }
    });
    let operationArr = mapArray.get(operation.length) || mapArray.get('default');
    operationArr.call(this,operation);
    operation.forEach(([key,value]) => value.call(this))
}
mapOperation(10000,'ly1')
  ```  
原理很简单，这里我使用了两层判断逻辑，首先是进行正则表达式的编写，由于有三个else，所以可能我们需要三个default，从正则角度来说就是任意字符了，这里匹配会出现三种可能性，如果没有匹配到，那么只会存在一种可能为```[ [ /^.*.*$/, [Function (anonymous)] ] ]```，如果roommate正确匹配，而status没有正确匹配，那么会出现两种情况，我将一定匹配的可能在数组存在最后就可以将其弹出，就可以获得真实匹配正则，另外如果完全正确，那么三个正则都会成功匹配，我们就需要弹出最后两个，只取第一个。而弹出正则又是一个if else，我就放到了另一个map中，从而实现需求。 
 
### React hook篇 
来到公司一开始做了一个前后端联调的小项目，首���使用的就是React hook，那个时候还是不够熟悉，后来参加其他项目又用了16.8之前的生命周期函数，最近重归hook，发现项目中很多人都把组件的状态存在了model里，不过我还是觉得父子组件传值传函数这类基础要拿出来整理一下，恰巧最近事情不多，就整理一下。 
整体上分成四类： 
 
 
 
 
 
### 1.父组件传值给子组件 
最简单的最常用的就是父组件传值给子组件，一般采用props传值，我写了一个最基本的例子： 
父组件： 
 ```java 
  import React,{useState} from 'react';
import {Button} from 'antd';
import styles from './HomePage.less';
import Children from './components/Children';
const HomePage = () => {
  const [value,setValue] = useState('first');
  return (
    <div className={styles.root}>
      <Button onClick={() => {
        setValue('second')
      }}>change</Button>
      <Children value={value} />
    </div>
  )
}
export default HomePage;
  ```  
子组件: 
 ```java 
  import React from "react";
import PropTypes from "prop-types";
import styles from "./Children.less";
const Children = (props) => {
  const { value } = props;
  return (
    <div className={`${styles.root}`} >
      {value}
    </div>
  );
};
Children.propTypes = {
  value:PropTypes.string
};
Children.defaultProps = {
  value:''
};
export default Children;
  ```  
这是最简单的，也是最常用的，基本任何一个项目都会用到，也是我们一般抽出业务组件最基本的类型。 
 
### 2.父组件传方法给子组件/子组件传值给父组件 
个人理解这两类其实是一类，只是一个大的集合和一个小的集合的区别，就是说父组件传方法给子组件是一个大的模块，而恰巧这个模块中囊括了子组件传值给父组件这一个功能。举个例子： 
父组件： 
 ```java 
  import React,{useState} from 'react';
import styles from './HomePage.less';
import Children from './components/Children';
const HomePage = () => {
  const [value, setvalue] = useState('')
  const method = (val) => {
    setvalue(val);
  }
  return (
    <div className={styles.root}>
      <Children method={method} />
      {value}
    </div>
  )
}
export default HomePage;
  ```  
子组件： 
 ```java 
  import React from "react";
import PropTypes from "prop-types";
import {Button} from 'antd';
import styles from "./Children.less";
const Children = (props) => {
  const { method } = props;
  return (
    <div className={`${styles.root}`} >
      <Button onClick={() => {
        method('children')
      }}>children</Button>
    </div>
  );
};
Children.propTypes = {
  method:PropTypes.func
};
Children.defaultProps = {
  method:() => {}
};
export default Children;
  ```  
这里的例子我写的最基本，从子组件传值给父组件的角度上讲，就是子组件传了一个value给父组件，让父组件带它去做他该做的事。那么，从父组件传方法给子组件上讲，就是父组件传了一个叫做method的方法给了子组件，这个方法里，父组件想干什么就干什么，只需要子组件去调用就好了。当然，他们最天衣无缝的配合就是父组件已经把方法写好了，只需要子组件传值来让父组件方法正常运转就好了，perfect！ 
  
 
### 3.子组件传方法给父组件 
其实掌握了前面两种基础方法，在大多数项目已经够用了，简单的组件传值用props，以及基于他的派生策略，复杂的可以在model里存值去做传递，不过偶尔我们也需要在父组件中调用子组件的方法。我之前就遇到了这么个问题，写了一个大组件内容过多，我需要把他提出来，然后发现我使用了太多的useState，而且把子组件提出来后，发现事件是父组件的事件，但是需要修改子组件的state状态，于是我就把修改子组件state的地方封装成一个函数，供父组件去调用就好了。这里举个最简单的例子： 
  
父组件： 
 ```java 
  import React,{useRef} from 'react';
import styles from './HomePage.less';
import {Button} from 'antd';
import Children from './components/Children';
const HomePage = () => {
  const childRef = useRef<any>();
  return (
    <div className={styles.root}>
      <Children cRef={childRef} />
      <Button onClick={() => {
        childRef.current.childrenMethod();
      }}>click</Button>
    </div>
  )
}
export default HomePage;
  ```  
子组件 
 ```java 
  import React,{useImperativeHandle,useState} from "react";
import PropTypes from "prop-types";
import {Button} from 'antd';
import styles from "./Children.less";
const Children = (props) => {
  const { cRef } = props;
  const [value, setvalue] = useState('')
  useImperativeHandle(cRef,() => ({
      childrenMethod:() => {
        setvalue('children');
      }
    }),
  );
  return (
    <div className={`${styles.root}`} >
      {value}
    </div>
  );
};
Children.propTypes = {
  cRef:PropTypes.object
};
Children.defaultProps = {
  cRef:{}
};
export default Children;
  ```  
说起来useRef也是很神奇的，在这里，我们的子组件暴露给父组件的方法是childrenMethod，并且做了一个指代，父组件通过这个指代获取到子组件方法，从而进行调用。当然这里我只是针对hook做的分析，如果是类组件里，就要使用createRef了。需要了解的也可以看看这个文章，个人感觉还不错：https://zhuanlan.zhihu.com/p/269580627 
到这里，对于父子组件传值，传函数都做了一个介绍和描述，作为新上手项目的同学来说，可以从我这个基础例子出发，去感受React编程更为神秘的地方。 
  
 
### 结语 
之前在分享React生命周期之后，就想对JS一些我用到的以及一些想要在接下来项目中用到的小知识点做一些整理，当然我接触项目时间也不久，暂时就统计到了这些，后续有新的收获，还会持续统计更新。 
https://developer.aliyun.com/article/783279?utm_content=g_1000259721 
本文为阿里云原创内容，未经允许不得转载。 
 
                                        