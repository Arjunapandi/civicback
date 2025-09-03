const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  photo: { type: mongoose.Schema.Types.ObjectId, ref: "uploads.files" }, // GridFS file ID
  location: { type: String, required: true },
  status: { type: String, enum: ["pending", "resolved"], default: "pending" },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  zone: { type: String }, // For officials/workers filtering
  pointsAwarded: { type: Boolean, default: false }, // ✅ prevents double points
}, { timestamps: true }); // ✅ createdAt, updatedAt

module.exports = mongoose.model("Issue", issueSchema);
