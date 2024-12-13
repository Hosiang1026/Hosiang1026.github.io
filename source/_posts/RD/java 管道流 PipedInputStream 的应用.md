---
title: 推荐系列-java 管道流 PipedInputStream 的应用
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 2046
cover_picture: 'https://api.ixiaowai.cn/gqapi/gqapi.php'
abbrlink: 757217ba
date: 2021-04-15 09:46:45
---

&emsp;&emsp;前言 PipedInputStream 和 PipedOutputStream 设计用来解决跨线程的字节数据传输。它们总是成对出现的，而在使用上，也只能 工作在两个不同的线程上，在一个线程里使用管道输入和输出流可能会...
<!-- more -->

                                                                                                                                                                                         
### 前言 
PipedInputStream 和 PipedOutputStream 设计用来解决跨线程的字节数据传输。它们总是成对出现的，而在使用上，也只能 工作在两个不同的线程上，在一个线程里使用管道输入和输出流可能会造成死锁。网上有很多介绍这两个存在于 io 包下的 api。却几乎 找不到一个写 PipedInputStream 的使用场景的，所以本文结合实际业务，来聊一聊 PipedInputStream 的应用。 
 
#### 原理简介 
我们知道，输出流写数据，输入流读数据，PipedInputStream 和 PipedOutputStream 也一样，在 PipedOutputStream 的内部有一个 PipedInputStream 类型的  
 ```java 
  sink
  ``` 
 属性，用来接收 PipedOutputStream 写入的字节数据。而在 PipedInputStream 内部，定义了一个默认为  
 ```java 
  1024
  ``` 
  大小的字节数组  
 ```java 
  buffer
  ``` 
 ，作为数据传输的缓冲区。这样一来，就变成了 PipedOutputStream 往  
 ```java 
  buffer
  ``` 
  里写数据，当写满了  
 ```java 
  buffer
  ``` 
  时，便使用  
 ```java 
  notifyAll()
  ``` 
  唤醒读数据的线程可以读数据了，然后阻塞 1s 后继续尝��写数据。PipedInputStream 从  
 ```java 
  buffer
  ``` 
  里读数据，当数据读完  
 ```java 
  buffer
  ``` 
  为空时，便  
 ```java 
  notifyAll()
  ``` 
  唤醒写的线程可以写数据了，然后阻塞 1s 后继续尝试读数据。PipedOutputStream 端数据写完后，调用  
 ```java 
  close()
  ``` 
  方法，会标记 PipedInputStream 里的  
 ```java 
  closedByWriter=true
  ``` 
 。此时，从  
 ```java 
  buffer
  ``` 
  读取数据，会返回 -1。标识了数据读完到达了流的末尾了。 
 
#### 使用场景概述 
 
 ```java 
      public static void main(String[] args) {

        try (PipedOutputStream out = new PipedOutputStream();
             PipedInputStream in = new PipedInputStream(out)) {
            new Thread(() -> {
                try {
                    out.write("hello kl".getBytes(StandardCharsets.UTF_8));
                    out.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }

            }).start();
            int receive;
            while ((receive = in.read()) != -1) {
                System.err.print((char) receive);
            }

        } catch (IOException e) {
            e.printStackTrace();
        }
    }

  ``` 
  
上面代码演示了，在一个线程里写数据，然后在  
 ```java 
  main
  ``` 
  线程读数据的场景，完成了跨线程的数据传输。写到这里，都挺干巴巴的，很多人看了后肯定也不知道它到底能干啥，有啥作用，继续往下看。 
 
#### 实际应用 
简单的理解了原理后，写了一个简单的演示 demo，但是 demo 不能说明啥问题，那从一个线程传输字节到另一个线程到底有啥用呢？博主，简单的的总结下:通过 java 应用生成文件，然后需要将文件上传到云端的场景，都可以用管道流。相同的业务场景，在没了解管道流之前，都是先将文件写入到本地磁盘，然后从文件磁盘读出来上传到云盘。了解这个后，可以脑补出很多的业务场景了(真实业务场景，都是博主遇到过的)，比如： 
 
##### 案例一：Excel 文件导出功能 
之前有一个文件导出的功能，但是因为，导出的文件比较大，导出下载完的时间非常长，所以，设计成了，页面点击导出后，后台触发导出任务，然后将 
 ```java 
  mysql
  ``` 
  中的数据根据导出条件查询出来，生成 Excel文件，然后将文件上传到  
 ```java 
  oss
  ``` 
 ，最后像触发导出任务的人的钉钉发一个下载文件的链接。之前的做法，正如上面所言，先将文件写到本地，然后从本地目录读出来上传到  
 ```java 
  oss
  ``` 
 ，下面演示下管道流一步到位的方式： 
 
 ```java 
      public static void main(String[] args) {

        try (PipedOutputStream out = new PipedOutputStream();
             PipedInputStream in = new PipedInputStream(out)) {
            new Thread(() -> {
                List<String> database = new LinkedList<>();
                try {
                    //文件生成
                    ExcelUtils.getInstance().exportObjects2Excel(database,out);
                } catch (IOException e) {
                    e.printStackTrace();
                }

            }).start();
            //文件上传
            ossClient.putObject("test","test.xlsx",in);

        } catch (IOException e) {
            e.printStackTrace();
        }
    }

  ``` 
  
 
##### 案例二：xml 文件数据传输 
此类需求常见于和银行以及金融机构对接时，要求上报一些 xml 格式的数据，给到指定的 ftp、或是 oss 的某个目录下，用于对账。其实从文件上传的场景来说，和上面的案例一是一样。也是我总结的那样，在内存里生成文件，然后上传到云端，伪代码如下： 
 
 ```java 
      public static void main(String[] args) {

        try (PipedOutputStream out = new PipedOutputStream();
             PipedInputStream in = new PipedInputStream(out)) {
            new Thread(() -> {
                List<String> database = new LinkedList<>();
                try(GZIPOutputStream gzipOut = new GZIPOutputStream(out)) {
                    Marshaller marshaller = JAXBContext.newInstance(Object.class).createMarshaller();
                    marshaller.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT, Boolean.TRUE);
                    marshaller.marshal(database,gzipOut);
                } catch (IOException | JAXBException e) {
                    e.printStackTrace();
                }

            }).start();
            //文件上传
            ossClient.putObject("test","test.xml.gz",in);

        } catch (IOException e) {
            e.printStackTrace();
        }
    }

  ``` 
  
总体来说，和案例一没啥区别，只是案例二多了一步压缩操作，最终上传的文件是一个 gzip 的压缩包，压缩包内是 xml 文件。用这种方式可以大大减少文件的体积、提升上传的速度 
 
#### 结语 
PipedInputStream 和 PipedOutputStream 设计用来解决跨线程的字节数据传输。在实际业务需求中，当需要在内存中生成文件然后上传到云端时，请记得使用管道流
                                        