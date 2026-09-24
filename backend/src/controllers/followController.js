const Follow = require("../models/Follow");
const User = require("../models/User");
const ActivityFeed = require("../models/ActivityFeed");

const toggleFollow = async (req, res) => {
  try {
    const { seguidoId } = req.body;
    if (req.user._id.equals(seguidoId)) {
      return res.status(400).json({ message: "No puedes seguirte a ti mismo" });
    }

    const existing = await Follow.findOne({ seguidor: req.user._id, seguido: seguidoId });
    let isFollowing;

    if (existing) {
      await Follow.deleteOne({ _id: existing._id });
      await User.findByIdAndUpdate(req.user._id, { $inc: { "stats.siguiendoCount": -1 } });
      await User.findByIdAndUpdate(seguidoId, { $inc: { "stats.seguidoresCount": -1 } });
      isFollowing = false;
    } else {
      await Follow.create({ seguidor: req.user._id, seguido: seguidoId });
      await User.findByIdAndUpdate(req.user._id, { $inc: { "stats.siguiendoCount": 1 } });
      await User.findByIdAndUpdate(seguidoId, { $inc: { "stats.seguidoresCount": 1 } });

      await ActivityFeed.create({
        usuario: seguidoId,
        tipo: "siguio_usuario",
        referencia: { tipo: "User", id: req.user._id },
        metadata: { autorNombre: req.user.name },
      });
      isFollowing = true;
    }

    res.json({ isFollowing });
  } catch (error) {
    res.status(500).json({ message: "Error en follow", error: error.message });
  }
};

const getFollowers = async (req, res) => {
  try {
    const follows = await Follow.find({ seguido: req.params.userId })
      .populate("seguidor", "name avatar bio stats")
      .sort({ createdAt: -1 });
    res.json(follows.map(f => f.seguidor));
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo seguidores", error: error.message });
  }
};

const getFollowing = async (req, res) => {
  try {
    const follows = await Follow.find({ seguidor: req.params.userId })
      .populate("seguido", "name avatar bio stats")
      .sort({ createdAt: -1 });
    res.json(follows.map(f => f.seguido));
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo seguidos", error: error.message });
  }
};

const checkFollow = async (req, res) => {
  try {
    const follow = await Follow.findOne({ seguidor: req.user._id, seguido: req.params.userId });
    res.json({ isFollowing: !!follow });
  } catch (error) {
    res.status(500).json({ message: "Error verificando follow", error: error.message });
  }
};

module.exports = { toggleFollow, getFollowers, getFollowing, checkFollow };