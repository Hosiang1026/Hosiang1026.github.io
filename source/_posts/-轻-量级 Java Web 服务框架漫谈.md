---
title: 推荐系列--轻-量级 Java Web 服务框架漫谈
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 1847
cover_picture: 'https://static.oschina.net/uploads/img/201907/11110732_xehY.jpg'
abbrlink: 90f42eae
date: 2021-04-15 09:19:21
---

&emsp;&emsp;博文太长了, 还是先说下概要: 框架"轻量"与否可以从两方面来看待: 1) 框架本身的体量 - 例如小 jar 无依赖的苗条框架; 2) 用户使用框架是否获得各种便利而无阻隔("隔" 的含义参考王国维先生的...
<!-- more -->

                                                                                                                                                                                        博文太长了, 还是先说下概要: 
 
 框架"轻量"与否可以从两方面来看待: 1) 框架本身的体量 - 例如小 jar 无依赖的苗条框架; 2) 用户使用框架是否获得各种便利而无阻隔("隔" 的含义参考王国维先生的人间词话) 
 单单"轻量"二字不足以说明框架的特性和使用方式 
 一定要说"轻量", 老码农倾向与第二种 - 用户使用框架是否获得各种便利而无阻隔 
 为了"轻量"而刻意使框架苗条化有时候不足取. 
 
tl;dr 以下博客正文 
### 1. Java Web 服务框架的前世今生 
时光回到 2000 年中, 老码农坐在天津河川大厦 7 楼接手平生第一个 Web 服务项目, 采用的是最新(当年)的 Java Servlet 技术, 倒腾着精致(自认为)的结构来处理 HttpServletResponse 输出 (幽怨地看向 N 年之后 Beetl, 却看不到 Rythm 的模样); 半年后第二个 web 项目开坑的时候, 从 apache jarkata 中挖出了一个名叫 Velocity 的模板, 果断放弃自己的输出框架; 再一年半之后的第三个项目(代号 kasino), 不说了, 直接上一整套 Apache Turbine 服务框架 (估计现在大部分人都没有听说过这个框架, 不过单单从这个框架项目衍生出的 Velocity 和大名鼎鼎的 Maven 可知 Turbine 的分量). 这里不得不提到另一个同时期的 Web 服务框架, 其盛(?)名却一直延续至今: Struts; 出于偶然的因素, 老码农看到 Struts/JSP 这套路线的时候已经上了 Turbine/Velocity 的船, 与这套路线也就渐行渐远了. 
用过 Turbine 之后老码农对 Web 服务框架的概念逐渐开始建立起来, 然而 MVC 模式和 Web 服务框架之间的关系之后后来 Spring 出了 SpringMVC 之后才更加清晰地定义下来并为业界接受. 遗憾地是 2003 年之后老码农转向嵌入式系统和 Java web 服务这条线暂时分道扬镳, 错过了这些年这个领域许多的精彩. 2009 年老码农重回 Web 开发, 先和 CakePHP 搏斗三个月, 发现自己实在不是宇宙第一语言的对手, 决定还是回去找原配 Java. 当时 SSH 在 Java Web 服务框架之中已经如日中天, 但老码农并没有直接投怀入抱(当然更没有想过去踩 EJB 的深坑), 还是矜持地决定再研究研���其他框架. 这以矜持就让老码农碰上了真爱 PlayFramework. 和今天的 Play2 不同, 当年的 Play 给人一种惊艳的感觉, 最激动人心的几个特性: 
 
  开发模式热加载 - 修改错误之后直接在浏览器上点 reload 就 okay - 无需重启服务! 无需重启服务! 无需重启服务!  
  开发模式发生错误直接在 Web 页面高亮显示错误代码行 - 没有用过这个特性的开发估计很难有直观的概念, 这里是一个 play 的出错页面, 大家可以体会一下: ![Test](https://oscimg.oschina.net/oscnet/d770c14668480225916303d326fe23c807c.jpg  '-轻-量级 Java Web 服务框架漫谈')  
  无状态模型 - Session 不在服务端, 做横向扩展毫无违和感  
 
读到这里, 有的看官可能会说这几个特貌似和代码没有啥关系啊. 这里其实是老码农想强调的地方, 框架并非仅仅关乎代码, 而是关乎整个开发过程. 设想一下如果每次修改无需等待 10 秒或者更长的时间让服务重启, 整个开发会节省多少小时; 同理, 如果出错之后无需到后台花几十秒到几分钟去 Log 中定位错误, 又能够为整个项目节省多少小时. 老码农认为 Play1 带来的这些特性对生产力的提高是有革命性的影响. 
时光飞逝如电, 转眼进入二十一世纪第二个十年. 如果说二十世纪的第一个十年奠定了 Java Web 服务框架的基础, 那第二个十年就是 Java Web 服务框架的井喷. TechEmpower 最近一期的 Java Micro/全栈 Web 服务框架 有三十种之多. 而国内的 JFinal, Nutz, RedKale, tio-mvc 等各种框架也是诸雄并起, 整个行业一遍欣欣向荣(春秋战国)景象. 
### 2. "轻量" 的定(歧)义 
曾几何时, "轻量" 二字浮出水面. 溯其根源, 大致和当年的 EJB 有关. 话说老码农一直是 Java 的忠实拥泵, 然而划线止于 J2EE, 其带来的 EJB 各种概念与操作都让老码农感到十分别扭. 后续有人大胆离经叛道, 声明 J2EE 太重, 业界需要一个更轻的框架, 于是乎 SpringFramework 应运而生, 可以说 "轻量" 这个定语早先原是修饰 Spring 的. 然而花开花落去, 10 年光阴在 IT 上也算得上沧海桑田, 昔日翩翩少年郎 Spring 如今也成了中年油腻大叔, 貌似和 "轻量" 早说再见, 而反被贴上了 "重量" 的标签. "以彼之道还施彼身", 当下众多框架(或其他工具软件)似乎都深谙姑苏慕容的绝技, 纷纷成为新一代的 "轻量" 产品, 仿佛如不加 "轻量" 二字就不得人欢喜. 各位看官如不相信且请点击此处, 亦或有其他更为高明表达方式, 诸如 "Tiny", "无依赖", "极简", "极速" 乃至 "Xxx走天涯" 等等, 以烘突"轻量"这个主题. 然则何为"轻量", 老码农原以为很清楚的概念, 反思二三, 却发现自己对此的理解竟然并不清晰. 于是决定写下此篇博文记述下自己对此的思考 
"轻量" 者, 重在于"轻", 无依赖且小 jar 包必然是轻了. 下一个问题是为何要 "轻", 或者说 "轻" 给开发/维护带来何种好处. 如果说轻量定义限制于 "依赖少且小 jar 包" (下面且称之为苗条框架), 可以立刻获得的好处大致有: 
 
 易于上手 
 易于调试 
 降低甚至消除因为依赖过多引发版本冲突的可能 
 如果��要, 便于开发扩展功能, 甚至直接魔改核心代码 
 
然而世界上并没有永久免费的面包, 也没有银弹, 就上面的"轻量"深入思考下去, 也会有不一样的发现. 逐条分解一下: 
 
 易于上手 - 对新手当然再好不过, 然而新手只是一个阶段, 而且是程序员生涯中比重很小的一个阶段. 易于上手当然很重要, 但作为压倒一切的目标来设计框架就没有太大必要了. 从另一方面来讲, 易��上手也不仅仅是苗条框架的专利, 设计简洁的 API, 提供足够的文档和示例项目都可以让框架变得更加易于上手. 
 易于调试 - 平心而论, 这一点至关重要, 因为这是每个开发人员时刻面临的问题. 设想一下, 每次进入应用代码都有超过 30 个堆栈, 途中还要历经 N 个循环, 每次都有 20 个迭代; 从应用代码返回之后也如此, 这样的日常大概会让开发人员郁闷到死. 然而是否只有苗条框架才能做到易于调试呢? 此处大大有思考余地, 元芳你怎么看? 
 降低甚至消除因为依赖过多引发版本冲突的可能 - 少依赖自然也就不太可能有版本冲突的可能; 可是为了减少版本冲突的可能就不要依赖了, 怎么看都有一种因噎废食的感觉呢? 况且 Maven 体系的出现不就是为了管理依赖版本的复杂度吗? 
 如果需要, 便于开发扩展功能, 甚至直接魔改核心代码 - 很好的理由, 奈何只有一次性价值. 魔改核心代码之后要追赶原项目的新版本就需要不停地做 catch-up, 除非大家自此处分道扬镳. 至于开发扩展功能, 也并非少依赖小 jar 包的专利, 只要文档好, 生态大, 自然扩展项目滚滚而来, 君不见 Spring 的扩展部队比灭霸的还要厉害么 
 
由此看来单纯以苗条论英雄也有失之偏颇的地方. 而依赖这个概念原本衍生自"重用", 完全地否定"依赖"也就是在一定程度上否定了"重用". 老码农对此表示不能赞同.下面就 "轻量" 这个概念继续思考 
### 3. 我对"轻量"的理解 
老码农感觉轻量不应该是对框架本身代码量和依赖的衡量, 更为确切的讲, 用户(开发)玩起来的感觉才是定位框架轻量与否的指示. 钢铁侠的盔甲自重必然是很大的, 玩起来却是轻量得很, 几乎可以随风起舞; 当然嫦娥仙子的天衣想来也必然轻量, 和钢铁侠的盔甲相比却有各自有妙处. 由此可见, 用轻量来描述框架其实并不能确切地表达各自优点特性. 
#### 3.1 初始化项目的轻量 
若是框架依赖众多, 启动一个空项目需要四处寻求依赖包 (貌似 maven 之前的世界差不多都是如此), 必然感觉不会轻量. 即便有了 maven, 然则 pom.xml 文件一写就是洋洋数百行代码, 也会感觉重重的. 当 pom 文件能用 10 来行乃至 50 行以内写出来, 一页纸可观全貌, 几遍依赖再多, 也不会觉得很重. 按此标准来看, 传统的 SpringMVC 一定重于 SpringBoot + Starter 的项目. 当然苗条框架在这里也必然轻量, 无论是采用当今的 maven 方式, 还是拿一个 jar 包放进 lib 目录的石器时代模式都不会很重. 
#### 3.2 代码中的轻量 
这里面的内容就太多了, 只能勉强挑拣几个讲述一二. 
##### 3.2.1 框架的表达力与代码量 
当框架有足够的表达力的时候, 应用的代码必定可以以少克多, 且不影响阅读 (非常重要!). 举个 Spring 注解改进的例子: 
 ```java 
  
// 以前的表达
@RequestMapping(value = "/path", method = "POST")
public void doJob() {...}

// 新的表达
@PostMapping("/path")
public void doJob() {...}

  ```  
毫无疑问新的表达减少了手腕疲劳综合症发生概率 5%, 且提高了代码可读性 5%. 由此可见框架表达力在提高生产力, 延长码农使用寿命方面有非常重要的作用. 这是我们希望看到的轻量. 
##### 3.2.2 框架对于上下文环境的应变能力 
一个 HTTP 请求附带了大量的上下文信息, 比如  ```java 
  Accept
  ```  头就是用来告诉服务端, 客户端需要何种响应. 对于下面的代码: 
 ```java 
  @GetAction("/employees")
public Iterable<Employee> list() {
   return employeeDao.findAll();
}

  ```  
如果请求的  ```java 
  Accept=application/json
  ```  框架能自动序列化  ```java 
  Iterable<Employee>
  ```  为 JSON 数组, 而当  ```java 
  Accept=text/csv
  ```  框架能自动生成 csv 下载文件, ... 这样的框架必然减少了开发处理各种输出格式的负担, 少了很多相关代码, 这也是我们希望看到的轻量 
##### 3.2.3 框架对于计算环境的适配能力 
实例化一个控制器是否应该单例, 还是每个请求都需要新的控制器实例, 这需要回答对计算环境的要求. 简单地说如果控制器实例没有自己的状态, 就应该采用单例, 例如: 
 ```java 
  @UrlContext("employees")
public class EmployeeService {
    @Inject
    private EmployeeDao employeeDao;
    
    @GetAction
    public Iterable<Employee> list() {return employeeDao.findAll();}
	
    @PostAction
    public Employee create(Employee employee) {return employeeDao.save(employee);}
    ...
}

  ```  
上面的控制器  ```java 
  EmployeeService
  ```  只有一个字段  ```java 
  employeeDao
  ``` , 倘若该字段是无状态的, 那  ```java 
  EmployeeService
  ```  也应该是无状态的, 因此框架会自动采用单例来获得控制器实例. 
下面是例子则是不同的情况: 
 ```java 
  @UrlContext("my")
public class MyProfileService {
    @LoginUser
    public User me;
    
    @GetAction
    public User getMyProfile() {return me;}
}

  ```  
这个控制器有一个状态字段  ```java 
  me
  ``` , 该字段在每次请求进来的时候通过 token(或者 cookie) 绑定到当前登录用户, 因此每次处理新的请求必须初始化新的  ```java 
  MyProfileService
  ```  实例. 
在上面的示例代码中我们并没有看到应用使用特别的手段 (比如加上 @Singleton 注解等) 来通知框架应该如何初始化控制器实例, 这是框架自动适配当前计算环境的能力; 这种能力可以让开发人员写出更加轻量的代码. 
##### 3.2.4 框架对于应用参数类型的识别和处理能力 
这一点对于 Web 服务框架尤其重要, 在请求端提供的数据是没有类型的 (即便是 JSON encoded 的数据也只有有限数据类型), 而服务端的 Java 对象比然是有自己的数据类型, 因此自动将请求参数按照既定规则映射到 Java 数据可以节省应用大量的开发时间. 例如下面的请求处理方法: 
 ```java 
  @PostAction("employees")
public Employee create(Employee employee) {return employeeDao.save(employee);}

  ```  
能自动处理请求参数到 Java 参数 Employee 的绑定 
基于 form 的请求 ( ```java 
  ContentType=application/x-www-form-urlencoded
  ``` ) 
 ```java 
  employee[firstName]=三
employee[lastName]=张
employee[email]=zhang3@comp.com
...

  ```  
基于 JSON 的请求 ( ```java 
  ContentType=application/json
  ``` ) 
 ```java 
  {
  "firstName": "三",
  "lastName": "张",
  "email": "zhang3@comp.com",
  ...
}

  ```  
能基于  ```java 
  Content-Type
  ```  头自动实现对请求参数到 Java 声明参数的绑定能大大减少应用的代码量, 从而带来开发人员喜闻乐见的"轻量". 
#### 3.3 对开发支持的轻量 
这一点在上面 Playframework 介绍的时候曾经提到过. 老码农认为和代码轻量相比, 框架对开发支持的轻量同样重要. 
##### 3.3.1 开发模式与产品模式 
将框架运行时分为开发模式与产品模式是 PlayFramework 最先引入 Java Web 服务框架的. 这个区分可以让框架作者惬意地引入开发时的支持而无需担心对运行时性能或者安全的影响. 以下描述都基于开发模式讨论 
##### 3.3.2 热加载 
框架监控文件系统的变化, 并在需要时重新加载更新后的源代码或者配置文件, 让开发人员只需要在浏览器上点击 F5 重新加载页面即可观察到代码更改带来的变化; 整个过程在几百毫秒到几秒之内发生. 这一点带来的生产力提高优势太大了. 老���农��己曾经在 SpringMVC 上开发项目, 每次重启服务大概需要 10 秒左右, 时间虽然不是很长, 但整个开发反馈环因此暂停带来的不快实在是很难忍受. 当开发框架有了热加载支持之后开发的方式都发生了一些变化. 而带来的身心愉悦就不多说了. 开发时热加载可以让开发感受到喜欢的轻量. 
##### 3.3.3 开发时错误提示页面 
开发过程中错误难免, 倘若框架能提供一些方便让应用开发迅速定位错误点, 也能带来轻量的感觉: 
当路由找不到时: 
![Test](https://oscimg.oschina.net/oscnet/d770c14668480225916303d326fe23c807c.jpg  '-轻-量级 Java Web 服务框架漫谈') 
当程序编译错误时: 
![Test](https://oscimg.oschina.net/oscnet/d770c14668480225916303d326fe23c807c.jpg  '-轻-量级 Java Web 服务框架漫谈') 
当程序运行时出错时: 
![Test](https://oscimg.oschina.net/oscnet/d770c14668480225916303d326fe23c807c.jpg  '-轻-量级 Java Web 服务框架漫谈') 
当模板页面出错时: 
![Test](https://oscimg.oschina.net/oscnet/d770c14668480225916303d326fe23c807c.jpg  '-轻-量级 Java Web 服务框架漫谈') 
#### 3.4 API 文档的轻量 
前后端分离渐成主流的形势下, API 文档愈发重要. 相应的工具 (如 Swagger) 也应运而生. 然而 Swagger 需要应用加入额外注解, 这是让人感到稍微重滞的地方: 
 ```java 
  @ApiOperation(value = "View a list of available products", response = Iterable.class)
@RequestMapping(value = "/list", method= RequestMethod.GET,produces = "application/json")
public Iterable list(Model model){
    Iterable productList = productService.listAllProducts();
    return productList;
}

  ```  
倘若框架直接从 JavaDoc 中生成文档则感觉又要轻量一点, 例如: 
 ```java 
      /**
     * Create a bookmark.
     *
     * Normal operation
     *
     * * It shall add a bookmark successfully with URL and brief description provided and respond with 201 and new bookmark ID.
     *
     * Exceptional cases
     *
     * * It shall respond 401 if a guest user (user that not logged in) submit request to add bookmark
     * * It shall respond 400 with error message "URL expected" when a logged in user submit request to add bookmark without URL provided
     * * It shall respond 400 with error message "description expected" when a logged in user submit request to add bookmark without description provided.
     *
     * Refer: [github issue](https://github.com/act-gallery/bookmark/issues/3)
     *
     * @param bookmark an new bookmark posted
     * @return ID of the new bookmark
     */
    @PostAction
    @PropertySpec("id")
    public Bookmark create(@Valid Bookmark bookmark) {
        AAA.requirePermission(AppPermission.PERM_CREATE_BOOKMARK);
        bookmark.owner = me.email;
        return bookmarkDao.save(bookmark);
    }

  ```  
生成 API 文档如下: 
![Test](https://oscimg.oschina.net/oscnet/d770c14668480225916303d326fe23c807c.jpg  '-轻-量级 Java Web 服务框架漫谈') 
此处框架直接将 JavaDoc 的内容格式化为 API 文档描述, 同时生成请求 JSON 示例以及返回数据示例, 应用开发除了在方法的 JavaDoc 上写清楚描述之外并没有做任何额外工作; 而前端已经可以获得非常清晰的 API 文档. 这也是对开发大大有益的文档的轻量 
#### 3.5 测试的轻量 
Web 服务框架的测试麻烦开发皆知. 就一个简单的 HelloWorld 程序, 其测试代码大致可能为: 
 ```java 
  @RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
public class HttpRequestTest {
    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    public void testGreetingService() throws Exception {
        assertThat(this.restTemplate.getForObject("http://localhost:" + port + "/",
            String.class)).contains("Hello World");
    }
}

  ```  
这样的测试对于开发��讲��在是有点重. 实际上完全可以采用轻量得多的方式来表达相同的意思: 
 ```java 
  Scenario(Hello Service):
  interactions:
  - request:
      get: /
    response:
      json:
        result: Hello World

  ```  
运行测试当然也应该轻量: 
命令行(CICD 环境)下运行: 
![Test](https://oscimg.oschina.net/oscnet/d770c14668480225916303d326fe23c807c.jpg  '-轻-量级 Java Web 服务框架漫谈') 
或者在开发时调试运行: 
![Test](https://oscimg.oschina.net/oscnet/d770c14668480225916303d326fe23c807c.jpg  '-轻-量级 Java Web 服务框架漫谈') 
自动测试之所以难, 难在写测试用例的麻烦. 如果框架能够以一种简单的方式让开发写测试用例, 且支持易���的方式来运行测试用例, 这种轻量化将让自动测试不再成为开发人员的阻抗, 而是一种动力. 
#### 3.6 部署的轻量 
传统基于 Servlet 的部署并不是一个很舒适的过程. 老码农理解的部署轻量可以是: 
直接打包 -> scp 上传 -> 运行远端脚本暂停服务并解包重启服务. 这个过程应该可以在 Jenkins 里面简单配置完成. 
或者可以稍微前卫一点, 直接打个 docker 包? 
![Test](https://oscimg.oschina.net/oscnet/d770c14668480225916303d326fe23c807c.jpg  '-轻-量级 Java Web 服务框架漫谈') 
### 4. 总结 
老码农最近对 Java web 服务端框架中的 "轻量" 做了一点自己的分析与思考, 在本文中分享出来. 希望能够为各位 Java web 端玩家带来一点不同的意见, 欢迎大家在评论中就这方面发表自己的看法, 只要有道理, 赞同与反对都是好评论.
                                        