// // src/routes/fields.routes.js
// import { Router } from "express";
// import { auth } from "../middleware/auth.js";
// import * as ctrl from "../controllers/fields.controller.js";

// const r = Router();

// // Public
// r.get("/", ctrl.getAllFields);
// r.get("/:id", ctrl.getFieldById);

// // Owner
// r.get("/my", auth(["OWNER"]), ctrl.getMyFields);
// r.post("/", auth(["OWNER"]), ctrl.createField);
// r.put("/:id", auth(["OWNER"]), ctrl.updateField);
// r.delete("/:id", auth(["OWNER"]), ctrl.deleteField);

// // Admin
// r.patch("/:id/status", auth(["ADMIN"]), ctrl.updateStatus);

// export default r;
import { Router } from "express";
import { auth } from "../middleware/auth.js";
import * as ctrl from "../controllers/fields.controller.js";
import { upload } from "../middleware/upload.js";

const r = Router();

// 🟢 Đặt route đặc biệt lên trước
r.get("/my", auth(["OWNER"]), ctrl.getMyFields);

// Public routes
r.get("/", ctrl.getAllFields);
r.get("/:id", ctrl.getFieldById);

// Owner
r.post("/", auth(["OWNER"]), ctrl.createField);
r.put("/:id", auth(["OWNER"]), ctrl.updateField);
r.delete("/:id", auth(["OWNER"]), ctrl.deleteField);

// Admin
r.patch("/:id/status", auth(["ADMIN"]), ctrl.updateStatus);

// Upload ảnh sân
r.post("/upload", auth(["OWNER"]), upload.array("images", 5), async (req, res) => {
  try {
    const urls = req.files.map(f => `/uploads/fields/${f.filename}`)
    res.json({ message: "✅ Upload thành công", urls })
  } catch (err) {
    res.status(500).json({ message: "Lỗi upload ảnh" })
  }
})

export default r;
