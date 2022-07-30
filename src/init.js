import { compilerToFunction } from "./compiler/index";
import { mountComponent } from "./lifecycle";
import { initState } from "./state";

// 表示在vue的基础上做一次混合的操作
export function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    // el 和 data
    const vm = this;
    vm.$options = options; // 后续对options进行扩展

    // 对数据进行初始化 watch,props,computed,data ...
    initState(vm); // vm.$options.data  vm.$options.computed ...

    // 看用户的实例上有没有el这样的属性
    // 有el属性就调用 vm.$mount
    // 没有 el 属性就是 new Vue().$mount('el')
    if (vm.$options.el) {
      // 将数据挂载到这个模板上
      vm.$mount(vm.$options.el);
    }
  };

  Vue.prototype.$mount = function (el) {
    const vm = this;
    el = document.querySelector(el);
    vm.$el = el;
    const options = vm.$options;
    /**
     * 把模板转换转换成对应的渲染函数，还可以引入虚拟DOM的概念，
     * 通过渲染函数产生虚拟节点，用户更新数据了，更新虚拟DOM，
     * 最后再产生真实节点去更新视图
     */
    if (!vm.$options.render) {
      // 没有render就使用template
      let template = options.template;
      if (!template && el) {
        // 用户没有传递template就取el的内容作为模板
        template = el.outerHTML;
        const render = compilerToFunction(template)
        // options.render就是渲染函数
        // 谁调用render render中的 with(this) 就指向谁
        options.render = render
      }
    }
    // options.render就是渲染函数
    // 调用render方法，最终渲染成真实DOM，替换掉页面的内容
    
    // 组件的挂载流程
    // 将组件实例，挂载到el元素上
    mountComponent(vm, el);
  };
}
