// Objec.create 模拟
// function ObjectCreate(proto){
//     function F(){}
//     F.prototype = proto
//     return new F();
// }
let oldArrayPrototype = Array.prototype;
export let arrayMethods = Object.create(Array.prototype);
// arrayMethods.__proto__ = Array.prototype // 就是个继承

let methods = ["push", "pop", "shift", "unshift", "reverse", "sort", "splice"];
methods.forEach((method) => {
  // 用户调用的是以上的7个方法，会用我自己重写的，否则会用原来的
  arrayMethods[method] = function (...args) {
    // 相当于调用原来的push, this --> 谁调用就指向谁
    oldArrayPrototype[method].call(this, ...args);

    // args就是新增的内容
    // push splice unshift
    let inserted;
    let ob = this.__ob__ // 这里获取的就是Observer实例
    switch (method) {
      case "push":
        inserted = args
        break;
      case "splice":
        inserted = args.slice(2)
        break;
      case "unshift":
        inserted = args
        break;
    }
    // 如果有新增的内容，继续进行劫持
    // 需要观测数组中的每一项，而不是数组，
    // this是那个数组，index.js文件中的也是那个数组
    if(inserted){
        ob.observeArray(inserted)
    }
  };
});
