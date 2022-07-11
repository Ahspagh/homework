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