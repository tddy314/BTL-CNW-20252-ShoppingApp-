import test from "node:test";
import assert from "node:assert/strict";

import { AuthController } from "../src/controllers/auth.controller.js";

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

test("signIn should return payload + token when repository login succeeds", async () => {
  const controller = new AuthController();
  controller.authRepo = {
    signIn: async () => ({
      user: {
        id: "user-001",
        email: "demo@example.com",
        user_metadata: { role: "buyer" },
      },
      session: {
        access_token: "token-abc-123",
      },
    }),
  };

  const req = {
    body: {
      email: "demo@example.com",
      password: "123456",
    },
  };
  const res = createMockRes();

  await controller.signIn(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body?.message, "Login OK!");
  assert.equal(res.body?.data?.token, "token-abc-123");
  assert.deepEqual(res.body?.data?.payload, {
    userId: "user-001",
    email: "demo@example.com",
    role: "buyer",
  });
});
