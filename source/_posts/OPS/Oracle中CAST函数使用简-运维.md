---
title: Oracle中CAST函数使用简
categories:
  - 运维
  - 工程效能
tags:
  - SQL
  - Shell
abbrlink: 4de6708c
date: 2021-02-07 00:00:00
top: 106
---

SELECT CAST('123.6' AS int) as result from dual;124 从上面可以看出，CAST()函数能执行四舍五入操作。--截断小数python

<!-- more -->

```
SELECT CAST('123.6' AS int) as result from dual;
  124 从上面可以看出，CAST()函数能执行四舍五入操作。
--截断小数python
SELECT CAST('123.447654' AS decimal(5,2)) as result from dual;
 RESULT -----------  123.45 decimal(5,2)表示值总位数为5，精确到小数点后2位。 SELECT CAST('123.4' AS decimal) as result from dual; 结果是一个整数值： 123 二、转换一个集合
语法：cast( multiset(查询语句) as 数据类型 )
1)转换成table
```
例子：
--学生成绩表
```
create table stu_score (stu_no varchar2(50),--学号  score  number--总分  ); insert into stu_score values('201301',67); insert into stu_score values('201302',63); insert into stu_score values('201303',77); insert into stu_score values('201304',68); insert into stu_score values('201305',97); insert into stu_score values('201306',62); insert into stu_score values('201307',87); commit;
------------------------------------------python
select * from stu_score;
```
学号         分数
--------   ---------- 201301       67 201302       63 201303       77 201304       68 201305       97 201306       62 201307       87
--奖学金表。
--奖学金表规定了名次，每个名次的人数和奖金。
```
create table scholarship (www.ry-mir.com stu_rank   varchar(10),--名次 stu_num     int,--限定人数 money       number--奖金 ); insert into scholarship values('1',1,'1000'); insert into scholarship values('2',2,'500'); insert into scholarship values('3',3,'100'); commit；
-----------------------------------------------python
select * from scholarship;
```
名次                                          人数     奖金 ---------- --------------------------------------- ---------- 1                                              1       1000 2                                              2        500 3                                              3        100
现在要根据成绩表的成绩降序排列，按奖学金表的名额确定排名和奖金。排名时不考虑相同成绩。 排名的结果应该如下： 学号          成绩        名次   奖金 201305        97          1        1000 201307        87           2        500 201303        77          2         500 201304        68          3         100 201301        67          3         100 201302        63          3         100

```
SELECT c.stu_no,c.score,b.stu_rank,b.money   FROM (SELECT c.*,ROW_NUMBER() OVER(ORDER BY score DESC) rn FROM stu_score c) c       ,(SELECT b.stu_rank,b.money,ROW_NUMBER() OVER(ORDER BY b.stu_rank) rn          FROM scholarship b             , TABLE( CAST( MULTISET( SELECT NULL                                       FROM DUAL                                    CONNECT BY LEVEL <= b.stu_num                                    )                             AS SYS.ODCIVARCHAR2LIST )                             )        ) b WHERE c.rn=b.rn;
```
执行结果如下：
STU_NO                                                  SCORE      STU_RANK        MONEY -------------------------------------------------- ----------         ----------          ---------- 201305                                                     97                     1                1000 201307                                                     87                     2                 500 201303                                                     77                     2                 500 201304                                                     68                     3                 100 201301                                                     67                     3                 100 201302                                                     63                     3                 100
通过对比发现，确实达到了目的。
此外cast还能转化成collection，varray，此时都需要记过multiset集合函数一起使用。
