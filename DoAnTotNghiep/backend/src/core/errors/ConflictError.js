import { AppError } from "./AppError.js";

export class ConflictError extends AppError {
  constructor(message = "Xung đột dữ liệu", details = null) {
    super(message, {
      statusCode: 409,
      code: "CONFLICT",
      details,
    });
  }
}