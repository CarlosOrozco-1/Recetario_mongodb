const express = require("express");
const { register, login } = require("../controllers/authController");
const { authLimiter } = require("../middleware/rateLimiter");
const { sanitizeFields } = require("../middleware/sanitize");

const router = express.Router();

// Rutas de autenticación con rate limiting
router.post("/register", authLimiter, sanitizeFields(["name", "email"]), register);
router.post("/login", authLimiter, login);

module.exports = router;
