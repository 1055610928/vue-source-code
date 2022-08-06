import { Dep } from "./observer/dep";
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
    initComputed(vm,options.computed)
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


// 初始化computed
function initComputed(vm,computed){ 
  const watcher = vm._computedWatchers = {}
  for (const key in computed) {
    // userDefine 这里取到的值有可能是对象有可能是函数
    const userDefine = computed[key];
    // 依赖的属性变化了就重新取值 (get)
    let getter = typeof userDefine === 'function'? userDefine : userDefine.get
    // 每个计算属性本质就是watcher
    // lazy:true 表示默认不执行 (computed中的函数默认不执行)
    // watcher[key] 每个属性对应一个watcher, watcher和属性 做一个映射
    // computed中有多少个计算属性，就有多少个watcher
    watcher[key] = new Watcher(vm,getter.bind(vm),()=>{},{lazy:true })
    // 将key 定义在vm上
    definedComputed(vm,key,userDefine)
  }
}

function definedComputed(vm,key,userDefine){
  let sharedProperty = {}
  // 判断userDefine是不是一个函数，
  // userDefine表示computed中定义的计算属性可能是函数，可能是对象
  if(typeof userDefine === 'function'){
    sharedProperty.get = userDefine
  }else{
    sharedProperty.get = createComputedGetter(key);
    sharedProperty.set = userDefine.set || (()=>{});
  }
  // computed就是一个defineProperty
  Object.defineProperty(vm,key, sharedProperty)
}

function createComputedGetter(key){
  // 取计算属性的值走的是这个函数
  return function computedGetter(){
    // this._computedWatchers包含所有的计算属性
    // 通过key可以拿到对应的watcher
    let watcher = this._computedWatchers[key]
    if(watcher.dirty){ // 根据diry属性，来判断是否需要重新求值
      // 如果这个 watcher.dirty 是脏的，就取一次值
      watcher.evaludate();
    } 
    // 如果当前取完值后，Dep.target还有值 需要继续向上收集
    if(Dep.target){
      // 让当前的计算属性也做一次依赖收集，Watcher里对应了多个dep
      // 计算属性watcher内部有两个dep，firstName和lastName
      watcher.depend(); 
    }
    // 缓存的值
    return watcher.value
  }
}