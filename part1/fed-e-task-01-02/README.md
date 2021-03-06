# Part1-2 作业

( 请在当前文件直接作答 )

## 简答题

### 1. 请说出下列最终执行结果，并解释为什么?

```javascript
var a = [];
for(var i = 0; i < 10; i++) {
  a[i] = function() {
    console.log(i)
  }
}
a[6]()
```

　for循环里的i是全局变量，循环执行结束后i变成10，所以无论调用第几个函数i都是10 所以结果是10

　

### 2. 请说出此案列最终执行结果，并解释为什么?

```javascript
var tmp = 123;
if (true) {
  console.log(tmp);
  let tmp;
}
```

　会报错，if代码块形成局部作用域，控制台输出寻找的tmp变量使用时并未定义，下面的let也不会变量提升所以无法找到。

　

### 3. 结合ES6语法，用最简单的方式找出数组中的最小值

```javascript
var arr = [12, 34, 32, 89, 4]
1. Math.min(...arr)
2. const arrayMax= arr=> arr.reduce((acc,item)=>acc<item?acc:item)

```

　

　

### 4. 请详细说明var、let、const三种声明变量的方式之间的具体差别

　let和const关键字为ES2015新特性，使用在局部作用域，不同于var，不会产生声明提升效果，所以必须在声明后再使用而且不能重复定义。let和var都可以均可以多次赋值以及仅声明不初始化赋值，const必须声明同时初始化，不可以再次赋值基本数据类型，引用数据类型，如对象属性和数组元素可以改变

　

### 5. 请说出下列代码最终输出结果，并解释为什么？

```javascript
var a = 10;
var obj = {
  a: 20,
  fn() {
    setTimeout(() => {
      console.log(this.a)
    })
  }
}
obj.fn()
```

　输出20

定时器函数使用的箭头函数不会改变this指向，所以此时this和fn函数相同都是指向obj。

　

### 6. 简述Symbol类型的用途

　1.symbol唯一性可以防止对象属性命名冲突

​	2.作为对象的属性，可以用做私有属性

​	3.代替常量

　

### 7. 说说什么是浅拷贝，什么是深拷贝？

　针对引用数据类型的拷贝如Object Array浅拷贝仅复制了目标的内存地址，而实际内存地址中的值并没有拷贝到新变量上，这就导致一单原数据发生改变，复制后的新变量也会发生变化。而深拷贝通过递归等遍历复制了所有原数据实际的值到新变量上，不会造成原数据改变复制数据也发生改变的情况　

### 8. 请简述TypeScript与JavaScript之间的关系？

　TS是JS的从超集，包含了ECMAscript的核心内容外还补充了类型机制，使JS成为基于静态类型检查的强类型语言

TS最终会编译成JS代码，可以在编译阶段发现并纠正错误，天生支持模块泛型接口等语法

　

### 9. 请谈谈你所认为的typescript优缺点

　优点：编译阶段就能发现并纠正错误，大型项目上更易维护，属于渐进式，使项目逐渐从JS过渡TS ，支持功能更健全更完善使代码可读性可维护性大幅提高

缺点：相比JS多了许多概念有一定学习成本，项目前期开发成本增加。仍处在发展期仍有许多库或者插件不支持TS

　

### 10. 描述引用计数的工作原理和优缺点

工作原理：设置引用数判断当前是否为0，引用关系改变时修改并触发和判断垃圾回收

　优点：可以即时的进行垃圾回收，最大限度减少程序暂停

缺点：无法回收循环引用的对象，监听和维护引用数时间开销大

### 11. 描述标记整理算法的工作流程

　1.遍历所有对象并标记活动对象

​    2.清除阶段会先进行整理过程：将活动对象移动到一起

​	3.清除没有标记的对象，并把第一次遍历所做的标记去除

​	4.移动后的清除空间地址连续，回收后方便后续申请空间的使用

   优点：减少了空间碎片化 缺点：和标记清除相同，不能立即进行垃圾回收

　

### 12.描述V8中新生代存储区垃圾回收的流程

　新生代区域一分为二，每个16M，一个使用FROM空间一个空闲TO空间，垃圾回收采用复制算法和标记整理算法。当FROM空间使用到一定大小后会触发标记整理，开始垃圾回收后复制活动对象到TO空间，然后释放FROM空间，然后两空间互换。当TO空间使用率达25%则出现晋升，即活动对象从新生代移入老生代。当一个对象多次垃圾回收后仍然活动该对象也会晋升。



　

### 13. 描述增量标记算法在何时使用及工作原理

　老生代的对象回收会使用到增量标记算法，因为老生代空间大，大部分都是活动对象，单次完整的GC过程（老生代采用标记清除算法，遍历对象标记）耗时较长，所以V8使用该优化方案来增量处理，即分割大暂停为小暂停拆分为多个小步骤，垃圾回收和程序执行交替进行。

　