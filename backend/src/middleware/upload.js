const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const mongoose = require("mongoose");

let uploadInstance = null;

function getUpload() {
  if (uploadInstance) return uploadInstance;

  const storage = new GridFsStorage({
    url: process.env.MONGO_URI,
    file: (req, file) => {
      if (!file.mimetype.startsWith("image/")) {
        throw new Error("Solo se permiten imágenes");
      }
      return {
        filename: `${Date.now()}-${file.originalname}`,
        bucketName: "uploads",
        metadata: { usuario: req.user._id }
      };
    }
  });

  const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Tipo de archivo no permitido"), false);
  };

  uploadInstance = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
  });

  return uploadInstance;
}

module.exports = (req, res, next) => {
  const uploader = getUpload().single("imagen");
  uploader(req, res, next);
};