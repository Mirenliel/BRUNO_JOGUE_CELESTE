import test from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcrypt";
import userController from "../src/controllers/userController.js";
import User from "../src/models/User.js";
import {
  createMockRequest,
  createMockResponse,
} from "../testSupport/httpMocks.js";

test("list retorna usuarios sem expor a senha", async (t) => {
  const originalFindAll = User.findAll;

  User.findAll = async () => [
    {
      id: 1,
      email: "admin@email.com",
      password: "hash-1",
      role: "admin",
      createdAt: "2026-04-07T10:00:00.000Z",
      updatedAt: "2026-04-07T10:00:00.000Z",
    },
    {
      id: 2,
      email: "user@email.com",
      password: "hash-2",
      role: "user",
      createdAt: "2026-04-07T11:00:00.000Z",
      updatedAt: "2026-04-07T11:00:00.000Z",
    },
  ];

  t.after(() => {
    User.findAll = originalFindAll;
  });

  const req = createMockRequest({
    user: {
      id: 1,
      role: "admin",
    },
  });
  const res = createMockResponse();

  await userController.list(req, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, [
    {
      id: 1,
      email: "admin@email.com",
      role: "admin",
      createdAt: "2026-04-07T10:00:00.000Z",
      updatedAt: "2026-04-07T10:00:00.000Z",
    },
    {
      id: 2,
      email: "user@email.com",
      role: "user",
      createdAt: "2026-04-07T11:00:00.000Z",
      updatedAt: "2026-04-07T11:00:00.000Z",
    },
  ]);
  assert.equal("password" in res.body[0], false);
});

test("getById retorna usuario sem expor a senha", async (t) => {
  const originalFindByPk = User.findByPk;

  User.findByPk = async () => ({
    id: 7,
    email: "alguem@email.com",
    password: "hash-secreto",
    role: "user",
    createdAt: "2026-04-07T12:00:00.000Z",
    updatedAt: "2026-04-07T12:00:00.000Z",
  });

  t.after(() => {
    User.findByPk = originalFindByPk;
  });

  const req = createMockRequest({
    params: {
      id: "7",
    },
    user: {
      id: 1,
      role: "admin",
    },
  });
  const res = createMockResponse();

  await userController.getById(req, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, {
    id: 7,
    email: "alguem@email.com",
    role: "user",
    createdAt: "2026-04-07T12:00:00.000Z",
    updatedAt: "2026-04-07T12:00:00.000Z",
  });
  assert.equal("password" in res.body, false);
});

test("getById retorna 404 quando o usuario nao existir", async (t) => {
  const originalFindByPk = User.findByPk;

  User.findByPk = async () => null;

  t.after(() => {
    User.findByPk = originalFindByPk;
  });

  const req = createMockRequest({
    params: {
      id: "99",
    },
    user: {
      id: 1,
      role: "admin",
    },
  });
  const res = createMockResponse();

  await userController.getById(req, res);

  assert.equal(res.statusCode, 404);
  assert.deepEqual(res.body, {
    message: "Usuario nao encontrado",
  });
});

test("update altera usuario sem expor a senha e criptografa nova senha", async (t) => {
  const originalFindByPk = User.findByPk;
  const originalFindOne = User.findOne;
  let updatedPayload;

  const persistedUser = {
    id: 4,
    email: "antigo@email.com",
    role: "user",
    createdAt: "2026-04-07T12:00:00.000Z",
    updatedAt: "2026-04-07T12:00:00.000Z",
    async update(payload) {
      updatedPayload = payload;
      this.email = payload.email ?? this.email;
      this.role = payload.role ?? this.role;
      this.updatedAt = "2026-04-07T13:00:00.000Z";
      return this;
    },
  };

  User.findByPk = async () => persistedUser;
  User.findOne = async () => null;

  t.after(() => {
    User.findByPk = originalFindByPk;
    User.findOne = originalFindOne;
  });

  const req = createMockRequest({
    params: {
      id: "4",
    },
    body: {
      email: "novo@email.com",
      password: "123456",
      role: "admin",
    },
    user: {
      id: 1,
      role: "admin",
    },
  });
  const res = createMockResponse();

  await userController.update(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(updatedPayload.email, "novo@email.com");
  assert.equal(updatedPayload.role, "admin");
  assert.notEqual(updatedPayload.password, "123456");
  assert.equal(await bcrypt.compare("123456", updatedPayload.password), true);
  assert.deepEqual(res.body, {
    id: 4,
    email: "novo@email.com",
    role: "admin",
    createdAt: "2026-04-07T12:00:00.000Z",
    updatedAt: "2026-04-07T13:00:00.000Z",
  });
  assert.equal("password" in res.body, false);
});

test("update retorna conflito quando o novo email ja estiver em uso", async (t) => {
  const originalFindByPk = User.findByPk;
  const originalFindOne = User.findOne;

  User.findByPk = async () => ({
    id: 4,
    email: "antigo@email.com",
  });
  User.findOne = async () => ({
    id: 9,
    email: "ocupado@email.com",
  });

  t.after(() => {
    User.findByPk = originalFindByPk;
    User.findOne = originalFindOne;
  });

  const req = createMockRequest({
    params: {
      id: "4",
    },
    body: {
      email: "ocupado@email.com",
    },
    user: {
      id: 1,
      role: "admin",
    },
  });
  const res = createMockResponse();

  await userController.update(req, res);

  assert.equal(res.statusCode, 409);
  assert.deepEqual(res.body, {
    message: "Email ja cadastrado",
  });
});

test("delete remove usuario existente", async (t) => {
  const originalFindByPk = User.findByPk;
  let destroyed = false;

  User.findByPk = async () => ({
    id: 5,
    async destroy() {
      destroyed = true;
    },
  });

  t.after(() => {
    User.findByPk = originalFindByPk;
  });

  const req = createMockRequest({
    params: {
      id: "5",
    },
    user: {
      id: 1,
      role: "admin",
    },
  });
  const res = createMockResponse();

  await userController.delete(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(destroyed, true);
  assert.deepEqual(res.body, {
    message: "Usuario removido com sucesso",
  });
});

test("delete retorna 404 quando o usuario nao existir", async (t) => {
  const originalFindByPk = User.findByPk;

  User.findByPk = async () => null;

  t.after(() => {
    User.findByPk = originalFindByPk;
  });

  const req = createMockRequest({
    params: {
      id: "50",
    },
    user: {
      id: 1,
      role: "admin",
    },
  });
  const res = createMockResponse();

  await userController.delete(req, res);

  assert.equal(res.statusCode, 404);
  assert.deepEqual(res.body, {
    message: "Usuario nao encontrado",
  });
});
