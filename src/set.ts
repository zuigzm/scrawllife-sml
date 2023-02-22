import inquirer from 'inquirer';
import ORA from 'ora';
import _ from 'lodash';
import save from './save';
import db from './db';

const questions = [
  {
    type: 'input',
    name: 'serverName',
    message: '设置服务器名称:',
    default: '服务器名称',
  },
  {
    type: 'input',
    name: 'address',
    message: '设置服务器:',
    default: 'locahost',
  },
  {
    type: 'input',
    name: 'port',
    message: '设置端口号',
    default: 22,
  },
  {
    type: 'input',
    name: 'user',
    message: '用户名称:',
    default: 'root',
  },
  {
    type: 'input',
    name: 'file',
    message: '设置ssh-keygen名称:',
    default: 'sshkey',
  },
  {
    type: 'input',
    name: 'password',
    message: '设置ssh-keygen密码:（不设置即无秘登录）',
    // default: cryptoRandomString({ length: 12, type: 'base64' }),
  },
  {
    type: 'input',
    name: 'comment',
    message: '请提供新的注释:',
  },
  {
    type: 'input',
    name: 'format',
    message: '请指定要创建的密钥类型:',
    default: 'PEM',
  },
  {
    type: 'confirm',
    name: 'keyType',
    message: '是否隐藏秘钥信息反馈?',
  },
];

export default async () => {
  const ora = ORA();
  try {
    const answers = await inquirer.prompt(questions);
    const ft = await inquirer.prompt({
      type: 'confirm',
      name: 'type',
      message: `请确定你的信息!`,
    });

    if (ft.type) {
      ora.start('生成ssh-keygen中...');
      // todo: https://github.com/typicode/lowdb/issues/380
      // const adapter = new JSONFile<KeysData>(json)
      // 给每个账号设置一个时间戳，来区分
      const params = {
        time: Date.now(),
        ...answers,
      };

      // 生成秘钥成功后，添加秘钥信息
      const saveKey = await save(params, () => {
        ora.info(' 正在将秘钥传入服务器，请输入服务器密码');
      });

      if (saveKey) {
        const saveData = await db.save(params, {
          filter: ['address', 'serverName'],
        });

        if (saveData) {
          ora.succeed('创建秘钥成功');
        }
      }
    }
  } catch (err: any) {
    ora.fail(err && err.toString());
  }
};
