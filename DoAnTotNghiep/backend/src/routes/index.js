import { Router } from "express";

import authRoutes from "../modules/auth/auth.routes.js";
// import usersRoutes from "../modules/users/users.routes.js";
import fieldsRoutes from "../modules/fields/fields.routes.js";
import publicSchedulesRoutes from "../modules/schedules/public.schedules.routes.js";
import memberBookingRoutes from "../modules/bookings/member.bookings.routes.js";
import paymentsRoutes from "../modules/payments/payments.routes.js";
import memberReviewsRoutes from "../modules/reviews/member.reviews.routes.js";
import ownerReviewsRoutes from "../modules/reviews/owner.reviews.routes.js";
import vouchersRoutes from "../modules/vouchers/vouchers.routes.js";
import ownerVouchersRoutes from "../modules/vouchers/owner.vouchers.routes.js";
import ownerBookingRoutes from "../modules/bookings/owner.bookings.routes.js";
import adminRoutes from "../modules/admin/admin.routes.js";

const router = Router();

router.use("/auth", authRoutes);
// router.use("/users", usersRoutes);
router.use("/fields", fieldsRoutes);
router.use("/fields", publicSchedulesRoutes);
router.use("/bookings", memberBookingRoutes);
router.use("/payments", paymentsRoutes);
router.use("/reviews", memberReviewsRoutes);
router.use("/owner/reviews", ownerReviewsRoutes);
router.use("/vouchers", vouchersRoutes);
router.use("/owner/vouchers", ownerVouchersRoutes);
router.use("/owner/bookings", ownerBookingRoutes);

export default router;