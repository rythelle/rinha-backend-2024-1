import cluster from 'cluster';

const runPrimaryProcess = () => {
  const processesCount = 4;
  // console.log(`Primary ${process.pid} is running`);
  // console.log(`Forking Server with ${processesCount} processes`);

  for (let index = 0; index < processesCount; index++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code) => {
    if (code !== 0 && !worker.exitedAfterDisconnect) {
      // console.log(
      //   `Worker ${worker.process.pid} died... scheduling another one`,
      // );
      cluster.fork();
    }
  });

  process.on('SIGINT', () => {
    // console.log('[Cluster] Cluster shutting down');
    for (const id in cluster.workers) {
      cluster.workers[id].kill();
    }

    process.exit(0);
  });
};

const runWorkerProcess = async () => {
  await import('./server.js');
};

cluster.isPrimary ? runPrimaryProcess() : runWorkerProcess();
