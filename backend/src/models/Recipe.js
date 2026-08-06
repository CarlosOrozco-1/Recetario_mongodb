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
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Recipe", RecipeSchema);
