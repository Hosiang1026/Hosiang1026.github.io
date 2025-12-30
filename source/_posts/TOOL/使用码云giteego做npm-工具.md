---
title: 使用码云giteego做npm
categories: Git版本控制精通系列
tags:
  - JavaScript
abbrlink: 8a001657
date: 2019-08-10 00:00:00
top: 6
---

gitee-go 其实去年已经上线了，但当时太忙，没时间折腾。 经过一再折腾，终于搞通了。操作步骤按照以下流程： Step-1：在仓库的 DevOps 进入 Gitee Go 的配置页面，点击新建流水线（以下 2 ...
<!-- more -->

                                                                                                                                                                                        gitee-go 其实去年已经上线了，但当时太忙，没时间折腾。 
经过一再折腾，终于搞通了。操作步骤按照以下流程： 
Step-1：在仓库的 DevOps 进入 Gitee Go 的配置页面，点击新建流水线（以下 2 图） 
![Test](https://oscimg.oschina.net/oscnet/up-066499b5b280c55ed1a65229bb061faebb9.JPEG  '使用码云 gitee-go 做 npm publish ') 
Step-2：新建流水线的初始化配置界面，操作如下图。 
该配置文件创建保存后，会在你的仓库目录下创建对应的文件，如：.workflow/npm-publish.yml 文件。建议可在自己本地修改流水线配置文件，毕竟有代码高亮，格式也更可控。 
Step-3：本地优化 npm-publish.yml 置文件 
 
 ```bash
  # ========================================================
# 功能：输出当前 npm 构建环境的环境信息
name: npm-publish                # 定义一个唯一 ID 标识为 gitee-go-npm-example，名称为 “npm-流水线示例” 的流水线
displayName: 'npm-publish'
triggers:                                 # 流水线触发器配置
  push:                                   # 设置 master 分支 在产生代码 push 时精确触发（PRECISE）构建
    - matchType: PRECISE
      branch: master
commitMessage: 'build:'                   # 通过匹配当前提交的 CommitMessage 决定是否执行流水线
stages:                                   # 构建阶段配置
  - stage:                                # 定义一个 ID 标识为 npm-build-stage ,名为 “npm Stage” 的阶段
      name: npm-build-stage
      displayName: 'npm publish stage'
      failFast: true                      # 允许快速失败，即当 Stage 中有任务失败时，直接结束整个 Stage
      steps:                              # 构建步骤配置
        - step: npmbuild@1                # 采用 npm 编译环境
          name: npm-test                  # 定义一个 ID 标识为 npm-build ,名为 “npm Step” 的阶段
          displayName: 'npm test'
          inputs:                         # 构建输入参数设定
            nodeVersion: 14.15            # 指定 node 环境版本为 10.1
            goals: |
              node -v && npm -v
              npm install
              cat package.json
              npm run eslint-check
              npm run test
          name: npm-build                 # 定义一个 ID 标识为 npm-build ,名为 “npm Step” 的阶段
          dependsOn: npm-test             # 依赖于上一个步骤
          displayName: 'npm publish'
            goals: |                      # 先用 taobao 的 install，再切换官方源 publish 试试
              npm run build
              npm install -g @jsdevtools/npm-publish
              npm-publish --token=$NPM_TOKEN ./package.json

  ``` 
  
 
 commitMessage 为匹配 git commit 提交时的注释信息，这里我用了匹配 build: 这个前缀 
 stage 这里配置了两个 steps，第一个 step 执行测试，第二个 step 执行 publish 

 Gitee Go 针对国内环境，默认使用的是 taobao 的仓库，所以要做 npm publish 需要手动修改仓库，或者用 @jsdevtools/npm-publish 这个库来辅助发布。经过摸索，这个库更易用，推荐使用。 
 
Step-4：git 提交前，记得检查 package.json 中的 version 字段，加版本号。然后提交的时候，填写注释如：build: 1.0.0 ，这样就会触发 npm-publish.yml 的 commitMessage。 
之后，进入仓库的 Gitee Go 界面，即可看到触发了一个新的流水线的记录： 
点击【查看】，可进入该流水线的详情记录： 
点击 【构建详情】，可查看构建的过程，注意，未完成的 step ，无法获得查看执行的详情： 
补充说明： 
 
 经过摸索，Stage（流水线）的 Step（环节）的失败判定，来自于 node.js 执行时的 process.stderr 的写入，如 eslint、单元测试、npm指令执行发生错误的时候，都会抛出错误，写入 process.stderr，即会触发 Step 的执行失败的判定。 
 通过指定 dependsOn 字段，可以使 Step 依赖于前一个 Step 无失败才往后执行，如果不指定这个字段所有 Step 会同时执行。 
 
 