import HyperExpress from 'hyper-express';
import logger from './middlewares/logger.js';
import router from './router.js';

const server = new HyperExpress.Server();

server.use('/api/v1', router);

server.use(logger);

server
  .listen(3000)
  .then((socket) => console.log('Webserver started on port 3000'))
  .catch((error) => console.log('Failed to start webserver on port 3000'));
