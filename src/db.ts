import { Low, JSONFile } from "lowdb";
import path from "path";
import lodash from "lodash";

export interface SMLType {
  time: number;
  name: string;
  file: string;
  password: string;
  comment: string;
  format: string;
  keyType: boolean;
}

export interface KeysData {
  keys: Array<SMLType>;
}

const __dirname = path.resolve(path.dirname(""));
const location = path.join(__dirname, `/.key/key.json`);
const adapter = new JSONFile<KeysData>(location);
const db = new Low<KeysData>(adapter);

const obj = {
  save: async (params: SMLType, opt: { filter?: string[] } = {}) => {
    const filterData: { [key: string]: any } = {};
    if (opt.filter) {
      lodash.map(opt.filter, (i) => {
        filterData[i] = params[i];
      });
    }

    const findData = await obj.get(filterData);
    console.log("--------", findData);
    if (findData) {
      throw "有相同的值";
    } else {
      db.data?.keys.push(params);
      db.write();
      const result = obj.get();
      return result;
    }
  },
  delete: (time: number) => {
    return new Promise((resolve, reject) => {
      db.read().then(() => {
        const data = lodash.chain(db.data).get("keys").remove({ time }).value();
        db.write();
        // 返回删除的数据
        resolve(data);
      });
    });
  },
  get: async (parmas?: { [key: string]: any }) => {
    await db.read();
    const data = lodash.chain(db.data).get("keys").find(parmas).value();
    return data;
  },
};
export default obj;
