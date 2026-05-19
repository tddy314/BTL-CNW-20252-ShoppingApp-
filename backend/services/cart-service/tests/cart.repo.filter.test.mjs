import test from "node:test";
import assert from "node:assert/strict";

import redisClient from "../src/config/database/redis.config.js";
import { CartRepo } from "../src/repository/cart.repo.js";

test("getCart should filter items by category (case-insensitive)", async () => {
  const originalLRange = redisClient.lRange;

  redisClient.lRange = async () => [
    JSON.stringify({
      cartItemId: "c1",
      addedAt: "2026-01-01T10:00:00.000Z",
      productDetail: { category: "Electronics", price: 100 },
    }),
    JSON.stringify({
      cartItemId: "c2",
      addedAt: "2026-01-02T10:00:00.000Z",
      productDetail: { category: "Fashion", price: 50 },
    }),
    JSON.stringify({
      cartItemId: "c3",
      addedAt: "2026-01-03T10:00:00.000Z",
      productDetail: { category: "electronics", price: 120 },
    }),
  ];

  try {
    const repo = new CartRepo();
    const result = await repo.getCart("user@example.com", 1, 5, "latest", "ELECTRONICS");

    assert.equal(result.currentPage, 1);
    assert.equal(result.totalItems, 2);
    assert.equal(result.totalPages, 1);
    assert.equal(result.items.length, 2);
    assert.equal(result.items[0].cartItemId, "c3");
    assert.equal(result.items[1].cartItemId, "c1");
  } finally {
    redisClient.lRange = originalLRange;
  }
});
