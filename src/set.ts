import inquirer from 'inquirer';
import { assign } from 'lodash';
import ORA from 'ora';
import save from './save.js';
import db from './db.js';

import { SMLType } from './type.d.js';

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
    default: 'localhost',
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
    type: 'list',
    name: 'select',
    message: '请选择登录方式（默认口令登录）',
    default: 'password',
    choices: [
      {
        name: '口令登录',
        value: 'password',
      },
      {
        name: '秘钥登录',
        value: 'keygen',
      },
    ],
  },
];

const passwordFlow = [
  {
    type: 'password',
    name: 'password1',
    message: '请输入登录口令',
    validate: (aws: string) => {
      if (aws) {
        return true;
      }
      return false;
    },
  },
  {
    type: 'password',
    name: 'password2',
    message: '请再次输入登录口令',
    validate: (aws: string) => {
      if (aws) {
        return true;
      }
      return false;
    },
  },
];

const keygenFlow = [
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

const ora = ORA();

export default async () => {
  try {
    let params: SMLType | null = null;
    const answers: SMLType = await inquirer.prompt(questions);
    if (answers.select === 'password') {
      const pwFlowData = await pwFlow(answers);
      // 设置口令步骤
      params = assign(params, pwFlowData);
    } else {
      // 设置秘钥步骤
      const ftFlowData = await ftFlow(answers);
      params = assign(params, ftFlowData);
    }

    if (params) {
      const saveData = await db.save(params, {
        filter: ['serverName'],
      });

      if (saveData) {
        ora.succeed('创建秘钥成功');
      }
    }
  } catch (err: any) {
    ora.fail(err && err.toString());
  }
};

async function pwFlow(answers: SMLType) {
  const passwordFlowData = await inquirer.prompt(passwordFlow);
  if (passwordFlowData.password1 !== passwordFlowData.password2) {
    throw new Error('两次输入的口令不同');
  }
  return assign({}, passwordFlowData, answers);
}

async function ftFlow(answers: SMLType) {
  const keygenFlowData = await inquirer.prompt(keygenFlow);

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
      ...answers,
      ...keygenFlowData,
      time: Date.now(),
    };

    // 生成秘钥成功后，添加秘钥信息
    const saveKey = await save(params, () => {
      ora.info(' 正在将秘钥传入服务器，请输入服务器密码');
    });

    return assign({}, params, saveKey);
  }
}
