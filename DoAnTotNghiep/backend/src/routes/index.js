import { Router } from "express";

import authRoutes from "../modules/auth/auth.routes.js";
import usersRoutes from "../modules/users/users.routes.js";

import fieldsRoutes from "../modules/fields/fields.routes.js";
import publicSchedulesRoutes from "../modules/schedules/public.schedules.routes.js";

import memberBookingRoutes from "../modules/bookings/member.bookings.routes.js";
import ownerBookingRoutes from "../modules/bookings/owner.bookings.routes.js";

import paymentsRoutes from "../modules/payments/payments.routes.js";

import memberReviewsRoutes from "../modules/reviews/member.reviews.routes.js";
import ownerReviewsRoutes from "../modules/reviews/owner.reviews.routes.js";

import vouchersRoutes from "../modules/vouchers/vouchers.routes.js";
import ownerVouchersRoutes from "../modules/vouchers/owner.vouchers.routes.js";

import notificationsRoutes from "../modules/notifications/notifications.routes.js";

import ownerRegistrationRoutes from "../modules/owners/owner.registration.routes.js";
import ownerProfileRoutes from "../modules/owners/owner.profile.routes.js";
import ownerDashboardRoutes from "../modules/owners/owner.dashboard.routes.js";
import ownerFieldsRoutes from "../modules/owners/owner.fields.routes.js";
import ownerSchedulesRoutes from "../modules/owners/owner.schedules.routes.js";
import uploadsRoutes from "../modules/uploads/uploads.routes.js";
import publicReviewsRoutes from "../modules/reviews/public.reviews.routes.js";
// import ownerReportsRoutes from "../modules/reports/owner.reports.routes.js";
// import adminReportsRoutes from "../modules/reports/admin.reports.routes.js";

import adminRoutes from "../modules/admin/admin.routes.js";

const router = Router();

// Auth / User
router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/uploads", uploadsRoutes);

// Public fields + public schedules
router.use("/fields", fieldsRoutes);
router.use("/fields", publicSchedulesRoutes);
router.use("/fields", publicReviewsRoutes);

// Member bookings / payments / reviews
router.use("/bookings", memberBookingRoutes);
router.use("/payments", paymentsRoutes);
router.use("/reviews", memberReviewsRoutes);

// Owner domain
router.use("/owner/bookings", ownerBookingRoutes);
router.use("/owner/reviews", ownerReviewsRoutes);
router.use("/owner/vouchers", ownerVouchersRoutes);

router.use("/owner", ownerRegistrationRoutes);
router.use("/owner", ownerProfileRoutes);
router.use("/owner", ownerDashboardRoutes);
router.use("/owner", ownerFieldsRoutes);
router.use("/owner", ownerSchedulesRoutes);
// router.use("/owner/reports", ownerReportsRoutes);

// Shared/public voucher routes
router.use("/vouchers", vouchersRoutes);

// Notifications
router.use("/notifications", notificationsRoutes);

// Admin
router.use("/admin", adminRoutes);
// router.use("/admin/reports", adminReportsRoutes);

export default router;