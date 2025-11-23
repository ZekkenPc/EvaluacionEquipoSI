/**
 * CLIENTE DE PRUEBA – 
 * -------------------------------------------------
 * Este archivo SOLO sirve para demostrar la simulación:
 * - Generación de llaves RSA (cliente)
 * - Registro automático
 * - Login
 * - Cifrado híbrido (AES + RSA)
 * - Firma digital (RSA)
 * - Envío del sobre digital al servidor
 */

const axios = require("axios");
const crypto = require("crypto");

const API_BASE = "http://localhost:4000/api";

async function main() {
  console.log("\n=== SIMULACIÓN CLIENTE (CIFRADO HÍBRIDO) ===\n");

  // 1. Generar par de llaves RSA del alumno
  const { publicKey: studentPublicKey, privateKey: studentPrivateKey } =
    crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" }
    });

  console.log(" Llave pública del alumno:\n", studentPublicKey);
  console.log("\n Llave privada del alumno (solo demostración):\n", studentPrivateKey);
  console.log("\n--------------------------------------------------------\n");

  // USUARIO DE PRUEBA
  const alumno = {
    nombre: "GREENDROP",
    email: "greendrop@gmail.com",
    password: "123456",
    publicKey: studentPublicKey
  };

  // 2. Registrar alumno
  try {
    await axios.post(`${API_BASE}/auth/register`, alumno);
    console.log("✔ Usuario de simulación registrado");
  } catch (err) {
    console.log("ℹ El usuario ya existe, usando el existente...");
  }

  // 3. Login
  const loginResp = await axios.post(`${API_BASE}/auth/login`, {
    email: alumno.email,
    password: alumno.password
  });

  const token = loginResp.data.token;
  console.log("Login OK – Token JWT obtenido\n");

  // 4. Obtener llave pública del servidor (para RSA-OAEP)
  const serverKeyResp = await axios.get(`${API_BASE}/votes/server-public-key`);
  const serverPublicKey = serverKeyResp.data.publicKey;

  console.log(" Llave pública del servidor:\n", serverPublicKey);
  console.log("\n--------------------------------------------------------\n");

  // 5. Crear voto en claro (simulado)
  const votoClaro = "CANDIDATO_DEMO";

  // 6. Generar llave AES KS (32 bytes = 256 bits)
  const ks = crypto.randomBytes(32);
  const iv = crypto.randomBytes(16);

  // 7. Cifrar voto con AES-256-CBC
  const cipher = crypto.createCipheriv("aes-256-cbc", ks, iv);
  let votoCifrado = cipher.update(votoClaro, "utf8", "base64");
  votoCifrado += cipher.final("base64");

  // 8. Cifrar la KS con RSA (pública del servidor)
  const ksCifrada = crypto
    .publicEncrypt(
      {
        key: serverPublicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
      },
      ks
    )
    .toString("base64");

  // 9. Firmar el voto en claro (firma RSA-PKCS1v15 SHA-256)
  const sign = crypto.createSign("RSA-SHA256");
  sign.update(votoClaro);
  sign.end();
  const firma = sign.sign(studentPrivateKey, "base64");

  console.log(" Enviando sobre digital al servidor...\n");

  // 10. Enviar sobre digital
  const resp = await axios.post(
    `${API_BASE}/votes`,
    {
      voto_cifrado: votoCifrado,
      iv: iv.toString("base64"),
      ks_cifrada: ksCifrada,
      firma
    },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  console.log("✔ Respuesta del servidor:", resp.data);
  console.log("\n=== FIN DE LA SIMULACIÓN ===\n");
}

main().catch((err) => {
  console.error(" Error en cliente:", err.response?.data || err.message);
});
