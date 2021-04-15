---
title: 推荐系列-LiteOS内核源码分析-任务栈信息
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 2061
cover_picture: 'https://pic4.zhimg.com/80/v2-1f13e0ca5e94c3770973d6e69da61243_720w.jpg'
abbrlink: f4a35f5f
date: 2021-04-15 09:46:45
---

&emsp;&emsp;摘要：LiteOS任务栈是高地址向低地址生长的递减栈，栈指针指向即将入栈的元素位置。 本文分享自华为云社区《LiteOS内核源码分析系列六 -任务及调度（2）-任务LOS_Task》，原文作者：zhushy ...
<!-- more -->

                                                                                                                                                                                         
本文分享自华为云社区《LiteOS内核源码分析系列六 -任务及调度（2）-任务LOS_Task》，原文作者：zhushy 。 
我们介绍下LiteOS任务栈的基础概念。LiteOS任务栈是高地址向低地址生长的递减栈，栈指针指向即将入栈的元素位置。初始化后未使用过的栈空间初始化的内容为宏OS_STACK_INIT代表的数值0xCACACACA，栈顶初始化为宏OS_STACK_MAGIC_WORD代表的数值0xCCCCCCCC。一个任务栈的示意图如下，其中，栈底指针是栈的最大的内存地址，栈顶指针，是栈的最小的内存地址，栈指针从栈底向栈顶方向生长。 
![Test](https://pic4.zhimg.com/80/v2-1f13e0ca5e94c3770973d6e69da61243_720w.jpg  'LiteOS内核源码分析-任务栈信息') 
 
#### 1、 LOS_StackInfo任务栈结构体定义 
 
  
 ```java 
  typedef struct {
    VOID *stackTop;     // 栈顶指针
    UINT32 stackSize;   // 栈大小
    CHAR *stackName;    // 栈名称
} StackInfo;
  ``` 
  
 
另外定义了一个宏函数OS_STACK_MAGIC_CHECK(topstack)用于检测栈是否有效，当栈顶等于OS_STACK_MAGIC_WORD栈是正常的，没有溢出，否则栈顶被改写，发生栈溢出。 
 
  
 ```java 
  /* 1:有效正常的栈 0:无效，发生溢出的栈 */
#define OS_STACK_MAGIC_CHECK(topstack) (*(UINTPTR *)(topstack) == OS_STACK_MAGIC_WORD)
  ``` 
  
 
 
#### 2、 LOS_StackInfo任务栈支持的操作 
 
##### 2.1 任务栈初始化 
栈初始化函数VOID OsStackInit()使用2个参数，一个是栈顶指针VOID *stacktop，一个是初始化的栈的大���。把栈内容初始化为OS_STACK_INIT，把栈顶初始化为OS_STACK_MAGIC_WORD。 
该函数被arch\arm\cortex_m\src\task.c的*OsTaskStackInit(UINT32 taskId, UINT32 stackSize, VOID *topStack)方法调用，进一步被创建任务时的OsTaskCreateOnly()方法调用，完成新创建任务的任务栈初始化。 
 
  
 ```java 
  VOID OsStackInit(VOID *stacktop, UINT32 stacksize)
{
     (VOID)memset_s(stacktop, stacksize, (INT32)OS_STACK_INIT, stacksize);
    *((UINTPTR *)stacktop) = OS_STACK_MAGIC_WORD;
}
  ``` 
  
 
 
##### 2.2 获取任务栈水线 
随着任务栈入栈、出栈，当前栈使用的大小不一定是最大值，OsStackWaterLineGet()可以获取的栈使用的最大值即水线WaterLine。 
该函数需要3个参数，UINTPTR *stackBottom是栈底指针，const UINTPTR *stackTop栈顶指针，UINT32 *peakUsed用于返回获取的水线值，即任务栈使用的最大值。 
⑴处代码表示如果*stackTop == OS_STACK_MAGIC_WORD，说明栈没有被溢出破坏，从栈顶开始栈内容被写满宏OS_STACK_INIT的部分是没有使用过的栈空间。使用tmp指针变量依次向栈底方向增加，判断栈是否被使用过，while循环结束，栈指针tmp指向最大的未使用过的栈地址。⑵处代码使用栈底指针stackBottom减去tmp，获取最大的使用过的栈空间大小，即需要的水线。⑶处如果栈顶溢出，则返回无效值OS_INVALID_WATERLINE。 
该函数被kernel\base\los_task.c中的函数LOS_TaskInfoGet(UINT32 taskId, TSK_INFO_S *taskInfo)调用，获取任务的信息。在shell模块也会使用来或者栈信息。 
 
  
 ```java 
  UINT32 OsStackWaterLineGet(const UINTPTR *stackBottom, const UINTPTR *stackTop, UINT32 *peakUsed)
{
    UINT32 size;
    const UINTPTR *tmp = NULL;
⑴  if (*stackTop == OS_STACK_MAGIC_WORD) {
        tmp = stackTop + 1;
        while ((tmp < stackBottom) && (*tmp == OS_STACK_INIT)) {
            tmp++;
        }
⑵      size = (UINT32)((UINTPTR)stackBottom - (UINTPTR)tmp);
        *peakUsed = (size == 0) ? size : (size + sizeof(CHAR *));
        return LOS_OK;
    } else {
        *peakUsed = OS_INVALID_WATERLINE;
        return LOS_NOK;
    }
}
  ``` 
  
 
 
#### 3、 LOS_Task任务栈初始化 
我们以AArch32 Cortex-M核为例，剖析下任务栈初始化的过程，相关代码分布在arch\arm\cortex_m\include\arch\task.h、arch\arm\cortex_m\src\task.c。首先看下任务上下文。 
 
##### 3.1 TaskContext上下文结构体定义 
任务上下文（Task Context）指的是任务运行的环境，例如包括程序计数器、堆栈指针、通用寄存器等内容。在多任务调度中，任务上下文切换（Task Context Switching）属于核心内容，是多个任务运行在同一CPU核上的基础。LiteOS内核中，上下文的结构体定义如下： 
 
  
 ```java 
  typedef struct tagContext {
#if ((defined (__FPU_PRESENT) && (__FPU_PRESENT == 1U)) && \
     (defined (__FPU_USED) && (__FPU_USED == 1U)))
    UINT32 S16;
    UINT32 S17;
    UINT32 S18;
    UINT32 S19;
    UINT32 S20;
    UINT32 S21;
    UINT32 S22;
    UINT32 S23;
    UINT32 S24;
    UINT32 S25;
    UINT32 S26;
    UINT32 S27;
    UINT32 S28;
    UINT32 S29;
    UINT32 S30;
    UINT32 S31;
#endif
    UINT32 R4;
    UINT32 R5;
    UINT32 R6;
    UINT32 R7;
    UINT32 R8;
    UINT32 R9;
    UINT32 R10;
    UINT32 R11;
    UINT32 PriMask;
    UINT32 R0;
    UINT32 R1;
    UINT32 R2;
    UINT32 R3;
    UINT32 R12;
    UINT32 LR;
    UINT32 PC;
    UINT32 xPSR;
#if ((defined (__FPU_PRESENT) && (__FPU_PRESENT == 1U)) && \
     (defined (__FPU_USED) && (__FPU_USED == 1U)))
    UINT32 S0;
    UINT32 S1;
    UINT32 S2;
    UINT32 S3;
    UINT32 S4;
    UINT32 S5;
    UINT32 S6;
    UINT32 S7;
    UINT32 S8;
    UINT32 S9;
    UINT32 S10;
    UINT32 S11;
    UINT32 S12;
    UINT32 S13;
    UINT32 S14;
    UINT32 S15;
    UINT32 FPSCR;
    UINT32 NO_NAME;
#endif
} TaskContext;
  ``` 
  
 
 
##### 3.2 LOS_Task任务栈初始化 
上文中提到在创建任务的时候，会使用VOID *OsTaskStackInit()函数初始化任务栈。我们分析下函数代码，它需要3个参数，UINT32 taskId待创建任务的编号，UINT32 stackSize任务栈的大小，VOID *topStack任务栈的栈顶指针。 
⑴处代码调用OsStackInit()函数初始化栈，初始化栈内容和栈顶为魔术字。⑵处代码获取任务上下文的指针地址TaskContext *taskContext，栈的底部大小为sizeof(TaskContext)的栈空间存放上下文的数据。⑶处如果支持浮点数计算，需要初始化浮点数相关的寄存器。⑷初始化通用寄存器，其中LR初始化为(UINT32)OsTaskExit，PC初始化为(UINT32)OsTaskEntry，CPU首次执行该任务时运行的第一条指令的位置，这2个函数下文会分析。⑸处返回值是指针(VOID *)taskContext，这个就是任务初始化后的栈指针，注意不是从栈底开始了，栈底保存的是上下文，栈指针要减去上下文占用的栈大小。 
在栈中，从TaskContext *taskContext指针增加的方向，依次保存上下文结构体的第一个成员，第二个成员…另外，初始化栈的时候，除了特殊的几个寄存器，不同寄存器的初始值没有什么意义，也有些初始化的规律。比如R2寄存器初始化为0x02020202L，R12寄存器初始化为0x12121212L初始化的内容和寄存器编号有关联，其余类似。 
 
  
 ```java 
  LITE_OS_SEC_TEXT_INIT VOID *OsTaskStackInit(UINT32 taskId, UINT32 stackSize, VOID *topStack)
{
    TaskContext *taskContext = NULL;

⑴  OsStackInit(topStack, stackSize);
⑵  taskContext = (TaskContext *)(((UINTPTR)topStack + stackSize) - sizeof(TaskContext));

#if ((defined (__FPU_PRESENT) && (__FPU_PRESENT == 1U)) && \
⑶  (defined (__FPU_USED) && (__FPU_USED == 1U)))
    taskContext->S16 = 0xAA000010;
    taskContext->S17 = 0xAA000011;
    taskContext->S18 = 0xAA000012;
    taskContext->S19 = 0xAA000013;
    taskContext->S20 = 0xAA000014;
    taskContext->S21 = 0xAA000015;
    taskContext->S22 = 0xAA000016;
    taskContext->S23 = 0xAA000017;
    taskContext->S24 = 0xAA000018;
    taskContext->S25 = 0xAA000019;
    taskContext->S26 = 0xAA00001A;
    taskContext->S27 = 0xAA00001B;
    taskContext->S28 = 0xAA00001C;
    taskContext->S29 = 0xAA00001D;
    taskContext->S30 = 0xAA00001E;
    taskContext->S31 = 0xAA00001F;
    taskContext->S0  = 0xAA000000;
    taskContext->S1  = 0xAA000001;
    taskContext->S2  = 0xAA000002;
    taskContext->S3  = 0xAA000003;
    taskContext->S4  = 0xAA000004;
    taskContext->S5  = 0xAA000005;
    taskContext->S6  = 0xAA000006;
    taskContext->S7  = 0xAA000007;
    taskContext->S8  = 0xAA000008;
    taskContext->S9  = 0xAA000009;
    taskContext->S10 = 0xAA00000A;
    taskContext->S11 = 0xAA00000B;
    taskContext->S12 = 0xAA00000C;
    taskContext->S13 = 0xAA00000D;
    taskContext->S14 = 0xAA00000E;
    taskContext->S15 = 0xAA00000F;
    taskContext->FPSCR = 0x00000000;
    taskContext->NO_NAME = 0xAA000011;
#endif

⑷  taskContext->R4  = 0x04040404L;
    taskContext->R5  = 0x05050505L;
    taskContext->R6  = 0x06060606L;
    taskContext->R7  = 0x07070707L;
    taskContext->R8  = 0x08080808L;
    taskContext->R9  = 0x09090909L;
    taskContext->R10 = 0x10101010L;
    taskContext->R11 = 0x11111111L;
    taskContext->PriMask = 0;
    taskContext->R0  = taskId;
    taskContext->R1  = 0x01010101L;
    taskContext->R2  = 0x02020202L;
    taskContext->R3  = 0x03030303L;
    taskContext->R12 = 0x12121212L;
    taskContext->LR  = (UINT32)OsTaskExit;
    taskContext->PC  = (UINT32)OsTaskEntry;
    taskContext->xPSR = 0x01000000L;

⑸  return (VOID *)taskContext;
}
  ``` 
  
 
 
##### 3.3 OsTaskExit()函数 
在初始化上下文的时候，链接寄存器设置的是函数VOID OsTaskExit(VOID)，该函数定义在文件arch\arm\cortex_m\src\task.c。函数代码里调用__disable_irq()关中断，然后进入死循环。该函数理论上不会被执行，忽略即可。 
 
  
 ```java 
  LITE_OS_SEC_TEXT_MINOR VOID OsTaskExit(VOID)
{
    __disable_irq();
    while (1) { }
}
  ``` 
  
 
 
##### 3.4 LOS_Task任务进入函数 
在初始化上下文的时候，PC寄存器设置的是函数VOID OsTaskEntry(UINT32 taskId)，该函数定义在文件kernel\base\los_task.c，我们来分析下源代码，⑴处释放任务的自旋锁，开中断。然后执行⑵处代码获取taskCB，并调用任务的入口函数。等任务执行完毕后，检查taskCB->taskFlags是否设置为自删除标记OS_TASK_FLAG_DETACHED，如果是则删除任务。 
 
  
 ```java 
  LITE_OS_SEC_TEXT_INIT VOID OsTaskEntry(UINT32 taskId)
{
    LosTaskCB *taskCB = NULL;
    VOID *ret = NULL;

    LOS_ASSERT(OS_TSK_GET_INDEX(taskId) < g_taskMaxNum);

⑴  LOS_SpinUnlock(&g_taskSpin);
    (VOID)LOS_IntUnLock();

⑵  taskCB = OS_TCB_FROM_TID(taskId);

#ifdef LOSCFG_OBSOLETE_API
    ret = taskCB->taskEntry(taskCB->args[0], taskCB->args[1], taskCB->args[2],
        taskCB->args[3]); /* 0~3: just for args array index */
#else
    ret = taskCB->taskEntry(taskCB->args);
#endif

⑶  if (OsTaskDeleteCheckDetached(taskCB)) {
        OsTaskDeleteDetached(taskCB);
    } else {
        OsTaskDeleteJoined(taskCB, ret);
    }
}
  ``` 
  
 
  
点击关注，第一时间了解华为云新鲜技术~
                                        