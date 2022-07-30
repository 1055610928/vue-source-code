import { initMixin } from "./init";
import { lifecycleMixin } from "./lifecycle";
import { renderMixin } from "./render";

function Vue(options){
    // options为用户传入的选项
    this._init(options); // 初始化操作
}
initMixin(Vue);
renderMixin(Vue); // _render
lifecycleMixin(Vue); // _update
export default Vue;