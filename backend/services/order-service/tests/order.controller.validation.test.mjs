import test from "node:test";
import assert from "node:assert/strict";

import { OrderController } from "../src/controllers/order.controller.js";

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

test("modifyOrder should return 400 when order_id or buyer is missing", async () => {
  const controller = new OrderController();
  controller.orderRepo = {
    modifyOrderByBuyer: async () => ({ ok: true }),
  };

  const req = {
    body: {
      buyer: "",
      phone: "0123456789",
    },
  };
  const res = createMockRes();

  await controller.modifyOrder(req, res);

  assert.equal(res.statusCode, 400);
  assert.match(String(res.body?.message || ""), /order_id and buyer are required/i);
});
