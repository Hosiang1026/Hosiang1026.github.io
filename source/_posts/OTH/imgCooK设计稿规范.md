---
title: 推荐系列-imgCooK设计稿规范
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 826
cover_picture: 'https://img.alicdn.com/tfs/TB1NutWf9slXu8jSZFuXXXg7FXa-1248-1352.png'
abbrlink: 5955aa2b
date: 2021-04-15 09:08:53
---

&emsp;&emsp;设计稿基本规范 注意：以下规范适用于 Sketch 设计稿和 PSD 设计稿。 设计师注意 如果您是设计师，我们希望您在绘制设计稿时，能遵循以下规范。 0. 设计稿前置要求 模块建议都放在画板（Art...
<!-- more -->

                                                                                                                                                                                        ### 设计稿基本规范 
注意：以下规范适用于 Sketch 设计稿和 PSD 设计稿。 
#### 设计师注意 
如果您是设计师，我们希望您在绘制设计稿时，能遵循以下规范。 
##### 0. 设计稿前置要求 
模块建议都放在画板（Artboard）中 
![Test](https://img.alicdn.com/tfs/TB1NutWf9slXu8jSZFuXXXg7FXa-1248-1352.png imgCooK设计稿规范) 
同在一个画板（Artboard）中的模块，第一层的子级必须是编组(Group)，不要有非编组(Group)的图层 
![Test](https://img.alicdn.com/tfs/TB1NutWf9slXu8jSZFuXXXg7FXa-1248-1352.png imgCooK设计稿规范) 
##### 1. 图层的组织 
属于同个模块的图层分到一个编组(Group)，图层命名没有要求。 
![Test](https://img.alicdn.com/tfs/TB1NutWf9slXu8jSZFuXXXg7FXa-1248-1352.png imgCooK设计稿规范) 
##### 2. 切图方法 
imgcook 提供了一种快速识别切图的方法。将需要导出成一张位图的元素编组并在命名时添加“#merge#”即可，如果切图的尺寸和期望的不一致，可以通过在编组里添加实际尺寸和位置的 Mask（蒙版）来解决。 
###### 示例 1 
下图所示的商品 1 排 4 模块，商品图与实际图片尺寸大小不一致。商品图的大小是 113x100，真实图片为一张方图，尺寸是 156 * 156，所以在商品图下添加了一个 Mask，标记真实图片的尺寸。 
![Test](https://img.alicdn.com/tfs/TB1NutWf9slXu8jSZFuXXXg7FXa-1248-1352.png imgCooK设计稿规范) 
###### 示例 2 
下图所示原图尺寸是 842 x 465，如果不加 Mask，生成的图片就不符合预期。Mask 的尺寸设置为 702 x 394，最后生成的尺寸就是期望的 702 x 394。 
![Test](https://img.alicdn.com/tfs/TB1NutWf9slXu8jSZFuXXXg7FXa-1248-1352.png imgCooK设计稿规范) 
##### 3. 元素的位置尽量准确 
元素的位置需要尽量准确，下图中的品牌 Logo 图是居中对齐的，左右两侧间隔都是 104px，左右可以偏差几个像素，但如果偏差太大，一边是 90px，而另外一边是 110px，生成代码时就不会是一个居中的元素，不符合预期。 
![Test](https://img.alicdn.com/tfs/TB1NutWf9slXu8jSZFuXXXg7FXa-1248-1352.png imgCooK设计稿规范) 
##### 4. 模块大小必须在页面宽度范围内 
模块的大小如果超过了页面的范围，必须使用mask进行裁剪，适配页面宽度 
![Test](https://img.alicdn.com/tfs/TB1NutWf9slXu8jSZFuXXXg7FXa-1248-1352.png imgCooK设计稿规范)
                                        