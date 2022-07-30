import { nextTick } from "../utils";

let queue = [];
let has = {}; // 做列表的。列表的维护存放了哪些watcher

function flushSchedulerQeue() {
  for (let i = 0; i < queue.length; i++) {
    queue[i].run();

    // 清空队列
    queue = [];
    has = {};
    pending = false;
  }
}

let pending = false;
// 等待同步代码执行完毕以后，才执行异步逻辑
// 当前执行栈中代码执行完毕后，会先清空微任务，再清空宏任务
// 尽早更新页面，$nextTicket
export function queueWatcher(watcher) {
  // 这里watcher进行一次去重，这里每个属性都有一个dep,
  // dep里又有watcher，所以多次更新操作的时候watcher可能是同一个，要进行去重
  const id = watcher.id;
  if (!has[id]) {
    queue.push(watcher);
    has[id] = true;
    // 开启一次更新操作，多次触发queueWatcher 只触发一次nextTick(flushSchedulerQeue)
    // 如果是同步：可能进来不同的watcher，那么可不止一次调用 nextTick(flushSchedulerQeue)
    if (!pending) { 
      nextTick(flushSchedulerQeue);
      pending = true;
    }
  }
}
