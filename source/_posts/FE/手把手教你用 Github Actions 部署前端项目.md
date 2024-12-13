---
title: 推荐系列-手把手教你用 Github Actions 部署前端项目
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 812
cover_picture: 'https://api.ixiaowai.cn/gqapi/gqapi.php'
abbrlink: 2d9e8424
date: 2021-04-15 10:16:57
---

&emsp;&emsp;👆 这是第 96 篇不掺水的原创，想要了解更多，请戳上方蓝色字体：政采云前端团队 关注我们吧～ 本文首发于政采云前端团队博客：手把手教你用 Github Actions 部署前端项目终稿 https://ww...
<!-- more -->

                                                                                                                                                                                         
  
   
   👆  
    这是第  
   96 
    篇 
   不掺水的原创 
   ，想要了解更多 
   ，请戳上方蓝色字体： 
   政采云前端团队 
    关注我们吧～ 
   
   
  ![Test](https://api.ixiaowai.cn/gqapi/gqapi.php  '手把手教你用 Github Actions 部署前端项目') 
   
  ### 为什么使用 Github Actions ？ 
  众所周知，前端部署无非就是把打包之后的代码丢到 nginx html 目录下就完事了，但是每逢产品频繁改需求，甚至只是让你改线上一个字的时候，你总要重复一遍以下动作：修改，打包，登录服务器，上传代码，重启服务器。久而久之，别说是你受不了了，搁我旁边看着都受不了。这个时候，有没有想过有个机器人，能帮我们完成以上这些重复又没技术含量的活。没错，你猜对了，Github Actions 就是我们需要的那个机器人。 
   
  ### Github Actions 是什么？ 
  大家知道，持续集成 (https://www.ruanyifeng.com/blog/2015/09/continuous-integration.html?fileGuid=1PWJAvQBtLA5IGh3) 由很多操作组成，比如拉取最新代码、运行测试、登录服务器、部署服务器等，GitHub 把这些操作统一称为 Actions。 
   
   ![Test](https://api.ixiaowai.cn/gqapi/gqapi.php  '手把手教你用 Github Actions 部署前端项目') 
   
  我们再梳理下正常需求的开发流程（如上图），以上操作是可重复利用的，利用这一概念，Github 集成了 Actions 市场，允许开发者把操作写成独立的脚本，发布到 Actions 市场，允许所有开发者使用，这里有点像 Npm 和 VSCode 中的插件。 
   
   ![Test](https://api.ixiaowai.cn/gqapi/gqapi.php  '手把手教你用 Github Actions 部署前端项目') 
   
  Github 给我们提供了一个以下配置的服务器来运行我们配置对应的 Actions： 
   
    
    
      2-core CPU 
     
    
    
      7 GB of RAM memory 
     
    
    
      14 GB of SSD disk space 
     
   
  这个配置足够我们使用了，当然，如果你有网络时延的需求，（比如推送及拉取镜像时产生的网络时延），你也可以自建服务器 (https://docs.github.com/cn/actions/hosting-your-own-runners?fileGuid=1PWJAvQBtLA5IGh3)。 
   
  ### 部署自己的前端项目 
   
  #### 1、选择 Github 项目仓库 
  这里我选择了很久以前刚开始学习 Vue 时模仿 bilibili 做的项目 bilibili-vue (https://github.com/zlyyyy/bilibili-vue?fileGuid=1PWJAvQBtLA5IGh3)，进入项目仓库，可以看到对应的 Actions 标签，点击进入。 
   
   ![Test](https://api.ixiaowai.cn/gqapi/gqapi.php  '手把手教你用 Github Actions 部署前端项目') 
   
   
  #### 2、新建工作流，配置 Actions 
  进入 Actions 后可以看到很多推荐的工作流模版，这里可以根据需要自行选择的模版，或者跳过模版，自行设置。 
   
   ![Test](https://api.ixiaowai.cn/gqapi/gqapi.php  '手把手教你用 Github Actions 部署前端项目') 
   
  这里因为我是纯前端项目，所以我选择 Node.js 模版。 
   
   ![Test](https://api.ixiaowai.cn/gqapi/gqapi.php  '手把手教你用 Github Actions 部署前端项目') 
   
  点击 Node.js 模版，会自动在项目  
 ```java 
  .github/workflows 目录下生成 node.js.yml
  ``` 
  文件，我们可以把文件名字改成我们工作流的名称。当然，这里可以设置并存在很多工作流  
 ```java 
  yml
  ``` 
  文件，例如 deploy.yml、test.yml、gh-page.yml 等。 
   
 ```java 
  # workflow名称。省略的话，默认为当前workflow文件名name: Node.js CI# 触发workflow的条件，on:push:# 只有master分支发生push事件时，才会触发workflowbranches: [ master ]pull_request:branches: [ master ]# jobs表示执行的一项或多项任务jobs:# 任务的job_id，具体名称自定义，这里build代表打包build:# runs-on字段指定运行所需要的虚拟机环境。注意：这个是必填字段runs-on: ubuntu-latest# 用于配置当前workflow的参数strategy:matrix:node-version: [10.x, 12.x, 14.x, 15.x]# See supported Node.js release schedule at https://nodejs.org/en/about/releases/# steps字段指定每个job的运行步骤，可以包含一个或多个步骤，每个步骤都可以配置指定字段steps:# 切代码到 runner- uses: actions/checkout@v2# 在当前操作系统安装node- name: Use Node.js ${{ matrix.node-version }}uses: actions/setup-node@v1with:node-version: ${{ matrix.node-version }}# 该运行的命令或者action# 安装依赖、运行测试、打包    - run: npm install    - run: npm test    - run: npm run build
  ``` 
  
   
  #### 3、常见的 Actions 配置 
   
  ##### 打版本标签 Create Tag Release 
   
   
 ```java 
  on:  push:    # Sequence of patterns matched against refs/tags    tags:      - 'v*' # Push events to matching v*, i.e. v1.0, v20.15.10name: Create Releasejobs:  build:    name: Create Release    runs-on: ubuntu-latest    steps:      - name: Checkout code        uses: actions/checkout@master      - name: Create Release        id: create_release        uses: actions/create-release@latest        env:          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }} # This token is provided by Actions, you do not need to create your own token        with:          tag_name: ${{ github.ref }}          release_name: Release ${{ github.ref }}          body: |            Changes in this Release            - First Change            - Second Change          draft: false          prerelease: false
  ``` 
  
   
  ##### 创建 Github Pages 站点 
   
   
 ```java 
  name: github pages on:   push:     branches:       - master # default branch jobs:   deploy:     runs-on: ubuntu-18.04     steps:       - uses: actions/checkout@v2       - run: npm install       - run: npm run docs:build       - name: Deploy         uses: peaceiris/actions-gh-pages@v3         with:           github_token: ${{ secrets.GITHUB_TOKEN }}           publish_dir: ./docs-dist
  ``` 
  
   
  ##### 多人协作开发，云端代码检测 
   
 ```java 
  name: Test  on: [push, pull_request]  jobs:   lint:     runs-on: ubuntu-latest     steps:     - uses: actions/checkout@v2     - uses: actions/setup-node@v1       with:         node-version: '12.x'      - name: Install dependencies       uses: bahmutov/npm-install@v1      - name: Run linter       run: npm run lint    test:     runs-on: ubuntu-latest     steps:     - uses: actions/checkout@v2     - uses: actions/setup-node@v1       with:         node-version: '12.x'      - name: Install dependencies       uses: bahmutov/npm-install@v1      - name: Run test       run: npm test    build:     runs-on: ubuntu-latest     steps:     - uses: actions/checkout@v2     - uses: actions/setup-node@v1       with:         node-version: '12.x'      - name: Install dependencies       uses: bahmutov/npm-install@v1      - name: Build       run: npm run build
  ``` 
  
  以上是 Github 中常见的一些配置，更多 Actions 配置(https://docs.github.com/en/actions/reference/context-and-expression-syntax-for-github-actions?fileGuid=1PWJAvQBtLA5IGh3) 可以参考官网。 
   
  #### 4、搭配 Docker 
   
  没有 Docker 之前，我是使用 Webhook 实现自动部署，但后面遇到了服务器到期更换服务器的时候，就只能一个个重复操作来做迁移，而且文件目录管理混乱，项目变多时，维护成本也会越来越高。再看 Docker 五大优势：持续集成、版本控制、可移植性、隔离性和安全性，是不是就是用来解决我们上述遇到的问题的。举例：bilibili-vue (https://github.com/zlyyyy/bilibili-vue?fileGuid=1PWJAvQBtLA5IGh3)，不明白的同学可以参考我的配置。 
   
  ##### 4.1 项目根目录新建 Nginx 配置 
  项目根目录新建 Nginx 配置文件命名 vhost.nginx.conf（名字随便定，跟后面 Dockerfile 中引用一致即可）供后续使用，例： 
   
 ```java 
  server {listen 80;server_name localhost;location / {  root /usr/share/nginx/html;  index index.html index.htm;  proxy_set_header Host $host;  if (!-f $request_filename) {    rewrite ^.*$ /index.html break;  }}error_page 500 502 503 504 /50x.html;location = /50x.html {    root /usr/share/nginx/html;  }}
  ``` 
  
   
  ##### 4.2 项目根目录新建 Dockerfile 文件 
  项目根目录新建 Dockerfile 文件，构建镜像包使用，例： 
   
 ```java 
  FROM nginxCOPY ./dist/ /usr/share/nginx/html/# 第一步nginx配置文件名称  COPY ./vhost.nginx.conf /etc/nginx/conf.d/bilibili-vue.confEXPOSE 80
  ``` 
  
   
  ##### 4.3 配置容器镜像服务 
  这里我选择了阿里云的容器镜像服务 (https://www.aliyun.com/product/acr?fileGuid=1PWJAvQBtLA5IGh3)，为什么不使用国外的 dockhub (https://hub.docker.com/?fileGuid=1PWJAvQBtLA5IGh3) 呢，因为这样使用起来速度快一点，而且有免费的个人版足够我们使用。 
   
  ###### 4.3.1 第一步 
  初次打开需要开通服务，配置登录密码（记下来，后面要用）。 
   
  ###### 4.3.2 第二步 
  然后创建命名空间，再创建我们的镜像仓库，这里如果不想别人下载你的镜像的话就可以选择私有。然后点击下一步配置代码源，这里我选择了本地仓库，一方面是为了日志统一，可以在 Github Actions 看到所有日志，一方面是可以通过命令行直接推送镜像到镜像仓库，自由度比较高。![Test](https://api.ixiaowai.cn/gqapi/gqapi.php  '手把手教你用 Github Actions 部署前端项目') 
   
  ###### 4.3.3 第三步 
  之后就可以在页面看到我们创建的仓库，点击仓库名称进入，可以看到仓库的基本信息和操作指南，这个时候一个镜像仓库就完全创建成功了。![Test](https://api.ixiaowai.cn/gqapi/gqapi.php  '手把手教你用 Github Actions 部署前端项目') 
   
   ![Test](https://api.ixiaowai.cn/gqapi/gqapi.php  '手把手教你用 Github Actions 部署前端项目') 
   
   
  ##### 4.4 如何跟 Actions 联动 
  我们只用在 Actions 中 build 镜像后登录阿里云 Registry 实例就好了，但是这个时候如果明文直接写在 yml 中肯定是不行的，Github 早就帮我们考虑到了这点，回到 Github 项目中，依次点击 Settings => Secrets => New repository secret ，设置 secret，配置上述容器镜像账号的用户名（阿里云用户名）和密码（上述配置容器镜像服务时设置的登录密码）。 
   
   ![Test](https://api.ixiaowai.cn/gqapi/gqapi.php  '手把手教你用 Github Actions 部署前端项目') 
   
   
  #### 5、完整的 Actions 
   
 ```java 
  name: Docker Image CI # Actions名称on: [push] # 执行时机jobs:# 这里我使用的是yarn，想用npm的同学将yarn命令修改为npm命令即可build:runs-on: ubuntu-lateststeps:- name: checkoutuses: actions/checkout@master# 安装依赖- name: installrun: yarn# 打包- name: build projectrun: yarn run build# 打包镜像推送到阿里云容器镜像服务- name: Build the Docker imagerun: |docker login --username=${{ secrets.DOCKER_USERNAME }} registry.cn-hangzhou.aliyuncs.com --password=${{ secrets.DOCKER_PASSWORD }}docker build -t bilibili-vue:latest .docker tag bilibili-vue registry.cn-hangzhou.aliyuncs.com/zlyyyy/bilibili-vue:latestdocker push registry.cn-hangzhou.aliyuncs.com/zlyyyy/bilibili-vue:latest # 推送- name: ssh docker login # 使用appleboy/ssh-action@master登录服务器执行拉取镜像脚本，服务器ip、用户名、密码配置方式同容器镜像服务配置方式一样uses: appleboy/ssh-action@masterwith:        host: ${{ secrets.SSH_HOST }} username: ${{ secrets.SSH_USERNAME }}password: ${{ secrets.SSH_PASSWORD }}script: cd ~ && sh bilibili-vue-deploy.sh ${{ secrets.DOCKER_USERNAME }} ${{ secrets.DOCKER_PASSWORD }}
  ``` 
  
  最后一步登录服务器后，我执行了一个脚本来拉取云端最新镜像，并删除旧镜像，启动新镜像。脚本内容如下。 
   
 ```java 
  echo -e "---------docker Login--------"docker login --username=$1 registry.cn-hangzhou.aliyuncs.com --password=$2echo -e "---------docker Stop--------"docker stop bilibili-vueecho -e "---------docker Rm--------"docker rm bilibili-vuedocker rmi registry.cn-hangzhou.aliyuncs.com/zlyyyy/bilibili-vue:latestecho -e "---------docker Pull--------"docker pull registry.cn-hangzhou.aliyuncs.com/zlyyyy/bilibili-vue:latestecho -e "---------docker Create and Start--------"docker run --rm -d -p 8081:80 --name bilibili-vue registry.cn-hangzhou.aliyuncs.com/zlyyyy/bilibili-vue:latestecho -e "---------deploy Success--------"
  ``` 
  
   
  #### 6、测试流程，查看日志 
  我们推送一次代码测试，打开 Actions 后可以看到自动运行的实时 workflow 结果，以及每步的日志信息。 
   
   ![Test](https://api.ixiaowai.cn/gqapi/gqapi.php  '手把手教你用 Github Actions 部署前端项目') 
   
   
   ![Test](https://api.ixiaowai.cn/gqapi/gqapi.php  '手把手教你用 Github Actions 部署前端项目') 
    R
   
  总结 
  ###  
  到此我们自动化部署成功，再也不要每次修改代码，手动更新线上了，后面迁移也会更方便，当然还有更多的自动化部署方式，比如直接使用 Github + 阿里云镜像仓库的触发器一样可以做到，容器服务也不仅限于阿里云，腾讯云等其他云服务厂商同样也是一样的使用方式。以上是我个人使用 Actions 的一些总结，如有错误，劳烦指正修改。当然对更多 Actions 玩法感兴趣的同学欢迎一起交流学习。当然这个仅限于个人的项目玩法，公司内部的项目有更加成熟完善的自动化方案，比如我们内部所使用的云��系统，就是解决此类问题的，具体云长做了些什么，后续会有详细文章输出，敬请期待。 
   
  ### 参考文献 
  GitHub Actions 入门教程 (http://www.ruanyifeng.com/blog/2019/09/getting-started-with-github-actions.html?fileGuid=1PWJAvQBtLA5IGh3) 
  持续集成是什么？(https://www.ruanyifeng.com/blog/2015/09/continuous-integration.html?fileGuid=1PWJAvQBtLA5IGh3) 
   
  #### 看完两件事 
  如果你觉得这篇内容对你挺有启发，我想邀请你帮我两件小事 
  1.点个「在看」，让更多人也能看到这篇内容（点了「在看」，bug -1 😊） 
  
    2.关注公众号「 
   政采云前端团队」，持续为你推送精选好文 
   
   
  #### 招贤纳士 
  政采云前端团队（ZooTeam），一个年轻富有激情和创造力的前端团队，隶属于政采云产品研发部，Base 在风景如画的杭州。团队现有 40 余个前端小伙伴，平均年龄 27 岁，近 3 成是全栈工程师，妥妥的青年风暴团。成员构成既有来自于阿里、网易的“老”兵，也有浙大、中科大、杭电等校的应届新人。团队在日常的业务对接之外，还在物料体系、工程平台、搭建平台、性能体验、云端应用、数据分析及可视化等方向进行技术探索和实战，推动并落地了一系列的内部技术产品，持续探索前端技术体系的新边界。 
  如果你想改变一直被事折腾，希望开始能折腾事；如果你想改变一直被告诫需要多些想法，却无从破局；如果你想改变你有能力去做成那个结果，却不需要你；如果你想改变你想做成的事需要一个团队去支撑，但没你带人的位置；如果你想改变既定的节奏，将会是“5 年工作时间 3 年工作经验”；如果你想改变本来悟性不错，但总是有那一层窗户纸的模糊… 如果你相信相信的力量，相信平凡人能成就非凡事，相信能遇到更好的自己。如果你希望参与到随着业务腾飞的过程，亲手推动一个有着深入的业务理解、完善的技术体系、技术创造价值、影响力外溢的前端团队的成长历程，我觉得我们该聊聊。任何时间，等着你写点什么，发给  
 ```java 
  ZooTeam@cai-inc.com
  ``` 
  
   
   ![Test](https://api.ixiaowai.cn/gqapi/gqapi.php  '手把手教你用 Github Actions 部署前端项目') 
   
  
  
 
本文分享自微信公众号 - 政采云前端团队（Zoo-Team）。如有侵权，请联系 support@oschina.cn 删除。本文参与“OSC源创计划”，欢迎正在阅读的你也加入，一起分享。
                                        