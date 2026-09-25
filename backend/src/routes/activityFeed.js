const express = require("express");
const { getMyFeed, getUserActivity } = require("../controllers/activityFeedController");
const auth = require("../middleware/auth");
const { socialLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

router.use(auth);

router.get("/feed", socialLimiter, getMyFeed);
router.get("/user/:userId", socialLimiter, getUserActivity);

module.exports = router;