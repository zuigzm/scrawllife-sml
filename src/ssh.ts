import { Client } from "ssh2";
import { execSync, exec, spawn } from "child_process";
import ORA from "ora";
// export default (sml: any) => {
//   const child = spawn(
//     // `ssh ${sml.username}@${sml.server} -p ${sml.port}`,
//     "ssh",
//     ["-tt", `${sml.username}@${sml.server}`, "-p", `${sml.port}`],
//     {
//       stdio: ["ignore", "pipe", "pipe"],
//     }
//   );

//   // child.stdout.pipe(sml.password);

//   child.stdout.on("data", function (data) {
//     console.log("stdout: " + data);
//     // child.send();
//   });

//   child.stderr.on("data", function (data) {
//     console.log("stderr: " + data);
//   });
// };

export default (sml: any) => {
  const ora = ORA();
  const conn = new Client();
  ora.start("ssh连接中");
  conn
    .on("ready", function () {
      ora.succeed("ssh连接成功!");
      conn.shell(function (err: any, stream: any) {
        if (err) throw err;
        process.stdin.setEncoding("utf8");
        let command = false;
        process.stdin.on("readable", () => {
          const chunk = process.stdin.read();
          if (chunk !== null) {
            command = true;
            stream.write(chunk);
          }
        });

        stream
          .on("close", function () {
            console.log("关闭shell");
            conn.end();
          })
          .on("data", function (data: any) {
            if (!command) process.stdout.write(data);
            command = false;
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
      password: sml.password,
      // tryKeyboard: true,
    });
};
