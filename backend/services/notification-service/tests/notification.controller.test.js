const test = require("node:test");
const assert = require("node:assert/strict");

const { normalizeIncomingNotification } = require("../src/controllers/notification.controller");

test("normalizeIncomingNotification should map fallback user field and keep payload data", () => {
  const now = 1710000000000;
  const payload = {
    userId: "user-123",
    type: "ORDER_ACCEPTED",
    title: "Order accepted",
    body: "Your order has been accepted by seller",
    createdAt: now,
    data: {
      channel: "buyer",
      orderId: "order-abc",
      targetUrl: "/orders/order-abc",
    },
  };

  const result = normalizeIncomingNotification(payload);

  assert.equal(result.toUserId, "user-123");
  assert.equal(result.type, "ORDER_ACCEPTED");
  assert.equal(result.title, "Order accepted");
  assert.equal(result.body, "Your order has been accepted by seller");
  assert.equal(result.createdAt, now);
  assert.deepEqual(result.data, payload.data);
  assert.ok(typeof result.id === "string" && result.id.length > 0);
});
