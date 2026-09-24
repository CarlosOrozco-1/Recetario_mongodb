const express = require("express");
const { create, getAll, getById, update, remove } = require("../controllers/recipeController");
const Recipe = require("../models/Recipe");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");

const router = express.Router();

router.use(auth);

router.post("/", create);
router.get("/", getAll);
router.get("/:id", getById);
router.put("/:id", update);
router.delete("/:id", remove);

router.post("/:id/image", auth, upload.single("imagen"), async (req, res) => {
  try {
    const recipe = await Recipe.findOneAndUpdate(
      { _id: req.params.id, usuario: req.user._id },
      { imagen: req.file.id },
      { new: true }
    );
    if (!recipe) return res.status(404).json({ message: "Receta no encontrada" });
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ message: "Error subiendo imagen", error: error.message });
  }
});

router.get("/image/:fileId", async (req, res) => {
  try {
    const bucket = new GridFSBucket(mongoose.connection.db, { bucketName: "uploads" });
    const fileId = new mongoose.Types.ObjectId(req.params.fileId);
    const downloadStream = bucket.openDownloadStream(fileId);
    downloadStream.on("error", () => res.status(404).send("Imagen no encontrada"));
    downloadStream.pipe(res);
  } catch (error) {
    res.status(500).send("Error sirviendo imagen");
  }
});

module.exports = router;