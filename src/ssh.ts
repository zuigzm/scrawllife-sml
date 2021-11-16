/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-underscore-dangle */
import { exec } from 'child_process';
import path from 'path';
import { SMLType } from './type.d';

const __dirname = path.resolve(path.dirname(''));

export default (sml: SMLType) => {
  return new Promise((resolve, reject) => {
    exec(
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
  });
};
