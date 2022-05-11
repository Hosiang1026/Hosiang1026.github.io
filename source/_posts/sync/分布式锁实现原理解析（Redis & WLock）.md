---
title: 推荐系列-分布式锁实现原理解析（Redis & WLock）
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 314
cover_picture: 'https://oscimg.oschina.net/oscnet/f1643822-9814-4d6c-910b-c9974d9a57b6.png'
abbrlink: 51cb8a32
date: 2022-05-11 05:14:30
---

&emsp;&emsp;单机锁 1. Java原生锁 在Java中每个对象都有一把锁，如普通的Object对象及类的Class对象。线程可以使用synchronized关键字来获取对象上的锁。synchronized关键字可以应用在方法级别（粗粒度...
<!-- more -->

                                                                                                                                                                                         
  
   
    
     
      
       
        
         
         1 
         
        
       
      
     
     
      
       
       单机锁 
       
      
      
       
        
         
        
       
      
     
    
   
  
  
 ### 1. Java原生锁 
 在Java中每个对象都有一把锁，如普通的Object对象及类的Class对象。线程可以使用synchronized关键字来获取对象上的锁。synchronized关键字可以应用在方法级别（粗粒度）或代码块级别（细粒度），在JDK1.6以前，使用synchronized只有一种方式即重量级锁，而在JDK1.6以后，引入了偏向锁与轻量级锁，来减少竞争带来的上下文切换。 
  
 #### 2. Java并发包（JUC）提供的锁 
  
 ###  
  
   
    
     
      
       
        
         
         2 
         
        
       
      
     
     
      
       
       分布式锁 
       
      
      
       
        
         
        
       
      
     
    
   
  
  
 ### 1. 为什么我们需要分布式锁？ 
 单机锁主要是为了同步同一进程中各个线程之间的操作。大多数互联网系统都是分布式部署的，当某个资源在多系统之间具有共享性的时候，为了保证大家访问这个资源数据是一致的，那么就必须要求在同一时刻只能被一个客户端处理，不能并发的执行，否者就会出现同一时刻有人写有人读，大家访问到的数据就不一致了。分布式锁，是指在分布式的部署环境下，通过锁机制来让多客户端互斥的对共享资源进行访问。 
  
 #### 2. 分布式锁需要具备的条件？ 
 排他性：在同一时间只会有一个客户端能获取到锁，其它客户端无法同时获取 
 避免死锁：这把锁在一段有限的时间之后，一定会被释放（正常释放或异常释放） 
 高可用：获取或释放锁的机制必须高可用且性能佳 
 ###  
  
   
    
     
      
       
        
         
         3 
         
        
       
      
     
     
      
       
       使用Redis实现分布式锁 
       
      
      
       
        
         
        
       
      
     
    
   
  
  
 ### 使用Redis实现分布式锁是一个比较常见的方案，利用Redis提供的SETNX命令，由于Redis使用单线程处理客户端发送的命令，所以可以保证排他性，加锁时设置锁过期时间可以避免死锁，Redis是纯内存操作，所以可以保证高效的获取与释放锁。当Redis为单机部署时无法保证高可用，而使用Redis的主从模式也会存在一个问题：当主Redis宕机之后，从Redis还未同步保存在主Redis上的锁，此时将导致锁丢失。 
 直接使用SETNX命令进行加锁操作是最简单的方式，但是在实际的生产环境中分布式锁的实现还必须要考虑其他很多因素，如锁重入，锁续期，阻塞与非阻塞获取锁等等。Redisson是一个高级的分布式协调Redis客户端，使用Netty进行网络通信，其基于Redis实现了多种类型的锁，如下： 
  
   
    
    
   
   
    
    RedissonLock 
    可重入锁 
    
    
    RedissonFairLock 
    可重入公平锁 
    
    
    RedissonMultiLock 
    连锁，可把一组锁当作一个锁来加锁和释放 
    
    
    RedissonReadLock 
    读锁 
    
    
    RedissonWriteLock 
    写锁 
    
    
    RedissonTransactionalLock 
    事务锁，在RedissonLock基础上记录了transactionId 
    
    
    RedissonRedLock 
    红锁，在多Redis（非集群环境）下获取锁，防止Redis单点故障 
    
   
  
 在开发中我们一般会使用RedissonLock来使用分布式锁，其支持锁重入，阻塞与非阻塞获取锁及锁续期等功能，基本可以满足大部分业务场景。 
 PS：锁重入的意思是一个客户端在获取到锁之后可以再次去获取同一把锁，防止出现死锁；阻塞获取的意思是如果当前客户端尝试获取锁失败之后会一直等待，直到成功获取到锁或超时之后才会返回，而非阻塞式获取表示不管尝试获取锁结果是成功或失败都会立刻返回；进行锁续期是防止出现由于加锁时间过短，在业务代码尚未执行完毕的情况下锁提前被释放。 
  
 #### 1. 源码分析RedissonLock（3.11.1版本）加解锁流程 
  
 ##### （1）获取锁（阻塞式）： 
  
   
 ```java 
   //leaseTime表示设置的锁过期时间，unit表示时间单位，interruptibly表示获取锁期间是否响应中断
  ``` 
  
 ```java 
      private void lock(long leaseTime, TimeUnit unit, boolean interruptibly) throws InterruptedException {
  ``` 
  
 ```java 
          long threadId = Thread.currentThread().getId();
  ``` 
  
 ```java 
          //尝试获取锁，获取失败返回锁的剩余过期时间
  ``` 
  
 ```java 
          Long ttl = this.tryAcquire(leaseTime, unit, threadId);
  ``` 
  
 ```java 
          if (ttl != null) {
  ``` 
  
 ```java 
              //如果获取失败则订阅释放锁的消息（注意当锁是因为自动过期而被释放时不会发布消息，只有客户端手动释放锁才会发布消息）
  ``` 
  
 ```java 
              RFuture<RedissonLockEntry> future = this.subscribe(threadId);
  ``` 
  
 ```java 
              this.commandExecutor.syncSubscription(future);
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
              try {
  ``` 
  
 ```java 
                  //循环，直到成功获取到锁或线程发生了中断
  ``` 
  
 ```java 
                  while(true) {
  ``` 
  
 ```java 
                      ttl = this.tryAcquire(leaseTime, unit, threadId);
  ``` 
  
 ```java 
                      //成功获取到锁直接返回
  ``` 
  
 ```java 
                      if (ttl == null) {
  ``` 
  
 ```java 
                          return;
  ``` 
  
 ```java 
                      }
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
                      //ttl大于等于0表示锁设置了过期时间，否则表示未设置过期时间
  ``` 
  
 ```java 
                      if (ttl >= 0L) {
  ``` 
  
 ```java 
                          try {
  ``` 
  
 ```java 
                              //当锁设置了过期时间时，阻塞等待（Latch为Semaphore,其初始信号量为0），等待时间为锁的剩余生存时间
  ``` 
  
 ```java 
                              //注意当某个客户端手动释放锁之后将发布锁释放的消息，此时阻塞在Semaphore中的第一个线程将会被唤醒
  ``` 
  
 ```java 
                              this.getEntry(threadId).getLatch().tryAcquire(ttl, TimeUnit.MILLISECONDS);
  ``` 
  
 ```java 
                          } catch (InterruptedException var13) {
  ``` 
  
 ```java 
                              //若需要响应中断，直接抛出中断异常，否则继续阻塞等待
  ``` 
  
 ```java 
                              if (interruptibly) {
  ``` 
  
 ```java 
                                  throw var13;
  ``` 
  
 ```java 
                              }
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
                              this.getEntry(threadId).getLatch().tryAcquire(ttl, TimeUnit.MILLISECONDS);
  ``` 
  
 ```java 
                          }
  ``` 
  
 ```java 
                      } else if (interruptibly) {
  ``` 
  
 ```java 
                          //当锁未设置过期时间且需要响应中断时，一直阻塞等待，且在等待过程中响应中断
  ``` 
  
 ```java 
                          this.getEntry(threadId).getLatch().acquire();
  ``` 
  
 ```java 
                      } else {
  ``` 
  
 ```java 
                          //当锁未设置过期时间且不需要响应中断时，一直阻塞等待，且在等待过程中不响应中断
  ``` 
  
 ```java 
                          this.getEntry(threadId).getLatch().acquireUninterruptibly();
  ``` 
  
 ```java 
                      }
  ``` 
  
 ```java 
                  }
  ``` 
  
 ```java 
              } finally {
  ``` 
  
 ```java 
                  //不管是成功获取到锁还是抛出了中断异常都需要取消订阅
  ``` 
  
 ```java 
                  this.unsubscribe(future, threadId);
  ``` 
  
 ```java 
              }
  ``` 
  
 ```java 
          }
  ``` 
  
 ```java 
      }
  ``` 
  
  
 上述代码为阻塞式获取锁的主干逻辑，实际获取锁的逻辑在 tryAcquire 方法中，如下： 
  
   
 ```java 
  private Long tryAcquire(long leaseTime, TimeUnit unit, long threadId) {
  ``` 
  
 ```java 
          //将异步调用变成同步调用
  ``` 
  
 ```java 
          return (Long)this.get(this.tryAcquireAsync(leaseTime, unit, threadId));
  ``` 
  
 ```java 
      }
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
      public <V> V get(RFuture<V> future) {
  ``` 
  
 ```java 
          //若异步任务尚未执行完毕，需要阻塞等待
  ``` 
  
 ```java 
          if (!future.isDone()) {
  ``` 
  
 ```java 
              CountDownLatch l = new CountDownLatch(1);
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
              //设置任务执行完毕后的回调方法
  ``` 
  
 ```java 
              future.onComplete((res, e) -> {
  ``` 
  
 ```java 
                  //当任务执行完毕唤醒因为调用l.await()而阻塞的线程
  ``` 
  
 ```java 
                  l.countDown();
  ``` 
  
 ```java 
              });
  ``` 
  
 ```java 
              boolean interrupted = false;
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
              while(!future.isDone()) {
  ``` 
  
 ```java 
                  try {
  ``` 
  
 ```java 
                      //当任务尚未完成时阻塞等待
  ``` 
  
 ```java 
                      l.await();
  ``` 
  
 ```java 
                  } catch (InterruptedException var5) {
  ``` 
  
 ```java 
                      interrupted = true;
  ``` 
  
 ```java 
                      break;
  ``` 
  
 ```java 
                  }
  ``` 
  
 ```java 
              }
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
              //若在等待过程中发生了线程中断，需要重新设置中断标志，因为线程在抛出中断异常之前会先清除中断标志
  ``` 
  
 ```java 
              if (interrupted) {
  ``` 
  
 ```java 
                  Thread.currentThread().interrupt();
  ``` 
  
 ```java 
              }
  ``` 
  
 ```java 
          }
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
          //若任务成功执行返回执行结果，否则抛出异常
  ``` 
  
 ```java 
          if (future.isSuccess()) {
  ``` 
  
 ```java 
              return future.getNow();
  ``` 
  
 ```java 
          } else {
  ``` 
  
 ```java 
              throw this.convertException(future);
  ``` 
  
 ```java 
          }
  ``` 
  
 ```java 
      }
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
      private <T> RFuture<Long> tryAcquireAsync(long leaseTime, TimeUnit unit, long threadId) {
  ``` 
  
 ```java 
          if (leaseTime != -1L) {
  ``` 
  
 ```java 
              //如果自定了锁过期时间，直接使用该过期时间作为锁的过期时间
  ``` 
  
 ```java 
              return this.tryLockInnerAsync(leaseTime, unit, threadId, RedisCommands.EVAL_LONG);
  ``` 
  
 ```java 
          } else {
  ``` 
  
 ```java 
              //如果未设置锁过期时间，过期时间使用Watchdog的默认时间30秒
  ``` 
  
 ```java 
              RFuture<Long> ttlRemainingFuture = this.tryLockInnerAsync(this.commandExecutor.getConnectionManager().getCfg().getLockWatchdogTimeout(),                 TimeUnit.MILLISECONDS, threadId, RedisCommands.EVAL_LONG);
  ``` 
  
 ```java 
              //设置加锁任务执行之后的回调
  ``` 
  
 ```java 
              ttlRemainingFuture.onComplete((ttlRemaining, e) -> {
  ``` 
  
 ```java 
                  if (e == null) {
  ``` 
  
 ```java 
                      //成功获取到锁后另起线程进行锁定时续期，续期任务执行间隔为Watchdog默认时间的三分之一（10秒）
  ``` 
  
 ```java 
                      //定时续期内部使用了Netty的HashedWheelTime实现，其基于时间轮算法
  ``` 
  
 ```java 
                      if (ttlRemaining == null) {
  ``` 
  
 ```java 
                          this.scheduleExpirationRenewal(threadId);
  ``` 
  
 ```java 
                      }
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
                  }
  ``` 
  
 ```java 
              });
  ``` 
  
 ```java 
              return ttlRemainingFuture;
  ``` 
  
 ```java 
          }
  ``` 
  
 ```java 
      }
  ``` 
  
  
 最终加锁逻辑在 tryLockInnerAsync 方法中，其核心是一段 Lua 脚本，如下： 
  
   
 ```java 
  //执行lua脚本获取锁
  ``` 
  
 ```java 
      <T> RFuture<T> tryLockInnerAsync(long leaseTime, TimeUnit unit, long threadId, RedisStrictCommand<T> command) {
  ``` 
  
 ```java 
          internalLockLeaseTime = unit.toMillis(leaseTime);
  ``` 
  
 ```java 
          return commandExecutor.evalWriteAsync(getName(), LongCodec.INSTANCE, command,
  ``` 
  
 ```java 
                  "if (redis.call('exists', KEYS[1]) == 0) then " +    //判断指定的key是否存在
  ``` 
  
 ```java 
                          "redis.call('hset', KEYS[1], ARGV[2], 1); " +    //新增key，value为hash结构
  ``` 
  
 ```java 
                          "redis.call('pexpire', KEYS[1], ARGV[1]); " +    //设置过期时间
  ``` 
  
 ```java 
                          "return nil; " +    //直接返回null，表示加锁成功
  ``` 
  
 ```java 
                          "end; " +
  ``` 
  
 ```java 
                          "if (redis.call('hexists', KEYS[1], ARGV[2]) == 1) then " +    //判断hash中是否存在指定的建
  ``` 
  
 ```java 
                          "redis.call('hincrby', KEYS[1], ARGV[2], 1); " +    //hash中指定键的值+1
  ``` 
  
 ```java 
                          "redis.call('pexpire', KEYS[1], ARGV[1]); " +    //重置过期时间
  ``` 
  
 ```java 
                          "return nil; " +   //返回null，表示加锁成功
  ``` 
  
 ```java 
                          "end; " +
  ``` 
  
 ```java 
                          "return redis.call('pttl', KEYS[1]);",    //返回key的剩余过期时间，表示加锁失败
  ``` 
  
 ```java 
                  Collections.<Object>singletonList(getName()), internalLockLeaseTime, getLockName(threadId));
  ``` 
  
 ```java 
      }
  ``` 
  
  
 上面这段Lua脚本的逻辑如下：首先判断指定的key是否存在，若不存在则添加新key，value为hash结构，其保存了客户端标识（可理解为进程+线程信息组成）到加锁次数的映射；若指定的key已存在，判断key对应的value中是否存在当前客户端标识，若存在，对应的加锁次数+1表示当前为锁重入；其他情况直接返回当前key的剩余过期时间，表示本次加锁失败。下图为Redis端储存的锁信息：                        
 加锁流程总结：线程首先使用Lua脚本尝试获取锁，若获取成功直接返回，否则需要订阅锁释放的消息，之后使用Semaphore阻塞等待TTL（加锁失败时返回的锁剩余过期时间），同一个进程中不同的线程若使用同一个key进行加锁，在加锁失败后都会阻塞在同一个Semaphore上。在此期间若接受到锁被释放的消息（由其他客户端手动释放锁而非锁自动过期），将从Semaphore中唤醒一个线程，该线程再次使用Lua脚本尝试获取锁，一直重复该过程，直到该线程成功获取到锁。 
  
 ##### （2）释放锁： 
  
   
 ```java 
   public void unlock() {
  ``` 
  
 ```java 
          try {
  ``` 
  
 ```java 
              //同步获取释放锁结果
  ``` 
  
 ```java 
              get(unlockAsync(Thread.currentThread().getId()));
  ``` 
  
 ```java 
          } catch (RedisException e) {
  ``` 
  
 ```java 
              if (e.getCause() instanceof IllegalMonitorStateException) {
  ``` 
  
 ```java 
                  throw (IllegalMonitorStateException) e.getCause();
  ``` 
  
 ```java 
              } else {
  ``` 
  
 ```java 
                  throw e;
  ``` 
  
 ```java 
              }
  ``` 
  
 ```java 
          }
  ``` 
  
 ```java 
      }
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
      public RFuture<Void> unlockAsync(long threadId) {
  ``` 
  
 ```java 
          RPromise<Void> result = new RedissonPromise<Void>();
  ``` 
  
 ```java 
          //执行Lua脚本释放锁
  ``` 
  
 ```java 
          RFuture<Boolean> future = unlockInnerAsync(threadId);
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
          future.onComplete((opStatus, e) -> {
  ``` 
  
 ```java 
              //取消锁续约
  ``` 
  
 ```java 
              cancelExpirationRenewal(threadId);
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
              if (e != null) {
  ``` 
  
 ```java 
                  result.tryFailure(e);
  ``` 
  
 ```java 
                  return;
  ``` 
  
 ```java 
              }
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
              //释放一个尚未获取到的锁，需要抛出异常
  ``` 
  
 ```java 
              if (opStatus == null) {
  ``` 
  
 ```java 
                  IllegalMonitorStateException cause = new IllegalMonitorStateException("attempt to unlock lock, not locked by current thread by node id: "+ id + " thread-id: " + threadId);
  ``` 
  
 ```java 
                  result.tryFailure(cause);
  ``` 
  
 ```java 
                  return;
  ``` 
  
 ```java 
              }
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
              result.trySuccess(null);
  ``` 
  
 ```java 
          });
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
          return result;
  ``` 
  
 ```java 
      }
  ``` 
  
  
 和加锁时类似，最终解锁逻辑在 unLockInnerAsync 方法中，其核心也是一段 Lua 脚本，如下： 
  
   
 ```java 
   protected RFuture<Boolean> unlockInnerAsync(long threadId) {
  ``` 
  
 ```java 
          return commandExecutor.evalWriteAsync(getName(), LongCodec.INSTANCE, RedisCommands.EVAL_BOOLEAN,
  ``` 
  
 ```java 
                  "if (redis.call('hexists', KEYS[1], ARGV[3]) == 0) then " + 
  ``` 
  
 ```java 
                          "return nil;" +    //判断当前客户端之前是否已获取到锁，若没有直接返回null
  ``` 
  
 ```java 
                          "end; " +
  ``` 
  
 ```java 
                          "local counter = redis.call('hincrby', KEYS[1], ARGV[3], -1); " +    //锁重入次数-1
  ``` 
  
 ```java 
                          "if (counter > 0) then " +    //若锁尚未完全释放，需要重置过期时间(默认为Watchdog默认时间30秒)
  ``` 
  
 ```java 
                          "redis.call('pexpire', KEYS[1], ARGV[2]); " +
  ``` 
  
 ```java 
                          "return 0; " +    //返回0表示锁未完全释放
  ``` 
  
 ```java 
                          "else " +
  ``` 
  
 ```java 
                          "redis.call('del', KEYS[1]); " +    //若锁已完全释放，删除当前key
  ``` 
  
 ```java 
                          "redis.call('publish', KEYS[2], ARGV[1]); " +  //释已完全释放，发布锁已释放的消息
  ``` 
  
 ```java 
                          "return 1; "+    //返回1表示锁已完全释放
  ``` 
  
 ```java 
                          "end; " +
  ``` 
  
 ```java 
                          "return nil;",
  ``` 
  
 ```java 
                  Arrays.<Object>asList(getName(), getChannelName()), LockPubSub.UNLOCK_MESSAGE, internalLockLeaseTime, getLockName(threadId));
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
      }
  ``` 
  
  
  
  解锁流程总结：线程直接执行Lua脚本进行锁释放，锁重入次数-1，若已完全释放需要发布锁已释放的消息并取消锁续约。 
  
  
 ##### （3）加解锁流程总结： 
  
   
    
    RedissionLock使用Lua脚本进行加解锁操作，保证了操作的原子性。 
    
   
    
    RedissionLock的重入信息保存在服务端，客户端不保存任何锁信息。 
    
   
    
    RedissionLock的所有同步操作其实都是调用的异步操作，只不过使用了CountDownLatch进行了同步。 
    
   
    
    加锁时若传递了锁的过期时间则锁会在指定时间后过期，否则使用Watchdog默认超时时间30秒，并会进行自动续期，周期为10秒，也就是说不会设置不过期的锁，防止客户端挂掉锁一直得不到释放。 
    
   
    
    获取锁失败后会订阅锁释放的消息，之后会阻塞等待，等待的最大时间为锁的剩余过期时间，若在等待期间收到了锁释放的消息将从阻塞中被唤醒（前提是当前线程在当前锁的竞争中排在队列的最前面，也可以理解成当前线程需要和本进程中的其他线程再做竞争，胜出的才会被唤醒），这里引入了等待通知机制，类似于单机锁中的LockSupport的park与unpark。若未接受到锁被释放的消息，线程也会在锁过期后自动被唤醒，之后再次尝试获取锁。 
    
  
  
 #### 2、Redisson中的RedLock： 
  
 ##### （1）为什么需要RedLock？ 
  
 ##### 上述提到的RedissonLock及其他类似的衍生锁（如RedissonFairLock等）都是在Redis单机或主从模式下使用的。单机模式下存在单点故障，而主从模式也有一个缺点：当主Redis宕机之后，从Redis还未同步保存在主Redis上的锁，此时将导致锁丢失。对此Redisson提供了RedissonRedLock，RedissonRedLock实现了RedLock算法，RedLock使用多Redis节点，理论上可以解决单点故障问题。 
  
 ##### （2）RedLock加解锁流程 
  
  
  获取当前时间戳。 
  client尝试按照顺序使用相同的key-value获取所有redis服务的锁，在获取锁的过程中，锁的获取时间需要远小于锁的过期时间，这是为了避免过长时间等待已经关闭的redis服务。之后试着获取下一个redis实例上的锁。比如：TTL为5s，设置获取锁最多用1s，所以如果一秒内无法获取锁，就放弃获取这个锁，从而尝试获取下个锁。 
  client获取所有能获取到的锁之后再使用当前的时间减去第一步的时间，这个时间差要小于TTL时间并且至少有（N/2+1）个redis实例成功获取锁，才算真正的获取锁成功。 
  如果成功获取锁，则锁的真正有效时间是 TTL减去第三步的时间差 的时间；比如：TTL 是5s,获取所有锁用了3s,则真正锁有效时间为2s。 
  如果客户端由于某些原因获取锁失败（没有在至少N/2+1个Redis实例获取到锁或者取锁时间已经超过了有效时间），客户端应该在所有Redis实例上进行解锁（即便某些Redis实例根本就没有加锁成功也需要解锁，防止某些节点由于网络抖动等原因实际已经获取到了锁，但是客户端没有得到响应而导致接下来的一段时间不能被重新获取到锁）。 
  
  
  
 ##### （3）RedLock的缺点？ 
  
  严重依赖时钟，在分布式系统中N（Network网络）、P（Process进程）、C（Clock时钟）三者都是不可靠的，如果某个Redis服务出现时钟跳跃（走的比其他机器快），那么可能会出现某个Redis节点的key提前过期，这样另外一个客户端就可能再次在N/2+1个Redis节点加锁成功（多个客户端同时获取到锁，不满足排他性）。其实由于对各个Redis是进行同步顺序加锁，这也会导致每个Redis上锁的过期时间不一致。一般生产环境很少使用RedLock。如果对可靠性要求不是很高的场景下，RedissonLock完全够用了，而对可靠性有高要求的场景下可以使用Zookeeper这种满足强一致性的分布式协调组件实现分布式锁。 
   
  
  
  PS：RedLock由Redis作者提出，而该算法在刚被提出来就受到了分布式系统大神 Martin Kleppmann的质疑，两人在网上进行了多次PK（打口水仗），感兴趣的同学可以查询下这方面的资料。 
  
 ###  
  
   
    
     
      
       
        
         
         4 
         
        
       
      
     
     
      
       
       58自研分布式锁WLock 
       
      
      
       
        
         
        
       
      
     
    
   
  
  
 ### 1. WLock与其他实现对比： 
  
 PS：上图来自WLock官方文档 
  
 #### 2. 主要特性： 
 WLock基于WPaxos实现分布式锁服务，引入RocksDB实现锁状态持久化���储，封装TTL和续约机制以及watch异步通知功能，同时提供可视化监管平台，提供了一套完备的分布式锁实现方案； 
  
 ##### （1）WPaxos简述： 
 WPaxos为58集团参照微信团队开源的PhxPaxos（C++）采用Java语言实现的分布式一致性组件，其将Multi-Paxos算法与Basic-Paxos算法结合，支持多Paxos分组，有序确定多个值，相比于ZAB和Raft等一致性算法更加灵活（Raft、Zab在Multi-Paxos基础上添加了Leader选举限制，简化了实现更易让人理解，但强依赖Leader使灵活性略逊于Multi-Paxos，目前Multi-Paxos较为成熟的开源实现是微信团队C++语言开发的PhxPaxos生产级类库）。 
  
 PS：上图来自WLock官方文档 
  
 ##### （2）RocksDB简述： 
 LevelDB是由Google开源的，基于LSM Tree的单机KV数据库，其特点是高效，代码简洁而优美，Rocksdb则是Facebook基于LevelDB改造的。RocksDB 和LevelDB 是一个库，嵌入在用户的程序中，用户程序直接调用接口读写数据，相对于Redis不需要建立连接才能发起请求，读写数据。 
  
 #### 3. WLock加锁方式： 
 WLock不像Redisson提供了多种类型的锁，其只提供了WDistributedLock，但同样支持互斥锁、可重入锁、公平锁及带权重优先级锁，可通过同步阻塞或者异步非阻塞方式获取到锁。所有对分布式锁的操作都通过该对象进行，在获取锁时可以传递以下参数： 
  
   
    
    
   
   
    
    waitAcquire 
    是否阻塞等待获取到锁，true为阻塞，false为非阻塞 
    
    
    expireTime 
    锁过期时间，单位毫秒，默认值为5分钟，最大取值5分钟，最小值5秒 
    
    
    maxWaitTime 
    最长等待获取锁的时间，单位毫秒，最大值Long.MAX_VALUE 
    
    
    weight 
    锁权重，默认都为1，取值范围[1, 10]，权重越高，获取到锁概率越高 
    
    
    renewInterval 
    自动续约间隔，单位毫秒(默认为Integer.MAX_VALUE，不自动续租，最小自动续租间隔为1000ms,最大自动续租间隔不能超过过期时间，由业务控制)。 
    
    
    renewListener 
    续约Listener回调 
    
    
    lockExpireListener 
    锁过期Listener回调 
    
    
    watchListener 
    异步监听事件回调 
    
   
  
  
 #### 4. WLock（1.0.8版本）源码分析： 
  
 ##### （1）获取锁（阻塞式）： 
  
   
 ```java 
  public AcquireLockResult tryAcquireLock(String lockkey, InternalLockOption lockOption) throws ParameterIllegalException {
  ``` 
  
 ```java 
      AcquireLockResult result = new AcquireLockResult();
  ``` 
  
 ```java 
      result.setRet(false);
  ``` 
  
 ```java 
      long startTimestamp = System.currentTimeMillis();
  ``` 
  
 ```java 
      //进行参数校验，若参数错误将抛出异常
  ``` 
  
 ```java 
      this.lockParameterCheck(lockOption);
  ``` 
  
 ```java 
      //如果已经获取到锁且还未过期，本地也会储存一份锁信息，这里先从本地判断是否获取到锁
  ``` 
  
 ```java 
      //若已经获取到了锁，表示本次为锁重入，lockContext中的aquiredCount进行+1操作
  ``` 
  
 ```java 
      if (this.lockManager.acquiredLockLocal(lockkey, lockOption)) {
  ``` 
  
 ```java 
          LockContext lockContext = this.lockManager.getLocalLockContext(lockkey, lockOption.getThreadID());
  ``` 
  
 ```java 
          //如果从本地获取到了锁，重新设置锁过期时间为本次设置的过期时间
  ``` 
  
 ```java 
          this.renewLock(lockkey, lockContext.getLockVersion(), lockOption.getExpireTime(), lockOption.getThreadID());
  ``` 
  
 ```java 
          result.setOwner(new LockOwner(InetAddressUtil.getIpInt(), lockOption.getThreadID(), lockOption.getPID()));
  ``` 
  
 ```java 
          result.setResponseStatus(ResponseStatus.SUCCESS);
  ``` 
  
 ```java 
          result.setRet(true);
  ``` 
  
 ```java 
          result.setLockVersion(lockContext.getLockVersion());
  ``` 
  
 ```java 
          return result;
  ``` 
  
 ```java 
      } else {
  ``` 
  
 ```java 
          int timeout = (int)Math.min((long)this.wlockClient.getDefaultTimeoutForReq(), lockOption.getMaxWaitTime());
  ``` 
  
 ```java 
          WatchEvent watchEvent = null;
  ``` 
  
 ```java 
          //如果是以阻塞方式获取锁，首先注册ACQUIRE类型的watchEvent，用于异步接收到服务器返回的消息时可以根据映射关系唤醒阻塞等待的线程
  ``` 
  
 ```java 
          if (lockOption.isWaitAcquire()) {
  ``` 
  
 ```java 
              //watchEvent内置了CountDownLatch
  ``` 
  
 ```java 
              watchEvent = new WatchEvent(lockkey, lockOption.getThreadID(), lockOption.getWatchID(), WatchType.ACQUIRE, startTimestamp);
  ``` 
  
 ```java 
              watchEvent.setLockOption(lockOption);
  ``` 
  
 ```java 
              watchEvent.setTimeout(lockOption.getMaxWaitTime());
  ``` 
  
 ```java 
              //注册的本质为在本地的Map里面保存watchId -> watchEvent及lockKey -> watchIdSet的映射关系
  ``` 
  
 ```java 
              this.watchManager.registerWatchEvent(lockkey, watchEvent);
  ``` 
  
 ```java 
          }
  ``` 
  
 ```java 
          //该groupId用于Multi-group-Paxos
  ``` 
  
 ```java 
          int groupId = this.wlockClient.getRegistryKey().getGroupId();
  ``` 
  
 ```java 
          AcquireLockRequest acquireLockReq = this.protocolFactory.createAcquireReq(lockkey, groupId, lockOption);
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
          try {
  ``` 
  
 ```java 
              //同步请求加锁，若请求失败（注意不是加锁失败）会进行重试，默认重试次数为2次
  ``` 
  
 ```java 
              SendReqResult sendReqResult = this.serverPoolHandler.syncSendRequest(acquireLockReq, timeout, "tryAcquireLock " + lockkey);
  ``` 
  
 ```java 
              if (sendReqResult != null) {
  ``` 
  
 ```java 
                  AcquireLockResponse resp = new AcquireLockResponse();
  ``` 
  
 ```java 
                  resp.fromBytes(sendReqResult.getData());
  ``` 
  
 ```java 
                  result.setResponseStatus(resp.getStatus());
  ``` 
  
 ```java 
                  AcquireLockResult var13;
  ``` 
  
 ```java 
                  if (resp.getStatus() == ResponseStatus.LOCK_WAIT) {
  ``` 
  
 ```java 
                      //如果获取锁失败，服务端返回LOCK_WAIT表示客户端需要阻塞等待锁获取的消息
  ``` 
  
 ```java 
                      //内部会使用上面创建的watchEvent内部的CountDownLatch进行同步阻塞等待，当接受到服务器返回的消息后将会被唤醒
  ``` 
  
 ```java 
                      NotifyEvent notifyEvent = this.watchManager.waitNotifyEvent(lockOption.getWatchID(), lockOption.getMaxWaitTime());
  ``` 
  
 ```java 
                      if (notifyEvent != null && notifyEvent.getEventType() == EventType.LOCK_ACQUIRED.getType()) {
  ``` 
  
 ```java 
                          //若成功获取到锁，将锁信息保存到本地
  ``` 
  
 ```java 
                          this.lockManager.updateLockLocal(lockkey, notifyEvent.getFencingToken(), lockOption, true);
  ``` 
  
 ```java 
                          //注销保存在本地的watchId -> watchEvent及lockKey -> watchIdSet的映射关系
  ``` 
  
 ```java 
                          EventCachedHandler.getInstance(this.wlockClient).unRegisterWatchEvent(lockkey, notifyEvent.getWatchID());
  ``` 
  
 ```java 
                          AcquireEvent acquireEvent = new AcquireEvent(lockkey, resp.getFencingToken(), lockOption, lockOption.getThreadID());
  ``` 
  
 ```java 
                          EventCachedHandler.getInstance(this.wlockClient).registerAcquireEvent(acquireEvent);
  ``` 
  
 ```java 
                          result.setRet(true);
  ``` 
  
 ```java 
                          result.setLockVersion(notifyEvent.getFencingToken());
  ``` 
  
 ```java 
                          result.setOwner(new LockOwner(acquireLockReq.getHost(), acquireLockReq.getThreadID(), acquireLockReq.getPid()));
  ``` 
  
 ```java 
                          result.setResponseStatus(ResponseStatus.SUCCESS);
  ``` 
  
 ```java 
                      } else {
  ``` 
  
 ```java 
                          //超时返回锁获取失败
  ``` 
  
 ```java 
                          result.setRet(false);
  ``` 
  
 ```java 
                      }
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
                      var13 = result;
  ``` 
  
 ```java 
                      return var13;
  ``` 
  
 ```java 
                  }
  ``` 
  
 ```java 
                //加锁成功之后，将锁信息保存在本地
  ``` 
  
 ```java 
                  //若设置了续约时间会使用ScheduledExecutorService进行定时续约（续约逻辑在updateLockLocal里面）
  ``` 
  
 ```java 
                  if (resp.getStatus() == ResponseStatus.SUCCESS) {
  ``` 
  
 ```java 
                      this.lockManager.updateLockLocal(lockkey, resp.getFencingToken(), lockOption, false);
  ``` 
  
 ```java 
                      result.setRet(true);
  ``` 
  
 ```java 
                      result.setLockVersion(resp.getFencingToken());
  ``` 
  
 ```java 
                      result.setOwner(new LockOwner(resp.getOwnerHost(), resp.getThreadID(), resp.getPid()));
  ``` 
  
 ```java 
                      AcquireEvent acquireEvent = new AcquireEvent(lockkey, resp.getFencingToken(), lockOption, lockOption.getThreadID());
  ``` 
  
 ```java 
                      EventCachedHandler.getInstance(this.wlockClient).registerAcquireEvent(acquireEvent);
  ``` 
  
 ```java 
                      var13 = result;
  ``` 
  
 ```java 
                      return var13;
  ``` 
  
 ```java 
                  }
  ``` 
  
 ```java 
                  //超时直接返回
  ``` 
  
 ```java 
                  if (resp.getStatus() != ResponseStatus.TIMEOUT) {
  ``` 
  
 ```java 
                      result.setRet(false);
  ``` 
  
 ```java 
                      AcquireLockResult var12 = result;
  ``` 
  
 ```java 
                      return var12;
  ``` 
  
 ```java 
                  }
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
                  result.setRet(false);
  ``` 
  
 ```java 
              }
  ``` 
  
 ```java 
          } catch (Exception var17) {
  ``` 
  
 ```java 
              logger.error(Version.INFO + ", tryAcquireLock error.", var17);
  ``` 
  
 ```java 
          } finally {
  ``` 
  
 ```java 
              //不管是成功获取到锁还是抛出了异常都需要注销watchEvent
  ``` 
  
 ```java 
              this.watchManager.unRegisterWatchEvent(lockkey, lockOption.getWatchID());
  ``` 
  
 ```java 
          }
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
          return result;
  ``` 
  
 ```java 
      }
  ``` 
  
 ```java 
  }
  ``` 
  
  
 加锁流程总结：线程首先尝试从本地进行加锁，如果加锁成功表示本次是锁重入，本地锁重入次数+1后直接返回，否则尝试从远程加锁，若加锁成功将锁信息保存在本地。若加锁失败会使用异步竞争锁方式，同步阻塞等待获取锁的消息，在等待过程中发生超时返回锁获取失败。 
  
 ##### （2）释放锁： 
  
   
 ```java 
  public LockResult releaseLock(String lockkey, long lockVersion, boolean forced, long threadID) {
  ``` 
  
 ```java 
     int timeout = this.wlockClient.getDefaultTimeoutForReq();
  ``` 
  
 ```java 
     //从本地获取锁信息，若没获取到说明锁已释放(这里使用本地内存当���器重启时信息会丢失)
  ``` 
  
 ```java 
     LockContext lockContext = lockManager.getLocalLockContext(lockkey, threadID);
  ``` 
  
 ```java 
     if (lockContext == null) {
  ``` 
  
 ```java 
        return new LockResult(false, ResponseStatus.LOCK_DELETED);
  ``` 
  
 ```java 
     }
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
     long ownerThreadID = threadID;
  ``` 
  
 ```java 
     if (lockVersion == -1) {
  ``` 
  
 ```java 
        lockVersion = lockContext.getLockVersion();
  ``` 
  
 ```java 
     }
  ``` 
  
 ```java 
     if (ownerThreadID == -1) {
  ``` 
  
 ```java 
        ownerThreadID = lockContext.getLockOption().getThreadID();
  ``` 
  
 ```java 
     }
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
     //释放本地锁，将重入次数-1，若已到0删除本地锁并取消定时续约
  ``` 
  
 ```java 
     int releaseRet = this.lockManager.releaseLockLocal(lockkey, ownerThreadID, forced);
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
     //releaseRet大于0表示锁未完全释放，本地解锁是重入次数-1，直接返回
  ``` 
  
 ```java 
     if (releaseRet > 0) {
  ``` 
  
 ```java 
        return new LockResult(true, ResponseStatus.SUCCESS);
  ``` 
  
 ```java 
     }
  ``` 
  
 ```java 
     //因为线程ID不匹配或释放一个尚未获取到的锁（也可以表现为锁已被删除或已过期）返回释放失败
  ``` 
  
 ```java 
     if (releaseRet < 0) {
  ``` 
  
 ```java 
        return new LockResult(false, ResponseStatus.LOCK_DELETED);
  ``` 
  
 ```java 
     }
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
     //releaseRet等于0表示当前锁已完全释放，重入次数为0，需要释放服务器上的锁
  ``` 
  
 ```java 
     int groupId = this.wlockClient.getRegistryKey().getGroupId();
  ``` 
  
 ```java 
     ReleaseLockRequest releaseLockReq = protocolFactory.createReleaseLockReq(lockkey, groupId, this.registryKey, lockVersion, ownerThreadID, WLockClient.currentPid);
  ``` 
  
 ```java 
     try {
  ``` 
  
 ```java 
        //同步发送释放锁的请求
  ``` 
  
 ```java 
        SendReqResult sendReqResult = this.serverPoolHandler.syncSendRequest(releaseLockReq, timeout, "releaseLock " + lockkey);
  ``` 
  
 ```java 
        if (sendReqResult != null) {
  ``` 
  
 ```java 
           ReleaseLockResponse resp = new ReleaseLockResponse();
  ``` 
  
 ```java 
           resp.fromBytes(sendReqResult.getData());
  ``` 
  
 ```java 
           if (resp.getStatus() == ResponseStatus.SUCCESS) {
  ``` 
  
 ```java 
              //若锁释放成功，注销保存在本地的锁已获取事件
  ``` 
  
 ```java 
              EventCachedHandler.getInstance(wlockClient).unRegisterAcquireEvent(lockkey, ownerThreadID);
  ``` 
  
 ```java 
              return new LockResult(true, ResponseStatus.SUCCESS);
  ``` 
  
 ```java 
           } else if (resp.getStatus() == ResponseStatus.TIMEOUT) {    //超时及其他返回失败
  ``` 
  
 ```java 
              logger.error(Version.INFO + ", releaseLock status : " + ResponseStatus.toStr(resp.getStatus()) + ", lockkey : " + lockkey + ", server : " + sendReqResult.getServer() + ", timeout : " + timeout);
  ``` 
  
 ```java 
           } else {
  ``` 
  
 ```java 
              logger.error(Version.INFO + ", releaseLock status : " + ResponseStatus.toStr(resp.getStatus()) + ", lockkey : " + lockkey);
  ``` 
  
 ```java 
           }
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
           return new LockResult(false, resp.getStatus());
  ``` 
  
 ```java 
        }
  ``` 
  
 ```java 
     } catch (Exception e) {
  ``` 
  
 ```java 
        logger.error(Version.INFO + ", releaseLock error.", e);
  ``` 
  
 ```java 
     }
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
     return new LockResult(false, ResponseStatus.TIMEOUT);
  ``` 
  
 ```java 
  }
  ``` 
  
  
 解锁流程总结：首先从本地获取锁信息，若本地无锁信息表示锁已删除，否则进行锁重入次数-1，当锁已完全释放时（重入次数为0），进行远程解锁。 
  
 ##### （3）加解锁流程总结： 
  
  WLock的客户端及服务端都有加锁逻辑，首次加锁时使用服务端加锁，之后的锁重入都在客户端进行。 
  如果设置了自动续约间隔，在加锁成功之后客户端会自动进行锁续约（前提是在WLock服务管理平台设置了开启自动续约功能）。 
   
    
    阻塞式获取锁可以设置超时时间（RedissonLock的lock方法不可设置，但在非阻塞式的tryLock方法中可以设置超时时间）。 
    
   
    
    阻塞获取锁时如果获取锁失败会使用异步竞争锁方式，注册ACQUIRE类型的watchEvent后阻塞等待锁已获取的消息，服务端加锁结果异步通知的线程与客户端同步阻塞等待的线程使用watchEvent内部的CountDownLatch进行通信。 
    
   
    
    WLock在本地保存锁重入信息而非在服务端保存��重��信息（RedissonLock是在服务端保存），是因为锁放在服务端的话 可能会有网络等不确定因素导致加锁次数与释放锁次数不一致，比如客户端发起了三次加锁请求，在服务端都已经加锁成功，但是由于网络抖动某次请求发生了超时，这将导致客户端认为只加锁成功了两次，于是在释放锁时只调用了两次释放锁动作，实际上这时锁尚未完全释放（与WLock负责人沟通所知）。 
    
    
     
    
  
  
   
    
     
      
       
        
         
         5 
         
        
       
      
     
     
      
       
       死锁问题补充 
       
      
      
       
        
         
        
       
      
     
    
   
  
  
 ### 不管是RedissonLock还是WLock都使用了客户端定时续约的方式延长锁过期时间，如果处理不当将造成死锁：由于加锁和锁续约在两个线程中执行，若加锁线程在释放锁之前异常退出将导致续约线程一直执行续约操作，造成死锁，此时只能使用重启进程的方式进行锁释放。所以业务在加锁处理逻辑的上层一定添加try catch 异常获，在finally逻辑中释放锁。加解锁操作参照阿里开发规范： 
  
   
 ```java 
  正例：
  ``` 
  
 ```java 
    Lock lock = new XxxLock();
  ``` 
  
 ```java 
    // ...
  ``` 
  
 ```java 
    lock.lock();
  ``` 
  
 ```java 
    try {
  ``` 
  
 ```java 
        doSomething();
  ``` 
  
 ```java 
        doOthers();
  ``` 
  
 ```java 
    } finally {
  ``` 
  
 ```java 
        lock.unlock();
  ``` 
  
 ```java 
    }
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
  反例：
  ``` 
  
 ```java 
    Lock lock = new XxxLock();
  ``` 
  
 ```java 
    // ...
  ``` 
  
 ```java 
    try {
  ``` 
  
 ```java 
        // 如果此处抛出异常，则直接执行 finally 代码块
  ``` 
  
 ```java 
        doSomething();
  ``` 
  
 ```java 
        // 无论加锁是否成功，finally 代码块都会执行
  ``` 
  
 ```java 
        lock.lock();
  ``` 
  
 ```java 
        doOthers();
  ``` 
  
 ```java 
    } finally {
  ``` 
  
 ```java 
        lock.unlock();
  ``` 
  
 ```java 
    }
  ``` 
  
  
  
  
   
    
     
      
       
        
         
         6 
         
        
       
      
     
     
      
       
       WLock使用工具类 
       
      
      
       
        
         
        
       
      
     
    
   
  
 目前我们部门的服务使用分布式锁的场景已全部切换至WLock，为了更加方便地使用WLock，我参照RedissonLock的API风格封装了一个工具类，可以帮助业务系统快速的接入，工具类源码如下： 
  
   
 ```java 
  /**
  ``` 
  
 ```java 
   * @author Archi Liu
  ``` 
  
 ```java 
   * @version 1.0
  ``` 
  
 ```java 
   * @date 2021/11/10 3:20 下午
  ``` 
  
 ```java 
   * 分布式锁服务
  ``` 
  
 ```java 
   */
  ``` 
  
 ```java 
  @Slf4j
  ``` 
  
 ```java 
  @Service
  ``` 
  
 ```java 
  //@Conditional(WLockCondition.class)
  ``` 
  
 ```java 
  public class LockService {
  ``` 
  
 ```java 
      /**
  ``` 
  
 ```java 
       * WLock的秘钥文件名(秘钥文件从WLock管理平台下载)
  ``` 
  
 ```java 
       */
  ``` 
  
 ```java 
      @Value("${wlock.key.file:}")
  ``` 
  
 ```java 
      private String keyName;
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
      /**
  ``` 
  
 ```java 
       * 客户端请求失败重试次数，底层默认重试2次，可修改该值提升性能
  ``` 
  
 ```java 
       */
  ``` 
  
 ```java 
      @Value("${wlock.retryNum:-1}")
  ``` 
  
 ```java 
      private Integer retryNum;
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
      /**
  ``` 
  
 ```java 
       * 若未设置过期锁时间，则使用该过期时间（30秒）
  ``` 
  
 ```java 
       */
  ``` 
  
 ```java 
      private final int defaultExpireTime = 30 * 1000;
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
      /**
  ``` 
  
 ```java 
       * 自动续期时间为过期时间的1/3
  ``` 
  
 ```java 
       */
  ``` 
  
 ```java 
      private final int defaultRenewIntervalTime = 10 * 1000;
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
      /**
  ``` 
  
 ```java 
       * 配置文件路径，需要兼容WF及SCF项目在容器环境和本地环境上的路径
  ``` 
  
 ```java 
       */
  ``` 
  
 ```java 
      private static String configPath;
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
      /**
  ``` 
  
 ```java 
       * WLock秘钥文件名称(优先级高于keyName)
  ``` 
  
 ```java 
       */
  ``` 
  
 ```java 
      private static String keyFileName;
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
      /**
  ``` 
  
 ```java 
       * 操作WLock的客户端，使用懒加载单例模式（使用volatile禁止指令重排序）
  ``` 
  
 ```java 
       */
  ``` 
  
 ```java 
      private volatile WLockClient wLockClient;
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
      /**
  ``` 
  
 ```java 
       * 如果是WF及SCF项目，需要调用该方法初始化WLock配置文件目录（scf-springboot项目做了兼容处理）
  ``` 
  
 ```java 
       *
  ``` 
  
 ```java 
       * @param path
  ``` 
  
 ```java 
       */
  ``` 
  
 ```java 
      public static void initConfigPath(String path) {
  ``` 
  
 ```java 
          log.info("[LockUtil] preProcessConfigPath configPath:{}", path);
  ``` 
  
 ```java 
          configPath = path;
  ``` 
  
 ```java 
      }
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
      /**
  ``` 
  
 ```java 
       * 如果项目未将yml/properties里面的键值对放入spring的PropertySourcesPlaceholderConfigurer中，需要使用此方法设置文件路径+文件名
  ``` 
  
 ```java 
       *
  ``` 
  
 ```java 
       * @param path
  ``` 
  
 ```java 
       */
  ``` 
  
 ```java 
      public static void initConfigPath(String path,String fileName) {
  ``` 
  
 ```java 
          log.info("[LockUtil] preProcessConfigPath configPath:{}，fileName={}", path,fileName);
  ``` 
  
 ```java 
          configPath = path;
  ``` 
  
 ```java 
          keyFileName = fileName;
  ``` 
  
 ```java 
      }
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
      /**
  ``` 
  
 ```java 
       * 获取WLock配置文件所在路径，如果项目中未配置则先检查是否为scf-springboot项目容器部署环境，如果不是默认读取本地配置
  ``` 
  
 ```java 
       *
  ``` 
  
 ```java 
       * @return
  ``` 
  
 ```java 
       */
  ``` 
  
 ```java 
      private String getConfigPath() {
  ``` 
  
 ```java 
          if (configPath != null) {
  ``` 
  
 ```java 
              return configPath;
  ``` 
  
 ```java 
          }
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
          //如果是在容器环境上发布的scf-springboot类型项目将会有该配置值
  ``` 
  
 ```java 
          configPath = System.getProperty("scf.config.location");
  ``` 
  
 ```java 
          if (StringUtils.isEmpty(configPath)) {
  ``` 
  
 ```java 
              configPath = Thread.currentThread().getContextClassLoader().getResource("").getPath();
  ``` 
  
 ```java 
          }
  ``` 
  
 ```java 
          log.info("[LockUtil] postProcessConfigPath configPath:{}", configPath);
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
          return configPath;
  ``` 
  
 ```java 
      }
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
      /**
  ``` 
  
 ```java 
       * 获取单例WLockClient
  ``` 
  
 ```java 
       *
  ``` 
  
 ```java 
       * @return
  ``` 
  
 ```java 
       */
  ``` 
  
 ```java 
      private WLockClient getWLockClient() {
  ``` 
  
 ```java 
          //使用局部变量减少读写volatile变量带来的性能损耗（参考spring单例实现模式）
  ``` 
  
 ```java 
          WLockClient wLockClient = this.wLockClient;
  ``` 
  
 ```java 
          if (wLockClient != null) {
  ``` 
  
 ```java 
              return wLockClient;
  ``` 
  
 ```java 
          }
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
          synchronized (WLockClient.class) {
  ``` 
  
 ```java 
              wLockClient = this.wLockClient;
  ``` 
  
 ```java 
              if (wLockClient != null) {
  ``` 
  
 ```java 
                  return wLockClient;
  ``` 
  
 ```java 
              }
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
              try {
  ``` 
  
 ```java 
                  String realFileName = StringUtils.isNotEmpty(keyFileName) ? keyFileName : keyName;
  ``` 
  
 ```java 
                  wLockClient = new WLockClient(getConfigPath() + realFileName);
  ``` 
  
 ```java 
                  //如果设置了重试次数需要重置默认重试次数，默认重试次数为2次(defaultRetry默认值为3，WLock内部将首次发请求也算作一次retry)
  ``` 
  
 ```java 
                  if (retryNum >= 0) {
  ``` 
  
 ```java 
                      wLockClient.setDefaultRetries(retryNum + 1);
  ``` 
  
 ```java 
                  }
  ``` 
  
 ```java 
                  this.wLockClient = wLockClient;
  ``` 
  
 ```java 
              } catch (Exception e) {
  ``` 
  
 ```java 
                  log.error("[LockUtil] WLockClient init failed！exception:{}", ExceptionUtil.getStackTrace(e));
  ``` 
  
 ```java 
                  throw new DistributedLockException(ResponseCodeEnum.LOCK_CLIENT_INIT_FAIL);
  ``` 
  
 ```java 
              }
  ``` 
  
 ```java 
          }
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
          return wLockClient;
  ``` 
  
 ```java 
      }
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
      /**
  ``` 
  
 ```java 
       * 使用非阻塞方式尝试获取分布式锁，若获取成功返回true，否则返回false。初始锁过期时间为30秒，成功获取到锁之后将自动进行锁续期。
  ``` 
  
 ```java 
       *
  ``` 
  
 ```java 
       * @param lockName 锁名称
  ``` 
  
 ```java 
       * @return
  ``` 
  
 ```java 
       */
  ``` 
  
 ```java 
      public boolean tryGetDistributedLock(String lockName) {
  ``` 
  
 ```java 
          AcquireLockResult lockResult;
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
          try {
  ``` 
  
 ```java 
              WDistributedLock wLock = getWLockClient().newDistributeLock(lockName);
  ``` 
  
 ```java 
              lockResult = wLock.tryAcquireLockUnblocked(defaultExpireTime, defaultRenewIntervalTime, getRenewListener(), getLockExpireListener());
  ``` 
  
 ```java 
          } catch (ParameterIllegalException e) {
  ``` 
  
 ```java 
              log.error("[LockUtil] tryGetDistributedLock error! parameter illegal, lockName={}，lockExpireTime={},renewInterval={},exception:{}",
  ``` 
  
 ```java 
                      lockName, defaultExpireTime, defaultRenewIntervalTime, ExceptionUtil.getStackTrace(e));
  ``` 
  
 ```java 
              return false;
  ``` 
  
 ```java 
          }
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
          log.info("[LockUtil] tryGetDistributedLock lockName={},result={}", lockName, lockResult.toString());
  ``` 
  
 ```java 
          return lockResult.isSuccess();
  ``` 
  
 ```java 
      }
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
      /**
  ``` 
  
 ```java 
       * 使用非阻塞方式尝试获取分布式锁，若获取成功返回true，否则返回false。成功获取到锁之后锁将在指定过期时间之后过期
  ``` 
  
 ```java 
       *
  ``` 
  
 ```java 
       * @param lockName   锁名称
  ``` 
  
 ```java 
       * @param expireTime 锁过期时间
  ``` 
  
 ```java 
       * @param unit       锁过期时间单位
  ``` 
  
 ```java 
       * @return
  ``` 
  
 ```java 
       */
  ``` 
  
 ```java 
      public boolean tryGetDistributedLock(String lockName, int expireTime, TimeUnit unit) {
  ``` 
  
 ```java 
          //锁过期时间
  ``` 
  
 ```java 
          int lockExpireTime = (int) unit.toMillis(expireTime);
  ``` 
  
 ```java 
          AcquireLockResult lockResult;
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
          try {
  ``` 
  
 ```java 
              WDistributedLock wdLock = getWLockClient().newDistributeLock(lockName);
  ``` 
  
 ```java 
              lockResult = wdLock.tryAcquireLockUnblocked(lockExpireTime, getLockExpireListener());
  ``` 
  
 ```java 
          } catch (ParameterIllegalException e) {
  ``` 
  
 ```java 
              log.error("[LockUtil] tryGetDistributedLock error! parameter illegal, lockName={}，lockExpireTime={},exception:{}",
  ``` 
  
 ```java 
                      lockName, lockExpireTime, ExceptionUtil.getStackTrace(e));
  ``` 
  
 ```java 
              return false;
  ``` 
  
 ```java 
          }
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
          log.info("[LockUtil] tryGetDistributedLock lockName={},result={}", lockName, lockResult.toString());
  ``` 
  
 ```java 
          return lockResult.isSuccess();
  ``` 
  
 ```java 
      }
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
      /**
  ``` 
  
 ```java 
       * 使用阻塞方式尝试获取分布式锁，若未获取到将一直阻塞等待，初始锁过期时间为30秒，成功获取到锁之后将自动��行锁续期。
  ``` 
  
 ```java 
       *
  ``` 
  
 ```java 
       * @param lockName
  ``` 
  
 ```java 
       */
  ``` 
  
 ```java 
      public void getDistributedLock(String lockName) {
  ``` 
  
 ```java 
          //锁自动续期间隔（过期时间的三分之一）
  ``` 
  
 ```java 
          AcquireLockResult lockResult;
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
          try {
  ``` 
  
 ```java 
              WDistributedLock wLock = getWLockClient().newDistributeLock(lockName);
  ``` 
  
 ```java 
              lockResult = wLock.tryAcquireLock(defaultExpireTime, Integer.MAX_VALUE, defaultRenewIntervalTime, getRenewListener(), getLockExpireListener());
  ``` 
  
 ```java 
          } catch (ParameterIllegalException e) {
  ``` 
  
 ```java 
              log.error("[LockUtil] getDistributedLock error! parameter illegal, lockName={}，lockExpireTime={},lockMaxWaitTime={},renewInterval={},exception:{}",
  ``` 
  
 ```java 
                      lockName, defaultExpireTime, Integer.MAX_VALUE, defaultRenewIntervalTime, ExceptionUtil.getStackTrace(e));
  ``` 
  
 ```java 
              throw new DistributedLockException(ResponseCodeEnum.GET_LOCK_PARAM_ERROR);
  ``` 
  
 ```java 
          }
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
          log.info("[LockUtil] getDistributedLock lockName={},lockResult={}", lockName, lockResult.toString());
  ``` 
  
 ```java 
          if (!lockResult.isSuccess()) {
  ``` 
  
 ```java 
              throw new DistributedLockException(ResponseCodeEnum.GET_LOCK_FAIL);
  ``` 
  
 ```java 
          }
  ``` 
  
 ```java 
      }
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
      /**
  ``` 
  
 ```java 
       * 使用阻塞方式尝试获取分布式锁，若未获取到将一直阻塞等待，成功获取到锁之后锁将在指定过期时间之后过期
  ``` 
  
 ```java 
       *
  ``` 
  
 ```java 
       * @param lockName   锁名称
  ``` 
  
 ```java 
       * @param expireTime 锁过期时间
  ``` 
  
 ```java 
       * @param unit       锁过期时间单位
  ``` 
  
 ```java 
       * @return
  ``` 
  
 ```java 
       */
  ``` 
  
 ```java 
      public void getDistributedLock(String lockName, int expireTime, TimeUnit unit) {
  ``` 
  
 ```java 
          //锁过期时间
  ``` 
  
 ```java 
          int lockExpireTime = (int) unit.toMillis(expireTime);
  ``` 
  
 ```java 
          AcquireLockResult lockResult;
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
          try {
  ``` 
  
 ```java 
              WDistributedLock wdLock = getWLockClient().newDistributeLock(lockName);
  ``` 
  
 ```java 
              lockResult = wdLock.tryAcquireLock(lockExpireTime, Integer.MAX_VALUE, getLockExpireListener());
  ``` 
  
 ```java 
          } catch (ParameterIllegalException e) {
  ``` 
  
 ```java 
              log.error("[LockUtil] getDistributedLock error! parameter illegal, lockName={}，lockExpireTime={},lockMaxWaitTime={},exception:{}",
  ``` 
  
 ```java 
                      lockName, lockExpireTime, Integer.MAX_VALUE, ExceptionUtil.getStackTrace(e));
  ``` 
  
 ```java 
              throw new DistributedLockException(ResponseCodeEnum.GET_LOCK_PARAM_ERROR);
  ``` 
  
 ```java 
          }
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
          log.info("[LockUtil] getDistributedLock lockName={},lockResult={}", lockName, lockResult.toString());
  ``` 
  
 ```java 
          if (!lockResult.isSuccess()) {
  ``` 
  
 ```java 
              throw new DistributedLockException(ResponseCodeEnum.GET_LOCK_FAIL);
  ``` 
  
 ```java 
          }
  ``` 
  
 ```java 
      }
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
      /**
  ``` 
  
 ```java 
       * 使用阻塞方式尝试获取分布式锁，最多等待maxWaitTime时间，成功获取到锁之后锁将在指定过期时间之后过期
  ``` 
  
 ```java 
       *
  ``` 
  
 ```java 
       * @param lockName   锁名称
  ``` 
  
 ```java 
       * @param expireTime 锁过期时间
  ``` 
  
 ```java 
       * @param expireTime 最长等待时间
  ``` 
  
 ```java 
       * @param unit       锁过期时间单位
  ``` 
  
 ```java 
       * @return
  ``` 
  
 ```java 
       */
  ``` 
  
 ```java 
      public void getDistributedLock(String lockName, int expireTime, int maxWaitTime, TimeUnit unit) {
  ``` 
  
 ```java 
          //锁过期时间
  ``` 
  
 ```java 
          int lockExpireTime = (int) unit.toMillis(expireTime);
  ``` 
  
 ```java 
          //获取锁最大等待时间
  ``` 
  
 ```java 
          int lockMaxWaitTime = (int) unit.toMillis(maxWaitTime);
  ``` 
  
 ```java 
          AcquireLockResult lockResult;
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
          try {
  ``` 
  
 ```java 
              WDistributedLock wdLock = getWLockClient().newDistributeLock(lockName);
  ``` 
  
 ```java 
              lockResult = wdLock.tryAcquireLock(lockExpireTime, lockMaxWaitTime, getLockExpireListener());
  ``` 
  
 ```java 
          } catch (ParameterIllegalException e) {
  ``` 
  
 ```java 
              log.error("[LockUtil] getDistributedLock error! parameter illegal, lockName={}，lockExpireTime={},lockMaxWaitTime={},exception:{}",
  ``` 
  
 ```java 
                      lockName, lockExpireTime, lockMaxWaitTime, ExceptionUtil.getStackTrace(e));
  ``` 
  
 ```java 
              throw new DistributedLockException(ResponseCodeEnum.GET_LOCK_PARAM_ERROR);
  ``` 
  
 ```java 
          }
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
          log.info("[LockUtil] getDistributedLock lockName={},lockResult={}", lockName, lockResult.toString());
  ``` 
  
 ```java 
          if (!lockResult.isSuccess()) {
  ``` 
  
 ```java 
              //修改成获取分布式锁失败的异常
  ``` 
  
 ```java 
              throw new DistributedLockException(ResponseCodeEnum.GET_LOCK_FAIL);
  ``` 
  
 ```java 
          }
  ``` 
  
 ```java 
      }
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
      /**
  ``` 
  
 ```java 
       * 释放分布式锁，若释放成功返回true，否则返回false，锁释放失败不会抛出异常
  ``` 
  
 ```java 
       *
  ``` 
  
 ```java 
       * @param lockName 锁名称
  ``` 
  
 ```java 
       * @return
  ``` 
  
 ```java 
       */
  ``` 
  
 ```java 
      public boolean releaseDistributedLock(String lockName) {
  ``` 
  
 ```java 
          LockResult lockResult;
  ``` 
  
 ```java 
          try {
  ``` 
  
 ```java 
              WDistributedLock wdLock = getWLockClient().newDistributeLock(lockName);
  ``` 
  
 ```java 
              lockResult = wdLock.releaseLock();
  ``` 
  
 ```java 
          } catch (ParameterIllegalException e) {
  ``` 
  
 ```java 
              log.error("[LockUtil] releaseDistributedLock error! parameter illegal,lockName={},exception:{}", lockName, ExceptionUtil.getStackTrace(e));
  ``` 
  
 ```java 
              throw new DistributedLockException(ResponseCodeEnum.GET_LOCK_PARAM_ERROR);
  ``` 
  
 ```java 
          }
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
          log.info("[LockUtil] releaseDistributedLock, lockName={}, result={}", lockName, lockResult.toString());
  ``` 
  
 ```java 
          return lockResult.isSuccess();
  ``` 
  
 ```java 
      }
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
      /**
  ``` 
  
 ```java 
       * 锁续约回调通知
  ``` 
  
 ```java 
       *
  ``` 
  
 ```java 
       * @return
  ``` 
  
 ```java 
       */
  ``` 
  
 ```java 
      private RenewListener getRenewListener() {
  ``` 
  
 ```java 
          RenewListener renewListener = new RenewListener() {
  ``` 
  
 ```java 
              @Override
  ``` 
  
 ```java 
              public void onRenewSuccess(String s) {
  ``` 
  
 ```java 
                  log.info("[LockUtil] renewSuccess! info={}", s);
  ``` 
  
 ```java 
              }
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
              @Override
  ``` 
  
 ```java 
              public void onRenewFailed(String s) {
  ``` 
  
 ```java 
                  log.info("[LockUtil] renewFailed! info={}", s);
  ``` 
  
 ```java 
              }
  ``` 
  
 ```java 
          };
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
          return renewListener;
  ``` 
  
 ```java 
      }
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
      /**
  ``` 
  
 ```java 
       * 锁过期回调通知
  ``` 
  
 ```java 
       *
  ``` 
  
 ```java 
       * @return
  ``` 
  
 ```java 
       */
  ``` 
  
 ```java 
      private LockExpireListener getLockExpireListener() {
  ``` 
  
 ```java 
          LockExpireListener lockExpireListener = new LockExpireListener() {
  ``` 
  
 ```java 
              @Override
  ``` 
  
 ```java 
              public void onExpire(String s) {
  ``` 
  
 ```java 
                  log.info("[LockUtil] lock Expired! info={}", s);
  ``` 
  
 ```java 
              }
  ``` 
  
 ```java 
          };
  ``` 
  
 ```java 
  
  ``` 
  
 ```java 
          return lockExpireListener;
  ``` 
  
 ```java 
      }
  ``` 
  
 ```java 
  }
  ``` 
  
  
 
本文分享自微信公众号 - 58技术（architects_58）。如有侵权，请联系 support@oschina.cn 删除。本文参与“OSC源创计划”，欢迎正在阅读的你也加入，一起分享。
                                        