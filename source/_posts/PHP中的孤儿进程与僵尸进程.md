---
title: 推荐系列-PHP中的孤儿进程与僵尸进程
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 2104
cover_picture: 'https://api.ixiaowai.cn/gqapi/gqapi.php'
abbrlink: 7745f79d
date: 2021-04-15 09:46:45
---

&emsp;&emsp;基本概念 我们知道在unix/linux中，正常情况下，子进程是通过父进程创建的，子进程在创建新的进程。子进程的结束和父进程的运行是一个异步过程,即父进程永远无法预测子进程 到底什么时候结束...
<!-- more -->

                                                                                                                                                                                        基本概念 
我们知道在unix/linux中，正常情况下，子进程是通过父进程创建的，子进程在创建新的进程。子进程的结束和父进程的运行是一个异步过程,即父进程永远无法预测子进程 到底什么时候结束。当一个 进程完成它的工作终止之后，它的父进程需要调用wait()或者waitpid()系统调用取得子进程的终止状态。 
  
孤儿进程 
一个父进程退出，而它的一个或多个子进程还在运行，那么那些子进程将成为孤儿进程。孤儿进程将被init进程(进程号为1)所收养，并由init进程对它们完成状态收集工作。 
  
僵尸进程 
一个进程使用fork创建子进程，如果子进程退出，而父进程并没有调用wait或waitpid获取子进程的状态信息，那么子进程的进程描述符仍然保存在系统中。这种进程称之为僵死进程。 
  
问题及危害 
unix提供了一种机制可以保证只要父进程想知道子进程结束时的状态信息， 就可以得到。这种机制就是: 在每个进程退出的时候,内核释放该进程所有的资源,包括打开的文件,占用的内存等。但是仍然为其保留一定的信息(包括进程号the process ID,退出状态the termination status of the process,运行时间the amount of CPU time taken by the process等)。直到父进程通过wait / waitpid来取时才释放。 
但这样就导致了问题，如果进程不调用wait / waitpid的话， 那么保留的那段信息就不会释放，其进程号就会一直被占用，但是系统所能使用的进程号是有限的，如果大量的产生僵死进程，将因为没有可用的进程号而导致系统不能产生新的进程. 此即为僵尸进程的危害，应当避免。 
孤儿进程是没有父进程的进程，孤儿进程这个重任就落到了init进程身上，init进程就好像是一个民政局，专门负责处理孤儿进程的善后工作。每当出现一个孤儿进程的时候，内核就把孤 儿进程的父进程设置为init，而init进程会循环地wait()它的已经退出的子进程。 
这样，当一个孤儿进程凄凉地结束了其生命周期的时候，init进程就会代表党和政府出面处理它的一切善后工作。因此孤儿进程并不会有什么危害。任何一个子进程(init除外)在exit()之后，并非马上就消失掉，而是留下一个称为僵尸进程(Zombie)的数据结构，等待父进程处理。这是每个 子进程在结束时都要经过的阶段。 
如果子进程在exit()之后，父进程没有来得及处理，这时用ps命令就能看到子进程的状态是“Z”。如果父进程能及时 处理，可能用ps命令就来不及看到子进程的僵尸状态，但这并不等于子进程不经过僵尸状态。如果父进程在子进程结束之前退出，则子进程将由init接管。init将会以父进程的身份对僵尸状态的子进程进行处理。 
  
僵尸进程危害场景 
例如有个进程，它定期的产 生一个子进程，这个子进程需要做的事情很少，做完它该做的事情之后就退出了，因此这个子进程的生命周期很短，但是，父进程只管生成新的子进程，至于子进程 退出之后的事情，则一概不闻不问，这样，系统运行上一段时间之后，系统中就会存在很多的僵死进程，倘若用ps命令查看的话，就会看到很多状态为Z的进程。 
严格地来说，僵死进程并不是问题的根源，罪魁祸首是产生出大量僵死进程的那个父进程。因此，当我们寻求如何消灭系统中大量的僵死进程时，答案就是把产生大 量僵死进程的那个元凶枪毙掉（也就是通过kill发送SIGTERM或者SIGKILL信号啦）。 
枪毙了元凶进程之后，它产生的僵死进程就变成了孤儿进 程，这些孤儿进程会被init进程接管，init进程会wait()这些孤儿进程，释放它们占用的系统进程表中的资源，这样，这些已经僵死的孤儿进程 就能瞑目而去了。 
  
孤儿进程和僵尸进程测试 
1、孤儿进程被init进程收养 
 
  
 ```java 
  $pid = pcntl_fork();

if ($pid > 0) {

  // 显示父进程的进程ID，这个函数可以是getmypid()，也可以用posix_getpid()

  echo "Father PID:" . getmypid() . PHP_EOL;

  // 让父进程停止两秒钟，在这两秒内，子进程的父进程ID还是这个父进程

  sleep(2);

} else if (0 == $pid) {

  // 让子进程循环10次，每次睡眠1s，然后每秒钟获取一次子进程的父进程进程ID

  for ($i = 1; $i <= 10; $i++) {

    sleep(1);

    // posix_getppid()函数的作用就是获取当前进程的父进程进程ID

    echo posix_getppid() . PHP_EOL;

  }

} else {

  echo "fork error." . PHP_EOL;

}
  ``` 
  
 
测试结果： 
 
  
 ```java 
  php daemo001.php

Father PID:18046

18046

18046

www@iZ2zec3dge6rwz2uw4tveuZ:~/test$ 1

1

1

1

1

1

1

1
  ``` 
  
 
  
2、僵尸进程和危害　 
执行���下代码 php zombie1.php 
 
  
 ```java 
  $pid = pcntl_fork();

if( $pid > 0 ){

  // 下面这个函数可以更改php进程的名称

  cli_set_process_title('php father process');

  // 让主进程休息60秒钟

  sleep(60);

} else if( 0 == $pid ) {

  cli_set_process_title('php child process');

  // 让子进程休息10秒钟，但是进程结束后，父进程不对子进程做任何处理工作，这样这个子进程就会变成僵尸进程

  sleep(10);

} else {

  exit('fork error.'.PHP_EOL);

}
  ``` 
  
 
  
执行结果，另外一个终端窗口 
 
  
 ```java 
  www@iZ2zec3dge6rwz2uw4tveuZ:~$ ps -aux|grep -v "grep\|nginx\|php-fpm" | grep php

www   18458 0.5 1.2 204068 25920 pts/1  S+  16:34  0:00 php father process

www   18459 0.0 0.3 204068 6656 pts/1  S+  16:34  0:00 php child process

www@iZ2zec3dge6rwz2uw4tveuZ:~$ ps -aux|grep -v "grep\|nginx\|php-fpm" | grep php

www   18458 0.0 1.2 204068 25920 pts/1  S+  16:34  0:00 php father process

www   18459 0.0 0.0   0   0 pts/1  Z+  16:34  0:00 [php] <defunct>
  ``` 
  
 
通过执行 ps -aux 命令可以看到，当程序在前十秒内运行的时候，php child process 的状态列为 [S+]，然而在十秒钟过后，这个状态变成了 [Z+]，也就是变成了危害系统的僵尸进程。 
那么，问题来了？如何避免僵尸进程呢？ 
PHP通过 pcntl_wait() 和 pcntl_waitpid() 两个函数来帮我们解决这个问题。了解Linux系统编程的应该知道，看名字就知道这其实就是PHP把C语言中的 wait() 和 waitpid() 包装了一下。 
通过代码演示 pcntl_wait() 来避免僵尸进程。 
  
pcntl_wait() 函数： 
这个函数的作用就是 “ 等待或者返回子进程的状态 ”，当父进程执行了该函数后，就会阻塞挂起等待子进程的状态一直等到子进程已经由于某种原因退出或者终止。 
换句话说就是如果子进程还没结束，那么父进程就会一直等等等，如果子进程已经结束，那么父进程就会立刻得到子进程状态。���个函数返回退出的子进程的进程 ID 或者失败返回 -1。 
执行以下代码 zombie2.php 
 
  
 ```java 
  $pid = pcntl_fork();

if ($pid > 0) {

  // 下面这个函数可以更改php进程的名称

  cli_set_process_title('php father process');

  // 返回$wait_result，就是子进程的进程号，如果子进程已经是僵尸进程则为0

  // 子进程状态则保存在了$status参数中，可以通过pcntl_wexitstatus()等一系列函数来查看$status的状态信息是什么

  $wait_result = pcntl_wait($status);

  print_r($wait_result);

  print_r($status);

  // 让主进程休息60秒钟

  sleep(60);

} else if (0 == $pid) {

  cli_set_process_title('php child process');

  // 让子进程休息10秒钟，但是进程结束后，父进程不对子进程做任何处理工作，这样这个子进程就会变成僵尸进程

  sleep(10);

} else {

  exit('fork error.' . PHP_EOL);

}
  ``` 
  
 
  
在另外一个终端中通过ps -aux查看，可以看到在前十秒内，php child process 是 [S+] 状态，然后十秒钟过后进程消失了，也就是被父进程回收了，没有变成僵尸进程。 
 
  
 ```java 
  www@iZ2zec3dge6rwz2uw4tveuZ:~/test$ ps -aux|grep -v "grep\|nginx\|php-fpm" | grep php

www@iZ2zec3dge6rwz2uw4tveuZ:~/test$ ps -aux|grep -v "grep\|nginx\|php-fpm" | grep php

www   18519 0.5 1.2 204068 25576 pts/1  S+  16:42  0:00 php father process

www   18520 0.0 0.3 204068 6652 pts/1  S+  16:42  0:00 php child process

www@iZ2zec3dge6rwz2uw4tveuZ:~/test$ ps -aux|grep -v "grep\|nginx\|php-fpm" | grep php

www   18519 0.0 1.2 204068 25576 pts/1  S+  16:42  0:00 php father process
  ``` 
  
 
但是，pcntl_wait() 有个很大的问题，就是阻塞。父进程只能挂起等待子进程结束或终止，在此期间父进程什么都不能做，这并不符合多快好省原则，所以 pcntl_waitpid() 闪亮登场。pcntl_waitpid( pid, &status, $option = 0 )的第三个参数如果设置为WNOHANG，那么父进程不会阻塞一直等待到有子进程退出或终止，否则将会和pcntl_wait()的表现类似。 
修改第三个案例的代码，但是，我们并不添加WNOHANG，演示说明pcntl_waitpid()功能： 
 
  
 ```java 
  $pid = pcntl_fork();

if ($pid > 0) {

  // 下面这个函数可以更改php进程的名称

  cli_set_process_title('php father process');

  // 返回值保存在$wait_result中

  // $pid参数表示 子进程的进程ID

  // 子进程状态则保存在了参数$status中

  // 将第三个option参数设置为常量WNOHANG，则可以避免主进程阻塞挂起，此处父进程将立即返回继续往下执行剩下的代码

  $wait_result = pcntl_waitpid($pid, $status);

  var_dump($wait_result);

  var_dump($status);

  // 让主进程休息60秒钟

  sleep(60);

} else if (0 == $pid) {

  cli_set_process_title('php child process');

  // 让子进程休息10秒钟，但是进程结束后，父进程不对子进程做任何处理工作，这样这个子进程就会变成僵尸进程

  sleep(10);

} else {

  exit('fork error.' . PHP_EOL);

}
  ``` 
  
 
  
下面是运行结果，一个执行php zombie3.php 程序的终端窗口 
 
  
 ```java 
  www@iZ2zec3dge6rwz2uw4tveuZ:~/test$ php zombie3.php

int(18586)

int(0)

^C　　
  ``` 
  
 
ctrl-c 发送 SIGINT 信号给前台进程组中的所有进程。常用于终止正在运行的程序。 
下面是ps -aux���端窗口 
 
  
 ```java 
  www@iZ2zec3dge6rwz2uw4tveuZ:~$ ps -aux|grep -v "grep\|nginx\|php-fpm" | grep php

www   18605 0.3 1.2 204068 25756 pts/1  S+  16:52  0:00 php father process

www   18606 0.0 0.3 204068 6636 pts/1  S+  16:52  0:00 php child process

www@iZ2zec3dge6rwz2uw4tveuZ:~$ ps -aux|grep -v "grep\|nginx\|php-fpm" | grep php

www   18605 0.1 1.2 204068 25756 pts/1  S+  16:52  0:00 php father process

www@iZ2zec3dge6rwz2uw4tveuZ:~$ ps -aux|grep -v "grep\|nginx\|php-fpm" | grep php

www   18605 0.0 1.2 204068 25756 pts/1  S+  16:52  0:00 php father process

www@iZ2zec3dge6rwz2uw4tveuZ:~$ ps -aux|grep -v "grep\|nginx\|php-fpm" | grep php // ctrl-c 后不再被阻塞

www@iZ2zec3dge6rwz2uw4tveuZ:~$
  ``` 
  
 
  
实际上可以看到主进程是被阻塞的，一直到第十秒子进程退出了，父进程不再阻塞　　 
修改第四段代码，添加第三个参数WNOHANG，代码如下： 
 
  
 ```java 
  $pid = pcntl_fork();

if ($pid > 0) {

  // 下面这个函数可以更改php进程的名称

  cli_set_process_title('php father process');

  // 返回值保存在$wait_result中

  // $pid参数表示 子进程的进程ID

  // 子进程状态则保存在了参数$status中

  // 将第三个option参数设置为常量WNOHANG，则可以避免主进程阻塞挂起，此处父进程将立即返回继续往下执行剩下的代码

  $wait_result = pcntl_waitpid($pid, $status, WNOHANG);

  var_dump($wait_result);

  var_dump($status);

  echo "不阻塞，运行到这里" . PHP_EOL;

  // 让主进程休息60秒钟

  sleep(60);

} else if (0 == $pid) {

  cli_set_process_title('php child process');

  // 让子进程休息10秒钟，但是进程结束后，父进程不对子进程做任何处理工作，这样这个子进程就会变成僵尸进程

  sleep(10);

} else {

  exit('fork error.' . PHP_EOL);

}
  ``` 
  
 
  
执行 php zombie4.php 
 
  
 ```java 
  www@iZ2zec3dge6rwz2uw4tveuZ:~/test$ php zombie4.php

int(0)

int(0)

不阻塞，运行到这里　
  ``` 
  
 
  
另一个ps -aux终端窗口 
 
  
 ```java 
  www@iZ2zec3dge6rwz2uw4tveuZ:~$ ps -aux|grep -v "grep\|nginx\|php-fpm" | grep php

www   18672 0.3 1.2 204068 26284 pts/1  S+  17:00  0:00 php father process

www   18673 0.0 0.3 204068 6656 pts/1  S+  17:00  0:00 php child process

www@iZ2zec3dge6rwz2uw4tveuZ:~$ ps -aux|grep -v "grep\|nginx\|php-fpm" | grep php

www   18672 0.0 1.2 204068 26284 pts/1  S+  17:00  0:00 php father process

www   18673 0.0 0.0   0   0 pts/1  Z+  17:00  0:00 [php] <defunct>
  ``` 
  
 
实际上可以看到主进程是被阻塞的，一直到第十秒子进程退出了，父进程不再阻塞。　　 
问题出现了，竟然php child process进程状态竟然变成了[Z+]，这是怎么搞得？回头分析一下代码： 我们看到子进程是睡眠了十秒钟，而父进程在执行pcntl_waitpid()之前没有任何睡眠且本身不再阻塞，所以，主进程自己先执行下去了，而子进程在足足十秒钟后才结束，进程状态自然无法得到回收。 
如果我们将代码修改一下，就是在主进程的pcntl_waitpid()前睡眠15秒钟，这样就可以回收子进程了。但是即便这样修改，细心想的话还是会有个问题，那就是在子进程结束后，在父进程执行pcntl_waitpid()回收前，有五秒钟的时间差，在这个时间差内，php child process也将会是僵尸进程。 
以上内容希望帮助到大家，更多PHP大厂PDF面试文档，PHP进阶架构视频资料，PHP精彩好文免费获取可以微信搜索��注公众号：PHP开源社区，或者访问： 
2021金三银四大厂面试真题集锦，必看！ 
四年精华PHP技术文章整理合集——PHP框架篇 
四年精华PHP技术文合集——微服务架构篇 
四年精华PHP技术文合集——分布���架构篇 
四年精华PHP技术文合集——高并发场景篇 
四年精华PHP技术文章整理合集——数据库篇
                                        