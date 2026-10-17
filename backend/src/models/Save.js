const mongoose = require("mongoose");

const SaveSchema = new mongoose.Schema(
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

// Un usuario solo puede guardar una vez la misma receta
SaveSchema.index({ usuario: 1, receta: 1 }, { unique: true });
// Conteo por receta
SaveSchema.index({ receta: 1 });

module.exports = mongoose.model("Save", SaveSchema);
