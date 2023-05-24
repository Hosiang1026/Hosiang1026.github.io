---
title: 推荐系列-挖掘全志Tina Linux下SPI主从通信验证模块的秘密
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 11
cover_picture: >-
  https://bbs.aw-ol.com/assets/uploads/files/1677559156995-a3e582cc-6f51-438d-b11a-3cb23ca9e549-image.png
abbrlink: 9dfdf370
date: 2023-05-24 09:23:09
---

&emsp;&emsp;: D1H 板卡: 两块哪吒开发板(以下简称为主机, 从机) 操作系统: Tina Linux 2.0 验证D1H芯片SPI主从机通信. 硬件接线 主机SPI 从机SPI 19 SPI1_MOSI SPI1_MOSI 19 21 SPI1_MISO SPI1_MIS...
<!-- more -->

                                                                                                                                                                                         
####   
 
 主控: D1H 
 板卡: 两块哪吒开发板(以下简称为主机, 从机) 
 操作系统: Tina Linux 2.0 
 
验证D1H芯片SPI主从机通信. 
 
#### 硬件接线 
 
  
   
     
   主机SPI 
   ���机SPI 
     
   
  
  
   
   19 
   SPI1_MOSI 
   SPI1_MOSI 
   19 
   
   
   21 
   SPI1_MISO 
   SPI1_MISO 
   21 
   
   
   23 
   SPI1_SCK 
   SPI1_SCK 
   23 
   
   
   24 
   SPI1_CE 
   SPI1_CE 
   24 
   
  
 
 
#### SPI概述 
SPI接口是一种高速的, 全双工, 同步的通信总线. 适配D1H芯片的Tina Linux的BSP-SDK(以下简称SDK)中已包含相关驱动文件: spi-sunxi.c. 它提供的了仅内核态下主从机的简易通信验证实验, 这或许是考虑到SPI通信速率比较高的特性. 验证操作 
 
#### SPI主机配置 
 
##### MENUCONFIG 
在SDK执行完环境变量加载后, 执行: 
 
 ```java 
  /mnt/tina-d1-h$ make kernel_menuconfig

  ``` 
  
●开启Device Drivers->SPI support ●进入SPI support, 按图示开启: 
 
 
##### 设备树 
修改: ./device/config/chips/d1-h/configs/nezha/board.dts  
需要根据手册和原理图确认好针脚功能:  
 
#### SPI从机配置 
 
##### MENUCONFIG 
(同SPI主机配置一致) 
 
##### 设备树 
仅spi_slave_mode设为0, 其余项同SPI主机配置一致. spi_slave_mode = <0>; 
 
#### SPI主机收发信息 
按上述配置, 重新编译SDK, 打包, 烧录, 启动设备会出现: 
 
 ```java 
  root@TinaLinux# ls -l /dev/spidev1.0
crw-------    1 root     root      153,   0 Jan  1 08:00 /dev/spidev1.0

  ``` 
  
然后将可执行的SPI测试程序(./lichee/linux-5.4/tools/spi/spidev_test)挪到设备上(adb push等)并赋予可执行权限: 
 
 ```java 
  # 主机以10MHz发送(即MOSI)发送16进制数据: 0x01 0x02 0x03 0x04
./spidev_test -v -D /dev/spidev1.0 -s 10000000 -p "\x01\x02\x03\x04" 
# 主机以10MHz发送(即MOSI)发送ASCII字符串数据: "allwinner"
./spidev_test -v -D /dev/spidev1.0 -s 10000000 -p  "allwinner"
spi mode: 0x0
bits per word: 8
max speed: 10000000 Hz (10000 KHz)
TX | 61 6C 6C 77 69 6E 6E 65 72 __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __  |allwinner|

  ``` 
  
注意SPI是同步通信接口, 所以在发送的同时也会接收同样长度字节的数据. 下文将用到SPI主从通信的一种常见做法: 主机先发指令头, 然后再发指令体以获取从机应答. 
 
#### SPI从机收发信息 
spi-sunxi.c中对SPI从机模(SLAVE_MODE)采取了简单的收发验证处理, 具体是创建一个内核线程执行int sunxi_spi_slave_task(void *data), 该函数又被设备中断所控制(当收到SPI数据时). 
 
  SPI从机接收到数据的主要流程: sunxi_spi_slave_task() -> sunxi_spi_slave_handle_head(), 然后: 若指令头是写操作(0x01), 则执行:sunxi_spi_slave_cpu_rx_config(), 该函数仅是输出写入内容. 若指令投是读操作(0x03), 则执行:sunxi_spi_slave_cpu_tx_config(), 该函数仅是将收到的指令体的值+0x80, 然后发送(MISO)给主机.  
  对于从机, spi-sunxi.c能验证SPI通信, 但没有可供用户层直接使用的方法.  
 
 
#### 用户层可验证的SPI从机收发方案 
 
##### 功能设计 
从机安排一块32byte的内存缓存空间(简称"缓存空间")供主机通过指令进行读操作和写操作, 且从机能在用户层对该内存空间访问. 
 
##### 主要改动 
 
 spi.c: 
   
   增加static struct class_attribute ye_spi_buf_attrs[], 以创建/sys/class/spi_slave目录下的spi_buf文件, 并提供实现了读/写缓存空间的方法. 
    
 spi-sunxi.c: 
   
   使用ye_spi_slave_set_txdata()方法替换sunxi_spi_slave_set_txdata(), 以实现读操作. 
   修改sunxi_spi_slave_cpu_rx_config()方法, 以实现写操作. 
    
 
改动详情请查看: d1h_spi_driver.diff 
 
##### 使用方法 
 
 ```java 
  写操作: 操作:0x01(写) 地址:0x00 0x00 0x00 指令体长度:0x09
./spidev_test -v -D /dev/spidev1.0 -s 10000000 -p "\x01\x00\x00\x00\x09" && \
./spidev_test -v -D /dev/spidev1.0 -s 10000000 -p  "allwinner"

读操作: 操作:0x03(读) 地址:0x00 0x00 0x00 指令体长度:0x09
./spidev_test -v -D /dev/spidev1.0 -s 10000000 -p "\x03\x00\x00\x00\x09" && \
./spidev_test -v -D /dev/spidev1.0 -s 10000000 -p  "\x00\x00\x00\x00\x00\x00\x00\x00\x00"

从机读取缓存空间:
cat /sys/class/spi_slave/spi_buf

从机写入缓存空间:
echo "Hello world" > /sys/class/spi_slave/spi_buf
  ``` 
 
                                        