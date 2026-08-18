const Recipe = require("../models/Recipe");

const create = async (req, res) => {
  try {
    const recipe = await Recipe.create({
      ...req.body,
      usuario: req.user._id,
    });
    res.status(201).json(recipe);
  } catch (error) {
    res.status(500).json({ message: "Error al crear receta", error: error.message });
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
    const recipe = await Recipe.findOneAndUpdate(
      { _id: req.params.id, usuario: req.user._id },
      req.body,
      { new: true }
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
    res.json({ message: "Receta eliminada" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar receta", error: error.message });
  }
};

module.exports = { create, getAll, getById, update, remove };
