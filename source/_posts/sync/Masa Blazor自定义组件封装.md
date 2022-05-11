---
title: 推荐系列-Masa Blazor自定义组件封装
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 268
date: 2022-05-11 05:27:50
cover_picture: 'https://s2.loli.net/2022/05/05/89IqRed5TOijQrh.gif'
---

&emsp;&emsp; 实际项目中总能遇到一个"组件"不是基础组件但是又会频繁复用的情况,在开发MASA Auth时也封装了几个组件。既有简单定义CSS样式和界面封装的组件（GroupBox），也有带一定组件内部逻辑的组...
<!-- more -->

                                                                                                                                                                                        ### 前言 
实际项目中总能遇到一个"组件"不是基础组件但是又会频��复��的情况,在开发MASA Auth时也封装了几个组件。既有简单定义CSS样式和界面封装的组件（GroupBox），也有带一定组件内部逻辑的组件(ColorGroup)。 本文将一步步演示如何封装出一个如下图所示的ColorGroup组件,将MItemGroup改造为ColorGroup,点击选择预设的颜色值。 
 
### MASA Blazor介绍 
#### 组件展示 
MASA Blazor 提供丰富的组件（还在增加中）,篇幅限制下面展示一些我常用到的组件 
 
 
#### Material Design + BlazorComponent 
BlazorComponent是一个底层组件框架，只提供功能逻辑没有样式定义，MASA Blazor就是BlazorComponent基础实现了Material Design样式标准。如下图所示，你可以基于Ant Design样式标准实现一套Ant Design Blazor(虽然已经有了，如果你想这么做完全可以实现)。 
 
### 项目创建 
首先确保已安装Masa Template（避免手动引用MASA Blazor）,如没有安装执行如下命令: 
 
 ```java 
  dotnet new --install Masa.Template

  ``` 
  
创建一个简单的Masa Blazor Server App项目： 
 
 ```java 
  dotnet new masab -o MasaBlazorApp

  ``` 
  
### 组件封装 
Blazor组件封装很简单，不需要和vue一样进行注册，新建一个XXX.razor组件就是实现了XXX组件的封装，稍微复杂些的是需要自定义组件内部逻辑以及定义开放给用户（不同的使用场景）的接口（参数），即根据需求增加XXX.razor.cs和XXX.razor.css文件。 
#### 界面封装 
在熟悉各种组件功能的前提下找出需要的组件组装起来简单实现想要的效果。这里我使用MItemGroup、MCard及MButton实现ColorGroup的效果。MItemGroup做颜色分组，且本身提供每一项激活的功能。MCard 作为颜色未选择之前的遮罩层，实现模糊效果。MButton作为颜色展示载体及激活MItem。通过MCard的style设置透明度区分选中、未选中两种状态。 
 
新建ColorGroup.Razor文件，代码如下： 
 
 ```java 
  <MItemGroup Mandatory Class="m-color-group d-flex mx-n1">
    <MItem>
        <MCard Class="elevation-0" Style="@($"transition: opacity .4s ease-in-out; {(context.Active ? "" : "opacity: 0.5;")}")">
            <MButton Fab class="mx-1 rounded-circle" OnClick="context.Toggle"
                     Width=20 Height=20 MinWidth=20 MinHeight=20 Color="red">
            </MButton>
        </MCard>
    </MItem>

    <MItem>
        <MCard Class="elevation-0" Style="@($"transition: opacity .4s ease-in-out; {(context.Active ? "" : "opacity: 0.5;")}")">
            <MButton Fab class="mx-1 rounded-circle" OnClick="context.Toggle"
                     Width=20 Height=20 MinWidth=20 MinHeight=20 Color="blue">
            </MButton>
        </MCard>
    </MItem>

    <MItem>
        <MCard Class="elevation-0" Style="@($"transition: opacity .4s ease-in-out; {(context.Active ? "" : "opacity: 0.5;")}")">
            <MButton Fab class="mx-1 rounded-circle" OnClick="context.Toggle"
                     Width=20 Height=20 MinWidth=20 MinHeight=20 Color="green">
            </MButton>
        </MCard>
    </MItem>
</MItemGroup>

  ``` 
  
修改Index.Blazor 文件 增加ColorGroup使用代码,Masa.Blazor.Custom.Shared.Presets为自定义组件路径，即命名空间： 
 
 ```java 
  <Masa.Blazor.Custom.Shared.Presets.ColorGroup>
</Masa.Blazor.Custom.Shared.Presets.ColorGroup>

  ``` 
  
运行代码，看到多出三个不同颜色的圆型： 
 
 
#### 自定义参数 
通过第一部分可以看到封装的组件面子（界面）有了，但是这个面子是“死”的，不能根据不同的使用场景展示不同的效果，对于ColorGroup而言，最基本的需求就是使用时可以自定义显示的颜色值。 Blazor中通过[Parameter]特性来声明参数，通过参数的方式将上叙代码中写死的值改为通过参数传入。如按钮的大小、颜色以及MItemGroup的class和style属性等。同时增加组件的里子（组件逻辑），点击不同颜色按钮更新Value。 
新建ColorGroup.Razor.cs文件，添加如下代码： 
 
 ```java 
  public partial class ColorGroup
{
    [Parameter]
    public List<string> Colors { get; set; } = new();

    [Parameter]
    public string Value { get; set; } = string.Empty;

    [Parameter]
    public EventCallback<string> ValueChanged { get; set; }

    [Parameter]
    public string? Class { get; set; }

    [Parameter]
    public string? Style { get; set; }

    [Parameter]
    public int Size { get; set; } = 24;

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        if (firstRender)
        {
            if (Colors.Any())
            {
                await ValueChanged.InvokeAsync(Colors.First());
            }
        }
        await base.OnAfterRenderAsync(firstRender);
    }
}

  ``` 
  
 
需要注意的是应尽量减少参数定义，太多的参数会增加组件呈现的开销。 减少参数传递，可以自定义参数类（本文示例为单独定义多个参数）。如： 
 
 ```java 
  @code {
    [Parameter]
    public TItem? Data { get; set; }

    [Parameter]
    public GridOptions? Options { get; set; }
}

  ``` 
  
同时更新ColorGroup.Razor文件中代码，循环Colors 属性显示子元素以及增加MButton的点击事件，更新Value值： 
 
 ```java 
  <MItemGroup Mandatory Class="@($"m-color-group d-flex mx-n1 {@Class}")" style="@Style">
    @foreach (var color in Colors)
    {
        <MItem>
            <MCard Class="elevation-0" Style="@($"transition: opacity .4s ease-in-out; {(context.Active ? "" : "opacity: 0.5;")}")">
                <MButton Fab class="mx-1 rounded-circle" OnClick="()=>{ context.Toggle();ValueChanged.InvokeAsync(color); }"
                     Width=Size Height=Size MinWidth=Size MinHeight=Size Color="@color">
                </MButton>
            </MCard>
        </MItem>
    }
</MItemGroup>

  ``` 
  
此时使用ColorGroup的代码变为如下代码，可以灵活的指定颜色组数据以及ColorGroup的Class和Style等： 
 
 ```java 
  <Masa.Blazor.Custom.Shared.Presets.ColorGroup Colors='new List<string>{"blue","green","yellow","red"}'>
</Masa.Blazor.Custom.Shared.Presets.ColorGroup>

  ``` 
  
#### 启用隔离样式 
第一部分末尾提到了所有的Class除了m-color-group都是Vuetify提供的class样式,那么m-color-group是哪来的？ 新增ColorGroup.Razor.css 文件，ColorGroup.Razor.css 文件内的css将被限定在ColorGroup.Razor组件内不会影响其它组件。最终会ColorGroup.Razor.css输出到一个名为 
 ```java 
  {ASSEMBLY NAME}.styles.css
  ``` 
 的捆绑文件中， 
 ```java 
  {ASSEMBLY NAME}
  ``` 
  是项目的程序集名称。 本文示例并没有增加ColorGroup.Razor.css，只是觉得作为封装���件现有样式够看了，增加 
 ```java 
  m-color-group
  ``` 
  class 只是为了外部使用时方便css样式重写，并没有做任何定义。 
 
#### 自定义插槽 
目前为止，自定义的ColorGroup组件可以说已经够看了，但是不够打。因为形式单一，如果要在颜色选择按钮后增加文本或者图片怎么办？这就又引入另外一个概念：插槽。 插槽（Slot）为vue中的叫法，Vuetify组件提供了大量的插槽如文本输入框内的前后插槽和输入框外的前后插槽（默认为Icon），MASA Blazor 同样实现了插槽的功能，这也使得我们更容易定义和扩展自己的组件。 
 
ColorGroup.Razor.cs文件中增加RenderFragment属性来定义每项末尾追加的插槽，并定义string参数，接收当前的颜色值。 
 
 ```java 
  [Parameter]
public RenderFragment<string>? ItemAppendContent { get; set; }

  ``` 
  
 
ColorGroup.Razor文件中定义插槽位置 
 
 ```java 
  <MItem>
    <MCard Class="elevation-0" Style="@($"transition: opacity .4s ease-in-out; {(context.Active ? "" : "opacity: 0.5;")}")">
         <MButton Fab class="mx-1 rounded-circle" OnClick="()=>{ context.Toggle();ValueChanged.InvokeAsync(color); }" Width=Size Height=Size MinWidth=Size MinHeight=Size Color="@color">
         </MButton>
    </MCard>
    @if (ItemAppendContent is not null)
    {
        <div class="m-color-item-append d-flex align-center mr-1">
             @ItemAppendContent(color)
        </div>
    }
</MItem>

  ``` 
  
最终的效果如下： 
 
### 组件优化 
组件在保证功能和美观的同时，也要保证性能，以下只是列举了一些笔者认为比较常规的优化方式。 
#### 减少组件重新渲染 
合理重写ShouldRender方法，避免成本高昂的重新呈现。 贴一下官网代码自行体会，即一定条件都符合时才重新渲染： 
 
 ```java 
  @code {
    private int prevInboundFlightId = 0;
    private int prevOutboundFlightId = 0;
    private bool shouldRender;

    [Parameter]
    public FlightInfo? InboundFlight { get; set; }

    [Parameter]
    public FlightInfo? OutboundFlight { get; set; }

    protected override void OnParametersSet()
    {
        shouldRender = InboundFlight?.FlightId != prevInboundFlightId
            || OutboundFlight?.FlightId != prevOutboundFlightId;

        prevInboundFlightId = InboundFlight?.FlightId ?? 0;
        prevOutboundFlightId = OutboundFlight?.FlightId ?? 0;
    }

    protected override bool ShouldRender() => shouldRender;
}

  ``` 
  
减少不必要的StateHasChanged方法调用，默认情况下，组件继承自 ComponentBase，会在调用组件的事件处理程序后自动调用StateHasChanged，对于某些事件处理程序可能不会修改组件状态的情况，应用程序可以利用 IHandleEvent 接口来控制 Blazor 事件处理的行为。示例代码见官方文档。 
#### 合理重写组件生命周期方法 
首先要理解组件生命周期，特别是OnInitialized（组件接收 SetParametersAsync 中的初始参数后调用）、OnParametersSet（接收到参数变更时调用）、OnAfterRender（组件完成呈现后调用）。 以上方法每个都会执行两次及以上(render-mode="ServerPrerendered")。 组件初始化的逻辑合理的分配到各个生命周期方法内，最常见的就是OnAfterRender方法内,firstRender为true时调用js或者加载数据： 
 
 ```java 
  protected override async Task OnAfterRenderAsync(bool firstRender)
{
    if (firstRender)
    {
        await JS.InvokeVoidAsync(
           "setElementText1", divElement, "Text after render");
    }
}

  ``` 
  
 
#### 定义可重用的 RenderFragment 
将重复的呈现逻辑定义为RenderFragment，无需每个组件开销即可重复使用呈现逻辑。缺点就是重用RenderFragment缺少组件边界，无法单独刷新。 
 
 ```java 
  <h1>Hello, world!</h1>

@RenderWelcomeInfo

<p>Render the welcome info a second time:</p>

@RenderWelcomeInfo

@code {
    private RenderFragment RenderWelcomeInfo = __builder =>
    {
        <p>Welcome to your new app!</p>
    };
}

  ``` 
  
#### 避免为重复的元素重新创建委托 
Blazor 中过多重复的创建 lambda 表达式委托可能会导致性能不佳，如对一个按钮组每个按钮的OnClick分配一个委托。可以将表达式委托改为Action减少分配开销。 
#### 实现IDisposable 或 IAsyncDisposable接口 
组件实现IDisposable 或 IAsyncDisposable接口，会在组件从UI中被删除时释放非托管资源，事件注销操作等。 
 
 
### 总结 
这里只演示了一个ColorGroup很简单的例子，当然你也可以把这个组件做的足够“复杂”,其实组件的封装并没有想象的那么复杂，无外乎上面提到的四个要素：界面、参数、样式、插槽。既然有些组件官方不提供，只能自己动手丰衣足食（当然还是希望官方提供更多标准组件之外的扩展组件）。 
示例项目地址，更多内容参考Masa Blazor 预置组件 实现。 
#### 开源地址 
MASA.BuildingBlocks：https://github.com/masastack/MASA.BuildingBlocks 
MASA.Contrib：https://github.com/masastack/MASA.Contrib 
MASA.Utils：https://github.com/masastack/MASA.Utils 
MASA.EShop：https://github.com/masalabs/MASA.EShop 
MASA.Blazor：https://github.com/BlazorComponent/MASA.Blazor 
如果你对我们的 MASA Framework 感兴趣，无论是代码贡献、使用、提 Issue，欢迎联系我们 

                                        