import keygen from "ssh-keygen";
import path from "path";
import { spawn } from 'child_process'
import os from 'os'

const __dirname = path.resolve(path.dirname(""));
export interface SMLType {
  name: string;
  file: string;
  password: string;
  comment: string;
  format: string;
  keyType:boolean;
  address: string;
  port: number;
}

export interface KeysData {
  keys: Array<SMLType>
}

export default (sml: SMLType) => {
  // 使用ssh2 在服务端 生成 ssh
  const location = path.join(__dirname, `/.key/${sml.file}`);
  return new Promise((resolve, reject) => {
    keygen(
      {
        location: location,
        comment: sml.comment,
        password: sml.password,
        read: true,
        format: sml.format,
      },
      function (err:any, out:any) {
        if (err) {
          reject(err)
        } else {
          if(!sml.keyType) {
            // 隐藏秘钥信息
            console.log("Keys created!");
            console.log("private key: " + out.key);
            console.log("public key: " + out.pubKey);
          }
          resolve(out)
        }
      }
    );
  }).then(() => {
    return sshCopyId(location, sml.port, `${sml.name}@${sml.address}`).then((code) => {
      return code
    })
  })
};

function sshCopyId(file: string, port: number, username:string) {
  return new Promise((resolve, reject) => {
    const ls = spawn('ssh-copy-id', ['-i', file, '-p', port, username]as any, {
      stdio: 'inherit',
      shell: true
    })
      ls.on('close', (code) => {
        if (code === 0) {
            resolve(code);
        } else {
            reject(new Error('copy fail, error code：' + code))
        }
    });

    ls.on('error', (error) => {
        reject(error)
    });
  })
}