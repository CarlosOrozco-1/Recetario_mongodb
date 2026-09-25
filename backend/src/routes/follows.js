const express = require("express");
const { toggleFollow, getFollowers, getFollowing, checkFollow } = require("../controllers/followController");
const auth = require("../middleware/auth");
const { socialLimiter, createLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

router.use(auth);

router.post("/", createLimiter, toggleFollow);
router.get("/followers/:userId", socialLimiter, getFollowers);
router.get("/following/:userId", socialLimiter, getFollowing);
router.get("/check/:userId", socialLimiter, checkFollow);

module.exports = router;