import inquirer from "inquirer";
import path from "path";
import { Low, JSONFile } from 'lowdb'
import { KeysData } from "./save";
import serverList from "./server";


// 删除指定服务器
export default () => {
  const __dirname = path.resolve(path.dirname(""));
  const json = path.join(__dirname, "/.key/key.json");
  const adapter = new JSONFile<KeysData>(json)
  const db = new Low<KeysData>(adapter)

  return serverList()
    .then(({ select, datas }) => {
      // 获取指定的服务器 answers
      const d = datas
        .filter((i) => i.time !== select.time)

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
