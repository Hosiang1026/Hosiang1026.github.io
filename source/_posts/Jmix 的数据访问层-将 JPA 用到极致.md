---
title: 推荐系列-Jmix 的数据访问层-将 JPA 用到极致
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 2074
cover_picture: 'https://oscimg.oschina.net/oscnet/up-7d82803a62efd1cc4633b0fbd2ba0d6c9b1.png'
abbrlink: 94e8132e
date: 2021-04-15 09:46:45
---

&emsp;&emsp;简介 对任何企业及应用来说，数据模型都是应用的基石之一。在设计数据模型时，除了需要考虑业务数据的要求之外，还应该思考一些有可能会影响应用程序设计的问题。比如，是否需要数据库表行级...
<!-- more -->

                                                                                                                                                                                        #### ![Test](https://oscimg.oschina.net/oscnet/up-7d82803a62efd1cc4633b0fbd2ba0d6c9b1.png  'Jmix 的数据访问层-将 JPA 用到极致') 
 
#### 简介 
      对任何企业及应用来说，数据模型都是应用的基石之一。在设计数据模型时，除了需要考虑业务数据的要求之外，还应该思考一些有可能会影响应用程序设计的问题。比如，是否需要数据库表行级的安全机制？是否需要使用软删除？是否需要 CRUD API，如果需要的话，谁来干这个枯燥的活？ 
      事实上，JPA 已经是 Java 应用程序中创建数据模型的标准了。但是 JPA 不提供能实现高级安全机制的接口，也没有软删除，所以有需求的程序员只能自己�����。 
      Jmix 框架提供了通用的引擎，可以为使用 JPA 的应用程序增加额外的功能。在不破坏 JPA 兼容性的情况下，Jmix 框架可以让您愉快的使用高级数据安全机制，无感的使用软删除，并且为 CRUD 操作提供通用 REST API 以及其他的功能。 
      本文将讨论 Jmix 中的数据访问层，谈谈使用该框架及其工具到底能做什么，还会讨论数据访问层的一些底层原理。 
 
#### 数据模型，JPA 和 @JmixEntity 
      对于熟悉 JPA 的 Java 开发者来说，使用 Jmix 不需要学习任何新的知识。只需要创建 JPA 实体即可。Jmix 也提供了可视化设计器可以帮助完成这一工作。 
      在 Jmix 的可视化设计器中，您需要提供实体名称，选择 ID 类型（UUID、Long、Integer、String 或者嵌入类），然后选择需要支持的功能： 
 
 实体版本 - 支持乐观锁 
 创建时审计 - 增加创建时间、创建人 
 更新时审计 - 增加更新时间、更新人 
 软删除 - 增加删除时间、删除人 
 
![Test](https://oscimg.oschina.net/oscnet/up-7d82803a62efd1cc4633b0fbd2ba0d6c9b1.png  'Jmix 的数据访问层-将 JPA 用到极致') 
      最后，您会得到类似如下的 JPA 类： 
 
 ```java 
  @JmixEntity
@Table(name = "SPEAKER")
@Entity(name = "Speaker")
public class Speaker {
  
   @JmixGeneratedValue
   @Column(name = "ID", nullable = false)
   @Id
   private UUID id;

   @Email
   @Column(name = "EMAIL", unique = true)
   private String email;

   @Column(name = "NAME", nullable = false)
   @NotNull
   private String name;

   @Column(name = "VERSION", nullable = false)
   @Version
   private Integer version;

   @CreatedBy
   @Column(name = "CREATED_BY")
   private String createdBy;

   @LastModifiedBy
   @Column(name = "LAST_MODIFIED_BY")
   private String lastModifiedBy;

   @DeletedDate
   @Column(name = "DELETED_DATE")
   @Temporal(TemporalType.TIMESTAMP)
   private Date deletedDate;

   // 此处省略部分字段
}
  ``` 
  
      注意，Jmix 并非侵入式的影响你的代码。生成的实体只是添加了一些注解，不需要实现任何框架特有的接口，更不需要继承某个类。这样的非侵入式设计，在实现您应用程序特有的实体关系和架构时，能保持足够的灵活度以适应你的业务需求。 
      Jmix 使用的大部分注解要么来自 JPA 要么来自 Spring Boot JPA 库： 
 ```java 
  @Entity、@Versioned、@CreatedBy、@LastModifiedBy
  ``` 
 ，您之前也许都见过。Jmix 框架依赖 Spring Boot 的具体实现来支持乐观锁以及创建和更新审计。 
      下面看看数据模型中几个 Jmix 特有的注解： 
 
  
 ```java 
  @JmixEntity
  ``` 
  - 引导 Jmix 数据访问层将此类添加至实体仓库（Entities repository） 
  
 ```java 
  @JmixGeneratedValue
  ``` 
  - 表示实体的  
 ```java 
  ID
  ``` 
  属性必须由 Jmix 生成并指定 
  
 ```java 
  @DeletedBy
  ``` 
  和  
 ```java 
  @DeletedDate
  ``` 
  - 标记字段，当使用软删除方案时用来标记实体的删除状态 
 
      您也许会问：“什么是 Jmix 数据访问层中的实体仓库？你们是不是有自己的数据访问引擎？” 答案是也不是。Jmix 框架会存储应用程序数据模型的额外信息 - metamodel（元模型），并且增加了一个特殊的工具 -  
 ```java 
  DataManager
  ``` 
  - 用来访问数据，但是其底层还是用的 JPA。 
 
##### Metamodel 和 DataManager 
      Jmix 基于 Spring boot 框架构建。Boot 以广泛使用 IoC 模式而闻名天下，该模式意味着将有关 bean 的所有数据存储在特殊的存储库中 -  
 ```java 
  ApplicationContext
  ``` 
 。除了这个存储之外，Jmix 将关于应用程序数据模型的所有数据（比如 metadata）存储在另一个存储库中 -  
 ```java 
  Metadata
  ``` 
 。 
      Jmix 中  
 ```java 
  Metadata
  ``` 
  是数据访问层的核心。包含关于实体、属性、实体关系等等所有的信息。这些信息是在应用程序启动时对类进行扫描的过程中一次收集的，Jmix 用这些信息来实现神奇的功能：从行级数据安全机制到自动生成的管理界面 UI 的双向数据绑定。 
      为了有效的使用 Jmix 数据访问层，需要使用 DataManager 组件。该组件是 JPA 中著名  
 ```java 
  EntityManager
  ``` 
  的包装类。与  
 ```java 
  EntityManager
  ``` 
  类似， 
 ```java 
  DataManager
  ``` 
  能使用 JPQL 查询语句或者 ID 加载实体，保存或删除实体以及对所选实例进行计数。 
      下面是  
 ```java 
  DataManager
  ``` 
  的一些示例用法。 
      通过  
 ```java 
  ID
  ``` 
  加载一个实体，使用 Java 类作为参数： 
 
 ```java 
    Speaker loadSpeakerById(UUID speakerId) {
      return dataManager.load(Speaker.class) 
            .id(speakerId)                 
            .one();                         
  }
  ``` 
  
      使用 JPQL 查询加载数据： 
 
 ```java 
    List<Speaker> loadSpeakesByCompanyEmail() {
      return dataManager.load(Speaker.class)
            .query("select s from Speaker s where s.email like :email")
            .parameter("email", "%@company.com")
            .list();
  }
  ``` 
  
       
 ```java 
  DataManager
  ``` 
  使用  
 ```java 
  Metamodel
  ``` 
  提供一些额外的功能。是这样实现的：在对应用程序数据库的请求交由  
 ```java 
  EntityManager
  ``` 
  执行之前，对请求进行拦截并修改。 
       我们仔细看看 Jmix 提供的这些功能。 
 
#### 高级数据安全 
      首先需要提到的是 Jmix 的数据安全子系统。框架使用基于角色的安全机制并定义了两种类型的角色： 
         1. 资源角色（Resource role）- 授予访问实体对象并在系统中执行特定操作的权限：对实体，实体属性进行 CURD 操作，使用 UI 界面等等。 
         2. 行级角色（Row-level role）- 可以限制对表中特定数据行的访问，换句话说，即限制访问某些实体实例。 
      下面是资源角色的示例，可以定义实体 CRUD 操作的策略，甚至可以定义针对实体属性操作的策略： 
 
 ```java 
    @ResourceRole(name = "Speaker Admin", code = "speaker-admin-role")
  public interface SpeakerAdminRole {

     @EntityPolicy(entityName = "Speaker", 
                 actions = {EntityPolicyAction.ALL})
     @EntityAttributePolicy(entityName = "Speaker", 
                          attributes = "{name, email}", 
                          action = EntityAttributePolicyAction.MODIFY)
     void speakersAccess();
  }
  ``` 
  
      为了实现这个功能， 
 ```java 
  DataManager
  ``` 
  会分析 JPQL，然后依据策略的定义限制该 JPQL 的执行或修改 JPQL 中的属性列表以符合安全策略。 
      如需定义行级角色，您需要制定一个 JPQL 策略，该 JQPL 策略由  
 ```java 
  where
  ``` 
  以及可选的  
 ```java 
  join
  ``` 
  子句组成，用来限制从数据库表中选取的数据： 
 
 ```java 
    @RowLevelRole(name = "Speaker's Talks",
             code = "speakers-talks-role")
  public interface SpeakersTalksRole {

     @JpqlRowLevelPolicy(entityClass = Talk.class,
                       where = "{E}.speaker.id = :current_user_id")
     void accessibleTalks();
  }
  ``` 
  
      因此，带有行级角色用户发起的所有查询都会通过这种方式进行转换： 
 ```java 
  where
  ``` 
 子句会用 AND 操作符添加在现有的条件之后， 
 ```java 
  join
  ``` 
  子句也会添加在现有的之后。如果 JPQL 中没有这两个关键字，相应的子句会直接添加在后面。 
       
 ```java 
  Metadata
  ``` 
  存储库在这里扮演了重要的角色。它能帮助我们正确的解析并修改 JPQL 并能找出受限的属性和实体，无论使用的是 JPQL 还是 Java 类来定义 DB 查询。 
 
#### 软删除 
      某些情况下，有必要在企业级应用中使用软删除。我们发布了 CUBA 博客“是否实施软删除，这是个问题！” 专门讨论了软删除模式的优缺点。Jmix 是下一代 CUBA，因此也支持软删除。 
      如果实体中有  
 ```java 
  @DeletedBy
  ``` 
  和  
 ```java 
  @DeletedDate
  ``` 
  注解的字段，则该实体会自动启用软删除模式。对于这些实体，所有  
 ```java 
  DataManager
  ``` 
  中调用的  
 ```java 
  remove()
  ``` 
  都会被转换成  
 ```java 
  UPDATE
  ``` 
  语句，而所有的  
 ```java 
  find()
  ``` 
  请求都会被修改，添加一个合适的  
 ```java 
  where
  ``` 
  子句用来过滤那些被 “删除” 的实体。 
 
 ```java 
  @JmixEntity
@Table(name = "SPEAKER")
@Entity(name = "Speaker")
public class Speaker {

   @JmixGeneratedValue
   @Column(name = "ID", nullable = false)
   @Id
   private UUID id;

   @DeletedBy
   @Column(name = "DELETED_BY")
   private String deletedBy;

   @DeletedDate
   @Column(name = "DELETED_DATE")
   @Temporal(TemporalType.TIMESTAMP)
   private Date deletedDate;

      // 此处省略部分字段
}
  ``` 
  
      这里我们需要  
 ```java 
  Metadata
  ``` 
  来找出哪一列需要更新或者添加到 where 子句中。与 CUBA 不同，Jmix 不要求实体实现一个特定的接口才能支持软删除。而只需要将两个注解添加至实���的两个字段即可。 
      尽管我们用了软删除，但是数据并没有删掉，因此您还是可以使用 “硬删除”，如果想看到软删除的数据，可以使用 JPA 的  
 ```java 
  EntityManager
  ``` 
  和原生 SQL 查询。 
 
#### REST 和 GraphQL 
      自动创建 CRUD API 是 Jmix metamodel 的亮点。当您拥有应用程序中所有实体的信息时，创建实体操作的 API 就非常容易了。 
      比如，如果有数据模型的元数据，那么处理下面这个 HTTP 请求将不是难事： 
 
 ```java 
    GET  'http://server:8080/rest/entities/Speaker'
  ``` 
  
      比如，CRUD 操作的 endpoints 列表是这样的： 
![Test](https://oscimg.oschina.net/oscnet/up-7d82803a62efd1cc4633b0fbd2ba0d6c9b1.png  'Jmix 的数据访问层-将 JPA 用到极致') 
      使用 Jmix 的好处就是您不需要手动实现这些枯燥的 endpoints。由于有 metamodel，所有这些都能自动生成。在开发 “为前端服务的后端” 时，可以从自动生成的代码开始逐步构建您自己的特定 REST API。 
      如果您的要求比通用 CRUD REST API 更灵活，可以使用 GraphQL。GraphQL 的一个核心概念就是 schema。使用 Jmix 的 metamodel，我们毫不费力就能获得 GraphQL schema 所需的所有数据。 
      也就是说，Jmix 应用程序使用 GraphQL API 是和 REST API 类似，能以通用的方式实现（很快将发布）。因此，在您的 Jmix 应用程序中添加 GraphQL endpoint，只需在构建脚本中简单增加一个 starter 即可： 
 
 ```java 
  implementation 'io.jmix.graphql:jmix-graphql-starter'
  ``` 
  
      然后就可以使用类似这样的查询了： 
 
 ```java 
  {
  speakerCount
  speakerList(limit: 10, offset: 0, orderBy: {name: ASC}) {
    id
    name
    email
  }
}
  ``` 
  
 
#### 结论 
      只需在 Jmix 中使用熟悉的 JPA 注解定义数据模型，您就能创建一个可用的应用程序。借助 Jmix 的 metamodel，无需进行额外的编码即可使用下列功能： 
          1. 行级安全机制 
          2. 软删除 
          3. CRUD REST API 
          4. GraphQL API 
      如您所见，使用 Jmix 创建一个简单的以数据为中心的应用程序，并带有高级功能和管理界面将变得非常容易。 
 
                                        