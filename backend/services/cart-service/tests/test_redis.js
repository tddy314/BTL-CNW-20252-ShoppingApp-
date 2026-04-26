import redisClient from "../src/config/database/redis.config.js"
import { connectRedis } from "../src/config/database/redis.config.js";

await connectRedis();
const result = await redisClient.get('foo');
console.log(result)  // >>> bar