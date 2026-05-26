import { createClient } from 'redis';
import * as dotenv from "dotenv";
dotenv.config();

const REDIS_HOST = process.env.REDIS_ENDPOINT || "localhost";
const REDIS_PORT = Number(process.env.REDIS_PORT || 6379);
const REDIS_USERNAME = process.env.REDIS_USERNAME || "default";
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || "";

const client = createClient({
    username: REDIS_USERNAME,
    password: REDIS_PASSWORD,
    socket: {
        host: REDIS_HOST,
        port: REDIS_PORT
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

