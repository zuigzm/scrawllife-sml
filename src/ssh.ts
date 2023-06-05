/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-underscore-dangle */
import { exec } from 'child_process';
import path from 'path';
import { SMLType } from './type.d.js';

import os from 'os';
import pty from 'node-pty';

const shell = os.platform() === 'win32' ? 'cmd.exe' : 'bash';
const conn = pty.spawn(shell, [], {
  name: 'xterm-color',
  cwd: process.env.HOME,
  env: process.env,
  autoContinue: true,
});

const __dirname = path.resolve(path.dirname(''));
export default (sml: SMLType) => {
  if (sml.select === 'password') {
    passwordFun(sml);
  } else {
    sshKeyFun(sml);
  }
};

function passwordFun(sml: SMLType) {
  return new Promise((resolve, reject) => {
    conn.pipe(process.stdout);
    conn.write(`ssh ${sml.user}@${sml.address} -p ${sml.port}`);
    conn.write('');

    conn.on('data', (data) => {
      // 监听 shell 的输出
      const string = data.toString();
      if (string.includes('password') || string.includes('Password')) {
        // 输入密码
        conn.write(sml.password1);
        conn.write('');
      }

      if (string.includes('exit')) {
        conn.kill();
      }
    });

    process.stdin.setRawMode(true); // 开启原始模式
    process.stdin.resume();
    process.stdin.pipe(conn);

    // 监听 shell 的退出
    conn.on('exit', () => {
      process.stdin.pause();
      console.log('shell 已退出');
      process.exit();
    });
  });
}

function sshKeyFun(sml: SMLType) {
  return new Promise((resolve, reject) => {
    const procss = exec(
      `ssh -i ${path.join(__dirname, `.key/${sml.file}`, 'sshKey')} ${sml.user}@${sml.address} -p ${
        sml.port
      }`,
      (err) => {
        if (!err) {
          resolve(true);
        }
        reject(new Error('登录错误，意外退出'));
      },
    ).on('exit', (err) => {
      if (err) {
        reject(new Error('登录错误，意外退出'));
      }
    });

    resolve(procss);
  });
}
