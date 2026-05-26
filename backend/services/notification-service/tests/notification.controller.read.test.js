const test = require("node:test");
const assert = require("node:assert/strict");

const { NotificationController } = require("../src/controllers/notification.controller");

function createMockResponse() {
  return {
    statusCode: null,
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

test("health should return an OK response", async () => {
  const controller = new NotificationController();
  const res = createMockResponse();

  await controller.health({}, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { ok: true });
});

test("getNotificationsByUser should pass filters to repository and return results", async () => {
  const controller = new NotificationController();
  const expected = {
    currentPage: 2,
    limit: 5,
    totalItems: 8,
    totalPages: 2,
    items: [{ id: "notification-1" }],
  };
  let requestPayload;

  controller.notificationRepo = {
    async getNotificationsByUserPaginated(payload) {
      requestPayload = payload;
      return expected;
    },
  };

  const req = {
    query: {
      userId: " buyer@example.com ",
      channel: "buyer",
      page: "2",
      limit: "5",
    },
  };
  const res = createMockResponse();

  await controller.getNotificationsByUser(req, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(requestPayload, {
    userId: "buyer@example.com",
    channel: "buyer",
    page: 2,
    limit: 5,
  });
  assert.deepEqual(res.body, { message: "OK", result: expected });
});

test("getNotificationsByUser should reject requests without userId", async () => {
  const controller = new NotificationController();
  const res = createMockResponse();

  await controller.getNotificationsByUser({ query: {}, body: {} }, res);

  assert.equal(res.statusCode, 400);
  assert.match(res.body.message, /userId is required/);
});
