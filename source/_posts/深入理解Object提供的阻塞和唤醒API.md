---
title: 推荐系列-深入理解Object提供的阻塞和唤醒API
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 898
cover_picture: 'https://static.oschina.net/uploads/img/202008/20142229_q4W7.jpg'
abbrlink: 16d52ba0
date: 2021-04-14 07:56:10
---

&emsp;&emsp;点击上方蓝字 ↑↑ Throwable文摘 关注公众号设置星标，不定时推送高质量原创文章 关注 前提 前段时间花了大量时间去研读JUC中同步器AbstractQueuedSynchronizer的源码实现，再结合很久之前看...
<!-- more -->

                                                                                                                                                                                         
  
   
    
     
      
       
        
         
          
         
        
       
      
      
       
       点击上方蓝字 ↑↑ Throwable文摘 
       
       
       关注公众号设置星标，不定时推送高质量原创文章 
       
      
      
       
        
         
          
           
           关注 
           
          
         
        
       
      
     
    
   
  
  
   
  #### 前提 
  前段时间花了大量时间去研读 ```java 
  JUC
  ``` 中同步器 ```java 
  AbstractQueuedSynchronizer
  ``` 的源码实现，再结合很久之前看过的一篇关于 ```java 
  Object
  ``` 提供的等待和唤醒机制的 ```java 
  JVM
  ``` 实现，发现两者有不少的关联，于是决定重新研读一下 ```java 
  Object
  ``` 中提供的阻塞和唤醒方法。本文阅读 ```java 
  JDK
  ``` 类库源码使用的 ```java 
  JDK
  ``` 版本是 ```java 
  JDK11
  ``` ，因此本文内容可能不适合于其他版本。 
   
  #### Object提供的阻塞和唤醒API 
   ```java 
  java.lang.Object
  ``` 作为所有非基本类型的基类，也就是说所有 ```java 
  java.lang.Object
  ``` 的子类都具备阻塞和唤醒的功能。下面详细分析 ```java 
  Object
  ``` 提供的阻塞和唤醒 ```java 
  API
  ``` ，它们有一共共同特点：必须在 ```java 
  synchronized
  ``` 所修饰的代码块或者方法中使用。 
   
  ##### 阻塞等待-wait 
  等待- ```java 
  wait()
  ``` 方法提供了阻塞的功能，分超时和永久阻塞的版本，实际上，底层只提供了一个JNI方法： 
   ```java 
  // 这个是底层提供的JNI方法，带超时的阻塞等待，响应中断，其他两个只是变体public final native void wait(long timeoutMillis) throws InterruptedException;// 变体方法1，永久阻塞，响应中断public final void wait() throws InterruptedException {    wait(0L);}// 变体方法2，带超时的阻塞，超时时间分两段：毫秒和纳秒，实际上纳秒大于0直接毫秒加1(这么暴力...)，响应中断public final void wait(long timeoutMillis, int nanos) throws InterruptedException {    if (timeoutMillis < 0) {        throw new IllegalArgumentException("timeoutMillis value is negative");    }    if (nanos < 0 || nanos > 999999) {        throw new IllegalArgumentException("nanosecond timeout value out of range");    }    if (nanos > 0) {        timeoutMillis++;    }    wait(timeoutMillis);}
  ```  
  也就是只有一个 ```java 
  wait(long timeoutMillis)
  ``` 方法是JNI接口，其他两个方法相当于： 
   
    
     
      ```java 
  wait()
  ``` 等价于 
      ```java 
  wait(0L)
  ``` 。 
     
    
     
      ```java 
  wait(long timeoutMillis, int nanos)
  ``` 在参数合法的情况下等价于 
      ```java 
  wait(timeoutMillis + 1L)
  ``` 。 
     
   
  由于 ```java 
  wait(long timeoutMillis, int nanos)
  ``` 是参数最完整的方法，它的API注释特别长，这里直接翻译和摘取它注释中的核心要素： 
   
    
    
      当前线程阻塞等待直到被唤醒，唤醒的情况一般有三种： 
      ```java 
  notify(All)
  ``` 被调用、线程被中断或者在指定了超时阻塞的情况下超过了指定的阻塞时间。 
     
    
    
      当前线程必须获取此对象的监视器锁( 
     「monitor lock」)，也就是 
     「调用阻塞等待方法之前一个线程必须成为此对象的监视器锁的拥有者」。 
     
    
    
      用了 
      ```java 
  wait()
  ``` 方法之后，当前线程会把自身放到当前对象的等待集合（ 
      ```java 
  wait-set
  ``` ），然后释放所有在此对象上的同步声明（then to relinquish any nd all synchronization claims on this object），谨记只有当前对象上的同步声明会被释放，当前线程在其他对象上的同步锁只有在调用其 
      ```java 
  wait()
  ``` 方法之后才会释放。 
     
    
     
     「Warning」：线程被唤醒之后（ 
      ```java 
  notify()
  ``` 或者中断）就会从等待集合（ 
      ```java 
  wait-set
  ``` ）中移除并且重新允许被线程调度器调度。通常情况下，这个被唤醒的线程会与其他线程竞争对象上的同步权（锁），一旦线程重新 
     「控制了对象(regained control of the object)」，它对对象的所有同步声明都恢复到以前的状态，即恢复到调用 
      ```java 
  wait()
  ``` 方法时（笔者认为，其实准确来说，是调用 
      ```java 
  wait()
  ``` 方法前）的状态。 
     
    
    
      如果任意线程在它调用了 
      ```java 
  wait()
  ``` 之前，或者调用过 
      ```java 
  wait()
  ``` 方法之后处于阻塞等待状态，一旦线程调用了 
      ```java 
  Thread#interrupt()
  ``` ，线程就会中断并且抛出 
      ```java 
  InterruptedException
  ``` 异常，线程的中断状态会被清除。 
      ```java 
  InterruptedException
  ``` 异常会延迟到在第4点提到"它对对象的所有同步声明都恢复到以前的状态"的时候抛出。 
     
   
  值得注意的还有： 
  「一个线程必须成为此对象的监视器锁的拥有者才能正常调用 ```java 
  wait()
  ``` 系列方法，也就是 ```java 
  wait()
  ``` 系列方法必须在同步代码块（ ```java 
  synchronized
  ``` 代码块）中调用，否则会抛出 ```java 
  IllegalMonitorStateException
  ``` 异常」，这一点是初学者或者不了解 ```java 
  wait()
  ``` 的机制的开发者经常会犯的问题。 
  上面的五点描述可以写个简单的同步代码块伪代码时序总结一下： 
   ```java 
  final Object lock = new Object();synchronized(lock){    1、线程进入同步代码块，意味着获取对象监视器锁成功    while(!condition){        lock.wait();   2.线程调用wait()进行阻塞等待        break;    }    3.线程从wait()的阻塞等待中被唤醒，恢复到第1步之后的同步状态    4.继续执行后面的代码，直到离开同步代码块}
  ```  
   
  ##### 唤醒-notify 
   ```java 
  notify()
  ``` 方法的方法签名如下： 
   ```java 
  @HotSpotIntrinsicCandidatepublic final native void notify();
  ```  
  下面按照惯例翻译一下其API注释： 
   
    
    
      唤醒一个阻塞等待在此对象监视器上的线程，（如果存在多个阻塞线程）至于选择哪一个线程进行唤醒是任意的，取决于具体的现实，一个线程通过调用 
      ```java 
  wait()
  ``` 方法才能阻塞在对象监视器上。 
     
    
    
      被唤醒的线程并不会马上继续执行，直到当前线程（也就是当前调用了 
      ```java 
  notify()
  ``` 方法的线程）释放对象上的锁。被唤醒的线程会与其他线程竞争在对象上进行同步（换言之只有获得对象的同步控制权才能继续执行），在成为下一个锁定此对象的线程时，被唤醒的线程没有可靠的特权或劣势。 
     
    
    
      此方法只有在一个线程获取了此对象监视器的所有权（ 
      ```java 
  the owner
  ``` ）的时候才能调用，具体就是：同步方法中、同步代码块中或者静态同步方法中。否则，会抛出 
      ```java 
  IllegalMonitorStateException
  ``` 异常。 
     
   
   
  ##### 唤醒所有-notifyAll 
   ```java 
  notifyAll()
  ``` 方法的方法签名如下： 
   ```java 
  @HotSpotIntrinsicCandidatepublic final native void notifyAll();
  ```  
   
    
    
      唤醒所有阻塞等待在此对象监视器上的线程，一个线程通过调用 
      ```java 
  wait()
  ``` 方法才能阻塞在对象监视器上。 
     
   
  其他注释的描述和 ```java 
  notify()
  ``` 方法类似。 
   
  ##### synchronized小结 
  我们经常看到的资料中提到 ```java 
  synchronized
  ``` 关键字的用法： 
   
    
    
      普通同步方法，同步或者说锁定的是当前实例对象。 
     
    
    
      静态同步方法，同步或者说锁定的是当前实例对象的 
      ```java 
  Class
  ``` 对象。 
     
    
    
      同步代码块，同步或者说锁定的是括号里面的实例对象。 
     
   
  对于同步代码块而言， ```java 
  synchronized
  ``` 关键字抽象到字节码层面就是同步代码块中的字节码执行在 ```java 
  monitorenter
  ``` 和 ```java 
  monitorexit
  ``` 指令之间： 
   ```java 
  synchronized(xxxx){    ...coding block}↓↓↓↓↓↓↓↓↓↓monitorenter;...coding block - bytecodemonitorexit;
  ```  
   ```java 
  JVM
  ``` 需要保证每���个 ```java 
  monitorenter
  ``` 都有一个 ```java 
  monitorexit
  ``` 与之相对应。任何对象都有一个 ```java 
  monitor
  ``` （实际上是 ```java 
  ObjectMonitor
  ``` ）与之相关联，当且仅当一个 ```java 
  monitor
  ``` 被持有之后，它将处于锁定状态。线程执行到 ```java 
  monitorenter
  ``` 指令时，将会尝试获取对象所对应的 ```java 
  monitor
  ``` 所有权，即尝试获取对象的锁。 
  对于同步（静态）方法而言， ```java 
  synchronized
  ``` 方法则会被翻译成普通的方法调用和返回指令，如： ```java 
  invokevirtual
  ``` 等等，在 ```java 
  JVM
  ``` 字节码层面并没有任何特别的指令来实现被 ```java 
  synchronized
  ``` 修饰的方法，而是在 ```java 
  Class
  ``` 文件的方法表中将该方法的 ```java 
  access_flags
  ``` 字段中的 ```java 
  synchronized
  ``` 标志位置1，表示该方法是同步方法并使用调用该方法的对象或该方法所属的 ```java 
  Class
  ``` 在 ```java 
  JVM
  ``` 的内部对象表示 ```java 
  Klass
  ``` 作为锁对象。 
  其实从开发者角度简单理解，「这两种方式只是在获取锁的时机有所不同」。 
  下面重复阐述「几个第一眼看起来不合理却是事实的问题」（其实前文已经提及过）： 
   
    
    
      在线程进入 
      ```java 
  synchronized
  ``` 方法或者代码块，相当于获取监视器锁成功，如果此时成功调用 
      ```java 
  wait()
  ``` 系列方法，那么它会立即释放监视器锁，并且添加到等待集合（ 
      ```java 
  Wait Set
  ``` ）中进行阻塞等待。 
     
    
    
      由于已经有线程释放了监视器锁，那么在另一个线程进入 
      ```java 
  synchronized
  ``` 方法或者代码块之后，它可以调用 
      ```java 
  notify(All)
  ``` 方法唤醒等待集合中正在阻塞的线程，但是这个唤醒操作并不是调用 
      ```java 
  notify(All)
  ``` 方法后立即生效，而是在该线程 
     「退出 ```java 
  synchronized
  ``` 方法或者代码块之后才生效」。 
     
    
    
      从 
      ```java 
  wait()
  ``` 方法阻塞过程中被唤醒的线程会竞争监视器目标对象的控制权，一旦重新控制了对象，那么线程的同步状态就会恢复到步入 
      ```java 
  synchronized
  ``` 方法或者代码块时候的状态（也就是成功获取到对象监视器锁时候的状态），这个时候线程才能够继续执行。 
     
   
  为了验证这三点，可以写个简单的 ```java 
  Demo
  ``` ： 
   ```java 
  public class Lock {}public class WaitMain {    private static final DateTimeFormatter F = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS");    public static void main(String[] args) throws Exception {        // 这里换成Object其实也没有问题        final Lock lock = new Lock();        new Thread(new  WaitRunnable(lock), "WaitThread-1").start();        new Thread(new  WaitRunnable(lock), "WaitThread-2").start();        Thread.sleep(50);        new Thread(new  NotifyRunnable(lock), "NotifyThread").start();        Thread.sleep(Integer.MAX_VALUE);    }    @RequiredArgsConstructor    private static class WaitRunnable implements Runnable {        private final Lock lock;        @Override        public void run() {            synchronized (lock) {                System.out.println(String.format("[%s]-线程[%s]获取锁成功,准备执行wait方法", F.format(LocalDateTime.now()),                        Thread.currentThread().getName()));                while (true) {                    try {                        lock.wait();                    } catch (InterruptedException e) {                        //ignore                    }                    System.out.println(String.format("[%s]-线程[%s]从wait中唤醒,准备exit", F.format(LocalDateTime.now()),                            Thread.currentThread().getName()));                    try {                        Thread.sleep(500);                    } catch (InterruptedException e) {                        //ignore                    }                    break;                }            }        }    }    @RequiredArgsConstructor    private static class NotifyRunnable implements Runnable {        private final Lock lock;        @Override        public void run() {            synchronized (lock) {                System.out.println(String.format("[%s]-线程[%s]获取锁成功,准备执行notifyAll方法", F.format(LocalDateTime.now()),                        Thread.currentThread().getName()));                lock.notifyAll();                System.out.println(String.format("[%s]-线程[%s]先休眠3000ms", F.format(LocalDateTime.now()),                        Thread.currentThread().getName()));                try {                    Thread.sleep(3000);                } catch (InterruptedException e) {                    //ignore                }                System.out.println(String.format("[%s]-线程[%s]准备exit", F.format(LocalDateTime.now()),                        Thread.currentThread().getName()));            }        }    }}
  ```  
  某个时刻的执行结果如下： 
   ```java 
  [2019-04-27 23:28:17.617]-线程[WaitThread-1]获取锁成功,准备执行wait方法[2019-04-27 23:28:17.631]-线程[WaitThread-2]获取锁成功,准备执行wait方法[2019-04-27 23:28:17.657]-线程[NotifyThread]获取锁成功,准备执行notifyAll方法 <-------- 这一步执行完说明WaitThread已经释放了锁[2019-04-27 23:28:17.657]-线程[NotifyThread]先休眠3000ms[2019-04-27 23:28:20.658]-线程[NotifyThread]准备exit <------- 这一步后NotifyThread离开同步代码块[2019-04-27 23:28:20.658]-线程[WaitThread-1]从wait中唤醒,准备exit <------- 这一步WaitThread-1解除阻塞[2019-04-27 23:28:21.160]-线程[WaitThread-2]从wait中唤醒,准备exit <------- 这一步WaitThread-2解除阻塞，注意发生时间在WaitThread-1解除阻塞500ms之后，符合我们前面提到的第3点
  ```  
  如果结合 ```java 
  wait()
  ``` 和 ```java 
  notify()
  ``` 可以简单总结出一个同步代码块的伪代码如下： 
   ```java 
  final Object lock = new Object();// 等待synchronized(lock){    1、线程进入同步代码块，意味着获取对象监视器锁成功    while(!condition){        lock.wait();   2.线程调用wait()进行阻塞等待        break;    }    3.线程从wait()的阻塞等待中被唤醒，尝试恢复第1步之后的同步状态，并不会马上生效，直到notify被调用并且调用notify方法的线程已经释放锁，同时当前线程需要竞争成功    4.继续执行后面的代码，直到离开同步代码块}// 唤醒synchronized(lock){    1、线程进入同步代码块，意味着获取对象监视器锁成功    lock.notify();  2.唤醒其中一个在对象监视器上等待的线程    3.准备推出同步代码块释放锁，只有释放锁之后第2步才会生效}
  ```  
   
  #### 图解Object提供的阻塞和唤醒机制 
  结合前面分析过的知识点以及参考资料中的文章，重新画一个图理解一下对象监视器以及相应阻塞和唤醒 ```java 
  API
  ``` 的工作示意过程： 
   
    
    
    j-u-c-o-w-n-1.png 
    
   
   
    
     
      ```java 
  Entry Set
  ``` （实际上是 
      ```java 
  ObjectMonitor
  ``` 中的 
      ```java 
  _EntryList
  ``` 属性）：存放等待锁并且处于阻塞状态的线程。 
     
    
     
      ```java 
  Wait Set
  ``` （实际上是 
      ```java 
  ObjectMonitor
  ``` 中的 
      ```java 
  _WaitSet
  ``` 属性）：存放处于等待阻塞状态的线程。 
     
    
     
      ```java 
  The Owner
  ``` （实际上是 
      ```java 
  ObjectMonitor
  ``` 中的 
      ```java 
  _owner
  ``` 属性）：指向获得对象监视器的线程，在同一个时刻只能有一个线程被 
      ```java 
  The Owner
  ``` 持有，通俗来看，它就是监视器的控制权。 
     
   
   
  #### 使用例子 
  通过 ```java 
  Object
  ``` 提供的阻塞和唤醒机制举几个简单的使用例子。 
   
  ##### 维修厕所的例子 
  假设有以下场景：厕所的只有一个卡位，厕所维修工修厕所的时候，任何人不能上厕所。当厕所维修工修完厕所的时候，上厕所的人需要"得到厕所的控制权"才能上厕所。 
   ```java 
  // 厕所类public class Toilet {    // 厕所的锁    private final Object lock = new Object();    private boolean available;    public Object getLock() {        return lock;    }    public void setAvailable(boolean available) {        this.available = available;    }    public boolean getAvailable() {        return available;    }}// 厕所维修工@RequiredArgsConstructorpublic class ToiletRepairer implements Runnable {    private static final DateTimeFormatter F = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS");    private final Toilet toilet;    @Override    public void run() {        synchronized (toilet.getLock()) {            System.out.println(String.format("[%s]-厕所维修员得到了厕所的锁,维修厕所要用5000ms...", LocalDateTime.now().format(F)));            try {                Thread.sleep(5000);            } catch (Exception e) {                // ignore            }            toilet.setAvailable(true);            toilet.getLock().notifyAll();            System.out.println(String.format("[%s]-厕所维修员维修完毕...", LocalDateTime.now().format(F)));        }    }}//上厕所的任务@RequiredArgsConstructorpublic class ToiletTask implements Runnable {    private static final DateTimeFormatter F = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS");    private final Toilet toilet;    private final String name;    private final Random random;    @Override    public void run() {        synchronized (toilet.getLock()) {            System.out.println(String.format("[%s]-%s得到了厕所的锁...", LocalDateTime.now().format(F), name));            while (!toilet.getAvailable()) {                try {                    toilet.getLock().wait();                } catch (InterruptedException e) {                    //ignore                }                int time = random.nextInt(3) + 1;                try {                    // 模拟上厕所用时                    TimeUnit.SECONDS.sleep(time);                } catch (InterruptedException e) {                    //ignore                }                System.out.println(String.format("[%s]-%s上厕所用了%s秒...", LocalDateTime.now().format(F), name, time));            }        }    }}// 场景入口public class Main {    public static void main(String[] args) throws Exception {        Toilet toilet = new Toilet();        Random random = new Random();        Thread toiletRepairer = new Thread(new ToiletRepairer(toilet), "ToiletRepairer");        Thread thread1 = new Thread(new ToiletTask(toilet, "张三", random), "thread-1");        Thread thread2 = new Thread(new ToiletTask(toilet, "李四", random), "thread-2");        Thread thread3 = new Thread(new ToiletTask(toilet, "王五", random), "thread-3");        thread1.start();        thread2.start();        thread3.start();        Thread.sleep(50);        toiletRepairer.start();        Thread.sleep(Integer.MAX_VALUE);    }}
  ```  
  某次执行的结果如下： 
   ```java 
  [2019-04-29 01:07:25.914]-张三得到了厕所的锁...[2019-04-29 01:07:25.931]-李四得到了厕所的锁...[2019-04-29 01:07:25.931]-王五得到了厕所的锁...[2019-04-29 01:07:25.951]-厕所维修员得到了厕所的锁,维修厕所要用5000ms...[2019-04-29 01:07:30.951]-厕所维修员维修完毕...[2019-04-29 01:07:32.952]-张三上厕所用了2秒...[2019-04-29 01:07:35.952]-王五上厕所用了3秒...[2019-04-29 01:07:37.953]-李四上厕所用了2秒...
  ```  
   
  ##### 阻塞队列实现 
  实现一个简单固定容量的阻塞队列，接口如下： 
   ```java 
  public interface BlockingQueue<T> {    void put(T value) throws InterruptedException;    T take() throws InterruptedException;}
  ```  
  其中 ```java 
  put(T value)
  ``` 会阻塞直到队列中有可用的容量，而 ```java 
  take()
  ``` 方法会阻塞直到有元素投放到队列中。实现如下： 
   ```java 
  public class DefaultBlockingQueue<T> implements BlockingQueue<T> {    private Object[] elements;    private final Object notEmpty = new Object();    private final Object notFull = new Object();    private int count;    private int takeIndex;    private int putIndex;    public DefaultBlockingQueue(int capacity) {        this.elements = new Object[capacity];    }    @Override    public void put(T value) throws InterruptedException {        synchronized (notFull) {            while (count == elements.length) {                notFull.wait();            }        }        final Object[] items = this.elements;        items[putIndex] = value;        if (++putIndex == items.length) {            putIndex = 0;        }        count++;        synchronized (notEmpty) {            notEmpty.notify();        }    }    @SuppressWarnings("unchecked")    @Override    public T take() throws InterruptedException {        synchronized (notEmpty) {            while (count == 0) {                notEmpty.wait();            }        }        final Object[] items = this.elements;        T value = (T) items[takeIndex];        items[takeIndex] = null;        if (++takeIndex == items.length) {            takeIndex = 0;        }        count--;        synchronized (notFull) {            notFull.notify();        }        return value;    }}
  ```  
  场景入口类： 
   ```java 
  public class Main {    public static void main(String[] args) throws Exception {        BlockingQueue<String> queue = new DefaultBlockingQueue<>(5);        Runnable r = () -> {            while (true) {                try {                    String take = queue.take();                    System.out.println(String.format("线程%s消费消息-%s", Thread.currentThread().getName(), take));                } catch (Exception e) {                    e.printStackTrace();                }            }        };        new Thread(r, "thread-1").start();        new Thread(r, "thread-2").start();        IntStream.range(0, 10).forEach(i -> {            try {                queue.put(String.valueOf(i));            } catch (InterruptedException e) {                //ignore            }        });        Thread.sleep(Integer.MAX_VALUE);    }}
  ```  
  某次执行结果如下： 
   ```java 
  线程thread-1消费消息-0线程thread-2消费消息-1线程thread-1消费消息-2线程thread-2消费消息-3线程thread-1消费消息-4线程thread-2消费消息-5线程thread-1消费消息-6线程thread-2消费消息-7线程thread-1消费消息-8线程thread-2消费消息-9
  ```  
  上面这个例子就是简单的单生产者-多消费者的模型。 
   
  ##### 线程池实现 
  这里实现一个极度简陋的固定容量的线程池，功能是：初始化固定数量的活跃线程，阻塞直到有可用的线程用于提交任务。它只有一个接口方法，接口定义如下： 
   ```java 
  public interface ThreadPool {    void execute(Runnable runnable);}
  ```  
  具体实现如下： 
   ```java 
  public class DefaultThreadPool implements ThreadPool {    private final int capacity;    private List<Worker> initWorkers;    private Deque<Worker> availableWorkers;    private Deque<Worker> busyWorkers;    private final Object nextLock = new Object();    public DefaultThreadPool(int capacity) {        this.capacity = capacity;        init(capacity);    }    private void init(int capacity) {        initWorkers = new ArrayList<>(capacity);        availableWorkers = new LinkedList<>();        busyWorkers = new LinkedList<>();        for (int i = 0; i < capacity; i++) {            Worker worker = new Worker();            worker.setName("Worker-" + (i + 1));            worker.setDaemon(true);            initWorkers.add(worker);        }        for (Worker w : initWorkers) {            w.start();            availableWorkers.add(w);        }    }    @Override    public void execute(Runnable runnable) {        if (null == runnable) {            return;        }        synchronized (nextLock) {            while (availableWorkers.size() < 1) {                try {                    nextLock.wait(500);                } catch (InterruptedException e) {                    //ignore                }            }            Worker worker = availableWorkers.removeFirst();            busyWorkers.add(worker);            worker.run(runnable);            nextLock.notifyAll();        }    }    private void makeAvailable(Worker worker) {        synchronized (nextLock) {            availableWorkers.add(worker);            busyWorkers.remove(worker);            nextLock.notifyAll();        }    }    private class Worker extends Thread {        private final Object lock = new Object();        private Runnable runnable;        private AtomicBoolean run = new AtomicBoolean(true);        private void run(Runnable runnable) {            synchronized (lock) {                if (null != this.runnable) {                    throw new IllegalStateException("Already running a Runnable!");                }                this.runnable = runnable;                lock.notifyAll();            }        }        @Override        public void run() {            boolean ran = false;            while (run.get()) {                try {                    synchronized (lock) {                        while (runnable == null && run.get()) {                            lock.wait(500);                        }                        if (runnable != null) {                            ran = true;                            runnable.run();                        }                    }                } catch (Exception e) {                    e.printStackTrace();                } finally {                    synchronized (lock) {                        runnable = null;                    }                    if (ran) {                        ran = false;                        makeAvailable(this);                    }                }            }        }    }}
  ```  
  编写一个场景类： 
   ```java 
  public class MainClient {    private static final DateTimeFormatter F = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS");    public static void main(String[] args) throws Exception{        ThreadPool threadPool = new DefaultThreadPool(2);        threadPool.execute(() -> {            try {                System.out.println(String.format("[%s]-任务一开始执行持续3秒...", LocalDateTime.now().format(F)));                Thread.sleep(3000);                System.out.println(String.format("[%s]-任务一执行结束...", LocalDateTime.now().format(F)));            }catch (Exception e){                //ignore            }        });        threadPool.execute(() -> {            try {                System.out.println(String.format("[%s]-任务二开始执行持续4秒...", LocalDateTime.now().format(F)));                Thread.sleep(4000);                System.out.println(String.format("[%s]-任务二执行结束...", LocalDateTime.now().format(F)));            }catch (Exception e){                //ignore            }        });        threadPool.execute(() -> {            try {                System.out.println(String.format("[%s]-任务三开始执行持续5秒...", LocalDateTime.now().format(F)));                Thread.sleep(5000);                System.out.println(String.format("[%s]-任务三执行结束...", LocalDateTime.now().format(F)));            }catch (Exception e){                //ignore            }        });        Thread.sleep(Integer.MAX_VALUE);    }}
  ```  
  某次执行结果如下： 
   ```java 
  [2019-04-29 02:07:25.465]-任务二开始执行持续4秒...[2019-04-29 02:07:25.465]-任务一开始执行持续3秒...[2019-04-29 02:07:28.486]-任务一执行结束...[2019-04-29 02:07:28.486]-任务三开始执行持续5秒...[2019-04-29 02:07:29.486]-任务二执行结束...[2019-04-29 02:07:33.487]-任务三执行结束...
  ```  
   
  #### 小结 
  鉴于笔者 ```java 
  C
  ``` 语言学得不好，这里就无法深入分析 ```java 
  JVM
  ``` 源码的实现，只能结合一些现有的资料和自己的理解重新梳理一下 ```java 
  Object
  ``` 提供的阻塞和唤醒机制这些知识点。结合之前看过 ```java 
  JUC
  ``` 同步器的源码，一时醒悟过来， ```java 
  JUC
  ``` 同步器只是在数据结构和算法层面使用 ```java 
  Java
  ``` 语言对原来 ```java 
  JVM
  ``` 中 ```java 
  C
  ``` 语言的阻塞和唤醒机制即 ```java 
  Object
  ``` 提供的那几个 ```java 
  JNI
  ``` 方法进行了一次实现而已。 
  最后， ```java 
  Object
  ``` 提供的阻塞等待唤醒机制是 ```java 
  JVM
  ``` 实现的（如果特别熟悉 ```java 
  C
  ``` 语言可以通过 ```java 
  JVM
  ``` 源码研究其实现，对于大部分开发者来说这部分的知识其实是暗箱），除非是特别熟练或者是 ```java 
  JDK
  ``` 版本太低尚未引入 ```java 
  JUC
  ``` 包（ ```java 
  JUC
  ``` 包是 ```java 
  JDK1.5
  ``` 或者之后才加入到 ```java 
  JDK
  ``` 中）。一般情况下「不应该优先选择 ```java 
  Object
  ``` 」，一方面因为 ```java 
  Object
  ``` 提供的 ```java 
  API
  ``` 是 ```java 
  Native
  ``` 方法，其功能有可能受到 ```java 
  JVM
  ``` 版本的影响（有可能带来性能提升这样的正面影响，也有可能是负面影响），另一方面 ```java 
  Object
  ``` 提供的 ```java 
  API
  ``` 其实并不灵活。综合来看，实际开发中更建议使用专门为并发设计的 ```java 
  JUC
  ``` 包中的锁相关类库，例如可重入锁 ```java 
  ReentrantLock
  ``` 。 
   
  直到 ```java 
  JDK11
  ``` 为止，还有大量的 ```java 
  JDK
  ``` 类库使用了 ```java 
  Object
  ``` 提供的 ```java 
  API
  ``` 以及 ```java 
  synchronized
  ``` 关键字实现的阻塞和唤醒功能，此所谓存在即合理。 
  参考资料： 
   
    
    
      JVM源码分析之Object.wait/notify实现-By占小狼 
     
    
    
      JDK11相关源码 
     
   
  （本文完 c-7-d e-a-20190430 r-a-20200720 封面来自于《圣诞之吻ss》） 
  
 
本文分享自微信公众号 - Throwable文摘（throwable-doge）。如有侵权，请联系 support@oschina.cn 删除。本文参与“OSC源创计划”，欢迎正在阅读的你也加入，一起分享。
                                        