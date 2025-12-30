---
title: NodeJS开发环境配置入门
categories: 开发环境配置全攻略系列
tags:
  - JavaScript
abbrlink: b3bcc299
date: 2018-11-16 00:00:00
top: 3
---

Node.js是基于Chrome V8引擎的JavaScript运行环境，采用事件驱动、非阻塞式I/O模型，具有轻量高效的特点。npm作为Node.js的包管理器，是全球最大的开源库生态系统

<!-- more -->

![NodeJS](/images/gAhSjg.jpg "NodeJS开发环境配置-入门篇")

### 一、Node.js简介

#### 1.1 什么是Node.js

Node.js是一个基于Chrome V8引擎的JavaScript运行时环境，允许在服务器端运行JavaScript代码。它采用事件驱动、非阻塞I/O模型，使其轻量且高效，非常适合构建数据密集型的实时应用。

```
**Node.js的特点：**
```
- **单线程事件循环**：高效的异步I/O处理
- **跨平台**：支持Windows、macOS、Linux
- **丰富的生态系统**：npm拥有数百万个开源包
- **快速开发**：JavaScript全栈开发

#### 1.2 Node.js应用场景

- **Web服务器**：构建RESTful API、Web应用
- **实时应用**：聊天应用、在线游戏、协作工具
- **命令行工具**：开发工具、构建工具
- **微服务**：构建微服务架构
- **IoT应用**：物联网设备开发

### 二、安装Node.js

#### 2.1 下载安装包

```
**官方下载地址：**
```
- **Node.js官网**：https://nodejs.org/
- **Node.js中文网**：http://nodejs.cn/download/

```
**版本选择：**
```
- **LTS版本（推荐）**：长期支持版本，稳定可靠
- **Current版本**：最新特性版本，可能不够稳定

```
**下载步骤：**
```
1. 访问Node.js官网
2. 选择适合操作系统的安装包（Windows/macOS/Linux）
3. 选择LTS版本（推荐）或Current版本
4. 下载安装程序

#### 2.2 Windows平台安装

```
**安装步骤：**
```

1. **运行安装程序**
   - 双击下载的`.msi`安装文件
   - 按照安装向导完成安装
   - 默认安装路径：`C:\Program Files\nodejs\`

2. **安装选项**
   - 勾选"Automatically install the necessary tools"（自动安装必要工具）
   - 这会自动安装Python和Visual Studio构建工具（用于编译原生模块）

3. **验证安装**
   ```bash
   # 打开命令提示符（cmd）或PowerShell
   # 检查Node.js版本
   node -v
   # 或
   node --version
   
   # 检查npm版本
   npm -v
   # 或
   npm --version
   ```

4. **配置环境变量（通常自动配置）**
   - Node.js安装程序会自动将Node.js添加到系统PATH
   - 如果命令不识别，手动添加：
     - 右键"此电脑" → 属性 → 高级系统设置 → 环境变量
     - 在Path中添加：`C:\Program Files\nodejs\`

#### 2.3 macOS平台安装

```
**方法1：使用安装包**
```

1. 下载`.pkg`安装文件
2. 双击运行，按照向导完成安装
3. 验证安装：`node -v` 和 `npm -v`

```
**方法2：使用Homebrew（推荐）**
```

```bash
# 安装Homebrew（如果未安装）
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 使用Homebrew安装Node.js
brew install node

# 验证安装
node -v
npm -v
```

#### 2.4 Linux平台安装

```
**Ubuntu/Debian：**
```

```bash
# 使用NodeSource仓库安装
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node -v
npm -v
```

```
**CentOS/RHEL：**
```

```bash
# 使用NodeSource仓库安装
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# 验证安装
node -v
npm -v
```

### 三、npm包管理器

#### 3.1 npm简介

npm（Node Package Manager）是Node.js的包管理器，也是世界上最大的软件注册表。它包含超过100万个代码包，是JavaScript生态系统的重要组成部分。

```
**npm的主要功能：**
```
- 安装和管理依赖包
- 发布自己的包
- 运行脚本任务
- 管理项目配置

#### 3.2 npm基本使用

```
**查看npm信息：**
```

```bash
# 查看npm版本
npm -v

# 查看npm配置
npm config list

# 查看npm全局安装路径
npm root -g
```

```
**安装包：**
```

```bash
# 全局安装（所有项目可用）
npm install -g package-name

# 本地安装（当前项目）
npm install package-name

# 安装到生产依赖
npm install package-name --save
# 或简写
npm install package-name -S

# 安装到开发依赖
npm install package-name --save-dev
# 或简写
npm install package-name -D

# 安装指定版本
npm install package-name@1.2.3

# 安装最新版本
npm install package-name@latest
```

```
**管理依赖：**
```

```bash
# 查看已安装的包
npm list

# 查看全局安装的包
npm list -g --depth=0

# 更新包
npm update package-name

# 更新所有包
npm update

# 卸载包
npm uninstall package-name

# 清理缓存
npm cache clean --force
```

#### 3.3 配置npm镜像源

```
**使用淘宝镜像（推荐国内用户）：**
```

```bash
# 设置镜像源
npm config set registry https://registry.npmmirror.com

# 验证配置
npm config get registry

# 临时使用镜像源
npm install package-name --registry=https://registry.npmmirror.com
```

```
**使用cnpm（可选）：**
```

```bash
# 安装cnpm
npm install -g cnpm --registry=https://registry.npmmirror.com

# 使用cnpm（用法与npm相同）
cnpm install package-name
```

### 四、创建第一个Node.js项目

#### 4.1 初始化项目

```bash
# 创建项目目录
mkdir my-nodejs-project
cd my-nodejs-project

# 初始化npm项目
npm init

# 快速初始化（使用默认值）
npm init -y
```

```
**package.json文件说明：**
```

```json
{
  "name": "my-nodejs-project",
  "version": "1.0.0",
  "description": "我的第一个Node.js项目",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "node index.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

#### 4.2 创建第一个程序

```
**创建index.js文件：**
```

```javascript
// index.js
console.log('Hello, Node.js!');

// 使用内置模块
const http = require('http');

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Hello, Node.js World!');
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
});
```

```
**运行程序：**
```

```bash
# 方式1：直接运行
node index.js

# 方式2：使用npm脚本
npm start
```

#### 4.3 安装常用模块

```
**安装Express框架：**
```

```bash
# 安装Express
npm install express

# 安装Express（旧版本全局安装方式，不推荐）
# npm install -g express-generator
```

```
**使用Express创建简单服务器：**
```

```javascript
// app.js
const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
    res.send('Hello, Express!');
});

app.listen(PORT, () => {
    console.log(`Express服务器运行在 http://localhost:${PORT}`);
});
```

### 五、开发工具集成

#### 5.1 VS Code（推荐）

```
**安装Node.js扩展：**
```

1. 打开VS Code
2. 点击扩展图标（或按`Ctrl+Shift+X`）
3. 搜索"Node.js"并安装
4. 推荐扩展：
   - **Node.js Extension Pack**：Node.js开发工具包
   - **npm**：npm脚本支持
   - **ESLint**：代码检查
   - **Prettier**：代码格式化

```
**配置调试：**
```

创建`.vscode/launch.json`：

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "node",
            "request": "launch",
            "name": "Launch Program",
            "skipFiles": ["<node_internals>/**"],
            "program": "${workspaceFolder}/index.js"
        }
    ]
}
```

#### 5.2 IntelliJ IDEA / WebStorm

```
**配置Node.js：**
```

1. File → Settings → Languages & Frameworks → Node.js
2. 选择Node.js解释器路径
3. 配置npm包管理器

```
**运行和调试：**
```

1. 右键JavaScript文件 → Run 'index.js'
2. 或创建运行配置：Run → Edit Configurations

#### 5.3 热重载工具

```
**使用nodemon（推荐）：**
```

```bash
# 全局安装
npm install -g nodemon

# 使用nodemon运行
nodemon index.js

# 或配置到package.json
{
  "scripts": {
    "dev": "nodemon index.js"
  }
}
```

```
**使用supervisor：**
```

```bash
# 全局安装
npm install -g supervisor

# 使用supervisor运行
supervisor index.js
```

### 六、常见问题解决

#### 6.1 安装问题

```
**问题1：npm命令不识别**
```

```
**解决方案：**
```
- 检查Node.js是否正确安装
- 检查环境变量PATH是否包含Node.js路径
- 重启命令行窗口或重启电脑

```
**问题2：权限错误（macOS/Linux）**
```

```
**解决方案：**
```
```bash
# 使用sudo（不推荐）
sudo npm install -g package-name

# 推荐：配置npm全局目录
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
# 添加到PATH: export PATH=~/.npm-global/bin:$PATH
```

#### 6.2 配置问题

```
**问题1：npm安装缓慢**
```

```
**解决方案：**
```
```bash
# 使用国内镜像
npm config set registry https://registry.npmmirror.com

# 或使用yarn
npm install -g yarn
yarn config set registry https://registry.npmmirror.com
```

```
**问题2：模块找不到**
```

```
**解决方案：**
```
```bash
# 检查node_modules是否存在
ls node_modules

# 重新安装依赖
rm -rf node_modules package-lock.json
npm install
```

### 七、下一步学习

通过本文的学习，您已经掌握了Node.js开发环境的基础配置。接下来您可以：

1. **学习Node.js核心模块**：fs、path、http等
2. **学习Express框架**：构建Web应用
3. **学习npm高级用法**：包管理、脚本任务
4. **学习异步编程**：Promise、async/await

在下一篇文章（进阶篇）中，我们将深入学习Node.js的版本管理、npm高级配置、性能优化等内容。

