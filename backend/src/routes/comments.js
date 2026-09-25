const express = require("express");
const {
  create,
  getByRecipe,
  update,
  remove,
} = require("../controllers/commentController");
const auth = require("../middleware/auth");
const { createLimiter, socialLimiter } = require("../middleware/rateLimiter");
const { sanitizeFields } = require("../middleware/sanitize");

const router = express.Router();

router.use(auth);

router.post("/", createLimiter, sanitizeFields(["texto"]), create);
router.get("/receta/:recetaId", socialLimiter, getByRecipe);
router.put("/:id", createLimiter, sanitizeFields(["texto"]), update);
router.delete("/:id", socialLimiter, remove);

module.exports = router;
