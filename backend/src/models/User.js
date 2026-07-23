const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: [8, 'La contraseña debe tener al menos 8 caracteres'],
    select: false, // No devuelve la contraseña en las consultas
  },

},
  {
    timestamps: true // Añade createdAt y updatedAt automatico
  }
);

//encriptar contraseña antes de guardar
UserSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

//metodo para verificar la contraseña
UserSchema.methods.verifyPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};


module.exports = mongoose.model('User', UserSchema);
