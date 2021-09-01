import ORA from "ora";
import chalk from "chalk";
import set from "./set";
import del from "./del";
import serverList from "./server";
import ssh from "./ssh";

const ora = ORA();

require("yargs")
  .usage("$0 <cmd> [args]")
  .command(
    "set [server]",
    "添加一台新的服务器配置",
    (yargs: any) => {
      ora.start("Loading...");
      return yargs.option("server", {
        alias: "S",
        describe: "请设置正确的服务器配置",
      });
    },
    (argv: any) => {
      ora.stop();
      if (argv.server) {
        set().then((answers: any) => {
          if (answers) {
            ora.succeed(chalk.green("设置服务器信息成功!"));
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
          ora.warn(chalk.yellow("暂时未获取到服务器信息"));
        }
      });
  })
  .command("del", "删除服务器", (argv) => {
    del().catch((err) => {
      if (err) {
        ora.warn(chalk.yellow("暂时未获取到服务器信息"));
      }
    });
  })
  .help().argv;
