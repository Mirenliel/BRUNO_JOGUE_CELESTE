import test from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import authController from "../src/controllers/authController.js";
import User from "../src/models/User.js";
import {
  createMockRequest,
  createMockResponse,
} from "../testSupport/httpMocks.js";

test("register cria usuario com senha criptografada e resposta segura", async (t) => {
  const originalFindOne = User.findOne;
  const originalCreate = User.create;

  let createdPayload;

  User.findOne = async () => null;
  User.create = async (payload) => {
    createdPayload = payload;
    return {
      id: 1,
      email: payload.email,
      role: payload.role,
    };
  };

  t.after(() => {
    User.findOne = originalFindOne;
    User.create = originalCreate;
  });

  const req = createMockRequest({
    body: {
      email: "teste@email.com",
      password: "123456",
    },
  });
  const res = createMockResponse();

  await authController.register(req, res);

  assert.equal(res.statusCode, 201);
  assert.deepEqual(res.body, {
    message: "Usuario criado",
    user: {
      id: 1,
      email: "teste@email.com",
      role: "user",
    },
  });
  assert.equal(createdPayload.email, "teste@email.com");
  assert.equal(createdPayload.role, "user");
  assert.notEqual(createdPayload.password, "123456");
  assert.equal(await bcrypt.compare("123456", createdPayload.password), true);
});

test("login retorna token quando as credenciais sao validas", async (t) => {
  const originalFindOne = User.findOne;
  const hashedPassword = await bcrypt.hash("123456", 10);

  User.findOne = async () => ({
    id: 7,
    email: "teste@email.com",
    role: "user",
    password: hashedPassword,
  });

  t.after(() => {
    User.findOne = originalFindOne;
  });

  const req = createMockRequest({
    body: {
      email: "teste@email.com",
      password: "123456",
    },
  });
  const res = createMockResponse();

  await authController.login(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.message, "Login sucesso");
  assert.equal(res.body.user.id, 7);
  assert.ok(res.body.token);

  const decodedToken = jwt.verify(
    res.body.token,
    process.env.JWT_SECRET || "segredo"
  );

  assert.equal(decodedToken.id, 7);
  assert.equal(decodedToken.email, "teste@email.com");
  assert.equal(decodedToken.role, "user");
});
