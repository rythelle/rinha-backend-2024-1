import cluster from 'cluster';

const runPrimaryProcess = async () => {
  const processesCount = 2;

  console.log(`[Cluster] - Primary ${process.pid} is running`);
  console.log(`[Cluster] - Forking Server with ${processesCount} processes`);

  for (let index = 0; index < processesCount; index++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    if (code !== 0 && !worker.exitedAfterDisconnect) {
      console.log(
        `[Cluster] - Worker ${worker.process.pid} died because ${signal}`,
      );
      cluster.fork();
    }
  });

  process.on('SIGINT', () => {
    console.log('[Cluster] - Cluster shutting down with ctrl+c');
    for (const id in cluster.workers) {
      cluster.workers[id].kill();
    }

    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('[Cluster] - Cluster shutting down');
    for (const id in cluster.workers) {
      cluster.workers[id].kill();
      cluster.fork();
    }

    process.exit(0);
  });
};

const runWorkerProcess = async () => {
  await import('./server.js');
};

cluster.isPrimary ? await runPrimaryProcess() : await runWorkerProcess();
