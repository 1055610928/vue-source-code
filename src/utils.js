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



let lifecycleHooks = [
  'beforeCreate',
  'created',
  'beforeMount',
  'mounted',
  'beforeUpdate',
  'updated',
  'beforeDestroy',
  'destroyed'
]
let strats = {}; // 存放各种策略
lifecycleHooks.forEach(hook=>{
  strats[hook] = mergeHook
})
strats.components = function(parentVal,childVal){
  // Vue.options.components
  // 先在自己上找，找不到去找原型上的
  // console.log(parentVal,childVal)
  // 根据父对象构造一个新对象，options.__proto__
  // 将子类放到options的实例上，父类存在原型链上
  const options = Object.create(parentVal);
  if(childVal){
    for (const key in childVal) {
      options[key] = childVal[key]
    }
  }
  
  return options;
}

function mergeHook(parentVal,childVal){
  if(childVal){
    if(parentVal){ // 父亲有和儿子有，进行拼接
      return parentVal.concat(childVal);
    }else{
      return [childVal] //第一次执行，如果只是子有直接返回数组包含的生命周期钩子
    }
  }else{
    return parentVal
  }
}

// 合并选项
// this.options是空对象， 传进来的options={beforeCreated:Fn} =>{beforeCreated:[fn]}
// 下一次调用Vue.mixin = {beforeCreated:[fn,fn1]} ---> 合并到数组里
// parentOptions -> Vue.options   childOptions -> userOptions
export function mergeOptions(parentOptions, childOptions) {
  // 两个对象合并
  const options = {}; // 合并后的结果

  // this.options有
  for (const key in parentOptions) {
    mergeFild(key);
  }
  
  // mixin的选项遍历
  for (const key in childOptions) {
    // 如果这个key在父options中有这个属性，就不用合并了
    if(parentOptions.hasOwnProperty(key)){
      continue;
    }
    mergeFild(key);
  }

  function mergeFild(key) {
    const parentVal = parentOptions[key];
    const childVal = childOptions[key];
    // 策略模式, 根据不同的策略做不同的事情
    // 如果有策略调用对应的策略即可
    if(strats[key]){
      options[key] = strats[key](parentVal,childVal)
    }else{
      // 看parentOptions和childOptions是不是对象
      if (isObject(parentVal) && isObject(childVal)) {
        options[key] = { ...parentVal, ...childVal };
      }else{
        // 父亲有，儿子没有
        options[key] = childOptions[key] || parentOptions[key]
      }
    }
  }
  return options;
}




export function isReservedTag(strTag){
  let reservedTag = 'div,button,a,span,img,p,li,ul,strong,b,i,del';
  // 源码根据 "，" 生成映射表，{a:true,div:true,span:true}
  return reservedTag.includes(strTag);
}