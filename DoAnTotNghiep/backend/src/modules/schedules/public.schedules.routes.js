import { Router } from "express";
import { schedulesController } from "./schedules.controller.js";

const router = Router();

router.get("/:fieldId/availability", schedulesController.getPublicAvailability);

export default router;