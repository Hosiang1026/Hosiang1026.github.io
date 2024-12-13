---
title: 推荐系列-Stegano 3个音频隐写
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 1956
cover_picture: 'https://www.hetianlab.com/specialized/headImg.action?news=e4ab87dd-293d-4ea6-a5aa-6c5570e93511.png'
abbrlink: c4e33cac
date: 2021-04-15 09:46:45
---

&emsp;&emsp;进入实验地址《CTF Stegano练习之隐写2》。 先看第一类题查看频谱图使用Audacity打开sound1.wav文件。 用Audacity这个工具打开就是因为Audacity提供的强大的音频分析功能，包括波形图、频谱图...
<!-- more -->

                                                                                                                                                                                        进入实验地址《CTF Stegano练习之隐写2》。 
先看第一类题查看频谱图使用Audacity打开sound1.wav文件。 
用Audacity这个工具打开就是因为Audacity提供的强大的音频分析功能，包括波形图、频谱图等各种图形可视化效果。 
Audacity默认显示的是音频文件左右两个声道的波形图，我们可以尝试切换到频谱图进行分析，操作步骤为：在Audacity中点击第一个声道的波形图左侧的文件名（这里为sound1），在弹出的菜单中选择“频谱图”，就可以切换到频谱图模式了，如图所示： 
![Test](https://www.hetianlab.com/specialized/headImg.action?news=e4ab87dd-293d-4ea6-a5aa-6c5570e93511.png  'Stegano 3个音频隐写') 
![Test](https://www.hetianlab.com/specialized/headImg.action?news=e4ab87dd-293d-4ea6-a5aa-6c5570e93511.png  'Stegano 3个音频隐写') 
Get到flag一枚，神奇。 
再来看题，使用Audacity打开sound2.wav文件，仔细听其中发出的声音，发现前面半段音频发出的声音很难挺清楚在说什么，而后面半段则可以清晰的听到一段英文发音。 
听是不可能听出来的，这里音频可是被反向了，在Audacity中，选择“特效”、“反向”菜单项，然后播放反向之后的音频，如图所示： 
![Test](https://www.hetianlab.com/specialized/headImg.action?news=e4ab87dd-293d-4ea6-a5aa-6c5570e93511.png  'Stegano 3个音频隐写') 
处理之后，就可以清晰的听到声音the flag is high_level_encryption，这就是我们所要找的Flag字符串了。 
还有一种。 
继续看第三种使用Audacity打开sound3.wav文件，发现左右两个声道的波形图完全不一样，其中第一个波形图只在时间轴的中间部分存在一些有规律的小点，而第二个波形图则是正常的声音波形图，如下图所示： 
![Test](https://www.hetianlab.com/specialized/headImg.action?news=e4ab87dd-293d-4ea6-a5aa-6c5570e93511.png  'Stegano 3个音频隐写') 
按下键盘左下角的Ctrl按键，同时滚动鼠标滚轮，对波形图进行放大操作，其中第一个波形图放大后如图所示： 
![Test](https://www.hetianlab.com/specialized/headImg.action?news=e4ab87dd-293d-4ea6-a5aa-6c5570e93511.png  'Stegano 3个音频隐写') 
这种就是摩尔斯电码，这里考的也是摩尔斯电码，其中较短的波形表示点“.”，而较长的波形则表示横线“-”，而间隔较远的两个波形图则认为是两个不同的摩斯码。因此，第一个声道的波形图可以表示为：..... -... -.-. ----. ..--- ..... -.... ....- ----. -.-. -... ----- .---- ---.. ---.. ..-. ..... ..--- . -.... .---- --... -.. --... ----- ----. ..--- ----. .---- ----. .---- -.-. 
使用JPK进行解码，打开桌面上的JPK，将摩斯码输入之后，依次选择菜单项“Ascii”、“Decode”、“DeMorse”，得到字符串5BC925649CB0188F52E617D70929191C，如图所示： 
![Test](https://www.hetianlab.com/specialized/headImg.action?news=e4ab87dd-293d-4ea6-a5aa-6c5570e93511.png  'Stegano 3个音频隐写') 
注意摩斯码不区分大小写，JPK默认转换为大写形式，所以如果得到的字符串提交不正确，可以尝试转换为小写形式提交。 
这道题有3个问题，每一个都要仔细才能得出答案。和上次的隐写题一样，利用工具分析音频，再输入摩斯码就可以得出答案了。
                                        