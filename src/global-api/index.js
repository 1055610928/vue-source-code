import { mergeOptions } from "../utils";

export function initGlobalAPI(Vue){
    // 存放全局的配置，每个组件初始化的时候，都会和options选项进行合并
    Vue.options = {}; 
    // Vue.component
    // Vue.directive
    // Vue.filter
    Vue.mixin = function(options){
        // vue默认的选项和用户传入的选项进行合并
        // this.options是空对象， 传进来的options={beforeCreated:Fn} =>{beforeCreated:[fn]}
        // 下一次调用Vue.mixin = {beforeCreated:[fn,fn1]} ---> 合并到数组里
        this.options = mergeOptions(this.options, options);
        return this; // 这里的this指向Vue
    }



    // 无论后续创建多少个子类，都可以通过_base找到父类(Vue)
    Vue.options._base = Vue 
    Vue.options.components = {}
    // 全局组件定义
    /**
     * @param {*} id 组件名称
     * @param {*} definition 组件对象
     */
    Vue.component = function(id,definition){
        // 保证组件的隔离，每个组件都会产生一个新的类，去继承父类
        definition = this.options._base.extend(definition)
        // 将子类挂载到Vue.options.components 中
        this.options.components[id] = definition
    }

    // extend 方法就是产生一个继承Vue的类，并且身上应该有父类的功能
    // 给一个对象返回类
    Vue.extend = function(options){ 
        const Super = this; // this -> Vue
        const Sub = function VueComponent(opts){ 
            this._init(opts);
        }
        // 原型继承
        // Super.prototype -> Vue的原型
        Sub.prototype = Object.create(Super.prototype);
        Sub.prototype.constructor = Sub; 
        // 这样就包含了全局的和用户传递的
        // vue.options和用户的options进行合并给到Sub.options
        Sub.options = mergeOptions(Super.options,options) // 只是和Vue.options合并
        return Sub;
    }
}
