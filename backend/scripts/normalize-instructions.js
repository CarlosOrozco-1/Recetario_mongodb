// Migración: convierte `recipes.instrucciones` del formato anterior
// (un bloque de texto con líneas "Paso N. ...") a subdocumentos
// { orden, texto }.
//
// Uso:
//   node scripts/normalize-instructions.js --dry-run   (solo reporta)
//   node scripts/normalize-instructions.js --check     (falla si queda texto)
//   node scripts/normalize-instructions.js             (aplica cambios)
//
// Idempotente: los documentos que ya tienen subdocumentos ordenados se omiten.
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env"), quiet: true });

const STEP_PREFIX = /^(?:paso\s*)?\d+[.)、:-]?\s*/i;

const splitLegacyText = value => {
  const text = value.trim();
  if (!text) return [];
  if (/\r?\n/.test(text)) return text.split(/\r?\n/);

  // Algunos registros antiguos guardaron todos los pasos en una sola línea.
  const byPaso = text.split(/\s+(?=paso\s*\d+[.)、:-]\s+)/i);
  if (byPaso.length > 1) return byPaso;

  const byNumber = text.split(/\s+(?=\d+[.)、:-]\s+)/i);
  return byNumber.length > 1 ? byNumber : [text];
};

const toSteps = instructions => {
  const values = Array.isArray(instructions)
    ? instructions.map(step => (typeof step === "string" ? step : step?.texto))
    : typeof instructions === "string"
      ? splitLegacyText(instructions)
      : [];

  const parsed = values
    .filter(value => typeof value === "string")
    .map((value, index) => {
      const texto = value.trim();
      const marker = texto.match(/^(?:paso\s*)?(\d+)[.)、:-]?\s*/i);
      return {
        ordenExplicito: marker ? Number(marker[1]) : null,
        ordenOriginal: index + 1,
        texto: texto.replace(STEP_PREFIX, "").trim(),
      };
    })
    .filter(step => step.texto);

  // Si todos los pasos traen número, ese número manda; si no, se respeta el orden recibido.
  const todosNumerados = parsed.every(step => step.ordenExplicito !== null);
  return parsed
    .sort((a, b) => todosNumerados
      ? a.ordenExplicito - b.ordenExplicito
      : a.ordenOriginal - b.ordenOriginal)
    .map((step, index) => ({
      orden: index + 1,
      texto: step.texto,
    }));
};

const isNormalized = instructions =>
  Array.isArray(instructions) &&
  instructions.length > 0 &&
  instructions.every(step => {
    if (!step || typeof step !== "object" || Array.isArray(step)) return false;
    const orden = Number(step.orden);
    return Number.isInteger(orden) && orden >= 1 &&
      typeof step.texto === "string" && step.texto.trim().length > 0;
  });

const needsMigration = recipe => {
  const instructions = recipe.instrucciones;
  if (typeof instructions === "string") return instructions.trim().length > 0;
  return Array.isArray(instructions) && instructions.length > 0 && !isNormalized(instructions);
};

const run = async () => {
  if (!process.env.MONGODB_URI) throw new Error("Falta MONGODB_URI en el entorno");

  const mongoose = require("mongoose");
  const DRY_RUN = process.argv.includes("--dry-run");
  const CHECK = process.argv.includes("--check");

  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  console.log(`Conectado a "${db.databaseName}"${DRY_RUN ? " (DRY RUN: no se escribe nada)" : ""}${CHECK ? " (CHECK: solo verifica)" : ""}`);

  const recipes = await db.collection("recipes").find({}).toArray();
  let pending = 0;
  let steps = 0;
  let skipped = 0;

  for (const recipe of recipes) {
    if (!needsMigration(recipe)) {
      skipped++;
      continue;
    }

    const normalized = toSteps(recipe.instrucciones);
    if (normalized.length === 0) {
      skipped++;
      continue;
    }

    pending++;
    steps += normalized.length;
    if (!DRY_RUN && !CHECK) {
      await db.collection("recipes").updateOne(
        { _id: recipe._id },
        { $set: { instrucciones: normalized, updatedAt: new Date() } }
      );
    }
  }

  console.log("Resumen:");
  console.log(` - recetas revisadas: ${recipes.length}`);
  console.log(` - recetas a migrar: ${pending}`);
  console.log(` - pasos generados: ${steps}`);
  console.log(` - recetas omitidas (ya migradas o sin instrucciones): ${skipped}`);

  await mongoose.disconnect();

  if (CHECK && pending > 0) {
    console.error(`Quedan ${pending} recetas con instrucciones en formato anterior`);
    process.exitCode = 1;
  }
};

if (require.main === module) {
  run().catch((error) => {
    console.error("Error en la migración:", error.message);
    process.exit(1);
  });
}

module.exports = { toSteps, isNormalized, needsMigration, splitLegacyText };
