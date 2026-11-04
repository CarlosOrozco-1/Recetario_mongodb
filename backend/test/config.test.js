const test = require("node:test");
const assert = require("node:assert/strict");
const { getPublicConfig } = require("../src/controllers/configController");

const response = () => {
  const res = { statusCode: 200, body: undefined };
  res.status = code => { res.statusCode = code; return res; };
  res.json = body => { res.body = body; return res; };
  return res;
};

const withEnv = async (values, run) => {
  const previous = {};
  for (const key of Object.keys(values)) {
    previous[key] = process.env[key];
    if (values[key] === undefined) delete process.env[key];
    else process.env[key] = values[key];
  }
  try {
    await run();
  } finally {
    for (const key of Object.keys(values)) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
  }
};

test("config pública devuelve el client id de Google", async () => {
  await withEnv({ GOOGLE_CLIENT_ID: "public-test-client-id" }, () => {
    const res = response();
    getPublicConfig({}, res);
    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body, { googleClientId: "public-test-client-id" });
  });
});

test("config pública devuelve cadena vacía si Google no está configurado", async () => {
  await withEnv({ GOOGLE_CLIENT_ID: undefined }, () => {
    const res = response();
    getPublicConfig({}, res);
    assert.deepEqual(res.body, { googleClientId: "" });
  });
});

test("config pública no expone secretos del servidor", async () => {
  await withEnv({
    GOOGLE_CLIENT_ID: "public-test-client-id",
    JWT_SECRET: "no-debe-salir",
    MONGODB_URI: "mongodb://no-debe-salir",
  }, () => {
    const res = response();
    getPublicConfig({}, res);
    const serialized = JSON.stringify(res.body);
    assert.equal(serialized.includes("no-debe-salir"), false);
    assert.deepEqual(Object.keys(res.body), ["googleClientId"]);
  });
});
