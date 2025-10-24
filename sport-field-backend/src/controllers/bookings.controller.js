
import * as svc from '../services/bookings.service.js';
import { ok, created } from '../utils/http.js';

export async function createBooking(req, res, next) {
  try {
    const data = await svc.createBooking(req.user, req.body);
    return created(res, data);
  } catch (e) { next(e); }
}

export async function getMyBookings(req, res, next) {
  try {
    const data = await svc.getMyBookings(req.user.id);
    return ok(res, data);
  } catch (e) { next(e); }
}

export async function getBooking(req, res, next) {
  try {
    const data = await svc.getBooking(Number(req.params.id), req.user);
    return ok(res, data);
  } catch (e) { next(e); }
}

export async function updateStatus(req, res, next) {
  try {
    const data = await svc.updateStatus(Number(req.params.id), req.body.status, req.user);
    return ok(res, data);
  } catch (e) { next(e); }
}

export async function cancelBooking(req, res, next) {
  try {
    const data = await svc.cancelBooking(Number(req.params.id), req.user);
    return ok(res, data);
  } catch (e) { next(e); }
}
