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

test("summary retorna indicadores do usuario e a media geral da plataforma", async (t) => {
  const originalFindAll = HabitRecord.findAll;
  const receivedQueries = [];

  HabitRecord.findAll = async (query) => {
    receivedQueries.push(query);

    if (receivedQueries.length === 1) {
      return [
        {
          date: "2026-04-07",
          waterIntakeMl: 2000,
          activityMinutes: 40,
          mood: "bem",
          userId: 3,
        },
        {
          date: "2026-04-06",
          waterIntakeMl: 1000,
          activityMinutes: 20,
          mood: "cansado",
          userId: 3,
        },
      ];
    }

    return [
      {
        date: "2026-04-07",
        waterIntakeMl: 2000,
        activityMinutes: 40,
        mood: "bem",
        userId: 3,
      },
      {
        date: "2026-04-06",
        waterIntakeMl: 1000,
        activityMinutes: 20,
        mood: "cansado",
        userId: 3,
      },
      {
        date: "2026-04-05",
        waterIntakeMl: 1500,
        activityMinutes: 30,
        mood: "bem",
        userId: 8,
      },
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

  await habitRecordController.summary(req, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(receivedQueries, [
    {
      where: { userId: 3 },
      order: [["date", "DESC"]],
    },
    {},
  ]);
  assert.deepEqual(res.body, {
    user: {
      totalRecords: 2,
      averageWaterIntakeMl: 1500,
      averageActivityMinutes: 30,
      moodBreakdown: {
        bem: 1,
        cansado: 1,
      },
      latestRecordDate: "2026-04-07",
    },
    general: {
      totalTrackedUsers: 2,
      totalRecords: 3,
      averageWaterIntakeMl: 1500,
      averageActivityMinutes: 30,
    },
  });
});

test("summary retorna zeros quando ainda nao existem registros", async (t) => {
  const originalFindAll = HabitRecord.findAll;

  HabitRecord.findAll = async () => [];

  t.after(() => {
    HabitRecord.findAll = originalFindAll;
  });

  const req = createMockRequest({
    user: {
      id: 3,
    },
  });
  const res = createMockResponse();

  await habitRecordController.summary(req, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, {
    user: {
      totalRecords: 0,
      averageWaterIntakeMl: 0,
      averageActivityMinutes: 0,
      moodBreakdown: {},
      latestRecordDate: null,
    },
    general: {
      totalTrackedUsers: 0,
      totalRecords: 0,
      averageWaterIntakeMl: 0,
      averageActivityMinutes: 0,
    },
  });
});

test("progress retorna historico com deltas e tendencia de melhora", async (t) => {
  const originalFindAll = HabitRecord.findAll;
  let receivedQuery;

  HabitRecord.findAll = async (query) => {
    receivedQuery = query;
    return [
      {
        date: "2026-04-05",
        waterIntakeMl: 1000,
        activityMinutes: 20,
        mood: "cansado",
        notes: "Comecando",
      },
      {
        date: "2026-04-06",
        waterIntakeMl: 1500,
        activityMinutes: 25,
        mood: "normal",
        notes: "Melhorando",
      },
      {
        date: "2026-04-07",
        waterIntakeMl: 2000,
        activityMinutes: 40,
        mood: "bem",
        notes: "Bom dia",
      },
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

  await habitRecordController.progress(req, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(receivedQuery, {
    where: { userId: 3 },
    order: [["date", "ASC"]],
  });
  assert.deepEqual(res.body, {
    totalRecords: 3,
    trend: {
      waterIntakeMl: "improving",
      activityMinutes: "improving",
    },
    history: [
      {
        date: "2026-04-05",
        waterIntakeMl: 1000,
        activityMinutes: 20,
        mood: "cansado",
        notes: "Comecando",
        changes: {
          waterIntakeMl: null,
          activityMinutes: null,
        },
      },
      {
        date: "2026-04-06",
        waterIntakeMl: 1500,
        activityMinutes: 25,
        mood: "normal",
        notes: "Melhorando",
        changes: {
          waterIntakeMl: 500,
          activityMinutes: 5,
        },
      },
      {
        date: "2026-04-07",
        waterIntakeMl: 2000,
        activityMinutes: 40,
        mood: "bem",
        notes: "Bom dia",
        changes: {
          waterIntakeMl: 500,
          activityMinutes: 15,
        },
      },
    ],
  });
});

test("progress retorna tendencia insuficiente quando ha menos de dois registros", async (t) => {
  const originalFindAll = HabitRecord.findAll;

  HabitRecord.findAll = async () => [
    {
      date: "2026-04-07",
      waterIntakeMl: 1000,
      activityMinutes: 20,
      mood: "normal",
      notes: null,
    },
  ];

  t.after(() => {
    HabitRecord.findAll = originalFindAll;
  });

  const req = createMockRequest({
    user: {
      id: 3,
    },
  });
  const res = createMockResponse();

  await habitRecordController.progress(req, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, {
    totalRecords: 1,
    trend: {
      waterIntakeMl: "insufficient_data",
      activityMinutes: "insufficient_data",
    },
    history: [
      {
        date: "2026-04-07",
        waterIntakeMl: 1000,
        activityMinutes: 20,
        mood: "normal",
        notes: null,
        changes: {
          waterIntakeMl: null,
          activityMinutes: null,
        },
      },
    ],
  });
});
