---
title: 推荐系列-并发容器与并发控制 - JUC
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 837
cover_picture: ''
abbrlink: 6bf59c72
date: 2021-04-15 09:16:07
---

&emsp;&emsp;摘要 为什么没见人用Vector和Hashtable了？HashMap它又线程不安全在哪里？ ConcurrentHashMap的进化与骚操作有哪些？ Copy-On-Write是个啥思想？有哪些例子？ 为什么需要并发队列？又有哪些我...
<!-- more -->

                                                                                                                                                                                         
  
   
  ### 摘要 
   
   为什么没见人用 ```java 
  Vector
  ``` 和 ```java 
  Hashtable
  ``` 了？ ```java 
  HashMap
  ``` 它又线程不安全在哪里？ 
    ```java 
  ConcurrentHashMap
  ``` 的进化与骚操作有哪些？ 
   Copy-On-Write是个啥思想？有哪些例子？ 
   为什么需要并发队列？又有哪些我们视而不见的并发的队列？ 
   当我们想控制线程的先来后到时该咋办？一个个去讲道理吗？ 
   
   
  ### 并发容器 
  先总览一下这些并发容器都在整什么幺蛾子 
   ```java 
  1. Concurrent*  大部分是通过CAS实现并发
2. CopyOnWrite*  复制一份原数据
3. Blocking*  通过AQS实现
复制代码
  ```  
   
  #### 一、为什么Vector和Hashtable被留在了历史的长河中？ 
  很简单，别想太多，就是因为性能不好。 
   
  ##### 那为什么性能不好呢？它性能丢失��哪儿？ 
  我们先看一看 ```java 
  Vector
  ``` 的 ```java 
  get
  ``` 方法： 
   
    
     
     ![Test](https://user-gold-cdn.xitu.io/2020/6/18/172c548d124a472f?imageView2/0/w/1280/h/960/format/webp/ignore-error/1  '并发容器与并发控制 - JUC') 
     
     
     
    
   look, look, 这个 
   ```java 
  synchronized
  ``` 是直接修饰在方法上的，如果你上下翻翻，就可以发现基本上这个类的所有��法都是 
   ```java 
  synchronized
  ``` 修饰的。 
  那有人可能问了，为什么锁方法就性能差？因为这个锁粒度是实例对象呀 
   ```java 
  Hashtable
  ``` 也是如此。 
   
  #### 二、为什么HashMap是线程不安全的？ 
   
    同时put碰撞导致数据丢失 比如两个线程都放数据，使用同样的key，那么它们计算出来的hash值是一样的并放在同一位置，这必然会导致一个数据丢失  
    同时put扩容导致数据丢失 同时扩容时，只会保留一个扩容的数组。 
     
      
       
       ![Test](https://user-gold-cdn.xitu.io/2020/6/18/172c548d124a472f?imageView2/0/w/1280/h/960/format/webp/ignore-error/1  '并发容器与并发控制 - JUC') 
       
       
       
      
      
    死循环造成CPU100% 多线程同时扩容，可能会造成循环链表导致CPU100%。但是这个问题本身追究并无意义（Sun官方也是这么认为的，他觉得你就不应该用hashMap来解决并发场景，这本身就有问题不是吗？）。如果着实有兴趣可以瞅瞅这个 coolshell.cn/articles/96…  
   
   
  #### 三、ConcurrentHashMap 1.7与1.8的差别是什么？ 
   
    数据结构 1.7时的结构（Segment + HashEntry + Unsafe）： 
     
      
       
       ![Test](https://user-gold-cdn.xitu.io/2020/6/18/172c548d124a472f?imageView2/0/w/1280/h/960/format/webp/ignore-error/1  '并发容器与并发控制 - JUC') 
       
       
       
      
     1.8时的结构（移除Segment，使锁的粒度更小，Synchronized + CAS + Node + Unsafe）： 
     
      
       
       ![Test](https://user-gold-cdn.xitu.io/2020/6/18/172c548d124a472f?imageView2/0/w/1280/h/960/format/webp/ignore-error/1  '并发容器与并发控制 - JUC') 
       
       
       
      
      
    Hash碰撞 将原本的拉链法变为如果节点数超过8个以后就变换为红黑树。 这里有一个小问题，为什么超过8就转为红黑树？为什么是8？为什么不一开始就使用红黑树？ 
     
     红黑树每个节点占用空间是链表的两倍。 
     作者用泊松分布的概率计算，到8的时候概率也就是极小了。 
     
     
      
       
       ![Test](https://user-gold-cdn.xitu.io/2020/6/18/172c548d124a472f?imageView2/0/w/1280/h/960/format/webp/ignore-error/1  '并发容器与并发控制 - JUC') 
       
       
       
      
      
    保证并发安全 1.7使用分段锁Segment(extends ReentreenLock)来保证16个段的安全（段不可动态增加）；1.8使用 ```java 
  CAS
  ```  +  ```java 
  synchronized
  ``` 来保证，粒度为每个Node。 
     
      
       
       ![Test](https://user-gold-cdn.xitu.io/2020/6/18/172c548d124a472f?imageView2/0/w/1280/h/960/format/webp/ignore-error/1  '并发容器与并发控制 - JUC') 
       
       
       
      
      
    查询复杂度 当冲突超过8个时也能保证查询效率，由原来的拉链法的 ```java 
  O(n)
  ``` 变为红黑树的 ```java 
  O(logn)
  ```   
   
   
  #### 四、ConcurrentHashMap 如何实现如a++这样的组合操作？ 
  显然， ```java 
  ConcurrentHashMap
  ``` 是保证了同时put的并发安全性，但是并没有说，你同时执行 ```java 
  a++
  ``` 时也是线程安全的： 
   ```java 
  int a = map.get(key);
int b = a+1;
map.put(key, b);
复制代码
  ```  
  那让我们来想想，咋解决这个问题呢？ 
  把这段用 ```java 
  synchronized
  ``` 包起来吗？ 
  那使用 ```java 
  ConcurrentHashMap
  ``` 还有什么意义呢？我们来看看这样一个方法：replace 
   ```java 
  // 利用CAS的思想，去循环的判断并进行++的操作，直到成功为止
// replace保证了并发修改的安全性
while (true) {
    int ori = map.get("key");
    int tar = ori + 1;
    boolean isSuccess = map.replace("key", ori, tar);
    if (isSuccess) {
        break;
    }
}
复制代码
  ```  
  再看一个组合操作，用于解决相同key的put覆盖问题： ```java 
  putIfAbsent
  ```  
   ```java 
  // 核心思想如下表示
if (!map.contains("key")){
    return map.put("key", "value");
}else {
    return map.get("key");
}
复制代码
  ```  
   
  #### 五、CopyOnWriteArrayList适用场景有哪些？ 
   
  ##### 我们先想想为什么会有这个玩意？ 
   
   用来代替 ```java 
  Vector
  ``` 和 ```java 
  SynchronizedList
  ``` ，就和 ```java 
  ConcurrentHashMap
  ``` 代替 ```java 
  SynchronizedMap
  ``` 的原因一样 
    ```java 
  Vector
  ``` 和 ```java 
  SynchronizedList
  ``` 的锁的粒度太大，并发效率相比较���，并且在遍历时无法修改。 
   Copy-On-Write容器还包括 ```java 
  CopyOnWriteArraySet
  ``` ，用于替代同步的 ```java 
  Set
  ```  
   
   
  ##### 好了，现在我们来说说适用场景 
   
    读多写少 读操作需要尽可能的快，而写操作哪怕慢一些也无伤大雅，例如：黑名单场景。  
    写入实时性要求不高 就是说，我的修改不是说非得立即生效，哪怕是有那么一小会，还是在读之前的数据，也没关系。  
   
   
  ##### CopyOnWriteArrayList的读写规则是什么？ 
   
    读读同步、读写同步、写写互斥  
    看起来是不是和读写锁的规则贼像？但是不一样哦。这里有一个升级，就是你即便在写，我也是可以读的。  
    我们来看一下写入的时候 
     
      
       
       ![Test](https://user-gold-cdn.xitu.io/2020/6/18/172c548d124a472f?imageView2/0/w/1280/h/960/format/webp/ignore-error/1  '并发容器与并发控制 - JUC') 
       
       
       
      
     上来先锁住，然后整一个新的数组出来，把新元素怼进去，再改一下原地址，解锁，一气呵成。 
    读取的时候呢？ 
     
      
       
       ![Test](https://user-gold-cdn.xitu.io/2020/6/18/172c548d124a472f?imageView2/0/w/1280/h/960/format/webp/ignore-error/1  '并发容器与并发控制 - JUC') 
       
       
       
      
     啥保护措施都没有的，读就完事了。 
   
   
  ##### 实现原理是什么？ 
   
   CopyOnWrite原理：写入时会先搞一个副本出来，写好以后改地址 
   “不变性”原理：每个list都相当于一个不可变的集合，没有修改操作在上面进行 
   
   
  ##### 那有何缺点呢？ 
   
   数据一致性：只能保证最终数据的一致性，不能保证实时一致性。 
   内存占用：副本可是占用一倍的内存的哦。 
   
   
  #### 六、并发队列又是什么？ 
  就是保证了并发安全的队列，分为阻塞队列（如下图）和非阻塞队列，阻塞与非阻塞的区别就是，你放入（或者取出）元素时，在队列已满（或者已空）的情况下会不会阻塞。 
   
    
     
     ![Test](https://user-gold-cdn.xitu.io/2020/6/18/172c548d124a472f?imageView2/0/w/1280/h/960/format/webp/ignore-error/1  '并发容器与并发控制 - JUC') 
     
     
     
    
   阻塞队列最典型的应用就是生产者消费者。 
   
    
     
     ![Test](https://user-gold-cdn.xitu.io/2020/6/18/172c548d124a472f?imageView2/0/w/1280/h/960/format/webp/ignore-error/1  '并发容器与并发控制 - JUC') 
     
     
     
    
   
  那上图的这些队列有何特点呢？我们一一道来 
   
     ```java 
  ArrayBlockingQueue
  ``` : 有界、可指定容量、底层由数组实现、可设置公平与否 
     
      
       
       ![Test](https://user-gold-cdn.xitu.io/2020/6/18/172c548d124a472f?imageView2/0/w/1280/h/960/format/webp/ignore-error/1  '并发容器与并发控制 - JUC') 
       
       
       
      
     我们可以看到在放入元素那一步使用了可重入锁的锁住（可打断）的方法。 
     ```java 
  PriorityBlockingQueue
  ``` : 支持优先级设置（依据对象的自然排序顺序或者是构造函数所带的Comparator）、队列的出入顺序是设置的顺序（不是先进先出）、无界队列、 ```java 
  PriorityQueue
  ``` 的线程安全版本。  
     ```java 
  LinkedBlockingQueue
  ``` : 默认无界(容量为Integer.MAX_VALUE，容量可指定）、内部结构为一个Node数组+两把锁、一般情况下性能优于 ```java 
  ArrayBlockingQueue
  ``` （锁粒度更小） 
     
      
       
       ![Test](https://user-gold-cdn.xitu.io/2020/6/18/172c548d124a472f?imageView2/0/w/1280/h/960/format/webp/ignore-error/1  '并发容器与并发控制 - JUC') 
       
       
       
      
     这里使用的是 ```java 
  Condition
  ```  +  ```java 
  ReentrantLock
  ``` ，其实就相当于  ```java 
  synchronized
  ```  +  ```java 
  Object.wait()
  ```  +  ```java 
  Object.notify()
  ``` ，这是一个适用于生产者消费者的绝佳队列，如果想看原生实现可以瞅瞅我在并发原理中利用 wait + notify 实现的生产者消费者。 
     
      
       
       ![Test](https://user-gold-cdn.xitu.io/2020/6/18/172c548d124a472f?imageView2/0/w/1280/h/960/format/webp/ignore-error/1  '并发容器与并发控制 - JUC') 
       
       
       
      
     我们看这个放入元素的方法就可以理解到：如果队列已满，则阻塞，否则就放一个元素，如果还可以继续放，则唤醒在notFull中等待的线程，如果放之前队列为空，则唤醒在notEmpty上等待的线程。 
     ```java 
  SynchronousQueue
  ``` : 容量为0不是1、线程池 ```java 
  Executors.newCacheThreadPool()
  ``` 使用的阻塞队列 
     
      
       
       ![Test](https://user-gold-cdn.xitu.io/2020/6/18/172c548d124a472f?imageView2/0/w/1280/h/960/format/webp/ignore-error/1  '并发容器与并发控制 - JUC') 
       
       
       
      
     它没有实际的容量，任意线程（生产者线程或者消费者线程，生产类型的操作比如put，offer，消费类型的操作比如poll，take）都会等待知道获得数据或者交付完成数据才会返回，一个生产者线程的使命是将线程附着着的数据交付给一个消费者线程，而一个消费者线程则是等待一个生产者线程的数据。 
     ```java 
  ConcurrentLinkedQueue
  ``` : 并发包中唯一一个非阻塞的队列，内部由链表实现、核心思想也是CAS。 
     
      
       
       ![Test](https://user-gold-cdn.xitu.io/2020/6/18/172c548d124a472f?imageView2/0/w/1280/h/960/format/webp/ignore-error/1  '并发容器与并发控制 - JUC') 
       
       
       
      
      
     ```java 
  DelayQueue
  ``` : 延迟队列（根据延迟时间排序）、元素需实现 ```java 
  Delayed
  ``` 接口（规定排序规则）  
   
   
  ### 控制并发流程 
  先瞅瞅都有哪些可以控制并发流程 
   
    
     
     ![Test](https://user-gold-cdn.xitu.io/2020/6/18/172c548d124a472f?imageView2/0/w/1280/h/960/format/webp/ignore-error/1  '并发容器与并发控制 - JUC') 
     
     
     
    
   
   
  #### 七、CountDownLatch有哪些典型的适用场景？ 
   
    一个线程等多个线程执行完成 在媒体处理中，拼接命令需要等所有待拼接的任务下载完成后才执行。  
    多个线程等一个线程执行完 压测场景下，所有线程等一声令下立马向服务器施加压力，而不是还去慢悠悠的创建线程。  
    多等多  
   
  下面举一个小栗子，模拟运动员跑步的场景，所有运动员等枪响后开跑，待运动员都到达终点后裁判才宣布比赛结束。 
   ```java 
  CountDownLatch begin = new CountDownLatch(1);
CountDownLatch end = new CountDownLatch(10);
ExecutorService service = Executors.newFixedThreadPool(5);
for (int i = 0; i < 10; i++) {
    final int no = i + 1;
    Runnable runnable = () -> {
        System.out.println("No." + no + "准备完毕，等待枪响");
        try {
            begin.await();
            System.out.println("No." + no + "开始冲刺了");
            Thread.sleep((long) (Math.random() * 10000));
            System.out.println("No." + no + "跑到终点了");
        } catch (InterruptedException e) {
            e.printStackTrace();
        } finally {
            end.countDown();
        }
    };
    service.submit(runnable);
}
//裁判员搞一些准备工作...
Thread.sleep(5000);
System.out.println("枪响，比赛开始！");
begin.countDown();

end.await();
System.out.println("所有人到达终点，比赛结束！");
复制代码
  ```  
  这个类不能重用，即不可以重新计数。如果需要重用，考虑CyclicBarrier和建新的实例。 
   
  #### 八、Semaphore有哪些适用场景？ 
  需要控制并发的线程数时。 
  例如：在媒体处理的场景中，一台机器的CPU性能是有限的，我们最多只能允许3个转码任务同时进行，这个时候就需要控制执行转码的线程数量了。 
  我们用一张图来理解一下： 
   
    
     
     ![Test](https://user-gold-cdn.xitu.io/2020/6/18/172c548d124a472f?imageView2/0/w/1280/h/960/format/webp/ignore-error/1  '并发容器与并发控制 - JUC') 
     
     
     
    
   接下来看一个小Demo 
   ```java 
  static Semaphore semaphore = new Semaphore(3, true);

public static void main(String[] args) {
    ExecutorService service = Executors.newFixedThreadPool(50);
    for (int i = 0; i < 100; i++) {
        service.submit(new Task());
    }
    service.shutdown();
}

static class Task implements Runnable {

    @Override
    public void run() {
        try {
            semaphore.acquire();
            // 这里需要设置请求的数量
            //semaphore.acquire(2);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        System.out.println(Thread.currentThread().getName() + "拿到了许可证");
        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        System.out.println(Thread.currentThread().getName() + "释放了许可证");
        semaphore.release();
        // 也可以设置释放的数量
        //semaphore.release(2);
    }
}
复制代码
  ```  
  注意点： 
   
   获取和释放的数量必须一致（比如你请求的是3个，但是你却每次只释放2个，那这个许可证岂不是就越用越少了，这玩意并没有在类的层面进行限制，所以需要编码时候注意）。 
   公平性一般设置为true比较合理（因为信号量一般用在控制慢服务，如果你还设置不公平，就很容易导致饥饿）。 
   并不是必须由请求的线程去释放，也可以由其他线程去释放（可以是线程A获取了2个，线程B没有获取，只去释放2个）。 
   
   
  #### 九、CyclicBarrier与CountDownLatch的区别是什么？ 
   
    作用不同： ```java 
  CyclicBarrier
  ``` 需要等待固定数量的线程到达栅栏后才能继续执行，而 ```java 
  CountDownLatch
  ``` 只需要计数到0即可。也就是说， ```java 
  CountDownLatch
  ``` 用于事件， ```java 
  CyclicBarrier
  ``` 用于线程。 来看一个 ```java 
  CyclicBarrier
  ``` 的Demo：  
   
   ```java 
  public static void main(String[] args) {
    CyclicBarrier cyclicBarrier = new CyclicBarrier(5, () -> System.out.println("所有人都到场了， 大家统一出发！"));
    for (int i = 0; i < 10; i++) {
        new Thread(new Task(i, cyclicBarrier)).start();
    }
}

static class Task implements Runnable{
    private int id;
    private CyclicBarrier cyclicBarrier;

    public Task(int id, CyclicBarrier cyclicBarrier) {
        this.id = id;
        this.cyclicBarrier = cyclicBarrier;
    }

    @Override
    public void run() {
        System.out.println("线程" + id + "现在前往集合地点");
        try {
            Thread.sleep((long) (Math.random()*10000));
            System.out.println("线程"+id+"到了集合地点，开始等待其他人到达");
            cyclicBarrier.await();
            System.out.println("线程"+id+"出发了");
        } catch (InterruptedException | BrokenBarrierException e) {
            e.printStackTrace();
        }
    }
}
复制代码
  ```  
   
   可重用性不同： ```java 
  new CyclicBarrier(5)
  ``` 等5个线程到了后执行 ```java 
  run
  ``` ，还可以继续等接下来的5个线程到。 
   
   
  ### 总结 
  呼呼，总算说完了花里胡哨的并发容器，现在知道了可以用CopyOnWrite去解决读多写少的场景；用阻塞队列去实现生产者消费者模型；用 ```java 
  CountDownLatch
  ``` 来驯服一个个溜得贼快的线程。 
  下一章我们搞个大事情，并发界的总统山： ```java 
  AQS
  ``` 。尝试着利用 ```java 
  AQS
  ``` 去实现一个我们自己的并发工具。 
  
  

                                        