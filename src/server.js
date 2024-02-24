import HyperExpress from 'hyper-express';
// import logger from './middlewares/logger.js';
import router from './router.js';
import poolPostgres from './database/pg.js';
import { listUsers } from './repositories/transactionRepository.js';

// trust_proxy allow application to receive data from proxy
const server = new HyperExpress.Server({ trust_proxy: true });

// Router
server.use('/', router);

// Middleware
// server.use(logger);

// Save in memory cache list of clients with your limit bank
await listUsers();

server
  .listen(3333)
  .then((socket) => console.log('[Server] - Server started on port 80', socket))
  .catch((error) =>
    console.log('[Server] - Failed to start server on port 80', error),
  );

function shutdown(code) {
  return (event) => {
    console.info(`[Server] - ${event} signal received with code ${code}`);

    server.close(async () => {
      await poolPostgres.end();

      process.exit(0);
    });
  };
}

// Ctrl + c
process.on('SIGINT', shutdown('SIGINT'));

process.on('SIGTERM', shutdown('SIGTERM'));

process.on('exit', (code) => {
  console.info(`[Server] - Exit signal received with code ${code}`);
});

// For sync error not handle
process.on('uncaughtException', (error, origin) => {
  console.log(
    `\n[Server] - [uncaughtException] ${origin} signal received. \n${error}`,
  );
});

// For promise error not handle
process.on('unhandledRejection', (error, origin) => {
  console.log(
    `\n[Server] - [unhandledRejection] ${origin} signal received. \n${error}`,
  );
});
