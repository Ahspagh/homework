## 简答题

**1、谈谈你对工程化的初步认识，结合你之前遇到过的问题说出三个以上工程化能够解决问题或者带来的价值。**

答:
  工程化是根据业务特点将前端开发流程规范化，标准化。包括工作流、技术选型、代码规范、构建发布等，一切有利于提高效率，降低成本，保障质量为目的的手段都属于工程化。


创建项目：指定项目结构，创建特定类型文件　
编码：格式化代码、校验代码风格、编译构建与打包、
开发调试： 热更新 sourcemap mock接口
提交维护：Git Hooks Lint-staged 持续集成
部署上线 :CI/CD 自动发布

　

**2、你认为脚手架除了为我们创建项目结构，还有什么更深的意义？**

答:

　脚手架工具的本质作用：创建项目基础结构，提供项目规范与约定
如：
相同的组织结构
相同的开发范式
相同的模块依赖
相同的工具配置
相同的基础代码

脚手架能快速实现项目启动初期的大量重复工作，尽快完成开发需要的项目骨架，最后基于这个骨架完成开发工作

　

## 编程题

**1、概述脚手架实现的过程，并使用 NodeJS 完成一个自定义的小型脚手架工具**

　功能说明：会自动询问一些预设的问题，然后将回答的结果结合一些模板文件生成一个项目的结构。
步骤：
1.创建项目目录：初始化package.json

```shell
mkdir sample-scaffolding
cd sample-scaffolding
npm init -y
```

2.在package.json中添加 bin 字段，用于指定 CLI 应用的入口文件

```json
{
...
"bin":"cli.js"
...
}
```

3.添加 cli.js 文件，并添加文件头

```js
#!/user/bin/env node
chmod 755 cli.js //如果操作系统为Linux或macOS还需要修改文件的读写权限为755
```

4.实现脚手架具体业务 

- 通过命令行交互询问用户问题

- 根据用户回答的结果生成文件 （使用inquirer模块）

- 通过模板引擎ejs渲染文件 （使用ejs模块）

- 创建模板目录templates 将项目文件导入到目录中

  ```shell
  npm install inquirer ejs
  ```

```js
#!/user/bin/env node


const fs = require('fs')
const path = require('path')
const inquirer = require('inquirer')
const ejs = require('ejs')

// prompt()发起命令行的询问 可接收一个数组参数
inquirer.prompt([
  { // 每一个成员即为一个问题
    type: 'input', // 问题输入方式
    name: 'name', // 问题返回值的键
    message: 'Project name?' // 终端给出的提示
  }
])
  .then(anwsers => {
    // 根据用户回答的结果生成文件

    // 模板目录
    const tmplDir = path.join(__dirname, 'templates')
    // 目标目录
    const destDir = process.cwd()

    // 将模板下的文件全部转换到目标目录
    fs.readdir(tmplDir, (err, files) => {
      if (err) throw err
      files.forEach(file => {
        // 通过模板引擎提供的rendFile()渲染文件
        // 参数 文件的绝对路径 模板引擎工作的数据上下文 回调函数
        ejs.renderFile(path.join(tmplDir, file), anwsers, (err, result) => {
          if (err) throw err
          // 将结果写入目标文件路径
          fs.writeFileSync(path.join(destDir, file), result)
        })
      })
    })
  })
```

5.将此模块链接到全局范围，使之成为一个全局模块包

```shell
npm link
```

10.在新的工作目录中使用脚手架命令

```
sample-scaffolding
```

**2、尝试使用 Gulp 完成项目的自动化构建**  ( **[先要作的事情](https://gitee.com/lgtcd/fed-e-questions/blob/master/part2/%E4%B8%8B%E8%BD%BD%E5%8C%85%E6%98%AF%E5%87%BA%E9%94%99%E7%9A%84%E8%A7%A3%E5%86%B3%E6%96%B9%E5%BC%8F.md)** )

(html,css,等素材已经放到code/pages-boilerplate目录)

1.添加Gulp模块

```shell
npm install gulp --dev
```
2.在项目根目录下添加gulpfile.js入口文件

```shell
code gulpfile.js
```
3.添加项目中需要使用到的插件

>1.）使用 gulp-load-plugins 插件批量引入package.json文件中的依赖项工具，从而不必在gulfile.js中手动引入每个gulp插件
```shell
npm install gulp-load-plugins --dev
```
>2.）使用 gulp-sass 插件编译 scss 文件，将 scss 转换为 css；后续我们将使用 gulp-clean-css 插件，对 css 文件进行压缩
```shell
npm install gulp-sass --dev
npm gulp-clean-css --dev
```
```js
const style = () => {
  // 通过src的选项参数base来确定转换过后的基准路径
  return src('src/assets/styles/*.scss', { base: 'src' })
    .pipe(plugins.sass({ outputStyle: 'expanded' })) // 完全展开构建后的代码
    .pipe(dest('temp'))
}
```
>3.）使用 gulp-babel、 @babel/core、 @babel/preset-env 插件编译 js 文件，将 es6 转换为 es5；后续我们将使用 gulp-uglify 插件，对 js 文件进行压缩
```shell
npm install gulp-babel @babel/core @babel/preset-env --dev
npm install gulp-uglify --dev
```
```js
const script = () => {
  return src('src/assets/scripts/*.js', { base: 'src' })
     // 只是去唤醒babel/core这个模块当中的转换过程
     // babel作为一个平台不做任何事情，只是提供一个环境
     // presets 就是插件的集合
    .pipe(plugins.babel({ presets: ['@babel/preset-env'] }))
    .pipe(dest('temp'))
}
```
>4.）使用 gulp-swig 插件编译 html 文件，并将数据对象中的变量注入模板，设置不缓存页面；后续我们将使用 gulp-htmlmin 插件，对 html 文件进行压缩
```
npm install gulp-swig --dev
npm install gulp-htmlmin --dev
```
```js
const page = () => {
  return src('src/*.html', { base: 'src' })
    .pipe(plugins.swig({ data: data, defaults: { cache: false } }))  // 编译html，并将数据对象中的变量注入模板，不缓存
    .pipe(dest('temp'))
}
```
>5.）使用 gulp-imagemin 插件将图片文件和字体文件进行压缩
```
npm install gulp-imagemin --dev
```
```js
const image = () => {
  return src('src/assets/images/**', { base: 'src' })
    .pipe(plugins.imagemin())
    .pipe(dest('dist'))
}

const font = () => {
  return src('src/assets/fonts/**', { base: 'src' })
    .pipe(plugins.imagemin())
    .pipe(dest('dist'))
}
```
>6.）我们在编译前，使用 del 插件将原先编译后的文件目录删除
```
npm install del --dev
```
```js
const clean = () => {
  return del(['dist', 'temp'])
}
```

>7.）当代码修改并保存，使用 browser-sync 插件使浏览器热更新，提高我们的开发效率
```
npm install browser-sync --dev
```
```js
const serve = () => {
  watch('src/assets/styles/*.scss', style)
  watch('src/assets/scripts/*.js', script)
  watch('src/*.html', page)
  // watch('src/assets/images/**', image)
  // watch('src/assets/fonts/**', font)
  // watch('public/**', extra)
  watch([
    'src/assets/images/**',
    'src/assets/fonts/**',
    'public/**'
  ], bs.reload)

  bs.init({
    notify: false, // 是否提示
    port: 2080, // 端口
    open: true, // 自动打开页面 默认true
    files: 'temp/**', // 启动后自动监听的文件
    server: { 
      baseDir: ['temp', 'src', 'public'],
      routes: { // 优先于baseDir
        '/node_modules': 'node_modules'
      }
    }
  })
}
```
>8.）使用 gulp-useref 插件可以将 HTML 引用的多个 CSS 和 JS 合并起来，减小依赖的文件个数，从而减少浏览器发起的请求次数。gulp-useref 根据注释将 HTML 中需要合并压缩的区块找出来，对区块内的所有文件进行合并。需要注意的是，gulp-useref只负责合并，不负责压缩
```
npm install gulp-useref --dev
```
```js
const useref = () => {
  return src('dist/*.html', { base: 'dist' })
    .pipe(plugins.useref({ searchPath: ['dist', '.'] }))
    .pipe(dest('dist'))
}
```
>9.)使用 gulp-if 插件来判断读取流文件类型，并压缩对应文件
```
npm install gulp-if --dev
```
```js
const useref = () => {
  return src('temp/*.html', { base: 'temp' })
    .pipe(plugins.useref({ searchPath: ['temp', '.'] }))
    // html js css三种流
    // 压缩js文件
    .pipe(plugins.if(/\.js$/, plugins.uglify()))
    // 压缩css文件
    .pipe(plugins.if(/\.css$/, plugins.cleanCss()))
    // 压缩html文件
    .pipe(
      plugins.if(/\.html$/,plugins.htmlmin({ // 默认只压缩空白字符
          collapseWhitespace: true,
          minifyCSS: true,
          minifyJS: true
        })))
    .pipe(dest('dist'))
}
```
4.在gulpfile.js中定义构建任务
```js
// 实现这个项目的构建任务

const { src, dest, parallel, series, watch } = require('gulp')

const del = require('del')
const browserSync = require('browser-sync')

const loadPlugins = require('gulp-load-plugins')

const plugins = loadPlugins()
const bs = browserSync.create()

const data = {
  menus: [
    {
      name: 'Home',
      icon: 'aperture',
      link: 'index.html'
    },
    {
      name: 'Features',
      link: 'features.html'
    },
    {
      name: 'About',
      link: 'about.html'
    },
    {
      name: 'Contact',
      link: '#',
      children: [
        {
          name: 'Twitter',
          link: 'https://twitter.com/w_zce'
        },
        {
          name: 'About',
          link: 'https://weibo.com/zceme'
        },
        {
          name: 'divider'
        },
        {
          name: 'About',
          link: 'https://github.com/zce'
        }
      ]
    }
  ],
  pkg: require('./package.json'),
  date: new Date()
}

const clean = () => {
  return del(['dist', 'temp'])
}

const style = () => {
  // 通过src的选项参数base来确定转换过后的基准路径
  return src('src/assets/styles/*.scss', { base: 'src' })
    .pipe(plugins.sass({ outputStyle: 'expanded' })) // 完全展开构建后的代码
    .pipe(dest('temp'))
}

const script = () => {
  return src('src/assets/scripts/*.js', { base: 'src' })
     // 只是去唤醒babel/core这个模块当中的转换过程
     // babel作为一个平台不做任何事情，只是提供一个环境
     // presets 就是插件的集合
    .pipe(plugins.babel({ presets: ['@babel/preset-env'] }))
    .pipe(dest('temp'))
}

const page = () => {
  return src('src/*.html', { base: 'src' })
    .pipe(plugins.swig({ data: data, defaults: { cache: false } }))  // 编译html，并将数据对象中的变量注入模板，不缓存
    .pipe(dest('temp'))
}

const image = () => {
  return src('src/assets/images/**', { base: 'src' })
    .pipe(plugins.imagemin())
    .pipe(dest('dist'))
}

const font = () => {
  return src('src/assets/fonts/**', { base: 'src' })
    .pipe(plugins.imagemin())
    .pipe(dest('dist'))
}

const extra = () => {
  return src('public/**', { base: 'public' })
    .pipe(dest('dist'))
}

const serve = () => {
  watch('src/assets/styles/*.scss', style)
  watch('src/assets/scripts/*.js', script)
  watch('src/*.html', page)
  // watch('src/assets/images/**', image)
  // watch('src/assets/fonts/**', font)
  // watch('public/**', extra)
  watch([
    'src/assets/images/**',
    'src/assets/fonts/**',
    'public/**'
  ], bs.reload)

  bs.init({
    notify: false, // 是否提示
    port: 2080, // 端口
    open: true, // 自动打开页面 默认true
    files: 'temp/**', // 启动后自动监听的文件
    server: { 
      baseDir: ['temp', 'src', 'public'],
      routes: { // 优先于baseDir
        '/node_modules': 'node_modules'
      }
    }
  })
}

const useref = () => {
  return src('temp/*.html', { base: 'temp' })
    .pipe(plugins.useref({ searchPath: ['temp', '.'] }))
    // html js css三种流
    // 压缩js文件
    .pipe(plugins.if(/\.js$/, plugins.uglify()))
    // 压缩css文件
    .pipe(plugins.if(/\.css$/, plugins.cleanCss()))
    // 压缩html文件
    .pipe(
      plugins.if(/\.html$/,plugins.htmlmin({ // 默认只压缩空白字符
          collapseWhitespace: true,
          minifyCSS: true,
          minifyJS: true
        })))
    .pipe(dest('dist'))
}

const compile = parallel(style, script, page)

// 上线之前执行的任务
const build = series(
  clean, 
  parallel(
    series(compile, useref), 
    image, 
    font, 
    extra
  )  
)

const develop = series(compile, serve)

module.exports = {
  clean,
  build,
  develop
}
```

　

　

## 说明：

本次作业中的编程题要求大家完成相应代码后

- 提交一个项目说明文档，要求思路流程清晰。
- 或者简单录制一个小视频介绍一下实现思路，并演示一下相关功能。
- 说明文档和代码统一提交至作业仓库。