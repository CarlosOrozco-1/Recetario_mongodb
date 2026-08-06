const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta de prueba con estado de MongoDB
app.get("/api/health", (req, res) => {
  const mongoState = mongoose.connection.readyState;
  const states = {
    0: "desconectado",
    1: "conectado",
    2: "conectando",
    3: "desconectando",
  };

  res.json({
    status: mongoState === 1 ? "ok" : "error",
    mongodb: states[mongoState] || "desconocido",
    database: mongoose.connection.name || "N/A",
    host: mongoose.connection.host || "N/A",
    port: mongoose.connection.port || "N/A",
    timestamp: new Date().toISOString(),
  });
});

// Rutas de autenticación
app.use("/api/auth", require("./routes/auth"));

// Rutas de recetas
app.use("/api/recipes", require("./routes/recipes"));

// Conexión a MongoDB a la base de datos recetario
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/recetario";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Conectado a MongoDB"))
  .catch((err) => {
    console.error("❌ Error de conexión a MongoDB:", err.message);
    process.exit(1);
  });

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Backend corriendo en puerto ${PORT}`);
});
