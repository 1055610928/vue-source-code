const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // {{   xxx  }}

// _c("div",{id:'app'},'你好')
export function generate(el){
    // 遍历树，将树拼接成字符串
    let children = genChildren(el);
    let code = `_c('${el.tag}',
        ${ el.attrs.length ? genProps(el.attrs) : 'undefined' }
        ${children?`,${children}`:''})`
    return code
}

// 生成子元素
function gen(el){
    if(el.type == 1){
        return generate(el)
    }else {
        let text = el.text
        if(!defaultTagRE.test(text)){
            return `_v('${text}')`;
        }else{
            // hello {{arr}} world  转换成  'hello'+ arr+ 'world'
            let tokens = [];
            let match;
            let lastIndex = defaultTagRE.lastIndex = 0;

            // 看有没有匹配到
            while (match = defaultTagRE.exec(text)) {
                let index = match.index; // 开始索引
                if(index > lastIndex){
                    tokens.push(JSON.stringify(text.slice(lastIndex,index)))
                }
                // _c,_v,_s 
                // _c：创建一个元素
                // _v：里面包含的是一个文本
                // _s：里面是一个变量，使用JSON.string转换一下
                // JSON.stringfy 目的，这里的{{arr}} arr变量可能是对象，
                // 需要进行JSON.stringfy,不然转隐式化过来就是[object Object]
                tokens.push(`_s(${match[1].trim()})`) 
                lastIndex = index + match[0].length
            }
            if(lastIndex < text.length){
                tokens.push(JSON.stringify(text.slice(lastIndex)))
            }
            return `_v(${tokens.join('+')})`
        }

    }
}

function genChildren(el){
    let children = el.children // 获取children
    if(children){
    // _c("div",{id:'app'},_c("div",{id:'ccc'}),_v())
    // _v： 代表创建一个文本
        return children.map(child=>gen(child)).join(',')
    }
    return false
}

// el中的attrs ---> [{'name':'xxx','id':'app'},{'class':'a'}]
function genProps(attrs){ 
    let str = ``;
    for (let i = 0; i < attrs.length; i++) {
        const attr = attrs[i];
        if(attr.name ==='style'){
            // color:red;background:pink
            let styleObj = {}  // {color: 'red', background: 'pink'}
            attr.value.replace(/([^;:]+)\:([^;:]+)/g,function(){
                styleObj[arguments[1]] = arguments[2]
            })
            attr.value = styleObj
        }
        str+= `${attr.name}:${JSON.stringify(attr.value)},`
    }
    return `{${str.slice(0,-1)}}` // str.slice(0,-1) 原因是要去掉最后一位的逗号
}