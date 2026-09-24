const Comment = require("../models/Comment");
const Recipe = require("../models/Recipe");
const ActivityFeed = require("../models/ActivityFeed");

const create = async (req, res) => {
  try {
    const { texto, receta, parentComment } = req.body;
    const comment = await Comment.create({
      texto,
      usuario: req.user._id,
      receta,
      parentComment: parentComment || null,
    });

    // Incrementar contador en receta
    await Recipe.findByIdAndUpdate(receta, { $inc: { comentariosCount: 1 } });

    // Feed de actividad
    const recetaDoc = await Recipe.findById(receta).select("titulo usuario");
    await ActivityFeed.create({
      usuario: req.user._id,
      tipo: "comento_receta",
      referencia: { tipo: "Comment", id: comment._id },
      metadata: { recetaTitulo: recetaDoc?.titulo, autorNombre: req.user.name },
    });

    // Notificar al autor de la receta (si no es el mismo)
    if (recetaDoc && !recetaDoc.usuario.equals(req.user._id)) {
      await ActivityFeed.create({
        usuario: recetaDoc.usuario,
        tipo: "comento_receta",
        referencia: { tipo: "Comment", id: comment._id },
        metadata: { recetaTitulo: recetaDoc.titulo, autorNombre: req.user.name },
      });
    }

    const populated = await Comment.findById(comment._id).populate("usuario", "name avatar");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Error creando comentario", error: error.message });
  }
};

const getByRecipe = async (req, res) => {
  try {
    const { recetaId } = req.params;
    const comments = await Comment.find({ receta: recetaId, parentComment: null, eliminado: false })
      .populate("usuario", "name avatar")
      .sort({ createdAt: -1 })
      .lean();

    // Para cada comentario, traer respuestas
    for (let c of comments) {
      c.replies = await Comment.find({ parentComment: c._id, eliminado: false })
        .populate("usuario", "name avatar")
        .sort({ createdAt: 1 })
        .lean();
    }

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo comentarios", error: error.message });
  }
};

const update = async (req, res) => {
  try {
    const comment = await Comment.findOneAndUpdate(
      { _id: req.params.id, usuario: req.user._id, eliminado: false },
      { texto: req.body.texto },
      { new: true }
    ).populate("usuario", "name avatar");
    if (!comment) return res.status(404).json({ message: "Comentario no encontrado" });
    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: "Error actualizando comentario", error: error.message });
  }
};

const remove = async (req, res) => {
  try {
    const comment = await Comment.findOneAndUpdate(
      { _id: req.params.id, usuario: req.user._id },
      { eliminado: true },
      { new: true }
    );
    if (!comment) return res.status(404).json({ message: "Comentario no encontrado" });

    await Recipe.findByIdAndUpdate(comment.receta, { $inc: { comentariosCount: -1 } });
    res.json({ message: "Comentario eliminado" });
  } catch (error) {
    res.status(500).json({ message: "Error eliminando comentario", error: error.message });
  }
};

module.exports = { create, getByRecipe, update, remove };
