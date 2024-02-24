import cluster from 'cluster';
import poolPostgres from './database/pg.js';
// import os from 'os';

const checkDatabaseConnection = async () => {
  const startTime = Date.now();
  const maxWaitTime = 30000;

  while (Date.now() - startTime < maxWaitTime) {
    try {
      const { rows } = await poolPostgres.query(
        'SELECT * FROM USUARIO ORDER BY id_cliente ASC',
      );

      if (rows[0]?.id_cliente) {
        console.log('[Cluster] - Database is online');

        return true;
      } else {
        throw new Error('Database is offline');
      }
    } catch (error) {
      console.error('[Cluster] - Database is offline, retrying');

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  console.error('[Cluster] - Database is offline, maximum wait time reached');

  return false;
};

const runPrimaryProcess = async () => {
  const processesCount = 2; // os.cpus().length * 2;

  console.log(`[Cluster] - Primary ${process.pid} is running`);
  console.log(`[Cluster] - Forking Server with ${processesCount} processes`);

  if (process.env.IS_LOCAL === 'true') {
    const isDatabaseOnline = await checkDatabaseConnection();

    if (!isDatabaseOnline) {
      console.error('[Cluster] - Database is offline, cannot proceed');

      process.emit('SIGINT');
    }
  }

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
