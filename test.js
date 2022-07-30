const watcher = [1, 3];
const queue = [];
var pending = false;
function runner(params) {
  if (params.toString().includes(params)) {
    watcher.forEach((item) => {
      console.log(item);
    });
    pending = false
  }
}
function scheduler(params) {
  queue.push(params);
  if (!pending) {
    setTimeout(() => {
      runner(params);
    });
    pending = true
  }
}
for (let i = 0; i < 13; i++) {
  scheduler(1)  
}
