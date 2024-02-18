import HyperExpress from 'hyper-express';

const router = new HyperExpress.Router();

router.post('/register', async (request, response) => {
  return response.send('register post');
});

router.get('/register', async (request, response) => {
  return response.send('register get');
});

router.delete('/register', async (request, response) => {
  return response.send('register delete');
});

export default router;
