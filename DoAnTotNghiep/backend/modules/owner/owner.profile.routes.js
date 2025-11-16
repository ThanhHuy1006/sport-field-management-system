import express from "express";
import { verifyToken, requireRole } from "../../core/middleware/auth.js";
import * as ProfileController from "./owner.profile.controller.js";

const router = express.Router();

// chỉ OWNER mới được dùng
const ownerGuard = [verifyToken, requireRole("OWNER")];

/* ROUTES */

// 1) Lấy hồ sơ của owner
router.get("/", ...ownerGuard, ProfileController.getMyProfile);

// 2) Cập nhật hồ sơ (chỉ khi bị reject)
router.put("/", ...ownerGuard, ProfileController.updateProfile);

export default router;
