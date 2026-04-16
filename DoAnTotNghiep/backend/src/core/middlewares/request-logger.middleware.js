function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];

  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }

  return req.socket?.remoteAddress || req.ip || "unknown";
}

export function requestLoggerMiddleware(req, res, next) {
  const startedAt = Date.now();

  res.on("finish", () => {
    const durationMs = Date.now() - startedAt;

    const log = {
      requestId: req.requestId || null,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs,
      userId: req.user?.id || null,
      role: req.user?.role || null,
      ip: getClientIp(req),
      at: new Date().toISOString(),
    };

    console.log("[REQUEST]", JSON.stringify(log));
  });

  next();
}