---
title: 推荐系列-鸿蒙内核源码分析(进程回收篇) - 进程在临终前如何向老祖宗托孤 - 百篇博客分析HarmonyOS源码 - v47.02
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 632
cover_picture: 'https://gitee.com/weharmony/docs/raw/master/pic/other/kernel_liteos_a_note.png'
abbrlink: a7a3dc7a
date: 2021-04-15 09:10:30
---

&emsp;&emsp;百万汉字注解 >> 精读鸿蒙源码,中文注解分析, 深挖地基工程,大脑永久记忆,四大码仓每日同步更新< gitee | github | csdn | coding > 百篇博客分析 >> 故事说内核,问答式导读,生活式比喻,表格...
<!-- more -->

                                                                                                                                                                                        百万汉字注解 >> 精读鸿蒙源码,中文注解分析, 深挖地基工程,大脑永久记忆,四大码仓每日同步更新< gitee | github | csdn | coding > 
百篇博客分析 >> 故事说内核,问答式导读,生活式比喻,表格化说明,图形化展示,主流站点定期更新中< oschina  | 51cto | csdn | harmony > 
 
##### 进程关系链 
进程是家族式管理的,父子关系,兄弟关系,朋友关系,子女关系,甚至陌生人关系(等待你消亡)在一个进程的生命周期中都会记录下来.用什么来记录呢?当然是内核最重要的胶水结构体 ```java 
  LOS_DL_LIST
  ``` ,进程控制块(以下简称 ```java 
  PCB
  ``` )用了8个双向链表来记录进程家族的基因关系和运行时关系.如下: 
 ```java 
  typedef struct ProcessCB {
    //...此处省略其他变量
    LOS_DL_LIST          pendList;                     /**< Block list to which the process belongs */ //进程所属的阻塞列表,如果因拿锁失败,就由此节点挂到等锁链表上
    LOS_DL_LIST          childrenList;                 /**< my children process list */	//孩子进程都挂到这里,形成双循环链表
    LOS_DL_LIST          exitChildList;                /**< my exit children process list */	//那些要退出孩子进程挂到这里，白发人送黑发人。
    LOS_DL_LIST          siblingList;                  /**< linkage in my parent's children list */ //兄弟进程链表, 56个民族是一家,来自同一个父进程.
    LOS_DL_LIST          subordinateGroupList;         /**< linkage in my group list */ //进程是组长时,有哪些组员进程
    LOS_DL_LIST          threadSiblingList;            /**< List of threads under this process *///进程的线程(任务)列表
    LOS_DL_LIST          threadPriQueueList[OS_PRIORITY_QUEUE_NUM]; /**< The process's thread group schedules thepriority hash table */	//进程的线程组调度优先级哈希表
    LOS_DL_LIST          waitList;     /**< The process holds the waitLits to support wait/waitpid *///进程持有等待链表以支持wait/waitpid
} LosProcessCB;

  ```  
解读 
 
  ```java 
  pendList
  ```  个人认为它是鸿蒙内核功能最多的一个链表,它远不止字面意思阻塞链表这么简单,只有深入解读源码后才能体会它真的是太会来事了,一般把它理解为阻塞链表就行.上面挂的是处于阻塞状态的进程. 
  ```java 
  childrenList
  ``` 孩子链表,所有由它fork出来的进程都挂到这个链表上.上面的孩子进程在死亡前会将自己从上面摘出去,转而挂到 ```java 
  exitChildList
  ``` 链表上. 
  ```java 
  exitChildList
  ``` 退出孩子链表,进入死亡程序的进程要挂到这个链表上,一个进程的死亡是件挺麻烦的事,进程池的数量有限,需要及时回收进程资源,但家族管理关系复杂,要去很多地方消除痕迹.尤其还有其他进程在看你笑话,等你死亡( ```java 
  wait
  ``` / ```java 
  waitpid
  ``` )了通知它们一声. 
  ```java 
  siblingList
  ``` 兄弟链表,和你同一个父亲的进程都挂到了这个链表上. 
  ```java 
  subordinateGroupList
  ```  朋友圈链表,里面是因为兴趣爱好(进程组)而挂在一起的进程,它们可以不是一个父亲,不是一个祖父,但一定是同一个老祖宗(用户态和内核态根进程). 
  ```java 
  threadSiblingList
  ``` 线程链表,上面挂的是进程ID都是这个进程的线程(任务),进程和线程的关系是1:N的关系,一个线程只能属于一个进程.这里要注意任务在其生命周期中是不能改所属进程的. 
  ```java 
  threadPriQueueList
  ``` 线程的调度队列数组,一共32个,任务和进程一样有32个优先级,调度算法的过程是先找到优先级最高的进程,在从该进程的任务队列里去最高的优先级任务运行. 
  ```java 
  waitList
  ```  是等待子进程消亡的任务链表,注意上面挂的是任务.任务是通过系统调用  ```java 
    pid_t wait(int *status);
  pid_t waitpid(pid_t pid, int *status, int options);

  ```  将任务挂到 ```java 
  waitList
  ``` 上.鸿蒙waitpid系统调用为 ```java 
  SysWait
  ``` ,稍后会讲. 
 
##### 进程正常死亡过程 
一个进程的自然消亡过程如下 
 ```java 
  //一个进程的自然消亡过程,参数是当前运行的任务
STATIC VOID OsProcessNaturalExit(LosTaskCB *runTask, UINT32 status)
{
    LosProcessCB *processCB = OS_PCB_FROM_PID(runTask->processID);//通过task找到所属PCB
    LosProcessCB *parentCB = NULL;

    LOS_ASSERT(!(processCB->threadScheduleMap != 0));//断言没有任务需要调度了,当前task是最后一个了
    LOS_ASSERT(processCB->processStatus & OS_PROCESS_STATUS_RUNNING);//断言必须为正在运行的进程

    OsChildProcessResourcesFree(processCB);//释放孩子进程的资源

#ifdef LOSCFG_KERNEL_CPUP 
    OsCpupClean(processCB->processID);
#endif

    /* is a child process */
    if (processCB->parentProcessID != OS_INVALID_VALUE) {//判断是否有父进程
        parentCB = OS_PCB_FROM_PID(processCB->parentProcessID);//获取父进程实体
        LOS_ListDelete(&processCB->siblingList);//将自己从兄弟链表中摘除,家人们,永别了!
        if (!OsProcessExitCodeSignalIsSet(processCB)) {//是否设置了退出码?
            OsProcessExitCodeSet(processCB, status);//将进程状态设为退出码
        }
        LOS_ListTailInsert(&parentCB->exitChildList, &processCB->siblingList);//挂到父进程的孩子消亡链表,家人中,永别的可不止我一个.
        LOS_ListDelete(&processCB->subordinateGroupList);//和志同道合的朋友们永别了,注意家里可不一定是朋友的,所有各有链表.
        LOS_ListTailInsert(&processCB->group->exitProcessList, &processCB->subordinateGroupList);//挂到进程组消亡链表,朋友中,永别的可不止我一个.

        OsWaitCheckAndWakeParentProcess(parentCB, processCB);//检查父进程的等待任务并唤醒任务,此处将会切换到其他任务运行.

        OsDealAliveChildProcess(processCB);//老父亲临终向各自的祖宗托孤

        processCB->processStatus |= OS_PROCESS_STATUS_ZOMBIES;//贴上僵死进程的标签

        (VOID)OsKill(processCB->parentProcessID, SIGCHLD, OS_KERNEL_KILL_PERMISSION);//以内核权限发送SIGCHLD(子进程退出)信号.
        LOS_ListHeadInsert(&g_processRecyleList, &processCB->pendList);//将进程通过其阻塞节点挂入全局进程回收链表
        OsRunTaskToDelete(runTask);//删除正在运行的任务
        return;
    }

    LOS_Panic("pid : %u is the root process exit!\n", processCB->processID);
    return;
}

  ```  
解读 
 
 退群,向兄弟姐妹 ```java 
  siblingList
  ``` 告别,向朋友圈(进程组)告别 ```java 
  subordinateGroupList
  ``` . 
 留下你的死亡记录,老父亲记录到 ```java 
  exitChildList
  ``` ,朋友圈记录到 ```java 
  exitProcessList
  ``` 中. 
 告诉后人死亡原因 ```java 
  OsProcessExitCodeSet
  ``` ,因为 ```java 
  waitList
  ``` 上挂的任务在等待你的死亡信息. 
 向老祖宗托孤,用户态和内核态进程都有自己的祖宗进程(1和2号进程),老祖宗身子硬朗,最后死.所有的短命鬼进程都可以把自己的孩子委托给老祖宗照顾,老祖宗会一视同仁. 
 将自己变成了 ```java 
  OS_PROCESS_STATUS_ZOMBIES
  ``` 僵尸进程. 
 老父亲跑到村口广播这个孩子已经死亡的信号 ```java 
  OsKill
  ``` . 
 将自己挂入进程回收链表,等待回收任务 ```java 
  ResourcesTask
  ``` 回收资源. 
 最后删除这个正在运行的任务,很明显其中一定会发生一次调度 ```java 
  OsSchedResched
  ``` .  ```java 
    //删除一个正在运行的任务
  LITE_OS_SEC_TEXT VOID OsRunTaskToDelete(LosTaskCB *taskCB)
  {
      LosProcessCB *processCB = OS_PCB_FROM_PID(taskCB->processID);//拿到task所属进程
      OsTaskReleaseHoldLock(processCB, taskCB);//task还锁
      OsTaskStatusUnusedSet(taskCB);//task重置为未使用状态，等待回收

      LOS_ListDelete(&taskCB->threadList);//从进程的线程链表中将自己摘除
      processCB->threadNumber--;//进程的活动task --，注意进程还有一个记录总task的变量 processCB->threadCount
      LOS_ListTailInsert(&g_taskRecyleList, &taskCB->pendList);//将task插入回收链表，等待回收资源再利用
      OsEventWriteUnsafe(&g_resourceEvent, OS_RESOURCE_EVENT_FREE, FALSE, NULL);//发送释放资源的事件,事件由 OsResourceRecoveryTask 消费

      OsSchedResched();//申请调度
      return;
  }

  ```   
 但这是一个自然死亡的进程,还有很多非正常死亡在其他篇幅中已有说明.请自行翻看.非正常死亡的会产生僵尸进程.这种进程需要别的进程通过  ```java 
  waitpid
  ``` 来回收. 
 
##### 孤儿进程 
一般情况下往往是白发人送黑发人,子进程的生命周期是要短于父进程.但因为fork之后,进程之间相互独立,调度算法一视同仁,父子之间是弱的关系力,就什么情况都可能发生了.内核是允许老父亲先走的,如果父进程退出而它的一个或多个子进程还在运行，那么这些子进程就被称为孤儿进程,孤儿进程最终将被两位老祖宗(用户态和内核态)所收养,并由老祖宗完成对它们的状态收集工作。 
 ```java 
  //当一个进程自然退出的时候,它的孩子进程由两位老祖宗收养
STATIC VOID OsDealAliveChildProcess(LosProcessCB *processCB)
{
    UINT32 parentID;
    LosProcessCB *childCB = NULL;
    LosProcessCB *parentCB = NULL;
    LOS_DL_LIST *nextList = NULL;
    LOS_DL_LIST *childHead = NULL;

    if (!LOS_ListEmpty(&processCB->childrenList)) {//如果存在孩子进程
        childHead = processCB->childrenList.pstNext;//获取孩子链表
        LOS_ListDelete(&(processCB->childrenList));//清空自己的孩子链表
        if (OsProcessIsUserMode(processCB)) {//是用户态进程
            parentID = g_userInitProcess;//用户态进程老祖宗
        } else {
            parentID = g_kernelInitProcess;//内核态进程老祖宗
        }

        for (nextList = childHead; ;) {//遍历孩子链表
            childCB = OS_PCB_FROM_SIBLIST(nextList);//找到孩子的真身
            childCB->parentProcessID = parentID;//孩��磕��认老祖宗为爸爸
            nextList = nextList->pstNext;//找下一个孩子进程
            if (nextList == childHead) {//一圈下来,孩子们都磕完头了
                break;
            }
        }

        parentCB = OS_PCB_FROM_PID(parentID);//找个老祖宗的真身
        LOS_ListTailInsertList(&parentCB->childrenList, childHead);//挂到老祖宗的孩子链表上
    }

    return;
}

  ```  
解读 
 
 函数很简单,都一一注释了,老父亲临终托付后事,请各自的老祖宗照顾孩子. 
 从这里也可以看出进程的家族管理模式,两个家族从进程的出生到死亡负责到底. 
 
##### 僵尸进程 
一个进程在终止时会关闭所有文件描述符，释放在用户空间分配的内存，但它的 ```java 
  PCB
  ``` 还保留着，内核在其中保存了一些信息：如果是正常终止则保存着退出状态，如果是异常终止则保存着导致该进程终止的信号是哪个。这个进程的父进程可以调用wait或waitpid获取这些信息，然后彻底清除掉这个进程。 
如果一个进程已经终止，但是它的父进程尚未调用wait或waitpid对它进行清理，这时的进程状态称为僵尸（Zombie）进程,即 Z 进程.任何进程在刚终止时都是僵尸进程，正常情况下，僵尸进程都立刻被父进程清理了. 不正常情况下就需要手动 ```java 
  waitpid
  ``` 清理了. 
##### waitpid 
在鸿蒙系统中，一个进程结束了，但是它的父进程没有等待（调用 ```java 
  wait
  ```   ```java 
  waitpid
  ``` ）它，那么它将变成一个僵尸进程。通过系统调用  ```java 
  waitpid
  ``` 可以彻底的清理掉子进程.归还 ```java 
  pcb
  ``` .最终调用到 ```java 
  SysWait
  ```  
 ```java 
  #include <sys/wait.h>
#include "syscall.h"

pid_t waitpid(pid_t pid, int *status, int options)
{
	return syscall_cp(SYS_wait4, pid, status, options, 0);
}

  ```  
 ```java 
  //等待子进程结束
int SysWait(int pid, USER int *status, int options, void *rusage)
{
    (void)rusage;

    return LOS_Wait(pid, status, (unsigned int)options, NULL);
}
//返回已经终止的子进程的进程ID号，并清除僵死进程。
LITE_OS_SEC_TEXT INT32 LOS_Wait(INT32 pid, USER INT32 *status, UINT32 options, VOID *rusage)
{
    (VOID)rusage;
    UINT32 ret;
    UINT32 intSave;
    LosProcessCB *childCB = NULL;
    LosProcessCB *processCB = NULL;
    LosTaskCB *runTask = NULL;

    ret = OsWaitOptionsCheck(options);//参数检查,只支持LOS_WAIT_WNOHANG
    if (ret != LOS_OK) {
        return -ret;
    }

    SCHEDULER_LOCK(intSave);
    processCB = OsCurrProcessGet();	//获取当前进程
    runTask = OsCurrTaskGet();		//获取当前任务

    ret = OsWaitChildProcessCheck(processCB, pid, &childCB);//先检查下看能不能找到参数要求的退出子进程
    if (ret != LOS_OK) {
        pid = -ret;
        goto ERROR;
    }

    if (childCB != NULL) {//找到了进程
        return OsWaitRecycleChildPorcess(childCB, intSave, status);//回收进程
    }
	//没有找到,看是否要返回还是去做个登记
    if ((options & LOS_WAIT_WNOHANG) != 0) {//有LOS_WAIT_WNOHANG标签
        runTask->waitFlag = 0;//等待标识置0
        pid = 0;//这里置0,是为了 return 0
        goto ERROR;
    }
	//等待孩子进程退出
    OsWaitInsertWaitListInOrder(runTask, processCB);//将当前任务挂入进程waitList链表
	//发起调度的目的是为了让出CPU,让其他进程/任务运行
    OsSchedResched();//发起调度
	
    runTask->waitFlag = 0;
    if (runTask->waitID == OS_INVALID_VALUE) {
        pid = -LOS_ECHILD;//没有此子进程
        goto ERROR;
    }

    childCB = OS_PCB_FROM_PID(runTask->waitID);//获取当前任务的等待子进程ID
    if (!(childCB->processStatus & OS_PROCESS_STATUS_ZOMBIES)) {//子进程非僵死进程
        pid = -LOS_ESRCH;//没有此进程
        goto ERROR;
    }
	//回收僵死进��
    return OsWaitRecycleChildPorcess(childCB, intSave, status);

ERROR:
    SCHEDULER_UNLOCK(intSave);
    return pid;
}

  ```  
解读 
 
   ```java 
  pid
  ``` 是数据参数,根据不同的参数代表不同的含义,含义如下: 
   
    
     
     参数值 
     说明 
     
    
    
     
     pid<-1 
     等待进程组号为pid绝对值的任何子进程。 
     
     
     pid=-1 
     等待任何子进程，此时的waitpid()函数就退化成了普通的wait()函数。 
     
     
     pid=0 
     等待进程组号与目前进程相同的任何子进程，也就是说任何和调用waitpid()函数的进程在同一个进程组的进程。 
     
     
     pid>0 
     等待进程号为pid的子进程。 
     
    
    ```java 
  pid
  ``` 不同值代表的真正含义可以看这个函数 ```java 
  OsWaitSetFlag
  ``` .  ```java 
  //设置等待子进程退出方式方法
    STATIC UINT32 OsWaitSetFlag(const LosProcessCB *processCB, INT32 pid, LosProcessCB **child)
    {
        LosProcessCB *childCB = NULL;
        ProcessGroup *group = NULL;
        LosTaskCB *runTask = OsCurrTaskGet();
        UINT32 ret;

        if (pid > 0) {//等待进程号为pid的子进程结束
            /* Wait for the child process whose process number is pid. */
            childCB = OsFindExitChildProcess(processCB, pid);//看能否从退出的孩子链表中找到PID
            if (childCB != NULL) {//找到了,确实有一个已经退出的PID,注意一个进程退出时会挂到父进程的exitChildList上
                goto WAIT_BACK;//直接成功返回
            }

            ret = OsFindChildProcess(processCB, pid);//看能否从现有的孩子链表中找到PID
            if (ret != LOS_OK) {
                return LOS_ECHILD;//参数进程并没有这个PID孩子,返回孩子进程失败.
            }
            runTask->waitFlag = OS_PROCESS_WAIT_PRO;//设置当前任务的等待类型
            runTask->waitID = pid;	//当前任务要等待进程ID结束
        } else if (pid == 0) {//等待同一进程组中的任何子进程
            /* Wait for any child process in the same process group */
            childCB = OsFindGroupExitProcess(processCB->group, OS_INVALID_VALUE);//看能否从退出的孩子链表中找到PID
            if (childCB != NULL) {//找到了,确实有一个已经退出的PID
                goto WAIT_BACK;//直接成功返回
            }
            runTask->waitID = processCB->group->groupID;//等待进程组的任意一个子进程结束
            runTask->waitFlag = OS_PROCESS_WAIT_GID;//设置当前任务的等待类型
        } else if (pid == -1) {//等待任意子进程
            /* Wait for any child process */
            childCB = OsFindExitChildProcess(processCB, OS_INVALID_VALUE);//看能否从退出的孩子链表中找到PID
            if (childCB != NULL) {//找到了,确实有一个已经退出的PID
                goto WAIT_BACK;
            }
            runTask->waitID = pid;//等待PID,这个PID可以和当前进程没有任何关系
            runTask->waitFlag = OS_PROCESS_WAIT_ANY;//设置当前任务的等待类型
        } else { /* pid < -1 */ //等待指定进程组内为|pid|的所有子进程
            /* Wait for any child process whose group number is the pid absolute value. */
            group = OsFindProcessGroup(-pid);//先通过PID找到进程组
            if (group == NULL) {
                return LOS_ECHILD;
            }

            childCB = OsFindGroupExitProcess(group, OS_INVALID_VALUE);//在进程组里任意一个已经退出的子进程
            if (childCB != NULL) {
                goto WAIT_BACK;
            }

            runTask->waitID = -pid;//此处用负数是为了和(pid == 0)以示区别,因为二者的waitFlag都一样.
            runTask->waitFlag = OS_PROCESS_WAIT_GID;//设置当前任务的等待类型
        }

    WAIT_BACK:
        *child = childCB;
        return LOS_OK;
    }

  ```   
   ```java 
  status
  ``` 带走进程退出码, ```java 
  exitCode
  ``` 分成了三个部分格式如下  ```java 
    /*
  * Process exit code
  * 31    15           8           7        0
  * |     | exit code  | core dump | signal |
  */
  #define OS_PRO_EXIT_OK 0 //进程正常退出
  //置进程退出码第七位为1
  STATIC INLINE VOID OsProcessExitCodeCoreDumpSet(LosProcessCB *processCB)
  {
      processCB->exitCode |= 0x80U;// 0b10000000 
  }
  //设置进程退出信号(0 ~ 7)
  STATIC INLINE VOID OsProcessExitCodeSignalSet(LosProcessCB *processCB, UINT32 signal)
  {
      processCB->exitCode |= signal & 0x7FU;//0b01111111
  }
  //清除进程退出信号(0 ~ 7)
  STATIC INLINE VOID OsProcessExitCodeSignalClear(LosProcessCB *processCB)
  {
      processCB->exitCode &= (~0x7FU);//低7位全部清0
  }
  //进程退出码是否被设置过,默认是 0 ,如果 & 0x7FU 还是 0 ,说明没有被设置过.
  STATIC INLINE BOOL OsProcessExitCodeSignalIsSet(LosProcessCB *processCB)
  {
      return (processCB->exitCode) & 0x7FU;
  }
  //设置进程退出号(8 ~ 15)
  STATIC INLINE VOID OsProcessExitCodeSet(LosProcessCB *processCB, UINT32 code)
  {
      processCB->exitCode |= ((code & 0x000000FFU) << 8U) & 0x0000FF00U; /* 8: Move 8 bits to the left, exitCode */
  }

  ```   ```java 
  0 - 7
  ``` 为信号位,信号处理有专门的篇幅,此处不做详细介绍,请自行翻看,这里仅列出部分信号含义.  ```java 
    #define SIGHUP    1	//终端挂起或者控制进程终止
  #define SIGINT    2	//键盘中断（如break键被按下）
  #define SIGQUIT   3	//键盘的退出键被按下
  #define SIGILL    4	//非法指令
  #define SIGTRAP   5	//跟踪陷阱（trace trap），启动进程，跟踪代码的执行
  #define SIGABRT   6	//由abort(3)发出的退出指令
  #define SIGIOT    SIGABRT //abort发出的信号
  #define SIGBUS    7	//总线错误 
  #define SIGFPE    8	//浮点异常
  #define SIGKILL   9		//常用的命令 kill 9 123 | 不能被忽略、处理和阻塞
  #define SIGUSR1   10	//用户自定义信号1 
  #define SIGSEGV   11	//无效的内存引用, 段违例（segmentation     violation），进程试图去访问其虚地址空间以外的位置 
  #define SIGUSR2   12	//用户��定义信号2
  #define SIGPIPE   13	//向某个非读管道中写入数据 
  #define SIGALRM   14	//由alarm(2)发出的信号,默认行为为进程终止
  #define SIGTERM   15	//终止信号
  #define SIGSTKFLT 16	//栈溢出
  #define SIGCHLD   17	//子进程结束信号
  #define SIGCONT   18	//进程继续（曾被停止的进程）
  #define SIGSTOP   19	//终止进程  	 | 不能被忽略、处理和阻塞
  #define SIGTSTP   20	//控制终端（tty）上 按下停止键
  #define SIGTTIN   21	//进程停止，后台进程企图从控制终端读
  #define SIGTTOU   22	//进程停止，后台进程企图从控制终端写
  #define SIGURG    23	//I/O有紧急数据到达当前进程
  #define SIGXCPU   24	//进程的CPU时间片到期
  #define SIGXFSZ   25	//文件大小的超出上限
  #define SIGVTALRM 26	//虚拟时钟超时
  #define SIGPROF   27	//profile时钟超时
  #define SIGWINCH  28	//窗口大小改变
  #define SIGIO     29	//I/O相关
  #define SIGPOLL   29	//
  #define SIGPWR    30	//电源故障,关机
  #define SIGSYS    31	//系统调用中参数错，如系统调用号非法 
  #define SIGUNUSED SIGSYS		//系统调用异常

  ```   
   ```java 
  options
  ``` 是行为参数,提供了一些另外的选项来控制waitpid()函数的行为。 
   
    
     
     参数值 
     鸿蒙支持 
     说明 
     
    
    
     
     LOS_WAIT_WNOHANG 
     支持 
     如果没有孩子进程退出，则立即返回,而不是阻塞在这个函数上等待；如果结束了，则返回该子进程的进程号。 
     
     
     LOS_WAIT_WUNTRACED 
     不支持 
     报告终止或停止的子进程的状态 
     
     
     LOS_WAIT_WCONTINUED 
     不支持 
      
     
    
   鸿蒙目前只支持了LOS_WAIT_WNOHANG模式,内核源码中虽有 ```java 
  LOS_WAIT_WUNTRACED
  ``` 和 ```java 
  LOS_WAIT_WCONTINUED
  ``` 的实现痕迹,但是整体阅读下来比较乱,应该是没有写好.  
 
##### 鸿蒙源码百篇博客 往期回顾 
 
  v47.xx (进程回收篇) | 进程在临终前如何向老祖宗托孤  < csdn  | 51cto  | harmony >  
  v46.xx (特殊进程篇) | 龙生龙,凤生凤,老鼠生儿会打洞  < csdn  | 51cto  | harmony >  
  v45.xx (fork篇) | fork是如何做到调用一次,返回两次的 ?  < csdn  | 51cto  | harmony >  
  v44.xx (中断管理篇) | 硬中断的实现<>观察者模式  < csdn  | 51cto  | harmony >  
  v43.xx (中断概念篇) | 外人眼中权势滔天的当红海公公  < csdn  | 51cto  | harmony >  
  v42.xx (中断切换篇) | 中断切换到底在切换什么? < csdn  | 51cto  | harmony >  
  v41.xx (任务切换篇) | 汇编逐行注解分析任务上下文  < csdn  | 51cto  | harmony >  
  v40.xx (汇编汇总篇) | 所有的汇编代码都在这里  < csdn  | 51cto  | harmony >  
  v39.xx (异常接管篇) | 社会很单纯,复杂的是人  < csdn  | 51cto  | harmony >  
  v38.xx (寄存器篇) | ARM所有寄存器一网打尽,不再神秘  < csdn  | 51cto  | harmony >  
  v37.xx (系统调用篇) | 全盘解剖系统调用实现过程  < csdn  | 51cto  | harmony >  
  v36.xx (工作模式篇) | CPU是韦小宝,有哪七个老婆?  < csdn  | 51cto  | harmony >  
  v35.xx (时间管理篇) | Tick是操作系统的基本时间单位  < csdn  | 51cto  | harmony >  
  v34.xx (原子操作篇) | 是谁在为原子操作保驾护航?  < csdn  | 51cto  | harmony >  
  v33.xx (消息队列篇) | 进程间如何异步解耦传递大数据 ?  < csdn  | 51cto  | harmony >  
  v32.xx (CPU篇) | 内核是如何描述CPU的?  < csdn  | 51cto  | harmony >  
  v31.xx (定时器篇) | 内核最高优先级任务是谁?  < csdn  | 51cto  | harmony >  
  v30.xx (事件控制篇) | 任务间多对多的同步方案  < csdn  | 51cto  | harmony >  
  v29.xx (信号量篇) | 信号量解决任务同步问题  < csdn  | 51cto  | harmony >  
  v28.xx (进程通讯篇) | 进程间通讯有哪九大方式?  < csdn  | 51cto  | harmony >  
  v27.xx (互斥锁篇) | 互斥锁比自旋锁可丰满许多  < csdn  | 51cto  | harmony >  
  v26.xx (自旋锁篇) | 真的好想为自旋锁立贞节牌坊!  < csdn  | 51cto  | harmony >  
  v25.xx (并发并行篇) | 怎么记住并发并行的区别?  < csdn  | 51cto  | harmony >  
  v24.xx (进程概念篇) | 进程在管理哪些资源?  < csdn  | 51cto  | harmony >  
  v23.xx (汇编传参篇) | 汇编如何传递复杂的参数?  < csdn  | 51cto  | harmony >  
  v22.xx (汇编基础篇) | CPU在哪里打卡上班?  < csdn  | 51cto  | harmony >  
  v21.xx (线程概念篇) | 是谁在不断的折腾CPU?  < csdn  | 51cto  | harmony >  
  v20.xx (用栈方式篇) | 栈是构建底层运行的基础  < csdn  | 51cto  | harmony >  
  v19.xx (位图管理篇) | 为何进程和线程优先级都是32个?  < csdn  | 51cto  | harmony >  
  v18.xx (源码结构篇) | 内核500问你能答对多少?  < csdn  | 51cto  | harmony >  
  v17.xx (物理内存篇) | 这样记伙伴算法永远不会忘  < csdn  | 51cto  | harmony >  
  v16.xx (内存规则篇) | 内存管理到底在管什么?  < csdn  | 51cto  | harmony >  
  v15.xx (内存映射篇) | 什么是内存最重要的实现基础 ?  < csdn  | 51cto  | harmony >  
  v14.xx (内存汇编篇) | 什么是虚拟内存的实现基础?  < csdn  | 51cto  | harmony >  
  v13.xx (源码注释篇) | 热爱是所有的理由和答案  < csdn  | 51cto  | harmony >  
  v12.xx (内存管理篇) | 虚拟内存全景图是怎样的?  < csdn  | 51cto  | harmony >  
  v11.xx (内存分配篇) | 内存有哪些分配方式?  < csdn  | 51cto  | harmony >  
  v10.xx (内存主奴篇) | 紫禁城的主子和奴才如何相处?  < csdn  | 51cto  | harmony >  
  v09.xx (调度故事篇) | 用故事说内核调度  < csdn  | 51cto  | harmony >  
  v08.xx (总目录) | 百万汉字注解 百篇博客分析  < csdn  | 51cto  | harmony >  
  v07.xx (调度机制篇) | 任务是如何被调度执行的?  < csdn  | 51cto  | harmony >  
  v06.xx (调度队列篇) | 就绪队列对调度的作用  < csdn  | 51cto  | harmony >  
  v05.xx (任务管理篇) | 谁在让CPU忙忙碌碌?  < csdn  | 51cto  | harmony >  
  v04.xx (任务调度篇) | 任务是内核调度的单元  < csdn  | 51cto  | harmony >  
  v03.xx (时钟任务篇) | 触发调度最大的动力来自哪里?  < csdn  | 51cto  | harmony >  
  v02.xx (进程管理篇) | 进程是内核资源管理单元  < csdn  | 51cto  | harmony >  
  v01.xx (双向链表篇) | 谁是内核最重要结构体?  < csdn  | 51cto  | harmony >  
 
##### 参与贡献 
 
  ![Test](https://gitee.com/weharmony/docs/raw/master/pic/other/kernel_liteos_a_note.png 鸿蒙内核源码分析(进程回收篇) - 进程在临终前如何向老祖宗托孤 - 百篇博客分析HarmonyOS源码 - v47.02)  
  Fork 本仓库 >> 新建 Feat_xxx 分支 >> 提交代码注解 >> 新建 Pull Request  
  新建 Issue  
 
##### 喜欢请「点赞+关注+收藏」 
 
  关注「鸿蒙内核源码分析」公众号  
  各大站点搜 「鸿蒙内核源码分析」.欢迎转载,请注明出处.  
  进入 >> oschina | csdn | 51cto | 简书 | 掘金 | harmony   

                                        