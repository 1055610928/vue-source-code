import { popTarget, pushTarget } from "./dep";
import { queueWatcher } from "./scheduler";

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
        // 看是不是用户watcher
        this.user = !!options.user
        this.cb = cb;
        this.options = options;

        // 看options上有没有lazy属性
        this.lazy = !!options.lazy;
        // computed脏值检查
        // 如果是计算属性，那么默认值lazy为true,dirty也为true
        this.dirty = options.lazy; 


        // 判断是不是一个函数？有可能是一个key值
        if(typeof exprOrfn === 'string'){
            // 需要将key值转换成函数
            this.getter = function(){
                // 当数据取值的时候会进行依赖收集
                // 会走对应的getter---> 走了getter就会进行依赖收集
                // 用户有可能使用 'age.n'---> 这种方式定义watch中的处理函数--->需要变成this.vm['age']['n']
                const path = exprOrfn.split('.')
                let obj = vm;
                for (let i = 0; i < path.length; i++) {
                    obj = obj[path[i]];
                }
                return obj; 
            }
        }else{
            // 默认让exprOrfn默认执行
            // exprOrFn 调用了render方法，要去vm上取值
            this.getter = exprOrfn
        }

        this.id = id++;

        // 存放dep
        this.deps = [];
        this.depsId = new Set();

        // 默认初始化要取值
        // 第一次的value
        // this.lazy表示式计算属性，默认不执行getter
        this.value = this.lazy ? undefined : this.get();
        // console.log(this.lazy,this.getter)
    }
    // 稍后用户更新的时候重新调用get方法
    get(){ 
        // 取值：会调用Object.defineProperty, 每个属性都可以收集自己的Watcher
        // 一个属性可以对应多个watcher, 同时一个watcher对应多个属性
        // 为什么是多对多？ 一个属性可能在多个组件中使用(只要这个属性一变，这多个组件都要更新)，
        // 一个组件可能有多个属性
        // Dep.target = Watcher
        pushTarget(this); 

        // 执行这句话的时候会执行render, render会去vm实例上取值
        //用户watcher: 第一次执行的时候会返回value, 等到set的时候又会走get返回新的值
        // computed在这里收集watcher的时候是收集的计算属性watcher
        const value = this.getter();
        // Dep.target = null; 如果在Dep.target中有值说明在模板中使用了
        // 用户在外面取值的时候不去收集依赖
        popTarget(); 
        return value
    }
    update() {
        // this.lazy=true 代表是计算属性watcher
        if(this.lazy){
            this.dirty = true
        }else{
            // this是 watcher
            // 每次调用update 将watcher缓存起来，之后一起更新
            // vue中的更新操作是异步的
            queueWatcher(this);
        }
    }
    // run 就是执行了updateComponent方法
    run(){
        // 新值
        let newVal = this.get();
        // 老值
        let oldVal = this.value 
        this.value = newVal // 为了保证下一次更新的时候，上一次的最新值是下一次的老值
        if(this.user){
            // 是用户watcher才会调用watch中的函数
            this.cb.call(this.vm, newVal,oldVal)
        }
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
    evaludate(){
        // 求值的时候将dirty变成false, 代表已经取过值了  
        this.dirty = false; // 取值之后就不脏了，缓存起来
        this.value = this.get(); // 用户的getter执行
    }
    depend(){
        let len = this.deps.length;
        while (len--) {
            // 让lastName和firstName收集渲染Watcher
            this.deps[len].depend(); 
        }
    }
}
export default Watcher;