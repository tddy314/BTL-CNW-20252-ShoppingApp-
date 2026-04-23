import { createClient } from 'redis';
import * as dotenv from "dotenv";
dotenv.config();

const REDIS_URL = process.env.REDIS_ENDPOINT;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD

const client = createClient({
    username: 'default',
    password: REDIS_PASSWORD,
    socket: {
        host: 'redis-15437.crce295.us-east-1-1.ec2.cloud.redislabs.com',
        port: 15437
    }
});

client.on('error', err => console.log('Redis Client Error', err));

//await client.connect();

export const connectRedis = async () => {
    try {
        if (!client.isOpen) {
            await client.connect();
            console.log("Redis connected");
        }
    } catch (err) {
        console.error("Redis connection failed:", err);
        process.exit(1);
    }
};

// export default redisClient;

export default client;
// await client.set('foo', 'bar');
// const result = await client.get('foo');
// console.log(result)  // >>> bar

