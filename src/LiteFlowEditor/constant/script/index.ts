/**
 * 脚本代码默认代码
 */
export const placeholderScript: any = {
    "lua": "-- code 0 = success !0 use message throw exception, data match the return type\nlocal result = {}\nresult.code = 0\nresult.message = \"success\"\nreturn result",
    "java": "import com.cmx.extension.model.ExtensionParam;\nimport com.cmx.extension.model.ExtensionData;\n\npublic class {0} {\n  public ExtensionData<String> execute(ExtensionParam param) {\n    return new ExtensionData();\n  }\n}",
}

/**
 * 格式化
 * @param str str 
 * @param args 参数
 * @returns res
 */
export const formatter = (str: string, ...args: any[]) => {
    let length = args.length;
    if (length === 0) {
        return str;
    }
    for (let i = 0; i < length; i++) {
        let re = new RegExp("\\{" + i + "\\}", 'gm');
        str = str.replace(re, args[i]);
    }
    return str;
}