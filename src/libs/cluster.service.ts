// eslint-disable-next-line @typescript-eslint/no-var-requires
const cluster = require('cluster');

import { Injectable } from '@nestjs/common';

import * as process from 'node:process';
import * as os from 'os';

@Injectable()
export class ClusterService {
  static register(workers: number, bootstrap: any): void {
    const numCPUs = Math.ceil(os.cpus().length / 2);

    process.env.UV_THREADPOOL_SIZE = String(numCPUs);

    if (cluster.isPrimary) {
      console.log(`[Cluster] Master server started on ${process.pid}`);

      process.on('SIGINT', () => {
        console.log('[Cluster] Cluster shutting down');
        for (const id in cluster.workers) {
          cluster.workers[id].kill();
        }

        process.exit(0);
      });

      if (workers > numCPUs) workers = numCPUs;

      for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
      }

      cluster.on('online', (worker) => {
        console.log('[Cluster] Worker %s is online', worker.process.pid);
      });

      cluster.on('exit', (worker) => {
        console.log(`[Cluster] Worker ${worker.process.pid} died. Restarting`);

        cluster.fork();
      });
    } else {
      bootstrap();
    }
  }
}
