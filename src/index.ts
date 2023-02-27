import ORA from 'ora';
import chalk from 'chalk';
import Yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import process from 'process';
import set from './set';
import del from './del';
import ssh from './ssh';
import serverList from './server';

const ora = ORA();

Yargs(hideBin(process.argv))
  .command(
    'set [server]',
    '添加一台新的服务器配置',
    (yargs) => {
      ora.start('Loading...');
      return yargs.option('server', {
        alias: 'S',
        describe: '请设置正确的服务器配置',
      });
    },
    (argv: any) => {
      ora.stop();
      if (argv.server) {
        set()
          .then((answers: any) => {
            if (answers) {
              ora.succeed(chalk.green('设置服务器信息成功!'));
            }
          })
          .catch(() => {
            console.log('错误');
          });
      }
    },
  )
  .command('list', '服务器选择列表', (argv: any) => {
    serverList()
      .then(({ select }) => {
        if (select) {
          ssh(select).then(() => {
            ora.succeed(`登录 ${select.address} 成功`);
          });
          // db.get({ time: select.time }).then((data) => {
          // ssh(data);
          // });
        }
      })
      .catch((err) => {
        if (err) {
          ora.warn(chalk.yellow('暂时未获取到服务器信息'));
        }
      });
  })
  .command('del', '删除服务器', (argv: any) => {
    del().catch((err) => {
      if (err) {
        ora.warn(chalk.yellow('暂时未获取到服务器信息'));
      }
    });
  })
  .demandCommand(1).argv;
