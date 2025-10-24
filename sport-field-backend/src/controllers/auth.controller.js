import * as authService from "../services/auth.service.js";

export async function register(req, res, next) {
  try {
    const data = await authService.register(req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const data = await authService.login(req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function refresh(req, res, next) {
  try {
    const data = await authService.refresh(req.body.refreshToken);
    res.json(data);
  } catch (err) {
    next(err);
  }
}
