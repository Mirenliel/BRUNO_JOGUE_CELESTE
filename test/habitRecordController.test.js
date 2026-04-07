import test from "node:test";
import assert from "node:assert/strict";
import habitRecordController from "../src/controllers/habitRecordController.js";
import HabitRecord from "../src/models/HabitRecord.js";
import {
  createMockRequest,
  createMockResponse,
} from "../testSupport/httpMocks.js";

test("create associa o registro ao usuario autenticado", async (t) => {
  const originalCreate = HabitRecord.create;
  let createdPayload;

  HabitRecord.create = async (payload) => {
    createdPayload = payload;
    return { id: 10, ...payload };
  };

  t.after(() => {
    HabitRecord.create = originalCreate;
  });

  const req = createMockRequest({
    body: {
      date: "2026-04-07",
      waterIntakeMl: 2000,
      activityMinutes: 45,
      mood: "bem",
      notes: "Dia produtivo",
    },
    user: {
      id: 3,
    },
  });
  const res = createMockResponse();

  await habitRecordController.create(req, res);

  assert.equal(res.statusCode, 201);
  assert.equal(createdPayload.userId, 3);
  assert.equal(createdPayload.date, "2026-04-07");
  assert.equal(res.body.id, 10);
});

test("list busca apenas os registros do usuario autenticado em ordem decrescente", async (t) => {
  const originalFindAll = HabitRecord.findAll;
  let receivedQuery;

  HabitRecord.findAll = async (query) => {
    receivedQuery = query;
    return [
      { id: 2, date: "2026-04-07" },
      { id: 1, date: "2026-04-06" },
    ];
  };

  t.after(() => {
    HabitRecord.findAll = originalFindAll;
  });

  const req = createMockRequest({
    user: {
      id: 3,
    },
  });
  const res = createMockResponse();

  await habitRecordController.list(req, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(receivedQuery, {
    where: { userId: 3 },
    order: [["date", "DESC"]],
  });
  assert.equal(res.body.length, 2);
});

test("adminList busca todos os registros com os dados basicos do usuario", async (t) => {
  const originalFindAll = HabitRecord.findAll;
  let receivedQuery;

  HabitRecord.findAll = async (query) => {
    receivedQuery = query;
    return [{ id: 10 }];
  };

  t.after(() => {
    HabitRecord.findAll = originalFindAll;
  });

  const req = createMockRequest({
    user: {
      id: 1,
      role: "admin",
    },
  });
  const res = createMockResponse();

  await habitRecordController.adminList(req, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(receivedQuery, {
    include: [
      {
        association: "user",
        attributes: ["id", "email", "role"],
      },
    ],
    order: [["date", "DESC"]],
  });
  assert.equal(res.body.length, 1);
});

test("adminDelete remove qualquer registro pelo id", async (t) => {
  const originalFindByPk = HabitRecord.findByPk;
  let destroyed = false;

  HabitRecord.findByPk = async (id) => ({
    id,
    destroy: async () => {
      destroyed = true;
    },
  });

  t.after(() => {
    HabitRecord.findByPk = originalFindByPk;
  });

  const req = createMockRequest({
    params: {
      id: "9",
    },
    user: {
      id: 1,
      role: "admin",
    },
  });
  const res = createMockResponse();

  await habitRecordController.adminDelete(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(destroyed, true);
  assert.deepEqual(res.body, {
    message: "Registro removido com sucesso",
  });
});
