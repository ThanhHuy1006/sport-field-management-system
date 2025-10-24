
import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import * as ctrl from '../controllers/bookings.controller.js';

const r = Router();

r.post('/', auth(['user','owner','admin']), ctrl.createBooking);
r.get('/user/me', auth(['user','owner','admin']), ctrl.getMyBookings);
r.get('/:id', auth(['user','owner','admin']), ctrl.getBooking);
r.patch('/:id/status', auth(['owner','admin']), ctrl.updateStatus);
r.delete('/:id', auth(['user','owner','admin']), ctrl.cancelBooking);

export default r;
