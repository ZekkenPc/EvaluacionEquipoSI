const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema({
  voter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  encryptedVoteDb: { type: String, required: true },
  ivDb: { type: String, required: true },
  signature: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Vote", voteSchema);
