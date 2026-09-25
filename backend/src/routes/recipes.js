const express = require("express");
const Recipe = require("../models/Recipe");
const {
  create,
  getAll,
  getById,
  update,
  remove,
} = require("../controllers/recipeController");
const auth = require("../middleware/auth");
const { uploadMiddleware } = require("../middleware/upload");
const { createLimiter } = require("../middleware/rateLimiter");
const { sanitizeFields } = require("../middleware/sanitize");
const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");

const router = express.Router();

// Imágenes: debe declararse ANTES de router.use(auth).
// El navegador las pide con <img src>, que no puede enviar cabeceras,
// así que exigir el token devolvería 401 y la foto nunca se pintaría.
router.get("/image/:fileId", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.fileId)) {
    return res.status(400).send("Identificador de imagen inválido");
  }
  try {
    const bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: "uploads",
    });
    const downloadStream = bucket.openDownloadStream(
      new mongoose.Types.ObjectId(req.params.fileId)
    );
    downloadStream.on("error", () => {
      if (!res.headersSent) res.status(404).send("Imagen no encontrada");
    });
    downloadStream.pipe(res);
  } catch (error) {
    res.status(500).send("Error sirviendo imagen");
  }
});

router.use(auth);

router.post("/", createLimiter, sanitizeFields(["titulo", "descripcion", "instrucciones", "categoria", "hashtags"]), create);
router.get("/", getAll);
router.get("/:id", getById);
router.put("/:id", update);
router.delete("/:id", remove);

router.post("/:id/image", uploadMiddleware, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No se recibió ningún archivo" });
  }
  try {
    const recipe = await Recipe.findOneAndUpdate(
      { _id: req.params.id, usuario: req.user._id },
      { imagen: req.file.id },
      { new: true },
    );
    if (!recipe)
      return res.status(404).json({ message: "Receta no encontrada" });
    res.json(recipe);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error subiendo imagen", error: error.message });
  }
});

module.exports = router;
