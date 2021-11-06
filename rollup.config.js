/* eslint-disable import/no-extraneous-dependencies */
import path from 'path';
import { babel } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

const extensions = ['.js', '.ts'];

const resolve = (...args) => {
  return path.resolve(__dirname, ...args);
};

module.exports = {
  input: resolve('./src/index.ts'),
  output: {
    file: resolve('./', pkg.main), // 为了项目的统一性，这里读取 package.json 中的配置项
    format: 'cjs',
    // plugins: [
    //   getBabelOutputPlugin({
    //     babelHelpers: "bundled",
    //     configFile: path.resolve(__dirname, "babel.config.js"),
    //   }),
    // ],
    banner: '#!/usr/bin/env node',
  },
  plugins: [
    commonjs(),
    nodeResolve({
      extensions,
      modulesOnly: true,
    }),
    babel({
      exclude: ['node_modules/**', 'bin/**'],
      presets: ['@babel/preset-env', '@babel/preset-typescript'],
      plugins: ['@babel/plugin-transform-runtime'],
      babelHelpers: 'runtime',
      extensions,
    }),
    terser(),
  ],
};
