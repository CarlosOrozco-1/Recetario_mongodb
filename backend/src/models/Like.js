const mongoose = require("mongoose");

const LikeSchema = new mongoose.Schema(
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
  },
  { timestamps: true },
);

// Un usuario solo puede dar like una vez a la misma receta
LikeSchema.index({ usuario: 1, receta: 1 }, { unique: true });
// Conteo por receta
LikeSchema.index({ receta: 1 });

module.exports = mongoose.model("Like", LikeSchema);
