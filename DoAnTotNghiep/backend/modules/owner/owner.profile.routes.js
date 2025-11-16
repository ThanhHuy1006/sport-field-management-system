// import express from "express";
// import { verifyToken, requireRole } from "../../core/middleware/auth.js";
// import * as ProfileController from "./owner.profile.controller.js";

// const router = express.Router();

// // chỉ OWNER mới được dùng
// const ownerGuard = [verifyToken, requireRole("OWNER")];

// /* ROUTES */

// // 1) Lấy hồ sơ của owner
// router.get("/", ...ownerGuard, ProfileController.getMyProfile);

// // 2) Cập nhật hồ sơ (chỉ khi bị reject)
// router.put("/", ...ownerGuard, ProfileController.updateProfile);

// export default router;
import express from "express";
import { verifyToken, requireRole } from "../../core/middleware/auth.js";
import * as ProfileController from "./owner.profile.controller.js";
import multer from "multer";
import path from "path";

const router = express.Router();

// chỉ OWNER mới được dùng
const ownerGuard = [verifyToken, requireRole("OWNER")];

/* ===========================
   MULTER CONFIG UPLOAD DOCS
=========================== */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/documents/");
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, unique + ext);
  },
});

const upload = multer({ storage });

/* ROUTES */

// 1) Lấy hồ sơ owner
router.get("/", ...ownerGuard, ProfileController.getMyProfile);

// 2) UPDATE hồ sơ + giấy tờ (chỉ khi REJECT)
router.put(
  "/",
  ...ownerGuard,
  upload.fields([
    { name: "license", maxCount: 1 },
    { name: "id_front", maxCount: 1 },
    { name: "id_back", maxCount: 1 },
  ]),
  ProfileController.updateProfile
);

export default router;
