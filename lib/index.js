import chalk from 'chalk';
import gradient from 'gradient-string';
import { createSpinner } from 'nanospinner';
import enquirer from 'enquirer';

const askForProjectType = () => {
  return enquirer.prompt([
    {
      type: 'select',
      name: 'projectType',
      message: '请选择你的项目类型?',
      choices: ['vue', 'react', 'vue-ts', 'react-ts'],
    },
    {
      type: 'select',
      name: 'author',
      message: '请选择你的作者?',
      choices: ['卧龙', '凤雏', '鸣鹤'],
    },
    {
      type: 'select',
      name: 'packageManager',
      message: '请选择你的包管理器?',
      choices: ['npm', 'yarn', 'pnpm'],
    },
  ]);
};

async function run1() {
  console.log(chalk.bold(gradient.teen('\n🚀 嗯...怎么不算呢\n')));
  try {
    const answers = await askForProjectType();
    const projectType = answers.projectType;
    const author = answers.author;
    const packageManager = answers.packageManager;
    console.log(chalk.green(`\n🚀 好的,你选择了 ${projectType} 项目类型`));
    console.log(chalk.green(`🚀 好的,你选择了 ${author} 作者`));
    console.log(chalk.green(`🚀 好的,你选择了 ${packageManager} 包管理器`));
  } catch (error) {
    console.log(chalk.blue('\n👋 Goodbye!'));
    return;
  }
  const spinner = createSpinner('安装中...');
  spinner.start();
  setTimeout(() => {
    spinner.success({ text: chalk.bold.green('安装成功！'), mark: '✔' });
    console.log(chalk.blue('\n👋 Goodbye!'));
  }, 2000);
}

run1();
