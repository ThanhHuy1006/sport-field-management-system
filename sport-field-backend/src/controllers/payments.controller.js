
import * as svc from '../services/payments.service.js';
import { ok, created } from '../utils/http.js';

export async function createPayment(req, res, next) {
  try {
    const data = await svc.createPayment(req.user, req.body);
    return created(res, data);
  } catch (e) { next(e); }
}

export async function getPayment(req, res, next) {
  try {
    const data = await svc.getPayment(Number(req.params.id), req.user);
    return ok(res, data);
  } catch (e) { next(e); }
}

export async function webhook(req, res, next) {
  try {
    await svc.webhook(req.body);
    return res.status(200).send('OK');
  } catch (e) { next(e); }
}
