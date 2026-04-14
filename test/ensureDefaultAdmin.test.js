import test from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcrypt";
import ensureDefaultAdmin from "../src/bootstrap/ensureDefaultAdmin.js";
import User from "../src/models/User.js";

test("ensureDefaultAdmin cria o admin padrao quando ele nao existe", async () => {
  const originalFindOne = User.findOne;
  const originalCreate = User.create;

  let createdPayload = null;

  User.findOne = async () => null;
  User.create = async (payload) => {
    createdPayload = payload;
    return payload;
  };

  try {
    await ensureDefaultAdmin();
  } finally {
    User.findOne = originalFindOne;
    User.create = originalCreate;
  }

  assert.ok(createdPayload);
  assert.equal(createdPayload.email, "admin@gmail.com");
  assert.equal(createdPayload.role, "admin");
  assert.equal(await bcrypt.compare("123456", createdPayload.password), true);
});

test("ensureDefaultAdmin nao cria outro admin quando ele ja existe", async () => {
  const originalFindOne = User.findOne;
  const originalCreate = User.create;

  let createCalled = false;

  User.findOne = async () => ({
    id: 1,
    email: "admin@gmail.com",
    role: "admin",
    update: async () => {
      throw new Error("nao deveria atualizar");
    },
  });
  User.create = async () => {
    createCalled = true;
  };

  try {
    await ensureDefaultAdmin();
  } finally {
    User.findOne = originalFindOne;
    User.create = originalCreate;
  }

  assert.equal(createCalled, false);
});

test("ensureDefaultAdmin restaura o papel admin se o usuario padrao existir com role incorreta", async () => {
  const originalFindOne = User.findOne;

  let updatedPayload = null;

  User.findOne = async () => ({
    id: 1,
    email: "admin@gmail.com",
    role: "user",
    async update(payload) {
      updatedPayload = payload;
    },
  });

  try {
    await ensureDefaultAdmin();
  } finally {
    User.findOne = originalFindOne;
  }

  assert.deepEqual(updatedPayload, { role: "admin" });
});
