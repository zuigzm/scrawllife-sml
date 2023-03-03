import path from 'path';
import { fileURLToPath } from 'node:url';
import babel, { getBabelOutputPlugin } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';
// import typescript from '@rollup/plugin-typescript';

import pkg from './package.json' assert { type: 'json' };

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
  ],
  external: ['lodash', 'ssh-keygen-lite', 'node-pty'],
};
