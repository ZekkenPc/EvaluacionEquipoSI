const crypto = require("crypto");

function verifyVoteSignature(plaintextVote, signatureBase64, userPublicKeyPem) {
  const verify = crypto.createVerify("RSA-SHA256");
  verify.update(plaintextVote);
  verify.end();
  return verify.verify(userPublicKeyPem, signatureBase64, "base64");
}

module.exports = {
  verifyVoteSignature
};
