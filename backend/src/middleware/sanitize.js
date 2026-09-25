const xss = require("xss");

// Configuración de XSS para permitir solo tags/atributos seguros
const xssOptions = {
  whiteList: {
    // Solo permitir tags básicos de formato
    b: [],
    i: [],
    u: [],
    strong: [],
    em: [],
    p: [],
    br: [],
    ul: [],
    ol: [],
    li: [],
  },
  stripIgnoreTag: true,
  stripIgnoreTagBody: ["script", "style"],
};

const sanitizeHtml = (dirty) => {
  if (typeof dirty !== "string") return dirty;
  return xss(dirty, xssOptions);
};

// Sanitizar recursivamente objetos
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== "object") return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeHtml(value);
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

// Middleware para sanitizar req.body
const sanitizeBody = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  next();
};

// Sanitizar campos específicos (más estricto)
const sanitizeFields = (fields) => (req, res, next) => {
  if (req.body) {
    for (const field of fields) {
      if (req.body[field] && typeof req.body[field] === "string") {
        req.body[field] = sanitizeHtml(req.body[field]);
      }
    }
  }
  next();
};

module.exports = {
  sanitizeBody,
  sanitizeFields,
  sanitizeHtml,
};