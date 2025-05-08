/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-underscore-dangle */
import { Client } from 'ssh2';
import path from 'path';
import fs from 'fs';
import { SMLType } from './type.d.js';
// @ts-ignore
import ora from 'ora';

const __dirname = path.resolve(path.dirname(''));

export default async (sml: SMLType) => {
  const spinner = ora();
  try {
    if (sml.select === 'password') {
      // 口令登录
      return await sshFun({
        host: sml.address,
        port: sml.port,
        username: sml.user,
        password: sml.password1,
      }, sml);
    } else {
      // 秘钥登录
      return await sshFun({
        host: sml.address,
        port: sml.port,
        username: sml.user,
        privateKey: fs.readFileSync(path.join(__dirname, `.key/${sml.file}`, 'sshKey')),
      }, sml);
    }
  } catch (error: any) {
    spinner.fail(`连接失败: ${error?.message || '未知错误'}`);
    throw error;
  }
};

function sshFun(config: any, sml: SMLType) {
  return new Promise<boolean>((resolve, reject) => {
    const spinner = ora();
    spinner.start('正在连接服务器...');

    const conn = new Client();

    // 处理连接错误
    conn.on('error', (err) => {
      spinner.fail(`连接错误: ${err.message}`);
      reject(err);
    });

    conn.on('ready', () => {
      spinner.succeed('已成功连接到服务器');
      spinner.info('正在打开终端会话...');

      conn.shell({ term: process.env.TERM || 'xterm-color' }, (err, stream) => {
        if (err) {
          spinner.fail(`无法打开终端会话: ${err.message}`);
          conn.end();
          return reject(err);
        }

        // 将本地的stdin导入到远程shell
        process.stdin.pipe(stream);

        // 将远程shell的输出导入到本地stdout
        stream.pipe(process.stdout);
        stream.stderr.pipe(process.stderr);

        // 监听shell关闭
        stream.on('close', () => {
          spinner.succeed('连接已关闭');
          conn.end();
          resolve(true);
        });

        // 设置原始模式以便能够发送控制字符
        if (process.stdin.isTTY) {
          process.stdin.setRawMode(true);
        }

        // 处理本地stdin关闭
        process.stdin.on('end', () => {
          spinner.info('本地输入流关闭');
          conn.end();
        });

        // 处理窗口大小调整
        if (process.stdout.isTTY) {
          process.stdout.on('resize', () => {
            stream.setWindow(process.stdout.rows || 24, process.stdout.columns || 80);
          });
        }

        // 初始窗口大小
        if (process.stdout.isTTY) {
          stream.setWindow(process.stdout.rows || 24, process.stdout.columns || 80);
        }
      });
    });

    // 连接到服务器
    spinner.info(sml.select === 'password' ? '使用密码登录模式...' : '使用密钥登录模式...');
    conn.connect(config);
  });
}