const Recipe = require("../models/Recipe");
const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");

// Únicos campos que el cliente puede escribir. Sin esta lista, un PUT podía
// pisar _id, usuario (robo de receta), likes, likesCount, reportado, etc.
const EDITABLE_FIELDS = [
  "titulo",
  "descripcion",
  "ingredientes",
  "instrucciones",
  "categoria",
  "tiempoPreparacion",
  "dificultad",
  "porciones",
  "favorito",
  "publica",
  "hashtags",
  "imagen",
];

const pickEditable = (body) => {
  const allowed = {};
  for (const field of EDITABLE_FIELDS) {
    if (body[field] !== undefined) allowed[field] = body[field];
  }
  return allowed;
};

const create = async (req, res) => {
  try {
    const recipe = await Recipe.create({
      ...pickEditable(req.body),
      usuario: req.user._id,
    });
    res.status(201).json(recipe);
  } catch (error) {
    res.status(500).json({ message: "Error al crear receta", error: error.message });
  }
};

// Función auxiliar para eliminar imagen de GridFS
const deleteImageFromGridFS = async (imageId) => {
  if (!imageId) return;
  try {
    const bucket = new GridFSBucket(mongoose.connection.db, { bucketName: "uploads" });
    await bucket.delete(new mongoose.Types.ObjectId(imageId));
  } catch (error) {
    console.error("Error eliminando imagen de GridFS:", error);
    // No lanzamos error para no romper el flujo principal
  }
};

const getAll = async (req, res) => {
  try {
    const { scope } = req.query;
    let query = { usuario: req.user._id };

    if (scope === "public") {
      // Get all public recipes, including those of other users, and own recipes
      query = { $or: [{ publica: true }, { usuario: req.user._id }] };
    }

    const recipes = await Recipe.find(query)
      .populate("usuario", "name")
      .sort({ createdAt: -1 });
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener recetas", error: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const recipe = await Recipe.findOne({
      _id: req.params.id,
      $or: [{ usuario: req.user._id }, { publica: true }],
    }).populate("usuario", "name");

    if (!recipe) {
      return res.status(404).json({ message: "Receta no encontrada" });
    }
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener receta", error: error.message });
  }
};

const update = async (req, res) => {
  try {
    const changes = pickEditable(req.body);
    if (Object.keys(changes).length === 0) {
      return res.status(400).json({ message: "No se envió ningún campo editable" });
    }
    const recipe = await Recipe.findOneAndUpdate(
      { _id: req.params.id, usuario: req.user._id },
      changes,
      { new: true, runValidators: true }
    );
    if (!recipe) {
      return res.status(404).json({ message: "Receta no encontrada o no tienes permisos para editarla" });
    }
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar receta", error: error.message });
  }
};

const remove = async (req, res) => {
  try {
    const recipe = await Recipe.findOneAndDelete({ _id: req.params.id, usuario: req.user._id });
    if (!recipe) {
      return res.status(404).json({ message: "Receta no encontrada o no tienes permisos para eliminarla" });
    }
    
    // Eliminar imagen de GridFS si existe
    if (recipe.imagen) {
      await deleteImageFromGridFS(recipe.imagen);
    }
    
    res.json({ message: "Receta eliminada" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar receta", error: error.message });
  }
};

module.exports = { create, getAll, getById, update, remove };
