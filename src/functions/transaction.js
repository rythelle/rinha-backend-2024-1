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

      if ([id, valor, tipo, descricao].some((value) => !value)) {
        throw new CustomError(400, 'All params is required');
      }

      const clientId = Number(id);
      const value = Number(valor);

      if (Number.isNaN(clientId)) {
        throw new CustomError(400, 'Type of id is invalid');
      }

      if (Number.isNaN(value) || !Number.isInteger(value)) {
        throw new CustomError(400, 'Type of valor is invalid');
      }

      if (value < 0) {
        throw new CustomError(400, 'Input of valor is invalid');
      }

      if ([tipo, descricao].some((value) => typeof value !== 'string')) {
        throw new CustomError(400, 'Type of tipo or descricao is invalid');
      }

      if (!clients.includes(clientId)) {
        throw new CustomError(404, 'User not found');
      }

      if (!transactionsAllow.includes(tipo)) {
        throw new CustomError(400, 'Type of operation not allow');
      }

      // Credit operation
      if (tipo === 'c') {
        const user = await this.repository.selectUser({ client, id: clientId });

        const newBalance = user.saldo + value;

        await this.repository.updateBalance({
          client,
          id: clientId,
          newBalance,
        });

        await this.repository.insertTransaction({
          client,
          id: clientId,
          valor: value,
          tipo,
          descricao,
        });

        return {
          limite: user.limite,
          saldo: newBalance,
        };
      }

      // Debit operation
      const user = await this.repository.selectUser({ client, id: clientId });

      const newBalance = user.saldo - value;

      if (user.limite + newBalance < 0) {
        throw new CustomError(422, 'This operation is not allow');
      }

      await this.repository.updateBalance({ client, id: clientId, newBalance });

      await this.repository.insertTransaction({
        client,
        id: clientId,
        valor: value,
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

    try {
      const clientId = Number(id);

      if (Number.isNaN(clientId)) {
        throw new CustomError(400, 'Type of id is invalid');
      }

      // To improve this, do you need to check at the bank? If yes, so as not to need to verify the client first
      if (!clients.includes(clientId)) {
        throw new CustomError(404, 'User not found');
      }

      const userTransactions = await this.repository.listBankStatement({
        client,
        id: clientId,
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
      throw new CustomError(
        error.statusCode || 500,
        error.message || 'Internal Server Error',
      );
    } finally {
      client.release();
    }
  }
}
