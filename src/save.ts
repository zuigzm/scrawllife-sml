/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-underscore-dangle */
import keygen from 'ssh-keygen';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import { SMLType } from './type.d';
import db from './db';

const __dirname = path.resolve(path.dirname(''));

// 终止操作并返回错误信息
function closeCopyId(user: string, file: any) {
  return new Promise((resolve, reject) => {
    // 先删除，删除成功以后在清理数据
    fs.rm(`${file()}*`, async (err) => {
      if (err) throw err;
      const data = await db.delete({
        user,
      });
      if (data) {
        resolve(true);
      } else {
        reject(new Error('删除失败'));
      }
    });
  });
}

function sshCopyId(file: any, port: number, user: string, address: string): Promise<any> {
  return new Promise((resolve, reject) => {
    // copy to server
    setTimeout(() => {
      // 等待五秒钟以后，如果还为加载成功，就终止保存操作，返回错误信息
      closeCopyId(user, file)
        .then((data) => {
          // resolve(true);
          // 删除
        })
        .catch(() => {
          reject(new Error('复制秘钥错误, 终止操作'));
        });
    }, 5000);
    exec(`ssh-copy-id -i ${file('pub')} -p ${port} ${user}@${address}`, (err) => {
      if (!err) {
        resolve(true);
      }
      reject(new Error('复制秘钥错误, 终止操作'));
    }).on('exit', () => {
      reject(new Error('复制秘钥错误, 终止操作'));
    });
  });
}

export interface KeysData {
  keys: Array<SMLType>;
}

export default (sml: SMLType) => {
  // 使用ssh2 在服务端 生成 ssh
  const location = (suffix?: string) => {
    suffix = suffix ? `.${suffix}` : '';
    return path.join(__dirname, `/.key/${sml.file}${suffix}`);
  };

  return new Promise((resolve, reject) => {
    keygen(
      {
        location: location(),
        comment: sml.comment,
        password: sml.password,
        read: true,
        format: sml.format,
      },
      (err: any, out: any) => {
        if (err) {
          reject(err);
        } else {
          if (!sml.keyType) {
            // 隐藏秘钥信息
            console.log('Keys created!');
            console.log(`private key: ${out.key}`);
            console.log(`public key: ${out.pubKey}`);
          }
          // exec(`chmod 600 ${location()}`, () => {
          resolve(out);
          // });
        }
      },
    );
  }).then(() => {
    return sshCopyId(location, sml.port, sml.user, sml.address).then((code) => {
      return code;
    });
  });
};
