const express = require("express");
const cors = require("cors");
const { errorHandler } = require("./middleware/errorHandler");

const recommendationsRouter = require("./routes/recommendations");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Routes
app.use("/api/recommendations", recommendationsRouter);
app.use(errorHandler);

// Optional: global error handler added later
// const { errorHandler } = require("./middleware/errorHandler");
// app.use(errorHandler);

module.exports = app;
