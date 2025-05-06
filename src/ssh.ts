/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-underscore-dangle */
import { spawn } from 'child_process';
import path from 'path';
import { SMLType } from './type.d.js';
// @ts-ignore
import ora from 'ora';

const __dirname = path.resolve(path.dirname(''));

export default async (sml: SMLType) => {
  const spinner = ora();
  try {
    if (sml.select === 'password') {
      // 口令登录
      return await sshFun(`ssh ${sml.user}@${sml.address} -p ${sml.port}`, sml);
    } else {
      // 秘钥登录
      return await sshFun(
        `ssh -i ${path.join(__dirname, `.key/${sml.file}`, 'sshKey')} ${sml.user}@${sml.address} -p ${
          sml.port
        }`,
        sml,
      );
    }
  } catch (error: any) {
    spinner.fail(`连接失败: ${error?.message || '未知错误'}`);
    throw error;
  }
};

function sshFun(sshCommand: string, sml: SMLType) {
  return new Promise<boolean>((resolve, reject) => {
    const spinner = ora();
    spinner.start('正在连接服务器...');

    // 分割命令和参数
    const [command, ...args] = sshCommand.split(' ').filter(Boolean);

    // 如果是密码登录，使用更智能的方式处理密码输入
    if (sml.select === 'password' && sml.password1) {
      // 添加选项以避免严格的主机密钥检查，并强制分配伪终端
      args.push(
        '-o', 'StrictHostKeyChecking=no',
        '-o', 'UserKnownHostsFile=/dev/null',
        '-o', 'PreferredAuthentications=password',
        '-v', // 添加详细输出，帮助调试
        '-tt'
      );

      spinner.info('使用密码登录模式...');

      // 创建子进程，使用 pipe 模式以便我们可以处理所有输入/输出
      const sshProcess = spawn(command, args, {
        stdio: ['pipe', 'pipe', 'pipe'], // 所有 stdio 都设为 pipe
        shell: false, // 不使用 shell，直接执行命令
      });

      // 标记是否已经输入过密码
      let passwordEntered = false;
      let dataBuffer = '';

      // 监听标准输出，检测密码提示
      if (sshProcess.stdout) {
        sshProcess.stdout.on('data', (data: Buffer) => {
          const output = data.toString();
          process.stdout.write(output); // 将输出显示到控制台

          dataBuffer += output;

          // 检查是否包含密码提示
          if (!passwordEntered &&
              (dataBuffer.includes('password:') ||
               dataBuffer.includes('Password:') ||
               dataBuffer.includes('密码:') ||
               dataBuffer.toLowerCase().includes('password'))) {

            spinner.info('检测到密码提示，正在输入密码...');

            // 等待一小段时间再输入密码，确保 SSH 已准备好接收
            setTimeout(() => {
              try {
                if (sshProcess.stdin) {
                  sshProcess.stdin.write(`${sml.password1}\n`);
                  passwordEntered = true;
                  spinner.succeed('密码已输入');
                }
              } catch (err: any) {
                spinner.fail(`写入密码失败: ${err?.message || '未知错误'}`);
              }
            }, 500);
          }
        });
      }

      // 监听标准错误输出
      if (sshProcess.stderr) {
        sshProcess.stderr.on('data', (data: Buffer) => {
          const output = data.toString();
          process.stderr.write(output); // 将错误输出显示到控制台

          dataBuffer += output;

          // 检查是否包含密码提示（有时密码提示会出现在 stderr）
          if (!passwordEntered &&
              (dataBuffer.includes('password:') ||
               dataBuffer.includes('Password:') ||
               dataBuffer.includes('密码:') ||
               dataBuffer.toLowerCase().includes('password'))) {

            spinner.info('检测到密码提示（stderr），正在输入密码...');

            setTimeout(() => {
              try {
                if (sshProcess.stdin) {
                  sshProcess.stdin.write(`${sml.password1}\n`);
                  passwordEntered = true;
                  spinner.succeed('密码已输入');
                }
              } catch (err: any) {
                spinner.fail(`写入密码失败: ${err?.message || '未知错误'}`);
              }
            }, 500);
          }

          // 检查是否有权限被拒绝的消息
          if (output.includes('Permission denied') || output.includes('权限被拒绝')) {
            spinner.fail('权限被拒绝，请检查密码是否正确');
          }
        });
      }

      // 监听 stdin 错误
      if (sshProcess.stdin) {
        sshProcess.stdin.on('error', (err: Error) => {
          spinner.fail(`输入错误: ${err.message}`);
        });
      }

      // 处理进程退出
      sshProcess.on('close', (code: number) => {
        if (code === 0) {
          spinner.succeed('连接已关闭');
          resolve(true);
        } else {
          spinner.fail(`连接失败，退出码: ${code}`);
          reject(new Error(`SSH 进程退出，退出码: ${code}`));
        }
      });

      // 处理错误
      sshProcess.on('error', (err: Error) => {
        spinner.fail(`连接错误: ${err.message}`);
        reject(err);
      });

      // 允许用户通过控制台输入内容
      process.stdin.pipe(sshProcess.stdin!);

    } else {
      // 密钥登录或其他情况，直接使用 spawn
      spinner.info('使用密钥登录模式...');

      // 添加 -tt 参数强制分配伪终端
      args.push('-tt');

      const sshProcess = spawn(command, args, {
        stdio: 'inherit', // 直接连接到父进程的标准输入/输出
        shell: true,
      });

      // 处理进程退出
      sshProcess.on('close', (code: number) => {
        if (code === 0) {
          spinner.succeed('连接已关闭');
          resolve(true);
        } else {
          spinner.fail(`连接失败，退出码: ${code}`);
          reject(new Error(`SSH 进程退出，退出码: ${code}`));
        }
      });

      // 处理错误
      sshProcess.on('error', (err: Error) => {
        spinner.fail(`连接错误: ${err.message}`);
        reject(err);
      });
    }
  });
}
