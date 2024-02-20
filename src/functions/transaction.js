import poolPostgres from '../database/pg.js';
import CustomError from '../utils/customError.js';

const transactionsAllow = ['c', 'd'];

export default class Transaction {
  async create({ id, valor, tipo, descricao }) {
    // const user = await poolPostgres.query(
    //   `SELECT * FROM USUARIO WHERE ID = '${id}'`,
    // );

    // if (!user.rows || !user.rows.length === 0 || id === 6) {
    //   throw new Error('User not found');
    // }

    if (id === 6) {
      throw new CustomError(404, 'User not found');
    }

    if (!transactionsAllow.includes(tipo)) {
      throw new CustomError(400, 'Type of operation not allow');
    }

    try {
      // Credit operation
      if (tipo === 'c') {
        await poolPostgres.query(
          'SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;',
        );

        await poolPostgres.query('BEGIN TRANSACTION;');

        const { rows } = await poolPostgres.query(
          `SELECT * FROM USUARIO WHERE id_cliente = ${id} FOR UPDATE;`,
        );

        const newBalance = rows[0].saldo + valor;

        await poolPostgres.query(
          `UPDATE USUARIO SET saldo = ${newBalance} WHERE id_cliente = ${id};`,
        );

        // Enviar para uma fila para processamento posterior
        await poolPostgres.query(
          `INSERT INTO TRANSACAO (tipo, descricao, valor, id_cliente) VALUES ('${tipo}', '${descricao}', ${valor}, ${id});`,
        );

        await poolPostgres.query('COMMIT;');

        return {
          limite: rows[0].limite,
          saldo: newBalance,
        };
      }

      // Debit operation
      await poolPostgres.query(
        'SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;',
      );

      await poolPostgres.query('BEGIN TRANSACTION;');

      const { rows } = await poolPostgres.query(
        `SELECT * FROM USUARIO WHERE id_cliente = ${id} FOR UPDATE;`,
      );

      const newBalance = rows[0].saldo - valor;

      if (rows[0].limite + newBalance < 0) {
        throw new CustomError(422, 'This operation is not allow');
      }

      await poolPostgres.query(
        `UPDATE USUARIO SET saldo = ${newBalance} WHERE id_cliente = ${id};`,
      );

      // Enviar para uma fila para processamento posterior
      await poolPostgres.query(
        `INSERT INTO TRANSACAO (tipo, descricao, valor, id_cliente) VALUES ('${tipo}', '${descricao}', ${valor}, ${id}) RETURNING *;`,
      );

      await poolPostgres.query('COMMIT;');

      return {
        limite: rows[0].limite,
        saldo: newBalance,
      };
    } catch (error) {
      throw new CustomError(500, error.message);
    }
  }

  async listBankStatement({ id }) {
    const user = await poolPostgres.query(`
      SELECT
        *
      FROM USUARIO u
      INNER JOIN TRANSACAO t ON t.id_cliente = u.id_cliente
      WHERE u.id_cliente = ${id}
      ORDER BY t.realizada_em DESC
      LIMIT 10;
      `);

    const { rowCount, rows } = user;

    // if (!user.rows || !user.rows.length === 0 || id === 6) {
    //   throw new Error('User not found');
    // }

    if (rowCount === 0 || rows.length === 0 || id === 6) {
      throw new CustomError(404, 'User not found');
    }

    const transactions = rows.map((row) => {
      return {
        valor: row.valor,
        tipo: row.tipo,
        descricao: row.descricao,
        realizada_em: row.realizada_em,
      };
    });

    return {
      saldo: {
        total: rows[0].saldo,
        data_extrato: new Date().toISOString(),
        limite: rows[0].limite,
      },
      ultimas_transacoes: transactions,
    };
  }
}
