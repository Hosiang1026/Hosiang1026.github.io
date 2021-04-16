---
title: 推荐系列-盛最多水的容器Java版（力扣）
categories: 热门文章
tags:
  - Popular
author: csdn
top: 4
cover_picture: 'https://profile.csdnimg.cn/4/F/6/3_weixin_43883917'
abbrlink: fe67250e
date: 2021-04-15 08:14:57
---

&emsp;&emsp;盛最多水的容器给你 n 个非负整数 a1，a2，…，an，每个数代表坐标中的一个点 (i, ai) 。在坐标内画 n 条垂直线，垂直线 i 的两个端点分别为 (i, ai) 和 (i, 0) 。找出其中的两条线，使得它们与 x 轴共同构成的容器可以容纳最多的水。说明：你不能倾斜容器。示例 2：输入：height = [1,1]输出：1示例 3：输入：height = [4,3,2,1,4]输出：16示例 4：输入：height = [1,2,1]输出：2提示：n = height
<!-- more -->

        
                
                    
                        
                    
                    盛最多水的容器 
给你 n 个非负整数 a1，a2，…，an，每个数代表坐标中的一个点 (i, ai) 。在坐标内画 n 条垂直线，垂直线 i 的两个端点分别为 (i, ai) 和 (i, 0) 。找出其中的两条线，使得它们与 x 轴共同构成的容器可以容纳最多的水。 说明：你不能倾斜容器。 
 示例 2： 输入：height = [1,1] 输出：1 
示例 3： 输入：height = [4,3,2,1,4] 输出：16 
示例 4： 输入：height = [1,2,1] 输出：2 
提示： n = height.length 2 <= n <= 3 * 104 0 <= height[i] <= 3 * 104 
题意：其实就是求两个柱子之间的最大面积。 
思路：从两边分别向里面遍历，哪边的柱子矮就移动这一侧的柱子向内移动，这样就可以保证移动后的面积会大于等于当前的面积。 
详细题解：官方题解 
正确代码： 
 
 ```java 
  class Solution {
    public int maxArea(int[] height) {

        int l=0,r= height.length-1;
        int ans=0;

        while(l<r){
            int maxx=(r-l)*Math.min(height[l],height[r]);

            ans =Math.max(maxx,ans);
            if(height[l]<= height[r]){
                l++;
            }else {
                r--;
            }
        }

        return ans;
    }
}

  ``` 
  
完整代码（含测试��例）： 
 
 ```java 
  package com.Keafmd.April.day13;

/**
 * Keafmd
 *
 * @ClassName: ContainerWithMostWater
 * @Description: 盛最多水的容器 https://leetcode-cn.com/problems/container-with-most-water/
 * @author: 牛哄哄的柯南
 * @Date: 2021-04-13 9:30
 * @Blog: https://keafmd.blog.csdn.net/
 */
public class ContainerWithMostWater {
    public static void main(String[] args) {
        Solution0413 solution0413= new Solution0413();
        int [] height = {1,3,2,5,25,24,5};
        int re = solution0413.maxArea(height);
        System.out.println("re = " + re);
    }
}
class Solution0413 {
    public int maxArea(int[] height) {

        int l=0,r= height.length-1;
        int ans=0;

        while(l<r){
            int maxx=(r-l)*Math.min(height[l],height[r]);

            ans =Math.max(maxx,ans);
            if(height[l]<= height[r]){
                l++;
            }else {
                r--;
            }
        }

        return ans;
    }
}

  ``` 
  
输出结果： 
 
 ```java 
  re = 24

Process finished with exit code 0

  ``` 
  
看完如果对你有帮助，感谢点赞支持！ 如果你是电脑端，看到右下角的 “一键三连” 了吗，没错点它[哈哈]  加油！ 
共同努力！ 
Keafmd
                
                
                
        