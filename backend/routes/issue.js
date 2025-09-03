const express = require("express");
const Issue = require("../models/Issue");
const User = require("../models/User");
const multer = require("multer");
const jwt = require("jsonwebtoken");

const router = express.Router();

// File upload (proofs / issue images)
const upload = multer({ dest: "uploads/" });

/**
 * Middleware: Authenticate JWT
 */
const authMiddleware = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, "secret123", (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = decoded; // { id, role }
    next();
  });
};

/**
 * Report an issue (People)
 * +10 points to reporter
 */
router.post("/report", authMiddleware, upload.single("photo"), async (req, res) => {
  try {
    const { title, description, location, zone } = req.body;

    const issue = new Issue({
      title,
      description,
      location,
      reportedBy: req.user.id, // take from token
      zone,
      photo: req.file ? req.file.path : null,
    });

    await issue.save();

    // Add 10 points to reporting user
    await User.findByIdAndUpdate(req.user.id, { $inc: { points: 10 } });

    res.status(201).json({ message: "Issue reported successfully", issue });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Resolve an issue (Officials / Workers)
 * Officials: +20 points
 * Workers: +30 points
 */
router.post("/resolve/:id", authMiddleware, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: "Issue not found" });

    if (issue.status === "resolved" && issue.pointsAwarded) {
      return res.status(400).json({ message: "Issue already resolved and points awarded" });
    }

    issue.status = "resolved";
    issue.pointsAwarded = true; // ✅ prevent double awarding
    await issue.save();

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    let pointsToAdd = 0;
    if (user.role === "official") pointsToAdd = 20;
    if (user.role === "worker") pointsToAdd = 30;

    await User.findByIdAndUpdate(req.user.id, { $inc: { points: pointsToAdd } });

    res.json({ message: "Issue resolved and points updated", issue });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get all issues (for testing/admin)
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const issues = await Issue.find().populate("reportedBy", "name email role");
    res.json(issues);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get single issue details
 */
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id).populate("reportedBy", "name email role");
    if (!issue) return res.status(404).json({ message: "Issue not found" });
    res.json(issue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get all issues for a specific zone (Officials & Workers)
 */
router.get("/zone/:zone", authMiddleware, async (req, res) => {
  try {
    const issues = await Issue.find({ zone: req.params.zone });
    res.json(issues);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get all issues reported by a user (People)
 */
router.get("/my/:userId", authMiddleware, async (req, res) => {
  try {
    const issues = await Issue.find({ reportedBy: req.params.userId });
    res.json(issues);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
