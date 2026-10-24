const express = require("express");
const { register, login, googleLogin } = require("../controllers/authController");
const { authLimiter } = require("../middleware/rateLimiter");
const { sanitizeFields } = require("../middleware/sanitize");

const router = express.Router();

// Rutas de autenticación con rate limiting
router.post("/register", authLimiter, sanitizeFields(["name", "email"]), register);
router.post("/login", authLimiter, login);
router.post("/google", authLimiter, googleLogin);

module.exports = router;
