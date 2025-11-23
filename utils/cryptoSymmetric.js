const crypto = require("crypto");

const AES_DB_KEY = Buffer.from(process.env.AES_DB_KEY, "hex"); // 32 bytes

function encryptForDB(plaintext) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", AES_DB_KEY, iv);
  let encrypted = cipher.update(plaintext, "utf8", "base64");
  encrypted += cipher.final("base64");

  return {
    encryptedData: encrypted,
    iv: iv.toString("base64")
  };
}

function decryptFromDB(encryptedData, ivBase64) {
  const iv = Buffer.from(ivBase64, "base64");
  const decipher = crypto.createDecipheriv("aes-256-cbc", AES_DB_KEY, iv);
  let decrypted = decipher.update(encryptedData, "base64", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

module.exports = {
  encryptForDB,
  decryptFromDB
};
