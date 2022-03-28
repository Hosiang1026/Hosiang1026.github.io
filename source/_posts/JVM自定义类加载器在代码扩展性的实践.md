---
title: 推荐系列-JVM自定义类加载器在代码扩展性的实践
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 318
cover_picture: 'https://static001.geekbang.org/infoq/90/90a38cd54568568a85533928bfa686ef.png'
abbrlink: df179d31
date: 2022-03-27 11:55:56
---

&emsp;&emsp;背景 名单管理系统是手机上各个模块将需要管控的应用配置到文件中，然后下发到手机上进行应用管控的系统，比如各个应用的耗电量管控；各个模块的管控应用文件考虑到安全问题，有自己的不...
<!-- more -->

                                                                                                                    
名单管理系统是手机上各个模块将需要管控的应用配置到文件中，然后下发到手机上进行应用管控的系统，比如各个应用的耗电量管控；各个模块的管控应用文件考虑到安全问题，有自己的不同的加密方式，按照以往的经验，我们可以利用模板方法+工厂模式来根据模块的类型来获取到不同的加密方法。代码类层次结构示意如下: 
 
获取不同加密方法的类结构图 
利用工厂模式和模板方法模式，在有新的加密方法时，我们可以通过添加新的handler来满足"对修改关闭，对扩展开放"的原则，但是这种方式不可避免的需要修改代码和需要重新发版本���上���。那么有没有更好的方式能够去解决这个问题，这里就是我们今天要重点讲的主题。 
### 二、类加载的时机 
一个类型从被加载到虚拟机内存中开始，到卸载出内存为止，它的整个生命周期将会经历加载 （Loading）、验证（Verification）、准备（Preparation）、解析（Resolution）、初始化 （Initialization）、使用（Using）和卸载（Unloading）七个阶段，其中验证、准备、解析三个部分统称为连接（Linking）。这七个阶段的发生顺序如图1所示。 
 
虽然classloader的加载过程有复杂的7步，但事实上除了加载之外的四步，其它都是由JVM虚拟机控制的，我们除了适应它的规范进行开发外，能够干预的空间并不多。而加载则是我们控制classloader实现特殊目的最重要的手段了。也是接下来我们介绍的重点了。 
### 三、加载 
“加载”（Loading）阶段是整个“类加载”（Class Loading）过程中的一个阶段。在加载阶段，Java虚拟机需要完成以下三件事情： 
 
  通过一个类的全限定名来获取定义此类的二进制字节流。  
  将这个字节流所代表的静态存储结构转化为方法区的运行时数据结构。  
  在内存中生成一个代表这个类的java.lang.Class对象，作为方法区这个类的各种数据的访问入口。  
 
《Java虚拟机规范》对这三点没有进行特别具体的要求，从而留给虚拟机实现与Java应用的灵活度都是相当大的。例如“通过一个类的全限定名来获取定义此类的二进制字节流”这条规则，它并没有指明二 进制字节流必须得从某个Class文件中获取，确切地说是根本没有指明要从哪里获取、如何获取。比如我们可以从ZIP压缩包中读取、从网络中获取、运行时计算生成、由其他文件生成、从数据库中读取。也可以可以从加密文件中获取。 
从这里我们可以看出，只需要我们能够获取到加密类的.class文件，我们就可以通过类加载器获取到对应的加密类class对象，进而通过反射去调用具体的加密方法。因此类加载器在.class文件的加载过程有着至关重要的地位。 
### 四、双亲委派模型 
目前Java虚拟机已经存在三种类加载器，分别为启动类加载器、扩展类加载器和应用程序类加载器；绝大多数的Java程序都会使用这三种类加载器进行加载。 
 
#### 4.1 启动类加载器 
这个类由C++实现，负责加载存放在\lib目录，或者被-Xbootclasspath参数所指定的路径中存放的，而且是Java虚拟机能够识别的（按照文件名识别，如rt.jar、tools.jar，名字不符合的类库即使放在lib目录中也不会被加载）类库加载到虚拟机的内存中。启动类加载器无法被Java程序直接引用，用户在编写自定义类加载器时， 如果需要把加载请求委派给引导类加载器去处理，那直接使用null代替即可。 
#### 4.2 扩展类加载器 
这个类加载器是在类sun.misc.Launcher$ExtClassLoader 中以Java代码的形式实现的。它负责加载\lib\ext目录中，或者被java.ext.dirs系统变量所指定的路径中所有的类库。根据“扩展类加载器”这个名称，就可以推断出这是一种Java系统类库的扩展机制，JDK的开发团队允许用户将具有通用性的类库放置在ext目录里以扩展Java SE的功能，在JDK9之后，这种扩展机制被模块化带来的天然的扩展能力所取代。由于扩展类加载器是由Java代码实现的，开发者可以直接在程序中使用扩展类加载器来加载Class文件。 
#### 4.3 应用程序类加载器 
这个类加载器由sun.misc.Launcher$AppClassLoader来实现。由于应用程序类加载器是ClassLoader类中的getSystemClassLoader()方法的返回值，所以有些场合中也称它为“系统类加载器”。它负责加载用户类路径（ClassPath）上所有的类库，开发者同样可以直接在代码中使用这个类加载器。如果应用程序中没有自定义过自己的类加载器，一般情况下这个就是程序中默认的类加载器。 
由于现有的类加载器加载路径都有特殊的要求，自己所编译的加密类所产生的.class文件所存放的路径不在三个现有类加载器的路径里面，因此我们有必要自己定义类加载器。 
### 五、自定义类加载器 
除了根类加载器，所有类加载器都是ClassLoader的子类。所以我们可以通过继承ClassLoader来实现自己的类加载器。 
ClassLoader类有两个关键的方法： 
 
  protected Class loadClass(String name, boolean resolve)：name为类名，resove如果为true，在加载时解析该类。  
  protected Class findClass(String name) ：根据指定类名来查找类。  
 
所以，如果要实现自定义类，可以重写这两个方法来实现。但推荐重写findClass方法，而不是重写loadClass方法，重写loadClass方法可能会破坏类加载的双亲委派模型，因为loadClass方法内部会调用findClass方法。 
 
 ```java 
  protected Class<?> loadClass(String name, boolean resolve)
        throws ClassNotFoundException
    {
        synchronized (getClassLoadingLock(name)) {
            // First, check if the class has already been loaded
            Class<?> c = findLoadedClass(name);
            if (c == null) {
                long t0 = System.nanoTime();
                try {
                    if (parent != null) {
                        c = parent.loadClass(name, false);
                    } else {
                        c = findBootstrapClassOrNull(name);
                    }
                } catch (ClassNotFoundException e) {
                    // ClassNotFoundException thrown if class not found
                    // from the non-null parent class loader
                }
 
                if (c == null) {
                    // If still not found, then invoke findClass in order
                    // to find the class.
                    long t1 = System.nanoTime();
                    c = findClass(name);
 
                    // this is the defining class loader; record the stats
                    sun.misc.PerfCounter.getParentDelegationTime().addTime(t1 - t0);
                    sun.misc.PerfCounter.getFindClassTime().addElapsedTimeFrom(t1);
                    sun.misc.PerfCounter.getFindClasses().increment();
                }
            }
            if (resolve) {
                resolveClass(c);
            }
            return c;
        }
    }


  ``` 
  
loadClass加载方法流程： 
 
  判断此类是否已经加载；  
  如果父加载器不为null，则使用父加载器进行加载；反之，使用根加载器进行加载；  
  如果前面都没加载成功，则使用findClass方法进行加载。  
 
所以，为了不影响类的加载过程，我们重写findClass方法即可简单方便的实现自定义类加载。 
### 六、代码实现 
#### 6.1 实现自定义的类加载器 
 
 ```java 
  public class DynamicClassLoader extends ClassLoader {
 
    private static final String CLASS_EXTENSION = "class";
 
    @Override
    public Class<?> findClass(String encryptClassInfo) {
        EncryptClassInfo info = JSON.parseObject(encryptClassInfo, EncryptClassInfo.class);
        String filePath = info.getAbsoluteFilePath();
        String systemPath = System.getProperty("java.io.tmpdir");
        String normalizeFileName = FilenameUtils.normalize(filePath, true);
        if (StringUtils.isEmpty(normalizeFileName) || !normalizeFileName.startsWith(systemPath)
                ||getApkFileExtension(normalizeFileName) == null
                || !CLASS_EXTENSION.equals(getApkFileExtension(normalizeFileName))) {
            return null;
        }
 
        String className = info.getEncryptClassName();
        byte[] classBytes = null;
        File customEncryptFile = new File(filePath);
        try {
            Path path = Paths.get(customEncryptFile.toURI());
            classBytes = Files.readAllBytes(path);
        } catch (IOException e) {
            log.info("加密错误", e);
        }
        if (classBytes != null) {
            return defineClass(className, classBytes, 0, classBytes.length);
        }
        return null;
    }
 
    private static String getApkFileExtension(String fileName) {
        int index = fileName.lastIndexOf(".");
        if (index != -1) {
            return fileName.substring(index + 1);
        }
        return null;
    }
}

  ``` 
  
这里主要是通过集成ClassLoader，复写findClass方法，从加密类信息中获取到对应的.class文件信息，最后获取到加密类的对象 
#### 6.2 .class文件中的encrypt()方法 
 
 ```java 
  public String encrypt(String rawString) {
        String keyString = "R.string.0x7f050001";
        byte[] enByte = encryptField(keyString, rawString.getBytes());
        return Base64.encode(enByte);
    }

  ``` 
  
#### 6.3 具体的调用 
 
 ```java 
  public class EncryptStringHandler {
 
    private static final Map<String, Class<?>> classMameMap = new HashMap<>();
 
    @Autowired
    private VivofsFileHelper vivofsFileHelper;
 
    @Autowired
    private DynamicClassLoader dynamicClassLoader;
 
    public String encryptString(String fileId, String encryptClassName, String fileContent) {
        try {
            Class<?> clazz = obtainEncryptClass(fileId, encryptClassName);
            Object obj = clazz.newInstance();
            Method method = clazz.getMethod("encrypt", String.class);
            String encryptStr = (String) method.invoke(obj, fileContent);
            log.info("原字符串为:{},加密后的字符串为:{}", fileContent, encryptStr);
            return encryptStr;
        } catch (Exception e) {
            log.error("自定义加载器加载加密类异常", e);
            return null;
        }
    }
 
    private Class<?> obtainEncryptClass(String fileId, String encryptClassName) {
        Class<?> clazz = classMameMap.get(encryptClassName);
        if (clazz != null) {
            return clazz;
        }
 
        String absoluteFilePath = null;
        try {
            String domain = VivoConfigManager.getString("vivofs.host");
            String fullPath = domain + "/" + fileId;
            File classFile = vivofsFileHelper.downloadFileByUrl(fullPath);
            absoluteFilePath = classFile.getAbsolutePath();
            EncryptClassInfo encryptClassInfo = new EncryptClassInfo(encryptClassName, absoluteFilePath);
            String info = JSON.toJSONString(encryptClassInfo);
            clazz = dynamicClassLoader.findClass(info);
            //设置缓存
            Assert.notNull(clazz, "自定义类加载器加载加密类异常");
            classMameMap.put(encryptClassName, clazz);
            return clazz;
        } finally {
            if (absoluteFilePath != null) {
                FileUtils.deleteQuietly(new File(absoluteFilePath));
            }
        }
    }
}

  ``` 
  
通过上述代码的实现，我们可以通过在管理平台添加编译好的.class文件，最后通过自定义的类加载器和反射调用方法，来实现具体方法的调用，避免了我们需要修改代码和重新发版来适应不断新增加密方法的问题。 
### 七、问题 
上面的代码在本地测试时，没有出现任何异常，但是部署到测试服务器以后出现了JSON解析异常，看上去貌似是json字符串的格式不对。 
 
json解析逻辑主要存在于DynamicClassLoader#findClass方法入口处的将字符串转换为对象���辑���为什么这里会报错，我们在入口处打印了入参。 
 
发现这里除了我们需要的正确的入参(第一个入参信息打印)外，还多了一个Base64的全路径名cn.hutool.core.codec.Base64。出现这种情况，说明由于我们重写了ClassLoader的findClass方法，而Base64加载的时候会调用原始的ClassLoader类的loadClass方法去加载，并且里面调用了findClass方法，由于findClass已经被重写，所以就会报上面的json解析错误。 
 
 ```java 
  protected Class<?> loadClass(String name, boolean resolve)
        throws ClassNotFoundException
    {
        synchronized (getClassLoadingLock(name)) {
            // First, check if the class has already been loaded
            Class<?> c = findLoadedClass(name);
            if (c == null) {
                long t0 = System.nanoTime();
                try {
                    if (parent != null) {
                        c = parent.loadClass(name, false);
                    } else {
                        c = findBootstrapClassOrNull(name);
                    }
                } catch (ClassNotFoundException e) {
                    // ClassNotFoundException thrown if class not found
                    // from the non-null parent class loader
                }
 
                if (c == null) {
                    // If still not found, then invoke findClass in order
                    // to find the class.
                    long t1 = System.nanoTime();
                    c = findClass(name);
 
                    // this is the defining class loader; record the stats
                    sun.misc.PerfCounter.getParentDelegationTime().addTime(t1 - t0);
                    sun.misc.PerfCounter.getFindClassTime().addElapsedTimeFrom(t1);
                    sun.misc.PerfCounter.getFindClasses().increment();
                }
            }
            if (resolve) {
                resolveClass(c);
            }
            return c;
        }
    }

  ``` 
  
但是这里期望的是除了用于加密的.class文件用自定义类加载器进行以外，不希望其他的类用自定义类加载器加载，通过对ClassLoader#loadClass方法分析，那么我们就希望能否通过其父类加载器加载到Base64这个三方类。因为启动类加载器Bootstrap Class Loader肯定不能加载到Base64，所以我们需要显示的设置父类加载器，但是这个父类加载器究竟设置为哪一个类加载器，那么就需要我们了解Tomcat类加载器结构。 
为什么Tomcat需要在JVM基础之上做一套类加载结构，主要是为了解决如下问题: 
 
  部署在同一个服务器上的两个web应用程序所使用的Java类库可以实现相互隔离；  
  部署在同一个服务器上的两个web应用程序所使用的Java类库可以实现共享；  
  服务器需要尽可能保证自身安全，服务器所使用的类库应该与应用程序的类库相互独立；  
  支持JSP应用的Web服务器，大对数需要支持HotSwap功能。  
 
为此，tomcat扩展出了Common类加载器(CommonClassLoader)、Catalina类加载器(CatalinaClassLoader)、Shared类加载器(SharedClassLoader)和WebApp类加载器(WebAppClassLoader)，他们分别加载/commons/、/server/、/shared/*和/WebApp/WEB-INF/*中的Java类库的逻辑。 
 
通过分析，我们知道WebAppClassLoader类加载器可以加载到/WEB-INF/*目录下的依赖包，而我们所依赖的类cn.hutool.core.codec.Base64所在的包hutool-all-4.6.10-sources.jar就存在于/WEB-INF/*目录下面，并且我们自定义类加载器所在的包 vivo-namelist-platform-service-1.0.6.jar也在/WEB-INF/*下，所以自定义类加载器DynamicClassLoader也是WebAppClassLoader加载的。 
我们可以写一个测试类测试一下: 
 
 ```java 
  @Slf4j
@Component
public class Test implements ApplicationListener<ContextRefreshedEvent> {
 
    @Override
    public void onApplicationEvent(ContextRefreshedEvent event) {
        log.info("classLoader DynamicClassLoader:" + DynamicClassLoader.class.getClassLoader().toString());
    }
}

  ``` 
  
测试结果: 
 
所以我们可以设置自定义类加载器DynamicClassLoader的父加载器为加载其本身的类加载器： 
 
 ```java 
  public DynamicClassLoader() {
        super(DynamicClassLoader.class.getClassLoader());
}

  ``` 
  
我们再次执行文件的加解密操作时，已经没有发现报错，并且通过添加日志，我们可以看到加载类cn.hutool.core.codec.Base64对应的类加载器确实为加载DynamicClassLoader对应的类加载器WebAppClassLoader。 
 
 ```java 
  public String encrypt(String rawString) {
        log.info("classLoader Base64:{}", Base64.class.getClassLoader().toString());
        String keyString = "R.string.0x7f050001";
        byte[] enByte = encryptField(keyString, rawString.getBytes());
        return Base64.encode(enByte);
    }

  ``` 
  
 
现在再来思考一下，为什么在IDEA运行环境下不需要设置自定义类加载器的父类加载器就可以加载到cn.hutool.core.codec.Base64。 
在IDEA运行环境下添加如下打印信息: 
 
 ```java 
  public String encrypt(String rawString) {
        System.out.println("类加载器详情...");
        System.out.println("classLoader EncryptStrategyHandler:" + EncryptStrategyHandlerH.class.getClassLoader().toString());
        System.out.println("classLoader EncryptStrategyHandler:" + EncryptStrategyHandlerH.class.getClassLoader().getParent().toString());
        String classPath = System.getProperty("java.class.path");
        System.out.println("classPath:" + classPath);
        System.out.println("classLoader Base64:" + Base64.class.getClassLoader().toString());
        String keyString = "R.string.0x7f050001";
        byte[] enByte = encryptField(keyString, rawString.getBytes());
        return Base64.encode(enByte);
    }

  ``` 
  
 
发现加载.class文件的类加载器为自定义类加载器DynamicClassLoader，并且.class加载器的父类加载器为应用类加载器AppClassLoader，加载cn.hutool.core.codec.Base64的类加载器也是AppClassLoader。 
具体的加载流程如下: 
1）先由自定义类加载器委托给AppClassLoader； 
2）AppClassLoader委托给父类加载器ExtClassLoader； 
3）ExtClassLoader再委托给BootStrapClassLoader，但是BootClassLoader无法加载到，于是ExtClassLoader自己进行加载，也无法加载到; 
4）再由AppClassLoader进行加载； 
AppClassLoader会调用其父类UrlClassLoader的findClass方法进行加载； 
5）最终从用户类路径java.class.path中加载到cn.hutool.core.codec.Base64。 
 
 
由此，我们发现在IDEA环境下面，自定义的加密类.class文件中依赖的三方cn.hutool.core.codec.Base64是可以通过AppClassLoader进行加载的。 
而在linux环境下面，经过远程调试，发现初始时加载cn.hutool.core.codec.Base64的类加载器为DynamicClassLoader。然后委托给父类加载器AppClassLoader进行加载，根据双亲委派原理，后续会交由AppClassLoader自己进行处理。但是在用户路径下仍然没有找到类cn.hutool.core.codec.Base64，最终交由DynamicClassLoader进行加载，最终出现了最开始的JSON解析错误。 
 
 
 
 
### 八、总结 
由于类加载阶段没有严格限制如何获取一个类的二进制字节流，因此给我们提供一个通过自定义类加载器来动态加载.class文件实现代码可扩展性的可能。通过灵活自定义classloader，也可以在其他领域发挥重要作用,例如实现代码加密来避免核心代码泄漏、解决不同服务依赖同一个包的不同版本所引起的冲突问题以及实现程序热部署来避免调试时频繁重启应用。 
### 九、参考资料 
1、《深入理解Java虚拟机：JVM高级特性与最佳实践（第3版）》 
2、史上最强--Java类加载器的原理及应用 

                                        