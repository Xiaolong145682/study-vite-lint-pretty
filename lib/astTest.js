import { viteEslint } from './shared.js';
import fs from 'fs';
import path from 'path';

const projectDirectory = process.cwd();

const viteFile = path.join(projectDirectory, 'vite.config.ts');
const viteConfig = viteEslint(fs.readFileSync(viteFile, 'utf8'));

console.log(viteConfig);
