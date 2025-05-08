import babel, { getBabelOutputPlugin } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import { fileURLToPath } from 'node:url';
import path from 'path';
// import typescript from '@rollup/plugin-typescript';
import fs from 'fs';

// 使用 fs 读取 package.json 而不是使用 import assertions
const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

// 创建一个插件来处理 ES 模块中的 __dirname 和 __filename
function esmDirname() {
  return {
    name: 'esm-dirname',
    renderChunk(code) {
      // 替换 __dirname 的使用，使用 import.meta.url 代替 require
      code = code.replace(
        /\b__dirname\b/g,
        `(typeof document === 'undefined' ? new URL(import.meta.url).pathname.substring(process.platform === 'win32' ? 1 : 0).split('/').slice(0, -1).join('/') : null)`,
      );

      // 替换 __filename 的使用
      code = code.replace(
        /\b__filename\b/g,
        `(typeof document === 'undefined' ? new URL(import.meta.url).pathname.substring(process.platform === 'win32' ? 1 : 0) : null)`,
      );

      return code;
    },
  };
}

const extensions = ['.js', '.ts'];

const resolve = (...args) => {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), ...args);
};

export default {
  input: resolve('./src/index.ts'),
  output: {
    file: resolve('./', pkg.main), // 为了项目的统一性，这里读取 package.json 中的配置项
    format: 'esm',
    banner: '#!/usr/bin/env node',
    plugins: [getBabelOutputPlugin({})],
  },
  plugins: [
    nodeResolve({
      extensions,
      exportConditions: ['node'],
    }),
    babel({
      babelHelpers: 'runtime',
      presets: [
        [
          '@babel/preset-env',
          {
            useBuiltIns: 'usage',
            corejs: 3,
          },
        ],
        '@babel/preset-typescript',
      ],
      exclude: ['node_modules/**', 'bin/**'],
      include: ['src/**'],
      plugins: ['@babel/plugin-transform-runtime', 'lodash'],
      extensions,
    }),
    commonjs(),
    json(),
    terser(),
    esmDirname(), // 添加 ESM __dirname 插件
  ],
  external: ['lodash', 'ssh-keygen-lite', 'child_process', 'path', 'os', 'fs'],
};
