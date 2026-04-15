import { AppError } from "./AppError.js";

export class ValidationError extends AppError {
  constructor(message = "Dữ liệu không hợp lệ", details = null) {
    super(message, {
      statusCode: 400,
      code: "VALIDATION_ERROR",
      details,
    });
  }
}