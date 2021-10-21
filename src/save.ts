import keygen from "ssh-keygen";
import path from "path";
import { exec } from "child_process";
import os from "os";

const __dirname = path.resolve(path.dirname(""));
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
    suffix = suffix ? `.${suffix}` : "";
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
      function (err: any, out: any) {
        if (err) {
          reject(err);
        } else {
          if (!sml.keyType) {
            // 隐藏秘钥信息
            console.log("Keys created!");
            console.log("private key: " + out.key);
            console.log("public key: " + out.pubKey);
          }
          // exec(`chmod 600 ${location()}`, () => {
          resolve(out);
          // });
        }
      }
    );
  }).then(() => {
    return sshCopyId(location, sml.port, `${sml.name}@${sml.address}`).then(
      (code) => {
        return code;
      }
    );
  });
};

function sshCopyId(file: any, port: number, username: string) {
  return new Promise((resolve, reject) => {
    const fn = () => {
      exec(
        `ssh-copy-id -i ${file("pub")} -p ${port} ${username}`,
        (error, stdout, stderr) => {
          if (error || stderr) {
            console.log("----sshCopyId----");
            reject(error || stderr);
          } else {
            resolve(stdout);
          }
        }
      );
    };
    if (os.platform() === "darwin") {
      exec(`ssh-add ${file()}`, (error, stdout, stderr) => {
        if (error || stderr) {
          console.log("----ssh-add----");
          reject(error || stderr);
        } else {
          console.log("stdout", stdout);
          // fn();
        }
      });
    } else {
      fn();
    }
  });
}
