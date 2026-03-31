import * as AuthService from "./auth.service.js";

export const registerCustomer = (req, res) =>
  AuthService.registerCustomer(req, res);

export const registerOwnerStep1 = (req, res) =>
  AuthService.registerOwnerStep1(req, res);

export const registerOwnerStep2 = (req, res) =>
  AuthService.registerOwnerStep2(req, res);

export const registerOwnerStep3 = (req, res) =>
  AuthService.registerOwnerStep3(req, res);

export const login = (req, res) =>
  AuthService.login(req, res);

export const me = (req, res) =>
  AuthService.me(req, res);
