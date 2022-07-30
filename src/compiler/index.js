// HTML解析成DOM树
import { generate } from "./generate";
import { parseHTML } from "./parser";
// <div id="app"> {{name}} </div>
export function compilerToFunction(template) {
  let ast = parseHTML(template);

  // 代码生成
  const code = generate(ast);
  // code中可能会用到数据，数据在vm上
  const render = new Function(`with(this){
    return ${code}
  }`)
  return render
}
