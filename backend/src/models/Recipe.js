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

    // --- CAMPOS SOCIALES ---
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    likesCount: { type: Number, default: 0 },

    guardados: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    guardadosCount: { type: Number, default: 0 },

    comentariosCount: { type: Number, default: 0 },

    ratingPromedio: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },

    compartidosCount: { type: Number, default: 0 },

    hashtags: [{
      type: String,
      lowercase: true,
      trim: true,
    }],

    reportado: {
      type: Boolean,
      default: false,
    },
    reportes: [{
      usuario: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      motivo: String,
      createdAt: { type: Date, default: Date.now },
    }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Recipe", RecipeSchema);
