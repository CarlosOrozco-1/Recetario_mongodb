const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
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
    puntuacion: {
      type: Number,
      required: [true, "La puntuación es obligatoria"],
      min: [1, "Mínimo 1 estrella"],
      max: [5, "Máximo 5 estrellas"],
    },
    texto: {
      type: String,
      trim: true,
      maxlength: [2000, "Máximo 2000 caracteres"],
      default: "",
    },
  },
  { timestamps: true },
);

// Un usuario solo puede reseñar una receta una vez
ReviewSchema.index({ usuario: 1, receta: 1 }, { unique: true });
// Para calcular promedio rápido
ReviewSchema.index({ receta: 1, puntuacion: 1 });

module.exports = mongoose.model("Review", ReviewSchema);
