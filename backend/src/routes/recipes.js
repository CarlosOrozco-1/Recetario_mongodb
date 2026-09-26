const express = require("express");
const Recipe = require("../models/Recipe");
const {
  create,
  getAll,
  getById,
  update,
  remove,
  deleteImageFromGridFS,
} = require("../controllers/recipeController");
const auth = require("../middleware/auth");
const { uploadMiddleware } = require("../middleware/upload");
const { createLimiter } = require("../middleware/rateLimiter");
const { sanitizeFields } = require("../middleware/sanitize");
const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");

const router = express.Router();

// Respaldo por extensión para los ficheros subidos antes de guardar el tipo
const MIME_BY_EXTENSION = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

const extensionOf = (filename = "") => {
  const dot = filename.lastIndexOf(".");
  return dot === -1 ? "" : filename.slice(dot).toLowerCase();
};

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
    const fileId = new mongoose.Types.ObjectId(req.params.fileId);

    // GridFS guarda el tipo en el documento del fichero. Sin esto la respuesta
    // llega sin Content-Type y algunos navegadores se niegan a pintar el <img>.
    const fileDoc = await bucket.find({ _id: fileId }).next();
    if (!fileDoc) return res.status(404).send("Imagen no encontrada");

    const contentType =
      fileDoc.metadata?.contentType ||
      fileDoc.contentType ||
      MIME_BY_EXTENSION[extensionOf(fileDoc.filename)];
    if (contentType) res.type(contentType);
    // El nombre del fichero lleva timestamp y el contenido no se reescribe:
    // se puede cachear para siempre.
    res.set("Cache-Control", "public, max-age=31536000, immutable");

    const downloadStream = bucket.openDownloadStream(fileId);
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
  const nuevaImagen = req.file.id;
  try {
    // Se lee antes de actualizar para saber qué imagen había: al reemplazar,
    // la anterior quedaba huérfana en GridFS ocupando espacio para siempre.
    const anterior = await Recipe.findOne({
      _id: req.params.id,
      usuario: req.user._id,
    });

    if (!anterior) {
      // La receta no es del usuario: la imagen subida no se puede dejar guardada.
      await deleteImageFromGridFS(nuevaImagen);
      return res.status(404).json({ message: "Receta no encontrada" });
    }

    const recipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      { imagen: nuevaImagen },
      { new: true },
    );

    if (anterior.imagen && anterior.imagen !== nuevaImagen) {
      await deleteImageFromGridFS(anterior.imagen);
    }

    res.json(recipe);
  } catch (error) {
    await deleteImageFromGridFS(nuevaImagen);
    res
      .status(500)
      .json({ message: "Error subiendo imagen", error: error.message });
  }
});

module.exports = router;
