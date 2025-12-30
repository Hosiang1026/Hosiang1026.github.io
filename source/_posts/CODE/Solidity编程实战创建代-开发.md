---
title: Solidity编程实战创建代
categories: 区块链与以太坊开发系列
tags:
  - TypeScript
  - JavaScript
  - Solidity
abbrlink: b4b33b79
date: 2023-04-11 00:00:00
top: 7
---

创建自己的代币是学习智能合约开发的重要实践。本文通过实现一个完整的ERC20代币合约，详细介绍代币的发行、转账、授权等核心功能，帮助开发者掌握代币合约的开发。

<!-- more -->

![Create Token](https://hosiang1026.github.io/photos/image/2024/12/15/10s6uva.jpg "Solidity编程实战-创建代币")

---

## 一、什么是代币

### 1.1 基本概念

代币（Token）是基于区块链发行的数字资产，可以代表价值、权益或功能。ERC20是以太坊上最常用的代币标准，定义了代币的基本接口和功能。

### 1.2 代币的特点

```
**标准化**：
```
- 遵循ERC20标准
- 兼容各种钱包和交易所
- 统一的接口规范
- 易于集成

```
**可编程**：
```
- 自定义发行规则
- 实现特殊功能
- 灵活的权限控制
- 丰富的应用场景

```
**去中心化**：
```
- 无需中心化机构
- 自动执行规则
- 透明可审计
- 降低信任成本

## 二、ERC20标准

### 2.1 标准接口

```
**必需函数**：
```
```solidity
interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}
`**标准事件**：`solidity
event Transfer(address indexed from, address indexed to, uint256 value);
event Approval(address indexed owner, address indexed spender, uint256 value);
```

### 2.2 可选功能

```
**元数据**：
```
- name：代币名称
- symbol：代币符号
- decimals：小数位数

```
**其他功能**：
```
- 增发/销毁
- 暂停功能
- 黑名单
- 税费机制

## 三、如何实现代币

### 3.1 基础实现

```
**简单代币**：
pragma solidity ^0.8.0;
```

```java
contract SimpleToken {
    string public name = "My Token";
    string public symbol = "MTK";
    uint8 public decimals = 18;
    uint256 public totalSupply;
```
    
```java
    // 账户余额映射
    mapping(address => uint256) public balances;
    // 授权映射：owner授权给spender的金额
    mapping(address => mapping(address => uint256)) public allowances;
```
    
```
    // 转账事件
    // 授权事件
```
    
```javascript
    // 构造函数：初始化代币
    constructor(uint256 _initialSupply) {
        totalSupply = _initialSupply * 10**decimals;
        // 将所有代币分配给部署者
        balances[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
```
    }
    
```java
    // 查询账户余额
    function balanceOf(address account) public view returns (uint256) {
        return balances[account];
```
    }
    
```java
    // 转账函数：从调用者账户转账给to账户
    function transfer(address to, uint256 amount) public returns (bool) {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        // 减少发送者余额
        balances[msg.sender] -= amount;
        // 增加接收者余额
        balances[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
```
    }
    
```java
    // 授权函数：允许spender使用调用者的代币
    function approve(address spender, uint256 amount) public returns (bool) {
        allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
```
    }
    
```java
    // 查询授权金额
    function allowance(address owner, address spender) public view returns (uint256) {
        return allowances[owner][spender];
```
    }
    
```java
    // 授权转账函数：从from账户转账给to账户（需要授权）
    function transferFrom(address from, address to, uint256 amount) public returns (bool) {
        require(balances[from] >= amount, "Insufficient balance");
        require(allowances[from][msg.sender] >= amount, "Insufficient allowance");
```
        
```python
        // 减少授权金额
        allowances[from][msg.sender] -= amount;
        balances[from] -= amount;
```
        
```python
        emit Transfer(from, to, amount);
```
    }

```

### 3.2 完整实现

**功能完整代币**：
contract MyToken {
    string public name;
    string public symbol;
    uint8 public decimals;
    
    address public owner;
    bool public paused;
    
    mapping(address => bool) public blacklisted;
    
    event Mint(address indexed to, uint256 amount);
    event Burn(address indexed from, uint256 amount);
    event Paused(address account);
    event Unpaused(address account);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    modifier whenNotPaused() {
        require(!paused, "Token is paused");
        _;
    }
    
    modifier notBlacklisted(address account) {
        require(!blacklisted[account], "Account is blacklisted");
        _;
    }
    
    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        uint256 _initialSupply
    ) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        owner = msg.sender;
    }
    
    }
    
    // 转账函数：包含暂停和黑名单检查
    function transfer(address to, uint256 amount) 
        public 
        whenNotPaused 
        notBlacklisted(msg.sender)
        notBlacklisted(to)
        returns (bool) 
    {
    }
    
    function approve(address spender, uint256 amount) 
    {
    }
    
    }
    
    function transferFrom(address from, address to, uint256 amount) 
        notBlacklisted(from)
    {
        
        
    }
    
    // 增发代币：只有owner可以调用
    function mint(address to, uint256 amount) public onlyOwner {
        totalSupply += amount;
        emit Mint(to, amount);
        emit Transfer(address(0), to, amount);
    }
    
    // 销毁代币：用户销毁自己的代币
    function burn(uint256 amount) public {
        totalSupply -= amount;
        emit Burn(msg.sender, amount);
        emit Transfer(msg.sender, address(0), amount);
    }
    
    // 暂停代币：只有owner可以调用
    function pause() public onlyOwner {
        paused = true;
        emit Paused(msg.sender);
    }
    
    // 恢复代币：只有owner可以调用
    function unpause() public onlyOwner {
        paused = false;
        emit Unpaused(msg.sender);
    }
    
    // 加入黑名单：只有owner可以调用
    function addToBlacklist(address account) public onlyOwner {
        blacklisted[account] = true;
    }
    
    // 移除黑名单：只有owner可以调用
    function removeFromBlacklist(address account) public onlyOwner {
        blacklisted[account] = false;
    }

```

## 四、如何使用代币

### 4.1 部署代币

```
**部署脚本**：
```
```javascript
const MyToken = await ethers.getContractFactory("MyToken");
const token = await MyToken.deploy(
    "My Token",      // name
    "MTK",           // symbol
    18,              // decimals
    1000000          // initialSupply
);
await token.deployed();
console.log("Token address:", token.address);

```

### 4.2 转账操作

```
**直接转账**：
await token.transfer(recipientAddress, ethers.utils.parseEther("100"));
```

```

**授权转账**：
// 1. 授权：允许spender使用100个代币
await token.approve(spenderAddress, ethers.utils.parseEther("100"));

// 2. 被授权者转账：从owner账户转账给recipient
await token.transferFrom(ownerAddress, recipientAddress, ethers.utils.parseEther("100"));

```

### 4.3 查询信息

```javascript
**查询余额**：
const balance = await token.balanceOf(userAddress);
console.log("Balance:", ethers.utils.formatEther(balance), "MTK");
```
`**查询授权**：```javascript
```javascript
const allowance = await token.allowance(ownerAddress, spenderAddress);
console.log("Allowance:", ethers.utils.formatEther(allowance), "MTK");
```
```

## 五、应用场景

### 5.1 项目代币

**ICO/IDO**：
- 项目融资
- 代币发行
- 投资者分配
- 团队激励

**治理代币**：
- DAO治理
- 投票权
- 提案权
- 收益分配

### 5.2 功能代币

**游戏代币**：
- 游戏内货币
- 道具购买
- 奖励发放
- 交易系统

**积分系统**：
- 用户积分
- 奖励兑换
- 等级系统
- 会员权益

### 5.3 稳定币

**锚定资产**：
- 与法币锚定
- 价格稳定
- 支付工具
- 价值存储

## 六、功能扩展

### 6.1 税费机制

**交易税费**：
uint256 public taxRate = 100; // 1%
address public taxRecipient;

// 带税费的转账函数
    // 计算税费
    uint256 tax = amount * taxRate / 10000;
    // 计算实际转账金额
    uint256 transferAmount = amount - tax;
    
    balances[to] += transferAmount;
    // 税费转入指定账户
    balances[taxRecipient] += tax;
    
    emit Transfer(msg.sender, to, transferAmount);
    emit Transfer(msg.sender, taxRecipient, tax);
}

```

### 6.2 锁仓机制

```java
**时间锁**：
mapping(address => uint256) public lockTime;
mapping(address => uint256) public lockedAmount;
```

```java
// 锁仓函数：锁定代币一段时间
function lock(uint256 amount, uint256 duration) public {
    lockedAmount[msg.sender] += amount;
    // 设置解锁时间
    lockTime[msg.sender] = block.timestamp + duration;
```
}

```java
// 解锁函数：时间到了才能解锁
function unlock() public {
    require(block.timestamp >= lockTime[msg.sender], "Still locked");
    uint256 amount = lockedAmount[msg.sender];
    lockedAmount[msg.sender] = 0;
    balances[msg.sender] += amount;
```
}

```

### 6.3 销毁机制

**自动销毁**：
// 转账时自动销毁一部分代币
    uint256 burnAmount = amount / 100; // 1% 销毁
    uint256 transferAmount = amount - burnAmount;
    
    // 减少总供应量
    totalSupply -= burnAmount;
    
    emit Transfer(msg.sender, address(0), burnAmount);
}

```

## 七、最佳实践

### 7.1 安全考虑

```
**溢出保护**：
```
- 使用0.8.0+版本
- 自动检查溢出
- 无需SafeMath

```java
**重入保护**：
bool private locked;
```

```
// 防止重入攻击的修改器
modifier nonReentrant() {
    require(!locked, "Reentrant call");
    locked = true;
```
    _;
```
    locked = false;
```
}

```

### 7.2 Gas优化

**批量操作**：
// 批量转账：减少交易次数
function batchTransfer(address[] memory recipients, uint256[] memory amounts) public {
    require(recipients.length == amounts.length, "Arrays length mismatch");
    for (uint256 i = 0; i < recipients.length; i++) {
        transfer(recipients[i], amounts[i]);
    }

```

### 7.3 标准兼容

```
**遵循ERC20**：
```
- 实现所有必需函数
- 发出标准事件
- 返回正确的值
- 处理边界情况

## 八、总结

创建代币是掌握智能合约开发的重要实践。关键要点：

```
**核心功能**：
```
- 转账功能
- 授权机制
- 余额查询

```
**标准实现**：
```
- 实现必需函数
- 兼容各种应用

```
**功能扩展**：
```
- 锁仓机制

通过实现代币合约，可以深入理解ERC20标准，掌握智能合约的核心功能，为开发更复杂的DeFi应用打下基础。
