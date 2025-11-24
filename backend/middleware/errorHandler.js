// Basic error handler.
// In prod, might add logging, tracking, or hide error details.

function errorHandler(err, req, res, next) {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
}

module.exports = { errorHandler };
