import { observe } from "./observer/index";
import Watcher from "./observer/watcher";
import { isFunction } from "./utils";

export function stateMxin(Vue){
  Vue.prototype.$watch = function(key,handler,options={}){
    options.user = true; // 用户自己写的watcher, 要和渲染watcher区分开
    // vm,exprOrfn,cb,options
    const vm = this;
    // vm, name, 用户回调, options.user
    let watcher = new Watcher(vm,key,handler,options)
    // 看是不是立即执行，是则直接调用handler 返回watcher中的value,
    // 第一次执行只有新值
    if(options.immediate){
      handler(watcher.value) 
    }
  }
}

export function initState(vm) {
  // 状态的初始化
  const options = vm.$options;
  // props在data之前
  if (options.props) {
  }

  if (options.methods) {
  }

  if (options.data) {
    initData(vm);
  }
  if (options.computed) {
  }

  if (options.watch) {
    // 用户有watch的时候初始化watch
    initWatch(vm, options.watch);
  }
}

/**
 *
 * @param {*} vm vue实例
 * @param {*} target 去哪里取值
 * @param {*} key key值
 */
function proxy(vm, target, key) {
  // vm上定义key, vm.xxx的时候帮我们从vm._data.xxx中获取
  Object.defineProperty(vm, key, {
    get() {
      return vm[target][key];
    },
    set(newVal) {
      vm[target][key] = newVal;
    },
  });
}

function initData(vm) {
  let data = vm.$options.data;
  data = vm._data = isFunction(data) ? data.call(this) : data;
  // 代理取值
  for (const key in data) {
    proxy(vm, "_data", key);
  }
  // 数据观测
  observe(data);
}

// 初始化watch
function initWatch(vm, watch) {
  for (const key in watch) {
    const handler = watch[key];
    if (Array.isArray(handler)) {
      // 看是不是数组
      for (let i = 0; i < handler.length; i++) {
        // handler[i] // 每一个handler函数
        createWatcher(vm, key, handler[i]);
      }
    } else {
      // handler  // hander函数
      createWatcher(vm, key, handler);
    }
  }
}

function createWatcher(vm,key,handler) {
  return vm.$watch(key,handler)
}
