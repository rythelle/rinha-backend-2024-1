export default class TransactionRepository {
  async selectUser({ client, id }) {
    await client.query('BEGIN TRANSACTION;');

    await client.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;');

    const { rows } = await client.query(
      `SELECT * FROM USUARIO WHERE id_cliente = ${id} FOR UPDATE;`,
    );

    // await client.query('COMMIT;');

    return rows[0];
  }

  async updateBalance({ client, id, newBalance }) {
    // await client.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;');

    // await client.query('BEGIN TRANSACTION;');

    await client.query(
      `UPDATE USUARIO SET saldo = ${newBalance} WHERE id_cliente = ${id};`,
    );

    // return client.query('COMMIT;');
  }

  async insertTransaction({ client, id, valor, tipo, descricao }) {
    // await client.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;');

    // await client.query('BEGIN TRANSACTION;');

    // Send to a queue for further processing ???
    await client.query(
      `INSERT INTO TRANSACAO (tipo, descricao, valor, id_cliente) VALUES ('${tipo}', '${descricao}', ${valor}, ${id});`,
    );

    return client.query('COMMIT;');
  }

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

  // Do not used
  async findUser({ client, id }) {
    const { rows } = await client.query(
      `SELECT * FROM USUARIO WHERE ID = '${id}'`,
    );

    return {
      exist: rows[0].id_cliente ?? false,
    };
  }
}
