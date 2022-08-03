const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`; // 匹配标签名的  aa-xxx
const qnameCapture = `((?:${ncname}\\:)?${ncname})`; //  aa:aa-xxx
const startTagOpen = new RegExp(`^<${qnameCapture}`); //  此正则可以匹配到标签名 匹配到结果的第一个(索引第一个) [1]
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配标签结尾的 </div>  [1]
const attribute =
  /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性的

// [1]属性的key   [3] || [4] ||[5] 属性的值  a=1  a='1'  a=""
const startTagClose = /^\s*(\/?)>/; // 匹配标签结束的  />    >
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // {{   xxx  }}

// 构造AST语法树
function createAstElement(tagName, attrs) {
  return {
    tag: tagName,
    type: 1,
    children: [],
    parent: null,
    attrs,
  };
}

let root = null; //树根
let stack = [];
// 开始标签
function start(tagName, attributes) {
  let parent = stack[stack.length - 1];
  let element = createAstElement(tagName, attributes);
  if (!root) {
    root = element;
  }
  if(parent){
    element.parent = parent; // 当放入栈中的时候记录父级元素
    parent.children.push(element); // 存放子集元素
  }
  stack.push(element);
}
// 结束标签
function end(endTagName) {
  let last = stack.pop();
  if (last.tag !== endTagName) {
    // 标签闭合有误
    throw new SyntaxError("标签闭合有误");
  }
}
// 文本标签
function text(text) {
  text = text.replace(/\s/g, "");
  let parent = stack[stack.length - 1];
  if (parent) {
    parent.children.push({
      type: 3,
      text,
    });
  }
}

// html = <div id="app"></div>
export function parseHTML(html) {
  // 前进方法
  function advance(len) {
    html = html.substring(len);
  }
  function parseStartTag() {
    const start = html.match(startTagOpen);
    if (start) {
      const match = {
        tagName: start[1],
        attrs: [],
      };
      advance(start[0].length);
      let end;
      let attr;
      // 1要有属性 2，不能为开始的结束标签 <div>
      while (
        !(end = html.match(startTagClose)) &&
        (attr = html.match(attribute))
      ) {
        match.attrs.push({
          name: attr[1],
          value: attr[3] || attr[4] || attr[5],
        });
        advance(attr[0].length);
      } // <div id="app" a=1 b=2 >
      if (end) {
        advance(end[0].length);
      }
      return match;
    }
    return false;
  }
  // 看要解析的内容是否存在，如果存在就不停的解析
  while (html) {
    // 解析标签和文本
    let index = html.indexOf("<");
    if (index == 0) {
      // 解析开始标签 并且把属性也解析出来  </div>
      const startTagMatch = parseStartTag();
      if (startTagMatch) {
        // 开始标签
        start(startTagMatch.tagName, startTagMatch.attrs);
        continue;
      }
      let endTagMatch;
      if ((endTagMatch = html.match(endTag))) {
        // 结束标签
        end(endTagMatch[1]);
        advance(endTagMatch[0].length);
        continue;
      }
    }
    // 文本截取:  {{name}}</div>
    if (index > 0) {
      let chars = html.substring(0, index);
      text(chars);
      advance(chars.length);
    }
  }
  return root;
}
