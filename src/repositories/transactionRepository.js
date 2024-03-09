import memoryCache from '../cache/memoryCache.js';
import poolPostgres from '../database/pg.js';
import CustomError from '../utils/customError.js';

export default class TransactionRepository {
  async listBankStatement({ id_cliente }) {
    const client = await poolPostgres.connect();

    const { rows } = await client.query(
      `SELECT * FROM LIST_BANK_STATEMENT($1)`,
      [id_cliente],
    );

    client.release();

    return rows;
  }

  async addCreditTransaction({ id_cliente, value, description, limit }) {
    const client = await poolPostgres.connect();

    try {
      const { rows } = await client.query(
        `SELECT * FROM ADD_CREDIT_TRANSACTION($1, $2, $3)`,
        [id_cliente, value, description],
      );

      client.release();

      if (rows[0].fc_saldo_att === null) {
        throw new CustomError(422, 'Operation not completed');
      }

      return {
        saldo: rows[0].fc_saldo_att,
        limite: limit,
      };
    } catch (error) {
      await client.query('ROLLBACK');

      throw new CustomError(error.statusCode, error.message);
    }
  }

  async addDebitTransaction({ id_cliente, value, description, limit }) {
    const client = await poolPostgres.connect();

    try {
      const { rows } = await client.query(
        `SELECT * FROM ADD_DEBIT_TRANSACTION($1, $2, $3, $4)`,
        [id_cliente, value, description, limit],
      );

      client.release();

      if (rows[0].fc_saldo_att === null) {
        throw new CustomError(422, 'Operation not completed');
      }

      return {
        saldo: rows[0].fc_saldo_att,
        limite: limit,
      };
    } catch (error) {
      await client.query('ROLLBACK');

      throw new CustomError(error.statusCode, error.message);
    }
  }
}

export async function listUsers() {
  const client = await poolPostgres.connect();

  try {
    const { rows } = await client.query(
      'SELECT * FROM USUARIO ORDER BY id_cliente ASC',
    );

    const clients = rows.map((row) => ({
      id_cliente: row.id_cliente,
      limite: row.limite,
    }));

    memoryCache.put('clients', clients);

    return client.release();
  } catch (error) {
    await client.query('ROLLBACK');

    throw new CustomError(error.statusCode, error.message);
  }
}
