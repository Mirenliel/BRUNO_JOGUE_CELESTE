import test from "node:test";
import assert from "node:assert/strict";
import roleMiddleware from "../src/middlewares/roleMiddleware.js";
import {
  createMockRequest,
  createMockResponse,
} from "../testSupport/httpMocks.js";

test("roleMiddleware bloqueia requisicao sem usuario autenticado", () => {
  const middleware = roleMiddleware("admin");
  const req = createMockRequest();
  const res = createMockResponse();
  let nextCalled = false;

  middleware(req, res, () => {
    nextCalled = true;
  });

  assert.equal(res.statusCode, 401);
  assert.equal(nextCalled, false);
  assert.deepEqual(res.body, { error: "Usuario nao autenticado" });
});

test("roleMiddleware bloqueia usuario com role diferente da exigida", () => {
  const middleware = roleMiddleware("admin");
  const req = createMockRequest({
    user: {
      id: 2,
      role: "user",
    },
  });
  const res = createMockResponse();
  let nextCalled = false;

  middleware(req, res, () => {
    nextCalled = true;
  });

  assert.equal(res.statusCode, 403);
  assert.equal(nextCalled, false);
  assert.deepEqual(res.body, { error: "Acesso negado" });
});

test("roleMiddleware permite continuar quando a role bate", () => {
  const middleware = roleMiddleware("admin");
  const req = createMockRequest({
    user: {
      id: 1,
      role: "admin",
    },
  });
  const res = createMockResponse();
  let nextCalled = false;

  middleware(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(res.statusCode, 200);
});
