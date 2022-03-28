---
title: 推荐系列-Zadig 基于 OPA 实现 RBAC 和 ABAC 权限管理技术方案详解
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 269
cover_picture: 'https://oscimg.oschina.net/oscnet/up-66a0ed3e803fcfda93c33f3b30d2432d610.png'
abbrlink: af8fa7da
date: 2022-01-15 11:55:56
---

&emsp;&emsp; Zadig 被越来越多企业用户和社区小伙伴采用，大家对企业级权限和安全性有更高的诉求，亟待一套权限管理方案。经过充分调研，我们最终确定了采用 OPA（开放策略代理）开源策略引擎，事实...
<!-- more -->

                                                                                                                    
随着 Zadig 被越来越多企业用户和社区小伙伴采用，大家对企业级权限和安全性有更高的诉求，亟待一套权限管理方案。经过充分调研，我们最终确定了采用 OPA（开放策略代理）开源策略引擎，事实上，它��经被 Netflix，Pinterest 和 Goldman Sachs 等公司用于生产，正在成为云原生策略管理的事实标准。但 OPA 的编写具有一定的复杂度，网上的教程和官方文档也仅仅停留在 Demo 层面。经过 Zadig 从 v1.9.0 到 v1.10.0 的迭代，我们已完整实现了 RBAC 和 ABAC 权限管理业务和技术方案的落地，这里我们将整套方案的技术细节分享给大家。 
 
### 背景介绍 
 
##### OPA 
开放策略代理(Open Policy Agent，发音为“ oh-pa”)是一个开放源码的通用策略引擎，它统一了跨技术栈的策略实施。OPA 提供了一种高级声明性语言 rego，允许您将策略指定为代码和简单的 API，以加载软件中的策略决策。您可以使用 OPA 在 Microservices、 Kubernetes、 CI/CD 管道、 API 网关等中强制执行策略 
 
图片来源：OPA 官方 
 
##### 权限模型 
RBAC： 
基于角色的访问控制模型(RBAC: Role-based Access Control)，顾名思义，给用户定义角色，通过角色来控制权限。目前来说基于角色的访问控制模型是应用较广的一个，特别是 2B 方向 SAAS 领域，应用尤其常见。 
 
如上图示，用户拥有角色，且可拥有多个角色，而每个角色对应不同权限。这样的好处是：不必为每一个用户去配置权限，拥有极大的灵活性和便利性。 
  
  
ABAC： 
基于属性的访问控制模型(ABAC: Attribute-Based Access Control)，被一些人称为是权限系统设计的未来，不同于常见的将用户通过某种方式关联到权限的方式，ABAC 则是通过动态计算一个或一组属性是否满足某种条件来进行授权判断（可以编写简单的逻辑）。属性通常来说分为四类：用户属性（如用户年龄），环境属性（如当前时间），操作属性（如读取）和对象属性（如一篇文章，又称资源属性），所以理论上能够实现非常灵活的权限控制，几乎能满足所有类型的需求。Zadig 目前主要是通过标签模拟属性来实现细粒度资源权限控制。 
 
图片来源：阿里云帮助文档 
 
##### Zadig 权限场景 
 
  系统级别角色-解决全系统级别的权限问题(RBAC) 
   
    管理员:拥有全系统的所有权限  
    普通��户:拥有公开项目以及其所有资源的查看权限、测试管理和数据分析的查看权限  
    
 
  
 
  项目级别角色-解决项目级别的权限问题(RBAC) 
   
    project-admin:拥有该项目下的所有权限  
    read-only:拥有该项目下的所有资源的查看权限  
    read-project-only(默认):拥有该项目下工作流和集成环境list的权限(但资源会被精细化管理)，服务、构建和测试资源的所有查看权限  
    自定义角色:自定义每个模块权限能力  
    
 
  
 
  项目级别策略:解决项目级别资源的精细化管理(ABAC)  
 
因此 Zadig 基于 OPA 实现 RBAC 解决了系统和项目通用的权限管理，实现 ABAC 解决了项目级别资源的精细化管理。 
  
 
### Zadig 权限架构设计 
 
 
 
##### 权限设计架构图 
 
Gloo 作为 Zadig 的网关，是 Zadig 所有流量的入口。通过集成 OPA 后，所有经过网关的流量都会由 OPA 来统一进行认证鉴权，而只有认证鉴权通过后才会准许访问后端服务(aslan)。并且 OPA 决策依赖的数据会异步定时去权限管理服务(policy)和后端服务(aslan)采集决策所需要的权限和资源数据，从而实现高性能决策。 
  
  
 
### Zadig 权限数据库模型 
 
##### zadig-policy 数据库中的相关数据模型 
role： 
用户角色定义表，用来定义某项目下角色，下面的一条记录表示在项目「zadig」下有一个「dev」角色，该角色拥有查看工作流和执行工作流的权限 
 
  
rolebinding： 
用户角色绑定表，用来将角色绑定到用户身上，下面的一条记录表示将「zadig」项目下的「dev」角色绑定给 uid 为「71b8aa87-a10b-11ec-af4e-fa012450189e」的用户 
 
  
policy_meta： 
权限元信息表，用来将业务语意的权限转换为对应 【endpoint+action】，在提供给 opa 的bundle 数据里角色下面的权���会��转换成一组 url 的集合，具体转换后的内容可以看决策数据中的 roles 
 
  
policy： 
用户策略定义表，用来定义某项目下策略，下面的一条记录表示在项目「zadig」下有一个「zadig-dev-system-zhangsan」策略 
policy 和 role 表基本一致，主要区别是 policy 表多了一个 match_attributes 字段，这里表示对于项目「zadig」下打上label为【key = policy，value = zadig-dev-system-zhangsan-Workflow-zadig-workflow-dev】的workflow有拥有查看工作流和执行工作流的权限 
 
  
policybinding： 
用户策略绑定表，用来将策略绑定到用户身上，下面的一条记录表示将「zadig」项目下的「zadig-dev-system-zhangsan」策略绑定给uid为「4fd92962-a4f6-11ec-af4e-fa012450189e」的用户 
 
  
 
##### Zadig 数据库中的相关数据模型 
label： 
标签表，标签会同时打在权限 rule 规则和资源上，即表示权限对此标签的资源有相关权限 
 
  
labelbinding： 
标签资源关联表，记录标签和资源的绑定关系 
 
  
 
### RBAC 的实现 
 
##### 决策数据 
决策数据指的是提供给 OPA 用来执行决策的元数据集，它包括权限数据和资源数据，主要来自于权限管理服务(policy)和后端服务(aslan)，在 OPA 术语中叫做 bundle，OPA 会将 bundle 缓存，提高决策效率，以下为决策数据目录结构。 
 
  
roles： 
角色数据，数据来自上述 role 和 policy_meta 表，采集时会将其拼装，因此此处的 rules 是最终拼装的结果 
 
  
bindings: role_bindings： 
角色绑定数据，数据主要来自于上述 rolebinding 表 
 
  
resources： 
资源数据，Zadig 目前提供项目下细粒度资源的权限控制，所以需要采集工作流和环境相关资源 
 
  Workflow：工作流采集数据，原始数据存储在后端服务(aslan)  
  Environment：采集数据，原始数据存储在后端服务(aslan)  
 
 
  
exemptions： 
特殊 url 采集 
 
  Public: zadig 公开的 urls，所有用户(包括未登录用户都能访问)  
  Privileged: zaidg 特权 urls，只有系统 admin 用户能访问  
  Registered: zadig 所有注册的 urls，没有注册的 urls 默认登录用户就能访问  
 
 
  
 
### OPA 实现 
鉴权流程： 
 
  校验 url 是否无注册，如果是无注册，则返回通过  
  用户是否是 admin，如果是，则返回通过  
  请求是否满足，url 不是特权 url，并且用户为该项目的项目管理员,如果是则返回通过  
  请求是否满足，url 不是特权 url，并且请求匹配该用户绑定的角色的权限，如果是则返回通过(权限不带标签，即 rule 中不带有 matchAttributes   
 
关键代码(rego)： 
 
  
 
### ABAC 的实现 
 
##### 决策数据 
决策数据解释同 RBAC 决策数据。 
  
bindings : policy_bindings： 
策略绑定数据，数据来自上述 policybinding 表。 
  
 
  
policies： 
策略数据，数据来自上述 policy 表,相比较于 roles，他的 rule 的 matchAttributes 中会带有标签，会对相匹配的资源进行过滤。 
 
  
resources： 
相比于 rbac 的 resource 采集，这里的资源 spec 中会带上 label，用来做细粒度资源匹配。 
 
  
 
##### OPA 实现 
鉴权流程： 
 
  单个资源请求匹配，请求是否满足 url 不是特权 url，该用户绑定的策略权限规则匹配该请求，并且该权限的标签匹配用户请求资源的标签，如果是则返回通过(权限带标签，即 rule 中带 matchAttributes)  
  如果上述都不满足，会进行多资源请求匹配，该用户绑定的策略权限规则匹配该请求，如果是则会对匹配的资源进行过滤(权限带标签，即 rule 中带matchAttributes)  
  如果所有都不满足，则返回鉴权失败  
 
关键代码(rego)： 
 
  
以上实现可以参考 Zadig 源码位置： 
pkg/microservice/policy/core/service/bundle/rego/authz.rego 
  
  
 
### 展望 
上面我们详解了 Zadig 基于 OPA 的权限架构设计、数据库模型实现以及 RBAC、ABAC 的实现，希望能给大家带来思考和帮助。有了这样一套权限管理方案还可以实现更多实用的功能，比如接下来的版本中，将提供根据项目细粒度权限控制来隐藏和关闭前端按钮、系统角色权限管理和组管理能力及服务粒度的权限控制等等。 
  
想和专家及各个企业用户直接交流？ 
快快加入 Zadig 开源吐槽群🔥
                                        