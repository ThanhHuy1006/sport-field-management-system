router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);

router.use("/owners", ownerRoutes);

router.use("/fields", publicFieldRoutes);
router.use("/owner/fields", ownerFieldRoutes);
router.use("/admin/fields", adminFieldRoutes);

router.use("/bookings", memberBookingRoutes);
router.use("/owner/bookings", ownerBookingRoutes);
router.use("/admin/bookings", adminBookingRoutes);

router.use("/reviews", memberReviewRoutes);
router.use("/owner/reviews", ownerReviewRoutes);
router.use("/admin/reviews", adminReviewRoutes);

router.use("/vouchers", voucherRoutes);
router.use("/owner/vouchers", ownerVoucherRoutes);
router.use("/admin/vouchers", adminVoucherRoutes);

router.use("/uploads", uploadRoutes);