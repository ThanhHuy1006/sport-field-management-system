// modules/admin/admin.controller.js
import * as AdminService from "./admin.service.js";

export const listPendingOwners = (req, res) =>
  AdminService.listPendingOwners(req, res);

export const getOwnerDetail = (req, res) =>
  AdminService.getOwnerDetail(req, res);

export const approveOwner = (req, res) =>
  AdminService.approveOwner(req, res);

export const rejectOwner = (req, res) =>
  AdminService.rejectOwner(req, res);
