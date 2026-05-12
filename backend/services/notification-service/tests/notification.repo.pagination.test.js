const test = require("node:test");
const assert = require("node:assert/strict");

const { NotificationRepository } = require("../src/repository/notification.repo");
const { redisClient } = require("../src/config/database/redis.config");

test("getNotificationsByUserPaginated should filter by channel and paginate correctly", async () => {
  const originalLrange = redisClient.lrange;

  const fakeRows = [
    JSON.stringify({ id: "1", data: { channel: "buyer" }, title: "A" }),
    JSON.stringify({ id: "2", data: { channel: "admin" }, title: "B" }),
    JSON.stringify({ id: "3", data: { channel: "buyer" }, title: "C" }),
    JSON.stringify({ id: "4", data: { channel: "seller" }, title: "D" }),
    JSON.stringify({ id: "5", data: { channel: "buyer" }, title: "E" }),
  ];

  redisClient.lrange = async () => fakeRows;

  try {
    const repo = new NotificationRepository();
    const result = await repo.getNotificationsByUserPaginated({
      userId: "u-1",
      channel: "buyer",
      page: 2,
      limit: 2,
    });

    assert.equal(result.currentPage, 2);
    assert.equal(result.limit, 2);
    assert.equal(result.totalItems, 3);
    assert.equal(result.totalPages, 2);
    assert.equal(result.items.length, 1);
    assert.equal(result.items[0].id, "5");
    assert.equal(result.items[0].data.channel, "buyer");
  } finally {
    redisClient.lrange = originalLrange;
  }
});
