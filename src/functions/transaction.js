import memoryCache from '../cache/memoryCache.js';
import poolPostgres from '../database/pg.js';
import CustomError from '../utils/customError.js';

const transactionsAllow = ['c', 'd'];

export default class Transaction {
  constructor(repository) {
    this.repository = repository;
  }

  async create({ id, valor, tipo, descricao: description }) {
    try {
      if ([id, valor, tipo, description].some((value) => !value)) {
        throw new CustomError(422, 'All params is required');
      }

      const clientId = Number(id);
      const value = Number(valor);

      if (
        !memoryCache
          .get('clients')
          .find(({ id_cliente }) => id_cliente === clientId)
      ) {
        throw new CustomError(404, 'User not found');
      }

      const { limite: limitClient } = memoryCache
        .get('clients')
        .find(({ id_cliente }) => id_cliente === clientId);

      if (Number.isNaN(clientId)) {
        throw new CustomError(400, 'Type of id is invalid');
      }

      if (Number.isNaN(value) || !Number.isInteger(value)) {
        throw new CustomError(400, 'Type of valor is invalid');
      }

      if (value < 0) {
        throw new CustomError(400, 'Input of valor is invalid');
      }

      if (!description || description.length <= 0 || description.length > 10) {
        throw new CustomError(422, 'Descricao is invalid');
      }

      if ([tipo, description].some((value) => typeof value !== 'string')) {
        throw new CustomError(400, 'Type of tipo or descricao is invalid');
      }

      if (!transactionsAllow.includes(tipo)) {
        throw new CustomError(422, 'Type of operation not allow');
      }

      // Credit operation
      if (tipo === 'c') {
        const { saldo, limite } = await this.repository.addCreditTransaction({
          id_cliente: clientId,
          value,
          description,
          limit: limitClient,
        });

        return {
          saldo: saldo,
          limite: limite,
        };
      }

      // Debit operation
      const { saldo, limite } = await this.repository.addDebitTransaction({
        id_cliente: clientId,
        value,
        description,
        limit: limitClient,
      });

      return {
        saldo: saldo,
        limite: limite,
      };
    } catch (error) {
      throw new CustomError(error.statusCode, error.message);
    }
  }

  async listBankStatement({ id }) {
    const client = await poolPostgres.connect();

    try {
      const clientId = Number(id);

      if (Number.isNaN(clientId)) {
        throw new CustomError(400, 'Type of id is invalid');
      }

      if (
        !memoryCache
          .get('clients')
          .find(({ id_cliente }) => id_cliente === clientId)
      ) {
        throw new CustomError(404, 'User not found');
      }

      const userTransactions = await this.repository.listBankStatement({
        id_cliente: clientId,
      });

      let transactions = [];

      if (userTransactions.length > 0) {
        transactions = userTransactions.map(
          ({ realizada_em, tipo, descricao, valor }) => {
            if (!valor || !tipo || !descricao || !realizada_em) return;

            return {
              valor: valor,
              tipo: tipo,
              descricao: descricao,
              realizada_em: realizada_em,
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
