const ActivityFeed = require("../models/ActivityFeed");

const getMyFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const Follow = require("../models/Follow");
    const following = await Follow.find({ seguidor: req.user._id }).select("seguido");
    const followingIds = following.map(f => f.seguido);
    followingIds.push(req.user._id);

    const activities = await ActivityFeed.find({ usuario: { $in: followingIds } })
      .populate("usuario", "name avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo feed", error: error.message });
  }
};

const getUserActivity = async (req, res) => {
  try {
    const activities = await ActivityFeed.find({ usuario: req.params.userId })
      .populate("usuario", "name avatar")
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo actividad", error: error.message });
  }
};

module.exports = { getMyFeed, getUserActivity };