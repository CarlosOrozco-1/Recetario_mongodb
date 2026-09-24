const Review = require("../models/Review");
const Recipe = require("../models/Recipe");
const ActivityFeed = require("../models/ActivityFeed");

const create = async (req, res) => {
  try {
    const { puntuacion, texto, receta } = req.body;
    const review = await Review.create({
      puntuacion,
      texto: texto || "",
      usuario: req.user._id,
      receta,
    });

    const stats = await Review.aggregate([
      { $match: { receta: review.receta } },
      { $group: { _id: null, promedio: { $avg: "$puntuacion" }, count: { $sum: 1 } } },
    ]);
    await Recipe.findByIdAndUpdate(receta, {
      ratingPromedio: Math.round(stats[0]?.promedio * 10) / 10 || 0,
      ratingCount: stats[0]?.count || 0,
    });

    const recetaDoc = await Recipe.findById(receta).select("titulo usuario");
    await ActivityFeed.create({
      usuario: req.user._id,
      tipo: "reseno_receta",
      referencia: { tipo: "Review", id: review._id },
      metadata: { recetaTitulo: recetaDoc?.titulo, autorNombre: req.user.name },
    });

    const populated = await Review.findById(review._id).populate("usuario", "name avatar");
    res.status(201).json(populated);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Ya reseñaste esta receta" });
    }
    res.status(500).json({ message: "Error creando reseña", error: error.message });
  }
};

const getByRecipe = async (req, res) => {
  try {
    const reviews = await Review.find({ receta: req.params.recetaId })
      .populate("usuario", "name avatar")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo reseñas", error: error.message });
  }
};

const update = async (req, res) => {
  try {
    const review = await Review.findOneAndUpdate(
      { _id: req.params.id, usuario: req.user._id },
      { puntuacion: req.body.puntuacion, texto: req.body.texto || "" },
      { new: true }
    ).populate("usuario", "name avatar");
    if (!review) return res.status(404).json({ message: "Reseña no encontrada" });

    const stats = await Review.aggregate([
      { $match: { receta: review.receta } },
      { $group: { _id: null, promedio: { $avg: "$puntuacion" }, count: { $sum: 1 } } },
    ]);
    await Recipe.findByIdAndUpdate(review.receta, {
      ratingPromedio: Math.round(stats[0]?.promedio * 10) / 10 || 0,
      ratingCount: stats[0]?.count || 0,
    });

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: "Error actualizando reseña", error: error.message });
  }
};

const remove = async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({ _id: req.params.id, usuario: req.user._id });
    if (!review) return res.status(404).json({ message: "Reseña no encontrada" });

    const stats = await Review.aggregate([
      { $match: { receta: review.receta } },
      { $group: { _id: null, promedio: { $avg: "$puntuacion" }, count: { $sum: 1 } } },
    ]);
    await Recipe.findByIdAndUpdate(review.receta, {
      ratingPromedio: stats[0] ? Math.round(stats[0].promedio * 10) / 10 : 0,
      ratingCount: stats[0]?.count || 0,
    });

    res.json({ message: "Reseña eliminada" });
  } catch (error) {
    res.status(500).json({ message: "Error eliminando reseña", error: error.message });
  }
};

module.exports = { create, getByRecipe, update, remove };