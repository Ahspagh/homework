/*
尽可能还原 Promise 中的每一个 API, 并通过注释的方式描述思路和原理.
*/

/* 1.Promise是一个类 执行类需要构造执行器(两个状态函数参数) 立即执行
   2.Promise有三种状态 pending=> fulfilled；pending=> rejected 变动后不可更改
   3.resolve函数改变状态为fulfilled rejected函数改变状态为rejected ,then方法是在原型链上
   4-1.异步回调情况，等待状态函数异步完成再执行回调，通过then等待状态下储存回调函数
   4-2.多次使用then添加处理函数
   4-3.then方法的链式调用： 通过状态函数参数来传递回调函数的返回值
                      如果返回值是promise对象 需要查看返回结果决定调用resolve还是reject
                      自循环链式调用报错 报错判断通过异步获取当前对象
   5.finally方法：无论结果状态如何都会执行并返回promise对象的函数，回调函数中不接受任何参数
   6.all方法接受iterable类型的promise输入返回promise对象，返回每一项输入回调处理的数组，等待所有都完成或第一个失败并抛出的是第一个错误信息
   7.race方法接受iterable类型的promise输入返回promise对象 只要有一个resolve 或者reject 便立即返回为Promise的状态
   */

const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'
class myPromise {
  constructor(executor) {
    try {
      executor(this.resolve, this.reject)
    } catch (error) {
      this.reject(error)
    }
  }
  status = PENDING
  value = undefined
  reason = undefined
  successCB = []
  failCB = []

  resolve = (value) => {
    if (this.status !== PENDING) return
    this.status = FULFILLED
    this.value = value
    // 异步完成后存在回调则调用
    while (this.successCB.length) this.successCB.shift()()
  }
  reject = (reason) => {
    if (this.status !== PENDING) return
    this.status = REJECTED
    this.reason = reason
    while (this.failCB.length) this.failCB.shift()()
  }
  then (successCB, failCB) {
    // 回调参数可选
    successCB = successCB ? successCB : (value) => value
    failCB = failCB
      ? failCB
      : reason => {
        throw reason
      }
    let thenPromise = new myPromise((resolve, reject) => {
      if (this.status === FULFILLED) {
        // 通过异步方式拿到thenPromise
        setTimeout(() => {
          try {
            let result = successCB(this.value)
            resolvePromise(thenPromise, result, resolve, reject)
          } catch (error) {
            reject(error)
          }
        }, 0)
      } else if (this.status === REJECTED) {
        setTimeout(() => {
          try {
            let result = failCB(this.reason)
            resolvePromise(thenPromise, result, resolve, reject)
          } catch (error) {
            reject(error)
          }
        }, 0)
      } else {
        // 等待异步结束时状态仍是pending储存回调函数
        // this.successCB.push(successCB)
        // this.failCB.push(failCB)
        // then链式调用返回值存在promise情况 ,直接异步处理返回值
        this.successCB.push(() => {
          setTimeout(() => {
            try {
              let result = successCB(this.value)
              resolvePromise(thenPromise, result, resolve, reject)
            } catch (error) {
              reject(error)
            }
          }, 0)
        })
        this.failCB.push(() => {
          setTimeout(() => {
            try {
              let result = failCB(this.reason)
              resolvePromise(thenPromise, result, resolve, reject)
            } catch (error) {
              reject(error)
            }
          }, 0)
        })
      }
    })
    return thenPromise
  }
  catch (callback) {
    return this.then(undefined, callback)
  }

  static all (array) {
    let result = []
    let index = 0
    return new myPromise((resolve, reject) => {
      function addData (key, value) {
        result[key] = value
        index++
        // 这里必须使用全等
        if (index === result.length) {
          resolve(result)
        }
      }
      for (let i = 0; i < array.length; i++) {
        let data = array[i]
        if (data instanceof myPromise) {
          data.then(
            value => {
              //存在异步将resolve放在最后一项
              addData(i, value)
            },
            reason => {
              reject(reason)
            }
          )
        } else {
          // 普通值直接返回
          addData(i, data)
        }
      }
    })
  }
  static resolve (value) {
    if (value instanceof myPromise) return value
    return new myPromise((resolve, reject) => {
      resolve(value)
    })
  }
  static reject (reason) {
    if (reason instanceof MyPromise) return reason;
    return new MyPromise((resolve, reject) => reject(reason));
  }
  finally (callback) {
    return this.then(
      value => { return myPromise.resolve(callback()).then(() => value) },
      reason => { return myPromise.resolve(callback()).then(() => { throw reason }) })
  }
  // 只要有一个成功或者失败就返回
  static race (array) {
    let promise = new myPromise((resolve, reject) => {
      for (let i = 0; i < array.length; i++) {
        let curr = array[i];
        if (curr instanceof myPromise) {
          curr.then(resolve, reject);
        } else {
          resolve(curr);
        }
      }
    });
    return promise;
  }
}
function resolvePromise (thenPromise, result, resolve, reject) {
  if (thenPromise === result)
    // 链式自循环抛出异常
    return reject(new TypeError('chaining cycle ! <#myPromise>'))
  if (result instanceof myPromise) {
    result.then(resolve, reject)
  } else {
    resolve(result)
  }
}

module.exports = myPromise
