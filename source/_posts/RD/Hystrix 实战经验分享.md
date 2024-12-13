---
title: 推荐系列-Hystrix 实战经验分享
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 1954
cover_picture: 'https://static001.geekbang.org/infoq/5f/5f5249277d6ecaebced1557f63adc829.png'
abbrlink: db4d793b
date: 2021-04-15 09:46:45
---

&emsp;&emsp;一、背景 Hystrix是Netlifx开源的一款容错框架，防雪崩利器，具备服务降级，服务熔断，依赖隔离，监控(Hystrix Dashboard)等功能。 尽管说Hystrix官方已不再维护，且有Alibaba Sentinel等新框...
<!-- more -->

                                                                                                                                                                                         
### 一、背景 
Hystrix是Netlifx开源的一款容错框架，防雪崩利器，具备服务降级，服务熔断，依赖隔离，监控(Hystrix Dashboard)等功能。 
尽管说Hystrix官方已不再维护，且有Alibaba Sentinel等新框架选择，但从组件成熟度和应用案例等方面看，其实还是有很多项目在继续使用Hystrix中，本人所参与的项目就是其一。故结合个人的Hystrix实战经验与大家分享交流。 
 
### 二、经验总结 
 
#### 2.1 隔离策略的选择 
Hystrix提供两种资源隔离策略，线程池和信号量。它们之间的异同点如下： 
![Test](https://static001.geekbang.org/infoq/5f/5f5249277d6ecaebced1557f63adc829.png  'Hystrix 实战经验分享') 
而在使用缓存(本地内存缓存更适合该场景，Redis等网络缓存需要评估)时，我们可以使用信号量隔离策略，因为这类服务响应快，不会占用容器线程太长时间，而且也减少了线程切换的一些开销，提高了服务效率。 
具体使用哪种策略，需根据业务场景综合评估。一般情况下，推荐使用线程池隔离。 
 
#### 2.2 线程池大小与超时时间设置 
在线程池隔离策略下，线程池大小及超时时间的设置至关重要，直接影响着系统服务的响应能力。如线程池大小若设置的太大会造成资源浪费及线程切换等开销；若设置的太小又支撑不了用户请求，造成请求排队。而超时时间设置的太长会出现部分长耗时请求阻塞线程，造成其它正常请求排队等待；若设置的太短又会造成太多正常请求被熔断。 
对此Hystrix官方给的建议如图： 
![Test](https://static001.geekbang.org/infoq/5f/5f5249277d6ecaebced1557f63adc829.png  'Hystrix 实战经验分享') 
即转换为以下计算公式： 
 
  线程池大小 = 服务TP99响应时长（单位秒） * 每秒请求量 + 冗余缓冲值  
  超时时间（单位毫秒） = 1000（毫秒） / 每秒请求量  
 
例如某服务TP99情况下每秒钟会接收30个请求，然后每个请求的响应时长是200ms，按如上公式计算可得：线程池大小 = 0.2 * 30 + 4（冗余缓���值��= 10，超时时间 = 300ms 
 
#### 2.3 注解叠加 
在实际开发中可能会遇到某外部调用方法有Hystrix注解与其它注解一起使用的情况，例如查询方法加上缓存注解。此时需特别注意注解间的执行顺序，避免出现非预期的结果： 
 
 缓存注解未生效 
 
 
 
 因缓存异常造成该查询方法被熔断 
 
 
 
#### 2.4 服务的异常处理 
先给大家时间看如下代码，检查是否存在问题： 
 
 ```java 
  @HystrixCommand(fallbackMethod="queryUserByIdFallback")
public User queryUserById(String userId) {
  if(StringUtils.isEmpty(userId)) {
    throw new BizException("参数不合法");
  }
  
  Result<User> result;
  try {
    result = userFacade.queryById(userId);
  } catch(Exception e) {
    log.error("query user error. id={}", id, e);
  }
  
  if(result != null && result.isSuccess()) {
    return result.getData();
  }
  
  return null;
}
  ``` 
  
Hystrix在运行过程中会根据调用请求的成功率或失败率信息来确定每个依赖命令的熔断器是否打开。如果打开，后续的请求都会被拒绝。由此可见，对异常的控制是Hystrix运行效果起很大影响。 
再回头看上面的例子，会发现两个异常处理问题： 
 
 参数校验不通过时的异常处理 
 
 
 
 try-catch远程调用的异常处理 
 
 
 
#### 2.5  fallback方法 
Hystrix在依赖服务调用时通过增加fallback方法返回默认值的方式来支持服务优雅降级。但fallback的使用也有很多需要注意的地方，大致总结如下： 
 
  fallback 方法访问级别、参数等要与对应依赖服务一致  
  fallback 方法中执行的逻辑尽量轻量，如用本地缓存或静态默认值，避免远程调用  
  如果fallback方法里有远程调用，建议也使用Hystrix包装起来，且保证与主命令线程池的隔离  
  对于写操作的远程调用不建议使用fallback降级  
 
 
#### 2.6  groupKey、commandKey、threadPoolKey 
在使用Hystrix开发中肯定都见过这三个key，但很多人并不理解这三个key的意义以及对Hystrix的作用，尤其是threadPooKey，故在此总结下： 
groupKey 
通过group key可以对命令方法进行分组，便于Hystrix数据统计、告警及dashboad展示。一般会根据远程服务的业务类型进行区分，如账户服务定义一个group key，订单服务定义另一个group key。 
默认值是@HystrixCommand注解标注的方法所在的类名。 
commandKey 
具体命令方法的标识名称，常用于对该命令进行动态参数设置。 
默认值是@HystrixCommand注解标注的方法名。 
threadPoolKey 
用于标识命令所归属的线程池，具有相同threadPoolKey的命令使用同一个线程池。 
若该key不指定，默认值就是groupKey，即@HystrixCommand注解标注的方法所在的类名。 
在实际项目中，我们会建议尽量通过threadPoolKey来指定线程池， 而不是通过groupKey的默认方式划分， 因为会存在某个命令需要跟同组其他命令进行线程隔离的场景，以避免互相影响。 
 
#### 2.7 参数优先级 
Hystrix默认提供4个级别的参数值配置方式： 
全局默认值(Default Value) 
Hystrix自身代码默认值，写死在源码中的值，使用方不配置任何参数情况下生效。 
例：execution.isolation.thread.timeoutInMilliseconds超时时间全局默认值是1000，单位毫秒 
动态全局默认参数(Default Property) 
此类配置参数可变更全局默认值。 
例：通过属性名hystrix.command.default.execution.isolation.thread.timeoutInMilliseconds设置的超时时间值 
实例初始值(Instant Value) 
熔断器实例初始值，配置此类参数后，不再使用默认值。即写在代码注解中的属性值。 
例：@HystrixProperty(name = "execution.isolation.thread.timeoutInMilliseconds", value = "5000") 
动态实例参数(Instant Property) 
可动态调整一个熔断器实例的参数值 
例：通过属性名hystrix.command.HystrixCommandKey.execution.isolation.thread.timeoutInMilliseconds设置的超时时间值 
优先级关系: 
动态实例参数(Instance Property) > 实例初始值 > 动态全局默认参数(Default Property) > 全局默认值(Default Value) 
 
#### 2.8  基于配置中心实现参数动态配置 
Hystrix默认使用Archaius实现动态设置，而Archaius默认会加载classpath下的config.properties文件，可通过在配置文件中加入对应属性key-value实现动态控制Hystrix行为。在分布式项目中使用配置中心进行统一配置管理是标配，因此需要基于配置中心的扩展实现Hystrix参数动态配置功能。 
通过跟踪HystrixCommand的创建，发现hystrix最终通过HystrixDynamicProperties实现类根据参数属性名获取值，而Hystrix本身提供了HystrixDynamicProperties类的扩展机制，见HystrixPlugins类367行代码，可知Hystrix提供四种扩展方法： 
 
  通过系统参数  
  基于Java SPI机制  
  Archaius动态属性扩展实现类（默认）  
  Hystrix内置基于System.getProperty的HystrixDynamicProperties实现；  
 
2.8.1 基于Java SPI机制 
基于spi机制的扩展实现依赖两个类分别是HystrixDynamicProperties与HystrixDynamicProperty，其中HystrixDynamicProperties类是需要实现的Hystrix动态属性扩展spi接口，提供了多个获取动态属性的方法，接口定义如下： 
 
 ```java 
  public interface HystrixDynamicProperties {
    
    /**
     * Requests a property that may or may not actually exist.
     * @param name property name, never <code>null</code>
     * @param fallback default value, maybe <code>null</code>
     * @return never <code>null</code>
     */
    public HystrixDynamicProperty<String> getString(String name, String fallback);
    /**
     * Requests a property that may or may not actually exist.
     * @param name property name, never <code>null</code>
     * @param fallback default value, maybe <code>null</code>
     * @return never <code>null</code>
     */
    public HystrixDynamicProperty<Integer> getInteger(String name, Integer fallback);
    /**
     * Requests a property that may or may not actually exist.
     * @param name property name, never <code>null</code>
     * @param fallback default value, maybe <code>null</code>
     * @return never <code>null</code>
     */
    public HystrixDynamicProperty<Long> getLong(String name, Long fallback);
    /**
     * Requests a property that may or may not actually exist.
     * @param name property name
     * @param fallback default value
     * @return never <code>null</code>
     */
    public HystrixDynamicProperty<Boolean> getBoolean(String name, Boolean fallback);
}



  ``` 
  
而HystrixDynamicProperty类具体表示一个参数属性，且有动态变更的能力，接口定义如下： 
 
 ```java 
  public interface HystrixDynamicProperty<T> extends HystrixProperty<T>{
    
    public String getName();
    
    /**
     * Register a callback to be run if the property is updated.
     * @param callback callback.
     */
    public void addCallback(Runnable callback);
    
}
  ``` 
  
其中addCallback方法是实现属性动态变更的核心所在，如其注释说明的那样，它会在属性变更时注册callback回调方法进行属性动态刷新。而这块动态刷新逻辑是Hystrix内部已实现的，对于我们只需要自定义扩展时将callback保存，然后在配置中心变更时触发对应属性对象的callback方法即可。 
实现步骤如下： 
1、定义HystrixDynamicProperty实现类 
完成动态属性类的自定义实现，包括String/Integer/Long/Boolean四种类型动态属性态实现。 
如上面HystrixDynamicProperty类描述中说的那样，需要对callback进行保存，并在在收到配置中心属性变更时触发这些属性的callback方法，来实现属性的动态变更。这块逻辑可以参照观察者模式进行设计实现。 
代码如下： 
 
 ```java 
  private abstract static class CustomDynamicProperty<T> implements HystrixDynamicProperty<T>, PropertyObserver {
        protected final String name;
        protected final T defaultValue;
        protected List<Runnable> callbacks;

        protected CustomDynamicProperty(String propName, T defaultValue) {
            this.name = propName;
            this.defaultValue = defaultValue;

            PropertyObserverManager.add(this);
        }

        @Override
        public String getName() {
            return name;
        }

        @Override
        public void addCallback(Runnable callback) {
            if (callbacks == null)
                callbacks = new ArrayList<>(1);
            this.callbacks.add(callback);
        }

        @Override
        public String keyName() {
            return name;
        }

        @Override
        public void update(PropertyItem item) {
            if(getName().equals(item.getName())) {
                for(Runnable r : callbacks) {
                    r.run();
                }
            }
        }
    }

    private static class StringDynamicProperty extends CustomDynamicProperty<String> {
        protected StringDynamicProperty(String propName, String defaultValue) {
            super(propName, defaultValue);
        }

        @Override
        public String get() {
            return ConfigManager.getString(name, defaultValue);
        }
    }

    private static class IntegerDynamicProperty extends CustomDynamicProperty<Integer> {
        protected IntegerDynamicProperty(String propName, Integer defaultValue) {
            super(propName, defaultValue);
        }

        @Override
        public Integer get() {
            String configValue =  ConfigManager.get(name);
            if(StringUtils.isNotEmpty(configValue)) {
                return Integer.valueOf(configValue);
            }
            return defaultValue;
        }
    }

    private static class LongDynamicProperty extends CustomDynamicProperty<Long> {
        protected LongDynamicProperty(String propName, Long defaultValue) {
            super(propName, defaultValue);
        }

        @Override
        public Long get() {
            String configValue =  ConfigManager.get(name);
            if(StringUtils.isNotEmpty(configValue)) {
                return Long.valueOf(configValue);
            }
            return defaultValue;
        }
    }

    private static class BooleanDynamicProperty extends CustomDynamicProperty<Boolean> {
        protected BooleanDynamicProperty(String propName, Boolean defaultValue) {
            super(propName, defaultValue);
        }

        @Override
        public Boolean get() {
            String configValue =  ConfigManager.get(name);
            if(StringUtils.isNotEmpty(configValue)) {
                return Boolean.valueOf(configValue);
            }
            return defaultValue;
        }
    }

  ``` 
  
其中ConfigManager类暂时默认为配置中心配置管理类，提供参数获取与参数监听器等功能。而PropertyObserver类（keyName/update方法属于其定义）、PropertyObserverManager类就是参照观察者模式定义实现的，负责观察者的注册与通知管理，来完成动态属性与配置中心变更通知间的联动。这两个类实现比较简单就不展示描述。 
2、定义HystrixDynamicProperties实现类 
基于第1步定义的HystrixDynamicProperty扩展类完成HystrixDynamicProperties的自定义。代码如下： 
 
 ```java 
  
public class DemoHystrixDynamicProperties implements HystrixDynamicProperties {
    @Override
    public HystrixDynamicProperty<String> getString(String name, String fallback) {
        return new StringDynamicProperty(name, fallback);
    }

    @Override
    public HystrixDynamicProperty<Integer> getInteger(String name, Integer fallback) {
        return new IntegerDynamicProperty(name, fallback);
    }

    @Override
    public HystrixDynamicProperty<Long> getLong(String name, Long fallback) {
        return new LongDynamicProperty(name, fallback);
    }

    @Override
    public HystrixDynamicProperty<Boolean> getBoolean(String name, Boolean fallback) {
        return new BooleanDynamicProperty(name, fallback);
    }
}
  ``` 
  
3、注册SPI实现类 
在META-INF/services/添加名为com.netflix.hystrix.strategy.properties.HystrixDynamicProperties的文本文件，内容为第2步HystrixDynamicProperties自定义实现类全路径名。 
 
##### 2.8.2 基于默认Archaius进行扩展 
Hystrix默认通过Archaius实现参数动态获取，而Archaius自身也提供自定义的参数获取方式，分别是 PolledConfigurationSource接口 和AbstractPollingScheduler类，其中PolledConfigurationSource接口表示配置获取源，AbstractPollingScheduler类表示配置定时刷新机制。 
实现步骤如下： 
1、创建配置获取源： 
 
 ```java 
  public class CustomCfgConfigurationSource implements PolledConfigurationSource {
    private final static String CONFIG_KEY_PREFIX = "hystrix";
 
    @Override
    public PollResult poll(boolean initial, Object checkPoint) throws Exception {
        Map<String, Object> map = load();
        return PollResult.createFull(map);
    }
 
    private Map<String, Object> load() throws Exception{
        Map<String, Object> map = new HashMap<>();
 
        Set<String> keys = ConfigManager.keys();
        for(String key : keys) {
            if(key.startsWith(CONFIG_KEY_PREFIX)) {
                map.put(key, ConfigManager.get(key));
            }
        }
 
        return map;
    }
}
  ``` 
  
其实现非常简单，核心实现就是poll方法，遍历配置中心中所有hystrix开头的配置参数并返回保存。 
2、定义配置刷新方式： 
 
 ```java 
  
public class CustomCfgPollingScheduler extends AbstractPollingScheduler {
    private final static Logger logger = LoggerFactory.getLogger("CustomCfgPollingScheduler");
 
    private final static String CONFIG_KEY_PREFIX = "hystrix";
 
    @Override
    public void startPolling(PolledConfigurationSource source, final Configuration config) {
        super.startPolling(source, config);
        //
        ConfigManager.addListener(new ConfigListener() {
            @Override
            public void eventReceived(PropertyItem item, ChangeEventType type) {
                String name = item.getName();
                if(name.startsWith(CONFIG_KEY_PREFIX)) {
                    String newValue = item.getValue();
                    //新增&修改
                    if(ChangeEventType.ITEM_ADDED.equals(type) || ChangeEventType.ITEM_UPDATED.equals(type)) {
                        addOrChangeProperty(name, newValue, config);
                    }
                    //删除
                    else if(ChangeEventType.ITEM_REMOVED.equals(type)) {
                        deleteProperty(name, config);
                    }
                    else {
                        logger.error("error config change event type {}.", type);
                    }
                }
            }
        });
    }
 
    private void addOrChangeProperty(String name, Object newValue, final Configuration config) {
        if (!config.containsKey(name)) {
            config.addProperty(name, newValue);
        } else {
            Object oldValue = config.getProperty(name);
            if (newValue != null) {
                if (!newValue.equals(oldValue)) {
                    config.setProperty(name, newValue);
                }
            } else if (oldValue != null) {
                config.setProperty(name, null);
            }
        }
    }
 
    private void deleteProperty(String key, final Configuration config) {
        if (config.containsKey(key)) {
            config.clearProperty(key);
        }
    }
 
    @Override
    protected void schedule(Runnable pollingRunnable) {
        //IGNORE OPERATION
    }
 
    @Override
    public void stop() {
        //IGNORE OPERATION
    }
}
  ``` 
  
但对应实际项目，通过定时刷新的方式一是不太实时，二是每次都得全量检查配置中心是否有修改，逻辑复杂，所以此处改用 ConfigManager.addListener 增加配置中心监听来实现。 
3、定义并初始化自动配置： 
 
 ```java 
  DynamicConfiguration dynamicConfiguration = new DynamicConfiguration(new CustomCfgConfigurationSource(), new CustomCfgPollingScheduler());
ConfigurationManager.install(dynamicConfiguration);
  ``` 
  
最后只需要在容器启动时执行以上初始化脚本即可。 
细心的同学可能发现上面步骤中第3步，最终“安装”install到Hystrix配置管理类中的是 DynamicConfiguration类实现，且第2步的定时刷新类也比较鸡肋，就想着能否继续简化上面方案，只需要实现一个自定义的"DynamicConfiguration"就包含配置源获取与监听配置修改功能，实现如下： 
 
 ```java 
  public class CustomCfgDynamicConfiguration extends ConcurrentMapConfiguration {
    private final static Logger logger = LoggerFactory.getLogger("CustomCfgDynamicConfiguration");
 
    private final static String CONFIG_KEY_PREFIX = "hystrix";
 
    public CustomCfgDynamicConfiguration() {
        super();
        load();
        initEvent();
    }
 
    /**
     * 从配置中心全量加载Hystrix配置参数信息
     */
    private void load() {
        Set<String> keys = ConfigManager.keys();
        for(String key : keys) {
            if(key.startsWith(CONFIG_KEY_PREFIX)) {
                map.put(key, ConfigManager.get(key));
            }
        }
    }
 
    /**
     * 通过配置中心监听事件回调处理，针对Hystrix配置参数变更进行同步
     */
    private void initEvent() {
        ConfigManager.addListener(new ConfigListener() {
            @Override
            public void eventReceived(PropertyItem item, ChangeEventType type) {
                String name = item.getName();
                if(name.startsWith(CONFIG_KEY_PREFIX)) {
                    String newValue = item.getValue();
                    //新增&修改
                    if(ChangeEventType.ITEM_ADDED.equals(type) || ChangeEventType.ITEM_UPDATED.equals(type)) {
                        addOrChangeProperty(name, newValue);
                    }
                    //删除
                    else if(ChangeEventType.ITEM_REMOVED.equals(type)) {
                        deleteProperty(name);
                    }
                    else {
                        logger.error("error config change event type {}.", type);
                    }
                }
            }
        });
    }
 
    /**
     * 新增或修改参数值
     * @param name
     * @param newValue
     */
    private void addOrChangeProperty(String name, Object newValue) {
        if (!this.containsKey(name)) {
            this.addProperty(name, newValue);
        } else {
            Object oldValue = this.getProperty(name);
            if (newValue != null) {
                if (!newValue.equals(oldValue)) {
                    this.setProperty(name, newValue);
                }
            } else if (oldValue != null) {
                this.setProperty(name, null);
            }
        }
    }
 
    /**
     * 删除参数值
     * @param key
     */
    private void deleteProperty(String key) {
        if (this.containsKey(key)) {
            this.clearProperty(key);
        }
    }
}
  ``` 
  
最后通过 ConfigurationManager.install(new CustomCfgDynamicConfiguration());“安装”该实现即可。 
 
### 三、写在最后 
笔者结合项目实战对Hystrix使用进行总结分享，有关于隔离策略、线程池设置、参数优先级等知识点讲解，也��关于注解叠加、异常处理、参数动态配置等具体问题解决方案，希望对大家有所帮助。 

                                        