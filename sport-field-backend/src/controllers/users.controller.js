import * as userService from "../services/users.service.js";

export async function getProfile(req, res, next) {
  try {
    const data = await userService.getProfile(req.user.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const data = await userService.updateProfile(req.user.id, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function getAllUsers(req, res, next) {
  try {
    const data = await userService.getAllUsers();
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function updateStatus(req, res, next) {
  try {
    const { id } = req.params;
    const data = await userService.updateStatus(Number(id), req.body.status);
    res.json(data);
  } catch (err) {
    next(err);
  }
}
