import { Client } from "ssh2";
import ORA from "ora";
import keygen from "ssh-keygen";
import path from "path";

const __dirname = path.resolve(path.dirname(""));
interface SMLType {
  name: string;
  password: string;
  comment: string;
  format: string;
}

export default (sml: SMLType) => {
  // 使用ssh2 在服务端 生成 ssh

  const ora = ORA();
  ora.start("获取服务器反馈中...");

  const location = path.join(__dirname, `/${sml.name}`);

  keygen(
    {
      location: location,
      comment: sml.comment,
      password: sml.password,
      read: true,
      format: sml.format,
    },
    function (err, out) {
      if (err) return console.log("Something went wrong: " + err);
      console.log("Keys created!");
      console.log("private key: " + out.key);
      console.log("public key: " + out.pubKey);
    }
  );
};
