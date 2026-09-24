const express = require("express");
const { create, getByRecipe, update, remove } = require("../controllers/reviewController");
const auth = require("../middleware/auth");

const router = express.Router();

router.use(auth);

router.post("/", create);
router.get("/receta/:recetaId", getByRecipe);
router.put("/:id", update);
router.delete("/:id", remove);

module.exports = router;