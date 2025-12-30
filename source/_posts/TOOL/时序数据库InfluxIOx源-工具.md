---
title: 时序数据库InfluxIOx源码解析
categories: 数据库深度解析系列
tags:
  - Rust
  - Go
abbrlink: 68fbb32f
date: 2021-03-04 00:00:00
top: 10
---

上一篇介绍了InfluxDB IOx的一些项目背景及现有架构中存在的问题，详情见：https://my.oschina.net/u/3374539/blog/5015114 ##### 1.克隆仓库 ```text git clone https://github.com/influxdata...

<!-- more -->

                                                                                                                                                                                         
上一篇介绍了InfluxDB IOx的一些项目背景及现有架构中存在的问题，详情见：https://my.oschina.net/u/3374539/blog/5015114 
##### 1.克隆仓库
 
 ```text
  git clone https://github.com/influxdata/influxdb_iox.git

  ``` 
  
##### 2.安装基础语言依赖
根据 
 `readme` 
 文件中的的描述，项目依赖两个基础环境，分别是 
 `rust` 
 和 
 `clang` 
 。 
 
 是使用 
 `rustup` 
 来进行版本管理的。默认的情况下，会为你安装最后的 
 `stable` 
 版本，但是IOx项目为了使用不太稳定的 
 `SIMD` 
 特性，从而达到更高的性能，所以在 
 `rust-toolchain` 
 文件中指定了一个 
 `nightly` 
 的版本。 
 安装 
脚本： 
 
 ```bash
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

  ``` 
  
测试版本号： 
 
  rustc --version
```
rustc 1.51.0 (2fd73fabe 2021-03-23)
```

cd influxdb_iox
```
rustc 1.50.0-nightly (825637983 2020-11-18)
```

  ```
 安装 
 是为了编译 
 `croaring` 
 这个依赖( 
 `RoaringBitmap` 
 ，根据查询语句进行逐列查询的时候使用)，安装脚本根据系统的不同。 
mac： 
 
 ```sql
  xcode-select --install

clang --version
```
Apple clang version 12.0.0 (clang-1200.0.32.29)
Target: x86_64-apple-darwin20.3.0
```
Thread model: posix
```
InstalledDir: /Library/Developer/CommandLineTools/usr/bin
```

  ``` 
  
##### 3.IDE搭建
我个人使用的 
 `goland` 
 ，感觉相比于 
 `IDEA` 
 要速度更快一些。 
 
  
 `GoLand` 
 下载：https://www.jetbrains.com/go/ 
 安装 
 `Toml` 
 插件: https://plugins.jetbrains.com/plugin/8195-toml 
 安装 
 `Rust` 
 插件: https://plugins.jetbrains.com/plugin/8182-rust 
 
##### 4.导入工程
当全部完成后，你可以在IDE的右侧看到如下截图： 
![Test](https://oscimg.oschina.net/oscnet/up-766c997ed59948161ab05f80ae0ab81d5bb.png  '时序数据库Influx-IOx源码学习二（环境搭建）') 
你也可以在命令行中执行： 
 
 `cargo build` 
  
 
##### 5.在IDE中启动
打开 
 `src/main.rs` 
 文件，然后右键-->Run. 在运行之后，在命令行里会提示一个错误，然后退出。原因是我们并没有输入系统可以识别的启动命令。 
打开启动配置页面，在command中贴入, `run --package influxdb_iox --bin influxdb_iox run` ![Test](https://oscimg.oschina.net/oscnet/up-766c997ed59948161ab05f80ae0ab81d5bb.png  '时序数据库Influx-IOx源码学习二（环境搭建）') 
然后就能看到程序启动成功的提示： 
祝玩儿的开心！