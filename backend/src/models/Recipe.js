const mongoose = require("mongoose");

const RecipeSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: [true, "El título es obligatorio"],
      trim: true,
    },
    descripcion: {
      type: String,
      required: [true, "La descripción es obligatoria"],
      trim: true,
    },
    ingredientes: {
      type: [String],
      required: [true, "Los ingredientes son obligatorios"],
    },
    instrucciones: {
      type: String,
      required: [true, "Las instrucciones son obligatorias"],
    },
    imagen: {
      type: String,
      default: "",
    },
    categoria: {
      type: String,
      default: "Otro",
      trim: true,
    },
    tiempoPreparacion: {
      type: Number,
      default: 0,
    },
    dificultad: {
      type: String,
      enum: ["Fácil", "Media", "Difícil"],
      default: "Media",
    },
    porciones: {
      type: Number,
      default: 1,
    },
    favorito: {
      type: Boolean,
      default: false,
    },
    publica: {
      type: Boolean,
      default: false,
    },
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Recipe", RecipeSchema);
