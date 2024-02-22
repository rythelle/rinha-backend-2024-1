import { expect, test, vi } from 'vitest';
import Transaction from '../transaction.js';
import TransactionRepositoryInMemory from '../../repositories/transactionRepositoryInMemory.js';

const repository = new TransactionRepositoryInMemory();
const transaction = new Transaction(repository);

vi.mock('pg', async () => {
  const actual = await vi.importActual('pg');

  return {
    ...actual,
    default: {
      Pool: class {
        constructor() {}

        async connect() {
          return {
            release: () => {},
            query: () => {},
          };
        }
      },
    },
  };
});

test('Create a new credit transaction', async () => {
  const response = await transaction.create({
    id: 1,
    tipo: 'c',
    valor: 1000,
    descricao: 'description 1',
  });

  expect(response).toStrictEqual({ limite: 100000, saldo: 1000 });
});

test('Create a new debit transaction', async () => {
  const response = await transaction.create({
    id: 2,
    tipo: 'd',
    valor: 1000,
    descricao: 'description 1',
  });

  expect(response).toStrictEqual({ limite: 80000, saldo: -1000 });
});

test('Create new transactions', async () => {
  await transaction.create({
    id: 4,
    tipo: 'c',
    valor: 1000,
    descricao: 'description 1',
  });

  await transaction.create({
    id: 4,
    tipo: 'c',
    valor: 2222,
    descricao: 'description 2',
  });

  const response = await transaction.create({
    id: 4,
    tipo: 'd',
    valor: 3000,
    descricao: 'description 3',
  });

  expect(response).toStrictEqual({ limite: 10000000, saldo: 222 });
});

test('Should not be create new transaction when balance plus limit to be minor zero', async () => {
  await transaction.create({
    id: 3,
    tipo: 'c',
    valor: 100,
    descricao: 'description 1',
  });

  await expect(
    transaction.create({
      id: 3,
      tipo: 'd',
      valor: 1500000,
      descricao: 'description 2',
    }),
  ).rejects.toThrow('This operation is not allow');
});

test('Should not be create new transaction when user do not exist', async () => {
  await expect(
    transaction.create({
      id: 10,
      tipo: 'c',
      valor: 1000,
      descricao: 'description 1',
    }),
  ).rejects.toThrow('User not found');
});

test('Should not be create new transaction when type of operation is not allow', async () => {
  await expect(
    transaction.create({
      id: 1,
      tipo: 'a',
      valor: 1000,
      descricao: 'description 1',
    }),
  ).rejects.toThrow('Type of operation not allow');
});

test('List bank statements when there is no history of last transactions', async () => {
  const response = await transaction.listBankStatement({
    id: 5,
  });

  expect(response).toStrictEqual({
    saldo: {
      data_extrato: expect.anything(),
      limite: 500000,
      total: 0,
    },
    ultimas_transacoes: [],
  });
});

test('List bank statements', async () => {
  vi.useFakeTimers();

  const date1 = new Date(2024, 1, 19, 10, 30, 0, 111);
  vi.setSystemTime(date1);

  await transaction.create({
    id: 5,
    tipo: 'c',
    valor: 3000,
    descricao: 'description 1',
  });

  const date2 = new Date(2024, 1, 19, 10, 30, 0, 222);
  vi.setSystemTime(date2);

  await transaction.create({
    id: 5,
    tipo: 'c',
    valor: 1000,
    descricao: 'description 2',
  });

  const date3 = new Date(2024, 1, 19, 10, 30, 0, 333);
  vi.setSystemTime(date3);

  await transaction.create({
    id: 5,
    tipo: 'd',
    valor: 3000,
    descricao: 'description 3',
  });

  const response = await transaction.listBankStatement({
    id: 5,
  });

  expect(response).toStrictEqual({
    saldo: {
      data_extrato: expect.anything(),
      limite: 500000,
      total: 1000,
    },
    ultimas_transacoes: [
      {
        descricao: 'description 1',
        realizada_em: '2024-02-19T13:30:00.111Z',
        tipo: 'c',
        valor: 3000,
      },
      {
        descricao: 'description 2',
        realizada_em: '2024-02-19T13:30:00.222Z',
        tipo: 'c',
        valor: 1000,
      },
      {
        descricao: 'description 3',
        realizada_em: '2024-02-19T13:30:00.333Z',
        tipo: 'd',
        valor: 3000,
      },
    ],
  });
});

test('Should not be list bank statements when user not found', async () => {
  await expect(
    transaction.listBankStatement({
      id: 16,
    }),
  ).rejects.toThrow('User not found');
});

test('Should not be create a new transaction when there is param required', async () => {
  await expect(
    transaction.create({
      id: 5,
      tipo: 'd',
      descricao: 'description 1',
    }),
  ).rejects.toThrow('All params is required');
});

test('Should not be create a new transaction when id param is NaN', async () => {
  await expect(
    transaction.create({
      id: 'abc',
      tipo: 'd',
      valor: 3000,
      descricao: 'description 1',
    }),
  ).rejects.toThrow('Type of id is invalid');
});

test('Should not be create a new transaction when valor param is NaN', async () => {
  await expect(
    transaction.create({
      id: 1,
      tipo: 'd',
      valor: 'abc',
      descricao: 'description 1',
    }),
  ).rejects.toThrow('Type of valor is invalid');
});

test('Should not be create a new transaction when valor param is negative', async () => {
  await expect(
    transaction.create({
      id: 1,
      tipo: 'd',
      valor: -1000,
      descricao: 'description 1',
    }),
  ).rejects.toThrow('Input of valor is invalid');
});

test('Should not be create a new transaction when tipo or descricao is not a string', async () => {
  await expect(
    transaction.create({
      id: 1,
      tipo: 'd',
      valor: 1000,
      descricao: 123,
    }),
  ).rejects.toThrow('Type of tipo or descricao is invalid');
});

test('Should not be list bank statements when id param is NaN', async () => {
  await expect(
    transaction.listBankStatement({
      id: 'abc',
    }),
  ).rejects.toThrow('Type of id is invalid');
});
