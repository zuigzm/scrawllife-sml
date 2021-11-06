/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-underscore-dangle */
import keygen from 'ssh-keygen';
import path from 'path';
import rimraf from 'rimraf';
import mkdirp from 'mkdirp';
import { exec } from 'child_process';
import { SMLType } from './type.d';
import db from './db';

const __dirname = path.resolve(path.dirname(''));

// 终止操作并返回错误信息
function closeCopyId(user: string, file: any) {
  return new Promise((resolve, reject) => {
    // 先删除，删除成功以后在清理数据
    rimraf(`${file()}*`, async (err: any) => {
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
    exec(`ssh-copy-id -i ${file('pub')} -p ${port} ${user}@${address}`, (err) => {
      if (!err) {
        resolve(true);
      }
      reject(new Error('复制秘钥错误, 终止操作'));
    }).on('exit', () => {
      closeCopyId(user, file)
        .then((data) => {
          if (data) {
            reject(new Error('复制秘钥错误, 终止操作'));
          }
        })
        .catch(() => {
          reject(new Error('复制秘钥错误, 终止操作'));
        });
    });
  });
}

export interface KeysData {
  keys: Array<SMLType>;
}

export default async (sml: SMLType) => {
  // 使用ssh2 在服务端 生成 ssh
  const location = (suffix?: string) => {
    suffix = suffix ? `.${suffix}` : '';
    return path.join(__dirname, `/.key/${sml.file}/sshKey${suffix}`);
  };

  const dirp = await mkdirp(path.join(__dirname, `/.key/${sml.file}`));

  if (!dirp) {
    throw new Error(`创建${sml.file}文件夹失败`);
  }

  const outKey = await new Promise((resolve, reject) => {
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
  });

  if (!outKey) {
    throw new Error('创建秘钥失败');
  }

  return await sshCopyId(location, sml.port, sml.user, sml.address);

  // return .then(() => {
  //   return sshCopyId(location, sml.port, sml.user, sml.address).then((code) => {
  //     return code;
  //   });
  // });
};
