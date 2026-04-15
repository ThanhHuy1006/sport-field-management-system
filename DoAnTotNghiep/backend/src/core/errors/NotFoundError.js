import { AppError } from "./AppError.js";

export class NotFoundError extends AppError {
  constructor(message = "Không tìm thấy dữ liệu", details = null) {
    super(message, {
      statusCode: 404,
      code: "NOT_FOUND",
      details,
    });
  }
}