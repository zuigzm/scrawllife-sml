import inquirer from "inquirer";
import cryptoRandomString from "crypto-random-string";
// import fs from "fs";
import path from "path";
import save from "./save";

const __dirname = path.resolve(path.dirname(""));
const json = path.join(__dirname, "../server.txt");

const questions = [
  {
    type: "input",
    name: "name",
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
    message: "请提供新的注释",
  },
  {
    type: "input",
    name: "format",
    message: "请指定要创建的密钥类型:",
    default: "PEM",
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
          const a = save(answers);

          console.log(a);

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
        }
      });
  });
};
