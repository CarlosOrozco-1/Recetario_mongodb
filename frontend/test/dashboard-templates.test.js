const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const dir = path.join(__dirname, "..", "src", "app", "components", "dashboard");
const html = fs.readFileSync(path.join(dir, "dashboard.html"), "utf8");
const css = fs.readFileSync(path.join(dir, "dashboard.css"), "utf8");

const zIndexOf = (selector) => {
  const block = css.match(new RegExp(`\\${selector}\\s*\\{([^}]*)\\}`));
  if (!block) return null;
  const m = block[1].match(/z-index:\s*(\d+)/);
  return m ? Number(m[1]) : null;
};

// El fallo reportado: el modal de confirmación se declara antes que el de
// detalle y ambos compiten con el mismo z-index, así que el detalle tapaba la
// confirmación y al pulsar el badge no se veía absolutamente nada.
test("el modal de confirmación de privacidad usa la capa superior", () => {
  const backdrop = html.match(
    /<div[^>]*class="modal-backdrop[^"]*"[^>]*\*ngIf="recipeToTogglePublic\(\)"/
  );
  assert.ok(backdrop, "no se encuentra el backdrop de recipeToTogglePublic()");
  assert.match(
    backdrop[0],
    /modal-backdrop-top/,
    "el modal de privacidad necesita la clase modal-backdrop-top para no quedar tapado"
  );
});

test("modal-backdrop-top queda por encima de modal-backdrop", () => {
  const base = zIndexOf(".modal-backdrop");
  const top = zIndexOf(".modal-backdrop-top");
  assert.ok(base > 0, "no se encontró el z-index de .modal-backdrop");
  assert.ok(top > base, `modal-backdrop-top (${top}) debe ser mayor que modal-backdrop (${base})`);
});

test("el badge de privacidad es un botón, no un span", () => {
  const badge = html.match(/<(span|button)[^>]*class="privacy-badge"[^>]*>/);
  assert.ok(badge, "no se encuentra el badge de privacidad en la tarjeta");
  assert.equal(
    badge[0].startsWith("<button"),
    true,
    "el badge debe ser <button> para que sea clicable; un <span> no lo es"
  );
  assert.match(badge[0], /askTogglePublic/, "el botón debe invocar askTogglePublic()");
});

test("el badge del modal de detalle también es clicable", () => {
  const inline = html.match(/<button[^>]*class="privacy-toggle-inline"[^>]*>/);
  assert.ok(inline, "no se encuentra el toggle dentro del modal de detalle");
  assert.match(inline[0], /askTogglePublic/);
});

test("hay exactamente un modal de confirmación de privacidad", () => {
  const count = (html.match(/recipeToTogglePublic\(\)"\s*\(click\)/g) || []).length;
  assert.equal(count, 1, "no debe haber dos modales de privacidad compitiendo entre sí");
});
