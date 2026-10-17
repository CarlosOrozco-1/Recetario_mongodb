// Migración: normaliza las interacciones embebidas en `recipes` a
// colecciones propias (likes, saves, reports) y limpia la denormalización
// duplicada en `users`.
//
// Uso:
//   node scripts/normalize-interactions.js --dry-run   (solo reporta)
//   node scripts/normalize-interactions.js             (aplica cambios)
//
// Idempotente: usa upserts, se puede correr más de una vez.
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const Like = require("../src/models/Like");
const Save = require("../src/models/Save");
const Report = require("../src/models/Report");

const DRY_RUN = process.argv.includes("--dry-run");

const run = async () => {
  if (!process.env.MONGODB_URI) throw new Error("Falta MONGODB_URI en el entorno");
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  console.log(`Conectado a "${db.databaseName}"${DRY_RUN ? " (DRY RUN: no se escribe nada)" : ""}`);

  if (!DRY_RUN) {
    await Promise.all([Like.syncIndexes(), Save.syncIndexes(), Report.syncIndexes()]);
  }

  // Se lee la colección cruda: el esquema de Mongoose ya no expone los campos viejos.
  const recipes = await db.collection("recipes").find({}).toArray();

  let likes = 0;
  let saves = 0;
  let reports = 0;

  for (const r of recipes) {
    for (const usuario of r.likes || []) {
      likes++;
      if (!DRY_RUN) {
        await db.collection("likes").updateOne(
          { usuario, receta: r._id },
          { $setOnInsert: { usuario, receta: r._id, createdAt: new Date() } },
          { upsert: true }
        );
      }
    }
    for (const usuario of r.guardados || []) {
      saves++;
      if (!DRY_RUN) {
        await db.collection("saves").updateOne(
          { usuario, receta: r._id },
          { $setOnInsert: { usuario, receta: r._id, createdAt: new Date() } },
          { upsert: true }
        );
      }
    }
    for (const rep of r.reportes || []) {
      reports++;
      if (!DRY_RUN) {
        await db.collection("reports").updateOne(
          { usuario: rep.usuario, receta: r._id },
          {
            $setOnInsert: {
              usuario: rep.usuario,
              receta: r._id,
              motivo: rep.motivo || "",
              estado: "pendiente",
              createdAt: rep.createdAt || new Date(),
            },
          },
          { upsert: true }
        );
      }
    }

    if (!DRY_RUN) {
      const likesCount = await db.collection("likes").countDocuments({ receta: r._id });
      const guardadosCount = await db.collection("saves").countDocuments({ receta: r._id });
      await db.collection("recipes").updateOne(
        { _id: r._id },
        {
          $set: { likesCount, guardadosCount },
          $unset: { likes: "", guardados: "", reportes: "", reportado: "", favorito: "" },
        }
      );
    }
  }

  let usersModified = 0;
  if (!DRY_RUN) {
    const res = await db.collection("users").updateMany(
      {},
      { $unset: { favoritos: "", "stats.favoritosCount": "" } }
    );
    usersModified = res.modifiedCount;
  }

  console.log("Resumen:");
  console.log(` - recetas procesadas: ${recipes.length}`);
  console.log(` - likes a migrar: ${likes}`);
  console.log(` - saves a migrar: ${saves}`);
  console.log(` - reports a migrar: ${reports}`);
  console.log(` - usuarios a limpiar (favoritos/favoritosCount): ${DRY_RUN ? "n/d" : usersModified}`);

  await mongoose.disconnect();
};

run().catch((e) => {
  console.error("Error en la migración:", e.message);
  process.exit(1);
});
