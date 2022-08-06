
// 每个属性都分配一个Dep，Dep可以用来存放watcher, watcher存放这个dep
let id = 0;
export class Dep{ 
    constructor(){
        this.id = id++
        this.subs = [] // 用来存放watcher的
    }
    depend(){
        // Dep.target dep里要存放这个watcher, 同样watcher要存放dep 多对多的关系
        // Dep.target 是watcher
        if(Dep.target){
            // watcher 存 dep
            Dep.target.addDep(this);
        }
    }
    addSub(watcher){
        this.subs.push(watcher)
    }
    notify(){
        this.subs.forEach(watcher=>{
            watcher.update(); // 执行get
        })
    }
}

Dep.target = null;
var stack = []
export function pushTarget(wathcer){
    Dep.target = wathcer;
    stack.push(wathcer)
}
export function popTarget(){
    // Dep.target = null
    stack.pop();
    Dep.target = stack[stack.length - 1];
}