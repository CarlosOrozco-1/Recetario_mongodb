const test = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const Recipe = require("../src/models/Recipe");
const controller = require("../src/controllers/recipeController");
const { normalizeInstructions } = require("../src/utils/instructions");

test("normaliza el formato anterior de líneas numeradas", () => {
  assert.deepEqual(
    normalizeInstructions("Paso 1. Corta la piña\nPaso 2. Licúa con agua"),
    [
      { orden: 1, texto: "Corta la piña" },
      { orden: 2, texto: "Licúa con agua" },
    ]
  );
});

test("respeta el orden recibido y renumera los pasos", () => {
  assert.deepEqual(
    normalizeInstructions([
      { orden: 2, texto: "Licúa con agua" },
      { orden: 1, texto: "Corta la piña" },
    ]),
    [
      { orden: 1, texto: "Corta la piña" },
      { orden: 2, texto: "Licúa con agua" },
    ]
  );
});

test("descarta pasos vacíos y texto no válido", () => {
  assert.deepEqual(
    normalizeInstructions(["", "  Paso 3. Sirve  ", null, 42]),
    [{ orden: 1, texto: "Sirve" }]
  );
  assert.deepEqual(normalizeInstructions(undefined), []);
  assert.deepEqual(normalizeInstructions([]), []);
});

test("el modelo guarda subdocumentos sin _id y exige al menos un paso", async () => {
  const recipe = new Recipe({
    titulo: "Prueba",
    descripcion: "Descripción",
    ingredientes: ["agua"],
    usuario: new mongoose.Types.ObjectId(),
    instrucciones: "Paso 1. Hervir el agua",
  });

  assert.deepEqual(
    recipe.instrucciones.map(({ orden, texto }) => ({ orden, texto })),
    [{ orden: 1, texto: "Hervir el agua" }]
  );
  assert.equal(recipe.instrucciones[0]._id, undefined);
  await assert.doesNotReject(() => recipe.validate());

  const empty = new Recipe({
    titulo: "Prueba",
    descripcion: "Descripción",
    ingredientes: ["agua"],
    usuario: new mongoose.Types.ObjectId(),
    instrucciones: [],
  });
  await assert.rejects(() => empty.validate(), /al menos un paso/);
});

test("update envía las instrucciones como subdocumentos ordenados", async () => {
  const originalFindOne = Recipe.findOne;
  const originalFindOneAndUpdate = Recipe.findOneAndUpdate;
  let seen;

  Recipe.findOne = () => ({ select: async () => ({ imagen: "" }) });
  Recipe.findOneAndUpdate = async (_filter, update) => {
    seen = update;
    return { _id: "x", ...update };
  };

  try {
    await controller.update(
      {
        params: { id: "x" },
        user: { _id: "u1" },
        body: { instrucciones: "Paso 1. Uno\nPaso 2. Dos" },
      },
      { json: () => {}, status: () => ({ json: () => {} }) }
    );
    assert.deepEqual(seen.instrucciones, [
      { orden: 1, texto: "Uno" },
      { orden: 2, texto: "Dos" },
    ]);
  } finally {
    Recipe.findOne = originalFindOne;
    Recipe.findOneAndUpdate = originalFindOneAndUpdate;
  }
});
