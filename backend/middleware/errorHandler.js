//  general catch all error used for dev purposes
function errorHandler(err, req, res, next) {
  console.error("Unhandled error from app error handler:", err);

  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    error: "Internal server error"
  });
}

module.exports = { errorHandler };
