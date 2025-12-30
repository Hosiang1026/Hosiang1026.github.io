---
title: SpringBoot入门篇
categories: Spring生态体系系列
tags:
  - Java
author: 狂欢马克思
abbrlink: '66e04423'
date: 2022-01-06 00:00:00
top: 22
---

SaaS（Software as a Service）多租户平台是现代云服务的重要架构模式，允许多个不同环境的用户共享同一套应用程序，同时保证数据完全隔离。本文详细介绍如何使用Spring Boot框架快速构建多租户SaaS系统，涵盖独立数据库和共享数据库独立Schema两种主流实现方案

<!-- more -->

![SaaS](https://hosiang1026.github.io/photos/image/2024/12/15/10s874r.png "Spring Boot构建多租户SaaS平台-入门篇")

### 一、多租户应用场景

#### 1.1 传统多客户部署的问题

假设我们需要开发一个应用程序，并且希望将同一个应用程序销售给N家客户使用。

```
**传统部署方式的问题：**
```

在常规情况下，我们需要：
- 创建N个Web服务器（Tomcat）
- 创建N个数据库（DB）
- 为N个客户部署相同的应用程序N次

```
**维护成本问题：**
```

1. **升级困难**：如果应用程序进行了升级或者做了其他改动，需要更新N个应用程序
2. **服务器维护**：需要同时维护N台服务器
3. **版本管理**：如果业务增长，客户由N个变成N+M个，将面临N个应用程序和M个应用程序版本的维护问题
4. **成本控制**：设备维护成本、人力成本急剧增加
5. **运维压力**：运维人员需要管理大量独立的部署实例

#### 1.2 多租户SaaS解决方案

为了解决上述问题，我们可以开发**多租户应用程序（Multi-Tenant Application）**。

```
**核心思想：**
```
- 根据当前用户所属的租户，动态选择对应的数据库
- 例如：当请求来自A公司的用户时，应用程序连接A公司的数据库
- 当请求来自B公司的用户时，自动将数据库切换到B公司数据库

```
**优势：**
```
- 只需要部署一套应用程序
- 升级和维护只需要操作一次
- 大大降低运维成本和复杂度

#### 1.3 多租户实现的关键问题

从理论上讲没有什么问题，但如果考虑将现有的应用程序改造成SaaS模式，我们将遇到以下关键问题：

1. **如何识别请求来自哪一个租户？**
2. **如何自动切换数据源？**
3. **如何维护租户信息？**
4. **如何保证数据隔离？**

接下来我们将详细讲解这些问题的解决方案。

### 二、维护、识别和路由租户数据源

#### 2.1 租户信息维护

我们可以提供一个**独立的库来存放租户信息**，包括：
- 数据库名称
- 数据库连接地址
- 用户名、密码
- 其他配置信息

这样可以统一解决租户信息维护的问题，便于管理和扩展。

#### 2.2 租户识别方式

租户的识别和路由有很多种方法，下面列举几种常用的方式：

```
**方式一：域名识别（推荐）**
```

- **实现方式**：为每一个租户提供一个唯一的二级域名
- **示例**：`tenantone.example.com`、`tenanttwo.example.com`
- **识别关键**：`tenantone`和`tenanttwo`就是我们识别租户的关键信息
- **优点**：直观、易于理解，每个租户有独立的访问地址
- **缺点**：需要配置DNS，域名管理相对复杂

```
**方式二：请求参数识别**
```

- **实现方式**：将租户信息作为请求参数传递给服务端
```
- **示例**：`saas.example.com?tenantId=tenant1`、`saas.example.com?tenantId=tenant2`
```
- **识别关键**：参数`tenantId`就是应用程序识别租户的关键信息
- **优点**：实现简单，无需额外配置
- **缺点**：URL中暴露租户信息，安全性较低

```
**方式三：请求头识别（推荐）**
```

- **实现方式**：在请求头（Header）中设置租户信息
- **技术方案**：使用JWT等技术，服务端通过解析Header中相关参数获得租户信息
- **示例**：`X-Tenant-Id: tenant1`
- **优点**：安全性高，不暴露在URL中，支持RESTful API
- **缺点**：需要前端配合设置请求头

```
**方式四：Session识别**
```

- **实现方式**：在用户成功登录系统后，将租户信息保存在Session中
- **使用方式**：在需要的时候从Session取出租户信息
- **优点**：实现简单，适合传统Web应用
- **缺点**：不适合前后端分离架构，不支持无状态服务

#### 2.3 动态数据源配置

```
**传统方式的问题：**
```

在启动Spring Boot应用程序之前，就需要为其提供有关数据源的配置信息。按照需求，有N个客户需要使用我们的应用程序，就需要提前配置好N个数据源（多数据源）。

```
**问题分析：**
- 如果N < 50，可能还能忍受
- 如果N > 50甚至更多，这样显然是无法接受的
```
- 配置文件会变得非常庞大
- 新增租户需要修改配置并重启应用

```
**解决方案：动态数据源**
```

我们需要借助**Hibernate 5提供的动态数据源特性**，让应用程序具备动态配置客户端数据源的能力。

```
**实现流程：**
```

1. **存储租户信息**：当用户请求系统资源时，将用户提供的租户信息（tenantId）存放在`ThreadLocal`中
2. **获取租户信息**：从`ThreadLocal`中获取租户信息
3. **查询配置**：根据租户信息查询租户配置库，获取当前租户的数据源配置信息
4. **动态设置数据源**：借助Hibernate动态配置数据源的能力，为当前请求设置数据源
5. **执行请求**：使用设置好的数据源执行用户的请求

- 只需要在应用程序中维护一份数据源配置信息（租户数据库配置库）
- 其余的数据源动态查询配置
- 新增租户无需修改配置和重启应用
- 支持租户数量的动态扩展

接下来，我们将快速演示这一功能的实现。

### 三、 项目构建

我们将使用Spring Boot 2.1.5版本来实现这一演示项目，首先你需要在Maven配置文件中加入如下的一些配置：

```xml
<dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter</artifactId>
        </dependency>

            <artifactId>spring-boot-devtools</artifactId>
            <scope>runtime</scope>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
            <artifactId>spring-boot-starter-Web</artifactId>
            <artifactId>spring-boot-configuration-processor</artifactId>
            <groupId>MySQL</groupId>
            <artifactId>MySQL-connector-java</artifactId>
            <version>5.1.47</version>
            <artifactId>spring-boot-starter-freemarker</artifactId>
            <groupId>org.apache.commons</groupId>
            <artifactId>commons-lang3</artifactId>
    </dependencies>
`然后提供一个可用的配置文件，并加入如下的内容：```xml
spring:
  freemarker:
    cache:false
    template-loader-path:
    - classpath:/templates/
    prefix:
    suffix:.html
  resources:
    static-locations:
    - classpath:/static/
  devtools:
    restart:
      enabled:true
  jpa:
    database:MySQL
    show-sql:true
    generate-ddl:false
    hibernate:
      ddl-auto:none
una:
  master:
    datasource:
      url:jdbc:MySQL://localhost:3306/master_tenant?useSSL=false
      username:root
      password:root
      driverClassName:com.MySQL.jdbc.Driver
      maxPoolSize:10
      idleTimeout:300000
      minIdle:10
      poolName:master-database-connection-pool
logging:
  level:
    root:warn
    org:
      springframework:
        Web:debug
      hibernate:debug
```

由于采用Freemarker作为视图渲染引擎，所以需要提供Freemarker的相关技术

```
una:master:datasource配置项就是上面说的统一存放租户信息的数据源配置信息，你可以理解为主库。
```

接下来，我们需要关闭Spring Boot自动配置数据源的功能，在项目主类上添加如下的设置：

```java
@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class})
publicclass UnaSaasApplication {

    public static void main(String[] args) {
        SpringApplication.run(UnaSaasApplication.class, args);
    }

}

```

最后，让我们看看整个项目的结构：

![SaaS](https://hosiang1026.github.io/photos/image/2024/12/15/10t1i5e.png "Spring系列-Spring Boot构建多租户SaaS平台-入门篇")

### 四、 实现租户数据源查询模块

我们将定义一个实体类存放租户数据源信息，它包含了租户名，数据库连接地址，用户名和密码等信息，其代码如下：

```java
@Data
@Entity
@Table(name = "MASTER_TENANT")
@NoArgsConstructor
@AllArgsConstructor
@Builder
publicclass MasterTenant implements Serializable{
```

```java
    @Id
    @Column(name="ID")
    private String id;
```

```java
    @Column(name = "TENANT")
    @NotEmpty(message = "Tenant identifier must be provided")
    private String tenant;
```

```java
    @Column(name = "URL")
    @Size(max = 256)
    @NotEmpty(message = "Tenant jdbc url must be provided")
    private String url;
```

```java
    @Column(name = "USERNAME")
    @Size(min = 4,max = 30,message = "db username length must between 4 and 30")
    @NotEmpty(message = "Tenant db username must be provided")
    private String username;
```

```java
    @Column(name = "PASSWORD")
    @Size(min = 4,max = 30)
    @NotEmpty(message = "Tenant db password must be provided")
    private String password;
```

```java
    @Version
    privateint version = 0;
```
}

```

持久层我们将继承JpaRepository接口，快速实现对数据源的CURD操作，同时提供了一个通过租户名查找租户数据源的接口，其代码如下：

package com.ramostear.una.saas.master.repository;

import com.ramostear.una.saas.master.model.MasterTenant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * @author : Created by Tan Chaohong (alias:ramostear)
 * @create-time 2019/5/25 0025-8:22
 * @modify by :
 * @since:
 */
@Repository
publicinterface MasterTenantRepository extends JpaRepository<MasterTenant,String>{

    @Query("select p from MasterTenant p where p.tenant = :tenant")
    MasterTenant findByTenant(@Param("tenant") String tenant);
}
`业务层提供通过租户名获取租户数据源信息的服务（其余的服务各位可自行添加）：```java
package com.ramostear.una.saas.master.service;


/**
 * @create-time 2019/5/25 0025-8:26
 */

publicinterface MasterTenantService {
    /**
     * Using custom tenant name query
     * @param tenant    tenant name
     * @return          masterTenant
     */
    MasterTenant findByTenant(String tenant);
}
```


```java
@Getter
@Setter
@Configuration
@ConfigurationProperties("una.master.datasource")
publicclass MasterDatabaseProperties {
```


```java
    private String driverClassName;
```

```java
    privatelong connectionTimeout;
```

```java
    privateint maxPoolSize;
```

```java
    privatelong idleTimeout;
```

```java
    privateint minIdle;
```

```java
    private String poolName;
```

```java
    @Override
    public String toString(){
        StringBuilder builder = new StringBuilder();
        builder.append("MasterDatabaseProperties [ url=")
                .append(url)
                .append(", username=")
                .append(username)
                .append(", password=")
                .append(password)
                .append(", driverClassName=")
                .append(driverClassName)
                .append(", connectionTimeout=")
                .append(connectionTimeout)
                .append(", maxPoolSize=")
                .append(maxPoolSize)
                .append(", idleTimeout=")
                .append(idleTimeout)
                .append(", minIdle=")
                .append(minIdle)
                .append(", poolName=")
                .append(poolName)
                .append("]");
        return builder.toString();
```
    }
`接下来是配置自定义的数据源，其源码如下：```java
```go
package com.ramostear.una.saas.master.config;
```

```python
import com.ramostear.una.saas.master.config.properties.MasterDatabaseProperties;
import com.ramostear.una.saas.master.repository.MasterTenantRepository;
import com.zaxxer.hikari.HikariDataSource;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.cfg.Environment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.dao.annotation.PersistenceExceptionTranslationPostProcessor;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.JpaVendorAdapter;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
import org.springframework.transaction.annotation.EnableTransactionManagement;
```

```java
import javax.persistence.EntityManagerFactory;
import javax.sql.DataSource;
import java.util.Properties;
```

```
/**
 * @create-time 2019/5/25 0025-8:31
```
 */
```java
@EnableTransactionManagement
@EnableJpaRepositories(basePackages = {"com.ramostear.una.saas.master.model","com.ramostear.una.saas.master.repository"},
                       entityManagerFactoryRef = "masterEntityManagerFactory",
                       transactionManagerRef = "masterTransactionManager")
@Slf4j
publicclass MasterDatabaseConfig {
```

```java
    @Autowired
    private MasterDatabaseProperties masterDatabaseProperties;
```

```java
    @Bean(name = "masterDatasource")
    public DataSource masterDatasource(){
        log.info("Setting up masterDatasource with :{}",masterDatabaseProperties.toString());
        HikariDataSource datasource = new HikariDataSource();
        datasource.setUsername(masterDatabaseProperties.getUsername());
        datasource.setPassword(masterDatabaseProperties.getPassword());
        datasource.setJdbcUrl(masterDatabaseProperties.getUrl());
        datasource.setDriverClassName(masterDatabaseProperties.getDriverClassName());
        datasource.setPoolName(masterDatabaseProperties.getPoolName());
        datasource.setMaximumPoolSize(masterDatabaseProperties.getMaxPoolSize());
        datasource.setMinimumIdle(masterDatabaseProperties.getMinIdle());
        datasource.setConnectionTimeout(masterDatabaseProperties.getConnectionTimeout());
        datasource.setIdleTimeout(masterDatabaseProperties.getIdleTimeout());
        log.info("Setup of masterDatasource successfully.");
        return datasource;
```
    }
```java
    @Primary
    @Bean(name = "masterEntityManagerFactory")
    public LocalContainerEntityManagerFactoryBean masterEntityManagerFactory(){
        LocalContainerEntityManagerFactoryBean lb = new LocalContainerEntityManagerFactoryBean();
        lb.setDataSource(masterDatasource());
        lb.setPackagesToScan(
           new String[]{MasterTenant.class.getPackage().getName(), MasterTenantRepository.class.getPackage().getName()}
```
        );

```python
        //Setting a name for the persistence unit as Spring sets it as 'default' if not defined.
        lb.setPersistenceUnitName("master-database-persistence-unit");
```

```
        //Setting Hibernate as the JPA provider.
        JpaVendorAdapter vendorAdapter = new HibernateJpaVendorAdapter();
        lb.setJpaVendorAdapter(vendorAdapter);
```

```
        //Setting the hibernate properties
        lb.setJpaProperties(hibernateProperties());
```

```
        log.info("Setup of masterEntityManagerFactory successfully.");
        return lb;
```
    }
```java
    @Bean(name = "masterTransactionManager")
    public JpaTransactionManager masterTransactionManager(@Qualifier("masterEntityManagerFactory")EntityManagerFactory emf){
        JpaTransactionManager transactionManager = new JpaTransactionManager();
        transactionManager.setEntityManagerFactory(emf);
        log.info("Setup of masterTransactionManager successfully.");
        return transactionManager;
```
    }

```java
    @Bean
    public PersistenceExceptionTranslationPostProcessor exceptionTranslationPostProcessor(){
        returnnew PersistenceExceptionTranslationPostProcessor();
```
    }
```java
    private Properties hibernateProperties(){
        Properties properties = new Properties();
        properties.put(Environment.DIALECT,"org.hibernate.dialect.MySQL5Dialect");
        properties.put(Environment.SHOW_SQL,true);
        properties.put(Environment.FORMAT_SQL,true);
        properties.put(Environment.HBM2DDL_AUTO,"update");
        return properties;
```
    }
```

在改配置类中，我们主要提供包扫描路径，实体管理工程，事务管理器和数据源配置参数的配置。

### 五、 实现租户业务模块

在此小节中，租户业务模块我们仅提供一个用户登录的场景来演示SaaS的功能。其实体层、业务层和持久化层根普通的Spring Boot Web项目没有什么区别，你甚至感觉不到它是一个SaaS应用程序的代码。

首先，创建一个用户实体User，其源码如下：

@Table(name = "USER")
@Data
publicclass User implements Serializable {
    privatestaticfinallong serialVersionUID = -156890917814957041L;

    @Id
    @Column(name = "ID")


    @Size(min = 6,max = 22,message = "User password must be provided and length between 6 and 22.")

}


```

业务层提供了一个根据用户名检索用户信息的服务，它将调用持久层的方法根据用户名对租户的用户表进行检索，如果找到满足条件的用户记录，则返回用户信息，如果没有找到，则返回null；持久层和业务层的源码分别如下：

```java
publicinterface UserRepository extends JpaRepository<User,String>,JpaSpecificationExecutor<User>{
```

```
    User findByUsername(String username);
```
}
```java
@Service("userService")
publicclass UserServiceImpl implements UserService{
```

```java
    private UserRepository userRepository;
```

```java
    privatestatic TwitterIdentifier identifier = new TwitterIdentifier();
```


```java
    public void save(User user) {
        user.setId(identifier.generalIdentifier());
        user.setTenant(TenantContextHolder.getTenant());
        userRepository.save(user);
```
    }

```java
    public User findById(String userId) {
        Optional<User> optional = userRepository.findById(userId);
        if(optional.isPresent()){
            return optional.get();
        }else{
            returnnull;
```
        }

```java
    public User findByUsername(String username) {
        System.out.println(TenantContextHolder.getTenant());
        return userRepository.findByUsername(username);
```
    }

```

在这里，我们采用了Twitter的雪花算法来实现了一个ID生成器。

### 六、 配置拦截器

我们需要提供一个租户信息的拦截器，用以获取租户标识符，其源代码和配置拦截器的源代码如下：

/**
 * @create-time 2019/5/26 0026-23:17
 */
publicclass TenantInterceptor implements HandlerInterceptor{

    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String tenant = request.getParameter("tenant");
        if(StringUtils.isBlank(tenant)){
            response.sendRedirect("/login.html");
            returnfalse;
            TenantContextHolder.setTenant(tenant);
            returntrue;
        }
publicclass InterceptorConfig extends WebMvcConfigurationSupport {

    protected void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new TenantInterceptor()).addPathPatterns("/**").excludePathPatterns("/login.html");
        super.addInterceptors(registry);
    }

```

/login.html是系统的登录路径，我们需要将其排除在拦截器拦截的范围之外，否则我们永远无法进行登录

### 七、 维护租户标识信息

在这里，我们使用ThreadLocal来存放租户标识信息，为动态设置数据源提供数据支持，该类提供了设置租户标识、获取租户标识以及清除租户标识三个静态方法。其源码如下：

```java
publicclass TenantContextHolder {
```

```java
    privatestaticfinal ThreadLocal<String> CONTEXT = new ThreadLocal<>();
```

```java
    public static void setTenant(String tenant){
        CONTEXT.set(tenant);
```
    }

```java
    public static String getTenant(){
        return CONTEXT.get();
```
    }

```java
    public static void clear(){
        CONTEXT.remove();
```
    }

```

此类时实现动态数据源设置的关键

### 八、 动态数据源切换

要实现动态数据源切换，我们需要借助两个类来完成，CurrentTenantIdentifierResolver和AbstractDataSourceBasedMultiTenantConnectionProviderImpl。从它们的命名上就可以看出，一个负责解析租户标识，一个负责提供租户标识对应的租户数据源信息。首先，我们需要实现CurrentTenantIdentifierResolver接口中的resolveCurrentTenantIdentifier()和validateExistingCurrentSessions()方法，完成租户标识的解析功能。实现类的源码如下：

package com.ramostear.una.saas.tenant.config;

import com.ramostear.una.saas.context.TenantContextHolder;
import org.apache.commons.lang3.StringUtils;
import org.hibernate.context.spi.CurrentTenantIdentifierResolver;

/**
 * @create-time 2019/5/26 0026-22:38
 */
 publicclass CurrentTenantIdentifierResolverImpl implements CurrentTenantIdentifierResolver {

    /**
     * 默认的租户ID
     */
    privatestaticfinal String DEFAULT_TENANT = "tenant_1";

    /**
     * 解析当前租户的ID
     * @return
     */
    public String resolveCurrentTenantIdentifier() {
        //通过租户上下文获取租户ID，此ID是用户登录时在header中进行设置的
        String tenant = TenantContextHolder.getTenant();
        //如果上下文中没有找到该租户ID，则使用默认的租户ID，或者直接报异常信息
        return StringUtils.isNotBlank(tenant)?tenant:DEFAULT_TENANT;
    }

    public boolean validateExistingCurrentSessions() {
    }


```

此类的逻辑非常简单，就是从ThreadLocal中获取当前设置的租户标识符

有了租户标识符解析类之后，我们需要扩展租户数据源提供类，实现从数据库动态查询租户数据源信息，其源码如下：


```java
publicclass DataSourceBasedMultiTenantConnectionProviderImpl extends AbstractDataSourceBasedMultiTenantConnectionProviderImpl{
```

```java
    privatestaticfinallong serialVersionUID = -7522287771874314380L;
    private MasterTenantRepository masterTenantRepository;
```

```java
    private Map<String,DataSource> dataSources = new TreeMap<>();
```

```
    protected DataSource selectAnyDataSource() {
        if(dataSources.isEmpty()){
            List<MasterTenant> tenants = masterTenantRepository.findAll();
            tenants.forEach(masterTenant->{
                dataSources.put(masterTenant.getTenant(), DataSourceUtils.wrapperDataSource(masterTenant));
            });
        return dataSources.values().iterator().next();
```
    }
```
    protected DataSource selectDataSource(String tenant) {
        if(!dataSources.containsKey(tenant)){
                dataSources.put(masterTenant.getTenant(),DataSourceUtils.wrapperDataSource(masterTenant));
            });
        return dataSources.get(tenant);
```
    }

```

在该类中，通过查询租户数据源库，动态获得租户数据源信息，为租户业务模块的数据源配置提供数据数据支持。

最后，我们还需要提供租户业务模块数据源配置，这是整个项目核心的地方，其代码如下：

@ComponentScan(basePackages = {
        "com.ramostear.una.saas.tenant.model",
        "com.ramostear.una.saas.tenant.repository"
})
@EnableJpaRepositories(basePackages = {
        "com.ramostear.una.saas.tenant.repository",
        "com.ramostear.una.saas.tenant.service"
},entityManagerFactoryRef = "tenantEntityManagerFactory"
,transactionManagerRef = "tenantTransactionManager")
publicclass TenantDataSourceConfig {

    @Bean("jpaVendorAdapter")
    public JpaVendorAdapter jpaVendorAdapter(){
        returnnew HibernateJpaVendorAdapter();
    }
     @Bean(name = "tenantTransactionManager")
    public JpaTransactionManager transactionManager(EntityManagerFactory entityManagerFactory){
        transactionManager.setEntityManagerFactory(entityManagerFactory);
    }

    @Bean(name = "datasourceBasedMultiTenantConnectionProvider")
    @ConditionalOnBean(name = "masterEntityManagerFactory")
    public MultiTenantConnectionProvider multiTenantConnectionProvider(){
        returnnew DataSourceBasedMultiTenantConnectionProviderImpl();
    }
     @Bean(name = "currentTenantIdentifierResolver")
    public CurrentTenantIdentifierResolver currentTenantIdentifierResolver(){
        returnnew CurrentTenantIdentifierResolverImpl();
    }

    @Bean(name = "tenantEntityManagerFactory")
    @ConditionalOnBean(name = "datasourceBasedMultiTenantConnectionProvider")
    public LocalContainerEntityManagerFactoryBean entityManagerFactory(
            @Qualifier("datasourceBasedMultiTenantConnectionProvider")MultiTenantConnectionProvider connectionProvider,
            @Qualifier("currentTenantIdentifierResolver")CurrentTenantIdentifierResolver tenantIdentifierResolver
    ){
        LocalContainerEntityManagerFactoryBean localBean = new LocalContainerEntityManagerFactoryBean();
        localBean.setPackagesToScan(
                new String[]{
                        User.class.getPackage().getName(),
                        UserRepository.class.getPackage().getName(),
                        UserService.class.getPackage().getName()

                }
        );
        localBean.setJpaVendorAdapter(jpaVendorAdapter());
        localBean.setPersistenceUnitName("tenant-database-persistence-unit");
        Map<String,Object> properties = new HashMap<>();
        properties.put(Environment.MULTI_TENANT, MultiTenancyStrategy.SCHEMA);
        properties.put(Environment.MULTI_TENANT_CONNECTION_PROVIDER,connectionProvider);
        properties.put(Environment.MULTI_TENANT_IDENTIFIER_RESOLVER,tenantIdentifierResolver);
        localBean.setJpaPropertyMap(properties);
        return localBean;
    }


```

在改配置文件中，大部分内容与主数据源的配置相同，唯一的区别是租户标识解析器与租户数据源补给源的设置，它将告诉Hibernate在执行数据库操作命令前，应该设置什么样的数据库连接信息，以及用户名和密码等信息。

### 九、 应用测试

最后，我们通过一个简单的登录案例来测试本次课程中的SaaS应用程序，为此，需要提供一个Controller用于处理用户登录逻辑。在本案例中，没有严格的对用户密码进行加密，而是使用明文进行比对，也没有提供任何的权限认证框架，知识单纯的验证SaaS的基本特性是否具备。登录控制器代码如下：

```
/**
 * @create-time 2019/5/27 0027-0:18
```
 */
```java
@Controller
publicclass LoginController {
```

```java
    private UserService userService;
```

```java
    @GetMapping("/login.html")
    public String login(){
        return"/login";
```
    }

```java
    @PostMapping("/login")
    public String login(@RequestParam(name = "username") String username, @RequestParam(name = "password")String password, ModelMap model){
        System.out.println("tenant:"+TenantContextHolder.getTenant());
        User user = userService.findByUsername(username);
        if(user != null){
            if(user.getPassword().equals(password)){
                model.put("user",user);
                return"/index";
```
            }
        }


```
在启动项目之前，我们需要为主数据源创建对应的数据库和数据表，用于存放租户数据源信息，同时还需要提供一个租户业务模块数据库和数据表，用来存放租户业务数据。一切准备就绪后，启动项目，在浏览器中输入：http://localhost:8080/login.html

![SaaS](https://hosiang1026.github.io/photos/image/2024/12/15/10t1uha.png "Spring系列-Spring Boot构建多租户SaaS平台-入门篇")

在登录窗口中输入对应的租户名，用户名和密码，测试是否能够正常到达主页。可以多增加几个租户和用户，测试用户是否正常切换到对应的租户下。

注：特别申明一下，本篇文章来源于网络，觉得写的很好，便整理分享给大家！

