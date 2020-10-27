#!/usr/bin/env node
const ora = require("ora")();
const chalk = require("chalk");
const set = require("./set");
const del = require("./del");
const serverList = require("./server");
const ssh = require("./ssh");

require("yargs")
  .usage("$0 <cmd> [args]")
  .command(
    "set [server]",
    "添加一台新的服务器配置",
    (yargs) => {
      ora.start("Loading...");
      return yargs.option("server", {
        alias: "S",
        describe: "请设置正确的服务器配置",
      });
    },
    (argv) => {
      ora.stop();
      if (argv.server) {
        set().then((answers) => {
          if (answers) {
            ora.succeed("设置服务器信息成功!");
          }
        });
      }
    }
  )
  .command("list", "服务器选择列表", (argv) => {
    serverList()
      .then(({ select }) => {
        if (select) {
          ssh(select);
        }
      })
      .catch((err) => {
        if (err) {
          console.log(chalk.red("暂时没有服务器列表展示"));
        }
      });
  })
  .command("del", "删除服务器", (argv) => {
    del().catch((err) => {
      if (err) {
        console.log(chalk.red("暂时没有服务器列表展示"));
      }
    });
  })
  .help().argv;
