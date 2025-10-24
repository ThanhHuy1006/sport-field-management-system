// src/routes/bookings.routes.js
import { Router } from "express";
import { auth } from "../middleware/auth.js";
import * as ctrl from "../controllers/bookings.controller.js";

const r = Router();

// User
r.post("/", auth(["USER"]), ctrl.createBooking);
r.get("/user/me", auth(["USER"]), ctrl.getUserBookings);

// Owner
r.get("/owner", auth(["OWNER"]), ctrl.getOwnerBookings);
r.patch("/:id/status", auth(["OWNER"]), ctrl.updateBookingStatus);

export default r;
