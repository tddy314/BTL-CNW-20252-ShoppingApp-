const test = require("node:test");
const assert = require("node:assert/strict");

const { normalizeIncomingNotification } = require("../src/controllers/notification.controller");

test("normalizeIncomingNotification should throw when no target user is provided", () => {
  assert.throws(
    () => normalizeIncomingNotification({ title: "Missing user" }),
    /Missing toUserId/
  );
});
