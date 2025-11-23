const fs = require("fs");
const path = require("path");
const { generateKeyPairSync } = require("crypto");

const keysPath = path.join(__dirname, "..", "server_keys");

if (!fs.existsSync(keysPath)) {
  fs.mkdirSync(keysPath);
}

const publicKeyPath = path.join(keysPath, "server_public.pem");
const privateKeyPath = path.join(keysPath, "server_private.pem");

function ensureServerKeys() {
  if (!fs.existsSync(publicKeyPath) || !fs.existsSync(privateKeyPath)) {
    console.log("Generando llaves RSA del servidor...");
    const { publicKey, privateKey } = generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: "spki",
        format: "pem"
      },
      privateKeyEncoding: {
        type: "pkcs8",
        format: "pem"
      }
    });

    fs.writeFileSync(publicKeyPath, publicKey);
    fs.writeFileSync(privateKeyPath, privateKey);
  }
}

function getServerPublicKey() {
  return fs.readFileSync(publicKeyPath, "utf8");
}

function getServerPrivateKey() {
  return fs.readFileSync(privateKeyPath, "utf8");
}

ensureServerKeys();

module.exports = {
  getServerPublicKey,
  getServerPrivateKey
};
