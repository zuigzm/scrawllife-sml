/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-underscore-dangle */
import keygen from 'ssh-keygen';
import path from 'path';
import { exec } from 'child_process';
import os from 'os';
import pty from 'node-pty';
import process from 'process';

const __dirname = path.resolve(path.dirname(''));

function sshCopyId(file: any, port: number, username: string, password: string): Promise<any> {
  const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
  const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: process.env.HOME,
    env: process.env,
  });

  return new Promise((resolve, reject) => {
    if (os.platform() === 'darwin') {
      ptyProcess.write(`ssh-add ${file()}`);
    }
    ptyProcess.on('data', (data) => {
      console.log('data----', data);
      const isTest = (arg: any) => {
        return data.search(arg);
      };

      if (isTest(/passphrase/)) {
        console.log('passphrase');
        ptyProcess.write(`${password}\r`);
      }

      if (isTest(/Identity added/)) {
        console.log('Identity added');
        // ptyProcess.write();
        ptyProcess.kill();
        exec(`ssh-copy-id -i ${file('pub')} -p ${port} ${username}`, (err) => {
          console.log('-----这里也好了');
          if (!err) {
            resolve(true);
          }

          reject(new Error('错误提示'));
        });
      }
    });
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
    return sshCopyId(location, sml.port, `${sml.name}@${sml.address}`, sml.password).then(
      (code) => {
        return code;
      },
    );
  });
};
