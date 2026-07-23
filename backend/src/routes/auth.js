const express = require("express");
const { register, login } = require("../controllers/authController");

const router = express.Router();

// Rutas de autenticación post /api/auth/register
router.post("/register", register);
// Rutas de autenticación post /api/auth/login
router.post("/login", login);

module.exports = router;
