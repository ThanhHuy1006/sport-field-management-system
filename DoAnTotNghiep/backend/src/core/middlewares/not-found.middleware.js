import { NotFoundError } from "../errors/index.js";

export function notFoundMiddleware(req, res, next) {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl} không tồn tại`));
}