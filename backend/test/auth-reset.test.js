const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("crypto");

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-only-jwt-secret";

const User = require("../src/models/User");
const PasswordReset = require("../src/models/PasswordReset");
const nodemailer = require("nodemailer");
const controller = require("../src/controllers/authController");

const SMTP_KEYS = ["SMTP_HOST", "SMTP_PORT", "SMTP_SECURE", "SMTP_USER", "SMTP_PASS"];

const withSmtp = () => {
  const original = Object.fromEntries(SMTP_KEYS.map(key => [key, process.env[key]]));
  process.env.SMTP_HOST = "smtp.test.local";
  process.env.SMTP_PORT = "587";
  process.env.SMTP_SECURE = "false";
  process.env.SMTP_USER = "test@test.local";
  process.env.SMTP_PASS = "test-pass";
  return () => {
    for (const key of SMTP_KEYS) {
      if (original[key] === undefined) delete process.env[key];
      else process.env[key] = original[key];
    }
  };
};

const withoutSmtp = () => {
  const original = Object.fromEntries(SMTP_KEYS.map(key => [key, process.env[key]]));
  for (const key of SMTP_KEYS) delete process.env[key];
  return () => {
    for (const key of SMTP_KEYS) {
      if (original[key] === undefined) delete process.env[key];
      else process.env[key] = original[key];
    }
  };
};

const withTransport = sendMail => {
  const original = nodemailer.createTransport;
  nodemailer.createTransport = () => ({ sendMail });
  return () => {
    nodemailer.createTransport = original;
  };
};

const withResetModel = () => {
  const original = {
    findOne: User.findOne,
    findById: User.findById,
    deleteMany: PasswordReset.deleteMany,
    create: PasswordReset.create,
  };
  User.findOne = async () => ({ _id: "u1" });
  PasswordReset.deleteMany = async () => ({});
  PasswordReset.create = async () => ({});
  return () => {
    User.findOne = original.findOne;
    User.findById = original.findById;
    PasswordReset.deleteMany = original.deleteMany;
    PasswordReset.create = original.create;
  };
};

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
  const restoreSmtp = withSmtp();
  const originalFindOne = User.findOne;
  User.findOne = async () => null;
  try {
    const res = response();
    await controller.requestPasswordReset({ body: { email: "noexiste@test.local" } }, res);
    assert.equal(res.statusCode, 200);
    assert.match(res.body.message, /Si el correo existe/);
  } finally {
    User.findOne = originalFindOne;
    restoreSmtp();
  }
});

test("requestPasswordReset responde 503 si SMTP no está configurado", async () => {
  const restoreSmtp = withoutSmtp();
  const originalFindOne = User.findOne;
  let consulted = false;
  User.findOne = async () => { consulted = true; return null; };
  try {
    const res = response();
    await controller.requestPasswordReset({ body: { email: "alguien@test.local" } }, res);
    assert.equal(res.statusCode, 503);
    assert.equal(consulted, false, "no debe consultar al usuario si falta configuración global");
  } finally {
    User.findOne = originalFindOne;
    restoreSmtp();
  }
});

test("requestPasswordReset responde 502 y descarta el código si el envío falla", async () => {
  const restoreSmtp = withSmtp();
  const restoreModel = withResetModel();
  let deleteManyCalls = 0;
  PasswordReset.deleteMany = async () => { deleteManyCalls += 1; return {}; };
  const restoreTransport = withTransport(async () => {
    throw Object.assign(new Error("auth failed"), { code: "EAUTH", responseCode: 535 });
  });
  try {
    const res = response();
    await controller.requestPasswordReset({ body: { email: "alguien@test.local" } }, res);
    assert.equal(res.statusCode, 502);
    assert.match(res.body.message, /No se pudo enviar/);
    assert.equal(deleteManyCalls, 2, "invalida el código previo y el recién creado");
  } finally {
    restoreTransport();
    restoreModel();
    restoreSmtp();
  }
});

test("requestPasswordReset envía código a una cuenta creada con Google", async () => {
  const restoreSmtp = withSmtp();
  const restoreModel = withResetModel();
  User.findOne = async () => ({ _id: "u1", googleId: "google-1", password: undefined });
  let sentTo = null;
  const restoreTransport = withTransport(async message => { sentTo = message.to; return { messageId: "ok" }; });
  try {
    const res = response();
    await controller.requestPasswordReset({ body: { email: "cuenta@gmail.com" } }, res);
    assert.equal(res.statusCode, 200);
    assert.equal(sentTo, "cuenta@gmail.com");
  } finally {
    restoreTransport();
    restoreModel();
    restoreSmtp();
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
