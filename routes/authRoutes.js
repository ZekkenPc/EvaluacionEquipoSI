const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Registro
router.post("/register", async (req, res) => {
  try {
    const { nombre, email, password, publicKey } = req.body;

    if (!nombre || !email || !password || !publicKey) {
      return res.status(400).json({ msg: "Faltan campos" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ msg: "El email ya está registrado" });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      nombre,
      email,
      passwordHash,
      publicKey,
      rol: "alumno"
    });

    res.json({ msg: "Usuario registrado", userId: user._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error en servidor" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Credenciales inválidas" });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(400).json({ msg: "Credenciales inválidas" });

    const token = jwt.sign(
      { userId: user._id, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error en servidor" });
  }
});

module.exports = router;
