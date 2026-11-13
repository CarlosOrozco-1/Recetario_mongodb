const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("crypto");

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-only-jwt-secret";

const User = require("../src/models/User");
const PasswordReset = require("../src/models/PasswordReset");
const mailer = require("../src/utils/mailer");
const controller = require("../src/controllers/authController");

const response = () => {
  const res = { statusCode: 200, body: undefined };
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (body) => { res.body = body; return res; };
  return res;
};

test("requestPasswordReset exige correo", async () => {
  const res = response();
  await controller.requestPasswordReset({ body: {} }, res);
  assert.equal(res.statusCode, 400);
});

test("requestPasswordReset responde genérico si el usuario no existe", async () => {
  const originalFindOne = User.findOne;
  User.findOne = async () => null;
  try {
    const res = response();
    await controller.requestPasswordReset({ body: { email: "noexiste@test.local" } }, res);
    assert.equal(res.statusCode, 200);
    assert.match(res.body.message, /Si el correo existe/);
  } finally {
    User.findOne = originalFindOne;
  }
});

test("verifyResetCode exige correo y código", async () => {
  const res = response();
  await controller.verifyResetCode({ body: { email: "a@b.com" } }, res);
  assert.equal(res.statusCode, 400);
});

test("verifyResetCode rechaza código inválido", async () => {
  const originalFindOne = User.findOne;
  const originalFind = PasswordReset.findOne;
  User.findOne = async () => ({ _id: "u1" });
  PasswordReset.findOne = () => ({ sort: async () => null });
  try {
    const res = response();
    await controller.verifyResetCode({ body: { email: "a@b.com", code: "000000" } }, res);
    assert.equal(res.statusCode, 400);
  } finally {
    User.findOne = originalFindOne;
    PasswordReset.findOne = originalFind;
  }
});

test("resetPassword exige token y contraseña", async () => {
  const res = response();
  await controller.resetPassword({ body: {} }, res);
  assert.equal(res.statusCode, 400);
});

test("resetPassword rechaza token inválido", async () => {
  const res = response();
  await controller.resetPassword({ body: { token: "invalido", password: "NuevaPass123" } }, res);
  assert.equal(res.statusCode, 401);
});

test("resetPassword rechaza contraseña corta", async () => {
  const res = response();
  await controller.resetPassword({ body: { token: "x", password: "corta" } }, res);
  assert.equal(res.statusCode, 400);
});
