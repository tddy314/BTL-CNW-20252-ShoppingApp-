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

test("addProduct should return 400 when repository throws error", async () => {
  const controller = new ProductController();
  controller.productRepo = {
    addProduct: async () => {
      throw new Error("Invalid product payload");
    },
  };

  const req = { body: { name: "" } };
  const res = createMockRes();

  await controller.addProduct(req, res);

  assert.equal(res.statusCode, 400);
  assert.match(String(res.body?.message || ""), /Invalid product payload/i);
});
