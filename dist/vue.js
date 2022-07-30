(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

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
      //   console.log(tagName, attributes);
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
    } // html = <div id="app"></div>


    function parseHTML(html) {
      // 前进方法
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
      }]);

      return Dep;
    }();
    Dep.target = null;
    function pushTarget(wathcer) {
      Dep.target = wathcer;
    }
    function popTarget() {
      Dep.target = null;
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
        this.exprOrfn = exprOrfn;
        this.cb = cb;
        this.options = options; // 默认让exprOrfn默认执行
        // exprOrFn 调用了render方法，要去vm上取值

        this.getter = exprOrfn;
        this.id = id++; // 存放dep

        this.deps = [];
        this.depsId = new Set(); // 默认初始化要取值

        this.get();
      } // 稍后用户更新的时候重新调用get方法


      _createClass(Watcher, [{
        key: "get",
        value: function get() {
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
      }]);

      return Watcher;
    }();

    // 虚拟DOM比对
    function patch(oldVnode, vnode) {
      if (oldVnode.nodeType == 1) {
        var parentElm = oldVnode.parentNode;
        var element = createElm(vnode);
        parentElm.insertBefore(element, oldVnode.nextSibling);
        parentElm.removeChild(oldVnode); // 这里必须返回用虚拟DOM创建的真实DOM，然后挂载的vm.$el上
        // parentElm.removeChild(oldVnode); vm.$el中的元素被删除掉了

        return element;
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
        vnode.el = document.createElement(tag); // 子节点创建
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
        vm.$el = patch(vm.$el, vnode); // console.log(vm,vnode)
      };
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
      // 默认会调用一次
      // 组件挂载的时候会执行此方法
      // 属性是被观察者，属性变了通知视图更新
      // 观察者：刷新页面


      new Watcher(vm, updateComponent, function () {
        console.log("更新视图了");
      }, true); // true这个标识是代表它是一个渲染watcher, 后续有其它的Watcher
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
    }();

    function defineReactive(data, key, value) {
      observe(value);
      var dep = new Dep(); // 每个属性都会有自己的dep

      Object.defineProperty(data, key, {
        get: function get() {
          // watcher和 Dep 对应
          // Dep.target 如果有值说明用户在模板中取值了
          if (Dep.target) {
            // 让dep记住watcher
            dep.depend();
          }

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
        // 看用户的实例上有没有el这样的属性
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
            var render = compilerToFunction(template); // options.render就是渲染函数
            // 谁调用render render中的 with(this) 就指向谁

            options.render = render;
          }
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

      return vnode(tag, data, data.key, children, undefined, vm);
    }
    function createTextElement(vm, text) {
      return vnode(undefined, undefined, undefined, undefined, text, vm);
    } // 创建虚拟DOM

    function vnode(tag, data, key, children, text, vm) {
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

    return Vue;

}));
//# sourceMappingURL=vue.js.map
