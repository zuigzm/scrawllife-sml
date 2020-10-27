const fs = require("fs");
const path = require("path");
const inquirer = require("inquirer");
const json = path.join(__dirname, "../server.txt");
const serverList = require("./server");

// 删除指定服务器
module.exports = () => {
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
