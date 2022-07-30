import { popTarget, pushTarget } from "./dep";

let id = 0; // 标识，当new Watcher的时候id自增
class Watcher{
/**
 * 
 * @param {*} vm 实例
 * @param {*} exprOrfn 表达式或者是一个函数
 * @param {*} cb 自定义的回调
 * @param {*} options 是一个标识，可能还是其它的选项
 */
    constructor(vm,exprOrfn,cb,options){
        this.vm = vm;
        this.exprOrfn = exprOrfn;
        this.cb = cb;
        this.options = options;
        // 默认让exprOrfn默认执行
        // exprOrFn 调用了render方法，要去vm上取值
        this.getter = exprOrfn
        this.id = id++;

        // 存放dep
        this.deps = [];
        this.depsId = new Set();

        // 默认初始化要取值
        this.get();
    }
    // 稍后用户更新的时候重新调用get方法
    get(){ 
        // 取值：会调用Object.defineProperty, 每个属性都可以收集自己的Watcher
        // 一个属性可以对应多个watcher, 同时一个watcher对应多个属性
        // 为什么是多对多？ 一个属性可能在多个组件中使用(只要这个属性一变，这多个组件都要更新)，
        // 一个组件可能有多个属性
        pushTarget(this); // Dep.target = Watcher
        this.getter(); // 执行这句话的时候会执行render, render会去vm实例上取值

        // Dep.target = null; 如果在Dep.target中有值说明在模板中使用了
        // 用户在外面取值的时候不去收集依赖
        popTarget(); 
    }
    addDep(dep){
        let id = dep.id;
        // 去重操作，防止一个页面上相同的属性使用了多次，从而收集多次watcher
        if(!this.depsId.has(id)){
            this.depsId.add(id);
            this.deps.push(dep);
            dep.addSub(this);
        }
    }
}
export default Watcher;