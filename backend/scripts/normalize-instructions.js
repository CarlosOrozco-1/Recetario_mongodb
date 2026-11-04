// Migración: convierte `recipes.instrucciones` del formato anterior
// (un bloque de texto con líneas "Paso N. ...") a subdocumentos
// { orden, texto }.
//
// Uso:
//   node scripts/normalize-instructions.js --dry-run   (solo reporta)
//   node scripts/normalize-instructions.js             (aplica cambios)
//
// Idempotente: omite las recetas que ya guardan un arreglo.
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");

const DRY_RUN = process.argv.includes("--dry-run");
const STEP_PREFIX = /^(?:paso\s*)?\d+[.)、:-]?\s*/i;

const toSteps = instructions => {
  const values = Array.isArray(instructions)
    ? instructions.map(step => (typeof step === "string" ? step : step?.texto))
    : instructions.split(/\r?\n/);

  return values
    .filter(value => typeof value === "string")
    .map(value => value.trim())
    .filter(Boolean)
    .map((texto, index) => ({
      orden: index + 1,
      texto: texto.replace(STEP_PREFIX, "").trim(),
    }))
    .filter(step => step.texto);
};

const run = async () => {
  if (!process.env.MONGODB_URI) throw new Error("Falta MONGODB_URI en el entorno");
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  console.log(`Conectado a "${db.databaseName}"${DRY_RUN ? " (DRY RUN: no se escribe nada)" : ""}`);

  const recipes = await db.collection("recipes").find({}).toArray();
  let pending = 0;
  let steps = 0;
  let skipped = 0;

  for (const recipe of recipes) {
    if (Array.isArray(recipe.instrucciones)) {
      skipped++;
      continue;
    }
    if (typeof recipe.instrucciones !== "string") {
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
    if (!DRY_RUN) {
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
};

run().catch((error) => {
  console.error("Error en la migración:", error.message);
  process.exit(1);
});
