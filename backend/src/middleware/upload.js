const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const mongoose = require("mongoose");
const sharp = require("sharp");

const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1080;

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

// Middleware para validar dimensiones de imagen con sharp
const validateImageDimensions = async (req, res, next) => {
  if (!req.file) return next();
  
  try {
    const metadata = await sharp(req.file.buffer).metadata();
    const { width, height } = metadata;
    
    if (width > MAX_WIDTH || height > MAX_HEIGHT) {
      return res.status(400).json({ 
        message: `La imagen excede las dimensiones máximas permitidas (${MAX_WIDTH}x${MAX_HEIGHT}px). Actual: ${width}x${height}px` 
      });
    }
    next();
  } catch (error) {
    console.error("Error validando dimensiones:", error);
    return res.status(400).json({ message: "Error procesando la imagen" });
  }
};

module.exports = {
  uploadMiddleware: (req, res, next) => {
    const uploader = getUpload().single("imagen");
    uploader(req, res, (err) => {
      if (err) return res.status(400).json({ message: err.message });
      next();
    });
  },
  validateImageDimensions
};