import { Router } from "express";
import * as ctrl from "../controllers/users.controller.js";
import { auth } from "../middleware/auth.js";

const router = Router();

// Lấy thông tin cá nhân
router.get("/me", auth(), ctrl.getProfile);

// Cập nhật hồ sơ
router.put("/me", auth(), ctrl.updateProfile);

// Danh sách user (admin)
router.get("/", auth(["ADMIN"]), ctrl.getAllUsers);

// Cập nhật trạng thái user (admin)
router.patch("/:id/status", auth(["ADMIN"]), ctrl.updateStatus);

export default router;
