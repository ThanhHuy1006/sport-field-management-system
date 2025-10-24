
import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import * as ctrl from '../controllers/payments.controller.js';

const r = Router();

r.post('/create', auth(['user','owner','admin']), ctrl.createPayment);
r.get('/:id', auth(['user','owner','admin']), ctrl.getPayment);
r.post('/webhook', ctrl.webhook); // provider callback

export default r;
