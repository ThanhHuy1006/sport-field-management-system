import crypto from "crypto";

export function requestContextMiddleware(req, res, next) {
  const requestId =
    req.headers["x-request-id"] ||
    req.headers["X-Request-Id"] ||
    crypto.randomUUID();

  req.requestId = String(requestId);
  req.requestStartAt = Date.now();

  res.setHeader("x-request-id", req.requestId);

  next();
}