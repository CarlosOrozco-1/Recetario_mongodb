const mongoose = require("mongoose");

const ActivityFeedSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tipo: {
      type: String,
      enum: [
        "creo_receta",
        "comento_receta",
        "reseno_receta",
        "likio_receta",
        "guardo_receta",
        "siguio_usuario",
      ],
      required: true,
    },
    // Referencia polimórfica (receta, comentario, review, usuario)
    referencia: {
      tipo: {
        type: String,
        enum: ["Recipe", "Comment", "Review", "User"],
        required: true,
      },
      id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
    },
    // Para mostrar en feed: datos desnormalizados mínimos
    metadata: {
      recetaTitulo: String,
      autorNombre: String,
      // etc.
    },
  },
  { timestamps: true },
);

// Feed de un usuario (lo que él ve: actividad de a quien sigue)
ActivityFeedSchema.index({ usuario: 1, createdAt: -1 });
// Para limpiar feeds antiguos (TTL opcional: 90 días)
// ActivityFeedSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.model("ActivityFeed", ActivityFeedSchema);
