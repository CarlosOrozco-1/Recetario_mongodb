const test = require("node:test");
const assert = require("node:assert/strict");
const User = require("../src/models/User");
const controller = require("../src/controllers/authController");

const response = () => {
  const res = { statusCode: 200, body: undefined };
  res.status = code => { res.statusCode = code; return res; };
  res.json = body => { res.body = body; return res; };
  return res;
};

const withGoogleVerifier = async (verifyIdToken, run) => {
  const originalNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "test";
  const originalFindOne = User.findOne;
  const originalCreate = User.create;
  const originalSave = User.prototype.save;
  const originalClientId = process.env.GOOGLE_CLIENT_ID;
  const originalJwtSecret = process.env.JWT_SECRET;
  controller.setGoogleClientForTesting({ verifyIdToken });
  process.env.GOOGLE_CLIENT_ID = "public-test-client-id";
  process.env.JWT_SECRET = "test-only-jwt-secret";
  try {
    await run();
  } finally {
    controller.setGoogleClientForTesting({ verifyIdToken: require("google-auth-library").OAuth2Client.prototype.verifyIdToken });
    if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalNodeEnv;
    User.findOne = originalFindOne;
    User.create = originalCreate;
    User.prototype.save = originalSave;
    if (originalClientId === undefined) delete process.env.GOOGLE_CLIENT_ID;
    else process.env.GOOGLE_CLIENT_ID = originalClientId;
    if (originalJwtSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = originalJwtSecret;
  }
};

test("Google login rechaza si falta configuración del servidor", async () => {
  const originalClientId = process.env.GOOGLE_CLIENT_ID;
  delete process.env.GOOGLE_CLIENT_ID;
  try {
    const res = response();
    await controller.googleLogin({ body: { credential: "token" } }, res);
    assert.equal(res.statusCode, 500);
  } finally {
    if (originalClientId === undefined) delete process.env.GOOGLE_CLIENT_ID;
    else process.env.GOOGLE_CLIENT_ID = originalClientId;
  }
});

test("Google login rechaza una credencial ausente o demasiado larga", async () => {
  await withGoogleVerifier(async () => assert.fail("no debe verificar una credencial inválida"), async () => {
    const missing = response();
    await controller.googleLogin({ body: {} }, missing);
    assert.equal(missing.statusCode, 400);

    const oversized = response();
    await controller.googleLogin({ body: { credential: "x".repeat(8193) } }, oversized);
    assert.equal(oversized.statusCode, 400);
  });
});

test("Google login exige email verificado", async () => {
  await withGoogleVerifier(async () => ({ getPayload: () => ({
    sub: "google-user-1",
    email: "chef@example.com",
    email_verified: false,
  }) }), async () => {
    const res = response();
    await controller.googleLogin({ body: { credential: "signed-token" } }, res);
    assert.equal(res.statusCode, 401);
  });
});

test("Google login crea usuario sin password y devuelve JWT de la aplicación", async () => {
  const created = [];
  await withGoogleVerifier(async options => {
    assert.equal(options.audience, "public-test-client-id");
    return { getPayload: () => ({
      sub: "google-user-2",
      email: "Chef@Example.com",
      email_verified: true,
      name: "Chef de Prueba",
      picture: "https://example.com/avatar.png",
    }) };
  }, async () => {
    User.findOne = async () => null;
    User.create = async data => {
      created.push(data);
      return { _id: "user-123", name: data.name, email: data.email };
    };

    const res = response();
    await controller.googleLogin({ body: { credential: "signed-token" } }, res);
    assert.equal(res.statusCode, 200);
    assert.equal(created.length, 1);
    assert.equal(created[0].email, "chef@example.com");
    assert.equal(created[0].googleId, "google-user-2");
    assert.equal(created[0].password, undefined);
    assert.match(res.body.token, /^[\w-]+\.[\w-]+\.[\w-]+$/);
    assert.equal(res.body._id, "user-123");
  });
});

test("Google login vincula cuenta existente solo luego de verificar Google", async () => {
  let saved = false;
  const existing = { _id: "existing-user", email: "chef@example.com", googleId: undefined, avatar: "", save: async () => { saved = true; } };
  await withGoogleVerifier(async () => ({ getPayload: () => ({
    sub: "google-user-3",
    email: "chef@example.com",
    email_verified: true,
  }) }), async () => {
    User.findOne = async query => query.googleId ? null : existing;
    User.prototype.save = async function () { saved = true; };

    const res = response();
    await controller.googleLogin({ body: { credential: "signed-token" } }, res);
    assert.equal(res.statusCode, 200);
    assert.equal(existing.googleId, "google-user-3");
    assert.equal(saved, true);
  });
});
