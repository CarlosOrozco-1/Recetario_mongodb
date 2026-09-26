const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif"];

let uploadInstance = null;

function getUpload() {
  if (uploadInstance) return uploadInstance;

  const storage = new GridFsStorage({
    // server.js acepta ambos nombres; multer-gridfs-storage solo leía MONGO_URI
    url: process.env.MONGODB_URI || process.env.MONGO_URI,
    file: (req, file) => ({
      filename: `${Date.now()}-${file.originalname}`,
      bucketName: "uploads",
      // Esta versión de multer-gridfs-storage descarta el contentType de nivel
      // superior, así que el tipo se guarda dentro de metadata para poder
      // servirlo después con el Content-Type correcto.
      metadata: { usuario: req.user._id, contentType: file.mimetype },
    })
  });

  const fileFilter = (req, file, cb) => {
    if (ALLOWED_MIME.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Tipo de archivo no permitido. Usa JPG, PNG, WEBP o GIF"), false);
  };

  uploadInstance = multer({
    storage,
    fileFilter,
    limits: { fileSize: MAX_FILE_SIZE }
  });

  return uploadInstance;
}

module.exports = {
  uploadMiddleware: (req, res, next) => {
    const uploader = getUpload().single("imagen");
    uploader(req, res, (err) => {
      if (err) {
        const message =
          err.code === "LIMIT_FILE_SIZE"
            ? "La imagen supera el tamaño máximo de 5 MB"
            : err.message;
        return res.status(400).json({ message });
      }
      next();
    });
  }
};
