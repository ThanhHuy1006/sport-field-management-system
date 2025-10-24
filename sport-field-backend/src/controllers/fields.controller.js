
import * as svc from '../services/fields.service.js';
import { ok, created } from '../utils/http.js';

export async function listFields(req, res, next) {
  try {
    const data = await svc.listFields(req.query);
    return ok(res, data);
  } catch (e) { next(e); }
}

export async function getField(req, res, next) {
  try {
    const data = await svc.getField(Number(req.params.id));
    return ok(res, data);
  } catch (e) { next(e); }
}

export async function createField(req, res, next) {
  try {
    const data = await svc.createField(req.user, req.body);
    return created(res, data);
  } catch (e) { next(e); }
}

export async function updateField(req, res, next) {
  try {
    const data = await svc.updateField(req.user, Number(req.params.id), req.body);
    return ok(res, data);
  } catch (e) { next(e); }
}

export async function deleteField(req, res, next) {
  try {
    const data = await svc.deleteField(req.user, Number(req.params.id));
    return ok(res, data);
  } catch (e) { next(e); }
}
