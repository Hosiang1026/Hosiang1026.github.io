---
title: 推荐系列-MASA Blazor入门这一篇就够了
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 273
cover_picture: 'https://s2.loli.net/2022/03/14/P8rAWbGxZTSvmzJ.png'
abbrlink: ba6658f3
date: 2022-03-27 11:56:25
---

&emsp;&emsp;什么是Blazor? 有什么优势？ ASP.NET Core Blazor 简介 Blazor 是一个使用 Blazor 生成交互式客户端 Web UI 的框架： 使用 C# 代替 JavaScript 来创建信息丰富的交互式 UI。 共享使用 .NET...
<!-- more -->

                                                                                                                    
            程序员健身是为了保养还是保命？参与话题讨论赢好礼 >>>
            
                                                                                                    #### 1.什么是Blazor? 有什么优势？ 
ASP.NET Core Blazor 简介 
Blazor 是一个使用 Blazor 生成交互式客户端 Web UI 的框架： 
 
 使用 C# 代替 JavaScript 来创建信息丰富的交互式 UI。 
 共享使用 .NET 编写的服务器端和客户端应用逻辑。 
 将 UI 呈现为 HTML 和 CSS，以支持众多浏览器，其中包括移动浏览器。 
 与新式托管平台（如 Docker）集成。 
 
Blazor 优势： 
 
 ```java 
    1. 使用 C# 代替 JavaScript 来编写代码。
  2. 利用现有的 .NET 库生态系统。
  3. 在服务器和客户端之间共享应用逻辑。
  4. 受益于 .NET 的性能、可靠性和安全性。
  5. 在 Windows、Linux 和 macOS 上使用 Visual Studio 保持高效工作。
  6. 以一组稳定、功能丰富且易用的通用语言、框架和工具为基础来进行生成。

  ``` 
  
#### 2.为什么选择MASA Blazor？能用来干什么？ 
MASA Blazor是一个基于 Blazor Component 和 Material Design 的 UI 组件库。 dotNET开发者不需要懂得javascript就能开发一个企业级中后台系统。 MASA Blazor优势： 
 
 丰富组件：包含Vuetify 1:1还原的基础组件，以及很多实用的预置组件和.Net深度集成功能，包括Url、面包 屑、导航三联动，高级搜索，i18n等。 
 UI设计语言：设计风格现代，UI 多端体验设计优秀。 
 简易上手：丰富详细的上手文档，免费的视频教程（制作中）。 
 社区活跃鼓励：用户参与实时互动，做出贡献加入我们，构建最开放的开源社区。 
 长期支持：全职团队维护，并提供企业级支持。 
 专业示例：MASA Blazor Pro提供多种常见场景的预设布局。 
 
MASA Blazor Pro预设布局示例：   
看到这里是不是有同学对此感兴趣起来了呢！那么这样的布局页面是怎么构建出来的呢？我们自己能不能也搭建一个这样的布局呢！嘿嘿！不要着急、我们接着往下看。 
#### 3.使用MASA Blazor模板创建第一个Blazor程序 
##### 1.首先安装Masa.Template模板 
（1）检查本机.Net SDK版本，请确保已安装.NET6.0 
 
（2）安装 Masa.Template模板,包含 MASA 系列所有项目模板 dotnet new --install Masa.Template  
##### 2.创建项目 
dotnet new masab -o MasaBlazorApp 默认为Server模式 可通过参数--Mode WebAssembly 创建 WebAssembly 模式项目 
 
##### 3.配置 MASA Blazor（由于我这里使用了模板，以下配置在模板中都已经帮我们配好了，安装模板后直接dotnet run 即可；未安装模板的同学，按下面步骤配置即可） 
（1）安装NuGet包 
 
 ```java 
  dotnet add package Masa.Blazor

  ``` 
  
 
（2）引入资源文件（我这里为Blazor Server） 
在 Pages/_Layout.cshtml 中引入资源文件  
（3）注入相关服务 
在 Program.cs 中添加 Masa.Blazor 相关服务 
 
 ```java 
  builder.Services.AddMasaBlazor();

  ``` 
  
 
（4）修改 _Imports.razor 文件,添加以下内容: 
 
 ```java 
    @using Masa.Blazor

  ``` 
  
（5）运行项目  
到这里一个简单的MASA Blazor项目就搭建完成啦。当然这只是最基础的，接下来我们将一步一步使用MASA Blazor项目组件来丰富我们的项目。 
##### 3.使用MASA Blazor组件配置项目 
示例：  
###### （1）Blazor应用结构介绍 
首先我们先来看看Blazor项目结构，分析主要几个文件的作用。（概念定义比较枯燥，想直接体验的同学可以直接跳过此部分，直接上手实践即可，但不推荐这么做，有句话说得好“磨刀不误砍柴工” 
 
Program.cs 
 
在Program.cs文件中我们先主要关注几个点： 
1.在依赖注入中��因为我们利用了Razor来实现C#和html的混合编码以及我们使用的是ServerSide的Blazor，注入代码如下：  中间件如下：  
_Host.cshtml 
 
在Program.cs文件中会自动去我们配置的_Host.cshtml文件中寻找根组件 这是默认使用App组件作为根组件（这是启动Blazor应用的必要条件之一）  
那么render-mode 特性是用来干什么的呢? 让我们来看看官方文档解释： 
 
App.razor Blazor应用的根组件，里面通常包含Router组件用来处理Blazor中的路由  
那么Router组件中的这些参数比如AppAssembly、Found、NotFound都有什么作用呢？ 
通过阅读官方文档我们可以发现： 
 
也就是说我们在配置完.razor页面的路由后，Router组件会在浏览器进行导航时将路由与地址匹配，能够匹配到的，Router就会拦截导航并呈现其Found参数指定的匹配组件和布局（我们这里指定MainLayout布局页面），反之，则呈现NotFound参数。  
_Layout.cshtml 
在之前的_Host.cshtml文件中我们默认指定启用了_Layout.cshtml布局页  _Layout.cshtml是Blazor应用的主机页（相当于一个根页面布局文件），里面包含应用的初始化HTML 及其组件，它使得我们所有页面布局保持的外观变得更加的容易。 
MainLayout.razor 
在Blazor中，使用布局组件处理页面布局。布局组件继承自LayoutComponentBase,后者定义类型RenderFragment 的单个 Body 属性，该属性可用于呈现页面的内容。  
_Imports.razor 全局导入配置，在这里使用using引入后，相当于在所有razor文件中都进行了引入。  
好了，废话有点多, 到这里Blazor应用部分主要结构概念差不多已经介绍完了，感兴趣的同学可自行移步官网进行阅读 面向 Web Forms ASP.NET Web Forms 开发人员的 Blazor 接下来我们直接开始撸代码 
###### （2）使用App bars（应用栏）与Navigation drawers（导航抽屉）配置导航栏与菜单栏 
上述页面展示中我们看到了三个菜单页面，这几个页面都分别配置了对应路由 Home对应页面为Index.razor、路由为"/"   
Counter对应页面为Counter.razor、路由为"/counter"   
Fetch Data页面对应FetchData.razor页面路由，路由为"/fetchdata" 在Shared/MainLayout.razor页面中我们可以看到配置。  
接下来我们直接移步MASA Blazor 官网地址找到我们需要的组件示例：   
我们直接将示例代码拷贝至Shared/MainLayout.razor页面中的MAppBar组件中即可  
dotnet run 看下效果  
接下来我们MASA Blazor组件库中找到Navigation drawers组件，将razor页面代码与C#代码拷贝至<MNavigationDrawer>组件中即可   
我们对代码稍作修改  
dotnet run 看下效果  
下一步我们来实现动态菜单栏伸缩功能 找到Navigation drawers组件的迷你模式  
接下来我们来改造我们的代码   
dotnet run 看下效果  
是不是感觉超级简单呢！当然这只是入门写法，抛砖引玉，感兴趣的同学可以动手试试，举一反三解锁更多组件的用法与写法 
###### （3）使用DataTable、Dialog等组件实现一个基础的数据交互页 
首先我们先初始化Fetch.razor，只留一个最简单<MDataTable>组件  
DataTable组件需要至少绑定一个Headers（表头）和数据源 所以下一步我们先定义Headers与Items（实际调用API获取数据即可，这里默认死数据仅作参考） 我们先建一个Fetch.razor页的分部类，定义部分代码  
dotnet run 看看效果  
在上述代码截图中会发现我们用到了OnInitializedAsync()方法，那么这个方法是用来干什么的呢？说到这个问题，我们需要先了解了解Razor组件的生命周期ASP.NET Core Razor 组件生命周期 
先来看个 Component lifecycle diagram（组件生命周期图） 
 
SetParametersAsync - 设置参数时 
 
OnInitialized / OnInitializedAsync - 组件初始化 
 
 
OnParametersSet / OnParametersSetAsync - 参数设置后 
 
OnAfterRender / OnAfterRenderAsync - 组件渲染后 
 
了解Razor组件的生命周期后，我们来继续撸代码 
我们给数据表格增加操作列   
看下效果：  接下来我们给增加一个MDialog 对话框 用来做增加修改操作 直接将官网的示例拿过来即可   
在这过程中我们需要给Dialog组件以及组件中的其他组件使用Bind-Value（双向绑定）绑上值。   
接下来我们给数据表格的Action操作列增加OnClick点击事件  
对应绑定分部类中EditItem方法  
我们先运行看下效果：  
 这两个按钮分别对应<MCardActions>两个Button  
Close直接绑定后台关闭Dialog方法 
 
Save方法则是用来做最终修改数据等操作DB的方法这里就不做演示，感兴趣的同学可自行结合业务做相应的操作。 
###### （4）使用预置组件应对常用业务的场景 
在我们实际项目中，难免会碰到需要你开发多个模块或者多个管理页面，这样一来每个页面不可避免的会有一些需要你重复编码的地方，那么你是选择每个页面copy一份相同的代码还是选择封装一个业务组件呢？毫无疑问，聪明的同学肯定会选择后者，当然新入门的同学可以先来看看MASA Blazor提供预置组件，拿来即用，后期同学们登堂入室后可自行根据当前业务封装业务组件。 
我们先来看看通用页头预置组件：  直接copy代码看看效果：  
当我们数据表格中数据内容长度过长时可以使用封装好的<CopyableText>预置组件： 看看效果：  
使用方法很简单且支持复制效果：  当然还有其他常用的预置组件，由于本文篇幅有限，只做个别组件使用介绍，使用方法都大差不差，感兴趣的同学可自行去官网查阅。 
##### 结尾 
本文介绍内容只针对刚入门的同学，抛砖引玉，对于封装组件技巧以及组件高深用法感兴趣的同学可以关注我们同系列其他同学的文章或者直接去官网查看源码： 
使用MASA Blazor开发一个标准的查询表格页以及封装技巧介绍 
###### 参考资源 
 
 https://blazor.masastack.com/ 
 https://github.com/BlazorComponent/MASA.Blazor 
 https://gitee.com/blazorcomponent/MASA.Blazor 
 https://blazor-pro.masastack.com/dashboards/ecommerce 
 https://github.com/BlazorComponent/MASA.Blazor.Pro 
 https://blazor-university.com/ 
 https://github.com/capdiem/MASA.Blazor.Experimental.Components 
 
#### 开源地址 
MASA.BuildingBlocks：https://github.com/masastack/MASA.BuildingBlocks 
MASA.Contrib：https://github.com/masastack/MASA.Contrib 
MASA.Utils：https://github.com/masastack/MASA.Utils 
MASA.EShop：https://github.com/masalabs/MASA.EShop 
MASA.Blazor：https://github.com/BlazorComponent/MASA.Blazor 
如果你对我们的 MASA Framework 感兴趣，无论是代码贡献、使用、提 Issue，欢迎联系我们 

                                        