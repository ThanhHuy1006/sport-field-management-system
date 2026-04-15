import { Prisma } from "@prisma/client";
import {
  AppError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../errors/index.js";

function mapPrismaError(error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        return new ConflictError("Dữ liệu đã tồn tại", {
          target: error.meta?.target || null,
        });

      case "P2025":
        return new NotFoundError("Không tìm thấy dữ liệu cần thao tác");

      case "P2003":
        return new ValidationError("Dữ liệu liên kết không hợp lệ", {
          field: error.meta?.field_name || null,
        });

      case "P2023":
        return new ValidationError("Giá trị đầu vào không hợp lệ");

      default:
        return new AppError("Lỗi cơ sở dữ liệu", {
          statusCode: 500,
          code: "DATABASE_ERROR",
        });
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return new ValidationError("Dữ liệu gửi lên không đúng định dạng");
  }

  return error;
}

export function errorMiddleware(error, req, res, next) {
  const mappedError = mapPrismaError(error);
  const isDev = process.env.NODE_ENV !== "production";

  if (mappedError instanceof AppError) {
    return res.status(mappedError.statusCode).json({
      success: false,
      message: mappedError.message,
      code: mappedError.code,
      errors: mappedError.details || null,
      requestId: req.requestId || null,
      ...(isDev ? { stack: mappedError.stack } : {}),
    });
  }

  console.error("[UNHANDLED_ERROR]", {
    requestId: req.requestId || null,
    message: mappedError?.message || "Unknown error",
    stack: mappedError?.stack || null,
  });

  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
    code: "INTERNAL_SERVER_ERROR",
    requestId: req.requestId || null,
    ...(isDev ? { stack: mappedError?.stack || null } : {}),
  });
}