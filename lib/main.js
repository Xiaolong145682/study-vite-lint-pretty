#!/usr/bin/env node

import chalk from 'chalk';
import gradient from 'gradient-string';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { createSpinner } from 'nanospinner';
import {
  commonPackages,
  eslintConfig,
  eslintIgnore,
  prettierConfig,
  viteEslint,
} from './shared.js';
import { askForProjectType } from './utils.js';

const projectDirectory = process.cwd();

const eslintFile = path.join(projectDirectory, '.eslintrc.json');
const prettierFile = path.join(projectDirectory, '.prettierrc.json');
const eslintIgnoreFile = path.join(projectDirectory, '.eslintignore');

async function run() {
  console.log(
    chalk.bold(
      gradient.morning('\n🚀 Welcome to Eslint & Prettier Setup for Vite!\n')
    )
  );
  let projectType, packageManager;

  try {
    /**
     *  NOTE:
     * 通过命令行交互的形式，获取用户的应用类型 projectType，包管理工具 packageManager
     * 应用类型主要提供了以下可选值：
     * react、react-ts、vue、vue-ts
     * 包管理工具主要提供了以下可选值：
     * yarn、npm、pnpm
     */
    const answers = await askForProjectType();
    projectType = answers.projectType;
    packageManager = answers.packageManager;
  } catch (error) {
    console.log(chalk.blue('\n👋 Goodbye!'));
    return;
  }
  /**
   * NOTE:
   * 通过选择的应用类型 projectType，同步读取对应的配置模版，
   * 获取需要依赖的包，以及对应的 eslint 配置信息
   */
  const { packages, eslintOverrides } = await import(
    `./templates/${projectType}.js`
  );

  // NOTE: 获取所有依赖的包
  const packageList = [...commonPackages, ...packages];
  // NOTE: 将重模版中获取的 eslint 配置信息覆盖到默认配置上
  const eslintConfigOverrides = [...eslintConfig.overrides, ...eslintOverrides];
  // NOTE: 整理所需的 eslint 配置信息
  const eslint = { ...eslintConfig, overrides: eslintConfigOverrides };

  const commandMap = {
    npm: `npm install --save-dev ${packageList.join(' ')}`,
    yarn: `yarn add --dev ${packageList.join(' ')}`,
    pnpm: `pnpm install --save-dev ${packageList.join(' ')}`,
  };
  const viteJs = path.join(projectDirectory, 'vite.config.js');
  const viteTs = path.join(projectDirectory, 'vite.config.ts');
  const viteMap = {
    vue: viteJs,
    react: viteJs,
    'vue-ts': viteTs,
    'react-ts': viteTs,
  };

  // NOTE: 获取 vite 配置文件的绝对路径
  const viteFile = viteMap[projectType];
  // NOTE: 读取 vite 配置文件，并引入 eslint 配置信息
  const viteConfig = viteEslint(fs.readFileSync(viteFile, 'utf8'));
  const installCommand = commandMap[packageManager];

  if (!installCommand) {
    console.log(chalk.red('\n✖ Sorry, we only support npm、yarn and pnpm!'));
    return;
  }

  // NOTE: 创建一个 spinner，用于显示进度
  const spinner = createSpinner('Installing packages...').start();
  // NOTE: 生成一个 shell，然后在该 shell 中执行“命令”，缓冲任何 生成的输出
  // 处理传递给 exec 函数的 command 字符串 直接由 shell 和特殊字符（因 shell 而异） 需要相应处理：
  exec(`${commandMap[packageManager]}`, { cwd: projectDirectory }, (error) => {
    if (error) {
      // NOTE: 如果执行失败，则终止 spinner，并显示错误信息
      spinner.error({
        text: chalk.bold.red('Failed to install packages!'),
        mark: '✖',
      });
      console.error(error);
      return;
    }

    // NOTE: 写入 eslint 配置文件
    fs.writeFileSync(eslintFile, JSON.stringify(eslint, null, 2));
    // NOTE: 写入 prettier 配置文件
    fs.writeFileSync(prettierFile, JSON.stringify(prettierConfig, null, 2));
    // NOTE: 写入 eslint 忽略文件
    fs.writeFileSync(eslintIgnoreFile, eslintIgnore.join('\n'));
    // NOTE: 写入 vite 配置文件
    fs.writeFileSync(viteFile, viteConfig);

    // NOTE: 执行成功，终止 spinner，并显示成功信息
    spinner.success({ text: chalk.bold.green('All done! 🎉'), mark: '✔' });
    console.log(
      chalk.bold.cyan('\n🔥 Reload your editor to activate the settings!')
    );
  });
}

run().catch((e) => {
  console.error(e);
});
