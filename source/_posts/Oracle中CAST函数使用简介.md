---
title: 推荐系列-Oracle中CAST函数使用简介
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 697
cover_picture: 'https://api.ixiaowai.cn/gqapi/gqapi.php'
abbrlink: b77064d7
date: 2021-04-15 09:48:03
---

&emsp;&emsp;CAST()函数可以进行数据类型的转换。 CAST()函数的参数有两部分，源值和目标数据类型，中间用AS关键字分隔。 以下例子均通过本人测试。 一、转换列或值 语法：cast( 列名/值 as 数据类型 ) ...
<!-- more -->

                                                                                                                                                                                        CAST()函数可以进行数据类型的转换。 
CAST()函数的参数有两部分，源值和目标数据类型，中间用AS关键字分隔。 
以下例子均通过本人测试。 
一、转换列或值 
语法：cast( 列名/值 as 数据类型 ) 
用例： 
1）、转换列 
--将empno的类型（number）转换为varchar2类型。 
select cast(empno as varchar2(10)) as empno from emp; 
EMPNO ---------- 7369 7499 7521 ... 
2)、转换值 
--将字符串转换为整型。 SELECT CAST('123' AS int) as result from dual; 
  RESULT   --- 
  123 返回值是整型值123。 
--如果试图将一个代表小数的字符串转���为整型值，又会出现什么情况呢？ SELECT CAST('123.4' AS int) as result from dual; 
 RESULT -------- 
  123 
SELECT CAST('123.6' AS int) as result from dual; 
 RESULT -------- 
  124 从上面可以看出，CAST()函数能执行四舍五入操作。 
--截断小数 
SELECT CAST('123.447654' AS decimal(5,2)) as result from dual; 
 RESULT -----------  123.45 decimal(5,2)表示值总位数为5，精确到小数点后2位。 SELECT CAST('123.4' AS decimal) as result from dual; 结果是一个整数值： 123 二、转换一个集合 
语法：cast( multiset(查询语句) as 数据类型 ) 
1)转换成table 
例子： 
--学生成绩表 
create table stu_score (stu_no varchar2(50),--学号  score  number--总分  ); insert into stu_score values('201301',67); insert into stu_score values('201302',63); insert into stu_score values('201303',77); insert into stu_score values('201304',68); insert into stu_score values('201305',97); insert into stu_score values('201306',62); insert into stu_score values('201307',87); commit; 
------------------------------------------ 
select * from stu_score; 
学号         分数 
--------   ---------- 201301       67 201302       63 201303       77 201304       68 201305       97 201306       62 201307       87 
--奖学金表。 
--奖学金表规定了名次，每个名次的人数和奖金。 
create table scholarship (www.ry-mir.com stu_rank   varchar(10),--名次 stu_num     int,--限定人数 money       number--奖金 ); insert into scholarship values('1',1,'1000'); insert into scholarship values('2',2,'500'); insert into scholarship values('3',3,'100'); commit； 
----------------------------------------------- 
select * from scholarship; 
名次                                          人数     奖金 ---------- --------------------------------------- ---------- 1                                              1       1000 2                                              2        500 3                                              3        100 
现在要根据成绩表的成绩降序排列，按奖学金表的名额确定排名和奖金。排名时不考虑相同成绩。 排名的结果应该如下： 学号          成绩        名次   奖金 201305        97          1        1000 201307        87           2        500 201303        77          2         500 201304        68          3         100 201301        67          3         100 201302        63          3         100 
  
SELECT c.stu_no,c.score,b.stu_rank,b.money   FROM (SELECT c.*,ROW_NUMBER() OVER(ORDER BY score DESC) rn FROM stu_score c) c       ,(SELECT b.stu_rank,b.money,ROW_NUMBER() OVER(ORDER BY b.stu_rank) rn          FROM scholarship b             , TABLE( CAST( MULTISET( SELECT NULL                                       FROM DUAL                                    CONNECT BY LEVEL <= b.stu_num                                    )                             AS SYS.ODCIVARCHAR2LIST )                             )        ) b WHERE c.rn=b.rn; 
执行结果如下： 
STU_NO                                                  SCORE      STU_RANK        MONEY -------------------------------------------------- ----------         ----------          ---------- 201305                                                     97                     1                1000 201307                                                     87                     2                 500 201303                                                     77                     2                 500 201304                                                     68                     3                 100 201301                                                     67                     3                 100 201302                                                     63                     3                 100 
通过对比发现，确实达到了目的。 
此外cast还能转化成collection，varray，此时都需要记过multiset集合函数一起使用。 
                                        