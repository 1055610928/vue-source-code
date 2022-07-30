import { isObject } from "../utils";
import { arrayMethods } from "./array";
import { Dep } from "./dep";

class Observer {
  constructor(data) {
    // this指向Observer实例
    // data.__ob__ 等于当前的Observer实例
    // 所有被劫持的属性都有__ob__
    // data.__ob__ 在这里会被不停的观测
    // 将data.__ob__ 变成不可枚举的属性
    data.__ob__ = this;
    Object.defineProperty(data,'__ob__',{
        value: this,
        enumerable: false
    })

    if (Array.isArray(data)) {
      // 数组劫持的逻辑，对数组原来的方法进行改写，切片编程
      // console.log(arrayMethods) // Object.create(Array.prototype)
      // 如果数组中的数据是对象类型，需要监控对象的变化
      data.__proto__ = arrayMethods;
      // 数组中的对象进行劫持
      this.observeArray(data);
    } else {
      // 对象劫持的逻辑
      this.walk(data);
    }
  }
  // 数组观测
  observeArray(data) {
    // 对数组中数组 或者是 数组中的对象再次劫持，递归
    data.forEach((item) => {
      observe(item);
    });
  }
  // walk --> 走，步行
  walk(data) {
    // Object.keys不会遍历到原型链，取到的都是私有属性
    Object.keys(data).forEach((key) => {
      defineReactive(data, key, data[key]);
    });
  }
}

function defineReactive(data, key, value) {
  observe(value);
  let dep = new Dep(); // 每个属性都会有自己的dep
  Object.defineProperty(data, key, {
    get() {
      // watcher和 Dep 对应
      // Dep.target 如果有值说明用户在模板中取值了
      if(Dep.target){
        // 让dep记住watcher
        dep.depend()
      }
      return value;
    },
    set(newValue) {
      // 设置的新值有可能还是对象
      observe(value);
      value = newValue;
    },
  });
}

export function observe(data) {
  if (!isObject(data)) {
    return;
  }
  // data.__ob__ 代表已经被观测过了
  if (data.__ob__) {
    return;
  }
  // 创建一个观测者
  return new Observer(data);
}
