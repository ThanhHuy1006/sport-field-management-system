import express from "express";
import { verifyToken, requireRole } from "../../core/middleware/auth.js";
import * as FieldController from "./owner.field.controller.js";
import multer from "multer";
import path from "path";

const router = express.Router();

// only owner
const ownerGuard = [verifyToken, requireRole("OWNER")];

/* ============================
       MULTER CONFIG
============================ */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/fields/");
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, unique + ext);
  },
});

const upload = multer({ storage });

/* ============================
       OWNER FIELD ROUTES
============================ */

// 1) Create field + images
router.post(
  "/",
  ...ownerGuard,
  upload.array("images", 10),
  FieldController.createField
);

// 2) Get owner fields
router.get("/", ...ownerGuard, FieldController.getMyFields);

// 3) Get field detail
router.get("/:id", ...ownerGuard, FieldController.getFieldDetail);

// 4) Update field
router.put(
  "/:id",
  ...ownerGuard,
  upload.array("images", 10),
  FieldController.updateField
);

// 5) Delete field
router.delete("/:id", ...ownerGuard, FieldController.deleteField);

export default router;
