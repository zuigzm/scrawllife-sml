import inquirer from 'inquirer';
import cryptoRandomString from 'crypto-random-string';
import ORA from 'ora';
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
    message: '设置ssh-keygen密码:',
    default: cryptoRandomString({ length: 12, type: 'base64' }),
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

export default () => {
  const ora = ORA();
  return inquirer.prompt(questions).then((answers) => {
    return inquirer
      .prompt({
        type: 'confirm',
        name: 'type',
        message: `请确定你的信息!`,
      })
      .then((ft) => {
        if (ft.type) {
          ora.start('生成ssh-keygen中...');
          // todo: https://github.com/typicode/lowdb/issues/380
          // const adapter = new JSONFile<KeysData>(json)
          // 给每个账号设置一个时间戳，来区分
          const params = {
            time: Date.now(),
            ...answers,
          };

          db.save(params, {
            filter: ['address', 'serverName'],
          })
            .then((data) => {
              ora.succeed('创建秘钥成功');
              ora.info(' 正在将秘钥传入服务器，请输入服务器密码');
              return save(params).then(() => {
                ora.succeed('传入秘钥成功');
              });
            })
            .catch((err) => {
              console.log(err);
              ora.fail('错误了');
            });
        }
      });
  });
};
