import test from "node:test";
import assert from "node:assert/strict";

import redisClient from "../src/config/database/redis.config.js";
import { CartRepo } from "../src/repository/cart.repo.js";

test("getCart should paginate filtered results with safe page handling", async () => {
  const originalLRange = redisClient.lRange;

  redisClient.lRange = async () => [
    JSON.stringify({
      cartItemId: "a1",
      addedAt: "2026-01-01T10:00:00.000Z",
      productDetail: { category: "books", price: 10 },
    }),
    JSON.stringify({
      cartItemId: "a2",
      addedAt: "2026-01-02T10:00:00.000Z",
      productDetail: { category: "books", price: 20 },
    }),
    JSON.stringify({
      cartItemId: "a3",
      addedAt: "2026-01-03T10:00:00.000Z",
      productDetail: { category: "books", price: 30 },
    }),
    JSON.stringify({
      cartItemId: "a4",
      addedAt: "2026-01-04T10:00:00.000Z",
      productDetail: { category: "fashion", price: 40 },
    }),
  ];

  try {
    const repo = new CartRepo();
    const result = await repo.getCart("buyer@example.com", 99, 5, "price-asc", "books");

    assert.equal(result.totalItems, 3);
    assert.equal(result.totalPages, 1);
    assert.equal(result.currentPage, 1);
    assert.equal(result.items.length, 3);
    assert.deepEqual(
      result.items.map((item) => item.cartItemId),
      ["a1", "a2", "a3"]
    );
  } finally {
    redisClient.lRange = originalLRange;
  }
});
