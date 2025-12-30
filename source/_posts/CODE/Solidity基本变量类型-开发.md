---
title: Solidity基本变量类型
categories: 区块链与以太坊开发系列
tags:
  - TypeScript
  - Solidity
abbrlink: b3a43b6b
date: 2023-05-15 00:00:00
top: 8
---

Solidity中的变量类型分为值类型和引用类型两大类。值类型包括整数、布尔、地址等，引用类型包括数组、映射、结构体等。本文详细介绍Solidity的各种基本变量类型及其使用方法。

<!-- more -->

![Solidity变量类型](https://hosiang1026.github.io/photos/image/2024/12/15/10s6uva.jpg "Solidity基本变量类型")

---

## 一、值类型（Value Types）

### 1.1 整数类型

Solidity支持有符号和无符号整数，支持从8位到256位的多种长度。

```
**无符号整数（uint）：**
```
```solidity
uint8 a = 255;      // 8位，范围 0-255
uint16 b = 65535;   // 16位，范围 0-65535
uint256 c = 100;    // 256位，范围 0-2^256-1
uint d = 100;       // 默认是 uint256
```

```
**有符号整数（int）：**
```
```solidity
int8 a = -128;      // 8位，范围 -128 到 127
int16 b = 32767;    // 16位，范围 -32768 到 32767
int256 c = -100;    // 256位
int d = -100;       // 默认是 int256
```

```
**整数运算：**
```
```solidity
uint a = 10;
uint b = 3;
uint c = a + b;     // 加法：13
uint d = a - b;     // 减法：7
uint e = a * b;     // 乘法：30
uint f = a / b;     // 除法：3（整数除法）
uint g = a % b;     // 取模：1
uint h = a ** 2;    // 幂运算：100
```

### 1.2 布尔类型（bool）

布尔类型只有两个值：`true` 和 `false`。

```solidity
bool public isActive = true;
bool public isPaused = false;

function toggle() public {
    isActive = !isActive;  // 取反操作
}
```

### 1.3 地址类型（address）

地址类型用于存储以太坊地址，长度为20字节。

```solidity
address public owner;
address payable public recipient;

// 地址类型转换
address addr = 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb;
address payable payableAddr = payable(addr);

// 地址属性
uint256 balance = addr.balance;  // 获取余额
```

```
**地址成员：**
```
- `balance`：地址的余额（wei）
```
- `transfer()`：转账函数
- `send()`：转账函数（返回bool）
- `call()`：底层调用函数
```

### 1.4 字节类型（bytes）

Solidity支持固定长度和动态长度的字节数组。

```
**固定长度字节：**
```
```solidity
bytes1 a = 0x41;      // 1字节
bytes2 b = 0x4142;   // 2字节
bytes32 c = 0x41;    // 32字节
```

```
**动态长度字节：**
```
```solidity
bytes public data = "Hello";
bytes public hexData = hex"414243";
```

### 1.5 字符串类型（string）

字符串是动态长度的UTF-8编码字节数组。

```solidity
string public name = "Solidity";
string public message = "Hello, World!";

// 字符串操作
function getLength(string memory str) public pure returns (uint) {
    return bytes(str).length;
}
```

### 1.6 枚举类型（enum）

枚举类型用于定义一组命名的常量。

```solidity
enum Status {
    Pending,
    Approved,
    Rejected
}

Status public currentStatus = Status.Pending;

function approve() public {
    currentStatus = Status.Approved;
}
```

## 二、引用类型（Reference Types）

### 2.1 数组（Array）

```
**固定长度数组：**
```
```solidity
uint[5] public fixedArray;  // 固定长度5的数组
uint[3] public numbers = [1, 2, 3];
```

```
**动态数组：**
```
```solidity
uint[] public dynamicArray;
uint[] public values = [10, 20, 30];

// 数组操作
function addValue(uint value) public {
    values.push(value);  // 添加元素
}

function getLength() public view returns (uint) {
    return values.length;  // 获取长度
}
```

```
**多维数组：**
```
```solidity
uint[2][3] public matrix;  // 3行2列的二维数组
uint[][] public dynamicMatrix;
```

### 2.2 映射（Mapping）

映射是键值对存储结构，类似于哈希表。

```solidity
mapping(address => uint256) public balances;
mapping(string => bool) public isRegistered;
mapping(uint => mapping(uint => bool)) public nestedMapping;

// 使用示例
function setBalance(address account, uint256 amount) public {
    balances[account] = amount;
}

function getBalance(address account) public view returns (uint256) {
    return balances[account];
}
```

### 2.3 结构体（Struct）

结构体用于组合多个不同类型的字段。

```solidity
struct Person {
    string name;
    uint age;
    address wallet;
}

Person public person;

function createPerson(string memory _name, uint _age) public {
    person = Person({
        name: _name,
        age: _age,
        wallet: msg.sender
    });
}
```

## 三、存储位置（Data Location）

Solidity中的引用类型必须指定存储位置：`storage`、`memory` 或 `calldata`。

### 3.1 Storage

`storage` 是永久存储，存储在区块链上。

```solidity
uint[] storageArray;

function modifyStorage() public {
    uint[] storage localRef = storageArray;  // 引用，修改会影响原数组
    localRef.push(100);
}
```

### 3.2 Memory

`memory` 是临时存储，函数执行完后清除。

```solidity
function processMemory() public pure returns (uint[] memory) {
    uint[] memory tempArray = new uint[](3);
    tempArray[0] = 1;
    tempArray[1] = 2;
    tempArray[2] = 3;
    return tempArray;
}
```

### 3.3 Calldata

`calldata` 是只读的，用于函数参数。

```solidity
function processCalldata(uint[] calldata data) public pure returns (uint) {
    return data.length;  // 只能读取，不能修改
}
```

## 四、类型转换

### 4.1 隐式转换

```solidity
uint8 a = 100;
uint16 b = a;  // 隐式转换：uint8 -> uint16
```

### 4.2 显式转换

```solidity
uint256 a = 1000;
uint8 b = uint8(a);  // 显式转换，可能溢出

address addr = 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb;
address payable payableAddr = payable(addr);
```

### 4.3 类型检查

```solidity
function checkType(uint256 value) public pure returns (bool) {
    require(value <= type(uint8).max, "Value too large");
    return true;
}
```

## 五、变量作用域

### 5.1 状态变量

状态变量存储在区块链上，永久保存。

```solidity
contract MyContract {
    uint256 public stateVar;  // 状态变量
    
    function setState(uint256 value) public {
        stateVar = value;
    }
}
```

### 5.2 局部变量

局部变量只在函数执行期间存在。

```solidity
function calculate() public pure returns (uint256) {
    uint256 localVar = 100;  // 局部变量
    return localVar * 2;
}
```

### 5.3 全局变量

Solidity提供了一些全局变量和函数。

```solidity
function getGlobalInfo() public view returns (
    address,
    uint256,
    uint256
) {
    return (
        msg.sender,      // 调用者地址
        block.timestamp, // 当前区块时间戳
        block.number     // 当前区块号
    );
}
```

## 六、最佳实践

### 6.1 选择合适的数据类型

- 使用 `uint8` 而不是 `uint256` 如果值范围允许
- 使用 `bytes32` 而不是 `string` 如果长度固定
- 使用 `mapping` 而不是数组如果不需要遍历

### 6.2 避免溢出

```solidity
// 使用 SafeMath 或 Solidity 0.8+ 的内置检查
uint256 a = 100;
uint256 b = 200;
uint256 c = a + b;  // Solidity 0.8+ 自动检查溢出
```

### 6.3 合理使用存储位置

```solidity
// 在函数参数中使用 calldata 而不是 memory（更省gas）
function process(uint[] calldata data) public {
    // ...
}

// 在函数内部使用 memory 创建临时数组
function createTemp() public pure returns (uint[] memory) {
    uint[] memory temp = new uint[](10);
    return temp;
}
```

## 七、总结

Solidity的变量类型系统提供了丰富的选择：

```
**值类型特点：**
```
- 直接存储值
- 复制时创建新副本
- 包括整数、布尔、地址、字节等

```
**引用类型特点：**
```
- 存储引用
- 需要指定存储位置
- 包括数组、映射、结构体等

```
**存储位置选择：**
```
- `storage`：永久存储，修改会影响原数据
- `memory`：临时存储，函数执行完清除
- `calldata`：只读，用于函数参数

合理选择变量类型和存储位置，可以优化gas消耗并提高代码可读性。
