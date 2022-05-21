/*
  将下面异步代码使用 Promise 的方法改进
  尽量用看上去像同步代码的方式
  setTimeout(function () {
    var a = 'hello'
    setTimeout(function () {
      var b = 'lagou'
      setTimeout(function () {
        var c = 'I ♥ U'
        console.log(a + b +c)
      }, 10)
    }, 10)
  }, 10)
*/

let a = '', b = '', c = ''
function step (str) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(str)
    }, 10);
  })
}
step('hello')
  .then(value => {
    a = value
    return step('lagou')
  }).then(value => {
    b = value
    return step('I ♥ U')
  }).then(value => {
    c = value
    console.log(a + b + c)
  })