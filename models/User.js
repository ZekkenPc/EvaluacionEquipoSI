const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  publicKey: { type: String, required: true }, // llave pública del alumno
  rol: { type: String, enum: ["alumno", "admin"], default: "alumno" }
});

module.exports = mongoose.model("User", userSchema);
