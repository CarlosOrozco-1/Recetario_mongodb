const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const commentsRouter = require("./routes/comments");
const reviewsRouter = require("./routes/reviews");
const followsRouter = require("./routes/follows");
const activityFeedRouter = require("./routes/activityFeed");
const recipeSocialRouter = require("./routes/recipeSocial");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

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

app.use("/api/auth", require("./routes/auth"));
app.use("/api/recipes", require("./routes/recipes"));
app.use("/api/comments", commentsRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/follows", followsRouter);
app.use("/api/activity", activityFeedRouter);
app.use("/api/recipes", recipeSocialRouter);

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://localhost:27017/recetario";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Conectado a MongoDB"))
  .catch((err) => {
    console.error("❌ Error de conexión a MongoDB:", err.message);
    process.exit(1);
  });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Backend corriendo en puerto ${PORT}`);
});