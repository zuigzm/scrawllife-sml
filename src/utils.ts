import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import ORA from 'ora';
import chalk from 'chalk';

export const __dirname = dirname(fileURLToPath(import.meta.url));

export function init() {
  const filePath = resolve(__dirname, './.key/db.json.tmp');
  fs.writeFile(filePath, `//${new Date()}`, (err) => {
    if (err) {
      return ORA().fail(chalk.yellow('初始化环境失败'));
    } else {
      return ORA().succeed(chalk.green('初始化数据成功'));
    }
  });
}
