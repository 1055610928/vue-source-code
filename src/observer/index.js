import { isObject } from "../utils";
import { arrayMethods } from "./array";
import { Dep } from "./dep";

// 如果给对象新增一个属性不会触发视图更新(给对象本身增加一个dep,dep中存watcher, 
// 如果增加一个属性后，就手动触发watcher更新)
class Observer {
  constructor(data) {
    data.__ob__ = this;

    // 给Observer实例添加dep属性
    this.dep = new Dep(); // 数据可能是数组可能是对象

    Object.defineProperty(data,'__ob__',{
        value: this,
        enumerable: false
    })

    if (Array.isArray(data)) {
        // 数组的变化触发视图更新？
      data.__proto__ = arrayMethods;
      this.observeArray(data);
    } else {
      this.walk(data);
    }
  }
  observeArray(data) {
    // 如果数组里面是对象类型，也做了观测， JSON.stringfy() 也做了收集依赖
    data.forEach((item) => {
      observe(item);
    });
  }
  walk(data) {
    Object.keys(data).forEach((key) => {
      defineReactive(data, key, data[key]);
    });
  }
}

// 数组套数组，进行依赖收集
function dependArray(value){
  for (let i = 0; i < value.length; i++) {
    let currentArray = value[i]; 
    currentArray.__ob__ && currentArray.__ob__.dep.depend();
    // 多维数组
    if(Array.isArray(currentArray)){
      dependArray(currentArray)
    }
  }
}

function defineReactive(data, key, value) {
  // childOb 获取的就是Observer实例，Observer实例身上有dep实例，dep在getter的时候收集依赖
  let childOb = observe(value);

  let dep = new Dep(); 
  Object.defineProperty(data, key, {
    get() {
      if(Dep.target){
        dep.depend()
        // childOb可能是数组可能是对象，对象也要收集依赖，后续写$set方法的时候需要触发它自己的更新操作
        if(childOb){ 
          // childOb存的是Observer实例，Observer身上有dep属性, 数组和对象都记录watcher
          // dep.depend收集watcher, 当数组更新的时候, dep.notify()通知watcher更新视图
          // 这里只是收集依赖只是收集了最外层的数组
          childOb.dep.depend()
          // 数组套数组的情况, 多维数组的情况也要进行依赖收集
          if(Array.isArray(value)){
            dependArray(value)
          }
        }
      }
      return value;
    },
    set(newValue) {
      // 设置的新值有可能还是对象
      if(newValue !== value){
        observe(value);
        value = newValue;
        dep.notify(); // 告诉当前的属性存放的watcher执行
      }
    },
  });
}

export function observe(data) {
  if (!isObject(data)) {
    return;
  }
  // data.__ob__ 代表已经被观测过了
  if (data.__ob__) {
    return data.__ob__;
  }
  // 创建一个观测者
  return new Observer(data);
}
