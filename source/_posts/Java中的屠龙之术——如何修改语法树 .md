---
title: 推荐系列-Java中的屠龙之术——如何修改语法树
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 1726
cover_picture: 'https://static.oschina.net/uploads/img/202004/20133021_KxYb.jpg'
abbrlink: e6fec711
date: 2021-04-15 09:19:21
---

&emsp;&emsp;在Lombok经常用，但是你知道它的原理是什么吗？，和Lombok经常用，但是你知道它的原理是什么吗？(二)两篇文章中介绍了关于Lombok的底层原理，其实总结为一句话来说就是在编译期通过改变抽象语...
<!-- more -->

                                                                                                                                                                                        在Lombok经常用，但是你知道它的原理是什么吗？，和Lombok经常用，但是你知道它的原理是什么吗？(二)两篇文章中介绍了关于Lombok的底层原理，其实总结为一句话来说就是在编译期通过改变抽象语法树而实现的。上面两篇文章已经讲了抽象语法树的相关知识点，如果有不清楚的可以看一下。 
本篇涉及到的所有代码都在github上面有 
本篇涉及到的所有代码都在github上面有 
本篇涉及到的所有代码都在github上面有 
在网上关于如何修改Java的抽象语法树的相关API文档并不多，于是本篇记录一下相关的知识点，以便随后查阅。 
#### JCTree的介绍 
JCTree是语法树元素的基类，包含一个重要的字段pos，该字段用于指明当前语法树节点（JCTree）在语法树中的位置，因此我们不能直接用new关键字来创建语法树节点，即使创建了也没有意义。此外，结合访问者模式，将数据结构与数据的处理进行解耦，部分源码如下： 
 ```java 
  public abstract class JCTree implements Tree, Cloneable, DiagnosticPosition {

    public int pos = -1;

    ...

    public abstract void accept(JCTree.Visitor visitor);

    ...
}


  ```  
我们可以看到JCTree是一个抽象类，这里重点介绍几个JCTree的子类 
 
 JCStatement：声明语法树节点，常见的子类如下 
   
   JCBlock：语句块语法树节点 
   JCReturn：return语句语法树节点 
   JCClassDecl：类定义语法树节点 
   JCVariableDecl：字段/变量定义语法树节点 
    
 JCMethodDecl：方法定义语法树节点 
 JCModifiers：访问标志语法树节点 
 JCExpression：表达式语法树节点，常见的子类如下 
   
   JCAssign：赋值语句语法树节点 
   JCIdent：标识符语法树节点，可以是变量，类型，关键字等等 
    
 
#### TreeMaker介绍 
TreeMaker用于创建一系列的语法树节点，我们上面说了创建JCTree不能直接使用new关键字来创建，所以Java为我们提供了一个工具，就是TreeMaker，它会在创建时为我们创建的JCTree对象设置pos字段，所以必须使用上下文相关的TreeMaker对象来创建语法树节点。 
具体的API介绍可以参照，TreeMakerAPI，接下来着重介绍一下常用的几个方法。 
##### TreeMaker.Modifiers 
 ```java 
  TreeMaker.Modifiers
  ``` 方法用于创建访问标志语法树节点（JCModifiers），源码如下 
 ```java 
  public JCModifiers Modifiers(long flags) {
    return Modifiers(flags, List.< JCAnnotation >nil());
}

public JCModifiers Modifiers(long flags,
    List<JCAnnotation> annotations) {
        JCModifiers tree = new JCModifiers(flags, annotations);
        boolean noFlags = (flags & (Flags.ModifierFlags | Flags.ANNOTATION)) == 0;
        tree.pos = (noFlags && annotations.isEmpty()) ? Position.NOPOS : pos;
        return tree;
}

  ```  
 
 flags：访问标志 
 annotations：注解列表 
 
其中flags可以使用枚举类 ```java 
  com.sun.tools.javac.code.Flags
  ``` 来表示，例如我们可以这样用，就生成了下面的访问标志了。 
 ```java 
  treeMaker.Modifiers(Flags.PUBLIC + Flags.STATIC + Flags.FINAL);

public static final


  ```  
##### TreeMaker.ClassDef 
TreeMaker.ClassDef用于创建类定义语法树节点（JCClassDecl）,源码如下： 
 ```java 
  public JCClassDecl ClassDef(JCModifiers mods,
    Name name,
    List<JCTypeParameter> typarams,
    JCExpression extending,
    List<JCExpression> implementing,
    List<JCTree> defs) {
        JCClassDecl tree = new JCClassDecl(mods,
                                     name,
                                     typarams,
                                     extending,
                                     implementing,
                                     defs,
                                     null);
        tree.pos = pos;
        return tree;
}


  ```  
 
 mods：访问标志，可以通过 ```java 
  TreeMaker.Modifiers
  ``` 来创建 
 name：类名 
 typarams：泛型参数列表 
 extending：父类 
 implementing：实现的接口 
 defs：类定义的详细语句，包括字段、方法的定义等等 
 
##### TreeMaker.MethodDef 
TreeMaker.MethodDef用于创建方法定义语法树节点（JCMethodDecl），源码如下 
 ```java 
  public JCMethodDecl MethodDef(JCModifiers mods,
    Name name,
    JCExpression restype,
    List<JCTypeParameter> typarams,
    List<JCVariableDecl> params,
    List<JCExpression> thrown,
    JCBlock body,
    JCExpression defaultValue) {
        JCMethodDecl tree = new JCMethodDecl(mods,
                                       name,
                                       restype,
                                       typarams,
                                       params,
                                       thrown,
                                       body,
                                       defaultValue,
                                       null);
        tree.pos = pos;
        return tree;
}

public JCMethodDecl MethodDef(MethodSymbol m,
    Type mtype,
    JCBlock body) {
        return (JCMethodDecl)
            new JCMethodDecl(
                Modifiers(m.flags(), Annotations(m.getAnnotationMirrors())),
                m.name,
                Type(mtype.getReturnType()),
                TypeParams(mtype.getTypeArguments()),
                Params(mtype.getParameterTypes(), m),
                Types(mtype.getThrownTypes()),
                body,
                null,
                m).setPos(pos).setType(mtype);
}

  ```  
 
 mods：访问标志 
 name：方法名 
 restype：返回类型 
 typarams：泛型参数列表 
 params：参数列表 
 thrown：异常声明列表 
 body：方法体 
 defaultValue：默认方法（可能是interface中的哪个default） 
 m：方法符号 
 mtype：方法类型。包含多种类型，泛型参数类型、方法参数类型、异常参数类型、返回参数类型。 
 
 
##### TreeMaker.VarDef 
TreeMaker.VarDef用于创建字段/变量定义语法树节点（JCVariableDecl），源码如下 
 ```java 
  public JCVariableDecl VarDef(JCModifiers mods,
    Name name,
    JCExpression vartype,
    JCExpression init) {
        JCVariableDecl tree = new JCVariableDecl(mods, name, vartype, init, null);
        tree.pos = pos;
        return tree;
}

public JCVariableDecl VarDef(VarSymbol v,
    JCExpression init) {
        return (JCVariableDecl)
            new JCVariableDecl(
                Modifiers(v.flags(), Annotations(v.getAnnotationMirrors())),
                v.name,
                Type(v.type),
                init,
                v).setPos(pos).setType(v.type);
}

  ```  
 
 mods：访问标志 
 name：参数名称 
 vartype：类型 
 init：初始化语句 
 v：变量符号 
 
##### TreeMaker.Ident 
TreeMaker.Ident用于创建标识符语法树节点（JCIdent），源码如下 
 ```java 
  public JCIdent Ident(Name name) {
        JCIdent tree = new JCIdent(name, null);
        tree.pos = pos;
        return tree;
}

public JCIdent Ident(Symbol sym) {
        return (JCIdent)new JCIdent((sym.name != names.empty)
                                ? sym.name
                                : sym.flatName(), sym)
            .setPos(pos)
            .setType(sym.type);
}

public JCExpression Ident(JCVariableDecl param) {
        return Ident(param.sym);
}


  ```  
##### TreeMaker.Return 
TreeMaker.Return用于创建return语句（JCReturn），源码如下 
 ```java 
  public JCReturn Return(JCExpression expr) {
        JCReturn tree = new JCReturn(expr);
        tree.pos = pos;
        return tree;
}

  ```  
##### TreeMaker.Select 
TreeMaker.Select用于创建域访问/方法访问（这里的方法访问只是取到名字，方法的调用需要用TreeMaker.Apply）语法树节点（JCFieldAccess），源码如下 
 ```java 
  public JCFieldAccess Select(JCExpression selected,
    Name selector) 
{
        JCFieldAccess tree = new JCFieldAccess(selected, selector, null);
        tree.pos = pos;
        return tree;
}

public JCExpression Select(JCExpression base,
    Symbol sym) {
        return new JCFieldAccess(base, sym.name, sym).setPos(pos).setType(sym.type);
}


  ```  
 
 selected： ```java 
  .
  ``` 运算符左边的表达式 
 selector： ```java 
  .
  ``` 运算符右边的表达式 
 
下面给出一个例子，一语句生成的Java语句就是二语句 
 ```java 
  一. TreeMaker.Select(treeMaker.Ident(names.fromString("this")), names.fromString("name"));

二. this.name


  ```  
##### TreeMaker.NewClass 
TreeMaker.NewClass用于创建new语句语法树节点（JCNewClass）,源码如下： 
 ```java 
  public JCNewClass NewClass(JCExpression encl,
    List<JCExpression> typeargs,
    JCExpression clazz,
    List<JCExpression> args,
    JCClassDecl def) {
        JCNewClass tree = new JCNewClass(encl, typeargs, clazz, args, def);
        tree.pos = pos;
        return tree;
}

  ```  
 
 encl：不太明白此参数的含义，我看很多例子中此参数都设置为null 
 typeargs：参数类型列表 
 clazz：待创建对象的类型 
 args：参数列表 
 def：类定义 
 
##### TreeMaker.Apply 
TreeMaker.Apply用于创建方法调用语法树节点（JCMethodInvocation），源码如下： 
 ```java 
  public JCMethodInvocation Apply(List<JCExpression> typeargs,
    JCExpression fn,
    List<JCExpression> args) {
        JCMethodInvocation tree = new JCMethodInvocation(typeargs, fn, args);
        tree.pos = pos;
        return tree;
}

  ```  
 
 typeargs：参数类型列表 
 fn：调用语句 
 args：参数列表 
 
##### TreeMaker.Assign 
TreeMaker.Assign用户创建赋值语句语法树节点（JCAssign），源码如下： 
 ```java 
  ublic JCAssign Assign(JCExpression lhs,
    JCExpression rhs) {
        JCAssign tree = new JCAssign(lhs, rhs);
        tree.pos = pos;
        return tree;
}

  ```  
 
 lhs：赋值语句左边表达式 
 rhs：赋值语句右边表达式 
 
##### TreeMaker.Exec 
TreeMaker.Exec用于创建可执行语句语法树节点（JCExpressionStatement），源码如下： 
 ```java 
  public JCExpressionStatement Exec(JCExpression expr) {
        JCExpressionStatement tree = new JCExpressionStatement(expr);
        tree.pos = pos;
        return tree;
}


  ```  
 
##### TreeMaker.Block 
TreeMaker.Block用于创建组合语句的语法树节点（JCBlock），源码如下： 
 ```java 
  public JCBlock Block(long flags,
    List<JCStatement> stats) {
        JCBlock tree = new JCBlock(flags, stats);
        tree.pos = pos;
        return tree;
}

  ```  
 
 flags：访问标志 
 stats：语句列表 
 
#### com.sun.tools.javac.util.List介绍 
在我们操作抽象语法树的时候，有时会涉及到关于List的操���，���是这个List不是我们经常使用的 ```java 
  java.util.List
  ``` 而是 ```java 
  com.sun.tools.javac.util.List
  ``` ，这个List比较奇怪，是一个链式的结构，有头结点和尾节点，但是只有尾节点是一个List，这里作为了解就行了。 
 ```java 
  public class List<A> extends AbstractCollection<A> implements java.util.List<A> {
    public A head;
    public List<A> tail;
    private static final List<?> EMPTY_LIST = new List<Object>((Object)null, (List)null) {
        public List<Object> setTail(List<Object> var1) {
            throw new UnsupportedOperationException();
        }

        public boolean isEmpty() {
            return true;
        }
    };

    List(A head, List<A> tail) {
        this.tail = tail;
        this.head = head;
    }

    public static <A> List<A> nil() {
        return EMPTY_LIST;
    }

    public List<A> prepend(A var1) {
        return new List(var1, this);
    }

    public List<A> append(A var1) {
        return of(var1).prependList(this);
    }

    public static <A> List<A> of(A var0) {
        return new List(var0, nil());
    }

    public static <A> List<A> of(A var0, A var1) {
        return new List(var0, of(var1));
    }

    public static <A> List<A> of(A var0, A var1, A var2) {
        return new List(var0, of(var1, var2));
    }

    public static <A> List<A> of(A var0, A var1, A var2, A... var3) {
        return new List(var0, new List(var1, new List(var2, from(var3))));
    }

    ...
}


  ```  
#### com.sun.tools.javac.util.ListBuffer 
由于 ```java 
  com.sun.tools.javac.util.List
  ``` 使用起来不方便，所以又在其上面封装了一层，这个封装类是 ```java 
  ListBuffer
  ``` ，此类的操作和我们平时经常使用的 ```java 
  java.util.List
  ``` 用法非常类似。 
 ```java 
  public class ListBuffer<A> extends AbstractQueue<A> {

    public static <T> ListBuffer<T> of(T x) {
        ListBuffer<T> lb = new ListBuffer<T>();
        lb.add(x);
        return lb;
    }

    /** The list of elements of this buffer.
     */
    private List<A> elems;

    /** A pointer pointing to the last element of 'elems' containing data,
     *  or null if the list is empty.
     */
    private List<A> last;

    /** The number of element in this buffer.
     */
    private int count;

    /** Has a list been created from this buffer yet?
     */
    private boolean shared;

    /** Create a new initially empty list buffer.
     */
    public ListBuffer() {
        clear();
    }

    /** Append an element to buffer.
     */
    public ListBuffer<A> append(A x) {
        x.getClass(); // null check
        if (shared) copy();
        List<A> newLast = List.<A>of(x);
        if (last != null) {
            last.tail = newLast;
            last = newLast;
        } else {
            elems = last = newLast;
        }
        count++;
        return this;
    }
    ........
}


  ```  
#### com.sun.tools.javac.util.Names介绍 
这个是为我们创建名称的一个工具类，无论是类、方法、参数的名称都需要通过此类来创建。它里面经常被使用到的一个方法就是 ```java 
  fromString()
  ``` ，一般使用方法如下所示。 
 ```java 
  Names names  = new Names()
names. fromString("setName");


  ```  
#### 实战演练 
上面我们大概了解了如何操作抽象语法树，接下来我们就来写几个真实的案例加深理解。 
##### 变量相关 
在类中我们经常操作的参数就是变量，那么如何使用抽象语法树的特性为我们操作变量呢？接下来我们就将一些对于变量的一些操作。 
###### 生成变量 
例如生成 ```java 
  private String age;
  ``` 这样一个变量，借用我们上面讲的 ```java 
  VarDef
  ``` 方法 
 ```java 
  // 生成参数 例如：private String age;
treeMaker.VarDef(treeMaker.Modifiers(Flags.PRIVATE), names.fromString("age"), treeMaker.Ident(names.fromString("String")), null);


  ```  
###### 对变量赋值 
例如我们想生成 ```java 
  private String name = "BuXueWuShu"
  ``` ，还是利用 ```java 
  VarDef 
  ``` 方法 
 ```java 
  // private String name = "BuXueWuShu"
treeMaker.VarDef(treeMaker.Modifiers(Flags.PRIVATE),names.fromString("name"),treeMaker.Ident(names.fromString("String")),treeMaker.Literal("BuXueWuShu"))


  ```  
###### 两个字面量相加 
例如我们生成 ```java 
  String add = "a" + "b";
  ``` ，借用我们上面讲的 ```java 
  Exec 
  ``` 方法和 ```java 
  Assign 
  ``` 方法 
 ```java 
  // add = "a"+"b"
treeMaker.Exec(treeMaker.Assign(treeMaker.Ident(names.fromString("add")),treeMaker.Binary(JCTree.Tag.PLUS,treeMaker.Literal("a"),treeMaker.Literal("b"))))


  ```  
###### +=语法 
例如我们想生成 ```java 
  add += "test"
  ``` ，则和上面字面量差不多。 
 ```java 
  // add+="test"
treeMaker.Exec(treeMaker.Assignop(JCTree.Tag.PLUS_ASG, treeMaker.Ident(names.fromString("add")), treeMaker.Literal("test")))


  ```  
###### ++语法 
例如想生成 ```java 
  ++i
  ```  
 ```java 
  treeMaker.Exec(treeMaker.Unary(JCTree.Tag.PREINC,treeMaker.Ident(names.fromString("i"))))


  ```  
##### 方法相关 
我们对于变量进行了操作，那么基本上都是要生成方法的，那么如何对方法进行生成和操作呢？我们接下来演示一下关于方法相关的操作方法。 
###### 无参无返回值 
我们可以利用上面讲到的 ```java 
  MethodDef
  ``` 方法进行生成 
 ```java 
  /*
    无参无返回值的方法生成
    public void test(){

    }
 */
// 定义方法体
ListBuffer<JCTree.JCStatement> testStatement = new ListBuffer<>();
JCTree.JCBlock testBody = treeMaker.Block(0, testStatement.toList());
    
JCTree.JCMethodDecl test = treeMaker.MethodDef(
        treeMaker.Modifiers(Flags.PUBLIC), // 方法限定值
        names.fromString("test"), // 方法名
        treeMaker.Type(new Type.JCVoidType()), // 返回类型
        com.sun.tools.javac.util.List.nil(),
        com.sun.tools.javac.util.List.nil(),
        com.sun.tools.javac.util.List.nil(),
        testBody,	// 方法体
        null
);


  ```  
###### 有参无返回值 
我们可以利用上面讲到的 ```java 
  MethodDef
  ``` 方法进行生成 
 ```java 
  /*
    无参无返回值的方法生成
    public void test2(String name){
        name = "xxxx";
    }
 */
ListBuffer<JCTree.JCStatement> testStatement2 = new ListBuffer<>();
testStatement2.append(treeMaker.Exec(treeMaker.Assign(treeMaker.Ident(names.fromString("name")),treeMaker.Literal("xxxx"))));
JCTree.JCBlock testBody2 = treeMaker.Block(0, testStatement2.toList());

// 生成入参
JCTree.JCVariableDecl param = treeMaker.VarDef(treeMaker.Modifiers(Flags.PARAMETER), names.fromString("name"),treeMaker.Ident(names.fromString("String")), null);
com.sun.tools.javac.util.List<JCTree.JCVariableDecl> parameters = com.sun.tools.javac.util.List.of(param);

JCTree.JCMethodDecl test2 = treeMaker.MethodDef(
        treeMaker.Modifiers(Flags.PUBLIC), // 方法限定值
        names.fromString("test2"), // 方法名
        treeMaker.Type(new Type.JCVoidType()), // 返回类型
        com.sun.tools.javac.util.List.nil(),
        parameters, // 入参
        com.sun.tools.javac.util.List.nil(),
        testBody2,
        null
);


  ```  
###### 有参有返回值 
 ```java 
   /*
    有参有返回值
    public String test3(String name){
       return name;
    }
 */

ListBuffer<JCTree.JCStatement> testStatement3 = new ListBuffer<>();
testStatement3.append(treeMaker.Return(treeMaker.Ident(names.fromString("name"))));
JCTree.JCBlock testBody3 = treeMaker.Block(0, testStatement3.toList());

// 生成入参
JCTree.JCVariableDecl param3 = treeMaker.VarDef(treeMaker.Modifiers(Flags.PARAMETER), names.fromString("name"),treeMaker.Ident(names.fromString("String")), null);
com.sun.tools.javac.util.List<JCTree.JCVariableDecl> parameters3 = com.sun.tools.javac.util.List.of(param3);

JCTree.JCMethodDecl test3 = treeMaker.MethodDef(
        treeMaker.Modifiers(Flags.PUBLIC), // 方法限定值
        names.fromString("test4"), // 方法名
        treeMaker.Ident(names.fromString("String")), // 返回类型
        com.sun.tools.javac.util.List.nil(),
        parameters3, // 入参
        com.sun.tools.javac.util.List.nil(),
        testBody3,
        null
);


  ```  
##### 特殊的 
我们学完了如何进行定义参数，如何进行定义方法，其实还有好多语句需要学习，例如如何生成new语句，如何生成方法调用的语句，如何生成if语句。j接下来我们就学习一些比较特殊的语法。 
###### new一个对象 
 ```java 
  // 创建一个new语句 CombatJCTreeMain combatJCTreeMain = new CombatJCTreeMain();
JCTree.JCNewClass combatJCTreeMain = treeMaker.NewClass(
        null,
        com.sun.tools.javac.util.List.nil(),
        treeMaker.Ident(names.fromString("CombatJCTreeMain")),
        com.sun.tools.javac.util.List.nil(),
        null
);
JCTree.JCVariableDecl jcVariableDecl1 = treeMaker.VarDef(
        treeMaker.Modifiers(Flags.PARAMETER),
        names.fromString("combatJCTreeMain"),
        treeMaker.Ident(names.fromString("CombatJCTreeMain")),
        combatJCTreeMain
);


  ```  
###### 方法调用（无参） 
 ```java 
  JCTree.JCExpressionStatement exec = treeMaker.Exec(
        treeMaker.Apply(
                com.sun.tools.javac.util.List.nil(),
                treeMaker.Select(
                        treeMaker.Ident(names.fromString("combatJCTreeMain")), // . 左边的内容
                        names.fromString("test") // . 右边的内容
                ),
                com.sun.tools.javac.util.List.nil()
        )
);


  ```  
###### 方法调用（有参） 
 ```java 
  // 创建一个方法调用 combatJCTreeMain.test2("hello world!");
JCTree.JCExpressionStatement exec2 = treeMaker.Exec(
        treeMaker.Apply(
                com.sun.tools.javac.util.List.nil(),
                treeMaker.Select(
                        treeMaker.Ident(names.fromString("combatJCTreeMain")), // . 左边的内容
                        names.fromString("test2") // . 右边的内容
                ),
                com.sun.tools.javac.util.List.of(treeMaker.Literal("hello world!")) // 方法中的内容
        )
);


  ```  
###### if语句 
 ```java 
  /*
    创建一个if语句
    if("BuXueWuShu".equals(name)){
        add = "a" + "b";
    }else{
        add += "test";
    }
 */
// "BuXueWuShu".equals(name)
JCTree.JCMethodInvocation apply = treeMaker.Apply(
        com.sun.tools.javac.util.List.nil(),
        treeMaker.Select(
                treeMaker.Literal("BuXueWuShu"), // . 左边的内容
                names.fromString("equals") // . 右边的内容
        ),
        com.sun.tools.javac.util.List.of(treeMaker.Ident(names.fromString("name")))
);
//  add = "a" + "b"
JCTree.JCExpressionStatement exec3 = treeMaker.Exec(treeMaker.Assign(treeMaker.Ident(names.fromString("add")), treeMaker.Binary(JCTree.Tag.PLUS, treeMaker.Literal("a"), treeMaker.Literal("b"))));
//  add += "test"
JCTree.JCExpressionStatement exec1 = treeMaker.Exec(treeMaker.Assignop(JCTree.Tag.PLUS_ASG, treeMaker.Ident(names.fromString("add")), treeMaker.Literal("test")));

JCTree.JCIf anIf = treeMaker.If(
        apply, // if语句里面的判断语句
        exec3, // 条件成立的语句
        exec1  // 条件不成立的语句
);


  ```  
#### 源码地址 
#### 总结 
纸上得来终觉浅，绝知此事要躬行。希望大家看完此篇文章能够自己在本机上自己试验一下。自己设置几个参数，自己学的Lombok学着生成一下get、set方法，虽然本篇知识在日常开发中基本上不会用到，但是万一用到了这些知识那么别人不会而你会，差距其实就慢慢的给拉开了。本篇涉及到的所有代码都在github上面有，拉下来以后全局搜 ```java 
  CombatJCTreeProcessor
  ``` 类就可以看到了。
                                        