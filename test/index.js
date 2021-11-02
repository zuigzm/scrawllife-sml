const { spawn, exec } = require('child_process');
const process = require('process');

const grep = spawn('ssh-copy-id', ['-i', '.key/sshkey.pub', 'zuigzm@192.168.1.8'], {
  shell: true,
});

// const a = exec(
//   `ssh-copy-id -i /Users/kung/github/scrawllife-sml/.key/sshkey.pu 192.168.1.8`,
//   (err, stdout, stderr) => {
//     if (!err) {
//       console.log(stdout, stderr);
//       // resolve(true);
//     }

//     // reject(new Error('错误提示'));
//   },
// );

grep.stdout.on('data', (data) => {
  process.stdout.write(data);
});

grep.stderr.on('data', (data) => {
  console.log(data.toString());
});

grep.on('exit', (data) => {
  console.log(`child process exited with code ${data}`);
});

grep.on('close', (code) => {
  if (code !== 0) {
    console.log(`grep process exited with code ${code}`);
  }
});
