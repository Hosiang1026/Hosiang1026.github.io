---
title: 推荐系列-一文带你剖析LiteOS互斥锁Mutex源代码
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 1543
cover_picture: ''
abbrlink: 8d6fcc2d
date: 2021-04-15 09:26:24
---

&emsp;&emsp;摘要：多���务环境下会存在多个任务访问同一公共资源的场景，而有些公共资源是非共享的临界资源，只能被独占使用。LiteOS使用互斥锁来避免这种冲突，互斥锁是一种特殊的二值性信号量，用于实现...
<!-- more -->

                                                                                                                                                                                         
本文分享自华为云社区《LiteOS内核源码分析系列七 互斥锁Mutex》，原文作者：zhushy。 
多任务环境下会存在多个任务访问同一公共资源的场景，而有些公共资源是非共享的临界资源，只能被独占使用。LiteOS使用互斥锁来避免这种冲突，互斥锁是一种特殊的二值性信号量，用于实现对临界资源的独占式处理。另外，互斥锁可以解决信号量存在的优先级翻转问题。用互斥锁处理临界资源的同步访问时，如果有任务访问该资源，则互斥锁为加锁状态。此时其他任务如果想访问这个临界资源则会被阻塞，直到互斥锁被持有该锁的任务释放后，其他任务才能重新访问该公共资源，此时互斥锁再次上锁，如此确保同一时刻只有一个任务正在访问这个临界资源，保证了临界资源操作的完整性。 
本文我们来一起学习下LiteOS互斥锁模块的源代码，文中所涉及的源代码， 均可以在 
 ```java 
  LiteOS
  ``` 
 开源站点https://gitee.com/LiteOS/LiteOS 获取。互斥锁源代码、开发文档，示例程序代码如下： 
 
 LiteOS内核互斥锁源代码 
 
包括互斥锁的私有头文件kernel\base\include\los_mux_pri.h、头文件kernel\include\los_mux.h、C源代码文件kernel\base\los_mux.c。 
 
 开发指南文档–互斥锁 
 
在线文档https://gitee.com/LiteOS/LiteOS/blob/master/doc/LiteOS_Kernel_Developer_Guide.md#%E4%BA%92%E6%96%A5%E9%94%81。 
接下来，我们看下互斥锁的结构体，互斥锁初始化，互斥锁常用操作的源代码。 
 
#### 1、互斥锁结构体定义和常用宏定义 
 
##### 1.1 互斥锁结构体定义 
在文件kernel\base\include\los_mux_pri.h定义的互斥锁控制块结构体有2个，MuxBaseCB和LosMuxCB，前者和后者的前三个成员一样，可以和pthread_mutex_t共享内核互斥锁机制。结构体源代码如下，结构体成员的解释见注释部分。 
 
  
 ```java 
  typedef struct {
    LOS_DL_LIST muxList; /**< 互斥锁双向链表 */
    LosTaskCB *owner; /**< 当前持有锁的任务 */
    UINT16 muxCount; /**< 锁被持有的次数*/
} MuxBaseCB;

typedef struct {
    LOS_DL_LIST muxList; /**< 互斥锁双向链表 */
    LosTaskCB *owner; /**< 当前持有锁的任务 */
    UINT16 muxCount; /**< 锁被持有的次数*/
    UINT8 muxStat; /**< 互斥锁状态： OS_MUX_UNUSED, OS_MUX_USED */
    UINT32 muxId; /**< 互斥锁Id */
} LosMuxCB;
  ``` 
  
 
 
##### 1.2 互斥锁常用宏定义 
系统支持创建多少互斥锁是根据开发板情况使用宏LOSCFG_BASE_IPC_MUX_LIMIT定义的，互斥锁Id是UINT32类型的，由2部分组成：count和muxId，分别处于高16位和低16位。创建互斥锁，使用后删除时，互斥锁回收到互斥锁池时，互斥锁Id的高16位即count值会加1，这样可以用来表示该互斥锁被创建删除的次数。muxId取值为[0,LOSCFG_BASE_IPC_MUX_LIMIT)，表示互斥锁池中各个的互斥锁的编号。 
⑴处的宏用来分割count和muxId的位数，⑵处互斥锁被删除时更新互斥锁Id，可以看出高16位为count和低16位为muxId。⑶处获取互斥锁Id的低16位。⑷根据互斥锁Id获取对应的互斥锁被创建删除的次数count。⑸处从互斥锁池中获取指定互斥锁Id对应的互斥锁控制块。 
 
  
 ```java 
  ⑴    #define MUX_SPLIT_BIT 16

⑵    #define SET_MUX_ID(count, muxId)    (((count) << MUX_SPLIT_BIT) | (muxId))

⑶    #define GET_MUX_INDEX(muxId)        ((muxId) & ((1U << MUX_SPLIT_BIT) - 1))

⑷    #define GET_MUX_COUNT(muxId)        ((muxId) >> MUX_SPLIT_BIT)

⑸    #define GET_MUX(muxId)              (((LosMuxCB *)g_allMux) + GET_MUX_INDEX(muxId))
  ``` 
  
 
 
#### 2、互斥锁初始化 
互斥锁在内核中默认开启，用户可以通过宏LOSCFG_BASE_IPC_MUX进行关闭。开启互斥锁的情况下，在系统启动时，在kernel\init\los_init.c中调用OsMuxInit()进行互斥锁模块初始化。 
下面，我们分析下互斥锁初始化的代码。 
⑴初始化双向循环链表g_unusedMuxList，维护未使用的互斥锁。⑵为互斥锁申请内存，如果申请失败，则返回错误LOS_ERRNO_MUX_NO_MEMORY ⑶循环每一个互斥锁进行初始化，为每一个互斥锁节点指定索引muxId，owner为空，muxStat为未使用OS_MUX_UNUSED，并把互斥锁节点插入未使用互斥锁双向链表g_unusedMuxList。 ⑷如果开启了互斥锁调测开关，则调用函数UINT32 OsMuxDbgInit(VOID)进行初始化。 
 
  
 ```java 
  LITE_OS_SEC_TEXT UINT32 OsMuxInit(VOID)
{
    LosMuxCB *muxNode = NULL;
    UINT32 index;

⑴  LOS_ListInit(&g_unusedMuxList);
⑵  g_allMux = (LosMuxCB *)LOS_MemAlloc(m_aucSysMem0, (LOSCFG_BASE_IPC_MUX_LIMIT * sizeof(LosMuxCB)));
    if (g_allMux == NULL) {
        return LOS_ERRNO_MUX_NO_MEMORY;
    }

⑶  for (index = 0; index < LOSCFG_BASE_IPC_MUX_LIMIT; index++) {
        muxNode = g_allMux + index;
        muxNode->muxId = index;
        muxNode->owner = NULL;
        muxNode->muxStat = OS_MUX_UNUSED;
        LOS_ListTailInsert(&g_unusedMuxList, &muxNode->muxList);
    }

⑷  if (OsMuxDbgInitHook() != LOS_OK) {
        return LOS_ERRNO_MUX_NO_MEMORY;
    }
    return LOS_OK;
}
  ``` 
  
 
 
#### 3、互斥锁常用操作 
 
##### 3.1 互斥锁创建 
我们可以使用函数UINT32 LOS_MuxCreate(UINT32 *muxHandle)来创建互斥锁，下面通过分析源码看看如何创建互斥锁的。 
⑴判断g_unusedMuxList是否为空，还有可以使用的互斥锁资源？如果没有可以使用的互斥锁，调用函数OsMutexCheckHook()判断是否有互斥锁溢出等错误，这个函数需要开启调测开关。⑵处如果g_unusedMuxList不为空，则获取第一个可用的互斥锁节点，接着从双向链表g_unusedMuxList中删除，然后调用LOS_DL_LIST_ENTRY(unusedMux, LosMuxCB, muxList)获取LosMuxCB *muxCreated，初始化创建的互斥锁信息，包含持有锁的次���、状态、持有者等信息。⑶初始化双向链表&muxCreated->muxList，阻塞在这个互斥上的任务会挂在这个链表上。⑷赋值给输出参数*muxHandle，后续程序使用这个互斥锁Id对互斥锁进行其他操作。⑸开启调测时，会调用函数OsMuxDbgUpdateHook()更新互斥锁的使用情况。 
 
  
 ```java 
  LITE_OS_SEC_TEXT UINT32 LOS_MuxCreate(UINT32 *muxHandle)
{
    UINT32 intSave;
    LosMuxCB *muxCreated = NULL;
    LOS_DL_LIST *unusedMux = NULL;
    UINT32 errNo;
    UINT32 errLine;

    if (muxHandle == NULL) {
        return LOS_ERRNO_MUX_PTR_NULL;
    }

    SCHEDULER_LOCK(intSave);
⑴  if (LOS_ListEmpty(&g_unusedMuxList)) {
        SCHEDULER_UNLOCK(intSave);
        OsMutexCheckHook();
        OS_GOTO_ERR_HANDLER(LOS_ERRNO_MUX_ALL_BUSY);
    }

⑵  unusedMux = LOS_DL_LIST_FIRST(&g_unusedMuxList);
    LOS_ListDelete(unusedMux);
    muxCreated = LOS_DL_LIST_ENTRY(unusedMux, LosMuxCB, muxList);
    muxCreated->muxCount = 0;
    muxCreated->muxStat = OS_MUX_USED;
    muxCreated->owner = NULL;
⑶  LOS_ListInit(&muxCreated->muxList);
    *muxHandle = muxCreated->muxId;

⑸  OsMuxDbgUpdateHook(muxCreated->muxId, OsCurrTaskGet()->taskEntry);

    SCHEDULER_UNLOCK(intSave);

    LOS_TRACE(MUX_CREATE, muxCreated->muxId);
    return LOS_OK;

ERR_HANDLER:
    OS_RETURN_ERROR_P2(errLine, errNo);
}
  ``` 
  
 
 
##### 3.2 互斥锁删除 
我们可以使用函数LOS_MuxDelete(UINT32 muxHandle)来删除互斥锁，下面通过分析源码看看如何删除互斥锁的。 
⑴处判断互斥锁handleId是否超过LOSCFG_BASE_IPC_MUX_LIMIT，如果超过则返回错误码。⑵获取互斥锁控制块LosMuxCB *muxDeleted。⑶如果要删除的互斥锁Id有问题，或者要删除的互斥锁处于未使用状态，跳转到错误标签进行处理。⑷如果互斥锁的持有者数量不为空，不允许删除，跳转到错误标签进行处理。⑸把删除的互斥锁回收到未使用互斥锁双向链表g_unusedMuxList，然后更新为未使用状态，更新互斥锁Id。⑹开启调测时，会调用函数OsMuxDbgUpdateHook()更新互斥锁的使用情况。 
 
  
 ```java 
  LITE_OS_SEC_TEXT UINT32 LOS_MuxDelete(UINT32 muxHandle)
{
    UINT32 intSave;
    LosMuxCB *muxDeleted = NULL;
    UINT32 errNo;
    UINT32 errLine;

⑴  if (GET_MUX_INDEX(muxHandle) >= (UINT32)LOSCFG_BASE_IPC_MUX_LIMIT) {
        OS_GOTO_ERR_HANDLER(LOS_ERRNO_MUX_INVALID);
    }

⑵  muxDeleted = GET_MUX(muxHandle);

    LOS_TRACE(MUX_DELETE, muxHandle, muxDeleted->muxStat, muxDeleted->muxCount,
        ((muxDeleted->owner == NULL) ? 0xFFFFFFFF : muxDeleted->owner->taskId));

    SCHEDULER_LOCK(intSave);
⑶  if ((muxDeleted->muxId != muxHandle) || (muxDeleted->muxStat == OS_MUX_UNUSED)) {
        SCHEDULER_UNLOCK(intSave);
        OS_GOTO_ERR_HANDLER(LOS_ERRNO_MUX_INVALID);
    }

⑷  if (!LOS_ListEmpty(&muxDeleted->muxList) || muxDeleted->muxCount) {
        SCHEDULER_UNLOCK(intSave);
        OS_GOTO_ERR_HANDLER(LOS_ERRNO_MUX_PENDED);
    }

⑸  LOS_ListTailInsert(&g_unusedMuxList, &muxDeleted->muxList);
    muxDeleted->muxStat = OS_MUX_UNUSED;
    muxDeleted->muxId = SET_MUX_ID(GET_MUX_COUNT(muxDeleted->muxId) + 1, GET_MUX_INDEX(muxDeleted->muxId));

⑹  OsMuxDbgUpdateHook(muxDeleted->muxId, NULL);

    SCHEDULER_UNLOCK(intSave);

    return LOS_OK;

ERR_HANDLER:
    OS_RETURN_ERROR_P2(errLine, errNo);
}
  ``` 
  
 
 
##### 3.3 互斥锁申请 
我们可以使用函数UINT32 LOS_MuxPend(UINT32 muxHandle, UINT32 timeout)来请求互斥锁，需要的2个参数分别是互斥锁Id和等待时间timeout，单位Tick，取值范围为[0, LOS_WAIT_FOREVER]。 
下面通过分析源码看看如何请求互斥锁的。 
申请互斥锁时首先会进行互斥锁Id、参数的合法性校验，这些比较简单。⑴处代码判断申请互斥锁的是否系统任务，如果是系统任务输出警告信息。⑵如果互斥锁没有被持有，更新互斥锁的持有次数和持有者信息，完成互斥锁的申请。⑶处如果互斥锁的持有次数不为0，并且被当前任务持有，可以持有次数加1，再次嵌套持有，完成互斥锁的申请。⑷如果等待时间为0，申请失败返回。⑸如果当前锁任务调度，不允许申请互斥锁，打印回溯栈并返回错误码。 
能运行到⑹处，表示互斥锁已被其他任务持有。在当前申请互斥锁的任务优先级高于持有互斥锁的任务优先级时，修改持有互斥锁的优先级为当前任务的优先级，持有锁的任务优先级备份到成员变量muxPended->owner->priBitMap。通过这样的修改，可以避免优先级翻转。⑺处的函数OsMuxPendOp()下文继续分析。 
 
  
 ```java 
  LITE_OS_SEC_TEXT UINT32 LOS_MuxPend(UINT32 muxHandle, UINT32 timeout)
{
    UINT32 ret;
    UINT32 intSave;
    LosMuxCB *muxPended = NULL;
    LosTaskCB *runTask = NULL;

    if (GET_MUX_INDEX(muxHandle) >= (UINT32)LOSCFG_BASE_IPC_MUX_LIMIT) {
        OS_RETURN_ERROR(LOS_ERRNO_MUX_INVALID);
    }

    muxPended = GET_MUX(muxHandle);

    LOS_TRACE(MUX_PEND, muxHandle, muxPended->muxCount,
        ((muxPended->owner == NULL) ? 0xFFFFFFFF : muxPended->owner->taskId), timeout);

    SCHEDULER_LOCK(intSave);

    ret = OsMuxParaCheck(muxPended, muxHandle);
    if (ret != LOS_OK) {
        goto OUT_UNLOCK;
    }

    runTask = OsCurrTaskGet();
⑴  if (runTask->taskFlags & OS_TASK_FLAG_SYSTEM) {
        PRINT_DEBUG("Warning: DO NOT recommend to use %s in system tasks.\n", __FUNCTION__);
    }

⑵  if (muxPended->muxCount == 0) {
        OsMuxDlockNodeInsertHook(runTask->taskId, muxPended);
        muxPended->muxCount++;
        muxPended->owner = runTask;
        goto OUT_UNLOCK;
    }

⑶  if (muxPended->owner == runTask) {
        muxPended->muxCount++;
        goto OUT_UNLOCK;
    }

⑷  if (!timeout) {
        ret = LOS_ERRNO_MUX_UNAVAILABLE;
        goto OUT_UNLOCK;
    }

⑸  if (!OsPreemptableInSched()) {
        ret = LOS_ERRNO_MUX_PEND_IN_LOCK;
        PRINT_ERR("!!!LOS_ERRNO_MUX_PEND_IN_LOCK!!!\n");
        OsBackTrace();
        goto OUT_UNLOCK;
    }

⑹  OsMuxBitmapSet(runTask, (MuxBaseCB *)muxPended);
⑺  ret = OsMuxPendOp(runTask, (MuxBaseCB *)muxPended, timeout, &intSave);

OUT_UNLOCK:
    SCHEDULER_UNLOCK(intSave);
    return ret;
}
  ``` 
  
 
接下来继续分析函数OsMuxPendOp()，⑴处设置申请互斥锁的任务的结构体成员变量runTask->taskMux为申请的互斥锁。⑵处获取互斥锁的双向链表，阻塞在请求这个互斥锁的任务都挂在这个链表上，后文详细分析这个函数。⑶处把申请互斥锁的任务改为非就绪状态、阻塞状态，插入到互斥锁的阻塞任务列表里。如果是非永久等待互斥锁，还需要把任务加入超时排序链表里。⑷触发任务调度，后续程序暂时不再执行，需要等到可以获取互斥锁或者时间超时。 
如果时间超时或者申请到互斥锁，系统重新调度到执行此任务，程序从⑸处继续执行。如果是时间超时，⑹处更新任务状态并返回码，申请互斥锁失败。⑺如果成功申请到互斥锁，并且超时时间不等于LOS_WAIT_FOREVER，需要判断是否恢复任务优先级。 
 
  
 ```java 
  LITE_OS_SEC_TEXT UINT32 OsMuxPendOp(LosTaskCB *runTask, MuxBaseCB *muxPended, UINT32 timeout,
                                    UINT32 *intSave)
{
    LOS_DL_LIST *node = NULL;
    UINT32 ret = LOS_OK;
    LosTaskCB *owner = muxPended->owner;

⑴  runTask->taskMux = (VOID *)muxPended;
⑵  node = OsMuxPendFindPos(runTask, muxPended);
⑶  OsTaskWait(node, OS_TASK_STATUS_PEND, timeout);
⑷  OsSchedResched();
    SCHEDULER_UNLOCK(*intSave);
⑸  SCHEDULER_LOCK(*intSave);

⑹  if (runTask->taskStatus & OS_TASK_STATUS_TIMEOUT) {
        runTask->taskStatus &= ~OS_TASK_STATUS_TIMEOUT;
        ret = LOS_ERRNO_MUX_TIMEOUT;
    }

⑺  if (timeout != LOS_WAIT_FOREVER) {
        OsMuxBitmapRestore(runTask, owner);
    }

    return ret;
}
  ``` 
  
 
接下来，分析下内部函数OsMuxPendFindPos()。LiteOS互斥锁支持2种等待模式，可以通过宏来配置： 
 
 LOSCFG_MUTEX_WAITMODE_PRIO 
 
互斥锁基于任务优先级的等待模式，阻塞在互斥锁的任务里，谁的优先级高，在互斥锁释放时，谁先获取到互斥锁。 
 
 LOSCFG_MUTEX_WAITMODE_FIFO 
 
互斥锁基于FIFO的等待模式，阻塞在互斥锁的任务里，谁先进入阻塞队列，在互斥锁释放时，谁先获取到互斥锁。 
在开启宏LOSCFG_MUTEX_WAITMODE_FIFO，互斥锁基于FIFO的等待模式时，函数OsMuxPendFindPos()的源码比较简单，直接获取互斥锁的阻塞链表，在后续的OsTaskWait()函数里，会把任务挂在在获取的阻塞链表的尾部。代码如下： 
 
  
 ```java 
  LITE_OS_SEC_TEXT STATIC LOS_DL_LIST *OsMuxPendFindPos(const LosTaskCB *runTask, MuxBaseCB *muxPended)
{
    LOS_DL_LIST *node = NULL;
    node = &muxPended->muxList;
    return node;
}
  ``` 
  
 
我们再来看看开启宏LOSCFG_MUTEX_WAITMODE_PRIO，互斥锁基于任务优先级的等待模式时的函数的代码。⑴如果互斥锁的阻塞链表为空，直接返回链表即可。⑵阻塞链表不为空时，从链表中获取第一个和最后一个链表节点，分别为pendedTask1和pendedTask2。⑶如果阻塞链表第一个任务的优先级低于当前任务的优先级，链表中所有的任务的优先级都会低，返回互斥锁的阻塞链表的第一个节点接口。⑷如果阻塞链表的最后一个任务的优先级大于当前任务的优先级，返回互斥锁阻塞链表的头结点即可。⑸对于其他情况，需要调用函数OsMuxPendFindPosSub()进行处理。 
 
  
 ```java 
  LITE_OS_SEC_TEXT STATIC LOS_DL_LIST *OsMuxPendFindPos(const LosTaskCB *runTask, MuxBaseCB *muxPended)
{
    LOS_DL_LIST *node = NULL;
    LosTaskCB *pendedTask1 = NULL;
    LosTaskCB *pendedTask2 = NULL;

⑴  if (LOS_ListEmpty(&muxPended->muxList)) {
        node = &muxPended->muxList;
    } else {
⑵      pendedTask1 = OS_TCB_FROM_PENDLIST(LOS_DL_LIST_FIRST(&muxPended->muxList));
        pendedTask2 = OS_TCB_FROM_PENDLIST(LOS_DL_LIST_LAST(&muxPended->muxList));
⑶      if ((pendedTask1 != NULL) && (pendedTask1->priority > runTask->priority)) {
            node = muxPended->muxList.pstNext;
⑷      } else if ((pendedTask2 != NULL) && (pendedTask2->priority <= runTask->priority)) {
            node = &muxPended->muxList;
        } else {
⑸          node = OsMuxPendFindPosSub(runTask, muxPended);
        }
    }
    return node;
}
  ``` 
  
 
继续分析下函数OsMuxPendFindPosSub()。⑴循环遍历互斥锁阻塞链表，⑵如果链表上任务优先级大于当前任务的优先级，则继续遍历。⑶如果链表上任务优先级小于当前任务的优先级，不需要继续遍历了，返回链表的当前节点。⑷如果优先级相等，返回链表的下一个节点。 
 
  
 ```java 
  LITE_OS_SEC_TEXT STATIC LOS_DL_LIST *OsMuxPendFindPosSub(const LosTaskCB *runTask, const MuxBaseCB *muxPended)
{
    LosTaskCB *pendedTask = NULL;
    LOS_DL_LIST *node = NULL;

⑴  LOS_DL_LIST_FOR_EACH_ENTRY(pendedTask, &(muxPended->muxList), LosTaskCB, pendList) {
⑵      if (pendedTask->priority < runTask->priority) {
            continue;
⑶      } else if (pendedTask->priority > runTask->priority) {
            node = &pendedTask->pendList;
            break;
        } else {
⑷          node = pendedTask->pendList.pstNext;
            break;
        }
    }

    return node;
}
  ``` 
  
 
 
##### 3.4 互斥锁释放 
我们可以使用函数UINT32 LOS_MuxPost(UINT32 muxHandle)来释放互斥锁，下面通过分析源码看看如何释放互斥锁的。 
释放互斥锁时首先会进行互斥锁Id、参数的合法性校验，这些比较简单，自行阅读即可。⑴处如果要释放的互斥锁没有被持有、或者不是被当前任务持有，返回错误码。⑵互斥锁的持有数量减1，如果不为0，当前任务嵌套持有该互斥锁，不需要调度，返回释放互斥锁成功。如果释放一次后，当前任务不再持有互斥锁，则调用⑶处函数OsMuxPostOp()，判断是否有任务阻塞在该互斥锁，是否需要触发任务调度等，下文分析该函数。执行完毕⑶后，执行⑷，如果需要调度则触发任务调度。 
 
  
 ```java 
  LITE_OS_SEC_TEXT UINT32 LOS_MuxPost(UINT32 muxHandle)
{
    UINT32 ret;
    LosTaskCB *runTask = NULL;
    LosMuxCB *muxPosted = GET_MUX(muxHandle);
    UINT32 intSave;

    if (GET_MUX_INDEX(muxHandle) >= (UINT32)LOSCFG_BASE_IPC_MUX_LIMIT) {
        OS_RETURN_ERROR(LOS_ERRNO_MUX_INVALID);
    }

    LOS_TRACE(MUX_POST, muxHandle, muxPosted->muxCount,
        ((muxPosted->owner == NULL) ? 0xFFFFFFFF : muxPosted->owner->taskId));

    SCHEDULER_LOCK(intSave);

    ret = OsMuxParaCheck(muxPosted, muxHandle);
    if (ret != LOS_OK) {
        SCHEDULER_UNLOCK(intSave);
        return ret;
    }

    runTask = OsCurrTaskGet();
⑴  if ((muxPosted->muxCount == 0) || (muxPosted->owner != runTask)) {
        SCHEDULER_UNLOCK(intSave);
        OS_RETURN_ERROR(LOS_ERRNO_MUX_INVALID);
    }

⑵  if (--muxPosted->muxCount != 0) {
        SCHEDULER_UNLOCK(intSave);
        return LOS_OK;
    }

⑶  ret = OsMuxPostOp(runTask, (MuxBaseCB *)muxPosted);
    SCHEDULER_UNLOCK(intSave);
⑷  if (ret == MUX_SCHEDULE) {
        LOS_MpSchedule(OS_MP_CPU_ALL);
        LOS_Schedule();
    }

    return LOS_OK;
}
  ``` 
  
 
我们继续分析函数OsMuxPostOp()。⑴处如果等到该互斥锁的任务列表为空，则标记没有任务持有该互斥锁，并返回不需要调度。⑵获取等待互斥锁的第一个任务resumedTask。如果开启宏LOSCFG_MUTEX_WAITMODE_PRIO，如果等待互斥锁的任务resumedTask的优先级比当前优先级低，需要恢复当前任务的优先级。如果当前任务优先级runTask->priBitMap不为0，会调用⑷处的OsMuxPostOpSub函数，稍后分析该函数。 
⑸处把该互斥锁的持有数量设置为1，持有人设置为等待互斥锁的第一个任务resumedTask，resumedTask持有了互斥锁不再阻塞在该互斥锁resumedTask->taskMux = NULL。然后2个语句，属于调测特性的。⑹处调用OsTaskWake()函数，把resumedTask从��斥锁的阻塞链表中删除，从定时器排序链表中删除。更新任务状态，加入就绪队列，返回任务需要调度。 
 
  
 ```java 
  LITE_OS_SEC_TEXT UINT32 OsMuxPostOp(LosTaskCB *runTask, MuxBaseCB *muxPosted)
{
    LosTaskCB *resumedTask = NULL;

⑴  if (LOS_ListEmpty(&muxPosted->muxList)) {
        muxPosted->owner = NULL;
        OsMuxDlockNodeDeleteHook(runTask->taskId, muxPosted);
        return MUX_NO_SCHEDULE;
    }

⑵  resumedTask = OS_TCB_FROM_PENDLIST(LOS_DL_LIST_FIRST(&(muxPosted->muxList)));
#ifdef LOSCFG_MUTEX_WAITMODE_PRIO
⑶  if (resumedTask->priority > runTask->priority) {
        if (LOS_HighBitGet(runTask->priBitMap) != resumedTask->priority) {
            LOS_BitmapClr(&runTask->priBitMap, resumedTask->priority);
        }
    } else if (runTask->priBitMap != 0) {
⑷      OsMuxPostOpSub(runTask, muxPosted);
    }
#else
    if (runTask->priBitMap != 0) {
⑷      OsMuxPostOpSub(runTask, muxPosted);
    }
#endif

⑸  muxPosted->muxCount = 1;
    muxPosted->owner = resumedTask;
    resumedTask->taskMux = NULL;
    OsMuxDlockNodeDeleteHook(runTask->taskId, muxPosted);
    OsMuxDlockNodeInsertHook(resumedTask->taskId, muxPosted);

⑹  OsTaskWake(resumedTask, OS_TASK_STATUS_PEND);

    return MUX_SCHEDULE;
}
  ``` 
  
 
最后，我们分析函数OsMuxPostOpSub()。 
⑴如果互斥锁上还有其他任务阻塞着，获取当前运行任务记录的优先级.priBitMap。⑵处循环遍历挂在互斥锁阻塞链表上的每一个任务，如果阻塞任务的优先级不等于bitMapPri，则执行⑶清理优先级位。⑷处恢复当前持有互斥锁的任务的优先级。 
 
  
 ```java 
  LITE_OS_SEC_TEXT STATIC VOID OsMuxPostOpSub(LosTaskCB *runTask, MuxBaseCB *muxPosted)
{
    LosTaskCB *pendedTask = NULL;
    UINT16 bitMapPri;

⑴  if (!LOS_ListEmpty(&muxPosted->muxList)) {
        bitMapPri = LOS_HighBitGet(runTask->priBitMap);
⑵      LOS_DL_LIST_FOR_EACH_ENTRY(pendedTask, (&muxPosted->muxList), LosTaskCB, pendList) {
            if (bitMapPri != pendedTask->priority) {
⑶              LOS_BitmapClr(&runTask->priBitMap, pendedTask->priority);
            }
        }
    }
⑷  bitMapPri = LOS_LowBitGet(runTask->priBitMap);
    LOS_BitmapClr(&runTask->priBitMap, bitMapPri);
    OsTaskPriModify(muxPosted->owner, bitMapPri);
}
  ``` 
  
 
 
#### 小结 
本文带领大家一起剖析了LiteOS互斥锁模块的源代码，包含互斥锁的结构体、互斥锁池初始化、互斥锁创建删除、申请释放等。 
  
点击关注，第一时间了解华为云新鲜技术~
                                        