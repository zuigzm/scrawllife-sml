import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import ORA from 'ora';
import chalk from 'chalk';

export const __dirname = dirname(fileURLToPath(import.meta.url));

export function init() {
  // 使用 path.join 确保路径分隔符在不同操作系统上正确
  const filePath = resolve(__dirname, '.key', 'db.json.tmp');

  // 创建目录（如果不存在）
  const dirPath = resolve(__dirname, '.key');
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    fs.writeFile(filePath, `//${new Date()}`, (err) => {
      if (err) {
        return ORA().fail(chalk.yellow('初始化环境失败'));
      } else {
        return ORA().succeed(chalk.green('初始化数据成功'));
      }
    });
  } catch (error) {
    return ORA().fail(chalk.yellow(`初始化环境失败: ${error.message}`));
  }
}
