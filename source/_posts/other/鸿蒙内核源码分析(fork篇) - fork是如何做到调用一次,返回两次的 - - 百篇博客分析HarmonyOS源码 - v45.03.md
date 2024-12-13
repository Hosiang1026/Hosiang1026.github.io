---
title: '推荐系列-鸿蒙内核源码分析(fork篇) - fork是如何做到调用一次,返回两次的 - - 百篇博客分析HarmonyOS源码 - v45.03'
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 352
cover_picture: 'https://gitee.com/weharmony/docs/raw/master/pic/other/process_fork.png'
abbrlink: d056fdd5
date: 2021-04-15 10:16:56
---

&emsp;&emsp;百万汉字注解 >> 精读内核源码,中文注解分析, 深挖地基工程,大脑永久记忆,四大码仓每日同步更新< gitee | github | csdn | coding > 百篇博客分析 >> 故事说内核,问答式导读,生活式比喻,表格...
<!-- more -->

                                                                                                                                                                                        百万汉字注解 >> 精读内核源码,中文注解分析, 深挖地基工程,大脑永久记忆,四大码仓每日同步更新< gitee | github | csdn | coding > 
百篇博客分析 >> 故事说内核,问答式导读,生活式比喻,表格化说明,图形化展示,主流站点定期更新中< oschina | csdn | harmony > 
 
笔者第一次看到fork时,说是一次调用,两次返回,当时就懵圈了,多新鲜,真的很难理解.因为这足以颠覆了以往对函数的认知, 函数调用还能这么玩,父进程调用一次,父子进程各返回一次.而且只能通过返回值来判断是哪个进程的返回.所以一直有几个问题缠绕在脑海中. 
 
 fork是什么? 外部如何正确使用它. 
 为什么要用fork这种设计? fork的本质和好处是什么? 
 怎么做到的? 调用fork()使得父子进程各返回一次,一个函数不是只能返回一次吗,怎么做到返回两次的,其中到底发生了什么? 
 为什么pid == 0 代表了是子进程的返���? 为什么父进程不需要返回 0 ? 
 
直到看了linux内核源码后才搞明白了这些问题,但系列篇的定位挖透鸿蒙的内核源码,所以本篇将深入fork函数,从鸿蒙角度去说明白这些问题. 在看本篇之前一定要先看系列篇的其他篇幅.如(任务切换篇,寄存器篇,工作模式篇,系统调用篇 等等),有了这些基础,会很好理解fork的实现过程. 
#### fork是什么 
先看一个网上经常拿来说fork的一个代码片段. 
 
 ```java 
  #include <sys/types.h>
#include <unistd.h>
#include <stdio.h>
#include <stdlib.h>

int main(void)
{
	pid_t pid;
	char *message;
	int n;
	pid = fork();
	if (pid < 0) {
		perror("fork failed");
		exit(1);
	}
	if (pid == 0) {
		message = "This is the child\n";
		n = 6;
	} else {
		message = "This is the parent\n";
		n = 3;
	}
	for(; n > 0; n--) {
		printf(message);
		sleep(1);
	}
	return 0;
}

  ``` 
  
 
  
 ```java 
  pid < 0
  ``` 
  fork 失败 
  
 ```java 
  pid == 0
  ``` 
  fork成功,是子进程的返回 
  
 ```java 
  pid > 0
  ``` 
  fork成功,是父进程的返回 
 fork的返回值这样规定是有道理的。fork在子进程中返回0，子进程仍可以调用getpid函数得到自己的进程id，也可以调用getppid函数得到父进程的id。在父进程中用getpid可以得到自己的进程id，然而要想得到子进程的id，只有将fork的返回值记录下来，别无它法。 
 子进程并没有真正执行fork(),而是内核用了一个很巧妙的方法获得了返回值,并且将返回值硬生生的改写成了0,这是笔者认为fork的实现最精彩的部分. 
 
##### 运行结果 
 
 ```java 
  $ ./a.out 
This is the child
This is the parent
This is the child
This is the parent
This is the child
This is the parent
This is the child
$ This is the child
This is the child

  ``` 
  
这个程序的运行过程如下图所示。 ![Test](https://gitee.com/weharmony/docs/raw/master/pic/other/process_fork.png  '鸿蒙内核源码分析(fork篇) - fork是如何做到调用一次,返回两次的 - - 百篇博客分析HarmonyOS源码 - v45.03') 
解读 
 
  fork 是一个系统调用,因此会切换到SVC模式运行.在SVC栈中父进程复制出一个子进程，父进程和子进程的PCB信息相同，用户态代码和数据也相同.  
  从案例的执行上可以看出,fork 之后的代码父子进程都会执行,即代码段指向(PC寄存器)是一样的.实际上fork只被父进程调用了一次,子进程并没有执行 
 ```java 
  fork
  ``` 
 函数,但是却获得了一个返回值, 
 ```java 
  pid == 0
  ``` 
 ,这个非常重要.这是本篇说明的重点.  
  从执行结果上看,父进程打印了三次(This is the parent),因为 n = 3. 子进程打印了六次(This is the child),因为 n = 6. 而子程序并没有执行以下代码:  
 ```java 
      pid_t pid;
    char *message;
    int n;

  ``` 
  子进程是从 
 ```java 
  pid = fork()
  ``` 
  后开始执行的,按理它不会在新任务栈中出现这些变量,而实际上后面又能顺利的使用这些变量,说明父进程当前任务的用户态的数据也复制了一份给子进程的新任务栈中.  
  被fork成功的子进程跑的首条代码指令是  
 ```java 
  pid = 0
  ``` 
 ,这里的0是返回值,存放在 
 ```java 
  R0
  ``` 
 寄存器中.说明父进程的任务上下文也进行了一次拷贝,父进程从内核态回到用户态时恢复的上下文和子进程的任务上下文是一样的,即 PC寄存器指向是一样的,如此才能确保在代码段相同的位置执行.  
  执行 
 ```java 
  ./a.out
  ``` 
 后 第一条打印的是 
 ```java 
  This is the child
  ``` 
 说明  
 ```java 
  fork()
  ``` 
 中发生了一次调度,CPU切到了子进程的任务执行, 
 ```java 
  sleep(1)
  ``` 
 的本质在系列篇中多次说过是任务主动放弃CPU的使用权,将自己挂入任务等待链表,由此发生一次任务调度,CPU切到父进程执行,才有了打印第二条的 
 ```java 
  This is the parent
  ``` 
 ,父进程的 
 ```java 
  sleep(1)
  ``` 
 又切到子进程如此往返,直到 n = 0, 结束父子进程.  
  但这个例子和笔者的解读只解释了fork是什么的使用说明书,并猜测其中做了些什么,并没有说明为什么要这样做和代码是怎么实现的. 正式结合鸿蒙的源码说清楚为什么和怎么做这两个问题?  
 
##### 为什么是fork 
fork函数的特点概括起来就是“调用一次，返回两次”，在父进程中调用一次，在父进程和子进程中各返回一次。从上图可以看出，一开始是一个控制流程，调用fork之后发生了分叉，变成两个控制流程，这也就是“fork”（分叉）这个名字的由来了。 系列篇已经写了40+多篇,已经很容易理解一个程序运行起来就需要各种资源(内存,文件,ipc,监控信息等等),资源就需要管理,进程就是管理资源的容器.这些资源相当于干活需要各种工具一样,干活的工具都差不多,实在没必再走流程一一申请,而且申请下来会发现和别人手里已有的工具都一样, 别人有直接拿过来使用它不香吗? 所以最简单的办法就是认个干爹,让干爹拷贝一份干活工具给你.这样只需要专心的干好活(任务)就行了. fork的本质就是copy,具体看代码. 
##### fork怎么实现的? 
 
 ```java 
  //系统调用之fork ,建议去 https://gitee.com/weharmony/kernel_liteos_a_note fork 一下? :P 
int SysFork(void)
{
    return OsClone(CLONE_SIGHAND, 0, 0);//本质就是克隆
}
LITE_OS_SEC_TEXT INT32 OsClone(UINT32 flags, UINTPTR sp, UINT32 size)
{
    UINT32 cloneFlag = CLONE_PARENT | CLONE_THREAD | CLONE_VFORK | CLONE_VM;

    if (flags & (~cloneFlag)) {
        PRINT_WARN("Clone dont support some flags!\n");
    }

    return OsCopyProcess(cloneFlag & flags, NULL, sp, size);
}
STATIC INT32 OsCopyProcess(UINT32 flags, const CHAR *name, UINTPTR sp, UINT32 size)
{
    UINT32 intSave, ret, processID;
    LosProcessCB *run = OsCurrProcessGet();//获取当前进程

    LosProcessCB *child = OsGetFreePCB();//从进程池中申请一个进程控制块，鸿蒙进程池默认64
    if (child == NULL) {
        return -LOS_EAGAIN;
    }
    processID = child->processID;

    ret = OsForkInitPCB(flags, child, name, sp, size);//初始化进程控制块
    if (ret != LOS_OK) {
        goto ERROR_INIT;
    }

    ret = OsCopyProcessResources(flags, child, run);//拷贝进程的资源,包括虚拟空间,文件,安全,IPC ==
    if (ret != LOS_OK) {
        goto ERROR_TASK;
    }

    ret = OsChildSetProcessGroupAndSched(child, run);//设置进程组和加入进程调度就绪队列
    if (ret != LOS_OK) {
        goto ERROR_TASK;
    }

    LOS_MpSchedule(OS_MP_CPU_ALL);//给各CPU发送准备接受调度信号
    if (OS_SCHEDULER_ACTIVE) {//当前CPU core处于活动状态
        LOS_Schedule();// 申请调度
    }

    return processID;

ERROR_TASK:
    SCHEDULER_LOCK(intSave);
    (VOID)OsTaskDeleteUnsafe(OS_TCB_FROM_TID(child->threadGroupID), OS_PRO_EXIT_OK, intSave);
ERROR_INIT:
    OsDeInitPCB(child);
    return -ret;
}
### OsForkInitPCB
STATIC UINT32 (UINT32 flags, LosProcessCB *child, const CHAR *name, UINTPTR sp, UINT32 size)
{
    UINT32 ret;
    LosProcessCB *run = OsCurrProcessGet();//获取当前进程

    ret = OsInitPCB(child, run->processMode, OS_PROCESS_PRIORITY_LOWEST, LOS_SCHED_RR, name);//初始化PCB信息，进程模式，优先级，调度方式，名称 == 信息
    if (ret != LOS_OK) {
        return ret;
    }

    ret = OsCopyParent(flags, child, run);//拷贝父亲大人的基因信息
    if (ret != LOS_OK) {
        return ret;
    }

    return OsCopyTask(flags, child, name, sp, size);//拷贝任务，设置任务入口函数，栈大小
}
//初始化PCB块
STATIC UINT32 OsInitPCB(LosProcessCB *processCB, UINT32 mode, UINT16 priority, UINT16 policy, const CHAR *name)
{
    UINT32 count;
    LosVmSpace *space = NULL;
    LosVmPage *vmPage = NULL;
    status_t status;
    BOOL retVal = FALSE;

    processCB->processMode = mode;						//用户态进程还是内核态进程
    processCB->processStatus = OS_PROCESS_STATUS_INIT;	//进程初始状态
    processCB->parentProcessID = OS_INVALID_VALUE;		//爸爸进程，外面指定
    processCB->threadGroupID = OS_INVALID_VALUE;		//所属线程组
    processCB->priority = priority;						//进程优先级
    processCB->policy = policy;							//调度算法 LOS_SCHED_RR
    processCB->umask = OS_PROCESS_DEFAULT_UMASK;		//掩码
    processCB->timerID = (timer_t)(UINTPTR)MAX_INVALID_TIMER_VID;

    LOS_ListInit(&processCB->threadSiblingList);//初始化孩子任务/线程链表，上面挂的都是由此fork的孩子线程 见于 OsTaskCBInit LOS_ListTailInsert(&(processCB->threadSiblingList), &(taskCB->threadList));
    LOS_ListInit(&processCB->childrenList);		//初始化孩子进程链表，上面挂的都是由此fork的孩子进程 见于 OsCopyParent LOS_ListTailInsert(&parentProcessCB->childrenList, &childProcessCB->siblingList);
    LOS_ListInit(&processCB->exitChildList);	//初始化记录退出孩子进程链表，上面挂的是哪些exit	见于 OsProcessNaturalExit LOS_ListTailInsert(&parentCB->exitChildList, &processCB->siblingList);
    LOS_ListInit(&(processCB->waitList));		//初始化等待任务链表 上面挂的是处于等待的 见于 OsWaitInsertWaitLIstInOrder LOS_ListHeadInsert(&processCB->waitList, &runTask->pendList);

    for (count = 0; count < OS_PRIORITY_QUEUE_NUM; ++count) { //根据 priority数 创建对应个数的队列
        LOS_ListInit(&processCB->threadPriQueueList[count]); //初始化一个个线程队列，队列中存放就绪状态的线程/task 
    }//在鸿蒙内核中 task就是thread,在鸿蒙源码分析系列篇中有详细阐释 见于 https://my.oschina.net/u/3751245

    if (OsProcessIsUserMode(processCB)) {// 是否为用户模式进程
        space = LOS_MemAlloc(m_aucSysMem0, sizeof(LosVmSpace));//分配一个虚拟空间
        if (space == NULL) {
            PRINT_ERR("%s %d, alloc space failed\n", __FUNCTION__, __LINE__);
            return LOS_ENOMEM;
        }
        VADDR_T *ttb = LOS_PhysPagesAllocContiguous(1);//分配一个物理页用于存储L1页表 4G虚拟内存分成 （4096*1M）
        if (ttb == NULL) {//这里直接获取物理页ttb
            PRINT_ERR("%s %d, alloc ttb or space failed\n", __FUNCTION__, __LINE__);
            (VOID)LOS_MemFree(m_aucSysMem0, space);
            return LOS_ENOMEM;
        }
        (VOID)memset_s(ttb, PAGE_SIZE, 0, PAGE_SIZE);//内存清0
        retVal = OsUserVmSpaceInit(space, ttb);//初始化虚拟空间和进程mmu
        vmPage = OsVmVaddrToPage(ttb);//通过虚拟地址拿到page
        if ((retVal == FALSE) || (vmPage == NULL)) {//异常处理
            PRINT_ERR("create space failed! ret: %d, vmPage: %#x\n", retVal, vmPage);
            processCB->processStatus = OS_PROCESS_FLAG_UNUSED;//进程未使用,干净
            (VOID)LOS_MemFree(m_aucSysMem0, space);//释放虚拟空间
            LOS_PhysPagesFreeContiguous(ttb, 1);//释放物理页,4K
            return LOS_EAGAIN;
        }
        processCB->vmSpace = space;//设为进程虚拟空间
        LOS_ListAdd(&processCB->vmSpace->archMmu.ptList, &(vmPage->node));//将空间映射页表挂在 空间的mmu L1页表, L1为表头
    } else {
        processCB->vmSpace = LOS_GetKVmSpace();//内核共用一个虚拟空间,内核进程 常驻内存
    }

#ifdef LOSCFG_SECURITY_VID
    status = VidMapListInit(processCB);
    if (status != LOS_OK) {
        PRINT_ERR("VidMapListInit failed!\n");
        return LOS_ENOMEM;
    }
#endif
#ifdef LOSCFG_SECURITY_CAPABILITY
    OsInitCapability(processCB);
#endif

    if (OsSetProcessName(processCB, name) != LOS_OK) {
        return LOS_ENOMEM;
    }

    return LOS_OK;
}

  ``` 
  
 
 ```java 
  //拷贝一个Task过程
STATIC UINT32 OsCopyTask(UINT32 flags, LosProcessCB *childProcessCB, const CHAR *name, UINTPTR entry, UINT32 size)
{
    LosTaskCB *childTaskCB = NULL;
    TSK_INIT_PARAM_S childPara = { 0 };
    UINT32 ret;
    UINT32 intSave;
    UINT32 taskID;

    OsInitCopyTaskParam(childProcessCB, name, entry, size, &childPara);//初始化Task参数

    ret = LOS_TaskCreateOnly(&taskID, &childPara);//只创建任务,不调度
    if (ret != LOS_OK) {
        if (ret == LOS_ERRNO_TSK_TCB_UNAVAILABLE) {
            return LOS_EAGAIN;
        }
        return LOS_ENOMEM;
    }

    childTaskCB = OS_TCB_FROM_TID(taskID);//通过taskId获取task实体
    childTaskCB->taskStatus = OsCurrTaskGet()->taskStatus;//任务状态先同步,注意这里是赋值操作. ...01101001 
    if (childTaskCB->taskStatus & OS_TASK_STATUS_RUNNING) {//因只能有一个运行的task,所以如果一样要改4号位
        childTaskCB->taskStatus &= ~OS_TASK_STATUS_RUNNING;//将四号位清0 ,变成 ...01100001 
    } else {//非运行状态下会发生什么?
        if (OS_SCHEDULER_ACTIVE) {//克隆线程发生错误未运行
            LOS_Panic("Clone thread status not running error status: 0x%x\n", childTaskCB->taskStatus);
        }
        childTaskCB->taskStatus &= ~OS_TASK_STATUS_UNUSED;//干净的Task
        childProcessCB->priority = OS_PROCESS_PRIORITY_LOWEST;//进程设为最低优先级
    }

    if (OsProcessIsUserMode(childProcessCB)) {//是否是用户进程
        SCHEDULER_LOCK(intSave);
        OsUserCloneParentStack(childTaskCB, OsCurrTaskGet());//拷贝当前任务上下文给新的任务
        SCHEDULER_UNLOCK(intSave);
    }
    OS_TASK_PRI_QUEUE_ENQUEUE(childProcessCB, childTaskCB);//将task加入子进程的就绪队列
    childTaskCB->taskStatus |= OS_TASK_STATUS_READY;//任务状态贴上就绪标签
    return LOS_OK;
}
//把父任务上下文克隆给子任务
LITE_OS_SEC_TEXT VOID OsUserCloneParentStack(LosTaskCB *childTaskCB, LosTaskCB *parentTaskCB)
{
    TaskContext *context = (TaskContext *)childTaskCB->stackPointer;
    VOID *cloneStack = (VOID *)(((UINTPTR)parentTaskCB->topOfStack + parentTaskCB->stackSize) - sizeof(TaskContext));
	//cloneStack指向 TaskContext
    LOS_ASSERT(parentTaskCB->taskStatus & OS_TASK_STATUS_RUNNING);//当前任务一定是正在运行的task

    (VOID)memcpy_s(childTaskCB->stackPointer, sizeof(TaskContext), cloneStack, sizeof(TaskContext));//直接把任务上下文拷贝了一份
    context->R[0] = 0;//R0寄存器为0,这个很重要, pid = fork()  pid == 0 是子进程返回.
}

  ``` 
  
解读 
 
 可以看出fork的主体函数是 
 ```java 
  OsCopyProcess
  ``` 
 ,先申请一个干净的PCB,相当于申请一个容器装资源. 
 初始化这个容器 
 ```java 
  OsForkInitPCB
  ``` 
 ,  
 ```java 
  OsInitPCB
  ``` 
  先把容器打扫干净,虚拟空间,地址映射表(L1表),各种链表初始化好,为接下来的内容拷贝做好准备. 
  
 ```java 
  OsCopyParent
  ``` 
 把家族基因/关系传递给子进程,谁是你的老祖宗,你的七大姑八大姨是谁都得告诉你知道,这些都将挂到你已经初始化好的链表上. 
  
 ```java 
  OsCopyTask
  ``` 
 这个很重要,拷贝父进程当前执行的任务数据给子进程的新任务,系列篇中已经说过,真正让CPU干活的是任务(线程),所以子进程需要创建一个新任务  
 ```java 
  LOS_TaskCreateOnly
  ``` 
 来接受当前任务的数据,这个数据包括栈的数据,运行代码段指向, 
 ```java 
  OsUserCloneParentStack
  ``` 
 将用户态的上下文数据 
 ```java 
  TaskContext
  ``` 
 拷贝到子进程新任务的栈底位置, 也就是说新任务运行栈中此时只有上下文的数据.而且有最最最重要的一句代码  
 ```java 
  context->R[0] = 0;
  ``` 
  强制性的将未来恢复上下文 
 ```java 
  R0
  ``` 
 寄存器的数据改成了0, 这意味着调度算法切到子进程的任务后, 任务干的第一件事是恢复上下文,届时 
 ```java 
  R0
  ``` 
 寄存器的值变成0,而 
 ```java 
  R0=0
  ``` 
 意味着什么? 同时 
 ```java 
  LR/SP
  ``` 
 寄存器的值也和父进程的一样.这又意味着什么? 
 系列篇寄存器篇中以说过返回值就是存在R0寄存器中, 
 ```java 
  A()->B()
  ``` 
 ,A拿B的返回值只认 
 ```java 
  R0
  ``` 
 的数据,读到什么就是什么返回值,而R0寄存器值等于0,等同于获得返回值为0, 而LR寄存器所指向的指令是 
 ```java 
  pid=返回值
  ``` 
 , sp寄存器记录了栈中的开始计算的位置,如此完全还原了父进程调用 
 ```java 
  fork()
  ``` 
 前的运行场景,唯一的区别是改变了 
 ```java 
  R0
  ``` 
 寄存器的值,所以才有了  
 ```java 
  pid = 0;//fork()的返回值,注意子进程并没有执行fork(),它只是通过恢复上下文获得了一个返回值.
if (pid == 0) {
		message = "This is the child\n";
		n = 6;
	}

  ``` 
  由此确保了这是子进程的返回.这是 
 ```java 
  fork()
  ``` 
 最精彩的部分.一定要好好理解. 
 ```java 
  OsCopyTask``OsUserCloneParentStack
  ``` 
 的代码细节.会让你醍醐灌顶,永生难忘. 
 父进程的返回是 
 ```java 
  processID = child->processID;
  ``` 
 是子进程的ID,任何子进程的ID是不可能等于0的,成功了只能是大于0. 失败了就是负数  
 ```java 
  return -ret;
  ``` 
  
  
 ```java 
  OsCopyProcessResources
  ``` 
 用于赋值各种资源,包括拷贝虚拟空间内存,拷贝打开的文件列表,IPC等等. 
  
 ```java 
  OsChildSetProcessGroupAndSched
  ``` 
 设置子进程组和调度的准备工作,加入调度队列,准备调度. 
  
 ```java 
  LOS_MpSchedule
  ``` 
 是个核间中断,给所有CPU发送调度信号,让所有CPU发生一次调度.由此父进程让出CPU使用权,因为子进程的调度优先级和父进程是平级,而同级情况下子进程的任务已经插到就绪队列的头部位置  
 ```java 
  OS_PROCESS_PRI_QUEUE_ENQUEUE
  ``` 
 排在了父进程任务的前面,所以在没有比他们更高优先级的进程和任务出现之前,下一次被调度到的任务就是子进程的任务.也就是在本篇开头看到的  
 ```java 
  $ ./a.out 
This is the child
This is the parent
This is the child
This is the parent
This is the child
This is the parent
This is the child
$ This is the child
This is the child

  ``` 
   
 以上为fork在鸿蒙内核的整个实现过程,务必结合系列篇其他篇理解,一次理解透彻,终生不忘. 
 
##### 鸿蒙源码百篇博客 往期回顾 
 
  v45.03 (fork篇) | fork是如何做到调用一次,返回两次的 ?  < csdn  | harmony >  
  v44.03 (中断管理篇) | 硬中断的实现<>观察者模式  < csdn  | harmony >  
  v43.03 (中断概念篇) | 外人眼中权势滔天的当红海公公  < csdn  | harmony >  
  v42.03 (中断切换篇) | 中断切换到底在切换什么? < csdn  | harmony >  
  v41.03 (任务切换篇) | 汇编逐行注解分析任务上下文  < csdn  | harmony >  
  v40.03 (汇编汇总篇) | 所有的汇编代码都在这里  < csdn  | harmony >  
  v39.03 (异常接管篇) | 社会很单纯,复杂的是人  < csdn  | harmony >  
  v38.03 (寄存器篇) | ARM所有寄存器一网打尽,不再神秘  < csdn  | harmony >  
  v37.03 (系统调用篇) | 全盘解剖系统调用实现过程  < csdn  | harmony >  
  v36.03 (工作模式篇) | CPU是韦小宝,有哪七个老婆?  < csdn  | harmony >  
  v35.03 (时间管理篇) | Tick是操作系统的基本时间单位  < csdn  | harmony >  
  v34.03 (原子操作篇) | 是谁在为原子操作保驾护航?  < csdn  | harmony >  
  v33.03 (消息队列篇) | 进程间如何异步解耦传递大数据 ?  < csdn  | harmony >  
  v32.03 (CPU篇) | 内核是如何描述CPU的?  < csdn  | harmony >  
  v31.03 (定时器篇) | 内核最高优先级任务是谁?  < csdn  | harmony >  
  v30.03 (事件控制篇) | 任务间多对多的同步方案  < csdn  | harmony >  
  v29.03 (信号量篇) | 信号量解决任务同步问题  < csdn  | harmony >  
  v28.03 (进程通讯篇) | 进程间通讯有哪九大方式?  < csdn  | harmony >  
  v27.03 (互斥锁篇) | 互斥锁比自旋锁可丰满许多  < csdn  | harmony >  
  v26.03 (自旋锁篇) | 真的好想为自旋锁立贞节牌坊!  < csdn  | harmony >  
  v25.03 (并发并行篇) | 怎么记住并发并行的区别?  < csdn  | harmony >  
  v24.03 (进程概念篇) | 进程在管理哪些资源?  < csdn  | harmony >  
  v23.02 (汇编传参篇) | 汇编如何传递复杂的参数?  < csdn  | harmony >  
  v22.02 (汇编基础篇) | CPU在哪里打卡上班?  < csdn  | harmony >  
  v21.02 (线程概念篇) | 是谁在不断的折腾CPU?  < csdn  | harmony >  
  v20.02 (用栈方式篇) | 栈是构建底层运行的基础  < csdn  | harmony >  
  v19.02 (位图管理篇) | 为何进程和线程优先级都是32个?  < csdn  | harmony >  
  v18.02 (源码结构篇) | 内核500问你能答对多少?  < csdn  | harmony >  
  v17.02 (物理内存篇) | 这样记伙伴算法永远不会忘  < csdn  | harmony >  
  v16.02 (内存规则篇) | 内存管理到底在管什么?  < csdn  | harmony >  
  v15.02 (内存映射篇) | 什么是内存最重要的实现基础 ?  < csdn  | harmony >  
  v14.02 (内存汇编篇) | 什么是虚拟内存的实现基础?  < csdn  | harmony >  
  v13.02 (源码注释篇) | 热爱是所有的理由和答案  < csdn  | harmony >  
  v12.02 (内存管理篇) | 虚拟内存全景图是怎样的?  < csdn  | harmony >  
  v11.02 (内存分配篇) | 内存有哪些分配方式?  < csdn  | harmony >  
  v10.02 (内存主奴篇) | 紫禁城的主子和奴才如何相处?  < csdn  | harmony >  
  v09.02 (调度故事篇) | 用故事说内核调度  < csdn  | harmony >  
  v08.02 (总目录) | 百万汉字注解 百篇博客分析  < csdn  | harmony >  
  v07.02 (调度机制篇) | 任务是如何被调度执行的?  < csdn  | harmony >  
  v06.02 (调度队列篇) | 就绪队列对调度的作用  < csdn  | harmony >  
  v05.02 (任务管理篇) | 谁在让CPU忙忙碌碌?  < csdn  | harmony >  
  v04.02 (任务调度篇) | 任务是内核调度的单元  < csdn  | harmony >  
  v03.02 (时钟任务篇) | 触发调度最大的动力来自哪里?  < csdn  | harmony >  
  v02.02 (进程管理篇) | 进程是内核资源管理单元  < csdn  | harmony >  
  v01.09 (双向链表篇) | 谁是内核最重要结构体?  < csdn  | harmony >  
 
##### 参与贡献 
 
  访问注解仓库地址  
  Fork 本仓库 >> 新建 Feat_xxx 分支 >> 提交代码注解 >> 新建 Pull Request  
  新建 Issue  
 
##### 喜欢请大方 点赞+关注+收藏 吧 
 
  关注「鸿蒙内核源码分析」公众号，百万汉字注解 + 百篇博客分析 => 深挖鸿蒙内核源码  
  ![Test](https://gitee.com/weharmony/docs/raw/master/pic/other/process_fork.png  '鸿蒙内核源码分析(fork篇) - fork是如何做到调用一次,返回两次的 - - 百篇博客分析HarmonyOS源码 - v45.03')  
  各大站点搜 "鸿蒙内核源码分析" .欢迎转载,请注明出处.  

                                        