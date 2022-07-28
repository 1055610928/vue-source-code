import { initState } from "./state";

// 表示在vue的基础上做一次混合的操作
export function initMixin(Vue){
    Vue.prototype._init = function(options){
        // el 和 data
        const vm = this;
        vm.$options = options // 后续对options进行扩展
            
        // 对数据进行初始化 watch,props,computed,data ...
        initState(vm); // vm.$options.data  vm.$options.computed ...
    }
}