const mongoose = require("mongoose");

const PasswordResetSchema = new mongoose.Schema(
  {
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    codigoHash: { type: String, required: true },
    expiraEn: { type: Date, required: true },
    usado: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Limpieza automática de códigos expirados.
PasswordResetSchema.index({ expiraEn: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("PasswordReset", PasswordResetSchema);
