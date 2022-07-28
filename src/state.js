import { observe } from "./observer/index";
import { isFunction } from "./utils";

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
  }
}

/**
 * 
 * @param {*} vm vue实例
 * @param {*} target 去哪里取值
 * @param {*} key key值
 */
function proxy(vm,target,key){
  // vm上定义key, vm.xxx的时候帮我们从vm._data.xxx中获取
  Object.defineProperty(vm,key,{
    get(){
      return vm[target][key]
    },
    set(newVal){
      vm[target][key] = newVal
    }
  })
}

function initData(vm) {
  let data = vm.$options.data;
  data = vm._data = isFunction(data) ? data.call(this) : data;
  // 代理取值
  for (const key in data) {
    proxy(vm,'_data',key)
  }
  // 数据观测
  observe(data);
}
