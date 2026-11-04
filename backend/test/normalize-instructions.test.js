const test = require("node:test");
const assert = require("node:assert/strict");
const {
  toSteps,
  isNormalized,
  needsMigration,
  splitLegacyText,
} = require("../scripts/normalize-instructions");

test("convierte el texto anterior con un paso por línea", () => {
  assert.deepEqual(
    toSteps("Paso 1. Corta la piña\nPaso 2. Licúa con agua"),
    [
      { orden: 1, texto: "Corta la piña" },
      { orden: 2, texto: "Licúa con agua" },
    ]
  );
});

test("separa pasos guardados en una sola línea con marcadores", () => {
  assert.deepEqual(
    splitLegacyText("Paso 1. Corta la piña Paso 2. Licúa con agua"),
    ["Paso 1. Corta la piña", "Paso 2. Licúa con agua"]
  );
  assert.deepEqual(
    toSteps("1. Corta la piña 2. Licúa con agua 3. Sirve"),
    [
      { orden: 1, texto: "Corta la piña" },
      { orden: 2, texto: "Licúa con agua" },
      { orden: 3, texto: "Sirve" },
    ]
  );
});

test("normaliza arreglos híbridos y respeta el número de cada paso", () => {
  assert.deepEqual(
    toSteps(["Paso 2. Licúa", { orden: 1, texto: "Paso 1. Corta" }, "", null]),
    [
      { orden: 1, texto: "Corta" },
      { orden: 2, texto: "Licúa" },
    ]
  );
  assert.deepEqual(
    toSteps(["Corta", "Licúa", "Sirve"]),
    [
      { orden: 1, texto: "Corta" },
      { orden: 2, texto: "Licúa" },
      { orden: 3, texto: "Sirve" },
    ]
  );
});

test("detecta si un documento ya está migrado", () => {
  assert.equal(isNormalized([{ orden: 1, texto: "Corta" }]), true);
  assert.equal(isNormalized(["Corta"]), false);
  assert.equal(isNormalized([{ orden: 0, texto: "Corta" }]), false);
  assert.equal(isNormalized([]), false);
  assert.equal(needsMigration({ instrucciones: "Paso 1. Corta" }), true);
  assert.equal(needsMigration({ instrucciones: ["Corta"] }), true);
  assert.equal(needsMigration({ instrucciones: [{ orden: 1, texto: "Corta" }] }), false);
  assert.equal(needsMigration({ instrucciones: [] }), false);
  assert.equal(needsMigration({ instrucciones: undefined }), false);
});

test("no inventa pasos para textos vacíos", () => {
  assert.deepEqual(toSteps("   \n  "), []);
  assert.deepEqual(toSteps([]), []);
  assert.deepEqual(toSteps(undefined), []);
});
