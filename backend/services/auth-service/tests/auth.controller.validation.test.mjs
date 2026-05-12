import test from "node:test";
import assert from "node:assert/strict";

import { AuthController } from "../src/controllers/auth.controller.js";

function createMockRes() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code
      return this;
    },
    json(payload) {
      this.body = payload
      return this
    },
  }
}

test("signIn should return 500 when email or password is missing", async () => {
  const controller = new AuthController();
  const req = { body: { email: "", password: "" } };
  const res = createMockRes();

  await controller.signIn(req, res);

  assert.equal(res.statusCode, 500);
  assert.match(String(res.body?.message || ""), /No data found/i);
})
