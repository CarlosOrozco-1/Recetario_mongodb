const express = require("express");
const { toggleFollow, getFollowers, getFollowing, checkFollow } = require("../controllers/followController");
const auth = require("../middleware/auth");

const router = express.Router();

router.use(auth);

router.post("/", toggleFollow);
router.get("/followers/:userId", getFollowers);
router.get("/following/:userId", getFollowing);
router.get("/check/:userId", checkFollow);

module.exports = router;