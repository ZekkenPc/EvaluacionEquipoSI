const express = require("express");
const crypto = require("crypto");
const Vote = require("../models/Vote");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const { getServerPublicKey, getServerPrivateKey } = require("../config/cryptoServerKeys");
const { encryptForDB, decryptFromDB } = require("../utils/cryptoSymmetric");
const { verifyVoteSignature } = require("../utils/cryptoAsymmetric");

const router = express.Router();

// Obtener llave pública del servidor
router.get("/server-public-key", (req, res) => {
  const publicKey = getServerPublicKey();
  res.json({ publicKey });
});

// Registrar voto (Sobre Digital)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { voto_cifrado, iv, ks_cifrada, firma } = req.body;

    if (!voto_cifrado || !iv || !ks_cifrada || !firma) {
      return res.status(400).json({ msg: "Datos incompletos" });
    }

    const serverPrivateKey = getServerPrivateKey();

    // 1. Descifrar KS con RSA
    const ksBuffer = crypto.privateDecrypt(
      {
        key: serverPrivateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
      },
      Buffer.from(ks_cifrada, "base64")
    );

    // 2. Descifrar voto con AES + KS
    const ivBuffer = Buffer.from(iv, "base64");
    const decipher = crypto.createDecipheriv("aes-256-cbc", ksBuffer, ivBuffer);
    let votoClaro = decipher.update(voto_cifrado, "base64", "utf8");
    votoClaro += decipher.final("utf8");

    // 3. Verificar firma del alumno
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(400).json({ msg: "Usuario no encontrado" });

    const firmaValida = verifyVoteSignature(votoClaro, firma, user.publicKey);
    if (!firmaValida) {
      return res.status(400).json({ msg: "Firma inválida. Voto rechazado." });
    }

    // 4. Cifrado para almacenamiento
    const { encryptedData, iv: ivDb } = encryptForDB(votoClaro);

    // 5. Guardar en BD
    await Vote.create({
      voter: user._id,
      encryptedVoteDb: encryptedData,
      ivDb,
      signature: firma
    });

    res.json({ msg: "Voto registrado correctamente (cifrado y firmado)" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error al procesar voto" });
  }
});

// Ver votos descifrados (solo admin)
router.get("/admin/votos-descifrados", authMiddleware, async (req, res) => {
  try {
    if (req.user.rol !== "admin") {
      return res.status(403).json({ msg: "No autorizado" });
    }

    const votos = await Vote.find().populate("voter", "nombre email");

    const resultado = votos.map(v => {
      const votoClaro = decryptFromDB(v.encryptedVoteDb, v.ivDb);
      return {
        id: v._id,
        alumno: v.voter.nombre,
        email: v.voter.email,
        voto_claro: votoClaro,
        firma: v.signature,
        createdAt: v.createdAt
      };
    });

    res.json(resultado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error" });
  }
});

module.exports = router;
