// src/routes/admin.routes.js
import { Router } from "express";
import { auth } from "../middleware/auth.js";
import * as ctrl from "../controllers/admin.controller.js";

const r = Router();

// Dashboard tổng quan
r.get("/dashboard", auth(["ADMIN"]), ctrl.dashboard);

// Quản lý người dùng
r.get("/users", auth(["ADMIN"]), ctrl.listUsers);
r.patch("/users/:id/status", auth(["ADMIN"]), ctrl.updateUserStatus);

// Quản lý sân thể thao
r.get("/fields", auth(["ADMIN"]), ctrl.listFieldsForAdmin);
r.patch("/fields/:id/approve", auth(["ADMIN"]), ctrl.approveField);

export default r;
