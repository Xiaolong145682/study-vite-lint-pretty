import enquirer from 'enquirer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
// fileURLToPath：确保正确解码百分比编码的字符 以及确保跨平台有效的绝对路径字符串。
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function getOptions() {
  const OPTIONS = [];
  // NOTE: 读取模版文件夹下的所有模版文件
  fs.readdirSync(path.join(__dirname, 'templates')).forEach((template) => {
    // NOTE: 获取模版文件的名称，并去掉后缀
    const { name } = path.parse(path.join(__dirname, 'templates', template));
    // NOTE: 将模版文件的名称添加到选项列表中
    OPTIONS.push(name);
  });
  return OPTIONS;
}

export function askForProjectType() {
  return enquirer.prompt([
    {
      type: 'select',
      name: 'projectType',
      message: 'What type of project do you have?',
      choices: getOptions(),
    },
    {
      type: 'select',
      name: 'packageManager',
      message: 'What package manager do you use?',
      choices: ['npm', 'yarn', 'pnpm'],
    },
  ]);
}
