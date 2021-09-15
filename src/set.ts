import inquirer from "inquirer";
// import fs from "fs";
import path from "path";
import save from "./save";

const __dirname = path.resolve(path.dirname(""));
const json = path.join(__dirname, "../server.txt");

const questions = [
  {
    type: "input",
    name: "name",
    message: "设置服务器别名:",
    default: "服务器名称",
  },
  {
    type: "input",
    name: "server",
    message: "请设置你的服务器:",
    default: "192.168.1.1",
  },
  {
    type: "input",
    name: "port",
    message: "请设置服务器端口号:",
    default: "22",
  },
  {
    type: "input",
    name: "username",
    message: "请选择服务器用户(尽可能不是用root权限登录):",
    default: "root",
  },
  {
    type: "password",
    name: "password",
    message: "自动生成ssh-key(用以下次登录)",
  },
];

export default () => {
  return inquirer.prompt(questions).then((answers) => {
    return inquirer
      .prompt({
        type: "confirm",
        name: "type",
        message: `请确定你的信息!`,
      })
      .then((ft) => {
        if (ft.type) {
          // 给每个账号设置一个时间戳，来区分
          // const params = {
          //   time: Date.now(),
          //   ...answers,
          // };

          // console.log(answers);
          save(answers);
          // const base64 = Buffer.from(JSON.stringify(params), "utf8").toString(
          //   "base64"
          // );

          // // 在文件后面插入新的数据用base64没有值去分割
          // fs.appendFile(json, `${base64}-`, "utf8", (err) => {
          //   if (err) throw err;
          // });

          // // 读取文件
          // fs.readFile(json, "utf8", (err, data) => {
          //   if (err) throw err;
          //   if (!data) data = JSON.stringify([]);
          //   data = JSON.parse(data);
          //   // 每次读取的并且写入的时候，都生成一个唯一id
          //   data.push(answers);
          //   // 简单解决直接覆盖
          //   // fs.writeFile(json, JSON.stringify(data), 'utf8', err => {
          //   // 	if (err) throw err
          //   // })
          // });

          return ft.type;
        }
      });
  });
};
