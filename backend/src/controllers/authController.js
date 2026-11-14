const User = require("../models/User");
const PasswordReset = require("../models/PasswordReset");
const { sendResetCode, isConfigured } = require("../utils/mailer");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

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

// ---------- Recuperación de contraseña ----------

const REQUEST_RESET_TTL_MS = 15 * 60 * 1000;

const requestPasswordReset = async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ message: "El correo es obligatorio" });
    }

    // La falta de SMTP es un fallo global del servicio, no de la cuenta: se responde
    // 503 antes de buscar al usuario para no revelar si el correo existe.
    if (!isConfigured()) {
      console.error("[AUTH] Recuperación no disponible: faltan SMTP_HOST, SMTP_USER o SMTP_PASS");
      return res.status(503).json({
        message: "El envío de correos no está disponible en este momento. Intenta más tarde o contacta al administrador.",
      });
    }

    const user = await User.findOne({ email });
    // Respuesta genérica para no revelar si la cuenta existe.
    if (!user) {
      return res.status(200).json({ message: "Si el correo existe, recibirás un código de recuperación" });
    }

    // Invalidar códigos anteriores.
    await PasswordReset.deleteMany({ usuario: user._id, usado: false });

    const code = crypto.randomInt(100000, 999999).toString();
    const salt = await bcrypt.genSalt(10);
    const codeHash = await bcrypt.hash(code, salt);

    await PasswordReset.create({
      usuario: user._id,
      codigoHash: codeHash,
      expiraEn: new Date(Date.now() + REQUEST_RESET_TTL_MS),
    });

    // Cualquier cuenta con email puede recuperar la contraseña, incluidas las
    // creadas con Google: tras verificar el código pueden definir una contraseña
    // e iniciar sesión también con email.
    const mail = await sendResetCode(email, code);
    if (!mail.sent) {
      // No dejar un código válido que el usuario nunca recibió.
      await PasswordReset.deleteMany({ usuario: user._id, usado: false });
      const detalle = mail.errorCode ? `: ${mail.errorCode}` : "";
      console.error(`[AUTH] No se pudo enviar el código de recuperación (${mail.reason}${detalle})`);
      return res.status(502).json({
        message: "No se pudo enviar el correo de recuperación. Intenta de nuevo en unos minutos.",
      });
    }

    return res.status(200).json({ message: "Si el correo existe, recibirás un código de recuperación" });
  } catch (error) {
    console.error("Error al solicitar recuperación:", error.message);
    return res.status(500).json({ message: "No se pudo procesar la solicitud" });
  }
};

const verifyResetCode = async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const code = String(req.body?.code || "").trim();
    if (!email || !code) {
      return res.status(400).json({ message: "Correo y código son obligatorios" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Código inválido o expirado" });
    }

    const reset = await PasswordReset.findOne({
      usuario: user._id,
      usado: false,
      expiraEn: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!reset) {
      return res.status(400).json({ message: "Código inválido o expirado" });
    }

    const isMatch = await bcrypt.compare(code, reset.codigoHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Código inválido o expirado" });
    }

    const resetToken = jwt.sign(
      { id: user._id, resetId: reset._id, purpose: "reset" },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    return res.status(200).json({ resetToken });
  } catch (error) {
    console.error("Error al verificar código:", error.message);
    return res.status(500).json({ message: "No se pudo verificar el código" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const token = req.body?.token;
    const password = req.body?.password;
    if (!token || !password || String(password).length < 8) {
      return res.status(400).json({ message: "Token y contraseña (mínimo 8 caracteres) son obligatorios" });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ message: "Token inválido o expirado" });
    }

    if (payload.purpose !== "reset") {
      return res.status(401).json({ message: "Token inválido" });
    }

    const reset = await PasswordReset.findById(payload.resetId);
    if (!reset || reset.usado || reset.expiraEn < new Date()) {
      return res.status(400).json({ message: "El código ya fue usado o expiró" });
    }

    const user = await User.findById(payload.id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    user.password = String(password);
    await user.save();

    reset.usado = true;
    await reset.save();

    return res.status(200).json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error("Error al restablecer contraseña:", error.message);
    return res.status(500).json({ message: "No se pudo restablecer la contraseña" });
  }
};

module.exports = {
  register,
  login,
  googleLogin,
  setGoogleClientForTesting,
  requestPasswordReset,
  verifyResetCode,
  resetPassword,
};
