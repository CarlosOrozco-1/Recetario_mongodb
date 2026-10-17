const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema(
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
    motivo: {
      type: String,
      trim: true,
      maxlength: [500, "El motivo no puede exceder los 500 caracteres"],
      default: "",
    },
    estado: {
      type: String,
      enum: ["pendiente", "descartado", "resuelto"],
      default: "pendiente",
    },
  },
  { timestamps: true },
);

// Un usuario solo puede reportar una vez la misma receta
ReportSchema.index({ usuario: 1, receta: 1 }, { unique: true });
// Consultas de moderación por receta y por estado
ReportSchema.index({ receta: 1, estado: 1 });

module.exports = mongoose.model("Report", ReportSchema);
