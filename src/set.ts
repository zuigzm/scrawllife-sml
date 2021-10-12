import inquirer from "inquirer";
import cryptoRandomString from "crypto-random-string";
import path from "path";
import { Low, JSONFile } from "lowdb";
import ORA from "ora";
import save, { KeysData } from "./save";
import db from "./db";

const questions = [
  {
    type: "input",
    name: "name",
    message: "设置服务器名称:",
    default: "服务器名称",
  },
  {
    type: "input",
    name: "address",
    message: "设置服务器:",
    default: "192.168.1.1",
  },
  {
    type: "input",
    name: "file",
    message: "设置ssh-keygen名称:",
    default: "sshkey",
  },
  {
    type: "input",
    name: "password",
    message: "设置ssh-keygen密码:",
    default: cryptoRandomString({ length: 12, type: "base64" }),
  },
  {
    type: "input",
    name: "comment",
    message: "请提供新的注释:",
  },
  {
    type: "input",
    name: "format",
    message: "请指定要创建的密钥类型:",
    default: "PEM",
  },
  {
    type: "confirm",
    name: "keyType",
    message: "是否隐藏秘钥信息反馈?",
  },
];

export default () => {
  const ora = ORA();
  const __dirname = path.resolve(path.dirname(""));
  const json = path.join(__dirname, "/.key/key.json");
  return inquirer.prompt(questions).then((answers) => {
    return inquirer
      .prompt({
        type: "confirm",
        name: "type",
        message: `请确定你的信息!`,
      })
      .then((ft) => {
        if (ft.type) {
          ora.start("生成ssh-keygen中...");
          // todo: https://github.com/typicode/lowdb/issues/380
          // const adapter = new JSONFile<KeysData>(json)
          // 给每个账号设置一个时间戳，来区分
          const params = {
            time: Date.now(),
            ...answers,
          };
          db.save(params)
            .then((data) => {
              console.log(data);
              save(params, () => {
                ora.succeed("生成秘钥成功");
              });
            })
            .catch((err) => {
              console.log(err);
              ora.fail("错误了");
            });
        }
      });
  });
};
