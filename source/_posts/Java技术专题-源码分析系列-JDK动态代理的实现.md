---
title: 推荐系列-Java技术专题-源码分析系列-JDK动态代理的实现
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 1305
cover_picture: ''
abbrlink: b54190b3
date: 2021-04-15 09:26:24
---

&emsp;&emsp;JDK动态代理到底是怎么实现？ JDK的动态代理的类看不见摸不着，虽然可以看到效果，但是底层到底是怎么做的，为什么要求实现接口呢? 从Proxy.newProxyInstance入手 public static Object new...
<!-- more -->

                                                                                                                                                                                        ### JDK动态代理到底是怎么实现？ 
 
#### 从Proxy.newProxyInstance入手 
 
 ```java 
      public static Object newProxyInstance(ClassLoader loader,
                                          Class<?>[] interfaces,
                                          InvocationHandler h)
        throws IllegalArgumentException{
        // 判空，判断 h 对象是否为空，为空就抛出 NullPointerException
        Objects.requireNonNull(h);
        final Class<?>[] intfs = interfaces.clone();
        final SecurityManager sm = System.getSecurityManager();
        if (sm != null) {
　　　      // 进行包访问权限、类加载器等权限检查
           checkProxyAccess(Reflection.getCallerClass(), loader, intfs);
        }
        /*
         * Look up or generate the designated proxy class.
         * 查找或生成指定的代理类
         */
        Class<?> cl = getProxyClass0(loader, intfs);
        // 省略若干代码
    }

  ``` 
  
第一步，尝试获取代理类，该代理类可能会被缓存，如果没有缓存，那么进行生成逻辑. 
#### java.lang.reflect.Proxy#getProxyClass0 
 
 ```java 
      private static Class<?> getProxyClass0(ClassLoader loader,
                                           Class<?>... interfaces) {
        // 数量超过 65535 就抛出异常，665535 这个就不用说了吧
        if (interfaces.length > 65535) {
            throw new IllegalArgumentException("interface limit exceeded");
        }
        // 如果代理类已经通过类加载器对给定的接口进行实现了，那么从缓存中返回其副本
        // 否则，它将通过ProxyClassFactory创建代理类
        return proxyClassCache.get(loader, interfaces);
    }

  ``` 
  
最后发现会对生成的代理类进行缓存，有了，就不直接返回，没有的，还得生成代理类，我们继续往下走： 
 
 ```java 
  proxyClassCache = new WeakCache<>(new KeyFactory(), new ProxyClassFactory());

  ``` 
  
#### java.lang.reflect.Proxy.ProxyClassFactory#apply 
关键点在于 ProxyClassFactory 这个类，从名字也可以猜出来这个类的作用。看��代码： 
 
 ```java 
  /**
     * A factory function that generates, defines and returns the proxy class given
     * the ClassLoader and array of interfaces.
     */
    private static final class ProxyClassFactory
        implements BiFunction<ClassLoader, Class<?>[], Class<?>>
    {
        // prefix for all proxy class names 定义前缀
        private static final String proxyClassNamePrefix = "$Proxy";

        // next number to use for generation of unique proxy class names  原子操作，适用于多线程
        private static final AtomicLong nextUniqueNumber = new AtomicLong();
        public Class<?> apply(ClassLoader loader, Class<?>[] interfaces) {
		            Map<Class<?>, Boolean> interfaceSet = new IdentityHashMap<>(interfaces.length);
            for (Class<?> intf : interfaces) {
                /*
                 * Verify that the class loader resolves the name of this
                 * interface to the same Class object.
                 */
                Class<?> interfaceClass = null;
                try {
　　　　　　　　　　　　// 通过反射获取到接口类
                    interfaceClass = Class.forName(intf.getName(), false, loader);
                } catch (ClassNotFoundException e) {
                }
　　　　　　　　　// 所得到的接口类与传进来的不相等，说明不是同一个类
                if (interfaceClass != intf) {
                    throw new IllegalArgumentException(
                        intf + " is not visible from class loader");
                }
                /*
                 * Verify that the Class object actually represents an
                 * interface.
                 */
                if (!interfaceClass.isInterface()) {
                    throw new IllegalArgumentException(
                        interfaceClass.getName() + " is not an interface");
                }
                /*
                 * Verify that this interface is not a duplicate. 
                 */
                if (interfaceSet.put(interfaceClass, Boolean.TRUE) != null) {
                    throw new IllegalArgumentException(
                        "repeated interface: " + interfaceClass.getName());
                }
            }

            String proxyPkg = null;     // package to define proxy class in
            int accessFlags = Modifier.PUBLIC | Modifier.FINAL;

            /*
             * Record the package of a non-public proxy interface so that the
             * proxy class will be defined in the same package.  Verify that
             * all non-public proxy interfaces are in the same package.
             */
            for (Class<?> intf : interfaces) {
                int flags = intf.getModifiers();
                if (!Modifier.isPublic(flags)) {
                    accessFlags = Modifier.FINAL;
                    String name = intf.getName();
                    int n = name.lastIndexOf('.');
                    String pkg = ((n == -1) ? "" : name.substring(0, n + 1));
                    if (proxyPkg == null) {
                        proxyPkg = pkg;
                    } else if (!pkg.equals(proxyPkg)) {
                        throw new IllegalArgumentException(
                            "non-public interfaces from different packages");
                    }
                }
            }

            if (proxyPkg == null) {
                // if no non-public proxy interfaces, use com.sun.proxy package
                proxyPkg = ReflectUtil.PROXY_PACKAGE + ".";
            }
            /*
             * Choose a name for the proxy class to generate.
             */
            long num = nextUniqueNumber.getAndIncrement();
　　　　　　　// 生产代理类的名字
            String proxyName = proxyPkg + proxyClassNamePrefix + num;
            // 一些验证、缓存、同步的操作,不是我们研究的重点
            /*
             * Generate the specified proxy class.
             * 生���特殊的代理类
             */
            byte[] proxyClassFile = ProxyGenerator.generateProxyClass(
                proxyName, interfaces, accessFlags);
            try {
                return defineClass0(loader, proxyName,
                                    proxyClassFile, 0, proxyClassFile.length);
            } catch (ClassFormatError e) {
                /*
                 * A ClassFormatError here means that (barring bugs in the
                 * proxy class generation code) there was some other
                 * invalid aspect of the arguments supplied to the proxy
                 * class creation (such as virtual machine limitations
                 * exceeded).
                 */
                throw new IllegalArgumentException(e.toString());
            }
        }
    }

  ``` 
  
ProxyGenerator.generateProxyClass(proxyName, interfaces, accessFlags);`` 
这段代码即为生成动态代理类的关键,执行完后会返回该描述该代理类的字节码数组.随后程序读取该字节码数组，将其转化为运行时的数据结构-Class对象,作为一个常规类使用. 
 
 ```java 
      public static byte[] generateProxyClass(final String var0, Class<?>[] var1, int var2) {
        ProxyGenerator var3 = new ProxyGenerator(var0, var1, var2);
        final byte[] var4 = var3.generateClassFile();
        // 如果声明了需要持久化代理类，则进行磁盘写入.
        if (saveGeneratedFiles) {
            AccessController.doPrivileged(new PrivilegedAction<Void>() {
                public Void run() {
                    try {
                        int var1 = var0.lastIndexOf(46);
                        Path var2;
                        if (var1 > 0) {
                            Path var3 = Paths.get(var0.substring(0, var1).replace('.', File.separatorChar));
                            Files.createDirectories(var3);
                            var2 = var3.resolve(var0.substring(var1 + 1, var0.length()) + ".class");
                        } else {
                            var2 = Paths.get(var0 + ".class");
                        }
                        Files.write(var2, var4, new OpenOption[0]);
                        return null;
                    } catch (IOException var4x) {
                        throw new InternalError("I/O exception saving generated file: " + var4x);
                    }
                }
            });
        }
        return var4;
    }

  ``` 
  
这里我们找到了一个关键的判断条件-saveGeneratedFiles,即是否需要将代���类进行持久化. 
##### ProxyGenerator.generateProxyClass 
 
 ```java 
  public class ProxyGeneratorUtils {
    /**
     * 把代理类的字节码写到硬盘上 
     * @param path 保存路径 
     */
    public static void writeProxyClassToHardDisk(String path) {
// 获取代理类的字节码  
        byte[] classFile = ProxyGenerator.generateProxyClass("$Proxy11", Student.class.getInterfaces());
 
        FileOutputStream out = null;
 
        try {
            out = new FileOutputStream(path);
            out.write(classFile);
            out.flush();
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            try {
                out.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}

  ``` 
  
可以发现，在根目录下生成了一个 $Proxy0.class 文件，文件内容反编译后如下： 
 
 ```java 
  import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.lang.reflect.UndeclaredThrowableException;
import proxy.Person;

public final class $Proxy0 extends Proxy implements Person
{
  private static Method m1;
  private static Method m2;
  private static Method m3;
  private static Method m0;
  
  /**
  *注意这里是生成代理类的构造方法，方法参数为InvocationHandler类型，看到这，是不是就有点明白
  *为何代理对象调用方法都是执行InvocationHandler中的invoke方法，而InvocationHandler又持有一个
  *被代理对象的实例，不禁会想难道是....？ 没错，就是你想的那样。
  *
  *super(paramInvocationHandler)，是调用父类Proxy的构造方法。
  *父类持有：protected InvocationHandler h;
  *Proxy构造方法：
  *    protected Proxy(InvocationHandler h) {
  *         Objects.requireNonNull(h);
  *         this.h = h;
  *     }
  *
  */
  public $Proxy0(InvocationHandler paramInvocationHandler)
    throws 
  {
    super(paramInvocationHandler);
  }
  
  //这个静态块本来是在最后的，我把它拿到前面来，方便描述
   static
  {
    try
    {
      //看看这儿静态块儿里面有什么，是不是找到了giveMoney方法。请记住giveMoney通过反射得到的名字m3，其他的先不管
      m1 = Class.forName("java.lang.Object").getMethod("equals", new Class[] { Class.forName("java.lang.Object") });
      m2 = Class.forName("java.lang.Object").getMethod("toString", new Class[0]);
      m3 = Class.forName("proxy.Person").getMethod("giveMoney", new Class[0]);
      m0 = Class.forName("java.lang.Object").getMethod("hashCode", new Class[0]);
      return;
    }
    catch (NoSuchMethodException localNoSuchMethodException)
    {
      throw new NoSuchMethodError(localNoSuchMethodException.getMessage());
    }
    catch (ClassNotFoundException localClassNotFoundException)
    {
      throw new NoClassDefFoundError(localClassNotFoundException.getMessage());
    }
  }
 
  /**
  * 
  *这里调用代理对象的giveMoney方法，直接就调用了InvocationHandler中的invoke方法，并把m3传了进去。
  *this.h.invoke(this, m3, null);这里简单，明了。
  *来，再想想，代理对象持有一个InvocationHandler对象，InvocationHandler对象持有一个被代理的对象，
  *再联系到InvacationHandler中的invoke方法。嗯，就是这样。
  */
  public final void giveMoney()
    throws 
  {
    try
    {
      this.h.invoke(this, m3, null);
      return;
    }
    catch (Error|RuntimeException localError)
    {
      throw localError;
    }
    catch (Throwable localThrowable)
    {
      throw new UndeclaredThrowableException(localThrowable);
    }
  }

  //注意，这里为了节省篇幅，省去了toString，hashCode、equals方法的内容。原理和giveMoney方法一毛一样。

}

  ``` 
  
 
  jdk 为我们的生成了一个叫 $Proxy0（这个名字后面的0是编号，有多个代理类会一次递增）的代理类，这��类文件时放在内存中的，我们在创建代理对象时，就是通过反射获得这个类的构造方法，然后创建的代理实例。通过对这个生成的代理类源码的查看，我们很容易能看出，动态代理实现的具体过程。  
  我们可以对 InvocationHandler 看做一个中介类，中介类持有一个被代理对象，在 invoke 方法中调用了被代理对象的相应方法，而生成的代理类中持有中介类，因此，当我们在调用代理类的时候，就是再调用中介类的 invoke 方法，通过反射转为对被代理对象的调用。  
  代理类调用自己方法时，通过自身持有的中介类对象来调用中介类对象的 invoke 方法，从而达到代理执行被代理对象的方法。也就是说，动态代理通过中介类实现了具体的代理功能。  
  生成的代理类：$Proxy0 extends Proxy implements Person，我们看到代理类继承了 Proxy 类，所以也就决定了 java 动态代理只能对接口进行代理，Java 的继承机制注定了这些动态代理类们无法实现对 class 的动态代理。  

                                        