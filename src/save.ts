import { Client } from "ssh2";
import ORA from "ora";

interface SMLType {
  server: string;
  port: number;
  username: string;
  password: string;
}

export default (sml: SMLType) => {
  // 使用ssh2 在服务端 生成 ssh

  const ora = ORA();
  const conn = new Client();
  ora.start("获取服务器反馈中...");
  conn
    .on("ready", function () {
      ora.succeed("ssh连接成功!");
      conn.shell(function (err: any, stream: any) {
        if (err) throw err;
      });
    })
    .connect({
      host: sml.server,
      port: sml.port,
      username: sml.username,
      password: sml.password,
      // tryKeyboard: true,
    });
};
