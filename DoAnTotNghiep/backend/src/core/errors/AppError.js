export class AppError extends Error {
  constructor(
    message = "Internal Server Error",
    {
      statusCode = 500,
      code = "INTERNAL_SERVER_ERROR",
      details = null,
      isOperational = true,
    } = {}
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = isOperational;

    Error.captureStackTrace?.(this, this.constructor);
  }
}