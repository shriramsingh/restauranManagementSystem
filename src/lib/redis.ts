import Redis from 'ioredis';
import { env } from './env';

// Only connect to Redis if REDIS_URL is configured
const redis = env.REDIS_URL
  ? new Redis(env.REDIS_URL, {
      commandTimeout: 500,
      lazyConnect: true,
    })
  : null;

if (redis) {
  redis.on('error', (err) => {
    console.error('Redis connection error:', err);
  });
}

export default redis;
