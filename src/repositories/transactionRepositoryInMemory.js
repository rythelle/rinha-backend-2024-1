const users = {
  rows: [
    {
      id_cliente: 1,
      limite: 100000,
      saldo: 0,
    },
    {
      id_cliente: 2,
      limite: 80000,
      saldo: 0,
    },
    {
      id_cliente: 3,
      limite: 1000000,
      saldo: 0,
    },
    {
      id_cliente: 4,
      limite: 10000000,
      saldo: 0,
    },
    {
      id_cliente: 5,
      limite: 500000,
      saldo: 0,
    },
  ],
};

const transactionsDone = [];
let initialIdTransaction = 0;

export default class TransactionRepositoryInMemory {
  async selectUser({ id }) {
    const user = users.rows.find(({ id_cliente }) => Number(id) === id_cliente);

    return user;
  }

  async updateBalance({ id, newBalance }) {
    const user = users.rows.find(({ id_cliente }) => Number(id) === id_cliente);

    user.saldo = newBalance;
  }

  async insertTransaction({ id, valor, tipo, descricao }) {
    transactionsDone.push({
      id: (initialIdTransaction += 1),
      realizada_em: new Date().toISOString(),
      tipo,
      descricao,
      valor,
      id_cliente: Number(id),
    });
  }

  // async createCreditTransaction({ id, valor, tipo, descricao }) {
  //   const user = users.rows.find(({ id_cliente }) => Number(id) === id_cliente);

  //   const newBalance = user.saldo + valor;

  //   user.saldo = newBalance;

  //   transactionsDone.push({
  //     id: (initialIdTransaction += 1),
  //     realizada_em: new Date().toISOString(),
  //     tipo,
  //     descricao,
  //     valor,
  //     id_cliente: Number(id),
  //   });

  //   return {
  //     limite: user.limite,
  //     saldo: newBalance,
  //   };
  // }

  // async createDebitTransaction({ id, valor, tipo, descricao }) {
  //   const user = users.rows.find(({ id_cliente }) => Number(id) === id_cliente);

  //   const newBalance = user.saldo - valor;

  //   if (user.limite + newBalance < 0) {
  //     throw new CustomError(422, 'This operation is not allow');
  //   }

  //   user.saldo = newBalance;

  //   transactionsDone.push({
  //     id: (initialIdTransaction += 1),
  //     realizada_em: new Date().toISOString(),
  //     tipo,
  //     descricao,
  //     valor,
  //     id_cliente: Number(id),
  //   });

  //   return {
  //     limite: user.limite,
  //     saldo: newBalance,
  //   };
  // }

  async listBankStatement({ id }) {
    const user = users.rows.find(({ id_cliente }) => Number(id) === id_cliente);

    const userTransactions = transactionsDone.filter(
      (transaction) => transaction.id_cliente === Number(id),
    );

    userTransactions.sort((a, b) => {
      if (a.realizada_em === null && b.realizada_em === null) {
        return 0;
      }
      if (a.realizada_em === null) {
        return 1;
      }
      if (b.realizada_em === null) {
        return -1;
      }

      return b.realizada_em - a.realizada_em;
    });

    userTransactions.slice(0, 10);

    return userTransactions.map((transaction) => {
      return {
        ...transaction,
        saldo: user.saldo,
        limite: user.limite,
      };
    });
  }

  // Do not used
  async findUser(id) {
    const user = users.rows.find(({ id_cliente }) => Number(id) === id_cliente);

    return {
      exist: user.id_cliente ?? false,
    };
  }
}
