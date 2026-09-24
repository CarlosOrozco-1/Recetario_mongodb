const express = require("express");
const { toggleLike, toggleSave, incrementShare, reportRecipe } = require("../controllers/recipeSocialController");
const auth = require("../middleware/auth");

const router = express.Router();

router.use(auth);

router.post("/:id/like", toggleLike);
router.post("/:id/save", toggleSave);
router.post("/:id/share", incrementShare);
router.post("/:id/report", reportRecipe);

module.exports = router;