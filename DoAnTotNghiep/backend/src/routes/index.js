import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
// import usersRoutes from "../modules/users/users.routes.js";
import fieldsRoutes from "../modules/fields/fields.routes.js";
import publicSchedulesRoutes from "../modules/schedules/public.schedules.routes.js";

const router = Router();

router.use("/auth", authRoutes);
// router.use("/users", usersRoutes);
router.use("/fields", fieldsRoutes);
router.use("/fields", publicSchedulesRoutes);

export default router;