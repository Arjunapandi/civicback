const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const User = require("../models/User");

const router = express.Router();
const upload = multer({ dest: "uploads/proofs/" }); // Local upload folder

// ===================
// Signup
// ===================
router.post("/signup", upload.single("proof"), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    let existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      proof: req.file ? req.file.path : null,
    });

    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Signup failed", error: err.message });
  }
});

// ===================
// Login
// ===================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Create JWT
    const token = jwt.sign({ id: user._id, role: user.role }, "secret123", {
      expiresIn: "7d",
    });

    // ✅ Send back user details too
    res.json({
      token,
      id: user._id,
      role: user.role,
      points: user.points,
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
});

module.exports = router;
