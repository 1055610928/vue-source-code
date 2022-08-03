let oldArrayPrototype = Array.prototype;
export let arrayMethods = Object.create(Array.prototype);

let methods = ["push", "pop", "shift", "unshift", "reverse", "sort", "splice"];
methods.forEach((method) => {
  arrayMethods[method] = function (...args) {
    oldArrayPrototype[method].call(this, ...args);
    let inserted;
    let ob = this.__ob__;
    switch (method) {
      case "push":
        inserted = args;
        break;
      case "splice":
        inserted = args.slice(2);
        break;
      case "unshift":
        inserted = args;
        break;
    }
    if (inserted) {
      ob.observeArray(inserted);
    }
    // ob.dep 就是observer实例 
    ob.dep.notify()
  };
});
