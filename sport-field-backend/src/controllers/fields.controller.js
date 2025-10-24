// src/controllers/fields.controller.js
import * as fieldService from "../services/fields.service.js";

// Public
export async function getAllFields(req, res, next) {
  try {
    const data = await fieldService.getAllFields(req.query);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function getFieldById(req, res, next) {
  try {
    const data = await fieldService.getFieldById(req.params.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// Owner
export async function getMyFields(req, res, next) {
  try {
    const data = await fieldService.getMyFields(req.user.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function createField(req, res, next) {
  try {
    const data = await fieldService.createField(req.user.id, req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

export async function updateField(req, res, next) {
  try {
    const data = await fieldService.updateField(req.params.id, req.user.id, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function deleteField(req, res, next) {
  try {
    const data = await fieldService.deleteField(req.params.id, req.user.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// Admin
export async function updateStatus(req, res, next) {
  try {
    const data = await fieldService.updateStatus(req.params.id, req.body.status);
    res.json(data);
  } catch (err) {
    next(err);
  }
}
