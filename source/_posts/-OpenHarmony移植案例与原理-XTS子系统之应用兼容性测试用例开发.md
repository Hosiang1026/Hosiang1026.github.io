---
title: 推荐系列--OpenHarmony移植案例与原理-XTS子系统之应用兼容性测试用例开发
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 257
cover_picture: 'https://pic1.zhimg.com/80/v2-a7c44ac864a502f599f41ef3f9c7f2b4_720w.jpg'
abbrlink: e4eddc0d
date: 2022-03-27 11:53:55
---

&emsp;&emsp;：本文主要介绍ACTS应用兼容性测试用例开发编译。 本文分享自华为云社区《移植案例与原理 - XTS子系统之应用兼容性测试用例开发》，作者： zhushy 。 XTS（X Test Suite）子系统是OpenH...
<!-- more -->
 
本文分享自华为云社区《移植案例与原理 - XTS子系统之应用兼容性测试用例开发》，作者： zhushy 。 
XTS（X Test Suite）子系统是OpenHarmony生态认证测试套件的集合，当前包括： 
 
 acts（application compatibility test suite）应用兼容性测试套件，看护北向HAP兼容、OpenHarmony开发API兼容。 
 hats（Hardware Abstraction Test Suite ）硬件抽象测试套，看护HDI层接口。 
 dcts（Distributed Compatibility Test Suite ）分布式兼容性测试套，看护分布式兼容（待上线） 
 
在移植芯片开发板后，需要运行应用兼容性测试套件。对于大部分工程师，是不需要开发ACTS测试用例的。但是了解一下这些知识，在问题定位等会带来极大的方便。本文主要介绍下ACTS应用兼容性测试用例开发编译。使用的编程语言为C语言。 
 
#### 1、XTS测试套件目录 
XTS的ACTS应用兼容性测试套件目录test\xts\acts，器目录如下，包含各个子系统的测试用例源代码及测试工具代码。 
 
  
 ```java 
  /test/xts
├── acts                         # 测试代码存放目录
│   └── aafwk                    #  标准系统的 元能力框架子系统 测试用例源码存放目录
│   └── aafwk_lite               # 轻量系统、小型系统的 元能力框架 子系统测试用例源码存放目录
│   └── communication            #  标准系统的 communication子系统 测试用例源码存放目录
│   └── communication_lite       # 轻量系统、小型系统的 communication 子系统测试用例源码存放目录
|   └── .......                  # 其他子系统的测试用例源码存���目录
│   └── BUILD.gn                 # 标准系统测试用例编译配置
│   └── build_lite               # 轻量系统、小型系统测试用例编译配置存放目录
│       └── BUILD.gn             # 轻量系统、小型系统测试用例编译配置
└── tools                        # 测试工具代码存放目录
  ``` 
  
 
 
#### 2、测试用例级别、粒度和类型 
测试用例分为5个级别，分布为Level0、Level1、Level2、Level3、Level4，这几个宏定义在文件test\xts\tools\lite\hctest\include\hctest_internal.h。对这几个级别的解释可以从文章尾部的参考站点上可以了解。 
 
  
 ```java 
  /**
  * test case level
  */
enum TestRank {
    Level0 = 1,
    Level1 = 2,
    Level2 = 3,
    Level3 = 4,
    Level4 = 5
};
  ``` 
  
 
用例粒度分为LargeTest、MediumTest和SmallTest，同样在文件test\xts\tools\lite\hctest\include\hctest_internal.h中定义。 
 
  
 ```java 
  /**
 * test size
 */
enum TestSize {
    SmallTest = 1 << 4,
    MediumTest = 2 << 4,
    LargeTest = 3 << 4
};
  ``` 
  
 
测试类型分为Function、Performance、Power、Reliability、Security、Global、Compatibility、User、Standard、Safety和Resilience。宏定义如下，具体含义见参考站点中链接。 
 
  
 ```java 
  /**
 * test type
 */
enum TestType {
    Function = 1 << 8,
    Performance = 2 << 8,
    Power = 3 << 8,
    Reliability = 4 << 8,
    Security = 5 << 8,
    Global = 6 << 8,
    Compatibility = 7 << 8,
    User = 8 << 8,
    Standard = 9 << 8,
    Safety = 10 << 8,
    Resilience = 11 << 8
};
  ``` 
  
 
 
#### 3、C语言用例开发编译指导 
根据测试系统选择测试框架和对应测试用例语言。系统类型和测试框架、开发语言对应关系如下： 
 
我们主要看下轻量系统产品用例开发。轻量系统测试使用的测试框架是hctest，hctest测试框架支持使用C语言编写测试用例，是在开源测试框架unity的基础上进行增强和适配。 
 
##### 3.1 用例目录规范 
我们上文已经看到了ACTS的目录， 测试用例存储到test/xts/acts仓中。假如我们在一个名为subsystem_lite的子系统中为module_hal部件开发用例，目录如下： 
 
  
 ```java 
  ├── acts
| └── ......
│ └── subsystem_lite
│ │ └── module_hal
│ │ │ └── BUILD.gn
│ │ │ └── src
│ └──build_lite
│ │ └── BUILD.gn
  ``` 
  
 
可以参考已经存在的用例的目录，比如test\xts\acts\utils_lite\file_hal、test\xts\acts\utils_lite\kv_store_hal、test\xts\acts\startup_lite\bootstrap_hal等等。 
 
##### 3.2 编写用例样例 
 
##### 3.2.1 引用测试框架 
hctest.h 文件位于./test/xts/tools/lite/hctest/include/目录，定义了LITE_TEST_SUIT、LITE_TEST_CASE、RUN_TEST_SUITE等测试套件的宏。 
 
  
 ```java 
  #include "hctest.h"
  ``` 
  
 
 
##### 3.2.2 定义子系统、模块、测试套件名称 
需要3个参数，分别为子系统名称、子系统的部���名称、测试套件名称。 
 
  
 ```java 
  /**  
* @brief  register a test suit named "IntTestSuite"  
* @param  test subsystem name  
* @param  example module name  
* @param  IntTestSuite test suit name  
*/
LITE_TEST_SUIT(test, example, IntTestSuite);
  ``` 
  
 
已经存在的示例，可以参考test\xts\acts\utils_lite\kv_store_hal\src\kvstore_func_test.c，为utils子系统的kvStore部件注册KvStoreFuncTestSuite测试套件。 
 
  
 ```java 
  /**
 * @tc.desc      : register a test suite, this suite is used to test basic flow and interface dependency
 * @param        : subsystem name is utils
 * @param        : module name is kvStore
 * @param        : test suit name is KvStoreFuncTestSuite
 */
LITE_TEST_SUIT(utils, kvStore, KvStoreFuncTestSuite);
  ``` 
  
 
 
##### 3.2.3 定义Setup与TearDown 
命名方式：测试套件名称+Setup，测试套件名称+TearDown。Setup与TearDown必须存在，可以为空函数。示例可以参考test\xts\acts\utils_lite\kv_store_hal\src\kvstore_func_test.c，如下： 
 
  
 ```java 
  /**
 * @tc.setup     : setup for all testcases
 * @return       : setup result, TRUE is success, FALSE is fail
 */
static BOOL KvStoreFuncTestSuiteSetUp(void)
{
    UtilsSetEnv(DATA_PATH);
    return TRUE;
}

/**
 * @tc.teardown  : teardown for all testcases
 * @return       : teardown result, TRUE is success, FALSE is fail
 */
static BOOL KvStoreFuncTestSuiteTearDown(void)
{
    printf("+-------------------------------------------+\n");
    return TRUE;
}
  ``` 
  
 
 
##### 3.2.4 使用宏定义LITE_TEST_CASE写测试用例 
LITE_TEST_CASE函数宏包括三个参数：测试套件名称，测试用例名称，用例属性（测试类型、用例粒度、用例级别）。示例代码中创建测试用例，名称为TestCase001，属于测试套件IntTestSuite，测试用例属性为功能测试、测试用例粒度为MediumTest，用例级别Level1。 
 
  
 ```java 
  LITE_TEST_CASE(IntTestSuite, TestCase001, Function | MediumTest | Level1) 
{  
  //do something 
};
  ``` 
  
 
示例可以参考test\xts\acts\utils_lite\kv_store_hal\src\kvstore_func_test.c，如下，测试套件KvStoreFuncTestSuite中创建测试用例testKvStoreSetValue001，测试kvstore部件的UtilsSetValue和UtilsDeleteValue接口。 
 
  
 ```java 
  /**
 * @tc.number    : SUB_UTILS_KV_STORE_0100
 * @tc.name      : UtilsSetValue parameter legal test
 * @tc.desc      : [C- SOFTWARE -0200]
 */
LITE_TEST_CASE(KvStoreFuncTestSuite, testKvStoreSetValue001, Function | MediumTest | Level1)
{
    char key[] = "rw.sys.version";
    char value[] = "Hello world !";
    int ret = UtilsSetValue(key, value);
    TEST_ASSERT_EQUAL_INT(0, ret);

    ret = UtilsDeleteValue(key);
    TEST_ASSERT_EQUAL_INT(0, ret);
};
  ``` 
  
 
 
##### 3.2.5 使用宏定义 RUN_TEST_SUITE注册测试套件 
 
  
 ```java 
  RUN_TEST_SUITE(IntTestSuite);
  ``` 
  
 
 
##### 3.3 测试模块的构建配置文件 
在每个测试模块目录subsystem_lite/module_hal下新建BUILD.gn编译文件，用于指定编译后静态库的名称、依赖的头文件、依赖的库等；具体写法如下： 
 
  
 ```java 
  import("//test/xts/tools/lite/build/suite_lite.gni")
hctest_suite("ActsDemoTest") {
    suite_name = "acts"
    sources = [
        "src/test_demo.c",
    ]
    include_dirs = [ ]
    cflags = [ "-Wno-error" ]
}
  ``` 
  
 
 
##### 3.4 acts下BUILD.gn增加编译选项 
需要将测试模块加入到acts目录下的编译脚本中，编译脚本路径：test/xts/acts/build_lite/BUILD.gn。 
 
  
 ```java 
  lite_component("acts") {  
    ...
    if(board_name == "liteos_m") {
        features += [    
            ...
            "//xts/acts/subsystem_lite/module_hal:ActsDemoTest"
        ]    
    }
}
  ``` 
  
 
 
##### 3.5 编译烧录运行 
随版本编译，debug版本编译时会同步编译acts测试套件。acts测试套件编译中间件为静态库，最终链接到版本镜像中 。将版本镜像烧录进开发板。重启设备，查看串口日志。每个测试套件执行以Start to run test suite开始，以xx Tests xx Failures xx Ignored结束。 
 
### 参考站点 
参考了下述站点，或者推荐读者阅读下述站点了解更多信息。 
 
  Application compatibility test suite | acts应用兼容性测试套  
  hardware abstraction test suite | hats兼容性测试套  
  Distributed Compatibility Test Suite 待上线  
  Distributed Compatibility Test Suite 待上线  
  XTS认证用例开发指导  
  轻量带屏解决方案之恒玄芯片移植案例  
 
  
点击关注，第一时间了解华为云新鲜技术~
                                        