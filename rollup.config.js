import path from "path";
import { babel } from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import pkg from "./package.json";

const extensions = [".js", ".ts"];

const resolve = function (...args) {
  return path.resolve(__dirname, ...args);
};

module.exports = {
  input: resolve("./src/index.ts"),
  output: {
    file: resolve("./", pkg.main), // 为了项目的统一性，这里读取 package.json 中的配置项
    format: "esm",
    // plugins: [
    //   getBabelOutputPlugin({
    //     babelHelpers: "bundled",
    //     configFile: path.resolve(__dirname, "babel.config.js"),
    //   }),
    // ],
    banner: "#!/usr/bin/env node",
  },
  plugins: [
    commonjs(),
    nodeResolve({
      extensions,
      modulesOnly: true,
    }),
    babel({
      exclude: "node_modules/**",
      presets: ["@babel/preset-env", "@babel/preset-typescript"],
      babelHelpers: "bundled",
      extensions,
    }),
  ],
};