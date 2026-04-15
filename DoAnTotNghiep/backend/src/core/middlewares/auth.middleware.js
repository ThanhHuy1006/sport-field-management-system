import jwt from "jsonwebtoken";
import prisma from "../../config/prisma.js";
import { AuthError, ForbiddenError } from "../errors/index.js";

function extractBearerToken(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || typeof authHeader !== "string") {
    return null;
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
}

export async function requireAuth(req, res, next) {
  try {
    const token = extractBearerToken(req);

    if (!token) {
      throw new AuthError("Bạn chưa đăng nhập");
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET chưa được cấu hình");
    }

    const decoded = jwt.verify(token, secret);

    const userId = decoded?.id ?? decoded?.userId ?? decoded?.sub;

    if (!userId) {
      throw new AuthError("Token không hợp lệ");
    }

    const user = await prisma.users.findUnique({
      where: { id: Number(userId) },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    });

    if (!user) {
      throw new AuthError("Người dùng không tồn tại");
    }

    if (user.status === "deleted") {
      throw new ForbiddenError("Tài khoản đã bị xóa");
    }

    if (user.status === "locked") {
      throw new ForbiddenError("Tài khoản đã bị khóa");
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      tokenPayload: decoded,
    };

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(new AuthError("Token không hợp lệ"));
    }

    if (error.name === "TokenExpiredError") {
      return next(new AuthError("Token đã hết hạn"));
    }

    next(error);
  }
}

export async function optionalAuth(req, res, next) {
  try {
    const token = extractBearerToken(req);

    if (!token) {
      req.user = null;
      return next();
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, secret);
    const userId = decoded?.id ?? decoded?.userId ?? decoded?.sub;

    if (!userId) {
      req.user = null;
      return next();
    }

    const user = await prisma.users.findUnique({
      where: { id: Number(userId) },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    });

    if (!user || user.status === "deleted" || user.status === "locked") {
      req.user = null;
      return next();
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      tokenPayload: decoded,
    };

    next();
  } catch {
    req.user = null;
    next();
  }
}