export function isFunction(val) {
  return typeof val === "function";
}

export function isObject(val) {
  return typeof val === "object" && val !== null;
}

const callbacks = [];
function flushCallback() {
  callbacks.forEach((cb) => cb());
  waiting = false;
}

let waiting = false;

function timer(flushCallback) {
  let timerFn = () => {};
  if (Promise) {
    timerFn = () => {
      Promise.resolve().then(flushCallback);
    };
  } else if (MutationObserver) {
    let textNode = document.createTextNode(1);
    let observe = new MutationObserver(flushCallback);
    // 监听内容的变化
    observe.observe(textNode, {
      characterData: true,
    });
    timerFn = () => {
      textNode.textContent = 3;
    };
  } else if (setImmediate) {
    timerFn = () => {
      setImmediate(flushCallback);
    };
  } else {
    timerFn = () => {
      setTimeout(flushCallback);
    };
  }
  timerFn();
}

export function nextTick(cb) {
  callbacks.push(cb);
  if (!waiting) {
    // vue2考虑了兼容性问题，vue3里面不再考虑兼容性问题
    timer(flushCallback);
    waiting = true;
  }
}
