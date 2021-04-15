---
title: 推荐系列-《精通react-vue组件设计》之配合React Portals实现一个功能强大的抽屉组件
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 883
cover_picture: 'https://oscimg.oschina.net/oscnet/718e96a2-3522-42f1-8f74-8f0f51665ae1.gif'
abbrlink: 562fce4b
date: 2021-04-15 09:08:53
---

&emsp;&emsp;前言 本文���笔者写组件设计的第六篇文章,内容依次从易到难,今天会用到react的高级API React Portals,它也是很多复杂组件必用的方法之一. 通过组件的设计过程,大家会接触到一个完成健壮的组件...
<!-- more -->

                                                                                                                                                                                         
  
 #### 前言 
 本文是笔者写组件设计的第六篇文章,内容依次从易到难,今天会用到react的高级API React Portals,它也是很多复杂组件必用的方法之一. 通过组件的设计过程,大家会接触到一个完成健壮的组件设计思路和方法,也能在实现组件的过程逐渐对react/vue的高级知识和技巧有更深的理解和掌握,并且在企业实际工作做游刃有余. 
  
 作为数据驱动的领导者react/vue等MVVM框架的出现,帮我们减少了工作中大量的冗余代码, 一切皆组件的思想深得人心. 为了让工程师们有更多的时间去考虑业务和产品迭代,我们不得不掌握高质量组件设计的思路和方法.所以笔者将花时间去总结各种业务场景下的组件的设计思路和方法,并用原生框架的语法去实现各种常用组件的开发,希望能让前端新手或者有一定工作经验的朋友能有所收获. 
 如果对于react/vue组件设计原理不熟悉的,可以参考我的之前写的组件设计系列文章: 
  
  《精通react/vue组件设计》之5分钟实现一个Tag(标签)组件和Empty(空状态)组件 
  《精通react/vue组件设计》之用纯css打造类materialUI的按钮点击动画并封装成react组件 
  《精通react/vue组件设计》之快速实现一个可定制的进度条组件 
  《精通react/vue组件设计》之基于jsoneditor二次封装一个可实时预览的json编辑器组件(react版) 
  
  
 #### 正文 
 在开始组件设计之前希望大家对css3和js有一定的基础,并了解基本的react/vue语法.我们先看看实现后的组件效果: 
 ![Test](https://oscimg.oschina.net/oscnet/718e96a2-3522-42f1-8f74-8f0f51665ae1.gif 《精通react-vue组件设计》之配合React Portals实现一个功能强大的抽屉组件) 
  
 ##### 1. 组件设计思路 
 按照之前笔者总结的组件设计原则,我们第一步是要确认需求. 一个抽屉(Drawer)组件会有如下需求点: 
  
  能控制抽屉是否可见 
  能手动配置抽屉的关闭按钮 
  能控制抽屉的打开方向 
  关闭抽屉时是否销毁里面的子元素(这个问题是工作中频繁遇到的问题) 
  指定 Drawer 挂载的 HTML 节点, 可以将抽屉挂载在任何元素上 
  点击蒙层可以控制是否允许关闭抽屉 
  能控制遮罩层的展示 
  能自定义抽屉弹出层样式 
  可以设置抽屉弹出层宽度 
  能控制弹出层层级 
  能控制抽屉弹出方向(上下左右) 
  点击关闭按钮时能提供回调供开发者进行相关操作 
  
 需求收集好之后,作为一个有追求的程序员, 会得出如下线框图: 
  
  
  ![Test](https://oscimg.oschina.net/oscnet/718e96a2-3522-42f1-8f74-8f0f51665ae1.gif 《精通react-vue组件设计》之配合React Portals实现一个功能强大的抽屉组件) 
  
  
 对于react选手来说,如果没用typescript,建议大家都用PropTypes, 它是react内置的类型检测工具,我们可以直接在项目中导入. vue有自带的属性检测方式,这里就不一一介绍了. 
 通过以上需求分析, 是不是觉得一个抽屉组件要实现这么多功能很复杂呢? 确实有点复杂,但是不要怕,有了上面精确的需求分析,我们只需要一步步按照功能点实现就好了.对于我们常用的table组件, modal组件等其实也需要考虑到很多使用场景和功能点, 比如antd的table组件暴露了几十个属性,如果不好好理清具体的需求, 实现这样的组件是非常麻烦的.接下来我们就来看看具体实现. 
  
 ##### 2. 基于react实现一个Drawer组件 
  
 ###### 2.1. Drawer组件框架设计 
 首先我们先根据需求将组件框架写好,这样后面写业务逻辑会更清晰: 
  ```java 
  import PropTypes from 'prop-types'import styles from './index.less'/** * Drawer 抽屉组件 * @param {visible} bool 抽屉是否可见 * @param {closable} bool 是否显示右上角的关闭按钮 * @param {destroyOnClose} bool 关闭时销毁里面的子元素 * @param {getContainer} HTMLElement 指定 Drawer 挂载的 HTML 节点, false 为挂载在当前 dom * @param {maskClosable} bool 点击蒙层是否允许关闭抽屉 * @param {mask} bool 是否展示遮罩 * @param {drawerStyle} object 用来设置抽屉弹出层样式 * @param {width} number|string 弹出层宽度 * @param {zIndex} number 弹出层层级 * @param {placement} string 抽屉方向 * @param {onClose} string 点击关闭时的回调 */function Drawer(props) {  const {     closable = true,     destroyOnClose,     getContainer = document.body,     maskClosable = true,     mask = true,     drawerStyle,     width = '300px',    zIndex = 10,    placement = 'right',     onClose,    children  } = props  const childDom = (    <div className={styles.xDrawerWrap}>      <div className={styles.xDrawerMask} ></div>      <div         className={styles.xDrawerContent}         {          children        }        {          !!closable && <span className={styles.xCloseBtn}>X</span>        }      </div>    </div>  )  return childDom}export default Drawer
  ```  
 有了这个框架,我们来一步步往里面实现内容吧. 
  
 ###### 2.2 实现visible, closable, onClose, mask, maskClosable, width, zIndex, drawerStyle 
 之所以要先实现这几个功能,是因为他们实现都比较简单,不会牵扯到其他复杂逻辑.只需要对外暴露属性并使用属性即可. 具体实现如下: 
  ```java 
  function Drawer(props) {  const {     closable = true,     destroyOnClose,     getContainer = document.body,     maskClosable = true,     mask = true,     drawerStyle,     width = '300px',    zIndex = 10,    placement = 'right',     onClose,    children  } = props  let [visible, setVisible] = useState(props.visible)  const handleClose = () => {    setVisible(false)    onClose && onClose()  }  useEffect(() => {    setVisible(props.visible)  }, [props.visible])  const childDom = (    <div       className={styles.xDrawerWrap}       style={{        width: visible ? '100%' : '0',        zIndex      }}    >      { !!mask && <div className={styles.xDrawerMask} onClick={maskClosable ? handleClose : null}></div> }      <div         className={styles.xDrawerContent}         style={{          width,          ...drawerStyle        }}>        { children }        {          !!closable && <span className={styles.xCloseBtn} onClick={handleClose}>X</span>        }      </div>    </div>  )  return childDom}
  ```  
 上述实现过程值得注意的就是我们组件设计采用了react hooks技术, 在这里用到了useState, useEffect, 如果大家不懂的可以去官网学习, 非常简单,如果有不懂的可以和笔者交流或者在评论区提问. 抽屉动画我们通过控制抽屉内容的宽度来实现,配合overflow:hidden, 后面我会单独附上css代码供大家参考. 
  
 ###### 2.3 实现destroyOnClose 
 destroyOnClose主要是用来清除组件缓存,比较常用的场景就是输入文本,比如当我是的抽屉的内容是一个表单创建页面时,我们关闭抽屉希望表单中用户输入的内容清空,保证下次进入时用户能重新创建, 但是实际情况是如果我们不销毁抽屉里的子组件, 子组件内容不会清空,用户下次打开时开始之前的输入,这明显不合理. 如下图所示: 
 ![Test](https://oscimg.oschina.net/oscnet/718e96a2-3522-42f1-8f74-8f0f51665ae1.gif 《精通react-vue组件设计》之配合React Portals实现一个功能强大的抽屉组件) 
  
  要想清除缓存,首先就要要内部组件重新渲染,所以我们可以通过一个state来控制,如果用户明确指定了关闭时要销毁组件,那么我们就更新这个state,从而这个子元素也就不会有缓存了.具体实现如下: 
  
  ```java 
  function Drawer(props) {  // ...  let [isDesChild, setIsDesChild] = useState(false)  const handleClose = () => {    // ...    if(destroyOnClose) {      setIsDesChild(true)    }  }  useEffect(() => {    // ...    setIsDesChild(false)  }, [props.visible])  const childDom = (    <div className={styles.xDrawerWrap}>      <div className={styles.xDrawerContent}         {          isDesChild ? null : children        }      </div>    </div>  )  return childDom}
  ```  
 上述代码中我们省略了部分不相关代码, 主要来关注isDesChild和setIsDesChild, 这个属性用来根据用户传入的destroyOnClose属性俩判断是否该更新这个state, 如果destroyOnClose为true,说明要更新,那么此时当用户点击关闭按钮的时候, 组件将重新渲染, 在用户再次点开抽屉时, 我们根据props.visible的变化,来重新让子组件渲染出来,这样就实现了组件卸载的完整流程. 
  
 ###### 2.4 实现getContainer 
 getContainer主要用来控制抽屉组件的渲染位置,默认会渲染到body下, 为了提供更灵活的配置,我们需要让抽屉可以渲染到任何元素下,这样又怎么实现呢? 这块实现我们可以采用React Portals来实现,具体api介绍如下: 
  
 
   具体使用如下: 
  
  ```java 
  render() {  // `domNode` 是��个可以在任何位置的有效 DOM 节点。  return ReactDOM.createPortal(    this.props.children,    domNode  );}
  ```  
 
   所以基于这个api我们就能把抽屉渲染到任何元素下了, 具体实现如下: 
  
  ```java 
  const childDom = (    <div       className={styles.xDrawerWrap}       style={{        position: getContainer === false ? 'absolute' : 'fixed',        width: visible ? '100%' : '0',        zIndex      }}    >      { !!mask && <div className={styles.xDrawerMask} onClick={maskClosable ? handleClose : null}></div> }      <div         className={styles.xDrawerContent}         style={{          width,          [placement]: visible ? 0 : '-100%',          ...drawerStyle        }}>        {          isDesChild ? null : children        }        {          !!closable && <span className={styles.xCloseBtn} onClick={handleClose}>X</span>        }      </div>    </div>  )  return getContainer === false ? childDom             : ReactDOM.createPortal(childDom, getContainer)
  ```  
 因为这里getContainer要支持3种情况,一种是用户不配置属性,那么默认就挂载到body下,还有就是用户传的值为false, 那么就为最近的父元素, 他如果传一个dom元素,那么将挂载到该元素下,所以以上代码我们会分情况考虑,还有一点要注意,当抽屉打开时,我们要让父元素溢出隐藏,不让其滚动,所以我们在这里要设置一下: 
  ```java 
  useEffect(() => {    setVisible(() => {      if(getContainer !== false && props.visible) {        getContainer.style.overflow = 'hidden'      }      return props.visible    })    setIsDesChild(false)  }, [props.visible, getContainer])
  ```  
 
   当关闭时恢复逻辑父级的overflow, 避免影响外部样式: 
  
  ```java 
  const handleClose = () => {    onClose && onClose()    setVisible((prev) => {      if(getContainer !== false && prev) {        getContainer.style.overflow = 'auto'      }      return false    })    if(destroyOnClose) {      setIsDesChild(true)    }  }
  ```  
  
 ###### 2.5 实现placement 
 placement主要用来控制抽屉的弹出方向, 可以从左弹出,也可以从右弹出, 实现过程也比较简单,我们主要要更具属性动态修改定位属性即可,这里我们会用到es新版的新特性,对象的变量属性. 核心代码如下: 
  ```java 
  <div   className={styles.xDrawerContent}   style={{    width,    [placement]: visible ? 0 : '-100%',    ...drawerStyle    }}> </div>
  ```  
 这样,无论是上下左右,都可以完美实现了. 
  
 ###### 2.6 健壮性支持, 我们采用react提供的propTypes工具: 
  ```java 
  import PropTypes from 'prop-types'// ...Drawer.propTypes = {  visible: PropTypes.bool,  closable: PropTypes.bool,   destroyOnClose: PropTypes.bool,   getContainer: PropTypes.element,   maskClosable: PropTypes.bool,   mask: PropTypes.bool,   drawerStyle: PropTypes.object,   width: PropTypes.oneOfType([    PropTypes.string,    PropTypes.number  ]),  zIndex: PropTypes.number,  placement: PropTypes.string,   onClose: PropTypes.func}
  ```  
 关于prop-types的使用官网上有很详细的案例,这里说一点就是oneOfType的用法, 它用来支持一个组件可能是多种类型中的一个. 组件相关css代码如下: 
  ```java 
  .xDrawerWrap {  top: 0;  height: 100vh;  overflow: hidden;  .xDrawerMask {    position: absolute;    left: 0;    right: 0;    top: 0;    bottom: 0;    background-color: rgba(0, 0, 0, .5);  }  .xDrawerContent {    position: absolute;    top: 0;    padding: 16px;    height: 100%;    transition: all .3s;    background-color: #fff;    box-shadow: 0 0 20px rgba(0,0,0, .2);    .xCloseBtn {      position: absolute;      top: 10px;      right: 10px;      color: #ccc;      cursor: pointer;    }  }}
  ```  
 通过以上步骤, 一个功能强大的的drawer组件就完成了,关于代码中的css module和classnames的使用大家可以自己去官网学习,非常简单.如果不懂的可以在评论区提问,笔者看到后会第一时间解答. 
  
 #### 扩展 
 目前笔者已经将完成的组件库发布到npm上了,大家可以通过npm安装包的方式使用: 
  ```java 
  npm i @alex_xu/xui// 使用import { Button, Alert } from '@alex_xu/xui'
  ```  
 在线文档地址: xui——基于react的轻量级UI组件库 
 npm包地址: @alex_xu/xui 
  
  ![Test](https://oscimg.oschina.net/oscnet/718e96a2-3522-42f1-8f74-8f0f51665ae1.gif 《精通react-vue组件设计》之配合React Portals实现一个功能强大的抽屉组件) 
  
  
 #### 最后 
 后续笔者已经实现 
  
  modal(模态窗), 
  alert(警告提示), 
  badge(徽标), 
  table(表格), 
  tooltip(工具提示条), 
  Skeleton(骨架屏), 
  Message(全局提示), 
  form(form表单), 
  switch(开关), 
  日期/日历, 
  二维码识别器组件 
  
 等组件, 来复盘笔者多年的组件化之旅. 
 如果想获取组件设计系列完整源码, 或者想学习更多H5游戏, webpack，node，gulp，css3，javascript，nodeJS，canvas数据可视化等前端知识和实战，欢迎在公号《趣谈前端》加入我们的技术群一起学习讨论，共同探索前端的边界。 
 ❤️爱心三连击 
 1.看到这里了就点个在看支持下吧，你的「点赞，在看」是我创作的动力。 
 2.关注公众号趣谈前端，进程序员优质学习交流群, 字节, 阿里大佬和你一起学习成长！ 
 3.也可添加微信【Mr_xuxiaoxi】获取大厂内推机会。 
 ![Test](https://oscimg.oschina.net/oscnet/718e96a2-3522-42f1-8f74-8f0f51665ae1.gif 《精通react-vue组件设计》之配合React Portals实现一个功能强大的抽屉组件) 
 
本文分享自微信公众号 - 趣谈前端（beautifulFront）。如有侵权，请联系 support@oschina.cn 删除。本文参与“OSC源创计划”，欢迎正在阅读的你也加入，一起分享。
                                        