// Configuración pública que el frontend necesita antes de autenticarse.
// Solo se exponen identificadores públicos; nunca secretos ni cadenas de conexión.
const getPublicConfig = (req, res) => {
  return res.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  });
};

module.exports = { getPublicConfig };
