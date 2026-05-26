const test = require("node:test");
const assert = require("node:assert/strict");

const { NotificationRepository } = require("../src/repository/notification.repo");
const { redisClient } = require("../src/config/database/redis.config");

test("saveNotification should prepend the notification and trim the stored list", async () => {
  const originalLpush = redisClient.lpush;
  const originalLtrim = redisClient.ltrim;
  const calls = [];
  const notification = { id: "n-1", title: "Order updated" };

  redisClient.lpush = async (...args) => calls.push(["lpush", ...args]);
  redisClient.ltrim = async (...args) => calls.push(["ltrim", ...args]);

  try {
    const repo = new NotificationRepository();
    await repo.saveNotification("user@example.com", notification);

    assert.deepEqual(calls, [
      ["lpush", "notifications:user@example.com", JSON.stringify(notification)],
      ["ltrim", "notifications:user@example.com", 0, 49],
    ]);
  } finally {
    redisClient.lpush = originalLpush;
    redisClient.ltrim = originalLtrim;
  }
});

test("getNotificationsByUser should cap the Redis read to the retention limit", async () => {
  const originalLrange = redisClient.lrange;
  let rangeArgs;

  redisClient.lrange = async (...args) => {
    rangeArgs = args;
    return [JSON.stringify({ id: "n-2" })];
  };

  try {
    const repo = new NotificationRepository();
    const result = await repo.getNotificationsByUser("user@example.com", 999);

    assert.deepEqual(rangeArgs, ["notifications:user@example.com", 0, 49]);
    assert.deepEqual(result, [{ id: "n-2" }]);
  } finally {
    redisClient.lrange = originalLrange;
  }
});
