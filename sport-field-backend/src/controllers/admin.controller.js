
import * as svc from '../services/admin.service.js';
import { ok } from '../utils/http.js';

export async function dashboard(req, res, next) {
  try {
    const data = await svc.dashboard();
    return ok(res, data);
  } catch (e) { next(e); }
}

export async function listUsers(req, res, next) {
  try {
    const data = await svc.listUsers();
    return ok(res, data);
  } catch (e) { next(e); }
}

export async function updateUserStatus(req, res, next) {
  try {
    const data = await svc.updateUserStatus(Number(req.params.id), req.body.status);
    return ok(res, data);
  } catch (e) { next(e); }
}

export async function listFieldsForAdmin(req, res, next) {
  try {
    const data = await svc.listFieldsForAdmin();
    return ok(res, data);
  } catch (e) { next(e); }
}

export async function approveField(req, res, next) {
  try {
    const data = await svc.approveField(Number(req.params.id));
    return ok(res, data);
  } catch (e) { next(e); }
}
