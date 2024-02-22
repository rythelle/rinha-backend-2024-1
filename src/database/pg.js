import pg from 'pg';

const { Pool } = pg;

const poolPostgres = new Pool({
  database: process.env.POSTGRES_DB,
  host: process.env.POSTGRES_HOST,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  port: Number(process.env.POSTGRES_PORT),
});

export default poolPostgres;
