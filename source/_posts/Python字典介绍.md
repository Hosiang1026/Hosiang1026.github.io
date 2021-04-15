---
title: 推荐系列-Python字典介绍
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 895
cover_picture: 'https://oscimg.oschina.net/oscnet/up-4c356b31e7987dd9651506532d685402697.png'
abbrlink: a3a8f3fb
date: 2021-04-15 09:53:06
---

&emsp;&emsp;目前B站正在直播Mysql、Oracle实战，详情关注公众号：IT邦德 微信二维码 微信公众号 字典是“键值对”的无序可变序列，字典中的每个元素都是一个“键值对”，包含：“键对象”和“值对象”。...
<!-- more -->

                                                                                                                                                                                        目前B站正在直播Mysql、Oracle实战，详情关注公众号：IT邦德 
![Test](https://oscimg.oschina.net/oscnet/up-4c356b31e7987dd9651506532d685402697.png  'Python字典介绍')![Test](https://oscimg.oschina.net/oscnet/up-4c356b31e7987dd9651506532d685402697.png  'Python字典介绍') 
微信二维码                              微信公众号 
 
  
  字典是“键值对”的无序可变序列，字典中的每个元素都是一个“键值对”，包含：“键对象”和“值对象”。 
  可以通过“键对象”实现快速获取、删除、更新对应的“值对象”。列表中我们通过“下标数字”找到对应的对象。 
  字典中通过“键对象”找到对应的“值对象”。“键”是任意的不可变数据，比如：整数、浮点数、字符串、元组。 
  但是：列表、字典、集合这些可变对象，不能作为“键”,并且“键”不可重复。 
  “值”可以是任意的数据，并且可重复。 
  一个典型的字典的定义方式：a = {'name':'jeames','age':18,'job':'programmer'} 
   
    
    1 字典的创建 
    
   
   
    
    1.1 我们可以通过{}、dict()来创建字典对象 
     
 ```java 
  >>> a = {'name':'jeames','age':18,'job':'programmer'}
>>> b = dict(name='jeames',age=18,job='programmer')
>>> a = dict([("name","jeames"),("age",18)])
>>> c = {} #空的字典对象
>>> d = dict() #空的字典对象
  ``` 
  
     
      
      1.2  通过 zip()创建字典对象 
       
 ```java 
  >>> k = ['name','age','job']
>>> v = ['jeames',18,'techer']
>>> d = dict(zip(k,v))
>>> d
{'name': 'jeames', 'age': 18, 'job': 'techer'}
  ``` 
  
      1.3  通过 fromkeys 创建值为空的字典 
       
 ```java 
  >>> a = dict.fromkeys(['name','age','job'])
>>> a
{'name': None, 'age': None, 'job': None}
  ``` 
  
       
        
        2 字典元素的访问 
        为了测试各种访问方法，我们这里设定一个字典对象：a = {'name':'jeames','age':18,'job':'programmer'} 
         
          
          2.1 通过 [键] 获得“值” 
          若键不存在，则抛出异常 
           
 ```java 
  >>> a = {'name':'jeames','age':18,'job':'programmer'}
>>> a['name']
'jeames'
>>> a['age']
18
>>> a['sex']
Traceback (most recent call last):
File "<pyshell#374>", line 1, in <module>
a['sex']
KeyError: 'sex'
  ``` 
  
           
            
            2.2. 通过 get()方法获得“值”,推荐使用 
            优点是：指定键不存在，返回 None；也可以设定指定键不存在时默认返回的对象,推荐使用 get()获取“值对象”。 
             
 ```java 
  >>> a.get('name')
'gaoqi'
>>> a.get('sex')
>>> a.get('sex','一个男人')
'一个男人'
  ``` 
  
             
              
              2.3 列出所有的键值对  
               
 ```java 
  >>> a.items()
dict_items([('name', 'gaoqi'), ('age', 18), ('job', 'programmer')])
  ``` 
  
              2.4  列出所有的键，列出所有的值 
               
 ```java 
  >>> a.keys()
dict_keys(['name', 'age', 'job'])
>>> a.values()
dict_values(['jeames', 18, 'programmer'])
  ``` 
  
              3 字典元素添加\删除 
               
                
                给字典新增“键值对”。如果“键”已经存在，则覆盖旧的键值对；如果“键”不存在，则新增“键值对” 
                 
 ```java 
  >>>a = {'name':'jeames','age':18,'job':'programmer'}
>>> a['address']='合肥'
>>> a['age']=16
>>> a
{'name': 'gaoqi', 'age': 16, 'job': 'programmer', 'address': '合肥'}
  ``` 
  
                 
                  
                  字典中元素的删除，可以使用 del()方法； 
                  或者 clear()删除所有键值对；pop()删除指定键值对，并返回对应的“值对象”； 
                   
 ```java 
  >>> a = {'name':'jeames','age':18,'job':'programmer'}
>>> del(a['name'])
>>> a
{'age': 18, 'job': 'programmer'}
>>> b = a.pop('age')
>>> b
18

  ``` 
  
                  QQ:2243967774,更多资料请关注公众号：IT 邦德，专注于数据库及程序开发，扫描加微信 
                  ![Test](https://oscimg.oschina.net/oscnet/up-4c356b31e7987dd9651506532d685402697.png  'Python字典介绍')![Test](https://oscimg.oschina.net/oscnet/up-4c356b31e7987dd9651506532d685402697.png  'Python字典介绍') ​​​​​​​ 
                  
                 
                
               
              
             
            
           
          
         
        
       
      
     
    
   
  

                                        