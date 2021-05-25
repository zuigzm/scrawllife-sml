var spawn = require("child_process").spawn;

var sshTerm = spawn("ssh", ["vagrant@192.168.33.100", ""], {
  stdio: "inherit",
});

// listen for the 'exit' event
//   which fires when the process exits
sshTerm.on("exit", function (code, signal) {
  if (code === 0) {
    // process completed successfully
  } else {
    // handle error
  }
});
