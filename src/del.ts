/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-underscore-dangle */

import path from 'path';
import { spawn } from 'child_process';
import ora from 'ora';
import serverList from './server.js';

// 说明：删除的时候，先删除 对应服务器中的数据 然后删除 文件夹内的信息，再删除 key.json 中的数据

// 删除指定服务器
export default async () => {
  const __dirname = path.resolve(path.dirname(''));
  const spinner = ora();

  try {
    const { select } = await serverList();

    if (select) {
      spinner.start('正在连接服务器...');

      // 构建 SSH 命令
      const sshCommand = `ssh -i ${path.join(__dirname, `.key/${select.file}`, 'sshKey')} ${select.user}@${
        select.address
      } -p ${select.port} "cat ~/.ssh/authorized_keys"`;

      // 分割命令和参数
      const [command, ...args] = sshCommand.split(' ').filter(Boolean);

      // 创建子进程
      const sshProcess = spawn(command, args, {
        stdio: 'inherit', // 直接连接到父进程的标准输入/输出
        shell: true,
      });

      // 处理进程退出
      sshProcess.on('close', (code) => {
        if (code === 0) {
          spinner.succeed('操作完成');
        } else {
          spinner.fail(`操作失败，退出码: ${code}`);
        }
      });

      // 处理错误
      sshProcess.on('error', (err) => {
        spinner.fail(`连接错误: ${err.message}`);
      });
    }
  } catch (error) {
    spinner.fail(`操作失败: ${error.message}`);
  }
};
