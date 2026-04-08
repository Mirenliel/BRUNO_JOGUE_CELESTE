import test from "node:test";
import assert from "node:assert/strict";
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
