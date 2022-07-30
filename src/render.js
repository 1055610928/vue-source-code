import { createElement, createTextElement } from "./vdom/index"

export function renderMixin(Vue){
    // 元素，数据，孩子
    // createElement
    Vue.prototype._c = function(tagName,data,...children){
        const vm = this 
        return createElement(vm,...arguments)
    }
    // 文本
    // createTextElement
    Vue.prototype._v = function(text){
        const vm = this 
        return createTextElement(vm,text)
    }
    // 变量
    Vue.prototype._s = function(val){   
        return typeof val === 'object'? JSON.stringify(val):val
    }

    Vue.prototype._render = function(){
        
        const vm = this;

        // 这里的render就是挂载到用户选项上的render，同时也有可能是用户写的
        const render = vm.$options.render
        // 调用render生成虚拟DOM
        const vnode = render.call(vm)
        return vnode;
    }
}