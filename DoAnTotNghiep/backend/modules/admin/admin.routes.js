// modules/admin/admin.routes.js
import express from "express";
import * as AdminController from "./admin.controller.js";
import { verifyToken, requireRole } from "../../core/middleware/auth.js";

const router = express.Router();

const adminGuard = [verifyToken, requireRole("ADMIN")];

/**
 * GET /admin/owners/pending
 */
router.get(
  "/owners/pending",
  ...adminGuard,
  AdminController.listPendingOwners
);

/**
 * GET /admin/owners/:id
 */
router.get(
  "/owners/:id",
  ...adminGuard,
  AdminController.getOwnerDetail
);

/**
 * POST /admin/owners/:id/approve
 */
router.post(
  "/owners/:id/approve",
  ...adminGuard,
  AdminController.approveOwner
);

/**
 * POST /admin/owners/:id/reject
 */
router.post(
  "/owners/:id/reject",   // ⬅⬅ FIX Ở ĐÂY
  ...adminGuard,
  AdminController.rejectOwner
);

export default router;
