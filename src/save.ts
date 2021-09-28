import keygen from "ssh-keygen";
import path from "path";

const __dirname = path.resolve(path.dirname(""));
export interface SMLType {
  name: string;
  file: string;
  password: string;
  comment: string;
  format: string;
  keyType:boolean;
}

export interface KeysData {
  keys: Array<SMLType>
}

export default (sml: SMLType,cb: ()=> void) => {
  // 使用ssh2 在服务端 生成 ssh
  const location = path.join(__dirname, `/.key/${sml.file}`);
  keygen(
    {
      location: location,
      comment: sml.comment,
      password: sml.password,
      read: true,
      format: sml.format,
    },
    function (err:any, out:any) {
      if (err) return console.log("Something went wrong: " + err);
      if(!sml.keyType) {
        // 隐藏秘钥信息
        console.log("Keys created!");
        console.log("private key: " + out.key);
        console.log("public key: " + out.pubKey);
      }
      cb && cb()
    }
  );
};
