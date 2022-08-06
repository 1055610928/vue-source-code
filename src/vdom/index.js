import { isObject, isReservedTag } from "../utils";

export function createElement(vm, tag, data = {}, ...children) {

  // 如果tag是组件 应该渲染一个组件的vnode
  // isReservedTag 看是不是原生标签
  if(isReservedTag(tag)){
    return vnode(tag, data, data.key, children, undefined, vm);
  }else{
    const Ctor = vm.$options.components[tag]
    return createComponent(tag, data, data.key, children, Ctor,vm);
  }
}
// 创建组件的虚拟节点, 为了区分组件和元素 data.hook | componentOptions
function createComponent(tag, data, key, children, Ctor,vm){
  // 组件的构造函数
  if(isObject(Ctor)){
    Ctor = vm.$options._base.extend(Ctor) // Vue.$options._base = Vue
  }
  data.hook = { // 等会渲染组件的时候，需要初始化此方法
    init(vnode){
      // 初始化组件
      // new Sub 会用此选项和组件的配置进行合并
      let vm = vnode.componentInstance = new Ctor({_isComponent:true}); 
      vm.$mount() // 组件挂载完成后 会在vm.$el => <template><button></button></template>
    }
  }
  return vnode(`vue-component-${tag}`,data,key,undefined,undefined,{Ctor,children},vm)
}

export function createTextElement(vm, text) {
  return vnode(undefined, undefined, undefined, undefined, text, vm);
}

// 创建虚拟DOM
// componentOptions 组件的选项
function vnode(tag, data, key, children, text,componentOptions, vm) {
  return {
    tag,
    data,
    key,
    children,
    text,
    vm,
    // ...
  };
}
