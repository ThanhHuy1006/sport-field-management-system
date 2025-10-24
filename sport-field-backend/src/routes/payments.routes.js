// src/routes/payments.routes.js
import { Router } from "express";
import { auth } from "../middleware/auth.js";
import * as ctrl from "../controllers/payments.controller.js";

const r = Router();

// User
r.post("/", auth(["USER"]), ctrl.createPayment);
r.get("/user/me", auth(["USER"]), ctrl.getUserPayments);

// Owner
r.get("/owner/revenue", auth(["OWNER"]), ctrl.getOwnerRevenue);

export default r;
