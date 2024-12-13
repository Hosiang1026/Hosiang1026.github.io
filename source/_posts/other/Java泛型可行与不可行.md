---
title: 推荐系列-Java泛型可行与不可行
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 685
cover_picture: 'https://static.oschina.net/uploads/img/202004/03131329_BuTQ.jpg'
abbrlink: d1b1e9f6
date: 2021-04-14 07:54:42
---

&emsp;&emsp;泛型基础 理解 一般情况，一个类的属性，或者一个方法的参数/返回值都需要在编写代码时声明基本类型或者自定义类型，但有时候无法在编写代码时使用现有的类来表达参数类型或者返回值类型，这...
<!-- more -->

                                                                                                                                                                                        ### 泛型基础 
#### 理解 
​ 一般情况，一个类的属性，或者一个方法的参数/返回值都需要在编写代码时声明基本类型或者自定义类型，但有时候无法在编写代码时使用现有的类来表达参数类型或者返回值类型，这时候就需有一种方式可以表达下面的意思：这里需要一个类，它满足这些要求就可以了，具体是什么类可以在使用这个类或方法时指定。Java中这种方式就是泛型。但是java泛型在使用上有很多限制，使用时要注意，同时注意泛型主义上的理解，Java中泛型的声明使用更多 
#### 作用 
​ 一定程序上继承与接口就可以完成上面的功能，但泛型有很多额外的作用 
 
  泛型可以更安全 使用泛型就是告诉编译器想使用什么类型，在使用泛型时编译器会对代码进行类型检查，让错误暴露在编译期，而不是运行期，更安全  
  可以快速创建复杂的类型 因为在编写时没有指定具体类型，所以在使用时就可以更随意的指定类型，这个功能可以完成类似js中对象的功能，对象的属性规定好，具体是什么类型你随便，但是没能像js那样随意添加属性  ```java 
  public class TupleTest<T, R> {

    public final T t;
    public final R r;

    public TupleTest(T t, R r) {
        this.t = t;
        this.r = r;
    }

    public static <A, B> TupleTest<A, B> make(A a, B b) {
        return new TupleTest<>(a, b);
    }

    /**
     * 如果返回值声明里声明了泛型，那么在方法返回值 new 时就要有尖括号，不然会警告
     * jdk1.5中返回值声明时的泛型去掉，也会有编译警告
     *
     * @return tupleTest
     */
    public TupleTest<String, String> make() {
        return new TupleTest<>("a", "b");
    }

     public R getR() {
        return r;
    }
}

  ```   
  可以自动完成类型的转换  
 
在泛型出现之前，如果一个方法不能确定方法的返回值类型，或者根据入参可以确定多种类型返回值类型，那么这个方法就只能返回Object ，有了泛型之后，在方法返回正确的值后，会自动转为具体的类型，而这在代码上没有额外的代码，而且这种转换很安全 
上面例子编译之后再反编译回来 make 方法是这样的 
 ```java 
   public com.zoro.thinkinginjava.four.TupleTest<String, String> make() {
    return new com.zoro.thinkinginjava.four.TupleTest((T)"a", (R)"b");
  }

  ```  
再看一个调用时的代码 
 ```java 
  public class TupleMain {

    public static void main(String[] args) {
        TupleTest<Apple, Orange> tuple = new TupleTest<>(new Apple(), new Orange());

        Orange orange = tuple.getR();
    }
}

  ```  
反编译之后 
 ```java 
  public class TupleMain {
  public static void main(String[] args) {
    TupleTest<Apple, Orange> tuple = new TupleTest(new Apple(), new Orange());
    Orange orange = (Orange)tuple.getR();
  }
}

  ```  
可以看到自动对参数进行了转型,所以编译器不会产生��型警告 
 
 还有一些更高级的用法，比如 泛型自限定 
 
#### 困难之处 
书写泛型代码的主要困难是因为泛型在运行时被擦除，所以在运行期没有泛型类的具体信息，这意味着泛型参数看上去就借一个Object类，什么都干不了，需要注意以下方法 
 
  同样的类型，不同的泛型参数在编译期代表着不同类型，在运行期就没有差别了  ```java 
  public class EraseMain {

    public static void main(String[] args) {
        List<String> list1 = new ArrayList<>();
        List<Integer> list2 = new ArrayList<>();
//        list1 = list2; // 编译期是不同的
        System.out.println(list1.getClass().getName());
        System.out.println(list2.getClass().getName());
        // 运行期类型是相同的
        System.out.println(list1.getClass() == list2.getClass());
    }

}

  ```   
  不能使用 new 来创建泛型类型的具体对象，最好的方案是使用 Class.newInstance()或者使用工场模式  ```java 
  public T getNewInstance() {
        // return new T();
        // Error:(12, 20) java: 意外的类型
        //  需要: 类
        //  找到:    类型参数T
        try {
            return t.newInstance();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

  ```   
  不能使用 instanceof 操作符了，但可以用 Class.isInstance(Object)方法  ```java 
  public class EraseEntity<T> {

    Class<T> tClass;

    public EraseEntity(Class<T> tClass) {
        this.tClass = tClass;
    }

    public boolean instanceOf(Object t) {
//        return t instanceof T; // 这样就不可以了
        return tClass.isInstance(t); // 这样是可以的
    }

}

  ```   
  不能new 一个泛型数组，而且要产生泛型数组非常麻烦，可以使用Array.newInstance(Class<?>,int)  ```java 
      public T[] createArray(){
        return (T[]) Array.newInstance(t,5);
    }

  ```  但是这样也会有警告，需要压制  
  除非设定边界，否则不能调用任何自定义的方法  
  基本类型不能作为泛型参数，但是其包装类型可以，并可以自动包装  ```java 
  //        List<int> list2 = new ArrayList<>();
        List<Integer> list2 = new ArrayList<>();

  ```   
  一个类不能实现同一个泛型接口的两种变体，但去掉泛型实现可以；  ```java 
  public class ImplTest extends AbstractA implements InterfaceA<Integer> {
//public class ImplTest extends AbstractA implements InterfaceA<String> {
// ImplTest类实现InterfaceA接口时声明的泛型参数是String,AbstractA实现InterfaceA时声明的泛型参数是 Integer,这时就不可以了，
// 如果可以会导致类型冲突,比如 get方法，在AbstractA中返回值是Integer,但是在ImplTest中就变成了String，无论重载或重写都不能解决这个问题
}

interface InterfaceA<T> {
    T get(T t);

}

abstract class AbstractA implements InterfaceA<Integer> {
    public Integer get(Integer integer) {
        return 0;
    }
}

  ```   
  不能通过不同的泛型参数进行方法重载，但是可以使用  ```java 
  <R extends List<?>>
  ```  给泛型参数添加边界重载方法  ```java 
  public class OverLoadTest {

    public <T> void test(T t) { }

    // 因为T与R没有设置边界在运行时 T与R 都是类似Object，所以不能通过方法签名区分这两个方法
//    public <R> void test(R r) { }

    // 这样是可以的 因为R一定会是一个List的子类，List与Object（T）是有区别的，就可以通过方法签名区分了
    public <R extends List<?>> void test(R r) {    }
}

  ```   
 
#### 泛型边界 
可以使用 extends 限定泛型类型的边界，可以是多个（&连接），类写在前面，限定边界之后在泛型方法或者类的内部就可以使用边界类上的方法了 
 ```java 
  public class WildCardTest<T extends List<String> & Iterable<String> & InterfaceA<?>> {


    public void test(T t) {
        t.add("");  // List接口的方法
        t.iterator(); // Iterable接口的方法
        t.testMethod(); // InterfaceA方法
    }

}

interface InterfaceA<T>{

    //    void add(T t); // List接口也有同样方法签名的方法，所以在 同时将 List与InterfaceA设置为上边界时List与InterfaceA的泛型参数要兼容，否则也会出错
    void testMethod();

}


  ```  
##### 通配符 
通配符在泛型中的应用是为了解决下面的问题：有一个容器的泛型是基类的变量，想要将一个泛型是子类的容器赋值给这个变量，编译器是不允许的；因为运行时会将泛型擦除，一旦将一个泛型是子类的容器赋值给泛型是基类的容器变量，在运行时就可以将一个这个基类的其他子类对象放入这个窗口，造成在取出对象时的类型不安全，所以编译期不允许这样赋值; 
 ```java 
  public class WildCardTest<T extends List<String> & Iterable<String> & InterfaceA<?>> {

    public static void main(String[] args) {
        List<InterfaceA<String>> list ;
        List<Impl> impls = new ArrayList<>();
//        list = impls;
        // 将 impls赋值给 list是不可以的，原因：
        // 1. 编译期 List<InterfaceA<String>> 与 List<Impl>是不同的且不能向上转型
        // 2. 一旦允许这样赋值，那么之后 的操作会出现类型问题，比如此例，将一个ArrayList<Impl> 赋值给 List<InterfaceA>变量list，
        // 那么之后可以向list 中add 一个 Impl2对象，Impl2与Impl不兼容
    }
}
interface InterfaceA<T>{}

class Impl implements InterfaceA<String> {}

class Impl2 implements InterfaceA<String> {}


  ```  
容器的这一特点与数组不同，子类数组对象可以赋值给基类数组变量（类似向上转型），但是在运行期jvm 可以知道数组元素中的对象类型是哪个具体子类，所以如果将数组中元素赋值时，如果不是原数组中的类型，会报错（ArrayStoreException） 
 ```java 
  public class WildCardTest2 {
    public static void main(String[] args) {
        InterfaceA<?>[] arr1 = new Impl[3];
        arr1[0] = new Impl();
        //会报错
        //arr1[2] = new Impl2();

        // 兼容的类型可以
        InterfaceA<?>[] arr2 = new InterfaceA[4];
        arr2[0] = new Impl();
        arr2[0] = new Impl2();
    }

}

  ```  
为了保证类型安全，又可以将子类泛型容器赋值给基类泛型变量，可以使用通配符（单一边界，extends 后面只能有一个类型） 
##### 通配符的困难之处 
当一个类在声明时使用了<? extends Fruit> 这种泛型，而这个类的写法如同下面这样 
 ```java 
  class TestClass<T>{
	public void test(T t){
		// somecode
	}
    public void test2(Object o){
        // somecode
    }
}

  ```  
在使用时 
 ```java 
  TestClass<? extends Fruit> f = new TestClass<Apple>;

  ```  
这样写会出现的问题是不能调用 ```java 
  test(T)
  ``` 方法了，因为test 需要的是一个具体的Fruit 的子类，例子中应该是Applie,但  ```java 
  ? extends Fruit 
  ```  代表的不仅仅是 Apple 这一种子类，也可能是 orange 。如果调用时真的用orange 类型实例做为能数，类型就不安全，所以 ```java 
   test(T)
  ```  方法不能用了；但是  ```java 
   test2(Object)
  ```  还可以用 
##### 逆变 
逆变指的是  ```java 
  < ? super Apple>
  ```  这种写法，这种写法的特性与  ```java 
  <? extends Apple> 
  ```  的写法的特性是相反的。上面的例子，泛型入参方法不能用了，而逆变的特性是入参可以是任何Apple 的子类，注意是子类，不是基类，因为Apple 的基类有多种，如果编译器允许传入基类���就会存在风险，但是传入子类就不会有风险，因为子类可以转型为Apple 类，Apple 类可以算是Apple的基类； 
 ```java 
  public class WildcardTest4 {

    public static void main(String[] args) {
        List<? super Apple> appleList = new ArrayList<Fruit>();
        List<? super Apple> appleList2 = new ArrayList<Apple>();
        List<? super Apple> appleList3 = new ArrayList<>();
        // 前三种情况都可以，但是这种不可以
//    List<? super Apple> appleList4 = new ArrayList<BigApple>();

        // 不可以
        //appleList3.add(new Orange());
        appleList3.add(new Apple());
        appleList3.add(new BigApple());
        // 虽然字面上是 任何 Apple 的父类，但是Apple父类很多，不能确定类型，所以实际上任何Apple 的父类都不行
        //appleList3.add(new Fruit());
        
        // 只能Object 接
        Object a = appleList3.get(1);
    }


}

class Fruit {}

class Orange extends Fruit {}

class Apple extends Fruit {}

class BigApple extends Apple implements Runnable {
    @Override
    public void run() {
    }
}

class SmallApple extends Apple {}

  ```  
逆变的困难之处在于方法的返回值，它的返回值只能用Object 类型的变量接受 
##### 无界通配符 
两个功能 
 
 这里想用泛型代码来编写，这里并不是要用原生的类型，但是当前情况下，泛型参数可以持有任何类型 
 当有个地方需要多个泛型参数，但你只能确定一部分时可以使用无界通配符 ```java 
  ？
  ```  例： ```java 
  Map<String, ?>
  ```  
 当一个地方要求泛型，如果你没有给出泛型，会有警告，但使用无界通配符会消除警告 
 
无界通配符与原生类型是不一样的，以 ```java 
  List
  ```  和 ```java 
  List<?>
  ```  为例， ```java 
  List
  ```  代表持有任何Object类型的List, ```java 
  List<?>
  ``` 代表具有某种特定类型的的非原生List,但目前不确定是什么类型； 
下面例子显示这种区别 
 ```java 
  public class WildcardTest5 {

    public static void main(String[] args) {
        List list = new ArrayList();
        list.add(new Apple());// 有警告，但是不会编译报错
        Object o = list.get(0);

        List<?> list1 = new ArrayList<>();
//        list1.add(new Apple());// 不可这样写，编译报错
    }
}

  ```  
#### 总结 
在使用泛型时，时刻都要想着，我这样定义泛型，编译器为了保证泛型安全，这里我只能接受什么样的类型； 方法的返回值会是什么样的；同时要想着这里是否会发生转型
                                        