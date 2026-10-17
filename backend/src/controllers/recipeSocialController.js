const Recipe = require("../models/Recipe");
const Like = require("../models/Like");
const Save = require("../models/Save");
const Report = require("../models/Report");
const ActivityFeed = require("../models/ActivityFeed");

const toggleLike = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Receta no encontrada" });

    if (String(recipe.usuario) === String(req.user._id)) {
      return res.status(400).json({ message: "No puedes dar like a tu propia receta" });
    }

    const existing = await Like.findOne({ usuario: req.user._id, receta: recipe._id });
    let liked;

    if (existing) {
      await Like.deleteOne({ _id: existing._id });
      liked = false;
    } else {
      await Like.create({ usuario: req.user._id, receta: recipe._id });
      liked = true;

      await ActivityFeed.create({
        usuario: recipe.usuario,
        tipo: "likio_receta",
        referencia: { tipo: "Recipe", id: recipe._id },
        metadata: { recetaTitulo: recipe.titulo, autorNombre: req.user.name },
      });
    }

    recipe.likesCount = await Like.countDocuments({ receta: recipe._id });
    await recipe.save();
    res.json({ liked, likesCount: recipe.likesCount });
  } catch (error) {
    res.status(500).json({ message: "Error en like", error: error.message });
  }
};

const toggleSave = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Receta no encontrada" });

    const existing = await Save.findOne({ usuario: req.user._id, receta: recipe._id });
    let saved;

    if (existing) {
      await Save.deleteOne({ _id: existing._id });
      saved = false;
    } else {
      await Save.create({ usuario: req.user._id, receta: recipe._id });
      saved = true;
    }

    recipe.guardadosCount = await Save.countDocuments({ receta: recipe._id });
    await recipe.save();
    res.json({ saved, guardadosCount: recipe.guardadosCount });
  } catch (error) {
    res.status(500).json({ message: "Error en guardar", error: error.message });
  }
};

const incrementShare = async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      { $inc: { compartidosCount: 1 } },
      { returnDocument: "after" }
    ).select("compartidosCount titulo");
    if (!recipe) return res.status(404).json({ message: "Receta no encontrada" });

    await ActivityFeed.create({
      usuario: req.user._id,
      tipo: "compartio_receta",
      referencia: { tipo: "Recipe", id: recipe._id },
      metadata: { recetaTitulo: recipe.titulo },
    });

    res.json({ compartidosCount: recipe.compartidosCount });
  } catch (error) {
    res.status(500).json({ message: "Error al compartir", error: error.message });
  }
};

const reportRecipe = async (req, res) => {
  try {
    const { motivo } = req.body;
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Receta no encontrada" });

    await Report.create({
      usuario: req.user._id,
      receta: recipe._id,
      motivo: motivo || "",
    });

    res.status(201).json({ message: "Receta reportada" });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Ya reportaste esta receta" });
    }
    res.status(500).json({ message: "Error reportando", error: error.message });
  }
};

module.exports = { toggleLike, toggleSave, incrementShare, reportRecipe };
