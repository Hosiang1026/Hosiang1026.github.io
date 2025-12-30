---
title: Solidity映射类型
categories: 区块链与以太坊开发系列
tags:
  - TypeScript
  - JavaScript
  - Solidity
abbrlink: c29026e9
date: 2024-11-23 00:00:00
top: 25
---

映射（Mapping）是Solidity中最常用的数据结构之一，类似于哈希表，用于存储键值对。本文详细介绍映射的定义、特性、使用方法和实际应用场景。

<!-- more -->

![Solidity Mapping](https://hosiang1026.github.io/photos/image/2024/12/15/10s6uva.jpg "Solidity映射类型")

---

## 一、什么是映射

### 一、1 基本概念

```
映射（Mapping）是Solidity中的键值对存储结构，类似于其他语言中的哈希表或字典。映射使用键来查找对应的值，提供O(1)的查找效率。
```

### 二、2 映射的特点

```
键值对存储：
```
- 使用键查找值
- 高效的查找性能
- 自动初始化
- 无法遍历

```
自动初始化：
```
- 所有可能的键都已初始化
- 不存在的键返回默认值
- 整数类型返回0
- 布尔类型返回false

```
无法遍历：
```
- 不能直接遍历所有键
- 需要额外维护键列表
- 适合快速查找
- 不适合需要遍历的场景

## 二、如何定义和使用映射

### 三、1 基本定义

```
简单映射：
```
```solidity
pragma solidity ^0.8.0;

contract MappingExample {
    // 地址到余额的映射
    mapping(address => uint256) public balances;
    // 嵌套映射：所有者到授权者到授权金额
    mapping(address => mapping(address => uint256)) public allowances;
    // ID到名称的映射
    mapping(uint256 => string) public names;
}

```

```
映射语法：
- `mapping(键类型 => 值类型)`
```
- 键类型可以是值类型
- 值类型可以是任何类型
- 可以嵌套映射

### 四、2 基本操作

```java
设置值：
// 设置账户余额
function setBalance(address account, uint256 amount) public {
    balances[account] = amount;
```
}

```java
// 设置授权金额
function setAllowance(address owner, address spender, uint256 amount) public {
    allowances[owner][spender] = amount;
```
}
`获取值：`solidity
```java
// 获取账户余额，不存在返回0
function getBalance(address account) public view returns (uint256) {
    return balances[account];
```
}

```java
// 获取授权金额
function getAllowance(address owner, address spender) public view returns (uint256) {
    return allowances[owner][spender];
```
}
`检查存在：`solidity
```java
// 检查账户是否有余额
function hasBalance(address account) public view returns (bool) {
    return balances[account] > 0;
```
}
```

### 五、3 嵌套映射

二维映射：
// ERC20代币的授权映射

// 授权函数：允许spender使用owner的代币
function approve(address spender, uint256 amount) public {
    allowances[msg.sender][spender] = amount;
}

// 授权转账函数：从from账户转账给to账户
function transferFrom(
    address from,
    address to,
    uint256 amount
) public {
    // 检查授权金额是否足够
    require(allowances[from][msg.sender] >= amount, "Insufficient allowance");
    // 检查余额是否足够
    require(balances[from] >= amount, "Insufficient balance");
    
    // 减少授权金额
    allowances[from][msg.sender] -= amount;
    // 减少发送者余额
    balances[from] -= amount;
    // 增加接收者余额
    balances[to] += amount;
}
`三维映射：`solidity
// 用户到级别到操作到权限的映射
mapping(address => mapping(uint256 => mapping(string => bool))) public permissions;

// 设置权限
function setPermission(address user, uint256 level, string memory action) public {
    permissions[user][level][action] = true;
}
```

## 三、应用场景

### 六、1 ERC20代币

```
余额和授权：
contract ERC20Token {
    // 账户余额映射
    // 授权映射：owner授权给spender的金额
```
    
```java
    // 转账函数
    function transfer(address to, uint256 amount) public returns (bool) {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        return true;
```
    }
    
```java
    // 授权函数
    function approve(address spender, uint256 amount) public returns (bool) {
```
    }
    
```java
    // 授权转账函数
    ) public returns (bool) {
```
        
    }

```

### 七、2 投票系统

投票记录：
contract Voting {
    // 记录用户是否已投票
    mapping(address => bool) public hasVoted;
    // 记录每个提案的得票数
    mapping(uint256 => uint256) public voteCounts;
    // 记录用户的投票选择
    mapping(address => uint256) public userVotes;
    
    // 投票函数
    function vote(uint256 proposalId) public {
        require(!hasVoted[msg.sender], "Already voted");
        // 标记已投票
        hasVoted[msg.sender] = true;
        // 记录投票选择
        userVotes[msg.sender] = proposalId;
        // 增加提案得票数
        voteCounts[proposalId]++;
    }
    
    // 获取提案得票数
    function getVoteCount(uint256 proposalId) public view returns (uint256) {
        return voteCounts[proposalId];
    }

```

### 八、3 权限管理

```java
角色权限：
contract AccessControl {
    // 管理员映射
    mapping(address => bool) public isAdmin;
    // 版主映射
    mapping(address => bool) public isModerator;
    // 用户到操作到权限的映射
    mapping(address => mapping(string => bool)) public permissions;
```
    
```java
    // 授予管理员权限
    function grantAdmin(address user) public {
        require(isAdmin[msg.sender], "Not admin");
        isAdmin[user] = true;
```
    }
    
```java
    // 授予操作权限
    function grantPermission(address user, string memory action) public {
        permissions[user][action] = true;
```
    }
    
```java
    // 检查是否有权限
    function hasPermission(address user, string memory action) public view returns (bool) {
        return isAdmin[user] || permissions[user][action];
```
    }

```

### 九、4 用户数据

用户信息：
contract UserData {
    struct UserInfo {
        string name;
        uint256 registrationTime;
        bool isActive;
    }
    
    // 地址到用户信息的映射
    mapping(address => UserInfo) public users;
    // 名称到地址的映射
    mapping(string => address) public nameToAddress;
    
    // 注册函数
    function register(string memory name) public {
        require(users[msg.sender].registrationTime == 0, "Already registered");
        require(nameToAddress[name] == address(0), "Name taken");
        
        users[msg.sender] = UserInfo({
            name: name,
            registrationTime: block.timestamp,
            isActive: true
        });
        
        nameToAddress[name] = msg.sender;
    }

```

## 四、遍历映射的解决方案

### 十、1 维护键列表

```java
可遍历映射：
contract IterableMapping {
    // 维护所有账户地址列表
    address[] public accountList;
```
    
```
    // 设置余额，同时维护账户列表
        // 如果账户余额为0且新金额不为0，添加到列表
        if (balances[account] == 0 && amount != 0) {
            accountList.push(account);
```
        }
```
        // 如果金额为0，从列表中移除
        if (amount == 0) {
            removeAccount(account);
```
        }
    
```javascript
    // 从列表中移除账户
    function removeAccount(address account) internal {
        for (uint256 i = 0; i < accountList.length; i++) {
            if (accountList[i] == account) {
                // 用最后一个元素替换当前元素
                accountList[i] = accountList[accountList.length - 1];
                // 移除最后一个元素
                accountList.pop();
                break;
```
            }
    
```java
    // 获取所有账户
    function getAllAccounts() public view returns (address[] memory) {
        return accountList;
```
    }
    
```java
    // 计算总余额
    function getTotalBalance() public view returns (uint256) {
        uint256 total = 0;
            total += balances[accountList[i]];
```
        }
```
        return total;
```
    }

```

### 十一、2 使用数组索引

索引映射：
contract IndexedMapping {
    // 索引到地址的映射
    mapping(uint256 => address) public indexToAddress;
    // 地址到索引的映射
    mapping(address => uint256) public addressToIndex;
    uint256 public accountCount;
    
    // 添加账户
    function addAccount(address account) public {
        require(addressToIndex[account] == 0, "Account exists");
        accountCount++;
        indexToAddress[accountCount] = account;
        addressToIndex[account] = accountCount;
    }
    
    // 获取所有余额
    function getAllBalances() public view returns (uint256[] memory) {
        uint256[] memory result = new uint256[](accountCount);
        for (uint256 i = 1; i <= accountCount; i++) {
            result[i - 1] = balances[indexToAddress[i]];
        }
        return result;
    }

```

## 五、最佳实践

### 十二、1 Gas优化

```java
减少存储操作：
// 批量更新余额
function batchUpdate(address[] memory accounts, uint256[] memory amounts) public {
    require(accounts.length == amounts.length, "Arrays length mismatch");
    for (uint256 i = 0; i < accounts.length; i++) {
        balances[accounts[i]] = amounts[i];
```
    }
`使用packed storage：`solidity
```
// 打包数据结构，节省存储空间
struct PackedData {
    uint128 value1;  // 128位，可以打包到同一存储槽
    uint128 value2;
```
}

```java
mapping(address => PackedData) public packedBalances;
```
```

### 十三、2 安全考虑

输入验证：
    require(account != address(0), "Invalid address");
    require(amount <= type(uint128).max, "Amount too large");
}
`重入保护：`solidity
bool private locked;

// 防止重入攻击的修改器
modifier nonReentrant() {
    require(!locked, "Reentrant call");
    locked = true;
    _;
    locked = false;
}

// 提现函数，使用重入保护
function withdraw(uint256 amount) public nonReentrant {
    payable(msg.sender).transfer(amount);
}
```

### 十四、3 设计模式

```java
工厂模式：
mapping(address => bool) public isContract;
mapping(address => address) public contractOwner;
```

```java
// 部署新合约
function deployContract() public returns (address) {
    address newContract = address(new MyContract());
    isContract[newContract] = true;
    contractOwner[newContract] = msg.sender;
    return newContract;
```
}

```

## 六、常见问题

### 十五、1 无法遍历

问题：
- 映射无法直接遍历
- 需要维护额外列表
- 增加Gas消耗

解决：
- 维护键数组
- 使用索引映射
- 考虑使用数组替代
- 根据需求选择

### 十六、2 默认值问题

- 可能误判存在性
- 需要额外检查

- 使用单独的存在性映射
- 检查特定值（如0）
- 使用结构体包装
- 明确处理默认值

## 七、总结

映射是Solidity中最重要和常用的数据结构之一。关键要点：

基本特性：
- 键值对存储
- 高效查找

应用场景：
- ERC20代币
- 投票系统
- 权限管理
- 用户数据

最佳实践：
- 合理设计结构
- 优化Gas消耗
- 注意安全考虑
- 处理遍历需求

通过深入理解映射的特性，可以高效地组织和管理数据，构建各种复杂的智能合约应用。
