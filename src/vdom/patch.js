// 虚拟DOM比对
export function patch(oldVnode, vnode) {
  if (oldVnode.nodeType == 1) {
    
    const parentElm = oldVnode.parentNode; 

    const element = createElm(vnode); 
    parentElm.insertBefore(element, oldVnode.nextSibling);

    parentElm.removeChild(oldVnode);

    // 这里必须返回用虚拟DOM创建的真实DOM，然后挂载的vm.$el上
    // parentElm.removeChild(oldVnode); vm.$el中的元素被删除掉了
    return element;
  }
}
function createElm(vnode) {
  const { tag, data, children, text, vm } = vnode;
  // tag === 'string' 证明是一个元素
  // 每个虚拟节点的身上都有el 属性，对应真实节点
  if (typeof tag === "string") {
    vnode.el = document.createElement(tag);
    // 子节点创建
    // 树的深度遍历，插入子元素
    children.forEach(child=>{
        vnode.el.appendChild(createElm(child))
    })
  } else {
    // 文本
    vnode.el = document.createTextNode(text);
  }
  return vnode.el
}
