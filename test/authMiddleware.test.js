import test from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import authMiddleware from "../src/middlewares/authMiddleware.js";
import {
  createMockRequest,
  createMockResponse,
} from "../testSupport/httpMocks.js";

test("authMiddleware bloqueia requisicao sem token", () => {
  const req = createMockRequest();
  const res = createMockResponse();
  let nextCalled = false;

  authMiddleware(req, res, () => {
    nextCalled = true;
  });

  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { error: "Token nao fornecido" });
  assert.equal(nextCalled, false);
});

test("authMiddleware injeta usuario autenticado no request", () => {
  const token = jwt.sign(
    { id: 9, email: "user@email.com", role: "admin" },
    process.env.JWT_SECRET || "segredo"
  );

  const req = createMockRequest({
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
  const res = createMockResponse();
  let nextCalled = false;

  authMiddleware(req, res, () => {
    nextCalled = true;
  });

  assert.equal(res.statusCode, 200);
  assert.equal(nextCalled, true);
  assert.deepEqual(req.user, {
    id: 9,
    email: "user@email.com",
    role: "admin",
  });
  assert.equal(req.userId, 9);
  assert.equal(req.userEmail, "user@email.com");
});
