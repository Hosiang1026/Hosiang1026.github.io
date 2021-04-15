---
title: 推荐系列-突破CRUD - 万能树工具类封装
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 2096
cover_picture: 'https://static.oschina.net/uploads/img/202003/05110050_hPhj.jpeg'
abbrlink: 3cbf5b29
date: 2021-04-15 09:19:21
---

&emsp;&emsp;0、学完本文你或许可以收获 感受一个树工具从初始逐步优化完善的过程 树工具封装的设计思考与实现思路 最后收获一款拿来即用的树工具源代码 对于前端树组件有一定了解和使用过的同学可直接跳...
<!-- more -->

                                                                                                                                                                                         
##### 0、学完本文你或许可以收获 
 
  感受一个树工具从初始逐步优化完善的过程  
  树工具封装的设计思考与实现思路  
  最后收获一款拿来即用的树工具源代码  
 
对于前端树组件有一定了解和使用过的同学可直接跳跃到第3章节开始。 
 
##### 1、树长什么样 ？ 
前端的树组件大多数情况下出现在后端的管理系统中，比如我们常见的菜单树、机构树、某某分类树、树表格等。大致像下方图片所展示的这样。 
菜单树 
![Test](https://oscimg.oschina.net/oscnet/006dLZAxly1gbyft1qkh7j30aa09ugpd.jpg  '突破CRUD - 万能树工具类封装') 
机构树 
![Test](https://oscimg.oschina.net/oscnet/006dLZAxly1gbyft1qkh7j30aa09ugpd.jpg  '突破CRUD - 万能树工具类封装')org_tree.png 
树表格 
![Test](https://oscimg.oschina.net/oscnet/006dLZAxly1gbyft1qkh7j30aa09ugpd.jpg  '突破CRUD - 万能树工具类封装') 
大致上来说，前端树的展现形式就是上面3张图所列的几种形式。而这种前端树组件的展现构成需要依赖于后端返回的数据格式。 
 
##### 2、数据格式 
结合我自身使用过的前端树组件来说，大致可以分为如下两种。 
列表形式 
 ```java 
  [
    { id:1, pId:0, name:"父节点1"}

    { id:11, pId:1, name:"父节点11"},
    { id:111, pId:11, name:"叶子节点111"},
    { id:112, pId:11, name:"叶子节点112"},
    { id:113, pId:11, name:"叶子节点113"},
    { id:114, pId:11, name:"叶子节点114"},

    { id:12, pId:1, name:"父节点12"},
    { id:121, pId:12, name:"叶子节点121"},
    { id:122, pId:12, name:"叶子节点122"},
    { id:123, pId:12, name:"叶子节点123"},
    { id:124, pId:12, name:"叶子节点124"}
]

  ```  
树形结构 
 ```java 
  [{    name:"父节点1",
    children: [
        { 
            name:"父节点11",
            children: [
                { name:"叶子节点111"},
                { name:"叶子节点112"},
                { name:"叶子节点113"},
                { name:"叶子节点114"}
            ]
        },
        { 
            name:"父节点12",
            children: [
                { name:"叶子节点121"},
                { name:"叶子节点122"},
                { name:"叶子节点123"},
                { name:"叶子节点124"}
            ]
        }
    ]
}]

  ```  
本文所讲的树工具封装主要是针对第二种数据格式树形结构来说，因为第一种本身不需要特殊处理，也就不存在什么封装，就是简单的列表查询展示，与一般数据列表数据格式的区别是多了数据ID与父ID属性提供给前端进行树组件的构造。 
而第二种是要在列表形式的数据格式上进行转换，形成如上所示的树形结构。但是，我们发现里面没有数据ID与父ID属性，why ？ 因为后端完成了数据层面树结构的构造工作，前端树组件再无需根据这两个属性进行树结构的判断构建，直接展示就OK，当然也不绝对，最终还得看前端的树组件是否需要。 
但一般都会保留这两个属性，因为除过树组件自身的构造需求，业务处理上往往需要这两个属性，而后端树工具要构造树结构，那一定是需要数据ID与父ID的。 
如果感觉上面说的麻烦你就记住一点，不管是列表结构还是树形结构，始终保留数据ID与父ID两个属性就对了。 
到这里又有一个新问题了，上面说了列表形式无需封装什么可以直接使用，既然如此那用列表形式的结构就完了呗，为什么写个工具类搞个树结构出来呢 ？ 
原因是，前端树组件的实现方式非常多，不同树插件或组件需要的数据格式可能不一样，有的列表、树形格式都支持，有的仅支持列表或树形的一种，所以为了满足不同前端树的展示需求，提供树形结构的构造工具是必要的。 
 
##### 3、话不多说，先实现个初版 
从上面的内容我们了解了前端树组件的渲染展现需要后端提供满足需求的数据格式，那么实际上也就决定了树工具类的核心职责就是将一般的数据列表结构转换为树形结构，从而提供给前端使用。 
解读上面所述的核心职责，首先一般列表是什么列表，此处我们假设为菜单列表，这就有了第一个类MenuEntity，紧接着是转换，谁转换成谁 ？数据列表转换树结构，树结构本身那应该就是个类，我们暂且叫它 TreeNode，结合我们第一步假设的菜单列表，那实际上就是 List< MenuEntity > 转换为 List < TreeNode > ，如此就得到了第二个类TreeNode，最后还剩转换这个动作谁去做 ? 那就是我们今天的主角 TreeUtil 了。 
好，至此，通过分析树工具类的核心职责，我们分析得到了三个类。 
 
  MenuEntity  
  TreeNode  
  TreeUtil  
 
OK，有了上面的内容那就来个简单的实现。 
树节点类 
 ```java 
  public class TreeNode {
    // 树节点ID
    private String id;
    // 树节点名称
    private String name;
    // 树节点编码
    private String code;
    // 树节点链接
    private String linkUrl;
    // 树节点图标
    private String icon;
    // 父节点ID
    private String parentId;
}

  ```  
菜单类 
 ```java 
  public class MenuEntity {
    // 菜单ID
    private String id;
    // 上级菜单ID
    private String pid;
    // 菜单名称
    private String name;
    // 菜单编码
    private String code;
    // 菜单图标
    private String icon;
    // 菜单链接
    private String url;
}

  ```  
树工具类 
 ```java 
  public class TreeUtil {

    /**
     * 树���建
     */
    public static List<TreeNode> build(List<TreeNode> treeNodes,Object parentId){
        List<TreeNode> finalTreeNodes = CollectionUtil.newArrayList();
        for(TreeNode treeNode : treeNodes){
            if(parentId.equals(treeNode.getParentId())){
                finalTreeNodes.add(treeNode);
                innerBuild(treeNodes,treeNode);
            }
        }
        return finalTreeNodes;
    }

    private static void innerBuild(List<TreeNode> treeNodes,TreeNode parentNode){
        for(TreeNode childNode : treeNodes){
            if(parentNode.getId().equals(childNode.getParentId())){
                List<TreeNode> children = parentNode.getChildren();
                if(children == null){
                    children = CollectionUtil.newArrayList();
                    parentNode.setChildren(children);
                }
                children.add(childNode);
                childNode.setParentId(parentNode.getId());
                innerBuild(treeNodes,childNode);
            }
        }
    }
}

  ```  
树工具类实现的两个关键点，第一，树构建的开始位置也就是从哪里开始构建，所以需要一个父ID参数来指定构建的起始位置，第二，构建到什么时候结束，不做限制的的话，我们的树是可以无限延伸的，所以此处innerBuild方法进行递归操作。 
测试代码 
 ```java 
  public static void main(String[] args) {
    // 1、模拟菜单数据
    List<MenuEntity> menuEntityList = CollectionUtil.newArrayList();
    menuEntityList.add(new MenuEntity("1","0","系统管理","sys","/sys"));
    menuEntityList.add(new MenuEntity("11","1","用户管理","user","/sys/user"));
    menuEntityList.add(new MenuEntity("111","11","用户添加","userAdd","/sys/user/add"));
    menuEntityList.add(new MenuEntity("2","0","店铺管理","store","/store"));
    menuEntityList.add(new MenuEntity("21","2","商品管理","shop","/shop"));

    // 2、MenuEntity -> TreeNode
    List<TreeNode> treeNodes = CollectionUtil.newArrayList();
    for(MenuEntity menuEntity : menuEntityList){
        TreeNode treeNode = new TreeNode();
        treeNode.setId(menuEntity.getId());
        treeNode.setParentId(menuEntity.getPid());
        treeNode.setCode(menuEntity.getCode());
        treeNode.setName(menuEntity.getName());
        treeNode.setLinkUrl(menuEntity.getUrl());
        treeNodes.add(treeNode);
    }

    // 3、树结构构建
    List<TreeNode> treeStructureNodes = TreeUtil.build(treeNodes,"0");
    Console.log(JSONUtil.formatJsonStr(JSONUtil.toJsonStr(treeStructureNodes)));
}

  ```  
收工，第一版简单的树工具就实现了。 
 
##### 4、迭代优化 
 
###### 1.0 这不是我的事 
但是，通过测试代码我们发现这个用起来不是太爽，要将菜单数据转换为树结构竟然需要我先把菜单列表转换成树结构的列表才能调用树工具类的build方法，这里的转换操作仅仅是属性的拷贝，并未完成树状结构的生成构建，但这是调用者需要关心的吗 ？很显然TreeNode集合创建生成这个过程应该是树工具类应该做的事情。所以做了如下调整。 
1 调整了build方法参数，将原有treeNodes 调整为 menuEntityList，意味着将上面说的treeNodes构建构成交给TreeUtil去做。 
2 新增了Convert类，并包含convert方法，该方法的职责是完成菜单实体到树节点属性的拷贝。 
3 再次调整build方法参数，新增Convert转换。 
调整完成的结果，看下代码。 
树工具 
 ```java 
  public class TreeUtil_1_0 {

    // 新增的属性转换方法
    public interface Convert<MenuEntity,TreeNode>{
        public void convert(MenuEntity menuEntity, TreeNode treeNode);
    }

    /**
     * 树构建
     */
    public static List<TreeNode> build(List<MenuEntity> menuEntityList,Object parentId,Convert<MenuEntity,TreeNode> convert){

        // 原来调用方做的事情
        List<TreeNode> treeNodes = CollectionUtil.newArrayList();
        for(MenuEntity menuEntity: menuEntityList){
            TreeNode treeNode = new TreeNode();
            convert.convert(menuEntity,treeNode);
            treeNodes.add(treeNode);
        }

        List<TreeNode> finalTreeNodes = CollectionUtil.newArrayList();
        for(TreeNode treeNode : treeNodes){
            if(parentId.equals(treeNode.getParentId())){
                finalTreeNodes.add(treeNode);
                innerBuild(treeNodes,treeNode);
            }
        }
        return finalTreeNodes;
    }

    private static void innerBuild(List<TreeNode> treeNodes,TreeNode parentNode){
        for(TreeNode childNode : treeNodes){
            if(parentNode.getId().equals(childNode.getParentId())){
                List<TreeNode> children = parentNode.getChildren();
                if(children == null){
                    children = CollectionUtil.newArrayList();
                    parentNode.setChildren(children);
                }
                children.add(childNode);
                childNode.setParentId(parentNode.getId());
                innerBuild(treeNodes,childNode);
            }
        }
    }
}

  ```  
测试代码 
 ```java 
  public static void main(String[] args) {
    // 1、模拟菜单数据
    List<MenuEntity> menuEntityList = CollectionUtil.newArrayList();
    menuEntityList.add(new MenuEntity("1","0","系统管理","sys","/sys"));
    menuEntityList.add(new MenuEntity("11","1","用户管理","user","/sys/user"));
    menuEntityList.add(new MenuEntity("111","11","用户添加","userAdd","/sys/user/add"));
    menuEntityList.add(new MenuEntity("2","0","店铺管理","store","/store"));
    menuEntityList.add(new MenuEntity("21","2","商品管理","shop","/shop"));

    // 2、树结构构建
    List<TreeNode> treeStructureNodes = TreeUtil_1_0.build(menuEntityList, "0", new Convert<MenuEntity, TreeNode>() {
        @Override
        public void convert(MenuEntity menuEntity, TreeNode treeNode) {
            treeNode.setId(menuEntity.getId());
            treeNode.setParentId(menuEntity.getPid());
            treeNode.setCode(menuEntity.getCode());
            treeNode.setName(menuEntity.getName());
            treeNode.setLinkUrl(menuEntity.getUrl());
        }
    });
    Console.log(JSONUtil.formatJsonStr(JSONUtil.toJsonStr(treeStructureNodes)));
}

  ```  
比较1.0与初版的测试代码，发现少了树节点列表构建的过程，属性拷贝的工作作为回调过程在转换过程中进行处理。 
 
###### 2.0 仅支持造菜单树哪够 
1.0优化完后，我们来了新的需求，有个机构树也需要生成，此时的树工具仅支持了菜单树，所以我们进行改造，让其支持其他任何对象的树生成。 
改造点主要是将的TreeUtil中的菜单实体转换为泛型，限于篇幅，就贴个核心方法的代码 
 ```java 
  public static <T> List<TreeNode> build(List<T> list,Object parentId,Convert<T,TreeNode> convert){
    List<TreeNode> treeNodes = CollectionUtil.newArrayList();
    for(T obj : list){
        TreeNode treeNode = new TreeNode();
        convert.convert(obj,treeNode);
        treeNodes.add(treeNode);
    }

    List<TreeNode> finalTreeNodes = CollectionUtil.newArrayList();
    for(TreeNode treeNode : treeNodes){
        if(parentId.equals(treeNode.getParentId())){
            finalTreeNodes.add(treeNode);
            innerBuild(treeNodes,treeNode);
        }
    }
    return finalTreeNodes;
}

  ```  
如此一来，我们就可以支持任意类型的树构造。 
 
###### 3.0 哥们，你返回的属性不够用啊 
前两点比较容易想到，也比较容易实现，但这时候前端同学抛来了新的问题，哥们，你返回的树节点属性不够用啊，你看我这界面。需要备注你没返回来啊。 
![Test](https://oscimg.oschina.net/oscnet/006dLZAxly1gbyft1qkh7j30aa09ugpd.jpg  '突破CRUD - 万能树工具类封装') 
好吧，这种情况确实没考虑到。 
要满足上述需求，简单做法就将remark属性直接添加到 TreeNode 类中，Convert中赋下值，这不就满足了，但想想又不对，今天这个前端伙计缺个remark，明天可能别的伙计又缺个其他属性，全加到TreeNode中，TreeNode到底是树节点还是业务实体，所以不能这么搞。 
这里要处理成可扩展，同时满足开闭原则，所以此处比较妥的处理方式是继承，TreeNode属性满足不了的情况下，通过继承扩展具体业务的树节点来实现。 
具体改造点如�� 
1 新增菜单实体扩展树节点如下 
 ```java 
  public class MenuEntityTreeNode extends TreeNode {
    // 扩展备注属性
    private String remark;
    // 省略set get ...

}

  ```  
2 改造TreeUtil.build方法参数，新增TreeNode Class类型参数，如下 
 ```java 
  /**
 * 树构建
 */
public static <T,E extends TreeNode> List<E> build(List<T> list,Object parentId,Class<E> treeNodeClass,Convert<T,E> convert){
    List<E> treeNodes = CollectionUtil.newArrayList();
    for(T obj : list){
        E treeNode = (E)ReflectUtil.newInstance(treeNodeClass);
        convert.convert(obj, treeNode);
        treeNodes.add(treeNode);
    }

    List<E> finalTreeNodes = CollectionUtil.newArrayList();
    for(E treeNode : treeNodes){
        if(parentId.equals(treeNode.getParentId())){
            finalTreeNodes.add((E)treeNode);
            innerBuild(treeNodes,treeNode);
        }
    }
    return finalTreeNodes;
}

  ```  
测试代码 
 ```java 
  public static void main(String[] args) {
    // ...此处省略模拟数据创建过程

    // 2、树结构构建
    List<MenuEntityTreeNode> treeStructureNodes = TreeUtil_3_0.build(menuEntityList, "0",MenuEntityTreeNode.class,new TreeUtil_3_0.Convert<MenuEntity,MenuEntityTreeNode>(){

        @Override
        public void convert(MenuEntity object, MenuEntityTreeNode treeNode) {
            treeNode.setId(object.getId());
            treeNode.setParentId(object.getPid());
            treeNode.setCode(object.getCode());
            treeNode.setName(object.getName());
            treeNode.setLinkUrl(object.getUrl());
            // 新增的业务属性
            treeNode.setRemark("添加备注属性");
        }
    });
   Console.log(JSONUtil.formatJsonStr(JSONUtil.toJsonStr(treeStructureNodes)));
}

  ```  
如此一来，不同业务场景下需要添加不同的属性时，即可做到可扩展，且对现有代码不造成任何影响和改动。 
 
###### 4.0 哥们，我的属性名不叫code 
完成了3.0版本，基本上大部分需求就都可以满足了，但是这时候前端同学又抛来了新的问题，哥们，你返回的树节点编号属性是code，但我这边的叫number，对应不上，我这边调整的话影响比较大，你看后端返回的时候能不能处理下。 
code属性名肯定是不能调整的，因为其他模块树的节点编号都叫code。 
那怎么办 ？其实也简单，���3.0��本一样，在扩展的业务树节点去加个属性，这样问题是解决了，但万一出现所有treeNode的属性名都跟前端需要的不对应这种极端情况，那意味着所有树属性都需要自行扩展定义，这种岂不是返回了没什么用的父TreeNode心中的所有属性。序列化时倒是可以控制，为空的不进行序列化，但不是依赖序列化框架了么。还有没有其他办法。 
稍微整理下需求，就是树节点属性在返回前端时要能够支持自定义属性名。 
类属性定义好就改不了了，怎么自定义，除了新增类和改现有的属性，还有什么办法呢 ？这时候我们应该想到map 
具体怎么做 
1 首先，定义新的类TreeNodeMap，看名字就知道基于map实现 
 ```java 
  public class TreeNodeMap extends HashMap {

    private TreeNodeConfig treeNodeConfig;

    public TreeNodeMap(){
        this.treeNodeConfig = TreeNodeConfig.getDefaultConfig();
    }

    public TreeNodeMap(TreeNodeConfig treeNodeConfig){
        this.treeNodeConfig = treeNodeConfig;
    }

    public <T> T getId() {
        return (T)super.get(treeNodeConfig.getIdKey());
    }

    public void setId(String id) {
        super.put(treeNodeConfig.getIdKey(), id);
    }

    public <T> T getParentId() {
        return (T)super.get(treeNodeConfig.getParentIdKey());
    }

    public void setParentId(String parentId) {
        super.put(treeNodeConfig.getParentIdKey(), parentId);
    }

    public <T> T getName() {
        return (T)super.get(treeNodeConfig.getNameKey());
    }

    public void setName(String name) {
        super.put(treeNodeConfig.getNameKey(), name);
    }

    public <T> T  getCode() {
        return (T)super.get(treeNodeConfig.getCodeKey());
    }

    public TreeNodeMap setCode(String code) {
        super.put(treeNodeConfig.getCodeKey(), code);
        return this;
    }

    public List<TreeNodeMap> getChildren() {
        return (List<TreeNodeMap>)super.get(treeNodeConfig.getChildrenKey());
    }

    public void setChildren(List<TreeNodeMap> children) {
        super.put(treeNodeConfig.getChildrenKey(),children);
    }

    public void extra(String key,Object value){
        super.put(key,value);
    }
}

  ```  
2 既然支持属性名自定义，新增配置类TreeNodeConfig来完成这个事情，同时提供默认属性名 
 ```java 
  public class TreeNodeConfig {

    // 默认属性的单例对象
    private static TreeNodeConfig defaultConfig = new TreeNodeConfig();

    // 树节点默认属性常量
    static final String TREE_ID = "id";
    static final String TREE_NAME = "name";
    static final String TREE_CODE = "code";
    static final String TREE_CHILDREN = "children";
    static final String TREE_PARENT_ID = "parentId";

    // 属性
    private String idKey;
    private String codeKey;
    private String nameKey;
    private String childrenKey;
    private String parentIdKey;

    public String getIdKey() {
        return getOrDefault(idKey,TREE_ID);
    }

    public void setIdKey(String idKey) {
        this.idKey = idKey;
    }

    public String getCodeKey() {
        return getOrDefault(codeKey,TREE_CODE);
    }

    public void setCodeKey(String codeKey) {
        this.codeKey = codeKey;
    }

    public String getNameKey() {
        return getOrDefault(nameKey,TREE_NAME);
    }

    public void setNameKey(String nameKey) {
        this.nameKey = nameKey;
    }

    public String getChildrenKey() {
        return getOrDefault(childrenKey,TREE_CHILDREN);
    }

    public void setChildrenKey(String childrenKey) {
        this.childrenKey = childrenKey;
    }

    public String getParentIdKey() {
        return getOrDefault(parentIdKey,TREE_PARENT_ID);
    }

    public void setParentIdKey(String parentIdKey) {
        this.parentIdKey = parentIdKey;
    }

    public String getOrDefault(String key,String defaultKey){
        if(key == null) {
            return defaultKey;
        }
        return key;
    }

    public static TreeNodeConfig getDefaultConfig(){
        return defaultConfig;
    }

}

  ```  
3 最后，改造TreeUtil.build 方法，基于2.0版本，只需将TreeNode替换成TreeNodeMap即可。 
 ```java 
  /**
 * 树构建
 */
public static <T> List<TreeNodeMap> build(List<T> list,Object parentId,Convert<T,TreeNodeMap> convert){
    List<TreeNodeMap> treeNodes = CollectionUtil.newArrayList();
    for(T obj : list){
        TreeNodeMap treeNode = new TreeNodeMap();
        convert.convert(obj,treeNode);
        treeNodes.add(treeNode);
    }

    List<TreeNodeMap> finalTreeNodes = CollectionUtil.newArrayList();
    for(TreeNodeMap treeNode : treeNodes){
        if(parentId.equals(treeNode.getParentId())){
            finalTreeNodes.add(treeNode);
            innerBuild(treeNodes,treeNode);
        }
    }
    return finalTreeNodes;
}

  ```  
测试代码 
 ```java 
  public static void main(String[] args) {
     // ... 省略菜单模拟数据的创建过程

    TreeNodeConfig treeNodeConfig = new TreeNodeConfig();
    // 自定义属性名
    treeNodeConfig.setCodeKey("number");
    List<TreeNodeMap> treeNodes = TreeUtil_4_0.build(menuEntityList, "0",treeNodeConfig,new TreeUtil_4_0.Convert<MenuEntity, TreeNodeMap>() {
        @Override
        public void convert(MenuEntity object, TreeNodeMap treeNode) {
            treeNode.setId(object.getId());
            treeNode.setParentId(object.getPid());
            treeNode.setCode(object.getCode());
            treeNode.setName(object.getName());
            // 属性扩���
            treeNode.extra("extra1","123");
        }
    });

    Console.log(JSONUtil.formatJsonStr(JSONUtil.toJsonStr(treeNodes)));
}

  ```  
经过上面的改造，我们实现了树节点属性的自定义，顺便还实现了属性可扩展，一举两得。 
 
##### 3、总结 
目前这个程度可能仍有些场景无法满足，但是对于大部分的问题场景基于3.0或4.0版本稍加改造应该都可以解决。剩下的就结合场景再酌情优化调整。 
 
##### 4、源代码&视频 
源代码： springboot-tree 
视    频： 实现讲解 
 
##### 5、更多精彩 
觉得还行，动动手指留个赞。 
以上就是今天的内容，我们下期见。 
更多优质内容，首发公众号【风象南】，欢迎关注。 
![Test](https://oscimg.oschina.net/oscnet/006dLZAxly1gbyft1qkh7j30aa09ugpd.jpg  '突破CRUD - 万能树工具类封装')
                                        