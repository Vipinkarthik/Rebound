const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const requestLogger = require("./middleware/requestLogger");
const errorHandler = require("./middleware/errorHandler");

const simulationRoutes = require("./routes/simulationRoutes");
const summaryRoutes = require("./routes/summaryRoutes");
const auditRoutes = require("./routes/auditRoutes");
const policyRoutes = require("./routes/policyRoutes");
const explainRoutes = require("./routes/explainRoutes");

const app = express();

// Connect Database
connectDB();

// Dynamic CORS Configuration
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.some(o => origin.startsWith(o))) {
      callback(null, true);
    } else {
      callback(null, true); // Allow dev origins gracefully
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(requestLogger);

// API Routes
app.use("/api", simulationRoutes);
app.use("/api", summaryRoutes);
app.use("/api", auditRoutes);
app.use("/api", policyRoutes);
app.use("/api", explainRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Centralized Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
