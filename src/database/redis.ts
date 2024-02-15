import Redis from 'ioredis';

const redis = new Redis({
  port: Number(process.env.REDIS_PORT),
  host: process.env.REDIS_HOST,
});

// const redis = new Redis({
//   port: 6379,
//   host: 'localhost',
// });

export default redis;
