(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })), keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = null != arguments[i] ? arguments[i] : {};
      i % 2 ? ownKeys(Object(source), !0).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }

    return target;
  }

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

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function isFunction(val) {
    return typeof val === "function";
  }
  function isObject(val) {
    return _typeof(val) === "object" && val !== null;
  }
  var callbacks = [];

  function flushCallback() {
    callbacks.forEach(function (cb) {
      return cb();
    });
    waiting = false;
  }

  var waiting = false;

  function timer(flushCallback) {
    var timerFn = function timerFn() {};

    if (Promise) {
      timerFn = function timerFn() {
        Promise.resolve().then(flushCallback);
      };
    } else if (MutationObserver) {
      var textNode = document.createTextNode(1);
      var observe = new MutationObserver(flushCallback); // 监听内容的变化

      observe.observe(textNode, {
        characterData: true
      });

      timerFn = function timerFn() {
        textNode.textContent = 3;
      };
    } else if (setImmediate) {
      timerFn = function timerFn() {
        setImmediate(flushCallback);
      };
    } else {
      timerFn = function timerFn() {
        setTimeout(flushCallback);
      };
    }

    timerFn();
  }

  function nextTick(cb) {
    callbacks.push(cb);

    if (!waiting) {
      // vue2考虑了兼容性问题，vue3里面不再考虑兼容性问题
      timer(flushCallback);
      waiting = true;
    }
  }
  var lifecycleHooks = ['beforeCreate', 'created', 'beforeMount', 'mounted', 'beforeUpdate', 'updated', 'beforeDestroy', 'destroyed'];
  var strats = {}; // 存放各种策略

  lifecycleHooks.forEach(function (hook) {
    strats[hook] = mergeHook;
  });

  strats.components = function (parentVal, childVal) {
    // Vue.options.components
    // 先在自己上找，找不到去找原型上的
    // console.log(parentVal,childVal)
    // 根据父对象构造一个新对象，options.__proto__
    // 将子类放到options的实例上，父类存在原型链上
    var options = Object.create(parentVal);

    if (childVal) {
      for (var key in childVal) {
        options[key] = childVal[key];
      }
    }

    return options;
  };

  function mergeHook(parentVal, childVal) {
    if (childVal) {
      if (parentVal) {
        // 父亲有和儿子有，进行拼接
        return parentVal.concat(childVal);
      } else {
        return [childVal]; //第一次执行，如果只是子有直接返回数组包含的生命周期钩子
      }
    } else {
      return parentVal;
    }
  } // 合并选项
  // this.options是空对象， 传进来的options={beforeCreated:Fn} =>{beforeCreated:[fn]}
  // 下一次调用Vue.mixin = {beforeCreated:[fn,fn1]} ---> 合并到数组里
  // parentOptions -> Vue.options   childOptions -> userOptions


  function mergeOptions(parentOptions, childOptions) {
    // 两个对象合并
    var options = {}; // 合并后的结果
    // this.options有

    for (var key in parentOptions) {
      mergeFild(key);
    } // mixin的选项遍历


    for (var _key in childOptions) {
      // 如果这个key在父options中有这个属性，就不用合并了
      if (parentOptions.hasOwnProperty(_key)) {
        continue;
      }

      mergeFild(_key);
    }

    function mergeFild(key) {
      var parentVal = parentOptions[key];
      var childVal = childOptions[key]; // 策略模式, 根据不同的策略做不同的事情
      // 如果有策略调用对应的策略即可

      if (strats[key]) {
        options[key] = strats[key](parentVal, childVal);
      } else {
        // 看parentOptions和childOptions是不是对象
        if (isObject(parentVal) && isObject(childVal)) {
          options[key] = _objectSpread2(_objectSpread2({}, parentVal), childVal);
        } else {
          // 父亲有，儿子没有
          options[key] = childOptions[key] || parentOptions[key];
        }
      }
    }

    return options;
  }
  function isReservedTag(strTag) {
    var reservedTag = 'div,button,a,span,img,p,li,ul,strong,b,i,del'; // 源码根据 "，" 生成映射表，{a:true,div:true,span:true}

    return reservedTag.includes(strTag);
  }

  function initGlobalAPI(Vue) {
    // 存放全局的配置，每个组件初始化的时候，都会和options选项进行合并
    Vue.options = {}; // Vue.component
    // Vue.directive
    // Vue.filter

    Vue.mixin = function (options) {
      // vue默认的选项和用户传入的选项进行合并
      // this.options是空对象， 传进来的options={beforeCreated:Fn} =>{beforeCreated:[fn]}
      // 下一次调用Vue.mixin = {beforeCreated:[fn,fn1]} ---> 合并到数组里
      this.options = mergeOptions(this.options, options);
      return this; // 这里的this指向Vue
    }; // 无论后续创建多少个子类，都可以通过_base找到父类(Vue)


    Vue.options._base = Vue;
    Vue.options.components = {}; // 全局组件定义

    /**
     * @param {*} id 组件名称
     * @param {*} definition 组件对象
     */

    Vue.component = function (id, definition) {
      // 保证组件的隔离，每个组件都会产生一个新的类，去继承父类
      definition = this.options._base.extend(definition); // 将子类挂载到Vue.options.components 中

      this.options.components[id] = definition;
    }; // extend 方法就是产生一个继承Vue的类，并且身上应该有父类的功能
    // 给一个对象返回类


    Vue.extend = function (options) {
      var Super = this; // this -> Vue

      var Sub = function VueComponent(opts) {
        this._init(opts);
      }; // 原型继承
      // Super.prototype -> Vue的原型


      Sub.prototype = Object.create(Super.prototype);
      Sub.prototype.constructor = Sub; // 这样就包含了全局的和用户传递的
      // vue.options和用户的options进行合并给到Sub.options

      Sub.options = mergeOptions(Super.options, options); // 只是和Vue.options合并

      return Sub;
    };
  }

  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // {{   xxx  }}
  // _c("div",{id:'app'},'你好')

  function generate(el) {
    // 遍历树，将树拼接成字符串
    var children = genChildren(el);
    var code = "_c('".concat(el.tag, "',\n        ").concat(el.attrs.length ? genProps(el.attrs) : 'undefined', "\n        ").concat(children ? ",".concat(children) : '', ")");
    return code;
  } // 生成子元素

  function gen(el) {
    if (el.type == 1) {
      return generate(el);
    } else {
      var text = el.text;

      if (!defaultTagRE.test(text)) {
        return "_v('".concat(text, "')");
      } else {
        // hello {{arr}} world  转换成  'hello'+ arr+ 'world'
        var tokens = [];
        var match;
        var lastIndex = defaultTagRE.lastIndex = 0; // 看有没有匹配到

        while (match = defaultTagRE.exec(text)) {
          var index = match.index; // 开始索引

          if (index > lastIndex) {
            tokens.push(JSON.stringify(text.slice(lastIndex, index)));
          } // _c,_v,_s 
          // _c：创建一个元素
          // _v：里面包含的是一个文本
          // _s：里面是一个变量，使用JSON.string转换一下
          // JSON.stringfy 目的，这里的{{arr}} arr变量可能是对象，
          // 需要进行JSON.stringfy,不然转隐式化过来就是[object Object]


          tokens.push("_s(".concat(match[1].trim(), ")"));
          lastIndex = index + match[0].length;
        }

        if (lastIndex < text.length) {
          tokens.push(JSON.stringify(text.slice(lastIndex)));
        }

        return "_v(".concat(tokens.join('+'), ")");
      }
    }
  }

  function genChildren(el) {
    var children = el.children; // 获取children

    if (children) {
      // _c("div",{id:'app'},_c("div",{id:'ccc'}),_v())
      // _v： 代表创建一个文本
      return children.map(function (child) {
        return gen(child);
      }).join(',');
    }

    return false;
  } // el中的attrs ---> [{'name':'xxx','id':'app'},{'class':'a'}]


  function genProps(attrs) {
    var str = "";

    for (var i = 0; i < attrs.length; i++) {
      var attr = attrs[i];

      if (attr.name === 'style') {
        (function () {
          // color:red;background:pink
          var styleObj = {}; // {color: 'red', background: 'pink'}

          attr.value.replace(/([^;:]+)\:([^;:]+)/g, function () {
            styleObj[arguments[1]] = arguments[2];
          });
          attr.value = styleObj;
        })();
      }

      str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ",");
    }

    return "{".concat(str.slice(0, -1), "}"); // str.slice(0,-1) 原因是要去掉最后一位的逗号
  }

  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*"; // 匹配标签名的  aa-xxx

  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")"); //  aa:aa-xxx

  var startTagOpen = new RegExp("^<".concat(qnameCapture)); //  此正则可以匹配到标签名 匹配到结果的第一个(索引第一个) [1]

  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); // 匹配标签结尾的 </div>  [1]

  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性的
  // [1]属性的key   [3] || [4] ||[5] 属性的值  a=1  a='1'  a=""

  var startTagClose = /^\s*(\/?)>/; // 匹配标签结束的  />    >
  // html = <div id="app"></div>

  function parseHTML(html) {
    // 构造AST语法树
    function createAstElement(tagName, attrs) {
      return {
        tag: tagName,
        type: 1,
        children: [],
        parent: null,
        attrs: attrs
      };
    }

    var root = null; //树根

    var stack = []; // 开始标签

    function start(tagName, attributes) {
      var parent = stack[stack.length - 1];
      var element = createAstElement(tagName, attributes);

      if (!root) {
        root = element;
      }

      if (parent) {
        element.parent = parent; // 当放入栈中的时候记录父级元素

        parent.children.push(element); // 存放子集元素
      }

      stack.push(element);
    } // 结束标签


    function end(endTagName) {
      var last = stack.pop();

      if (last.tag !== endTagName) {
        // 标签闭合有误
        throw new SyntaxError("标签闭合有误");
      }
    } // 文本标签


    function text(text) {
      text = text.replace(/\s/g, "");
      var parent = stack[stack.length - 1];

      if (parent) {
        parent.children.push({
          type: 3,
          text: text
        });
      }
    } // 前进方法


    function advance(len) {
      html = html.substring(len);
    }

    function parseStartTag() {
      var start = html.match(startTagOpen);

      if (start) {
        var match = {
          tagName: start[1],
          attrs: []
        };
        advance(start[0].length);

        var _end;

        var attr; // 1要有属性 2，不能为开始的结束标签 <div>

        while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5]
          });
          advance(attr[0].length);
        } // <div id="app" a=1 b=2 >


        if (_end) {
          advance(_end[0].length);
        }

        return match;
      }

      return false;
    } // 看要解析的内容是否存在，如果存在就不停的解析


    while (html) {
      // 解析标签和文本
      var index = html.indexOf("<");

      if (index == 0) {
        // 解析开始标签 并且把属性也解析出来  </div>
        var startTagMatch = parseStartTag();

        if (startTagMatch) {
          // 开始标签
          start(startTagMatch.tagName, startTagMatch.attrs);
          continue;
        }

        var endTagMatch = void 0;

        if (endTagMatch = html.match(endTag)) {
          // 结束标签
          end(endTagMatch[1]);
          advance(endTagMatch[0].length);
          continue;
        }
      } // 文本截取:  {{name}}</div>


      if (index > 0) {
        var chars = html.substring(0, index);
        text(chars);
        advance(chars.length);
      }
    }

    return root;
  }

  // HTML解析成DOM树

  function compilerToFunction(template) {
    var ast = parseHTML(template); // 代码生成

    var code = generate(ast); // code中可能会用到数据，数据在vm上

    var render = new Function("with(this){\n    return ".concat(code, "\n  }"));
    return render;
  }

  // 每个属性都分配一个Dep，Dep可以用来存放watcher, watcher存放这个dep
  var id$1 = 0;
  var Dep = /*#__PURE__*/function () {
    function Dep() {
      _classCallCheck(this, Dep);

      this.id = id$1++;
      this.subs = []; // 用来存放watcher的
    }

    _createClass(Dep, [{
      key: "depend",
      value: function depend() {
        // Dep.target dep里要存放这个watcher, 同样watcher要存放dep 多对多的关系
        // Dep.target 是watcher
        if (Dep.target) {
          // watcher 存 dep
          Dep.target.addDep(this);
        }
      }
    }, {
      key: "addSub",
      value: function addSub(watcher) {
        this.subs.push(watcher);
      }
    }, {
      key: "notify",
      value: function notify() {
        this.subs.forEach(function (watcher) {
          watcher.update(); // 执行get
        });
      }
    }]);

    return Dep;
  }();
  Dep.target = null;
  var stack = [];
  function pushTarget(wathcer) {
    Dep.target = wathcer;
    stack.push(wathcer);
  }
  function popTarget() {
    // Dep.target = null
    stack.pop();
    Dep.target = stack[stack.length - 1];
  }

  var queue = [];
  var has = {}; // 做列表的。列表的维护存放了哪些watcher

  function flushSchedulerQeue() {
    for (var i = 0; i < queue.length; i++) {
      queue[i].run();
    } // 清空队列,数据更新后保证只更新一次视图


    queue = [];
    has = {};
    pending = false;
  }

  var pending = false; // 等待同步代码执行完毕以后，才执行异步逻辑
  // 当前执行栈中代码执行完毕后，会先清空微任务，再清空宏任务
  // 尽早更新页面，$nextTicket

  function queueWatcher(watcher) {
    // 这里watcher进行一次去重，这里每个属性都有一个dep,
    // dep里又有watcher，所以多次更新操作的时候watcher可能是同一个，要进行去重
    var id = watcher.id;

    if (!has[id]) {
      queue.push(watcher);
      has[id] = true; // 开启一次更新操作，多次触发queueWatcher 只触发一次nextTick(flushSchedulerQeue)
      // 如果是同步：可能进来不同的watcher，那么可不止一次调用 nextTick(flushSchedulerQeue)

      if (!pending) {
        nextTick(flushSchedulerQeue);
        pending = true;
      }
    }
  }

  var id = 0; // 标识，当new Watcher的时候id自增

  var Watcher = /*#__PURE__*/function () {
    /**
     * 
     * @param {*} vm 实例
     * @param {*} exprOrfn 表达式或者是一个函数
     * @param {*} cb 自定义的回调
     * @param {*} options 是一个标识，可能还是其它的选项
     */
    function Watcher(vm, exprOrfn, cb, options) {
      _classCallCheck(this, Watcher);

      this.vm = vm;
      this.exprOrfn = exprOrfn; // 看是不是用户watcher

      this.user = !!options.user;
      this.cb = cb;
      this.options = options; // 看options上有没有lazy属性

      this.lazy = !!options.lazy; // computed脏值检查
      // 如果是计算属性，那么默认值lazy为true,dirty也为true

      this.dirty = options.lazy; // 判断是不是一个函数？有可能是一个key值

      if (typeof exprOrfn === 'string') {
        // 需要将key值转换成函数
        this.getter = function () {
          // 当数据取值的时候会进行依赖收集
          // 会走对应的getter---> 走了getter就会进行依赖收集
          // 用户有可能使用 'age.n'---> 这种方式定义watch中的处理函数--->需要变成this.vm['age']['n']
          var path = exprOrfn.split('.');
          var obj = vm;

          for (var i = 0; i < path.length; i++) {
            obj = obj[path[i]];
          }

          return obj;
        };
      } else {
        // 默认让exprOrfn默认执行
        // exprOrFn 调用了render方法，要去vm上取值
        this.getter = exprOrfn;
      }

      this.id = id++; // 存放dep

      this.deps = [];
      this.depsId = new Set(); // 默认初始化要取值
      // 第一次的value
      // this.lazy表示式计算属性，默认不执行getter

      this.value = this.lazy ? undefined : this.get(); // console.log(this.lazy,this.getter)
    } // 稍后用户更新的时候重新调用get方法


    _createClass(Watcher, [{
      key: "get",
      value: function get() {
        // 取值：会调用Object.defineProperty, 每个属性都可以收集自己的Watcher
        // 一个属性可以对应多个watcher, 同时一个watcher对应多个属性
        // 为什么是多对多？ 一个属性可能在多个组件中使用(只要这个属性一变，这多个组件都要更新)，
        // 一个组件可能有多个属性
        // Dep.target = Watcher
        pushTarget(this); // 执行这句话的时候会执行render, render会去vm实例上取值
        //用户watcher: 第一次执行的时候会返回value, 等到set的时候又会走get返回新的值
        // computed在这里收集watcher的时候是收集的计算属性watcher

        var value = this.getter(); // Dep.target = null; 如果在Dep.target中有值说明在模板中使用了
        // 用户在外面取值的时候不去收集依赖

        popTarget();
        return value;
      }
    }, {
      key: "update",
      value: function update() {
        // this.lazy=true 代表是计算属性watcher
        if (this.lazy) {
          this.dirty = true;
        } else {
          // this是 watcher
          // 每次调用update 将watcher缓存起来，之后一起更新
          // vue中的更新操作是异步的
          queueWatcher(this);
        }
      } // run 就是执行了updateComponent方法

    }, {
      key: "run",
      value: function run() {
        // 新值
        var newVal = this.get(); // 老值

        var oldVal = this.value;
        this.value = newVal; // 为了保证下一次更新的时候，上一次的最新值是下一次的老值

        if (this.user) {
          // 是用户watcher才会调用watch中的函数
          this.cb.call(this.vm, newVal, oldVal);
        }
      }
    }, {
      key: "addDep",
      value: function addDep(dep) {
        var id = dep.id; // 去重操作，防止一个页面上相同的属性使用了多次，从而收集多次watcher

        if (!this.depsId.has(id)) {
          this.depsId.add(id);
          this.deps.push(dep);
          dep.addSub(this);
        }
      }
    }, {
      key: "evaludate",
      value: function evaludate() {
        // 求值的时候将dirty变成false, 代表已经取过值了  
        this.dirty = false; // 取值之后就不脏了，缓存起来

        this.value = this.get(); // 用户的getter执行
      }
    }, {
      key: "depend",
      value: function depend() {
        var len = this.deps.length;

        while (len--) {
          // 让lastName和firstName收集渲染Watcher
          this.deps[len].depend();
        }
      }
    }]);

    return Watcher;
  }();

  // 虚拟DOM比对
  function patch(oldVnode, vnode) {
    if (!oldVnode) {
      return createElm(vnode); // 如果没有el元素，直接根据虚拟节点返回真实节点
    }

    if (oldVnode.nodeType == 1) {
      var parentElm = oldVnode.parentNode;
      var element = createElm(vnode);
      parentElm.insertBefore(element, oldVnode.nextSibling);
      parentElm.removeChild(oldVnode); // 这里必须返回用虚拟DOM创建的真实DOM，然后挂载的vm.$el上
      // parentElm.removeChild(oldVnode); vm.$el中的元素被删除掉了

      return element;
    } else {
      // 如果标签名不一样，直接删掉老的，换成新的
      console.log("oldVnode", oldVnode);
      console.log("newVnode", vnode);

      if (oldVnode.tag != vnode.tag) {
        // 可以通过vnode.el属性。获取现在真实的DOM元素
        // 使用新的节点替换掉老的节点
        return oldVnode.el.parentNode.replaceChild(createElm(vnode), oldVnode.el);
      } // 如果两个虚拟节点是文本节点，比较文本内容
      // 如果标签一样就比较属性，传入新的虚拟节点和老的属性，用新的属性更新老的


      var el = vnode.el = oldVnode.el; // 表示当前新节点复用老节点

      patchProps(vnode, oldVnode.data); // 一方有儿子，一方没有儿子

      var oldChildren = oldVnode.children || [];
      var newChildren = vnode.children || [];
      console.log(oldChildren, newChildren);

      if (oldChildren.length > 0 && newChildren.length > 0) ; else if (newChildren.length) {
        // 新的有儿子，老的没儿子 
        for (var i = 0; i < newChildren.length; i++) {
          // 根据虚拟节点创建真实节点
          // 循环创建新节点
          var child = createElm(newChildren[i]);
          el.appendChild(child);
        }
      } else if (oldChildren.length) {
        // 老的有儿子，新的没儿子
        el.innerHTML = ""; // 直接删除老节点
      } // vue的特点是每个组件都有一个watcher，当前组件中数据变化 只需要更新当组件
      // 其他情况：双方都没有儿子

    }
  } // 初次渲染的时候可以调用此方法，后续更新也可以调用此方法

  function patchProps(vnode) {
    var oldProps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var newProps = vnode.data || {};
    var el = vnode.el;
    var newStyle = newProps.style || {};
    var oldStyle = oldProps.style || {}; // 属性可能有删除的情况

    for (var key in oldStyle) {
      if (!newStyle[key]) {
        // 新的里面不存在这个样式
        el.style[key] = '';
      }
    } // 如果老的属性有，新的没有直接删除


    for (var _key in oldProps) {
      if (!newProps[_key]) {
        el.removeAttribute(_key);
      }
    } // 直接用新的生成到元素上


    for (var _key2 in newProps) {
      if (_key2 === 'style') {
        for (var styleName in newProps.style) {
          el.style[styleName] = newProps.style[styleName];
        }
      } else {
        vnode.el.setAttribute(_key2, newProps[_key2]);
      }
    }

    vnode.el;
  } // 创建真实节点


  function createComponent$1(vnode) {
    var i = vnode.data;

    if ((i = i.hook) && (i = i.init)) {
      i(vnode); // 调用hook.init方法
    } // 有这个属性说明子组件new完毕了，并且组件对应的真实DOM挂载到了componentInstance.$el上


    if (vnode.componentInstance) {
      return true;
    }
  }

  function createElm(vnode) {
    var tag = vnode.tag;
        vnode.data;
        var children = vnode.children,
        text = vnode.text;
        vnode.vm; // tag === 'string' 证明是一个元素
    // 每个虚拟节点的身上都有el 属性，对应真实节点

    if (typeof tag === "string") {
      if (createComponent$1(vnode)) {
        // 返回组件对应的真实节点
        return vnode.componentInstance.$el;
      }

      vnode.el = document.createElement(tag); // 属性比对

      patchProps(vnode); // 子节点创建
      // 树的深度遍历，插入子元素

      children.forEach(function (child) {
        vnode.el.appendChild(createElm(child));
      });
    } else {
      // 文本
      vnode.el = document.createTextNode(text);
    }

    return vnode.el;
  }

  function lifecycleMixin(Vue) {
    Vue.prototype._update = function (vnode) {
      // 既有初始化， 又有更新
      // patch： diff流程
      // vnode 利用虚拟节点创建真实节点，替换 $el 中的内容
      var vm = this;
      vm.$el = patch(vm.$el, vnode);
    }; // nextTick


    Vue.prototype.$nextTick = nextTick;
  } // 后续每个组件渲染的时候都会有一个watcher

  function mountComponent(vm, el) {
    // 更新函数，数据变化后还会再次调用此函数
    var updateComponent = function updateComponent() {
      // 调用render函数生成虚拟DOM
      // 调用_update将虚拟DOM变成真实DOM
      // 后续更新可以调用updateComponet方法
      vm._update(vm._render());
    }; // 什么是挂载？
    // 根据render方法生成DOM元素，将id=app里面的内容替换掉，这就叫挂载 
    // 视图调用之前


    callHook(vm, 'beforeMount'); // 默认会调用一次
    // 组件挂载的时候会执行此方法
    // 属性是被观察者，属性变了通知视图更新
    // 观察者：刷新页面

    new Watcher(vm, updateComponent, function () {
      console.log("更新视图了");
    }, true); // true这个标识是代表它是一个渲染watcher, 后续有其它的Watcher
    // dom已经挂载

    callHook(vm, 'mounted');
  } // 钩子函数的调用

  function callHook(vm, hook) {
    var handlers = vm.$options[hook];

    if (handlers) {
      for (var i = 0; i < handlers.length; i++) {
        handlers[i].call(vm);
      }
    }
  }

  var oldArrayPrototype = Array.prototype;
  var arrayMethods = Object.create(Array.prototype);
  var methods = ["push", "pop", "shift", "unshift", "reverse", "sort", "splice"];
  methods.forEach(function (method) {
    arrayMethods[method] = function () {
      var _oldArrayPrototype$me;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      (_oldArrayPrototype$me = oldArrayPrototype[method]).call.apply(_oldArrayPrototype$me, [this].concat(args));

      var inserted;
      var ob = this.__ob__;

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
      } // ob.dep 就是observer实例 


      ob.dep.notify();
    };
  });

  // 如果增加一个属性后，就手动触发watcher更新)

  var Observer = /*#__PURE__*/function () {
    function Observer(data) {
      _classCallCheck(this, Observer);

      data.__ob__ = this; // 给Observer实例添加dep属性

      this.dep = new Dep(); // 数据可能是数组可能是对象

      Object.defineProperty(data, '__ob__', {
        value: this,
        enumerable: false
      });

      if (Array.isArray(data)) {
        // 数组的变化触发视图更新？
        data.__proto__ = arrayMethods;
        this.observeArray(data);
      } else {
        this.walk(data);
      }
    }

    _createClass(Observer, [{
      key: "observeArray",
      value: function observeArray(data) {
        // 如果数组里面是对象类型，也做了观测， JSON.stringfy() 也做了收集依赖
        data.forEach(function (item) {
          observe(item);
        });
      }
    }, {
      key: "walk",
      value: function walk(data) {
        Object.keys(data).forEach(function (key) {
          defineReactive(data, key, data[key]);
        });
      }
    }]);

    return Observer;
  }(); // 数组套数组，进行依赖收集


  function dependArray(value) {
    for (var i = 0; i < value.length; i++) {
      var currentArray = value[i];
      currentArray.__ob__ && currentArray.__ob__.dep.depend(); // 多维数组

      if (Array.isArray(currentArray)) {
        dependArray(currentArray);
      }
    }
  }

  function defineReactive(data, key, value) {
    // childOb 获取的就是Observer实例，Observer实例身上有dep实例，dep在getter的时候收集依赖
    var childOb = observe(value);
    var dep = new Dep();
    Object.defineProperty(data, key, {
      get: function get() {
        if (Dep.target) {
          dep.depend(); // childOb可能是数组可能是对象，对象也要收集依赖，后续写$set方法的时候需要触发它自己的更新操作

          if (childOb) {
            // childOb存的是Observer实例，Observer身上有dep属性, 数组和对象都记录watcher
            // dep.depend收集watcher, 当数组更新的时候, dep.notify()通知watcher更新视图
            // 这里只是收集依赖只是收集了最外层的数组
            childOb.dep.depend(); // 数组套数组的情况, 多维数组的情况也要进行依赖收集

            if (Array.isArray(value)) {
              dependArray(value);
            }
          }
        }

        return value;
      },
      set: function set(newValue) {
        // 设置的新值有可能还是对象
        if (newValue !== value) {
          observe(value);
          value = newValue;
          dep.notify(); // 告诉当前的属性存放的watcher执行
        }
      }
    });
  }

  function observe(data) {
    if (!isObject(data)) {
      return;
    } // data.__ob__ 代表已经被观测过了


    if (data.__ob__) {
      return data.__ob__;
    } // 创建一个观测者


    return new Observer(data);
  }

  function stateMxin(Vue) {
    Vue.prototype.$watch = function (key, handler) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      options.user = true; // 用户自己写的watcher, 要和渲染watcher区分开
      // vm,exprOrfn,cb,options

      var vm = this; // vm, name, 用户回调, options.user

      var watcher = new Watcher(vm, key, handler, options); // 看是不是立即执行，是则直接调用handler 返回watcher中的value,
      // 第一次执行只有新值

      if (options.immediate) {
        handler(watcher.value);
      }
    };
  }
  function initState(vm) {
    // 状态的初始化
    var options = vm.$options; // props在data之前

    if (options.props) ;

    if (options.methods) ;

    if (options.data) {
      initData(vm);
    }

    if (options.computed) {
      initComputed(vm, options.computed);
    }

    if (options.watch) {
      // 用户有watch的时候初始化watch
      initWatch(vm, options.watch);
    }
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
      proxy(vm, "_data", key);
    } // 数据观测


    observe(data);
  } // 初始化watch


  function initWatch(vm, watch) {
    for (var key in watch) {
      var handler = watch[key];

      if (Array.isArray(handler)) {
        // 看是不是数组
        for (var i = 0; i < handler.length; i++) {
          // handler[i] // 每一个handler函数
          createWatcher(vm, key, handler[i]);
        }
      } else {
        // handler  // hander函数
        createWatcher(vm, key, handler);
      }
    }
  }

  function createWatcher(vm, key, handler) {
    return vm.$watch(key, handler);
  } // 初始化computed


  function initComputed(vm, computed) {
    var watcher = vm._computedWatchers = {};

    for (var key in computed) {
      // userDefine 这里取到的值有可能是对象有可能是函数
      var userDefine = computed[key]; // 依赖的属性变化了就重新取值 (get)

      var getter = typeof userDefine === 'function' ? userDefine : userDefine.get; // 每个计算属性本质就是watcher
      // lazy:true 表示默认不执行 (computed中的函数默认不执行)
      // watcher[key] 每个属性对应一个watcher, watcher和属性 做一个映射
      // computed中有多少个计算属性，就有多少个watcher

      watcher[key] = new Watcher(vm, getter.bind(vm), function () {}, {
        lazy: true
      }); // 将key 定义在vm上

      definedComputed(vm, key, userDefine);
    }
  }

  function definedComputed(vm, key, userDefine) {
    var sharedProperty = {}; // 判断userDefine是不是一个函数，
    // userDefine表示computed中定义的计算属性可能是函数，可能是对象

    if (typeof userDefine === 'function') {
      sharedProperty.get = userDefine;
    } else {
      sharedProperty.get = createComputedGetter(key);

      sharedProperty.set = userDefine.set || function () {};
    } // computed就是一个defineProperty


    Object.defineProperty(vm, key, sharedProperty);
  }

  function createComputedGetter(key) {
    // 取计算属性的值走的是这个函数
    return function computedGetter() {
      // this._computedWatchers包含所有的计算属性
      // 通过key可以拿到对应的watcher
      var watcher = this._computedWatchers[key];

      if (watcher.dirty) {
        // 根据diry属性，来判断是否需要重新求值
        // 如果这个 watcher.dirty 是脏的，就取一次值
        watcher.evaludate();
      } // 如果当前取完值后，Dep.target还有值 需要继续向上收集


      if (Dep.target) {
        // 让当前的计算属性也做一次依赖收集，Watcher里对应了多个dep
        // 计算属性watcher内部有两个dep，firstName和lastName
        watcher.depend();
      } // 缓存的值


      return watcher.value;
    };
  }

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      // el 和 data
      var vm = this; // 谁调用就指向谁的构造器

      vm.$options = mergeOptions(vm.constructor.options, options); // 后续对options进行扩展
      // 数据初始化之前调用beforeCreated

      callHook(vm, 'beforeCreate'); // 对数据进行初始化 watch,props,computed,data ...

      initState(vm); // vm.$options.data  vm.$options.computed ...
      // 数据初始化之后执行created方法

      callHook(vm, 'created'); // 看用户的实例上有没有el这样的属性
      // 有el属性就调用 vm.$mount
      // 没有 el 属性就是 new Vue().$mount('el')

      if (vm.$options.el) {
        // 将数据挂载到这个模板上
        vm.$mount(vm.$options.el);
      }
    };

    Vue.prototype.$mount = function (el) {
      var vm = this;
      el = document.querySelector(el);
      vm.$el = el;
      var options = vm.$options;
      /**
       * 把模板转换转换成对应的渲染函数，还可以引入虚拟DOM的概念，
       * 通过渲染函数产生虚拟节点，用户更新数据了，更新虚拟DOM，
       * 最后再产生真实节点去更新视图
       */

      if (!vm.$options.render) {
        // 没有render就使用template
        var template = options.template;

        if (!template && el) {
          // 用户没有传递template就取el的内容作为模板
          template = el.outerHTML;
        }

        var render = compilerToFunction(template); // options.render就是渲染函数
        // 谁调用render render中的 with(this) 就指向谁

        options.render = render;
      } // options.render就是渲染函数
      // 调用render方法，最终渲染成真实DOM，替换掉页面的内容
      // 组件的挂载流程
      // 将组件实例，挂载到el元素上


      mountComponent(vm);
    };
  }

  function createElement(vm, tag) {
    var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    for (var _len = arguments.length, children = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
      children[_key - 3] = arguments[_key];
    }

    // 如果tag是组件 应该渲染一个组件的vnode
    // isReservedTag 看是不是原生标签
    if (isReservedTag(tag)) {
      return vnode(tag, data, data.key, children, undefined);
    } else {
      var Ctor = vm.$options.components[tag];
      return createComponent(tag, data, data.key, children, Ctor, vm);
    }
  } // 创建组件的虚拟节点, 为了区分组件和元素 data.hook | componentOptions

  function createComponent(tag, data, key, children, Ctor, vm) {
    // 组件的构造函数
    if (isObject(Ctor)) {
      Ctor = vm.$options._base.extend(Ctor); // Vue.$options._base = Vue
    }

    data.hook = {
      // 等会渲染组件的时候，需要初始化此方法
      init: function init(vnode) {
        // 初始化组件
        // new Sub 会用此选项和组件的配置进行合并
        var vm = vnode.componentInstance = new Ctor({
          _isComponent: true
        });
        vm.$mount(); // 组件挂载完成后 会在vm.$el => <template><button></button></template>
      }
    };
    return vnode("vue-component-".concat(tag), data, key, undefined, undefined, {
      Ctor: Ctor,
      children: children
    }, vm);
  }

  function createTextElement(vm, text) {
    return vnode(undefined, undefined, undefined, undefined, text);
  } // 创建虚拟DOM
  // componentOptions 组件的选项

  function vnode(tag, data, key, children, text, componentOptions, vm) {
    return {
      tag: tag,
      data: data,
      key: key,
      children: children,
      text: text,
      vm: vm // ...

    };
  }

  function renderMixin(Vue) {
    // 元素，数据，孩子
    // createElement
    Vue.prototype._c = function (tagName, data) {
      for (var _len = arguments.length, children = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        children[_key - 2] = arguments[_key];
      }

      var vm = this;
      return createElement.apply(void 0, [vm].concat(Array.prototype.slice.call(arguments)));
    }; // 文本
    // createTextElement


    Vue.prototype._v = function (text) {
      var vm = this;
      return createTextElement(vm, text);
    }; // 变量


    Vue.prototype._s = function (val) {
      return _typeof(val) === 'object' ? JSON.stringify(val) : val;
    };

    Vue.prototype._render = function () {
      var vm = this; // 这里的render就是挂载到用户选项上的render，同时也有可能是用户写的

      var render = vm.$options.render; // 调用render生成虚拟DOM

      var vnode = render.call(vm);
      return vnode;
    };
  }

  function Vue(options) {
    // options为用户传入的选项
    this._init(options); // 初始化操作

  }

  initMixin(Vue);
  renderMixin(Vue); // _render

  lifecycleMixin(Vue); // _update

  stateMxin(Vue); // 状态混入
  // 在类上扩展
  // 初始化全局API

  initGlobalAPI(Vue);

  var oldTemplate = "<div  style=\"color:green\">{{message}}</div>";
  var vm1 = new Vue({
    data: {
      message: "hello"
    }
  });
  var render1 = compilerToFunction(oldTemplate);
  var oldVnode = render1.call(vm1); // 虚拟dom
  // 真实节点

  document.body.appendChild(createElm(oldVnode));
  var newTemplate = "<div></div>";
  var vm2 = new Vue({
    data: {
      message: 'zf'
    }
  });
  var render2 = compilerToFunction(newTemplate); // 虚拟节点

  var newVnode = render2.call(vm2); // 虚拟dom

  document.body.appendChild(createElm(newVnode)); // 根据新的虚拟节点更新老的节点，老节点能复用尽量复用

  setTimeout(function () {
    patch(oldVnode, newVnode);
  }, 2000);

  return Vue;

}));
//# sourceMappingURL=vue.js.map
