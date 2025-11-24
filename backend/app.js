// Express app setup.
// In prod, you may want stricter CORS settings.

const express = require("express");
const cors = require("cors");
const { errorHandler } = require("./middleware/errorHandler");
const recommendationsRouter = require("./routes/recommendations");

const app = express();

app.use(cors()); // dev-friendly; in prod whitelist domains
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/recommendations", recommendationsRouter);

// Final error handler
app.use(errorHandler);

module.exports = app;
