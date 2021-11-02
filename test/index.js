const { spawn, exec } = require('child_process');
// const process = require('process');

// const grep = spawn('ssh-add', ['/Users/kung/github/scrawllife-sml/.key/sshkey'], {
//   stdio: 'inherit',
//   shell: true,
// });
// const inStream = grep.stdin;
// // grep.stdout.on('data', (data) => {
// //   // console.log(1212121, data.toString());
// //   // process.stdout.write('sEB1rTQ1bIAr');
// //   if (String(data).startsWith('passphrase')) {
// //     // in here p.stdin would be null
// //     inStream.write(`sEB1rTQ1bIAr\r\n`);
// //   }
// // });

// // grep.stderr.on('data', (data) => {
// //   console.error(`grep stderr: ${data}`);
// // });

// grep.on('close', (code) => {
//   if (code !== 0) {
//     console.log(`grep process exited with code ${code}`);
//   }
// });

// process.on('data', function (chunk) {
//   // process.stdout.write(`data: ${chunk}`);
//   if (String(chunk).startsWith('passphrase')) {
//     // in here p.stdin would be null
//     inStream.write(`sEB1rTQ1bIAr\r\n`);
//   }
// });

const os = require('os');
const pty = require('node-pty');

const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

const ptyProcess = pty.spawn(shell, [], {
  name: 'xterm-color',
  cols: 80,
  rows: 30,
  cwd: process.env.HOME,
  env: process.env,
});

ptyProcess.on('data', function (data) {
  console.log('-------', data);
  if (data.toString().startsWith('Enter passphrase')) {
    // ptyProcess.write('sEB1rTQ1bIAr\r');
    // ptyProcess.write('\x11');
    // process.stdout.write(data);
    ptyProcess.kill();

    exec('ssh-copy-id -i /Users/kung/github/scrawllife-sml/.key/sshkey.pub 192.186.1.1');
  }

  if (data.toString().startsWith('Identity added')) {
    ptyProcess.write('ls\r');
  }

  // process.stdout.write(data);
});

ptyProcess.write('ssh-add /Users/kung/github/scrawllife-sml/.key/sshkey\r');
// ptyProcess.resize(100, 40);
// ptyProcess.write('ls\r');
