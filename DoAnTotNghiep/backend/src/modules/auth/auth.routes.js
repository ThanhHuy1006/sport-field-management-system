import express from "express";
import * as AuthController from "./auth.controller.js";
import { verifyToken } from "../../core/middleware/auth.js";
import multer from "multer";
import path from "path";

const router = express.Router();

// ===========================
// Multer setup (Step 3 Upload)
// ===========================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/documents/");
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, unique + ext);
  },
});

const upload = multer({ storage });

// ===========================
// AUTH ROUTES
// ===========================

// Register customer
router.post("/register/customer", AuthController.registerCustomer);

// Owner register
router.post("/register/owner/step1", AuthController.registerOwnerStep1);
router.post("/register/owner/step2", AuthController.registerOwnerStep2);

// STEP 3 — UPLOAD DOCUMENTS (fixed keys)
router.post(
  "/register/owner/step3",
  upload.fields([
    { name: "license", maxCount: 1 },
    { name: "id_front", maxCount: 1 },
    { name: "id_back", maxCount: 1 },
  ]),
  AuthController.registerOwnerStep3
);

// Login
router.post("/login", AuthController.login);

// Me
router.get("/me", verifyToken, AuthController.me);

export default router;
