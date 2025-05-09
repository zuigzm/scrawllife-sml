/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-underscore-dangle */
import fs from 'fs';
import path from 'path';
import { Client } from 'ssh2';
import { fileURLToPath } from 'url';
import { SMLType } from './type.d.js';
// @ts-ignore
import ora from 'ora';

// 在 ES 模块中获取 __dirname 的替代方案
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async (sml: SMLType) => {
  const spinner = ora();
  try {
    if (sml.select === 'password') {
      // 口令登录
      return await sshFun(
        {
          host: sml.address,
          port: sml.port,
          username: sml.user,
          password: sml.password,
        },
        sml,
      );
    } else {
      // 秘钥登录
      return await sshFun(
        {
          host: sml.address,
          port: sml.port,
          username: sml.user,
          privateKey: fs.readFileSync(path.join(__dirname, `.key/${sml.file}`, 'sshKey')),
        },
        sml,
      );
    }
  } catch (error: any) {
    spinner.fail(`连接失败: ${error?.message || '未知错误'}`);
    process.exit();
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

      // 添加更详细的错误信息
      if (err.message.includes('All configured authentication methods failed')) {
        if (sml.select === 'password') {
          spinner.info('密码认证失败，可能原因：');
          spinner.info('1. 密码不正确');
          spinner.info('2. 服务器禁用了密码认证');
          spinner.info('3. 用户账号被锁定或不存在');
          spinner.info('建议尝试使用密钥认证方式');
        } else {
          spinner.info('密钥认证失败，可能原因：');
          spinner.info('1. 密钥格式不正确或损坏');
          spinner.info('2. 密钥未添加到服务器的 authorized_keys 文件中');
          spinner.info('3. 服务器的 SSH 配置限制了密钥认证');
          spinner.info('建议检查密钥文件或尝试使用密码认证');
        }
      }

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
            const rows = process.stdout.rows || 24;
            const cols = process.stdout.columns || 80;
            stream.setWindow(rows, cols, 0, 0);
          });
        }

        // 初始窗口大小
        if (process.stdout.isTTY) {
          const rows = process.stdout.rows || 24;
          const cols = process.stdout.columns || 80;
          stream.setWindow(rows, cols, 0, 0);
        }
      });
    });

    // 添加键盘交互认证配置
    if (sml.select === 'password') {
      // 修改配置，添加键盘交互认证方式
      config.tryKeyboard = true;

      // 添加键盘交互回调
      config.authHandler = (
        methodsLeft: string[] | null,
        _partialSuccess: boolean, // 使用下划线前缀表示未使用的参数
        callback: (method: string, ...args: any[]) => void,
      ) => {
        // 检查 methodsLeft 是否为 null 或空数组
        if (!methodsLeft || methodsLeft.length === 0) {
          spinner.warn('没有可用的认证方法');
          // 尝试使用密码认证作为后备方案
          return callback('password', sml.user, sml.password || '');
        }

        // 确保 methodsLeft 不为 null 或空数组
        spinner.info(`可用认证方法: ${Array.isArray(methodsLeft) ? methodsLeft.join(', ') : '无'}`);

        if (methodsLeft.includes('keyboard-interactive')) {
          // 使用键盘交互认证
          return callback(
            'keyboard-interactive',
            sml.user,
            '',
            (
              _name: string,
              _instructions: string,
              _lang: string,
              prompts: Array<{ prompt: string; echo: boolean }>,
              finish: (responses: string[]) => void,
            ) => {
              spinner.info('服务器请求键盘交互认证');

              // 如果是密码提示，自动提供密码
              if (prompts.length > 0 && prompts[0].prompt.toLowerCase().includes('password')) {
                finish([sml.password || '']);
              } else {
                // 其他情况，提示用户手动处理
                spinner.info('请按照提示完成交互认证');
                finish([]);
              }
            },
          );
        }

        // 如果没有可用的认证方法，返回错误
        if (methodsLeft.length === 0) {
          spinner.fail('没有可用的认证方法');
        }

        // 尝试下一个认证方法
        callback(methodsLeft[0]);
      };
    }

    // 添加调试信息
    spinner.info(`正在连接到 ${config.host}:${config.port} 用户名: ${config.username}`);
    spinner.info(sml.select === 'password' ? '使用密码登录模式...' : '使用密钥登录模式...');

    // 设置连接超时
    const timeout = setTimeout(() => {
      spinner.fail('连接超时，请检查网络或服务器状态');
      conn.end();
      reject(new Error('连接超时'));
    }, 30000); // 30秒超时

    // 连接到服务器
    try {
      conn.connect(config);

      // 连接成功后清除超时
      conn.once('ready', () => {
        clearTimeout(timeout);
      });
    } catch (err: any) {
      clearTimeout(timeout);
      spinner.fail(`连接异常: ${err.message}`);
      reject(err);
    }
  });
}
