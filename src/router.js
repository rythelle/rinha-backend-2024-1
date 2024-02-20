import HyperExpress from 'hyper-express';
import Transaction from './functions/transaction.js';

const router = new HyperExpress.Router();

const transaction = new Transaction();

router.post('/clientes/:id/transacoes', async (request, response) => {
  try {
    const { id } = request.path_parameters;

    const body = await request.json();

    const { tipo, valor, descricao } = body;

    const limitWithBalanceUpdated = await transaction.create({
      id,
      tipo,
      valor,
      descricao,
    });

    return response.status(200).send(JSON.stringify(limitWithBalanceUpdated));
  } catch (error) {
    const { message, statusCode } = error;

    return response.status(statusCode).send(JSON.stringify({ message }));
  }
});

router.get('/clientes/:id/extrato', async (request, response) => {
  try {
    const { id } = request.path_parameters;

    const bankStatement = await transaction.listBankStatement({
      id,
    });

    return response.status(200).send(JSON.stringify(bankStatement));
  } catch (error) {
    const { message, statusCode } = error;

    return response.status(statusCode).send(JSON.stringify({ message }));
  }
});

export default router;
