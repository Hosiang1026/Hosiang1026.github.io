---
title: 推荐系列-编码规范 - Java函数优雅之道（上）
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 1700
cover_picture: 'https://static.oschina.net/uploads/img/201909/29120841_aJr0.jpg'
abbrlink: 5df72b45
date: 2021-04-15 09:19:21
---

&emsp;&emsp;导读 随着软件项目代码的日积月累，系统维护成本变得越来越高，是所有软件团队面临的共同问题。持续地优化代码，提高代码的质量，是提升系统生命力的有效手段之一。软件系统思维有句话“Les...
<!-- more -->

                                                                                                                                                                                         
### 导读 
 
随着软件项目代码的日积月累，系统维护成本变得越来越高，是所有软件团队面临的共同问题。持续地优化代码，提高代码的质量，是提升系统生命力的有效手段之一。软件系统思维有句话“Less coding, more thinking（少编码、多思考）”，也有这么一句俚语“Think more, code less（思考越多，编码越少）”。所以，我们在编码中多思考多总结，努力提升自己的编码水平，才能编写出更优雅、更高质、更高效的代码。 
本文总结了一套与Java函数相关的编码规则，旨在给广大Java程序员一些编码建议，有助于大家编写出更优雅、更高质、更高效的代码。这套编码规则，通过在高德采集部门的实践，已经取得了不错的成效。 
 
### 使用通用工具函数 
 
案例一 
现象描述： 
不完善的写法： 
 ```java 
  thisName != null && thisName.equals(name);


  ```  
更完善的写法： 
 ```java 
  (thisName == name) || (thisName != null && thisName.equals(name));


  ```  
建议方案： 
 ```java 
  Objects.equals(name, thisName);


  ```  
案例二 
现象描述： 
 ```java 
  !(list == null || list.isEmpty());


  ```  
建议方案： 
 ```java 
  import org.apache.commons.collections4.CollectionUtils;
CollectionUtils.isNotEmpty(list);


  ```  
主要收益 
 
  函数式编程，业务代码减少，逻辑一目了然；  
  通用工具函数，逻辑考虑周全，出问题概率低。  
 
 
### 拆分超大函数 
 
当一个函数超过80行后，就属于超大函数，需要进行拆分。 
案例一：每一个代码块都可以封装为一个函 
每一个代码块必然有一个注释，用于解释这个代码块的功能。 
如果代码块前方有一行注释，就是在提醒你——可以将这段代码替换成一个函数，而且可以在注释的基础上给这个函数命名。如果函数有一个描述恰当的��字，就不需要去看内部代码究竟是如何实现的。 
现象描述： 
 ```java 
  // 每日生活函数
public void liveDaily() {
    // 吃饭
    // 吃饭相关代码几十行

    // 编码
    // 编码相关代码几十行

    // 睡觉
    // 睡觉相关代码几十行
}


  ```  
建议方案： 
 ```java 
  // 每日生活函数
public void liveDaily() {
    // 吃饭
    eat();

    // 编码
    code();

    // 睡觉
    sleep();
}

// 吃饭函数
private void eat() {
    // 吃饭相关代码
}

// 编码函数
private void code() {
    // 编码相关代码
}

// 睡觉函数
private void sleep() {
    // 睡觉相关代码
}


  ```  
案例二：每一个循环体都可以封装为一个函 
现象描述： 
 ```java 
  // 生活函数
public void live() {
    while (isAlive) {
        // 吃饭
        eat();

        // 编码
        code();

        // 睡觉
        sleep();
    }
}


  ```  
建议方案： 
 ```java 
  // 生活函数
public void live() {
    while (isAlive) {
        // 每日生活
        liveDaily();
    }
}

// 每日生活函数
private void liveDaily() {
    // 吃饭
    eat();

    // 编码
    code();

    // 睡觉
    sleep();
}


  ```  
案例三：每一个条件体都可以封装为一个函 
现象描述： 
 ```java 
  // 外出函数
public void goOut() {
    // 判断是否周末
    // 判断是否周末: 是周末则游玩
    if (isWeekday()) {
        // 游玩代码几十行
    }
    // 判断是否周末: 非周末则工作
    else {
        // 工作代码几十行
    }
}


  ```  
建议方案： 
 ```java 
  // 外出函数
public void goOut() {
    // 判断是否周末
    // 判断是否周末: 是周末则游玩
    if (isWeekday()) {
        play();
    }
    // 判断是否周末: 非周末则工作
    else {
        work();
    }
}

// 游玩函数
private void play() {
    // 游玩代码几十行
}

// 工作函数
private void work() {
    // 工作代码几十行
}


  ```  
主要收益 
 
  函数越短小精悍，功能就越单一，往往生命周期较长；  
  一个函数越长，就越不容易理解和维护，维护人员不敢轻易修改；  
  在过长函数中，往往含有难以发现的重复代码。  
 
 
### 同一函数内代码块级别尽量一致 
 
案例一 
现象描述： 
 ```java 
  // 每日生活函数
public void liveDaily() {
    // 吃饭
    eat();

    // 编码
    code();

    // 睡觉
    // 睡觉相关代码几十行
}


  ```  
很明显，睡觉这块代码块，跟eat（吃饭）和code（编码）不在同一级别上，显得比较突兀。如果把写代码比作写文章，eat（吃饭）和code（编码）是段落大意，而睡觉这块代码块属于一个详细段落。而在liveDaily（每日生活）这个函数上，只需要写出主要流程（段落大意）即可。 
建议方案： 
 ```java 
  public void liveDaily() {
    // 吃饭
    eat();

    // 编码
    code();

    // 睡觉
    sleep();
}

// 睡觉
private void sleep() {
    // 睡觉相关代码
}


  ```  
主要收益 
 
  函数调用表明用途，函数实现表达逻辑，层次分明便于理解；  
  不用层次的代码块放在一个函数中，容易让人觉得代码头重脚轻。  
 
 
### 封装相同功能代码为函数 
 
案例一：封装相同代码为函数 
现象描述： 
 ```java 
  // 禁用用户函数
public void disableUser() {
    // 禁用黑名单用户
    List<Long> userIdList = queryBlackUser();
    for (Long userId : userIdList) {
        User userUpdate = new User();
        userUpdate.setId(userId);
        userUpdate.setEnable(Boolean.FALSE);
        userDAO.update(userUpdate);
    }

    // 禁用过期用户
    userIdList = queryExpiredUser();
    for (Long userId : userIdList) {
        User userUpdate = new User();
        userUpdate.setId(userId);
        userUpdate.setEnable(Boolean.FALSE);
        userDAO.update(userUpdate);
    }
}


  ```  
建议方案： 
 ```java 
  // 禁用用户函数
public void disableUser() {
    // 禁用黑名单用户
    List<Long> userIdList = queryBlackUser();
    for (Long userId : userIdList) {
        disableUser(userId);
    }

    // 禁用过期用户
    userIdList = queryExpiredUser();
    for (Long userId : userIdList) {
        disableUser(userId);
    }
}

// 禁用用户函数
private void disableUser(Long userId) {
    User userUpdate = new User();
    userUpdate.setId(userId);
    userUpdate.setEnable(Boolean.FALSE);
    userDAO.update(userUpdate);
}

  ```  
案例二：封装相似代码为函数 
封装相似代码为函数，差异性通过函数参数控制。 
现象描述： 
 ```java 
  // 通过工单函数
public void adoptOrder(Long orderId) {
    Order orderUpdate = new Order();
    orderUpdate.setId(orderId);
    orderUpdate.setStatus(OrderStatus.ADOPTED);
    orderUpdate.setAuditTime(new Date());
    orderDAO.update(orderUpdate);
}

// 驳回工单函数
public void rejectOrder(Long orderId) {
    Order orderUpdate = new Order();
    orderUpdate.setId(orderId);
    orderUpdate.setStatus(OrderStatus.REJECTED);
    orderUpdate.setAuditTime(new Date());
    orderDAO.update(orderUpdate);
}


  ```  
建议方案： 
 ```java 
  // 通过工单函数
public void adoptOrder(Long orderId) {
    auditOrder(orderId, OrderStatus.ADOPTED);
}

// 驳回工单函数
public void rejectOrder(Long orderId) {
    auditOrder(orderId, OrderStatus.REJECTED);
}

// 审核工单函数
private void auditOrder(Long orderId, OrderStatus orderStatus) {
    Order orderUpdate = new Order();
    orderUpdate.setId(orderId);
    orderUpdate.setStatus(orderStatus);
    orderUpdate.setAuditTime(new Date());
    orderDAO.update(orderUpdate);
}


  ```  
主要收益 
 
  封装公共函数，减少代码行数，提高代码质量；  
  封装公共函数，使业务代码更精炼，可读性可维护性更强。  
 
 
### 封装获取参数值函数 
 
案例一 
现象描述： 
 ```java 
  // 是否通过函数
public boolean isPassed(Long userId) {
    // 获取通过阈值
    double thisPassThreshold = PASS_THRESHOLD;
    if (Objects.nonNull(passThreshold)) {
        thisPassThreshold = passThreshold;
    }

    // 获取通过率
    double passRate = getPassRate(userId);

    // 判读是否通过
    return passRate >= thisPassThreshold;
}


  ```  
建议方案： 
 ```java 
  // 是否通过函数
public boolean isPassed(Long userId) {
    // 获取通过阈值
    double thisPassThreshold = getPassThreshold();

    // 获取通过率
    double passRate = getPassRate(userId);

    // 判读是否通过
    return passRate >= thisPassThreshold;
}

// 获取通过阈值函数
private double getPassThreshold() {
    if (Objects.nonNull(passThreshold)) {
        return passThreshold;
    }
    return PASS_THRESHOLD;
}


  ```  
主要收益 
 
  把获取参数值从业务函数中独立，使业务逻辑更清晰；  
  封装的获取参数值为独立函数，可以在代码中重复使用。  
 
 
### 通过接口参数化封装相同逻辑 
 
案例一 
现象描述： 
 ```java 
  // 发送审核员结算数据函数
public void sendAuditorSettleData() {
    List<WorkerSettleData> settleDataList = auditTaskDAO.statAuditorSettleData();
    for (WorkerSettleData settleData : settleDataList) {
        WorkerPushData pushData = new WorkerPushData();
        pushData.setId(settleData.getWorkerId());
        pushData.setType(WorkerPushDataType.AUDITOR);
        pushData.setData(settleData);
        pushService.push(pushData);
    }
}

// 发送验收员结算数据函数
public void sendCheckerSettleData() {
    List<WorkerSettleData> settleDataList = auditTaskDAO.statCheckerSettleData();
    for (WorkerSettleData settleData : settleDataList) {
        WorkerPushData pushData = new WorkerPushData();
        pushData.setId(settleData.getWorkerId());
        pushData.setType(WorkerPushDataType.CHECKER);
        pushData.setData(settleData);
        pushService.push(pushData);
    }


  ```  
建议方案： 
 ```java 
  // 发送审核员结算数据函数
public void sendAuditorSettleData() {
    sendWorkerSettleData(WorkerPushDataType.AUDITOR, () -> auditTaskDAO.statAuditorSettleData());
}

// 发送验收员结算数据函数
public void sendCheckerSettleData() {
    sendWorkerSettleData(WorkerPushDataType.CHECKER, () -> auditTaskDAO.statCheckerSettleData());
}

// 发送作业员结算数据函数
public void sendWorkerSettleData(WorkerPushDataType dataType, WorkerSettleDataProvider dataProvider) {
    List<WorkerSettleData> settleDataList = dataProvider.statWorkerSettleData();
    for (WorkerSettleData settleData : settleDataList) {
        WorkerPushData pushData = new WorkerPushData();
        pushData.setId(settleData.getWorkerId());
        pushData.setType(dataType);
        pushData.setData(settleData);
        pushService.push(pushData);
    }
}

// 作业员结算数据提供者接口
private interface WorkerSettleDataProvider {
    // 统计作业员结算数据
    public List<WorkerSettleData> statWorkerSettleData();
}


  ```  
主要收益 
 
  把核心逻辑从各个业务函数中抽析，使业务代码更清晰更易维护；  
  避免重复性代码多次编写，精简重复函数越多收益越大。  
 
 
### 减少函数代码层级 
 
如果要使函数优美，建议函数代码层级在1-4之间，过多的缩进会让函数难以阅读。 
案例一：利用return提前返回函数 
现象描述： 
 ```java 
  // 获取用户余额函数
public Double getUserBalance(Long userId) {
    User user = getUser(userId);
    if (Objects.nonNull(user)) {
        UserAccount account = user.getAccount();
        if (Objects.nonNull(account)) {
            return account.getBalance();
        }
    }
    return null;
}


  ```  
建议方案： 
 ```java 
  // 获取用户余额函数
public Double getUserBalance(Long userId) {
    // 获取用户信息
    User user = getUser(userId);
    if (Objects.isNull(user)) {
        return null;
    }

    // 获取用户账户
    UserAccount account = user.getAccount();
    if (Objects.isNull(account)) {
        return null;
    }

    // 返回账户余额
    return account.getBalance();
}


  ```  
案例二：利用continue提前结束循环 
现象描述： 
 ```java 
  // 获取合计余额函数
public double getTotalBalance(List<User> userList) {
    // 初始合计余额
    double totalBalance = 0.0D;

    // 依次累加余额
    for (User user : userList) {
        // 获取用户账户
        UserAccount account = user.getAccount();
        if (Objects.nonNull(account)) {
            // 累加用户余额
            Double balance = account.getBalance();
            if (Objects.nonNull(balance)) {
                totalBalance += balance;
            }
        }
    }

    // 返回合计余额
    return totalBalance;
}


  ```  
建议方案： 
 ```java 
  // 获取合计余额函数
public double getTotalBalance(List<User> userList) {
    // 初始合计余额
    double totalBalance = 0.0D;

    // 依次累加余额
    for (User user : userList) {
        // 获取用户账户
        UserAccount account = user.getAccount();
        if (Objects.isNull(account)) {
            continue;
        }

        // 累加用户余额
        Double balance = account.getBalance();
        if (Objects.nonNull(balance)) {
            totalBalance += balance;
        }
    }

    // 返回合计余额
    return totalBalance;
}


  ```  
特殊说明 
其它方式：在循环体中，先调用案例1的函数getUserBalance(获取用户余额)，再进行对余额进行累加。 
在循环体中，建议最多使用一次continue。如果需要有使用多次continue的需求，建议把循环体封装为一个函数。 
案例三：利用条件表达式函数减少层级 
请参考下一章的"案例2: 把复杂条件表达式封装为函数" 
主要收益 
 
  代码层级减少，代码缩进减少；  
  模块划分清晰，方便阅读维护。  
 
 
### 封装条件表达式函数 
 
案例一：把简单条件表达式封装为函数 
现象描述： 
 ```java 
  // 获取门票价格函数
public double getTicketPrice(Date currDate) {
    if (Objects.nonNull(currDate) && currDate.after(DISCOUNT_BEGIN_DATE)
        && currDate.before(DISCOUNT_END_DATE)) {
        return TICKET_PRICE * DISCOUNT_RATE;
    }
    return TICKET_PRICE;
}


  ```  
建议方案： 
 ```java 
  // 获取门票价格函数
public double getTicketPrice(Date currDate) {
    if (isDiscountDate(currDate)) {
        return TICKET_PRICE * DISCOUNT_RATE;
    }
    return TICKET_PRICE;
}

// 是否折扣日期函数
private static boolean isDiscountDate(Date currDate) {
    return Objects.nonNull(currDate) && 
currDate.after(DISCOUNT_BEGIN_DATE)
        && currDate.before(DISCOUNT_END_DATE);
}


  ```  
案例二：把复杂条件表达式封装为函数 
现象描述： 
 ```java 
  // 获取土豪用户列表
public List<User> getRichUserList(List<User> userList) {
    // 初始土豪用户列表
    List<User> richUserList = new ArrayList<>();

    // 依次查找土豪用户
    for (User user : userList) {
        // 获取用户账户
        UserAccount account = user.getAccount();
        if (Objects.nonNull(account)) {
            // 判断用户余额
            Double balance = account.getBalance();
            if (Objects.nonNull(balance) && balance.compareTo(RICH_THRESHOLD) >= 0) {
                // 添加土豪用户
                richUserList.add(user);
            }
        }
    }

    // 返回土豪用户列表
    return richUserList;
}


  ```  
建议方案： 
 ```java 
  // 获取土豪用户列表
public List<User> getRichUserList(List<User> userList) {
    // 初始土豪用户列表
    List<User> richUserList = new ArrayList<>();

    // 依次查找土豪用户
    for (User user : userList) {
        // 判断土豪用户
        if (isRichUser(user)) {
            // 添加土豪用户
            richUserList.add(user);
        }
    }

    // 返回土豪用户列表
    return richUserList;
}

// 是否土豪用户
private boolean isRichUser(User user) {
    // 获取用户账户
    UserAccount account = user.getAccount();
    if (Objects.isNull(account)) {
        return false;
    }

    // 获取用户余额
    Double balance = account.getBalance();
    if (Objects.isNull(balance)) {
        return false;
    }

    // 比较用户余额
    return balance.compareTo(RICH_THRESHOLD) >= 0;
}


  ```  
以上代码也可以用采用流式(Stream)编程的过滤来实现。 
主要收益 
 
  把条件表达式从业务函数中独立，使业务逻辑更清晰；  
  封装的条件表达式为独立函数，可以在代码中重复使用。  
 
 
### 尽量避免不必要的空指针判断 
 
本章只适用于项目内部代码，并且是自己了解的代码，才能够尽量避免不必要的空指针判断。对于第三方中间件和系统接口，必须做好空指针判断，以保证代码的健壮性。 
案例一：调用函数保证参数不为空，被调用函数尽量避免不必要的空指针判断 
现象描述： 
 ```java 
  // 创建用户信息
User user = new User();
... // 赋值用户相关信息
createUser(user);

// 创建用户函数
private void createUser(User user){
    // 判断用户为空
    if(Objects.isNull(user)) {
        return;
    }

    // 创建用户信息
    userDAO.insert(user);
    userRedis.save(user);
}


  ```  
建议方案： 
 ```java 
  // 创建用户信息
User user = new User();
... // 赋值用户相关信息
createUser(user);

// 创建用户函数
private void createUser(User user){
    // 创建用户信息
    userDAO.insert(user);
    userRedis.save(user);
}


  ```  
案例二：被调用函数保证返回不为空,调用函数尽量避免不必要的空指针判断 
现象描述： 
 ```java 
  // 保存用户函数
public void saveUser(Long id, String name) {
    // 构建用户信息
    User user = buildUser(id, name);
    if (Objects.isNull(user)) {
        throw new BizRuntimeException("构建用户信息为空");
    }

    // 保存用户信息
    userDAO.insert(user);
    userRedis.save(user);
}

// 构建用户函数
private User buildUser(Long id, String name) {
    User user = new User();
    user.setId(id);
    user.setName(name);
    return user;
}


  ```  
建议方案： 
 ```java 
  // 保存用户函数
public void saveUser(Long id, String name) {
    // 构建用户信息
    User user = buildUser(id, name);

    // 保存用户信息
    userDAO.insert(user);
    userRedis.save(user);
}

// 构建用户函数
private User buildUser(Long id, String name) {
    User user = new User();
    user.setId(id);
    user.setName(name);
    return user;
}


  ```  
案例三：赋值逻辑保证列表数据项不为空，处理逻辑尽量避免不必要的空指针判断 
现象描述： 
 ```java 
  // 查询用户列表
List<UserDO> userList = userDAO.queryAll();
if (CollectionUtils.isEmpty(userList)) {
    return;
}

// 转化用户列表
List<UserVO> userVoList = new ArrayList<>(userList.size());
for (UserDO user : userList) {
    UserVO userVo = new UserVO();
    userVo.setId(user.getId());
    userVo.setName(user.getName());
    userVoList.add(userVo);
}

// 依次处理用户
for (UserVO userVo : userVoList) {
    // 判断用户为空
    if (Objects.isNull(userVo)) {
        continue;
    }

    // 处理相关逻辑
    ...
}


  ```  
建议方案： 
 ```java 
  // 查询用户列表
List<UserDO> userList = userDAO.queryAll();
if (CollectionUtils.isEmpty(userList)) {
    return;
}

// 转化用户列表
List<UserVO> userVoList = new ArrayList<>(userList.size());
for (UserDO user : userList) {
    UserVO userVo = new UserVO();
    userVo.setId(user.getId());
    userVo.setName(user.getName());
    userVoList.add(userVo);
}

// 依次处理用户
for (UserVO userVo : userVoList) {
    // 处理相关逻辑
    ...
}


  ```  
案例四：MyBatis查询函数返回列表和数据项不为空，可以不用空指针判断 
MyBatis是一款优秀的持久层框架，是在项目中使用的最广泛的数据库中间件之一。通过对MyBatis源码进行分析，查询函数返回的列表和数据项都不为空，在代码中可以不用进行空指针判断。 
现象描述： 
这种写法没有问题，只是过于保守了。 
 ```java 
  // 查询用户函数
public List<UserVO> queryUser(Long id, String name) {
    // 查询用户列表
    List<UserDO> userList = userDAO.query(id, name);
    if (Objects.isNull(userList)) {
        return Collections.emptyList();
    }

    // 转化用户列表
    List<UserVO> voList = new ArrayList<>(userList.size());
    for (UserDO user : userList) {
        // 判断对象为空
        if (Objects.isNull(user)) {
            continue;
        }

        // 添加用户信息
        UserVO vo = new UserVO();
        BeanUtils.copyProperties(user, vo);
        voList.add(vo);
    }

    // 返回用户列表
    return voList;
}


  ```  
建议方案： 
 ```java 
  // 查询用户函数
public List<UserVO> queryUser(Long id, String name) {
    // 查询用户列表
    List<UserDO> userList = userDAO.query(id, name);

    // 转化用户列表
    List<UserVO> voList = new ArrayList<>(userList.size());
    for (UserDO user : userList) {
        UserVO vo = new UserVO();
        BeanUtils.copyProperties(user, vo);
        voList.add(vo);
    }

    // 返回用户列表
    return voList;
}


  ```  
主要收益 
 
  避免不必要的空指针判断，精简业务代码处理逻辑，提高业务代码运行效率；  
  这些不必要的空指针判断，基本属于永远不执行的Death代码，删除有助于代码维护。  
 
![Test](https://oscimg.oschina.net/oscnet/d882d2b4a94c33e151ad72b515bcb243bba.jpg  '编码规范 - Java函数优雅之道（上）') 
关注高德技术，找到更多出行技术领域专业内容
                                        