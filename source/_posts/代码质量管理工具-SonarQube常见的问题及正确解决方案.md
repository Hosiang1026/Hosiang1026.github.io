---
title: 推荐系列-代码质量管理工具-SonarQube常见的问题及正确解决方案
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 686
cover_picture: 'https://static.oschina.net/uploads/img/202003/20105049_LsJB.jpeg'
abbrlink: 76d71ac9
date: 2021-04-14 07:54:42
---

&emsp;&emsp;SonarQube 简介 Sonar 是一个用于代码质量管理的开放平台。通过插件机制，Sonar 可以集成不同的测试工具，代码分析工具，以及持续集成工具。 与持续集成工具（例如 Hudson/Jenkins 等）不同，...
<!-- more -->

                                                                                                                                                                                         
### SonarQube 简介 
Sonar 是一个用于代码质量管理的开放平台。通过插件机制，Sonar 可以集成不同的测试工具，代码分析工具，以及持续集成工具。 
与持续集成工具（例如 Hudson/Jenkins 等）不同，Sonar 并不是简单地把不同的代码检查工具结果（例如 FindBugs，PMD 等）直接显示在 Web 页面上，而是通过不同的插件对这些结果进行再加工处理，通过量化的方式度量代码质量的变化，从而可以方便地对不同规模和种类的工程进行代码质量管理。 
在对其他工具的支持方面，Sonar 不仅提供了对 IDE 的支持，可以在 Eclipse 和 IntelliJ IDEA 这些工具里联机查看结果；同时 Sonar 还对大量的持续集成工具提供了接口支持，可以很方便地在持续集成中使用 Sonar。 
此外，Sonar 的插件还可以对 Java 以外的其他编程语言提供支持，对国际化以及报告文档化也有良好的支持 
  
 
  
  
 
### Math operands should be cast before assignment-数字操作在操作或赋值前要分配 
对整数执行算术运算时，结果将始终是整数。您可以通过自动类型转换将该结果分配给long，double或float类型，但是以int或long形式开始时，结果可能不会达到您的期望。 
例如，如果将int除法的结果分配给浮点变量，则在分配之前将失去精度。同样，如果将乘法结果分配给long，则在分配之前它可能已经溢出。 
不合规代码 
 ```java 
  float twoThirds = 2/3; // Noncompliant; int division. Yields 0.0
long millisInYear = 1_000*3_600*24*365; // Noncompliant; int multiplication. Yields 1471228928
long bigNum = Integer.MAX_VALUE + 2; // Noncompliant. Yields -2147483647
long bigNegNum =  Integer.MIN_VALUE-1; //Noncompliant, gives a positive result instead of a negative one.
Date myDate = new Date(seconds * 1_000); //Noncompliant, won't produce the expected result if seconds > 2_147_483
...
public long compute(int factor){
  return factor * 10_000;  //Noncompliant, won't produce the expected result if factor > 214_748
}

public float compute2(long factor){
  return factor / 123;  //Noncompliant, will be rounded to closest long integer
}
  ```  
合规代码 
 ```java 
  float twoThirds = 2f/3; // 2 promoted to float. Yields 0.6666667
long millisInYear = 1_000L*3_600*24*365; // 1000 promoted to long. Yields 31_536_000_000
long bigNum = Integer.MAX_VALUE + 2L; // 2 promoted to long. Yields 2_147_483_649
long bigNegNum =  Integer.MIN_VALUE-1L; // Yields -2_147_483_649
Date myDate = new Date(seconds * 1_000L);
...
public long compute(int factor){
  return factor * 10_000L;
}

public float compute2(long factor){
  return factor / 123f;
}

或者是
float twoThirds = (float)2/3; // 2 cast to float
long millisInYear = (long)1_000*3_600*24*365; // 1_000 cast to long
long bigNum = (long)Integer.MAX_VALUE + 2;
long bigNegNum =  (long)Integer.MIN_VALUE-1;
Date myDate = new Date((long)seconds * 1_000);
...
public long compute(long factor){
  return factor * 10_000;
}

public float compute2(float factor){
  return factor / 123;
}
  ```  
  
分析 
本项sonar 规则，主要是Java 中 小类型可以向大的类型转换，如int 可以自动向long 转换。避免这种自动转换引发的问题，就是本规则的初衷。 
让开发者可以明确的清楚当前数据的类型。 
 
### Strings and Boxed types should be compared using "equals()" 
字符串和包装类型对比时应该使用equals方法。 
使用引用相等==或!=比较java.lang.String或包装类型（如java.lang.Integer）的两个实例几乎总是false，因为它不是��比较实际值，而是在内存中的位置。 
不合格的代码 
 ```java 
  String firstName = getFirstName(); // String overrides equals
String lastName = getLastName();

if (firstName == lastName) { ... }; // Non-compliant; false even if the strings have the same value
  ```  
合规的代码 
 ```java 
  String firstName = getFirstName();
String lastName = getLastName();

if (firstName != null && firstName.equals(lastName)) { ... };
  ```  
分析 
在Java 中包装类型与基本数据类型存储位置不同。 
Java 基本数据类型存放位置 
 
  方法参数、局部变量存放在栈内存中的栈桢中的局部变量表  
  常量存放在常量池中  
 
包装类型如Integer存放位置 
 
  常量池  
  堆内存  
 
Integer 存储在常量池中时可以使用==对比，但当在堆内存中时，使用==对比，实际对比的是两个内存地址而非值。 
根据Integer源码， 
 
  
可以看出数值在-128-127时，会使用cache中的数据，其实也就是常量池。超过范围后新创建Integer，此时数据就无法使用==。 
本项规则，主要就是为了避免对比内存地址而引发的错误判断。 
 
### Boxing and unboxing should not be immediately reversed 
装箱（创建int/Integer类型值的对象）和拆箱（将对象中原始值解出来）不应连续操作。 
由于在装箱和拆箱期间原始值保持不变，因此在不需要时进行任何操作都是没有意义的。这也适用于自动装箱和自动拆箱（当Java为您隐式处理原始/对象转换时）。 
 不合规代码   
 ```java 
  public void examineInt(int a) {
  //...
}

public void examineInteger(Integer a) {
  // ...
}

public void func() {
  int i = 0;
  Integer iger1 = Integer.valueOf(0);
  double d = 1.0;

  int dIntValue = new Double(d).intValue(); // Noncompliant

  examineInt(new Integer(i).intValue()); // Noncompliant; explicit box/unbox
  examineInt(Integer.valueOf(i));  // Noncompliant; boxed int will be auto-unboxed

  examineInteger(i); // Compliant; value is boxed but not then unboxed
  examineInteger(iger1.intValue()); // Noncompliant; unboxed int will be autoboxed

  Integer iger2 = new Integer(iger1); // Noncompliant; unnecessary unboxing, value can be reused
}
  ```  
合规代码 
 ```java 
  public void examineInt(int a) {
  //...
}

public void examineInteger(Integer a) {
  // ...
}

public void func() {
  int i = 0;
  Integer iger1 = Integer.valueOf(0);
  double d = 1.0;

  int dIntValue = (int) d;

  examineInt(i);

  examineInteger(i);
  examineInteger(iger1);
}
  ```  
分析 
拆箱，与装箱数值没有发生变化，但在大数据量前提下是极其浪费时间。以下实例中，两者耗时相差10倍。此项目检查主要是提高性能。 
 ```java 
   
  ```  
 
### Intermediate Stream methods should not be left unused 
中间流方法不应该闲置，应该提供对应的终端操作（流操作有两种类型:中间操作(返回另一个流)和终端操作(返回比流更多的内容)。中间操作是惰性的，如果中间流操作的结果没有提供给终端操作，那么它就没有任何作用） 
不合规 
 ```java 
  widgets.stream().filter(b -> b.getColor() == RED); // Noncompliant

  ```  
合规 
 ```java 
  int sum = widgets.stream()
                      .filter(b -> b.getColor() == RED)
                      .mapToInt(b -> b.getWeight())
                      .sum();
Stream<Widget> pipeline = widgets.stream()
                                 .filter(b -> b.getColor() == GREEN)
                                 .mapToInt(b -> b.getWeight());
sum = pipeline.sum();
  ```  
 
###  Loops with at most one iteration should be refactored 
循环执行一次应该重构。 
不合规 
 ```java 
  for (int i = 0; i < 10; i++) { // noncompliant, loop only executes once
  printf("i is %d", i);
  break;
}
...
for (int i = 0; i < 10; i++) { // noncompliant, loop only executes once
  if(i == x) {
    break;
  } else {
    printf("i is %d", i);
    return;
  }
}
  ```  
不合规 
 ```java 
  for (int i = 0; i < 10; i++) {
  printf("i is %d", i);
}
...
for (int i = 0; i < 10; i++) {
  if(i == x) {
    break;
  } else {
    printf("i is %d", i);
  }
}
  ```  
 
### Non-thread-safe fields should not be static 
非线程安全的属性不能设置为静态 
不合规 
 ```java 
  public class MyClass {
  private static SimpleDateFormat format = new SimpleDateFormat("HH-mm-ss");  // Noncompliant
  private static Calendar calendar = Calendar.getInstance();  // Noncompliant
  ```  
 合规 
 ```java 
  public class MyClass {
  private SimpleDateFormat format = new SimpleDateFormat("HH-mm-ss");
  private Calendar calendar = Calendar.getInstance();
  ```  
分析 
线程不安全的类型设置为静态后，对于静态变量来说，类在加载的时候会占用同一个存储区，而每个线程都是公用这个存储区的，因此存在线程安全的问题。 
在多并发的过程中容易产生问题，而且问题原因不易跟踪。 
 
###  "InterruptedException" should not be ignored 
绝不应该在代码中忽略InterruptedExceptions，在这种情况下，只需将异常计数记录为“忽略”即可。抛出InterruptedException会清除Thread的中断状态，因此，如果未正确处理该异常，则该线程被中断的事实将丢失。相反，应该立即或在清除方法状态后重新抛出InterruptedExceptions-或应该通过调用Thread.interrupt（）重新中断线程，即使这应该是单线程应用程序也是如此。任何其他措施可能会导致线程关闭延迟，并丢失该线程被中断的信息-可能未完成其任务。 
  
不合规代码 
 ```java 
  InterruptedExceptions should never be ignored in the code, and simply logging the exception counts in this case as "ignoring". The throwing of the InterruptedException clears the interrupted state of the Thread, so if the exception is not handled properly the fact that the thread was interrupted will be lost. Instead, InterruptedExceptions should either be rethrown - immediately or after cleaning up the method's state - or the thread should be re-interrupted by calling Thread.interrupt() even if this is supposed to be a single-threaded application. Any other course of action risks delaying thread shutdown and loses the information that the thread was interrupted - probably without finishing its task.

public void run () {
  try {
    while (true) {
      // do stuff
    }
  }catch (InterruptedException e) { // Noncompliant; logging is not enough
    LOGGER.log(Level.WARN, "Interrupted!", e);
  }
}
  ```  
  
合规 
 ```java 
  public void run () {
  try {
    while (true) {
      // do stuff
    }
  }catch (InterruptedException e) {
    LOGGER.log(Level.WARN, "Interrupted!", e);
    // Restore interrupted state...
    Thread.currentThread().interrupt();
  }
}
  ```  
 
### 总结 
sonarqube 进行代码质量检查，不仅可以分析当前代码已存在问题。也可以通过问题进行分析，把错误的代码习惯，改正。 
长期使用sonarqube，可以培养开发者写优秀代码。降低bug率。 
头条号一般是首发。 
头条号： 
 
公众号 
 
 
                                        