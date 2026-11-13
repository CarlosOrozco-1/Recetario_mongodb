const express = require("express");
const { register, login, googleLogin, requestPasswordReset, verifyResetCode, resetPassword } = require("../controllers/authController");
const { authLimiter } = require("../middleware/rateLimiter");
const { sanitizeFields } = require("../middleware/sanitize");

const router = express.Router();

// Rutas de autenticación con rate limiting
router.post("/register", authLimiter, sanitizeFields(["name", "email"]), register);
router.post("/login", authLimiter, login);
router.post("/google", authLimiter, googleLogin);
router.post("/forgot-password", authLimiter, sanitizeFields(["email"]), requestPasswordReset);
router.post("/verify-reset-code", authLimiter, verifyResetCode);
router.post("/reset-password", authLimiter, resetPassword);

module.exports = router;
