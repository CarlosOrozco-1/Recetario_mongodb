const express = require("express");
const { create, getAll, getById, update, remove } = require("../controllers/recipeController");
const auth = require("../middleware/auth");

const router = express.Router();

router.use(auth);

router.post("/", create);
router.get("/", getAll);
router.get("/:id", getById);
router.put("/:id", update);
router.delete("/:id", remove);

module.exports = router;
