---
title: 推荐系列-为什么很多人不愿意用hibernate了-
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 1730
cover_picture: 'https://static.oschina.net/uploads/img/202002/03143232_LJDe.jpg'
abbrlink: df8ec42b
date: 2021-04-15 09:19:21
---

&emsp;&emsp;关于SQL和ORM的争论，永远都不会终止，我也一直在思考这个问题。最近温习了一遍SSH框架，发了动弹，和广大猿友进行了深刻的探讨，被喷的五体投地，感慨万千，于是就有了今天这篇文章。 声明：...
<!-- more -->

                                                                                                                                                                                        关于SQL和ORM的争论，永远都不会终止，我也一直在思考这个问题。最近温习了一遍SSH框架，发了动弹，和广大猿友进行了深刻的探讨，被喷的五体投地，感慨万千，于是就有了今天这篇文章。 
声明：本文只是小编的一点拙见，不喜勿喷。 
欲速则不达，欲达则欲速！ 
一、hibernate优势 
hibernate让你不用写sql了，这不单可以让你的应用更好移植其它数据库，更主要的是让程序员更专注业务逻辑、数据关系、对象关系等。hibernate对一对多，多对多关系实现是非常好的。很关键一点，它支持lazy，可以让你的数据只在需要的时候被加载，听起来很完美。hibernate还有一个更牛的就是HQL，这是完全可以把查询映射到你OO模型的查询语言，和mybatis的映射比起来，还是更方便和更强大的。 
 
二、hibernate劣势 
看完优势之后，感觉hibernate无所不能了，无敌是多么的寂寞。处理大量数据或者大并发情况的网络服务感觉不是很好用，那么现在开始说说hibernate的问题。 
1、难以使用数据库的一些功能 
hibernate将数据库与开发者隔离了，开发者不需要关注数据库是Oracle还是MySQL，hibernate来帮你生成查询的sql语句，但问题来了，如果你想用某种数据库特有的功能，或者要让查询的sql完全符合你的心意，这就难了。如果使用hibernate，虽然它能对生成的查询进行一定程序的定制，但就有点隔靴挠痒的感觉了，而且你开发起来付出的代价更大。至于hibernate对native sql的支持，还是挺完善的，这种native sql还能返回non-managed entity，不走hibernate的cache，优化是搞定了，但如果整个项目都这么整，那还是用mybatis吧。 
很多时候，我们都有一个需求：得到数据库服务器的当前时间。这是因为本机时间和服务器时间是有差别的。各种数据库都提供了函数来获得，比如，mysql，可以用“select now()”。hibernate也提供了一个函数current_timestamp（说起timestamp，个人认为数据库的timestamp做的很差，它居然和datetime是一个数量级的（精确度），这怎么可以用来表示真正的stamp啊！）。可是，你却无法用直接使用“select current_timestamp()”来获得服务器的当前时间，你还必须加上一个查询的表！比如，“select current_timestamp() from tbl_Good”。个人十分郁闷，我只是想用这个简单功能而已，为什么我一定要知道数据库里面的表格呢？？？？更何况还必须建立映射。。。。。。  不是我不明白，这世界太复杂了 。每样产品都是拼命的复杂化，其实，它们实在是忽略了一般的用户只需要一小部分功能而已。默认的功能应该是能够满足普通用户的常见需求的，那样才算是一个好的产品。我不认为hibernate做到了这点。 
2、满足不了程序对cache的需求 
很多web服务，对cache的依赖是非常大的，hibernate自带的cache按理说也是很强大的，但还是满足不了很多需求。 
3、耦合度高 
hibernate的确是在你项目开发的时候节约了很多时间，但是它对你的业务逻辑模型和数据库模型互相依赖的程度太高了。短期没啥问题，但随着项目的变迁，这些都会改变，在维持这种仅仅耦合的关系的时候，你会发现你的代码特别脆弱，随便改一处数据库的schema，整个java项目可能要改几十次。而且现在mybatis的自动mapping做的也很好，开发起来也没花多长时间，等项目进入中后期，你需要大量定制和优化查询的时候，mybatis的开发效率就更明显了。 
4、debug难 
作为一个后端程序员，我比较喜欢每一行代码我都精确知道它到底在干什么。尤其是数据库访问的代码，往往系统的瓶颈就在这些地方产生，每一行都不能小看。我看过hibernate早期版本的部分代码，比我想象的复杂和强大很多。的确很多地方Hibernate可以强大的只用一行代码解决很多问题，但比如说一个update()或者save()到底做了什么，这里既有hibernate本身的逻辑，也有你应用的逻辑，如果这一行产生了问题，你该如何去做？我个人觉得这是很难搞的，还不如一开始费点事，用mybatis这种。 
作为一个程序员，我始终坚持认为改代码比改配置文件容易。 
5、hibernate更新大批量数据 
（1）hibernate批量更新customers表中大于零的所有记录的age字段： 
 ```java 
  Transaction transaction = session.beginTransaction();     
Iterator customers=session.find("from Customer c where c.age>0").iterator();     
while(customers.hasNext()){     
    Customer customer=(Customer)customers.next();     
    customer.setAge(customer.getAge()+1);     
}      
transaction.commit();     
session.close();  
  ```  
如果customers表中有一万条年龄大于零的记录，那么session的find()方法会一下子加载一万个customer对象到内存中。当执行tx.commit()方法时，会清理缓存，hibernate执行一万条更新customers表的update语句： 
 ```java 
  update CUSTOMERS set AGE=? …. where ID=i;     
  ```  
（2）以上hibernate批量更新方式有两个缺点 
 
 占用大量内存空间，必须把一万个customer对象先加载到内存，然后一一更新他们。 
 执行的update语句的数目太多，每个update语句只能更新一个Customer对象，必须通过1万条update语句才能更新一万个Customer对象，频繁的访问数据库，会大大降低应用的性能。 
 
（3）为了迅速释放1万个Customer对象占用的内存，可以在更新每个Customer对象后，就调用Session的evict()方法立即释放它的内存： 
 ```java 
  Transaction transaction = session.beginTransaction();     
Iterator customers=session.find("from Customer c where c.age>0").iterator();     
while(customers.hasNext()){     
    Customer customer=(Customer)customers.next();     
    customer.setAge(customer.getAge()+1);     
    session.flush();     
    session.evict(customer);     
}      
transaction.commit();     
session.close();  
  ```  
在以上程序中，修改了一个Customer对象的age属性后，就立即调用Session的flush()方法和evict()方法，flush()方法使hibernate立刻根据这个Customer对象的状态变化同步更新数据库，从而立即执行相关的update()语句；evict()方法用于把这个Customer对象从缓存中清除出去，从而及时释放它占用的内存。 
但evict()方法只能稍微提高批量操作的性能，因为不管有没有使用evict()方法，Hibernate都必须执行1万条update语句，才能更新1万个Customer对象，这是影响批量操作性能的重要因素。假如Hibernate能直接执行如下SQL语句： 
 ```java 
  update CUSTOMERS set AGEAGE=AGE+1 where AGE>0;   
  ```  
那么以上一条update语句就能更新CUSTOMERS表中的1万条记录。但是Hibernate并没有直接提供执行这种update语句的接口。应用程序必须绕过Hibernate API，直接通过JDBC API来执行该SQL语句： 
 ```java 
  Transaction transaction = session.beginTransaction();     
Connection con=session.connection();     
PreparedStatement stmt=con.prepareStatement("update CUSTOMERS set AGEAGE=AGE+1 where AGE>0 ");     
stmt.executeUpdate();     
transaction.commit();  
  ```  
以上程序演示了绕过Hibernate API，直接通过JDBC API访问数据库的过程。应用程序通过Session的connection()方法获得该Session使用的数据库连接，然后通过它创建 PreparedStatement对象并执行SQL语句。值得注意的是，应用程序仍然通过Hibernate的Transaction接口来声明事务边 界。  如果底层数据库（如Oracle）支持存储过程，也可以通过存储过程来执行Hibernate批量更新。存储过程直接在数据库中运行，速度更加快。在Oracle数据库中可以定义一个名为batchUpdateCustomer()的存储过程，代码如下： 
 ```java 
  create or replace procedure batchUpdateCustomer(p_age in number) as     
begin     
update CUSTOMERS set AGEAGE=AGE+1 where AGE>p_age;     
end;  
  ```  
以上存储过程有一个参数p_age，代表客户的年龄，应用程序可按照以下方式调用存储过程： 
 ```java 
  Transaction transaction = session.beginTransaction();     
Connection con=session.connection();     
String procedure = "{call batchUpdateCustomer(?) }";     
CallableStatement cstmt = con.prepareCall(procedure);     
cstmt.setInt(1,0); //把年龄参数设为0     
cstmt.executeUpdate();     
transaction.commit();  
  ```  
从上面程序看出，应用程序也必须绕过Hibernate API，直接通过JDBC API来调用存储过程。  
6、hibernate删除大批量数据 
Session的各种重载形式的update()方法都一次只能更新一个对象，而delete()方法的有些重载形式允许以HQL语句作为参数，例如： 
 ```java 
  session.delete("from Customer c where c.age>0");  
  ```  
如果CUSTOMERS表中有1万条年龄大于零的记录，那么以上代码能删除一万条记录。但是Session的delete()方法并没有执行以下delete语句 
 ```java 
  delete from CUSTOMERS where AGE>0;  
  ```  
Session的delete()方法先通过以下select语句把1万个Customer对象加载到内存中： 
 ```java 
  select * from CUSTOMERS where AGE>0;  
  ```  
接下来执行一万条delete语句，逐个删除Customer对象： 
 ```java 
  delete from CUSTOMERS where ID=i;     
delete from CUSTOMERS where ID=j;     
delete from CUSTOMERS where ID=k;  
  ```  
由 此可见，直接通过Hibernate API进行Hibernate批量更新和Hibernate批量删除都不值得推荐。而直接通过JDBC API执行相关的SQL语句或调用存储过程，是hibernate批量更新和批量删除的最佳方式。 
素小暖讲Spring JdbcTemplate 
三、群众的眼光的雪亮的，千万不要逆天而行 
![Test](https://oscimg.oschina.net/oscnet/up-4caf476092dcdebf4612298259c5c492abc.png  '为什么很多人不愿意用hibernate了-') 
  
![Test](https://oscimg.oschina.net/oscnet/up-4caf476092dcdebf4612298259c5c492abc.png  '为什么很多人不愿意用hibernate了-') 
![Test](https://oscimg.oschina.net/oscnet/up-4caf476092dcdebf4612298259c5c492abc.png  '为什么很多人不愿意用hibernate了-') 
![Test](https://oscimg.oschina.net/oscnet/up-4caf476092dcdebf4612298259c5c492abc.png  '为什么很多人不愿意用hibernate了-') 
![Test](https://oscimg.oschina.net/oscnet/up-4caf476092dcdebf4612298259c5c492abc.png  '为什么很多人不愿意用hibernate了-') 
四、被喷之后的一些感悟 
感觉就是一场批斗大会，我深深的感觉到才疏学浅的无奈，我真的只是想好好学习而已，希望若干年后，我还能初心不改。 
作为一个初级程序员而言，没有必要花费过多的时间去证明技术的无用论，我并没有对hibernate这个框架进行深入的研究，只是在肤浅的层面的一些个人感悟。 
框架本身并没有对错一说，只有适合不适合，任何框架都有其自身的能力范围，hibernate封装了很多有用的API给我们，降低了操作数据库的难度和复杂度，同时也减少了模板代码的数量，但hibernate留给开发者的可操作空间相对mybatis少了很多；mybatis框架使用起来更加灵活，开发者可以自定义查询语句，但增加了模板代码量，看起来并没有hibernate边界。两种框架在便捷与灵活两个指标上做出了取舍和妥协，这不能说是框架的错。对于一个框架而言，需要有自身专注的领域和设计愿景，不可能面面俱到，就如这位大哥所言： 
![Test](https://oscimg.oschina.net/oscnet/up-4caf476092dcdebf4612298259c5c492abc.png  '为什么很多人不愿意用hibernate了-') 
使用任何一种技术框架，都需要贴合现实的业务需求以及自身的技术能力。当你还没有深入的去了解一门技术或者当前业务需求无法与框架契合时，不要盲目的批判框架的好坏。 
  
本博主已经全面进军CSDN，希望大家支持我一下，非常感谢！ 
【CSDN】为什么很多人不愿意用hibernate了? 
  
 
                                        