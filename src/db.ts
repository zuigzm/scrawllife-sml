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
    if (findData) {
      throw "已经生成相同的服务器信息";
    } else {
      obj.set(params);
      const result = await obj.get();
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
  get: async (params?: { [key: string]: any }) => {
    console.log("----get", params);
    await db.read();
    const data = lodash.chain(db.data).get("keys").find(params).value();
    return data;
  },
  set: async (params: any) => {
    console.log("----set", params);
    db.data ||= { keys: [] };
    db.data?.keys.push(params);
    await db.write();
  },
};
export default obj;
