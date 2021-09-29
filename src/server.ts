import inquirer from "inquirer";
import { Low, JSONFile } from 'lowdb'
import fs from "fs";
import path from "path";

import { KeysData } from "./save";

export default () => {
  const __dirname = path.resolve(path.dirname(""));
  const json = path.join(__dirname, "/.key/key.json");
  const adapter = new JSONFile<KeysData>(json)
  const db = new Low<KeysData>(adapter)

  return new Promise((resolve, reject) => {
    db.read().then(() => {
      const { keys = [] } =  db.data || {};
      if(!keys.length) {
        reject("暂无保存的服务器列表");
      } else {
        resolve(keys);
      }
    })
  }).then((data: any) => {
    return inquirer
      .prompt([
        {
          type: "list",
          name: "time",
          message: "请选择服务器",
          choices: data.map((i:any) => ({
            name: i.name,
            value: i.time,
          })),
        },
      ])
      .then((answers) => {
        const serverList =  data.find((item:any) => item.time === answers.time);
        return {
          select: serverList,
          datas: data,
        };
      });
  });
};
