const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config(); // To load environment variables from .env (local)

const authRoutes = require("./routes/auth");
const issueRoutes = require("./routes/issue");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/civicapp"; 
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Routes
app.use("/auth", authRoutes);
app.use("/issues", issueRoutes);

// Root test route
app.get("/", (req, res) => {
  res.send("🌍 Civic Engagement API is running...");
});

// Use Render / Heroku port if available, else fallback to 5000 for local dev
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
