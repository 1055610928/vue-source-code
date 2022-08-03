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
export default Vue;