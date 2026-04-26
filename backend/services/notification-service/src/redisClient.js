const Redis = require('ioredis');
const url = process.env.REDIS_URL || 'redis://localhost:6379';

const redis = new Redis(url);

redis.on('connect', () => {
  console.log('Redis connected');
});

redis.on('error', (err) => {
  console.error('Redis error', err);
});

module.exports = redis;
