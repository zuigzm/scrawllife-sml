/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-underscore-dangle */

import path from 'path';

import pty from 'node-pty';
import os from 'os';
import serverList from './server';

// 说明：删除的时候，先删除 对应服务器中的数据 然后删除 文件夹内的信息，再删除 key.json 中的数据

// 删除指定服务器
export default () => {
  const __dirname = path.resolve(path.dirname(''));
  const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

  const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: process.env.HOME,
    env: process.env,
  });

  return serverList().then(({ select }) => {
    if (select) {
      ptyProcess.on('data', (data) => {
        process.stdout.write(data);
        if (/oh-my-zsh/.test(data)) {
          ptyProcess.write('n\r');
        }

        // if (/~/.test(data)) {
        //   ptyProcess.write('ls\r');
        // }
      });

      ptyProcess.write(
        `ssh -i ${path.join(__dirname, `.key/${select.file}`, 'sshKey')} ${select.user}@${
          select.address
        } -p ${select.port}\r`,
      );

      ptyProcess.write(`cat ~/.ssh/authorized_keys\r`);
    }
  });
};
