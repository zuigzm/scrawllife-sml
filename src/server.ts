import inquirer from 'inquirer';
import { isArray, map, find } from 'lodash';
import db from './db';
import { SMLType } from './type.d';

export default async (): Promise<{ select: SMLType; datas: SMLType[] }> => {
  const data: any = await db.get();
  if (!isArray(data)) {
    throw new Error('暂无保存的服务器列表');
  }

  if (!(data && data.length)) {
    throw new Error('暂无保存的服务器列表');
  }

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'time',
      message: '请选择服务器',
      choices: map(data, (i: any) => ({
        name: i.serverName,
        value: i.time,
      })),
    },
  ]);

  const serverList = find(data, (item: any) => item.time === answers.time);
  return {
    select: serverList,
    datas: data,
  };
};
