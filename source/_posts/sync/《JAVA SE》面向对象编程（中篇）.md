---
title: 推荐系列-《JAVA SE》面向对象编程（中篇）
categories: 热门文章
tags:
  - Popular
author: csdn
top: 2
date: 2022-05-11 05:16:57
cover_picture: 'https://profile.csdnimg.cn/8/8/B/3_qq_43575801'
---

&emsp;&emsp;前言上一篇已经讲过包、继承和多态，链接如下：《JAVA SE》面向对象编程（上篇）下面会给各位老铁总结面向对象编程的最后两个知识点： 抽象类和接口。一、（补充）在构造方法中调用重写的方法（坑）一段有坑的代码. 我们创建两个类, B 是父类, D 是子类. D 中重写 func 方法. 并且在 B 的构造方法中调用 func。class B {    public B() {        // do nothing        func();    }    public voi
<!-- more -->

        
                
                    
                        
                    
                    ### 前言 
 
 ```java 
  上一篇已经讲过包、继承和多态，链接如下：
  ``` 
  
《JAVA SE》面向对象编程（上篇） 
下面会给各位老铁总结面向对象编程的最后两个知识点： 抽象类和接口。 
 
### 一、（补充）在构造方法中调用重写的方法（坑） 
一段有坑的代码. 我们创建两个类, B 是父类, D 是子类. D 中重写 func 方法. 并且在 B 的构造方法中调用 func。 
 
 ```java 
  class B {
    public B() {
        // do nothing
        func();
    }

    public void func() {
        System.out.println("B.func()");
    }
}

class D extends B {
    private int num = 1;

    @Override
    public void func() {
        System.out.println("D.func() " + num);
    }
}

public class Test {
    public static void main(String[] args) {
        D d = new D();
    }
}

  ``` 
  
程序执行结果如下：  ✦ 构造 D 对象的同时, 会调用 B 的构造方法. ✦ B 的构造方法中调用了 func 方法, 此时会触发动态绑定, 会调用到 D 中的 func(). ✦ 此时 D 对象自身还没有构造, 此时 num 处在未初始化的状态, 值为 0. 
 
### 二、抽象类 
#### 2.1 语法规则 
在上篇打印图形例子中, 我们发现, 父类 Shape 中的 draw 方法好像并没有什么实际工作, 主要的绘制图形都是由Shape 的各种子类的 draw 方法来完成的. 像这种没有实际工作的方法, 我们可以把它设计成一个抽象方法(abstract method), 包含抽象方法的类我们称为 抽象类(abstract class). 
 
 ```java 
  abstract class Shape { 
 abstract public void draw(); 
}

  ``` 
  
★ 在 draw 方法前加上 abstract 关键字, 表示这是一个抽象方法. 同时抽象方法没有方法体(没有 { }, 不能执行具体代码). 
★ 对于包含抽象方法的类, 必须加上 abstract 关键字表示这是一个抽象类（抽象方法指的是只有函数声明，没有函数实现的方法，如上代码） 
#### 2.2 注意事项 
抽象类不能直接实例化，哪怕该类中一个抽象方法都没有。 
 
 ```java 
  Shape shape = new Shape(); 
// 编译出错
Error:(30, 23) java: Shape是抽象的; 无法实例化

  ``` 
  
抽象方法不能是 private 的，因为子类无法重写。 
 
 ```java 
  abstract class Shape { 
 abstract private void draw(); 
} 
// 编译出错
Error:(4, 27) java: 非法的修饰符组合: abstract和private

  ``` 
  
抽象类中可以包含其他的非抽象方法, 也可以包含字段. 这个非抽象方法和普通方法的规则都是一样的, 可以被重写,也可以被子类直接调用 
 
 ```java 
  abstract class Shape { 
 abstract public void draw(); 
 void func() { 
 System.out.println("func"); 
 } 
} 
class Rect extends Shape { 
 ... 
} 
public class Test { 
 public static void main(String[] args) { 
 Shape shape = new Rect(); 
 shape.func(); 
 } 
} 
// 执行结果
func

  ``` 
  
 抽象方法所在的类必须是抽象类，子类若继承了抽象类，必须覆写所有的抽象方法（子类是普通类的情况下），抽象类也可以被抽象类继承，此时可以留给这个抽象类的子类去覆写。  题目：JAVA中没有方法体的方法就是抽象方法（✘） 本地方法也没有方法体，但它不是抽象方法。  抽象类是普通类的超集（普通类有的内容，抽象类都有），只是比普通类多了一些抽象方法而已，抽象类虽然没法直接实例对象，但是也可以存在构造方法，子类在实例化时，仍然遵从继承原则，先调用父类（抽象类）的构造方法，而后调用子类的构造方法！！！  
 输出num=0是因为print语句是在父类构造方法中完成的，此时还没进到子类的构造方法中，num还未初始化，默认值为0。 
#### 2.3 抽象类的作用 
✦抽象类存在的最大意义就是为了被继承. ✦抽象类本身不能被实例化, 要想使用, 只能创建该抽象类的子类. 然后让子类重写抽象类中的抽象方法。 
✦使用抽象类相当于多了一重编译器的校验。 ✦使用抽象类的场景就如上面的代码, 实际工作不应该由父类完成, 而应由子类完成. 那么此时如果不小心误用成父类了,使用普通类编译器是不会报错的.但是父类是抽象类就会在实例化的时候提示错误, 让我们尽早发现问题 
 
### 三、接口 
接口是抽象类的更进一步. 抽象类中还可以包含非抽象方法, 和字段. 而接口中包含的方法都是抽象方法, 字段只能包含静态常量。 
#### 3.1 语法规则 
在刚才的打印图形的示例中, 我们的父类 Shape 并没有包含别的非抽象方法, 也可以设计成一个接口： 
 
 ```java 
  interface IShape {
    void draw();
}
class Cycle implements IShape {
    @Override
    public void draw() {
        System.out.println("○");
    }
}
public class Test {
    public static void main(String[] args) {
        IShape shape = new Cycle();
        shape.draw();
    }
} 

  ``` 
  
✦使用 interface 定义一个接口 
✦接口中的方法一定是抽象方法, 因此可以省略 abstract 
✦接口中的方法一定是 public, 因此可以省略 public 
✦Cycle 使用 implements 继承接口. 此时表达的含义不再是 “扩展”, 而是 “实现” 
✦在调用的时候同样可以创建一个接口的引用, 对应到一个子类的实例. 
✦接口不能单独被实例化. 
✦接口允许多实现 
 
接口中只能包含抽象方法. 对于字段来说, 接口中只能包含静态常量(final static). 
 
 ```java 
  interface IShape {
    void draw();

    public static final int num = 10;
}

  ``` 
  
其中的 public, static, final 的关键字都可以省略. 省略后的 num 仍然表示 public 的静态常量: 
 
 ```java 
  interface IShape {
    void draw();

    int num = 10;
}

  ``` 
  
注意事项： 
我们创建接口的时候, 接口的命名一般以大写字母 I 开头.接口的命名一般使用 “形容词” 词性的单词.阿里编码规范中约定, 接口中的方法和属性不要加任何修饰符号, 保持代码的简洁性，只保留方法返回值，方法参数列表，名称即可子类实现一个接口的时候，命名以相对应的接口开头，以impl结尾。 eg：如果是IRun的子类，则建议命名为RunImpl（也不是强制要求） 如果子类实现多个父接口，不需要使用此规范命名。 
 
#### 3.2 实现多个接口（可看可不看） 
有的时候我们需要让一个类同时继承自多个父类. 这件事情在有些编程语言通过 多继承 的方式来实现的. 
然而 Java 中只支持单继承, 一个类只能 extends 一个父类. 但是可以同时实现多个接口, 也能达到多继承类似的效果. 
现在我们通过类来表示一组动物： 
 
 ```java 
  class Animal {
    protected String name;

    public Animal(String name) {
        this.name = name;
    }
} 

  ``` 
  
另外我们再提供一组接口, 分别表示 “会飞的”, “会跑的”, “会游泳的” 
 
 ```java 
  interface IFlying {
    void fly();
}
interface IRunning {
    void run();
}
interface ISwimming {
    void swim();
} 

  ``` 
  
接下来我们创建几个具体的动物 猫, 是会跑的 
 
 ```java 
  class Cat extends Animal implements IRunning {
    public Cat(String name) {
        super(name);
    }
    @Override
    public void run() {
        System.out.println(this.name + "正在用四条腿跑");
    }
} 

  ``` 
  
鱼, 是会游的 
 
 ```java 
  class Fish extends Animal implements ISwimming {
    public Fish(String name) {
        super(name);
    }
    @Override
    public void swim() {
        System.out.println(this.name + "正在用尾巴游泳");
    }
} 

  ``` 
  
青蛙, 既能跑, 又能游(两栖动物) 
 
 ```java 
  class Frog extends Animal implements IRunning, ISwimming {
    public Frog(String name) {
        super(name);
    }
    @Override
    public void run() {
        System.out.println(this.name + "正在往前跳");
    }
    @Override
    public void swim() {
        System.out.println(this.name + "正在蹬腿游泳");
    }
}

  ``` 
  
还有一种神奇的动物, 水陆空三栖, 叫做 “鸭子” 
 
 ```java 
  class Duck extends Animal implements IRunning, ISwimming, IFlying {
    public Duck(String name) {
        super(name);
    }
    @Override
    public void fly() {
        System.out.println(this.name + "正在用翅膀飞");
    }
    @Override
    public void run() {
        System.out.println(this.name + "正在用两条腿跑");
    }
    @Override
    public void swim() {
        System.out.println(this.name + "正在漂在水上");
    }
} 

  ``` 
  
上面的代码展示了 Java 面向对象编程中最常见的用法: 一个类继承一个父类, 同时实现多种接口. 
继承表达的含义是 is - a 语义, 而接口表达的含义是 具有 xxx 特性 
 
这样设计有什么好处呢? 时刻牢记多态的好处, 让程序猿忘记类型. 有了接口之后, 类的使用者就不必关注具体类型, 而只关注某个类是否具备某种能力. 
例如, 现在实现一个方法, 叫 “散步” 
 
 ```java 
  public static void walk(IRunning running) {
    System.out.println("我带着伙伴去散步");
    running.run();
} 

  ``` 
  
在这个 walk 方法内部, 我们并不关注到底是哪种动物, 只要参数是会跑的, 就行 
 
 ```java 
  Cat cat = new Cat("小猫"); 
walk(cat); 
Frog frog = new Frog("小青蛙"); 
walk(frog); 
// 执行结果
我带着伙伴去散步
小猫正在用四条腿跑
我带着伙伴去散步
小青蛙正在往前跳

  ``` 
  
甚至参数可以不是 “动物”, 只要会跑! 
 
 ```java 
  class Robot implements IRunning {
    private String name;

    public Robot(String name) {
        this.name = name;
    }

    @Override
    public void run() {
        System.out.println(this.name + "正在用轮子跑");
    }
}
    Robot robot = new Robot("机器人");

    walk(robot);
// 执行结果
机器人正在用轮子跑


  ``` 
  
### 总结 
以上给大家介绍了抽象类以及接口的定义和语法规则，关于常用的接口以及实例，我们会在下篇讲解，未完待续~
                
                
                
        