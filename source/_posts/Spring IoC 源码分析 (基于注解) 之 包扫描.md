---
title: 推荐系列-Spring IoC 源码分析 (基于注解) 之 包扫描
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 1707
cover_picture: 'https://static.oschina.net/uploads/img/201909/29135816_Oky2.jpg'
abbrlink: cb7bcffe
date: 2021-04-15 09:19:21
---

&emsp;&emsp;在上篇文章Spring IoC 源码分析 (基于注解) 一我们分析到，我们通过AnnotationConfigApplicationContext类传入一个包路径启动Spring之后，会首先初始化包扫描的过滤规则。那我们今天就来看下...
<!-- more -->

                                                                                                                                                                                        在上篇文章Spring IoC 源码分析 (基于注解) 一我们分析到，我们通过AnnotationConfigApplicationContext类传入一个包路径启动Spring之后，会首先初始化包扫描的过滤规则。那我们今天就来看下包扫描的具体过程。 
还是先看下面的代码： AnnotationConfigApplicationContext类 
 ```java 
  //该构造函数会自动扫描以给定的包及其子包下的所有类，并自动识别所有的Spring Bean，将其注册到容器中
	public AnnotationConfigApplicationContext(String... basePackages) {
		//初始化
		this();
		//扫描包、注册bean
		scan(basePackages);
		refresh();
	}

  ```  
上文我们分析了this()方法，会去初始化AnnotatedBeanDefinitionReader读取器和ClassPathBeanDefinitionScanner扫描器，并初始化扫描过滤规则。 接下来我们看一下scan(basePackages)方法： 一直跟踪下去，发现调用了ClassPathBeanDefinitionScanner类中的scan()方法 
 ```java 
  //调用类路径Bean定义扫描器入口方法
	public int scan(String... basePackages) {
		//获取容器中已经注册的Bean个数
		int beanCountAtScanStart = this.registry.getBeanDefinitionCount();

		//启动扫描器扫描给定包
		doScan(basePackages);

		// Register annotation config processors, if necessary.
		//注册注解配置(Annotation config)处理器
		if (this.includeAnnotationConfig) {
			AnnotationConfigUtils.registerAnnotationConfigProcessors(this.registry);
		}

		//返回注册的Bean个数
		return (this.registry.getBeanDefinitionCount() - beanCountAtScanStart);
	}

  ```  
可以看到主要是doScan(basePackages)方法实现了扫描的逻辑，我们继续跟踪进去看下 
 ```java 
  //类路径Bean定义扫描器扫描给定包及其子包
	protected Set<BeanDefinitionHolder> doScan(String... basePackages) {
		Assert.notEmpty(basePackages, "At least one base package must be specified");
		//创建一个集合，存放扫描到Bean定义的封装类
		Set<BeanDefinitionHolder> beanDefinitions = new LinkedHashSet<>();
		//遍历扫描所有给定的包
		for (String basePackage : basePackages) {
			//调用父类ClassPathScanningCandidateComponentProvider的方法
			//扫描给定类路径，获取符合条件的Bean定义
			Set<BeanDefinition> candidates = findCandidateComponents(basePackage);
			//遍历扫描到的Bean
			for (BeanDefinition candidate : candidates) {
				//获取@Scope注解的值，即获取Bean的作用域
				ScopeMetadata scopeMetadata = this.scopeMetadataResolver.resolveScopeMetadata(candidate);
				//为Bean设置作用域
				candidate.setScope(scopeMetadata.getScopeName());
				//为Bean生成名称
				String beanName = this.beanNameGenerator.generateBeanName(candidate, this.registry);
				//如果扫描到的Bean不是Spring的注解Bean，则为Bean设置默认值，
				//设置Bean的自动依赖注入装配属性等
				if (candidate instanceof AbstractBeanDefinition) {
					postProcessBeanDefinition((AbstractBeanDefinition) candidate, beanName);
				}
				//如果扫描到的Bean是Spring的注解Bean，则处理其通用的Spring注解
				if (candidate instanceof AnnotatedBeanDefinition) {
					//处理注解Bean中通用的注解，在分析注解Bean定义类读取器时已经分析过
					AnnotationConfigUtils.processCommonDefinitionAnnotations((AnnotatedBeanDefinition) candidate);
				}
				//根据Bean名称检查指定的Bean是否需要在容器中注册，或者在容器中冲突
				if (checkCandidate(beanName, candidate)) {
					BeanDefinitionHolder definitionHolder = new BeanDefinitionHolder(candidate, beanName);
					//根据注解中配置的作用域，为Bean应用相应的代理模式
					definitionHolder =
							AnnotationConfigUtils.applyScopedProxyMode(scopeMetadata, definitionHolder, this.registry);
					beanDefinitions.add(definitionHolder);
					//向容器注册扫描到的Bean
					registerBeanDefinition(definitionHolder, this.registry);
				}
			}
		}
		return beanDefinitions;
	}

  ```  
这一大段代码基本上就是spring扫描识别注解，并注册Bean到IOC容器中的代码。 在第10行有一个findCandidateComponents(basePackage)方法，这个方法里就是具体的扫描逻辑��� 继续跟踪： ClassPathScanningCandidateComponentProvider类 
 ```java 
  //扫描给定类路径的包
	public Set<BeanDefinition> findCandidateComponents(String basePackage) {
		//spring5.0开始 索引 开启的话生成文件META-INF/spring.components 后面加载直接从本地文件读取（一般不建议开启 spring.index.ignore=true）
		if (this.componentsIndex != null && indexSupportsIncludeFilters()) {
			return addCandidateComponentsFromIndex(this.componentsIndex, basePackage);
		}
		else {
			return scanCandidateComponents(basePackage);
		}
	}

  ```  
这里有一个if判断，我们默认走的是else里的分支，即scanCandidateComponents(basePackage)方法。 
 ```java 
  private Set<BeanDefinition> scanCandidateComponents(String basePackage) {
		Set<BeanDefinition> candidates = new LinkedHashSet<>();
		try {
			//补全扫描路径，扫描所有.class文件 classpath*:com/mydemo/**/*.class
			String packageSearchPath = ResourcePatternResolver.CLASSPATH_ALL_URL_PREFIX +
					resolveBasePackage(basePackage) + '/' + this.resourcePattern;
			//定位资源
			Resource[] resources = getResourcePatternResolver().getResources(packageSearchPath);
			boolean traceEnabled = logger.isTraceEnabled();
			boolean debugEnabled = logger.isDebugEnabled();
			for (Resource resource : resources) {
				if (traceEnabled) {
					logger.trace("Scanning " + resource);
				}
				if (resource.isReadable()) {
					try {
						//通过ASM获取class元数据，并封装在MetadataReader元数据读取器中
						MetadataReader metadataReader = getMetadataReaderFactory().getMetadataReader(resource);
						//判断该类是否符合@CompoentScan的过滤规则
						//过滤匹配排除excludeFilters排除过滤器(可以没有),包含includeFilter中的包含过滤器（至少包含一个）。
						if (isCandidateComponent(metadataReader)) {
							//把元数据转化为 BeanDefinition
							ScannedGenericBeanDefinition sbd = new ScannedGenericBeanDefinition(metadataReader);
							sbd.setResource(resource);
							sbd.setSource(resource);
							//判断是否是合格的bean定义
							if (isCandidateComponent(sbd)) {
								if (debugEnabled) {
									logger.debug("Identified candidate component class: " + resource);
								}
								//加入到集合中
								candidates.add(sbd);
							}
							else {
								//不合格 不是顶级类、具体类
								if (debugEnabled) {
									logger.debug("Ignored because not a concrete top-level class: " + resource);
								}
							}
						}
						else {
							//不符@CompoentScan过滤规则
							if (traceEnabled) {
								logger.trace("Ignored because not matching any filter: " + resource);
							}
						}
					}
					catch (Throwable ex) {
						throw new BeanDefinitionStoreException(
								"Failed to read candidate component class: " + resource, ex);
					}
				}
				else {
					if (traceEnabled) {
						logger.trace("Ignored because not readable: " + resource);
					}
				}
			}
		}
		catch (IOException ex) {
			throw new BeanDefinitionStoreException("I/O failure during classpath scanning", ex);
		}
		return candidates;
	}

  ```  
这里就是主要的扫描逻辑，代码中的注释已经说的很清楚了。 主要过程： 
 
  根据包路径，扫描所有.class文件  
  根据包路径，生成.class对应的Resource对象  
  通过ASM获取class元数据，并封装在MetadataReader元数据读取器中  
  判断该类是否符合过滤规则  
  判断该类是否为独立的类、具体的类  
  加入到集合中  
 
我们来详细看下过滤的方法 isCandidateComponent(metadataReader) 
 ```java 
  //判断元信息读取器读取的类是否符合容器定义的注解过滤规则
	//@CompoentScan的过滤规则支持5种 （注解、类、正则、aop、自定义）
	protected boolean isCandidateComponent(MetadataReader metadataReader) throws IOException {
		//如果读取的类的注解在排除注解过滤规则中，返回false
		for (TypeFilter tf : this.excludeFilters) {
			if (tf.match(metadataReader, getMetadataReaderFactory())) {
				return false;
			}
		}
		//如果读取的类的注解在包含的注解的过滤规则中，则返回ture
		for (TypeFilter tf : this.includeFilters) {
			//判断当前类的注解是否match规则
			if (tf.match(metadataReader, getMetadataReaderFactory())) {
				//是否有@Conditional注解，进行相关处理
				return isConditionMatch(metadataReader);
			}
		}
		//如果读取的类的注解既不在排除规则，也不在包含规则中，则返回false
		return false;
	}

  ```  
接着跟踪 tf.match()方法 AbstractTypeHierarchyTraversingFilter类 
 ```java 
  public boolean match(MetadataReader metadataReader, MetadataReaderFactory metadataReaderFactory)
			throws IOException {

		// This method optimizes avoiding unnecessary creation of ClassReaders
		// as well as visiting over those readers.
		//检查当前类的注解是否符合规律规则
		if (matchSelf(metadataReader)) {
			return true;
		}
		//check 类名是否符合规则
		ClassMetadata metadata = metadataReader.getClassMetadata();
		if (matchClassName(metadata.getClassName())) {
			return true;
		}

		//如果有继承父类
		if (this.considerInherited) {
			String superClassName = metadata.getSuperClassName();
			if (superClassName != null) {
				// Optimization to avoid creating ClassReader for super class.
				Boolean superClassMatch = matchSuperClass(superClassName);
				if (superClassMatch != null) {
					if (superClassMatch.booleanValue()) {
						return true;
					}
				}
				else {
					// Need to read super class to determine a match...
					try {
						if (match(metadata.getSuperClassName(), metadataReaderFactory)) {
							return true;
						}
					}
					catch (IOException ex) {
						logger.debug("Could not read super class [" + metadata.getSuperClassName() +
								"] of type-filtered class [" + metadata.getClassName() + "]");
					}
 				}
			}
		}

		//如果有实现接口
		if (this.considerInterfaces) {
			for (String ifc : metadata.getInterfaceNames()) {
				// Optimization to avoid creating ClassReader for super class
				Boolean interfaceMatch = matchInterface(ifc);
				if (interfaceMatch != null) {
					if (interfaceMatch.booleanValue()) {
						return true;
					}
				}
				else {
					// Need to read interface to determine a match...
					try {
						if (match(ifc, metadataReaderFactory)) {
							return true;
						}
					}
					catch (IOException ex) {
						logger.debug("Could not read interface [" + ifc + "] for type-filtered class [" +
								metadata.getClassName() + "]");
					}
				}
			}
		}

		return false;
	}

  ```  
这里面最主要的是 matchSelf(metadataReader) 方法 AnnotationTypeFilter类 
 ```java 
  protected boolean matchSelf(MetadataReader metadataReader) {
		//获取注解元数据
		AnnotationMetadata metadata = metadataReader.getAnnotationMetadata();
		//check 注解及其派生注解中是否包含@Component
		//获取当前类的注解 metadata.hasAnnotation    @Controller
		//获取当前类的注解及其派生注解 metadata.hasAnnotation   @Controller包含的@Component\@Documented等等
		return metadata.hasAnnotation(this.annotationType.getName()) ||
				(this.considerMetaAnnotations && metadata.hasMetaAnnotation(this.annotationType.getName()));
	}

  ```  
在这段代码代码中，可以解决我们之前的疑惑“Spring是怎么发现@Configuration、@Controller、@Service这些注解修饰的类的？” 原来@Configuration、@Controller、@Service这些注解其实都是@Component的派生注解，我们看这些注解的代码会发现，都有@Component注解修饰。而spring通过metadata.hasMetaAnnotation()方法获取到这些注解包含@Component，所以都可以扫描到。如下： 
![Test](https://user-gold-cdn.xitu.io/2019/8/19/16ca8fc02842c9e1?w=592&h=302&f=png&s=153842  'Spring IoC 源码分析 (基于注解) 之 包扫描') 
然后我们再看回 scanCandidateComponents(basePackage)方法，接下来有一个 isCandidateComponent(sbd)方法，如下： 
 ```java 
  //是否是独立的类、具体的类
	protected boolean isCandidateComponent(AnnotatedBeanDefinition beanDefinition) {
		AnnotationMetadata metadata = beanDefinition.getMetadata();
		return (metadata.isIndependent() && (metadata.isConcrete() ||
				(metadata.isAbstract() && metadata.hasAnnotatedMethods(Lookup.class.getName()))));
	}

  ```  
这个方法的作用是，判断该类是否为 
 
  顶层的类（没有父类或静态内部类）  
  具体的类（不是抽象类或接口）  
 
至此，ClassPathBeanDefinitionScanner类中的doScan(basePackages)方法中的findCandidateComponents(basePackage)方法已经结束了，即我们的包扫描也结束了，已经把扫描到的类存入到了集合中，结下来就是解析注册Bean的过程了。 
总结 通过这篇文章，我们可以回答之前的一些问题了： 
 
  Spring是怎么发现@Bean、@Controller、@Service这些注解修饰的类的？ 通过 matchSelf(metadataReader)方法，判断这些注解中是否包含@Component  
  @CompoentScan注解是怎么起作用的？ 通过 isCandidateComponent(metadataReader)方法过滤  

                                        