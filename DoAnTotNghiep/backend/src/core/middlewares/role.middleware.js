import prisma from "../../config/prisma.js";
import { AuthError, ForbiddenError } from "../errors/index.js";

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new AuthError("Bạn chưa đăng nhập");
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw new ForbiddenError("Bạn không có quyền truy cập");
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

export function requireApprovedOwner() {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        throw new AuthError("Bạn chưa đăng nhập");
      }

      if (req.user.role === "ADMIN") {
        return next();
      }

      if (req.user.role !== "OWNER") {
        throw new ForbiddenError("Chỉ owner đã được duyệt mới được truy cập");
      }

      const ownerProfile = await prisma.owner_profiles.findUnique({
        where: { user_id: req.user.id },
        select: {
          user_id: true,
          status: true,
          business_name: true,
          approved_at: true,
          reject_reason: true,
        },
      });

      if (!ownerProfile) {
        throw new ForbiddenError("Bạn chưa có hồ sơ owner");
      }

      if (ownerProfile.status !== "approved") {
        throw new ForbiddenError("Hồ sơ owner của bạn chưa được duyệt");
      }

      req.ownerProfile = ownerProfile;
      next();
    } catch (error) {
      next(error);
    }
  };
}