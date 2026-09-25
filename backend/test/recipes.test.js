const test = require("node:test");
const assert = require("node:assert/strict");

// --- 1. La ruta de imagen NO debe quedar detrás de auth -------------------
// router.use(auth) no es una "route": vive en el stack sin propiedad route.
const authIndexOf = (router) =>
  router.stack.findIndex((l) => !l.route && l.name === "auth");
const indexOfRoute = (router, path, method) =>
  router.stack.findIndex(
    (l) => l.route && l.route.path === path && (!method || l.route.methods[method])
  );

test("GET /image/:fileId es pública (debe declararse antes de router.use(auth))", () => {
  const router = require("../src/routes/recipes");
  const authIndex = authIndexOf(router);
  const imageIndex = indexOfRoute(router, "/image/:fileId", "get");

  assert.ok(imageIndex > -1, "no existe la ruta GET /image/:fileId");
  assert.ok(authIndex > -1, "router.use(auth) no está aplicado");
  assert.ok(
    imageIndex < authIndex,
    `la ruta de imagen (${imageIndex}) está después del middleware auth (${authIndex})`
  );
});

test("las rutas de recetas siguen requiriendo autenticación", () => {
  const router = require("../src/routes/recipes");
  const authIndex = authIndexOf(router);
  assert.ok(authIndex > -1, "router.use(auth) no está aplicado");

  for (const [path, method] of [["/", "get"], ["/:id", "get"], ["/:id", "put"], ["/:id", "delete"]]) {
    const index = indexOfRoute(router, path, method);
    assert.ok(index > authIndex, `${method.toUpperCase()} ${path} debería estar protegida por auth`);
  }
});

test("POST /:id/image sigue protegida por auth", () => {
  const router = require("../src/routes/recipes");
  const authIndex = authIndexOf(router);
  const uploadIndex = indexOfRoute(router, "/:id/image", "post");
  assert.ok(uploadIndex > authIndex, "subir imagen no debe quedar sin autenticar");
});

test("el backend expone POST para subir imagen (el frontend debe usar POST)", () => {
  const router = require("../src/routes/recipes");
  const layer = router.stack.find((l) => l.route && l.route.path === "/:id/image");
  assert.ok(layer.route.methods.post, "falta POST /:id/image");
  assert.ok(!layer.route.methods.put, "no debe existir PUT /:id/image");
});

// --- 2. Allowlist de campos editables -------------------------------------
const RecipeModel = require("../src/models/Recipe");
const controller = require("../src/controllers/recipeController");

const captureUpdate = (body) => {
  let seen = null;
  const original = RecipeModel.findOneAndUpdate;
  RecipeModel.findOneAndUpdate = async (_filter, update) => {
    seen = update;
    return { _id: "x", ...update };
  };
  return controller
    .update({ params: { id: "x" }, user: { _id: "u1" }, body }, { json: () => {}, status: () => ({ json: () => {} }) })
    .then(() => RecipeModel.findOneAndUpdate === original ? seen : seen);
};

test("update ignora campos no permitidos (robo de receta vía usuario)", async () => {
  const seen = await captureUpdate({
    publica: true,
    usuario: "victima-123",
    _id: "hack",
  });
  assert.equal(seen.publica, true, "publica sí debe permitirse");
  assert.equal(seen.usuario, undefined, "usuario NO debe poder escribirse");
  assert.equal(seen._id, undefined, "_id NO debe poder escribirse");
});

test("update ignora contadores sociales manipulados", async () => {
  const seen = await captureUpdate({
    titulo: "Arroz",
    likesCount: 9999,
    likes: ["usuario-falso"],
    guardadosCount: 500,
    ratingPromedio: 5,
    reportes: [{ motivo: "spam" }],
    reportado: true,
  });
  assert.equal(seen.titulo, "Arroz");
  for (const campo of ["likesCount", "likes", "guardadosCount", "ratingPromedio", "reportes", "reportado"]) {
    assert.equal(seen[campo], undefined, `${campo} no debe poder escribirse`);
  }
});

test("update rechaza un cuerpo sin campos editables", async () => {
  let statusCode = 0;
  RecipeModel.findOneAndUpdate = async () => assert.fail("no debe llegar a la base de datos");
  await controller.update(
    { params: { id: "x" }, user: { _id: "u1" }, body: { usuario: "otro" } },
    { status: (c) => { statusCode = c; return { json: () => {} }; } }
  );
  assert.equal(statusCode, 400);
});

// --- 3. Configuración de subida -------------------------------------------
test("upload acepta MONGODB_URI (el nombre que define docker-compose)", () => {
  delete require.cache[require.resolve("../src/middleware/upload")];
  process.env.MONGODB_URI = "mongodb://localhost/test";
  delete process.env.MONGO_URI;
  const { uploadMiddleware } = require("../src/middleware/upload");
  assert.equal(typeof uploadMiddleware, "function");
});

test("upload acepta MONGO_URI como respaldo", () => {
  delete require.cache[require.resolve("../src/middleware/upload")];
  delete process.env.MONGODB_URI;
  process.env.MONGO_URI = "mongodb://localhost/test";
  const { uploadMiddleware } = require("../src/middleware/upload");
  assert.equal(typeof uploadMiddleware, "function");
});

test("upload ya no expone la validación sharp que leía req.file.buffer", () => {
  const upload = require("../src/middleware/upload");
  assert.equal(upload.validateImageDimensions, undefined, "el middleware roto debe eliminarse");
});
