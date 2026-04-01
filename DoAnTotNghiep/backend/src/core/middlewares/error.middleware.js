export function errorMiddleware(error, req, res, next) {
  console.error("ERROR:", error);

  return res.status(400).json({
    success: false,
    message: error.message || "Server error",
  });
}