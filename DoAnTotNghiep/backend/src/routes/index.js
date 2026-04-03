import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
// import usersRoutes from "../modules/users/users.routes.js";
import fieldsRoutes from "../modules/fields/fields.routes.js";
import publicSchedulesRoutes from "../modules/schedules/public.schedules.routes.js";
import memberBookingRoutes from "../modules/bookings/member.bookings.routes.js";
const router = Router();

router.use("/auth", authRoutes);
// router.use("/users", usersRoutes);
router.use("/fields", fieldsRoutes);
router.use("/fields", publicSchedulesRoutes);
router.use("/bookings", memberBookingRoutes);
export default router;