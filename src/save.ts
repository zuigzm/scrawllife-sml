/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-underscore-dangle */
import keygen from 'ssh-keygen';
import path from 'path';
import { exec } from 'child_process';
import { SMLType } from '../index.d';

const __dirname = path.resolve(path.dirname(''));

function sshCopyId(file: any, port: number, address: string): Promise<any> {
  return new Promise((resolve, reject) => {
    // copy to server
    exec(`ssh-copy-id -i ${file} -p ${port} ${address}`, (err) => {
      if (!err) {
        // console.log(stdout, stderr);
        resolve(true);
      }
      // console.log(stdout, stderr);
      reject(new Error('错误提示'));
    }).on('exit', (code) => {
      reject(new Error(JSON.stringify({ code, message: '错误提示' })));
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
    return sshCopyId(location, sml.port, `${sml.user}@${sml.address}`).then((code) => {
      return code;
    });
  });
};
