const Recipe = require("../models/Recipe");
const User = require("../models/User");
const ActivityFeed = require("../models/ActivityFeed");

const toggleLike = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Receta no encontrada" });

    const userId = req.user._id;
    const liked = recipe.likes.includes(userId);

    if (liked) {
      recipe.likes.pull(userId);
      recipe.likesCount = Math.max(0, recipe.likesCount - 1);
      await User.findByIdAndUpdate(userId, { $inc: { "stats.favoritosCount": -1 } });
      await User.findByIdAndUpdate(userId, { $pull: { favoritos: recipe._id } });
    } else {
      recipe.likes.push(userId);
      recipe.likesCount += 1;
      await User.findByIdAndUpdate(userId, { $inc: { "stats.favoritosCount": 1 } });
      await User.findByIdAndUpdate(userId, { $addToSet: { favoritos: recipe._id } });

      await ActivityFeed.create({
        usuario: recipe.usuario,
        tipo: "likio_receta",
        referencia: { tipo: "Recipe", id: recipe._id },
        metadata: { recetaTitulo: recipe.titulo, autorNombre: req.user.name },
      });
    }

    await recipe.save();
    res.json({ liked: !liked, likesCount: recipe.likesCount });
  } catch (error) {
    res.status(500).json({ message: "Error en like", error: error.message });
  }
};

const toggleSave = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Receta no encontrada" });

    const userId = req.user._id;
    const saved = recipe.guardados.includes(userId);

    if (saved) {
      recipe.guardados.pull(userId);
      recipe.guardadosCount = Math.max(0, recipe.guardadosCount - 1);
    } else {
      recipe.guardados.push(userId);
      recipe.guardadosCount += 1;
    }

    await recipe.save();
    res.json({ saved: !saved, guardadosCount: recipe.guardadosCount });
  } catch (error) {
    res.status(500).json({ message: "Error en guardar", error: error.message });
  }
};

const incrementShare = async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      { $inc: { compartidosCount: 1 } },
      { new: true }
    ).select("compartidosCount");
    if (!recipe) return res.status(404).json({ message: "Receta no encontrada" });

    await ActivityFeed.create({
      usuario: req.user._id,
      tipo: "compartio_receta",
      referencia: { tipo: "Recipe", id: recipe._id },
      metadata: { recetaTitulo: recipe.titulo },
    });

    res.json({ compartidosCount: recipe.compartidosCount });
  } catch (error) {
    res.status(500).json({ message: "Error en compartir", error: error.message });
  }
};

const reportRecipe = async (req, res) => {
  try {
    const { motivo } = req.body;
    const recipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      {
        $push: { reportes: { usuario: req.user._id, motivo } },
        $set: { reportado: true },
      },
      { new: true }
    ).select("reportado reportes");
    if (!recipe) return res.status(404).json({ message: "Receta no encontrada" });

    res.json({ message: "Receta reportada", reportado: recipe.reportado });
  } catch (error) {
    res.status(500).json({ message: "Error reportando", error: error.message });
  }
};

module.exports = { toggleLike, toggleSave, incrementShare, reportRecipe };