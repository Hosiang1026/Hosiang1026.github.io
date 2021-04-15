---
title: 推荐系列-要改掉的 10 种 TypeScript 坏习惯
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 2110
cover_picture: 'https://api.ixiaowai.cn/gqapi/gqapi.php'
abbrlink: b51ae85d
date: 2021-04-15 09:46:45
---

&emsp;&emsp;在过去的几年中，TypeScript 和 JavaScript 一直在稳步发展，而我们在过去的几十年中养成的一些编程习惯也变得过时了。其中有一些习惯可能从来就没有什么意义可言。这篇文章就来谈一谈我们大...
<!-- more -->

                                                                                                                                                                                         
 在过去的几年中，TypeScript 和 JavaScript 一直在稳步发展，而我们在过去的几十年中养成的一些编程习惯也变得过时了。其中有一些习惯可能从来就没有什么意义可言。这篇文章就来谈一谈我们大家都应该改掉的 10 个习惯。 
  
  接下来我们就来一个个看示例吧！请注意，每个小节中“应该怎么做”这部分只纠正了前文提到的问题，实际情况中可能还要其他需要注意的代码风味。 
  
  
  1. 不使用 strict 模式 
  
  
  具体是什么意思 
  
 
   在没有启用 strict 模式的情况下使用 tsconfig.json。 
   
  
  
   
 ```java 
  {"compilerOptions": {"target": "ES2015","module": "commonjs"}}
  ``` 
  
  
  
  应该怎么做 
   
  
 
   只需启用 strict 模式即可： 
   
  
  
   
 ```java 
  {"compilerOptions": {"target": "ES2015","module": "commonjs","strict": true}}
  ``` 
  
  
  
  我们为什么养成了这样的习惯 
   
  
 在现有代码库中引入更严格的规则需要花费时间。 
  
  为什么应该纠正它 
  
 更严格的规则会让代码在将来更容易更改，因此用来修复代码的时间会在将来使用存储库时获得超额回报。 
  
  2. 用||定义默认值 
  
  
  具体是什么意思 
  
 
   对可选值用||回退： 
   
  
  
   
 ```java 
  function createBlogPost (text: string, author: string, date?: Date) {return {text: text,author: author,date: date || new Date()}}
  ``` 
  
  
  
  应该怎么做 
   
  
 
   使用新的?? 运算符，或者更好的是，在参数级别正确定义回退。 
   
  
  
   
 ```java 
  function createBlogPost (text: string, author: string, date: Date = new Date())return {text: text,author: author,date: date}}
  ``` 
  
  
  
  我��为什么养成了这样的习惯 
   
  
 这个?? 运算符是去年才引入的，所以在长函数中间使用值时，可能很难习惯将其设置为参数默认值。 
  
  为什么应该纠正它 
  
 与||不同，?? 仅对 null 或 undefined 回退，而不对所有虚假值回退。另外，如果你的函数太长而无法在开始时定义默认值，那么将它们拆分可能是个好主意。 
  
  3. 使用 any 类型 
  
  
  具体是什么意思 
  
 
   当你不确定结构时，将 any 用于数据。 
   
  
  
   
 ```java 
  async function loadProducts(): Promise<Product[]> {const response = await fetch('https://api.mysite.com/products')const products: any = await response.json()return products}
  ``` 
  
  
  
  应该怎么做 
   
  
 
   几乎在每种情况下，当你给什么东西定义 any 类型时，实际上应该给它定 unknown 类型。 
   
  
  
   
 ```java 
  async function loadProducts(): Promise<Product[]> {const response = await fetch('https://api.mysite.com/products')const products: unknown = await response.json()return products as Product[]}
  ``` 
  
  
  
  我们为什么养成了这样的习惯 
   
  
 any 很方便，因为它基本上会禁用所有类型检查。通常，即使在正式类型化中也会用到 any（例如，上面示例中的 response.json() 被 TypeScript 团队定义为 Promise 
  
    ）。 
   
  
  为什么应该纠正它 
  
 它基本上会禁用所有类型检查。通过 any 传入的任何内容将完全放弃任何类型检查。这导致系统难以捕获错误，因为仅当我们对类型结构的假设与运行时代码相关时，代码才会失败。 
  
  4. valasSomeType 
  
  
  具体是什么意思 
  
 
   强制告知编译器一个它无法推断的类型。 
   
  
  
   
 ```java 
  async function loadProducts(): Promise<Product[]> {const response = await fetch('https://api.mysite.com/products')const products: unknown = await response.json()return products as Product[]}
  ``` 
  
  
  
  应该怎么做 
   
  
 
   这就是 type guard 的用武之地。 
   
  
  
   
 ```java 
  function isArrayOfProducts (obj: unknown): obj is Product[] {return Array.isArray(obj) && obj.every(isProduct)}function isProduct (obj: unknown): obj is Product {return obj != null&& typeof (obj as Product).id === 'string'}async function loadProducts(): Promise<Product[]> {const response = await fetch('https://api.mysite.com/products')const products: unknown = await response.json()if (!isArrayOfProducts(products)) {throw new TypeError('Received malformed products API response')}return products}
  ``` 
  
  
  
  我们为什么养成了这样的习惯 
   
  
 从 JavaScript 转换为 TypeScript 时，现有的代码库通常会对 TypeScript 编译器无法自动推断出的类型进行假设。在这些情况下，简单地用一个 as SomeOtherType 可以加快转换速度，而不必放松 tsconfig 中的设置。 
  
  为什么应该纠正它 
  
 即使断言现在可以保存，当有人将代码移植到其他位置时这种情况也可能会改变。type guard 将确保所有检查都是明确的。 
  
  5. 测试中的 as any 
  
  
  具体是什么意思 
  
 
   编写测试时创建不完整的替身。 
   
  
  
   
 ```java 
  interface User {id: stringfirstName: stringlastName: stringemail: string}test('createEmailText returns text that greats the user by first name', () => {const user: User = {firstName: 'John'} as anyexpect(createEmailText(user)).toContain(user.firstName)}
  ``` 
  
  
  
  应该怎么做 
   
  
 
   如果你需要模拟测试数据，请将模拟逻辑移到要模拟的对象旁边，并使其可重用。 
   
  
  
   
 ```java 
  interface User {id: stringfirstName: stringlastName: stringemail: string}class MockUser implements User {id = 'id'firstName = 'John'lastName = 'Doe'email = 'john@doe.com'}test('createEmailText returns text that greats the user by first name', () => {const user = new MockUser()expect(createEmailText(user)).toContain(user.firstName)}
  ``` 
  
  
  
  我们为什么养成了这样的习惯 
   
  
 在尚不具备广泛的测试覆盖范围的代码库中编写测试时，通常会存在复杂的大数据结构，但是要测试的特定功能只用到其中的一部分。短期内不必担心其他属性。 
  
  为什么应该纠正它 
  
 放弃创建模拟会让我们付出代价，因为迟早会有一个属性更改会要求我们在所有测试中做更改，而不是一处改完全部生效。同样，在某些情况下，被测代码会依赖于我们之前认为不重要的属性，然后我们就需要更新针对该功能的所有测试。 
  
  6. 可选属性 
  
  
  具体是什么意思 
  
 
   一些属性有时存在，有时不存在，就将它们标为可选。 
   
  
  
   
 ```java 
  interface Product {id: stringtype: 'digital' | 'physical'weightInKg?: numbersizeInMb?: number}
  ``` 
  
  
  
  应该怎么做 
   
  
 
   明确建模哪些组合存在，哪些不存在。 
   
  
  
   
 ```java 
  interface Product {id: stringtype: 'digital' | 'physical'}interface DigitalProduct extends Product {type: 'digital'sizeInMb: number}interface PhysicalProduct extends Product {type: 'physical'weightInKg: number}
  ``` 
  
  
  
  我们为什么养成了这样的习惯 
   
  
 将属性标记为可选而不是拆分类型做起来会更容易，并且生成的代码更少。它还需要对正在构建的产品有更深入的了解，并且如果对产品的假设发生更改，可能会限制代码的使用。 
  
  为什么应该纠正它 
  
 类型系统的最大好处是它们可以用编译时检查代替运行时检查。通过更显式的类型化，可以对可能被忽略的错误进行编译时检查，例如确保每个 DigitalProduct 都有一个 sizeInMb。 
  
  7. 单字母泛型 
  
  
  具体是什么意思 
  
 
   用一个字母命名一个泛型。 
   
  
  
   
 ```java 
  function head<T> (arr: T[]): T | undefined {return arr[0]}
  ``` 
  
  
  
  应该怎么做 
   
  
 
   提供完整的描述性类型名称。 
   
  
  
   
 ```java 
  function head<Element> (arr: Element[]): Element | undefined {return arr[0]}
  ``` 
  
  
  
  我们为什么养成��这样的习惯 
   
  
 我猜想这个习惯越来越常见，因为即使是官方文档也在使用一个字母的名称： 
 https://www.typescriptlang.org/docs/handbook/generics.html 
 它的类型化速度也更快，并且不需要花很多时间来写一个全名。 
  
  为什么应该纠正它 
  
 泛型类型变量是变量，就像其他变量一样。当 IDE 开始向我们展示变量的技术性时，我们已经放弃了以它们的名称描述变量技术性的想法。例如现在我们只写 const name='Daniel'，而不是 const strName='Daniel'。另外，一个字母的变量名通常不容易看懂，因为不看声明就很难理解它们的含义。 
  
  8. 非布尔布尔检查 
  
  
  具体是什么意思 
  
 
   将一个值直接传递给 if 语句来检查是否定义了这个值。 
   
  
  
   
 ```java 
  function createNewMessagesResponse (countOfNewMessages?: number) {if (countOfNewMessages) {return `You have ${countOfNewMessages} new messages`}return 'Error: Could not retrieve number of new messages'}
  ``` 
  
  
  
  应该怎么做 
   
  
 
   明确检查我们关心的状况。 
   
  
  
   
 ```java 
  function createNewMessagesResponse (countOfNewMessages?: number) {if (countOfNewMessages !== undefined) {return `You have ${countOfNewMessages} new messages`}return 'Error: Could not retrieve number of new messages'}
  ``` 
  
  
  
  我们为什么养成了这样的习惯 
   
  
 编写简短的检查看起来更加简洁，这样我们就可以不去思考我们实际想要检查的内容。 
  
  为什么应该纠正它 
  
 也许我们应该考虑一下我们实际要检查的内容。例如，上面的示例处理了 countOfNewMessages 为 0 的不同情况。 
  
  9. BangBang 运算符 
  
  
  具体是什么意思 
  
 
   将一个非布尔值转换为布尔值。 
   
  
  
   
 ```java 
  function createNewMessagesResponse (countOfNewMessages?: number) {if (!!countOfNewMessages) {return `You have ${countOfNewMessages} new messages`}return 'Error: Could not retrieve number of new messages'}
  ``` 
  
  
  
  应该怎么做 
   
  
 
   明确检查我们关心的状况。 
   
  
  
   
 ```java 
  function createNewMessagesResponse (countOfNewMessages?: number) {if (countOfNewMessages !== undefined) {return `You have ${countOfNewMessages} new messages`}return 'Error: Could not retrieve number of new messages'}
  ``` 
  
  
  
  我们为什么养成了这样的习惯 
   
  
 对于一些人来说，理解!! 就像是 JavaScript 世界的入门仪式。它看起来简短而简洁，如果你已经习惯了用它，那么你就会知道它的含义。这是将任何值转换为布尔值的捷径。尤其是在代码库中，当虚假值（例如 null、undefined 和''）之间没有明确的语义分隔时。 
  
  为什么应该纠正它 
  
 像许多快捷方式和入门仪式一样，使用!! 会混淆代码的真实含义。这使得代码库对于新开发人员来说用起来更麻烦，不管新人是代码新手还是说只是 JavaScript 新手都一样。引入细微的错误也很容易。用!! 时。“非布尔布尔检查”的 countOfNewMessages 为 0 的问题仍然存在。 
  
  10. != null 
  
  
  具体是什么意思 
  
 
   bang bang 运算符的小姐妹!= null 允许我们同时检查 null 和 undefined。 
   
  
  
   
 ```java 
  function createNewMessagesResponse (countOfNewMessages?: number) {if (countOfNewMessages != null) {return `You have ${countOfNewMessages} new messages`}return 'Error: Could not retrieve number of new messages'}
  ``` 
  
  
  
  应该怎么做 
   
  
 
   明确检查我们关心的状况。 
   
  
  
   
 ```java 
  function createNewMessagesResponse (countOfNewMessages?: number) {if (countOfNewMessages !== undefined) {return `You have ${countOfNewMessages} new messages`}return 'Error: Could not retrieve number of new messages'}
  ``` 
  
  
  
  我们为什么养成了这样的习惯 
   
  
 如果到了这一步，就意味着你的代码库和技能已经处于良好状态。甚至大多数在!= 上强制使用!== 的 linting 规则集都可以豁免!= null。如果代码库在 null 和 undefined 之间没有明显的区别，则!= null 有助于简化对这两种可能性的检查。 
  
  为什么应该纠正它 
  
 尽管 null 值在 JavaScript 的早期很麻烦，但在 TypeScript 的 strict 模式下，它们却可以成为这种语言工具带中的宝贵成员。我看到的一个常见模式是将 null 值定义为不存在的事物，而 undefined 定义为不未知的事物，例如 user.firstName === null 可能意味着用户实际上没有名字，而 user.firstName === undefined 只是意味着我们还没有要求该用户提供名字（而 user.firstName === ''会意味着名字是''——现实中存在的名字之多会让你大吃一惊）。 
 
本文分享自微信公众号 - 前端研究所（WEBqdyjs）。如有侵权，请联系 support@oschina.cn 删除。本文参与“OSC源创计划”，欢迎正在阅读的你也加入，一起分享。
                                        