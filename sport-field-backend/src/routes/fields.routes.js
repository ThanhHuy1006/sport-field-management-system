// src/routes/fields.routes.js
import { Router } from "express";
import { auth } from "../middleware/auth.js";
import * as ctrl from "../controllers/fields.controller.js";

const r = Router();

// Public
r.get("/", ctrl.getAllFields);
r.get("/:id", ctrl.getFieldById);

// Owner
r.get("/my", auth(["OWNER"]), ctrl.getMyFields);
r.post("/", auth(["OWNER"]), ctrl.createField);
r.put("/:id", auth(["OWNER"]), ctrl.updateField);
r.delete("/:id", auth(["OWNER"]), ctrl.deleteField);

// Admin
r.patch("/:id/status", auth(["ADMIN"]), ctrl.updateStatus);

export default r;
