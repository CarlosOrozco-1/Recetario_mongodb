const express = require("express");
const { toggleLike, toggleSave, incrementShare, reportRecipe } = require("../controllers/recipeSocialController");
const auth = require("../middleware/auth");
const { socialLimiter, createLimiter } = require("../middleware/rateLimiter");
const { sanitizeFields } = require("../middleware/sanitize");

const router = express.Router();

router.use(auth);

router.post("/:id/like", socialLimiter, toggleLike);
router.post("/:id/save", socialLimiter, toggleSave);
router.post("/:id/share", socialLimiter, incrementShare);
router.post("/:id/report", createLimiter, sanitizeFields(["motivo"]), reportRecipe);

module.exports = router;