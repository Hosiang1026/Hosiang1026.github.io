---
title: 推荐系列-Crypto练习之替换密码
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 695
cover_picture: >-
  https://www.hetianlab.com/specialized/headImg.action?news=c315ae78-7477-4bab-99d8-a2ffe9a194a9.png
abbrlink: 1468f8d8
date: 2021-04-15 09:10:30
---

&emsp;&emsp;今天进行的实验室Crypto种的替换密码。首先介绍一下工具，在解决这类题型的时候，我们不仅要运用到计算机知识，还有一部分密码学知识。 本次实验地址：《CTF Crypto练习之替换密码》。 首先介...
<!-- more -->

                                                                                                                                                                                        今天进行的实验室Crypto种的替换密码。首先介绍一下工具，在解决这类题型的时候，我们不仅要运用到计算机知识，还有一部分密码学知识。 
本次实验地址：《CTF Crypto练习之替换密码》。 
首先介绍一下工具，在解决这类题型的时候，我们不仅要运用到计算机知识，还有一部分密码学知识。 
本实验要求实验者具备如下的相关知识。 
一、替换密码 
替换密码是古典密码学中的一种加密方法，其按照特定的规律对文件进行加密。在最简单的替换密码中，通过将一个字符映射为另一个字符的方式来进行加密，比如对ASCII码表做一个映射，可以将密文设置为明文的下一位，如字符a映射为字符b，即可完成简单的替换加密。 
二、凯撒密码 
凯撒密码替换密码中最为典型的代表。凯撒密码非常简单，就是对字母表中的每个字母，用它之后的第三个字母来代替。例如： 
![Test](https://www.hetianlab.com/specialized/headImg.action?news=c315ae78-7477-4bab-99d8-a2ffe9a194a9.png Crypto练习之替换密码) 
在凯撒密码中字母表是循环的，即认为紧随Z后的字母是A，因此最后一个单词party中，y的密文是B。 
当凯撒密码的移位间隔为13时，就是ROT13编码了，因为英文字母表只有26个字母，而对ROT13而言��加密和解密的间隔都是一样的，因此同样的一段文字经过两次ROT13变换后就可以得到自身，即加密和解密是完全一样的操作。 
三、英文字母频率 
字母频率，就是指各个字母在文本材料中出现的频率。统计表明，在英语语料中各个字母的频率分布是有规律的，比如最常见的字母是e。英语中各个字母大致的频率分布如下图所示： 
![Test](https://www.hetianlab.com/specialized/headImg.action?news=c315ae78-7477-4bab-99d8-a2ffe9a194a9.png Crypto练习之替换密码) 
学习这些的主要目的是了解CTF竞赛中的密码学题型、凯撒密码、基于频率的替换密码破解方法。 
接下来开始准备实验环境，我们需要的辅助工具有Python，substitution_cipher_solver，JPK。 
先来看题目，在实验主机上的C:\Crypto\1目录下为本题所提供的文件（password.txt以及secret.rar两个文件），请对这些文件进行分析，找到Flag字符串。 
文件找到了，该怎么分析呢？ 
这道题意图在于考察选手对密码学中替换密码的了解，包括凯撒密码及其变形以及基于英文字母频率对单表代替密码的破解方法。 
实验步骤一、凯撒密码破解 
题目提供了两个文件：password.txt以及secret.rar文件，其中压缩包文件经过了加密，需要密码才能进行解压操作，而password.txt文件中给出了一个hint，提示Caesar以及字符串Mkockb_1c_o4cI。 
打开桌面上的JPK工具，输入字符串Mkockb_1c_o4cI，然后依次在菜单项中选择“Ascii”、“Decrypt”、“Caesar”，就可以看到所有可能的结果了，仔细观察输出的结果，可以看到比较有意义的字符串为Caesar_1s_e4sY，如下图所示： 
![Test](https://www.hetianlab.com/specialized/headImg.action?news=c315ae78-7477-4bab-99d8-a2ffe9a194a9.png Crypto练习之替换密码) 
经过测试，发现Caesar_1s_e4sY就是正确的解压密码。 
实验步骤二、单表代替密码分析 
打开secret.txt文件，得到的内容如下： 
oivqmqgn, yja vibem naarn yi yxbo sqnyab yjqo q zixuea is gaqbn qdi. ykra jqn zira yi baseazy yjqy qeni ko yja ujbqzw rqdqhkoa. yjkn kn vjqy yja uquab saam kn qpixy: gix nxprky q uquab, va backav ky qom ky dayn uxpeknjam. oi oaam yi vqky q rioyj ib yvi xoyke gix naa gixb qbykzea ko yja oafy ujbqzw knnxa, vjao yja ykra jqn zira, va'ee mazkma yi zirukea q oav knnxa sbir yja qbykzean yjqy jqca paao nxprkyyam. yjqy'n pqnkzqeeg ky. qom dbqp gix seqd jaba, zbguyiiiniziieqrkbkdjy? 
这里可以尝试对这段文本进行凯撒密码变换，但是尝试1-13这些偏移都看不到任何有意义的结果，因为这里不再使用简单的凯撒变换了，这里使用的是任意的单表代替。在凯撒密码中，所有的字符经过变换后，他们的偏移量都是一样的，比如a经过变换后得到d，那么b经过变换后就是e；而在任意的单表代替中，每个字符都唯一映射到另一个字符，字符串映射之间是没有规律的。 
经过使用暴力方式对此类加密进行破解非常麻烦，但是可以使用语言的一些规律对其发起攻击。首先把字母使用的相对频率统计出来，与英文字母的使用频率分布进行比较，可以猜测出一部分映射，然后配合对英语中的构词规律的分析，就可以猜测出其他的映射，按照这个思路基本就能完成密码分析过程。 
页面http://cryptoclub.org/tools/cracksub_topframe.php提供了一个方便的操作界面供我们对此类问题进行分析（实验主机不提供网络访问，请在自己的电脑上访问这个页面）。打开该页面然后填入密文，点击Crack，如下图所示： 
![Test](https://www.hetianlab.com/specialized/headImg.action?news=c315ae78-7477-4bab-99d8-a2ffe9a194a9.png Crypto练习之替换密码) 
接下来就可以从频率上对密文进行分析了。根据右侧的频率统计，我们可以尝试对前面四个字母进行替换，在左侧的矩形文本框中，在密文对应字符的上面可以填写解密后的明文，因此，这里得到的密文到明文的映射为：A-e, Y-t, Q-a, I-o。 
![Test](https://www.hetianlab.com/specialized/headImg.action?news=c315ae78-7477-4bab-99d8-a2ffe9a194a9.png Crypto练习之替换密码) 
在英文单词构词方面，以密文第二个单词YJA为例，经过分析后我们得到的结果为t*e，而字符J在密文中的频率为5.9%，对应英文文本中可能的字符为i, n, s, h, r，经过分析，只有the才是有意义的单词，因此我们可以猜测密文J对应明文h。 
经过这样不断的分析，我们最终就能还原出明文了。 
下来就是实验步骤三、使用脚本进行快速破解 
使用实验步骤二中提供的页面，可以完成对密文的破解，但是需要耗费一定的时间和精力，使用已有的成熟的解密脚本，我们可以快速完成破解过程。 
页面https://github.com/alexbers/substitution_cipher_solver提供了一个Substitution Cipher Solver工具，可以快速完成对单表替换类密码的分析。从地址https://github.com/alexbers/substitution_cipher_solver/archive/master.zip可以下载到这个工具（或者从http://heetian.qiniudn.com/crypto/substitution_cipher_solver.zip下载，在实验主机的C:\Crypto\1\ substitution_cipher_solver目录下已经提供了这个工具），下载完成后进行解压，将密文粘贴到encrypted.txt文件之中，双击decrypt.py即可开始进行破解，最终的到的明文会写入到decrypted.txt文件中，为： 
nowadays, the world seems to turn faster than a couple of years ago. time has come to reflect that also in the phrack magazine. this is what the paper feed is about: you submit a paper, we review it and it gets published. no need to wait a month or two until you see your article in the next phrack issue, when the time has come, we'll decide to compile a new issue from the articles that have been submitted. that's basically it. and grab you flag here, cryptooosocoolamiright? 
从明文的最后一句话可以知道，flag为cryptooosocoolamiright。 
layfair加密方式同时对两个明文字符进行替换加密，查阅资料了解Playfair密码。 
原理和过程，以后在CTF的题目中稍微变化一下，可能你就不认识了。
                                        