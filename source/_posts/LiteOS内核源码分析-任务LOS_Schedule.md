---
title: 推荐系列-LiteOS内核源码分析-任务LOS_Schedule
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 874
cover_picture: 'https://pic1.zhimg.com/80/v2-431e6d77184fe8b624a6ed9aea5b4ac8_720w.jpg'
abbrlink: d064fabf
date: 2021-04-15 09:08:53
---

&emsp;&emsp;摘要：调度，Schedule也称为Dispatch，是操作系统的一个重要模块，它负责选择系统要处理的下一个任务。调度模块需要协调处于就绪状态的任务对资源的竞争，按优先级策略从就绪队列中获取高优先...
<!-- more -->

                                                                                                                                                                                         
本文分享自华为云社区《LiteOS内核源码分析系列六 -任务及调度（5）-任务LOS_Schedule》，原文作者：zhushy 。 
本文我们来一起学习下LiteOS调度模块的源代码，文中所涉及的源代码， 均可以在 ```java 
  LiteOS
  ``` 开源��点https://gitee.com/LiteOS/LiteOS 获取。 调度源代码分布如下： 
 
 LiteOS内核调度源代码 
 
包括调度模块的私有头文件kernel\base\include\los_sched_pri.h、C源代码文件kernel\base\sched\sched_sq\los_sched.c，这个对应单链表就绪队列。还有个`调度源代码文件kernel\base\sched\sched_mq\los_sched.c，对应多链表就绪队列。本文主要剖析对应单链表就绪队列的调度文件代码，使用多链表就绪队列的调度代码类似。 
 
 调度模块汇编实现代码 
 
调度模块的汇编函数有OsStartToRun、OsTaskSchedule等，根据不同的CPU架构，分布在下述文件里： arch\arm\cortex_m\src\dispatch.S、arch\arm\cortex_a_r\src\dispatch.S、arch\arm64\src\dispatch.S。 
本文以STM32F769IDISCOVERY为例，分析一下Cortex-M核的调度模块的源代码。我们先看看调度头文件kernel\base\include\los_sched_pri.h中定义的宏函数、枚举、和内联函数。 
 
#### 1、调度模块宏函数和内联函数 
kernel\base\include\los_sched_pri.h定义的宏函数、枚举、内联函数。 
 
##### 1.1 宏函数和枚举 
UINT32 g_taskScheduled是kernel\base\los_task.c定义的全局变量，标记内核是否开启调度，每一位代表不同的CPU核的调度开启状态。 
⑴处定义的宏函数OS_SCHEDULER_SET(cpuid)开启cpuid核的调度。⑵处宏函数OS_SCHEDULER_CLR(cpuid)是前者的反向操作，关闭cpuid核的调度。⑶处宏判断当前核是否开启调度。⑷处的枚举用于标记是否发起了请求调度。当需要调度，又暂不具备调度条件的时候，标记下状态，等具备调度的条件时，再去调度。 
 
  ```java 
  ⑴  #define OS_SCHEDULER_SET(cpuid) do {     \
        g_taskScheduled |= (1U << (cpuid));  \
    } while (0);

⑵  #define OS_SCHEDULER_CLR(cpuid) do {     \
        g_taskScheduled &= ~(1U << (cpuid)); \
    } while (0);

⑶  #define OS_SCHEDULER_ACTIVE (g_taskScheduled & (1U << ArchCurrCpuid()))

⑷  typedef enum {
        INT_NO_RESCH = 0,   /* no needs to schedule */
        INT_PEND_RESCH,     /* pending schedule flag */
    } SchedFlag;
  ```  
 
 
##### 1.2 内联函数 
有2个内联函数用于检查是否可以调度，即函数STATIC INLINE BOOL OsPreemptable(VOID)和STATIC INLINE BOOL OsPreemptableInSched(VOID)。区别是，前者判断是否可以抢占调度时，先关中断，避免当前的任务迁移到其他核，返回错误的是否可以抢占调度状态。 
 
###### 1.2.1 内联函数STATIC INLINE BOOL OsPreemptable(VOID) 
我们看下BOOL OsPreemptable(VOID)函数的源码。⑴、⑶属于关闭、开启中断，保护检查抢占状态的操作。⑵处判断是否可抢占调度，如果不能调度，则标记下是否需要调度标签为INT_PEND_RESCH。 
 
  ```java 
  STATIC INLINE BOOL OsPreemptable(VOID)
{
⑴  UINT32 intSave = LOS_IntLock();
⑵    BOOL preemptable = (OsPercpuGet()->taskLockCnt == 0);
    if (!preemptable) {
        OsPercpuGet()->schedFlag = INT_PEND_RESCH;
    }
⑶  LOS_IntRestore(intSave);
    return preemptable;
}
  ```  
 
 
###### 1.2.2 内联函数STATIC INLINE BOOL OsPreemptableInSched(VOID) 
函数STATIC INLINE BOOL OsPreemptableInSched(VOID)检查是否可以抢占调度，检查的方式是判断OsPercpuGet()->taskLockCnt的计数，见⑴、⑵处代码。如果不能调度，则执行⑶标记下是否需要调度标签为INT_PEND_RESCH。对于SMP多核，是否可以调度的检查方式，稍有不同，因为调度持有自旋锁，计数需要加1，见代码。 
 
  ```java 
  STATIC INLINE BOOL OsPreemptableInSched(VOID)
{
    BOOL preemptable = FALSE;

#ifdef LOSCFG_KERNEL_SMP
⑴  preemptable = (OsPercpuGet()->taskLockCnt == 1);
#else
⑵  preemptable = (OsPercpuGet()->taskLockCnt == 0);
#endif
    if (!preemptable) {
⑶      OsPercpuGet()->schedFlag = INT_PEND_RESCH;
    }

    return preemptable;
}
  ```  
 
 
###### 1.2.3 内联函数STATIC INLINE VOID LOS_Schedule(VOID) 
函数STATIC INLINE VOID LOS_Schedule(VOID)用于触发触发调度。⑴处代码表示，如果系统正在处理中断，标记下是否需要调度标签为INT_PEND_RESCH，等待合适时机再调度。然后调用VOID OsSchedPreempt(VOID)函数，下午会分析该函数。二者的区别就是多个检查，判断是否系统是否正在处理中断。 
 
  ```java 
  STATIC INLINE VOID LOS_Schedule(VOID)
{
    if (OS_INT_ACTIVE) {
⑴      OsPercpuGet()->schedFlag = INT_PEND_RESCH;
        return;
    }
    OsSchedPreempt();
}
  ```  
 
 
#### 2、调度模块常用接口 
这一小节，我们看看kernel\base\sched\sched_sq\los_sched.c定义的调度接口，包含VOID OsSchedPreempt(VOID)、VOID OsSchedResched(VOID)两个主要的调度接口。两者的区别是，前者需要把当前任务放入就绪队列内，再调用后者触发调用。后者直接从就绪队列里获取下一个任务，然后触发调度去运行下一个任务。这2个接口都是内部接口，对外提供的调度接口是上一小节分析过的STATIC INLINE VOID LOS_Schedule(VOID)，三者有调用关系STATIC INLINE VOID LOS_Schedule(VOID)--->VOID OsSchedPreempt(VOID)--->VOID OsSchedResched(VOID)。 
我们分析下这些调度接口的源代码。 
 
##### 2.1 抢占调度函数VOID OsSchedResched(VOID) 
抢占调度函数VOID OsSchedResched(VOID)，我们分析下源代码。 
⑴验证需要持有任务模块的自旋锁。⑵处判断是否支持调度，如果不具备调度的条件，则暂不调度。⑶获取当前运行任务，从就绪队列中获取下一个高优先级的任务。验证下一个任务newTask不能为空，并更改其状态为非就绪状态。⑷处判断当前任务和下一个任务不能为同一个，否则返回。这种情况不会发生，当前任务肯定会从优先级队列中移除的，二者不可能是同一个。⑸更改2个任务的运行状态，当前任务设置为非运行状态，下一个任务设置为运行状态。⑹处如果支持多核，则更改任务的运行在哪个核。紧接着的一些代码属于调度维测信息，暂时不管。⑺处如果支持时间片调度，并且下一个新任务的时间片为0，设置为时间片超时时间的最大值LOSCFG_BASE_CORE_TIMESLICE_TIMEOUT。⑻设置下一个任务newTask为当前运行任务，会更新全局变量g_runTask。然后调用汇编函数OsTaskSchedule(newTask, runTask)执行调度，后文分析该汇编函数的实现代码。 
 
  ```java 
  VOID OsSchedResched(VOID)
{
    LosTaskCB *runTask = NULL;
    LosTaskCB *newTask = NULL;

⑴  LOS_ASSERT(LOS_SpinHeld(&g_taskSpin));

⑵  if (!OsPreemptableInSched()) {
        return;
    }

⑶  runTask = OsCurrTaskGet();
    newTask = OsGetTopTask();
    LOS_ASSERT(newTask != NULL);
    newTask->taskStatus &= ~OS_TASK_STATUS_READY;

⑷  if (runTask == newTask) {
        return;
    }

⑸  runTask->taskStatus &= ~OS_TASK_STATUS_RUNNING;
    newTask->taskStatus |= OS_TASK_STATUS_RUNNING;

#ifdef LOSCFG_KERNEL_SMP
⑹  runTask->currCpu = OS_TASK_INVALID_CPUID;
    newTask->currCpu = ArchCurrCpuid();
#endif

    OsTaskTimeUpdateHook(runTask->taskId, LOS_TickCountGet());

#ifdef LOSCFG_KERNEL_CPUP
    OsTaskCycleEndStart(newTask);
#endif

#ifdef LOSCFG_BASE_CORE_TSK_MONITOR
    OsTaskSwitchCheck(runTask, newTask);
#endif

    LOS_TRACE(TASK_SWITCH, newTask->taskId, runTask->priority, runTask->taskStatus, newTask->priority,
        newTask->taskStatus);

#ifdef LOSCFG_DEBUG_SCHED_STATISTICS
    OsSchedStatistics(runTask, newTask);
#endif

    PRINT_TRACE("cpu%u (%s) status: %x -> (%s) status:%x\n", ArchCurrCpuid(),
                runTask->taskName, runTask->taskStatus,
                newTask->taskName, newTask->taskStatus);

#ifdef LOSCFG_BASE_CORE_TIMESLICE
    if (newTask->timeSlice == 0) {
⑺      newTask->timeSlice = LOSCFG_BASE_CORE_TIMESLICE_TIMEOUT;
    }
#endif

⑻  OsCurrTaskSet((VOID*)newTask);
    OsTaskSchedule(newTask, runTask);
}
  ```  
 
 
##### 2.2 抢占调度函数VOID OsSchedPreempt(VOID) 
抢占调度函数VOID OsSchedPreempt(VOID)，把当前任务放入就绪队列，从队列中获取高优先级任务，然后尝试调度。当锁调度，或者没有更高优先级任务时，调度不会发生。⑴处判断是否支持调度，如果不具备调度的条件，则暂不调度。⑵获取当前任务，更改其状态为非就绪状态。 
如果开启时间片调度并且当前任务时间片为0，则执行⑶把当前任务放入就绪队列的尾部，否则执行⑷把当前任务放入就绪队列的头部，同等优先级下可以更早的运行。⑸调用函数OsSchedResched()去调度。 
 
  ```java 
  VOID OsSchedPreempt(VOID)
{
    LosTaskCB *runTask = NULL;
    UINT32 intSave;

⑴  if (!OsPreemptable()) {
        return;
    }

    SCHEDULER_LOCK(intSave);

⑵  runTask = OsCurrTaskGet();
    runTask->taskStatus |= OS_TASK_STATUS_READY;

#ifdef LOSCFG_BASE_CORE_TIMESLICE
    if (runTask->timeSlice == 0) {
⑶      OsPriQueueEnqueue(&runTask->pendList, runTask->priority);
    } else {
#endif
⑷      OsPriQueueEnqueueHead(&runTask->pendList, runTask->priority);
#ifdef LOSCFG_BASE_CORE_TIMESLICE
    }
#endif

⑸  OsSchedResched();

    SCHEDULER_UNLOCK(intSave);
}
  ```  
 
 
##### 2.3 时间片检查函数VOID OsTimesliceCheck(VOID) 
函数VOID OsTimesliceCheck(VOID)在支持时间片调度时才生效，该函数在tick中断函数VOID OsTickHandler(VOID)里调用。如果当前运行函数的时间片使用完毕，则触发调度。⑴处获取当前运行任务，⑵判断runTask->timeSlice时间片是否为0，不为0则减1。如果减1后为0，则执行⑶调用LOS_Schedule()触发调度。 
 
  ```java 
  #ifdef LOSCFG_BASE_CORE_TIMESLICE
LITE_OS_SEC_TEXT VOID OsTimesliceCheck(VOID)
{
⑴  LosTaskCB *runTask = OsCurrTaskGet();
⑵  if (runTask->timeSlice != 0) {
        runTask->timeSlice--;
        if (runTask->timeSlice == 0) {
⑶          LOS_Schedule();
        }
    }
}
#endif
  ```  
 
 
#### 3、调度模块汇编函数 
文件arch\arm\cortex_m\src\dispatch.S定义了调度的汇编函数，我们分析下这些调度接口的源代码。汇编文件中定义了如下几个宏，见注释。 
 
  ```java 
  .equ OS_NVIC_INT_CTRL,           0xE000ED04     ; Interrupt Control State Register，ICSR 中断控制状态寄存器
.equ OS_NVIC_SYSPRI2,            0xE000ED20     ; System Handler Priority Register 系统优先级寄存器
.equ OS_NVIC_PENDSV_PRI,         0xF0F00000     ; PendSV异常优先级
.equ OS_NVIC_PENDSVSET,          0x10000000     ; ICSR寄存器的PENDSVSET位置1时，会触发PendSV异常
.equ OS_TASK_STATUS_RUNNING,     0x0010         ; los_task_pri.h中的同名宏定义，数值也一样，表示任务运行状态，
  ```  
 
 
##### 3.1 OsStartToRun汇编函数 
函数OsStartToRun在文件kernel\init\los_init.c中的运行函数VOID OsStart(VOID)启动系统阶段调用，传入的参数为就绪队列中最高优秀级的LosTaskCB *taskCB。我们接下来分析下该函数的汇编代码。 
⑴处设置PendSV异常优先级为OS_NVIC_PENDSV_PRI，PendSV异常一般设置为最低。全局变量g_oldTask、g_runTask定义在arch\arm\cortex_m\src\task.c文件内，分别记录上一次运行的任务、和当前运行的任务。⑵处代码把函数OsStartToRun的入参LosTaskCB *taskCB赋值给这2个全局变量。 
⑶处往控制寄存器CONTROL写入二进制的10，表示使用PSP栈，特权级的线程模式。UINT16 taskStatus是LosTaskCB结构体的第二个成员变量，⑷处[r0 , #4]获取任务状态，此时寄存器r7数值为0x4，即就绪状态OS_TASK_STATUS_READY。然后把任务状态改为运行状态OS_TASK_STATUS_RUNNING。 
⑸处把[r0]的值即任务的栈指针taskCB->stackPointer加载到寄存器R12，现在R12指向任务栈的栈指针，任务栈现在保存的是上下文，对应定义在arch\arm\cortex_m\include\arch\task.h中的结构体TaskContext。往后2行代码把R12加36+64=100，共25个4字节长度，其中包含S16到S31共16个4字节，R4到R11及PriMask共9个4字节的长度，当前R12指向任务栈中上下文的UINT32 R0位置，如图。 
![Test](https://pic1.zhimg.com/80/v2-431e6d77184fe8b624a6ed9aea5b4ac8_720w.jpg LiteOS内核源码分析-任务LOS_Schedule) 
⑹处代码把任务栈上下文中的UINT32 R0; UINT32 R1; UINT32 R2; UINT32 R3; UINT32 R12; UINT32 LR; UINT32 PC; UINT32 xPSR;的分别加载到寄存器R0-R7，其中R5对应UINT32 LR，R6对应UINT32 PC，此时寄存器R12指向任务栈上下文的UINT32 xPSR。执行⑺处指令，指针继续加18个4字节长度，即对应S0到S15及UINT32 FPSCR; UINT32 NO_NAME等上下文的18个成员。此时，寄存器R12指向任务栈的栈底，紧接着把寄存器R12写入寄存器psp。 
最后，执行⑻处指令，把R5写入lr寄存器，开中断，然后跳转到R6对应的上下文的PC对应的函数VOID OsTaskEntry(UINT32 taskId)，去执行任务的入口函数。 
 
  ```java 
  .type OsStartToRun, %function
.global OsStartToRun
OsStartToRun:
    .fnstart
    .cantunwind
⑴  ldr     r4, =OS_NVIC_SYSPRI2
    ldr     r5, =OS_NVIC_PENDSV_PRI
    str     r5, [r4]

⑵  ldr     r1, =g_oldTask
    str     r0, [r1]

    ldr     r1, =g_runTask
    str     r0, [r1]
#if defined(LOSCFG_ARCH_CORTEX_M0)
    movs    r1, #2
    msr     CONTROL, r1
    ldrh    r7, [r0 , #4]
    movs    r6,  #OS_TASK_STATUS_RUNNING
    strh    r6,  [r0 , #4]
    ldr     r3, [r0]
    adds    r3, r3, #36
    ldmfd   r3!, {r0-r2}
    adds    r3, r3, #4
    ldmfd   r3!, {R4-R7}
    msr     psp, r3
    subs    r3, r3, #20
    ldr     r3,  [r3]
#else
⑶  mov     r1, #2
    msr     CONTROL, r1

⑷  ldrh    r7, [r0 , #4]
    mov     r8,  #OS_TASK_STATUS_RUNNING
    strh    r8,  [r0 , #4]

⑸  ldr     r12, [r0]
    ADD     r12, r12, #36
#if !defined(LOSCFG_ARCH_CORTEX_M3)
    ADD     r12, r12, #64
#endif

⑹  ldmfd   r12!, {R0-R7}
#if !defined(LOSCFG_ARCH_CORTEX_M3)
⑺  add     r12, r12, #72
#endif
    msr     psp, r12
#if !defined(LOSCFG_ARCH_CORTEX_M3)
    vpush   {s0};
    vpop    {s0};
#endif
#endif

⑻  mov     lr, r5
    cpsie   I
    bx      r6
    .fnend
  ```  
 
 
##### 3.2 OsTaskSchedule汇编函数 
汇编函数OsTaskSchedule实现新老任务的切换调度。从上文分析抢占调度函数VOID OsSchedResched(VOID)时可以知道，传入了2个参数，分别是新任务LosTaskCB *newTask和当前运行的任务LosTaskCB *runTask，对于Cortex-M核，这2个参数在该汇编函数中没有使用到。在执行汇编函数OsTaskSchedule前，全局变量g_runTask被赋值为要切换运行的新任务LosTaskCB *newTask。 
我们看看这个汇编函数的源代码，首先往中断控制状态寄存器OS_NVIC_INT_CTRL中的OS_NVIC_PENDSVSET位置1，触发PendSV异常。执行完毕osTaskSchedule函数，返回上层函数抢占调度函数VOID OsSchedResched(VOID)。PendSV异常的回调函数是osPendSV汇编函数，下文会分析此函数。汇编函数OsTaskSchedule如下： 
 
  ```java 
  .type OsTaskSchedule, %function
.global OsTaskSchedule
OsTaskSchedule:
    .fnstart
    .cantunwind
    ldr     r2, =OS_NVIC_INT_CTRL
    ldr     r3, =OS_NVIC_PENDSVSET
    str     r3, [r2]
    bx      lr
    .fnend
  ```  
 
 
##### 3.3 osPendSV汇编函数 
接下来，我们分析下osPendSV汇编函数的源代码。⑴处把寄存器PRIMASK数值写入寄存器r12，备份中断的开关状态，然后执行指令cpsid I屏蔽全局中断。⑵处把当前任务栈的栈指针加载到寄存器r0。⑶处把寄存器r4-r12的数值压入当前任务栈，执行⑷把寄存器d8-d15的数值压入当前任务栈，r0为任务栈指针。 
⑸处指令把g_oldTask指针地址加载到r5寄存器，然后下一条指令把g_oldTask指针指向的内存地址值加载到寄存器r1，然后使用寄存器r0数值更新g_oldTask任务的栈指针。 
⑹处指令把g_runTask指针地址加载到r0寄存器，然后下一条指令把g_runTask指针指向的内存地址值加载到寄存器r0。此时，r5为上一个任务g_oldTask的指针地址，执行⑺处指令后，g_oldTask、g_runTask都指向新任务。 
执行⑻处指令把g_runTask指针指向的内存地址值加载到寄存器r1，此时r1寄存器为新任务g_runTask的栈指针。⑼处指令把新任务栈中的数据加载到寄存器d8-d15寄存器，继续执行后续指令继续加载数据到r4-r12寄存器，然后执行⑽处指令更新psp任务栈指针。⑾处指令恢复中断状态，然后执行跳转指令，后续继续执行C代码VOID OsTaskEntry(UINT32 taskId)进入任务执行入口函数。 
 
  ```java 
  .type osPendSV, %function
.global osPendSV
osPendSV:
    .fnstart
    .cantunwind
⑴  mrs     r12, PRIMASK
    cpsid   I

TaskSwitch:
⑵   mrs     r0, psp

#if defined(LOSCFG_ARCH_CORTEX_M0)
    subs    r0, #36
    stmia   r0!, {r4-r7}
    mov     r3, r8
    mov     r4, r9
    mov     r5, r10
    mov     r6, r11
    mov     r7, r12
    stmia   r0!, {r3 - r7}

    subs    r0, #36
#else
⑶   stmfd   r0!, {r4-r12}
#if !defined(LOSCFG_ARCH_CORTEX_M3)
⑷   vstmdb  r0!, {d8-d15}
#endif
#endif
⑸  ldr     r5, =g_oldTask
    ldr     r1, [r5]
    str     r0, [r1]

⑹  ldr     r0, =g_runTask
    ldr     r0, [r0]
    /* g_oldTask = g_runTask */
⑺  str     r0, [r5]
⑻  ldr     r1, [r0]

#if !defined(LOSCFG_ARCH_CORTEX_M3) && !defined(LOSCFG_ARCH_CORTEX_M0)
⑼  vldmia  r1!, {d8-d15}
#endif
#if defined(LOSCFG_ARCH_CORTEX_M0)
    adds    r1,   #16
    ldmfd   r1!, {r3-r7}

    mov     r8, r3
    mov     r9, r4
    mov     r10, r5
    mov     r11, r6
    mov     r12, r7
    subs    r1,  #36
    ldmfd   r1!, {r4-r7}

    adds    r1,   #20
#else
    ldmfd   r1!, {r4-r12}
#endif
⑽  msr     psp,  r1

⑾  msr     PRIMASK, r12
    bx      lr
    .fnend
  ```  
 
 
##### 3.4 开关中断汇编函数 
分析中断源代码的时候，提到过开关中断函数UINT32 LOS_IntLock(VOID)、UINT32 LOS_IntUnLock(VOID)、VOID LOS_IntRestore(UINT32 intSave)调用了汇编函数，这些汇编函数分别是本文要分析的ArchIntLock、ArchIntUnlock、ArchIntRestore。我们看下这些汇编代码，PRIMASK寄存器是单一bit的寄存器，置为1后，就关掉所有可屏蔽异常，只剩下NMI和硬Fault异常可以响应。默认值是0，表示没有关闭中断。汇编指令cpsid I会设置PRIMASK=1，关闭中断，指令cpsie I设置PRIMASK=0，开启中断。 
⑴处ArchIntLock函数把寄存器PRIMASK数值返回并关闭中断。⑵处ArchIntUnlock函数把寄存器PRIMASK数值返回并开启中断。两个函数的返回结果可以传递给⑶处ArchIntRestore函数，把寄存器状态数值写入寄存器PRIMASK，用于恢复之前的中断状态。不管是ArchIntLock还是ArchIntUnlock，都可以和ArchIntRestore配对使用。 
 
  ```java 
      .type ArchIntLock, %function
    .global ArchIntLock
⑴  ArchIntLock:
        .fnstart
        .cantunwind
        mrs     r0, PRIMASK
        cpsid   I
        bx      lr
        .fnend

    .type ArchIntUnlock, %function
    .global ArchIntUnlock
⑵  ArchIntUnlock:
        .fnstart
        .cantunwind
        mrs     r0, PRIMASK
        cpsie   I
        bx      lr
        .fnend

    .type ArchIntRestore, %function
    .global ArchIntRestore
⑶  ArchIntRestore:
        .fnstart
        .cantunwind
        msr     PRIMASK, r0
        bx      lr
        .fnend
  ```  
 
 
#### 小结 
本文带领大家一起剖析了LiteOS调度模块的源代码，包含调用接口及底层的汇编函数实现。感谢阅读，如有任何问题、建议， 都可以留言给我们： https://gitee.com/LiteOS/LiteOS/issues 。 
点击关注，第一时间了解华为云新鲜技术~
                                        