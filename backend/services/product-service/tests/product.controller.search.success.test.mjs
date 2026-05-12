import test from "node:test";
import assert from "node:assert/strict";

import { ProductController } from "../src/controllers/product.controller.js";

function createMockRes() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

test("searchProducts should return 200 and repository result", async () => {
  const controller = new ProductController();
  const fakeResult = {
    currentPage: 1,
    totalPages: 1,
    totalItems: 1,
    limit: 10,
    items: [
      { product_id: "p-001", name: "Demo Product", price: 100 },
    ],
  };

  controller.productRepo = {
    searchProducts: async () => fakeResult,
  };

  const req = {
    body: {
      page: 1,
      limit: 10,
      query: "demo",
    },
  };
  const res = createMockRes();

  await controller.searchProducts(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body?.message, "OK");
  assert.deepEqual(res.body?.result, fakeResult);
});
