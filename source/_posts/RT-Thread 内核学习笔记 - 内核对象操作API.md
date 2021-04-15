---
title: 推荐系列-RT-Thread 内核学习笔记 - 内核对象操作API
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 817
cover_picture: 'https://oss-club.rt-thread.org/uploads/20210124/b807950824783f507017e4891c5dab82.png'
abbrlink: cc1defba
date: 2021-04-15 09:08:53
---

&emsp;&emsp;RT-Thread 内核学习笔记 - 内核对象rt_object RT-Thread 内核学习笔记 - 内核对象管理 RT-Thread 内核学习笔记 - 内核对象操作API RT-Thread 内核学习笔记 - 内核对象初始化链表组织方式 RT...
<!-- more -->

                                                                                                                                                                                        RT-Thread 内核学习笔记 - 内核对象rt_object 
RT-Thread 内核学习笔记 - 内核对象管理 
RT-Thread 内核学习笔记 - 内核对象操作API 
RT-Thread 内核学习笔记 - 内核对象初始化链表组织方式 
RT-Thread 内核学习笔记 - 内核对象链表结构深入理解 
RT-Thread 内核学习笔记 - 设备模型rt_device的理解 
RT-Thread 内核学习笔记 - 理解defunct僵尸线程 
 
#### 背景 
 
 目的还是学习并熟悉RT-Thread 操作系统。 
 从最简单的对象管理切入 
 了解操作系统最基本的组成单位：Object 
 
 
#### 内核对象API 
内核对象的主要操作方法：内核文件：object.c中实现 
![Test](https://oss-club.rt-thread.org/uploads/20210124/b807950824783f507017e4891c5dab82.png RT-Thread 内核学习笔记 - 内核对象操作API) 
 
#### 知识点 
查看内核文件：object.c，发现的主要的几个知识点 
![Test](https://oss-club.rt-thread.org/uploads/20210124/b807950824783f507017e4891c5dab82.png RT-Thread 内核学习笔记 - 内核对象操作API) 
 
#### 验证与测试 
 
 光看内核代码，不如敲一敲（抄一下）。 
 可以使用模拟器，写几个测试函数，看看对象操作的流程。 
 
测试用例如下： 
 ```java 
  /* RT-Thread 内核对象学习 */
#include <rtthread.h>

struct _obj_type
{
    enum rt_object_class_type type;
    const char* name;
};

/* 静态的对象定义 */
static struct rt_object _obj[] = { 0 };

/* 测试用，线程对象 */
static const struct _obj_type _obj_tbl[] =
{
    { RT_Object_Class_Thread, "th_01" },
    { RT_Object_Class_Thread, "th_02" },
    { RT_Object_Class_Thread, "th_03" },
    { RT_Object_Class_Thread, "th_04" },
    { RT_Object_Class_Thread, "th_05" },
};

#define OBJ_TEST_TBL_SIZE       (sizeof(_obj_tbl) / sizeof(_obj_tbl[0]))

/* 静态初始化对象 */
void obj_test_init(void)
{
    rt_uint8_t index = 0;
    rt_uint8_t obj_size = 0;

    for (index = 0; index < OBJ_TEST_TBL_SIZE; index++)
    {
        rt_object_init(&_obj[index], _obj_tbl[index].type, _obj_tbl[index].name);
    }
}

/* 动态创建对象 obj_test_create thread1 */
void obj_test_create(uint8_t argc, char** argv)
{
    struct rt_object* obj = RT_NULL;

    if (argc >= 2)
    {
        rt_kprintf(" obj_name=%s\n", argv[1]);
    }

    obj = rt_object_find(argv[1], RT_Object_Class_Thread);
    if (obj != RT_NULL)
    {
        rt_kprintf("obj_name=%s, exist!!\n", obj->name);
        return;
    }
    else
    {
        rt_object_allocate(RT_Object_Class_Thread, argv[1]);
        rt_kprintf("create obj_name=%s\n", argv[1]);
    }
}

/* 对象的打印 */
void obj_test_dump(void)
{
    rt_uint8_t index = 0;
    rt_uint8_t obj_size = 0;
    struct rt_object* obj_pointers[OBJ_TEST_TBL_SIZE + 10] = { 0 };

    obj_size = rt_object_get_pointers(RT_Object_Class_Thread, obj_pointers, sizeof(obj_pointers));
    rt_kprintf("object init : object size=%d\n", obj_size);

    rt_kprintf("| index |     name     |  flag  |  type  |\n");
    rt_kprintf("+-------+--------------+--------+--------+\n");
    for (index = 0; index < obj_size; index++)
    {
        if (obj_pointers[index] == RT_NULL)
        {
            break;
        }
        rt_kprintf("|  %03d  |  %10s  |   %02d   |  0x%02x  |\n", index,
            obj_pointers[index]->name, obj_pointers[index]->flag,
            obj_pointers[index]->type);
    }
    rt_kprintf("+-------+--------------+--------+--------+\n");
}

/* 查找线程对象 */
void obj_test_find(uint8_t argc, char** argv)
{
    struct rt_object* obj = RT_NULL;

    if (argc >= 2)
    {
        rt_kprintf(" obj_name=%s\n", argv[1]);
    }

    obj = rt_object_find(argv[1], RT_Object_Class_Thread);
    if (obj != RT_NULL)
    {
        rt_kprintf("find obj_name=%s\n", obj->name);
    }
    else
    {
        rt_kprintf("not find obj_name=%s\n", argv[1]);
    }
}

/* 静态对象 detach */
void obj_test_detach(uint8_t argc, char** argv)
{
    struct rt_object* obj = RT_NULL;

    if (argc >= 2)
    {
        rt_kprintf(" obj_name=%s\n", argv[1]);
    }

    obj = rt_object_find(argv[1], RT_Object_Class_Thread);
    if (obj != RT_NULL)
    {
        rt_kprintf("find obj_name=%s\n", obj->name);
        rt_object_detach(obj);
        rt_kprintf("detach obj_name=%s\n", obj->name);
    }
    else
    {
        rt_kprintf("not find obj_name=%s\n", argv[1]);
    }
}

/* 动态对象 delete */
void obj_test_delete(uint8_t argc, char** argv)
{
    struct rt_object* obj = RT_NULL;

    if (argc >= 2)
    {
        rt_kprintf(" obj_name=%s\n", argv[1]);
    }

    obj = rt_object_find(argv[1], RT_Object_Class_Thread);
    if (obj != RT_NULL)
    {
        rt_kprintf("find obj_name=%s\n", obj->name);
        rt_object_delete(obj);
        rt_kprintf("delete obj_name=%s\n", obj->name);
    }
    else
    {
        rt_kprintf("not find obj_name=%s\n", argv[1]);
    }
}

/* 导出命令 */
MSH_CMD_EXPORT(obj_test_init, object init test);
MSH_CMD_EXPORT(obj_test_create, obj create test);
MSH_CMD_EXPORT(obj_test_dump, object test dump);
MSH_CMD_EXPORT(obj_test_find, object test find);
MSH_CMD_EXPORT(obj_test_detach, object test detach);
MSH_CMD_EXPORT(obj_test_delete, object test del);
  ```  
 
#### 学习总结 
 
##### 总结一 
 
 发现：tshell 是动态创建的线程 
 发现：tidle 是静态的线程 
 
 ```java 
  msh />obj_test_dump
object init : object size=2
| index |     name     |  flag  |  type  |
+-------+--------------+--------+--------+
|  000  |      tshell  |   00   |  0x01  |
|  001  |      tidle0  |   00   |  0x81  |
+-------+--------------+--------+--------+
msh />
  ```  
 
##### 总结二 
 
 动态对象，创建后，内存占用增加。 
 动态对象，删除后，内存占用恢复 
 
 ```java 
  msh />free
total memory: 8388580
used memory : 5164  /* 【5164】 内存原有大小 */
maximum allocated memory: 7336
msh />
msh />obj
obj_test_init
obj_test_create
obj_test_dump
obj_test_find
obj_test_detach
obj_test_delete
msh />obj_test_cre
obj_test_create
msh />obj_test_create hello
 obj_name=hello
create obj_name=hello
msh />
msh />fre
free
msh />free
total memory: 8388580
used memory : 5304   /* 【5304】 内存占用 */
maximum allocated memory: 7336
msh />
msh />obj_test_delete hello
 obj_name=hello
find obj_name=hello
delete obj_name=hello
msh />free
total memory: 8388580
used memory : 5164  /* 【5304】，内存占用恢复 */
maximum allocated memory: 7336
msh />
  ```  
 
##### 总结三 
 
 静态初始化的对象，detach（剔除对象管理）后，内存占用不变。 
 
 ```java 
  msh />obj_test_init
msh />ob
obj_test_init
obj_test_create
obj_test_dump
obj_test_find
obj_test_detach
obj_test_delete
msh />obj_test_du
obj_test_dump
msh />obj_test_dump
object init : object size=7
| index |     name     |  flag  |  type  |
+-------+--------------+--------+--------+
|  000  |       th_05  |   00   |  0x81  |
|  001  |       th_04  |   00   |  0x81  |
|  002  |       th_03  |   00   |  0x81  |
|  003  |       th_02  |   00   |  0x81  |
|  004  |       th_01  |   00   |  0x81  |
|  005  |      tshell  |   00   |  0x01  |
|  006  |      tidle0  |   00   |  0x81  |
+-------+--------------+--------+--------+
msh />free
total memory: 8388580
used memory : 5164
maximum allocated memory: 7336
msh />
msh />obj
obj_test_init
obj_test_create
obj_test_dump
obj_test_find
obj_test_detach
obj_test_delete
msh />obj_test_deta
obj_test_detach
msh />obj_test_detach th_04
 obj_name=th_04
find obj_name=th_04
detach obj_name=th_04
msh />obj_test_du
obj_test_dump
msh />obj_test_dump
object init : object size=6
| index |     name     |  flag  |  type  |
+-------+--------------+--------+--------+
|  000  |       th_05  |   00   |  0x81  |
|  001  |       th_03  |   00   |  0x81  |
|  002  |       th_02  |   00   |  0x81  |
|  003  |       th_01  |   00   |  0x81  |
|  004  |      tshell  |   00   |  0x01  |
|  005  |      tidle0  |   00   |  0x81  |
+-------+--------------+--------+--------+
msh />
msh />free
total memory: 8388580
used memory : 5164
maximum allocated memory: 7336
  ```  
 
#### 总结 
 
 RT-Thread 内核对象的管理并不复杂 
 相关的知识点，如链表的初始化、插入、遍历、通过链表指针获取对象指针等比较的重要。 
 掌握好内核对象的基本操作，为后面学习派生对象如：线程对象、设备对象等，打下基础。 
 
原文链接：https://club.rt-thread.org/as...
                                        