import inquirer from "inquirer";
import fs from "fs";
import path from "path";
import serverList from "./server";

const __dirname = path.resolve(path.dirname(""));
const json = path.join(__dirname, "../server.txt");

// 删除指定服务器
export default () => {
  return serverList()
    .then(({ select, datas }) => {
      // 获取指定的服务器 answers
      const d = datas
        .filter((i) => i.time !== select.time)
        .map((i) => Buffer.from(JSON.stringify(i), "utf8").toString("base64"));

      // 直接复写数据
      return d;
    })
    .then((data) => {
      return inquirer
        .prompt({
          type: "confirm",
          name: "type",
          message: `确认删除该服务器？`,
        })
        .then((ft) => {
          if (ft.type) {
            fs.writeFile(json, data.join("-"), "utf8", (err) => {
              if (err) throw err;
            });

            return ft.type;
          }
        });
    });
};
