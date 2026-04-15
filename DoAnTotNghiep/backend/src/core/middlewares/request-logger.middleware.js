function getClientIp(req) {
  return (
    req.headers["x-forwarded-for"] ||
    req.socket?.remoteAddress ||
    req.ip ||
    "unknown"
  );
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