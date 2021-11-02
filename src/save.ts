/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-underscore-dangle */
import keygen from 'ssh-keygen';
import path from 'path';
import { exec, spawn } from 'child_process';
import os from 'os';
import process from 'process';

const __dirname = path.resolve(path.dirname(''));

function sshCopyId(file: any, port: number, username: string): Promise<any> {
  return new Promise((resolve, reject) => {
    // const copy = spawn('ssh-copy-id', ['-i', file('pub'), '-p', port, username], {
    //   shell: true,
    // });

    exec(`ssh-copy-id -i .key/sshkey.pub zuigzm@192.168.1.3`, (err, stdout, stderr) => {
      if (!err) {
        console.log(stdout, stderr);
        // resolve(true);
      }
      console.log(stdout, stderr);
      // reject(new Error('错误提示'));
    }).on('exit', (code) => {
      console.error(`21212 ${code}`);
    });

    // copy.stdout.on('data', (data) => {
    //   process.stdout.write(data);
    // });

    // copy.stderr.on('data', (data) => {
    //   process.stdout.write(data);
    // });

    // copy.on('close', (code) => {
    //   if (code !== 0) {
    //     console.log(`grep process exited with code ${code}`);
    //   }
    // });
  });
}

export interface SMLType {
  name: string;
  file: string;
  password: string;
  comment: string;
  format: string;
  keyType: boolean;
  address: string;
  port: number;
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
    return sshCopyId(location, sml.port, `${sml.name}@${sml.address}`).then((code) => {
      return code;
    });
  });
};
