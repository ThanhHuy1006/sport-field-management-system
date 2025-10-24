// src/controllers/payments.controller.js
import * as paymentService from "../services/payments.service.js";

export async function createPayment(req, res, next) {
  try {
    const data = await paymentService.createPayment(req.user.id, req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

export async function getUserPayments(req, res, next) {
  try {
    const data = await paymentService.getUserPayments(req.user.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function getOwnerRevenue(req, res, next) {
  try {
    const data = await paymentService.getOwnerRevenue(req.user.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
}
