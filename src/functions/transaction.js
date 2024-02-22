import poolPostgres from '../database/pg.js';
import CustomError from '../utils/customError.js';

const transactionsAllow = ['c', 'd'];
const clients = [1, 2, 3, 4, 5];

export default class Transaction {
  constructor(repository) {
    this.repository = repository;
  }

  async create({ id, valor, tipo, descricao }) {
    const client = await poolPostgres.connect();

    try {
      // const { exist } = await this.repository.findUser(id);

      // if (!exist) {
      //   throw new Error('User not found');
      // }

      console.log('111', { id, valor, tipo, descricao });

      // Arrumar validação do id

      if ([id, valor].some((value) => !Number.isInteger(value) && value >= 0)) {
        throw new CustomError(400, 'Type of valor or id is invalid');
      }

      if ([tipo, descricao].some((value) => !typeof value === 'string')) {
        throw new CustomError(400, 'Type of tipo or descricao is invalid');
      }

      if ([id, valor, tipo, descricao].some((value) => !value)) {
        throw new CustomError(400, 'All params is required');
      }

      if (!clients.includes(Number(id))) {
        throw new CustomError(404, 'User not found');
      }

      if (!transactionsAllow.includes(tipo)) {
        throw new CustomError(400, 'Type of operation not allow');
      }

      // Credit operation
      if (tipo === 'c') {
        const user = await this.repository.selectUser({ client, id });

        const newBalance = user.saldo + valor;

        await this.repository.updateBalance({ client, id, newBalance });

        await this.repository.insertTransaction({
          client,
          id,
          valor,
          tipo,
          descricao,
        });

        return {
          limite: user.limite,
          saldo: newBalance,
        };
      }

      // Debit operation
      const user = await this.repository.selectUser({ client, id });

      const newBalance = user.saldo - valor;

      if (user.limite + newBalance < 0) {
        throw new CustomError(422, 'This operation is not allow');
      }

      await this.repository.updateBalance({ client, id, newBalance });

      await this.repository.insertTransaction({
        client,
        id,
        valor,
        tipo,
        descricao,
      });

      return {
        limite: user.limite,
        saldo: newBalance,
      };
    } catch (error) {
      await client.query('ROLLBACK');

      throw new CustomError(error.statusCode, error.message);
    } finally {
      client.release();
    }
  }

  async listBankStatement({ id }) {
    const client = await poolPostgres.connect();

    // To improve this, do you need to check at the bank? If yes, so as not to need to verify the client first
    if (!clients.includes(Number(id))) {
      throw new CustomError(404, 'User not found');
    }

    try {
      const userTransactions = await this.repository.listBankStatement({
        client,
        id,
      });

      let transactions = [];

      if (userTransactions.length > 0) {
        transactions = userTransactions.map(
          ({ valor, tipo, descricao, realizada_em }) => {
            if (!valor || !tipo || !descricao || !realizada_em) return;

            return {
              valor: valor ?? valor,
              tipo: tipo ?? tipo,
              descricao: descricao ?? descricao,
              realizada_em: realizada_em ?? realizada_em,
            };
          },
        );
      }

      return {
        saldo: {
          total: userTransactions[0].saldo,
          data_extrato: new Date().toISOString(),
          limite: userTransactions[0].limite,
        },
        ultimas_transacoes: !transactions[0] ? [] : transactions,
      };
    } catch (error) {
      throw new CustomError(500, 'Internal Server Error');
    } finally {
      client.release();
    }
  }
}
