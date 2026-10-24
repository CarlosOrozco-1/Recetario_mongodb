const User = require("../models/User");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");

// Generar JWT token
const GenerarJWT = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d", //tiempo de expiraciòn del token
  });
};

const googleClient = new OAuth2Client();

const setGoogleClientForTesting = client => {
  if (process.env.NODE_ENV !== "test") throw new Error("Solo disponible en pruebas");
  googleClient.verifyIdToken = client.verifyIdToken.bind(client);
};

const googleLogin = async (req, res) => {
  const credential = req.body?.credential;
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    return res.status(500).json({ message: "El inicio de sesión con Google no está configurado" });
  }
  if (typeof credential !== "string" || credential.length === 0 || credential.length > 8192) {
    return res.status(400).json({ message: "La credencial de Google no es válida" });
  }

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: clientId });
    payload = ticket.getPayload();
  } catch (error) {
    return res.status(401).json({ message: "La credencial de Google no es válida" });
  }

  if (typeof payload?.sub !== "string" || !payload.sub || typeof payload.email !== "string" || !payload.email.trim() || payload.email_verified !== true) {
    return res.status(401).json({ message: "Google no pudo verificar la cuenta" });
  }

  try {
    const email = payload.email.trim().toLowerCase();
    const name = typeof payload.name === "string" && payload.name.trim()
      ? payload.name.trim().slice(0, 100)
      : email.split("@")[0];
    const avatar = typeof payload.picture === "string" && payload.picture.startsWith("https://")
      ? payload.picture
      : "";

    let user = await User.findOne({ googleId: payload.sub });
    if (!user) {
      user = await User.findOne({ email });
      if (user && user.googleId && user.googleId !== payload.sub) {
        return res.status(401).json({ message: "La cuenta no se pudo vincular" });
      }
      if (user) {
        user.googleId = payload.sub;
        if (!user.avatar && avatar) user.avatar = avatar;
        await user.save();
      } else {
        user = await User.create({ name, email, googleId: payload.sub, avatar });
      }
    }

    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: GenerarJWT(user._id),
    });
  } catch (error) {
    console.error("Error iniciando sesión con Google:", error.message);
    return res.status(500).json({ message: "No se pudo iniciar sesión con Google" });
  }
};

//post /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    //verificar si el usuario ya existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }
    //crear un nuevo usuario
    const user = await User.create({ name, email, password });

    //responder con el token
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: GenerarJWT(user._id),
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error del Servidor", error: error.message });
  }
};

// Post /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    //verificar si el usuario existe
    const user = await User.findOne({ email }).select("+password");
    if (!user || !user.password) {
      return res.status(400).json({ message: "Usuario o contraseña incorrectos" });
    }
    //verificar la contraseña
    const isMatch = await user.verifyPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Contraseña incorrecta" });
    }
    //responder con el token
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: GenerarJWT(user._id),
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error del Servidor", error: error.message });
  }
};

module.exports = {
  register,
  login,
  googleLogin,
  setGoogleClientForTesting,
};
