const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    texto: {
      type: String,
      required: [true, "El comentario no puede estar vacío"],
      trim: true,
      maxlength: [1000, "Máximo 1000 caracteres"],
    },
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receta: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recipe",
      required: true,
    },
    // Para respuestas (threaded comments)
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    // Soft delete
    eliminado: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// Índices para queries comunes
CommentSchema.index({ receta: 1, createdAt: -1 }); // comentarios de una receta ordenados
CommentSchema.index({ usuario: 1, createdAt: -1 }); // comentarios de un usuario
CommentSchema.index({ parentComment: 1 }); // respuestas a un comentario

module.exports = mongoose.model("Comment", CommentSchema);
