import { initGlobalAPI } from "./global-api/index";
import { initMixin } from "./init";
import { lifecycleMixin } from "./lifecycle";
import { renderMixin } from "./render";
import { stateMxin } from "./state";

function Vue(options){
    // options为用户传入的选项
    this._init(options); // 初始化操作
}
initMixin(Vue);
renderMixin(Vue); // _render
lifecycleMixin(Vue); // _update
stateMxin(Vue); // 状态混入

// 在类上扩展
// 初始化全局API
initGlobalAPI(Vue);


import {compilerToFunction} from './compiler/index'
import {createElm, patch} from './vdom/patch'
// diff核心
let oldTemplate = `<div  style="color:green">{{message}}</div>`
let vm1 = new Vue({data:{message:"hello"}});

const render1 = compilerToFunction(oldTemplate);
const oldVnode = render1.call(vm1); // 虚拟dom
// 真实节点
document.body.appendChild(createElm(oldVnode))

let newTemplate = `<div></div>`
const vm2 = new Vue({data:{message:'zf'}})
const render2 = compilerToFunction(newTemplate); // 虚拟节点
const newVnode = render2.call(vm2); // 虚拟dom
document.body.appendChild(createElm(newVnode))
// 根据新的虚拟节点更新老的节点，老节点能复用尽量复用
setTimeout(()=>{
    patch(oldVnode,newVnode)
},2000)


export default Vue;