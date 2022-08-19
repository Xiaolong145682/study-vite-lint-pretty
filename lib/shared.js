import * as babel from '@babel/core';
import { blankLine, eslintImport, eslintPluginCall } from './ast.js';

export const commonPackages = [
  'eslint',
  'prettier',
  'eslint-plugin-prettier',
  'eslint-config-prettier',
  'vite-plugin-eslint',
];

export const eslintConfig = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  overrides: [],
};

export const prettierConfig = {
  trailingComma: 'es5',
  tabWidth: 2,
  semi: true,
  singleQuote: true,
};

export const eslintIgnore = ['node_modules', 'dist'];

export function viteEslint(code) {
  // NOTE: 将传入的代码转换为 AST
  const ast = babel.parseSync(code, {
    // 指示代码应该被解析的模式，可以是 'script'、'module' 或 'unambiguous'。
    sourceType: 'module',
    // 是否在生成的 AST 中输出注释
    comments: false,
  });
  // 取出主题程序部分的 AST
  const { program } = ast;

  // 取出引入依赖（import）的 AST
  const importList = program.body
    .filter((body) => {
      return body.type === 'ImportDeclaration';
    })
    .map((body) => {
      // 删除注释的 AST
      delete body.trailingComments;
      return body;
    });

  // NOTE: 查询是否引入了 vite-plugin-eslint，若已经引入了，就直接返回传人的代码 code
  if (importList.find((body) => body.source.value === 'vite-plugin-eslint')) {
    return code;
  }

  // NOTE: 取出非 import 部分的代码的 AST
  const nonImportList = program.body.filter((body) => {
    return body.type !== 'ImportDeclaration';
  });
  // NOTE: 取出 「export default」声明的代码 AST
  const exportStatement = program.body.find(
    (body) => body.type === 'ExportDefaultDeclaration'
  );

  // NOTE: 判断当前声明的类型是否为 函数调用表达式
  if (exportStatement.declaration.type === 'CallExpression') {
    // NOTE: 取出函数调用表达式的入参
    const [argument] = exportStatement.declaration.arguments;
    // NOTE: 判断入参的类型是否为对象表达式
    if (argument.type === 'ObjectExpression') {
      // NOTE: 取出对象表达式的 plugins 属性
      const plugin = argument.properties.find(
        ({ key }) => key.name === 'plugins'
      );

      if (plugin) {
        // NOTE: 把 vite-plugin-eslint 插件加入到 plugins 属性中
        plugin.value.elements.push(eslintPluginCall);
      }
    }
  }

  importList.push(eslintImport);
  importList.push(blankLine);
  program.body = importList.concat(nonImportList);

  ast.program = program;

  // NOTE: 将 AST 转换为代码
  return babel.transformFromAstSync(ast, code, { sourceType: 'module' }).code;
}
