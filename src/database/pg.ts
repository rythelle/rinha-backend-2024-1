import { Pool } from 'pg';

const poolPostgres = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: Number(process.env.POSTGRES_PORT),
});

// const poolPostgres = new Pool({
//   user: 'cake',
//   host: 'localhost',
//   database: 'db_cake',
//   password: 'cake123',
//   port: 5432,
// });

export default poolPostgres;
