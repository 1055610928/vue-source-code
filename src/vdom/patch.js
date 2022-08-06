// 虚拟DOM比对
export function patch(oldVnode, vnode) {
  if(!oldVnode){
    return createElm(vnode); // 如果没有el元素，直接根据虚拟节点返回真实节点
  }

  if (oldVnode.nodeType == 1) {
    
    const parentElm = oldVnode.parentNode; 

    const element = createElm(vnode); 
    parentElm.insertBefore(element, oldVnode.nextSibling);

    parentElm.removeChild(oldVnode);

    // 这里必须返回用虚拟DOM创建的真实DOM，然后挂载的vm.$el上
    // parentElm.removeChild(oldVnode); vm.$el中的元素被删除掉了
    return element;
  }else{
    // 如果标签名不一样，直接删掉老的，换成新的
    console.log("oldVnode",oldVnode)
    console.log("newVnode",vnode)
    if(oldVnode.tag != vnode.tag){
      // 可以通过vnode.el属性。获取现在真实的DOM元素
      // 使用新的节点替换掉老的节点
      return oldVnode.el.parentNode.replaceChild(createElm(vnode), oldVnode.el)
    }
    // 如果两个虚拟节点是文本节点，比较文本内容
    
    // 如果标签一样就比较属性，传入新的虚拟节点和老的属性，用新的属性更新老的
    let el = vnode.el = oldVnode.el; // 表示当前新节点复用老节点
    patchProps(vnode,oldVnode.data)
    
    // 一方有儿子，一方没有儿子
    let oldChildren = oldVnode.children || []
    let newChildren = vnode.children || []
    console.log(oldChildren,newChildren)
    
    if(oldChildren.length>0 && newChildren.length>0){
      // 双方都有儿子
    }else if(newChildren.length){
      // 新的有儿子，老的没儿子 
      for (let i = 0; i < newChildren.length; i++) {
        // 根据虚拟节点创建真实节点
        // 循环创建新节点
        const child = createElm(newChildren[i]); 
        el.appendChild(child)
      }
    }else if(oldChildren.length){
      // 老的有儿子，新的没儿子
      el.innerHTML = ``; // 直接删除老节点
    }
    // vue的特点是每个组件都有一个watcher，当前组件中数据变化 只需要更新当组件
    // 其他情况：双方都没有儿子
  }
}

 // 初次渲染的时候可以调用此方法，后续更新也可以调用此方法
function patchProps(vnode,oldProps={}){
  const newProps = vnode.data || {}
  let el = vnode.el;

  let newStyle = newProps.style || {}
  let oldStyle = oldProps.style || {}

    // 属性可能有删除的情况
  for (const key in oldStyle) {
    if(!newStyle[key]){ // 新的里面不存在这个样式
      el.style[key] = '';
    }
  }
  // 如果老的属性有，新的没有直接删除
  for (const key in oldProps) {
    if(!newProps[key]){
      el.removeAttribute(key);
    }
  }
  // 直接用新的生成到元素上
  for (const key in newProps) {
    if(key === 'style'){
      for (const styleName in newProps.style) {
        el.style[styleName] = newProps.style[styleName]
      }
    }else{
      vnode.el.setAttribute(key,newProps[key])
    }
  }
  vnode.el
}


// 创建真实节点
function createComponent(vnode){
  let i = vnode.data;
  if((i = i.hook) && (i = i.init)){
    i(vnode); // 调用hook.init方法
  }
  // 有这个属性说明子组件new完毕了，并且组件对应的真实DOM挂载到了componentInstance.$el上
  if(vnode.componentInstance){ 
    return true; 
  }
}

export function createElm(vnode) {
  const { tag, data, children, text, vm } = vnode;
  // tag === 'string' 证明是一个元素
  // 每个虚拟节点的身上都有el 属性，对应真实节点
  if (typeof tag === "string") {
    if(createComponent(vnode)){
      // 返回组件对应的真实节点
      return vnode.componentInstance.$el;
    }

    vnode.el = document.createElement(tag);

    // 属性比对
    patchProps(vnode)

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
