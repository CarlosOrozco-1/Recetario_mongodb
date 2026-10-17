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
    publica: {
      type: Boolean,
      default: false,
    },
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // --- CONTADORES DERIVADOS (caché) ---
    // La fuente de verdad vive en colecciones propias: Like, Save, Comment,
    // Review y Report. Estos números se recalculan al escribir para evitar
    // recalcular en cada lectura.
    likesCount: { type: Number, default: 0 },
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
  },
  { timestamps: true }
);

RecipeSchema.index({ usuario: 1, createdAt: -1 });
RecipeSchema.index({ categoria: 1 });
RecipeSchema.index({ publica: 1 });

module.exports = mongoose.model("Recipe", RecipeSchema);
