import HyperExpress from 'hyper-express';
import Transaction from './functions/transaction.js';

const router = new HyperExpress.Router();

const transaction = new Transaction();

router.post('/clientes/:id/transacoes', async (request, response) => {
  const { id } = request.path_parameters;
  const body = await request.json();
  const { tipo, valor, descricao } = body;

  const limitWithBalanceUpdated = await transaction.create({
    id,
    tipo,
    valor,
    descricao,
  });

  console.log('#####', { limitWithBalanceUpdated });

  return response.status(200).send(JSON.stringify(limitWithBalanceUpdated));
});

router.get('/clientes/:id/extrato', async (request, response) => {
  const { id } = request.path_parameters;

  const bankStatement = await transaction.listBankStatement({
    id,
  });

  return response.status(200).send(JSON.stringify(bankStatement));
});

export default router;
