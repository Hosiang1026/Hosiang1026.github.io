---
title: 推荐系列-深度解析 Jetpack Compose 布局
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 304
cover_picture: 'https://devrel.andfun.cn/devrel/posts/2022/03/JKtev1.png'
abbrlink: dbd25fe1
date: 2022-03-27 11:56:25
---

&emsp;&emsp;tpack Compose 是用于构建原生 Android 界面的新工具包。它可简化并加快 Android 上的界面开发，使用更少的代码、强大的工具和直观的 Kotlin API，快速让应用生动而精彩。Compose 使用全新...
<!-- more -->

                                                                                                                    
            程序员健身是为了保养还是保命？参与话题讨论赢好礼 >>>
            
                                                                                                     
Jetpack Compose 是用于构建原生 Android 界面的新工具包。它可简化并加快 Android 上的界面开发，使用更少的代码、强大的工具和直观的 Kotlin API，快速让应用生动而精彩。Compose 使用全新的组件——可组合项 (Composable) 来布局界面，使用 修饰符 (Modifier) 来配置可组合项。 
本文会为您讲解由可组合项和修饰符提供支持的组合布局模型，并深入探究其背后的工作原理以及它们的功能，让您更好地了解所用布局和修饰符的工作方式，和应如何以及在何时构建自定义布局，从而实现满足确切应用需求的设计。 
如果您更喜欢通过视频了解本文内容，请 点击这里 观看。 
#### 布局模型 
Compose 布局系统的目标是提供易于创建的布局，尤其是 自定义布局。这要求布局系统具备强大的功能，使开发者能创建应用所需的任何布局，并且让布局具备优异的性能。接下来，我们来看看 Compose 的布局模型 是如何实现这些目标的。 
Jetpack Compose 可将状态转换为界面，这个过程分为三步: 组合、布局、绘制。组合阶段执行 可组合函数，这些函数可以生成界面，从而创建界面树。例如，下图中的 SearchResult 函数会生成对应的界面树: 
 
△ 可组合函数生成对应的界面树 
可组合项中可以包含逻辑和控制流，因此可以根据不同的状态生成不同的界面树。在布局阶段，Compose 会遍历界面树，测量界面的各个部分，并将每个部分放置在屏幕 2D 空间中。也就是说，每个节点决定了其各自的宽度、高度以及 x 和 y 坐标。在绘制阶段，Compose 将再次遍历这棵界面树，并渲染所有元素。 
本文将深入探讨布局阶段。布局阶段又细分为两个阶段: 测量和放置。这相当于 View 系统中的 onMeasure 和 onLayout。但在 Compose 中，这两个阶段会交叉进行，因此我们把它看成一个布局阶段。将界面树中每个节点布局的过程分为三步: 每个节点必须测量自身的所有子节点，再决定自身的尺寸，然后放置其子节点。如下例，单遍即可对整个界面树完成布局。 
 
△ 布局过程 
其过程简述如下: 
 
 测量根布局 Row； 
 Row 测量它的第一个子节点 Image； 
 由于 Image 是一个不含子节点的叶子节点，它会测量自身尺寸并加以报告，还会返回有关如何放置其子节点的指令。Image 的叶子节点通常是空节点，但所有布局都会在设置其尺寸的同时返回这些放置指令； 
 Row 测量它的第二个子节点 Column； 
 Column 测量其子节点，首先测量第一个子节点 Text； 
 Text 测量并报告其尺寸以及放置指令； 
 Column 测量第二个子节点 Text； 
 Text 测量并报告其尺寸以及放置指令； 
 Column 测量完其子节点，可以决定其自身的尺寸和放置逻辑； 
 Row 根据其所有子节点的测量结果决定其自身尺寸和放置指令。 
 
测量完所有元素的尺寸后，将再次遍历界面树，并且会在放置阶段执行所有放置指令。 
#### Layout 可组合项 
我们已经了解这个过程涉及的步骤，接下来看一下它的实现方式。先看看组合阶段，我们采用 Row、Column、Text 等更高级别的可组合项来表示界面树，每个高级别的可组合项实际上都是由低级别的可组合项构建而成。以 Text 为例，可以发现它由若干更低级别的基础构建块组成，而这些可组合项都会包含一个或多个 Layout 可组合项。 
 
△ 每个可组合项都包含一个或多个 Layout 
Layout 可组��项是 Compose 界面的基础构建块，它会生成 LayoutNode。在 Compose 中，界面树，或者说组合 (composition) 是一棵 LayoutNode 树。以下是 Layout 可组合项的函数签名: 
 
 ```java 
  @Composable
fun Layout(
    content: @Composable () -> Unit,
    modifier: Modifier = Modifier,
    measurePolicy: MeasurePolicy
) {
    …
}

  ``` 
  
△ Layout 可组合项的函数签名 
其中，content 是可以容纳任何子可组合项的槽位，出于布局需要，content 中也会包含子 Layout。modifier 参数所指定的修饰符将应用于该布局，这在下文中会详细介绍。measurePolicy 参数是 MeasurePolicy 类型，它是一个函数式接口，指定了布局测量和放置项目的方式。一般情况下，如需实现自定义布局的行为，您要在代码中实现该函数式接口: 
 
 ```java 
  @Composable
fun MyCustomLayout(
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit
) {
    Layout(
         modifier = modifier,
         content = content
    ) { measurables: List<Measurable>,
         constraints: Constraints ->
        // TODO 测量和放置项目
   }
}

  ``` 
  
△ 实现 MeasurePolicy 函数式接口 
在 MyCustomLayout 可组合项中，我们调用 Layout 函数并以 Trailing Lambda 的形式提供 MeasurePolicy 作为参数，从而实现所需的 measure 函数。该函数接受一个 Constraints 对象来告知 Layout 它的尺寸限制。Constraints 是一个简单类，用于限制 Layout 的最大和最小宽度与高度: 
 
 ```java 
  class Constraints {
    val minWidth: Int
    val maxWidth: Int
    val minHeight: Int
    val maxHeight: Int
}

  ``` 
  
△ Constraints 
measure 函数还会接受 List<Measurable> 作为参数，这表示的是传入的子元素。Measurable 类型会公开用于测量项目的函数。如前所述，布局每个元素需要三步: 每个元素必须测量其所有子元素，并以此判断自身尺寸，再放置其子元素。其代码实现如下: 
 
 ```java 
  @Composable
fun MyCustomLayout(
    content: @Composable () -> Unit,
    modifier: Modifier = Modifier
) {
    Layout(
         modifier = modifier,
         content = content
    ) { measurables: List<Measurable>,
         constraints: Constraints ->
        // placeables 是经过测量的子元素，它拥有自身的尺寸值
        val placeables = measurables.map { measurable ->
            // 测量所有子元素，这里不编写任何自定义测量逻辑，只是简单地
            // 调用 Measurable 的 measure 函数并传入 constraints
            measurable.measure(constraints)
        }
        val width = // 根据 placeables 计算得出
        val height = // 根据 placeables 计算得出
        // 报告所需的尺寸
        layout (width, height) {
            placeables.foreach { placeable ->
                // 通过遍历将每个项目放置到最终的预期位置
                placeable.place(
                    x = …
                    y = …
                )
            }
        }
   }
}

  ``` 
  
△ 布局每个元素的代码示例 
上述代码中使用了 Placeable 的 place 函数，它还有一个 placeRelative 函数可用于从右到左的语言设置中，当使用该函数时，它会自动对坐标进行水平镜像。 
请注意，API 在设计上可阻止您尝试放置未经测量的元素，place 函数只适用于 Placeable，也就是 measure 函数的返回值。在 View 系统中，调用 onMeasure 以及 onLayout 的时机由您决定，而且调用顺序没有强制要求，但这会产生一些微妙的 bug 以及行为上的差异。 
#### 自定义布局示例 
MyColumn 示例 
 
△ Column 
Compose 提供一个 Column 组件用于纵向排布元素。为了理解这个组件背后的工作方式及其使用 Layout 可组合项的方式，我们来实现自己的一个 Column。暂且将其命名为 MyColumn，其实现代码如下: 
 
 ```java 
  @Composable
fun MyColumn(
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit
) {
    Layout(
         modifier = modifier,
         content = content
    ) { measurables, constraints ->
        // 测量每个项目并将其转换为 Placeable
        val placeables = measurables.map { measurable ->
            measurable.measure(constraints)
        }
        // Column 的高度是所有项目所测得高度之和
        val height = placeables.sumOf { it.height }
        // Column 的宽度则为内部所含最宽项目的宽度
        val width = placeables.maxOf { it.width }
        // 报告所需的尺寸
        layout (width, height) {
            // 通过跟踪 y 坐标放置每个项目
            var y = 0
            placeables.forEach { placeable ->
                placeable.placeRelative(x = 0, y = y)
                // 按照所放置项目的高度增加 y 坐标值
                y += placeable.height
            }
        }
    }
}

  ``` 
  
△ 自定义 Column 
VerticalGrid 示例 
 
△ VerticalGrid 
我们再来看另一个示例: 构建常规网格。其部分代码实现如下: 
 
 ```java 
  @Composable
fun VerticalGrid(
    modifier: Modifier = Modifier,
    columns: Int = 2,
    content: @Composable () -> Unit
) {
    Layout(
        content = content,
         modifier = modifier
    ) { measurables, constraints ->
        val itemWidth = constraints.maxWidth / columns
        // 通过 copy 函数保留传递下来的高度约束，但设置确定的宽度约束
        val itemConstraints = constraints.copy (
            minWidth = itemWidth,
            maxWidth = itemWidth,
        )        
        // 使用这些约束测量每个项目并将其转换为 Placeable
        val placeables = measurables.map { it.measure(itemConstraints) }
        …
    }
}

  ``` 
  
△ 自定义 VerticalGrid 
在该示例中，我们通过 copy 函数创建了新的约束。这种为子节点创建新约束的概念就是实现自定义测量逻辑的方式。创建不同约束来测量子节点的能力是此模型的关键，父节点与子节点之间并没有协商机制，父节点会以 Constraints 的形式传递其允许子节点的尺寸范围，只要子节点从该范围中选择了其尺寸，父节点必须接受并处理子节点。 
这种设计的优点在于我们可以单遍测量整棵界面树，并且禁止执行多个测量循环。这是 View 系统中存在的问题，嵌套结构执行多遍测量过程可能会让叶子视图上的测量次数翻倍，Compose 的设计能够防止发生这种情况。实际上，如果您对某个项目进行两次测量，Compose 会抛出异常: 
 
△ 重复测量某个项目时 Compose 会抛出异常 
布局动画示例 
由于具备更强的性能保证，Compose 提供了新的可能性，例如为布局添加动画。Layout composable 不仅可以创建通用布局，还能创建出符合应用设计需求的专用布局。以 Jetsnack 应用中的自定义底部导航为例，在该设计中，如果某项目被选中，则显示标签；如果未被选中，则只显示图标。而且，设计还需要让项目的尺寸和位置根据当前选择状态执行动画。 
 
△ Jetsnack 应用中的自定义底部导航 
我们可以使用自定义布局来实现该设计，从而对布局变化的动画处理进行精确控制: 
 
 ```java 
  @Composable
fun BottomNavItem(
    icon: @Composable BoxScope.() -> Unit,
    text: @Composable BoxScope.() -> Unit,
    @FloatRange(from = 0.0, to = 1.0) animationProgress: Float
) {
    Layout(
        content = {
            // 将 icon 和 text 包裹在 Box 中
            // 这种做法能让我们为每个项目设置 layoutId
            Box(
                modifier = Modifier.layoutId(“icon”)
                content = icon
            )
            Box(
                modifier = Modifier.layoutId(“text”)
                content = text
            )
        }
    ) { measurables, constraints ->
        // 通过 layoutId 识别对应的 Measurable，比依赖项目的顺序更可靠
        val iconPlaceable = measurables.first {it.layoutId == “icon” }.measure(constraints)
        val textPlaceable = measurables.first {it.layoutId == “text” }.measure(constraints)
 
        // 将放置逻辑提取到另一个函数中以提高代码可读性
        placeTextAndIcon(
            textPlaceable,
            iconPlaceable,
            constraints.maxWidth,
            constraints.maxHeight,
            animationProgress
        )
    }
}
 
fun MeasureScope.placeTextAndIcon(
    textPlaceable: Placeable,
    iconPlaceable: Placeable,
    width: Int,
    height: Int,
    @FloatRange(from = 0.0, to = 1.0) animationProgress: Float
): MeasureResult {
 
    // 根据动画进度值放置文本和图标
    val iconY = (height - iconPlaceable.height) / 2
    val textY = (height - textPlaceable.height) / 2
 
    val textWidth = textPlaceable.width * animationProgress
    val iconX = (width - textWidth - iconPlaceable.width) / 2
    val textX = iconX + iconPlaceable.width
 
    return layout(width, height) {
        iconPlaceable.placeRelative(iconX.toInt(), iconY)
        if (animationProgress != 0f) {
            textPlaceable.placeRelative(textX.toInt(), textY)
        }
    }
}

  ``` 
  
△ 自定义底部导航 
使用自定义布局的时机 
希望以上示例能帮助您了解自定义布局的工作方式以及这些布局的应用理念。标准布局强大而灵活，但它们也需要适应很多用例。有时，若您知道具体的实现需求，使用自定义布局可能更加合适。 
当您遇到以下场景时，我们推荐使用自定义布局: 
 
 难以通过标准布局实现的设计。虽然可以使用足够多的 Row 和 Column 构建大部分界面，但这种实现方式有时难以维护和升级； 
 需要非常精确地控制测量和放置逻辑； 
 需要实现布局动画。我们正在开发可对放置进行动画处理的新 API，未来可能不必自行编写布局就能实现； 
 需要完全控制性能。下文会详细介绍这一点。 
 
#### 修饰符 
至此，我们了解了 Layout 可组合项以及构建自定义布局的方式。如果您使用 Compose 构建过界面，就会知道 修饰符 在布局、配置尺寸和位置方面发挥着重要作用。通过前文的示例可以看到，Layout 可组合项接受修饰符链作为参数。修饰符会装饰它们所附加的元素，可以在布局自身的测量和放置操作之前参与测量和放置。接下来我们来看看它的工作原理。 
修饰符分很多不同的类型，可以影响不同的行为，例如绘制修饰符 (DrawModifier)、指针输入修饰符 (PointerInputModifier) 以及焦点修饰符 (FocusModifier)。本文我们将重点介绍布局修饰符 (LayoutModifier)，该修饰符提供了一个 measure 方法，该方法的作用与 Layout 可组合项基本相同，不同之处在于，它只作用于单个 Measurable 而不是 List<Measurable>，这是因为修饰符的应用对象是单个项目。在 measure 方法中，修饰符可以修改约束或者实现自定义放置逻辑，就像布局一样。这表示您并不总是需要编写自定义布局，如果只想对单个项目执行操作，则可以改用修饰符。 
以 padding 修饰符为例，该工厂函数以修饰符链为基础，创建能够捕获所需 padding 值的 PaddingModifier 对象。 
 
 ```java 
  fun Modifier.padding(all: Dp) =
    this.then(PaddingModifier(
            start = all,
            top = all,
            end = all,
            bottom = all
        )
    )
 
private class PaddingModifier(
    val start: Dp = 0.dp,
    val top: Dp = 0.dp,
    val end: Dp = 0.dp,
    val bottom: Dp = 0.dp
) : LayoutModifier {
 
override fun MeasureScope.measure(
        measurable: Measurable,
        constraints: Constraints
    ): MeasureResult {
        val horizontal = start.roundToPx() + end.roundToPx()
        val vertical = top.roundToPx() + bottom.roundToPx()
 
        // 按 padding 尺寸收缩外部约束来修改测量
        val placeable = measurable.measure(constraints.offset(-horizontal, -vertical))
 
        val width = constraints.constrainWidth(placeable.width + horizontal)
        val height = constraints.constrainHeight(placeable.height + vertical)
        return layout(width, height) {
                // 按所需的 padding 执行偏移以放置内容
                placeable.placeRelative(start.roundToPx(), top.roundToPx())
        }
    }
}

  ``` 
  
△ padding 修饰符的实现 
除了通过上例中的方式覆写 measure 方法实现测量，您也可以使用 Modifier.layout，在无需创建自定义布局的情况下直接通过修饰符链向任意可组合项添加自定义测量和放置逻辑，如下所示: 
 
 ```java 
  Box(Modifier
            .background(Color.Gray)
            .layout { measurable, constraints ->
                // 通过修饰符在竖直方向添加 50 像素 padding 的示例
                val padding = 50
                val placeable = measurable.measure(constraints.offset(vertical = -padding))
                layout(placeable.width, placeable.height + padding) {
                    placeable.placeRelative(0, padding)
                }
            }
        ) {
            Box(Modifier.fillMaxSize().background(Color.DarkGray))
        }


  ``` 
  
△ 使用 Modifier.layout 实现布局 
虽然 Layout 接受单个 Modifier 参数，该参数会建立一个按顺序应用的修饰符链。我们通过示例来了解它与布局模型的交互方式。我们将分析下图修饰符的效果及其工作原理: 
 
△ 修饰符链的效果示例 
首先，我们为 Box 设置尺寸并将其绘制出来，但这个 Box 放置在了父布局的左上角，我们可以使用 wrapContentSize 修饰符将 Box 居中放置。wrapContentSize 允许内容测量其所需尺寸，然后使用 align 参数放置内容，align 参数的默认值为 Center，因此可以省略这个参数。但我们发现，Box 还是在左上角。这是因为大多数布局都会根据其内容自适应调整尺寸，我们需要让测量尺寸占据整个空间，以便让 Box 在空间内居中。因此，我们在 wrapContentSize 前面添加 fillMaxSize 布局修饰符来实现这个效果。 
 
△ 修饰符链的应用过程 
我们来看一下这些修饰符是如何实现此效果的。您可以借助下图动画来辅助理解该过程: 
 
△ 修饰符链的工作原理 
假设这个 Box 要放入最大尺寸为 200*300 像素的容器内，容器会将相应的约束传入修饰符链的第一个修饰符中。fillMaxSize 实际上会创建一组新约束，并设置最大和最小宽度与高度，使之等于传入的最大宽度与高度以便填充到最大值，在本例中是 200*300 像素。这些约束沿着修饰符链传递以测量下一个元素，wrapContentSize 修饰符会接受这些参数，它会创建新的约束来放宽对传入约束的限制，从而让内容测量其所需尺寸，也就是宽 0-200，高 0-300。这看起来只像是对 fillMax 步骤的反操作，但请注意，我们是使用这个修饰符实现项目居中的效果，而不是重设项目的尺寸。这些约束沿着修饰符链传递到 size 修饰符，该修饰符创建���体尺寸的约束来测量项目，指定尺寸应该正好是 50*50。最后，这些约束传递到 Box 的布局，它执行测量并将解析得到的尺寸 (50*50) 返回到修饰符链，size 修饰符因此也将其尺寸解析为 50*50，并据此创建放置指令。然后 wrapContent 解析其大小并创建放置指令以居中放置内容。因为 wrapContent 修饰符知道其尺寸为 200*300，而下一个元素的尺寸为 50*50，所以使用居中对齐创建放置指令，以便将内容居中放置。最后，fillMaxSize 解析其尺寸并执行放置操作。 
修饰符链的执行方式与布局树的工作方式非常相像，差异在于每个修饰符只有一个子节点，也就是链中的下一个元素。约束会向下传递，以便后续元素用其测量自身尺寸，然后返回解析得到的尺寸，并创建放置指令。该示例也说明了 修饰符顺序的重要性。通过使用修饰符对功能进行组合，您可以很轻松地将不同的测量和布局策略组合在一起。 
#### 高级功能 
接下来将介绍布局模型的一些高级功能，虽然您不一定总是需要这些功能，但它们能够帮助您构建更高级的功能。 
固有特性测量 (Intrinsic Measurement) 
前文提到过，Compose 使用单遍布局系统。这个说法并不完全正确，布局并不总是能通过单遍操作就得以完成，有时我们也需要了解有关子节点尺寸的信息才能最终确定约束。 
以弹出式菜单为例。假设有一个包含五个菜单项的 Column，如下图所示，它的显示基本上是正常的，但是可以看到，每个菜单项的尺寸却不相同。 
 
△ 菜单项的尺寸不相同 
我们很容易想到，让每个菜单项都占用允许的最大尺寸即可: 
 
△ 每个菜单项都占有允许的最大尺寸 
但这么做也没能完全解决问题，因为菜单窗口会扩大到其最大尺寸。有效的解决方法是使用最大固有宽度来确定尺寸: 
 
△ 使用最大固有宽度来确定尺寸 
这里确定了 Column 会尽力为每个子节点提供所需的空间，对 Text 而言，其宽度是单行渲染全部文本所需的宽度。在确定固有尺寸后，将使用��些值设置 Column 的尺寸，然后，子节点就可以填充 Column 的宽度了。 
如果使用最小值而非最大值，又会发生什么呢？ 
 
△ 使用最小固有宽度来确定尺寸 
它将确定 Column 会使用子节点的最小尺寸，而 Text 的最小固有宽度是每行一个词时的宽度。因此，我们最后得到一个按词换行的菜单。 
如需详细了解固有特性测量，请参阅 Jetpack Compose 中的布局 Codelab 中的 "固有特性" 部分。 
ParentData 
到目前为止，我们看到的修饰符都是通用修饰符，也就是说，它们可以应用于任何可组合项。有时，您的布局提供的一些行为可能需要从子节点获得一些信息，这便要用到 ParentDataModifier。 
我们回到前面那个在父节点中居中放置蓝色 Box 的示例。这一次，我们将这个 Box 放在另一个 Box 中。Box 中的内容在一个称为 BoxScope 的接收器作用域内排布。BoxScope 定义了只在 Box 内可用的修饰符，它提供了一个名为 Align 的修饰符。这个修饰符刚好能够提供我们要应用到蓝色 Box 的功能。因此，如果我们知道蓝色 Box 位于另一个 Box 内，就可以改用 Align 修饰符来定位它。 
 
△ 在 BoxScope 中可以改用 Align 修饰符来定位内容 
Align 是一个 ParentDataModifier 而不是我们之前看到的那种布局修饰符，因为它只是向其父节点传递一些信息，所以如果不在 Box 中，该修饰符便不可用。它包含的信息将提供给父 Box，以供其设置子布局。 
您也可以为自己的自定义布局编写 ParentDataModifier，从而允许子节点向父节点告知一些信息，以供父节点在布局时使用。 
对齐线 (Alignment Lines) 
我们可以使用对齐线根据布局顶部、底部或中心以外的标准来设置对齐。最常用的 对齐线 是文本基线。假设需要实现这样一个设计: 
 
△ 需要实现设计图中的图标和文本对齐 
我们很自然就能想到这样来实现它: 
 
 ```java 
  Row {
    Icon(modifier = Modifier
        .size(10. dp)
        .align(Alignment.CenterVertically)
    )
    Text(modifier = Modifier
        .padding(start = 8.dp)
        .align(Alignment.CenterVertically)
    )
}

  ``` 
  
△ 有问题的对齐实现 
仔细观察，会发现图标并没有像设计稿那样对齐在文本的基线上。 
 
△ 图标和文本居中对齐，图标底部没有落在文本基线上 
我们可以通过以下代码进行修复: 
 
 ```java 
  Row {
    Icon(modifier = Modifier
        .size(10. dp)
        .alignBy { it.measuredHeight }
    )
    Text(modifier = Modifier
        .padding(start = 8.dp)
        .alignByBaseline()
    )
}

  ``` 
  
△ 正确的对齐实现 
首先��对 Text 使用 alignByBaseline 修饰符。而图标既没有基线，也没有其他对齐线，我们可以使用 alignBy 修饰符让图标对齐到我们需要的任何位置。在本例中，我们知道图标的底部是对齐的目标位置，因此将图标的底部进行对齐。最终便实现了期望的效果: 
 
△ 图标底部与文本基线完美对齐 
由于对齐功能会穿过父节点，因此，处理嵌套对齐时，只需设置父节点的对齐线，它会从子节点获取相应的值。如下例所示: 
 
△ 未设置对齐的嵌套布局 
 
△ 通过父节点设置对齐线 
您甚至可以在自定义布局中创建自己的自定义对齐，从而允许其他可组合项对齐到它。 
BoxWithConstraints 
BoxWithConstraints 是一个功能强大且很实用的布局。在组合中，我们可以根据条件使用逻辑和控制流来选择要显示的内容，但是，有时候可能希望根据可用空间的大小来决定布局内容。 
从前文中我们知道，尺寸信息直到布局阶段才可用，也就是说，这些信息一般无法在组合阶段用来决定要显示的内容。此时 BoxWithConstraints 便派上用场了，它与 Box 类似，但它将内容的组合推迟到布局阶段，��时布局信息已经可用了。BoxWithConstraints 中的内容在接收器作用域内排布，布局阶段确定的约束将通过该作用域公开为像素值或 DP 值。 
 
 ```java 
  @Composable
fun BoxWithConstraints(
        ...
        content: @Composable BoxWithConstraintsScope.() -> Unit
)
 
// BoxWithConstraintsScope 公开布局阶段确定的约束
interface BoxWithConstraintsScope : BoxScope {
    val constraints: Constraints
    val minWidth: Dp
    val maxWidth: Dp
    val minHeight: Dp
    val maxHeight: Dp
}

  ``` 
  
△ BoxWithConstraints 和 BoxWithConstraintsScope 
它内部的内容可以使用这些约束来选择要组合的内容。例如，根据最大宽度选择不同的呈现方式: 
 
 ```java 
  @Composable
fun MyApp(...) {
    BoxWithConstraints() { // this: BoxWithConstraintsScope
        when {
            maxWidth < 400.dp -> CompactLayout()
            maxWidth < 800.dp -> MediumLayout()
            else -> LargeLayout()
        }
    }
}

  ``` 
  
△ 在 BoxWithConstraintsScope 中根据最大宽度选择不同的布局 
#### 性能 
我们介绍了单遍布局模型如何防止在测量或放置方面花费过多时间，也演示了布局阶段两个不同的子阶段: 测量和放置。现在，我们将介绍性能相关的内容。 
尽量避免重组 
单遍布局模型的设计效果是，任何只影响项目的放置而不影响测量的修改都可以单独执行。以 Jetsnack 为例: 
 
△ Jetsnack 应用中产品详情页的协调滚动效果 
这个产品详情页包含协调滚动效果，页面上的一些元素根据滚动操作进行移动或缩放。请注意标题区域，这个区域会随着页面内容而滚动，最后固定在屏幕的顶部。 
 
 ```java 
  @Composable
fun SnackDetail(...) {
    Box {
        val scroll = rememberScrollState(0)
        Body(scroll)
        Title(scroll = scroll.value)
        ...
    }
}
 
@Composable
fun Body(scroll: ScrollState) {
    Column(modifier = Modifier.verticalScroll(scroll)) {
        …
    }
}

  ``` 
  
△ 详情页的大致实现 
为了实现此效果，我们将不同元素作为独立的可组合项叠放在一个 Box 中，提取滚动状态并将其传入 Body 组件。Body 会使用滚动状态进行设置以使内容能够垂直滚动。在 Title 等其他组件中可以观察滚动位置，而我们的观察方式会对性能产生影响。例如，使用最直接的实现，简单地使用滚动值对内容进行偏移: 
 
 ```java 
  @Composable
fun Title(scroll: Int) {
    Column(
        modifier = Modifier.offset(scroll)
    ) {
        …
    }
}

  ``` 
  
△ 简单地使用滚动值偏移 Title 的内容 
这种方法的问题是，滚动是一个可观察的状态值，读取该值所处的作用域规定了状态发生变化时 Compose 需要重新执行的操作。在此示例中，我们要读取组合中的滚动偏移值，然后使用它来创建偏移修饰符。只要滚动偏移值发生变化，Title 组件都需要重新组合，也就需要创建并执行新的偏移修饰符。由于滚动状态是从组合中读取的，任何更改都会导致重组，在重组时，还需要进行布局和绘制这两个后续阶段。 
不过，我们不是要更改显示的内容，而是更改内容的位置。我们还可以进一步提高效率，通过修改一下实现，不再接受原始滚动位置，而是传递一个可以提供滚动位置的函数: 
 
 ```java 
  @Composable
fun Title(scrollProvider: () -> Int) {
    Column(
        modifier = Modifier.offset {
            val scroll = scrollProvider()
            val offset = (maxOffset - scroll).coerceAtLeast(minOffset)
            IntOffset(x = 0, y = offset)
        }
    ) {
        …
    }
}

  ``` 
  
△ 使用提供滚动位置的函数代替原始滚动位置 
这时，我们可以在不同的时间只调用此 Lambda 函数并读取滚动状态。这里使用了 offset 修饰符，它接受能提供偏移值的 Lambda 函数作为参数。这意味着在滚动发生变化时，不需要重新创建修饰符，只在放置阶段才会读取滚动状态的值。所以，当滚动状态变化时我们只需要执行放置和绘制操作，不需要重组或测量，因此能够提高性能。 
再回到底部导航的示例，它存在同样的问题，我们可以用相同方法加以修正: 
 
 ```java 
  @Composable
fun BottomNavItem(
    icon: @Composable BoxScope.() -> Unit,
    text: @Composable BoxScope.() -> Unit,
    animationProgress: () -> Float
) {
    …
 
    val progress = animationProgress()
 
    val textWidth = textPlaceable.width * progress
    val iconX = (width - textWidth - iconPlaceable.width) / 2
    val textX = iconX + iconPlaceable.width
 
    return layout(width, height) {
        iconPlaceable.placeRelative(iconX.toInt(), iconY)
        if (animationProgress != 0f) {
            textPlaceable.placeRelative(textX.toInt(), textY)
        }
    }
}

  ``` 
  
△ 修正后的底部导航 
我们使用了能提供当前动画进度的函数作为参数，因此不需要重组，只执行布局即可。 
您需要掌握一个原则: 只要可组合项或修饰符的参数可能频繁发生更改，都应当保持谨慎，因为这种情况可能导致过度组合。只有在更改显示内容时，才需要重组，更改显示位置或显示方式则不需要这么做。 
BoxWithConstraints 可以根据布局执行组合，是因为它会在布局阶段启动子组合。出于性能考虑，我们希望尽量避免在布局期间执行组合。因此，相较于 BoxWithConstraints，我们倾向于使用会根据尺寸更改的布局。当信息类型随尺寸更改时才使用 BoxWithConstraints。 
提高布局性能 
有时候，布局不需要测量其所有子节点便可获知自身大小。举个例子，有如下构成的卡片: 
 
△ 布局卡片示例 
图标和标题构成标题栏，剩下的是正文。已知图标大小为固定值，标题高度与图标高度相同。测量卡片时，就只需要测量正文，它的约束就是布局高度减去 48 DP，卡片的高度则为正文的高度加上 48 DP。 
 
△ 测量过程只测量正文尺寸 
系统识别出只测量了正文，因此它是决定布局尺寸的唯一重要子节点，图标和文本仍然需要测量，但可以在放置过程中执行。 
 
△ 放置过程测量图标和文本 
假设标题是 "Layout"，当标题发生变化时，系统不必重新执行布局的测量操作，因此不会重新测量正文，从而省去不必要的工作。 
 
△ 标题发生变化时不必重新测量 
#### 总结 
在本文中，我们介绍了自定义布局的实现过程，还使用修饰符构建和合并布局行为，进一步降低了满足确切功能需求的难度。此外，还介绍了布局系统的一些高级功能，例如跨嵌套层次结构的自定义对齐，为自有布局创建自定义 ParentDataModifier，支持自动从右向左设置，以及将组合操作推迟到布局信息已知时，等等。我们还了解如何执行单遍布局模型，如何跳过重新测量以使其只执行重新放置操作的方法，熟练使用这些方法，您将能编写出通过手势进行动画处理的高性能布局逻辑。 
对布局系统的理解能够帮助您构建满足确切设计需求的布局，从而创建用户喜爱的优秀应用。如需了解更多，请查阅以下列出的资源: 
 
 Jetpack Compose 使用入门文档 
 Jetpack Compose 学习路线图 
 Jetpack Compose 相关示例 
 
欢迎您 点击这里 向我们提交反馈，或分享您喜欢的内容、发现的问题。您的反馈对我们非常重要，感谢您的支持！
                                        