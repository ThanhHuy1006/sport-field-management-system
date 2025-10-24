// src/controllers/bookings.controller.js
import * as bookingService from "../services/bookings.service.js";

export async function createBooking(req, res, next) {
  try {
    const data = await bookingService.createBooking(req.user.id, req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

export async function getUserBookings(req, res, next) {
  try {
    const data = await bookingService.getUserBookings(req.user.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function getOwnerBookings(req, res, next) {
  try {
    const data = await bookingService.getOwnerBookings(req.user.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function updateBookingStatus(req, res, next) {
  try {
    const data = await bookingService.updateBookingStatus(
      req.params.id,
      req.user.id,
      req.body.status
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
}
