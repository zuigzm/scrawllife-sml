import { Client } from "ssh2";
import ORA from "ora";
export default (sml: any) => {
  const ora = ORA();
  const conn = new Client();
  ora.start("ssh连接中");
  conn
    .on("ready", function () {
      ora.succeed("ssh连接成功!");
      conn.shell(function (err: any, stream: any) {
        if (err) throw err;
        stream
          .on("close", function () {
            console.log("关闭shell");
            conn.end();
          })
          .on("error", function (data: any) {
            console.log("err: " + data);
          })
          .stderr.on("data", function (data: any) {
            console.log("STDERR: " + data);
          });
      });
    })
    .connect({
      host: sml.server,
      port: sml.port,
      username: sml.username,
      // tryKeyboard: true,
    });
};
