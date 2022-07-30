export function createElement(vm, tag, data = {}, ...children) {
  return vnode(tag, data, data.key, children, undefined, vm);
}

export function createTextElement(vm, text) {
  return vnode(undefined, undefined, undefined, undefined, text, vm);
}

// 创建虚拟DOM
function vnode(tag, data, key, children, text, vm) {
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
