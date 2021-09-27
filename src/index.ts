import ORA from "ora";
import chalk from "chalk";
import Yargs from "yargs";
import { hideBin } from "yargs/helpers";
import set from "./set";
import del from "./del";
import serverList from "./server";
import ssh from "./ssh";
import save from "./save";

const ora = ORA();

Yargs(hideBin(process.argv))
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
        set()
          .then((answers: any) => {
            if (answers) {
              ora.succeed(chalk.green("设置服务器信息成功!"));
            }
          })
          .catch((err) => {
            console.log("错误");
          });
      }
    }
  )
  .command("list", "服务器选择列表", (argv: any) => {
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
  .command("del", "删除服务器", (argv: any) => {
    del().catch((err) => {
      if (err) {
        ora.warn(chalk.yellow("暂时未获取到服务器信息"));
      }
    });
  })
  .command("test", "测试", () => {
    const server = {
      server: "211.159.175.227",
      port: 19022,
      username: "zuigzm",
      password: "yiwang13",
    };

    save(server);
  })
  .demandCommand(1).argv;
