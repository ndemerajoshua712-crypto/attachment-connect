
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const multer = require("multer");

const app = express();
const authRoutes = require("./routes/auth.routes");
const studentRoutes = require("./routes/student.routes");
const companyRoutes = require("./routes/company.routes");
const opportunityRoutes = require("./routes/opportunity.routes");
const adminRoutes = require("./routes/admin.routes");
const notificationRoutes = require("./routes/notification.routes");
const path = require("node:path");
// Security middleware
app.use(helmet());

// Allow requests from our React frontend
const configuredClientOrigins = (process.env.CLIENT_URL || "http://localhost:5173").split(",").map(origin => origin.trim()).filter(Boolean);
const allowedClientOrigins = new Set([...configuredClientOrigins, "http://localhost:5173", "http://127.0.0.1:5173"]);
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedClientOrigins.has(origin)) return callback(null, true);
    return callback(new Error("Origin is not allowed by CORS."));
  },
  credentials: true,
}));

// Parse incoming data
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "../uploads"), { dotfiles: "deny", index: false }));

// General API rate limiter
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  })
);
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/opportunities", opportunityRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
// Health-check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Attachment Connect API is running!",
  });
});

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    const message = error.code === "LIMIT_FILE_SIZE"
      ? "The logo must be 5 MB or smaller."
      : "Upload one JPG, PNG, or WebP logo at a time.";
    return res.status(400).json({ success: false, message });
  }
  if (error.message?.startsWith("Choose a JPG")) {
    return res.status(400).json({ success: false, message: error.message });
  }
  return next(error);
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Attachment Connect API running on port ${PORT}`);
});
