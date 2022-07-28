(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }

  function isFunction(val) {
    return typeof val === "function";
  }
  function isObject(val) {
    return _typeof(val) === 'object' && val !== null;
  }

  // Objec.create 模拟
  // function ObjectCreate(proto){
  //     function F(){}
  //     F.prototype = proto
  //     return new F();
  // }
  var oldArrayPrototype = Array.prototype;
  var arrayMethods = Object.create(Array.prototype); // arrayMethods.__proto__ = Array.prototype // 就是个继承

  var methods = ["push", "pop", "shift", "unshift", "reverse", "sort", "splice"];
  methods.forEach(function (method) {
    // 用户调用的是以上的7个方法，会用我自己重写的，否则会用原来的
    arrayMethods[method] = function () {
      var _oldArrayPrototype$me;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      // 相当于调用原来的push, this --> 谁调用就指向谁
      (_oldArrayPrototype$me = oldArrayPrototype[method]).call.apply(_oldArrayPrototype$me, [this].concat(args)); // args就是新增的内容
      // push splice unshift


      var inserted;
      var ob = this.__ob__; // 这里获取的就是Observer实例

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
      } // 如果有新增的内容，继续进行劫持
      // 需要观测数组中的每一项，而不是数组，
      // this是那个数组，index.js文件中的也是那个数组


      if (inserted) {
        ob.observeArray(inserted);
      }
    };
  });

  var Observer = /*#__PURE__*/function () {
    function Observer(data) {
      _classCallCheck(this, Observer);

      // this指向Observer实例
      // data.__ob__ 等于当前的Observer实例
      // 所有被劫持的属性都有__ob__
      // data.__ob__ 在这里会被不停的观测
      // 将data.__ob__ 变成不可枚举的属性
      data.__ob__ = this;
      Object.defineProperty(data, '__ob__', {
        value: this,
        enumerable: false
      });

      if (Array.isArray(data)) {
        // 数组劫持的逻辑，对数组原来的方法进行改写，切片编程
        // console.log(arrayMethods) // Object.create(Array.prototype)
        // 如果数组中的数据是对象类型，需要监控对象的变化
        data.__proto__ = arrayMethods; // 数组中的对象进行劫持

        this.observeArray(data);
      } else {
        // 对象劫持的逻辑
        this.walk(data);
      }
    } // 数组观测


    _createClass(Observer, [{
      key: "observeArray",
      value: function observeArray(data) {
        // 对数组中数组 或者是 数组中的对象再次劫持，递归
        data.forEach(function (item) {
          observe(item);
        });
      } // walk --> 走，步行

    }, {
      key: "walk",
      value: function walk(data) {
        // Object.keys不会遍历到原型链，取到的都是私有属性
        Object.keys(data).forEach(function (key) {
          defineReactive(data, key, data[key]);
        });
      }
    }]);

    return Observer;
  }(); // vue 会对对象进行遍历，将每个属性 用Object.defineProperty 重新定义，所以性能不好
  // 以下的definedReactive是一个闭包，每个属性定义完成以后会在实例上定义上get xxx和set xxx
  // 所以defineReactive执行完毕之后 Object.definedProperty的get/set带着defineReactive的AO


  function defineReactive(data, key, value) {
    // value有可能还是对象
    observe(value);
    Object.defineProperty(data, key, {
      get: function get() {
        // console.log('getter',value)
        return value;
      },
      set: function set(newValue) {
        // 设置的新值有可能还是对象
        observe(value);
        value = newValue;
      }
    });
  }

  function observe(data) {
    if (!isObject(data)) {
      return;
    } // data.__ob__ 代表已经被观测过了


    if (data.__ob__) {
      return;
    } // 创建一个观测者


    return new Observer(data);
  }

  function initState(vm) {
    // 状态的初始化
    var options = vm.$options; // props在data之前

    if (options.props) ;

    if (options.methods) ;

    if (options.data) {
      initData(vm);
    }

    if (options.computed) ;

    if (options.watch) ;
  }
  /**
   * 
   * @param {*} vm vue实例
   * @param {*} target 去哪里取值
   * @param {*} key key值
   */

  function proxy(vm, target, key) {
    // vm上定义key, vm.xxx的时候帮我们从vm._data.xxx中获取
    Object.defineProperty(vm, key, {
      get: function get() {
        return vm[target][key];
      },
      set: function set(newVal) {
        vm[target][key] = newVal;
      }
    });
  }

  function initData(vm) {
    var data = vm.$options.data;
    data = vm._data = isFunction(data) ? data.call(this) : data; // 代理取值

    for (var key in data) {
      proxy(vm, '_data', key);
    } // 数据观测


    observe(data);
  }

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      // el 和 data
      var vm = this;
      vm.$options = options; // 后续对options进行扩展
      // 对数据进行初始化 watch,props,computed,data ...

      initState(vm); // vm.$options.data  vm.$options.computed ...
    };
  }

  function Vue(options) {
    // options为用户传入的选项
    this._init(options); // 初始化操作

  }

  initMixin(Vue);

  return Vue;

}));
//# sourceMappingURL=vue.js.map
