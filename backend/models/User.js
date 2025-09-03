const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["people", "official", "worker"], default: "people" },
  proof: { type: String }, // file path or GridFS reference
  points: { type: Number, default: 0 },
});

module.exports = mongoose.model("User", userSchema);
