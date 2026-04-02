import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
// import usersRoutes from "../modules/users/users.routes.js";
import fieldRoutes from "../modules/fields/fields.routes.js";

const router = Router();

router.use("/auth", authRoutes);
// router.use("/users", usersRoutes);
router.use("/fields", fieldRoutes);

export default router;