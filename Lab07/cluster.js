// cluster.js
const cluster = require("cluster");
const os = require("os");

if (cluster.isPrimary) {
  const cpuCount = os.cpus().length;

  console.log(`Master ${process.pid} running`);

  for (let i = 0; i < cpuCount; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });

} else {
  require("./app"); // chạy app.js trong mỗi worker
}