const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const appDir = path.join(__dirname, "..", "src", "app");
const recipeFormTs = fs.readFileSync(path.join(appDir, "components", "recipe-form", "recipe-form.ts"), "utf8");
const recipeFormHtml = fs.readFileSync(path.join(appDir, "components", "recipe-form", "recipe-form.html"), "utf8");
const dashboardTs = fs.readFileSync(path.join(appDir, "components", "dashboard", "dashboard.ts"), "utf8");
const dashboardHtml = fs.readFileSync(path.join(appDir, "components", "dashboard", "dashboard.html"), "utf8");

const extractMethod = (source, methodName) => {
  const match = source.match(new RegExp(`${methodName}\\([^\\n]*\\): [^{]+\\{([\\s\\S]*?)\\n  \\}`));
  assert.ok(match, `no se encontró ${methodName}()`);
  return match[1];
};

const parseSteps = (instructions) => {
  const method = extractMethod(dashboardTs, "getInstructionSteps");
  assert.match(method, /Array\.isArray\(instructions\)/);
  assert.match(method, /\.sort\(\(a, b\) => a\.orden - b\.orden\)/);
  if (Array.isArray(instructions)) {
    return instructions.slice().sort((a, b) => a.orden - b.orden).map(step => step.texto.trim());
  }
  const text = (instructions ?? "").trim();
  if (!text) return [];
  return text.split(/\r?\n/).map(line => line.trim()).filter(Boolean)
    .map(line => line.replace(/^(?:paso\s*)?\d+[.)、:-]?\s*/i, "").trim());
};

test("el formulario envía cada instrucción como subdocumento ordenado", () => {
  const submit = extractMethod(recipeFormTs, "onSubmit");
  assert.match(submit, /instrucciones: instructionSteps\.map\(\(texto, index\) => \(\{/);
  assert.match(submit, /orden: index \+ 1/);
  assert.match(submit, /texto,/);
  assert.match(recipeFormHtml, /\*ngFor="let step of instructionSteps/);
  assert.match(recipeFormHtml, /onAddInstructionStep\(\)/);
  assert.match(recipeFormHtml, /onRemoveInstructionStep\(i\)/);
});

test("el detalle ordena subdocumentos y muestra los pasos como lista", () => {
  assert.deepEqual(parseSteps([
    { orden: 2, texto: "Licúa con agua" },
    { orden: 1, texto: "Corta la piña" },
  ]), ["Corta la piña", "Licúa con agua"]);
  assert.deepEqual(parseSteps("Paso 1. Corta la piña\nPaso 2. Licúa con agua"), [
    "Corta la piña",
    "Licúa con agua",
  ]);
  assert.match(dashboardHtml, /<ol class="preparation-steps">/);
  assert.match(dashboardHtml, /\*ngFor="let step of getInstructionSteps/);
});

test("una instrucción antigua en párrafo único se conserva como un paso", () => {
  assert.deepEqual(parseSteps("Mezcla todo y cocina a fuego lento."), [
    "Mezcla todo y cocina a fuego lento.",
  ]);
});
