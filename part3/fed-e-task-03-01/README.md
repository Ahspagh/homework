## 一、简答题

### 1、当我们点击按钮的时候动态给 data 增加的成员是否是响应式数据，如果不是的话，如何把新增成员设置成响应式数据，它的内部原理是什么。

```js
let vm = new Vue({
 el: '#el'
 data: {
  o: 'object',
  dog: {}
 },
 method: {
  clickHandler () {
   // 该 name 属性是否是响应式的
   this.dog.name = 'Trump'
  }
 }
})
```

 　这里创建的name属性不是响应式数据

响应式对象和响应式数组是指在vue初始化时期，利用Object.defineProperty()方法对其监听，这样才能实现修改数据及时体现在视图上，而当Vue实例化完成后，再添一个成员到对象上仅是在vm上增加一个JS属性，因此没有响应式。

Vue官方文档中已经给出了解决方案：

> 　对于已经创建的实例，Vue不允许动态添加根级别的响应式属性。但是可以使用 `Vue.set(object, propertyName, value)`方法向嵌套对象添加响应式属性。您还可以使用`vm.$set`实例方法，这也是全局`Vue.set`方法的别名。

可以使用this.$set  或初始化设置默认属性name来添加响应式数据



Vue.set 内部原理：

- 源码位置: vue/src/core/observer/index.js

```js
export function set (target: Array<any> | Object, key: any, val: any): any {
  ...
  // 判断当前target是不是数组，并且key的值是有效的数组索引
  // 这块代码意思是在修改数组时调用set方法时让我们能够触发响应的代码
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    // 类似$vm.set(vm.$data.arr, 0, 3)
    // 修改数组的长度, 避免索引>数组长度导致splcie()执行有误
    target.length = Math.max(target.length, key)
    // 利用数组的splice变异方法触发响应式
    target.splice(key, 1, val)
    return val
  }
  // target为对象, key在target或者target.prototype上。
  // 并且key不是Object原型上的属性
  // 说明这个key本来就在对象上面已经定义过了的，直接修改值就可以了，可以自动触发响应
  if (key in target && !(key in Object.prototype)) {
    target[key] = val
    return val
  }
  // 以上都不成立, 即开始给target创建一个全新的属性
  // vue给响应式对象都加了一个__ob__属性，如果一个对象有这个__ob__属性，
  // 那么就说明这个对象是响应式对象，我们修改对象已有属性的时候就会触发页面渲染
  // 获取Observer实例
  const ob = (target: any).__ob__
  // Vue 实例对象拥有 _isVue 属性, 即不允许给 Vue 实例对象添加属性
  // 也不允许Vue.set/$set 函数为根数据对象(vm.$data)添加属性
  // 即 当前的target对象是vue实例对象或者是根数据对象，那么就会抛出错误警告
  if (target._isVue || (ob && ob.vmCount)) {
    process.env.NODE_ENV !== 'production' && warn(
      'Avoid adding reactive properties to a Vue instance or its root $data ' +
      'at runtime - declare it upfront in the data option.'
    )
    return val
  }
  // target本身就不是响应式数据, 不需要响应，那么直接赋值返回即可
  if (!ob) {
    target[key] = val
    return val
  }
  // 进行响应式处理
  // 给新加的属性添加依赖，以后再直接修改这个新的属性的时候就会触发页面渲染
  defineReactive(ob.value, key, val)
  // 触发当前的依赖（这里的依赖依然可以理解成渲染函数），所以页面就会进行重新渲染
  ob.dep.notify()
  return val
}
```



### 2、请简述 Diff 算法的执行过程

　diff的过程就是调用patch函数，通过比较虚拟DOM的新旧节点来给真实DOM打补丁的过程。

patch函数接受两个参数，oldVnode和 vnode)分别代表新旧节点，这个函数sameVnode(oldVode,vnode)会比较他们是否相同 

1. 旧节点不存在，则直接添加新节点到父元素

2. 新节点不存在，则从父元素删除老节点

3. 当新旧节点都存在

   3.1 判断是否是相同节点（根据key、tag、isComment 、data 同时定义或不定义）相同直接返回，不同节点若新老节点都是静态的且key相同，则直接拿来老节点跳过对比过程。

   如果新节点是文本节点，设置节点text，新节点不是文本节点且新老*子节点*存在且不同，使用updateChildren函数来更新子节点

   只有新节点子节点存在，如果老节点子节点是文本节点，那么删除节点文本，插入新节点子节点

   只有老节点存在子节点，删除老节点子节点

   3.2 updateChildren

   定义新老节点的开始与结束索引

   ​	循环对比 新节点开始-老节点开始、新节点结束-老节点结束、新节点开始-老节点结束、新节点结束-老节点结束、并移动相应的索引，向中间靠拢根据新节点的key在老节点中查找，没有找到则创建新节点。

   ​	循环结束后，如有老节点剩余则删除，如新节点剩余则添加。

   

   

   

　



 

## 二、编程题

### 1、模拟 VueRouter 的 hash 模式的实现，实现思路和 History 模式类似，把 URL 中的 # 后面的内容作为路由的地址，可以通过 hashchange 事件监听路由地址的变化。

 　

```js
let _Vue = null

export default class VueRouter {
  static install (Vue) {
    // 1.判断当前插件是否已经被安装
    // 如果插件已经安装直接返回
    if (VueRouter.install.installed && _Vue === Vue) return
    VueRouter.install.installed = true
    // 2.把 Vue 构造函数记录到全局变量
    _Vue = Vue
    // 3.把创建 Vue 实例时候传入的 router 对象注入到 Vue 实例上
    // 混入
    _Vue.mixin({
      beforeCreate () {
        // 判断 router 对象是否已经挂载了 Vue 实例上
        if (this.$options.router) {
          // 把 router 对象注入到 Vue 实例上
          _Vue.prototype.$router = this.$options.router
          this.$options.router.init()
        }
      }
    })
  }

  constructor (options) {
    this.options = options
    // 记录路径和对应的组件
    this.routeMap = {}
    this.data = _Vue.observable({
      // 当前的默认路径
      current: '/'
    })
  }

  init () {
    this.createRouteMap()
    this.initComponents(_Vue)
    this.initEvent()
  }

  createRouteMap () {
    // routes => [{ name: '', path: '', component: }]
    // 遍历所有的路由信息，记录路径和组件的映射
    this.options.routes.forEach(route => {
      // 记录路径和组件的映射关系
      this.routeMap[route.path] = route.component
    })
  }

  initComponents (Vue) {
    _Vue.component('router-link', {
      // 接收外部传入的参数
      props: {
        to: String
      },
      // 使用运行时版本的 Vue.js
      // 此时没有编译器 直接来写一个 render函数
      render (h) { // 参数 h 创建虚拟DOM render函数中调用h函数并将结果返回
        // h函数 接收三个参数
        return h('a', { // 1. 创建的元素对应的选择器
          attrs: { // 2. 给标签设置属性 attes 指明DOM对象属性
            // history
            // href: this.to
            // hash
            href: '#' + this.to
          },
          on: { // 给 a标签 注册点击事件
            click: this.clickhander
          }
        }, [this.$slots.default]) // 3. 生成元素的子元素
      },
      methods: {
        clickhander (e) { // 时间参数 e
          // 改变浏览器地址栏 pushiState 不向服务器发送请求
          // history
          // history.pushState({}, '', this.to) // data title url
          // hash
          window.location.hash = '#' + this.to
          this.$router.data.current = this.to // 响应式对象data
          e.preventDefault() // 阻止事件默认行为
        }
      }
      // template: '<a :href="to"><slot></slot></a>'
    })

    const self = this // 保存 this
    _Vue.component('router-view', {
      render (h) {
        // 根据当前路径找到对应的组件，注意 this 的问题
        const component = self.routeMap[self.data.current]
        return h(component) // 将组件转换为虚拟DOM返回
      }
    })
  }

  // initEvent () {
  //   window.addEventListener('popstate', () => {
  //     this.data.current = window.location.pathname
  //   })
  // }

  // 监听页面 load 和 hashchange 方法，在这个地方有个判断
  // 如果当前页面的 hash 不存在，则自动加上 '#/' ,并加载 '/' 的组件
  initEvent () {
    window.addEventListener('load', this.hashChange.bind(this))
    window.addEventListener('hashchange', this.hashChange.bind(this))
  }

  hashChange () {
    if (!window.location.hash) {
      window.location.hash = '#/'
    }
    this.data.current = window.location.hash.substr(1)
  }
}
```

　

### 2、在模拟 Vue.js 响应式源码的基础上实现 v-html 指令，以及 v-on 指令。

 　

　v-html 指令

* 与 v-text 指令相似，将 textContent 更改为 innerHTML

   v-on 指令

- 在 vue.js 文件 添加变量 `methods`，把事件注入到 vue 实例

- ```js
  class Vue {
      constructor(options) {
          // 1、通过属性保存选项的数据
          this.$options = options || {}
          this.$data = options.data || {}
          this.$methods = options.methods || {}
          this.$el = typeof options.el === 'string' ? document.querySelector(options.el) : options.el
              // 2、把 data 中的成员转换成 getter 和 setter,并注入到 vue 实例中
          this._proxyData(this.$data)
              // 把 methods 中的成员注入到 vue 实例中 
          this._proxyMethods(this.$methods)
              // 3、调用 observer 对象，监听数据的变化
          new Observer(this.$data)
              // 4、调用 compiler 对象，解析指令和插值表达式
          new Compiler(this)
      }
      _proxyData(data) {
          // 遍历 data 中的所有属性
          Object.keys(data).forEach(key => {
              // 把 data 的属性注入到 vue 实例中
              Object.defineProperty(this, key, {
                  enumerable: true,
                  configurable: true,
                  get() {
                      return data[key]
                  },
                  set(newValue) {
                      if (newValue !== data[key]) {
                          data[key] = newValue
                      }
                  }
              })
          })
      }
      _proxyMethods(methods) {
          Object.keys(methods).forEach(key => {
              // 把 methods 的成员注入到 vue 实例中
              this[key] = methods[key]
          })
      }
  }
  ```

  

- 在 compiler.js文件 将` on:` 修改为空 只保留后面的事件 再处理相应指令

```js
class Compiler {
    constructor(vm) {
            this.el = vm.$el
            this.vm = vm
            this.compile(this.el)
        }
        // 编译模板，处理文本节点和元素节点
    compile(el) {
            let childNodes = el.childNodes
            Array.from(childNodes).forEach(node => {
                if (this.isTextNode(node)) {
                    // 处理文本节点
                    this.compileText(node)
                } else if (this.isElementNode(node)) {
                    // 处理元素节点
                    this.compileElement(node)
                }
                // 判断 node 节点，是否有子节点，如果有子节点，要递归调用 compile
                if (node.childNodes && node.childNodes.length) {
                    this.compile(node)
                }
            })
        }
        // 编译元素节点，处理指令
    compileElement(node) {
            // 遍历所有的属性节点
            Array.from(node.attributes).forEach(attr => {
                // 判断是否是指令
                let attrName = attr.name
                if (this.isDirective(attrName)) {
                    // v-text --> text
                    attrName = attrName.substr(2)
                    let key = attr.value
                    if (attrName.startsWith('on')) {
                        const event = attrName.replace('on:', '') // 获取事件名
                            // 事件更新
                        return this.eventUpdate(node, key, event)
                    }
                    this.update(node, key, attrName)
                }
            })
        }
        // 编译文本节点，处理插值表达式
    compileText(node) {
        let reg = /\{\{(.+?)\}\}/
        let value = node.textContent
        if (reg.test(value)) {
            let key = RegExp.$1.trim()
            node.textContent = value.replace(reg, this.vm[key])
                // 创建 watcher 对象，当数据改变时更新视图
            new Watcher(this.vm, key, (newValue) => {
                node.textContent = newValue
            })
        }

    }
    update(node, key, attrName) {
        let updateFn = this[attrName + 'Updater']
        updateFn && updateFn.call(this, node, this.vm[key], key)
    }
    eventUpdate(node, key, event) {
        this.onUpdater(node, key, event)
    }


    // 处理 v-text 指令
    textUpdater(node, value, key) {
            node.textContent = value
            new Watcher(this.vm, key, (newValue) => {
                node.textContent = newValue
            })
        }
        // 处理 v-html 指令
    htmlUpdater(node, value, key) {
            node.innerHTML = value
            new Watcher(this.vm, key, (newValue) => {
                node.innerHTML = newValue
            })
        }
        // 处理 v-model 指令
    modelUpdater(node, value, key) {
            node.value = value
            new Watcher(this.vm, key, (newValue) => {
                    node.value = newValue
                })
                // 双向绑定
            node.addEventListener('input', () => {
                this.vm[key] = node.value
            })
        }
        // 处理 v-on 指令
    onUpdater(node, key, event) {
        node.addEventListener(event, (e) => this.vm[key](e))
    }



    // 判断元素属性是否是指令
    isDirective(attrName) {
            return attrName.startsWith('v-')
        }
        // 判断节点是否是文本节点
    isTextNode(node) {
            return node.nodeType === 3
        }
        // 判断节点是否是元素节点
    isElementNode(node) {
        return node.nodeType === 1
    }
}
```

