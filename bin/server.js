const inquirer = require("inquirer");
const fs = require("fs");
const path = require("path");
const json = path.join(__dirname, "../server.txt");

module.exports = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(json, "utf8", (err, data) => {
      if (err) reject(err);

      if (!data) {
        reject("暂无保存的服务器列表");
      } else {
        data = data
          .split("-")
          .filter((i) => i)
          .map((item) => {
            if (item.length > 0) {
              return JSON.parse(Buffer.from(item, "base64").toString("utf8"));
            }
          });

        resolve(data);
      }
    });
  }).then((data) => {
    return inquirer
      .prompt([
        {
          type: "list",
          name: "time",
          message: "请选择服务器",
          choices: data.map((i) => ({
            name: i.name,
            value: i.time,
          })),
        },
      ])
      .then((answers) => {
        const serverList = {};
        data.map((item) => {
          if (item.time === answers.time) {
            Object.assign(serverList, item);
          }
        });
        return {
          select: serverList,
          datas: data,
        };
      });
  });
};
