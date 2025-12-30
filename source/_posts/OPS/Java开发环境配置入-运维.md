---
title: Java开发环境配置入门
categories: Java开发全栈系列
tags:
  - Java
abbrlink: 69f02c64
date: 2018-10-09 00:00:00
top: 1
---

Java是由Sun Microsystems公司于1995年推出的高级程序设计语言，具有"一次编写，到处运行"的跨平台特性，可运行于Windows、Mac OS、Linux等多种操作系统。本文详细介绍Java开发环境的配置方法，包括JDK安装、环境变量配置、IDE选择（IntelliJ IDE...

<!-- more -->

![Java](https://hosiang1026.github.io/photos/image/2024/12/15/10r80v9.jpg "Java开发环境配置-入门篇")


### 一、安装包

```
 [JDK 官网下载](http://www.oracle.com/technetwork/java/javase/downloads/index.html)       
```

### 二、配置过程

#### 2.1 Windows平台

##### 2.1 安装JDK

1、安装jdk 随意选择目录 只需把默认安装目录 \java 之前的目录修改即可

2、安装jre→更改→ \java 之前目录和安装 jdk 目录相同即可


```
//例如：
G:\DevInstall\Java\jdk1.8.0_102
G:\DevInstall\Java\jre1.8.0_102

```

##### 2.2 配置环境变量

计算机→属性→高级系统设置→高级→环境变量→系统变量

1、新建变量 `JAVA_HOME` 变量值填写jdk的安装目录：`G:\DevInstall\Java\jdk1.8.0_102`

```java
2、新建变量 `CLASSPATH` 变量值填 `.;%JAVA_HOME%\lib;%JAVA_HOME%\lib\tools.jar`
```
  （注意最前面有一点）

```
3、寻找变量 `Path` 在变量值最后输入：` %JAVA_HOME%\bin;%JAVA_HOME%\jre\bin` ;
  （注意原来`Path`的变量值末尾有没有入`;` 号，如果没有，先输入`;`     号再输入上面的代码）
```

4、检验是否配置成功

   快捷键：`Win+R` 或 点击开始→运行→输入`cmd` →输入如下命令：
  
```
//编译命令
javac 

//运行命令
java 

//版本命令
java -version 
  
```

#### 2.2 Mac平台

##### 2.3 安装JDK

```
方法1：使用Homebrew安装（推荐）
```

```bash
# 安装Homebrew（如果未安装）
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 安装OpenJDK
brew install openjdk@17

# 或安装特定版本
brew install openjdk@11
brew install openjdk@8
```

```
方法2：从Oracle官网下载安装包
```

```
1. 访问 [Oracle JDK下载页面](https://www.oracle.com/java/technologies/downloads/)
```
2. 选择macOS版本（.dmg文件）
3. 下载并运行安装程序
4. 按照向导完成安装

```
方法3：使用SDKMAN管理多个JDK版本（推荐）
```

```bash
# 安装SDKMAN
curl -s "https://get.sdkman.io" | bash
source "$HOME/.sdkman/bin/sdkman-init.sh"

# 安装JDK
sdk install java 17.0.7-tem
sdk install java 11.0.19-tem
sdk install java 8.0.372-tem

# 切换版本
sdk use java 17.0.7-tem

# 设置默认版本
sdk default java 17.0.7-tem
```

##### 2.4 配置环境变量

```
查找JDK安装路径：
```

```bash
# 方法1：使用/usr/libexec/java_home
/usr/libexec/java_home -V

# 输出示例：
# Matching Java Virtual Machines (2):
#     17.0.7 (arm64) "Eclipse Adoptium" - "OpenJDK 17.0.7" /Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home
#     1.8.0_372 (arm64) "Eclipse Adoptium" - "OpenJDK 1.8.0_372" /Library/Java/JavaVirtualMachines/temurin-8.jdk/Contents/Home

# 方法2：查看常见安装位置
ls /Library/Java/JavaVirtualMachines/
```

```
配置环境变量：
```

```
对于bash（macOS默认）：
```

```bash
# 1. 打开或创建.bash_profile文件
cd ~
touch .bash_profile
open -e .bash_profile

# 2. 添加以下内容（根据实际JDK路径调整）
export JAVA_HOME=$(/usr/libexec/java_home)
export CLASSPATH=.:$JAVA_HOME/lib/dt.jar:$JAVA_HOME/lib/tools.jar
export PATH=$JAVA_HOME/bin:$PATH

# 3. 保存文件并退出编辑器

# 4. 使配置生效
source .bash_profile
```

```
对于zsh（macOS Catalina及以后默认）：
```

```bash
# 1. 打开或创建.zshrc文件
cd ~
touch .zshrc
open -e .zshrc

# 2. 添加以下内容
export JAVA_HOME=$(/usr/libexec/java_home)
export CLASSPATH=.:$JAVA_HOME/lib/dt.jar:$JAVA_HOME/lib/tools.jar
export PATH=$JAVA_HOME/bin:$PATH

# 3. 保存并生效
source .zshrc
```

```
验证配置：
```

```bash
# 检查Java版本
java -version

# 检查javac编译器
javac -version

# 检查JAVA_HOME
echo $JAVA_HOME

# 检查PATH
echo $PATH
```

```
预期输出示例：
```
```
openjdk version "17.0.7" 2023-04-18
OpenJDK Runtime Environment Temurin-17.0.7+7 (build 17.0.7+7)
OpenJDK 64-Bit Server VM Temurin-17.0.7+7 (build 17.0.7+7, mixed mode, sharing)

javac 17.0.7

/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home
```

### 三、IDE配置

#### 3.1 IntelliJ IDEA配置

```
1. 配置JDK：
```

1. File → Project Structure → Project
2. 在"SDK"下拉菜单中选择JDK
3. 如果没有，点击"New"添加JDK路径

```
2. 配置Maven：
```

1. File → Settings → Build, Execution, Deployment → Build Tools → Maven
2. Maven home directory: 选择Maven安装路径
3. User settings file: 选择settings.xml路径

```
3. 创建第一个Java项目：
```

1. File → New → Project
2. 选择Java项目
3. 选择JDK版本
4. 选择项目模板（如Maven）
5. 输入项目名称和位置
6. 点击Finish

#### 3.2 Eclipse配置

```
1. 配置JDK：
```

1. Window → Preferences → Java → Installed JREs
2. 点击"Add"添加JDK
3. 选择"Standard VM"
4. 选择JDK安装目录
5. 点击"Finish"

```
2. 配置Maven：
```

1. Window → Preferences → Maven → Installations
2. 点击"Add"添加Maven
3. 选择Maven安装目录
4. 勾选添加的Maven版本

### 四、创建第一个Java程序

#### 4.1 使用命令行

```
1. 创建Java文件：
```

```bash
# 创建项目目录
mkdir HelloWorld
cd HelloWorld

# 创建Java源文件
# HelloWorld.java
```

```
2. 编写代码：
```

```java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
```

```
3. 编译和运行：
```

```bash
# 编译
javac HelloWorld.java

# 运行
java HelloWorld

# 输出：Hello, World!
```

#### 4.2 使用IDE

```
IntelliJ IDEA：
```

1. File → New → Project → Java
2. 选择JDK版本
3. 创建类：src → New → Java Class
4. 输入类名：HelloWorld
5. 编写代码并运行

### 五、Maven配置（可选但推荐）

#### 5.1 安装Maven

```
Windows：
```

1. 下载Maven：https://maven.apache.org/download.cgi
2. 解压到目录（如：C:\Program Files\Apache\maven）
3. 配置环境变量：
   - `MAVEN_HOME`: C:\Program Files\Apache\maven
   - `Path`: 添加 `%MAVEN_HOME%\bin`

```
macOS：
```

```bash
# 使用Homebrew安装
brew install maven

# 验证安装
mvn -version
```

#### 5.2 创建Maven项目

```bash
# 使用Maven模板创建项目
mvn archetype:generate -DgroupId=com.example -DartifactId=my-app -DarchetypeArtifactId=maven-archetype-quickstart -DinteractiveMode=false

# 进入项目目录
cd my-app

# 编译项目
mvn compile

# 运行项目
mvn exec:java -Dexec.mainClass="com.example.App"
```

### 六、常见问题解决

```
问题1：java命令找不到
```

```
解决方案：
```
- 检查JDK是否正确安装
- 检查PATH环境变量
- 重新配置环境变量

```
问题2：javac命令找不到
```

```
解决方案：
```
- 确认安装的是JDK而不是JRE
- 检查JAVA_HOME和PATH配置

```
问题3：版本不匹配
```

```
解决方案：
```
```bash
# 检查Java版本
java -version

# 检查javac版本
javac -version

# 确保版本一致
```

```java
问题4：CLASSPATH配置错误
```

```
解决方案：
```
```bash
# CLASSPATH应该包含：
# . (当前目录)
# $JAVA_HOME/lib/dt.jar
# $JAVA_HOME/lib/tools.jar

# 注意：CLASSPATH最前面有一个点(.)
```