const rateLimit = require("express-rate-limit");

// Rate limiter general para API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: "Demasiadas solicitudes, intenta más tarde" },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter estricto para auth (login/register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Demasiados intentos, intenta en 15 minutos" },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter para acciones sociales (like, save, comment, review, follow)
const socialLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { message: "Demasiadas acciones, espera un momento" },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter para creación de contenido (recetas, comentarios, reseñas)
const createLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { message: "Demasiadas publicaciones, espera un momento" },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter para subida de imágenes
const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { message: "Demasiadas subidas, espera un momento" },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  apiLimiter,
  authLimiter,
  socialLimiter,
  createLimiter,
  uploadLimiter
};