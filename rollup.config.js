/* eslint-disable import/no-extraneous-dependencies */
// /* eslint-disable import/no-extraneous-dependencies */
import path from 'path';
import babel, { getBabelOutputPlugin } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';
// import typescript from '@rollup/plugin-typescript';

import pkg from './package.json' assert { type: 'json' };

const extensions = ['.js', '.ts'];

const resolve = (...args) => {
  return path.resolve(__dirname, ...args);
};

export default {
  input: resolve('./src/index.ts'),
  output: {
    file: resolve('./', pkg.main), // 为了项目的统一性，这里读取 package.json 中的配置项
    format: 'esm',
    banner: '#!/usr/bin/env node',
    sourceMap: true,
    plugins: [
      getBabelOutputPlugin({
        presets: [
          [
            '@babel/preset-env',
            {
              useBuiltIns: 'usage',
            },
          ],
          '@babel/preset-typescript',
        ],
        plugins: ['@babel/plugin-transform-runtime', 'lodash'],
      }),
    ],
  },
  plugins: [
    nodeResolve({
      extensions,
      exportConditions: ['node'],
    }),
    commonjs({ extensions }),
    json(),
    babel({
      exclude: ['node_modules/**', 'bin/**'],
      include: ['src/**'],
      babelHelpers: 'bundled',
      extensions,
    }),
    terser(),
  ],
  external: ['lodash', 'lowdb'],
};
