/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-underscore-dangle */
import { exec } from 'child_process';
import path from 'path';
import { SMLType } from './type.d.js';

import os from 'os';
import pty from 'node-pty';
import ORA from 'ora';

const shell = os.platform() === 'win32' ? 'cmd.exe' : 'bash';
const conn = pty.spawn(shell, [], {
  name: 'xterm-color',
  cwd: process.env.HOME,
  env: process.env,
  autoContinue: true,
});

const __dirname = path.resolve(path.dirname(''));
export default async (sml: SMLType) => {
  if (sml.select === 'password') {
    // 口令登录
    return sshFun(`ssh ${sml.user}@${sml.address} -p ${sml.port}`, sml);
  } else {
    // 秘钥登录
    return sshFun(
      `ssh -i ${path.join(__dirname, `.key/${sml.file}`, 'sshKey')} ${sml.user}@${sml.address} -p ${
        sml.port
      }`,
      sml,
    );
  }
};

function sshFun(ssh, sml: SMLType) {
  return new Promise((resolve, reject) => {
    conn.pipe(process.stdout);
    conn.write(ssh);
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
      ORA().succeed('shell 已退出');
      process.exit();
    });
  });
}
