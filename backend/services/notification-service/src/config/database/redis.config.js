const { createClient } = require("redis");

const client = createClient({
  username: process.env.REDIS_USERNAME || "default",
  password: process.env.REDIS_PASSWORD || "kcXbuxRTp3jEKJxpH22AfxsvRZ6Ge9GJ",
  socket: {
    host: process.env.REDIS_ENDPOINT || "redis-15683.c232.us-east-1-2.ec2.cloud.redislabs.com",
    port: Number(process.env.REDIS_PORT || 15683),
  },
});

client.on("error", (error) => {
  console.error("Redis Client Error:", error.message);
});

async function connectRedis() {
  if (!client.isOpen) {
    await client.connect();
    console.log("Redis connected");
  }
}

const redisClient = {
  lpush: (...args) => client.lPush(...args),
  ltrim: (...args) => client.lTrim(...args),
  lrange: (...args) => client.lRange(...args),
};

module.exports = { redisClient, connectRedis }
