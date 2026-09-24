const express = require("express");
const { getMyFeed, getUserActivity } = require("../controllers/activityFeedController");
const auth = require("../middleware/auth");

const router = express.Router();

router.use(auth);

router.get("/feed", getMyFeed);
router.get("/user/:userId", getUserActivity);

module.exports = router;