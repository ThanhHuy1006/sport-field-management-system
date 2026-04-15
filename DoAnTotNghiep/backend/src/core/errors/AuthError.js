import { AppError } from "./AppError.js";

export class AuthError extends AppError {
  constructor(message = "Unauthorized", details = null) {
    super(message, {
      statusCode: 401,
      code: "UNAUTHORIZED",
      details,
    });
  }
}