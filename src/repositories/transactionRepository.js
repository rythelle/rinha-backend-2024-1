import memoryCache from '../cache/memoryCache.js';
import poolPostgres from '../database/pg.js';
import CustomError from '../utils/customError.js';

export default class TransactionRepository {
  async listBankStatement({ client, id }) {
    const { rows } = await client.query(`
        SELECT
          u."id_cliente",
          u."limite",
          u."saldo",
          t.*
        FROM USUARIO u
        LEFT JOIN TRANSACAO t ON t.id_cliente = u.id_cliente
        WHERE u.id_cliente = ${id}
        ORDER BY CASE WHEN t.realizada_em IS NULL THEN 1 ELSE 0 END, t.realizada_em DESC
        LIMIT 10;
      `);

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

      if (rows[0].saldo_att === null) {
        throw new CustomError(422, 'Operation not completed');
      }

      return {
        saldo: rows[0].saldo_att,
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
        `SELECT * FROM ADD_DEBIT_TRANSACTION(CAST($1 AS SMALLINT), $2, $3)`,
        [id_cliente, value, description],
      );

      client.release();

      console.log('#### 000', { rows });

      throw new CustomError(422, 'Operation not completed');

      if (rows[0].saldo_att === null) {
        throw new CustomError(422, 'Operation not completed');
      }

      return {
        saldo: rows[0].saldo_att,
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
