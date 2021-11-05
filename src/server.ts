import inquirer from 'inquirer';
import _ from 'lodash'
import db from './db'

export default async () => {

  const data = await db.get()
  if(_.isObject(data)) {
    data.
  }

  return new Promise((resolve, reject) => {
    db.get().then((data) => {
      if (!data.length) {
        reject('暂无保存的服务器列表');
      } else 
        resolve(keys);
      }
    });
  }).then((data: any) => {
    return inquirer
      .prompt([
        {
          type: 'list',
          name: 'time',
          message: '请选择服务器',
          choices: data.map((i: any) => ({
            name: i.name,
            value: i.time,
          })),
        },
      ])
      .then((answers) => {
        const serverList = data.find((item: any) => item.time === answers.time);
        return {
          select: serverList,
          datas: data,
        };
      });
  });
};
