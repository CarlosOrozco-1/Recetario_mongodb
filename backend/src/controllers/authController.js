const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Generar JWT token
const GenerarJWT = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d", //tiempo de expiraciòn del token
  });
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
    if (!user) {
      return res.status(400).json({ message: "Usuario no encontrado" });
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
};
