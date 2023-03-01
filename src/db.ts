import path from 'path';
import fs from 'fs';
import { map, isObject } from 'lodash';
import chain from 'lodash/chain.js';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { SMLType } from './type.d.js';
import { __dirname } from './utils.js';

export interface KeysData {
  keys: Array<SMLType>;
}

const location = path.join(__dirname, `/.key/key.json`);
const adapter = new JSONFile<KeysData>(location);
const db = new Low<KeysData>(adapter);

const obj = {
  save: async (params: SMLType, opt: { filter?: string[] } = {}) => {
    const filterData: { [key: string]: any } = {};

    if (opt && opt.filter) {
      map(opt.filter, (i) => {
        filterData[i] = params[i];
      });
    }

    const findData = await obj.get(filterData);

    if (findData) {
      throw new Error('已经生成相同的服务器信息');
    } else {
      // if (params.select === 'password') {
      // } else {
      // }
      obj.set(params);
      const result = await obj.get();
      return result;
    }
  },
  delete: <T = { [key: string]: any }>(params: T) => {
    return db.read().then(() => {
      if (isObject(params)) {
        const data = chain(db.data).get('keys').remove(params).value();
        db.write();
        return data;
      }
      // 返回删除的数据
      throw new Error('请删除正确的信息');
    });
  },
  get: async (params?: { [key: string]: any }) => {
    console.log('db', db);
    if (db && db.data) {
      await db.read();
    } else {
      throw new Error('文件不存在');
    }
    const get = chain(db.data).get('keys');
    if (isObject(params)) {
      return get.find(params).value();
    }
    return get.value();

    // console.log('----get', params, data);
    // return data;
  },
  set: async (params: any) => {
    // console.log('----set', params);
    db.data ||= { keys: [] };
    db.data?.keys.push(params);
    await db.write();
  },
};

export default obj;
