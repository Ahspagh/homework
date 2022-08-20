## 简答题

#### 1、Vue 3.0 性能提升主要是通过哪几方面体现的？

- 响应式系统
- 编译优化
- 源码体积优化

响应式系统从vue2.x中的defineProperty改为使用proxy对象来实现

- proxy对象的性能本身就更好，且代理对象可以拦截属性的访问、赋值、删除等操作，不需要初始化时遍历所有属性，如果有多层属性嵌套只有访问到某个属性时才会递归处理下一级属性
- 使用proxy对象可以监听到动态新增的属性，而vue2.x时需要使用vue.set方法来处理
- vue2.x监听不到属性的删除，数组的索引和length属性也监听不到

编译优化

- vue2.x模板需要首先编译程render函数，这个过程一般在构建时完成，在编译时会编译静态根节点和静态节点，静态根节点要求必须有一个静态子节点；当组件的状态发生变化后会通知watcher出发update去执行虚拟DOM的patch操作，遍历所有虚拟节点中差异更新到真实DOM上，diff过程会去比较整个虚拟DOM，先对比新旧静态节点以及属性，再去对比内部子节点
- vue2.x中渲染的最小单位是组件，diff过程会跳过静态根节点，因为静态根节点内容不会变化，即通过后标记静态根节点优化diff过程，但静态节点本身还需要diff操作
- vue3标记和提升了所有的静态根节点，diff只会对比动态节点内容
  - fragments（vetur插件需要升级）：模板不再需要唯一根节点，可以直接使用文本内容或多个同级标签
  - 静态提升
  - patch flag
  - 缓存事件处理函数

优化打包体积

- 　Tree-shaking ( ESM 的引入方式,实现模块按需打包)
- 移除不常用API 如filter inline-template等

#### 2、Vue 3.0 所采用的 Composition Api 与 Vue 2.x使用的Options Api 有什么区别？

　Options API :

- 包含一个描述组件的选项（data、methods，props等）的对象
- 当开发复杂组件，同个功能逻辑的代码会被拆分到不同选项

Composition API：

- 属于vue3新增的一组API
- 函数式API
- 可以更灵活地组织组件中不同功能的逻辑代码

相对好处是同属于某一功能的代码会集中在某一模块范围内，逻辑代码与相应变量更为集中，且在vue3中同时兼容Options API

#### 3、Proxy 相对于 Object.defineProperty 有哪些优点？

- 　Object.defineProperty()只能监听属性的读写，而proxy对象能监听更多，handle函数更为强大



| handler方法              | 触发方式                                                     |
| ------------------------ | ------------------------------------------------------------ |
| get                      | 读取属性                                                     |
| set                      | 写入属性                                                     |
| has                      | in 操作符                                                    |
| getProperty              | Object.getPropertypeOf()                                     |
| setProperty              | Object.setPrototypeOf()                                      |
| isExtensible             | Object.isExtensible()                                        |
| preventExtensions        | Object.preventExtensions()                                   |
| getOwnPropertyDescriptor | Object.getOwnpropertyDescriptor()                            |
| defineProperty           | Object.defineProperty()                                      |
| ownKeys                  | Object.keys() 、Object.getOwnpropertyNames() 、Object.getOwnPropertySymbols() |
| apply                    | 调用函数                                                     |
| construct                | 使用new 调用函数                                             |

- 　proxy对象更好的支持数组对象的监视


- 　proxy是以非侵入的方式监管了对象的读写
  - 对于已经定义好的对象，不需要对对象本身做任何操作就可以监视到内部成员的读写。而Object.defineProperty()就要求我们必须通过特定方式**单独**定义被监视的属性

#### 4、Vue 3.0 在编译方面有哪些优化？

　vue3标记和提升了所有的静态根节点，diff只会对比动态节点内容

- fragments（vetur插件需要升级）：模板不再需要唯一根节点，可以直接使用文本内容或多个同级标签
- 静态提升
- patch flag
- 缓存事件处理函数

#### 5、Vue.js 3.0 响应式系统的实现原理？

　vue3相对vue2的响应式系统底层采用proxy对象实现。在初始化时候不需要遍历所有属性，再把属性通过defineProperty转换成getter和setter

多层嵌套时只有在访问某一属性时才会递归处理下一级属性，所以响应式系统性能更好

默认监听动态添加的属性

默认监听属性的删除属性

默认监听数组索引和length属性

可以作为单独的模块使用 　Tree-shaking



**核心方法：**

- reactive/ref/toRefs/computed
- effect
- track
- trigger

> watch/watchEffect 是 Vue3 的 runtime.core 中实现的，watch 函数的内部其实实现了一个底层函数 effect
>

　

　