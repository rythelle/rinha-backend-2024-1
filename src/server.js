import HyperExpress from 'hyper-express';
// import logger from './middlewares/logger.js';
import router from './router.js';

// trust_proxy allow application to receive data from proxy
const server = new HyperExpress.Server({ trust_proxy: true });

// Router
server.use('/', router);

// Middleware
// server.use(logger);

server
  .listen(80)
  .then((socket) => console.log('Server started on port 80', socket))
  .catch((error) => console.log('Failed to start server on port 80', error));
