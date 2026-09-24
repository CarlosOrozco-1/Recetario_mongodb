const mongoose = require("mongoose");

const FollowSchema = new mongoose.Schema(
  {
    seguidor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    seguido: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

// Un usuario no puede seguir al mismo usuario dos veces
FollowSchema.index({ seguidor: 1, seguido: 1 }, { unique: true });
// Para listar seguidores/seguidos rápido
FollowSchema.index({ seguido: 1, createdAt: -1 });
FollowSchema.index({ seguidor: 1, createdAt: -1 });

// Evitar auto-seguir
FollowSchema.pre("validate", function (next) {
  if (this.seguidor.equals(this.seguido)) {
    next(new Error("No puedes seguirte a ti mismo"));
  }
  next();
});

module.exports = mongoose.model("Follow", FollowSchema);
