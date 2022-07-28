import babel from 'rollup-plugin-babel'
export default {
    input : './src/index.js',
    output: {
        format: 'umd',   // window.vue 支持amd和commonjs规范
        name: 'Vue',
        file: 'dist/vue.js',
        sourcemap: true // 配置代码映射
    },
    plugins:[
        // 排除node_modules/** 下的文件
        babel({
            exclude:'node_modules/**'
        })
    ]
}