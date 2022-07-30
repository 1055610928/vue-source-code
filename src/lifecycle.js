import Watcher from "./observer/watcher";
import { patch } from "./vdom/patch";

export function lifecycleMixin(Vue){
    Vue.prototype._update = function(vnode){
        // 既有初始化， 又有更新
        // patch： diff流程
        // vnode 利用虚拟节点创建真实节点，替换 $el 中的内容
        const vm = this;
        vm.$el = patch(vm.$el, vnode)
        // console.log(vm,vnode)
    }
}

// 后续每个组件渲染的时候都会有一个watcher
export function mountComponent(vm, el) {
    // 更新函数，数据变化后还会再次调用此函数
    let updateComponent = ()=>{
        // 调用render函数生成虚拟DOM
        // 调用_update将虚拟DOM变成真实DOM
        // 后续更新可以调用updateComponet方法
        vm._update(vm._render());
    }
    // 什么是挂载？
    // 根据render方法生成DOM元素，将id=app里面的内容替换掉，这就叫挂载 

    // 默认会调用一次
    // 组件挂载的时候会执行此方法
    // 属性是被观察者，属性变了通知视图更新
    // 观察者：刷新页面
    new Watcher(vm,updateComponent,()=>{
        console.log("更新视图了")
    },true) // true这个标识是代表它是一个渲染watcher, 后续有其它的Watcher
}
